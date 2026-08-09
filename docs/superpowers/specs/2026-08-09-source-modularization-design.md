# Will-web 源码模块化设计

**日期：** 2026-08-09

**状态：** 用户已确认书面规格，允许进入实施计划

**实施分支：** `codex/portfolio-industrialization`

**设计基线：** `2beb79b`

## 1. 用户结果

在不改变 Will-web 视觉、文案、DOM 顺序、动画参数和交互效果的前提下，将散落在 `index.html` 中的自定义 CSS 与 JavaScript 拆成职责明确的源码模块。

本批工作的价值是降低后续维护成本和误改风险，而不是重做网站、增加功能或刻意优化加载性能。

## 2. 已验证现状

- `index.html` 仍包含 13 个内联脚本块和 7 个内联样式块。
- 最大内联 CSS 块约 1,016 行；主 Webflow 样式 `will-tech.core.v1.css` 约 6,161 行。
- 横向布局、横向 reveal、项目 reveal、技能 reveal、导航、锚点滚动、自定义光标、Lenis 和预加载器分别由多个脚本块控制。
- 部分模块通过 `window`、顶层 `var lenis` 和脚本标签先后顺序隐式协作。
- GSAP、ScrollTrigger、SplitText、Lenis 和 anime.js 已锁定版本并同步到 `public/vendor/`。
- jQuery、Webflow chunks 和 Unicorn Studio 仍是站外运行时；本批不删除或改写它们。
- 当前 Node 测试为 38 项；浏览器 QA 覆盖 6 个正常视口、2 个依赖阻断视口和此前的 direct-file 入口。

## 3. 支持边界

正式支持的访问方式是：

1. Vite development server；
2. Vite production build 与 preview；
3. Vercel 上的 HTTPS 生产网站。

直接双击源码 `index.html` 的 `file://` 入口不再是产品要求。模块化迁移可以使用标准 ES Modules，不再受本地文件协议限制。

此前 direct-file 修复、测试和文档保留在 Git 历史中。本批将移除：

- `qa:file` 命令；
- `scripts/qa-direct-file.mjs`；
- `run-qa-local` 中的 direct-file 轮次；
- 只为 direct-file 服务的 Vite HTML 路径转换；
- 对应阻断式测试契约。

本地 vendor URL 统一采用 Vite/Vercel 可解析的 `/vendor/` 路径。

## 4. 方案选择

采用“渐进式模块化”，不采用以下两个替代方案：

- **机械搬运脚本：** 虽然风险较低，但继续依赖全局变量和标签顺序，只是把一个大文件变成一组耦合的小文件。
- **一次性完全 ESM 化所有依赖：** 立即把 GSAP、Lenis 和 anime.js 改为 npm import 会同时改变依赖入口、API 边界和运行时序，超出本批行为冻结范围。

本批只把 Will-web 自有代码模块化。第三方动画运行时继续使用已经验证的同源 vendor 文件和全局 API，后续再独立评估 npm ESM 迁移。

## 5. 目标结构

```text
index.html
├─ 页面 DOM、真实内容与固定动画断句
├─ 极少量关键可靠性引导
├─ CSS 入口
└─ JavaScript 模块入口

src/
├─ main.js
├─ runtime/
│  ├─ animation-runtime.js
│  └─ scroll-controller.js
├─ motion/
│  ├─ preloader.js
│  ├─ horizontal-layout.js
│  ├─ horizontal-reveals.js
│  ├─ project-reveals.js
│  ├─ skill-reveals.js
│  └─ one-shot-reveals.js
├─ interactions/
│  ├─ navigation.js
│  ├─ anchor-scroll.js
│  ├─ contact.js
│  └─ custom-cursor.js
└─ styles/
   ├─ index.css
   ├─ foundations.css
   ├─ navigation.css
   ├─ horizontal.css
   ├─ sections.css
   └─ motion.css
```

具体文件可以在实施计划中根据实际职责合并，但不得重新形成无边界的通用脚本或循环依赖。

## 6. 有意保留的例外

### 6.1 Webflow 基础 CSS

`will-tech.core.v1.css` 本批保持完整。它是现有视觉的基础层，立即拆分会扩大选择器顺序和优先级的回归面。

### 6.2 dependency-free fail-open

最早执行的预加载 fail-open 可以保留为小型内联引导。它必须在第三方运行时和常规模块之前安装；若把它变成另一个必须成功获取的外部文件，会削弱其最后安全层的作用。

该例外必须具备明确注释、固定职责和体积上限，不能成为继续堆放一般业务代码的入口。

### 6.3 解析期可靠性控制器

当前技能 reveal 在阻塞型站外脚本之前初始化。若外部化会改变其故障边界，则第一步允许暂时保留这一小段解析期控制器；只有在浏览器 QA 证明相同降级行为后才能迁出。

## 7. 模块职责与依赖

### 7.1 主入口

`main.js` 是常规功能的唯一组装入口。它按固定顺序注册各模块，不直接实现具体动画。

### 7.2 运行时适配

`animation-runtime.js` 读取并校验现有 `window.gsap`、`window.ScrollTrigger`、`window.SplitText` 和 `window.anime`，向自有模块提供单一边界。具体 motion 模块不重复注册插件或各自判断所有全局变量。

`scroll-controller.js` 创建和持有唯一 Lenis 实例，并提供启动、停止、跳转和原生滚动降级接口。其他模块不得直接创建第二个 Lenis 实例。

### 7.3 动效所有权

- `horizontal-layout.js`：横向轨道位移、pin、缩放和滚动距离。
- `horizontal-reveals.js`：四组文字、箭头和 SVG 的进入状态及时序。
- `project-reveals.js`：Experience 后项目/案例图片区的 mask 与文字 reveal。
- `skill-reveals.js`：Methods & Skills 图标、边框、分隔线和文字状态。
- `one-shot-reveals.js`：首屏与结尾页的一次性白色瀑布文字。
- `preloader.js`：预加载品牌动画和正常完成后的释放请求。

一个 DOM 属性只能有一个主要动效所有者。跨模块协作通过公开函数或状态接口完成，不能依靠多个模块同时写同一元素的 `transform`、`opacity` 或 `clip-path`。

### 7.4 交互模块

导航、锚点滚动、联系方式和自定义光标分别维护自己的事件监听。它们可以调用滚动控制器，但不能访问 Lenis 的内部实例状态。

## 8. 初始化流程

```text
HTML 开始解析
→ 安装 dependency-free fail-open 与 watchdog
→ 加载既有 Webflow 和同源动画运行时
→ 执行 main.js
→ 校验动画运行时并创建共享滚动控制器
→ 按固定顺序注册 motion 与 interaction 模块
→ DOMContentLoaded / load / scroll 触发既有效果
→ 预加载动画正常完成或 fail-open 释放页面
```

ES Module 默认延迟执行，因此 `main.js` 会在 DOM 解析完成后运行；需要早于解析完成安装的可靠性代码不进入该模块。

## 9. 错误与降级

- GSAP 或 anime.js 不可用：立即请求 fail-open 释放预加载器。
- 未知异常：最迟由 8 秒 watchdog 释放。
- Lenis 不可用：保留浏览器原生滚动和原生锚点行为。
- reveal 运行时不可用：目标直接进入完整可读的最终态。
- 非关键模块初始化失败：记录模块名和错误，不得阻断导航、正文和滚动。
- `releasePreloader` 保持幂等，多次调用只执行一次实际清理。

`window.releasePreloader` 是解析期 fail-open 与 ESM 预加载模块之间允许保留的窄全局桥接；其他新模块不得继续扩张 `window` 全局状态。

## 10. 迁移顺序

1. 先以独立提交退役 direct-file 支持，统一 HTTP/Vite 入口及其测试契约。
2. 增加模块边界、初始化顺序和不变行为测试。
3. 保持原顺序拆出内联 CSS。
4. 迁移独立性较高的 skill、project、contact 和 cursor 控制器。
5. 建立唯一滚动控制器，迁移导航与锚点滚动。
6. 迁移横向布局、横向 reveal 和 one-shot reveal。
7. 最后迁移预加载正常动画，并保持解析期 fail-open 独立。
8. 执行完整静态、构建、降级、六视口和视觉回归。

每一步形成独立、可回滚提交。不得把所有脚本一次性搬运后再统一排错。

## 11. 测试设计

### 11.1 静态与模块契约

- `index.html` 只引用一个常规 JavaScript 模块入口。
- 自有大型运行逻辑不再散落在 HTML 内。
- CSS 入口保持原有层叠顺序。
- 每个模块导出明确的注册或初始化接口。
- `main.js` 的组装顺序可被测试读取或通过依赖注入执行。
- 现有内容、断句、奖项、证据和 SVG 契约继续通过。
- 现有测试从新源码文件读取断言，不得因拆分而删除关键行为断言。

### 11.2 构建与浏览器 QA

- Vite build 成功且不存在未解析的本地资源。
- 正常模式覆盖 1920、1440、1024、768、390、360px。
- 依赖阻断模式覆盖 1440px 与 390px。
- 验证预加载释放、导航可见、页面滚动、四组横向 SVG、Methods & Skills 和结尾页。
- reduced-motion 状态保持完整可读。
- 浏览器不得出现新增 page error、console error 或失败的同源请求。

### 11.3 视觉回归

迁移前保存关键状态，迁移后使用同一浏览器、视口和触发位置复核：

- 首屏预加载完成态；
- 四组横向经历进入与最终态；
- Methods & Skills reveal 完成态；
- 结尾页 reveal 完成态；
- 390px 小屏关键阅读状态。

动态效果不能只用单张截图判断；需要同时验证初始状态、触发过程和最终状态。

## 12. 验收标准

- 网站的视觉、文案、DOM 顺序、动效参数和交互结果无有意变化。
- `index.html` 不再承载大段一般 CSS 和 JavaScript。
- 自有代码具有明确入口、单一职责和可追踪依赖关系。
- 每个关键动效目标只有一个主要所有者。
- GSAP、Lenis、anime.js 等本地化运行时继续正常工作。
- fail-open、watchdog、原生滚动与 reduced-motion 不退化。
- 全部 Node 测试、Vite build、正常/降级浏览器 QA 和关键视觉回归通过。
- 当前生产站不受影响；未经用户明确授权不推送 `main` 或部署生产。

## 13. 明确不做

- 不修改文案、视觉设计、动画速度或触发参数。
- 不重做移动端横向 Experience。
- 不删除或复刻 Webflow、jQuery、Unicorn Studio。
- 不把经历和技能抽成 JSON 或客户端渲染内容。
- 不拆分或重写 `will-tech.core.v1.css`。
- 不以性能提升作为本批完成条件。
- 不推送 `main`，不部署生产。

## 14. 回滚策略

- 每个职责模块独立迁移和提交。
- 任一模块出现视觉或行为差异时，只回滚该模块，不覆盖其他已验证迁移。
- 高风险的横向与预加载迁移必须位于后续独立提交。
- 实施结束后才清理过渡代码；在完整 QA 前保留可对照的旧行为证据。
- 生产仍指向既有稳定提交，因此分支失败不会影响线上网站。

## 15. 最终汇报与工程学习

实施过程中由 Codex 完成技术细节判断，不要求用户逐项审核代码。最终汇报使用白话说明：

1. 文件结构发生了什么变化；
2. 为什么更容易维护；
3. 哪些视觉和行为证据证明没有退化；
4. 哪些外部依赖仍然存在；
5. 后续优化应从哪里继续。

本阶段出现且影响决策的可复用概念应写入 Obsidian `前端知识` 原子笔记；不把临时命令和测试噪声写入知识库。
