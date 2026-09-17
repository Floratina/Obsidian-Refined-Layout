export type Locale = "en" | "zh-CN" | "zh-TW" | "ja";
export type LanguagePreference = "auto" | Locale;

export function normalizeLanguagePreference(value: unknown): LanguagePreference {
  switch (value) {
    case "en":
    case "zh-CN":
    case "zh-TW":
    case "ja":
      return value;
    default:
      return "auto";
  }
}
