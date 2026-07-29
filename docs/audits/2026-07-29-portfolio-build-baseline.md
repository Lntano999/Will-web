# Will-web Vite 迁移基线

**基线日期：** 2026-07-29

**源提交：** `d7f84564d8321fd59ab8c2151dde723233751c9d`

**首个工程化分支：** `codex/portfolio-industrialization`

## 已验证事实

- 生产托管平台是 Vercel。
- 根域 `https://will-tech.xyz/` 返回 308 并跳转到 `https://www.will-tech.xyz/`。
- `www` 返回 200；迁移前生产 HTML 与本地基线文件一致。
- 迁移前静态回归测试为 18/18。
- Vite 基础阶段新增 5 项构建契约，当前静态测试总数为 23。
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
