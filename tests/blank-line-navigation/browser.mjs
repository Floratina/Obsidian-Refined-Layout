/* global document, window, KeyboardEvent, requestAnimationFrame */
import { EditorState, EditorSelection, Prec } from "@codemirror/state";
import { EditorView, keymap, drawSelection, Decoration } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { createBlankLineNavigation, moveAcrossBlankLines } from "../../src/blank-line-navigation.ts";

const mount = document.querySelector("#editor");
const output = document.querySelector("#results");
const navigation = createBlankLineNavigation();
let view;
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const settle = async () => { await frame(); await frame(); };
const equal = (actual, expected, message) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};

async function open({ doc = "alpha alpha\n\n\n\nomega omega", enabled = true, height = "0.12em", width = 440, classes = "refined-layout-enabled rl-edit-body", extensions = [], beforeNavigation = [], anchor = 3 } = {}) {
  view?.destroy();
  document.body.className = classes;
  document.body.style.setProperty("--rl-edit-body-empty-line-height-em", height);
  mount.style.width = `${width}px`;
  view = new EditorView({
    parent: mount,
    state: EditorState.create({
      doc, selection: { anchor },
      extensions: [EditorView.lineWrapping, drawSelection(), ...beforeNavigation, ...(enabled ? navigation.extension : []), keymap.of(defaultKeymap), ...extensions],
    }),
  });
  view.focus();
  await settle();
  window.fixture.view = view;
  return view;
}
async function press(key, shiftKey = false) {
  view.contentDOM.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true }));
  await settle();
}
const lineNumber = () => view.state.doc.lineAt(view.state.selection.main.head).number;
async function trace(key, count) {
  const lines = [lineNumber()];
  for (let i = 0; i < count; i++) { await press(key); lines.push(lineNumber()); }
  return lines;
}
function lineClasses(doc, predicate, classes) {
  const state = EditorState.create({ doc });
  const ranges = [];
  for (let n = 1; n <= state.doc.lines; n++) {
    if (predicate(n)) ranges.push(Decoration.line({ class: classes }).range(state.doc.line(n).from));
  }
  return EditorView.decorations.of(Decoration.set(ranges));
}

async function run() {
  document.querySelector("#run").disabled = true;
  const results = [];
  output.textContent = "Running…";
  const check = async (name, fn) => {
    try { await fn(); results.push({ name, pass: true }); }
    catch (error) { results.push({ name, pass: false, error: error.message }); }
    output.textContent = results.map((r) => `${r.pass ? "PASS" : "FAIL"}: ${r.name}${r.error ? ` — ${r.error}` : ""}`).join("\n");
  };

  await check("native baseline recorded", async () => {
    await open({ enabled: false });
    window.fixture.nativeTrace = await trace("ArrowDown", 4);
  });
  for (const height of ["0.45em", "0.12em", "0px"]) {
    await check(`every blank reachable downward (${height})`, async () => {
      await open({ height });
      equal(await trace("ArrowDown", 4), [1, 2, 3, 4, 5], "line sequence");
      equal(view.state.selection.main.head - view.state.doc.line(5).from, 3, "horizontal goal");
      equal(view.state.doc.toString(), "alpha alpha\n\n\n\nomega omega", "unchanged document");
    });
    await check(`every blank reachable upward (${height})`, async () => {
      await open({ height });
      view.dispatch({ selection: { anchor: view.state.doc.line(5).from + 3 } });
      equal(await trace("ArrowUp", 4), [5, 4, 3, 2, 1], "line sequence");
      equal(view.state.selection.main.head, 3, "horizontal goal");
    });
  }
  for (const forward of [true, false]) {
    await check(`host high-priority arrows do not bypass blank navigation (${forward ? "down" : "up"})`, async () => {
      await open({ beforeNavigation: [Prec.high(keymap.of(defaultKeymap))] });
      if (!forward) view.dispatch({ selection: { anchor: view.state.doc.line(5).from + 3 } });
      equal(await trace(forward ? "ArrowDown" : "ArrowUp", 4), forward ? [1, 2, 3, 4, 5] : [5, 4, 3, 2, 1], "line sequence with host keymap");
    });
  }
  await check("Shift navigation precedes host high-priority arrows", async () => {
    await open({ beforeNavigation: [Prec.high(keymap.of(defaultKeymap))] });
    for (let n = 2; n <= 5; n++) {
      await press("ArrowDown", true);
      equal(lineNumber(), n, "selection head with host keymap");
      equal(view.state.selection.main.anchor, 3, "selection anchor");
    }
  });
  await check("a host suggestion handler still receives arrows", async () => {
    let handled = 0;
    await open({ beforeNavigation: [Prec.high(keymap.of([{ key: "ArrowDown", run: () => { handled++; return true; } }]))] });
    const menu = document.body.appendChild(document.createElement("div"));
    menu.className = "suggestion-container";
    menu.textContent = "Host suggestion";
    try {
      await press("ArrowDown");
      equal(handled, 1, "suggestion handler called");
      equal(lineNumber(), 1, "editor cursor unchanged");
    } finally { menu.remove(); }
  });
  await check("single blank between text lines", async () => {
    await open({ doc: "alpha\n\nomega" });
    equal(await trace("ArrowDown", 2), [1, 2, 3], "line sequence");
  });
  await check("first and last empty lines", async () => {
    await open({ doc: "\n\nalpha\n\n", anchor: 0 });
    equal(await trace("ArrowDown", 5), [1, 2, 3, 4, 5, 5], "downward boundaries");
    equal(await trace("ArrowUp", 5), [5, 4, 3, 2, 1, 1], "upward boundaries");
  });
  await check("entirely empty document lines", async () => {
    await open({ doc: "\n\n\n", anchor: 0 });
    equal(await trace("ArrowDown", 3), [1, 2, 3, 4], "empty document");
  });
  await check("Shift keeps its anchor through blank lines", async () => {
    await open();
    for (let n = 2; n <= 5; n++) {
      await press("ArrowDown", true);
      equal(lineNumber(), n, "selection head");
      equal(view.state.selection.main.anchor, 3, "selection anchor");
    }
    for (let n = 4; n >= 1; n--) {
      await press("ArrowUp", true);
      equal(lineNumber(), n, "reversed selection head");
      equal(view.state.selection.main.anchor, 3, "selection anchor");
    }
  });
  await check("ordinary selection collapse remains native", async () => {
    await open();
    view.dispatch({ selection: { anchor: 3, head: view.state.doc.line(4).from } });
    await press("ArrowUp");
    equal(view.state.selection.main.head, 3, "collapsed position");
    equal(view.state.selection.main.empty, true, "collapsed range");
  });
  for (const width of [440, 220]) {
    await check(`wrapped paragraphs retain screen-row navigation (${width}px)`, async () => {
      const doc = `${"alpha beta gamma delta ".repeat(8)}\n\n\n${"omega beta gamma delta ".repeat(8)}`;
      await open({ doc, width });
      const firstLine = view.state.doc.line(1);
      let steps = 0;
      while (lineNumber() === 1 && steps < 50) {
        const before = view.coordsAtPos(view.state.selection.main.head);
        await press("ArrowDown");
        steps++;
        if (lineNumber() === 1) {
          const after = view.coordsAtPos(view.state.selection.main.head);
          if (after.top <= before.top) throw new Error("did not move to next screen row");
        }
      }
      if (steps < 2) throw new Error("skipped paragraph wraps");
      equal(lineNumber(), 2, "first blank after wrapping");
      await press("ArrowDown"); equal(lineNumber(), 3, "second blank");
      await press("ArrowDown"); equal(lineNumber(), 4, "next paragraph");
      const startRect = view.coordsAtPos(view.state.doc.line(4).from, 1);
      const actualRect = view.coordsAtPos(view.state.selection.main.head, view.state.selection.main.assoc || 1);
      equal(Math.round(actualRect.top), Math.round(startRect.top), "enter first screen row");
      await press("ArrowUp"); equal(lineNumber(), 3, "back into blank");
      await press("ArrowUp"); equal(lineNumber(), 2, "back into preceding blank");
      await press("ArrowUp"); equal(lineNumber(), 1, "return to previous paragraph");
      const lastRect = view.coordsAtPos(firstLine.to, -1);
      const returnRect = view.coordsAtPos(view.state.selection.main.head, view.state.selection.main.assoc || -1);
      equal(Math.round(returnRect.top), Math.round(lastRect.top), "enter last screen row");
    });
  }
  for (const forward of [true, false]) {
    await check(`far-right goal retains the correct wrapped row (${forward ? "down" : "up"})`, async () => {
      const doc = `${"abcdefghij".repeat(24)}\n\n\n${"klmnopqrst".repeat(24)}`;
      await open({ doc, width: 220 });
      const blank = view.state.doc.line(forward ? 3 : 2);
      view.dispatch({ selection: EditorSelection.create([EditorSelection.cursor(blank.from, 1, undefined, 500)]) });
      await press(forward ? "ArrowDown" : "ArrowUp");
      const text = view.state.doc.line(forward ? 4 : 1);
      equal(lineNumber(), text.number, "adjoining text line");
      const edge = view.coordsAtPos(forward ? text.from : text.to, forward ? 1 : -1);
      const caret = view.coordsAtPos(view.state.selection.main.head, view.state.selection.main.assoc || -1);
      equal(Math.round(caret.top), Math.round(edge.top), "wrapped screen row");
      equal(view.state.selection.main.goalColumn, 500, "original horizontal goal");
    });
  }
  await check("excluded host contexts do not intercept navigation", async () => {
    for (const className of ["canvas-node", "mermaid", "block-language-dataviewjs", "markdown-embed", "callout", "cm-callout", "cm-table-widget"]) {
      await open();
      mount.classList.add(className);
      try { equal(moveAcrossBlankLines(view, true), false, `excluded ${className}`); }
      finally { mount.classList.remove(className); }
    }
  });
  await check("heading-specific blank height with body module disabled", async () => {
    const doc = "# Heading\n\nparagraph";
    await open({ doc, classes: "refined-layout-enabled rl-edit-heading-gaps", extensions: [lineClasses(doc, (n) => n === 1, "HyperMD-header HyperMD-header-1")] });
    equal(await trace("ArrowDown", 2), [1, 2, 3], "heading blank");
  });
  await check("code-block blank height with body module disabled", async () => {
    const doc = "code first\n\n\ncode last";
    await open({ doc, classes: "refined-layout-enabled rl-edit-code-blocks", extensions: [lineClasses(doc, () => true, "HyperMD-codeblock HyperMD-codeblock-bg")] });
    equal(await trace("ArrowDown", 3), [1, 2, 3, 4], "code blanks");
  });
  await check("changed CSS is remeasured without recreating the editor", async () => {
    await open({ height: "1.7em" });
    document.body.style.setProperty("--rl-edit-body-empty-line-height-em", "0.12em");
    navigation.requestMeasure();
    await settle();
    equal(await trace("ArrowDown", 4), [1, 2, 3, 4, 5], "remeasured blank heights");
  });
  for (const classes of ["", "refined-layout-enabled", "refined-layout-enabled rl-edit-body"]) {
    await check(`normal-height/inactive styles leave native behavior (${classes || "no classes"})`, async () => {
      const options = { classes, height: "1.7em" };
      await open({ ...options, enabled: false });
      const baseline = await trace("ArrowDown", 5);
      await open(options);
      equal(await trace("ArrowDown", 5), baseline, "native comparison");
    });
  }
  await check("spaces, tabs, and quote markers are not treated as empty", async () => {
    for (const middle of ["  ", "\t", ">", "> quote"]) {
      await open({ doc: `alpha\n${middle}\nomega` });
      equal(moveAcrossBlankLines(view, true), false, `native fallback for ${JSON.stringify(middle)}`);
    }
  });
  await check("replacement decorations remain inaccessible", async () => {
    const doc = "alpha\n\n\n\nomega";
    const replaced = Decoration.set([Decoration.replace({ block: true }).range(5, 9)]);
    await open({ doc, extensions: [EditorView.decorations.of(replaced), EditorView.atomicRanges.of(() => replaced)] });
    equal(moveAcrossBlankLines(view, true), false, "no explicit navigation into replaced content");
    await press("ArrowDown");
    if (view.state.selection.main.head > 5 && view.state.selection.main.head < 9) throw new Error("entered folded content");
  });
  await check("multi-cursor selection is not collapsed by the extension", async () => {
    await open({ extensions: [EditorState.allowMultipleSelections.of(true)] });
    view.dispatch({ selection: EditorSelection.create([EditorSelection.cursor(3), EditorSelection.cursor(view.state.doc.line(3).from)]) });
    equal(moveAcrossBlankLines(view, true), false, "native multi-cursor fallback");
    equal(view.state.selection.ranges.length, 2, "preserved cursors");
  });
  await check("host suggestion menu takes precedence", async () => {
    await open();
    const menu = document.body.appendChild(document.createElement("div"));
    menu.className = "suggestion-container";
    menu.textContent = "Host suggestion";
    try { equal(moveAcrossBlankLines(view, true), false, "suggestion owns navigation"); }
    finally { menu.remove(); }
  });
  await check("scrolling across a long document of compressed blanks", async () => {
    const doc = `${"alpha\n\n\n".repeat(80)}omega`;
    await open({ doc, anchor: 0 });
    for (let n = 2; n <= 100; n++) {
      await press("ArrowDown");
      equal(lineNumber(), n, "sequential scroll navigation");
    }
    if (view.scrollDOM.scrollTop === 0) throw new Error("fixture did not exercise scrolling");
  });
  window.fixture.results = results;
  output.textContent += `\n\n${results.filter((r) => r.pass).length}/${results.length} passed.\nNative compressed-line trace: ${window.fixture.nativeTrace.join(" → ")}`;
  document.querySelector("#run").disabled = false;
  return results;
}

window.fixture = { open, press, trace, run, navigation, moveAcrossBlankLines };
document.querySelector("#run").addEventListener("click", run);
document.querySelector("#example").addEventListener("click", () => open({ doc: "Use the up/down arrows here.\n\n\n\nEach blank should be reachable.\n\nA long paragraph: " + "alpha beta gamma delta ".repeat(12) }));
await run();
