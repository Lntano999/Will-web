# Obsidian 前端知识原子笔记重构设计

**日期：** 2026-07-29

**状态：** 用户已确认，等待实施

## 1. 目标

将 Obsidian Vault `D:\Obsidian--notes\notion` 中现有的单文件 `前端知识.md` 重构为 `前端知识` 文件夹和一组原子化概念笔记。

这套笔记只记录 Will-web 等真实项目推进过程中遇到、并且会影响工程决策、故障判断或验收的知识。未来按指定学习计划系统学习前端时，使用另一套笔记，不把课程式章节混入本目录。

## 2. 迁移原则

- 一篇笔记只解释一个主要概念。
- 保留一个同名索引 `前端知识/前端知识.md`，使现有 `[[前端知识]]` 双链继续解析。
- 第一阶段使用扁平目录，不提前创建多层分类文件夹。
- 索引按网络、浏览器、构建、测试、可靠性、发布与安全组织链接。
- 现有笔记中的有价值内容拆分后保留；错误、过期、夸大或没有验证依据的内容不原样迁移。
- 当前网站部署平台明确写作 Vercel，不再写成 Cloudflare。
- Cloudflare、DNS、带宽与量化交易之间的类比只能帮助理解，不能写成未经证实的性能或盈利结论。
- 原文件在新目录验证完成前不得删除；迁移完成后通过 Vault Git 历史保留可恢复版本。

## 3. 目标结构

```text
D:\Obsidian--notes\notion\
└─ 前端知识\
   ├─ 前端知识.md
   ├─ DNS.md
   ├─ 带宽.md
   ├─ CDN.md
   ├─ Cloudflare.md
   ├─ Vercel.md
   ├─ 静态网站.md
   ├─ DOM.md
   ├─ 依赖.md
   ├─ 运行时依赖.md
   ├─ 开发依赖.md
   ├─ 依赖本地化.md
   ├─ 版本锁定.md
   ├─ Vite.md
   ├─ 构建产物.md
   ├─ Development Server.md
   ├─ Preview.md
   ├─ CI.md
   ├─ E2E 测试.md
   ├─ 视觉回归.md
   ├─ Fail-open.md
   ├─ Watchdog.md
   ├─ Reduced Motion.md
   ├─ CSP.md
   └─ 回滚.md
```

当原子笔记超过约 50 篇且索引已难以维护时，再评估按主题建立子文件夹。本轮不提前分层。

## 4. 原子笔记模板

每篇概念笔记使用以下结构；不适用的小节可以省略，但“一句话理解”“准确定义”“Will-web 实例”和“相关概念”必须存在。

```markdown
---
type: project-knowledge
domain: frontend
status: growing
---

# 术语

## 一句话理解

## 准确定义

## 在 Will-web 中的实例

## 为什么影响工业化交付

## 常见误解

## 相关概念
```

相关概念使用 Obsidian 双链，例如 `[[依赖]]`、`[[Vite]]`、`[[构建产物]]`。

## 5. 首批内容来源

### 5.1 现有 Obsidian 笔记

- Cloudflare 与 Vercel
- DNS
- 带宽

### 5.2 Will-web 工程知识笔记

从 `docs/notes/will-web-engineering-knowledge.md` 迁移以下概念：

- Spec
- Implementation Plan
- Acceptance Criteria
- 静态网站
- Vite
- 构建产物
- DOM
- 运行时依赖
- 依赖本地化
- Fail-open
- Watchdog
- CI
- E2E / Playwright
- 视觉回归
- Reduced Motion
- Preview Deployment
- 回滚
- CSP
- 版本锁定
- Development Server 与 Preview

Obsidian 成为后续项目驱动知识的主要记录位置。仓库内原知识文档保留为本阶段历史记录，但项目规则改为优先更新 Obsidian 原子笔记，不继续扩写重复内容。

## 6. 内容质量规则

- 先写适用于一般工程的定义，再写 Will-web 实例。
- 明确区分事实、类比、推断和当前项目约定。
- 不把“Cloudflare 节点多”直接推导为中国大陆访问一定更快。
- 不把 DNS 的毫秒差异直接描述为量化交易盈利优势。
- 不把依赖描述为单一特效代码；依赖可以提供函数、类、模块、命令、类型、样式或测试能力。
- 明确区分 CDN 运行时下载与构建时安装后同源托管。
- 对版本、部署平台和当前代码状态等会变化的事实注明 Will-web 上下文。

## 7. 链接与兼容

- 将根目录 `前端知识.md` 的内容拆分完成后移动为 `前端知识/前端知识.md`。
- 因为索引文件 basename 仍是 `前端知识`，现有 `[[前端知识]]` 链接保持有效。
- 迁移前后扫描 Vault 中对 `[[前端知识]]` 和具体概念的引用。
- 不修改 `网站与 App 开发工程化须知（Vibe Coding 版）.md` 中现有 `[[前端知识]]` 链接，除非验证发现 Obsidian 无法解析。

## 8. 验收标准

- 根目录不再保留单体 `前端知识.md`。
- `前端知识/前端知识.md` 存在并链接全部首批原子笔记。
- 每篇原子笔记只有一个主要概念，包含规定的核心小节。
- `[[前端知识]]` 原链接仍能解析到同名索引。
- DNS、带宽、Cloudflare 和 Vercel 的旧内容已拆分并纠正过期事实。
- `依赖.md` 和 `依赖本地化.md` 能准确解释 C++ 库类比、npm、CDN、`node_modules`、`package-lock.json` 和 Vite 构建产物之间的关系。
- 系统课程学习笔记未被移动或混入本目录。
- Vault Git 状态只包含本次明确迁移的 Markdown 文件。
- 迁移提交完成后可以通过 Git 恢复原文件。

## 9. 回滚

- 写入前记录 Vault 当前分支、提交和工作区状态。
- 若 Vault 原本存在未提交修改，不覆盖、不纳入本次提交。
- 先创建和验证新目录，再移动原索引。
- 只提交 `前端知识.md` 迁移及 `前端知识/` 下新文件。
- 若双链或内容验证失败，恢复迁移提交即可回到单文件状态。
