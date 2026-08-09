import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile("index.html", "utf8");
const portfolioHtml = html.replace(
  /<script>\s*\(function guardUnsupportedFileProtocol\(\)[\s\S]*?<\/script>/,
  "",
);
const foundations = await readFile("src/styles/foundations.css", "utf8");

test("the document exposes one semantic landmark hierarchy", () => {
  assert.match(portfolioHtml, /<html[^>]+lang="zh-CN"/);
  for (const [name, pattern] of [
    ["main", /<main\b/g],
    ["nav", /<nav\b/g],
    ["footer", /<footer\b/g],
    ["h1", /<h1\b/g],
  ]) {
    assert.equal((portfolioHtml.match(pattern) ?? []).length, 1, `${name} count`);
  }
  assert.match(portfolioHtml, /<nav[^>]+aria-label="Primary"/);
  assert.match(portfolioHtml, /<h1[^>]+class="sr-only"/);
  assert.match(foundations, /\.sr-only\s*\{/);
});

test("navigation targets and content containers match their real purpose", () => {
  assert.doesNotMatch(portfolioHtml, /href=["']#["']/);
  assert.doesNotMatch(portfolioHtml, /href=["']javascript:/);
  assert.match(
    portfolioHtml,
    /class="nav--logo[^>]+href="\/"|href="\/"[^>]+class="nav--logo/,
  );
  assert.match(portfolioHtml, /href="#identity"[^>]+class="button-big/);
  assert.equal(
    (portfolioHtml.match(/<article\b[^>]*class="use-case__block/g) ?? [])
      .length,
    3,
  );
  assert.doesNotMatch(portfolioHtml, /<a\b[^>]+class="use-case__block/);
  assert.doesNotMatch(
    portfolioHtml,
    /<a[^>]+class="link-block[^>]*>\s*<div class="div-hide">\s*<div[^>]*>Linkedin/i,
  );
});

test("decorative and content images expose deliberate alt text", () => {
  assert.equal(
    (portfolioHtml.match(/<img[^>]+src="marquee_logo\.png"[^>]+alt=""/g) ?? [])
      .length,
    4,
  );
  assert.match(portfolioHtml, /alt="深圳大学校园标志"/);
  assert.match(portfolioHtml, /alt="微众银行金融科技学院学习环境"/);
  assert.match(portfolioHtml, /alt="联系 Will 的微信二维码"/);
});

test("contact sources are truthful and keyboard operable", () => {
  assert.doesNotMatch(portfolioHtml, /hi@will\.xyz/);
  assert.ok(
    (portfolioHtml.match(/mailto:hi@will-tech\.xyz/g) ?? []).length >= 2,
  );
  assert.equal(
    (portfolioHtml.match(/<button[^>]+data-copy-wechat/g) ?? []).length,
    2,
  );
  assert.match(
    portfolioHtml,
    /id="toast-container"[^>]+role="status"[^>]+aria-live="polite"/,
  );
});
