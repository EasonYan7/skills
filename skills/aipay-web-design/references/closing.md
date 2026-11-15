# 保障与收尾

2026-11-15 在官网首页构建 df0aeefd 核对了后半页。1440 × 1000 下，保障内容宽 1072 px，卡距约 12 px。第一排由两个单列卡与一个双列高卡组成。模型进入视口后播放，桌面随指针偏转和抬升，离开时缓动复位。收尾先呈现操作，再进入有圆角外壳的页脚。内嵌显示带用像素气泡轮换产品提示。未登录时，官网技术支持会打开登录浮层。 [官网](https://aipay.alipay.com/) · [保障脚本](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/TrustClayIllustration.astro_astro_type_script_index_0_lang.DgHHNK8k.js) · [收尾样式](https://gw.alipayobjects.com/render/p/yuyan/180020010001292425/_astro/FooterClosingCard.Bre5A9Gq.css)

## 挂载

在 `shared.css` 之后加载 `components/closing.css`。挂载函数来自 `components/closing.js`，都可返回清理函数。示例接线见 [demo.js](../assets/frontend-template/demo.js)。

| 入口 | 数据和行为 |
| --- | --- |
| `mountReliability(host, { title, lead, cards })` | `cards` 是 `{ title, text, kind }` 数组。内置原生模型有 `records`、`trace`、`verify`、`branch`、`retry`、`receipt`。六张卡在 981 px 起启用不等高网格，中间宽度两列，560 px 及以下一列。视口内播放微动，细指针可控倾斜，离开后逐步复位。 |
| `mountClosing(host, { title, copy, actions })` | `actions` 使用 `{ label, href }`。包含助手落点 `.aw-closing__landing`。 |
| `mountSupport(host, { links, markTrigger })` | 固定技术支持按钮可以与导航停靠的助手共用一个对话框。传入本产品真实帮助链接，支持 Escape、关闭后焦点回到入口和选择后跳转。北屿云作示例使用本页链接。 |
| `mountScrollMark(host, options)` | 可选 `ending: { tools, closing, runway }` 依次提供开发者区、收尾落点和 CRT 容器。标记从导航出发，经开发者区右侧掠过，收尾阶段放大，临近 CRT 时缩小并像素化，最终返回导航。设置 `interactive: true` 时可取返回值的 `trigger` 传给 `mountSupport`。 |

品牌标记的姿态依赖实际滚动坐标。校对开发者末场、正文收尾和 CRT 进入时的位置，同时从底部向上滚动验证逆向过渡。保留支持入口的键盘通路，固定按钮应与安全区、首屏动作和底部导航保持间距。模型离开视口或标签页隐藏时停止连续播放，减少动态效果下保留静态内容和所有操作。

模板的模型由 CSS 体块和材质层构成。示例数据、造型、逐帧调度和支持服务均来自本地实现。验收可从 [保障区](http://127.0.0.1:8765/index.html#reliability)、[收尾](http://127.0.0.1:8765/index.html#closing) 和 [开发者末场](http://127.0.0.1:8765/index.html#tools-workflow) 分别进入。
