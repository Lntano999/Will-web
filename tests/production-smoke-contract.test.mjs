import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [script, workflow, runbook, ci, packageJsonText] = await Promise.all([
  readFile("scripts/qa-production.mjs", "utf8").catch(() => ""),
  readFile(".github/workflows/production-smoke.yml", "utf8").catch(() => ""),
  readFile("docs/runbooks/preview-and-rollback.md", "utf8").catch(() => ""),
  readFile(".github/workflows/ci.yml", "utf8"),
  readFile("package.json", "utf8"),
]);
const packageJson = JSON.parse(packageJsonText);

test("production smoke checks canonical entry and usable release", () => {
  assert.equal(
    packageJson.scripts["qa:production"],
    "node scripts/qa-production.mjs",
  );
  assert.match(script, /https:\/\/will-tech\.xyz\//);
  assert.match(script, /https:\/\/www\.will-tech\.xyz\//);
  assert.match(script, /animation-complete/);
  assert.match(script, /watchdog-timeout/);
  assert.match(script, /scrollY/);
  assert.match(script, /Production core contract failed/);
  assert.match(script, /favicon\.ico/);
});

test("scheduled smoke and rollback documentation are explicit", () => {
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /npm run qa:production/);
  assert.match(runbook, /Vercel Preview/);
  assert.match(runbook, /last known-good/);
  assert.match(runbook, /git revert/);
  assert.match(runbook, /without explicit authorization/);
  assert.match(ci, /npm run qa:offline/);
  assert.match(ci, /portfolio-qa/);
});
