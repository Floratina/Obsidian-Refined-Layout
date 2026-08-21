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

const customPropertyDefinitions = css.match(/--[a-z0-9-]+\s*:/gi) ?? [];
const unscopedDefinitions = customPropertyDefinitions.filter(
  (definition) => !definition.startsWith("--rl-"),
);
if (unscopedDefinitions.length > 0) {
  failures.push(`发现未使用 --rl- 命名空间的变量：${unscopedDefinitions.join(", ")}`);
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

  const referencedVariables = new Set(
    [...css.matchAll(/var\((--rl-[a-z0-9-]+)/g)].map((match) => match[1]),
  );
  const missingVariables = [...referencedVariables]
    .filter((variable) => !generatedVariables.has(variable))
    .sort();
  if (missingVariables.length > 0) {
    failures.push(`CSS 引用了设置中不存在的变量：${missingVariables.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("CSS check passed: no calc(), balanced braces, namespaced variables.");
}
