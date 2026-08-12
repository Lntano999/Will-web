# Obsidian Frontend Knowledge MOC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 48 篇 Will-web 项目驱动前端笔记重组为工程生命周期 MOC，并在 Web 产品工程 16 周计划中为每周加入截至 2026-08-12 的项目知识库建议阅读。

**Architecture:** 保留 Vault 中的 `前端知识` 文件夹和 `前端知识.md` 文件名，只重写入口 MOC；课程主计划负责学习顺序，周笔记负责个人实践，原子笔记负责长期概念。所有外部 Vault 文件先复制到工作区 `.artifacts` 形成备份与暂存副本，暂存副本通过链接、周次、编码和内容边界检查后再写回 Vault。

**Tech Stack:** Obsidian Markdown、Wiki links、PowerShell、UTF-8、Git（只跟踪设计与实施计划，不跟踪私人 Vault 内容）

---

## File Map

- Modify: `D:\Obsidian--notes\notion\前端知识\前端知识.md` — 工程生命周期 MOC。
- Modify: `D:\Obsidian--notes\notion\学习计划\Web 产品工程 16 周学习计划（AI 协作型）.md` — 16 周建议阅读。
- Modify: `D:\Obsidian--notes\notion\学习计划\Web 产品工程学习执行手册.md` — 三段式协同规则。
- Create: `.artifacts/obsidian-moc-2026-08-12/backup/*` — 可恢复原文件。
- Create: `.artifacts/obsidian-moc-2026-08-12/staging/*` — 经验证后写回的暂存副本。
- Commit: `docs/superpowers/plans/2026-08-12-obsidian-frontend-knowledge-moc.md` — 本计划。

### Task 1: Create recoverable UTF-8 snapshots

**Files:** the three Vault files and their workspace backup/staging copies.

- [ ] **Step 1: Copy each source to backup and staging**

```powershell
$vault = 'D:\Obsidian--notes\notion'
$root = '.artifacts\obsidian-moc-2026-08-12'
$targets = @(
  '前端知识\前端知识.md',
  '学习计划\Web 产品工程 16 周学习计划（AI 协作型）.md',
  '学习计划\Web 产品工程学习执行手册.md'
)
New-Item -ItemType Directory -Force "$root\backup", "$root\staging" | Out-Null
foreach ($relative in $targets) {
  $name = $relative.Replace('\', '__')
  Copy-Item -LiteralPath "$vault\$relative" -Destination "$root\backup\$name"
  Copy-Item -LiteralPath "$vault\$relative" -Destination "$root\staging\$name"
}
Get-FileHash -Algorithm SHA256 "$root\backup\*.md"
```

Expected: three backup files, three staging files, and three SHA-256 values.

### Task 2: Rewrite the frontend knowledge MOC

**Files:**

- Modify: `.artifacts/obsidian-moc-2026-08-12/staging/前端知识__前端知识.md`
- Read: all `D:\Obsidian--notes\notion\前端知识\*.md`

- [ ] **Step 1: Replace the staging MOC using `apply_patch`**

Keep `type: project-knowledge-index`, `domain: frontend`, and `status: growing`. Add:

```yaml
title: 基于 Will-web 的前端工程知识库
aliases:
  - 前端知识
  - Will-web 前端工程知识
updated: 2026-08-12
```

Set the H1 to `# 基于 Will-web 的前端工程知识库`. Explain that this is a Will-web project knowledge map, not the systematic course notebook.

Use these sections and exact link groups:

1. `00｜如何使用这套知识库` — explain MOC, atomic notes, weekly notes, and course plan responsibilities.
2. `01｜产品定义与工程决策` — `[[Spec]]`, `[[Acceptance Criteria]]`, `[[Implementation Plan]]`, `[[静态网站]]`.
3. `02｜浏览器如何运行网站` — `[[DOM]]`, `[[语义化 HTML]]`, `[[File Protocol]]`, `[[事件循环]]`, `[[浏览器权限]]`, `[[Reduced Motion]]`.
4. `03｜源码与模块边界` — `[[项目目录结构]]`, `[[src 目录]]`, `[[public 目录]]`, `[[scripts 目录]]`, `[[tests 目录]]`, `[[docs 目录]]`, `[[GitHub Actions 工作流目录]]`, `[[module]]`, `[[import]]`.
5. `04｜依赖与构建系统` — `[[依赖]]`, `[[运行时依赖]]`, `[[开发依赖]]`, `[[npm]]`, `[[node_modules]]`, `[[版本锁定]]`, `[[锁文件]]`, `[[Vite]]`, `[[Development Server]]`, `[[Preview]]`, `[[构建产物]]`, `[[依赖本地化]]`.
6. `05｜测试与可靠性` — `[[E2E 测试]]`, `[[Playwright]]`, `[[视觉回归]]`, `[[Smoke Test]]`, `[[Fail-open]]`, `[[Watchdog]]`.
7. `06｜发布、网络与运行环境` — `[[CI]]`, `[[Preview Deployment]]`, `[[Vercel]]`, `[[DNS]]`, `[[CDN]]`, `[[带宽]]`, `[[Cloudflare]]`.
8. `07｜安全与故障恢复` — `[[CSP]]`, `[[安全响应头]]`, `[[回滚]]`.
9. `08｜Will-web 关键工程案例` — use the five reading paths below.

Use descriptive display labels in the MOC, for example `[[CI|CI｜在独立环境重复验证提交]]` and `[[src 目录|src 目录｜可维护源代码]]`; do not rename atomic files.

Case paths:

```text
预加载器卡死：运行时依赖 → Fail-open → Watchdog → Smoke Test
第三方资源本地化：依赖 → 依赖本地化 → 构建产物 → 视觉回归
直接打开 HTML 的页面割裂：File Protocol → Development Server → Preview
单体页面渐进拆分：项目目录结构 → module → src 目录 → Vite
从修改到生产：Acceptance Criteria → tests 目录 → CI → Preview Deployment → Vercel → 回滚
```

- [ ] **Step 2: Verify every atomic note is reachable**

```powershell
$moc = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\staging\前端知识__前端知识.md'
$notes = Get-ChildItem 'D:\Obsidian--notes\notion\前端知识' -File -Filter *.md |
  Where-Object BaseName -ne '前端知识' | Select-Object -ExpandProperty BaseName
$missing = $notes | Where-Object { $moc -notmatch ('\[\[' + [regex]::Escape($_) + '(\||\]\])') }
if ($missing) { throw "MOC missing: $($missing -join ', ')" }
```

Expected: no exception; all 47 atomic notes are reachable.

### Task 3: Add project reading to all 16 weeks

**Files:**

- Modify: `.artifacts/obsidian-moc-2026-08-12/staging/学习计划__Web 产品工程 16 周学习计划（AI 协作型）.md`

- [ ] **Step 1: Insert one block after each week's core concepts and before official materials**

Each block begins:

```markdown
#### 项目知识库建议阅读

> 以下建议基于截至 2026 年 8 月 12 日的知识库状态，用于把课程概念连接到 Will-web 实例，不替代本周官方材料和亲手实验。
```

Use this exact mapping and purpose:

| 周次 | 建议阅读与目的 |
|---:|---|
| 1 | **预习** `[[静态网站]]`：明确网站为什么不需要后端；`[[DOM]]`：区分源文件和页面树；`[[语义化 HTML]]`：理解结构含义；**实验时** `[[File Protocol]]`：观察文件协议与 HTTP 的差异。 |
| 2 | **预习** `[[Reduced Motion]]`：理解运动偏好；**实验时** `[[视觉回归]]`：把多视口截图变成证据；**复盘** `[[语义化 HTML]]`：确认布局没有破坏内容顺序。 |
| 3 | **预习** `[[DOM]]`：明确 JavaScript 修改的对象；`[[事件循环]]`：建立点击、回调与异步顺序；**实验时** `[[浏览器权限]]`：理解剪贴板等 API 的限制。 |
| 4 | **预习** `[[module]]`、`[[import]]`：理解模块关系；`[[运行时依赖]]`：区分声明、下载和执行；**实验时** `[[Fail-open]]`、`[[Watchdog]]`：解释预加载器为何能最终释放。 |
| 5 | **预习** `[[DNS]]`、`[[CDN]]`、`[[带宽]]`：建立网络分层；**实验时** `[[依赖本地化]]`：判断哪些第三方资源应移出关键路径。 |
| 6 | **预习** `[[npm]]`、`[[node_modules]]`、`[[Vite]]`：串起包管理、已安装代码与构建；**实验时** `[[锁文件]]`、`[[构建产物]]`：比较两者能证明什么。 |
| 7 | **预习** `[[Spec]]`、`[[Acceptance Criteria]]`：区分结果和验收；**实验时** `[[语义化 HTML]]`、`[[Reduced Motion]]`：完成键盘、窄屏和动效偏好审查。 |
| 8 | **预习** `[[Implementation Plan]]`、`[[项目目录结构]]`：限定范围和职责；**实验时** `[[module]]`、`[[src 目录]]`：检查 AI 是否重新堆积职责。 |
| 9 | **预习** `[[tests 目录]]`、`[[E2E 测试]]`：区分位置和测试层级；**实验时** `[[Playwright]]`：比较测试成本；**复盘** `[[视觉回归]]`：说明截图能与不能证明什么。 |
| 10 | **预习** `[[Playwright]]`、`[[E2E 测试]]`：围绕用户任务设计路径；**实验时** `[[浏览器权限]]`、`[[Fail-open]]`：注入边界故障；**复盘** `[[Smoke Test]]`：提炼最小关键路径。 |
| 11 | **预习** `[[CI]]`、`[[GitHub Actions 工作流目录]]`：理解独立验证环境；`[[构建产物]]`：确认部署对象；**实验时** `[[Preview Deployment]]`、`[[Vercel]]`：对应提交、预览和证据。 |
| 12 | **预习** `[[CSP]]`、`[[安全响应头]]`：区分浏览器策略与代码；`[[回滚]]`：定义恢复条件；**实验时** `[[Smoke Test]]`、`[[Fail-open]]`：设计发布验证和最低可用状态。 |
| 13 | **预习** `[[静态网站]]`：反向理解何时才需要 API；`[[Acceptance Criteria]]`：把 HTTP 契约写成可验证结果；**复盘** `[[运行时依赖]]`：比较浏览器与服务依赖。注明暂无 FastAPI 专题笔记。 |
| 14 | **预习** `[[开发依赖]]`、`[[版本锁定]]`：连接 pytest、Docker 和可复现环境；**实验时** `[[CI]]`：思考数据库测试如何在独立机器重现。注明暂无 SQLite 或 Docker 专题笔记。 |
| 15 | **预习** `[[运行时依赖]]`、`[[Fail-open]]`：分析前端、API、数据库的失败传播；**实验时** `[[Smoke Test]]`、`[[浏览器权限]]`：验证端到端路径与浏览器边界。 |
| 16 | **预习** `[[Preview Deployment]]`、`[[Vercel]]`、`[[CI]]`：串起候选版本、部署和验证；**实验时** `[[Smoke Test]]`、`[[回滚]]`：完成发布验收和恢复演练。 |

- [ ] **Step 2: Validate counts**

```powershell
$text = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\staging\学习计划__Web 产品工程 16 周学习计划（AI 协作型）.md'
$weeks = ([regex]::Matches($text, '(?m)^### 第 \d+ 周：')).Count
$reads = ([regex]::Matches($text, '(?m)^#### 项目知识库建议阅读$')).Count
$dates = ([regex]::Matches($text, '以下建议基于截至 2026 年 8 月 12 日')).Count
if ($weeks -ne 16 -or $reads -ne 16 -or $dates -ne 16) { throw "$weeks/$reads/$dates; expected 16/16/16" }
```

Expected: 16 weeks, 16 reading blocks, 16 dated notices.

### Task 4: Connect the execution handbook

**Files:**

- Modify: `.artifacts/obsidian-moc-2026-08-12/staging/学习计划__Web 产品工程学习执行手册.md`

- [ ] **Step 1: Insert this section after the Obsidian workspace explanation**

```markdown
### 项目知识库怎样参与每周学习

项目知识库入口：[[前端知识|基于 Will-web 的前端工程知识库]]。

它保存的是在 Will-web 中已经出现、以后仍会复用的工程概念；它不是第二套课程，也不代替本周练习。

1. **学习前：** 阅读本周 2–5 篇建议笔记，不查资料先写下当前理解和疑问。
2. **学习中：** 以独立仓库实验、DevTools、测试和 Git 证据为主；项目笔记不是实验成功的证据。
3. **学习后：** 先用自己的话完成周笔记；只有实验纠正了可跨项目复用的认识时，才更新对应原子笔记。

```text
16 周主计划：规定学什么和验收标准
每周学习笔记：记录预测、实验、证据和复盘
前端工程知识库：保存可以跨周检索和复用的概念
```

建议阅读清单的适用状态截至 2026 年 8 月 12 日。知识库增长后可以更新清单，但不得为了增加链接而打乱课程顺序。
```

- [ ] **Step 2: Validate one workflow section and preserved main-plan link**

```powershell
$text = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\staging\学习计划__Web 产品工程学习执行手册.md'
if (([regex]::Matches($text, '(?m)^### 项目知识库怎样参与每周学习$')).Count -ne 1) { throw 'workflow section count is not 1' }
if ($text -notmatch '\[\[Web 产品工程 16 周学习计划（AI 协作型）\]\]') { throw 'main-plan link was lost' }
if ($text -notmatch '截至 2026 年 8 月 12 日') { throw 'as-of date is missing' }
```

Expected: no exception.

### Task 5: Validate links, encoding, and scope

**Files:** all staging Markdown and all Vault Markdown filenames.

- [ ] **Step 1: Check new wiki-link targets**

```powershell
$known = @{}
Get-ChildItem 'D:\Obsidian--notes\notion' -Recurse -File -Filter *.md | ForEach-Object { $known[$_.BaseName] = $true }
$missing = foreach ($file in Get-ChildItem '.artifacts\obsidian-moc-2026-08-12\staging' -File -Filter *.md) {
  $text = Get-Content -Raw -Encoding UTF8 $file.FullName
  foreach ($match in [regex]::Matches($text, '\[\[([^\]|#]+)')) {
    $target = $match.Groups[1].Value.Trim()
    if (-not $known.ContainsKey($target)) { "$($file.Name): $target" }
  }
}
if ($missing) { throw ($missing -join "`n") }
```

Expected: zero missing link targets.

- [ ] **Step 2: Check UTF-8 and course-plan scope**

```powershell
$moc = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\staging\前端知识__前端知识.md'
if ($moc -notmatch '(?m)^# 基于 Will-web 的前端工程知识库$') { throw 'MOC H1 is incorrect' }
if ($moc.Contains('锟') -or $moc.Contains('�')) { throw 'encoding replacement characters found' }
$before = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\backup\学习计划__Web 产品工程 16 周学习计划（AI 协作型）.md'
$after = Get-Content -Raw -Encoding UTF8 '.artifacts\obsidian-moc-2026-08-12\staging\学习计划__Web 产品工程 16 周学习计划（AI 协作型）.md'
$withoutReadings = [regex]::Replace($after, '(?ms)^#### 项目知识库建议阅读\r?\n.*?(?=^\*\*最小官方材料\*\*)', '')
if ($before -ne $withoutReadings) { throw 'course plan changed outside reading blocks' }
```

Expected: correct Chinese H1, no encoding damage, and no course changes outside reading blocks.

### Task 6: Publish verified staging files

**Files:** replace only the three approved Vault targets.

- [ ] **Step 1: Verify destinations remain under the Vault**

```powershell
$vault = (Resolve-Path 'D:\Obsidian--notes\notion').Path
$destinations = @(
  'D:\Obsidian--notes\notion\前端知识\前端知识.md',
  'D:\Obsidian--notes\notion\学习计划\Web 产品工程 16 周学习计划（AI 协作型）.md',
  'D:\Obsidian--notes\notion\学习计划\Web 产品工程学习执行手册.md'
)
foreach ($destination in $destinations) {
  $parent = (Resolve-Path (Split-Path -Parent $destination)).Path
  if (-not $parent.StartsWith($vault, [StringComparison]::OrdinalIgnoreCase)) { throw "escaped vault: $destination" }
}
```

Expected: no path escapes the intended Vault.

- [ ] **Step 2: Copy staging to the three destinations**

```powershell
$root = '.artifacts\obsidian-moc-2026-08-12\staging'
Copy-Item -Force "$root\前端知识__前端知识.md" 'D:\Obsidian--notes\notion\前端知识\前端知识.md'
Copy-Item -Force "$root\学习计划__Web 产品工程 16 周学习计划（AI 协作型）.md" 'D:\Obsidian--notes\notion\学习计划\Web 产品工程 16 周学习计划（AI 协作型）.md'
Copy-Item -Force "$root\学习计划__Web 产品工程学习执行手册.md" 'D:\Obsidian--notes\notion\学习计划\Web 产品工程学习执行手册.md'
```

Expected: all copies succeed.

- [ ] **Step 3: Repeat Tasks 2–5 validations against the final Vault paths**

Expected: 47/47 notes reachable, 16/16/16 counts, one handbook workflow, zero missing links, correct UTF-8 H1.

- [ ] **Step 4: Compare staging and destination SHA-256 hashes**

For each staging/destination pair, run `Get-FileHash -Algorithm SHA256` and assert equality. Any mismatch blocks completion; restore from `.artifacts/obsidian-moc-2026-08-12/backup` if a partial write occurred.

### Task 7: Repository hygiene and handoff

**Files:** commit only this plan; do not commit `.artifacts` or private Vault content.

- [ ] **Step 1: Check tracked scope**

```powershell
git status --short
git diff --check
```

Expected: only the implementation plan is pending; website HTML, CSS, JavaScript, tests, and deployment configuration are unchanged.

- [ ] **Step 2: Commit the plan**

```powershell
git add -- docs/superpowers/plans/2026-08-12-obsidian-frontend-knowledge-moc.md
git diff --cached --check
git commit -m "docs: plan frontend knowledge MOC update"
```

Expected: one documentation commit; no Vault content enters the website repository.

- [ ] **Step 3: Handoff**

Report that the MOC now follows the delivery lifecycle, all atomic notes retain their existing paths, every course week has dated reading guidance, backups exist, and no website code or visual effect changed.
