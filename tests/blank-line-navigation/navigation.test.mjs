import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  stdin: {
    contents: `export * from "./src/blank-line-navigation";
      export { EditorState, EditorSelection } from "@codemirror/state";
      export { EditorView, BlockType, ViewPlugin } from "@codemirror/view";`,
    resolveDir: fileURLToPath(new URL("../../", import.meta.url)),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { moveAcrossBlankLines, createBlankLineNavigation, EditorState, EditorSelection, EditorView, BlockType } =
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

// Geometry here is a controlled boundary, not a browser simulation. The real
// CM6/CSS fixture tests actual wrapped lines, keyboard dispatch and measurements.
function fixture({ doc = "abc\n\n\n\nxyz", line = 1, nativeLine = 5, goal = 24, classes = ["refined-layout-enabled", "rl-edit-body"] } = {}) {
  let state = EditorState.create({ doc, selection: { anchor: 0 } });
  state = state.update({ selection: EditorSelection.cursor(state.doc.line(line).from, 1, undefined, goal) }).state;
  const classList = { contains: (name) => classes.includes(name) };
  const ownerDocument = { body: { classList, querySelectorAll: () => [] }, defaultView: { getComputedStyle: () => ({ lineHeight: "2px", fontSize: "16px", visibility: "visible" }) } };
  const contentDOM = { getBoundingClientRect: () => ({ left: 10 }) };
  const elements = new Map(Array.from({ length: state.doc.lines }, (_, i) => {
    const docLine = state.doc.line(i + 1);
    const dom = {
      nodeType: 1, parentElement: contentDOM, ownerDocument, line: docLine,
      closest: (selector) => selector === ".cm-line" ? dom : null,
      matches: (selector) => selector === ":has(> br:only-child)" && docLine.length === 0,
      querySelector: () => null, getClientRects: () => [{}],
    };
    return [docLine.from, dom];
  }));
  const view = {
    state, hasFocus: true, composing: false, compositionStarted: false,
    dom: { ownerDocument, closest: (s) => s === ".markdown-source-view.mod-cm6" ? {} : null, classList: { contains: () => false } },
    contentDOM, defaultLineHeight: 27,
    visibleRanges: [{ from: 0, to: state.doc.length }],
    lineBlockAt: (pos) => { const l = state.doc.lineAt(pos); return { type: BlockType.Text, from: l.from, to: l.to }; },
    domAtPos: (pos) => ({ node: elements.get(pos), offset: 0 }),
    posAtDOM: (dom) => dom.line.from,
    moveToLineBoundary: (cursor, forward) => EditorSelection.cursor(forward ? state.doc.lineAt(cursor.head).to : state.doc.lineAt(cursor.head).from),
    moveVertically: () => EditorSelection.cursor(state.doc.line(nativeLine).from, 1, undefined, goal),
    coordsAtPos: () => ({ left: 34, top: 20, bottom: 36 }),
    posAtCoords: () => null,
    dispatch(transaction) { this.transaction = transaction; this.state = this.state.update(transaction).state; },
  };
  return { view, elements, classes };
}

for (const forward of [true, false]) {
  test(`enter the nearest blank, ${forward ? "down" : "up"}`, () => {
    const { view } = fixture({ line: forward ? 1 : 5, nativeLine: forward ? 5 : 1 });
    assert.equal(moveAcrossBlankLines(view, forward), true);
    assert.equal(view.state.doc.lineAt(view.state.selection.main.head).number, forward ? 2 : 4);
    assert.equal(view.state.selection.main.goalColumn, 24);
    assert.equal(view.transaction.scrollIntoView, true);
    assert.equal(view.transaction.userEvent, "select");
    assert.equal(view.state.doc.toString(), "abc\n\n\n\nxyz");
  });

  test(`move one blank at a time, ${forward ? "down" : "up"}`, () => {
    const { view } = fixture({ line: 3, nativeLine: forward ? 5 : 1 });
    assert.equal(moveAcrossBlankLines(view, forward), true);
    assert.equal(view.state.doc.lineAt(view.state.selection.main.head).number, forward ? 4 : 2);
  });

  test(`Shift keeps the anchor, ${forward ? "down" : "up"}`, () => {
    const { view } = fixture({ line: 3, nativeLine: forward ? 5 : 1 });
    const anchor = view.state.doc.line(forward ? 1 : 5).from;
    const head = view.state.selection.main.head;
    view.state = view.state.update({ selection: EditorSelection.range(anchor, head) }).state;
    assert.equal(moveAcrossBlankLines(view, forward, true), true);
    assert.equal(view.state.selection.main.anchor, anchor);
    assert.equal(view.state.doc.lineAt(view.state.selection.main.head).number, forward ? 4 : 2);
    assert.equal(view.transaction.userEvent, "select.extend");
  });
}

test("native movement already reaching the adjacent blank is untouched", () => {
  const { view } = fixture({ nativeLine: 2 });
  assert.equal(moveAcrossBlankLines(view, true), false);
  assert.equal(view.transaction, undefined);
});

test("do not leave a wrapped paragraph before its last screen row", () => {
  const { view } = fixture();
  view.moveToLineBoundary = () => EditorSelection.cursor(1);
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("leaving a blank retains the horizontal goal in the adjoining text", () => {
  const { view } = fixture({ line: 4, nativeLine: 5 });
  view.posAtCoords = ({ x, y }) => { assert.equal(x, 34); assert.equal(y, 28); return view.state.doc.line(5).from + 2; };
  assert.equal(moveAcrossBlankLines(view, true), true);
  assert.equal(view.state.selection.main.head, view.state.doc.line(5).from + 2);
  assert.equal(view.state.selection.main.goalColumn, 24);
});

test("ordinary nonempty selections retain native collapse behavior", () => {
  const { view } = fixture();
  view.state = view.state.update({ selection: { anchor: 0, head: 2 } }).state;
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("multiple cursors are left intact", () => {
  const { view } = fixture();
  view.state = EditorState.create({ doc: view.state.doc, extensions: EditorState.allowMultipleSelections.of(true), selection: EditorSelection.create([EditorSelection.cursor(0), EditorSelection.cursor(4)]) });
  assert.equal(moveAcrossBlankLines(view, true), false);
  assert.equal(view.state.selection.ranges.length, 2);
});

for (const property of ["composing", "compositionStarted"]) {
  test(`yield during ${property}`, () => {
    const { view } = fixture();
    view[property] = true;
    assert.equal(moveAcrossBlankLines(view, true), false);
  });
}

for (const classes of [[], ["refined-layout-enabled"], ["rl-edit-body"]]) {
  test(`inactive module/root yields: ${classes.join(",") || "none"}`, () => {
    assert.equal(moveAcrossBlankLines(fixture({ classes }).view, true), false);
  });
}

for (const middle of [" ", "\t", ">", "content"]) {
  test(`not a genuinely empty line: ${JSON.stringify(middle)}`, () => {
    assert.equal(moveAcrossBlankLines(fixture({ doc: `abc\n${middle}\nxyz`, nativeLine: 3 }).view, true), false);
  });
}

test("folded or replaced line is not entered", () => {
  const { view } = fixture();
  view.lineBlockAt = () => ({ type: BlockType.WidgetRange, from: 0, to: view.state.doc.length });
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("unrendered lines are not treated as measurable text", () => {
  const { view } = fixture();
  view.visibleRanges = [{ from: 0, to: 3 }];
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("no movement into an atomic range", () => {
  const { view } = fixture();
  view.state = EditorState.create({ doc: view.state.doc, extensions: EditorView.atomicRanges.of(() => ({ between: (_from, _to, f) => f(3, 7) })) });
  assert.equal(moveAcrossBlankLines(view, true), false);
});

for (const forward of [true, false]) {
  test(`document boundary yields ${forward}`, () => {
    const { view } = fixture({ doc: "\n\n", line: forward ? 3 : 1, nativeLine: forward ? 3 : 1 });
    assert.equal(moveAcrossBlankLines(view, forward), false);
  });
}

test("all-empty document still advances logically", () => {
  const { view } = fixture({ doc: "\n\n\n", line: 1, nativeLine: 4 });
  assert.equal(moveAcrossBlankLines(view, true), true);
  assert.equal(view.state.selection.main.head, 1);
});

test("unfocused and read-only editors keep native navigation", () => {
  const { view } = fixture();
  view.hasFocus = false;
  assert.equal(moveAcrossBlankLines(view, true), false);
  view.hasFocus = true;
  view.state = EditorState.create({ doc: view.state.doc, extensions: EditorState.readOnly.of(true) });
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("normal-height and hidden empty lines are not corrected", () => {
  const { view } = fixture();
  view.dom.ownerDocument.defaultView.getComputedStyle = () => ({ lineHeight: "27px", fontSize: "16px", visibility: "visible" });
  assert.equal(moveAcrossBlankLines(view, true), false);
  view.dom.ownerDocument.defaultView.getComputedStyle = () => ({ lineHeight: "2px", fontSize: "16px", visibility: "hidden" });
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("inline widgets and unknown DOM mapping yield to the host", () => {
  const { view, elements } = fixture();
  elements.get(0).querySelector = () => ({});
  assert.equal(moveAcrossBlankLines(view, true), false);
  elements.get(0).querySelector = () => null;
  view.posAtDOM = () => -1;
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("unavailable target coordinates do not consume the key", () => {
  const { view } = fixture({ line: 4, nativeLine: 5 });
  view.coordsAtPos = () => null;
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("Vim mode retains ownership of key handling", () => {
  const { view } = fixture();
  view.dom.classList.contains = (name) => name === "cm-vimMode";
  assert.equal(moveAcrossBlankLines(view, true), false);
});

test("lifecycle measures live editors and forgets destroyed editors", () => {
  const navigation = createBlankLineNavigation();
  const lifecycle = navigation.extension[0];
  let measurements = 0;
  const value = lifecycle.create({ requestMeasure: () => { measurements++; } });
  assert.equal(measurements, 1);
  navigation.requestMeasure();
  assert.equal(measurements, 2);
  value.destroy();
  navigation.requestMeasure();
  assert.equal(measurements, 2);
});
