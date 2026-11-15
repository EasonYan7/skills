# 动效与滚动标记

2026-11-15 用桌面 1440 × 1000 和手机 390 × 844 复查官网首页。页脚显示构建 df0aeefd。预览使用北屿云作已有的三种任务与九个示例步骤。代码出处见[官网取证索引](source.md)。

## 组件动效

| 组件 | 官网机制 | 模板实现 |
| --- | --- | --- |
| 首屏词槽 | 竖向遮罩、连续索引、距离驱动灰度和透明度，自动调度间隔 2800 ms | 在固定词槽内用带阻尼的环形轨道推动当前项；相邻项沿遮罩淡出。悬停、键盘焦点、手动暂停及页面离开可视区都会影响自动轮换。已激活的词仍可跳转 |
| 导航 | 桌面胶囊伸展，深色面板从顶部揭开；紧凑面板纵移 8 px、约 220 ms 淡入淡出 | 用尺寸和裁剪过渡呈现展开，用 ARIA 和 inert 管理实际交互状态。Escape 后焦点回到展开按钮。支持 CSS 入场过渡的浏览器显示完整中间帧 |
| 产品滚动区 | 约 45% 视口阅读线，右栏随滚动进度换章。中点切章节身份，演示先退后进 | 在最多 320 px 的过渡带内混合相邻产品的背景，演示先上移淡出、后从下方进入。滚动反向时按进度还原。键盘进入演示时保留焦点，手机仍使用随章内联画面 |
| 开发者工具 | 深色介绍随页面纵向进入，随后视窗吸顶，首场留有停顿，再随纵滚横移。桌面场景间距 64 px | 用原生纵滚位置驱动一条水平轨道，保留首末场的阅读时长。视窗使用站点导航高度作为吸顶偏移，底部提供当前进度和场景锚点 |

## 首页的连续场景

加载 `components/home-motion.css` 和 `components/home-motion.js`。各挂载函数返回清理函数。示例接线见 [demo.js](../assets/frontend-template/demo.js)。

| 官网行为 | 可用组件和数据 |
| --- | --- |
| 首屏下沿的命令条随滚动上移、变圆和缩小 | `mountCommandDock(host, { launch, command })`。传入首屏节点和可复制的真命令。桌面可点击或按键复制。 |
| 伙伴标识在吸顶舞台内扩散，后面是立体数字 | `mountProofSequence(host, { products, metrics, orbitItems })`。宿主带 `.aw-proof`，填入 `{ label, value, detail }`。可选的环形项目为 `{ product, label }`。示例使用产品和执行步骤，数字取自项目数据。窄屏及减少动态效果时显示静态列表和数字。 |
| 拉绳出现，深色层自下遮住仍在显示的产品内容 | `mountProductHandoff(host, { target })`。宽屏预览让宿主覆盖最后一段产品内容，拉绳按钮支持拖动反馈、点击和键盘触发。窄屏按文档流排列。 |
| 保障卡随指针调整姿态 | `mountCardTilt(cards)`。传入卡片节点，组件写入 `data-tilt`、`--card-tilt-axis`、`--card-tilt-angle`。示例把角度应用在请求卡内部的代码块。 |
| 页脚像显示器一样轮换产品提示 | `mountFooterRunway(host, products)`。进入视窗后轮播产品链接。悬停、聚焦、离开视窗或开启减少动态效果时暂停。 |

模板使用 CSS 立体数字、控制台卡和点阵标记，后半页使用本地模型与帮助入口来迁移公开交互。3D 材质、关键帧和支持服务与官网存在差异。见[保障与收尾](closing.md)。 [首页滚动入口](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-redesign.CfzhckC5.js) · [产品遮盖脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ProductSummaryCover.astro_astro_type_script_index_0_lang.COqTBgBw.js)

## 开发者工具的纵滚横移

在比较区后延续黑底，宽屏放左侧示意与右侧文案。场景先整体沿页面上行，抵达导航下沿后在首场短暂停留。随后将纵滚进度映射到横轨位置。向上滚动会回退到前场。最后一幕保留阅读距离，再自然进入后续内容。传入 `lightEnding: true` 时，轨道在末场入场期间由黑转浅，反向滚动也会还原。

横向布局要求视口宽度大于 980 px、高度大于 640 px、系统允许动效，而且文案、示意和底部场景导航能同时放入视窗。窄屏、较矮的横屏、场景内容超出可用高度及减少动态效果时，使用同一批场景纵排。场景链接在两种布局中保持各自的 URL 片段，触发后把阅读焦点交给对应标题。

移植时先确定自然滚入、首场停留、轨道移动和末场退出各自的距离。测试反向滚动、跨场 Tab、直接访问场景 URL，以及在阅读中改变视口时能否保留当前幕。原站的 3D 物件在示例中用任务控制台与请求示意体现。 [官网脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HomeDeveloperFeatures.astro_astro_type_script_index_0_lang.DXowlldD.js) · [官网 CSS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/index.Dt_ZvLL-.css)

## 桌面跨区标记

官网将带眼睛的形体渲染为独立层 `#aipay-bubble-guide`，将位置、尺寸、姿态与实际停靠位一起更新。实拍确认它从首屏底部起步，进入产品区后缩到详情入口旁，之后停靠在导航品牌旁并在黑底区加浅色轮廓。官网在页脚和后续章节还有各自的停靠和形变逻辑。 [首屏](evidence/03-desktop-home.jpg) · [证明区](evidence/06-desktop-proof.jpg) · [产品停靠](evidence/08-product-variant.jpg) · [导航停靠](evidence/09-desktop-comparison.jpg)

模板的 `mountScrollMark(host, { start, story, berth, dark, dock, proof, rope })` 使用原始滚动位置与页面几何，沿曲线更新一个独立的品牌标记。标记从首屏底部出发，倾斜拉伸并带点阵拖尾，在产品详情旁停靠，经拉绳移动到导航。可选的 `proof` 和 `rope` 分别指向数字场景和拉绳挂点。轮廓插值负责形变，示例品牌字形负责轻微眨动。所有定位与姿态随滚动可逆。使用 CSS 处理待机动画，滚动更新以动画帧合并。

组件需要 `components/scroll-mark.js`、`components/scroll-mark.css`、`shared.js` 和一个空宿主。各锚点可以是节点或选择器。

- `start` 是首屏容器，`story` 是首个产品章节。
- `berth` 是紧邻详情动作的持久占位。自带产品组件提供 `.aw-story__berth`。
- `dark` 是产品之后的深色区块，用于离场和反色。
- `dock` 是导航中带 `.aw-scroll-mark-dock` 的空占位。预览将它放在品牌链接内，位于标签之后。

飞行标记允许鼠标和触控穿透。桌面从 981 px 开始显示。减少动态效果下停在导航，紧凑宽度沿用独立菜单和内联产品画面。需要导航停靠位置可打开帮助时，启用 `interactive` 并连接 `trigger`，用可选的 `ending` 接续开发者区和页脚。接口见[保障与收尾](closing.md)。挂载后可调用 `destroy()` 清理标记和监听。
