# Preview and rollback runbook

## Candidate flow

1. Work on an isolated branch/worktree.
2. Run `node --test tests/*.test.mjs`.
3. Run `node node_modules/vite/bin/vite.js build`.
4. Run `node scripts/run-qa-local.mjs` and inspect screenshots.
5. Push the isolated branch only with explicit authorization.
6. Open the Vercel Preview URL and repeat the human visual checklist.
7. Merge or deploy only after explicit approval.

## Rollback

1. Confirm the production symptom with `npm run qa:production` or an equivalent direct Node command.
2. Identify the last known-good deployment and Git commit.
3. Prefer Vercel's last known-good deployment rollback for urgent recovery, or `git revert <bad-commit>` for auditable source rollback.
4. Rerun production smoke and inspect root/www manually.
5. Record the incident cause and prevention test.

No push, merge, deployment promotion, rollback, or production mutation occurs without explicit authorization.
