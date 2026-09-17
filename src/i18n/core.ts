import { en, type TranslationDictionary, type TranslationKey } from "./en";
import { translations as zhCN } from "./zh-CN";
import { translations as zhTW } from "./zh-TW";
import { translations as ja } from "./ja";
import { normalizeLanguagePreference, type Locale } from "./language";

export type { Locale } from "./language";
export type TranslationParams = Record<string, string | number>;
export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
};

export function resolveLocale(language: unknown): Locale {
  if (typeof language !== "string") return "en";
  const [base, ...tags] = language.trim().toLowerCase().replace(/_/g, "-").split("-");
  if (base === "ja") return "ja";
  if (base !== "zh") return "en";
  if (tags.includes("hans")) return "zh-CN";
  if (tags.includes("hant")) return "zh-TW";
  if (tags.some((tag) => ["tw", "hk", "mo"].includes(tag))) return "zh-TW";
  return "zh-CN";
}

export function detectLocale(readLanguage: () => unknown): Locale {
  try {
    return resolveLocale(readLanguage());
  } catch {
    return "en";
  }
}

export function selectLocale(preference: unknown, readLanguage: () => unknown): Locale {
  const language = normalizeLanguagePreference(preference);
  return language === "auto" ? detectLocale(readLanguage) : language;
}

// Accept partial dictionaries so a missing translation still displays English.
export function createTranslator(dictionary: Partial<TranslationDictionary>): Translator {
  return (key, params = {}) => {
    const template = dictionary[key] || en[key];
    return template.replace(/\{(\w+)\}/g, (placeholder: string, name: string) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : placeholder);
  };
}

export function translatorForLocale(locale: Locale): Translator {
  return createTranslator(dictionaries[locale]);
}
