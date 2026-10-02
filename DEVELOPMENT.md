# 开发与发布构建

使用 Node.js 24，在项目根目录执行 `npm ci` 安装锁定的依赖。

## 本地检查与开发

`npm run check` 会依次运行代码检查、CSS 检查、多语言测试、设置搜索测试、TypeScript 类型检查和生产构建。生成的 `main.js` 留在开发目录，不同步到 Obsidian。

- `npm run build -- --no-sync`：仅进行类型检查和生产构建，不同步插件运行文件。
- `npm run build`：生产构建后，将 `main.js`、`styles.css`、`manifest.json` 同步到构建配置指定的本地插件目录。
- `npm run dev`：监听源码、样式和清单变化，重新构建并同步到本地插件目录。
- `npm run dev -- --no-sync`：监听并构建，但不进行本地同步。

同步过程不会覆盖 `data.json`。本地插件目录在 `esbuild.config.mjs` 中配置；其他开发者应使用无同步命令，或先将目录改为自己的开发库。

## 准备发布资产

GitHub Actions 的 **Prepare release assets** 工作流通过手动触发运行。工作流文件需要先存在于默认分支中，并包含在待构建版本的标签中。

1. 确认已有版本标签、`manifest.json` 和 `package.json` 中的版本号完全一致，例如 `0.1.0`，不添加 `v` 前缀。
2. 在 **Run workflow** 中选择该标签，并在 `tag` 输入框填写相同标签。
3. 工作流检出该版本源码，安装依赖，运行完整检查，生成三个插件运行文件的构建来源证明（GitHub artifact attestations）。
4. 从成功运行的工作流下载 `refined-layout-<版本号>` 产物。解压后，`release-assets/` 中包含三个运行文件，`RELEASE_NOTES.md` 和 `RELEASE_NOTES_zh-CN.md` 分别提供英文和中文发行说明。
5. 发布时使用 `release-assets/` 中的原始文件，并将发行说明填写到 Release 正文中。不要重新构建或修改这些文件，否则其内容将不再匹配来源证明。

此工作流只准备产物，不创建标签、不创建 Release，也不覆盖已有发行资产。正式插件资产只包含 `main.js`、`styles.css` 和 `manifest.json`。
