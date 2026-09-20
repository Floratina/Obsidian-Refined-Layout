import esbuild from "esbuild";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const production = process.argv.includes("production");
const syncToObsidian = !process.argv.includes("--no-sync");
const projectDir = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = "D:/文件/Obsidian Vault/Floratina/.obsidian/plugins/refined-layout";
const assets = ["styles.css", "manifest.json"];

const context = await esbuild.context({
  absWorkingDir: projectDir,
  plugins: [{
    name: "deploy-to-obsidian",
    setup(build) {
      build.onLoad({ filter: /[\\/]src[\\/]main\.ts$/ }, async (args) => ({
        contents: await readFile(args.path, "utf8"),
        loader: "ts",
        resolveDir: path.dirname(args.path),
        watchFiles: assets.map((file) => path.join(projectDir, file)),
      }));
      build.onEnd(async (result) => {
        if (result.errors.length > 0 || !syncToObsidian) return;
        await mkdir(pluginDir, { recursive: true });
        for (const file of [...assets, "main.js"]) {
          await copyFile(path.join(projectDir, file), path.join(pluginDir, file));
        }
        console.log(`Plugin files synced to ${pluginDir}`);
      });
    },
  }],
  banner: {
    js: "/* Refined Layout - generated file */",
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
  ],
  format: "cjs",
  target: "es2021",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
