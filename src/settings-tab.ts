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
  { id: "body", label: "正文与列表", description: "普通正文、空行和列表间距设置。", module: "body", reset: "body" },
  { id: "headings", label: "正文标题 H1–H6", description: "正文标题各级别的行高和上下边距。", module: "headings", reset: "headings" },
  { id: "headingDecoration", label: "标题伪元素", description: "主题标题装饰线的位置、尺寸和偏移。", module: "headings", reset: "headingDecoration" },
  { id: "callout", label: "Callout", description: "Callout 卡片外观、标题栏、正文及内部元素排版。", module: "callouts", reset: "callout" },
  { id: "blockquote", label: "引用块", description: "引用块内部正文、表格和各级标题排版。", module: "blockquotes", reset: "blockquote" },
  { id: "image", label: "图片", description: "正文图片的尺寸、圆角与边框外观。", module: "images", reset: "image" },
  { id: "mermaid", label: "Mermaid 图表", description: "纵向与横向 Mermaid 图表的自适应宽度规则。", module: "mermaid", reset: "mermaid" },
  { id: "table", label: "正文表格", description: "正文表格的单元格内边距、框线、圆角和外边距。", module: "tables", reset: "table" },
  { id: "codeBlock", label: "代码块", description: "代码块行高及模式相关的上下边距设置。", module: "codeBlocks", reset: "codeBlock" },
  { id: "headingGap", label: "标题后首元素", description: "标题后接正文、列表、代码块等元素时的间距补偿。", module: "headingGaps", reset: "headingGap" },
  { id: "canvasReset", label: "Canvas 样式重置", description: "阅读模式 Canvas 白板卡片的紧凑布局重置。", module: "canvasReset", reset: "canvasReset" },
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
  private activeHeadingLevelByContext: Record<string, HeadingLevel> = {
    headings: "h1",
    headingDecoration: "h1",
    callout: "h1",
    blockquote: "h1",
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
    const isModuleEnabled = this.plugin.settings[this.mode].modules[tab.module];
    const contentContainer = container.createDiv({
      cls: `rl-settings-content-wrapper ${isModuleEnabled ? "" : "rl-settings-disabled"}`,
    });

    const group = container.createDiv({ cls: "setting-group rl-settings-group rl-settings-module-group" });
    container.insertBefore(group, contentContainer);

    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-module-card" });

    new Setting(card)
      .setName(tab.label)
      .setDesc(tab.description)
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(isModuleEnabled).onChange((value) => {
          this.plugin.setModule(this.mode, tab.module, value);
          contentContainer.classList.toggle("rl-settings-disabled", !value);
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

    return contentContainer;
  }

  private createGroupCard(container: HTMLElement, title?: string, description?: string): HTMLElement {
    const group = container.createDiv({ cls: "setting-group rl-settings-group" });
    if (title !== undefined) {
      const header = group.createDiv({ cls: "rl-settings-group-header" });
      header.createEl("h4", { text: title, cls: "rl-settings-group-title" });
      if (description !== undefined) {
        header.createDiv({ cls: "rl-settings-group-description", text: description });
      }
    }
    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-fields" });
    return card;
  }

  private renderHeadingLevelPills(
    container: HTMLElement,
    contextKey: string,
    onLevelChange: (level: HeadingLevel) => void,
  ): void {
    const currentLevel = this.activeHeadingLevelByContext[contextKey] ?? "h1";
    const pillBar = container.createDiv({ cls: "rl-settings-pill-bar" });
    for (const level of HEADING_LEVELS) {
      const pill = pillBar.createEl("button", {
        cls: `rl-settings-pill ${level === currentLevel ? "rl-settings-pill-active" : ""}`,
        text: HEADING_LABELS[level],
        attr: { type: "button" },
      });
      pill.addEventListener("click", () => {
        this.activeHeadingLevelByContext[contextKey] = level;
        pillBar.querySelectorAll(".rl-settings-pill").forEach((btn, idx) => {
          btn.classList.toggle("rl-settings-pill-active", HEADING_LEVELS[idx] === level);
        });
        onLevelChange(level);
      });
    }
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
    const content = this.createModuleCard(container, tab);

    const bodyCard = this.createGroupCard(content, "正文排版", "普通正文行高、段落或空行高度设置。");
    this.addNumber(bodyCard, ["body", "lineHeight"], "正文行高", "普通正文文本的行高。");
    if (this.mode === "edit") {
      this.addNumber(bodyCard, ["body", "emptyLineHeightEm"], "空行高度", "CodeMirror 源码视图中空白行的高度。");
    } else {
      this.addNumber(bodyCard, ["body", "paragraphSpacingEm"], "段落间距", "阅读视图中普通段落之间的垂直间距。");
    }

    const listCard = this.createGroupCard(content, "列表间距", "普通列表整体顶部与底部的间距。");
    this.addNumber(listCard, ["body", "listStartEm"], "列表上间距", "正文列表与前方内容的顶部间距。");
    this.addNumber(listCard, ["body", "listEndEm"], "列表下间距", "正文列表与后方内容的底部间距。");
  }

  private renderHeadingsSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    if (this.mode === "edit") {
      const firstHeadingCard = this.createGroupCard(content, "文档首行", "仅在文档第一行即为标题时的专项补偿。");
      this.addNumber(firstHeadingCard, ["headingDecoration", "firstHeadingPaddingTopPx"], "首行标题顶部补偿", "文档第一行是标题时的顶部微调补偿。");
    }

    const card = this.createGroupCard(content, "各级标题排版与间距", "切换下方 H1–H6 胶囊，快速微调对应级别标题的行高与上下外边距。");
    const pillContainer = card.createDiv({ cls: "rl-settings-pill-container" });
    const fieldsContainer = card.createDiv({ cls: "rl-settings-heading-fields" });

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "标题文字行高。");
      this.addNumber(fieldsContainer, ["headings", level, "topEm"], `${HEADING_LABELS[level]} 上间距`, "标题顶部间距。");
      this.addNumber(fieldsContainer, ["headings", level, "bottomEm"], `${HEADING_LABELS[level]} 下间距`, "标题底部间距。");
    };

    this.renderHeadingLevelPills(pillContainer, "headings", (level) => {
      renderLevelFields(level);
    });

    const activeLevel = this.activeHeadingLevelByContext["headings"] ?? "h1";
    renderLevelFields(activeLevel);
  }

  private renderHeadingDecorationSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const appearanceCard = this.createGroupCard(content, "位置与外观", "调整主题已经提供的标题 ::before 伪元素装饰线；没有标题伪元素的主题不会新增装饰。");
    this.addNumber(appearanceCard, ["headingDecoration", "leftPx"], "水平偏移", "伪元素相对标题文字的水平偏移位置。");
    this.addNumber(appearanceCard, ["headingDecoration", "widthPx"], "宽度", "伪元素装饰线的宽度。");
    this.addNumber(appearanceCard, ["headingDecoration", "radiusPx"], "圆角", "伪元素装饰线的圆角半径。");
    this.addNumber(appearanceCard, ["headingDecoration", "marginRightPx"], "右间距", "伪元素右侧与标题文本的距离。", { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(appearanceCard, ["headingDecoration", "firstHeadingDecorOffsetPx"], "文档首标题额外补偿", "仅在文档第一行就是标题时叠加；正值向下，负值向上。");
    }

    const card = this.createGroupCard(content, "各级标题装饰高度与垂直补偿", "切换下方 H1–H6 胶囊，微调各级标题装饰线的高度和垂直居中补偿。");
    const pillContainer = card.createDiv({ cls: "rl-settings-pill-container" });
    const fieldsContainer = card.createDiv({ cls: "rl-settings-heading-fields" });

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "decorHeightPx"], `${HEADING_LABELS[level]} 高度`, "伪元素高度。");
      this.addNumber(fieldsContainer, ["headings", level, "decorOffsetPx"], `${HEADING_LABELS[level]} 垂直补偿`, "在第一行垂直居中的基础上微调；正值向下，负值向上。");
    };

    this.renderHeadingLevelPills(pillContainer, "headingDecoration", (level) => {
      renderLevelFields(level);
    });

    const activeLevel = this.activeHeadingLevelByContext["headingDecoration"] ?? "h1";
    renderLevelFields(activeLevel);
  }

  private renderCalloutSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);

    const appearanceCard = this.createGroupCard(content, "卡片外观与外边距", "Callout 卡片的圆角以及与前后内容的距离。");
    this.addNumber(appearanceCard, ["callout", "radiusPx"], "卡片圆角", "Callout 卡片圆角半径。");
    this.addNumber(appearanceCard, ["callout", "marginTopPx"], "卡片上外边距", "Callout 与前方内容的距离。");
    this.addNumber(appearanceCard, ["callout", "marginBottomPx"], "卡片下外边距", "Callout 与后方内容的距离。");

    const paddingCard = this.createGroupCard(content, "卡片内边距", "Callout 内部各边缘与内容的内边距。");
    this.addNumber(paddingCard, ["callout", "paddingTopPx"], "卡片上内边距", "Callout 卡片顶部内边距。");
    this.addNumber(paddingCard, ["callout", "paddingBottomPx"], "卡片下内边距", "Callout 卡片底部内边距。");
    this.addNumber(paddingCard, ["callout", "paddingLeftPx"], "卡片左内边距", "Callout 卡片左侧内边距。");
    this.addNumber(paddingCard, ["callout", "paddingRightPx"], "卡片右内边距", "Callout 卡片右侧内边距。");

    const titleCard = this.createGroupCard(content, "标题栏排版与常规内边距", "Callout 标题栏文字及标准内边距。");
    this.addNumber(titleCard, ["callout", "titleLineHeight"], "标题行高", "标题栏文字行高。");
    this.addNumber(titleCard, ["callout", "titlePaddingTopEm"], "标题上内边距", "标题栏顶部内边距。");
    this.addNumber(titleCard, ["callout", "titlePaddingBottomEm"], "标题下内边距", "标题栏底部内边距；仅标题、折叠或后接标题时会自动抑制冲突空白。");
    this.addNumber(titleCard, ["callout", "titlePaddingLeftPx"], "标题左内边距", "标题栏左侧内边距。");
    this.addNumber(titleCard, ["callout", "titlePaddingRightPx"], "标题右内边距", "标题栏右侧内边距。");

    const specialTitleCard = this.createGroupCard(content, "特殊状态标题栏内边距", "仅标题状态或折叠状态下的专属内边距控制。");
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingTopEm"], "仅标题时上内边距", "Callout 只有标题时的顶部内边距。");
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingBottomEm"], "仅标题时下内边距", "Callout 只有标题时的底部内边距；独立于有内容 Callout 的卡片下内边距。");
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingTopEm"], "折叠状态上内边距", "折叠 Callout 的顶部内边距。");
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingBottomEm"], "折叠状态下内边距", "折叠 Callout 的底部内边距。");

    const bodyCard = this.createGroupCard(content, "内部正文与列表", "Callout 内部段落及列表的独立间距。");
    this.addNumber(bodyCard, ["callout", "paragraphLineHeight"], "内部正文行高", "Callout 正文行高，独立于普通正文。");
    this.addNumber(bodyCard, ["callout", "paragraphSpacingEm"], "内部段落间距", "Callout 段落间距。");
    this.addNumber(bodyCard, ["callout", "listStartEm"], "内部列表上间距", "Callout 列表顶部间距。");
    this.addNumber(bodyCard, ["callout", "listEndEm"], "内部列表下间距", "Callout 列表底部间距。");
    this.addNumber(bodyCard, ["callout", "lastListEndEm"], "末尾列表下间距", "列表是 Callout 最后元素时的底部间距。");

    this.renderImageFields(content, ["callout", "image"], "Callout 内部图片", "Callout 内部图片的尺寸和外观设置。");
    this.renderTableFields(content, ["callout", "table"], "Callout 内部表格", "Callout 内部表格的内边距、边框和间距。");
    this.renderContextHeadings(content, "callout", this.mode === "read");
  }

  private renderBlockquoteSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);

    const bodyCard = this.createGroupCard(content, "内部正文与列表", "引用块内部段落及列表的独立排版与间距。");
    this.addNumber(bodyCard, ["blockquote", "paragraphLineHeight"], "内部正文行高", "引用块正文行高，独立于普通正文。");
    this.addNumber(bodyCard, ["blockquote", "paragraphSpacingEm"], "内部段落间距", "引用块段落间距。");
    this.addNumber(bodyCard, ["blockquote", "listStartEm"], "内部列表上间距", "引用块列表顶部间距。");
    this.addNumber(bodyCard, ["blockquote", "listEndEm"], "内部列表下间距", "引用块列表底部间距。");

    this.renderTableFields(content, ["blockquote", "table"], "引用块内部表格", "引用块内部表格的内边距、边框和间距。");
    this.renderContextHeadings(content, "blockquote", false);
  }

  private renderContextHeadings(
    container: HTMLElement,
    context: "callout" | "blockquote",
    bottomUsesPx: boolean,
  ): void {
    const label = context === "callout" ? "Callout" : "引用块";
    const card = this.createGroupCard(
      container,
      `${label} 内部各级标题 (H1–H6)`,
      `切换下方 H1–H6 胶囊，微调 ${label} 内部各级标题的行高与间距。`,
    );
    const pillContainer = card.createDiv({ cls: "rl-settings-pill-container" });
    const fieldsContainer = card.createDiv({ cls: "rl-settings-heading-fields" });

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      const prefix = [context, "headings", level];
      this.addNumber(fieldsContainer, [...prefix, "lineHeight"], `${HEADING_LABELS[level]} 行高`, "内部标题行高。");
      this.addNumber(fieldsContainer, [...prefix, "topEm"], `${HEADING_LABELS[level]} 上间距`, "内部标题顶部间距。");
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(fieldsContainer, [...prefix, bottomKey], `${HEADING_LABELS[level]} 下间距`, "内部标题底部间距。");
    };

    this.renderHeadingLevelPills(pillContainer, `${context}-headings`, (level) => {
      renderLevelFields(level);
    });

    const activeLevel = this.activeHeadingLevelByContext[`${context}-headings`] ?? "h1";
    renderLevelFields(activeLevel);
  }

  private renderImageSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderImageFields(content, ["image"], "正文图片尺寸与外观", "普通正文图片的尺寸、圆角和边框设置。");
  }

  private renderImageFields(container: HTMLElement, prefix: string[], label: string, description?: string): void {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "maxWidthPct"], "最大宽度", "图片相对所在内容区域的最大宽度。");
    this.addNumber(card, [...prefix, "radiusPx"], "图片圆角", "图片圆角半径。");
    this.addNumber(card, [...prefix, "borderPx"], "图片边框", "图片边框宽度。");
  }

  private renderMermaidSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "图表自适应与宽度规则", "按 SVG 原始 viewBox 宽高比区分纵向图和普通/横向图。");
    this.addNumber(card, ["mermaid", "portraitMaxWidthPct"], "纵向图最大宽度", "纵向 Mermaid 相对所在内容区域的最大宽度；图表会水平居中。");
    this.addNumber(card, ["mermaid", "portraitAspectRatio"], "纵向判定宽高比", "SVG 原始宽度除以高度；小于或等于该值时视为纵向图。", { min: 0.05, max: 5, step: 0.05 });
    this.addNumber(card, ["mermaid", "landscapeMinWidthPx"], "横向图最小宽度", "普通或横向 Mermaid 的最小宽度；空间不足时允许横向滚动。", { min: 0, max: 4096, step: 10 });
  }

  private renderTableSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderTableFields(content, ["table"], "正文表格外观与间距", "正文表格的单元格内边距、内外部边框、圆角和上下间距。");
  }

  private renderTableFields(container: HTMLElement, prefix: string[], label: string, description?: string): void {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "cellPaddingPx"], "单元格内边距", "表格单元格内边距。");
    this.addNumber(card, [...prefix, "innerBorderPx"], "内框线宽度", "表格内部边框宽度。");
    this.addNumber(card, [...prefix, "outerBorderPx"], "外边框宽度", "表格外边框宽度。");
    this.addNumber(card, [...prefix, "radiusPx"], "表格圆角", "表格整体圆角。");
    this.addNumber(card, [...prefix, "spacingTopPx"], "表格上间距", "表格与前方内容的距离。");
    this.addNumber(card, [...prefix, "spacingBottomPx"], "表格下间距", "表格与后方内容的距离。");
  }

  private renderCodeBlockSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "代码块排版与间距", "代码块内部行高及在不同模式下的边距。");
    this.addNumber(card, ["codeBlock", "lineHeight"], "代码行高", "代码块内部行高。");
    if (this.mode === "edit") {
      this.addNumber(card, ["codeBlock", "innerSpacingEm"], "内部空行间距", "编辑模式代码块内部空行的间距。");
    } else {
      this.addNumber(card, ["codeBlock", "marginTopEm"], "代码块上间距", "阅读模式代码块顶部间距。");
      this.addNumber(card, ["codeBlock", "marginBottomEm"], "代码块下间距", "阅读模式代码块底部间距。");
    }
  }

  private renderHeadingGapSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderHeadingGapGroup(content, "body", "正文");
    this.renderHeadingGapGroup(content, "callout", "Callout");
    this.renderHeadingGapGroup(content, "blockquote", "Quote (引用块)");
  }

  private renderHeadingGapGroup(
    container: HTMLElement,
    context: "body" | "callout" | "blockquote",
    label: string,
  ): void {
    const card = this.createGroupCard(container, `${label} 内标题后首元素间距`, `${label} 内标题后接不同类型首元素时的顶部补偿间距。`);

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
        this.addNumber(card, ["headingGap", "body", key], name, description);
      }
      return;
    }

    if (this.mode === "edit") {
      this.addNumber(card, ["headingGap", context, "emptyLineEm"], "标题后空行高度", `${label} 内标题后空行的高度。`);
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
      this.addNumber(card, ["headingGap", context, key], name, description);
    }
  }

  private renderCanvasSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "Canvas 样式重置");
    card.createDiv({
      cls: "rl-settings-card-note",
      text: "启用后，Canvas 卡片会恢复紧凑的默认标题、段落、Callout、表格和图片布局。",
    });
  }
}

