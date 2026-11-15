# skills

个人制作和收集的 Codex、Claude Code 与其他 Agent Skills。单个 skill 直接放在 `skills/` 下；同一来源、互相依赖的一套 skills 放在一个子目录里（如 `skills/hyperframes/`）。

## 单个 skill

| Skill | 用途 | 来源 | License |
|---|---|---|---|
| [aipay-web-design](skills/aipay-web-design) | 给自己的产品或简历做官网。附带可运行的网页示例，包含首屏、导航、滚动换场、立体卡片和页脚。 | 独立实现，参考 [支付宝 AI 付官网](https://aipay.alipay.com/) | 未声明 |
| [hand-drawn-canvas-animation](skills/hand-drawn-canvas-animation) | 用 JavaScript + Canvas 2D 制作“手绘感”短片：铅笔/墨水/丝网印刷/涂鸦叠照片等画风，支持逐帧姿态动画、真实动作描摹（转描）、沙画和立体纸艺；输出可播放的 HTML 影片和离线 MP4。适合手绘动画、动画讲解视频、程序化短片。不适合做 UI 动效或幻灯片。 | [alesha-pro/tools](https://github.com/alesha-pro/tools/tree/main/skills/hand-drawn-canvas-animation) @ `dc0083c` | MIT |

## HyperFrames（`skills/hyperframes/`）

HeyGen 开源的“写 HTML → 渲染成 MP4 视频”框架的官方 skills。来源：[heygen-com/hyperframes](https://github.com/heygen-com/hyperframes/tree/main/skills) @ `29378b6`，Apache-2.0。收录了官方“核心套件”（前 10 个，其他 skill 都依赖它们）+ 3 个常用创作流程。

**入口：先用 `hyperframes`**，它会根据需求自动路由到下面的流程和领域 skill。

### 创作流程

| Skill | 用途 |
|---|---|
| [faceless-explainer](skills/hyperframes/faceless-explainer) | 把文章、笔记、主题或简报做成“无出镜”讲解视频，画面按场景生成（排版、抽象图形、图解、数据可视化）。适合知识讲解、概念拆解、教程、清单类视频。 |
| [product-launch-video](skills/hyperframes/product-launch-video) | 把产品/营销网址、脚本或简报做成产品发布/推广视频：SaaS 宣传、功能发布、产品演示、网站导览。 |
| [motion-graphics](skills/hyperframes/motion-graphics) | 短小、以动效为主的动态图形：动态文字、数字滚动、图表动效、Logo 片头、下三分之一字幕条、动态地图、推文/新闻卡片、网页 UI 动效等。 |

### 核心套件

| Skill | 用途 |
|---|---|
| [hyperframes](skills/hyperframes/hyperframes) | **总入口/路由**。任何“做视频、动画、动态图形”的请求先读它，它判断该走哪个流程；也用于检查、诊断、预览、发布和批量渲染已有项目。 |
| [hyperframes-core](skills/hyperframes/hyperframes-core) | 视频合成（composition）的基本规则：HTML 结构、`data-*` 时间属性、轨道、子合成、变量、确定性渲染和校验。写合成 HTML 前必读。 |
| [hyperframes-cli](skills/hyperframes/hyperframes-cli) | HyperFrames 命令行的完整开发流程：初始化、预览、检查、截帧、渲染、发布、云渲染、配音、转写、抠图等；也用于排查构建/渲染失败。 |
| [hyperframes-animation](skills/hyperframes/hyperframes-animation) | 所有动画知识：动效规则、多段场景模板、转场，以及 GSAP / Lottie / Three.js / Anime.js / CSS / WAAPI / TypeGPU 七种动画引擎的用法。 |
| [hyperframes-creative](skills/hyperframes/hyperframes-creative) | 动画以外的创意方向：设计规范、配色、字体、旁白、节奏规划、音频驱动画面、构图和品牌风格。 |
| [hyperframes-keyframes](skills/hyperframes/hyperframes-keyframes) | 镜头类关键帧：推拉、缩放、重新构图、Ken Burns、运镜、甩镜转场、路径/遮罩/SVG 变形、3D 景深等。 |
| [hyperframes-audio](skills/hyperframes/hyperframes-audio) | 已放入视频的音频混音：淡入淡出、交叉淡化、音量自动化、人声出现时压低背景音乐，以及 EQ、压缩、混响等效果。 |
| [hyperframes-registry](skills/hyperframes/hyperframes-registry) | 从官方组件库搜索并安装现成效果（CRT 扫描线、故障、胶片颗粒、图表、终端窗口、地图、彩带等），避免手写。 |
| [hyperframes-studio](skills/hyperframes/hyperframes-studio) | 在 Studio 里打开的项目该如何组织时间线（字幕轨、每轨一种元素、场景拆子合成）以及字幕/关键内容的安全区。 |
| [media-use](skills/hyperframes/media-use) | 一站式素材处理：背景音乐、音效、图片、图标、品牌 Logo、配音、调色/LUT；素材库找不到时调用 TTS/音乐/图片模型生成；也负责配音、转写、字幕和抠图。 |

> 未收录的官方 skills（embedded-captions、talking-head-recut、music-to-video、pr-to-video、slideshow、general-video、figma、remotion-to-hyperframes）需要时可再补。
