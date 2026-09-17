# Refined Layout 项目介绍

## 项目概况

Refined Layout 是 Floratina 的本地 Obsidian 插件，插件标识为 `refined-layout`，主要用于调整笔记在实时预览模式和阅读模式下的布局与排版。

项目由原来的 `【基础修改】refined-layout` CSS 代码片段发展而来，将排版参数整理为可在设置界面中调整的选项。设置页顶部可选择「跟随 Obsidian」、简体中文、繁體中文（台灣用語）、English 和日本語；默认跟随 Obsidian，自动模式下其他语言或检测失败时使用 English。手动切换立即生效并保存，重置排版时保留语言选择。设置界面中的“编辑模式”和“阅读模式”分别对应两套独立配置，各自拥有模块开关和排版参数。

## 主要功能

- **正文与列表**：调整正文行高、段落间距、空行高度，以及列表条目和整个列表的上下间距。
- **标题与装饰**：分别调整 H1–H6（一级至六级标题）的行高、上下间距，以及主题已有标题装饰线的位置、尺寸和偏移。
- **Callout（提示块）与引用块**：调整内部正文、列表、标题和表格的排版；Callout 还可设置卡片外观、标题栏、折叠状态的留白和内部图片样式。
- **图片**：调整最大宽度、圆角和边框。
- **表格**：调整单元格内边距、内外框线、圆角，以及表格与周围内容的间距。
- **代码块**：调整行高及相关上下间距。
- **标题后首元素**：按标题后紧接的正文、列表、引用、代码块、表格、图片或 Callout 等内容，分别调整衔接间距。
- **Mermaid（文本生成的图表）**：根据图表宽高比区分纵向图和横向图，控制整图宽度、居中和横向滚动。

设置修改后即时应用，并保存到插件目录中的 `data.json`。设置页支持按区域恢复默认值、全部重置，以及通过 JSON 文件导入和导出两种模式的完整配置。

排版主要围绕普通笔记内容展开，并对 Canvas（白板）、DataviewJS（脚本生成的视图）和 Mermaid 图内元素做了样式隔离。

## 实现与文件结构

开发目录为 `D:\AppData\obsidian-refined-layout-dev`。Obsidian 运行目录为 `D:\文件\Obsidian Vault\Floratina\.obsidian\plugins\refined-layout`，仅用于插件运行文件和用户设置 `data.json`。请在开发目录修改源码、样式和清单；`npm run build` 与 `npm run dev` 会通过 esbuild 配置自动同步 `main.js`、`styles.css`、`manifest.json`，不会覆盖用户设置。开发监听同时覆盖 TypeScript 源码、样式和清单。

插件逻辑使用 TypeScript 编写，通过 Obsidian 插件接口加载。具体排版由 CSS（层叠样式表）实现；插件将设置转换为 CSS 变量和模块开关对应的样式类，让编辑模式与阅读模式分别使用各自的参数。esbuild（代码打包工具）将入口源码打包为 Obsidian 加载的 `main.js`。

| 文件或目录 | 作用 |
| --- | --- |
| `src/main.ts` | 插件入口，负责加载与保存设置、应用样式参数、配置导入导出，以及监听和处理 Mermaid 图表。 |
| `src/settings.ts` | 定义设置结构、默认值，以及旧版配置的转换和导入数据的解析。 |
| `src/settings-tab.ts` | 多语言设置界面，包括模式切换、功能分区、数值输入、模块开关和重置操作。 |
| `src/i18n/` | 四种语言的翻译、语言识别与回退，以及配置导入错误的翻译。 |
| `src/mermaid.ts` | Mermaid 图表尺寸校验与纵横方向判定。 |
| `styles.css` | 实时预览、阅读模式和插件设置页的样式。 |
| `manifest.json` | Obsidian 识别插件所需的名称、标识和版本等信息。 |
| `package.json`、`esbuild.config.mjs` | 项目依赖、开发脚本与打包配置。 |
| `main.js` | 由 TypeScript 源码打包生成的插件运行文件。 |
| `data.json` | 当前用户保存的插件配置。 |
| `reference/` | 项目最初使用的 CSS 代码片段。 |
| `tests/` | 在 Obsidian 中查看排版效果的 Markdown 示例笔记，覆盖常规布局、标题装饰、Mermaid 和 DataviewJS 等场景。 |
| `scripts/` | CSS 表达式和样式变量映射等静态检查脚本。 |
