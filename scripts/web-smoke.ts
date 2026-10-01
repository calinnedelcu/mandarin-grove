import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:8081");
  await page.getByText("Your Mandarin,").waitFor();
  await mkdir("screenshots", { recursive: true });
  await page.screenshot({ path: "screenshots/today.png", fullPage: true });
  await page.getByRole("button", { name: "Read today's story" }).click();
  await page.getByText("A tiny reading").waitFor();
  await page.screenshot({ path: "screenshots/lesson.png", fullPage: true });
  await page.getByLabel("Close lesson").click();
  await page.getByRole("tab", { name: "Words" }).click();
  await page.getByLabel("Search vocabulary").fill("apple");
  await page.getByRole("button").filter({ hasText: "apple" }).click();
  await page
    .getByRole("button", { name: "Plant this word for review +" })
    .click();
  await page.getByLabel("Close word details").click();
  await page.getByRole("tab", { name: "Review" }).click();
  await page.getByRole("button", { name: "Start spaced review" }).click();
  await page.getByRole("button", { name: "Reveal meaning" }).click();
  await page
    .getByRole("button", { name: "Good · 1 day(s)", exact: true })
    .click();
  await page.getByRole("button", { name: "Meaning detective" }).click();
  for (let i = 0; i < 1; i++) {
    await page.getByRole("button").filter({ hasText: /^A/ }).first().click();
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await page.getByLabel("Close quiz").click();
  await page.getByRole("tab", { name: "Stories" }).click();
  await page.getByRole("button", { name: /A little hello/ }).click();
  await page.getByRole("button", { name: "Check what stuck" }).click();
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button").filter({ hasText: /^A/ }).first().click();
    await page
      .getByRole("button", {
        name: i === 7 ? "See your growth" : "Next question",
      })
      .click();
  }
  await page.getByText("Look at you grow.").waitFor();
  await page.screenshot({ path: "screenshots/quiz-complete.png" });
  await page.getByRole("button", { name: "Back to the grove" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mandarin-grove.v1")!),
  );
  assert.ok(saved.xp > 0);
  assert.ok(saved.cards["39"]);
  assert.deepEqual(saved.completed, ["0"]);
  assert.equal(saved.streak, 1);
  await page.reload();
  await page.getByText("Your Mandarin,").waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("mandarin-grove.v1")!).xp,
    ),
    saved.xp,
  );
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "Passed: mobile layout, lesson, dictionary, SRS, quizzes, XP, streak, completion, reload persistence.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
