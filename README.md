# Refined Layout

Refined Layout 将原来的 Obsidian CSS snippet 改造成可独立配置的本地插件。编辑模式与阅读模式拥有各自的模块开关和排版参数，生产样式不包含 `calc()`。

## 本地使用

1. 在 Obsidian 的“外观 → CSS 代码片段”中关闭 `【基础修改】refined-layout`。
2. 在“第三方插件”中刷新插件列表并启用 **Refined Layout**。
3. 重启或重新加载 Obsidian。
4. 在插件设置中分别调整“编辑模式”和“阅读模式”。

插件不会修改 `.obsidian/appearance.json`。用户设置保存在未纳入 Git 的 `data.json` 中。
设置页顶部提供“导出配置”和“导入配置”，可将两种模式的完整设置保存为 JSON 或从 JSON 恢复。

## 界面语言

设置页顶部的「界面语言」下拉框提供「跟随 Obsidian」、简体中文、繁體中文（台灣用語）、English 和日本語。默认跟随 Obsidian；自动模式下，其他语言或无法读取语言时使用 English。手动选择后立即更新界面，无需重启。

设置项、说明、按钮及导入导出提示均支持四种语言。翻译随插件打包，离线可用。语言选择保存在 `data.json` 中，随配置一起导入导出；旧配置没有语言字段时使用「跟随 Obsidian」。更改语言不影响排版参数，「全部重置」保留当前语言选择。

## 排版作用范围

Canvas 白板（包括卡片阅读和编辑）整体绕过插件排版，保留 Obsidian 与主题的原有样式。旧配置中的 `canvasReset` 字段会在加载时忽略。

Mermaid 内部文字与节点不应用正文、Callout、引用块等排版规则；普通笔记中的整图宽度、居中和横向滚动仍由 Mermaid 模块控制。Canvas 中的 Mermaid 同样整体绕过。纵向图按 SVG 原始尺寸显示，宽度百分比仅作缩小上限，不会为了填满该比例而放大；渲染后的尺寸变化会触发重新分类。

## 开发检查

开发目录为 `D:\AppData\obsidian-refined-layout-dev`，源码、Git 历史与依赖均放在此处。
Obsidian 的运行目录为 `D:\文件\Obsidian Vault\Floratina\.obsidian\plugins\refined-layout`，保留 `main.js`、`styles.css`、`manifest.json` 和用户设置 `data.json`。

在开发目录执行 `npm run build`，会进行类型检查、生成 `main.js`，并自动将三个插件运行文件同步到 Obsidian 目录。构建不会覆盖 `data.json`。

执行 `npm run dev` 会持续监听源码、`styles.css` 和 `manifest.json`，修改后自动构建并同步；按 Ctrl+C 停止监听。同步后，在 Obsidian 中重新加载插件即可使用最新版本。

```bash
npm install
npm run check
```

`npm run check` 会执行 ESLint、Stylelint、无 `calc()` 检查、变量映射检查、多语言测试、TypeScript 类型检查和生产构建。可单独执行 `npm run test:i18n` 检查语言识别、翻译完整性与导入错误提示；测试位于 `tests/i18n/`。

原始 CSS 保存在 `reference/`，不应直接修改。人工回归测试内容位于 `tests/layout-fixture.md`。
