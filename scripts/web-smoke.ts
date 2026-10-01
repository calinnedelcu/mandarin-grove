import { chromium, Page } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { characters, lessons, words } from "../src/content";
import { runDomSmoke } from "./dom-smoke";
const KEY = "mandarin-grove.v1";
async function click(page: Page, name: string | RegExp) {
  const dialogs = page.getByRole("dialog");
  const scope = (await dialogs.count()) ? dialogs.last() : page;
  await scope
    .getByRole("button", { name, exact: typeof name === "string" })
    .click();
}
async function main() {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    if (
      !/MachPortRendezvous|bootstrap_check_in|Permission denied/.test(
        String(error),
      )
    )
      throw error;
    console.log(
      "Chromium launch is blocked by this sandbox (Mach port permission). Running exported-app DOM coverage; visual Chromium QA remains unavailable.",
    );
    await runDomSmoke();
    return;
  }
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const errors: string[] = [];
    const audioCalls: { text: string; rate: number; lang: string }[] = [];
    await context.exposeFunction(
      "recordAudio",
      (text: string, rate: number, lang: string) =>
        audioCalls.push({ text, rate, lang }),
    );
    await context.addInitScript(() => {
      // A controllable device voice verifies queue behavior, without claiming
      // that CI can judge accent quality or install a real native voice.
      class Utterance {
        text: string;
        lang = "";
        rate = 1;
        voice = null;
        onend: (() => void) | null = null;
        onerror = null;
        constructor(text: string) {
          this.text = text;
        }
        addEventListener(name: string, callback: () => void) {
          if (name === "end") this.onend = callback;
        }
      }
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        value: Utterance,
        configurable: true,
      });
      let timer: ReturnType<typeof setTimeout>;
      Object.defineProperty(window, "speechSynthesis", {
        value: {
          getVoices: () => [
            {
              lang: "zh-CN",
              voiceURI: "test-mandarin",
              name: "Test Mandarin",
              localService: true,
              default: true,
            },
          ],
          addEventListener() {},
          removeEventListener() {},
          cancel() {
            clearTimeout(timer);
          },
          speak(u: Utterance) {
            (window as any).recordAudio(u.text, u.rate, u.lang);
            timer = setTimeout(() => u.onend?.(), 800);
          },
        },
        configurable: true,
      });
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:8081");
    await page.getByText("Start as a beginner", { exact: true }).waitFor();
    await mkdir("screenshots", { recursive: true });
    await page.screenshot({
      path: "screenshots/onboarding.png",
      fullPage: true,
    });
    await click(page, "Start as a beginner");
    await click(page, "Let's grow →");
    await page.getByText("Your Mandarin,", { exact: true }).waitFor();
    await page.screenshot({ path: "screenshots/today.png", fullPage: true });
    await page.getByRole("tab", { name: "Stories", exact: true }).click();
    await click(page, "Tea for two · HSK 1");
    await page.getByText("A tiny reading", { exact: true }).waitFor();
    await page.screenshot({ path: "screenshots/lesson.png", fullPage: true });
    await page.getByRole("button", { name: /^茶 ·/ }).first().click();
    await click(page, "Plant this word for review +");
    await page.screenshot({
      path: "screenshots/dictionary.png",
      fullPage: true,
    });
    await click(page, "Close word details");
    await click(page, "Bookmark story");
    await click(page, "Save this grammar pattern +");
    await click(page, "Reader settings");
    await click(page, "English");
    await click(page, "Pinyin");
    await click(page, "32 px");
    await click(page, "Reader settings");
    await click(page, "Play story audio");
    await page.waitForTimeout(100);
    await click(page, "0.65×");
    await page.waitForTimeout(100);
    await click(page, "Pause story audio");
    assert.ok(audioCalls.some((c) => c.lang === "zh-CN"));
    assert.ok(audioCalls.some((c) => c.rate === 0.65));
    await click(page, "Close lesson");
    await page.getByRole("tab", { name: "Review", exact: true }).click();
    await click(page, "Start spaced review →");
    await click(page, "Reveal meaning");
    await click(page, "Good · 1 day(s)");
    await page.getByText("Freshly watered.", { exact: true }).waitFor();
    await click(page, "Back to the grove");
    await page.getByRole("tab", { name: "Stories", exact: true }).click();
    await click(page, "A little hello · HSK 1");
    await click(page, "Check what stuck →");
    for (let i = 0; i < 8; i++) {
      await page.getByText(`QUESTION ${i + 1} OF 8`, { exact: true }).waitFor();
      await page.getByRole("button", { name: /^Answer A:/ }).click();
      await click(page, i === 7 ? "See your growth →" : "Next question →");
    }
    await page.getByText("Look at you grow.", { exact: true }).waitFor();
    await page.screenshot({ path: "screenshots/quiz.png", fullPage: true });
    await click(page, "Back to the grove");
    await page.waitForFunction(
      (key) =>
        JSON.parse(localStorage.getItem(key) || "{}").completed?.includes("0"),
      KEY,
    );
    let p = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      KEY,
    );
    assert.ok(p.xp > 0);
    assert.equal(p.streak, 1);
    assert.equal(p.cards["37"].interval, 1);
    assert.ok(p.bookmarks.includes("3"));
    assert.ok(p.grammarSaved.includes("3"));
    assert.equal(p.settings.pinyin, false);
    assert.equal(p.settings.translation, false);
    assert.equal(p.settings.fontSize, 32);
    assert.equal(p.quizzes.length, 1);
    await page.reload();
    await page.getByText("Your Mandarin,", { exact: true }).waitFor();
    await page.getByRole("tab", { name: "Words", exact: true }).click();
    await page.getByRole("textbox", { name: "Search vocabulary" }).fill("niǎo");
    await click(page, "Word 鸟");
    await page.getByText("bird", { exact: true }).first().waitFor();
    await click(page, "Close word details");
    await page.getByRole("textbox", { name: "Search vocabulary" }).fill("一");
    await click(page, "Word 一");
    await click(page, "Practice writing 一");
    const trace = page.getByLabel("Trace 一, stroke 1 of 1");
    await trace.waitFor();
    await page.screenshot({ path: "screenshots/writing.png", fullPage: true });
    const box = (await trace.boundingBox())!;
    const median = characters["一"].medians![0];
    await page.mouse.move(
      box.x + (median[0][0] / 1024) * 240,
      box.y + ((900 - median[0][1]) / 1024) * 240,
    );
    await page.mouse.down();
    for (const [x, y] of median.slice(1))
      await page.mouse.move(
        box.x + (x / 1024) * 240,
        box.y + ((900 - y) / 1024) * 240,
        { steps: 5 },
      );
    await page.mouse.up();
    await page
      .getByText("Lovely! You wrote the whole character.", { exact: true })
      .waitFor();
    await click(page, "Close word details");
    await page.getByRole("tab", { name: "Stories", exact: true }).click();
    await click(page, "HSK 2");
    await click(page, "A slower morning · HSK 2");
    await click(page, "HSK 3");
    await click(page, "Story comprehension →");
    const l = lessons.find((l) => l.id === "breakfast-3")!;
    for (let i = 0; i < l.checks.length; i++) {
      const q = l.checks[i];
      if (q.options)
        await page
          .getByRole("button", {
            name: new RegExp(
              `^Answer [A-Z]: ${q.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            ),
          })
          .click();
      else {
        await page
          .getByRole("textbox", { name: "Type your answer" })
          .fill(q.answer);
        await click(page, "Check answer");
      }
      await click(
        page,
        i === l.checks.length - 1 ? "See your growth →" : "Next question →",
      );
    }
    await page.getByText("Look at you grow.", { exact: true }).waitFor();
    await click(page, "Back to the grove");
    await click(page, "Sentence building →");
    const prompt = await page
      .getByText(/Put the story’s words back in order/)
      .textContent();
    assert.ok(prompt);
    await click(page, "Close quiz");
    await click(page, "Match pairs");
    const pairButtons = await page.getByRole("button").all();
    assert.ok(pairButtons.length >= 9);
    await click(page, "Close matching practice");
    await click(page, "Hear & name the tone →");
    await click(page, "Play listening question");
    await page.waitForTimeout(100);
    await page.screenshot({
      path: "screenshots/tone-studio.png",
      fullPage: true,
    });
    await click(page, "Close quiz");
    await click(page, "Keyword sprint");
    await page.getByText("KEYWORD SPRINT", { exact: true }).waitFor();
    await click(page, "Close quiz");
    await page.getByRole("tab", { name: "Progress", exact: true }).click();
    await page.screenshot({ path: "screenshots/progress.png", fullPage: true });
    await click(page, "Change level, goal & interests");
    await click(page, "HSK 3");
    await click(page, "100 XP · Curious");
    await click(page, "Done →");
    await page.getByRole("tab", { name: "Today", exact: true }).click();
    await click(page, "Start Grove Radio");
    await page.waitForTimeout(100);
    await page.screenshot({ path: "screenshots/radio.png", fullPage: true });
    await click(page, "Skip story");
    await click(page, "Pause Grove Radio");
    await click(page, "Close Grove Radio");
    // No learning requests are required after loading the exported app.
    await context.setOffline(true);
    await page.getByRole("tab", { name: "Words", exact: true }).click();
    await page.getByRole("textbox", { name: "Search vocabulary" }).fill("茶");
    await click(page, "Word 茶");
    await page.getByText("tea", { exact: true }).first().waitFor();
    await click(page, "Close word details");
    await context.setOffline(false);
    await page.waitForFunction(
      (key) =>
        JSON.parse(localStorage.getItem(key) || "{}").settings?.dailyGoal ===
        100,
      KEY,
    );
    p = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      KEY,
    );
    assert.equal(p.settings.level, 3);
    assert.equal(p.writing["一"], 1);
    assert.ok(p.completed.includes("breakfast-3"));
    assert.equal(p.toneAttempts >= 0, true);
    // Fit at small phone width and a large desktop; navigation remains usable.
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.getByRole("tab", { name: "Today", exact: true }).click();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}px`,
      );
      await page.screenshot({
        path: `screenshots/today-${width}.png`,
        fullPage: true,
      });
    }
    // Load a genuine six-field v1 snapshot in a separate browser storage area.
    const legacyContext = await browser.newContext();
    const legacyPage = await legacyContext.newPage();
    const old = {
      xp: 80,
      streak: 2,
      lastDay: "2026-10-01",
      dailyXP: 20,
      completed: ["3"],
      cards: {
        "37": {
          due: Date.now() + 86400000,
          interval: 4,
          reviews: 2,
          lapses: 0,
        },
      },
    };
    await legacyPage.addInitScript(
      ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
      { key: KEY, p: old },
    );
    await legacyPage.goto("http://localhost:8081");
    await legacyPage.getByText("Your Mandarin,", { exact: true }).waitFor();
    await legacyPage.waitForFunction(
      (key) => JSON.parse(localStorage.getItem(key) || "{}").version === 2,
      KEY,
    );
    const migrated = await legacyPage.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      KEY,
    );
    assert.equal(migrated.xp, 80);
    assert.deepEqual(migrated.cards, old.cards);
    assert.deepEqual(migrated.completed, ["3"]);
    await legacyContext.close();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      "Passed: mobile UI, onboarding, tap dictionary, SRS, eight-question quiz, comprehension, versions, reader preferences, bookmarks, grammar, audio queue/rate, tone studio, character tracing, practice entry points, radio, offline interaction, responsive widths, persisted reload and v1 migration.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
