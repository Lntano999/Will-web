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
  assert.match(
    html,
    /<span class="reveal-text-line">深圳大学微众银行金融科技学院 · 2025级<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">完成大学第一年，持续探索金融、计算与现实问题<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">的交叉地带。<\/span>/,
  );
  assert.doesNotMatch(
    html,
    /<span class="reveal-text-line">[^<]*现实问题的交叉地带。<\/span>/,
  );
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

test("horizontal experiences present four evidence-driven groups", async () => {
  const html = await loadHtml();
  const experienceOrder = [...html.matchAll(/data-experience="([^"]+)"/g)].map((match) => match[1]);
  const dividerOrder = [...html.matchAll(/data-experience-divider="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(experienceOrder, ["build", "model", "field", "speak"]);
  assert.deepEqual(dividerOrder, ["build", "model", "field", "speak"]);

  assert.match(html, /独立完成个人网站重构与上线/);
  assert.match(html, /第十八届“中国电机工程学会杯”全国大学生电工数学建模竞赛/);
  assert.match(html, /作为队长/);
  assert.match(html, /全国三等奖/);
  assert.match(html, /课题组导师小组组长/);
  assert.match(html, /统筹 5 人协作与沟通/);
  assert.match(html, /“南粤大地写论文”/);
  assert.match(html, /开展为期 11 天的/);
  assert.match(html, /沉浸式蹲点调研。/);
  assert.match(html, /调研日志撰写/);
  assert.match(html, /PPT 文书制作/);
  assert.match(html, /英语口语表达以英式发音为主/);
  assert.match(html, /青衿文化桥英语演讲比赛一等奖/);
  assert.match(html, /CN Stories 英语演讲大赛/);
  assert.match(html, /第六届“用英语讲中国故事大会”/);
  assert.match(html, /广东省级二等奖/);

  assert.match(html, />Build<br\/>Ship</);
  assert.match(html, />Model<br\/>Lead</);
  assert.match(html, />Field<br\/>Research</);
  assert.match(html, />Speak<br\/>Connect</);
});

test("field research links to the public South+ evidence accessibly", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /<a[^>]+class="evidence-link"[^>]+href="https:\/\/static\.nfnews\.com\/content\/202607\/25\/c12659862\.html\?colID=0&amp;firstColID=24357&amp;appversion=13800&amp;from=weChatMessage&amp;enterColumnId=&amp;date=&amp;layer=3"[^>]+target="_blank"[^>]+rel="noopener noreferrer"[^>]+aria-label="查看陆丰县域发展调研的南方\+公开报道（在新窗口打开）"/,
  );
  assert.match(html, /查看南方\+公开报道/);
  assert.match(html, /\.evidence-link:focus-visible\s*\{/);
});

test("award claims link directly to privacy-safe public evidence", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /href="evidence\/modeling-csee-cup-2026-third-prize-redacted\.png"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
  );
  assert.match(
    html,
    /href="evidence\/cn-story-2026-guangdong-second-prize-redacted\.jpg"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
  );

  const modelingEvidence = await readFile(
    new URL("../evidence/modeling-csee-cup-2026-third-prize-redacted.png", import.meta.url),
  );
  assert.deepEqual(
    [...modelingEvidence.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );

  const englishEvidence = await readFile(
    new URL("../evidence/cn-story-2026-guangdong-second-prize-redacted.jpg", import.meta.url),
  );
  assert.deepEqual([...englishEvidence.subarray(0, 3)], [255, 216, 255]);
});

test("four divider icons share the approved framed four-path system", async () => {
  const html = await loadHtml();
  const dividerBlocks = [...html.matchAll(
    /<div class="h-slide side" data-experience-divider="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>/g,
  )];

  assert.equal(dividerBlocks.length, 4);
  assert.deepEqual(dividerBlocks.map((match) => match[1]), ["build", "model", "field", "speak"]);

  for (const [, name, block] of dividerBlocks) {
    assert.match(block, /class="svg-draw"/, `${name} should use the shared draw class`);
    assert.match(block, /viewBox="0 0 58 58"/, `${name} should use the shared 58px viewBox`);
    assert.equal(block.match(/<path\b/g)?.length, 4, `${name} should contain exactly four paths`);
    for (const path of block.match(/<path\b[^>]*>/g) ?? []) {
      assert.match(path, /pathLength="1"/, `${name} paths should use normalized lengths`);
    }
    assert.doesNotMatch(block, /<(circle|rect|mask|filter)\b/, `${name} should be path-only`);
    assert.match(block, /aria-hidden="true"/, `${name} icon should be decorative`);
    assert.match(block, /focusable="false"/, `${name} icon should not receive focus`);
  }

  assert.match(html, /M21 21H37V37H21V21Z/);
  assert.match(html, /M7 43C15 16 43 16 51 43/);
  assert.match(html, /M19\.67 1V57M38\.33 1V57/);
  assert.match(html, /M7 18C14 8 22 8 29 18C36 28 44 28 51 18/);
});

test("skills and About cards use restrained first-year evidence", async () => {
  const html = await loadHtml();

  for (const heading of [
    "Python &amp; Data",
    "C++ &amp; Algorithms",
    "Web &amp; Deploy",
    "Research &amp; Writing",
  ]) {
    assert.ok(html.includes(`<h4>${heading}</h4>`), `missing skill heading: ${heading}`);
  }

  assert.match(html, /使用 pandas 与 yfinance/);
  assert.match(html, /为量化开发和金融科技/);
  assert.match(html, /完成 Cloudflare 部署/);
  assert.match(html, /参与新闻稿初稿撰写。/);
  assert.match(html, /使用 Git 与 LaTeX/);

  assert.match(html, /2025 级金融科技学生/);
  assert.match(html, /英文名 William，也可以叫我 Will/);
  assert.match(html, /把课程问题带入竞赛、项目与真实场景/);
  assert.match(html, /微众银行金融科技学院/);
  assert.match(html, /金融科技专业的学习环境/);

  assert.doesNotMatch(html, /极致安全|深度优化探索|卓越的跨文化|极强的共情力/);
  assert.doesNotMatch(html, /就职于微众银行|任职于微众银行/);
});

test("skill icons and rules reveal locally without a global style patrol", async () => {
  const html = await loadHtml();

  const revealOrder = [
    ...html.matchAll(
      /<div class="value-item top-align" style="--reveal-order:\s*([0-3])">/g,
    ),
  ].map((match) => Number(match[1]));
  assert.deepEqual(revealOrder, [0, 1, 2, 3]);
  assert.match(
    html,
    /\.w-mod-js\s+\.value-icon\s*\{[\s\S]*?opacity:\s*0[\s\S]*?transform:/,
  );
  assert.match(
    html,
    /\.w-mod-js\s+\.value-item__line\s*\{[\s\S]*?transform:\s*scaleX\(0\)/,
  );
  assert.match(
    html,
    /\.w-mod-js\s+\.value-divider\s*\{[\s\S]*?transform:\s*scaleY\(0\)/,
  );
  assert.match(html, /\.value-item\.scroll-reveal-inview\s+\.value-icon/);
  assert.match(html, /\.value-divider\.scroll-reveal-inview/);
  assert.match(
    html,
    /transition-delay:\s*calc\(var\(--reveal-order,\s*0\)\s*\*\s*80ms\)/,
  );
  assert.match(html, /prefers-reduced-motion:\s*reduce/);

  assert.doesNotMatch(html, /new MutationObserver/);
  assert.doesNotMatch(html, /startStyleGuard/);
});

test("horizontal expansion preserves animation timing and explicit line masks", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /end:\s*\(\)\s*=>\s*"\+="\s*\+\s*\(getTotalDistance\(\)\s*\+\s*window\.innerHeight\s*\*\s*0\.5\)/,
  );
  assert.match(html, /const getViewportWidth = \(\) => section\.clientWidth/);
  assert.match(
    html,
    /Math\.max\(0,\s*Math\.ceil\(track\.scrollWidth\s*-\s*getViewportWidth\(\)\)\s*\+\s*2\)/,
  );
  assert.match(html, /const minRatio = data\.isDivider \? 0\.35 : 0\.12/);
  assert.match(html, /duration:\s*0\.7,[\s\S]*?ease:\s*"power3\.out",[\s\S]*?stagger:\s*0\.1/);
  assert.match(html, /duration:\s*0\.5,[\s\S]*?ease:\s*"power3\.out"/);
  assert.match(
    html,
    /\.svg-draw path\s*\{[\s\S]*?stroke-dasharray:\s*1[\s\S]*?stroke-dashoffset:\s*1/,
  );
  assert.match(html, /transition:\s*stroke-dashoffset\s+2\.4s/);
  assert.match(
    html,
    /\.svg-draw path:nth-child\(2\)[\s\S]*?transition-delay:\s*0\.14s/,
  );
  assert.match(
    html,
    /\.svg-draw path:nth-child\(3\)[\s\S]*?transition-delay:\s*0\.28s/,
  );
  assert.match(
    html,
    /\.svg-draw path:nth-child\(4\)[\s\S]*?transition-delay:\s*0\.42s/,
  );
  assert.doesNotMatch(html, /getTotalLength\(/);

  const fixedExperienceLines = [
    ...html.matchAll(/data-experience="(?:model|field|speak)"[\s\S]*?<div class="scroll-mask-block claim-s">([\s\S]*?)<\/div>\s*(?:<a|<div class="div-hide">)/g),
  ];
  assert.equal(fixedExperienceLines.length, 3);
  for (const [, block] of fixedExperienceLines) {
    assert.doesNotMatch(block, /<br\s*\/?>/);
    assert.equal(
      block.match(/class="mask-line-container"/g)?.length,
      block.match(/class="reveal-text-line"/g)?.length,
    );
  }
});

test("field research uses mobile-safe explicit waterfall segments", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /<span class="reveal-text-line">参与省级“南粤大地写论文”<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">开展为期 11 天的<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">沉浸式蹲点调研。<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">赴陆丰开展县域发展调研，<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">共同负责调研日志撰写、<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">PPT 文书制作，<\/span>/,
  );
  assert.match(
    html,
    /<span class="reveal-text-line">及新闻稿初稿撰写。<\/span>/,
  );
  assert.doesNotMatch(
    html,
    /<span class="reveal-text-line">开展为期 11 天的沉浸式蹲点调研。<\/span>/,
  );
});
