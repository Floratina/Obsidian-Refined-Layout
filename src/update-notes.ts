import { Component, getLanguage, MarkdownRenderer, Modal, Setting, type App } from "obsidian";
import englishNotes from "../RELEASE_NOTES.md";
import chineseNotes from "../RELEASE_NOTES_zh-CN.md";
import traditionalChineseNotes from "../RELEASE_NOTES_zh-TW.md";
import japaneseNotes from "../RELEASE_NOTES_ja.md";
import { selectLocale } from "./i18n/core";
import type { LanguagePreference, Locale } from "./i18n/language";

const localizedNotes: Record<Locale, { markdown: string; title: string; heading: string; close: string }> = {
  en: { markdown: englishNotes, title: "Update Notes", heading: "What's new", close: "Got it" },
  "zh-CN": { markdown: chineseNotes, title: "更新说明", heading: "更新说明", close: "知道了" },
  "zh-TW": { markdown: traditionalChineseNotes, title: "更新說明", heading: "更新說明", close: "知道了" },
  ja: { markdown: japaneseNotes, title: "更新内容", heading: "更新内容", close: "閉じる" },
};

export function shouldShowUpdateNotes(lastSeen: unknown, currentId: string): boolean {
  return lastSeen !== currentId;
}

export function extractVersionNotes(markdown: string, version: string): string {
  const lines = markdown.split(/\r?\n/);
  let collecting = false;
  let fence: string | undefined;
  const content: string[] = [];
  for (const line of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length
        && line.trim() === marker) fence = undefined;
    }
    const heading = !fence && /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      if (collecting) break;
      collecting = heading[1] === version;
      continue;
    }
    if (collecting) content.push(line);
  }
  return content.join("\n").trim();
}

export function getUpdateNotes(preference: LanguagePreference, version: string, readLanguage = getLanguage) {
  const locale = selectLocale(preference, readLanguage);
  const notes = localizedNotes[locale];
  const markdown = extractVersionNotes(notes.markdown, version);
  if (!markdown) return null;
  return {
    id: version,
    title: `Refined Layout ${version} ${notes.title}`,
    heading: notes.heading,
    markdown,
    close: notes.close,
  };
}

export class UpdateNotesModal extends Modal {
  private readonly renderComponent = new Component();

  constructor(app: App, private readonly notes: NonNullable<ReturnType<typeof getUpdateNotes>>,
    private readonly onShown: () => void, private readonly onClosed: () => void) {
    super(app);
  }

  async onOpen(): Promise<void> {
    this.modalEl.addClass("rl-update-notes-modal");
    this.modalEl.setAttribute("aria-label", this.notes.title);
    this.setTitle(this.notes.heading);
    const scroll = this.contentEl.createDiv({ cls: "rl-update-notes-scroll" });
    const version = scroll.createDiv({ cls: "rl-update-notes-version" });
    version.createSpan({ text: "Refined Layout" });
    version.createSpan({ cls: "rl-update-notes-version-number", text: `v${this.notes.id}` });
    const markdown = scroll.createDiv({ cls: "rl-update-notes-markdown" });
    const footer = this.contentEl.createDiv({ cls: "rl-update-notes-footer" });
    new Setting(footer).addButton((button) => button
      .setButtonText(this.notes.close)
      .setCta()
      .onClick(() => this.close()));
    this.renderComponent.load();
    try {
      await MarkdownRenderer.render(this.app, this.notes.markdown, markdown, "", this.renderComponent);
      if (!this.containerEl.isConnected) return;
      this.onShown();
    } catch (error) {
      console.error("[Refined Layout] Failed to render update notes.", error);
      this.close();
    }
  }

  onClose(): void {
    this.renderComponent.unload();
    this.contentEl.empty();
    this.onClosed();
  }
}
