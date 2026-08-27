---
cssclasses:
  - refined-layout-dataviewjs-test
---

# DataviewJS 布局隔离

下方状态应显示“PASS”。测试元素故意复用 Obsidian 的段落、标题、Callout、引用、表格和代码类名，并设置与 Refined Layout 不同的内联尺寸。

```dataviewjs
const root = dv.el("div", "", { cls: "rl-dataviewjs-regression" });

const paragraph = root.createEl("p", { text: "自定义段落：20px 行高、零段距" });
paragraph.style.lineHeight = "20px";
paragraph.style.margin = "0";

const headingWrapper = root.createEl("div", { cls: "el-h2" });
const heading = headingWrapper.createEl("h2", { text: "自定义标题" });
heading.style.lineHeight = "24px";
heading.style.margin = "0";

const callout = root.createEl("div", { cls: "callout" });
callout.style.padding = "3px";
callout.style.margin = "0";
callout.style.borderRadius = "2px";
const calloutTitle = callout.createEl("div", { cls: "callout-title", text: "自定义 Callout" });
calloutTitle.style.lineHeight = "18px";
calloutTitle.style.padding = "0";

const quote = root.createEl("div", { cls: "el-blockquote" });
const quoteParagraph = quote.createEl("p", { text: "自定义引用段落" });
quoteParagraph.style.lineHeight = "19px";
quoteParagraph.style.margin = "0";

const table = root.createEl("table");
table.style.border = "0px none";
table.style.borderRadius = "0";
const row = table.createEl("tbody").createEl("tr");
const cell = row.createEl("td", { text: "自定义单元格：2px 内边距" });
cell.style.padding = "2px";
cell.style.border = "0px none";

const pre = root.createEl("pre");
pre.className = "language-text";
pre.style.lineHeight = "18px";
pre.style.margin = "0";
pre.createEl("code", { cls: "language-text", text: "custom code" });

await new Promise(requestAnimationFrame);

const checks = [
  ["段落行高", getComputedStyle(paragraph).lineHeight, "20px"],
  ["段落下边距", getComputedStyle(paragraph).marginBottom, "0px"],
  ["标题行高", getComputedStyle(heading).lineHeight, "24px"],
  ["Callout 上内边距", getComputedStyle(callout).paddingTop, "3px"],
  ["Callout 标题行高", getComputedStyle(calloutTitle).lineHeight, "18px"],
  ["引用段落行高", getComputedStyle(quoteParagraph).lineHeight, "19px"],
  ["表格单元格内边距", getComputedStyle(cell).paddingTop, "2px"],
  ["代码行高", getComputedStyle(pre).lineHeight, "18px"],
];
const failures = checks.filter(([, actual, expected]) => actual !== expected);
root.createEl("strong", {
  text: failures.length === 0
    ? "PASS：DataviewJS 自定义布局未被 Refined Layout 覆盖"
    : `FAIL：${failures.map(([name, actual, expected]) => `${name}=${actual}（应为 ${expected}）`).join("；")}`,
});
```

## 普通 Markdown 对照

这段普通 Markdown 应继续使用 Refined Layout 的阅读模式正文行高和段距。

> [!note] 普通 Callout 对照
> 该 Callout 应继续响应 Refined Layout 设置。

| 普通表格 | 对照值 |
| --- | --- |
| 应继续响应插件 | 1 |

```text
普通代码块应继续响应 Refined Layout 的阅读模式代码块设置。
```
