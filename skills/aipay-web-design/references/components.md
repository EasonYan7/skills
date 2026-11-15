# 组件接入与本地预览

[组件模板目录](../assets/frontend-template/)提供原生 HTML、CSS 和 JavaScript 模块。示例把四个组件挂在同一页面，使用示例产品数据演示行为。官网构建产物用于核对 CSS 参数与交互规则，模板用原生 DOM 和 CSS 实现这些行为。各规则对应的代码链接见[取证索引](source.md)。

## 运行整页预览

在 Skill 根目录执行：

```sh
python3 scripts/preview.py
```

浏览器打开 [http://127.0.0.1:8765/](http://127.0.0.1:8765/)。端口已占用时使用 `python3 scripts/preview.py --port 8767`，打开终端打印的地址。组件脚本使用 ES modules，预览从 HTTP 地址加载。

在同一局域网的手机或平板上预览时，执行 `python3 scripts/preview.py --bind <电脑的局域网IPv4地址>`，然后在该设备的浏览器中打开终端打印的 HTTP 地址。

可整目录复制 `assets/frontend-template/` 到项目，再由项目的静态服务器提供 `index.html` 和资源。预览代码通过相对路径加载，目录可离开 Skill 单独使用。

示例站的方案、章节和对比数据在 [demo-data.js](../assets/frontend-template/demo-data.js)，挂载示例在 [demo.js](../assets/frontend-template/demo.js)。预览里的快速上手链接跳到本页的请求示例。

桌面宽度从 981 px 起可观察品牌标记随滚动飞行、缩入详情旁并停靠导航。动效的来源、复用参数和停靠位见[动效与滚动标记](motion.md)。

访问 `/index.html#developers` 可直达开发者工具。桌面继续向下滚进入横向场景，也可使用底部场景链接。预览用既有产品数据与请求示例组合场景。

访问 `/index.html#reliability` 可查看六张立体卡，继续向下滚会经过收尾和像素页脚。可从右下角或导航停靠的助手打开技术支持。该部分的组件接口见[保障与收尾](closing.md)。

## 来源与设计参数

| 组件 | 源站行为 | 模板接入时关注 |
| --- | --- | --- |
| 导航 | 980 px 切换紧凑导航，760 px 以下使用近全宽面板。源站内联脚本同步展开状态和 Escape 关闭。暗色章节切换导航配色 | 把组内链接、登录或主要动作换成站点真实入口。按当前页面的深色章节配置反色 |
| 首屏 | 宽屏固定前后文加轮换产品词槽，600 px 以下标题和 CTA 纵排。轮换默认 2800 ms 并尊重可见性、焦点和减少动态效果 | 轮换词使用短产品标签。三项 CTA 依次体现主、次、辅助任务，其去向可单独替换 |
| 产品故事 | 760 px 以下从宽屏吸顶演示改为章节内联视觉。宽屏使用受视口限制的吸顶位置与 3:4 演示框 | 每个章节用唯一锚点，保留标题、结果、说明与演示步骤。演示面板使用业务自身的视觉和状态 |
| 快速对比 | 宽屏焦点或鼠标进入时高亮列。760 px 以下换成按起点吸附的卡片，卡宽 `min(84%, 320px)`、间距 12 px | 为两种布局传入同一组维度与方案。卡片标题和数据结构按方案理解，足够长的内容允许换行 |

## 单独挂载

复制 `shared.css`、`shared.js` 和所用组件的 CSS/JS，保留 `components/` 与共享文件的相对位置。加载 `shared.css` 和所用组件样式，在共同的祖先上添加 `.aw-theme`。保留现有页面其他区块，把一个空容器交给组件挂载函数。

```html
<link rel="stylesheet" href="./shared.css">
<link rel="stylesheet" href="./components/hero.css">
<div class="aw-theme">
  <div id="hero"></div>
</div>
<script type="module">
  import { mountHero } from "./components/hero.js";

  mountHero(document.querySelector("#hero"), {
    prefix: "让长任务",
    suffix: "在云端运行",
    accessibleTitle: "让长任务在云端运行",
    lead: "连接项目，提交任务，查看运行状态。",
    products: [
      { label: "即时运行", icon: "bolt", color: "#237753", tint: "#e6f5eb" }
    ],
    actions: [{ label: "查看接入文档", href: "/docs/quickstart" }]
  });
</script>
```

共享产品数据包含 `label`、`icon`、`color`、`tint` 和可选的 `ink`。模板自带的产品图标可使用 `bolt`、`fork`、`calendar`，也可以修改共享图标映射和主题变量。链接使用 `{ label, href }`。卸载时调用挂载返回的函数，或按组件说明调用 `destroy()`。附加首页场景的挂载参数见[动效与滚动标记](motion.md)。

| 入口 | 数据接口 |
| --- | --- |
| `mountNavigation(host, options)` · `components/navigation.js` | `brand`、`action` 和 `links[]` 使用链接数据。品牌可带 `tag`。用 `groups[{ label, items }]` 划分菜单，每项可带 `description`、`product` 和子链接 `links[]`。用唯一宿主 ID，并传 `darkSections` 的节点或选择器。单页导航之外的内容变动后可调用返回的 `refreshTheme()` |
| `mountHero(host, options)` · `components/hero.js` | `prefix`、`suffix`、`accessibleTitle`、`lead`、`products[]`、`actions[]`、可选的 `interval`。给产品提供 `href` 时，当前词槽可跳到对应产品。单个产品显示固定词槽。确保无障碍标题单独读起来语义完整 |
| `mountStory(host, options)` · `components/story.js` | `title`、`lead`、`chapters[]`。每章提供唯一 `id`、`product`、`tagline`、`copy`、`features[{title, text}]`、`details` 链接及至少一个 `steps[{label, title, text}]`。可提供 `demoTitle` 及 `renderDemo(step, {chapter, stepIndex, variant})` 来渲染真实示例，每次返回新的 DOM 节点 |
| `mountComparison(host, options)` · `components/comparison.js` | `title`、`lead`、`dimensions[{ key, label }]`、`products[]`。方案在共享产品字段上增加唯一 `id`、详情 `href` 与按维度 key 索引的 `values`。同一份数据生成表格和卡片 |
| `mountDeveloperTools(host, { panels, renderVisual })` · `components/developer-tools.js` | 每个场景提供唯一 `id`、`title`，可带副标题 `tagline`、说明 `copy` 和操作链接 `action`。可选的 `renderVisual(panel, index)` 返回新的 DOM 节点。第一个场景用作区块标题。返回一个可直接调用的销毁函数 |

导航和产品页链接指向已有内容。演示需要替换为业务自己的数据。页内跳转时，给每个目标唯一 ID，考虑吸顶导航的高度。使用固定导航的页面应把可交互内容放在导航覆盖范围之外。

## 移植时的交互校验

- 宽屏打开产品菜单后用 Tab 进入分组，Escape 收起并恢复焦点。手机菜单展开后检查组内链接与页面跳转。
- 验证词槽可以暂停。键盘聚焦和减少动态效果时，标题的阅读内容保持稳定。
- 沿正文滚动，让至少两个章节各自成为当前项，再选择演示步骤。手机端检查视觉随章节出现。
- 桌面通过鼠标和键盘聚焦检查对比列。手机用横滑或前后按钮切换，检查卡片位置、当前序号和首尾。
