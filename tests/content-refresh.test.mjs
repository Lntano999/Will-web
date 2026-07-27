import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);

async function loadHtml() {
  return readFile(pageUrl, "utf8");
}

test("global positioning reflects quant development without tutoring copy", async () => {
  const html = await loadHtml();

  assert.match(html, /<title>WILL\. \| FinTech Student &amp; Quant Developer<\/title>/);
  assert.match(
    html,
    /name="description"[^>]*content="WILL\. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/,
  );
  assert.match(html, /property="og:title"[^>]*content="WILL\. \| FinTech Student &amp; Quant Developer"/);
  assert.match(html, /property="og:description"[^>]*content="WILL\. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/);

  const heroLines = [
    "用代码构建，",
    "用模型分析，",
    "到真实世界调研，",
    "再把答案讲清楚。",
  ];
  for (const line of heroLines) {
    assert.match(html, new RegExp(`class="one-shot-white-line">${line}<`));
  }

  assert.match(html, /深圳大学微众银行金融科技学院 · 2025级/);
  assert.match(html, /完成大学第一年，持续探索金融、计算与现实问题的交叉地带。/);
  assert.match(html, />Current Focus</);
  assert.match(html, /量化开发 × 金融科技后端/);
  assert.match(html, /用建模、工程实现与真实场景调研，积累可验证的问题解决能力。/);

  assert.match(html, />Background</);
  assert.match(html, />Experience</);
  assert.match(html, />Skills</);
  assert.match(html, />About</);
  assert.match(html, /Build \/ Model \/ Field \/ Speak/);
  assert.match(html, /Quant Development &amp; FinTech Backend/);

  assert.doesNotMatch(html, /Quantitative Researcher|Finance Research/);
  assert.doesNotMatch(html, /家教|tutoring/i);
});
