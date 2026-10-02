import { getLanguage, Modal, Setting, type App } from "obsidian";
import { selectLocale } from "./i18n/core";
import type { LanguagePreference } from "./i18n/language";

export const UPDATE_NOTES_ID = "cursor-navigation-improved";

export function shouldShowUpdateNotes(lastSeen: unknown, currentId = UPDATE_NOTES_ID): boolean {
  return lastSeen !== currentId;
}

export function getUpdateNotes(preference: LanguagePreference, readLanguage = getLanguage) {
  const locale = selectLocale(preference, readLanguage);
  return locale === "zh-CN" || locale === "zh-TW"
    ? {
      title: "Refined Layout 更新说明",
      heading: "光标导航已改进：",
      body: "编辑模式中的上、下方向键现在可以逐行停留在被插件压缩的空行上，也支持使用 Shift + ↑/↓ 跨越这些空行扩展选区。",
      close: "知道了",
    }
    : {
      title: "Refined Layout Update Notes",
      heading: "Improved cursor navigation:",
      body: "In editing mode, Up/Down now stop at blank lines compressed by the plugin. Shift+Up/Down also extends selections across these lines.",
      close: "Got it",
    };
}

export class UpdateNotesModal extends Modal {
  constructor(app: App, private readonly preference: LanguagePreference) {
    super(app);
  }

  onOpen(): void {
    const notes = getUpdateNotes(this.preference);
    this.setTitle(notes.title);
    const paragraph = this.contentEl.createEl("p");
    paragraph.createEl("strong", { text: notes.heading });
    paragraph.appendText(` ${notes.body}`);
    new Setting(this.contentEl).addButton((button) => button
      .setButtonText(notes.close)
      .setCta()
      .onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
