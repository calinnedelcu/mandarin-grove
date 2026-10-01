import { JSDOM, VirtualConsole } from "jsdom";
import assert from "node:assert/strict";
import {
  getByRole,
  getAllByRole,
  getByText,
  getAllByText,
  fireEvent,
  waitFor,
} from "@testing-library/dom";
import { lessons, words } from "../src/content";
const KEY = "mandarin-grove.v1";
export async function runDomSmoke() {
  const errors: string[] = [],
    calls: { text: string; rate: number; lang: string }[] = [];
  type Utterance = { onend?: (event: unknown) => void };
  let pending: Utterance | null = null;
  const currentUtterance = (): Utterance | null => pending;
  async function load(snapshot?: string, voice: boolean | "cantonese" = true) {
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => {
      if (e.message.includes("Uncaught")) errors.push(e.message);
    });
    const dom = await JSDOM.fromURL("http://localhost:8081", {
      resources: "usable",
      runScripts: "dangerously",
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(w) {
        if (snapshot) w.localStorage.setItem(KEY, snapshot);
        w.matchMedia = () => ({
          matches: false,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() {
            return true;
          },
          media: "",
          onchange: null,
        });
        Object.assign(w, {
          AnimationEvent: w.Event,
          TransitionEvent: w.Event,
          SpeechSynthesisUtterance: class {
            text = "";
            lang = "";
            rate = 1;
            voice = null;
            onend = null;
            onerror = null;
          },
          speechSynthesis: {
            cancel() {
              pending = null;
            },
            speak(u: {
              text: string;
              rate: number;
              lang: string;
              onend?: (e: unknown) => void;
            }) {
              pending = u;
              calls.push({ text: u.text, rate: u.rate, lang: u.lang });
            },
            getVoices() {
              return voice === "cantonese"
                ? [
                    {
                      voiceURI: "local-zh-hk",
                      lang: "zh-HK",
                      name: "Local Cantonese test voice",
                      localService: true,
                      default: true,
                    },
                  ]
                : voice
                  ? [
                      {
                        voiceURI: "local-zh-cn",
                        lang: "zh-CN",
                        name: "Local Mandarin test voice",
                        localService: true,
                        default: true,
                      },
                    ]
                  : [
                      {
                        voiceURI: "remote-zh-cn",
                        lang: "zh-CN",
                        name: "Remote-only voice",
                        localService: false,
                        default: true,
                      },
                    ];
            },
          },
        });
        w.ResizeObserver = class {
          observe() {}
          unobserve() {}
          disconnect() {}
        };
        w.HTMLElement.prototype.scrollTo = function () {};
      },
    });
    Object.assign(globalThis, {
      document: dom.window.document,
      window: dom.window,
    });
    return dom;
  }
  let dom = await load(),
    body = dom.window.document.body;
  // jsdom has no CSS animation engine. Complete RN Web's modal transitions so
  // the test models the browser's animationend event, not a permanently exiting
  // overlay. This does not claim that animation or layout was visually tested.
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const el of body.querySelectorAll('[aria-modal="true"]')) {
      const animated = el.parentElement?.parentElement;
      if (animated) fireEvent.animationEnd(animated);
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  async function click(name: string | RegExp, role = "button") {
    await settle();
    const dialogs = body.querySelectorAll('[role="dialog"]');
    const scope =
      role === "button" && dialogs.length
        ? (dialogs[dialogs.length - 1] as HTMLElement)
        : body;
    fireEvent.click(await waitFor(() => getByRole(scope, role, { name })));
    await settle();
  }
  async function change(name: string, value: string) {
    fireEvent.input(getByRole(body, "textbox", { name }), {
      target: { value },
    });
    await settle();
  }
  function progress() {
    return JSON.parse(dom.window.localStorage.getItem(KEY) || "{}");
  }
  try {
    await waitFor(() => getByText(body, "Start as a beginner"), {
      timeout: 10000,
    });
    await click("Start as a beginner");
    await click("Let's grow →");
    await waitFor(() => getByText(body, "Your Mandarin,"));
    await click("Stories", "tab");
    await click("Tea for two · HSK 1");
    await waitFor(() => getByText(body, "A tiny reading"));
    fireEvent.click(getAllByRole(body, "button", { name: /^茶 ·/ })[0]);
    await settle();
    await click("Plant this word for review +");
    await click("Close word details");
    await click("Bookmark story");
    await click("Save this grammar pattern +");
    await click("Reader settings");
    await click("Pinyin");
    await click("English");
    await click("Traditional");
    await click("32 px");
    await click("Reader settings");
    await click("Play story audio");
    await waitFor(() => assert.ok(calls.length >= 1));
    assert.equal(calls.at(-1)!.lang, "zh-CN");
    const oldUtterance = currentUtterance();
    await click("0.65×");
    await waitFor(() => assert.equal(calls.at(-1)!.rate, 0.65));
    const staleCount = calls.length;
    oldUtterance?.onend?.({});
    await settle();
    assert.equal(calls.length, staleCount, "cancelled audio must not advance");
    currentUtterance()?.onend?.({});
    await waitFor(() => assert.ok(calls.length > staleCount));
    await click("Pause story audio");
    const pausedCount = calls.length;
    await settle();
    assert.equal(calls.length, pausedCount);
    await click("Close lesson");
    await click("Review", "tab");
    await click("Start spaced review →");
    await click("Reveal meaning");
    await click("Good · 1 day(s)");
    await click("Back to the grove");
    await click("Stories", "tab");
    await click("A little hello · HSK 1");
    await click("Check what stuck →");
    for (let i = 0; i < 8; i++) {
      await waitFor(() => getByText(body, `QUESTION ${i + 1} OF 8`));
      await click(/^Answer A:/);
      await click(i === 7 ? "See your growth →" : "Next question →");
    }
    await waitFor(() => getByText(body, "Look at you grow."));
    await click("Back to the grove");
    await waitFor(() => {
      const p = progress();
      assert.ok(p.xp > 0);
      assert.equal(p.streak, 1);
      assert.deepEqual(p.completed, ["0"]);
      assert.equal(Object.keys(p.cards).length, 9);
      assert.equal(p.cards["37"].interval, 1);
      assert.equal(p.version, 2);
      assert.equal(p.onboarded, true);
      assert.equal(p.quizzes.length, 1);
      assert.equal(p.settings.pinyin, false);
      assert.equal(p.settings.translation, false);
      assert.equal(p.settings.traditional, true);
      assert.equal(p.settings.fontSize, 32);
      assert.deepEqual(p.bookmarks, ["3"]);
      assert.deepEqual(p.grammarSaved, ["3"]);
    });
    await click("Words", "tab");
    await change("Search vocabulary", "niao");
    await click("Word 鸟");
    await waitFor(() => assert.ok(getAllByText(body, "bird").length > 0));
    await click("Close word details");
    await change("Search vocabulary", "一");
    await click("Word 一");
    await click("Practice writing 一");
    await waitFor(() => getByText(body, "一 · 1 strokes"));
    await click("Stroke demo");
    await click("Stop demo");
    await click("Back to word details");
    await click("Close word details");
    await click("Stories", "tab");
    await click("HSK 2");
    await click("A slower morning · HSK 2");
    await click("HSK 3");
    await click("Story comprehension →");
    const story = lessons.find((l) => l.id === "breakfast-3")!;
    for (let i = 0; i < story.checks.length; i++) {
      const q = story.checks[i];
      if (q.options) {
        const buttons = getAllByRole(body, "button");
        const option = buttons.find((b) =>
          b.getAttribute("aria-label")?.endsWith(`: ${q.answer}`),
        );
        assert.ok(option);
        fireEvent.click(option);
        await settle();
      } else {
        await change("Type your answer", q.answer);
        await click("Check answer");
      }
      await click(
        i === story.checks.length - 1 ? "See your growth →" : "Next question →",
      );
    }
    await click("Back to the grove");
    await waitFor(() =>
      assert.ok(progress().completed.includes("breakfast-3")),
    );
    await click("Sentence building →");
    for (let i = 0; i < 4; i++) {
      await waitFor(() => getByText(body, `QUESTION ${i + 1} OF 4`));
      const clue = getByText(body, "Put the story’s words back in order.")
        .parentElement!.parentElement!.textContent!;
      const line = story.story.find((l) => clue.includes(l.translation));
      assert.ok(line);
      // Repeated words are distinct tiles; choose the first unused instance.
      const dialog = getByRole(body, "dialog");
      for (const token of line.tokens.filter((t) => t.word)) {
        const tiles = getAllByRole(dialog, "button", {
          name: token.text,
        }).filter(
          (el) =>
            el.getAttribute("aria-selected") !== "true" &&
            el.getAttribute("aria-label") === null,
        );
        assert.ok(tiles.length);
        fireEvent.click(tiles[0]);
        await settle();
        assert.equal(tiles[0].getAttribute("aria-selected"), "true");
      }
      await click("Check sentence");
      await waitFor(() => getByText(body, "That’s it! Nicely done."));
      await click(i === 3 ? "See your growth →" : "Next question →");
    }
    await click("Back to the grove");
    await click("Sentence writing →");
    await waitFor(() =>
      getByText(
        body,
        "Recall the Chinese from the story. Use the sample wording.",
      ),
    );
    await click("Close quiz");
    await click("Match pairs");
    await waitFor(() => getByText(body, "Find their other half."));
    for (const w of words) {
      const button = body.querySelectorAll('[role="button"]');
      const hz = Array.from(button).find((el) => el.textContent === w.hanzi),
        meaning = Array.from(button).find((el) => el.textContent === w.meaning);
      if (hz && meaning) {
        fireEvent.click(hz);
        await settle();
        fireEvent.click(meaning);
        await settle();
      }
    }
    await waitFor(() => getByText(body, "All together. Lovely work!"));
    await click("Back to the grove");
    await click("Hear & name the tone →");
    await click("Play listening question");
    await waitFor(() => assert.ok(calls.at(-1)!.text.length === 1));
    await click("Close quiz");
    await click("Pinyin recall");
    await waitFor(() => getByText(body, "Type the pinyin, with its tones."));
    await change("Type your answer", "ma");
    await click("1 ˉ");
    assert.equal(
      (
        getByRole(body, "textbox", {
          name: "Type your answer",
        }) as HTMLInputElement
      ).value,
      "mā",
    );
    await click("Close quiz");
    await click("Keyword sprint");
    await waitFor(() => getByText(body, "KEYWORD SPRINT"));
    await click("Close quiz");
    await click("Zen mode");
    await waitFor(() =>
      getByText(body, "No timer. No rush. Breathe, notice, remember."),
    );
    await click("Close quiz");
    await click("Progress", "tab");
    await click("Change level, goal & interests");
    await click("HSK 3");
    await click("100 XP · Curious");
    await click("Done →");
    await click("Today", "tab");
    await click("Start Grove Radio");
    await click("Skip story");
    await click("Pause Grove Radio");
    await click("Close Grove Radio");
    await waitFor(() => {
      assert.equal(progress().settings.level, 3);
      assert.equal(progress().settings.dailyGoal, 100);
    });
    const snapshot = dom.window.localStorage.getItem(KEY)!;
    dom.window.close();
    dom = await load(snapshot);
    body = dom.window.document.body;
    await waitFor(() => getByText(body, "Your Mandarin,"), { timeout: 10000 });
    assert.deepEqual(progress().completed, ["0", "breakfast-3"]);
    assert.equal(progress().settings.fontSize, 32);
    assert.equal(progress().settings.level, 3);
    // Check a raw v1 save, without new fields or redoing onboarding.
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
    dom.window.close();
    dom = await load(JSON.stringify(old));
    body = dom.window.document.body;
    await waitFor(() => getByText(body, "Your Mandarin,"), { timeout: 10000 });
    await waitFor(() => assert.equal(progress().version, 2));
    assert.equal(progress().xp, 80);
    assert.deepEqual(progress().cards, old.cards);
    assert.deepEqual(progress().completed, ["3"]);
    // Remote-only voices are rejected instead of sending speech to a service.
    dom.window.close();
    dom = await load(JSON.stringify(old), false);
    body = dom.window.document.body;
    await waitFor(() => getByText(body, "Your Mandarin,"), { timeout: 10000 });
    await click("Stories", "tab");
    await click("Tea for two · HSK 1");
    await click("Play story audio");
    await waitFor(() =>
      getAllByText(
        body,
        "Audio unavailable. Install a Mandarin voice in your device speech settings.",
      ),
    );
    const beforeCantonese = calls.length;
    dom.window.close();
    dom = await load(JSON.stringify(old), "cantonese");
    body = dom.window.document.body;
    await waitFor(() => getByText(body, "Your Mandarin,"), { timeout: 10000 });
    await click("Stories", "tab");
    await click("Tea for two · HSK 1");
    await click("Play story audio");
    await waitFor(() =>
      getAllByText(
        body,
        "Audio unavailable. Install a Mandarin voice in your device speech settings.",
      ),
    );
    assert.equal(
      calls.length,
      beforeCantonese,
      "a Cantonese-only voice must not narrate Mandarin lessons",
    );
    assert.deepEqual(errors, []);
    console.log(
      "Passed: exported-app DOM, onboarding, dictionary, SRS, 8-question quiz, three comprehension formats, HSK versions, reader preferences, bookmarks, grammar, speech rate/queue/cancellation, character demo, sentence building/writing, matching pairs, tone studio, pinyin keyboard, sprint, Zen, radio, persisted rehydration and v1 migration. Device audio and visual layout are not simulated.",
    );
  } finally {
    dom.window.close();
  }
}
if (process.argv[1]?.endsWith("dom-smoke.ts"))
  runDomSmoke().catch((e) => {
    console.error(e);
    process.exit(1);
  });
