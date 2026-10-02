import { EditorSelection, Prec, type Line, type SelectionRange } from "@codemirror/state";
import { BlockType, EditorView, keymap, ViewPlugin } from "@codemirror/view";

const EXCLUDED = ".canvas-wrapper, .canvas-node, .mermaid, .block-language-dataviewjs, .markdown-embed, .callout, .cm-callout, .cm-table-widget";

function hasBlockingWidget(dom: HTMLElement): boolean {
  return Array.from(dom.querySelectorAll('[contenteditable="false"], .cm-widgetBuffer')).some((widget) => {
    // Fold handles, CM caret buffers, and zero-width empty markers accompany
    // ordinary Obsidian source text; they do not make the whole line a widget.
    if (widget.closest(".cm-fold-indicator")
      || widget.matches('img.cm-widgetBuffer[aria-hidden="true"]')) return false;
    return !(widget.tagName === "SPAN" && widget.childNodes.length === 0
      && widget.getBoundingClientRect().width === 0);
  });
}

function textLineElement(view: EditorView, line: Line): HTMLElement | null {
  if (!view.visibleRanges.some(({ from, to }) => from <= line.from && to >= line.to)) return null;
  const block = view.lineBlockAt(line.from);
  if (block.type !== BlockType.Text || block.from !== line.from || block.to !== line.to) return null;

  const { node } = view.domAtPos(line.from);
  const element = node.nodeType === 1 ? node as HTMLElement : node.parentElement;
  const dom = element?.closest<HTMLElement>(".cm-line");
  if (!dom || dom.parentElement !== view.contentDOM || view.posAtDOM(dom, 0) !== line.from) return null;
  if (dom.closest(EXCLUDED) || hasBlockingWidget(dom)) return null;
  if (dom.getClientRects().length === 0) return null;
  return dom;
}

function compressedBlank(view: EditorView, line: Line, dom: HTMLElement): boolean {
  if (line.length !== 0 || !dom.matches(":has(> br:only-child)")) return false;
  const classes = dom.ownerDocument.body.classList;
  const bodyRule = classes.contains("rl-edit-body");
  const codeRule = classes.contains("rl-edit-code-blocks")
    && dom.matches(".HyperMD-codeblock.HyperMD-codeblock-bg");
  const headingRule = classes.contains("rl-edit-heading-gaps")
    && dom.previousElementSibling?.matches('[class*="HyperMD-header"]')
    && dom.nextElementSibling?.matches('.cm-line:not([class*="HyperMD-header"]), .cm-callout, .cm-table-widget, .image-embed');
  if (!bodyRule && !codeRule && !headingRule) return false;

  const style = dom.ownerDocument.defaultView!.getComputedStyle(dom);
  return style.visibility !== "hidden"
    && Number.parseFloat(style.lineHeight) < Math.max(view.defaultLineHeight, Number.parseFloat(style.fontSize)) - 0.5;
}

function insideAtomicRange(view: EditorView, pos: number): boolean {
  let inside = false;
  for (const ranges of view.state.facet(EditorView.atomicRanges)) {
    ranges(view).between(pos, pos, (from, to) => {
      if (from < pos && to > pos) inside = true;
    });
  }
  return inside;
}

function cursorAt(head: number, original: SelectionRange, goalColumn: number | undefined): SelectionRange {
  // moveVertically treats an unspecified association as the preceding side.
  // Use the same side for wrap-boundary probes, which otherwise choose the next row.
  return EditorSelection.cursor(head, original.assoc || -1, original.bidiLevel ?? undefined, goalColumn);
}

/** Only correct a boundary involving a rendered, genuinely empty source line. */
export function moveAcrossBlankLines(view: EditorView, forward: boolean, extend = false): boolean {
  const selection = view.state.selection;
  if (!view.hasFocus || view.composing || view.compositionStarted || view.state.readOnly
    || selection.ranges.length !== 1 || (!extend && !selection.main.empty)) return false;
  if (!view.dom.closest(".markdown-source-view.mod-cm6") || view.dom.closest(EXCLUDED)
    || view.dom.classList.contains("cm-vimMode")) return false;
  const body = view.dom.ownerDocument.body;
  if (!body.classList.contains("refined-layout-enabled")) return false;

  const start = selection.main;
  const doc = view.state.doc;
  const current = doc.lineAt(start.head);
  const nextNumber = current.number + (forward ? 1 : -1);
  if (nextNumber < 1 || nextNumber > doc.lines) return false;
  const next = doc.line(nextNumber);
  if (current.length !== 0 && next.length !== 0) return false;

  const currentDOM = textLineElement(view, current);
  const nextDOM = textLineElement(view, next);
  if (!currentDOM || !nextDOM) return false;
  const currentBlank = compressedBlank(view, current, currentDOM);
  const nextBlank = compressedBlank(view, next, nextDOM);
  if (!currentBlank && !nextBlank) return false;

  // Suggestion lists belong to the host, not to the editor's vertical navigation.
  if (Array.from(body.querySelectorAll<HTMLElement>(".suggestion-container"))
    .some((element) => element.getClientRects().length > 0 && element.ownerDocument.defaultView!.getComputedStyle(element).visibility !== "hidden")) return false;

  const cursor = cursorAt(start.head, start, start.goalColumn);
  if (!currentBlank) {
    // A document line can occupy many screen rows. Only its outward edge may
    // enter an adjacent blank, even when the native candidate overshoots it.
    const boundary = view.moveToLineBoundary(cursor, forward, true);
    if (boundary.head !== (forward ? current.to : current.from)) return false;
  }

  const native = view.moveVertically(cursor, forward);
  let target: SelectionRange;
  if (nextBlank) {
    if (native.head === next.from) return false;
    target = cursorAt(next.from, native, native.goalColumn);
  } else {
    if (!currentBlank || next.length === 0) return false;
    // A compressed blank's caret can extend outside its line box. Measure the
    // adjoining text's first/last screen row rather than stepping from that caret.
    const edge = forward ? next.from : next.to;
    const coords = view.coordsAtPos(edge, forward ? 1 : -1);
    if (!coords || native.goalColumn === undefined) return false;
    const y = (coords.top + coords.bottom) / 2;
    const pos = view.posAtCoords({
      x: view.contentDOM.getBoundingClientRect().left + native.goalColumn,
      y,
    });
    if (pos === null || pos < next.from || pos > next.to) return false;
    const after = view.coordsAtPos(pos, 1);
    const assoc = after && y < after.top ? -1 : 1;
    if (pos === native.head && assoc === native.assoc) return false;
    target = EditorSelection.cursor(pos, assoc, undefined, native.goalColumn);
  }
  if (target.head === start.head || insideAtomicRange(view, target.head)) return false;

  view.dispatch({
    selection: EditorSelection.create([extend
      ? EditorSelection.range(start.anchor, target.head, target.goalColumn, target.bidiLevel ?? undefined)
      : target]),
    scrollIntoView: true,
    userEvent: extend ? "select.extend" : "select",
  });
  return true;
}

export function createBlankLineNavigation() {
  const views = new Set<EditorView>();
  const lifecycle = ViewPlugin.define((view) => {
    views.add(view);
    view.requestMeasure();
    return { destroy: () => { views.delete(view); } };
  });
  return {
    extension: [
      lifecycle,
      // Host/plugin arrow keymaps can already occupy the high-precedence group.
      // Run before those handlers; unaffected keys still fall through to them.
      Prec.highest(keymap.of([
        { key: "ArrowUp", run: (view) => moveAcrossBlankLines(view, false), shift: (view) => moveAcrossBlankLines(view, false, true) },
        { key: "ArrowDown", run: (view) => moveAcrossBlankLines(view, true), shift: (view) => moveAcrossBlankLines(view, true, true) },
      ])),
    ],
    requestMeasure() {
      for (const view of views) view.requestMeasure();
    },
  };
}
