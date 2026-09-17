import { getTranslator } from "./i18n";
import type { Translator } from "./i18n/core";
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
  | "headingGap";

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
  | "headingGap";

type ResetTarget = ResettableSection | "headingDecoration";

interface SettingsTabDefinition {
  id: SettingsTabId;
  label: string;
  description: string;
  module: ModuleKey;
  reset: ResetTarget;
}

interface HeadingLevelCard {
  subtabContainer: HTMLElement;
  fieldsPanel: HTMLElement;
  fieldsContainer: HTMLElement;
}

interface NumberOptions {
  unit?: "" | "em" | "px" | "%" | "ratio";
  min?: number;
  max?: number;
  step?: number;
}

function getModeLabels(t: Translator): Record<ModeKey, string> {
  return {
    edit: t("mode.edit"),
    read: t("mode.read"),
  };
}

const HEADING_LABELS: Record<HeadingLevel, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
};

function getSettingsTabs(t: Translator): readonly SettingsTabDefinition[] {
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

function inferNumberOptions(path: string[], mode: ModeKey): Required<NumberOptions> {
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

export class RefinedLayoutSettingTab extends PluginSettingTab {
  private t = getTranslator();
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
    this.t = getTranslator(this.plugin.settings.language);
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("refined-layout-settings");

    const page = containerEl.createDiv({ cls: "rl-settings-page-content" });
    this.renderHeader(page);
    this.renderSettingsTabs(page);
  }

  private renderHeader(container: HTMLElement): void {
    const header = container.createDiv({ cls: "rl-settings-header" });

    const titleRow = header.createDiv({ cls: "rl-settings-title-row" });
    const titleBox = titleRow.createDiv({ cls: "rl-settings-title-box" });
    titleBox.createEl("h2", { cls: "rl-settings-title", text: "Refined Layout" });

    const actions = titleRow.createDiv({ cls: "rl-settings-header-actions" });
    this.createHeaderButton(actions, this.t("actions.export"), this.t("actions.exportDesc"), () => {
      this.plugin.exportSettings();
    });
    this.createHeaderButton(actions, this.t("actions.import"), this.t("actions.importDesc"), () => {
      this.pickSettingsFile();
    });
    this.createHeaderButton(
      actions,
      this.t("actions.resetAll"),
      this.t("actions.resetAllDesc"),
      () => {
        this.plugin.resetAll();
        this.display();
      },
      "rl-settings-header-danger",
    );

    new Setting(header)
      .setName(this.t("language.name"))
      .setDesc(this.t("language.description"))
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            auto: this.t("language.auto"),
            "zh-CN": "简体中文",
            "zh-TW": "繁體中文",
            en: "English",
            ja: "日本語",
          })
          .setValue(this.plugin.settings.language)
          .onChange((value) => {
            this.plugin.setLanguage(value);
            this.display();
            this.containerEl.querySelector<HTMLSelectElement>(".rl-settings-language")?.focus();
          });
        dropdown.selectEl.addClass("rl-settings-language");
        dropdown.selectEl.setAttribute("aria-label", this.t("language.name"));
      });

    const modeSwitch = header.createDiv({
      cls: "rl-settings-mode-switch",
      attr: { role: "group", "aria-label": this.t("aria.mode") },
    });
    for (const mode of ["edit", "read"] as const) {
      const isActive = this.mode === mode;
      const button = modeSwitch.createEl("button", {
        cls: `rl-settings-mode-button ${isActive ? "rl-settings-mode-active" : ""}`,
        text: getModeLabels(this.t)[mode],
        attr: {
          type: "button",
          "aria-pressed": String(isActive),
        },
      });
      button.addEventListener("click", () => {
        if (this.mode === mode) {
          return;
        }
        this.mode = mode;
        this.display();
      });
    }
  }

  private createHeaderButton(
    container: HTMLElement,
    label: string,
    tooltip: string,
    onClick: () => void,
    extraClass = "",
  ): void {
    const button = container.createEl("button", {
      cls: `rl-settings-header-button ${extraClass}`.trim(),
      text: label,
      attr: { type: "button", "aria-label": tooltip },
    });
    button.addEventListener("click", onClick);
  }

  private pickSettingsFile(): void {
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
  }

  private renderSettingsTabs(container: HTMLElement): void {
    const tabs = getSettingsTabs(this.t);
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
        "aria-label": this.t("aria.sections"),
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
    }
  }

  private createModuleCard(container: HTMLElement, tab: SettingsTabDefinition): HTMLElement {
    const isModuleEnabled = this.plugin.settings[this.mode].modules[tab.module];

    const group = container.createDiv({ cls: "setting-group rl-settings-group rl-settings-module-group" });
    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-module-card" });

    const contentContainer = container.createDiv({
      cls: `rl-settings-content-wrapper ${isModuleEnabled ? "" : "rl-settings-disabled"}`,
    });

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
          .setTooltip(this.t("actions.resetSection"))
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
    const group = this.createSettingsGroup(container, title, description);
    return group.createDiv({ cls: "setting-items rl-settings-card rl-settings-fields" });
  }

  private createSettingsGroup(container: HTMLElement, title?: string, description?: string): HTMLElement {
    const group = container.createDiv({ cls: "setting-group rl-settings-group" });
    if (title !== undefined) {
      const header = group.createDiv({ cls: "rl-settings-group-header" });
      header.createEl("h4", { text: title, cls: "rl-settings-group-title" });
      if (description !== undefined) {
        header.createDiv({ cls: "rl-settings-group-description", text: description });
      }
    }
    return group;
  }

  private createHeadingLevelCard(
    container: HTMLElement,
    title: string,
    description: string,
  ): HeadingLevelCard {
    const group = this.createSettingsGroup(container, title, description);
    const subtabContainer = group.createDiv({ cls: "rl-settings-subtab-container" });
    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-heading-fields-card" });
    const fieldsContainer = card.createDiv({ cls: "rl-settings-heading-fields" });
    return { subtabContainer, fieldsPanel: card, fieldsContainer };
  }

  private renderHeadingLevelTabs(
    container: HTMLElement,
    contextKey: string,
    panel: HTMLElement,
    onLevelChange: (level: HeadingLevel) => void,
  ): void {
    const currentLevel = this.activeHeadingLevelByContext[contextKey] ?? "h1";
    const idBase = `refined-layout-settings-${this.mode}-${contextKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const panelId = `${idBase}-panel`;
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");

    const nav = container.createEl("nav", {
      cls: "rl-settings-subtab-nav",
      attr: {
        "aria-label": this.t("aria.headingLevel"),
        role: "tablist",
        "aria-orientation": "horizontal",
      },
    });
    const buttons: HTMLButtonElement[] = [];

    const activateLevel = (level: HeadingLevel, focusButton = false): void => {
      this.activeHeadingLevelByContext[contextKey] = level;
      const activeButtonId = `${idBase}-tab-${level}`;
      panel.setAttribute("aria-labelledby", activeButtonId);
      HEADING_LEVELS.forEach((candidate, index) => {
        const button = buttons[index];
        if (button === undefined) {
          throw new Error(`Heading level tab DOM is incomplete for ${candidate}`);
        }
        const isActive = candidate === level;
        button.classList.toggle("rl-settings-tab-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
        if (focusButton && isActive) {
          button.focus();
        }
      });
      onLevelChange(level);
    };

    for (const level of HEADING_LEVELS) {
      const button = nav.createEl("button", {
        cls: `rl-settings-subtab-button ${level === currentLevel ? "rl-settings-tab-active" : ""}`,
        text: HEADING_LABELS[level],
        attr: {
          id: `${idBase}-tab-${level}`,
          type: "button",
          role: "tab",
          "aria-selected": String(level === currentLevel),
          "aria-controls": panelId,
        },
      });
      button.tabIndex = level === currentLevel ? 0 : -1;
      buttons.push(button);
      button.addEventListener("click", () => {
        activateLevel(level);
      });
      button.addEventListener("keydown", (event: KeyboardEvent) => {
        const currentIndex = HEADING_LEVELS.indexOf(level);
        let targetIndex: number;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            targetIndex = (currentIndex + 1) % HEADING_LEVELS.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            targetIndex = (currentIndex - 1 + HEADING_LEVELS.length) % HEADING_LEVELS.length;
            break;
          case "Home":
            targetIndex = 0;
            break;
          case "End":
            targetIndex = HEADING_LEVELS.length - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        const targetLevel = HEADING_LEVELS[targetIndex];
        if (targetLevel === undefined) {
          throw new Error(`Heading level tab target is missing at index ${targetIndex}`);
        }
        activateLevel(targetLevel, true);
      });
    }

    activateLevel(currentLevel);
  }

  private addNumber(
    container: HTMLElement,
    path: string[],
    name: string,
    description: string,
    options: NumberOptions = {},
  ): void {
    const inferred = inferNumberOptions(path, this.mode);
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
      setting.controlEl.createSpan({ cls: "rl-settings-unit", text: config.unit === "ratio" ? this.t("unit.ratio") : config.unit });
    }
  }

  private renderBodySection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);

    const bodyCard = this.createGroupCard(content, this.t("body.group"), this.t("body.groupDesc"));
    this.addNumber(bodyCard, ["body", "lineHeight"], this.t("body.lineHeight"), this.t("body.lineHeightDesc"));
    if (this.mode === "edit") {
      this.addNumber(bodyCard, ["body", "emptyLineHeightEm"], this.t("body.emptyLine"), this.t("body.emptyLineDesc"));
    } else {
      this.addNumber(bodyCard, ["body", "paragraphSpacingEm"], this.t("body.paragraphSpacing"), this.t("body.paragraphSpacingDesc"));
    }

    const listCard = this.createGroupCard(content, this.t("list.group"), this.t("list.groupDesc"));
    this.addNumber(listCard, ["body", "listItemStartEm"], this.t("list.itemTop"), this.t("body.listItemTopDesc"));
    this.addNumber(listCard, ["body", "listItemEndEm"], this.t("list.itemBottom"), this.t("body.listItemBottomDesc"));
    this.addNumber(listCard, ["body", "listBlockStartEm"], this.t("list.blockTop"), this.t("body.listBlockTopDesc"));
    this.addNumber(listCard, ["body", "listBlockEndEm"], this.t("list.blockBottom"), this.t("body.listBlockBottomDesc"));
  }

  private renderHeadingsSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    if (this.mode === "edit") {
      const firstHeadingCard = this.createGroupCard(content, this.t("headings.firstLine"), this.t("headings.firstLineDesc"));
      this.addNumber(firstHeadingCard, ["headingDecoration", "firstHeadingPaddingTopPx"], this.t("headings.firstTop"), this.t("headings.firstTopDesc"));
    }

    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      content,
      this.t("headings.group"),
      this.t("headings.groupDesc"),
    );

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "lineHeight"], this.t("headings.lineHeight", { level: HEADING_LABELS[level] }), this.t("headings.lineHeightDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "topEm"], this.t("headings.top", { level: HEADING_LABELS[level] }), this.t("headings.topDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "bottomEm"], this.t("headings.bottom", { level: HEADING_LABELS[level] }), this.t("headings.bottomDesc"));
    };

    this.renderHeadingLevelTabs(subtabContainer, "headings", fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }

  private renderHeadingDecorationSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const appearanceCard = this.createGroupCard(content, this.t("decoration.group"), this.t("decoration.groupDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "leftPx"], this.t("decoration.left"), this.t("decoration.leftDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "widthPx"], this.t("decoration.width"), this.t("decoration.widthDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "radiusPx"], this.t("decoration.radius"), this.t("decoration.radiusDesc"));
    this.addNumber(appearanceCard, ["headingDecoration", "marginRightPx"], this.t("decoration.right"), this.t("decoration.rightDesc"), { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(appearanceCard, ["headingDecoration", "firstHeadingDecorOffsetPx"], this.t("decoration.firstOffset"), this.t("decoration.firstOffsetDesc"));
    }

    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      content,
      this.t("decoration.levels"),
      this.t("decoration.levelsDesc"),
    );

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "decorHeightPx"], this.t("decoration.height", { level: HEADING_LABELS[level] }), this.t("decoration.heightDesc"));
      this.addNumber(fieldsContainer, ["headings", level, "decorOffsetPx"], this.t("decoration.offset", { level: HEADING_LABELS[level] }), this.t("decoration.offsetDesc"));
    };

    this.renderHeadingLevelTabs(subtabContainer, "headingDecoration", fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }

  private renderCalloutSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);

    const appearanceCard = this.createGroupCard(content, this.t("callout.appearance"), this.t("callout.appearanceDesc"));
    this.addNumber(appearanceCard, ["callout", "radiusPx"], this.t("callout.radius"), this.t("callout.radiusDesc"));
    this.addNumber(appearanceCard, ["callout", "marginTopPx"], this.t("callout.marginTop"), this.t("callout.marginTopDesc"));
    this.addNumber(appearanceCard, ["callout", "marginBottomPx"], this.t("callout.marginBottom"), this.t("callout.marginBottomDesc"));

    const paddingCard = this.createGroupCard(content, this.t("callout.padding"), this.t("callout.paddingDesc"));
    this.addNumber(paddingCard, ["callout", "paddingTopPx"], this.t("callout.paddingTop"), this.t("callout.paddingTopDesc"));
    this.addNumber(paddingCard, ["callout", "paddingBottomPx"], this.t("callout.paddingBottom"), this.t("callout.paddingBottomDesc"));
    this.addNumber(paddingCard, ["callout", "paddingLeftPx"], this.t("callout.paddingLeft"), this.t("callout.paddingLeftDesc"));
    this.addNumber(paddingCard, ["callout", "paddingRightPx"], this.t("callout.paddingRight"), this.t("callout.paddingRightDesc"));

    const titleCard = this.createGroupCard(content, this.t("callout.title"), this.t("callout.titleDesc"));
    this.addNumber(titleCard, ["callout", "titleLineHeight"], this.t("callout.titleLineHeight"), this.t("callout.titleLineHeightDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingTopEm"], this.t("callout.titleTop"), this.t("callout.titleTopDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingBottomEm"], this.t("callout.titleBottom"), this.t("callout.titleBottomDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingLeftPx"], this.t("callout.titleLeft"), this.t("callout.titleLeftDesc"));
    this.addNumber(titleCard, ["callout", "titlePaddingRightPx"], this.t("callout.titleRight"), this.t("callout.titleRightDesc"));

    const specialTitleCard = this.createGroupCard(content, this.t("callout.specialTitle"), this.t("callout.specialTitleDesc"));
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingTopEm"], this.t("callout.titleOnlyTop"), this.t("callout.titleOnlyTopDesc"));
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingBottomEm"], this.t("callout.titleOnlyBottom"), this.t("callout.titleOnlyBottomDesc"));
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingTopEm"], this.t("callout.collapsedTop"), this.t("callout.collapsedTopDesc"));
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingBottomEm"], this.t("callout.collapsedBottom"), this.t("callout.collapsedBottomDesc"));

    const bodyCard = this.createGroupCard(content, this.t("context.bodyGroup"), this.t("callout.bodyDesc"));
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

  private renderBlockquoteSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);

    const bodyCard = this.createGroupCard(content, this.t("context.bodyGroup"), this.t("blockquote.bodyDesc"));
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
    container: HTMLElement,
    context: "callout" | "blockquote",
    bottomUsesPx: boolean,
  ): void {
    const label = context === "callout" ? "Callout" : this.t("context.blockquote");
    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      container,
      this.t("context.headings", { context: label }),
      this.t("context.headingsDesc", { context: label }),
    );

    const renderLevelFields = (level: HeadingLevel): void => {
      fieldsContainer.empty();
      const prefix = [context, "headings", level];
      this.addNumber(fieldsContainer, [...prefix, "lineHeight"], this.t("headings.lineHeight", { level: HEADING_LABELS[level] }), this.t("context.headingLineHeightDesc"));
      this.addNumber(fieldsContainer, [...prefix, "topEm"], this.t("headings.top", { level: HEADING_LABELS[level] }), this.t("context.headingTopDesc"));
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(fieldsContainer, [...prefix, bottomKey], this.t("headings.bottom", { level: HEADING_LABELS[level] }), this.t("context.headingBottomDesc"));
    };

    this.renderHeadingLevelTabs(subtabContainer, `${context}-headings`, fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }

  private renderImageSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderImageFields(content, ["image"], this.t("image.group"), this.t("image.groupDesc"));
  }

  private renderImageFields(container: HTMLElement, prefix: string[], label: string, description?: string): void {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "maxWidthPct"], this.t("image.maxWidth"), this.t("image.maxWidthDesc"));
    this.addNumber(card, [...prefix, "radiusPx"], this.t("image.radius"), this.t("image.radiusDesc"));
    this.addNumber(card, [...prefix, "borderPx"], this.t("image.border"), this.t("image.borderDesc"));
  }

  private renderMermaidSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, this.t("mermaid.group"), this.t("mermaid.groupDesc"));
    this.addNumber(card, ["mermaid", "portraitMaxWidthPct"], this.t("mermaid.portraitWidth"), this.t("mermaid.portraitWidthDesc"));
    this.addNumber(card, ["mermaid", "portraitAspectRatio"], this.t("mermaid.portraitRatio"), this.t("mermaid.portraitRatioDesc"), { min: 0.05, max: 5, step: 0.05 });
    this.addNumber(card, ["mermaid", "landscapeMinWidthPx"], this.t("mermaid.landscapeWidth"), this.t("mermaid.landscapeWidthDesc"), { min: 0, max: 4096, step: 10 });
  }

  private renderTableSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderTableFields(content, ["table"], this.t("table.group"), this.t("table.groupDesc"));
  }

  private renderTableFields(container: HTMLElement, prefix: string[], label: string, description?: string): void {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "cellPaddingPx"], this.t("table.cellPadding"), this.t("table.cellPaddingDesc"));
    this.addNumber(card, [...prefix, "innerBorderPx"], this.t("table.innerBorder"), this.t("table.innerBorderDesc"));
    this.addNumber(card, [...prefix, "outerBorderPx"], this.t("table.outerBorder"), this.t("table.outerBorderDesc"));
    this.addNumber(card, [...prefix, "radiusPx"], this.t("table.radius"), this.t("table.radiusDesc"));
    this.addNumber(card, [...prefix, "spacingTopPx"], this.t("table.top"), this.t("table.topDesc"));
    this.addNumber(card, [...prefix, "spacingBottomPx"], this.t("table.bottom"), this.t("table.bottomDesc"));
  }

  private renderCodeBlockSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, this.t("code.group"), this.t("code.groupDesc"));
    this.addNumber(card, ["codeBlock", "lineHeight"], this.t("code.lineHeight"), this.t("code.lineHeightDesc"));
    if (this.mode === "edit") {
      this.addNumber(card, ["codeBlock", "innerSpacingEm"], this.t("code.emptyLine"), this.t("code.emptyLineDesc"));
    } else {
      this.addNumber(card, ["codeBlock", "marginTopEm"], this.t("code.top"), this.t("code.topDesc"));
      this.addNumber(card, ["codeBlock", "marginBottomEm"], this.t("code.bottom"), this.t("code.bottomDesc"));
    }
  }

  private renderHeadingGapSection(container: HTMLElement, tab: SettingsTabDefinition): void {
    const content = this.createModuleCard(container, tab);
    this.renderHeadingGapGroup(content, "body", this.t("context.body"));
    this.renderHeadingGapGroup(content, "callout", "Callout");
    this.renderHeadingGapGroup(content, "blockquote", this.t("context.quote"));
  }

  private renderHeadingGapGroup(
    container: HTMLElement,
    context: "body" | "callout" | "blockquote",
    label: string,
  ): void {
    const card = this.createGroupCard(container, this.t("gap.group", { context: label }), this.t("gap.groupDesc", { context: label }));

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
