import {
  App,
  PluginSettingTab,
  Setting,
  type ToggleComponent,
} from "obsidian";
import type RefinedLayoutPlugin from "./main";
import {
  HEADING_LEVELS,
  type HeadingLevel,
  type ModeKey,
  type ModuleKey,
} from "./settings";

export type ResettableSection =
  | "body"
  | "headings"
  | "headingDecoration"
  | "callout"
  | "blockquote"
  | "image"
  | "table"
  | "codeBlock"
  | "headingGap"
  | "canvasReset";

interface NumberOptions {
  unit?: "" | "em" | "px" | "%";
  min?: number;
  max?: number;
  step?: number;
}

const MODE_LABELS: Record<ModeKey, string> = {
  edit: "编辑模式",
  read: "阅读模式",
};

const HEADING_LABELS: Record<HeadingLevel, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
};

function inferNumberOptions(path: string[]): Required<NumberOptions> {
  const key = path[path.length - 1] ?? "";
  const joined = path.join(".").toLowerCase();
  const unit = key.endsWith("Em") ? "em"
    : key.endsWith("Px") ? "px"
      : key.endsWith("Pct") ? "%"
        : "";

  if (unit === "%") {
    return { unit, min: 10, max: 100, step: 1 };
  }
  if (key.toLowerCase().includes("lineheight")) {
    return { unit, min: 0.5, max: 3, step: 0.01 };
  }

  const allowsNegative = joined.includes("margin")
    || joined.includes("offset")
    || joined.includes("headinggap")
    || key === "topEm"
    || key === "bottomEm"
    || key === "bottomPx"
    || key === "leftPx";
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

export class RefinedLayoutSettingTab extends PluginSettingTab {
  private mode: ModeKey = "edit";

  constructor(app: App, private readonly plugin: RefinedLayoutPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("refined-layout-settings");

    containerEl.createEl("h2", { text: "Refined Layout" });
    containerEl.createEl("p", {
      cls: "rl-settings-notice",
      text: "首次测试插件前，请在“外观 → CSS 代码片段”中关闭同名的【基础修改】refined-layout，避免两份样式同时生效。",
    });

    this.renderModeSwitcher(containerEl);
    this.renderGlobalReset(containerEl);
    this.renderBodySection(containerEl);
    this.renderHeadingsSection(containerEl);
    this.renderCalloutSection(containerEl);
    this.renderBlockquoteSection(containerEl);
    this.renderImageSection(containerEl);
    this.renderTableSection(containerEl);
    this.renderCodeBlockSection(containerEl);
    this.renderHeadingGapSection(containerEl);
    this.renderCanvasSection(containerEl);
  }

  private renderModeSwitcher(container: HTMLElement): void {
    const setting = new Setting(container)
      .setName("设置模式")
      .setDesc("编辑模式与阅读模式的参数和模块开关完全独立。");

    for (const mode of ["edit", "read"] as const) {
      setting.addButton((button) => {
        button.setButtonText(MODE_LABELS[mode]);
        if (this.mode === mode) {
          button.setCta();
        }
        button.onClick(() => {
          this.mode = mode;
          this.display();
        });
      });
    }
  }

  private renderGlobalReset(container: HTMLElement): void {
    new Setting(container)
      .setName(`${MODE_LABELS[this.mode]} · 全部恢复默认`)
      .setDesc("恢复编辑和阅读两套设置以及全部模块开关。")
      .addButton((button) => {
        button
          .setWarning()
          .setButtonText("全部重置")
          .onClick(() => {
            this.plugin.resetAll();
            this.display();
          });
      });
  }

  private createSection(
    container: HTMLElement,
    title: string,
    module: ModuleKey,
    resetSection: ResettableSection,
    open = false,
  ): HTMLElement {
    const details = container.createEl("details", { cls: "rl-settings-section" });
    details.open = open;
    details.createEl("summary", { text: title });

    const enabled = this.plugin.settings[this.mode].modules[module];
    new Setting(details)
      .setName("启用本模块")
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(enabled).onChange((value) => {
          this.plugin.setModule(this.mode, module, value);
        });
      })
      .addExtraButton((button) => {
        button
          .setIcon("reset")
          .setTooltip("恢复本区默认值")
          .onClick(() => {
            this.plugin.resetSection(this.mode, resetSection, module);
            this.display();
          });
      });

    return details;
  }

  private addNumber(
    container: HTMLElement,
    path: string[],
    name: string,
    description: string,
    options: NumberOptions = {},
  ): void {
    const inferred = inferNumberOptions(path);
    const config = { ...inferred, ...options };
    const value = this.plugin.getNumber(this.mode, path);
    const setting = new Setting(container).setName(name).setDesc(description);

    setting.addText((text) => {
      text.setValue(String(value));
      text.inputEl.type = "number";
      text.inputEl.step = String(config.step);
      text.inputEl.min = String(config.min);
      text.inputEl.max = String(config.max);
      text.inputEl.addClass("rl-settings-number");
      text.onChange((rawValue) => {
        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed) || parsed < config.min || parsed > config.max) {
          return;
        }
        this.plugin.setNumber(this.mode, path, parsed);
      });
    });

    if (config.unit !== "") {
      setting.controlEl.createSpan({ cls: "rl-settings-unit", text: config.unit });
    }
  }

  private renderBodySection(container: HTMLElement): void {
    const section = this.createSection(container, "正文与列表", "body", "body", true);
    this.addNumber(section, ["body", "lineHeight"], "正文行高", "普通正文的行高。");
    if (this.mode === "edit") {
      this.addNumber(section, ["body", "emptyLineHeightEm"], "空行高度", "CodeMirror 空白行的高度。");
    } else {
      this.addNumber(section, ["body", "paragraphSpacingEm"], "段落间距", "阅读模式段落之间的间距。");
    }
    this.addNumber(section, ["body", "listStartEm"], "列表上间距", "正文列表顶部间距。");
    this.addNumber(section, ["body", "listEndEm"], "列表下间距", "正文列表底部间距。");
  }

  private renderHeadingsSection(container: HTMLElement): void {
    const section = this.createSection(container, "正文标题 H1–H6", "headings", "headings");
    this.addNumber(section, ["headingDecoration", "leftPx"], "装饰线左偏移", "主题标题装饰线相对标题的水平位置。");
    this.addNumber(section, ["headingDecoration", "widthPx"], "装饰线宽度", "主题标题装饰线宽度。");
    this.addNumber(section, ["headingDecoration", "radiusPx"], "装饰线圆角", "主题标题装饰线圆角。");
    this.addNumber(section, ["headingDecoration", "marginRightPx"], "装饰线右间距", "替代旧 CSS 中缺失的变量，默认 0。", { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(section, ["headingDecoration", "firstHeadingPaddingTopPx"], "首行标题顶部补偿", "文档第一行是标题时的顶部补偿。");
      this.addNumber(section, ["headingDecoration", "firstHeadingDecorOffsetPx"], "首行装饰线补偿", "文档第一行标题装饰线的额外偏移。");
    }

    for (const level of HEADING_LEVELS) {
      const group = section.createEl("details", { cls: "rl-settings-subsection" });
      group.createEl("summary", { text: HEADING_LABELS[level] });
      this.addNumber(group, ["headings", level, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "标题行高。");
      this.addNumber(group, ["headings", level, "topEm"], `${HEADING_LABELS[level]} 上间距`, "标题顶部间距。");
      this.addNumber(group, ["headings", level, "bottomEm"], `${HEADING_LABELS[level]} 下间距`, "标题底部间距。");
      this.addNumber(group, ["headings", level, "decorHeightPx"], `${HEADING_LABELS[level]} 装饰线高度`, "主题标题装饰线高度。");
      this.addNumber(group, ["headings", level, "decorOffsetPx"], `${HEADING_LABELS[level]} 装饰线垂直偏移`, "在垂直居中基础上的微调。");
    }
  }

  private renderCalloutSection(container: HTMLElement): void {
    const section = this.createSection(container, "Callout", "callouts", "callout");
    const fields: Array<[string, string, string]> = [
      ["radiusPx", "卡片圆角", "Callout 卡片圆角。"],
      ["paddingTopPx", "卡片上内边距", "Callout 卡片上内边距。"],
      ["paddingBottomPx", "卡片下内边距", "Callout 卡片下内边距。"],
      ["paddingLeftPx", "卡片左内边距", "Callout 卡片左内边距。"],
      ["paddingRightPx", "卡片右内边距", "Callout 卡片右内边距。"],
      ["marginTopPx", "卡片上外边距", "Callout 与前方内容的距离。"],
      ["marginBottomPx", "卡片下外边距", "Callout 与后方内容的距离。"],
      ["titleLineHeight", "Callout 标题行高", "标题栏文字行高。"],
      ["titlePaddingTopEm", "标题上内边距", "标题栏顶部内边距。"],
      ["titlePaddingBottomEm", "标题下内边距", "标题栏底部内边距。"],
      ["titlePaddingLeftPx", "标题左内边距", "标题栏左侧内边距。"],
      ["titlePaddingRightPx", "标题右内边距", "标题栏右侧内边距。"],
      ["titleOnlyPaddingTopEm", "仅标题时上内边距", "Callout 只有标题时的顶部内边距。"],
      ["titleOnlyPaddingBottomEm", "仅标题时下内边距", "Callout 只有标题时的底部内边距。"],
      ["collapsedPaddingTopEm", "折叠状态上内边距", "折叠 Callout 的顶部内边距。"],
      ["collapsedPaddingBottomEm", "折叠状态下内边距", "折叠 Callout 的底部内边距。"],
      ["paragraphLineHeight", "内部正文行高", "Callout 正文行高，独立于普通正文。"],
      ["paragraphSpacingEm", "内部段落间距", "Callout 段落间距。"],
      ["listStartEm", "内部列表上间距", "Callout 列表顶部间距。"],
      ["listEndEm", "内部列表下间距", "Callout 列表底部间距。"],
      ["lastListEndEm", "末尾列表下间距", "列表是 Callout 最后元素时的底部间距。"],
    ];
    for (const [key, name, description] of fields) {
      this.addNumber(section, ["callout", key], name, description);
    }

    this.renderContextHeadings(section, "callout", this.mode === "read");
    this.renderTableFields(section, ["callout", "table"], "Callout 表格");
  }

  private renderBlockquoteSection(container: HTMLElement): void {
    const section = this.createSection(container, "引用块", "blockquotes", "blockquote");
    this.addNumber(section, ["blockquote", "paragraphLineHeight"], "内部正文行高", "引用块正文行高，独立于普通正文。");
    this.addNumber(section, ["blockquote", "paragraphSpacingEm"], "内部段落间距", "引用块段落间距。");
    this.addNumber(section, ["blockquote", "listStartEm"], "内部列表上间距", "引用块列表顶部间距。");
    this.addNumber(section, ["blockquote", "listEndEm"], "内部列表下间距", "引用块列表底部间距。");
    this.renderContextHeadings(section, "blockquote", false);
    this.renderTableFields(section, ["blockquote", "table"], "引用块表格");
  }

  private renderContextHeadings(
    container: HTMLElement,
    context: "callout" | "blockquote",
    bottomUsesPx: boolean,
  ): void {
    const headings = container.createEl("details", { cls: "rl-settings-subsection" });
    headings.createEl("summary", { text: "内部标题 H1–H6" });
    for (const level of HEADING_LEVELS) {
      const group = headings.createEl("details", { cls: "rl-settings-subsection" });
      group.createEl("summary", { text: HEADING_LABELS[level] });
      const prefix = [context, "headings", level];
      this.addNumber(group, [...prefix, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "内部标题行高。");
      this.addNumber(group, [...prefix, "topEm"], `${HEADING_LABELS[level]} 上间距`, "内部标题顶部间距。");
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(group, [...prefix, bottomKey], `${HEADING_LABELS[level]} 下间距`, "内部标题底部间距。");
    }
  }

  private renderImageSection(container: HTMLElement): void {
    const section = this.createSection(container, "图片", "images", "image");
    this.addNumber(section, ["image", "maxWidthPct"], "最大宽度", "原生 Markdown 图片相对正文区域的最大宽度。");
    this.addNumber(section, ["image", "radiusPx"], "图片圆角", "图片圆角半径。");
    this.addNumber(section, ["image", "borderPx"], "图片边框", "图片边框宽度。");
  }

  private renderTableSection(container: HTMLElement): void {
    const section = this.createSection(container, "正文表格", "tables", "table");
    this.renderTableFields(section, ["table"], "正文表格");
  }

  private renderTableFields(container: HTMLElement, prefix: string[], label: string): void {
    const group = container.createEl("details", { cls: "rl-settings-subsection" });
    group.createEl("summary", { text: label });
    this.addNumber(group, [...prefix, "cellPaddingPx"], "单元格内边距", "表格单元格内边距。");
    this.addNumber(group, [...prefix, "innerBorderPx"], "内框线宽度", "表格内部边框宽度。");
    this.addNumber(group, [...prefix, "outerBorderPx"], "外边框宽度", "表格外边框宽度。");
    this.addNumber(group, [...prefix, "radiusPx"], "表格圆角", "表格整体圆角。");
    this.addNumber(group, [...prefix, "spacingTopPx"], "表格上间距", "表格与前方内容的距离。");
    this.addNumber(group, [...prefix, "spacingBottomPx"], "表格下间距", "表格与后方内容的距离。");
  }

  private renderCodeBlockSection(container: HTMLElement): void {
    const section = this.createSection(container, "代码块", "codeBlocks", "codeBlock");
    this.addNumber(section, ["codeBlock", "lineHeight"], "代码行高", "代码块内部行高。");
    if (this.mode === "edit") {
      this.addNumber(section, ["codeBlock", "innerSpacingEm"], "内部空行间距", "编辑模式代码块内部空行的间距。");
    } else {
      this.addNumber(section, ["codeBlock", "marginTopEm"], "代码块上间距", "阅读模式代码块顶部间距。");
      this.addNumber(section, ["codeBlock", "marginBottomEm"], "代码块下间距", "阅读模式代码块底部间距。");
    }
  }

  private renderHeadingGapSection(container: HTMLElement): void {
    const section = this.createSection(container, "标题后首元素", "headingGaps", "headingGap");
    if (this.mode === "edit") {
      const fields: Array<[string, string, string]> = [
        ["emptyLineEm", "标题后空行高度", "标题、空行、非标题元素组合中的空行高度。"],
        ["paragraphEm", "紧邻正文间距", "标题后没有空行且紧邻正文时的顶部补偿。"],
        ["listEm", "紧邻列表间距", "标题后紧邻列表时的顶部补偿。"],
        ["quoteEm", "紧邻引用块间距", "标题后紧邻引用块时的顶部补偿。"],
        ["codeEm", "紧邻代码块间距", "标题后紧邻代码块时的顶部补偿。"],
        ["tableEm", "紧邻表格间距", "标题后紧邻表格时的顶部补偿。"],
        ["imageEm", "紧邻图片间距", "标题后紧邻图片时的顶部补偿。"],
        ["calloutEm", "紧邻 Callout 间距", "标题后紧邻 Callout 时的顶部补偿。"],
        ["calloutParagraphPx", "Callout 标题后正文", "Callout 内部标题后紧邻正文时的间距。"],
        ["calloutListPx", "Callout 标题后列表", "Callout 内部标题后紧邻列表时的间距。"],
        ["calloutTablePx", "Callout 标题后表格", "Callout 内部标题后紧邻表格时的间距。"],
      ];
      for (const [key, name, description] of fields) {
        this.addNumber(section, ["headingGap", key], name, description);
      }
    } else {
      this.addNumber(section, ["headingGap", "calloutListPx"], "Callout 标题后列表", "阅读模式 Callout 内部标题后紧邻列表时的间距。");
      this.addNumber(section, ["headingGap", "calloutTablePx"], "Callout 标题后表格", "阅读模式 Callout 内部标题后紧邻表格时的间距。");
    }
  }

  private renderCanvasSection(container: HTMLElement): void {
    if (this.mode !== "read") {
      return;
    }
    const section = this.createSection(container, "Canvas 样式重置", "canvasReset", "canvasReset");
    section.createEl("p", {
      text: "启用后，Canvas 卡片会恢复紧凑的默认标题、段落、Callout、表格和图片布局。",
    });
  }
}
