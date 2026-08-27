import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const failures = [];

async function readTypeScriptSources(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const sources = [];
  for (const entry of entries) {
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directoryUrl);
    if (entry.isDirectory()) {
      sources.push(...await readTypeScriptSources(entryUrl));
    } else if (entry.name.endsWith(".ts")) {
      sources.push([entryUrl, await readFile(entryUrl, "utf8")]);
    }
  }
  return sources;
}

const productionSources = [
  [new URL("../styles.css", import.meta.url), css],
  ...await readTypeScriptSources(new URL("../src/", import.meta.url)),
];

for (const [sourceUrl, source] of productionSources) {
  if (source.includes("calc(")) {
    failures.push(`${sourceUrl.pathname} 仍包含 calc(`);
  }
}

const openingBraces = (css.match(/{/g) ?? []).length;
const closingBraces = (css.match(/}/g) ?? []).length;
if (openingBraces !== closingBraces) {
  failures.push(`花括号数量不平衡：${openingBraces} / ${closingBraces}`);
}

const dataviewJsBoundary = ":not(:where(.block-language-dataviewjs *))";
const unguardedReadingSelectors = css
  .split(/\r?\n/)
  .map((line, index) => ({ line, lineNumber: index + 1 }))
  .filter(({ line }) => /^\s*body\.refined-layout-enabled\.rl-read/.test(line))
  .filter(({ line }) => !line.includes(dataviewJsBoundary));
if (unguardedReadingSelectors.length > 0) {
  failures.push(
    `阅读模式选择器缺少 DataviewJS 边界：${unguardedReadingSelectors
      .map(({ lineNumber }) => lineNumber)
      .join(", ")}`,
  );
}

const requiredCalloutRules = [
  "callout-title:not(:has(+ .callout-content > *))",
  "--rl-edit-callout-title-only-padding-bottom-em",
  "--rl-read-callout-title-only-padding-bottom-em",
  ".callout.is-collapsible.is-collapsed .callout-title",
  "border-bottom-left-radius: 0 !important",
  "border-bottom-right-radius: 0 !important",
  "border-top-right-radius: 0 !important",
  "border-top-left-radius: 0 !important",
  ".callout-title + .callout-content > :is(h1, h2, h3, h4, h5, h6",
];
for (const selector of requiredCalloutRules) {
  if (!css.includes(selector)) {
    failures.push(`缺少 Callout 间距回归规则：${selector}`);
  }
}

const customPropertyDefinitions = css.match(/--[a-z0-9-]+\s*:/gi) ?? [];
const unscopedDefinitions = customPropertyDefinitions.filter(
  (definition) => !definition.startsWith("--rl-"),
);
if (unscopedDefinitions.length > 0) {
  failures.push(`发现未使用 --rl- 命名空间的变量：${unscopedDefinitions.join(", ")}`);
}

const requiredMermaidRules = [
  ".rl-mermaid-portrait",
  "--rl-edit-mermaid-portrait-max-width-pct",
  "--rl-read-mermaid-portrait-max-width-pct",
  "--rl-edit-mermaid-landscape-min-width-px",
  "--rl-read-mermaid-landscape-min-width-px",
  ".markdown-source-view.mod-cm6 .mermaid",
  ".markdown-preview-view.markdown-rendered .mermaid",
];
for (const rule of requiredMermaidRules) {
  if (!css.includes(rule)) {
    failures.push(`缺少 Mermaid 自适应宽度规则：${rule}`);
  }
}

const mermaidBuild = await esbuild.build({
  entryPoints: [fileURLToPath(new URL("../src/mermaid.ts", import.meta.url))],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "es2021",
  write: false,
});
const mermaidSource = mermaidBuild.outputFiles[0]?.text;
if (mermaidSource === undefined) {
  failures.push("无法读取 Mermaid 分类模块的构建输出");
} else {
  const mermaidModule = await import(
    `data:text/javascript;base64,${Buffer.from(mermaidSource).toString("base64")}`
  );
  if (
    !mermaidModule.isPortraitMermaid(276, 1251, 0.75)
    || !mermaidModule.isPortraitMermaid(750, 1000, 0.75)
    || mermaidModule.isPortraitMermaid(751, 1000, 0.75)
  ) {
    failures.push("Mermaid 纵向宽高比分类边界检查失败");
  }
  for (const dimensions of [[0, 100], [100, 0], [Number.NaN, 100]]) {
    try {
      mermaidModule.isPortraitMermaid(dimensions[0], dimensions[1], 0.75);
      failures.push(`Mermaid 无效尺寸未被拒绝：${dimensions.join(" x ")}`);
    } catch (error) {
      if (!(error instanceof RangeError)) {
        failures.push(`Mermaid 无效尺寸抛出了错误类型：${error}`);
      }
    }
  }
}

const settingsBuild = await esbuild.build({
  entryPoints: [fileURLToPath(new URL("../src/settings.ts", import.meta.url))],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "es2021",
  write: false,
});
const settingsSource = settingsBuild.outputFiles[0]?.text;
if (settingsSource === undefined) {
  failures.push("无法读取设置模块的构建输出");
} else {
  const settingsModule = await import(
    `data:text/javascript;base64,${Buffer.from(settingsSource).toString("base64")}`
  );
  const generatedVariables = new Set();

  const toKebabCase = (value) => value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

  const collect = (mode, source, path = []) => {
    for (const [key, value] of Object.entries(source)) {
      if (key === "modules") {
        continue;
      }
      const nextPath = [...path, key];
      if (typeof value === "number") {
        generatedVariables.add(`--rl-${mode}-${nextPath.map(toKebabCase).join("-")}`);
      } else if (typeof value === "object" && value !== null) {
        collect(mode, value, nextPath);
      }
    }
  };

  collect("edit", settingsModule.DEFAULT_SETTINGS.edit);
  collect("read", settingsModule.DEFAULT_SETTINGS.read);

  for (const mode of ["edit", "read"]) {
    const defaults = settingsModule.DEFAULT_SETTINGS[mode];
    if (
      defaults.modules.mermaid !== true
      || defaults.mermaid.portraitMaxWidthPct !== 35
      || defaults.mermaid.portraitAspectRatio !== 0.75
      || defaults.mermaid.landscapeMinWidthPx !== 450
    ) {
      failures.push(`${mode} Mermaid 默认设置检查失败`);
    }
  }

  const referencedVariables = new Set(
    [...css.matchAll(/var\((--rl-[a-z0-9-]+)/g)].map((match) => match[1]),
  );
  const cssDefinedVariables = new Set(
    customPropertyDefinitions.map((definition) => definition.replace(/\s*:$/, "")),
  );
  const missingVariables = [...referencedVariables]
    .filter((variable) => !generatedVariables.has(variable) && !cssDefinedVariables.has(variable))
    .sort();
  if (missingVariables.length > 0) {
    failures.push(`CSS 引用了设置中不存在的变量：${missingVariables.join(", ")}`);
  }

  const requiredHeadingDecorationRules = [
    "top: 50% !important",
    "@supports (top: 1lh)",
    "top: 0.5lh !important",
    "translateY(var(--rl-edit-heading-decoration-line-padding-top, 0px))",
    "--rl-edit-heading-decoration-line-padding-top: var(--rl-edit-headings-h1-top-em)",
    "--rl-edit-heading-decoration-line-padding-top: var(--rl-edit-blockquote-headings-h1-top-em)",
    "--rl-edit-heading-decoration-line-padding-top: 0px",
  ];
  for (const rule of requiredHeadingDecorationRules) {
    if (!css.includes(rule)) {
      failures.push(`缺少标题装饰线首行定位规则：${rule}`);
    }
  }

  const legacySettings = {
    schemaVersion: 1,
    edit: {
      headingGap: {
        emptyLineEm: 1,
        paragraphEm: 2,
        listEm: 3,
        quoteEm: 4,
        codeEm: 5,
        tableEm: 6,
        imageEm: 7,
        calloutEm: 8,
        calloutParagraphPx: -3,
        calloutListPx: -5,
        calloutTablePx: -1,
      },
    },
    read: {
      headingGap: {
        emptyLineEm: 0,
        paragraphEm: 0,
        listEm: 0,
        quoteEm: 0,
        codeEm: 0,
        tableEm: 0,
        imageEm: 0,
        calloutEm: 0,
        calloutParagraphPx: 0,
        calloutListPx: 6,
        calloutTablePx: 8,
      },
    },
  };
  const migrated = settingsModule.mergeSettings(legacySettings);
  if (
    migrated.schemaVersion !== 2
    || migrated.edit.headingGap.body.paragraphEm !== 2
    || migrated.edit.headingGap.callout.listPx !== -5
    || migrated.read.headingGap.callout.tablePx !== 8
    || migrated.edit.callout.image.maxWidthPct !== settingsModule.DEFAULT_SETTINGS.edit.image.maxWidthPct
    || migrated.edit.modules.mermaid !== true
    || migrated.edit.mermaid.portraitMaxWidthPct !== 35
    || migrated.read.mermaid.landscapeMinWidthPx !== 450
  ) {
    failures.push("schemaVersion 1 设置迁移检查失败");
  }

  const importedLegacy = settingsModule.parseSettingsJson(JSON.stringify(legacySettings));
  if (
    importedLegacy.schemaVersion !== 2
    || importedLegacy.read.headingGap.callout.listPx !== 6
    || importedLegacy.edit.mermaid.portraitMaxWidthPct !== 35
  ) {
    failures.push("schemaVersion 1 配置导入检查失败");
  }

  const mergedSchemaTwo = settingsModule.mergeSettings({
    schemaVersion: 2,
    edit: { modules: { body: false } },
    read: {},
  });
  if (
    mergedSchemaTwo.edit.modules.body !== false
    || mergedSchemaTwo.edit.modules.mermaid !== true
    || mergedSchemaTwo.edit.mermaid.portraitAspectRatio !== 0.75
    || mergedSchemaTwo.read.mermaid.portraitMaxWidthPct !== 35
  ) {
    failures.push("schemaVersion 2 设置补全 Mermaid 默认值检查失败");
  }

  const importedDefaults = settingsModule.parseSettingsJson(JSON.stringify(settingsModule.DEFAULT_SETTINGS));
  if (JSON.stringify(importedDefaults) !== JSON.stringify(settingsModule.DEFAULT_SETTINGS)) {
    failures.push("导出配置 JSON 无法无损导入");
  }

  for (const invalidJson of ["{", "{}", "[]", JSON.stringify({ schemaVersion: 3 })]) {
    try {
      settingsModule.parseSettingsJson(invalidJson);
      failures.push(`无效配置未被拒绝：${invalidJson}`);
    } catch (error) {
      if (!(error instanceof Error)) {
        failures.push(`无效配置抛出了不可识别的错误：${invalidJson}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("CSS check passed: no calc(), balanced braces, namespaced variables.");
}
