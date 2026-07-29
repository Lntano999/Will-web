# Obsidian 前端知识原子笔记迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Obsidian Vault 根目录的单体 `前端知识.md` 安全迁移为可持续扩展的原子笔记目录，并保留现有 `[[前端知识]]` 双链兼容性。

**Architecture:** 先在当前可写工作区外的受控暂存目录生成全部 Markdown，再通过结构和内容校验后一次性复制到 Vault；最后将原文件替换为同名索引，并只暂存本次迁移文件。Vault 中迁移前已有的其他未提交内容保持原状。

**Tech Stack:** Obsidian Markdown、YAML frontmatter、Obsidian wikilinks、PowerShell、Git

---

### Task 1: 固定迁移边界与基线

**Files:**
- Modify: `docs/superpowers/specs/2026-07-29-obsidian-frontend-atomic-notes-design.md`
- Read: `D:\Obsidian--notes\notion\前端知识.md`
- Read: `D:\Obsidian--notes\notion\网站与 App 开发工程化须知（Vibe Coding 版）.md`

- [x] **Step 1: 记录 Vault 基线**

Run:

```powershell
git -C 'D:\Obsidian--notes\notion' status --short --branch
git -C 'D:\Obsidian--notes\notion' rev-parse HEAD
```

Expected: branch is `main`, HEAD is recorded, and unrelated dirty files are visible but untouched.

- [x] **Step 2: 修正规格中的实际验收边界**

验收条件写为：Vault 可以保留原有改动，但本次暂存区只能包含根目录 `前端知识.md` 的删除和 `前端知识/` 下的新 Markdown 文件。

- [x] **Step 3: 扫描原双链**

Run:

```powershell
Get-ChildItem -LiteralPath 'D:\Obsidian--notes\notion' -Recurse -Filter '*.md' -File |
  Select-String -SimpleMatch '[[前端知识]]'
```

Expected: existing reference in `网站与 App 开发工程化须知（Vibe Coding 版）.md` is found and does not need editing because the new index keeps the same basename.

### Task 2: 生成索引与网络类原子笔记

**Files:**
- Create: `前端知识/前端知识.md`
- Create: `前端知识/DNS.md`
- Create: `前端知识/带宽.md`
- Create: `前端知识/CDN.md`
- Create: `前端知识/Cloudflare.md`
- Create: `前端知识/Vercel.md`

- [x] **Step 1: 创建分类索引**

索引必须按“项目方法、网站与浏览器、依赖与构建、可靠性与测试、网络与托管、发布与安全”分组，并链接本计划中的全部 29 篇原子笔记。

- [x] **Step 2: 拆分并纠正网络内容**

每篇笔记必须包含 YAML frontmatter、`一句话理解`、`准确定义`、`在 Will-web 中的实例`、`为什么影响工业化交付`、`常见误解`、`相关概念`。

Cloudflare 和 Vercel 笔记必须明确：

- Will-web 当前部署在 Vercel。
- Cloudflare 不等于网站当前部署平台。
- 节点数量不能直接证明中国大陆访问一定更快。

DNS 与带宽笔记不得把毫秒差异或吞吐能力直接写成量化交易盈利结论。

### Task 3: 生成网站、依赖与构建类原子笔记

**Files:**
- Create: `前端知识/静态网站.md`
- Create: `前端知识/DOM.md`
- Create: `前端知识/依赖.md`
- Create: `前端知识/运行时依赖.md`
- Create: `前端知识/开发依赖.md`
- Create: `前端知识/依赖本地化.md`
- Create: `前端知识/版本锁定.md`
- Create: `前端知识/Vite.md`
- Create: `前端知识/构建产物.md`
- Create: `前端知识/Development Server.md`
- Create: `前端知识/Preview.md`

- [x] **Step 1: 写依赖概念链**

`依赖.md` 必须区分 npm、npm registry、package、library、module、dependency 和 `node_modules`，并说明 package 是发布单位，不是 JavaScript 标准库的一部分。

- [x] **Step 2: 写依赖本地化三阶段**

`依赖本地化.md` 必须按以下顺序解释：

```text
npm install → node_modules
Vite build → dist/assets
浏览器访问 → 从 will-tech.xyz 下载构建资源 → 在内存中执行
```

同时说明浏览器不会在每次函数调用时重新请求 CDN，也不会在生产环境直接读取 `node_modules`。

- [x] **Step 3: 写构建与环境概念**

明确 Development Server 用于开发反馈，Preview 用于检查已经生成的 `dist/`，两者不能互相替代。

### Task 4: 生成方法、测试、可靠性与发布类原子笔记

**Files:**
- Create: `前端知识/Spec.md`
- Create: `前端知识/Implementation Plan.md`
- Create: `前端知识/Acceptance Criteria.md`
- Create: `前端知识/CI.md`
- Create: `前端知识/E2E 测试.md`
- Create: `前端知识/Playwright.md`
- Create: `前端知识/视觉回归.md`
- Create: `前端知识/Fail-open.md`
- Create: `前端知识/Watchdog.md`
- Create: `前端知识/Reduced Motion.md`
- Create: `前端知识/Preview Deployment.md`
- Create: `前端知识/CSP.md`
- Create: `前端知识/回滚.md`

- [x] **Step 1: 写项目方法笔记**

Spec 回答“做成什么”，Implementation Plan 回答“按什么顺序实施”，Acceptance Criteria 回答“怎样客观判断完成”。

- [x] **Step 2: 写浏览器测试链**

区分 E2E 测试这种测试方法、Playwright 这种工具，以及视觉回归这种比较页面外观的方法。

- [x] **Step 3: 写可靠性与发布链**

用 Will-web 的预加载器事故解释 Fail-open 和 Watchdog；用六档视口、外部资源阻断、Vercel Preview、独立提交解释 CI、Preview Deployment 和回滚。

### Task 5: 在暂存区执行内容与链接验证

**Files:**
- Test: staged `前端知识/*.md`

- [x] **Step 1: 验证文件数量和模板**

Run a PowerShell validator that asserts:

- exactly 30 Markdown files exist: 1 index + 29 atomic notes;
- every atomic note contains the required YAML and four mandatory sections;
- the index links every atomic note;
- no file contains `TODO` or `TBD`.

Expected: all assertions pass.

- [x] **Step 2: 验证关键事实**

Validator asserts:

- `Vercel.md` says Will-web currently deploys on Vercel;
- `依赖.md` contains npm registry, package, module, library, dependency, and `node_modules`;
- `依赖本地化.md` contains `node_modules`, `dist/assets`, Vite, CDN, and same-origin delivery;
- Cloudflare/DNS notes do not claim the site currently deploys on Cloudflare or that DNS latency determines trading profit.

Expected: all assertions pass.

### Task 6: 迁移到 Vault 并验证 Git 范围

**Files:**
- Delete after successful copy: `D:\Obsidian--notes\notion\前端知识.md`
- Create: `D:\Obsidian--notes\notion\前端知识\*.md`

- [x] **Step 1: 创建目标目录并复制已验证文件**

在确认源目录和目标目录的绝对路径后，将完整暂存目录复制到 `D:\Obsidian--notes\notion\前端知识`。复制成功并核对文件哈希后，才删除根目录旧 `前端知识.md`。

- [x] **Step 2: 验证双链兼容**

确认以下条件：

```text
D:\Obsidian--notes\notion\前端知识.md                 不存在
D:\Obsidian--notes\notion\前端知识\前端知识.md       存在
网站与 App 开发工程化须知中的 [[前端知识]]           保持不变
```

- [x] **Step 3: 只暂存迁移文件**

Run:

```powershell
git -C 'D:\Obsidian--notes\notion' add -- '前端知识.md' '前端知识'
git -C 'D:\Obsidian--notes\notion' diff --cached --name-status
```

Expected: cached diff contains only deletion/rename of the original note and additions under `前端知识/`; unrelated pre-existing changes remain unstaged.

- [x] **Step 4: 提交 Vault 迁移**

Run:

```powershell
git -C 'D:\Obsidian--notes\notion' commit -m 'notes: restructure frontend knowledge into atomic notes'
```

Expected: one recoverable Vault commit containing only the frontend knowledge migration.

### Task 7: 完成后复核

**Files:**
- Verify: `D:\Obsidian--notes\notion\前端知识\*.md`
- Modify: `docs/superpowers/plans/2026-07-29-obsidian-frontend-atomic-notes.md`

- [x] **Step 1: 重新运行全部验证**

Expected: file count, template, links, critical facts, and Vault staged scope checks all pass after the commit.

- [x] **Step 2: 确认未触碰无关内容**

Compare the final Vault status with the recorded baseline. Expected: all unrelated pre-existing changes still exist with the same status, and no unrelated path appears in the migration commit.

- [x] **Step 3: 更新计划勾选并提交 Will-web 文档**

只提交设计规格修正和本实施计划；不推送 Will-web 分支，不部署生产网站。
