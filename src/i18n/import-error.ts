import { SettingsImportError } from "../settings";
import type { Translator } from "./core";

export function formatImportError(error: unknown, t: Translator): string {
  const detail = t(error instanceof SettingsImportError ? `error.${error.code}` : "error.invalidFile");
  return t("notice.importFailed", { detail });
}
