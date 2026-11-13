import { Lesson, Level, Word, words, tone, normalizePinyin } from "./content";
export type Card = {
  due: number;
  interval: number;
  reviews: number;
  lapses: number;
};
export type Settings = {
  level: Level;
  dailyGoal: number;
  topics: string[];
  pinyin: boolean;
  translation: boolean;
  echo: boolean;
  traditional: boolean;
  fontSize: number;
  spacious: boolean;
  /** Show each word's meaning under it while reading. */
  gloss: boolean;
  rate: number;
  /** Use the bundled studio recordings where one exists. */
  studioVoice: boolean;
  /** Short sounds for right, wrong, finished and planted. */
  sounds: boolean;
};
export type Activity = {
  xp: number;
  reviews: number;
  readSeconds: number;
  stories: number;
  correct: number;
  answered: number;
};
export type QuizResult = {
  lessonId: string | null;
  score: number;
  total: number;
  day: string;
  mode: string;
};
export type Progress = {
  xp: number;
  streak: number;
  lastDay: string;
  dailyXP: number;
  completed: string[];
  cards: Record<string, Card>;
  version: 2;
  onboarded: boolean;
  settings: Settings;
  bookmarks: string[];
  grammarSaved: string[];
  activity: Record<string, Activity>;
  positions: Record<string, number>;
  lastLesson: string | null;
  quizzes: QuizResult[];
  bestSprint: number;
  toneCorrect: number;
  toneAttempts: number;
  writing: Record<string, number>;
  /** The reading pinned for a calendar day, so finishing it does not swap it. */
  daily?: { day: string; lessonId: string };
};
export const defaultSettings: Settings = {
  level: 1,
  dailyGoal: 50,
  topics: ["Daily life", "Food", "Nature"],
  pinyin: true,
  translation: true,
  echo: true,
  traditional: false,
  fontSize: 27,
  spacious: false,
  gloss: true,
  rate: 0.85,
  studioVoice: true,
  sounds: true,
};
export const emptyActivity: Activity = {
  xp: 0,
  reviews: 0,
  readSeconds: 0,
  stories: 0,
  correct: 0,
  answered: 0,
};
export const emptyProgress: Progress = {
  xp: 0,
  streak: 0,
  lastDay: "",
  dailyXP: 0,
  completed: [],
  cards: {},
  version: 2,
  onboarded: false,
  settings: defaultSettings,
  bookmarks: [],
  grammarSaved: [],
  activity: {},
  positions: {},
  lastLesson: null,
  quizzes: [],
  bestSprint: 0,
  toneCorrect: 0,
  toneAttempts: 0,
  writing: {},
};
export function dayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function activeStreak(p: Progress, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return [dayKey(now), dayKey(yesterday)].includes(p.lastDay) ? p.streak : 0;
}
export function activity(
  p: Progress,
  changes: Partial<Activity>,
  now = new Date(),
): Progress {
  const key = dayKey(now);
  const entry = { ...emptyActivity, ...p.activity[key] };
  for (const k of Object.keys(changes) as (keyof Activity)[])
    entry[k] += changes[k] || 0;
  return { ...p, activity: { ...p.activity, [key]: entry } };
}
export function reward(p: Progress, xp: number, now = new Date()): Progress {
  const today = dayKey(now);
  return activity(
    {
      ...p,
      xp: p.xp + xp,
      dailyXP: (p.lastDay === today ? p.dailyXP : 0) + xp,
      lastDay: today,
      streak: p.lastDay === today ? p.streak : activeStreak(p, now) + 1,
    },
    { xp },
    now,
  );
}
export function schedule(
  previous: Card | undefined,
  grade: "again" | "good" | "easy",
  now = Date.now(),
): Card {
  const interval =
    grade === "again"
      ? 0
      : Math.min(
          365,
          grade === "easy"
            ? Math.max(4, (previous?.interval || 1) * 3)
            : Math.max(1, (previous?.interval || 0) * 2),
        );
  return {
    due: now + (grade === "again" ? 60000 : interval * 86400000),
    interval,
    reviews: (previous?.reviews || 0) + 1,
    lapses: (previous?.lapses || 0) + (grade === "again" ? 1 : 0),
  };
}
export function strength(c?: Card) {
  if (!c || !c.reviews) return 0;
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        12 +
          Math.log2(c.interval + 1) * 16 +
          Math.min(c.reviews, 12) * 3 -
          c.lapses * 8,
      ),
    ),
  );
}
export function saveWord(p: Progress, id: string, now = Date.now()): Progress {
  return p.cards[id]
    ? p
    : {
        ...p,
        cards: {
          ...p.cards,
          [id]: { due: now, interval: 0, reviews: 0, lapses: 0 },
        },
      };
}
export function toggle(items: string[], id: string) {
  return items.includes(id) ? items.filter((x) => x !== id) : [...items, id];
}
export type Mode = "meaning" | "tone" | "listening" | "reverse" | "typing";
export type Question = {
  word: Word;
  mode: Mode;
  options: string[];
  answer: string;
};
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const vowels = ["aeiouü", "āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"];
export function changeTone(syllable: string, to: number) {
  const plain = Array.from(syllable)
    .map((c) => {
      for (const row of vowels) {
        const i = row.indexOf(c);
        if (i >= 0) return vowels[0][i];
      }
      return c;
    })
    .join("");
  const at = plain.includes("a")
    ? plain.indexOf("a")
    : plain.includes("e")
      ? plain.indexOf("e")
      : plain.includes("ou")
        ? plain.indexOf("o")
        : Math.max(
            ...Array.from(plain).map((c, i) =>
              vowels[0].includes(c) ? i : -1,
            ),
          );
  return at < 0
    ? plain
    : plain.slice(0, at) +
        vowels[to][vowels[0].indexOf(plain[at])] +
        plain.slice(at + 1);
}
export function toneOptions(pinyin: string) {
  const syllables = pinyin.split(" ");
  const target = syllables.findIndex((s) =>
    /[aeiouüāēīōūǖáéíóúǘǎěǐǒǔǚàèìòùǜ]/.test(s),
  );
  if (target < 0) return [pinyin];
  return [
    pinyin,
    ...shuffle([0, 1, 2, 3, 4].filter((t) => t !== tone(syllables[target])))
      .slice(0, 3)
      .map((t) =>
        syllables
          .map((s, i) => (i === target ? changeTone(s, t) : s))
          .join(" "),
      ),
  ];
}
export function makeQuestions(pool: Word[], mode?: Mode): Question[] {
  const max = Math.max(1, ...pool.map((w) => w.level));
  const distractorPool = words.filter((w) => w.level <= max);
  return shuffle(pool)
    .slice(0, 8)
    .map((word, i) => {
      const m = mode || (["meaning", "tone", "listening"] as Mode[])[i % 3];
      const label = (w: Word) =>
        m === "tone" || m === "typing"
          ? w.pinyin
          : m === "listening" || m === "reverse"
            ? w.hanzi
            : w.meaning;
      const answer = label(word);
      const distractors = shuffle(
        [...new Set(distractorPool.map(label))].filter((s) => s !== answer),
      ).slice(0, 3);
      return {
        word,
        mode: m,
        answer,
        options:
          m === "typing"
            ? []
            : shuffle(
                m === "tone"
                  ? toneOptions(word.pinyin)
                  : [answer, ...distractors],
              ),
      };
    });
}
export type Practice =
  | "Learn new"
  | "Practice weak"
  | "Reinforce"
  | "Retain"
  | "Mixed practice"
  | "Daily review"
  | "Zen mode";
export function practicePool(
  p: Progress,
  mode: Practice,
  now = Date.now(),
): Word[] {
  const eligible = words.filter((w) => w.level <= p.settings.level);
  const saved = eligible.filter((w) => p.cards[w.id]);
  if (mode === "Learn new") return eligible.filter((w) => !p.cards[w.id]);
  if (mode === "Practice weak")
    return saved
      .filter((w) => strength(p.cards[w.id]) < 40)
      .sort((a, b) => strength(p.cards[a.id]) - strength(p.cards[b.id]));
  if (mode === "Reinforce")
    return saved.filter(
      (w) => strength(p.cards[w.id]) >= 40 && strength(p.cards[w.id]) < 75,
    );
  if (mode === "Retain")
    return saved.filter((w) => strength(p.cards[w.id]) >= 75);
  if (mode === "Daily review")
    return saved
      .filter((w) => p.cards[w.id].due <= now)
      .sort((a, b) => p.cards[a.id].due - p.cards[b.id].due);
  return saved.length ? saved : eligible;
}
export function recommend(
  p: Progress,
  library: Lesson[],
  now = new Date(),
): Lesson {
  const level = library.filter((l) => l.level === p.settings.level);
  const interests = level.filter((l) => p.settings.topics.includes(l.topic));
  const pool = (interests.length ? interests : level).filter(
    (l) => !p.completed.includes(l.id),
  );
  const remaining = pool.length ? pool : level;
  const day = Math.floor(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() /
      86400000,
  );
  return remaining[day % remaining.length] || library[0];
}
export function placementLevel(answers: boolean[]): Level {
  if (answers.slice(0, 2).filter(Boolean).length < 2) return 1;
  return answers.slice(2, 4).every(Boolean) &&
    answers.slice(4, 6).filter(Boolean).length >= 1
    ? 3
    : 2;
}
const finite = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= 0;
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const strings = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((v) => typeof v === "string");
export function parseProgress(raw: string): Progress {
  const p = JSON.parse(raw);
  if (
    !record(p) ||
    ![p.xp, p.streak, p.dailyXP].every(finite) ||
    typeof p.lastDay !== "string" ||
    !strings(p.completed) ||
    !record(p.cards)
  )
    throw Error("Invalid saved progress");
  for (const c of Object.values(p.cards))
    if (!record(c) || ![c.due, c.interval, c.reviews, c.lapses].every(finite))
      throw Error("Invalid review card");
  const settings = {
    ...defaultSettings,
    ...(record(p.settings) ? p.settings : {}),
  } as Settings;
  if (
    ![1, 2, 3].includes(settings.level) ||
    ![25, 50, 100].includes(settings.dailyGoal) ||
    !strings(settings.topics) ||
    ![22, 27, 32].includes(settings.fontSize) ||
    ![0.65, 0.85, 1, 1.15].includes(settings.rate) ||
    ![
      "pinyin",
      "translation",
      "echo",
      "traditional",
      "spacious",
      "gloss",
      "studioVoice",
      "sounds",
    ].every((k) => typeof settings[k as keyof Settings] === "boolean")
  )
    throw Error("Invalid reading settings");
  for (const key of ["bookmarks", "grammarSaved"])
    if (p[key] !== undefined && !strings(p[key]))
      throw Error("Invalid saved list");
  for (const key of ["activity", "positions", "writing"])
    if (p[key] !== undefined && !record(p[key])) throw Error("Invalid history");
  if (record(p.activity))
    for (const a of Object.values(p.activity))
      if (!record(a) || !Object.keys(emptyActivity).every((k) => finite(a[k])))
        throw Error("Invalid activity");
  for (const key of ["positions", "writing"])
    if (record(p[key]))
      for (const v of Object.values(p[key]))
        if (!finite(v)) throw Error("Invalid history number");
  for (const key of ["bestSprint", "toneCorrect", "toneAttempts"])
    if (p[key] !== undefined && !finite(p[key])) throw Error("Invalid score");
  if (p.onboarded !== undefined && typeof p.onboarded !== "boolean")
    throw Error("Invalid onboarding");
  if (
    p.lastLesson !== undefined &&
    p.lastLesson !== null &&
    typeof p.lastLesson !== "string"
  )
    throw Error("Invalid last lesson");
  if (
    p.quizzes !== undefined &&
    (!Array.isArray(p.quizzes) ||
      !p.quizzes.every(
        (q) =>
          record(q) &&
          finite(q.score) &&
          finite(q.total) &&
          q.score <= q.total &&
          typeof q.day === "string" &&
          typeof q.mode === "string" &&
          (q.lessonId === null || typeof q.lessonId === "string"),
      ))
  )
    throw Error("Invalid quiz history");
  const parsed = {
    ...emptyProgress,
    ...p,
    version: 2,
    onboarded: p.onboarded === undefined ? true : p.onboarded,
    settings,
  } as Progress;
  // A damaged daily pin is simply dropped; the app pins a fresh reading.
  if (
    !record(p.daily) ||
    typeof p.daily.day !== "string" ||
    typeof p.daily.lessonId !== "string"
  )
    delete parsed.daily;
  return parsed;
}
export function checkTyped(input: string, expected: string, pinyin = false) {
  // Tone marks matter for pinyin: “ma” must not pass for “mǎ”.
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[\s，。！？、：；“”‘’「」『』（）《》,.!?;:'"()]/g, "")
      .normalize("NFC");
  return pinyin
    ? clean(input) === clean(expected)
    : clean(input) === clean(expected);
}
export function searchWord(w: Word, query: string) {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    `${w.hanzi} ${w.traditional} ${w.pinyin} ${w.meaning}`
      .toLowerCase()
      .includes(q) ||
    normalizePinyin(w.pinyin).includes(normalizePinyin(q))
  );
}
