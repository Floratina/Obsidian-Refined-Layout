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
      export { PluginSettingTab, Setting, Notice, Modal, setHostApiVersion } from "obsidian";`,
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
        let hostApiVersion = "1.14.4";
        export function setHostApiVersion(version) { hostApiVersion = version; }
        function compareSemver(left, right) {
          const a = left.split(".").map(Number);
          const b = right.split(".").map(Number);
          for (let index = 0; index < 3; index++) {
            if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) - (b[index] ?? 0);
          }
          return 0;
        }
        export function requireApiVersion(version) {
          if (version === "1.13.0") {
            return typeof PluginSettingTab.prototype.update === "function" && compareSemver(hostApiVersion, "1.13.0") >= 0;
          }
          if (version === "1.15.0") {
            return compareSemver(hostApiVersion, "1.15.0") >= 0;
          }
          throw new Error("Unexpected API boundary: " + version);
        }
        export function setIcon(element, iconId) { element.icon = iconId; }
        function makeElement(options = {}) {
          return {
            cls: options.cls ?? "",
            text: options.text ?? "",
            attr: { ...(options.attr ?? {}) },
            children: [],
            empty() { this.children = []; this.text = ""; },
            addClass(...tokens) { this.cls = [this.cls, ...tokens].filter(Boolean).join(" "); },
            createDiv(childOptions = {}) {
              const child = makeElement(childOptions);
              this.children.push(child);
              return child;
            },
          };
        }
        export class PluginSettingTab {
          update() { this.updates = (this.updates ?? 0) + 1; this.settingItems = this.getSettingDefinitions(); }
        }
        export class Setting {
          constructor(container) { container?.settings.push(this); this.buttons = []; this.settingEl = makeElement(); }
          controlEl = { createSpan: (value) => { this.unit = value.text; } };
          setName(value) { this.name = value; return this; }
          setDesc(value) { this.desc = value; return this; }
          setClass() { return this; }
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
            const button = {
              setButtonText(value) { this.label = value; return this; },
              setTooltip(value) { this.tooltip = value; return this; },
              setWarning() { this.warning = true; return this; },
              setDestructive() { this.destructive = true; return this; },
              setCta() { this.cta = true; return this; },
              onClick(fn) { this.click = fn; return this; },
            };
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
  translatorForLocale, RefinedLayoutSettingTab, LayoutPlugin, PluginSettingTab, Setting, Notice, Modal, setHostApiVersion,
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
  const actions = definitions.find(({ item }) => item.name === "Manage settings").item;
  actions.render(setting);
  assert.deepEqual(actions.aliases, ["Import settings", "Export settings", "Reset settings"]);
  const importButton = setting.buttons.find((button) => button.label === "Import settings");
  const resetButton = setting.buttons.find((button) => button.label === "Reset settings");
  assert.equal(resetButton.destructive, true);
  assert.equal(resetButton.cta, true);
  const before = structuredClone(plugin.settings);
  importButton.click();
  input.dispatchEvent(new Event("cancel"));
  assert.equal(input.isConnected, false);
  assert.deepEqual(plugin.settings, before, "Cancel must preserve the current settings");
  assert.equal(plugin.saved, undefined);

  importButton.click();
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

  resetButton.click();
  const t = translatorForLocale(imported.language);
  assert.equal(Modal.current.title, t("resetAll.title"));
  assert.equal(Modal.current.description, t("resetAll.description"));
  assert.deepEqual(plugin.saved, imported, "Opening the confirmation must not reset settings");
  Modal.current.close();
  assert.deepEqual(plugin.settings, imported, "Closing the dialog must keep settings");
  resetButton.click();
  const cancel = Modal.current.contentEl.settings[0].buttons[0];
  assert.equal(cancel.label, t("actions.cancel"));
  cancel.click();
  assert.deepEqual(plugin.saved, imported, "Cancel must not persist a reset");
  assert.equal(tab.updates, 1);
  resetButton.click();
  const confirm = Modal.current.contentEl.settings[0].buttons[1];
  assert.equal(confirm.label, t("actions.resetAll"));
  assert.equal(confirm.destructive, true);
  assert.equal(confirm.cta, true);
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
    for (const name of ["Language", "Manage settings"]) {
      assert.deepEqual(all.find(({ item }) => item.name === name).pages, [], "Global controls stay on home");
    }
    assert.ok(all.every(({ pages }) => pages.length === 0 || pages[0].startsWith(`${label} · `)), "Category titles identify the selected mode");
    const definitions = all.filter(({ item, pages }) => pages.length > 0 && item.aliases);
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

test("Mermaid landscape minimum width stays active below 1.15 and shows a localized infobox while disabled on 1.15+", () => {
  const { plugin, tab } = fixture();
  try {
    setHostApiVersion("1.14.4");
    for (const mode of ["edit", "read"]) {
      tab.mode = mode;
      const all = nativeFields(tab.getSettingDefinitions());
      const mermaidItems = all.filter(({ pages }) => pages[0]?.endsWith(`· ${translatorForLocale("en")("tabs.mermaid")}`));
      assert.equal(mermaidItems.filter(({ item }) => item.searchable === false).length, 0, "No infobox below 1.15");
      const landscape = mermaidItems.find(({ item }) => item.aliases?.at(-1) === "mermaid landscapeMinWidthPx");
      const setting = new Setting();
      landscape.item.render(setting);
      assert.equal(setting.disabled, false);
      assert.notEqual(setting.text.inputEl.disabled, true);
      setting.text.change("520");
      assert.equal(plugin.settings[mode].mermaid.landscapeMinWidthPx, 520);
    }

    setHostApiVersion("1.15.0");
    for (const locale of ["zh-CN", "zh-TW", "en", "ja"]) {
      plugin.setLanguage(locale);
      const t = translatorForLocale(locale);
      for (const mode of ["edit", "read"]) {
        tab.mode = mode;
        const pageLabel = `${t(mode === "edit" ? "mode.edit" : "mode.read")} · ${t("tabs.mermaid")}`;
        const mermaidItems = nativeFields(tab.getSettingDefinitions()).filter(({ pages }) => pages[0] === pageLabel);
        const portrait = mermaidItems.find(({ item }) => item.aliases?.at(-1) === "mermaid portraitMaxWidthPct");
        const portraitSetting = new Setting();
        portrait.item.render(portraitSetting);
        assert.equal(portraitSetting.disabled, false);

        const landscape = mermaidItems.find(({ item }) => item.aliases?.at(-1) === "mermaid landscapeMinWidthPx");
        const landscapeSetting = new Setting();
        landscape.item.render(landscapeSetting);
        assert.equal(landscapeSetting.disabled, true);
        assert.equal(landscapeSetting.text.inputEl.disabled, true);
        landscapeSetting.text.change("640");
        assert.equal(plugin.settings[mode].mermaid.landscapeMinWidthPx, 520, "Disabled input must not mutate settings");

        const infoBoxes = mermaidItems.filter(({ item }) => item.searchable === false);
        assert.equal(infoBoxes.length, 1);
        const infoSetting = new Setting();
        infoBoxes[0].item.render(infoSetting);
        assert.equal(infoSetting.settingEl.children.length, 1);
        const callout = infoSetting.settingEl.children[0];
        assert.equal(callout.cls, "callout rl-settings-infobox");
        assert.equal(callout.attr["data-callout"], "info");
        assert.equal(callout.children[0].icon, "lucide-info");
        assert.equal(callout.children[1].text, t("mermaid.landscapeWidthDisabledNotice"));
      }
    }
  } finally {
    setHostApiVersion("1.14.4");
  }
});
