import { Notice, Plugin } from "obsidian";
import { createBlankLineNavigation } from "./blank-line-navigation";
import { getTranslator } from "./i18n";
import { normalizeLanguagePreference } from "./i18n/language";
import { formatImportError } from "./i18n/import-error";
import { isPortraitMermaid, isPositiveFiniteNumber } from "./mermaid";
import {
  cloneDefaultSettings,
  HEADING_LEVELS,
  mergeSettings,
  MODULE_KEYS,
  parseSettingsJson,
  type ModeKey,
  type ModuleKey,
  type RefinedLayoutSettings,
} from "./settings";
import { RefinedLayoutSettingTab, type ResettableSection } from "./settings-tab";

const ROOT_CLASS = "refined-layout-enabled";
const MERMAID_PORTRAIT_CLASS = "rl-mermaid-portrait";
const MERMAID_NATURAL_WIDTH_PROPERTY = "--rl-mermaid-natural-width";
const MERMAID_SVG_SELECTOR = ".mermaid > svg";
const MERMAID_BYPASS_SELECTOR = ".block-language-dataviewjs, .canvas-wrapper, .canvas-node";

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function cssVariableName(mode: ModeKey, path: string[]): string {
  return `--rl-${mode}-${path.map(toKebabCase).join("-")}`;
}

function cssValue(key: string, value: number): string {
  if (key.endsWith("Em")) {
    return `${value}em`;
  }
  if (key.endsWith("Px")) {
    return `${value}px`;
  }
  if (key.endsWith("Pct")) {
    return `${value}%`;
  }
  return String(value);
}

function collectVariables(
  mode: ModeKey,
  source: Record<string, unknown>,
  path: string[] = [],
  output = new Map<string, string>(),
): Map<string, string> {
  for (const [key, value] of Object.entries(source)) {
    if (key === "modules") {
      continue;
    }
    const nextPath = [...path, key];
    if (typeof value === "number") {
      output.set(cssVariableName(mode, nextPath), cssValue(key, value));
    } else if (typeof value === "object" && value !== null) {
      collectVariables(mode, value as Record<string, unknown>, nextPath, output);
    }
  }
  return output;
}

function readNestedNumber(source: unknown, path: string[]): number {
  let cursor: unknown = source;
  for (const key of path) {
    if (typeof cursor !== "object" || cursor === null || !(key in cursor)) {
      throw new Error(`Unknown settings path: ${path.join(".")}`);
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }
  if (typeof cursor !== "number") {
    throw new Error(`Settings path is not numeric: ${path.join(".")}`);
  }
  return cursor;
}

function writeNestedNumber(source: unknown, path: string[], value: number): void {
  let cursor = source as Record<string, unknown>;
  for (const key of path.slice(0, -1)) {
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      throw new Error(`Unknown settings path: ${path.join(".")}`);
    }
    cursor = next as Record<string, unknown>;
  }
  const lastKey = path[path.length - 1];
  if (lastKey === undefined || typeof cursor[lastKey] !== "number") {
    throw new Error(`Settings path is not numeric: ${path.join(".")}`);
  }
  cursor[lastKey] = value;
}

export default class RefinedLayoutPlugin extends Plugin {
  settings: RefinedLayoutSettings = cloneDefaultSettings();
  private appliedProperties = new Set<string>();
  private appliedModuleClasses = new Set<string>();
  private saveTimer: number | null = null;
  private mermaidObserver: MutationObserver | null = null;
  private invalidMermaidSvgs = new WeakSet<SVGSVGElement>();
  private blankLineNavigation = createBlankLineNavigation();

  async onload(): Promise<void> {
    this.settings = mergeSettings(await this.loadData());
    this.registerEditorExtension(this.blankLineNavigation.extension);
    this.applySettings();
    this.startMermaidObserver();
    this.addSettingTab(new RefinedLayoutSettingTab(this.app, this));
  }

  onunload(): void {
    this.stopMermaidObserver();
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
      void this.saveData(this.settings);
    }
    this.clearAppliedStyles();
  }

  getNumber(mode: ModeKey, path: string[]): number {
    return readNestedNumber(this.settings[mode], path);
  }

  setNumber(mode: ModeKey, path: string[], value: number): void {
    writeNestedNumber(this.settings[mode], path, value);
    this.applyAndScheduleSave();
  }

  setModule(mode: ModeKey, module: ModuleKey, enabled: boolean): void {
    this.settings[mode].modules[module] = enabled;
    this.applyAndScheduleSave();
  }

  setLanguage(language: string): void {
    this.settings.language = normalizeLanguagePreference(language);
    this.applyAndScheduleSave();
  }

  resetSection(mode: ModeKey, section: ResettableSection, module: ModuleKey): void {
    const defaults = cloneDefaultSettings();
    this.settings[mode].modules[module] = defaults[mode].modules[module];
    if (section === "headings") {
      for (const level of HEADING_LEVELS) {
        this.settings[mode].headings[level].lineHeight = defaults[mode].headings[level].lineHeight;
        this.settings[mode].headings[level].topEm = defaults[mode].headings[level].topEm;
        this.settings[mode].headings[level].bottomEm = defaults[mode].headings[level].bottomEm;
      }
      this.settings[mode].headingDecoration.firstHeadingPaddingTopPx = defaults[mode].headingDecoration.firstHeadingPaddingTopPx;
    } else {
      this.settings[mode][section] = structuredClone(defaults[mode][section]) as never;
    }
    this.applyAndScheduleSave();
  }

  resetHeadingDecoration(mode: ModeKey): void {
    const defaults = cloneDefaultSettings();
    const firstHeadingPaddingTopPx = this.settings[mode].headingDecoration.firstHeadingPaddingTopPx;
    this.settings[mode].headingDecoration = structuredClone(defaults[mode].headingDecoration);
    this.settings[mode].headingDecoration.firstHeadingPaddingTopPx = firstHeadingPaddingTopPx;
    for (const level of HEADING_LEVELS) {
      this.settings[mode].headings[level].decorHeightPx = defaults[mode].headings[level].decorHeightPx;
      this.settings[mode].headings[level].decorOffsetPx = defaults[mode].headings[level].decorOffsetPx;
    }
    this.applyAndScheduleSave();
  }

  resetAll(): void {
    const language = this.settings.language;
    this.settings = cloneDefaultSettings();
    this.settings.language = language;
    this.applyAndScheduleSave();
  }

  exportSettings(): void {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = createEl("a");
    anchor.href = url;
    anchor.download = "refined-layout-settings.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    new Notice(getTranslator(this.settings.language)("notice.exported"));
  }

  async importSettings(file: File): Promise<boolean> {
    let json: string;
    try {
      json = await file.text();
    } catch (error) {
      console.error("[Refined Layout] Failed to read settings file.", error);
      new Notice(getTranslator(this.settings.language)("notice.readFailed"));
      return false;
    }

    let imported: RefinedLayoutSettings;
    try {
      imported = parseSettingsJson(json);
    } catch (error) {
      console.error("[Refined Layout] Invalid settings file.", error);
      new Notice(formatImportError(error, getTranslator(this.settings.language)));
      return false;
    }

    this.settings = imported;
    this.applyAndScheduleSave();
    new Notice(getTranslator(this.settings.language)("notice.imported"));
    return true;
  }

  private applyAndScheduleSave(): void {
    this.applySettings();
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData(this.settings);
    }, 150);
  }

  private applySettings(): void {
    const body = document.body;
    body.classList.add(ROOT_CLASS);

    for (const className of this.appliedModuleClasses) {
      body.classList.remove(className);
    }
    this.appliedModuleClasses.clear();

    for (const mode of ["edit", "read"] as const) {
      for (const module of MODULE_KEYS) {
        if (!this.settings[mode].modules[module]) {
          continue;
        }
        const className = `rl-${mode}-${toKebabCase(module)}`;
        body.classList.add(className);
        this.appliedModuleClasses.add(className);
      }
    }

    const variables = new Map<string, string>();
    collectVariables("edit", this.settings.edit as unknown as Record<string, unknown>, [], variables);
    collectVariables("read", this.settings.read as unknown as Record<string, unknown>, [], variables);

    for (const property of this.appliedProperties) {
      if (!variables.has(property)) {
        body.style.removeProperty(property);
      }
    }
    for (const [property, value] of variables) {
      body.style.setProperty(property, value);
    }
    this.appliedProperties = new Set(variables.keys());
    this.refreshMermaidClassifications();
    this.blankLineNavigation.requestMeasure();
  }

  private startMermaidObserver(): void {
    this.mermaidObserver = new MutationObserver((records) => {
      for (const record of records) {
        // Mermaid can finish its viewBox after inserting the SVG into the page.
        if (record.type === "attributes" && record.target.instanceOf(Element)
          && record.target.matches(MERMAID_SVG_SELECTOR)) {
          this.classifyMermaid(record.target as SVGSVGElement);
        }
        for (const node of record.addedNodes) {
          if (!node.instanceOf(Element)) {
            continue;
          }
          if (node.matches(MERMAID_SVG_SELECTOR)) {
            this.classifyMermaid(node as SVGSVGElement);
          }
          for (const svg of node.querySelectorAll<SVGSVGElement>(MERMAID_SVG_SELECTOR)) {
            this.classifyMermaid(svg);
          }
        }
      }
    });
    this.mermaidObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["viewBox"],
    });
    this.refreshMermaidClassifications();
  }

  private stopMermaidObserver(): void {
    this.mermaidObserver?.disconnect();
    this.mermaidObserver = null;
  }

  private refreshMermaidClassifications(): void {
    for (const svg of document.querySelectorAll<SVGSVGElement>(MERMAID_SVG_SELECTOR)) {
      this.classifyMermaid(svg);
    }
  }

  private classifyMermaid(svg: SVGSVGElement): void {
    const container = svg.parentElement;
    if (container === null || !container.classList.contains("mermaid")) {
      throw new Error("Mermaid SVG is missing its .mermaid parent container");
    }

    if (container.closest(MERMAID_BYPASS_SELECTOR) !== null) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      svg.style.removeProperty(MERMAID_NATURAL_WIDTH_PROPERTY);
      return;
    }

    const mode: ModeKey | null = container.closest(".markdown-source-view.mod-cm6") !== null
      ? "edit"
      : container.closest(".markdown-preview-view.markdown-rendered") !== null
        ? "read"
        : null;
    if (mode === null || !this.settings[mode].modules.mermaid) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      svg.style.removeProperty(MERMAID_NATURAL_WIDTH_PROPERTY);
      return;
    }

    const { width, height } = svg.viewBox.baseVal;
    const portraitAspectRatio = this.settings[mode].mermaid.portraitAspectRatio;
    if (
      !isPositiveFiniteNumber(width)
      || !isPositiveFiniteNumber(height)
      || !isPositiveFiniteNumber(portraitAspectRatio)
    ) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      svg.style.removeProperty(MERMAID_NATURAL_WIDTH_PROPERTY);
      if (!this.invalidMermaidSvgs.has(svg)) {
        console.error(
          "[Refined Layout] Mermaid SVG has an invalid viewBox or portrait aspect-ratio setting; diagram left unclassified.",
          { width, height, portraitAspectRatio, svg },
        );
        this.invalidMermaidSvgs.add(svg);
      }
      return;
    }

    this.invalidMermaidSvgs.delete(svg);
    // Use the unscaled SVG coordinate width, never its already-scaled DOM width.
    svg.style.setProperty(MERMAID_NATURAL_WIDTH_PROPERTY, `${width}px`);
    container.classList.toggle(
      MERMAID_PORTRAIT_CLASS,
      isPortraitMermaid(width, height, portraitAspectRatio),
    );
  }

  private clearAppliedStyles(): void {
    const body = document.body;
    body.classList.remove(ROOT_CLASS);
    for (const className of this.appliedModuleClasses) {
      body.classList.remove(className);
    }
    for (const property of this.appliedProperties) {
      body.style.removeProperty(property);
    }
    this.appliedModuleClasses.clear();
    this.appliedProperties.clear();
    for (const svg of document.querySelectorAll<SVGSVGElement>(MERMAID_SVG_SELECTOR)) {
      svg.style.removeProperty(MERMAID_NATURAL_WIDTH_PROPERTY);
    }
    for (const container of document.querySelectorAll(`.mermaid.${MERMAID_PORTRAIT_CLASS}`)) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
    }
    this.blankLineNavigation.requestMeasure();
  }
}
