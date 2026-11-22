import assert from "node:assert/strict";

export async function verifyMobileExperience(page) {
  const cards = page.locator("#research [data-experience]");
  assert.deepEqual(
    await cards.evaluateAll((items) => items.map((item) => item.dataset.experience)),
    ["build", "model", "field", "speak"],
  );

  // Scroll only the document. scrollIntoView could move a clipped ancestor and
  // expose content that normal page scrolling cannot reach.
  for (const card of await cards.all()) {
    const name = await card.getAttribute("data-experience");
    const link = card.locator("a.evidence-link");
    const hasEvidence = name !== "build";
    assert.equal(await link.count(), hasEvidence ? 1 : 0, `Evidence links on ${name}`);
    const target = hasEvidence ? link : card;
    await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      window.scrollBy(0, rect.top + rect.height / 2 - innerHeight / 2);
    });
    const reachable = await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2, rect.top + rect.height / 2,
      );
      return element.contains(hit);
    });
    assert.ok(reachable, `Document scrolling must reach ${name}`);
    await page.waitForFunction((name) => {
      const card = document.querySelector(`[data-experience="${name}"]`);
      const text = card.querySelectorAll("h2, .claim-s, .split-text-line, .reveal-text-line");
      return text.length > 0 && [...text].every((line) => {
        const style = getComputedStyle(line);
        return Number(style.opacity) >= 0.99 && (
          style.transform === "none" || Math.abs(new DOMMatrix(style.transform).m42) < 1
        );
      });
    }, name, { timeout: 5_000 });
  }
  const beforeSkills = await cards.last().evaluate((card) => {
    const skillsTop = document.querySelector("#tech").getBoundingClientRect().top;
    return card.getBoundingClientRect().bottom <= skillsTop + 1;
  });
  assert.ok(beforeSkills, "Skills must follow the last experience card");
}
