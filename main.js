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
var import_obsidian2 = require("obsidian");

// src/mermaid.ts
function isPositiveFiniteNumber(value) {
  return Number.isFinite(value) && value > 0;
}
function isPortraitMermaid(width, height, portraitAspectRatio) {
  if (!isPositiveFiniteNumber(width) || !isPositiveFiniteNumber(height)) {
    throw new RangeError(`Mermaid viewBox dimensions must be positive finite numbers: ${width} x ${height}`);
  }
  if (!isPositiveFiniteNumber(portraitAspectRatio)) {
    throw new RangeError(`Mermaid portrait aspect ratio must be a positive finite number: ${portraitAspectRatio}`);
  }
  return width / height <= portraitAspectRatio;
}

// src/settings.ts
var MODE_KEYS = ["edit", "read"];
var MODULE_KEYS = [
  "body",
  "headings",
  "callouts",
  "blockquotes",
  "images",
  "mermaid",
  "tables",
  "codeBlocks",
  "headingGaps",
  "canvasReset"
];
var HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"];
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
var EDIT_IMAGE = { maxWidthPct: 85, radiusPx: 8, borderPx: 2 };
var READ_IMAGE = { maxWidthPct: 85, radiusPx: 8, borderPx: 2 };
var EDIT_HEADINGS = {
  h1: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 20, decorOffsetPx: 0 },
  h2: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 19.5, decorOffsetPx: 0 },
  h3: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 19, decorOffsetPx: 0 },
  h4: { lineHeight: 1.4, topEm: 0.4, bottomEm: 4e-3, decorHeightPx: 18.5, decorOffsetPx: 0 },
  h5: { lineHeight: 1.38, topEm: 0.35, bottomEm: 35e-4, decorHeightPx: 17, decorOffsetPx: 0 },
  h6: { lineHeight: 1.36, topEm: 0.35, bottomEm: 35e-4, decorHeightPx: 16, decorOffsetPx: 0.5 }
};
var READ_HEADINGS = {
  h1: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 20, decorOffsetPx: 0 },
  h2: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19.5, decorOffsetPx: 0 },
  h3: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19, decorOffsetPx: 0 },
  h4: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 18.5, decorOffsetPx: 0 },
  h5: { lineHeight: 1.449, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 17, decorOffsetPx: 0 },
  h6: { lineHeight: 1.428, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 16, decorOffsetPx: 0.5 }
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
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 8 },
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
  mermaid: true,
  tables: true,
  codeBlocks: true,
  headingGaps: true,
  canvasReset: true
};
var DEFAULT_SETTINGS = {
  schemaVersion: 3,
  edit: {
    modules: { ...ALL_MODULES },
    body: {
      lineHeight: 1.735,
      paragraphSpacingEm: 0,
      emptyLineHeightEm: 0.5,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0
    },
    headings: EDIT_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 7.5,
      firstHeadingDecorOffsetPx: 0.5
    },
    callout: {
      radiusPx: 10,
      paddingTopPx: 12,
      paddingBottomPx: 7,
      paddingLeftPx: 18,
      paddingRightPx: 18,
      marginTopPx: 4,
      marginBottomPx: 2,
      titleLineHeight: 1.4,
      titlePaddingTopEm: 0.15,
      titlePaddingBottomEm: 0.35,
      titlePaddingLeftPx: 0,
      titlePaddingRightPx: 0,
      titleOnlyPaddingTopEm: 0.05,
      titleOnlyPaddingBottomEm: 0.4,
      collapsedPaddingTopEm: 0.75,
      collapsedPaddingBottomEm: 0.95,
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.33,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      lastListEndEm: 0,
      headings: EDIT_CALLOUT_HEADINGS,
      image: { ...EDIT_IMAGE },
      table: { ...EDIT_TABLE, cellPaddingPx: 8 }
    },
    blockquote: {
      paragraphLineHeight: 1.735,
      paragraphSpacingEm: 0,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      headings: EDIT_BLOCKQUOTE_HEADINGS,
      table: { ...EDIT_TABLE }
    },
    image: { ...EDIT_IMAGE },
    mermaid: {
      portraitMaxWidthPct: 35,
      portraitAspectRatio: 0.75,
      landscapeMinWidthPx: 450
    },
    table: { ...EDIT_TABLE },
    codeBlock: {
      lineHeight: 1.62,
      innerSpacingEm: 0.2,
      marginTopEm: 0,
      marginBottomEm: 0
    },
    headingGap: {
      body: {
        emptyLineEm: 0.3,
        paragraphEm: 0.3,
        listEm: 0.3,
        quoteEm: 0.3,
        codeEm: 0.3,
        tableEm: 0.3,
        imageEm: 0.3,
        calloutEm: 0.3
      },
      callout: {
        emptyLineEm: 0,
        paragraphPx: -3,
        listPx: -5,
        quotePx: 0,
        codePx: 0,
        tablePx: -1,
        imagePx: 0,
        calloutPx: 0
      },
      blockquote: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 0,
        quotePx: 0,
        codePx: 0,
        tablePx: 0,
        imagePx: 0,
        calloutPx: 0
      }
    }
  },
  read: {
    modules: { ...ALL_MODULES },
    body: {
      lineHeight: 1.735,
      paragraphSpacingEm: 0.5,
      emptyLineHeightEm: 0.5,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0
    },
    headings: READ_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 0,
      firstHeadingDecorOffsetPx: 0
    },
    callout: {
      radiusPx: 10,
      paddingTopPx: 12,
      paddingBottomPx: 5,
      paddingLeftPx: 18,
      paddingRightPx: 18,
      marginTopPx: 10,
      marginBottomPx: 9,
      titleLineHeight: 1.4,
      titlePaddingTopEm: 0.25,
      titlePaddingBottomEm: 0.55,
      titlePaddingLeftPx: 0,
      titlePaddingRightPx: 0,
      titleOnlyPaddingTopEm: 0.15,
      titleOnlyPaddingBottomEm: 0.4725,
      collapsedPaddingTopEm: 0.75,
      collapsedPaddingBottomEm: 0.9,
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.51,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      lastListEndEm: 0,
      headings: READ_CALLOUT_HEADINGS,
      image: { ...READ_IMAGE },
      table: { ...READ_TABLE }
    },
    blockquote: {
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.51,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      headings: READ_BLOCKQUOTE_HEADINGS,
      table: { ...READ_TABLE }
    },
    image: { ...READ_IMAGE },
    mermaid: {
      portraitMaxWidthPct: 35,
      portraitAspectRatio: 0.75,
      landscapeMinWidthPx: 450
    },
    table: { ...READ_TABLE },
    codeBlock: {
      lineHeight: 1.35,
      innerSpacingEm: 0.2,
      marginTopEm: 0.5,
      marginBottomEm: 0.5
    },
    headingGap: {
      body: {
        emptyLineEm: 0,
        paragraphEm: 0,
        listEm: 0,
        quoteEm: 0,
        codeEm: 0,
        tableEm: 0,
        imageEm: 0,
        calloutEm: 0
      },
      callout: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 6,
        quotePx: 0,
        codePx: 0,
        tablePx: 8,
        imagePx: 0,
        calloutPx: 0
      },
      blockquote: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 0,
        quotePx: 0,
        codePx: 0,
        tablePx: 0,
        imagePx: 0,
        calloutPx: 0
      }
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
function migrateV1ToV2(source) {
  for (const mode of MODE_KEYS) {
    const modeSettings = source[mode];
    if (typeof modeSettings !== "object" || modeSettings === null) {
      continue;
    }
    const modeRecord = modeSettings;
    const legacyGap = modeRecord.headingGap;
    if (typeof legacyGap !== "object" || legacyGap === null) {
      continue;
    }
    const gap = legacyGap;
    const body = {
      emptyLineEm: gap.emptyLineEm,
      paragraphEm: gap.paragraphEm,
      listEm: gap.listEm,
      quoteEm: gap.quoteEm,
      codeEm: gap.codeEm,
      tableEm: gap.tableEm,
      imageEm: gap.imageEm,
      calloutEm: gap.calloutEm
    };
    const callout = {
      emptyLineEm: 0,
      paragraphPx: gap.calloutParagraphPx,
      listPx: gap.calloutListPx,
      quotePx: 0,
      codePx: 0,
      tablePx: gap.calloutTablePx,
      imagePx: 0,
      calloutPx: 0
    };
    const blockquote = {
      emptyLineEm: 0,
      paragraphPx: 0,
      listPx: 0,
      quotePx: 0,
      codePx: 0,
      tablePx: 0,
      imagePx: 0,
      calloutPx: 0
    };
    modeRecord.headingGap = { body, callout, blockquote };
  }
  source.schemaVersion = 2;
  return source;
}
function migrateV2ToV3(source) {
  const ITEM_LEVEL_CONTEXTS = {
    edit: ["body", "blockquote"],
    read: []
  };
  for (const mode of MODE_KEYS) {
    const modeSettings = source[mode];
    if (typeof modeSettings !== "object" || modeSettings === null) {
      continue;
    }
    const modeRecord = modeSettings;
    for (const context of ["body", "callout", "blockquote"]) {
      const contextSettings = modeRecord[context];
      if (typeof contextSettings !== "object" || contextSettings === null) {
        continue;
      }
      const contextRecord = contextSettings;
      const legacyStart = contextRecord.listStartEm;
      const legacyEnd = contextRecord.listEndEm;
      delete contextRecord.listStartEm;
      delete contextRecord.listEndEm;
      contextRecord.listBlockStartEm = legacyStart;
      contextRecord.listBlockEndEm = legacyEnd;
      const drovesItems = ITEM_LEVEL_CONTEXTS[mode].includes(context);
      contextRecord.listItemStartEm = drovesItems ? legacyStart : 0;
      contextRecord.listItemEndEm = drovesItems ? legacyEnd : 0;
    }
  }
  source.schemaVersion = 3;
  return source;
}
function migrateSettings(candidate) {
  if (typeof candidate !== "object" || candidate === null) {
    return candidate;
  }
  let source = structuredClone(candidate);
  if (source.schemaVersion === 1) {
    source = migrateV1ToV2(source);
  }
  if (source.schemaVersion === 2) {
    source = migrateV2ToV3(source);
  }
  return source;
}
function mergeSettings(candidate) {
  return mergeKnown(cloneDefaultSettings(), migrateSettings(candidate));
}
function parseSettingsJson(json) {
  const candidate = JSON.parse(json);
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    throw new Error("\u914D\u7F6E\u6587\u4EF6\u6839\u8282\u70B9\u5FC5\u987B\u662F\u5BF9\u8C61");
  }
  const schemaVersion = candidate.schemaVersion;
  if (schemaVersion !== 1 && schemaVersion !== 2 && schemaVersion !== 3) {
    throw new Error("\u914D\u7F6E\u6587\u4EF6\u7684 schemaVersion \u5FC5\u987B\u662F 1\u30012 \u6216 3");
  }
  return mergeSettings(candidate);
}

// src/settings-tab.ts
var import_obsidian = require("obsidian");
var MODE_LABELS = {
  edit: "\u7F16\u8F91\u6A21\u5F0F",
  read: "\u9605\u8BFB\u6A21\u5F0F"
};
var HEADING_LABELS = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6"
};
var SETTINGS_TABS = [
  { id: "body", label: "\u6B63\u6587\u4E0E\u5217\u8868", description: "\u666E\u901A\u6B63\u6587\u3001\u7A7A\u884C\u548C\u5217\u8868\u95F4\u8DDD\u8BBE\u7F6E\u3002", module: "body", reset: "body" },
  { id: "headings", label: "\u6B63\u6587\u6807\u9898 H1\u2013H6", description: "\u6B63\u6587\u6807\u9898\u5404\u7EA7\u522B\u7684\u884C\u9AD8\u548C\u4E0A\u4E0B\u8FB9\u8DDD\u3002", module: "headings", reset: "headings" },
  { id: "headingDecoration", label: "\u6807\u9898\u4F2A\u5143\u7D20", description: "\u4E3B\u9898\u6807\u9898\u88C5\u9970\u7EBF\u7684\u4F4D\u7F6E\u3001\u5C3A\u5BF8\u548C\u504F\u79FB\u3002", module: "headings", reset: "headingDecoration" },
  { id: "callout", label: "Callout", description: "Callout \u5361\u7247\u5916\u89C2\u3001\u6807\u9898\u680F\u3001\u6B63\u6587\u53CA\u5185\u90E8\u5143\u7D20\u6392\u7248\u3002", module: "callouts", reset: "callout" },
  { id: "blockquote", label: "\u5F15\u7528\u5757", description: "\u5F15\u7528\u5757\u5185\u90E8\u6B63\u6587\u3001\u8868\u683C\u548C\u5404\u7EA7\u6807\u9898\u6392\u7248\u3002", module: "blockquotes", reset: "blockquote" },
  { id: "image", label: "\u56FE\u7247", description: "\u6B63\u6587\u56FE\u7247\u7684\u5C3A\u5BF8\u3001\u5706\u89D2\u4E0E\u8FB9\u6846\u5916\u89C2\u3002", module: "images", reset: "image" },
  { id: "mermaid", label: "Mermaid \u56FE\u8868", description: "\u7EB5\u5411\u4E0E\u6A2A\u5411 Mermaid \u56FE\u8868\u7684\u81EA\u9002\u5E94\u5BBD\u5EA6\u89C4\u5219\u3002", module: "mermaid", reset: "mermaid" },
  { id: "table", label: "\u6B63\u6587\u8868\u683C", description: "\u6B63\u6587\u8868\u683C\u7684\u5355\u5143\u683C\u5185\u8FB9\u8DDD\u3001\u6846\u7EBF\u3001\u5706\u89D2\u548C\u5916\u8FB9\u8DDD\u3002", module: "tables", reset: "table" },
  { id: "codeBlock", label: "\u4EE3\u7801\u5757", description: "\u4EE3\u7801\u5757\u884C\u9AD8\u53CA\u6A21\u5F0F\u76F8\u5173\u7684\u4E0A\u4E0B\u8FB9\u8DDD\u8BBE\u7F6E\u3002", module: "codeBlocks", reset: "codeBlock" },
  { id: "headingGap", label: "\u6807\u9898\u540E\u9996\u5143\u7D20", description: "\u6807\u9898\u540E\u63A5\u6B63\u6587\u3001\u5217\u8868\u3001\u4EE3\u7801\u5757\u7B49\u5143\u7D20\u65F6\u7684\u95F4\u8DDD\u8865\u507F\u3002", module: "headingGaps", reset: "headingGap" },
  { id: "canvasReset", label: "Canvas \u6837\u5F0F\u91CD\u7F6E", description: "\u9605\u8BFB\u6A21\u5F0F Canvas \u767D\u677F\u5361\u7247\u7684\u7D27\u51D1\u5E03\u5C40\u91CD\u7F6E\u3002", module: "canvasReset", reset: "canvasReset" }
];
function inferNumberOptions(path, mode) {
  const key = path[path.length - 1] ?? "";
  const joined = path.join(".").toLowerCase();
  const unit = key.endsWith("Em") ? "em" : key.endsWith("Px") ? "px" : key.endsWith("Pct") ? "%" : "";
  if (unit === "%") {
    return { unit, min: 10, max: 100, step: 1 };
  }
  if (unit === "" && key.toLowerCase().includes("lineheight")) {
    return { unit: "\u500D", min: 0.5, max: 3, step: 0.01 };
  }
  const isSourceViewPadding = mode === "edit" && /^(?:body|blockquote)\.list/.test(joined);
  const allowsNegative = !isSourceViewPadding && (joined.includes("margin") || joined.includes("offset") || joined.includes("headinggap") || joined.includes("list") || key === "topEm" || key === "bottomEm" || key === "bottomPx" || key === "leftPx");
  const isSize = joined.includes("radius") || joined.includes("border") || joined.includes("width") || joined.includes("height") || joined.includes("padding");
  if (unit === "em") {
    return { unit, min: allowsNegative ? -5 : 0, max: 10, step: 0.01 };
  }
  if (unit === "px") {
    return {
      unit,
      min: allowsNegative ? -64 : 0,
      max: isSize ? 128 : 256,
      step: 0.5
    };
  }
  return { unit, min: allowsNegative ? -10 : 0, max: 100, step: 0.01 };
}
var RefinedLayoutSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.mode = "edit";
    this.activeTabByMode = {
      edit: "body",
      read: "body"
    };
    this.activeHeadingLevelByContext = {
      headings: "h1",
      headingDecoration: "h1",
      callout: "h1",
      blockquote: "h1"
    };
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("refined-layout-settings");
    const page = containerEl.createDiv({ cls: "rl-settings-page-content" });
    this.renderHeader(page);
    this.renderSettingsTabs(page);
  }
  renderHeader(container) {
    const header = container.createDiv({ cls: "rl-settings-header" });
    const titleRow = header.createDiv({ cls: "rl-settings-title-row" });
    const titleBox = titleRow.createDiv({ cls: "rl-settings-title-box" });
    titleBox.createEl("h2", { cls: "rl-settings-title", text: "Refined Layout" });
    titleBox.createDiv({
      cls: "rl-settings-subtitle",
      text: "\u7F16\u8F91\u6A21\u5F0F\u4E0E\u9605\u8BFB\u6A21\u5F0F\u62E5\u6709\u5404\u81EA\u7684\u6A21\u5757\u5F00\u5173\u548C\u6392\u7248\u53C2\u6570\uFF0C\u4E92\u4E0D\u5F71\u54CD\u3002"
    });
    const actions = titleRow.createDiv({ cls: "rl-settings-header-actions" });
    this.createHeaderButton(actions, "\u5BFC\u51FA\u914D\u7F6E", "\u628A\u5F53\u524D\u7F16\u8F91\u548C\u9605\u8BFB\u4E24\u5957\u8BBE\u7F6E\u5BFC\u51FA\u4E3A JSON \u6587\u4EF6\u3002", () => {
      this.plugin.exportSettings();
    });
    this.createHeaderButton(actions, "\u5BFC\u5165\u914D\u7F6E", "\u4ECE JSON \u6587\u4EF6\u5BFC\u5165\u8BBE\u7F6E\uFF0C\u5BFC\u5165\u6210\u529F\u540E\u7ACB\u5373\u66FF\u6362\u5F53\u524D\u914D\u7F6E\u3002", () => {
      this.pickSettingsFile();
    });
    this.createHeaderButton(
      actions,
      "\u5168\u90E8\u91CD\u7F6E",
      "\u6062\u590D\u7F16\u8F91\u548C\u9605\u8BFB\u4E24\u5957\u8BBE\u7F6E\u4EE5\u53CA\u5168\u90E8\u6A21\u5757\u5F00\u5173\u3002",
      () => {
        this.plugin.resetAll();
        this.display();
      },
      "rl-settings-header-danger"
    );
    const modeSwitch = header.createDiv({
      cls: "rl-settings-mode-switch",
      attr: { role: "group", "aria-label": "\u8BBE\u7F6E\u6A21\u5F0F" }
    });
    for (const mode of ["edit", "read"]) {
      const isActive = this.mode === mode;
      const button = modeSwitch.createEl("button", {
        cls: `rl-settings-mode-button ${isActive ? "rl-settings-mode-active" : ""}`,
        text: MODE_LABELS[mode],
        attr: {
          type: "button",
          "aria-pressed": String(isActive)
        }
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
  createHeaderButton(container, label, tooltip, onClick, extraClass = "") {
    const button = container.createEl("button", {
      cls: `rl-settings-header-button ${extraClass}`.trim(),
      text: label,
      attr: { type: "button", "aria-label": tooltip }
    });
    button.addEventListener("click", onClick);
  }
  pickSettingsFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file === void 0) {
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
  renderSettingsTabs(container) {
    const tabs = SETTINGS_TABS.filter((tab) => tab.id !== "canvasReset" || this.mode === "read");
    const firstTab = tabs[0];
    if (firstTab === void 0) {
      throw new Error("Refined Layout settings have no available tabs");
    }
    const currentTab = tabs.some((tab) => tab.id === this.activeTabByMode[this.mode]) ? this.activeTabByMode[this.mode] : firstTab.id;
    this.activeTabByMode[this.mode] = currentTab;
    const shell = container.createDiv({ cls: "rl-settings-tabs" });
    const nav = shell.createEl("nav", {
      cls: "rl-settings-tab-nav",
      attr: {
        role: "tablist",
        "aria-label": "\u8BBE\u7F6E\u5206\u533A",
        "aria-orientation": "horizontal"
      }
    });
    const panels = shell.createDiv({ cls: "rl-settings-tab-panels" });
    const buttons = [];
    const panelById = /* @__PURE__ */ new Map();
    const activateTab = (tabId, focusButton = false) => {
      this.activeTabByMode[this.mode] = tabId;
      tabs.forEach((tab, index) => {
        const button = buttons[index];
        const panel = panelById.get(tab.id);
        if (button === void 0 || panel === void 0) {
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
          "aria-controls": panelId
        }
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
          tabindex: "0"
        }
      });
      panelById.set(tab.id, panel);
      this.renderTabPanel(panel, tab);
      button.addEventListener("click", () => {
        activateTab(tab.id);
      });
      button.addEventListener("keydown", (event) => {
        const currentIndex = tabs.findIndex((item) => item.id === tab.id);
        if (currentIndex === -1) {
          return;
        }
        let targetIndex;
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
        if (target === void 0) {
          throw new Error(`Settings tab target is missing at index ${targetIndex}`);
        }
        activateTab(target.id, true);
      });
    });
    activateTab(currentTab);
  }
  renderTabPanel(panel, tab) {
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
  createModuleCard(container, tab) {
    const isModuleEnabled = this.plugin.settings[this.mode].modules[tab.module];
    const group = container.createDiv({ cls: "setting-group rl-settings-group rl-settings-module-group" });
    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-module-card" });
    const contentContainer = container.createDiv({
      cls: `rl-settings-content-wrapper ${isModuleEnabled ? "" : "rl-settings-disabled"}`
    });
    new import_obsidian.Setting(card).setName(tab.label).setDesc(tab.description).addToggle((toggle) => {
      toggle.setValue(isModuleEnabled).onChange((value) => {
        this.plugin.setModule(this.mode, tab.module, value);
        contentContainer.classList.toggle("rl-settings-disabled", !value);
      });
    }).addExtraButton((button) => {
      button.setIcon("reset").setTooltip("\u6062\u590D\u672C\u533A\u9ED8\u8BA4\u503C").onClick(() => {
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
  createGroupCard(container, title, description) {
    const group = this.createSettingsGroup(container, title, description);
    return group.createDiv({ cls: "setting-items rl-settings-card rl-settings-fields" });
  }
  createSettingsGroup(container, title, description) {
    const group = container.createDiv({ cls: "setting-group rl-settings-group" });
    if (title !== void 0) {
      const header = group.createDiv({ cls: "rl-settings-group-header" });
      header.createEl("h4", { text: title, cls: "rl-settings-group-title" });
      if (description !== void 0) {
        header.createDiv({ cls: "rl-settings-group-description", text: description });
      }
    }
    return group;
  }
  createHeadingLevelCard(container, title, description) {
    const group = this.createSettingsGroup(container, title, description);
    const subtabContainer = group.createDiv({ cls: "rl-settings-subtab-container" });
    const card = group.createDiv({ cls: "setting-items rl-settings-card rl-settings-heading-fields-card" });
    const fieldsContainer = card.createDiv({ cls: "rl-settings-heading-fields" });
    return { subtabContainer, fieldsPanel: card, fieldsContainer };
  }
  renderHeadingLevelTabs(container, contextKey, panel, onLevelChange) {
    const currentLevel = this.activeHeadingLevelByContext[contextKey] ?? "h1";
    const idBase = `refined-layout-settings-${this.mode}-${contextKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const panelId = `${idBase}-panel`;
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
    const nav = container.createEl("nav", {
      cls: "rl-settings-subtab-nav",
      attr: {
        "aria-label": "\u6807\u9898\u7EA7\u522B",
        role: "tablist",
        "aria-orientation": "horizontal"
      }
    });
    const buttons = [];
    const activateLevel = (level, focusButton = false) => {
      this.activeHeadingLevelByContext[contextKey] = level;
      const activeButtonId = `${idBase}-tab-${level}`;
      panel.setAttribute("aria-labelledby", activeButtonId);
      HEADING_LEVELS.forEach((candidate, index) => {
        const button = buttons[index];
        if (button === void 0) {
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
          "aria-controls": panelId
        }
      });
      button.tabIndex = level === currentLevel ? 0 : -1;
      buttons.push(button);
      button.addEventListener("click", () => {
        activateLevel(level);
      });
      button.addEventListener("keydown", (event) => {
        const currentIndex = HEADING_LEVELS.indexOf(level);
        let targetIndex;
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
        if (targetLevel === void 0) {
          throw new Error(`Heading level tab target is missing at index ${targetIndex}`);
        }
        activateLevel(targetLevel, true);
      });
    }
    activateLevel(currentLevel);
  }
  addNumber(container, path, name, description, options = {}) {
    const inferred = inferNumberOptions(path, this.mode);
    const config = { ...inferred, ...options };
    const value = this.plugin.getNumber(this.mode, path);
    const setting = new import_obsidian.Setting(container).setName(name).setDesc(description);
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
  renderBodySection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const bodyCard = this.createGroupCard(content, "\u6B63\u6587\u6392\u7248", "\u666E\u901A\u6B63\u6587\u884C\u9AD8\u3001\u6BB5\u843D\u6216\u7A7A\u884C\u9AD8\u5EA6\u8BBE\u7F6E\u3002");
    this.addNumber(bodyCard, ["body", "lineHeight"], "\u6B63\u6587\u884C\u9AD8", "\u666E\u901A\u6B63\u6587\u6587\u672C\u7684\u884C\u9AD8\u3002");
    if (this.mode === "edit") {
      this.addNumber(bodyCard, ["body", "emptyLineHeightEm"], "\u7A7A\u884C\u9AD8\u5EA6", "CodeMirror \u6E90\u7801\u89C6\u56FE\u4E2D\u7A7A\u767D\u884C\u7684\u9AD8\u5EA6\u3002");
    } else {
      this.addNumber(bodyCard, ["body", "paragraphSpacingEm"], "\u6BB5\u843D\u95F4\u8DDD", "\u9605\u8BFB\u89C6\u56FE\u4E2D\u666E\u901A\u6BB5\u843D\u4E4B\u95F4\u7684\u5782\u76F4\u95F4\u8DDD\u3002");
    }
    const listCard = this.createGroupCard(content, "\u5217\u8868\u95F4\u8DDD", "\u300C\u6761\u76EE\u300D\u63A7\u5236\u6761\u76EE\u4E0E\u6761\u76EE\u4E4B\u95F4\uFF1B\u300C\u6574\u4F53\u300D\u63A7\u5236\u5217\u8868\u9996\u9879\u4E0A\u65B9\u548C\u672B\u9879\u4E0B\u65B9\uFF0C\u5373\u5217\u8868\u4E0E\u524D\u540E\u5185\u5BB9\u7684\u8DDD\u79BB\u3002\u9996\u672B\u4E24\u7AEF\u7531\u300C\u6574\u4F53\u300D\u51B3\u5B9A\uFF0C\u4E0D\u4E0E\u300C\u6761\u76EE\u300D\u53E0\u52A0\u3002");
    this.addNumber(listCard, ["body", "listItemStartEm"], "\u5217\u8868\u6761\u76EE\u4E0A\u95F4\u8DDD", "\u6B63\u6587\u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0A\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(listCard, ["body", "listItemEndEm"], "\u5217\u8868\u6761\u76EE\u4E0B\u95F4\u8DDD", "\u6B63\u6587\u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0B\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(listCard, ["body", "listBlockStartEm"], "\u5217\u8868\u6574\u4F53\u4E0A\u95F4\u8DDD", "\u6B63\u6587\u5217\u8868\u9996\u9879\u4E0E\u524D\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(listCard, ["body", "listBlockEndEm"], "\u5217\u8868\u6574\u4F53\u4E0B\u95F4\u8DDD", "\u6B63\u6587\u5217\u8868\u672B\u9879\u4E0E\u540E\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
  }
  renderHeadingsSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    if (this.mode === "edit") {
      const firstHeadingCard = this.createGroupCard(content, "\u6587\u6863\u9996\u884C", "\u4EC5\u5728\u6587\u6863\u7B2C\u4E00\u884C\u5373\u4E3A\u6807\u9898\u65F6\u7684\u4E13\u9879\u8865\u507F\u3002");
      this.addNumber(firstHeadingCard, ["headingDecoration", "firstHeadingPaddingTopPx"], "\u9996\u884C\u6807\u9898\u9876\u90E8\u8865\u507F", "\u6587\u6863\u7B2C\u4E00\u884C\u662F\u6807\u9898\u65F6\u7684\u9876\u90E8\u5FAE\u8C03\u8865\u507F\u3002");
    }
    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      content,
      "\u5404\u7EA7\u6807\u9898\u6392\u7248\u4E0E\u95F4\u8DDD",
      "\u5207\u6362\u4E0B\u65B9 H1\u2013H6 \u6807\u7B7E\u9875\uFF0C\u5FAE\u8C03\u5BF9\u5E94\u7EA7\u522B\u6807\u9898\u7684\u884C\u9AD8\u4E0E\u4E0A\u4E0B\u5916\u8FB9\u8DDD\u3002"
    );
    const renderLevelFields = (level) => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "lineHeight"], `${HEADING_LABELS[level]} \u884C\u9AD8`, "\u6807\u9898\u6587\u5B57\u884C\u9AD8\u3002");
      this.addNumber(fieldsContainer, ["headings", level, "topEm"], `${HEADING_LABELS[level]} \u4E0A\u95F4\u8DDD`, "\u6807\u9898\u9876\u90E8\u95F4\u8DDD\u3002");
      this.addNumber(fieldsContainer, ["headings", level, "bottomEm"], `${HEADING_LABELS[level]} \u4E0B\u95F4\u8DDD`, "\u6807\u9898\u5E95\u90E8\u95F4\u8DDD\u3002");
    };
    this.renderHeadingLevelTabs(subtabContainer, "headings", fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }
  renderHeadingDecorationSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const appearanceCard = this.createGroupCard(content, "\u4F4D\u7F6E\u4E0E\u5916\u89C2", "\u8C03\u6574\u4E3B\u9898\u5DF2\u7ECF\u63D0\u4F9B\u7684\u6807\u9898 ::before \u4F2A\u5143\u7D20\u88C5\u9970\u7EBF\uFF1B\u6CA1\u6709\u6807\u9898\u4F2A\u5143\u7D20\u7684\u4E3B\u9898\u4E0D\u4F1A\u65B0\u589E\u88C5\u9970\u3002");
    this.addNumber(appearanceCard, ["headingDecoration", "leftPx"], "\u6C34\u5E73\u504F\u79FB", "\u4F2A\u5143\u7D20\u76F8\u5BF9\u6807\u9898\u6587\u5B57\u7684\u6C34\u5E73\u504F\u79FB\u4F4D\u7F6E\u3002");
    this.addNumber(appearanceCard, ["headingDecoration", "widthPx"], "\u5BBD\u5EA6", "\u4F2A\u5143\u7D20\u88C5\u9970\u7EBF\u7684\u5BBD\u5EA6\u3002");
    this.addNumber(appearanceCard, ["headingDecoration", "radiusPx"], "\u5706\u89D2", "\u4F2A\u5143\u7D20\u88C5\u9970\u7EBF\u7684\u5706\u89D2\u534A\u5F84\u3002");
    this.addNumber(appearanceCard, ["headingDecoration", "marginRightPx"], "\u53F3\u95F4\u8DDD", "\u4F2A\u5143\u7D20\u53F3\u4FA7\u4E0E\u6807\u9898\u6587\u672C\u7684\u8DDD\u79BB\u3002", { min: 0 });
    if (this.mode === "edit") {
      this.addNumber(appearanceCard, ["headingDecoration", "firstHeadingDecorOffsetPx"], "\u6587\u6863\u9996\u6807\u9898\u989D\u5916\u8865\u507F", "\u4EC5\u5728\u6587\u6863\u7B2C\u4E00\u884C\u5C31\u662F\u6807\u9898\u65F6\u53E0\u52A0\uFF1B\u6B63\u503C\u5411\u4E0B\uFF0C\u8D1F\u503C\u5411\u4E0A\u3002");
    }
    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      content,
      "\u5404\u7EA7\u6807\u9898\u88C5\u9970\u9AD8\u5EA6\u4E0E\u5782\u76F4\u8865\u507F",
      "\u5207\u6362\u4E0B\u65B9 H1\u2013H6 \u6807\u7B7E\u9875\uFF0C\u5FAE\u8C03\u5404\u7EA7\u6807\u9898\u88C5\u9970\u7EBF\u7684\u9AD8\u5EA6\u548C\u5782\u76F4\u5C45\u4E2D\u8865\u507F\u3002"
    );
    const renderLevelFields = (level) => {
      fieldsContainer.empty();
      this.addNumber(fieldsContainer, ["headings", level, "decorHeightPx"], `${HEADING_LABELS[level]} \u9AD8\u5EA6`, "\u4F2A\u5143\u7D20\u9AD8\u5EA6\u3002");
      this.addNumber(fieldsContainer, ["headings", level, "decorOffsetPx"], `${HEADING_LABELS[level]} \u5782\u76F4\u8865\u507F`, "\u5728\u7B2C\u4E00\u884C\u5782\u76F4\u5C45\u4E2D\u7684\u57FA\u7840\u4E0A\u5FAE\u8C03\uFF1B\u6B63\u503C\u5411\u4E0B\uFF0C\u8D1F\u503C\u5411\u4E0A\u3002");
    };
    this.renderHeadingLevelTabs(subtabContainer, "headingDecoration", fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }
  renderCalloutSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const appearanceCard = this.createGroupCard(content, "\u5361\u7247\u5916\u89C2\u4E0E\u5916\u8FB9\u8DDD", "Callout \u5361\u7247\u7684\u5706\u89D2\u4EE5\u53CA\u4E0E\u524D\u540E\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(appearanceCard, ["callout", "radiusPx"], "\u5361\u7247\u5706\u89D2", "Callout \u5361\u7247\u5706\u89D2\u534A\u5F84\u3002");
    this.addNumber(appearanceCard, ["callout", "marginTopPx"], "\u5361\u7247\u4E0A\u5916\u8FB9\u8DDD", "Callout \u4E0E\u524D\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(appearanceCard, ["callout", "marginBottomPx"], "\u5361\u7247\u4E0B\u5916\u8FB9\u8DDD", "Callout \u4E0E\u540E\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    const paddingCard = this.createGroupCard(content, "\u5361\u7247\u5185\u8FB9\u8DDD", "Callout \u5185\u90E8\u5404\u8FB9\u7F18\u4E0E\u5185\u5BB9\u7684\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(paddingCard, ["callout", "paddingTopPx"], "\u5361\u7247\u4E0A\u5185\u8FB9\u8DDD", "Callout \u5361\u7247\u9876\u90E8\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(paddingCard, ["callout", "paddingBottomPx"], "\u5361\u7247\u4E0B\u5185\u8FB9\u8DDD", "Callout \u5361\u7247\u5E95\u90E8\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(paddingCard, ["callout", "paddingLeftPx"], "\u5361\u7247\u5DE6\u5185\u8FB9\u8DDD", "Callout \u5361\u7247\u5DE6\u4FA7\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(paddingCard, ["callout", "paddingRightPx"], "\u5361\u7247\u53F3\u5185\u8FB9\u8DDD", "Callout \u5361\u7247\u53F3\u4FA7\u5185\u8FB9\u8DDD\u3002");
    const titleCard = this.createGroupCard(content, "\u6807\u9898\u680F\u6392\u7248\u4E0E\u5E38\u89C4\u5185\u8FB9\u8DDD", "Callout \u6807\u9898\u680F\u6587\u5B57\u53CA\u6807\u51C6\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(titleCard, ["callout", "titleLineHeight"], "\u6807\u9898\u884C\u9AD8", "\u6807\u9898\u680F\u6587\u5B57\u884C\u9AD8\u3002");
    this.addNumber(titleCard, ["callout", "titlePaddingTopEm"], "\u6807\u9898\u4E0A\u5185\u8FB9\u8DDD", "\u6807\u9898\u680F\u9876\u90E8\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(titleCard, ["callout", "titlePaddingBottomEm"], "\u6807\u9898\u4E0B\u5185\u8FB9\u8DDD", "\u6807\u9898\u680F\u5E95\u90E8\u5185\u8FB9\u8DDD\uFF1B\u4EC5\u6807\u9898\u3001\u6298\u53E0\u6216\u540E\u63A5\u6807\u9898\u65F6\u4F1A\u81EA\u52A8\u6291\u5236\u51B2\u7A81\u7A7A\u767D\u3002");
    this.addNumber(titleCard, ["callout", "titlePaddingLeftPx"], "\u6807\u9898\u5DE6\u5185\u8FB9\u8DDD", "\u6807\u9898\u680F\u5DE6\u4FA7\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(titleCard, ["callout", "titlePaddingRightPx"], "\u6807\u9898\u53F3\u5185\u8FB9\u8DDD", "\u6807\u9898\u680F\u53F3\u4FA7\u5185\u8FB9\u8DDD\u3002");
    const specialTitleCard = this.createGroupCard(content, "\u7279\u6B8A\u72B6\u6001\u6807\u9898\u680F\u5185\u8FB9\u8DDD", "\u4EC5\u6807\u9898\u72B6\u6001\u6216\u6298\u53E0\u72B6\u6001\u4E0B\u7684\u4E13\u5C5E\u5185\u8FB9\u8DDD\u63A7\u5236\u3002");
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingTopEm"], "\u4EC5\u6807\u9898\u65F6\u4E0A\u5185\u8FB9\u8DDD", "Callout \u53EA\u6709\u6807\u9898\u65F6\u7684\u9876\u90E8\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(specialTitleCard, ["callout", "titleOnlyPaddingBottomEm"], "\u4EC5\u6807\u9898\u65F6\u4E0B\u5185\u8FB9\u8DDD", "Callout \u53EA\u6709\u6807\u9898\u65F6\u7684\u5E95\u90E8\u5185\u8FB9\u8DDD\uFF1B\u72EC\u7ACB\u4E8E\u6709\u5185\u5BB9 Callout \u7684\u5361\u7247\u4E0B\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingTopEm"], "\u6298\u53E0\u72B6\u6001\u4E0A\u5185\u8FB9\u8DDD", "\u6298\u53E0 Callout \u7684\u9876\u90E8\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(specialTitleCard, ["callout", "collapsedPaddingBottomEm"], "\u6298\u53E0\u72B6\u6001\u4E0B\u5185\u8FB9\u8DDD", "\u6298\u53E0 Callout \u7684\u5E95\u90E8\u5185\u8FB9\u8DDD\u3002");
    const bodyCard = this.createGroupCard(content, "\u5185\u90E8\u6B63\u6587\u4E0E\u5217\u8868", "Callout \u5185\u90E8\u6BB5\u843D\u53CA\u5217\u8868\u7684\u72EC\u7ACB\u95F4\u8DDD\uFF1B\u5217\u8868\u5206\u300C\u6761\u76EE\u300D\u4E0E\u300C\u6574\u4F53\u300D\u4E24\u5C42\u3002");
    this.addNumber(bodyCard, ["callout", "paragraphLineHeight"], "\u5185\u90E8\u6B63\u6587\u884C\u9AD8", "Callout \u6B63\u6587\u884C\u9AD8\uFF0C\u72EC\u7ACB\u4E8E\u666E\u901A\u6B63\u6587\u3002");
    this.addNumber(bodyCard, ["callout", "paragraphSpacingEm"], "\u5185\u90E8\u6BB5\u843D\u95F4\u8DDD", "Callout \u6BB5\u843D\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["callout", "listItemStartEm"], "\u5217\u8868\u6761\u76EE\u4E0A\u95F4\u8DDD", "Callout \u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0A\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["callout", "listItemEndEm"], "\u5217\u8868\u6761\u76EE\u4E0B\u95F4\u8DDD", "Callout \u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0B\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["callout", "listBlockStartEm"], "\u5217\u8868\u6574\u4F53\u4E0A\u95F4\u8DDD", "Callout \u5217\u8868\u9996\u9879\u4E0E\u524D\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(bodyCard, ["callout", "listBlockEndEm"], "\u5217\u8868\u6574\u4F53\u4E0B\u95F4\u8DDD", "Callout \u5217\u8868\u672B\u9879\u4E0E\u540E\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(bodyCard, ["callout", "lastListEndEm"], "\u672B\u5C3E\u5217\u8868\u6574\u4F53\u4E0B\u95F4\u8DDD", "\u5217\u8868\u662F Callout \u6700\u540E\u4E00\u4E2A\u5143\u7D20\u65F6\uFF0C\u8986\u76D6\u300C\u5217\u8868\u6574\u4F53\u4E0B\u95F4\u8DDD\u300D\u3002");
    this.renderImageFields(content, ["callout", "image"], "Callout \u5185\u90E8\u56FE\u7247", "Callout \u5185\u90E8\u56FE\u7247\u7684\u5C3A\u5BF8\u548C\u5916\u89C2\u8BBE\u7F6E\u3002");
    this.renderTableFields(content, ["callout", "table"], "Callout \u5185\u90E8\u8868\u683C", "Callout \u5185\u90E8\u8868\u683C\u7684\u5185\u8FB9\u8DDD\u3001\u8FB9\u6846\u548C\u95F4\u8DDD\u3002");
    this.renderContextHeadings(content, "callout", this.mode === "read");
  }
  renderBlockquoteSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const bodyCard = this.createGroupCard(content, "\u5185\u90E8\u6B63\u6587\u4E0E\u5217\u8868", "\u5F15\u7528\u5757\u5185\u90E8\u6BB5\u843D\u53CA\u5217\u8868\u7684\u72EC\u7ACB\u6392\u7248\u4E0E\u95F4\u8DDD\uFF1B\u5217\u8868\u5206\u300C\u6761\u76EE\u300D\u4E0E\u300C\u6574\u4F53\u300D\u4E24\u5C42\u3002");
    this.addNumber(bodyCard, ["blockquote", "paragraphLineHeight"], "\u5185\u90E8\u6B63\u6587\u884C\u9AD8", "\u5F15\u7528\u5757\u6B63\u6587\u884C\u9AD8\uFF0C\u72EC\u7ACB\u4E8E\u666E\u901A\u6B63\u6587\u3002");
    this.addNumber(bodyCard, ["blockquote", "paragraphSpacingEm"], "\u5185\u90E8\u6BB5\u843D\u95F4\u8DDD", "\u5F15\u7528\u5757\u6BB5\u843D\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["blockquote", "listItemStartEm"], "\u5217\u8868\u6761\u76EE\u4E0A\u95F4\u8DDD", "\u5F15\u7528\u5757\u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0A\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["blockquote", "listItemEndEm"], "\u5217\u8868\u6761\u76EE\u4E0B\u95F4\u8DDD", "\u5F15\u7528\u5757\u5217\u8868\u4E2D\uFF0C\u6BCF\u4E2A\u6761\u76EE\u4E0E\u4E0B\u4E00\u4E2A\u6761\u76EE\u7684\u95F4\u8DDD\u3002");
    this.addNumber(bodyCard, ["blockquote", "listBlockStartEm"], "\u5217\u8868\u6574\u4F53\u4E0A\u95F4\u8DDD", "\u5F15\u7528\u5757\u5217\u8868\u9996\u9879\u4E0E\u524D\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(bodyCard, ["blockquote", "listBlockEndEm"], "\u5217\u8868\u6574\u4F53\u4E0B\u95F4\u8DDD", "\u5F15\u7528\u5757\u5217\u8868\u672B\u9879\u4E0E\u540E\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.renderTableFields(content, ["blockquote", "table"], "\u5F15\u7528\u5757\u5185\u90E8\u8868\u683C", "\u5F15\u7528\u5757\u5185\u90E8\u8868\u683C\u7684\u5185\u8FB9\u8DDD\u3001\u8FB9\u6846\u548C\u95F4\u8DDD\u3002");
    this.renderContextHeadings(content, "blockquote", false);
  }
  renderContextHeadings(container, context, bottomUsesPx) {
    const label = context === "callout" ? "Callout" : "\u5F15\u7528\u5757";
    const { subtabContainer, fieldsPanel, fieldsContainer } = this.createHeadingLevelCard(
      container,
      `${label} \u5185\u90E8\u5404\u7EA7\u6807\u9898 (H1\u2013H6)`,
      `\u5207\u6362\u4E0B\u65B9 H1\u2013H6 \u6807\u7B7E\u9875\uFF0C\u5FAE\u8C03 ${label} \u5185\u90E8\u5404\u7EA7\u6807\u9898\u7684\u884C\u9AD8\u4E0E\u95F4\u8DDD\u3002`
    );
    const renderLevelFields = (level) => {
      fieldsContainer.empty();
      const prefix = [context, "headings", level];
      this.addNumber(fieldsContainer, [...prefix, "lineHeight"], `${HEADING_LABELS[level]} \u884C\u9AD8`, "\u5185\u90E8\u6807\u9898\u884C\u9AD8\u3002");
      this.addNumber(fieldsContainer, [...prefix, "topEm"], `${HEADING_LABELS[level]} \u4E0A\u95F4\u8DDD`, "\u5185\u90E8\u6807\u9898\u9876\u90E8\u95F4\u8DDD\u3002");
      const bottomKey = bottomUsesPx ? "bottomPx" : "bottomEm";
      this.addNumber(fieldsContainer, [...prefix, bottomKey], `${HEADING_LABELS[level]} \u4E0B\u95F4\u8DDD`, "\u5185\u90E8\u6807\u9898\u5E95\u90E8\u95F4\u8DDD\u3002");
    };
    this.renderHeadingLevelTabs(subtabContainer, `${context}-headings`, fieldsPanel, (level) => {
      renderLevelFields(level);
    });
  }
  renderImageSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    this.renderImageFields(content, ["image"], "\u6B63\u6587\u56FE\u7247\u5C3A\u5BF8\u4E0E\u5916\u89C2", "\u666E\u901A\u6B63\u6587\u56FE\u7247\u7684\u5C3A\u5BF8\u3001\u5706\u89D2\u548C\u8FB9\u6846\u8BBE\u7F6E\u3002");
  }
  renderImageFields(container, prefix, label, description) {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "maxWidthPct"], "\u6700\u5927\u5BBD\u5EA6", "\u56FE\u7247\u76F8\u5BF9\u6240\u5728\u5185\u5BB9\u533A\u57DF\u7684\u6700\u5927\u5BBD\u5EA6\u3002");
    this.addNumber(card, [...prefix, "radiusPx"], "\u56FE\u7247\u5706\u89D2", "\u56FE\u7247\u5706\u89D2\u534A\u5F84\u3002");
    this.addNumber(card, [...prefix, "borderPx"], "\u56FE\u7247\u8FB9\u6846", "\u56FE\u7247\u8FB9\u6846\u5BBD\u5EA6\u3002");
  }
  renderMermaidSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "\u56FE\u8868\u81EA\u9002\u5E94\u4E0E\u5BBD\u5EA6\u89C4\u5219", "\u6309 SVG \u539F\u59CB viewBox \u5BBD\u9AD8\u6BD4\u533A\u5206\u7EB5\u5411\u56FE\u548C\u666E\u901A/\u6A2A\u5411\u56FE\u3002");
    this.addNumber(card, ["mermaid", "portraitMaxWidthPct"], "\u7EB5\u5411\u56FE\u6700\u5927\u5BBD\u5EA6", "\u7EB5\u5411 Mermaid \u76F8\u5BF9\u6240\u5728\u5185\u5BB9\u533A\u57DF\u7684\u6700\u5927\u5BBD\u5EA6\uFF1B\u56FE\u8868\u4F1A\u6C34\u5E73\u5C45\u4E2D\u3002");
    this.addNumber(card, ["mermaid", "portraitAspectRatio"], "\u7EB5\u5411\u5224\u5B9A\u5BBD\u9AD8\u6BD4", "SVG \u539F\u59CB\u5BBD\u5EA6\u9664\u4EE5\u9AD8\u5EA6\uFF1B\u5C0F\u4E8E\u6216\u7B49\u4E8E\u8BE5\u503C\u65F6\u89C6\u4E3A\u7EB5\u5411\u56FE\u3002", { min: 0.05, max: 5, step: 0.05 });
    this.addNumber(card, ["mermaid", "landscapeMinWidthPx"], "\u6A2A\u5411\u56FE\u6700\u5C0F\u5BBD\u5EA6", "\u666E\u901A\u6216\u6A2A\u5411 Mermaid \u7684\u6700\u5C0F\u5BBD\u5EA6\uFF1B\u7A7A\u95F4\u4E0D\u8DB3\u65F6\u5141\u8BB8\u6A2A\u5411\u6EDA\u52A8\u3002", { min: 0, max: 4096, step: 10 });
  }
  renderTableSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    this.renderTableFields(content, ["table"], "\u6B63\u6587\u8868\u683C\u5916\u89C2\u4E0E\u95F4\u8DDD", "\u6B63\u6587\u8868\u683C\u7684\u5355\u5143\u683C\u5185\u8FB9\u8DDD\u3001\u5185\u5916\u90E8\u8FB9\u6846\u3001\u5706\u89D2\u548C\u4E0A\u4E0B\u95F4\u8DDD\u3002");
  }
  renderTableFields(container, prefix, label, description) {
    const card = this.createGroupCard(container, label, description);
    this.addNumber(card, [...prefix, "cellPaddingPx"], "\u5355\u5143\u683C\u5185\u8FB9\u8DDD", "\u8868\u683C\u5355\u5143\u683C\u5185\u8FB9\u8DDD\u3002");
    this.addNumber(card, [...prefix, "innerBorderPx"], "\u5185\u6846\u7EBF\u5BBD\u5EA6", "\u8868\u683C\u5185\u90E8\u8FB9\u6846\u5BBD\u5EA6\u3002");
    this.addNumber(card, [...prefix, "outerBorderPx"], "\u5916\u8FB9\u6846\u5BBD\u5EA6", "\u8868\u683C\u5916\u8FB9\u6846\u5BBD\u5EA6\u3002");
    this.addNumber(card, [...prefix, "radiusPx"], "\u8868\u683C\u5706\u89D2", "\u8868\u683C\u6574\u4F53\u5706\u89D2\u3002");
    this.addNumber(card, [...prefix, "spacingTopPx"], "\u8868\u683C\u4E0A\u95F4\u8DDD", "\u8868\u683C\u4E0E\u524D\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
    this.addNumber(card, [...prefix, "spacingBottomPx"], "\u8868\u683C\u4E0B\u95F4\u8DDD", "\u8868\u683C\u4E0E\u540E\u65B9\u5185\u5BB9\u7684\u8DDD\u79BB\u3002");
  }
  renderCodeBlockSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "\u4EE3\u7801\u5757\u6392\u7248\u4E0E\u95F4\u8DDD", "\u4EE3\u7801\u5757\u5185\u90E8\u884C\u9AD8\u53CA\u5728\u4E0D\u540C\u6A21\u5F0F\u4E0B\u7684\u8FB9\u8DDD\u3002");
    this.addNumber(card, ["codeBlock", "lineHeight"], "\u4EE3\u7801\u884C\u9AD8", "\u4EE3\u7801\u5757\u5185\u90E8\u884C\u9AD8\u3002");
    if (this.mode === "edit") {
      this.addNumber(card, ["codeBlock", "innerSpacingEm"], "\u5185\u90E8\u7A7A\u884C\u95F4\u8DDD", "\u7F16\u8F91\u6A21\u5F0F\u4EE3\u7801\u5757\u5185\u90E8\u7A7A\u884C\u7684\u95F4\u8DDD\u3002");
    } else {
      this.addNumber(card, ["codeBlock", "marginTopEm"], "\u4EE3\u7801\u5757\u4E0A\u95F4\u8DDD", "\u9605\u8BFB\u6A21\u5F0F\u4EE3\u7801\u5757\u9876\u90E8\u95F4\u8DDD\u3002");
      this.addNumber(card, ["codeBlock", "marginBottomEm"], "\u4EE3\u7801\u5757\u4E0B\u95F4\u8DDD", "\u9605\u8BFB\u6A21\u5F0F\u4EE3\u7801\u5757\u5E95\u90E8\u95F4\u8DDD\u3002");
    }
  }
  renderHeadingGapSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    this.renderHeadingGapGroup(content, "body", "\u6B63\u6587");
    this.renderHeadingGapGroup(content, "callout", "Callout");
    this.renderHeadingGapGroup(content, "blockquote", "Quote (\u5F15\u7528\u5757)");
  }
  renderHeadingGapGroup(container, context, label) {
    const card = this.createGroupCard(container, `${label} \u5185\u6807\u9898\u540E\u9996\u5143\u7D20\u95F4\u8DDD`, `${label} \u5185\u6807\u9898\u540E\u63A5\u4E0D\u540C\u7C7B\u578B\u9996\u5143\u7D20\u65F6\u7684\u9876\u90E8\u8865\u507F\u95F4\u8DDD\u3002`);
    if (context === "body") {
      const bodyFields = [
        ["emptyLineEm", "\u6807\u9898\u540E\u7A7A\u884C\u9AD8\u5EA6", "\u6807\u9898\u3001\u7A7A\u884C\u3001\u975E\u6807\u9898\u5143\u7D20\u7EC4\u5408\u4E2D\u7684\u7A7A\u884C\u9AD8\u5EA6\u3002"],
        ["paragraphEm", "\u7D27\u90BB\u6B63\u6587\u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u6CA1\u6709\u7A7A\u884C\u4E14\u7D27\u90BB\u6B63\u6587\u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["listEm", "\u7D27\u90BB\u5217\u8868\u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB\u5217\u8868\u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["quoteEm", "\u7D27\u90BB Quote \u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB Quote \u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["codeEm", "\u7D27\u90BB\u4EE3\u7801\u5757\u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB\u4EE3\u7801\u5757\u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["tableEm", "\u7D27\u90BB\u8868\u683C\u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB\u8868\u683C\u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["imageEm", "\u7D27\u90BB\u56FE\u7247\u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB\u56FE\u7247\u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"],
        ["calloutEm", "\u7D27\u90BB Callout \u95F4\u8DDD", "\u6B63\u6587\u6807\u9898\u540E\u7D27\u90BB Callout \u65F6\u7684\u9876\u90E8\u8865\u507F\u3002"]
      ];
      for (const [key, name, description] of bodyFields) {
        this.addNumber(card, ["headingGap", "body", key], name, description);
      }
      return;
    }
    if (this.mode === "edit") {
      this.addNumber(card, ["headingGap", context, "emptyLineEm"], "\u6807\u9898\u540E\u7A7A\u884C\u9AD8\u5EA6", `${label} \u5185\u6807\u9898\u540E\u7A7A\u884C\u7684\u9AD8\u5EA6\u3002`);
    }
    const contextFields = [
      ["paragraphPx", "\u7D27\u90BB\u6B63\u6587\u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB\u6B63\u6587\u65F6\u7684\u95F4\u8DDD\u3002`],
      ["listPx", "\u7D27\u90BB\u5217\u8868\u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB\u5217\u8868\u65F6\u7684\u95F4\u8DDD\u3002`],
      ["quotePx", "\u7D27\u90BB Quote \u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB Quote \u65F6\u7684\u95F4\u8DDD\u3002`],
      ["codePx", "\u7D27\u90BB\u4EE3\u7801\u5757\u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB\u4EE3\u7801\u5757\u65F6\u7684\u95F4\u8DDD\u3002`],
      ["tablePx", "\u7D27\u90BB\u8868\u683C\u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB\u8868\u683C\u65F6\u7684\u95F4\u8DDD\u3002`],
      ["imagePx", "\u7D27\u90BB\u56FE\u7247\u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB\u56FE\u7247\u65F6\u7684\u95F4\u8DDD\u3002`],
      ["calloutPx", "\u7D27\u90BB Callout \u95F4\u8DDD", `${label} \u5185\u6807\u9898\u540E\u7D27\u90BB Callout \u65F6\u7684\u95F4\u8DDD\u3002`]
    ];
    for (const [key, name, description] of contextFields) {
      this.addNumber(card, ["headingGap", context, key], name, description);
    }
  }
  renderCanvasSection(container, tab) {
    const content = this.createModuleCard(container, tab);
    const card = this.createGroupCard(content, "Canvas \u6837\u5F0F\u91CD\u7F6E");
    card.createDiv({
      cls: "rl-settings-card-note",
      text: "\u542F\u7528\u540E\uFF0CCanvas \u5361\u7247\u4F1A\u6062\u590D\u7D27\u51D1\u7684\u9ED8\u8BA4\u6807\u9898\u3001\u6BB5\u843D\u3001Callout\u3001\u8868\u683C\u548C\u56FE\u7247\u5E03\u5C40\u3002"
    });
  }
};

// src/main.ts
var ROOT_CLASS = "refined-layout-enabled";
var MERMAID_PORTRAIT_CLASS = "rl-mermaid-portrait";
var MERMAID_SVG_SELECTOR = ".mermaid > svg";
var DATAVIEW_JS_SELECTOR = ".block-language-dataviewjs";
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
function readNestedNumber(source, path) {
  let cursor = source;
  for (const key of path) {
    if (typeof cursor !== "object" || cursor === null || !(key in cursor)) {
      throw new Error(`Unknown settings path: ${path.join(".")}`);
    }
    cursor = cursor[key];
  }
  if (typeof cursor !== "number") {
    throw new Error(`Settings path is not numeric: ${path.join(".")}`);
  }
  return cursor;
}
function writeNestedNumber(source, path, value) {
  let cursor = source;
  for (const key of path.slice(0, -1)) {
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      throw new Error(`Unknown settings path: ${path.join(".")}`);
    }
    cursor = next;
  }
  const lastKey = path[path.length - 1];
  if (lastKey === void 0 || typeof cursor[lastKey] !== "number") {
    throw new Error(`Settings path is not numeric: ${path.join(".")}`);
  }
  cursor[lastKey] = value;
}
var RefinedLayoutPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = cloneDefaultSettings();
    this.appliedProperties = /* @__PURE__ */ new Set();
    this.appliedModuleClasses = /* @__PURE__ */ new Set();
    this.saveTimer = null;
    this.mermaidObserver = null;
    this.invalidMermaidSvgs = /* @__PURE__ */ new WeakSet();
  }
  async onload() {
    this.settings = mergeSettings(await this.loadData());
    this.applySettings();
    this.startMermaidObserver();
    this.addSettingTab(new RefinedLayoutSettingTab(this.app, this));
  }
  onunload() {
    this.stopMermaidObserver();
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
      void this.saveData(this.settings);
    }
    this.clearAppliedStyles();
  }
  getNumber(mode, path) {
    return readNestedNumber(this.settings[mode], path);
  }
  setNumber(mode, path, value) {
    writeNestedNumber(this.settings[mode], path, value);
    this.applyAndScheduleSave();
  }
  setModule(mode, module2, enabled) {
    this.settings[mode].modules[module2] = enabled;
    this.applyAndScheduleSave();
  }
  resetSection(mode, section, module2) {
    const defaults = cloneDefaultSettings();
    this.settings[mode].modules[module2] = defaults[mode].modules[module2];
    if (section === "headings") {
      for (const level of HEADING_LEVELS) {
        this.settings[mode].headings[level].lineHeight = defaults[mode].headings[level].lineHeight;
        this.settings[mode].headings[level].topEm = defaults[mode].headings[level].topEm;
        this.settings[mode].headings[level].bottomEm = defaults[mode].headings[level].bottomEm;
      }
      this.settings[mode].headingDecoration.firstHeadingPaddingTopPx = defaults[mode].headingDecoration.firstHeadingPaddingTopPx;
    } else if (section !== "canvasReset") {
      this.settings[mode][section] = structuredClone(defaults[mode][section]);
    }
    this.applyAndScheduleSave();
  }
  resetHeadingDecoration(mode) {
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
  resetAll() {
    this.settings = cloneDefaultSettings();
    this.applyAndScheduleSave();
  }
  exportSettings() {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "refined-layout-settings.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    new import_obsidian2.Notice("Refined Layout\uFF1A\u914D\u7F6E\u5DF2\u5BFC\u51FA\u3002");
  }
  async importSettings(file) {
    let json;
    try {
      json = await file.text();
    } catch (error) {
      console.error("[Refined Layout] Failed to read settings file.", error);
      new import_obsidian2.Notice("Refined Layout\uFF1A\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E\u6587\u4EF6\u3002");
      return false;
    }
    let imported;
    try {
      imported = parseSettingsJson(json);
    } catch (error) {
      console.error("[Refined Layout] Invalid settings file.", error);
      const detail = error instanceof Error ? error.message : "\u6587\u4EF6\u683C\u5F0F\u65E0\u6548";
      new import_obsidian2.Notice(`Refined Layout\uFF1A\u5BFC\u5165\u5931\u8D25\uFF0C${detail}\u3002`);
      return false;
    }
    this.settings = imported;
    this.applyAndScheduleSave();
    new import_obsidian2.Notice("Refined Layout\uFF1A\u914D\u7F6E\u5DF2\u5BFC\u5165\u3002");
    return true;
  }
  applyAndScheduleSave() {
    this.applySettings();
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData(this.settings);
    }, 150);
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
    this.refreshMermaidClassifications();
  }
  startMermaidObserver() {
    this.mermaidObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) {
            continue;
          }
          if (node.matches(MERMAID_SVG_SELECTOR)) {
            this.classifyMermaid(node);
          }
          for (const svg of node.querySelectorAll(MERMAID_SVG_SELECTOR)) {
            this.classifyMermaid(svg);
          }
        }
      }
    });
    this.mermaidObserver.observe(document.body, { childList: true, subtree: true });
    this.refreshMermaidClassifications();
  }
  stopMermaidObserver() {
    this.mermaidObserver?.disconnect();
    this.mermaidObserver = null;
  }
  refreshMermaidClassifications() {
    for (const svg of document.querySelectorAll(MERMAID_SVG_SELECTOR)) {
      this.classifyMermaid(svg);
    }
  }
  classifyMermaid(svg) {
    const container = svg.parentElement;
    if (container === null || !container.classList.contains("mermaid")) {
      throw new Error("Mermaid SVG is missing its .mermaid parent container");
    }
    if (container.closest(DATAVIEW_JS_SELECTOR) !== null) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      return;
    }
    const mode = container.closest(".markdown-source-view.mod-cm6") !== null ? "edit" : container.closest(".markdown-preview-view.markdown-rendered") !== null ? "read" : null;
    if (mode === null || !this.settings[mode].modules.mermaid) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      return;
    }
    const { width, height } = svg.viewBox.baseVal;
    const portraitAspectRatio = this.settings[mode].mermaid.portraitAspectRatio;
    if (!isPositiveFiniteNumber(width) || !isPositiveFiniteNumber(height) || !isPositiveFiniteNumber(portraitAspectRatio)) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
      if (!this.invalidMermaidSvgs.has(svg)) {
        console.error(
          "[Refined Layout] Mermaid SVG has an invalid viewBox or portrait aspect-ratio setting; diagram left unclassified.",
          { width, height, portraitAspectRatio, svg }
        );
        this.invalidMermaidSvgs.add(svg);
      }
      return;
    }
    this.invalidMermaidSvgs.delete(svg);
    container.classList.toggle(
      MERMAID_PORTRAIT_CLASS,
      isPortraitMermaid(width, height, portraitAspectRatio)
    );
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
    for (const container of document.querySelectorAll(`.mermaid.${MERMAID_PORTRAIT_CLASS}`)) {
      container.classList.remove(MERMAID_PORTRAIT_CLASS);
    }
  }
};
