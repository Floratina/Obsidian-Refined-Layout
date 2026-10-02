import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  absWorkingDir: root,
  entryPoints: ["tests/blank-line-navigation/browser.mjs"],
  bundle: true,
  format: "esm",
  write: false,
});
const routes = new Map([
  ["/", ["text/html", await readFile(new URL("../tests/blank-line-navigation/index.html", import.meta.url))]],
  ["/styles.css", ["text/css", await readFile(new URL("../styles.css", import.meta.url))]],
  ["/browser.js", ["text/javascript", result.outputFiles[0].contents]],
]);
createServer((request, response) => {
  const route = routes.get(request.url);
  if (!route) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { "Content-Type": route[0], "Cache-Control": "no-store" });
  response.end(route[1]);
}).listen(4177, "127.0.0.1", () => {
  console.log("Blank-line navigation fixture: http://localhost:4177");
});
