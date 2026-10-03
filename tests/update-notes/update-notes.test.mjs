import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  stdin: {
    contents: `export { default as LayoutPlugin } from "./src/main";
      export * from "./src/update-notes";
      export { Modal } from "obsidian";`,
    resolveDir: fileURLToPath(new URL("../../", import.meta.url)),
    loader: "ts",
  },
  plugins: [{
    name: "host-boundary",
    setup(builder) {
      builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "host" }));
      builder.onLoad({ filter: /.*/, namespace: "host" }, () => ({ contents: `
        export class Plugin {
          constructor(app) { this.app = app; this.manifest = { version: "1.0.0" }; }
          registerEditorExtension() {}
          addSettingTab() {}
        }
        export class PluginSettingTab {}
        export class Notice {}
        export class Setting {}
        export class Component {}
        export class MarkdownRenderer {}
        export class Modal {
          static opened = 0;
          open() { Modal.opened++; this.onShown(); }
          close() { this.closed = true; }
        }
        export function getLanguage() { return "en"; }
        export function requireApiVersion() { return true; }
      ` }));
    },
  }],
  bundle: true,
  loader: { ".md": "text" },
  platform: "node",
  format: "esm",
  write: false,
});
const { LayoutPlugin, Modal, extractVersionNotes, shouldShowUpdateNotes, getUpdateNotes } =
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const UPDATE_NOTES_ID = "1.0.0";

// Keep startup, setting mutators and persistence real; isolate the host and CSS effects.
async function fixture(data) {
  let ready;
  const writes = [];
  const plugin = new LayoutPlugin({ workspace: { onLayoutReady(callback) { ready = callback; } } });
  plugin.loadData = async () => data;
  plugin.saveData = async (value) => { writes.push(structuredClone(value)); };
  for (const method of ["applySettings", "clearAppliedStyles", "startMermaidObserver", "stopMermaidObserver"]) {
    plugin[method] = () => {};
  }
  await plugin.onload();
  return { plugin, writes, ready: () => ready() };
}

test("first load displays after layout is ready; saved notes do not repeat; new notes do", async () => {
  const opened = Modal.opened;
  const first = await fixture();
  assert.equal(Modal.opened, opened);
  first.ready();
  await first.plugin.saveQueue;
  assert.equal(Modal.opened, opened + 1);
  assert.equal(first.writes[0].lastSeenUpdateNotesId, UPDATE_NOTES_ID);
  first.ready();
  assert.equal(Modal.opened, opened + 1);
  const reloaded = await fixture(first.writes[0]);
  reloaded.ready();
  assert.equal(Modal.opened, opened + 1);
  assert.equal(reloaded.writes.length, 0);
  assert.equal(shouldShowUpdateNotes(UPDATE_NOTES_ID, "next-announcement"), true);
  assert.equal(shouldShowUpdateNotes(null, UPDATE_NOTES_ID), true);
});

test("Chinese locales use the supplied Chinese text and every other locale uses English", () => {
  const notesFor = (language, readLanguage) => getUpdateNotes(language, UPDATE_NOTES_ID, readLanguage);
  const chinese = notesFor("zh-CN");
  const english = notesFor("en");
  assert.equal(chinese.title, "Refined Layout 1.0.0 更新说明");
  assert.equal(chinese.close, "知道了");
  assert.match(chinese.markdown, /Shift \+ ↑\/↓/);
  assert.equal(english.title, "Refined Layout 1.0.0 Update Notes");
  assert.equal(english.close, "Got it");
  assert.deepEqual(notesFor("zh-TW"), chinese);
  assert.deepEqual(notesFor("ja"), english);
  for (const locale of ["zh", "zh-TW", "zh-Hant", "zh-CN"]) {
    assert.deepEqual(notesFor("auto", () => locale), chinese);
  }
  for (const locale of ["ja", "en", "fr"]) {
    assert.deepEqual(notesFor("auto", () => locale), english);
  }
  assert.deepEqual(notesFor("auto", () => { throw new Error("Unavailable"); }), english);
  assert.deepEqual(notesFor("en", () => "zh"), english);
});

test("version extraction keeps Markdown within the exact section and excludes other releases", () => {
  const source = "# Notes\r\n## 1.1.0\r\nFuture\r\n## 1.0.0\r\n### Fix\r\n- **Fixed** navigation\r\n```md\r\n## Example\r\n```\r\n## 0.2.0\r\nOlder";
  assert.equal(extractVersionNotes(source, "1.0.0"), "### Fix\n- **Fixed** navigation\n```md\n## Example\n```");
  assert.equal(extractVersionNotes(source, "0.2.0"), "Older");
  assert.equal(extractVersionNotes(source, "1.0"), "");
  for (const locale of ["en", "zh-CN"]) {
    const notes = getUpdateNotes(locale, "1.0.0");
    assert.match(notes.markdown, /^#{3,6} /);
    assert.doesNotMatch(notes.markdown, /0\.2\.0|0\.1\.0|Native settings search|原生设置搜索/);
  }
});

test("missing or empty version notes never open a modal or record an announcement", async () => {
  assert.equal(extractVersionNotes("## 1.0.0\n\n## 0.2.0\nOlder", "1.0.0"), "");
  assert.equal(getUpdateNotes("en", "9.0.0"), null);
  const { plugin, ready, writes } = await fixture();
  plugin.manifest.version = "9.0.0";
  const opened = Modal.opened;
  ready();
  assert.equal(Modal.opened, opened);
  assert.equal(writes.length, 0);
});

test("import, reset and queued setting saves retain the marker; exports exclude it", async (t) => {
  const setHostGlobal = (key, value) => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    });
  };
  t.mock.method(globalThis, "setTimeout", () => 1);
  t.mock.method(globalThis, "clearTimeout", () => {});
  setHostGlobal("window", globalThis);
  const { plugin, writes, ready } = await fixture();
  ready();
  plugin.setLanguage("zh-TW");
  plugin.resetAll();
  const imported = structuredClone(plugin.settings);
  imported.edit.body.lineHeight = 2;
  imported.lastSeenUpdateNotesId = "foreign-marker";
  assert.equal(await plugin.importSettings({ text: async () => JSON.stringify(imported) }), true);
  // Flush the actual delayed-save path through unload.
  plugin.onunload();
  await plugin.saveQueue;
  assert.equal(writes.at(-1).edit.body.lineHeight, 2);
  assert.equal(writes.at(-1).lastSeenUpdateNotesId, UPDATE_NOTES_ID);
  assert.equal(plugin.settings.language, "zh-TW");
  let exported;
  t.mock.method(URL, "createObjectURL", (blob) => { exported = blob; return "blob:test"; });
  setHostGlobal("createEl", () => ({ click() {}, remove() {} }));
  setHostGlobal("document", { body: { appendChild() {} } });
  plugin.exportSettings();
  const json = JSON.parse(await exported.text());
  assert.equal("lastSeenUpdateNotesId" in json, false);
  assert.equal(json.edit.body.lineHeight, 2);
});

test("disk writes stay ordered even while the preceding save is pending", async () => {
  const { plugin, ready } = await fixture();
  const writes = [];
  let finishFirst;
  plugin.saveData = (data) => {
    writes.push(data);
    if (writes.length === 1) return new Promise((resolve) => { finishFirst = resolve; });
    return Promise.resolve();
  };
  const earlier = plugin.savePluginData();
  await Promise.resolve();
  ready();
  assert.equal(writes.length, 1);
  finishFirst();
  await earlier;
  await plugin.saveQueue;
  assert.equal(writes.length, 2);
  assert.equal(writes.at(-1).lastSeenUpdateNotesId, UPDATE_NOTES_ID);
});

test("unloading before layout readiness prevents the modal; unloading after opening closes it", async () => {
  const opened = Modal.opened;
  const early = await fixture();
  early.plugin.onunload();
  early.ready();
  assert.equal(Modal.opened, opened);
  assert.equal(early.writes.length, 0);
  const active = await fixture();
  active.ready();
  const modal = active.plugin.updateNotesModal;
  active.plugin.onunload();
  assert.equal(modal.closed, true);
  await active.plugin.saveQueue;
});

test("save failure is reported and leaves an unseen announcement eligible on restart", async (t) => {
  const errors = t.mock.method(console, "error", () => {});
  const { plugin, ready } = await fixture();
  plugin.saveData = async () => { throw new Error("Disk unavailable"); };
  ready();
  await plugin.saveQueue;
  assert.equal(errors.mock.callCount(), 1);
  const restarted = await fixture();
  const opened = Modal.opened;
  restarted.ready();
  await restarted.plugin.saveQueue;
  assert.equal(Modal.opened, opened + 1);
});
