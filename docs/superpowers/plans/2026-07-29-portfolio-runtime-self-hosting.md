# Will-web Runtime Dependency Self-Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 GSAP、ScrollTrigger、SplitText、Lenis 和 anime.js 从访客运行时第三方 CDN 请求迁移为 npm 锁定、构建时同步、与 Will-web 同源交付的资源，同时保持现有视觉、同步执行顺序和零依赖 fail-open。

**Architecture:** 本批采用官方 UMD 构建作为兼容桥梁：npm/CI 安装精确版本，`sync-vendor-assets.mjs` 只把经过清单允许的浏览器文件与许可证复制到被忽略的 `public/vendor/`，Vite 再将它们复制进 `dist/vendor/`。这一步不同时迁移 ES modules，避免 module defer 改变当前预加载器和动画全局变量的执行顺序；内联动效拆分作为阶段 2B 独立实施。

**Tech Stack:** Vite 8、npm、GSAP 3.14.2、Lenis 1.3.15、anime.js 4.4.1、Node test runner、Playwright

---

## Scope boundary

本计划包含：

- 本地托管 GSAP core、ScrollTrigger、SplitText、Lenis JS/CSS、anime.js UMD。
- 删除只注册未调用的 GSAP InertiaPlugin 与 Draggable。
- 保留 jQuery、Webflow runtime 和 Unicorn Studio，留待后续按交互所有权单独迁移。
- 保留 `index.html` 现有 DOM、内联动效正文、断句和动画参数。
- 增加“同源依赖正常”和“同源依赖缺失时 fail-open”两种浏览器 QA。

本计划不包含：

- 将现有动画改写为新的效果。
- 把底部内联脚本迁移为 ES modules。
- 移除 Webflow runtime、jQuery 或 Unicorn Studio。
- 推送、合并、创建生产部署。

### Task 1: 用测试定义同源依赖合同

**Files:**
- Create: `tests/dependency-localization.test.mjs`
- Test: `tests/dependency-localization.test.mjs`

- [x] **Step 1: 写会失败的依赖合同测试**

测试读取 `index.html`、`package.json`、`.gitignore` 和 `scripts/sync-vendor-assets.mjs`，断言：

```js
assert.deepEqual(packageJson.dependencies, {
  animejs: "4.4.1",
  gsap: "3.14.2",
  lenis: "1.3.15",
});
assert.equal(packageJson.scripts["sync:vendor"], "node scripts/sync-vendor-assets.mjs");
assert.equal(packageJson.scripts.predev, "npm run sync:vendor");
assert.equal(packageJson.scripts.prebuild, "npm run sync:vendor");
```

并要求 HTML 只使用以下同源路径：

```text
/vendor/gsap/gsap.min.js
/vendor/gsap/SplitText.min.js
/vendor/gsap/ScrollTrigger.min.js
/vendor/lenis/lenis.min.js
/vendor/lenis/lenis.css
/vendor/anime/anime.umd.min.js
```

测试还必须拒绝 `unpkg.com/lenis`、`cdn.jsdelivr.net/npm/animejs`、`cdn.prod.website-files.com/gsap`、`InertiaPlugin` 和 `Draggable`。

- [x] **Step 2: 运行测试并确认红灯**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
```

Expected: FAIL because GSAP and Lenis are not package dependencies and `index.html` still references CDN URLs.

- [x] **Step 3: 提交测试合同**

```powershell
git add -- tests/dependency-localization.test.mjs
git commit -m "test: define self-hosted runtime dependency contract"
```

### Task 2: 锁定依赖并生成受控 vendor 资源

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `scripts/sync-vendor-assets.mjs`
- Generate but do not track: `public/vendor/**`
- Test: `tests/dependency-localization.test.mjs`

- [x] **Step 1: 安装精确版本**

Run:

```powershell
# 标准环境
npm install --save-exact animejs@4.4.1 gsap@3.14.2 lenis@1.3.15

# 当前 Codex Windows 环境的全局 npm launcher 已损坏时，使用已核验的 bundled fallback
& 'C:\Users\lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dlx npm@11.6.2 install --save-exact animejs@4.4.1 gsap@3.14.2 lenis@1.3.15
```

Expected: `package.json` records exact versions without `^` or `~`; lockfile records the complete dependency graph.

- [x] **Step 2: 增加同步脚本与生命周期**

`scripts/sync-vendor-assets.mjs` 必须使用固定 allowlist，从 `node_modules` 复制以下文件：

```text
animejs/dist/bundles/anime.umd.min.js → public/vendor/anime/anime.umd.min.js
gsap/dist/gsap.min.js                 → public/vendor/gsap/gsap.min.js
gsap/dist/SplitText.min.js            → public/vendor/gsap/SplitText.min.js
gsap/dist/ScrollTrigger.min.js        → public/vendor/gsap/ScrollTrigger.min.js
lenis/dist/lenis.min.js               → public/vendor/lenis/lenis.min.js
lenis/dist/lenis.css                  → public/vendor/lenis/lenis.css
```

同时复制三个包的许可证到 `public/vendor/licenses/`。脚本清理前必须确认目标的规范化相对路径恰好是 `public/vendor`，不得对更宽目录执行递归删除。

`package.json` 增加：

```json
{
  "scripts": {
    "sync:vendor": "node scripts/sync-vendor-assets.mjs",
    "predev": "npm run sync:vendor",
    "prebuild": "npm run sync:vendor"
  }
}
```

`.gitignore` 增加 `public/vendor/`，因为这些文件可由 lockfile 和同步脚本重复生成。

- [x] **Step 3: 运行同步并验证资源**

Run:

```powershell
npm run sync:vendor
Get-ChildItem public/vendor -Recurse -File
```

Expected: six runtime files和三份许可证存在；没有 InertiaPlugin 或 Draggable。

### Task 3: 将 HTML 切换到同源 UMD 资源

**Files:**
- Modify: `index.html`
- Test: `tests/dependency-localization.test.mjs`
- Test: `tests/content-refresh.test.mjs`
- Test: `tests/horizontal-animation.test.mjs`

- [x] **Step 1: 替换 Lenis CSS 和五个实际运行时脚本**

保持原脚本相对顺序，将外部 URL 替换为 Task 1 规定的六个 `/vendor/` 路径。Vite 的 `public/` 资源必须从站点根路径引用，避免构建期把相对 URL 当成待解析模块。

- [x] **Step 2: 删除无调用插件**

删除 InertiaPlugin 与 Draggable 的 `<script>` 标签，并把注册清单收窄为：

```js
const availableGsapPlugins = [
  window.SplitText,
  window.ScrollTrigger,
].filter(Boolean);
```

- [x] **Step 3: 运行静态测试**

Run:

```powershell
npm test
```

Expected: 依赖合同和原有 23 项回归测试全部通过。

- [x] **Step 4: 提交同源资源迁移**

```powershell
git add -- package.json package-lock.json .gitignore scripts/sync-vendor-assets.mjs index.html
git commit -m "build: self-host animation runtimes"
```

### Task 4: 保留并验证依赖缺失时的 fail-open

**Files:**
- Modify: `scripts/qa-portfolio.mjs`
- Modify: `scripts/run-qa-local.mjs`
- Modify: `tests/dependency-localization.test.mjs`

- [x] **Step 1: 写会失败的 QA 合同**

静态测试要求 `qa-portfolio.mjs` 读取 `QA_BLOCK_VENDOR`，并要求本地 runner 分两轮执行：

```text
Round 1: QA_BLOCK_EXTERNAL=1, runtime required, all six viewports
Round 2: QA_BLOCK_EXTERNAL=1, QA_BLOCK_VENDOR=1,
         QA_ALLOW_OFFLINE=1, QA_VIEWPORTS=1440,390
```

- [x] **Step 2: 运行测试并确认红灯**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
```

Expected: FAIL because `QA_BLOCK_VENDOR` has not been implemented.

- [x] **Step 3: 实现精确的 vendor 请求阻断**

在 Playwright route 中，仅当请求 URL 与 base origin 相同且 pathname 等于 `/vendor` 或以 `/vendor/` 开头时应用 `QA_BLOCK_VENDOR`。外部资源阻断逻辑保持不变。

第一轮证明第三方网络全部失败时同源动画运行时仍完整；第二轮证明同源动画运行时也不可用时，预加载器在 2.5 秒内以 `animation-runtime-unavailable` 原因释放并恢复导航。

- [x] **Step 4: 运行完整静态测试**

Run:

```powershell
npm test
```

Expected: all tests pass.

### Task 5: 构建、浏览器与视觉回归

**Files:**
- Verify: `dist/vendor/**`
- Verify: `.artifacts/qa/**`
- Modify: `docs/superpowers/plans/2026-07-29-portfolio-runtime-self-hosting.md`
- Modify: Obsidian `前端知识/依赖本地化.md`

- [x] **Step 1: 构建并验证产物**

Run:

```powershell
npm run build
Get-ChildItem dist/vendor -Recurse -File
```

Expected: Vite build succeeds and `dist/vendor/` contains exactly the approved runtime files and licenses.

- [x] **Step 2: 运行双场景浏览器 QA**

Run:

```powershell
npm run qa:offline
```

Expected:

- six responsive viewports pass with GSAP、Lenis、anime.js loaded from same origin;
- 1440px and 390px pass with `/vendor/` blocked and fail-open verified;
- no page errors;
- preview server is cleaned up.

- [x] **Step 3: 审查视觉证据**

检查 `.artifacts/qa/` 中 1920、1024、390 全页截图和 1440 Skills 截图，确认：

- 预加载器正常完成后首屏、导航和文字可见；
- 横向四组 SVG、结尾页和 Methods & Skills 没有裁切或时序退化；
- 390px 页面没有新增横向溢出；
- fallback 截图中的页面内容与导航可用。

- [x] **Step 4: 更新工程知识与计划状态**

在工程知识记录中注明：

- 本批“本地化”使用构建时复制 UMD 的兼容桥梁；
- `node_modules` 不直接部署，`dist/vendor` 才是访客获取的资源；
- 外部 CDN 故障不再影响这五个运行时；
- npm registry 故障仍可能阻止新的安装或构建；
- ES module 拆分属于下一独立批次。

- [x] **Step 5: 最终验证并提交**

Run:

```powershell
npm test
npm run build
npm run qa:offline
git diff --check
git status --short
```

Expected: all checks pass；工作区只包含本计划和知识记录的预期修改。

Commit:

```powershell
git add -- index.html scripts/qa-portfolio.mjs scripts/run-qa-local.mjs tests/dependency-localization.test.mjs docs/superpowers/plans/2026-07-29-portfolio-runtime-self-hosting.md
git commit -m "test: verify self-hosted runtime resilience"
```

不推送、不合并、不部署生产。
