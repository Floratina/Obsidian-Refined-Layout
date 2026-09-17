import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Bundle in memory so tests need neither Obsidian nor generated files.
const result = await build({
  stdin: {
    contents: `export * from "./src/i18n/core";
      export * from "./src/i18n/import-error";
      export * from "./src/settings";`,
    resolveDir: fileURLToPath(new URL("../../", import.meta.url)),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const {
  resolveLocale, detectLocale, selectLocale, createTranslator, translatorForLocale, dictionaries,
  parseSettingsJson, SettingsImportError, formatImportError,
} = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

test("Obsidian language aliases and script precedence", () => {
  const cases = {
    "zh-CN": ["zh", "zh-CN", "zh-SG", "zh-Hans", "ZH_cn", " zh_Hans_TW ", "zh-Hans-HK"],
    "zh-TW": ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "ZH_tw", "zh-Hant-CN"],
    ja: ["ja", "ja-JP", "JA_jp"],
    en: ["en", "en-US", "fr", "de", "ko", "zhx", "jargon", "", "   ", null, undefined, 42],
  };
  for (const [locale, codes] of Object.entries(cases)) {
    for (const code of codes) assert.equal(resolveLocale(code), locale, String(code));
  }
  assert.equal(detectLocale(() => { throw new Error("unavailable"); }), "en");
  assert.equal(detectLocale(() => "zh-TW"), "zh-TW");
  assert.equal(selectLocale("auto", () => "ja"), "ja");
  assert.equal(selectLocale("invalid", () => "zh"), "zh-CN");
  assert.equal(selectLocale(undefined, () => "fr"), "en");
  for (const locale of Object.keys(dictionaries)) {
    assert.equal(selectLocale(locale, () => { throw new Error("Manual selection must not read the app language"); }), locale);
    const imported = parseSettingsJson(JSON.stringify({ schemaVersion: 3, language: locale }));
    assert.equal(imported.language, locale);
    assert.equal(parseSettingsJson(JSON.stringify(imported)).language, locale);
  }
  for (const language of [undefined, "fr", "", null, 42, {}]) {
    assert.equal(parseSettingsJson(JSON.stringify({ schemaVersion: 3, language })).language, "auto");
  }
});

test("all four dictionaries contain complete text and matching template parameters", () => {
  assert.deepEqual(Object.keys(dictionaries).sort(), ["en", "ja", "zh-CN", "zh-TW"]);
  const keys = Object.keys(dictionaries.en).sort();
  const placeholders = (value) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    assert.deepEqual(Object.keys(dictionary).sort(), keys, locale);
    for (const key of keys) {
      assert.ok(dictionary[key].trim().length > 0, `${locale}: ${key}`);
      assert.deepEqual(placeholders(dictionary[key]), placeholders(dictionaries.en[key]), `${locale}: ${key}`);
    }
  }
  assert.equal(translatorForLocale("zh-TW")("actions.import"), "匯入設定");
  assert.equal(translatorForLocale("ja")("actions.import"), "設定をインポート");
  assert.equal(translatorForLocale("zh-CN")("headings.lineHeight", { level: "H3" }), "H3 行高");
  assert.equal(translatorForLocale("en")("headings.top", { level: "H3" }), "Space above H3");
  assert.equal(translatorForLocale("ja")("gap.contextList", { context: "Callout" }), "Callout内の見出しの直後にリストが続く場合の間隔。");
});

test("missing or empty translations fall back to English, including templates", () => {
  const t = createTranslator({ "actions.import": "" });
  assert.equal(t("actions.import"), "Import settings");
  assert.equal(t("actions.export"), "Export settings");
  assert.equal(t("headings.top", { level: "H2" }), "Space above H2");
});

test("import failures expose stable codes and localized notices instead of raw exceptions", () => {
  const cases = [
    ["{", "invalidJson"],
    ["null", "invalidRoot"],
    ["[]", "invalidRoot"],
    ["42", "invalidRoot"],
    ["{}", "unsupportedVersion"],
    ['{"schemaVersion":4}', "unsupportedVersion"],
  ];
  for (const [source, code] of cases) {
    let captured;
    assert.throws(() => parseSettingsJson(source), (error) => {
      captured = error;
      return error instanceof SettingsImportError && error.code === code;
    });
    if (code === "invalidJson") assert.ok(captured.originalError instanceof SyntaxError);
    for (const locale of Object.keys(dictionaries)) {
      const t = translatorForLocale(locale);
      const notice = formatImportError(captured, t);
      assert.ok(notice.includes(dictionaries[locale][`error.${code}`]), locale);
      assert.ok(!notice.includes(captured.message), locale);
      assert.ok(!/\{\w+\}/.test(notice), locale);
    }
  }
  const expectedInvalidJson = {
    en: "Refined Layout: Import failed. The file is not valid JSON.",
    "zh-CN": "Refined Layout：导入失败，文件不是有效的 JSON。",
    "zh-TW": "Refined Layout：匯入失敗，檔案不是有效的 JSON。",
    ja: "Refined Layout：インポートに失敗しました。ファイルが有効な JSON ではありません。",
  };
  for (const [locale, expected] of Object.entries(expectedInvalidJson)) {
    assert.equal(formatImportError(new SettingsImportError("invalidJson"), translatorForLocale(locale)), expected);
    assert.ok(!formatImportError(new Error("untranslated detail"), translatorForLocale(locale)).includes("untranslated detail"));
  }
  assert.equal(translatorForLocale("en")("notice.readFailed"), "Refined Layout: Could not read the settings file.");
  assert.equal(translatorForLocale("zh-TW")("notice.readFailed"), "Refined Layout：無法讀取設定檔。");
  assert.equal(translatorForLocale("ja")("notice.readFailed"), "Refined Layout：設定ファイルを読み取れませんでした。");
});
