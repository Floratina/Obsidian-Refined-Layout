import { Component, getLanguage, MarkdownRenderer, Modal, Setting, type App } from "obsidian";
import englishNotes from "../RELEASE_NOTES.md";
import chineseNotes from "../RELEASE_NOTES_zh-CN.md";
import { selectLocale } from "./i18n/core";
import type { LanguagePreference } from "./i18n/language";

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
  const chinese = locale === "zh-CN" || locale === "zh-TW";
  const markdown = extractVersionNotes(chinese ? chineseNotes : englishNotes, version);
  if (!markdown) return null;
  return {
    id: version,
    title: chinese ? `Refined Layout ${version} 更新说明` : `Refined Layout ${version} Update Notes`,
    markdown,
    close: chinese ? "知道了" : "Got it",
  };
}

export class UpdateNotesModal extends Modal {
  private readonly renderComponent = new Component();

  constructor(app: App, private readonly notes: NonNullable<ReturnType<typeof getUpdateNotes>>,
    private readonly onShown: () => void) {
    super(app);
  }

  async onOpen(): Promise<void> {
    this.setTitle(this.notes.title);
    this.renderComponent.load();
    try {
      await MarkdownRenderer.render(this.app, this.notes.markdown, this.contentEl, "", this.renderComponent);
      if (!this.containerEl.isConnected) return;
      new Setting(this.contentEl).addButton((button) => button
        .setButtonText(this.notes.close)
        .setCta()
        .onClick(() => this.close()));
      this.onShown();
    } catch (error) {
      console.error("[Refined Layout] Failed to render update notes.", error);
      this.close();
    }
  }

  onClose(): void {
    this.renderComponent.unload();
    this.contentEl.empty();
  }
}
