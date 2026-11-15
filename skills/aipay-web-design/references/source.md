# 官网取证索引

2026-11-15 采集。范围为公开首页及其页面内交互。下方截图来自 v1.0.0、提交 f5dc032a。动效复查时页脚显示提交 df0aeefd，新增核查内容见本文末尾。CSS 值以浏览器计算样式为准，断点另核对了首页加载的样式表。 [支付宝 AI 付官网](https://aipay.alipay.com/)

## 截图

| 状态 | 视口 | 可核对的特征 |
| --- | --- | --- |
| [桌面首屏](evidence/03-desktop-home.jpg) | 1440 × 1000 | 大留白、彩色词槽、辅助光晕、三级 CTA、命令条 |
| [桌面产品菜单](evidence/04-desktop-products-menu.jpg) | 1440 × 1000 | 深色三组面板、分组、子入口 |
| [生态模块过渡](evidence/05-desktop-partners.jpg) | 1440 × 1000 | 首屏进入伙伴标识环的中间帧 |
| [规模证明](evidence/06-desktop-proof.jpg) | 1440 × 1000 | 单屏指标、超大数字、说明文字 |
| [产品导入](evidence/07-product-story.jpg) / [产品章节](evidence/08-product-variant.jpg) | 1440 × 1000 | 产品导入与章节分界、左文右图、嵌入式步骤条和详情 |
| [桌面对比](evidence/09-desktop-comparison.jpg) | 1440 × 1000 | 黑底、徽标行、列高亮、深色吸顶导航 |
| [开发者工具](evidence/10-desktop-developers.jpg) | 1440 × 1000 | 黑底内容、物件插画、白描边 CTA |
| [安全说明](evidence/11-desktop-trust.jpg) / [页脚](evidence/12-desktop-footer.jpg) | 1440 × 1000 | 浅色保障卡网格、底部动作复现、导航与构建信息 |
| [中间宽度首屏](evidence/01-compact-home.jpg) | 612 × 981 | 紧凑导航，标题和动作仍并排 |
| [手机首屏](evidence/14-mobile-home.jpg) / [手机菜单](evidence/15-mobile-menu.jpg) | 390 × 844 | 三段标题、纵排 CTA、深色折叠菜单 |
| [手机对比](evidence/13-mobile-comparison.jpg) | 390 × 844 | 横向卡片、下一卡露边，顶部导航反色 |

## 响应式规则与出处

- **导航。** 980 px 及以下切换紧凑菜单。760 px 及以下面板距顶部 66 px、两侧各 16 px、圆角 18 px。1440 px 视口的导航高 72 px。390 px 实测 58 px。 [导航样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/compact-navigation.D5m7HQpL.css)
- **首屏。** 宽屏标题字号使用 `clamp(24px, 3.4vw, 48px)`。600 px 及以下标题与 CTA 纵排，标题改用 `clamp(36px, 10vw, 50px)`。390 px 实测 39 px、三个 CTA 均为 350 × 44 px。 [标题样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/index.Dt_ZvLL-.css) · [CTA 样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-page.DtIjbBcW.css)
- **产品章节。** 760 px 及以下改成一列，隐藏桌面共享演示栏并显示各章内联演示。宽屏列间距为 72 px，共享演示栏用 `clamp(120px, 16svh, 180px)` 吸顶，媒体容器宽高比 3:4，圆角 24 px。 [产品故事样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-product-scrolly.Dq4I9qU0.css)
- **对比。** 同样在 760 px 及以下换成卡片。卡宽 `min(84%, 320px)`，圆角 16 px，内边距 24 px，卡间距 12 px，使用 `scroll-snap-type: x mandatory` 与起点对齐。390 px 处实测容器宽 358 px，卡宽约 300.72 px。 [页面样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/index.Dt_ZvLL-.css)
- **动效。** 官网样式包含减少动态效果的规则。采集确认首屏徽标轮播、桌面滚动联动、导航随章节变色和对比列高亮的可见状态。不同滚动时机的截图可能显示不同当前产品。 [首页动效样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-redesign.ChNwtb08.css)

桌面产品菜单已点开展开，Escape 后收起。手机菜单已点开展开。手机比较区的可滚动宽度、吸附属性与下一卡露边已确认，浏览器横向输入未触发位移，实体触屏手势待验证。复制命令、真实接入、辅助技术与降低动态效果的运行行为未执行。

## 浏览器交付的前端代码

首页响应包含 HTML、内联脚本，以及构建后的 CSS 和 JavaScript。在首页声明的公开资源中核对了以下实现。

| 功能 | 从交付代码确认的行为 | 资源 |
| --- | --- | --- |
| 吸顶导航 | HTML 内联脚本使用 981 px 下限判断桌面，维护展开状态、菜单测量和 Escape 关闭 | [首页 HTML](https://aipay.alipay.com/) · [导航样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/compact-navigation.D5m7HQpL.css) |
| 首屏词槽 | 常规轮换使用 2800 ms 的调度间隔。脚本处理减少动态效果、进入可视区、悬停、焦点和标签页可见性 | [HeroSolutionTitle JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HeroSolutionTitle.astro_astro_type_script_index_0_lang.3oMC6rZy.js) |
| 命令条 | 使用 Clipboard API 写入完整命令，分别呈现复制成功与失败提示 | [HeroCommandDock JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HeroCommandDock.astro_astro_type_script_index_0_lang.9-MWQZWv.js) |
| 产品故事 | 根据 760 px 查询选择桌面或手机视觉容器，并用 IntersectionObserver 管理可见区工作 | [HomeProductScrolly JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HomeProductScrolly.astro_astro_type_script_index_0_lang.Dyr3OKE5.js) |
| 快速对比 | 列高亮逻辑处理焦点进入和离开，动效逻辑检测减少动态效果 | [ProductOverviewSections JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ProductOverviewSections.astro_astro_type_script_index_0_lang.BZTd3CaQ.js) |
| 跨区助手形体 | 固定渲染层 `#aipay-bubble-guide` 以 `--guide-x`、`--guide-y`、`--motion-pose` 和飞行比例更新姿态。产品优先寻找 `data-summary-berth`，其次使用 `data-story-berth`。首页紧凑断点为 980 px | [ReleaseTopBar JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ReleaseTopBar.astro_astro_type_script_index_0_lang.YKRW4vnd.js) · [助手样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ReleaseTopBar.DSoAWSDD.css) · [ProductSummaryCover JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ProductSummaryCover.astro_astro_type_script_index_0_lang.COqTBgBw.js) |
| 开发者工具 | Chrome 1963 × 1040 取证时，视窗从距顶 464 px 进入，之后固定在 80 px。吸顶后首场先停留，继续纵滚可见横向位移 −566 px。CSS 的桌面轨道间距为 64 px，脚本在宽 ≤980 px、高 ≤640 px 或减少动态效果时使用纵向布局 | [HomeDeveloperFeatures JS](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HomeDeveloperFeatures.astro_astro_type_script_index_0_lang.DXowlldD.js) · [场景样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/index.Dt_ZvLL-.css) |

2026-11-15 制作组件模板时复查了首页 HTML 和上列 CSS/JS。首页仍显示 f5dc032a。上表记录静态代码阅读结果。构建产物更新后文件名可能变化。原始组件仓库、构建配置与服务端实现的访问情况未确认。

同日实拍核对了助手在 1440 px 的首屏起步、规模证明区、产品详情停靠和暗底导航四个位置，390 px 首页无跨区形体节点。模板的动效分段与既有示例站的章节对应，详见[动效与滚动标记](motion.md)。

## 构建 df0aeefd 的首页动效复查

- 1440 × 1000 时，伙伴区和数字区分别约 1850 px、3800 px 高。先看到标识沿环形扩散，再进入吸顶数字舞台。多位数字依次穿过接近侧视的姿态，助手在该阶段出现点阵拖尾。 [首页滚动脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-redesign.CfzhckC5.js) · [首页动效样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/home-redesign.ChNwtb08.css)
- 产品区末尾仍可见最后一章时，深色新场从下方遮入。拉绳与助手在交接处合到一起。 [产品离场脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ProductSummaryCover.astro_astro_type_script_index_0_lang.COqTBgBw.js) · [助手脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/ReleaseTopBar.astro_astro_type_script_index_0_lang.YKRW4vnd.js)
- 开发者场景在宽屏由纵滚驱动横移，后段背景逐渐变浅。页脚用显示器式画面呈现移动的像素形体与轮换产品信息。 [开发者场景脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/HomeDeveloperFeatures.astro_astro_type_script_index_0_lang.DXowlldD.js) · [官网](https://aipay.alipay.com/)
- 保障插画进入可视区后才播放。桌面指针位置决定倾斜轴、角度和抬升，离开时缓动复位。 [插画启动脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/TrustClayIllustration.astro_astro_type_script_index_0_lang.DgHHNK8k.js) · [倾斜脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/trust-card-tilt.BBVCcBaj.js)
