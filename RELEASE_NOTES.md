# Refined Layout — Release Notes

**English** | [简体中文](RELEASE_NOTES_zh-CN.md)

## 1.0.1

#### Fixed an issue where the cursor skipped some blank lines when moving up or down with the arrow keys.

In Live Preview Mode, Up/Down now stop at blank lines compressed by the plugin. Shift+Up/Down also extends selections across these lines.

#### Other fixes

- Fixed an issue that prevented settings from being imported.
- Fixed missing confirmation and completion messages when resetting all settings.

## 1.0.0

#### Fixed an issue where the cursor skipped some blank lines when moving up or down with the arrow keys.

In Live Preview Mode, Up/Down now stop at blank lines compressed by the plugin. Shift+Up/Down also extends selections across these lines.

## 0.2.0

- **Native settings search:** On Obsidian 1.13 and later, search follows your selection of Live Preview Mode or reading view and provides direct access to every heading level.
- **Simpler settings navigation:** The home page brings together global controls, the view switcher, and category links. Each category opens its own detail page with native controls.
- **Compatibility improvements:** Configuration import and export use native element helpers, and Mermaid diagram detection works more reliably across separate windows.

Existing settings and configuration files remain compatible. The minimum supported Obsidian version is 1.12.7.

## 0.1.0

Initial release.

- **Independent view settings:** Customize Live Preview Mode and Reading view separately, with module switches and layout values for each view. Changes apply immediately and save automatically.
- **Typography and layout controls:** Adjust line height, spacing, and appearance for body text, lists, headings, callouts, blockquotes, images, tables, and code blocks. Set the gap after headings according to the content that follows.
- **Mermaid diagram layout:** Control diagram width and centering, with horizontal scrolling for wide diagrams.
- **Configuration management:** Reset individual sections or all layout settings, and import or export complete configurations as JSON files.
- **Multilingual settings:** Choose English, Simplified Chinese, Traditional Chinese, or Japanese, or follow Obsidian’s language.
