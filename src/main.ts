import { Plugin } from "obsidian";
import {
  cloneDefaultSettings,
  mergeSettings,
  MODULE_KEYS,
  type ModeKey,
  type ModuleKey,
  type RefinedLayoutSettings,
} from "./settings";
import { RefinedLayoutSettingTab, type ResettableSection } from "./settings-tab";

const ROOT_CLASS = "refined-layout-enabled";

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

  async onload(): Promise<void> {
    this.settings = mergeSettings(await this.loadData());
    this.applySettings();
    this.addSettingTab(new RefinedLayoutSettingTab(this.app, this));
  }

  onunload(): void {
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

  resetSection(mode: ModeKey, section: ResettableSection, module: ModuleKey): void {
    const defaults = cloneDefaultSettings();
    this.settings[mode].modules[module] = defaults[mode].modules[module];
    if (section !== "canvasReset") {
      this.settings[mode][section] = structuredClone(defaults[mode][section]) as never;
    }
    if (section === "headings") {
      this.settings[mode].headingDecoration = structuredClone(defaults[mode].headingDecoration);
    }
    this.applyAndScheduleSave();
  }

  resetAll(): void {
    this.settings = cloneDefaultSettings();
    this.applyAndScheduleSave();
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
  }
}
