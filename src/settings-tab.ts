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
  | "callout"
  | "blockquote"
  | "image"
  | "mermaid"
  | "table"
  | "codeBlock"
  | "headingGap"
  | "canvasReset";

type SettingsTabId =
  | "body"
  | "headings"
  | "headingDecoration"
  | "callout"
  | "blockquote"
  | "image"
  | "mermaid"
  | "table"
  | "codeBlock"
  | "headingGap"
  | "canvasReset";

type ResetTarget = ResettableSection | "headingDecoration";

interface SettingsTabDefinition {
  id: SettingsTabId;
  label: string;
  description: string;
  module: ModuleKey;
  reset: ResetTarget;
}

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

const SETTINGS_TABS: readonly SettingsTabDefinition[] = [
  { id: "body", label: "正文与列表", description: "普通正文、空行和列表间距。", module: "body", reset: "body" },
  { id: "headings", label: "正文标题 H1–H6", description: "正文标题的行高和上下间距。", module: "headings", reset: "headings" },
  { id: "headingDecoration", label: "标题伪元素", description: "主题标题装饰线的位置、尺寸和偏移。", module: "headings", reset: "headingDecoration" },
  { id: "callout", label: "Callout", description: "Callout 卡片、标题和内部内容布局。", module: "callouts", reset: "callout" },
  { id: "blockquote", label: "引用块", description: "引用块正文、标题和表格布局。", module: "blockquotes", reset: "blockquote" },
  { id: "image", label: "图片", description: "正文图片的尺寸和外观。", module: "images", reset: "image" },
  { id: "mermaid", label: "Mermaid 图表", description: "纵向与横向 Mermaid 的宽度规则。", module: "mermaid", reset: "mermaid" },
  { id: "table", label: "正文表格", description: "正文表格的内边距、边框和间距。", module: "tables", reset: "table" },
  { id: "codeBlock", label: "代码块", description: "代码块行高和模式相关间距。", module: "codeBlocks", reset: "codeBlock" },
  { id: "headingGap", label: "标题后首元素", description: "标题后接正文、列表和其他元素时的间距。", module: "headingGaps", reset: "headingGap" },
  { id: "canvasReset", label: "Canvas 样式重置", description: "阅读模式 Canvas 卡片的紧凑布局。", module: "canvasReset", reset: "canvasReset" },
];

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
  private activeTabByMode: Record<ModeKey, SettingsTabId> = {
    edit: "body",
    read: "body",
  };

  constructor(app: App, private readonly plugin: RefinedLayoutPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("refined-layout-settings");

    containerEl.createEl("h2", { text: "Refined Layout" });
    this.renderModeSwitcher(containerEl);
    this.renderGlobalReset(containerEl);
    this.renderConfigTransfer(containerEl);
    this.renderSettingsTabs(containerEl);
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

  private renderConfigTransfer(container: HTMLElement): void {
    new Setting(container)
      .setName("配置文件")
      .setDesc("导出当前全部编辑/阅读设置，或从 JSON 文件导入；导入成功后会立即替换当前配置。")
      .addButton((button) => {
        button.setButtonText("导出配置").onClick(() => {
          this.plugin.exportSettings();
        });
      })
      .addButton((button) => {
        button
          .setButtonText("导入配置")
          .setWarning()
          .onClick(() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json,application/json";
            input.addEventListener("change", () => {
              const file = input.files?.[0];
              if (file === undefined) {
                return;
              }
              void this.plugin.importSettings(file).then((imported) => {
                if (imported) {
                  this.display();
                }
              });
            });
            input.click();
          });
      });
  }

  private renderSettingsTabs(container: HTMLElement): void {
    const tabs = SETTINGS_TABS.filter((tab) => tab.id !== "canvasReset" || this.mode === "read");
    const firstTab = tabs[0];
    if (firstTab === undefined) {
      throw new Error("Refined Layout settings have no available tabs");
    }

    const currentTab = tabs.some((tab) => tab.id === this.activeTabByMode[this.mode])
      ? this.activeTabByMode[this.mode]
      : firstTab.id;
    this.activeTabByMode[this.mode] = currentTab;

    const shell = container.createDiv({ cls: "rl-settings-tabs" });
    const nav = shell.createEl("nav", {
      cls: "rl-settings-tab-nav",
      attr: {
        role: "tablist",
        "aria-orientation": "horizontal",
      },
    });
    const panels = shell.createDiv({ cls: "rl-settings-tab-panels" });
    const buttons: HTMLButtonElement[] = [];
    const panelById = new Map<SettingsTabId, HTMLElement>();

    const activateTab = (tabId: SettingsTabId, focusButton = false): void => {
      this.activeTabByMode[this.mode] = tabId;
      tabs.forEach((tab, index) => {
        const button = buttons[index];
        const panel = panelById.get(tab.id);
        if (button === undefined || panel === undefined) {
          throw new Error(`Settings tab DOM is incomplete for ${tab.id}`);
        }
        const isActive = tab.id === tabId;
        button.classList.toggle("rl-settings-tab-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.tabIndex = isActive ? 0 : -1;
        panel.classList.toggle("rl-settings-tab-hidden", !isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
        if (focusButton && isActive) {
          button.focus();
        }
      });
    };

    tabs.forEach((tab) => {
      const buttonId = `refined-layout-settings-tab-${this.mode}-${tab.id}`;
      const panelId = `refined-layout-settings-panel-${this.mode}-${tab.id}`;
      const button = nav.createEl("button", {
        cls: "rl-settings-tab-button",
        attr: {
          id: buttonId,
          role: "tab",
          type: "button",
          "aria-selected": tab.id === currentTab ? "true" : "false",
          "aria-controls": panelId,
        },
      });
      button.tabIndex = tab.id === currentTab ? 0 : -1;
      button.setText(tab.label);
      buttons.push(button);

      const panel = panels.createEl("section", {
        cls: `rl-settings-tab-panel ${tab.id === currentTab ? "" : "rl-settings-tab-hidden"}`,
        attr: {
          id: panelId,
          role: "tabpanel",
          "aria-labelledby": buttonId,
          "aria-hidden": tab.id === currentTab ? "false" : "true",
          tabindex: "0",
        },
      });
      panelById.set(tab.id, panel);
      this.renderTabPanel(panel, tab);

      button.addEventListener("click", () => {
        activateTab(tab.id);
      });
      button.addEventListener("keydown", (event: KeyboardEvent) => {
        const currentIndex = tabs.findIndex((item) => item.id === tab.id);
        if (currentIndex === -1) {
          return;
        }
        let targetIndex: number;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            targetIndex = (currentIndex + 1) % tabs.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            targetIndex = 0;
            break;
          case "End":
            targetIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        const target = tabs[targetIndex];
        if (target === undefined) {
          throw new Error(`Settings tab target is missing at index ${targetIndex}`);
        }
        activateTab(target.id, true);
      });
    });

    activateTab(currentTab);
  }

  private renderTabPanel(panel: HTMLElement, tab: SettingsTabDefinition): void {
    switch (tab.id) {
      case "body":
        this.renderBodySection(panel, tab);
        break;
      case "headings":
        this.renderHeadingsSection(panel, tab);
        break;
      case "headingDecoration":
        this.renderHeadingDecorationSection(panel, tab);
        break;
      case "callout":
        this.renderCalloutSection(panel, tab);
        break;
      case "blockquote":
        this.renderBlockquoteSection(panel, tab);
        break;
      case "image":
        this.renderImageSection(panel, tab);
        break;
      case "mermaid":
        this.renderMermaidSection(panel, tab);
        break;
      case "table":
        this.renderTableSection(panel, tab);
        break;
      case "codeBlock":
        this.renderCodeBlockSection(panel, tab);
        break;
      case "headingGap":
        this.renderHeadingGapSection(panel, tab);
        break;
      case "canvasReset":
        this.renderCanvasSection(panel, tab);
        break;
    }
  }

  private createModuleCard(container: HTMLElement, tab: SettingsTabDefinition): HTMLElement {
    const card = container.createDiv({ cls: "rl-settings-card" });
    const header = card.createDiv({ cls: "rl-settings-card-header" });
    const heading = header.createDiv({ cls: "rl-settings-card-heading" });
    heading.createEl("h3", { text: tab.label });
    heading.createDiv({ cls: "rl-settings-card-description", text: tab.description });

    const actions = header.createDiv({ cls: "rl-settings-card-actions" });
    const actionSetting = new Setting(actions)
      .setClass("rl-settings-card-action-setting")
      .setName("启用本模块")
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.plugin.settings[this.mode].modules[tab.module]).onChange((value) => {
          this.plugin.setModule(this.mode, tab.module, value);
        });
      })
      .addExtraButton((button) => {
        button
          .setIcon("reset")
          .setTooltip("恢复本区默认值")
          .onClick(() => {
            if (tab.reset === "headingDecoration") {
              this.plugin.resetHeadingDecoration(this.mode);
            } else {
              this.plugin.resetSection(this.mode, tab.reset, tab.module);
            }
            this.display();
          });
      });
    actionSetting.controlEl.setAttribute("aria-label", `${tab.label} 模块操作`);

    return card.createDiv({ cls: "rl-settings-card-body" });
  }

  private createGroup(container: HTMLElement, title: string, description?: string): HTMLElement {
    const group = container.createDiv({ cls: "rl-settings-group" });
    const heading = group.createDiv({ cls: "rl-settings-group-heading" });
    heading.createEl("h4", { text: title });
    if (description !== undefined) {
      heading.createDiv({ cls: "rl-settings-group-description", text: description });
    }
    return group.createDiv({ cls: "rl-settings-fields" });
  }

  private createDisclosureGroup(container: HTMLElement, title: string): HTMLElement {
    const details = container.createEl("details", { cls: "rl-settings-disclosure" });
    details.createEl("summary", { text: title });
    return details.createDiv({ cls: "rl-settings-fields" });
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

  private renderBodySection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const fields = this.createGroup(card, "正文与列表", "普通正文、空行和列表的间距设置。");
    this.addNumber(fields, ["body", "lineHeight"], "正文行高", "普通正文的行高。");
    if (this.mode === "edit") {
      this.addNumber(fields, ["body", "emptyLineHeightEm"], "空行高度", "CodeMirror 空白行的高度。");
    } else {
      this.addNumber(fields, ["body", "paragraphSpacingEm"], "段落间距", "阅读模式段落之间的间距。");
    }
    this.addNumber(fields, ["body", "listStartEm"], "列表上间距", "正文列表顶部间距。");
    this.addNumber(fields, ["body", "listEndEm"], "列表下间距", "正文列表底部间距。");
  }

  private renderHeadingsSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    if (this.mode === "edit") {
      const firstHeading = this.createGroup(card, "文档首行");
      this.addNumber(firstHeading, ["headingDecoration", "firstHeadingPaddingTopPx"], "首行标题顶部补偿", "文档第一行是标题时的顶部补偿。");
    }

    const headings = card.createDiv({ cls: "rl-settings-group-list" });
    headings.createEl("h4", { text: "各级标题" });
    for (const level of HEADING_LEVELS) {
      const fields = this.createDisclosureGroup(headings, HEADING_LABELS[level]);
      this.addNumber(fields, ["headings", level, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "标题行高。");
      this.addNumber(fields, ["headings", level, "topEm"], `${HEADING_LABELS[level]} 上间距`, "标题顶部间距。");
      this.addNumber(fields, ["headings", level, "bottomEm"], `${HEADING_LABELS[level]} 下间距`, "标题底部间距。");
    }
  }

  private renderHeadingDecorationSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const appearance = this.createGroup(card, "位置与外观", "调整主题已经提供的标题 ::before；没有标题伪元素的主题不会新增装饰。");
    this.addNumber(appearance, ["headingDecoration", "leftPx"], "水平偏移", "伪元素相对标题的水平位置。");
    this.addNumber(appearance, ["headingDecoration", "widthPx"], "宽度", "伪元素宽度。");
    this.addNumber(appearance, ["headingDecoration", "radiusPx"], "圆角", "伪元素圆角半径。");
    this.addNumber(appearance, ["headingDecoration", "marginRightPx"], "右间距", "伪元素右侧间距。", { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(appearance, ["headingDecoration", "firstHeadingDecorOffsetPx"], "文档首标题额外补偿", "仅在文档第一行就是标题时叠加；正值向下，负值向上。");
    }

    const headings = card.createDiv({ cls: "rl-settings-group-list" });
    headings.createEl("h4", { text: "各级标题装饰" });
    for (const level of HEADING_LEVELS) {
      const fields = this.createDisclosureGroup(headings, HEADING_LABELS[level]);
      this.addNumber(fields, ["headings", level, "decorHeightPx"], `${HEADING_LABELS[level]} 高度`, "伪元素高度。");
      this.addNumber(fields, ["headings", level, "decorOffsetPx"], `${HEADING_LABELS[level]} 垂直补偿`, "在第一行垂直居中的基础上微调；正值向下，负值向上。");
    }
  }

  private renderCalloutSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const appearance = this.createGroup(card, "卡片外观与间距");
    const appearanceFields: Array<[string, string, string]> = [
      ["radiusPx", "卡片圆角", "Callout 卡片圆角。"],
      ["paddingTopPx", "卡片上内边距", "Callout 卡片上内边距。"],
      ["paddingBottomPx", "卡片下内边距", "Callout 卡片下内边距。"],
      ["paddingLeftPx", "卡片左内边距", "Callout 卡片左内边距。"],
      ["paddingRightPx", "卡片右内边距", "Callout 卡片右内边距。"],
      ["marginTopPx", "卡片上外边距", "Callout 与前方内容的距离。"],
      ["marginBottomPx", "卡片下外边距", "Callout 与后方内容的距离。"],
    ];
    for (const [key, name, description] of appearanceFields) {
      this.addNumber(appearance, ["callout", key], name, description);
    }

    const title = this.createGroup(card, "标题栏");
    const titleFields: Array<[string, string, string]> = [
      ["titleLineHeight", "Callout 标题行高", "标题栏文字行高。"],
      ["titlePaddingTopEm", "标题上内边距", "标题栏顶部内边距。"],
      ["titlePaddingBottomEm", "标题下内边距", "标题栏底部内边距；仅标题、折叠或后接标题时会自动抑制冲突空白。"],
      ["titlePaddingLeftPx", "标题左内边距", "标题栏左侧内边距。"],
      ["titlePaddingRightPx", "标题右内边距", "标题栏右侧内边距。"],
      ["titleOnlyPaddingTopEm", "仅标题时上内边距", "Callout 只有标题时的顶部内边距。"],
      ["titleOnlyPaddingBottomEm", "仅标题时下内边距", "Callout 只有标题时的底部内边距；独立于有内容 Callout 的卡片下内边距。"],
      ["collapsedPaddingTopEm", "折叠状态上内边距", "折叠 Callout 的顶部内边距。"],
      ["collapsedPaddingBottomEm", "折叠状态下内边距", "折叠 Callout 的底部内边距。"],
    ];
    for (const [key, name, description] of titleFields) {
      this.addNumber(title, ["callout", key], name, description);
    }

    const content = this.createGroup(card, "内部正文与列表");
    const contentFields: Array<[string, string, string]> = [
      ["paragraphLineHeight", "内部正文行高", "Callout 正文行高，独立于普通正文。"],
      ["paragraphSpacingEm", "内部段落间距", "Callout 段落间距。"],
      ["listStartEm", "内部列表上间距", "Callout 列表顶部间距。"],
      ["listEndEm", "内部列表下间距", "Callout 列表底部间距。"],
      ["lastListEndEm", "末尾列表下间距", "列表是 Callout 最后元素时的底部间距。"],
    ];
    for (const [key, name, description] of contentFields) {
      this.addNumber(content, ["callout", key], name, description);
    }

    this.renderImageFields(card, ["callout", "image"], "Callout 图片");
    this.renderContextHeadings(card, "callout", this.mode === "read");
    this.renderTableFields(card, ["callout", "table"], "Callout 表格（独立）");
  }

  private renderBlockquoteSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const body = this.createGroup(card, "内部正文与列表");
    this.addNumber(body, ["blockquote", "paragraphLineHeight"], "内部正文行高", "引用块正文行高，独立于普通正文。");
    this.addNumber(body, ["blockquote", "paragraphSpacingEm"], "内部段落间距", "引用块段落间距。");
    this.addNumber(body, ["blockquote", "listStartEm"], "内部列表上间距", "引用块列表顶部间距。");
    this.addNumber(body, ["blockquote", "listEndEm"], "内部列表下间距", "引用块列表底部间距。");
    this.renderContextHeadings(card, "blockquote", false);
    this.renderTableFields(card, ["blockquote", "table"], "引用块表格");
  }

  private renderContextHeadings(
    container: HTMLElement,
    context: "callout" | "blockquote",
    bottomUsesPx: boolean,
  ): void {
    const headings = container.createEl("details", { cls: "rl-settings-disclosure rl-settings-context-headings" });
    headings.createEl("summary", { text: "内部标题 H1–H6" });
    const content = headings.createDiv({ cls: "rl-settings-disclosure-body" });
    for (const level of HEADING_LEVELS) {
      const fields = this.createDisclosureGroup(content, HEADING_LABELS[level]);
      const prefix = [context, "headings", level];
      this.addNumber(fields, [...prefix, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "内部标题行高。");
      this.addNumber(fields, [...prefix, "topEm"], `${HEADING_LABELS[level]} 上间距`, "内部标题顶部间距。");
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(fields, [...prefix, bottomKey], `${HEADING_LABELS[level]} 下间距`, "内部标题底部间距。");
    }
  }

  private renderImageSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    this.renderImageFields(card, ["image"], "正文图片");
  }

  private renderImageFields(container: HTMLElement, prefix: string[], label: string): void {
    const fields = this.createGroup(container, label, "图片尺寸和外观设置。");
    this.addNumber(fields, [...prefix, "maxWidthPct"], "最大宽度", "图片相对所在内容区域的最大宽度。");
    this.addNumber(fields, [...prefix, "radiusPx"], "图片圆角", "图片圆角半径。");
    this.addNumber(fields, [...prefix, "borderPx"], "图片边框", "图片边框宽度。");
  }

  private renderMermaidSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const fields = this.createGroup(card, "图表宽度规则", "按 SVG 原始 viewBox 宽高比区分纵向图和普通/横向图。");
    this.addNumber(fields, ["mermaid", "portraitMaxWidthPct"], "纵向图最大宽度", "纵向 Mermaid 相对所在内容区域的最大宽度；图表会水平居中。");
    this.addNumber(fields, ["mermaid", "portraitAspectRatio"], "纵向判定宽高比", "SVG 原始宽度除以高度；小于或等于该值时视为纵向图。", { min: 0.05, max: 5, step: 0.05 });
    this.addNumber(fields, ["mermaid", "landscapeMinWidthPx"], "横向图最小宽度", "普通或横向 Mermaid 的最小宽度；空间不足时允许横向滚动。", { min: 0, max: 4096, step: 10 });
  }

  private renderTableSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    this.renderTableFields(card, ["table"], "正文表格");
  }

  private renderTableFields(container: HTMLElement, prefix: string[], label: string): void {
    const fields = this.createGroup(container, label, "表格单元格、边框、圆角和上下间距。");
    this.addNumber(fields, [...prefix, "cellPaddingPx"], "单元格内边距", "表格单元格内边距。");
    this.addNumber(fields, [...prefix, "innerBorderPx"], "内框线宽度", "表格内部边框宽度。");
    this.addNumber(fields, [...prefix, "outerBorderPx"], "外边框宽度", "表格外边框宽度。");
    this.addNumber(fields, [...prefix, "radiusPx"], "表格圆角", "表格整体圆角。");
    this.addNumber(fields, [...prefix, "spacingTopPx"], "表格上间距", "表格与前方内容的距离。");
    this.addNumber(fields, [...prefix, "spacingBottomPx"], "表格下间距", "表格与后方内容的距离。");
  }

  private renderCodeBlockSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    const fields = this.createGroup(card, "代码块间距");
    this.addNumber(fields, ["codeBlock", "lineHeight"], "代码行高", "代码块内部行高。");
    if (this.mode === "edit") {
      this.addNumber(fields, ["codeBlock", "innerSpacingEm"], "内部空行间距", "编辑模式代码块内部空行的间距。");
    } else {
      this.addNumber(fields, ["codeBlock", "marginTopEm"], "代码块上间距", "阅读模式代码块顶部间距。");
      this.addNumber(fields, ["codeBlock", "marginBottomEm"], "代码块下间距", "阅读模式代码块底部间距。");
    }
  }

  private renderHeadingGapSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    this.renderHeadingGapGroup(card, "body", "正文");
    this.renderHeadingGapGroup(card, "callout", "Callout");
    this.renderHeadingGapGroup(card, "blockquote", "Quote");
  }

  private renderHeadingGapGroup(
    container: HTMLElement,
    context: "body" | "callout" | "blockquote",
    label: string,
  ): void {
    const fields = this.createGroup(container, label, `${label} 内标题后首元素的顶部间距。`);

    if (context === "body") {
      const bodyFields: Array<[string, string, string]> = [
        ["emptyLineEm", "标题后空行高度", "标题、空行、非标题元素组合中的空行高度。"],
        ["paragraphEm", "紧邻正文间距", "正文标题后没有空行且紧邻正文时的顶部补偿。"],
        ["listEm", "紧邻列表间距", "正文标题后紧邻列表时的顶部补偿。"],
        ["quoteEm", "紧邻 Quote 间距", "正文标题后紧邻 Quote 时的顶部补偿。"],
        ["codeEm", "紧邻代码块间距", "正文标题后紧邻代码块时的顶部补偿。"],
        ["tableEm", "紧邻表格间距", "正文标题后紧邻表格时的顶部补偿。"],
        ["imageEm", "紧邻图片间距", "正文标题后紧邻图片时的顶部补偿。"],
        ["calloutEm", "紧邻 Callout 间距", "正文标题后紧邻 Callout 时的顶部补偿。"],
      ];
      for (const [key, name, description] of bodyFields) {
        this.addNumber(fields, ["headingGap", "body", key], name, description);
      }
      return;
    }

    if (this.mode === "edit") {
      this.addNumber(fields, ["headingGap", context, "emptyLineEm"], "标题后空行高度", `${label} 内标题后空行的高度。`);
    }

    const contextFields: Array<[string, string, string]> = [
      ["paragraphPx", "紧邻正文间距", `${label} 内标题后紧邻正文时的间距。`],
      ["listPx", "紧邻列表间距", `${label} 内标题后紧邻列表时的间距。`],
      ["quotePx", "紧邻 Quote 间距", `${label} 内标题后紧邻 Quote 时的间距。`],
      ["codePx", "紧邻代码块间距", `${label} 内标题后紧邻代码块时的间距。`],
      ["tablePx", "紧邻表格间距", `${label} 内标题后紧邻表格时的间距。`],
      ["imagePx", "紧邻图片间距", `${label} 内标题后紧邻图片时的间距。`],
      ["calloutPx", "紧邻 Callout 间距", `${label} 内标题后紧邻 Callout 时的间距。`],
    ];
    for (const [key, name, description] of contextFields) {
      this.addNumber(fields, ["headingGap", context, key], name, description);
    }
  }

  private renderCanvasSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const card = this.createModuleCard(container, tab);
    card.createEl("p", {
      cls: "rl-settings-card-note",
      text: "启用后，Canvas 卡片会恢复紧凑的默认标题、段落、Callout、表格和图片布局。",
    });
  }
}
