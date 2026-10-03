import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Model only the host boundary used by definitions and control callbacks.
// Rendering, native indexing and navigation are verified in Obsidian itself.
const result = await build({
  stdin: {
    contents: `export * from "./src/settings-catalog";
      export * from "./src/settings";
      export * from "./src/settings-tab";
      export * from "./src/i18n/core";
      export { default as LayoutPlugin } from "./src/main";
      export { PluginSettingTab, Setting, Notice, Modal } from "obsidian";`,
    resolveDir: fileURLToPath(new URL("../../", import.meta.url)),
    loader: "ts",
  },
  plugins: [{
    name: "host-boundary",
    setup(builder) {
      builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "host" }));
      builder.onLoad({ filter: /.*/, namespace: "host" }, () => ({ contents: `
        export class Plugin { constructor(app, manifest) { this.app = app; this.manifest = manifest; } }
        export class App {}
        export class Modal {
          contentEl = { settings: [], empty() { this.settings = []; } };
          setTitle(value) { this.title = value; return this; }
          setContent(value) { this.description = value; return this; }
          open() { Modal.current = this; this.onOpen(); }
          close() { this.closed = true; this.onClose(); }
        }
        export class Component {}
        export class MarkdownRenderer {}
        export class Notice {
          static messages = [];
          constructor(message) { Notice.messages.push(message); }
        }
        export function getLanguage() { return "en"; }
        export function requireApiVersion(version) {
          if (version !== "1.13.0") throw new Error("Unexpected API boundary");
          return typeof PluginSettingTab.prototype.update === "function";
        }
        export class PluginSettingTab {
          update() { this.updates = (this.updates ?? 0) + 1; this.settingItems = this.getSettingDefinitions(); }
        }
        export class Setting {
          constructor(container) { container?.settings.push(this); this.buttons = []; }
          controlEl = { createSpan: (value) => { this.unit = value.text; } };
          setName(value) { this.name = value; return this; }
          setDesc(value) { this.desc = value; return this; }
          setDisabled(value) { this.disabled = value; return this; }
          addText(callback) {
            const text = { inputEl: { addClass() {} }, setValue(value) { this.value = value; return this; }, onChange(fn) { this.change = fn; return this; } };
            this.text = text; callback(text); return this;
          }
          addToggle(callback) {
            const toggle = { setValue(value) { this.value = value; return this; }, onChange(fn) { this.change = fn; return this; } };
            this.toggle = toggle; callback(toggle); return this;
          }
          addExtraButton() { return this; }
          addButton(callback) {
            const button = { setButtonText(value) { this.label = value; return this; }, setWarning() { this.warning = true; return this; }, onClick(fn) { this.click = fn; return this; } };
            this.button = button; this.buttons.push(button); callback(button); return this;
          }
        }
      ` }));
    },
  }],
  bundle: true,
  loader: { ".md": "text" },
  platform: "node",
  format: "esm",
  write: false,
});
const {
  SettingsCatalog, getSettingsTabs, cloneDefaultSettings, HEADING_LEVELS,
  translatorForLocale, RefinedLayoutSettingTab, LayoutPlugin, PluginSettingTab, Setting, Notice, Modal,
} = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

function numericPaths(value, prefix = []) {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = [...prefix, key];
    return typeof child === "number" ? [path.join(".")]
      : child && typeof child === "object" ? numericPaths(child, path) : [];
  });
}

function fieldsFor(mode, locale = "en") {
  const t = translatorForLocale(locale);
  return getSettingsTabs(t).flatMap((tab) => new SettingsCatalog(t, mode).build(tab))
    .flatMap((group) => "fields" in group ? group.fields : Object.values(group.levels).flat());
}

function nativeFields(items, pages = []) {
  return items.flatMap((item) => item.items
    ? nativeFields(item.items, item.type === "page" ? [...pages, item.name] : pages)
    : [{ item, pages }]);
}

function fixture() {
  const plugin = new LayoutPlugin({}, { id: "refined-layout" });
  plugin.settings.language = "en";
  // Keep the real setting mutators, but replace DOM application and disk persistence.
  plugin.applyAndScheduleSave = () => { plugin.saved = structuredClone(plugin.settings); };
  const tab = new RefinedLayoutSettingTab({}, plugin);
  return { plugin, tab };
}

test("global actions import through the clicked window and reset both views with feedback", async () => {
  const { plugin, tab } = fixture();
  const definitions = nativeFields(tab.getSettingDefinitions());
  const setting = new Setting();
  const settingsDocument = {};
  let input;
  let pickerOpened = 0;
  // A connected control in a secondary document. No main-window createEl is
  // available: the import action must create its input through this control.
  setting.controlEl.createEl = (tag) => {
    assert.equal(tag, "input");
    input = Object.assign(new EventTarget(), {
      ownerDocument: settingsDocument,
      isConnected: true,
      remove() { this.isConnected = false; },
      click() {
        assert.equal(this.ownerDocument, settingsDocument);
        assert.equal(this.isConnected, true);
        assert.equal(this.type, "file");
        assert.equal(this.accept, ".json,application/json");
        pickerOpened++;
      },
    });
    return input;
  };
  definitions.find(({ item }) => item.name === "Import settings").item.render(setting);
  const before = structuredClone(plugin.settings);
  setting.button.click();
  input.dispatchEvent(new Event("cancel"));
  assert.equal(input.isConnected, false);
  assert.deepEqual(plugin.settings, before, "Cancel must preserve the current settings");
  assert.equal(plugin.saved, undefined);

  setting.button.click();
  const imported = cloneDefaultSettings();
  imported.language = "zh-CN";
  imported.edit.body.lineHeight = 2.3;
  imported.read.body.lineHeight = 2.7;
  imported.edit.modules.body = false;
  imported.read.modules.body = false;
  input.files = [{ text: async () => JSON.stringify(imported) }];
  input.dispatchEvent(new Event("change"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(pickerOpened, 2, "The picker can reopen after cancellation");
  assert.equal(input.isConnected, false);
  assert.deepEqual(plugin.settings, imported);
  assert.deepEqual(plugin.saved, imported);
  assert.equal(tab.updates, 1, "Successful import refreshes the settings page");

  const reset = new Setting();
  definitions.find(({ item }) => item.name === "Reset all").item.render(reset);
  reset.button.click();
  const t = translatorForLocale(imported.language);
  assert.equal(Modal.current.title, t("resetAll.title"));
  assert.equal(Modal.current.description, t("resetAll.description"));
  assert.deepEqual(plugin.saved, imported, "Opening the confirmation must not reset settings");
  Modal.current.close();
  assert.deepEqual(plugin.settings, imported, "Closing the dialog must keep settings");
  reset.button.click();
  const cancel = Modal.current.contentEl.settings[0].buttons[0];
  assert.equal(cancel.label, t("actions.cancel"));
  cancel.click();
  assert.deepEqual(plugin.saved, imported, "Cancel must not persist a reset");
  assert.equal(tab.updates, 1);
  reset.button.click();
  const confirm = Modal.current.contentEl.settings[0].buttons[1];
  assert.equal(confirm.label, t("actions.resetAll"));
  assert.equal(confirm.warning, true);
  confirm.click();
  assert.equal(Modal.current.closed, true);
  const defaults = cloneDefaultSettings();
  defaults.language = imported.language;
  assert.deepEqual(plugin.settings, defaults, "Reset restores both views and retains the language");
  assert.deepEqual(plugin.saved, defaults);
  assert.equal(tab.updates, 2);
  assert.equal(Notice.messages.at(-1), translatorForLocale(imported.language)("notice.resetAll"));
});

test("catalog covers every applicable numeric setting, including all heading levels", () => {
  const defaults = cloneDefaultSettings();
  for (const mode of ["edit", "read"]) {
    const unused = mode === "edit"
      ? /^(body\.paragraphSpacingEm|(?:callout|blockquote)\.headings\.h[1-6]\.bottomPx|codeBlock\.margin(?:Top|Bottom)Em)$/
      : /^(body\.emptyLineHeightEm|headingDecoration\.firstHeading(?:PaddingTop|DecorOffset)Px|callout\.headings\.h[1-6]\.bottomEm|blockquote\.headings\.h[1-6]\.bottomPx|codeBlock\.innerSpacingEm|headingGap\.(?:callout|blockquote)\.emptyLineEm)$/;
    const expected = numericPaths(defaults[mode]).filter((path) => !unused.test(path)).sort();
    const fields = fieldsFor(mode);
    assert.deepEqual(fields.map((field) => field.path.join(".")).sort(), expected, mode);
    for (const context of ["headings", "callout.headings", "blockquote.headings"]) {
      for (const level of HEADING_LEVELS) assert.ok(expected.includes(`${context}.${level}.lineHeight`));
    }
    assert.equal(fields.find((f) => f.path.join(".") === "body.emptyLineHeightEm")?.options.unit, mode === "edit" ? "em" : undefined);
    const bottom = fields.find((f) => f.path.join(".").startsWith("callout.headings.h6.bottom"));
    assert.equal(bottom.options.unit, mode === "edit" ? "em" : "px");
  }
});

test("two-level navigation indexes every field in the selected mode, including inactive modules", () => {
  const { plugin, tab } = fixture();
  plugin.settings.edit.modules.callouts = false;
  for (const [mode, label] of [["edit", "Editing view"], ["read", "Reading view"]]) {
    tab.mode = mode;
    const all = nativeFields(tab.getSettingDefinitions());
    assert.ok(all.every(({ pages }) => pages.length <= 1), "Only home and detail pages");
    for (const name of ["Language", "Export settings", "Import settings", "Reset all"]) {
      assert.deepEqual(all.find(({ item }) => item.name === name).pages, [], "Global controls stay on home");
    }
    assert.ok(all.every(({ pages }) => pages.length === 0 || pages[0].startsWith(`${label} · `)), "Category titles identify the selected mode");
    const definitions = all.filter(({ item }) => item.aliases);
    assert.ok(definitions.every(({ item }) => item.aliases[0] === label));
    assert.deepEqual(definitions.map(({ item }) => item.aliases.at(-1).replaceAll(" ", ".")).sort(), fieldsFor(mode).map((f) => f.path.join(".")).sort());
    for (const { item } of definitions) {
      assert.notEqual(item.visible, false);
      assert.notEqual(item.searchable, false);
    }
  }
  tab.mode = "edit";
  const h6 = nativeFields(tab.getSettingDefinitions()).find(({ item }) => item.aliases?.at(-1) === "callout headings h6 lineHeight");
  const setting = new Setting();
  h6.item.render(setting);
  assert.equal(setting.disabled, true);
});

test("detail controls validate values and keep captured mode when the home mode changes", () => {
  const { plugin, tab } = fixture();
  for (const [mode, label, value] of [["edit", "Editing view", "0.75"], ["read", "Reading view", "-0.5"]]) {
    tab.mode = mode;
    const definitions = nativeFields(tab.getSettingDefinitions());
    tab.mode = mode === "edit" ? "read" : "edit";
    const path = ["body", "listItemStartEm"];
    const found = definitions.find(({ item }) => item.aliases?.[0] === label && item.aliases?.at(-1) === path.join(" "));
    const native = new Setting();
    found.item.render(native);
    const home = new Setting();
    tab.renderNumber(home, mode, fieldsFor(mode).find((f) => f.path.join(".") === path.join(".")));
    assert.equal(native.text.value, home.text.value);
    assert.equal(native.text.inputEl.min, home.text.inputEl.min);
    const other = structuredClone(plugin.settings[tab.mode]);
    native.text.change(value);
    assert.equal(plugin.saved[mode].body.listItemStartEm, Number(value));
    assert.deepEqual(plugin.settings[tab.mode], other);
    home.text.change("1.25");
    assert.equal(plugin.saved[mode].body.listItemStartEm, 1.25);
    native.text.change(mode === "edit" ? "-0.5" : "-100");
    native.text.change("not a number");
    assert.equal(plugin.settings[mode].body.listItemStartEm, 1.25);
  }
});

test("language refresh rebuilds translated search entries and older hosts retain the home UI", () => {
  const { plugin, tab } = fixture();
  tab.refresh();
  assert.ok(nativeFields(tab.settingItems).some(({ item }) => item.name === "Body line height"));
  const languageRoute = nativeFields(tab.settingItems).find(({ item }) => item.name === "Language").pages;
  plugin.setLanguage("zh-CN");
  tab.refresh();
  const fields = nativeFields(tab.settingItems);
  assert.ok(fields.some(({ item }) => item.name === translatorForLocale("zh-CN")("body.lineHeight")));
  assert.ok(!fields.some(({ item }) => item.name === "Body line height"));
  assert.deepEqual(fields.find(({ item }) => item.name === translatorForLocale("zh-CN")("language.name")).pages, languageRoute,
    "The native language page must stay resolvable while its labels change");
  assert.equal(tab.updates, 2);

  const update = PluginSettingTab.prototype.update;
  let rendered = 0;
  tab.renderHome = () => { rendered++; };
  try {
    delete PluginSettingTab.prototype.update;
    tab.refresh();
    tab.display();
    assert.equal(rendered, 2);
    assert.equal(tab.updates, 2);
  } finally {
    PluginSettingTab.prototype.update = update;
  }
});
