# Portfolio Foundation, Vite, and CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Freeze the verified `d7f8456` behavior, add a reproducible Vite static build, and run the existing regression and offline browser QA in CI without changing the page DOM, copy, or animation behavior.

**Architecture:** Keep `index.html` and `will-tech.core.v1.css` as the source of truth during this slice. Vite processes the existing HTML/CSS and emits a static `dist/`; evidence files move to Vite's `public/` directory so their public URLs remain unchanged. A cross-platform Node wrapper starts `vite preview`, waits for readiness, runs the existing Playwright QA with all external origins blocked, and always terminates the preview process.

**Tech Stack:** Node.js 20.19+ or 22.12+, Vite 8.1, Node test runner, Playwright 1.62, GitHub Actions, Vercel static hosting

---

## Scope and file responsibilities

- `package.json`: declares the supported Node range and the development/build/preview/QA commands.
- `package-lock.json`: locks the exact Vite dependency graph used by CI and future builds.
- `vite.config.mjs`: contains only static build and deterministic preview settings.
- `.gitignore`: excludes generated build and QA artifacts.
- `public/evidence/*`: preserves `/evidence/*` URLs in the Vite output.
- `scripts/run-qa-local.mjs`: owns preview-process startup, readiness polling, QA environment, and cleanup.
- `tests/build-foundation.test.mjs`: guards the build contract, public evidence, offline QA wrapper, and CI workflow.
- `tests/content-refresh.test.mjs`: reads evidence from its new source location while continuing to verify the unchanged public HTML links.
- `.github/workflows/ci.yml`: runs install, static tests, build, offline browser QA, and uploads screenshots.
- `docs/audits/2026-07-29-portfolio-build-baseline.md`: records the reproducible baseline and correct Vercel deployment facts.
- `docs/notes/will-web-engineering-knowledge.md`: adds version locking and build/preview distinctions encountered during this slice.

This plan intentionally does not localize GSAP/Webflow/Lenis/anime.js, change semantic markup, redesign mobile Experience, split the monolithic scripts/styles, change security headers, push the branch, or deploy production. Those are separate plans after this foundation passes.

### Task 1: Add a failing foundation contract test

**Files:**

- Create: `tests/build-foundation.test.mjs`

- [ ] **Step 1: Create the contract test**

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const repoUrl = new URL("../", import.meta.url);

async function readText(relativePath) {
  return readFile(new URL(relativePath, repoUrl), "utf8");
}

test("package scripts expose a reproducible Vite lifecycle", async () => {
  const packageJson = JSON.parse(await readText("package.json"));

  assert.equal(packageJson.engines.node, ">=20.19.0");
  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.scripts.preview, "vite preview");
  assert.equal(packageJson.scripts["qa:offline"], "node scripts/run-qa-local.mjs");
  assert.equal(packageJson.devDependencies.vite, "^8.1.0");

  const viteConfig = await readText("vite.config.mjs");
  assert.match(viteConfig, /outDir:\s*"dist"/);
  assert.match(viteConfig, /emptyOutDir:\s*true/);
  assert.match(viteConfig, /host:\s*"127\.0\.0\.1"/);
  assert.match(viteConfig, /port:\s*4173/);
  assert.match(viteConfig, /strictPort:\s*true/);
});

test("evidence remains available at stable public paths", async () => {
  for (const relativePath of [
    "public/evidence/modeling-csee-cup-2026-third-prize-redacted.png",
    "public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg",
  ]) {
    await access(new URL(relativePath, repoUrl));
  }

  const html = await readText("index.html");
  assert.match(
    html,
    /href="evidence\/modeling-csee-cup-2026-third-prize-redacted\.png"/,
  );
  assert.match(
    html,
    /href="evidence\/cn-story-2026-guangdong-second-prize-redacted\.jpg"/,
  );
});

test("offline QA wrapper owns preview readiness and cleanup", async () => {
  const runner = await readText("scripts/run-qa-local.mjs");

  assert.match(runner, /node_modules\/vite\/bin\/vite\.js/);
  assert.match(runner, /"preview"/);
  assert.match(runner, /QA_ALLOW_OFFLINE:\s*"1"/);
  assert.match(runner, /QA_BLOCK_EXTERNAL:\s*"1"/);
  assert.match(runner, /finally\s*\{[\s\S]*server\.kill\(\)/);
});

test("CI verifies build and offline browser behavior", async () => {
  const workflow = await readText(".github/workflows/ci.yml");

  assert.match(workflow, /node-version:\s*22\.12\.0/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /run:\s*npx playwright install --with-deps chromium/);
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /run:\s*npm run qa:offline/);
  assert.match(workflow, /path:\s*\.artifacts\/qa/);
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```powershell
node --test tests/build-foundation.test.mjs
```

Expected: FAIL because `package.json` has no `engines` field and the Vite config, public evidence directory, QA wrapper, and CI workflow do not exist.

- [ ] **Step 3: Commit the red test**

```powershell
git add tests/build-foundation.test.mjs
git commit -m "test: define portfolio build foundation contract"
```

### Task 2: Add the minimal Vite build lifecycle

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vite.config.mjs`
- Modify: `.gitignore`
- Test: `tests/build-foundation.test.mjs`

- [ ] **Step 1: Replace `package.json` with the build lifecycle**

```json
{
  "name": "will-web",
  "private": true,
  "engines": {
    "node": ">=20.19.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test tests/*.test.mjs",
    "qa:portfolio": "node scripts/qa-portfolio.mjs",
    "qa:offline": "node scripts/run-qa-local.mjs"
  },
  "dependencies": {
    "animejs": "^4.4.1"
  },
  "devDependencies": {
    "playwright": "^1.62.0",
    "vite": "^8.1.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.mjs`**

```js
import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});
```

- [ ] **Step 3: Add generated directories to `.gitignore`**

Append exactly:

```gitignore

# Generated build and browser QA artifacts
dist/
.artifacts/
```

- [ ] **Step 4: Install the locked Vite dependency**

Run:

```powershell
npm install
```

Expected: exit 0; `package-lock.json` contains a `node_modules/vite` entry in the supported `8.1.x` line.

- [ ] **Step 5: Run the focused package/config contract**

Run:

```powershell
node --test --test-name-pattern="package scripts" tests/build-foundation.test.mjs
```

Expected: PASS for the package/config subtest; the other subtests are skipped by the name filter.

- [ ] **Step 6: Run the initial Vite build**

Run:

```powershell
npm run build
```

Expected: exit 0; `dist/index.html` and a generated CSS asset exist. Evidence URLs may still be absent until Task 3.

- [ ] **Step 7: Commit the Vite lifecycle**

```powershell
git add package.json package-lock.json vite.config.mjs .gitignore
git commit -m "build: add reproducible Vite lifecycle"
```

### Task 3: Preserve evidence URLs through the Vite public directory

**Files:**

- Move: `evidence/modeling-csee-cup-2026-third-prize-redacted.png` → `public/evidence/modeling-csee-cup-2026-third-prize-redacted.png`
- Move: `evidence/cn-story-2026-guangdong-second-prize-redacted.jpg` → `public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg`
- Modify: `tests/content-refresh.test.mjs`
- Test: `tests/build-foundation.test.mjs`
- Test: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Move evidence with Git history preserved**

```powershell
New-Item -ItemType Directory -Force public/evidence
git mv evidence/modeling-csee-cup-2026-third-prize-redacted.png public/evidence/modeling-csee-cup-2026-third-prize-redacted.png
git mv evidence/cn-story-2026-guangdong-second-prize-redacted.jpg public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg
```

- [ ] **Step 2: Update source-file reads without changing public HTML links**

In `tests/content-refresh.test.mjs`, replace:

```js
new URL("../evidence/modeling-csee-cup-2026-third-prize-redacted.png", import.meta.url)
```

with:

```js
new URL(
  "../public/evidence/modeling-csee-cup-2026-third-prize-redacted.png",
  import.meta.url,
)
```

Replace:

```js
new URL("../evidence/cn-story-2026-guangdong-second-prize-redacted.jpg", import.meta.url)
```

with:

```js
new URL(
  "../public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg",
  import.meta.url,
)
```

Do not change either `href="evidence/..."` in `index.html`; Vite copies `public/evidence` to `dist/evidence`, preserving the production URLs.

- [ ] **Step 3: Run evidence and content tests**

Run:

```powershell
node --test tests/build-foundation.test.mjs tests/content-refresh.test.mjs
```

Expected: the public-evidence and all existing content tests pass; QA-wrapper and CI subtests still fail because their files do not exist.

- [ ] **Step 4: Build and verify public evidence output**

Run:

```powershell
npm run build
Test-Path dist/evidence/modeling-csee-cup-2026-third-prize-redacted.png
Test-Path dist/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg
```

Expected: build exits 0 and both `Test-Path` calls return `True`.

- [ ] **Step 5: Commit the public evidence move**

```powershell
git add public/evidence tests/content-refresh.test.mjs
git commit -m "build: preserve evidence in Vite output"
```

### Task 4: Add a cross-platform offline QA runner

**Files:**

- Create: `scripts/run-qa-local.mjs`
- Test: `tests/build-foundation.test.mjs`

- [ ] **Step 1: Create `scripts/run-qa-local.mjs`**

```js
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const viteBin = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const qaScript = fileURLToPath(
  new URL("./qa-portfolio.mjs", import.meta.url),
);
const baseUrl = "http://127.0.0.1:4173/";
const outputDir = path.join(repoDir, ".artifacts", "qa");

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`process exited with code ${code} signal ${signal}`));
    });
  });
}

async function waitForPreview() {
  const deadline = Date.now() + 15_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
      lastError = new Error(`preview returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Vite preview did not become ready: ${lastError?.message}`);
}

const server = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
  {
    cwd: repoDir,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

try {
  await waitForPreview();
  const qa = spawn(process.execPath, [qaScript, baseUrl], {
    cwd: repoDir,
    stdio: "inherit",
    env: {
      ...process.env,
      QA_ALLOW_OFFLINE: "1",
      QA_BLOCK_EXTERNAL: "1",
      QA_OUTPUT_DIR: outputDir,
    },
  });
  await waitForExit(qa);
} finally {
  server.kill();
}
```

- [ ] **Step 2: Run the focused wrapper contract**

Run:

```powershell
node --test --test-name-pattern="offline QA wrapper" tests/build-foundation.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run a built offline QA**

Run:

```powershell
npm run build
npm run qa:offline
```

Expected: `Portfolio QA passed for 6 responsive viewports.` Screenshots exist under `.artifacts/qa`; all external runtime failures are expected notes, not test failures.

- [ ] **Step 4: Confirm the preview process was cleaned up**

Run:

```powershell
Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
```

Expected: no output.

- [ ] **Step 5: Commit the offline QA runner**

```powershell
git add scripts/run-qa-local.mjs tests/build-foundation.test.mjs package.json
git commit -m "test: run offline portfolio QA against Vite preview"
```

### Task 5: Add the CI quality gate

**Files:**

- Create: `.github/workflows/ci.yml`
- Test: `tests/build-foundation.test.mjs`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - "codex/**"

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.12.0
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Chromium
        run: npx playwright install --with-deps chromium

      - name: Run static regression tests
        run: npm test

      - name: Build static site
        run: npm run build

      - name: Run offline browser QA
        run: npm run qa:offline

      - name: Upload QA screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: portfolio-qa
          path: .artifacts/qa
          if-no-files-found: error
```

- [ ] **Step 2: Run the CI contract test**

Run:

```powershell
node --test --test-name-pattern="CI verifies" tests/build-foundation.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run the full static suite**

Run:

```powershell
npm test
```

Expected: all previous 18 tests plus the four foundation tests pass.

- [ ] **Step 4: Commit the CI workflow**

```powershell
git add .github/workflows/ci.yml tests/build-foundation.test.mjs
git commit -m "ci: verify build and offline browser behavior"
```

### Task 6: Record the corrected build baseline and learning

**Files:**

- Create: `docs/audits/2026-07-29-portfolio-build-baseline.md`
- Modify: `docs/audits/2026-07-27-portfolio-architecture-professionalism-review.md`
- Modify: `docs/notes/will-web-engineering-knowledge.md`

- [ ] **Step 1: Create the build baseline record**

```markdown
# Will-web Vite 迁移基线

**基线日期：** 2026-07-29
**源提交：** `d7f84564d8321fd59ab8c2151dde723233751c9d`
**首个工程化分支：** `codex/portfolio-industrialization`

## 已验证事实

- 生产托管平台是 Vercel。
- 根域 `https://will-tech.xyz/` 返回 308 并跳转到 `https://www.will-tech.xyz/`。
- `www` 返回 200；迁移前生产 HTML 与本地基线文件一致。
- 迁移前静态回归测试为 18/18。
- 迁移前离线 QA 覆盖 1920、1440、1024、768、390、360 六档视口并通过。
- 所有第三方资源被阻断时，预加载器会自行释放，导航和滚动恢复。

## Vite 基础阶段不变量

- 不改变首页文案、经历、证据公开 URL、DOM 层级或固定断句。
- 不改变四组 SVG、桌面横向位移、结尾覆盖和 Methods & Skills reveal timing。
- 不本地化动画依赖；该工作属于下一独立阶段。
- 不推送 `main`，不部署生产。

## 复现命令

```powershell
npm ci
npm test
npm run build
npm run qa:offline
```

QA 截图生成在 `.artifacts/qa`，CI 会把该目录保存为 `portfolio-qa` 构建产物。
```

- [ ] **Step 2: Correct the old audit deployment and P0 statements**

In `docs/audits/2026-07-27-portfolio-architecture-professionalism-review.md`:

- replace the static-host description that names Cloudflare Pages with Vercel;
- mark the preloader fail-open P0 as resolved by dependency-free early release, immediate missing-runtime release, the 8-second watchdog, and offline QA;
- update the static-test count from 15 to 18 where the report describes the current baseline;
- retain the external-runtime dependency risk as unresolved.

Do not rewrite unrelated professional-content conclusions.

- [ ] **Step 3: Add version-locking knowledge**

Append to `docs/notes/will-web-engineering-knowledge.md`:

```markdown
### Version Pinning（版本锁定）

**是什么：** 在项目清单中声明可接受版本范围，并在 lockfile 中记录实际安装的精确版本及依赖树。

**在 Will-web 中：** `package.json` 声明 Vite 8.1 系列，`package-lock.json` 固定 CI 和本地构建实际使用的精确版本。

**为什么重要：** 公共 CDN 或不受控的 `latest` 可能在没有修改网站代码时改变行为；版本锁定让同一提交能够重复构建和回滚。

### Development Server 与 Preview

**是什么：** Development server 面向编码调试，提供快速更新；Preview 用本地服务器检查已经生成的生产构建产物。

**在 Will-web 中：** `npm run dev` 用于开发，`npm run build` 生成 `dist/`，`npm run preview` 和 `qa:offline` 验证 `dist/`。

**为什么重要：** 只验证开发服务器不能证明真正准备部署的文件能够正常运行。
```

- [ ] **Step 4: Run document and static verification**

Run:

```powershell
git diff --check
node --test tests/*.test.mjs
```

Expected: exit 0; no whitespace errors; all static tests pass.

- [ ] **Step 5: Commit the baseline documentation**

```powershell
git add docs/audits/2026-07-29-portfolio-build-baseline.md docs/audits/2026-07-27-portfolio-architecture-professionalism-review.md docs/notes/will-web-engineering-knowledge.md
git commit -m "docs: record Vite migration baseline"
```

### Task 7: Final phase verification

**Files:**

- Verify only; do not modify source unless a verification failure identifies a scoped defect.

- [ ] **Step 1: Start from a clean dependency install**

Run:

```powershell
npm ci
```

Expected: exit 0 and package-lock remains unchanged.

- [ ] **Step 2: Run every static regression**

Run:

```powershell
npm test
```

Expected: 22 tests pass, 0 fail.

- [ ] **Step 3: Build the deployable artifact**

Run:

```powershell
npm run build
```

Expected: exit 0; `dist/index.html`, generated CSS/assets, and both `dist/evidence` files exist.

- [ ] **Step 4: Run six-viewport offline browser QA**

Run:

```powershell
npm run qa:offline
```

Expected: `Portfolio QA passed for 6 responsive viewports.`

- [ ] **Step 5: Verify the source and build contracts**

Run:

```powershell
git diff --check
git status --short
Get-FileHash -Algorithm SHA256 index.html
Select-String -Path dist/index.html -Pattern "用代码构建|CN Stories|static.nfnews.com"
```

Expected:

- no whitespace errors;
- only intentional plan-progress edits, if any, remain;
- source hash is reported for audit traceability;
- all three content patterns are present in the built HTML.

- [ ] **Step 6: Record the phase result without publishing**

Update the implementation plan checkboxes to reflect the commands actually run and commit only that progress update:

```powershell
git add docs/superpowers/plans/2026-07-29-portfolio-foundation-vite-ci.md
git commit -m "docs: record foundation implementation result"
```

Do not push the branch, create a pull request, or deploy Vercel production.
