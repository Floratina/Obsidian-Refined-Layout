# Blank-line navigation regression tests

The production change lives in `src/blank-line-navigation.ts`. It does not modify CSS, source text, CodeMirror internals, or the editor's content DOM.

## Node checks

```bash
npm run test:navigation
```

These tests control the geometry boundary to check dispatch, selection metadata, guards, and lifecycle cleanup. They are included in `npm run check`; they do not prove browser layout behavior.

## Real browser checks

```bash
npm run test:navigation:browser
```

Uses `playwright-core` and an existing Microsoft Edge installation by default. It does not download a browser, start a server, or touch an Obsidian vault. To use another installed Chromium browser, set `PLAYWRIGHT_CHANNEL` (for example `chrome`) or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` before running it.

The driver bundles the real CM6 editor and serves the fixture responses entirely through Playwright request interception. Tests use the unchanged project stylesheet and CM6's default keyboard map, recording the unpatched baseline before enabling the extension. Additional cases register a host arrow keymap at `Prec.high` **before** the navigation extension: without these cases, a passing standalone editor can conceal the host consuming the arrows first. A screenshot is written to the ignored `node_modules/.cache/refined-layout/navigation-regression.png`.

These browser checks are separate from `npm run check`, so ordinary static/Node checks do not require a locally installed browser.

For interactive inspection, the `blank-line-navigation` entry in `.claude/launch.json` opens the same fixture in the Browser pane. Restart that preview after editing the fixture or extension, as its bundle is built once at startup.

## Obsidian checks

Use `tests/blank-line-navigation-fixture.md` in Obsidian after building and reloading the plugin. The browser fixture is **not** Obsidian and cannot validate its exact theme, suggestion UI, Vim implementation, third-party plugins, or nested widgets.

When the Obsidian CLI is available, `obsidian help` lists its developer diagnostics and `eval` can inspect the running host. Resolve the fixture's Markdown leaf explicitly: `app.workspace.activeEditor` can refer to a different leaf, including a reading-mode editor. Compare actual `keydown` dispatch against a direct invocation of the navigation binding to distinguish precedence problems from eligibility/geometry problems. Verify Up/Down, Shift+Up/Down, surrounding paragraphs, and EOF through actual key events, not only direct handler calls. Preserve and restore the original selection, scroll position and active leaf, and assert that document contents and saved plugin settings remain unchanged. Do not patch the host's functions or prototype.

The canary intentionally leaves multiple selections, Vim mode, composition input, unmeasurable lines, replaced widgets, and excluded surfaces to native handling. Zero-height blank lines can be logically reachable without having visually distinct caret positions.
