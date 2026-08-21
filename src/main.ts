import { Plugin } from "obsidian";
import {
  mergeSettings,
  MODULE_KEYS,
  type ModeKey,
  type RefinedLayoutSettings,
} from "./settings";

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

export default class RefinedLayoutPlugin extends Plugin {
  settings!: RefinedLayoutSettings;
  private appliedProperties = new Set<string>();
  private appliedModuleClasses = new Set<string>();

  async onload(): Promise<void> {
    this.settings = mergeSettings(await this.loadData());
    this.applySettings();
  }

  onunload(): void {
    this.clearAppliedStyles();
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
