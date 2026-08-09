import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);

async function loadHtml() {
  return readFile(pageUrl, "utf8");
}

async function loadCustomCss() {
  const files = [
    "foundations",
    "skills",
    "navigation",
    "preloader",
    "motion",
    "horizontal",
  ];
  return (
    await Promise.all(
      files.map((name) =>
        readFile(
          new URL(`../src/styles/${name}.css`, import.meta.url),
          "utf8",
        ),
      ),
    )
  ).join("\n");
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
  const customCss = await loadCustomCss();

  assert.match(
    html,
    /<a[^>]+class="evidence-link"[^>]+href="https:\/\/static\.nfnews\.com\/content\/202607\/25\/c12659862\.html\?colID=0&amp;firstColID=24357&amp;appversion=13800&amp;from=weChatMessage&amp;enterColumnId=&amp;date=&amp;layer=3"[^>]+target="_blank"[^>]+rel="noopener noreferrer"[^>]+aria-label="查看陆丰县域发展调研的南方\+公开报道（在新窗口打开）"/,
  );
  assert.match(html, /查看南方\+公开报道/);
  assert.match(customCss, /\.evidence-link:focus-visible\s*\{/);
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
    new URL(
      "../public/evidence/modeling-csee-cup-2026-third-prize-redacted.png",
      import.meta.url,
    ),
  );
  assert.deepEqual(
    [...modelingEvidence.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );

  const englishEvidence = await readFile(
    new URL(
      "../public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg",
      import.meta.url,
    ),
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
    assert.ok(
      html.includes(`<h4 class="skill-title-line">${heading}</h4>`),
      `missing skill heading: ${heading}`,
    );
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
  const customCss = await loadCustomCss();

  const revealOrder = [
    ...html.matchAll(
      /<div class="value-item top-align" style="--reveal-order:\s*([0-3])">/g,
    ),
  ].map((match) => Number(match[1]));
  assert.deepEqual(revealOrder, [0, 1, 2, 3]);
  assert.equal(
    (
      html.match(
        /<div class="mask-line-container skill-title-mask">\s*<h4 class="skill-title-line">/g,
      ) ?? []
    ).length,
    4,
    "every skill title must have its own waterfall mask",
  );
  assert.match(
    customCss,
    /\.w-mod-js\s+\.value-icon\s*\{[\s\S]*?opacity:\s*0[\s\S]*?transform:[\s\S]*?clip-path:\s*inset\(100%\s+0\s+0\)/,
  );
  assert.match(
    customCss,
    /\.w-mod-js\s+\.skill-title-line\s*\{[\s\S]*?opacity:\s*0\s*!important;[\s\S]*?transform:\s*translateY\(115%\)\s*!important;/,
  );
  assert.match(
    customCss,
    /\.w-mod-js\s+\.value-item__line\s*\{[\s\S]*?transform:\s*scaleX\(0\)/,
  );
  assert.match(
    customCss,
    /\.w-mod-js\s+\.value-divider\s*\{[\s\S]*?transform:\s*scaleY\(0\)/,
  );
  assert.match(customCss, /\.value-item\.scroll-reveal-inview\s+\.value-icon/);
  assert.match(
    customCss,
    /\.value-item\.scroll-reveal-inview\s+\.skill-title-line\s*\{[\s\S]*?opacity:\s*1\s*!important;[\s\S]*?transform:\s*translateY\(0\)\s*!important;/,
  );
  assert.match(
    customCss,
    /#tech\s+\.value-item\s+\.scroll-mask-block\s+\.reveal-text-line\s*\{[\s\S]*?transition-delay:\s*calc\(var\(--reveal-order,\s*0\)\s*\*\s*110ms\s*\+\s*var\(--skill-line-delay,\s*260ms\)\)/,
  );
  assert.match(customCss, /\.value-divider\.scroll-reveal-inview/);
  assert.match(
    customCss,
    /\.value-item\.scroll-reveal-inview\s+\.value-icon\s*\{[\s\S]*?opacity:\s*1\s*!important;[\s\S]*?transform:\s*translateY\(0\)\s*scale\(1\)\s*!important;[\s\S]*?clip-path:\s*inset\(0\)\s*!important;/,
  );
  assert.match(
    customCss,
    /\.value-item\.scroll-reveal-inview\s+\.value-item__line\s*\{[\s\S]*?transform:\s*scaleX\(1\)\s*!important;/,
  );
  assert.match(
    customCss,
    /\.value-divider\.scroll-reveal-inview\s*\{[\s\S]*?transform:\s*scaleY\(1\)\s*!important;/,
  );
  assert.match(
    customCss,
    /transition-delay:\s*calc\(var\(--reveal-order,\s*0\)\s*\*\s*80ms\)/,
  );
  assert.match(customCss, /prefers-reduced-motion:\s*reduce/);

  assert.doesNotMatch(html, /new MutationObserver/);
  assert.doesNotMatch(html, /startStyleGuard/);
});

test("footer and skill copy use scoped, moderately slower reveal timing", async () => {
  const html = await loadHtml();
  const customCss = await loadCustomCss();

  assert.match(
    html,
    /function createReveal\(element,\s*options\s*=\s*\{\}\)/,
  );
  assert.match(
    html,
    /duration\s*=\s*0\.8[\s\S]*?stagger\s*=\s*0\.08/,
  );
  assert.match(
    html,
    /createReveal\(targets\.footer,\s*\{\s*duration:\s*1\.05,\s*stagger:\s*0\.14\s*\}\)/,
  );
  assert.match(
    customCss,
    /\.value-item\s+\.scroll-mask-block\s+\.reveal-text-line\s*\{[\s\S]*?transform:\s*translateY\(125%\)[\s\S]*?transition-duration:\s*1\.1s,\s*1\.1s/,
  );
  assert.match(
    customCss,
    /#tech\s+\.value-item\s+\.scroll-mask-block\s+\.reveal-text-line\s*\{[\s\S]*?var\(--reveal-order,\s*0\)\s*\*\s*110ms/,
  );

  for (const [line, delay] of [
    [1, 260],
    [2, 410],
    [3, 560],
    [4, 710],
    [5, 860],
    [6, 1010],
  ]) {
    assert.match(
      customCss,
      new RegExp(
        `mask-line-container:nth-child\\(${line}\\) \\{ --skill-line-delay: ${delay}ms; \\}`,
      ),
    );
  }
});

test("skill title masks reserve glyph headroom without moving the layout", async () => {
  const customCss = await loadCustomCss();
  assert.match(
    customCss,
    /\.mask-line-container\.skill-title-mask\s*\{[\s\S]*?padding-top:\s*0?\.12em;[\s\S]*?margin-top:\s*-0?\.12em;[\s\S]*?padding-bottom:\s*0?\.12em;[\s\S]*?margin-bottom:\s*calc\(0?\.25rem\s*-\s*0?\.12em\);/,
  );
});

test("skill reveal initializes before parser-blocking external resources", async () => {
  const html = await loadHtml();
  const controllerStart = html.indexOf("(function initSkillReveals()");
  const controllerEnd = html.indexOf("</script>", controllerStart);
  const firstExternalScript = html.indexOf("<script src=");

  assert.ok(controllerStart > -1, "missing standalone skill reveal controller");
  assert.ok(
    controllerEnd < firstExternalScript,
    "skill controller must run before external scripts",
  );
  const controller = html.slice(controllerStart, controllerEnd);
  assert.match(controller, /\n\s*init\(\);\s*\n\}\)\(\);/);
  assert.match(controller, /typeof IntersectionObserver === "undefined"/);
  assert.match(
    controller,
    /item\.classList\.contains\("value-item"\)[\s\S]*?item\.nextElementSibling[\s\S]*?classList\.contains\("value-divider"\)[\s\S]*?classList\.add\("scroll-reveal-inview"\)/,
  );
  assert.doesNotMatch(controller, /window\.addEventListener\("load"/);
  assert.doesNotMatch(controller, /DOMContentLoaded/);
});

test("preloader fails open before external animation resources can block the page", async () => {
  const html = await loadHtml();
  const scrollController = await readFile(
    new URL("../src/runtime/scroll-controller.js", import.meta.url),
    "utf8",
  );
  const failOpenStart = html.indexOf("(function installPreloaderFailOpen()");
  const failOpenEnd = html.indexOf("</script>", failOpenStart);
  const firstExternalScript = html.indexOf("<script src=");
  const preloaderControllerStart = html.indexOf("(function initPreloader()");
  const preloaderControllerEnd = html.indexOf(
    "</script>",
    preloaderControllerStart,
  );

  assert.ok(failOpenStart > -1, "missing dependency-free preloader fail-open");
  assert.ok(
    failOpenEnd < firstExternalScript,
    "preloader fail-open must run before every external script",
  );

  const failOpen = html.slice(failOpenStart, failOpenEnd);
  assert.match(failOpen, /const FAIL_OPEN_TIMEOUT_MS = 8_000/);
  assert.match(failOpen, /window\.releasePreloader = releasePreloader/);
  assert.match(failOpen, /classList\.add\("preloader-released"\)/);
  assert.match(failOpen, /classList\.remove\("pre-hidden"\)/);
  assert.match(
    failOpen,
    /window\.dispatchEvent\([\s\S]*?new CustomEvent\("preloader:released"/,
  );
  assert.match(
    scrollController,
    /handlePreloaderReleased = \(\) => instance\?\.start\?\.\(\)[\s\S]*?addEventListener\?\.\("preloader:released", handlePreloaderReleased\)/,
  );
  assert.match(
    failOpen,
    /setTimeout\(\s*\(\) => releasePreloader\("watchdog-timeout"\),\s*FAIL_OPEN_TIMEOUT_MS/,
  );

  const preloaderController = html.slice(
    preloaderControllerStart,
    preloaderControllerEnd,
  );
  assert.match(
    preloaderController,
    /typeof anime === "undefined"[\s\S]*?typeof gsap === "undefined"[\s\S]*?releasePreloader\("animation-runtime-unavailable"\)[\s\S]*?return;/,
  );
  assert.match(
    preloaderController,
    /releasePreloader\("animation-complete"\)/,
  );
  assert.match(
    scrollController,
    /instance = new runtime\.Lenis\(\)[\s\S]*?instance\.on\("scroll", scrollListener\)[\s\S]*?runtime\.gsap\.ticker\.add\(tickerCallback\)/,
  );
});

test("browser QA is reproducible and exercises every horizontal SVG group", async () => {
  const qa = await readFile(
    new URL("../scripts/qa-portfolio.mjs", import.meta.url),
    "utf8",
  );
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.match(packageJson.devDependencies?.playwright ?? "", /^\^?1\./);
  assert.match(qa, /await import\("playwright"\)/);
  assert.match(
    qa,
    /const dividerNames = \["build", "model", "field", "speak"\]/,
  );
  assert.match(
    qa,
    /initialOffsets\.every\([\s\S]*?Math\.abs\([\s\S]*?-\s*1\)\s*<\s*0\.001/,
  );
  assert.match(qa, /oneDevicePixel:\s*1\s*\/\s*window\.devicePixelRatio/);
  assert.match(qa, /rightUnderCoverage\s*>=\s*-3/);
  assert.match(qa, /initialSkillState/);
  assert.match(qa, /titleOpacity/);
  assert.match(qa, /hiddenTextLines/);
  assert.match(qa, /titleMaskHeadroom/);
  assert.match(qa, /titleMaskClearance/);
  assert.match(qa, /textLineDelays/);
  assert.match(qa, /expectedDelay/);
  assert.match(qa, /hiddenSkillTitles/);
  assert.match(qa, /hiddenSkillTextLines/);
  assert.match(qa, /unfinishedSkillRules/);
  assert.match(qa, /unfinishedSkillDividers/);
  assert.match(qa, /const blockExternal = process\.env\.QA_BLOCK_EXTERNAL === "1"/);
  assert.match(qa, /preloaderFailOpen/);
  assert.match(qa, /preloaderFallbackState/);
  assert.match(qa, /const pageErrors = \[\]/);
  assert.match(
    qa,
    /blockExternal[\s\S]*?pageErrors\.length === 0/,
  );
  assert.match(qa, /await page\.waitForTimeout\(2_700\)/);
});

test("horizontal expansion preserves animation timing and explicit line masks", async () => {
  const html = await loadHtml();
  const customCss = await loadCustomCss();

  assert.match(
    html,
    /end:\s*\(\)\s*=>\s*"\+="\s*\+\s*\(getTotalDistance\(\)\s*\+\s*window\.innerHeight\s*\*\s*0\.5\)/,
  );
  assert.match(html, /const getViewportWidth = \(\) => section\.clientWidth/);
  assert.match(
    html,
    /Math\.max\(0,\s*Math\.ceil\(track\.scrollWidth\s*-\s*getViewportWidth\(\)\)\s*\+\s*1\)/,
  );
  assert.match(html, /const minRatio = data\.isDivider \? 0\.35 : 0\.12/);
  assert.match(html, /duration:\s*0\.7,[\s\S]*?ease:\s*"power3\.out",[\s\S]*?stagger:\s*0\.1/);
  assert.match(html, /duration:\s*0\.5,[\s\S]*?ease:\s*"power3\.out"/);
  assert.match(
    customCss,
    /\.svg-draw path\s*\{[\s\S]*?stroke-dasharray:\s*1[\s\S]*?stroke-dashoffset:\s*1/,
  );
  assert.match(customCss, /transition:\s*stroke-dashoffset\s+2\.4s/);
  assert.match(
    customCss,
    /\.svg-draw path:nth-child\(2\)[\s\S]*?transition-delay:\s*0\.14s/,
  );
  assert.match(
    customCss,
    /\.svg-draw path:nth-child\(3\)[\s\S]*?transition-delay:\s*0\.28s/,
  );
  assert.match(
    customCss,
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

test("project cards preserve their one-shot reveal timing in the module owner", async () => {
  const source = await readFile(
    new URL("../src/motion/project-reveals.js", import.meta.url),
    "utf8",
  ).catch(() => "");

  assert.match(source, /start:\s*"top 75%"/);
  assert.match(source, /once:\s*true/);
  assert.equal(source.match(/duration:\s*2\.5/g)?.length, 2);
  assert.match(source, /duration:\s*1\.5/);
  assert.match(source, /stagger:\s*0\.2/);
  assert.match(source, /clearProps:\s*"clipPath,transform,opacity"/);
  assert.match(source, /\},\s*1\.0\s*\)/);
});
