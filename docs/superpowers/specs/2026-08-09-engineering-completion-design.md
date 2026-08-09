# Will-web engineering completion design

Date: 2026-08-09

Status: approved design, pending implementation plan

Branch: `codex/portfolio-industrialization`

## 1. Objective

Complete the remaining engineering foundation for Will-web without changing the manually accepted visual identity, page layout, copy rhythm, branded motion, or preloader duration.

This phase turns the already modularized Vite site into a project that has explicit entry instructions, semantic and accessible HTML, complete search/share metadata, safe deployment headers, reproducible acceptance workflows, production smoke checks, and documented preview/rollback operations.

The site remains a static Vite/Vercel portfolio. No backend, account system, database, framework migration, or production deployment is introduced.

## 2. Verified starting point

The source-modularization phase has already established:

- one Vite application entry at `src/main.js`;
- responsibility-based runtime, interaction, motion, and style modules;
- exact versions of GSAP, Lenis, and anime.js synchronized to local vendor paths;
- a dependency-free preloader fail-open boundary;
- 52 passing Node tests;
- Vite production build and Edge QA across 1920, 1440, 1024, 768, 390, and 360 px;
- vendor-blocked fallback QA at 1440 and 390 px;
- GitHub Actions CI for install, tests, build, browser QA, and screenshot upload.

The user manually accepted the HTTP preview at `http://127.0.0.1:4173/` on 2026-08-09. That accepted rendering is the visual regression baseline for this phase.

The audit also confirmed these remaining engineering gaps:

- no `main`, `nav`, `header`, `footer`, or unique `h1` landmark structure;
- eight `href="#"` placeholders;
- a non-semantic nested `div` mobile menu trigger;
- inconsistent contact behavior, including stale `hi@will.xyz` copy text while the visible address is `hi@will-tech.xyz`;
- incomplete canonical, Open Graph, Twitter, and JSON-LD metadata;
- no `robots.txt`, `sitemap.xml`, or committed share image;
- no Vercel response-header configuration;
- no repository README;
- a stale `Start-Website.bat` that serves the wrong source-root contract;
- no production smoke workflow or explicit preview/rollback runbook;
- normal browser QA accepts any preloader removal before 9 seconds, including an 8-second watchdog release.

## 3. Selected approach

Use a layered engineering closure rather than a minimal metadata patch or a framework migration.

The selected approach adds standards and operational contracts around the existing site. It preserves existing class names and DOM nesting wherever selectors or timelines may depend on them, and it changes element semantics only when the rendered box model can remain identical.

External jQuery, Webflow chunks, and Unicorn Studio are deliberately retained in this phase. Their audit and removal belong to a separate high-risk runtime/visual phase.

## 4. Scope and component design

### 4.1 Supported entry and local acceptance

The supported entries remain:

1. Vite development server;
2. Vite production build plus preview;
3. Vercel Preview;
4. Vercel HTTPS production.

Direct `file://` access remains unsupported. Instead of allowing a partially styled page to appear, an early dependency-free protocol guard will replace the document with a small explanatory message that states the correct local command and makes clear that no website resources were loaded. The guard must not depend on Vite, CSS, GSAP, Webflow, or another script.

`Start-Website.bat` will be replaced by a deterministic manual-acceptance launcher that:

- resolves the repository directory from the batch file location;
- uses the checked-in local Vite installation through Node rather than `npx -y serve`;
- builds the current source before preview;
- starts preview on `127.0.0.1:4173` with strict-port behavior;
- prints the exact acceptance URL;
- never serves the repository root as if it were a deployable output;
- exits visibly on build or port failure.

The README will provide copyable commands for development, production-like preview, tests, QA, stopping the server, Vercel Preview, and production release. It will explicitly distinguish commit, push, preview deployment, and production deployment.

### 4.2 Semantic document structure

The semantic migration will preserve existing class hooks and visual boxes:

- `.navigation` becomes the single `nav` landmark with an accessible name;
- the current `.section-home` root becomes the single `main` landmark;
- the current contact wrapper becomes `footer`;
- the hero receives one screen-reader-only `h1` describing WILL. and the FinTech/quant-development direction;
- Background, Experience, Skills, and About regions receive explicit sectioning and accessible names without adding visible headings;
- decorative headings or repeated marquee copy do not enter the heading outline.

The screen-reader-only utility must not affect layout, masks, intersection thresholds, or animation ownership.

### 4.3 Navigation and keyboard behavior

The outer mobile menu trigger becomes a real `button type="button"` while retaining its class and SVG. Duplicate nested trigger semantics are removed without changing the visible icon.

A focused mobile-navigation controller will own:

- open/close state;
- `aria-expanded` and `aria-controls`;
- Enter/Space through native button behavior;
- Escape close;
- close after selecting a mobile navigation link;
- focus return to the trigger;
- no forced focus movement during ordinary desktop navigation.

The controller must preserve the current CSS classes and the accepted open/close animation. It must not depend on Webflow to provide keyboard correctness.

All active links and buttons receive a visible `:focus-visible` state consistent with the current blue/orange identity. Reduced-motion behavior remains unchanged.

### 4.4 Placeholder links and contact correctness

All eight `href="#"` placeholders are removed according to their true purpose:

- the logo links to `/`;
- the three About cards become `article` elements while retaining their visual classes;
- LinkedIn labels remain visually present but become non-interactive text until a real profile URL exists;
- the WeChat entry becomes a real button that copies `jc3400098970` and announces success or failure through the existing toast region;
- the copyright entry becomes non-interactive text.

The hero “Let's Go!” down-arrow control stops using `javascript:void(0)` and becomes a real same-page link to `#identity`, with an accessible name. Its accepted position and motion-following behavior remain unchanged.

The existing primary contact/QR control is also a real button. Because its element and popup describe WeChat, clicking it copies the WeChat ID rather than an unrelated email address.

All email links consistently use `mailto:hi@will-tech.xyz`. The stale `hi@will.xyz` value is removed from source and tests.

The toast container receives appropriate live-region semantics and copy feedback must remain usable when the Clipboard API is unavailable. No target URL or social account is invented.

### 4.5 Image semantics and fallbacks

The four repeated marquee logos are decorative and use empty alt text. Content-bearing school/identity/college images use concise descriptions of what the card represents without implying employment by WeBank. The QR image identifies itself as the WeChat QR code for contacting Will.

This phase does not redesign or recompress page images. Existing remote `onerror` fallbacks are recorded as remaining runtime debt because replacing them may alter accepted visuals; the new tests prevent adding more remote fallbacks.

### 4.6 Search and share metadata

The canonical public origin is `https://www.will-tech.xyz/`.

The document head will include:

- canonical URL;
- `og:url`;
- a committed absolute `og:image` URL;
- matching Twitter title, description, and image fields;
- locale metadata where appropriate;
- a Person JSON-LD record.

The Person record is intentionally conservative: name, alternate name, site URL, student affiliation, and truthful areas of interest. It does not claim employment, expert status, or unprovided social profiles.

A 1200×630 share image will be captured from the accepted hero identity and committed under `public/`. It is a share artifact only and does not alter the rendered page.

`public/robots.txt` allows normal indexing and references the canonical sitemap. `public/sitemap.xml` contains the canonical homepage with valid XML and no invented routes.

### 4.7 Vercel security headers

Add `vercel.json` with safe, enforceable headers that do not change page rendering:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` denying unused camera, microphone, and geolocation capabilities;
- `X-Frame-Options: DENY`.

Do not add an enforcing Content Security Policy in this phase. The page still contains approved inline reliability code and retained Webflow/Unicorn runtime sources. A permissive CSP would create the appearance of security without materially reducing risk, while a strict CSP would break retained behavior. CSP becomes eligible after the external-runtime and inline-script audit.

Vercel's existing HTTPS/HSTS behavior remains platform-owned.

### 4.8 CI, preview, rollback, and production smoke checks

Extend static contracts to validate:

- unique landmarks and heading structure;
- absence of `href="#"` and `javascript:` navigation targets;
- accurate contact values;
- required SEO and JSON-LD fields;
- share-image dimensions and existence;
- `robots.txt`, `sitemap.xml`, and Vercel headers;
- the local launcher and README commands.

Extend browser QA to verify:

- normal runtime releases the preloader specifically with `animation-complete` rather than watchdog;
- fallback runtime releases with the documented fallback reason;
- Tab focus reaches the mobile trigger and contact controls;
- mobile trigger state, Escape close, link close, and focus return;
- logo, email, WeChat, and non-interactive placeholders behave according to their semantics;
- visual screenshots remain consistent with the accepted baseline.

Add a production smoke script and scheduled/manual GitHub workflow. It will check:

- root domain redirects to canonical `www`;
- canonical document returns HTTP 200;
- preloader releases within the bounded production window;
- the release reason is not watchdog timeout;
- core navigation and contact targets exist;
- the page is scrollable after release.

Because Webflow and Unicorn are retained, known non-critical third-party background failures are reported as warnings rather than allowed to hide a core entry failure. A failed scheduled workflow is the initial monitoring signal; no paid monitoring service or secret is required.

Document Vercel Preview acceptance and rollback as:

```text
isolated branch -> local tests/build/QA -> push branch -> Vercel Preview -> human approval -> merge decision
production regression -> identify last known-good deployment/commit -> Vercel rollback or Git revert -> rerun smoke check
```

No push, Preview deployment, merge, rollback, or production mutation is performed without explicit authorization.

## 5. Failure handling

- Direct-file access fails explicitly with instructions instead of rendering a corrupted partial page.
- A busy preview port produces a visible launcher error rather than silently using another port.
- Missing metadata assets fail static tests before preview.
- Keyboard interaction failures fail focused browser tests.
- Normal preloader watchdog release fails normal-mode QA even though the page eventually becomes visible.
- Vendor-blocked fallback remains a distinct expected path and cannot satisfy the normal-mode assertion.
- Production smoke checks distinguish core-entry failures from retained third-party background warnings.
- Any semantic change that alters computed layout, transform ownership, mask clipping, or reveal timing is a visual regression and must be reverted or corrected in the owning component.

## 6. Delivery phases

### Phase 1: Entry and operational contract

- direct-file guard;
- deterministic Windows acceptance launcher;
- README;
- launcher/build/static tests.

### Phase 2: Semantic and interaction correctness

- landmarks and unique h1;
- mobile navigation controller and keyboard behavior;
- placeholder-link removal;
- contact normalization;
- image semantics and global focus-visible coverage.

### Phase 3: Search, share, and deployment metadata

- canonical/Open Graph/Twitter/JSON-LD;
- share image;
- robots and sitemap;
- Vercel safe headers.

### Phase 4: QA and operations closure

- strict normal/fallback preloader assertions;
- semantic and keyboard browser QA;
- production smoke script/workflow;
- Preview/rollback documentation;
- final multi-viewport visual comparison and verification report.

Each phase is committed independently on the isolated branch so it can be reviewed or reverted without rewriting production history.

## 7. Acceptance criteria

The phase is complete only when all of the following are true:

1. Direct `file://` access shows an explicit instruction page and does not attempt to render the portfolio.
2. `Start-Website.bat` builds and starts the supported Vite preview without `npx` or a global package dependency.
3. The document has exactly one `main`, one `nav`, one `footer`, and one `h1`.
4. No `href="#"` or `javascript:` navigation target remains.
5. Mobile navigation passes mouse, touch-equivalent click, Tab, Enter/Space, Escape, link-close, and focus-return checks.
6. About cards, LinkedIn labels, WeChat controls, copyright, logo, and email expose accurate semantics without changing their accepted visual placement.
7. Every email target is `hi@will-tech.xyz`; every WeChat copy action copies `jc3400098970`; `hi@will.xyz` is absent.
8. Canonical, Open Graph, Twitter, Person JSON-LD, robots, sitemap, and the 1200×630 share image pass static validation.
9. Vercel configuration contains the four approved security headers and no misleading permissive CSP.
10. CI runs static tests, build, browser QA, and screenshot upload; production smoke checks are available on schedule and manual dispatch.
11. Normal browser QA requires `animation-complete`; runtime-blocked QA requires the explicit fallback reason.
12. Existing source/module/runtime tests remain green.
13. Vite build succeeds from a clean checkout with synchronized approved vendor files.
14. Edge QA passes at 1920, 1440, 1024, 768, 390, and 360 px, plus the existing 1440/390 fallback views.
15. Manual review finds no change in content position, waterfall line breaks, mask clipping, horizontal transform ownership, SVG reveal sequence, Methods & Skills timing, About marquee, footer reveal, or reduced-motion final states.
16. The final report explicitly lists retained Webflow/jQuery/Unicorn and remote image fallback debt.
17. No production deployment or `main` mutation occurs in this implementation task.

## 8. Non-goals and deferred work

- changing preloader duration or branded animation design;
- removing jQuery, Webflow chunks, Unicorn Studio, or their visual responsibilities;
- redesigning mobile horizontal storytelling;
- recompressing/replacing accepted page imagery;
- enforcing CSP before the retained-runtime audit;
- adding React, Astro, Next.js, a CMS, a backend, accounts, database, authentication, payment, or protected secrets;
- inventing LinkedIn, GitHub, employment, award, or project claims;
- pushing, merging, or deploying without explicit authorization.

## 9. Rollback boundary

All work remains on `codex/portfolio-industrialization`. The accepted source-modularization commit `6071c24` is the visual and engineering rollback point for this phase. Each delivery phase receives a separate commit, and a failed phase can be reverted independently before any Preview or production action.
