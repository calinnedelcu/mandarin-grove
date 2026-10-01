import assert from "node:assert/strict";
import {
  activeStreak,
  dayKey,
  emptyProgress,
  makeQuestions,
  parseProgress,
  reward,
  schedule,
} from "../src/learning";
import { lessons, tone, words } from "../src/content";
const now = new Date(2026, 9, 1, 12);
const ms = now.getTime();
assert.equal(words.length, 72);
assert.equal(new Set(words.map((w) => w.id)).size, 72);
assert.equal(lessons.length, 6);
for (const l of lessons) {
  assert.equal(l.words.length, 12);
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
