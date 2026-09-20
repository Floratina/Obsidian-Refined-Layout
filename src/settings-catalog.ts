import type { Translator } from "./i18n/core";
import { HEADING_LEVELS, type HeadingLevel, type ModeKey, type ModuleKey } from "./settings";

export type ResettableSection =
  | "body"
  | "headings"
  | "callout"
  | "blockquote"
  | "image"
  | "mermaid"
  | "table"
  | "codeBlock"
  | "headingGap";

export type SettingsTabId =
  | "body"
  | "headings"
  | "headingDecoration"
  | "callout"
  | "blockquote"
  | "image"
  | "mermaid"
  | "table"
  | "codeBlock"
  | "headingGap";

type ResetTarget = ResettableSection | "headingDecoration";

export interface SettingsTabDefinition {
  id: SettingsTabId;
  label: string;
  description: string;
  module: ModuleKey;
  reset: ResetTarget;
}

export interface NumberOptions {
  unit?: "" | "em" | "px" | "%" | "ratio";
  min?: number;
  max?: number;
  step?: number;
}

export function getModeLabels(t: Translator): Record<ModeKey, string> {
  return {
    edit: t("mode.edit"),
    read: t("mode.read"),
  };
}

export const HEADING_LABELS: Record<HeadingLevel, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
};

export function getSettingsTabs(t: Translator): readonly SettingsTabDefinition[] {
  return [
    { id: "body", label: t("tabs.body"), description: t("tabs.bodyDesc"), module: "body", reset: "body" },
    { id: "headings", label: t("tabs.headings"), description: t("tabs.headingsDesc"), module: "headings", reset: "headings" },
    { id: "headingDecoration", label: t("tabs.headingDecoration"), description: t("tabs.headingDecorationDesc"), module: "headings", reset: "headingDecoration" },
    { id: "callout", label: "Callout", description: t("tabs.calloutDesc"), module: "callouts", reset: "callout" },
    { id: "blockquote", label: t("context.blockquote"), description: t("tabs.blockquoteDesc"), module: "blockquotes", reset: "blockquote" },
    { id: "image", label: t("tabs.image"), description: t("tabs.imageDesc"), module: "images", reset: "image" },
    { id: "mermaid", label: t("tabs.mermaid"), description: t("tabs.mermaidDesc"), module: "mermaid", reset: "mermaid" },
    { id: "table", label: t("tabs.table"), description: t("tabs.tableDesc"), module: "tables", reset: "table" },
    { id: "codeBlock", label: t("tabs.codeBlock"), description: t("tabs.codeBlockDesc"), module: "codeBlocks", reset: "codeBlock" },
    { id: "headingGap", label: t("tabs.headingGap"), description: t("tabs.headingGapDesc"), module: "headingGaps", reset: "headingGap" },
  ];
}

export function inferNumberOptions(path: string[], mode: ModeKey): Required<NumberOptions> {
  const key = path[path.length - 1] ?? "";
  const joined = path.join(".").toLowerCase();
  const unit = key.endsWith("Em") ? "em"
    : key.endsWith("Px") ? "px"
      : key.endsWith("Pct") ? "%"
        : "";

  if (unit === "%") {
    return { unit, min: 10, max: 100, step: 1 };
  }
  // A real line-height parameter is a unitless ratio. Keys carrying a unit
  // suffix are lengths even when "lineHeight" appears in the middle of the
  // name, as in emptyLineHeightEm.
  if (unit === "" && key.toLowerCase().includes("lineheight")) {
    return { unit: "ratio", min: 0.5, max: 3, step: 0.01 };
  }

  // Body and blockquote list spacing is applied as padding on CodeMirror lines
  // in the editing view (margins desync CM6's height map), and padding cannot
  // be negative. The reading view still uses margins, so it keeps negatives.
  const isSourceViewPadding = mode === "edit" && /^(?:body|blockquote)\.list/.test(joined);
  const allowsNegative = !isSourceViewPadding
    && (joined.includes("margin")
      || joined.includes("offset")
      || joined.includes("headinggap")
      || joined.includes("list")
      || key === "topEm"
      || key === "bottomEm"
      || key === "bottomPx"
      || key === "leftPx");
  const isSize = joined.includes("radius")
    || joined.includes("border")
    || joined.includes("width")
    || joined.includes("height")
    || joined.includes("padding");

  if (unit === "em") {
    return { unit, min: allowsNegative ? -5 : 0, max: 10, step: 0.01 };
  }
  if (unit === "px") {
    return {
      unit,
      min: allowsNegative ? -64 : 0,
      max: isSize ? 128 : 256,
      step: 0.5,
    };
  }
  return { unit, min: allowsNegative ? -10 : 0, max: 100, step: 0.01 };
}

export interface NumberField {
  path: string[];
  name: string;
  description: string;
  options: Required<NumberOptions>;
}

export type SettingsFieldGroup = {
  title: string;
  description?: string;
} & ({ fields: NumberField[] } | { context: string; levels: Record<HeadingLevel, NumberField[]> });

// Shared by the tabbed UI and the native searchable settings pages.
export class SettingsCatalog {
  constructor(private readonly t: Translator, private readonly mode: ModeKey) {}

  build(tab: SettingsTabDefinition): SettingsFieldGroup[] {
    const panel: SettingsFieldGroup[] = [];
    switch (tab.id) {
      case "body":
        this.renderBodySection(panel);
        break;
      case "headings":
        this.renderHeadingsSection(panel);
        break;
      case "headingDecoration":
        this.renderHeadingDecorationSection(panel);
        break;
      case "callout":
        this.renderCalloutSection(panel);
        break;
      case "blockquote":
        this.renderBlockquoteSection(panel);
        break;
      case "image":
        this.renderImageSection(panel);
        break;
      case "mermaid":
        this.renderMermaidSection(panel);
        break;
      case "table":
        this.renderTableSection(panel);
        break;
      case "codeBlock":
        this.renderCodeBlockSection(panel);
        break;
      case "headingGap":
        this.renderHeadingGapSection(panel);
        break;
    }
    return panel;
  }

  private addGroup(groups: SettingsFieldGroup[], title: string, description?: string): NumberField[] {
    const fields: NumberField[] = [];
    groups.push({ title, description, fields });
    return fields;
  }

  private addHeadingGroup(groups: SettingsFieldGroup[], title: string, description: string, context: string): Record<HeadingLevel, NumberField[]> {
    const levels: Record<HeadingLevel, NumberField[]> = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    groups.push({ title, description, context, levels });
    return levels;
  }

  private addNumber(fields: NumberField[], path: string[], name: string, description: string, options: NumberOptions = {}): void {
    fields.push({ path, name, description, options: { ...inferNumberOptions(path, this.mode), ...options } });
  }

  private renderBodySection(container: SettingsFieldGroup[]): void {
    const content = container;

    const bodyCard = this.addGroup(content, this.t("body.group"), this.t("body.groupDesc"));
    this.addNumber(bodyCard, ["body", "lineHeight"], this.t("body.lineHeight"), this.t("body.lineHeightDesc"));
    if (this.mode === "edit") {
      this.addNumber(bodyCard, ["body", "emptyLineHeightEm"], this.t("body.emptyLine"), this.t("body.emptyLineDesc"));
    } else {
      this.addNumber(bodyCard, ["body", "paragraphSpacingEm"], this.t("body.paragraphSpacing"), this.t("body.paragraphSpacingDesc"));
    }

    const listCard = this.addGroup(content, this.t("list.group"), this.t("list.groupDesc"));
    this.addNumber(listCard, ["body", "listItemStartEm"], this.t("list.itemTop"), this.t("body.listItemTopDesc"));
    this.addNumber(listCard, ["body", "listItemEndEm"], this.t("list.itemBottom"), this.t("body.listItemBottomDesc"));
    this.addNumber(listCard, ["body", "listBlockStartEm"], this.t("list.blockTop"), this.t("body.listBlockTopDesc"));
    this.addNumber(listCard, ["body", "listBlockEndEm"], this.t("list.blockBottom"), this.t("body.listBlockBottomDesc"));
  }

  private renderHeadingsSection(container: SettingsFieldGroup[]): void {
    const content = container;
    if (this.mode === "edit") {
      const firstHeadingCard = this.addGroup(content, this.t("headings.firstLine"), this.t("headings.firstLineDesc"));
      this.addNumber(firstHeadingCard, ["headingDecoration", "firstHeadingPaddingTopPx"], this.t("headings.firstTop"), this.t("headings.firstTopDesc"));
    }

    const levels = this.addHeadingGroup(
      content,
      this.t("headings.group"),
      this.t("headings.groupDesc"),
      "headings",
    );

    for (const level of HEADING_LEVELS) {
      const fieldsContainer = levels[level];
      this.addNumber(fieldsContainer, ["headings", level, "lineHeight"], this.t("headings.lineHeight", { level: HEADING_LABELS[level] }), this.t("headings.lineHeightDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "topEm"], this.t("headings.top", { level: HEADING_LABELS[level] }), this.t("headings.topDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "bottomEm"], this.t("headings.bottom", { level: HEADING_LABELS[level] }), this.t("headings.bottomDesc"));
    }
  }

  private renderHeadingDecorationSection(container: SettingsFieldGroup[]): void {
    const content = container;
    const appearanceCard = this.addGroup(content, this.t("decoration.group"), this.t("decoration.groupDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "leftPx"], this.t("decoration.left"), this.t("decoration.leftDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "widthPx"], this.t("decoration.width"), this.t("decoration.widthDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "radiusPx"], this.t("decoration.radius"), this.t("decoration.radiusDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "marginRightPx"], this.t("decoration.right"), this.t("decoration.rightDesc"), { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(appearanceCard, ["headingDecoration", "firstHeadingDecorOffsetPx"], this.t("decoration.firstOffset"), this.t("decoration.firstOffsetDesc"));
    }

    const levels = this.addHeadingGroup(
      content,
      this.t("decoration.levels"),
      this.t("decoration.levelsDesc"),
      "headingDecoration",
    );

    for (const level of HEADING_LEVELS) {
      const fieldsContainer = levels[level];
      this.addNumber(fieldsContainer, ["headings", level, "decorHeightPx"], this.t("decoration.height", { level: HEADING_LABELS[level] }), this.t("decoration.heightDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "decorOffsetPx"], this.t("decoration.offset", { level: HEADING_LABELS[level] }), this.t("decoration.offsetDesc"));
    }
  }

  private renderCalloutSection(container: SettingsFieldGroup[]): void {
    const content = container;

    const appearanceCard = this.addGroup(content, this.t("callout.appearance"), this.t("callout.appearanceDesc"));
    this.addNumber(appearanceCard, ["callout", "radiusPx"], this.t("callout.radius"), this.t("callout.radiusDesc"));
    this.addNumber(appearanceCard, ["callout", "marginTopPx"], this.t("callout.marginTop"), this.t("callout.marginTopDesc"));
    this.addNumber(appearanceCard, ["callout", "marginBottomPx"], this.t("callout.marginBottom"), this.t("callout.marginBottomDesc"));

    const paddingCard = this.addGroup(content, this.t("callout.padding"), this.t("callout.paddingDesc"));
    this.addNumber(paddingCard, ["callout", "paddingTopPx"], this.t("callout.paddingTop"), this.t("callout.paddingTopDesc"));
    this.addNumber(paddingCard, ["callout", "paddingBottomPx"], this.t("callout.paddingBottom"), this.t("callout.paddingBottomDesc"));
    this.addNumber(paddingCard, ["callout", "paddingLeftPx"], this.t("callout.paddingLeft"), this.t("callout.paddingLeftDesc"));
    this.addNumber(paddingCard, ["callout", "paddingRightPx"], this.t("callout.paddingRight"), this.t("callout.paddingRightDesc"));

    const titleCard = this.addGroup(content, this.t("callout.title"), this.t("callout.titleDesc"));
    this.addNumber(titleCard, ["callout", "titleLineHeight"], this.t("callout.titleLineHeight"), this.t("callout.titleLineHeightDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingTopEm"], this.t("callout.titleTop"), this.t("callout.titleTopDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingBottomEm"], this.t("callout.titleBottom"), this.t("callout.titleBottomDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingLeftPx"], this.t("callout.titleLeft"), this.t("callout.titleLeftDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingRightPx"], this.t("callout.titleRight"), this.t("callout.titleRightDesc"));

    const specialTitleCard = this.addGroup(content, this.t("callout.specialTitle"), this.t("callout.specialTitleDesc"));
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingTopEm"], this.t("callout.titleOnlyTop"), this.t("callout.titleOnlyTopDesc"));
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingBottomEm"], this.t("callout.titleOnlyBottom"), this.t("callout.titleOnlyBottomDesc"));
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingTopEm"], this.t("callout.collapsedTop"), this.t("callout.collapsedTopDesc"));
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingBottomEm"], this.t("callout.collapsedBottom"), this.t("callout.collapsedBottomDesc"));

    const bodyCard = this.addGroup(content, this.t("context.bodyGroup"), this.t("callout.bodyDesc"));
    this.addNumber(bodyCard, ["callout", "paragraphLineHeight"], this.t("context.lineHeight"), this.t("callout.lineHeightDesc"));
    this.addNumber(bodyCard, ["callout", "paragraphSpacingEm"], this.t("context.paragraphSpacing"), this.t("callout.paragraphSpacingDesc"));
    this.addNumber(bodyCard, ["callout", "listItemStartEm"], this.t("list.itemTop"), this.t("callout.listItemTopDesc"));
    this.addNumber(bodyCard, ["callout", "listItemEndEm"], this.t("list.itemBottom"), this.t("callout.listItemBottomDesc"));
    this.addNumber(bodyCard, ["callout", "listBlockStartEm"], this.t("list.blockTop"), this.t("callout.listBlockTopDesc"));
    this.addNumber(bodyCard, ["callout", "listBlockEndEm"], this.t("list.blockBottom"), this.t("callout.listBlockBottomDesc"));
    this.addNumber(bodyCard, ["callout", "lastListEndEm"], this.t("callout.lastList"), this.t("callout.lastListDesc"));

    this.renderImageFields(content, ["callout", "image"], this.t("callout.image"), this.t("callout.imageDesc"));
    this.renderTableFields(content, ["callout", "table"], this.t("callout.table"), this.t("callout.tableDesc"));
    this.renderContextHeadings(content, "callout", this.mode === "read");
  }

  private renderBlockquoteSection(container: SettingsFieldGroup[]): void {
    const content = container;

    const bodyCard = this.addGroup(content, this.t("context.bodyGroup"), this.t("blockquote.bodyDesc"));
    this.addNumber(bodyCard, ["blockquote", "paragraphLineHeight"], this.t("context.lineHeight"), this.t("blockquote.lineHeightDesc"));
    this.addNumber(bodyCard, ["blockquote", "paragraphSpacingEm"], this.t("context.paragraphSpacing"), this.t("blockquote.paragraphSpacingDesc"));
    this.addNumber(bodyCard, ["blockquote", "listItemStartEm"], this.t("list.itemTop"), this.t("blockquote.listItemTopDesc"));
    this.addNumber(bodyCard, ["blockquote", "listItemEndEm"], this.t("list.itemBottom"), this.t("blockquote.listItemBottomDesc"));
    this.addNumber(bodyCard, ["blockquote", "listBlockStartEm"], this.t("list.blockTop"), this.t("blockquote.listBlockTopDesc"));
    this.addNumber(bodyCard, ["blockquote", "listBlockEndEm"], this.t("list.blockBottom"), this.t("blockquote.listBlockBottomDesc"));

    this.renderTableFields(content, ["blockquote", "table"], this.t("blockquote.table"), this.t("blockquote.tableDesc"));
    this.renderContextHeadings(content, "blockquote", false);
  }

  private renderContextHeadings(
    container: SettingsFieldGroup[],
    context: "callout" | "blockquote",
    bottomUsesPx: boolean,
  ): void {
    const label = context === "callout" ? "Callout" : this.t("context.blockquote");
    const levels = this.addHeadingGroup(
      container,
      this.t("context.headings", { context: label }),
      this.t("context.headingsDesc", { context: label }),
      `${context}-headings`,
    );

    for (const level of HEADING_LEVELS) {
      const fieldsContainer = levels[level];
      const prefix = [context, "headings", level];
      this.addNumber(fieldsContainer, [...prefix, "lineHeight"], this.t("headings.lineHeight", { level: HEADING_LABELS[level] }), this.t("context.headingLineHeightDesc"));
      this.addNumber(fieldsContainer, [...prefix, "topEm"], this.t("headings.top", { level: HEADING_LABELS[level] }), this.t("context.headingTopDesc"));
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(fieldsContainer, [...prefix, bottomKey], this.t("headings.bottom", { level: HEADING_LABELS[level] }), this.t("context.headingBottomDesc"));
    }
  }

  private renderImageSection(container: SettingsFieldGroup[]): void {
    const content = container;
    this.renderImageFields(content, ["image"], this.t("image.group"), this.t("image.groupDesc"));
  }

  private renderImageFields(container: SettingsFieldGroup[], prefix: string[], label: string, description?: string): void {
    const card = this.addGroup(container, label, description);
    this.addNumber(card, [...prefix, "maxWidthPct"], this.t("image.maxWidth"), this.t("image.maxWidthDesc"));
    this.addNumber(card, [...prefix, "radiusPx"], this.t("image.radius"), this.t("image.radiusDesc"));
    this.addNumber(card, [...prefix, "borderPx"], this.t("image.border"), this.t("image.borderDesc"));
    if (prefix.length === 1 && prefix[0] === "image") {
      this.addNumber(card, [...prefix, "marginTopPx"], this.t("image.marginTop"), this.t(this.mode === "edit" ? "image.marginTopEditDesc" : "image.marginTopReadDesc"), { min: 0 });
      this.addNumber(card, [...prefix, "marginBottomPx"], this.t("image.marginBottom"), this.t(this.mode === "edit" ? "image.marginBottomEditDesc" : "image.marginBottomReadDesc"), { min: 0 });
    }
  }

  private renderMermaidSection(container: SettingsFieldGroup[]): void {
    const content = container;
    const card = this.addGroup(content, this.t("mermaid.group"), this.t("mermaid.groupDesc"));
    this.addNumber(card, ["mermaid", "portraitMaxWidthPct"], this.t("mermaid.portraitWidth"), this.t("mermaid.portraitWidthDesc"));
    this.addNumber(card, ["mermaid", "portraitAspectRatio"], this.t("mermaid.portraitRatio"), this.t("mermaid.portraitRatioDesc"), { min: 0.05, max: 5, step: 0.05 });
    this.addNumber(card, ["mermaid", "landscapeMinWidthPx"], this.t("mermaid.landscapeWidth"), this.t("mermaid.landscapeWidthDesc"), { min: 0, max: 4096, step: 10 });
  }

  private renderTableSection(container: SettingsFieldGroup[]): void {
    const content = container;
    this.renderTableFields(content, ["table"], this.t("table.group"), this.t("table.groupDesc"));
  }

  private renderTableFields(container: SettingsFieldGroup[], prefix: string[], label: string, description?: string): void {
    const card = this.addGroup(container, label, description);
    this.addNumber(card, [...prefix, "cellPaddingPx"], this.t("table.cellPadding"), this.t("table.cellPaddingDesc"));
    this.addNumber(card, [...prefix, "innerBorderPx"], this.t("table.innerBorder"), this.t("table.innerBorderDesc"));
    this.addNumber(card, [...prefix, "outerBorderPx"], this.t("table.outerBorder"), this.t("table.outerBorderDesc"));
    this.addNumber(card, [...prefix, "radiusPx"], this.t("table.radius"), this.t("table.radiusDesc"));
    this.addNumber(card, [...prefix, "spacingTopPx"], this.t("table.top"), this.t("table.topDesc"));
    this.addNumber(card, [...prefix, "spacingBottomPx"], this.t("table.bottom"), this.t("table.bottomDesc"));
  }

  private renderCodeBlockSection(container: SettingsFieldGroup[]): void {
    const content = container;
    const card = this.addGroup(content, this.t("code.group"), this.t("code.groupDesc"));
    this.addNumber(card, ["codeBlock", "lineHeight"], this.t("code.lineHeight"), this.t("code.lineHeightDesc"));
    if (this.mode === "edit") {
      this.addNumber(card, ["codeBlock", "innerSpacingEm"], this.t("code.emptyLine"), this.t("code.emptyLineDesc"));
    } else {
      this.addNumber(card, ["codeBlock", "marginTopEm"], this.t("code.top"), this.t("code.topDesc"));
      this.addNumber(card, ["codeBlock", "marginBottomEm"], this.t("code.bottom"), this.t("code.bottomDesc"));
    }
  }

  private renderHeadingGapSection(container: SettingsFieldGroup[]): void {
    const content = container;
    this.renderHeadingGapGroup(content, "body", this.t("context.body"));
    this.renderHeadingGapGroup(content, "callout", "Callout");
    this.renderHeadingGapGroup(content, "blockquote", this.t("context.quote"));
  }

  private renderHeadingGapGroup(
    container: SettingsFieldGroup[],
    context: "body" | "callout" | "blockquote",
    label: string,
  ): void {
    const card = this.addGroup(container, this.t("gap.group", { context: label }), this.t("gap.groupDesc", { context: label }));

    if (context === "body") {
      const bodyFields: Array<[string, string, string]> = [
        ["emptyLineEm", this.t("gap.emptyLine"), this.t("gap.emptyLineDesc")],
        ["paragraphEm", this.t("gap.paragraph"), this.t("gap.paragraphDesc")],
        ["listEm", this.t("gap.list"), this.t("gap.listDesc")],
        ["quoteEm", this.t("gap.quote"), this.t("gap.quoteDesc")],
        ["codeEm", this.t("gap.code"), this.t("gap.codeDesc")],
        ["tableEm", this.t("gap.table"), this.t("gap.tableDesc")],
        ["imageEm", this.t("gap.image"), this.t("gap.imageDesc")],
        ["calloutEm", this.t("gap.callout"), this.t("gap.calloutDesc")],
      ];
      for (const [key, name, description] of bodyFields) {
        this.addNumber(card, ["headingGap", "body", key], name, description);
      }
      return;
    }

    if (this.mode === "edit") {
      this.addNumber(card, ["headingGap", context, "emptyLineEm"], this.t("gap.emptyLine"), this.t("gap.contextEmptyLine", { context: label }));
    }

    const contextFields: Array<[string, string, string]> = [
      ["paragraphPx", this.t("gap.paragraph"), this.t("gap.contextParagraph", { context: label })],
      ["listPx", this.t("gap.list"), this.t("gap.contextList", { context: label })],
      ["quotePx", this.t("gap.quote"), this.t("gap.contextQuote", { context: label })],
      ["codePx", this.t("gap.code"), this.t("gap.contextCode", { context: label })],
      ["tablePx", this.t("gap.table"), this.t("gap.contextTable", { context: label })],
      ["imagePx", this.t("gap.image"), this.t("gap.contextImage", { context: label })],
      ["calloutPx", this.t("gap.callout"), this.t("gap.contextCallout", { context: label })],
    ];
    for (const [key, name, description] of contextFields) {
      this.addNumber(card, ["headingGap", context, key], name, description);
    }
  }

}
