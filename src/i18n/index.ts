import { getLanguage } from "obsidian";
import { selectLocale, translatorForLocale, type Translator } from "./core";
import type { LanguagePreference } from "./language";

export function getTranslator(preference: LanguagePreference = "auto"): Translator {
  return translatorForLocale(selectLocale(preference, getLanguage));
}
