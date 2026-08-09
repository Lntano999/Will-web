# Will-web engineering completion verification

Verified on 2026-08-10 (Asia/Shanghai) in the isolated branch
`codex/portfolio-industrialization`.

## Outcome

The engineering-completion scope is implemented without redesigning the site's
brand language. Will-web now has a reproducible Vite entry/build path, localized
critical motion dependencies, semantic and keyboard-correct structure, complete
sharing metadata, safe response-header configuration, stricter local browser QA,
and a documented production smoke/rollback loop.

The isolated branch has been pushed and is under review in GitHub PR #2. It has
not been merged into `main`, promoted to Vercel production, rolled back, or used
for any other production mutation.

## Supported entry and delivery model

- Supported local acceptance runs through `node scripts/manual-preview.mjs` or
  `Start-Website.bat`, then serves the production build at
  `http://127.0.0.1:4173/`.
- Directly opening `index.html` is explicitly unsupported and shows a small HTTP
  preview instruction page rather than a broken portfolio.
- `commit` preserves local history, `push` publishes a branch, Vercel Preview is
  the review candidate, and production changes only after explicit approval.
- Candidate and rollback operations are documented in
  `docs/runbooks/preview-and-rollback.md`.

## Semantic/accessibility changes

- The document uses `zh-CN`, one `h1`, and explicit `nav`, `main`, `section`,
  `article`, and `footer` responsibilities.
- Navigation keeps real fragment links; smooth scrolling augments rather than
  replaces native anchors.
- The mobile menu exposes a button, `aria-expanded`, Escape close, focus return,
  link close, and keyboard selection of Skills.
- A real event-owner conflict was fixed: smooth anchor scrolling now uses
  `stopPropagation()` instead of blocking the mobile menu's same-link listener
  with `stopImmediatePropagation()`.
- Both WeChat interactions are buttons and copy `jc3400098970`; email controls
  use `mailto:hi@will-tech.xyz`; passive LinkedIn/copyright items are non-links.
- Existing reduced-motion behavior remains supported, while the normal brand
  animation path is still tested separately.

## SEO/share/deployment changes

- Canonical URL, Open Graph URL/image/locale, Twitter image metadata, conservative
  Person JSON-LD, `robots.txt`, and `sitemap.xml` are included.
- `public/og-will-tech.png` is a 1200×630 brand-consistent share image.
- `vercel.json` configures `nosniff`, Referrer-Policy, Permissions-Policy, and
  frame denial. These headers are configuration in this branch and are **not
  live** before an authorized Vercel deployment.
- Current portfolio copy now names Vercel as the deployment platform. The two
  corrections are text-only and preserve the existing explicit line breaks,
  waterfall-mask elements, reveal classes, and animation ownership.
- A strict CSP was deliberately not claimed while the page still retains inline
  code and approved remote/Webflow-era resources.
- `.github/workflows/production-smoke.yml` provides manual and six-hour scheduled
  smoke execution after the branch/workflow is authorized and published.

## Exact commands and pass counts

| Gate | Command | Result |
| --- | --- | --- |
| Static regression | Node 22.12.0: `node --test tests/*.test.mjs` | 74/74 pass |
| Source syntax | `node --check` for every `src/**/*.js` plus QA scripts | pass |
| Vendor synchronization | `node scripts/sync-vendor-assets.mjs` | 9 approved files synchronized |
| Production build | `node node_modules/vite/bin/vite.js build` | 18 modules transformed; exit 0 |
| Full browser QA | `node scripts/run-qa-local.mjs` | 6 normal + 2 fallback + direct-entry pass |
| Focused real interaction | 390 normal plus 1440/390 fallback | pass after fresh build |
| Port cleanup | `Get-NetTCPConnection -LocalPort 4173 -State Listen` | no listener |
| Production smoke contract | `node --test tests/production-smoke-contract.test.mjs` | 2/2 pass |
| Dependency audit | npm 10.9.0: `npm ci --ignore-scripts` | 21 packages audited; 0 vulnerabilities |

The browser runner deliberately blocks remote Webflow, Unicorn, and remote-image
requests. Their `ERR_BLOCKED_BY_CLIENT` notes are expected evidence that local
critical dependencies and fail-open behavior were exercised; they were not
accepted as normal-runtime release substitutes.

## Browser viewport matrix

| Mode | Viewports | Required release | Result |
| --- | --- | --- | --- |
| Normal local production build | 1920, 1440, 1024, 768, 390, 360 | `animation-complete`; watchdog rejected | pass |
| Critical vendor blocked | 1440, 390 | `animation-runtime-unavailable` fail-open | pass |
| Direct file | 1280 | explicit unsupported-entry message | pass |

The normal round also verifies horizontal ownership/travel, all four SVG divider
groups, Methods & Skills waterfall timing, footer reveal, reduced motion, semantic
contacts, scrolling, and stable evidence availability.

## Manual keyboard/contact results

The plan's human checklist was encoded into and executed by real Edge/Playwright
at 390 px, with additional contact checks at all normal/fallback viewports:

1. Space opens the mobile menu and sets `aria-expanded=true` — pass.
2. Escape closes it and returns focus to the trigger — pass.
3. Reopen, focus Skills, press Enter, close the panel, and reach `#tech` — pass.
4. Activate both WeChat buttons and observe an `jc3400098970 已复制` toast — pass.
5. Email targets equal `mailto:hi@will-tech.xyz` — pass.
6. About cards are `article` elements; LinkedIn/copyright placeholders are passive
   `span` elements and cannot cause fake `href="#"` jumps — pass.

## Visual baseline comparison

- Baseline and final 1920 full-page, 1440 Skills, 390 normal, and 390 dependency
  fallback images were inspected with the page in a deterministic visible end
  state. No section split, mask clipping, hidden fallback hero, footer overflow,
  or broken mobile layout was accepted.
- The browser's initial full-page capture was found to be nondeterministic after
  scrolling animated layers. QA now uses an isolated reduced-motion visual
  context and a non-persisted viewport paint before full-page capture. Motion is
  still tested first in the normal interactive page, so visual stability does
  not weaken animation coverage.
- Four stable evidence-file comparisons are byte-identical:

| Evidence | SHA-256 | Match |
| --- | --- | --- |
| normal evidence 1 | `37F1CED0E7519961F38143A9FD7C68579C2401FAF295037ECBD62A03D18F03EE` | yes |
| normal evidence 2 | `D48682335E83776CE14754C311C780B1410B4D567CEF40DBF61DFF84664FEBDA` | yes |
| fallback evidence 1 | `37F1CED0E7519961F38143A9FD7C68579C2401FAF295037ECBD62A03D18F03EE` | yes |
| fallback evidence 2 | `D48682335E83776CE14754C311C780B1410B4D567CEF40DBF61DFF84664FEBDA` | yes |

- The production JavaScript and CSS bundles are byte-identical before and after
  the deployment-wording and lockfile corrections:

| Asset | SHA-256 before and after | Match |
| --- | --- | --- |
| `index-CJjL5W7D.js` | `04C76D1A2E48D2BE39EB17BCC92AF859E792D1361DD2AA10238DEB64D9A8E352` | yes |
| `index-y2gYOMbI.css` | `F21031E450A07C1344BE3B7989E84532900CEAF37DE4E13196DE90B167D5C8D4` | yes |

## Dependency security and deployment-source truth

- The transitive development dependency `nanoid` is locked at `3.3.18`, which
  includes the fix for GHSA-2v37-7h3g-55p8. It is a build-tool dependency, not a
  runtime package downloaded by site visitors.
- The repository contains Vercel configuration and GitHub verification
  workflows, but no tracked Cloudflare Workers/Wrangler deployment workflow.
  A Cloudflare deployment result that still appears on GitHub is therefore an
  external GitHub App/integration status; it cannot be disabled by editing this
  repository and does not replace the Vercel deployment path.

## Production smoke status before deployment

The read-only live smoke reached the canonical site and proved that the current
production page redirects correctly, releases with `animation-complete`, exposes
the email target, and scrolls. It correctly failed the new contract because
production still has the old non-semantic logo/navigation and zero semantic
WeChat buttons. `/favicon.ico` currently returns 404 and is retained as a
non-blocking warning.

This is an expected pre-deployment difference. The smoke contract was not
weakened and production was not changed to manufacture a pass.

## Retained Webflow/jQuery/Unicorn/remote-image debt

- Webflow chunks and jQuery remain as remote legacy runtime requests.
- Unicorn Studio and one remote Webflow image remain optional external resources.
- The local critical path is protected, but these optional resources can still
  fail or affect decorative output; QA records their failures as notes.
- Inline styles/scripts and retained external sources prevent an honest strict
  CSP at this stage.
- A later removal should be behavior-by-behavior with visual regression, not a
  blind deletion or framework rewrite.

## Project-driven knowledge notes

The Obsidian vault received `语义化 HTML.md`, `安全响应头.md`, `Smoke Test.md`, and
three new index links. Source/destination SHA-256 matched for all four writes:

- `语义化 HTML.md`: `786CD0185DA53FD3DA5DC2D1AB077EB3B6ED0F25ADAF2E3C0F7422D0C3DA7FC3`
- `安全响应头.md`: `BCA8B77E864CBFC535292D15FDF84B28F8AB0A4FD8229A2E076E4C095B244F8D`
- `Smoke Test.md`: `62AB7A40E5750995CF685A239216C258689D90BE3E875B3CF8AB85BB7E33412F`
- `前端知识.md`: `DEFE7667CE4FDDFE5F76780B328B4AD13B842BB7F1AD62859CA427381B0CE31B`

## Rollback commit chain

Each phase is independently reversible on the isolated branch:

1. `c29fe30` — supported local acceptance entry
2. `6f79bed` — semantic document structure
3. `f3eb4fe` — mobile keyboard navigation
4. `0ba64b3` — accessible contact controls
5. `8cdc264` — SEO and sharing metadata
6. `7948e04` — safe Vercel response headers
7. `36fb4ba` — strict entry/semantic browser contracts
8. `454e640` — production smoke and rollback runbook
9. `dc2647a` — cooperative mobile anchor events and stable visual QA

Use the runbook to identify the last known-good point. A source rollback uses
`git revert <bad-commit>`; an urgent production rollback uses Vercel's last
known-good deployment only after explicit authorization.

## Production status: PR only, not merged or deployed

The verified work is on branch `codex/portfolio-industrialization` and GitHub PR
#2. Vercel has produced a protected Preview candidate for the branch, but the PR
has not been merged into `main` and no production deployment was authorized.
Production headers, scheduled smoke, semantic controls, and the final fixes are
therefore not claimed as live.
