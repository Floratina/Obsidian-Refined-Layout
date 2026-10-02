import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  absWorkingDir: root,
  entryPoints: ["tests/blank-line-navigation/browser.mjs"],
  bundle: true,
  format: "esm",
  write: false,
});
const routes = new Map([
  ["/", ["text/html", await readFile(new URL("../tests/blank-line-navigation/index.html", import.meta.url))]],
  ["/styles.css", ["text/css", await readFile(new URL("../styles.css", import.meta.url))]],
  ["/browser.js", ["text/javascript", Buffer.from(bundle.outputFiles[0].contents)]],
]);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : { channel: process.env.PLAYWRIGHT_CHANNEL || "msedge" }),
});
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.on("pageerror", (error) => { console.error(error); process.exitCode = 1; });
  // Fulfil every request in-process. No server, external page, or test file in
  // the user's vault is needed to exercise a real browser layout engine.
  await page.route("http://navigation.test/**", (request) => {
    const route = routes.get(new URL(request.request().url()).pathname);
    return route ? request.fulfill({ contentType: route[0], body: route[1] }) : request.fulfill({ status: 404, body: "" });
  });
  await page.goto("http://navigation.test/");
  await page.waitForFunction(() => Array.isArray(globalThis.fixture?.results), undefined, { timeout: 120000 });
  const { results, nativeTrace } = await page.evaluate(() => ({ results: globalThis.fixture.results, nativeTrace: globalThis.fixture.nativeTrace }));
  for (const result of results) console.log(`${result.pass ? "PASS" : "FAIL"}: ${result.name}${result.error ? ` — ${result.error}` : ""}`);
  console.log(`Native compressed-line trace: ${nativeTrace.join(" -> ")}`);
  console.log(`${results.filter((r) => r.pass).length}/${results.length} browser checks passed`);
  if (results.some((r) => !r.pass)) process.exitCode = 1;
  const screenshot = new URL("../node_modules/.cache/refined-layout/navigation-regression.png", import.meta.url);
  await mkdir(new URL(".", screenshot), { recursive: true });
  await page.screenshot({ path: fileURLToPath(screenshot), fullPage: true });
  console.log(`Screenshot: ${fileURLToPath(screenshot)}`);
} finally {
  await browser.close();
}
