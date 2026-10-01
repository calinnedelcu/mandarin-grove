import { JSDOM, VirtualConsole } from "jsdom";
import assert from "node:assert/strict";
import {
  getByRole,
  getAllByRole,
  getByText,
  fireEvent,
  waitFor,
} from "@testing-library/dom";
async function main() {
  const errors: string[] = [];
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
        speechSynthesis: {
          cancel() {},
          speak() {},
          getVoices() {
            return [];
          },
        },
      });
      w.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    },
  });
  const body = dom.window.document.body;
  Object.assign(globalThis, {
    document: dom.window.document,
    window: dom.window,
  });
  const click = async (name: string | RegExp, role = "button") => {
    const target = await waitFor(() => getByRole(body, role, { name }));
    fireEvent.click(target);
  };
  await waitFor(() => getByText(body, "Your Mandarin,"), { timeout: 10000 });
  await click("Read today's story");
  await waitFor(() => getByText(body, "A tiny reading"));
  fireEvent.click(getAllByRole(body, "button", { name: /^茶/ })[0]);
  await click("Plant this word for review +");
  await click("Close word details");
  await click("Close lesson");
  await click("Review", "tab");
  await click("Start spaced review →");
  await click("Reveal meaning");
  await click("Good · 1 day(s)");
  await click("Stories", "tab");
  await click(/A little hello/);
  await click("Check what stuck →");
  for (let i = 0; i < 8; i++) {
    await waitFor(() => getByText(body, `QUESTION ${i + 1} OF 8`));
    const buttons = body.querySelectorAll('[role="button"]');
    const option = Array.from(buttons).find((b) =>
      b.textContent?.startsWith("A"),
    );
    assert.ok(option);
    fireEvent.click(option);
    await click(i === 7 ? "See your growth →" : "Next question →");
  }
  await waitFor(() => getByText(body, "Look at you grow."));
  await click("Back to the grove");
  await waitFor(() => {
    const raw = dom.window.localStorage.getItem("mandarin-grove.v1");
    assert.ok(raw);
    const p = JSON.parse(raw);
    assert.ok(p.xp > 0);
    assert.equal(p.streak, 1);
    assert.deepEqual(p.completed, ["0"]);
    assert.equal(Object.keys(p.cards).length, 9);
  });
  assert.deepEqual(errors, []);
  dom.window.close();
  console.log(
    "Passed: DOM-rendered exported app, lessons, eight-question quiz, completion, XP, streak, AsyncStorage.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
