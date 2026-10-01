import assert from "node:assert/strict";
import {
  activeStreak,
  dayKey,
  emptyProgress,
  makeQuestions,
  parseProgress,
  reward,
  schedule,
  saveWord,
  strength,
  practicePool,
  placementLevel,
  checkTyped,
  changeTone,
  searchWord,
  recommend,
} from "../src/learning";
import { lessons, tone, words, wordByHanzi, characters } from "../src/content";
import { matchingWords } from "../src/exercises";
const now = new Date(2026, 9, 1, 12);
const ms = now.getTime();
assert.ok(words.length >= 600);
assert.equal(new Set(words.map((w) => w.id)).size, words.length);
assert.equal(lessons.length, 42);
for (const l of lessons) {
  assert.ok(l.words.length >= 4 && l.words.length <= 12);
  for (const line of l.story) for (const id of line.ids) assert.ok(words[id]);
}
assert.deepEqual(["mā", "má", "mǎ", "mà", "ma"].map(tone), [1, 2, 3, 4, 0]);
assert.equal(schedule(undefined, "again", ms).due, ms + 60000);
const first = schedule(undefined, "good", ms);
assert.equal(first.interval, 1);
assert.equal(first.due, ms + 86400000);
assert.equal(schedule(first, "good", ms).interval, 2);
assert.equal(schedule(undefined, "easy", ms).interval, 4);
assert.equal(schedule(first, "again", ms).lapses, 1);
let p = reward(emptyProgress, 10, now);
assert.equal(p.streak, 1);
assert.equal(p.dailyXP, 10);
p = reward(p, 10, now);
assert.equal(p.streak, 1);
assert.equal(p.dailyXP, 20);
p = reward(p, 10, new Date(2026, 9, 2, 1));
assert.equal(p.streak, 2);
assert.equal(p.dailyXP, 10);
assert.equal(activeStreak(p, new Date(2026, 9, 4)), 0);
p = reward(p, 10, new Date(2026, 9, 4));
assert.equal(p.streak, 1);
assert.equal(dayKey(new Date(2026, 0, 1)), "2026-01-01");
assert.deepEqual(parseProgress(JSON.stringify(p)), p);
assert.throws(() => parseProgress("{}"));
for (const mode of ["meaning", "tone", "listening"] as const) {
  const qs = makeQuestions(words, mode);
  assert.equal(qs.length, 8);
  for (const q of qs) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
    assert.equal(q.mode, mode);
  }
}
console.log(
  "Passed: content, tones, SRS, streaks, persistence validation, and all quiz modes.",
);

// Existing v1 IDs and all six completed chapter IDs remain valid.
assert.deepEqual(
  words.slice(0, 12).map((w) => w.hanzi),
  [
    "你",
    "好",
    "我",
    "是",
    "叫",
    "什么",
    "名字",
    "吗",
    "不",
    "谢谢",
    "再见",
    "中国",
  ],
);
const legacy = {
  xp: 90,
  streak: 3,
  lastDay: dayKey(now),
  dailyXP: 20,
  completed: ["0", "3"],
  cards: { "37": first },
};
const migrated = parseProgress(JSON.stringify(legacy));
assert.equal(migrated.xp, 90);
assert.equal(migrated.onboarded, true);
assert.deepEqual(migrated.cards, legacy.cards);
assert.deepEqual(migrated.completed, ["0", "3"]);
assert.equal(migrated.settings.level, 1);
assert.throws(() => parseProgress(JSON.stringify({ ...legacy, cards: [] })));
assert.throws(() => parseProgress(JSON.stringify({ ...legacy, xp: -1 })));
assert.throws(() =>
  parseProgress(JSON.stringify({ ...legacy, settings: { level: 4 } })),
);
assert.throws(() =>
  parseProgress(JSON.stringify({ ...legacy, positions: { 0: "bad" } })),
);
assert.throws(() =>
  parseProgress(JSON.stringify({ ...legacy, activity: { today: { xp: 10 } } })),
);

// Dictionary forms that easily get confused with rare readings or surnames.
for (const [hanzi, pinyin] of [
  ["听", "tīng"],
  ["鸟", "niǎo"],
  ["读", "dú"],
  ["万", "wàn"],
  ["都", "dōu"],
  ["个", "gè"],
  ["胖", "pàng"],
  ["骑", "qí"],
  ["教", "jiāo"],
  ["音乐", "yīn yuè"],
  ["银行", "yín háng"],
  ["哪儿", "nǎr"],
  ["得", "de"],
  ["着", "zhe"],
  ["东西", "dōng xi"],
  ["不", "bù"],
  ["一", "yī"],
]) {
  assert.equal(wordByHanzi[hanzi].pinyin, pinyin);
}
for (const w of words) {
  assert.ok(w.hanzi && w.pinyin && w.meaning);
  assert.ok([1, 2, 3].includes(w.level));
  assert.ok(!/surname [A-Z]|archaic|variant of|penis/.test(w.meaning), w.hanzi);
  assert.ok(/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/.test(w.pinyin), w.hanzi);
}
for (const l of lessons) {
  assert.ok([1, 2, 3].includes(l.level));
  assert.deepEqual(l.checks.map((q) => q.kind).sort(), [
    "choice",
    "gap",
    "write",
  ]);
  for (const line of l.story) {
    assert.equal(line.tokens.map((t) => t.text).join(""), line.text);
    assert.ok(
      line.tokens.every((t) => t.word || !/[\u3400-\u9fff]/.test(t.text)),
      `${l.id}: untappable character`,
    );
    assert.ok(line.tokens.every((t) => !t.word || t.word.level <= 3));
  }
  for (const q of l.checks)
    if (q.options) assert.ok(q.options.includes(q.answer));
}
for (const family of new Set(lessons.slice(6).map((l) => l.family)))
  assert.deepEqual(
    lessons.filter((l) => l.family === family).map((l) => l.level),
    [1, 2, 3],
  );
assert.equal(
  lessons
    .find((l) => l.id === "cat-1")!
    .story[0].tokens.find((t) => t.text === "只")!.word!.pinyin,
  "zhī",
);
assert.equal(
  lessons
    .find((l) => l.id === "cat-2")!
    .story[0].tokens.find((t) => t.text === "只")!.word!.pinyin,
  "zhī",
);
assert.ok(characters["你"].medians!.length > 0);
assert.equal(characters["好"].decomposition, "⿰女子");
assert.equal(characters["一"].medians!.length, 1);
assert.equal(strength(undefined), 0);
assert.ok(strength(schedule(first, "easy", ms)) > strength(first));
assert.ok(strength(schedule(first, "again", ms)) < strength(first));
assert.equal(schedule({ ...first, interval: 300 }, "easy", ms).interval, 365);
const planted = saveWord(emptyProgress, "37", ms);
assert.equal(planted.cards["37"].due, ms);
assert.equal(saveWord(planted, "37", ms + 1000), planted);
assert.deepEqual(
  practicePool(planted, "Daily review", ms).map((w) => w.id),
  ["37"],
);
assert.ok(
  practicePool(planted, "Learn new", ms).every(
    (w) => w.id !== "37" && w.level === 1,
  ),
);
assert.equal(practicePool(planted, "Retain", ms).length, 0);
assert.equal(placementLevel([false, false, false, false, false, false]), 1);
assert.equal(placementLevel([true, true, false, false, false, false]), 2);
assert.equal(placementLevel([true, true, true, true, true, false]), 3);
assert.equal(checkTyped("nǐhǎo", "nǐ hǎo", true), true);
assert.equal(checkTyped("ni hao", "nǐ hǎo", true), false);
assert.equal(checkTyped(" 我 是 学生！ ", "我是学生。"), true);
assert.equal(checkTyped("妈妈说我很高兴", "妈妈说：“我很高兴！”"), true);
for (const lesson of lessons)
  for (const line of lesson.story)
    assert.equal(
      checkTyped(
        line.tokens
          .filter((t) => t.word)
          .map((t) => t.text)
          .join(""),
        line.text,
      ),
      true,
      `Unanswerable sentence-building prompt: ${line.text}`,
    );
assert.equal(changeTone("lü", 3), "lǚ");
assert.equal(changeTone("shui", 3), "shuǐ");
assert.equal(changeTone("liu", 4), "liù");
assert.equal(searchWord(wordByHanzi["喜欢"], "xihuan"), true);
assert.equal(searchWord(wordByHanzi["喜欢"], "unrelated"), false);
const sameGloss = matchingWords([
  wordByHanzi["上午"],
  wordByHanzi["早上"],
  wordByHanzi["茶"],
]);
assert.equal(
  sameGloss.length,
  2,
  "matching must not contain indistinguishable meanings",
);
assert.equal(recommend(emptyProgress, lessons, now).level, 1);
assert.equal(
  recommend(
    { ...emptyProgress, settings: { ...emptyProgress.settings, level: 3 } },
    lessons,
    now,
  ).level,
  3,
);
assert.equal(p.activity[dayKey(now)].xp, 20);
for (const mode of ["reverse", "typing"] as const) {
  const qs = makeQuestions(words.slice(0, 12), mode);
  assert.equal(qs.length, 8);
  if (mode === "typing") assert.ok(qs.every((q) => q.options.length === 0));
  else assert.ok(qs.every((q) => q.options.length === 4));
}
console.log(
  "Passed: 618-word content audit, 42 readings, legacy migration, settings validation, mastery, practice pools, placement, pinyin recall and level recommendations.",
);
