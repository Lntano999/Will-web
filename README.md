# Will-web

Static Vite portfolio for WILL.

## Supported local entry

From the project directory, use Node.js 22.12 or later on the 22.x line (CI uses 22.12.0), or Node.js 24. Run `npm ci` on first checkout and after lockfile changes.

Run `npm run acceptance:local` or double-click `Start-Website.bat` on Windows. The launcher runs `npm run build` and serves the result at `http://127.0.0.1:4173/`. Press `Ctrl+C` in the launcher terminal to stop it.

## Engineering commands

- Tests: `npm test`
- Build: `npm run build` synchronizes the self-hosted animation libraries into the production output.
- Full local QA: install Chromium once with `npx playwright install chromium`, then run `npm run build` followed by `npm run qa:offline`.
- Read-only production smoke: `node scripts/qa-production.mjs`

## Delivery model

`commit` saves local history. `push` sends a branch to GitHub. Vercel Preview publishes a review candidate. Production changes only after an explicitly authorized production deployment or merge-connected deployment.

## Safe release order

Local tests/build/QA → push isolated branch → inspect Vercel Preview → human approval → merge/deploy decision. See `docs/runbooks/preview-and-rollback.md` before release.

The scheduled production smoke checks the public site's redirect, animation release, core contact controls, and scrolling every six hours. It observes production only; it does not deploy or roll back anything.
