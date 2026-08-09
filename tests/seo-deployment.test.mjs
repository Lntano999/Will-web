import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile("index.html", "utf8");

test("canonical and social metadata use the public www origin", () => {
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/www\.will-tech\.xyz\/">/,
  );
  assert.match(
    html,
    /<meta property="og:url" content="https:\/\/www\.will-tech\.xyz\/">/,
  );
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/www\.will-tech\.xyz\/og-will-tech\.png">/,
  );
  assert.match(html, /<meta name="twitter:title"/);
  assert.match(html, /<meta name="twitter:description"/);
  assert.match(
    html,
    /<meta name="twitter:image" content="https:\/\/www\.will-tech\.xyz\/og-will-tech\.png">/,
  );
});

test("Person JSON-LD is parseable and conservative", () => {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match);
  const data = JSON.parse(match[1]);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Person");
  assert.equal(data.url, "https://www.will-tech.xyz/");
  assert.match(data.affiliation.name, /深圳大学/);
  assert.equal(data.sameAs, undefined);
});

test("share image and crawler files are deployable", async () => {
  const [png, robots, sitemap] = await Promise.all([
    readFile("public/og-will-tech.png"),
    readFile("public/robots.txt", "utf8"),
    readFile("public/sitemap.xml", "utf8"),
  ]);
  assert.equal(png.toString("ascii", 1, 4), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.match(
    robots,
    /Sitemap: https:\/\/www\.will-tech\.xyz\/sitemap\.xml/,
  );
  assert.match(sitemap, /<loc>https:\/\/www\.will-tech\.xyz\/<\/loc>/);
});

test("Vercel enforces the approved non-visual security headers", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  const headers = new Map(
    config.headers[0].headers.map(({ key, value }) => [key, value]),
  );
  assert.equal(config.headers[0].source, "/(.*)");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(
    headers.get("Referrer-Policy"),
    "strict-origin-when-cross-origin",
  );
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(
    headers.get("Permissions-Policy"),
    "camera=(), microphone=(), geolocation=()",
  );
  assert.equal(headers.has("Content-Security-Policy"), false);
});
