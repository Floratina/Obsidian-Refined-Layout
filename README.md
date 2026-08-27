# Refined Layout

Refined Layout 将原来的 Obsidian CSS snippet 改造成可独立配置的本地插件。编辑模式与阅读模式拥有各自的模块开关和排版参数，生产样式不包含 `calc()`。

## 本地使用

1. 在 Obsidian 的“外观 → CSS 代码片段”中关闭 `【基础修改】refined-layout`。
2. 在“第三方插件”中刷新插件列表并启用 **Refined Layout**。
3. 重启或重新加载 Obsidian。
4. 在插件设置中分别调整“编辑模式”和“阅读模式”。

插件不会修改 `.obsidian/appearance.json`。用户设置保存在未纳入 Git 的 `data.json` 中。
设置页顶部提供“导出配置”和“导入配置”，可将两种模式的完整设置保存为 JSON 或从 JSON 恢复。

## 开发检查

```bash
npm install
npm run check
```

`npm run check` 会执行 ESLint、Stylelint、无 `calc()` 检查、变量映射检查、TypeScript 类型检查和生产构建。

原始 CSS 保存在 `reference/`，不应直接修改。人工回归测试内容位于 `tests/layout-fixture.md`。
