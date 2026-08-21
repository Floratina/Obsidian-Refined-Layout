/* Refined Layout - generated file */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => RefinedLayoutPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/settings.ts
var MODULE_KEYS = [
  "body",
  "headings",
  "callouts",
  "blockquotes",
  "images",
  "tables",
  "codeBlocks",
  "headingGaps",
  "canvasReset"
];
var EDIT_TABLE = {
  cellPaddingPx: 0.6,
  innerBorderPx: 1,
  outerBorderPx: 2,
  radiusPx: 8,
  spacingTopPx: 3.2,
  spacingBottomPx: 6
};
var READ_TABLE = {
  cellPaddingPx: 6,
  innerBorderPx: 1,
  outerBorderPx: 2,
  radiusPx: 8,
  spacingTopPx: 4,
  spacingBottomPx: 6
};
var EDIT_HEADINGS = {
  h1: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 20, decorOffsetPx: 0 },
  h2: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 19.5, decorOffsetPx: 0 },
  h3: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 19, decorOffsetPx: 0 },
  h4: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 18.5, decorOffsetPx: 0 },
  h5: { lineHeight: 1.38, topEm: 0.35, bottomEm: 35e-4, decorHeightPx: 17, decorOffsetPx: -1 },
  h6: { lineHeight: 1.36, topEm: 0.35, bottomEm: 35e-4, decorHeightPx: 16, decorOffsetPx: -1 }
};
var READ_HEADINGS = {
  h1: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 20, decorOffsetPx: -5 },
  h2: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19.5, decorOffsetPx: -5 },
  h3: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19, decorOffsetPx: -5 },
  h4: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 18.5, decorOffsetPx: -4 },
  h5: { lineHeight: 1.449, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 17, decorOffsetPx: -3 },
  h6: { lineHeight: 1.428, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 16, decorOffsetPx: -2.5 }
};
var EDIT_CALLOUT_HEADINGS = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0.35, bottomPx: 0 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0.35, bottomPx: 0 }
};
var READ_CALLOUT_HEADINGS = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 4 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 1 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: -2 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0, bottomPx: -4 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0, bottomPx: -2 }
};
var EDIT_BLOCKQUOTE_HEADINGS = {
  h1: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, bottomPx: 0 },
  h2: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, bottomPx: 0 },
  h3: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, bottomPx: 0 },
  h4: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, bottomPx: 0 },
  h5: { lineHeight: 1.38, topEm: 0.35, bottomEm: 35e-4, bottomPx: 0 },
  h6: { lineHeight: 1.36, topEm: 0.35, bottomEm: 35e-4, bottomPx: 0 }
};
var READ_BLOCKQUOTE_HEADINGS = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.2, bottomPx: 0 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0.175, bottomPx: 0 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0.14, bottomPx: 0 }
};
var ALL_MODULES = {
  body: true,
  headings: true,
  callouts: true,
  blockquotes: true,
  images: true,
  tables: true,
  codeBlocks: true,
  headingGaps: true,
  canvasReset: true
};
var DEFAULT_SETTINGS = {
  schemaVersion: 1,
  edit: {
    modules: { ...ALL_MODULES },
    body: {
      lineHeight: 1.735,
      paragraphSpacingEm: 0,
      emptyLineHeightEm: 0.5,
      listStartEm: 0,
      listEndEm: 0
    },
    headings: EDIT_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2.5,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 7.5,
      firstHeadingDecorOffsetPx: 0.5
    },
    callout: {
      radiusPx: 10,
      paddingTopPx: 12,
      paddingBottomPx: 13,
      paddingLeftPx: 18,
      paddingRightPx: 18,
      marginTopPx: 4,
      marginBottomPx: 2,
      titleLineHeight: 1.4,
      titlePaddingTopEm: 0.25,
      titlePaddingBottomEm: 0,
      titlePaddingLeftPx: 0,
      titlePaddingRightPx: 0,
      titleOnlyPaddingTopEm: 0.15,
      titleOnlyPaddingBottomEm: 0.2625,
      collapsedPaddingTopEm: 0.75,
      collapsedPaddingBottomEm: 0.9,
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.33,
      listStartEm: 0,
      listEndEm: 0,
      lastListEndEm: 0,
      headings: EDIT_CALLOUT_HEADINGS,
      table: { ...EDIT_TABLE }
    },
    blockquote: {
      paragraphLineHeight: 1.735,
      paragraphSpacingEm: 0,
      listStartEm: 0,
      listEndEm: 0,
      headings: EDIT_BLOCKQUOTE_HEADINGS,
      table: { ...EDIT_TABLE }
    },
    image: { maxWidthPct: 85, radiusPx: 8, borderPx: 2 },
    table: { ...EDIT_TABLE },
    codeBlock: {
      lineHeight: 1.62,
      innerSpacingEm: 0.2,
      marginTopEm: 0,
      marginBottomEm: 0
    },
    headingGap: {
      emptyLineEm: 0.3,
      paragraphEm: 0.3,
      listEm: 0.3,
      quoteEm: 0.3,
      codeEm: 0.3,
      tableEm: 0.3,
      imageEm: 0.3,
      calloutEm: 0.3,
      calloutParagraphPx: -3,
      calloutListPx: -5,
      calloutTablePx: -1
    }
  },
  read: {
    modules: { ...ALL_MODULES },
    body: {
      lineHeight: 1.735,
      paragraphSpacingEm: 0.5,
      emptyLineHeightEm: 0.5,
      listStartEm: 0,
      listEndEm: 0
    },
    headings: READ_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2.5,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 0,
      firstHeadingDecorOffsetPx: 0
    },
    callout: {
      radiusPx: 10,
      paddingTopPx: 12,
      paddingBottomPx: 11.05,
      paddingLeftPx: 18,
      paddingRightPx: 18,
      marginTopPx: 8,
      marginBottomPx: 9,
      titleLineHeight: 1.4,
      titlePaddingTopEm: 0.25,
      titlePaddingBottomEm: 0,
      titlePaddingLeftPx: 0,
      titlePaddingRightPx: 0,
      titleOnlyPaddingTopEm: 0.15,
      titleOnlyPaddingBottomEm: 0.4725,
      collapsedPaddingTopEm: 0.75,
      collapsedPaddingBottomEm: 0.9,
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.51,
      listStartEm: 0,
      listEndEm: 0,
      lastListEndEm: 0,
      headings: READ_CALLOUT_HEADINGS,
      table: { ...READ_TABLE }
    },
    blockquote: {
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.51,
      listStartEm: 0,
      listEndEm: 0,
      headings: READ_BLOCKQUOTE_HEADINGS,
      table: { ...READ_TABLE }
    },
    image: { maxWidthPct: 85, radiusPx: 8, borderPx: 2 },
    table: { ...READ_TABLE },
    codeBlock: {
      lineHeight: 1.35,
      innerSpacingEm: 0.2,
      marginTopEm: 0.5,
      marginBottomEm: 0.5
    },
    headingGap: {
      emptyLineEm: 0,
      paragraphEm: 0,
      listEm: 0,
      quoteEm: 0,
      codeEm: 0,
      tableEm: 0,
      imageEm: 0,
      calloutEm: 0,
      calloutParagraphPx: 0,
      calloutListPx: 6,
      calloutTablePx: 8
    }
  }
};
function mergeKnown(defaults, candidate) {
  if (typeof defaults === "number") {
    return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : defaults;
  }
  if (typeof defaults === "boolean") {
    return typeof candidate === "boolean" ? candidate : defaults;
  }
  if (typeof defaults !== "object" || defaults === null) {
    return defaults;
  }
  const source = typeof candidate === "object" && candidate !== null ? candidate : {};
  const merged = {};
  for (const [key, value] of Object.entries(defaults)) {
    merged[key] = mergeKnown(value, source[key]);
  }
  return merged;
}
function cloneDefaultSettings() {
  return structuredClone(DEFAULT_SETTINGS);
}
function mergeSettings(candidate) {
  return mergeKnown(cloneDefaultSettings(), candidate);
}

// src/main.ts
var ROOT_CLASS = "refined-layout-enabled";
function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
function cssVariableName(mode, path) {
  return `--rl-${mode}-${path.map(toKebabCase).join("-")}`;
}
function cssValue(key, value) {
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
function collectVariables(mode, source, path = [], output = /* @__PURE__ */ new Map()) {
  for (const [key, value] of Object.entries(source)) {
    if (key === "modules") {
      continue;
    }
    const nextPath = [...path, key];
    if (typeof value === "number") {
      output.set(cssVariableName(mode, nextPath), cssValue(key, value));
    } else if (typeof value === "object" && value !== null) {
      collectVariables(mode, value, nextPath, output);
    }
  }
  return output;
}
var RefinedLayoutPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.appliedProperties = /* @__PURE__ */ new Set();
    this.appliedModuleClasses = /* @__PURE__ */ new Set();
  }
  async onload() {
    this.settings = mergeSettings(await this.loadData());
    this.applySettings();
  }
  onunload() {
    this.clearAppliedStyles();
  }
  applySettings() {
    const body = document.body;
    body.classList.add(ROOT_CLASS);
    for (const className of this.appliedModuleClasses) {
      body.classList.remove(className);
    }
    this.appliedModuleClasses.clear();
    for (const mode of ["edit", "read"]) {
      for (const module2 of MODULE_KEYS) {
        if (!this.settings[mode].modules[module2]) {
          continue;
        }
        const className = `rl-${mode}-${toKebabCase(module2)}`;
        body.classList.add(className);
        this.appliedModuleClasses.add(className);
      }
    }
    const variables = /* @__PURE__ */ new Map();
    collectVariables("edit", this.settings.edit, [], variables);
    collectVariables("read", this.settings.read, [], variables);
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
  clearAppliedStyles() {
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
};
