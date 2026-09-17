export const MODE_KEYS = ["edit", "read"] as const;
export type ModeKey = (typeof MODE_KEYS)[number];

export const MODULE_KEYS = [
  "body",
  "headings",
  "callouts",
  "blockquotes",
  "images",
  "mermaid",
  "tables",
  "codeBlocks",
  "headingGaps",
] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export interface ModuleSettings {
  body: boolean;
  headings: boolean;
  callouts: boolean;
  blockquotes: boolean;
  images: boolean;
  mermaid: boolean;
  tables: boolean;
  codeBlocks: boolean;
  headingGaps: boolean;
}

export interface BodySettings {
  lineHeight: number;
  paragraphSpacingEm: number;
  emptyLineHeightEm: number;
  listItemStartEm: number;
  listItemEndEm: number;
  listBlockStartEm: number;
  listBlockEndEm: number;
}

export interface HeadingSettings {
  lineHeight: number;
  topEm: number;
  bottomEm: number;
  decorHeightPx: number;
  decorOffsetPx: number;
}

export interface ContextHeadingSettings {
  lineHeight: number;
  topEm: number;
  bottomEm: number;
  bottomPx: number;
}

export interface HeadingDecorationSettings {
  leftPx: number;
  widthPx: number;
  radiusPx: number;
  marginRightPx: number;
  firstHeadingPaddingTopPx: number;
  firstHeadingDecorOffsetPx: number;
}

export interface TableSettings {
  cellPaddingPx: number;
  innerBorderPx: number;
  outerBorderPx: number;
  radiusPx: number;
  spacingTopPx: number;
  spacingBottomPx: number;
}

export interface CalloutSettings {
  radiusPx: number;
  paddingTopPx: number;
  paddingBottomPx: number;
  paddingLeftPx: number;
  paddingRightPx: number;
  marginTopPx: number;
  marginBottomPx: number;
  titleLineHeight: number;
  titlePaddingTopEm: number;
  titlePaddingBottomEm: number;
  titlePaddingLeftPx: number;
  titlePaddingRightPx: number;
  titleOnlyPaddingTopEm: number;
  titleOnlyPaddingBottomEm: number;
  collapsedPaddingTopEm: number;
  collapsedPaddingBottomEm: number;
  paragraphLineHeight: number;
  paragraphSpacingEm: number;
  listItemStartEm: number;
  listItemEndEm: number;
  listBlockStartEm: number;
  listBlockEndEm: number;
  lastListEndEm: number;
  headings: Record<HeadingLevel, ContextHeadingSettings>;
  image: ImageSettings;
  table: TableSettings;
}

export interface BlockquoteSettings {
  paragraphLineHeight: number;
  paragraphSpacingEm: number;
  listItemStartEm: number;
  listItemEndEm: number;
  listBlockStartEm: number;
  listBlockEndEm: number;
  headings: Record<HeadingLevel, ContextHeadingSettings>;
  table: TableSettings;
}

export interface ImageSettings {
  maxWidthPct: number;
  radiusPx: number;
  borderPx: number;
}

export interface MermaidSettings {
  portraitMaxWidthPct: number;
  portraitAspectRatio: number;
  landscapeMinWidthPx: number;
}

export interface CodeBlockSettings {
  lineHeight: number;
  innerSpacingEm: number;
  marginTopEm: number;
  marginBottomEm: number;
}

export interface BodyHeadingGapSettings {
  emptyLineEm: number;
  paragraphEm: number;
  listEm: number;
  quoteEm: number;
  codeEm: number;
  tableEm: number;
  imageEm: number;
  calloutEm: number;
}

export interface ContextHeadingGapSettings {
  emptyLineEm: number;
  paragraphPx: number;
  listPx: number;
  quotePx: number;
  codePx: number;
  tablePx: number;
  imagePx: number;
  calloutPx: number;
}

export interface HeadingGapSettings {
  body: BodyHeadingGapSettings;
  callout: ContextHeadingGapSettings;
  blockquote: ContextHeadingGapSettings;
}

export interface ModeSettings {
  modules: ModuleSettings;
  body: BodySettings;
  headings: Record<HeadingLevel, HeadingSettings>;
  headingDecoration: HeadingDecorationSettings;
  callout: CalloutSettings;
  blockquote: BlockquoteSettings;
  image: ImageSettings;
  mermaid: MermaidSettings;
  table: TableSettings;
  codeBlock: CodeBlockSettings;
  headingGap: HeadingGapSettings;
}

export interface RefinedLayoutSettings {
  schemaVersion: 3;
  edit: ModeSettings;
  read: ModeSettings;
}

const EDIT_TABLE: TableSettings = {
  cellPaddingPx: 0.6,
  innerBorderPx: 1,
  outerBorderPx: 2,
  radiusPx: 8,
  spacingTopPx: 3.2,
  spacingBottomPx: 6,
};

const READ_TABLE: TableSettings = {
  cellPaddingPx: 6,
  innerBorderPx: 1,
  outerBorderPx: 2,
  radiusPx: 8,
  spacingTopPx: 4,
  spacingBottomPx: 6,
};

const EDIT_IMAGE: ImageSettings = { maxWidthPct: 85, radiusPx: 8, borderPx: 2 };
const READ_IMAGE: ImageSettings = { maxWidthPct: 85, radiusPx: 8, borderPx: 2 };

const EDIT_HEADINGS: Record<HeadingLevel, HeadingSettings> = {
  h1: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, decorHeightPx: 20, decorOffsetPx: 0 },
  h2: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, decorHeightPx: 19.5, decorOffsetPx: 0 },
  h3: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, decorHeightPx: 19, decorOffsetPx: 0 },
  h4: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, decorHeightPx: 18.5, decorOffsetPx: 0 },
  h5: { lineHeight: 1.38, topEm: 0.35, bottomEm: 0.0035, decorHeightPx: 17, decorOffsetPx: 0 },
  h6: { lineHeight: 1.36, topEm: 0.5, bottomEm: 0.1625, decorHeightPx: 16, decorOffsetPx: 0.5 },
};

const READ_HEADINGS: Record<HeadingLevel, HeadingSettings> = {
  h1: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 20, decorOffsetPx: 0 },
  h2: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19.5, decorOffsetPx: 0 },
  h3: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 19, decorOffsetPx: 0 },
  h4: { lineHeight: 1.47, topEm: 0.6, bottomEm: 0.32, decorHeightPx: 18.5, decorOffsetPx: 0 },
  h5: { lineHeight: 1.449, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 17, decorOffsetPx: 0 },
  h6: { lineHeight: 1.428, topEm: 0.7, bottomEm: 0.28, decorHeightPx: 16, decorOffsetPx: 0.5 },
};

const EDIT_CALLOUT_HEADINGS: Record<HeadingLevel, ContextHeadingSettings> = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.4, bottomPx: 0 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0.35, bottomPx: 0 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0.35, bottomPx: 0 },
};

const READ_CALLOUT_HEADINGS: Record<HeadingLevel, ContextHeadingSettings> = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 4 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 1 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0, bottomPx: 8 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0, bottomPx: -4 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0, bottomPx: -2 },
};

const EDIT_BLOCKQUOTE_HEADINGS: Record<HeadingLevel, ContextHeadingSettings> = {
  h1: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, bottomPx: 0 },
  h2: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, bottomPx: 0 },
  h3: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, bottomPx: 0 },
  h4: { lineHeight: 1.4, topEm: 0.4, bottomEm: 0.004, bottomPx: 0 },
  h5: { lineHeight: 1.38, topEm: 0.35, bottomEm: 0.0035, bottomPx: 0 },
  h6: { lineHeight: 1.36, topEm: 0.35, bottomEm: 0.0035, bottomPx: 0 },
};

const READ_BLOCKQUOTE_HEADINGS: Record<HeadingLevel, ContextHeadingSettings> = {
  h1: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h2: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h3: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.24, bottomPx: 0 },
  h4: { lineHeight: 1.372, topEm: 0.4, bottomEm: 0.2, bottomPx: 0 },
  h5: { lineHeight: 1.3524, topEm: 0.35, bottomEm: 0.175, bottomPx: 0 },
  h6: { lineHeight: 1.3328, topEm: 0.35, bottomEm: 0.14, bottomPx: 0 },
};

const ALL_MODULES: ModuleSettings = {
  body: true,
  headings: true,
  callouts: true,
  blockquotes: true,
  images: true,
  mermaid: true,
  tables: true,
  codeBlocks: true,
  headingGaps: true,
};

export const DEFAULT_SETTINGS: RefinedLayoutSettings = {
  schemaVersion: 3,
  edit: {
    modules: { ...ALL_MODULES },
    body: {
      lineHeight: 1.7,
      paragraphSpacingEm: 0,
      emptyLineHeightEm: 0.45,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0.15,
    },
    headings: EDIT_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 7.5,
      firstHeadingDecorOffsetPx: 0.5,
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
      listBlockEndEm: 0.2,
      lastListEndEm: 0,
      headings: EDIT_CALLOUT_HEADINGS,
      image: { ...EDIT_IMAGE },
      table: { ...EDIT_TABLE, cellPaddingPx: 8 },
    },
    blockquote: {
      paragraphLineHeight: 1.735,
      paragraphSpacingEm: 0,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      headings: EDIT_BLOCKQUOTE_HEADINGS,
      table: { ...EDIT_TABLE },
    },
    image: { ...EDIT_IMAGE },
    mermaid: {
      portraitMaxWidthPct: 55,
      portraitAspectRatio: 1,
      landscapeMinWidthPx: 450,
    },
    table: { ...EDIT_TABLE },
    codeBlock: {
      lineHeight: 1.62,
      innerSpacingEm: 0.2,
      marginTopEm: 0,
      marginBottomEm: 0,
    },
    headingGap: {
      body: {
        emptyLineEm: 0.3,
        paragraphEm: 0.3,
        listEm: 0.45,
        quoteEm: 0.3,
        codeEm: 0.3,
        tableEm: 0.3,
        imageEm: 0.3,
        calloutEm: 0.3,
      },
      callout: {
        emptyLineEm: 0,
        paragraphPx: -3,
        listPx: -5,
        quotePx: 0,
        codePx: 0,
        tablePx: -1,
        imagePx: 0,
        calloutPx: 0,
      },
      blockquote: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 0,
        quotePx: 0,
        codePx: 0,
        tablePx: 0,
        imagePx: 0,
        calloutPx: 0,
      },
    },
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
      listBlockEndEm: 0,
    },
    headings: READ_HEADINGS,
    headingDecoration: {
      leftPx: -8,
      widthPx: 2,
      radiusPx: 1,
      marginRightPx: 0,
      firstHeadingPaddingTopPx: 0,
      firstHeadingDecorOffsetPx: 0,
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
      table: { ...READ_TABLE },
    },
    blockquote: {
      paragraphLineHeight: 1.64825,
      paragraphSpacingEm: 0.51,
      listItemStartEm: 0,
      listItemEndEm: 0,
      listBlockStartEm: 0,
      listBlockEndEm: 0,
      headings: READ_BLOCKQUOTE_HEADINGS,
      table: { ...READ_TABLE },
    },
    image: { ...READ_IMAGE },
    mermaid: {
      portraitMaxWidthPct: 55,
      portraitAspectRatio: 1,
      landscapeMinWidthPx: 450,
    },
    table: { ...READ_TABLE },
    codeBlock: {
      lineHeight: 1.35,
      innerSpacingEm: 0.2,
      marginTopEm: 0.5,
      marginBottomEm: 0.5,
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
        calloutEm: 0,
      },
      callout: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 6,
        quotePx: 0,
        codePx: 0,
        tablePx: 8,
        imagePx: 0,
        calloutPx: 0,
      },
      blockquote: {
        emptyLineEm: 0,
        paragraphPx: 0,
        listPx: 0,
        quotePx: 0,
        codePx: 0,
        tablePx: 0,
        imagePx: 0,
        calloutPx: 0,
      },
    },
  },
};

function mergeKnown<T>(defaults: T, candidate: unknown): T {
  if (typeof defaults === "number") {
    return (typeof candidate === "number" && Number.isFinite(candidate) ? candidate : defaults) as T;
  }

  if (typeof defaults === "boolean") {
    return (typeof candidate === "boolean" ? candidate : defaults) as T;
  }

  if (typeof defaults !== "object" || defaults === null) {
    return defaults;
  }

  const source = typeof candidate === "object" && candidate !== null
    ? candidate as Record<string, unknown>
    : {};
  const merged: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(defaults as Record<string, unknown>)) {
    merged[key] = mergeKnown(value, source[key]);
  }

  return merged as T;
}

export function cloneDefaultSettings(): RefinedLayoutSettings {
  return structuredClone(DEFAULT_SETTINGS);
}

function migrateV1ToV2(source: Record<string, unknown>): Record<string, unknown> {
  for (const mode of MODE_KEYS) {
    const modeSettings = source[mode];
    if (typeof modeSettings !== "object" || modeSettings === null) {
      continue;
    }
    const modeRecord = modeSettings as Record<string, unknown>;
    const legacyGap = modeRecord.headingGap;
    if (typeof legacyGap !== "object" || legacyGap === null) {
      continue;
    }
    const gap = legacyGap as Record<string, unknown>;
    const body = {
      emptyLineEm: gap.emptyLineEm,
      paragraphEm: gap.paragraphEm,
      listEm: gap.listEm,
      quoteEm: gap.quoteEm,
      codeEm: gap.codeEm,
      tableEm: gap.tableEm,
      imageEm: gap.imageEm,
      calloutEm: gap.calloutEm,
    };
    const callout = {
      emptyLineEm: 0,
      paragraphPx: gap.calloutParagraphPx,
      listPx: gap.calloutListPx,
      quotePx: 0,
      codePx: 0,
      tablePx: gap.calloutTablePx,
      imagePx: 0,
      calloutPx: 0,
    };
    const blockquote = {
      emptyLineEm: 0,
      paragraphPx: 0,
      listPx: 0,
      quotePx: 0,
      codePx: 0,
      tablePx: 0,
      imagePx: 0,
      calloutPx: 0,
    };
    modeRecord.headingGap = { body, callout, blockquote };
  }

  source.schemaVersion = 2;
  return source;
}

/**
 * Schema 2 stored one pair of list margins per context, but the stylesheet
 * applied it to a different element in each mode: to every list line in the
 * editing view's body and blockquotes (an item-level gap), and to the list
 * element itself everywhere else (a block-level gap). Schema 3 splits the two
 * layers, so each old value moves to whichever layer it actually drove.
 */
function migrateV2ToV3(source: Record<string, unknown>): Record<string, unknown> {
  const ITEM_LEVEL_CONTEXTS: Record<ModeKey, readonly string[]> = {
    edit: ["body", "blockquote"],
    read: [],
  };

  for (const mode of MODE_KEYS) {
    const modeSettings = source[mode];
    if (typeof modeSettings !== "object" || modeSettings === null) {
      continue;
    }
    const modeRecord = modeSettings as Record<string, unknown>;

    for (const context of ["body", "callout", "blockquote"]) {
      const contextSettings = modeRecord[context];
      if (typeof contextSettings !== "object" || contextSettings === null) {
        continue;
      }
      const contextRecord = contextSettings as Record<string, unknown>;
      const legacyStart = contextRecord.listStartEm;
      const legacyEnd = contextRecord.listEndEm;
      delete contextRecord.listStartEm;
      delete contextRecord.listEndEm;

      // The old value always drove the list's outer edges.
      contextRecord.listBlockStartEm = legacyStart;
      contextRecord.listBlockEndEm = legacyEnd;

      // Where it was applied per line it drove the gaps between items too.
      const drovesItems = ITEM_LEVEL_CONTEXTS[mode].includes(context);
      contextRecord.listItemStartEm = drovesItems ? legacyStart : 0;
      contextRecord.listItemEndEm = drovesItems ? legacyEnd : 0;
    }
  }

  source.schemaVersion = 3;
  return source;
}

function migrateSettings(candidate: unknown): unknown {
  if (typeof candidate !== "object" || candidate === null) {
    return candidate;
  }

  let source = structuredClone(candidate) as Record<string, unknown>;
  if (source.schemaVersion === 1) {
    source = migrateV1ToV2(source);
  }
  if (source.schemaVersion === 2) {
    source = migrateV2ToV3(source);
  }
  return source;
}

export function mergeSettings(candidate: unknown): RefinedLayoutSettings {
  return mergeKnown(cloneDefaultSettings(), migrateSettings(candidate));
}

export function parseSettingsJson(json: string): RefinedLayoutSettings {
  const candidate = JSON.parse(json) as unknown;
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    throw new Error("配置文件根节点必须是对象");
  }

  const schemaVersion = (candidate as Record<string, unknown>).schemaVersion;
  if (schemaVersion !== 1 && schemaVersion !== 2 && schemaVersion !== 3) {
    throw new Error("配置文件的 schemaVersion 必须是 1、2 或 3");
  }

  return mergeSettings(candidate);
}
