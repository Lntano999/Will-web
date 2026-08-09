# Will-web

Static Vite portfolio for WILL.

## Supported local entry

Run `node scripts/manual-preview.mjs` or double-click `Start-Website.bat`, then open `http://127.0.0.1:4173/`. Press `Ctrl+C` in the launcher terminal to stop it. Do not double-click `index.html`.

## Engineering commands

- Tests: `node --test tests/*.test.mjs`
- Build: `node node_modules/vite/bin/vite.js build`
- Full local QA: `node scripts/run-qa-local.mjs`
- Read-only production smoke: `node scripts/qa-production.mjs`

## Delivery model

`commit` saves local history. `push` sends a branch to GitHub. Vercel Preview publishes a review candidate. Production changes only after an explicitly authorized production deployment or merge-connected deployment.

## Safe release order

Local tests/build/QA → push isolated branch → inspect Vercel Preview → human approval → merge/deploy decision. See `docs/runbooks/preview-and-rollback.md` before release.

The scheduled production smoke checks the public site's redirect, animation release, core contact controls, and scrolling every six hours. It observes production only; it does not deploy or roll back anything.
