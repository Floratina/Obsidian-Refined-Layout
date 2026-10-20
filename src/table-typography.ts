import type { ModeKey, RefinedLayoutSettings } from "./settings";

const TABLE_ATTRIBUTE = "data-rl-table-typography";
const BLANK_CLASS = "rl-table-blank-line";
const EXCLUDED = ".canvas-wrapper, .canvas-node, .mermaid, .block-language-dataviewjs";
const BREAK_EXCLUDED = "pre, code, svg, math, .math, .MathJax, .markdown-embed";

function previousContent(node: Node): Node | null {
  let previous = node.previousSibling;
  while (previous && (previous.nodeType === Node.COMMENT_NODE
    || (previous.nodeType === Node.TEXT_NODE && /^[\t\r\n ]*$/.test(previous.textContent ?? "")))) {
    previous = previous.previousSibling;
  }
  return previous;
}

function followsBreak(node: Node): boolean {
  const previous = previousContent(node);
  return previous?.nodeType === Node.ELEMENT_NODE
    && (previous as Element).matches(`br, span.${BLANK_CLASS}`);
}

function unwrap(element: Element): void {
  element.replaceWith(...Array.from(element.childNodes));
}

/** Give rendered blank lines a measurable box without changing Markdown or CM DOM. */
export class TableTypography {
  private observer: MutationObserver | null = null;

  constructor(private getSettings: () => RefinedLayoutSettings) {}

  start(): void {
    this.observer = new MutationObserver((records) => {
      const tables = new Set<HTMLTableElement>();
      const collect = (node: Node): void => {
        const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
        if (!element) return;
        const table = element.closest("table");
        if (table) tables.add(table);
        for (const nested of element.querySelectorAll("table")) tables.add(nested);
      };
      for (const record of records) {
        collect(record.target);
        for (const node of record.addedNodes) collect(node);
      }
      for (const table of tables) {
        if (table.isConnected) this.updateTable(table);
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    this.refresh();
  }

  refresh(): void {
    if (!this.observer) return;
    for (const table of document.querySelectorAll("table")) this.updateTable(table);
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    for (const table of document.querySelectorAll(`table[${TABLE_ATTRIBUTE}]`)) {
      table.removeAttribute(TABLE_ATTRIBUTE);
    }
    for (const blank of document.querySelectorAll(`span.${BLANK_CLASS}`)) unwrap(blank);
  }

  private updateTable(table: HTMLTableElement): void {
    const mode: ModeKey | null = table.closest(".markdown-source-view.mod-cm6") ? "edit"
      : table.closest(".markdown-preview-view.markdown-rendered") ? "read" : null;
    const context = table.closest(".callout, .cm-callout") ? "callout"
      : table.closest("blockquote, .el-blockquote") ? "blockquote" : null;
    const module = context === "callout" ? "callouts" : context === "blockquote" ? "blockquotes" : "tables";
    const enabled = mode !== null && !table.closest(EXCLUDED) && this.getSettings()[mode].modules[module];
    const blanks = Array.from(table.querySelectorAll(`span.${BLANK_CLASS}`))
      .filter((blank) => blank.closest("table") === table);

    if (!enabled) {
      table.removeAttribute(TABLE_ATTRIBUTE);
      for (const blank of blanks) unwrap(blank);
      return;
    }

    table.setAttribute(TABLE_ATTRIBUTE, `${mode}-${context ? `${context}-table` : "table"}`);
    for (const blank of blanks) {
      if (!followsBreak(blank) || !this.isRenderedContent(table, blank)) unwrap(blank);
    }
    for (const br of table.querySelectorAll("br")) {
      if (br.parentElement?.classList.contains(BLANK_CLASS)
        || !this.isRenderedContent(table, br) || !followsBreak(br)) continue;
      // Keep the original BR for restoring the native layout.
      // CSS's br + br selector ignores intervening text nodes, so it cannot
      // distinguish a blank line from ordinary text between two line breaks.
      const blank = br.ownerDocument.createElement("span");
      blank.className = BLANK_CLASS;
      br.replaceWith(blank);
      blank.appendChild(br);
    }
  }

  private isRenderedContent(table: HTMLTableElement, element: Element): boolean {
    if (element.closest("table") !== table || !element.closest("th, td")
      || element.closest(BREAK_EXCLUDED)) return false;
    const editor = element.closest(".cm-editor");
    // The outer note editor contains the table widget. Only the nested cell
    // editor owns its own line DOM and must remain untouched.
    return !editor || !table.contains(editor);
  }
}
