import { Word, words } from "./content";
export type Card = {
  due: number;
  interval: number;
  reviews: number;
  lapses: number;
};
export type Progress = {
  xp: number;
  streak: number;
  lastDay: string;
  dailyXP: number;
  completed: string[];
  cards: Record<string, Card>;
};
export const emptyProgress: Progress = {
  xp: 0,
  streak: 0,
  lastDay: "",
  dailyXP: 0,
  completed: [],
  cards: {},
};
export function dayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function activeStreak(p: Progress, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return [dayKey(now), dayKey(yesterday)].includes(p.lastDay) ? p.streak : 0;
}
export function reward(p: Progress, xp: number, now = new Date()): Progress {
  const today = dayKey(now);
  return {
    ...p,
    xp: p.xp + xp,
    dailyXP: (p.lastDay === today ? p.dailyXP : 0) + xp,
    lastDay: today,
    streak: p.lastDay === today ? p.streak : activeStreak(p, now) + 1,
  };
}
export function schedule(
  previous: Card | undefined,
  grade: "again" | "good" | "easy",
  now = Date.now(),
): Card {
  const interval =
    grade === "again"
      ? 0
      : grade === "easy"
        ? Math.max(4, (previous?.interval || 1) * 3)
        : Math.max(1, (previous?.interval || 0) * 2);
  return {
    due: now + (grade === "again" ? 60000 : interval * 86400000),
    interval,
    reviews: (previous?.reviews || 0) + 1,
    lapses: (previous?.lapses || 0) + (grade === "again" ? 1 : 0),
  };
}
export type Mode = "meaning" | "tone" | "listening";
export type Question = {
  word: Word;
  mode: Mode;
  options: string[];
  answer: string;
};
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeQuestions(pool: Word[], mode?: Mode): Question[] {
  return shuffle(pool)
    .slice(0, 8)
    .map((word, i) => {
      const m = mode || (["meaning", "tone", "listening"] as Mode[])[i % 3];
      const label = (w: Word) =>
        m === "tone" ? w.pinyin : m === "listening" ? w.hanzi : w.meaning;
      const answer = label(word);
      const distractors = shuffle(
        [...new Set(words.map(label))].filter((s) => s !== answer),
      ).slice(0, 3);
      return {
        word,
        mode: m,
        answer,
        options: shuffle([answer, ...distractors]),
      };
    });
}
export function parseProgress(raw: string): Progress {
  const p = JSON.parse(raw);
  if (
    !p ||
    !Number.isFinite(p.xp) ||
    !Number.isFinite(p.streak) ||
    typeof p.lastDay !== "string" ||
    !Number.isFinite(p.dailyXP) ||
    !Array.isArray(p.completed) ||
    !p.cards ||
    typeof p.cards !== "object"
  )
    throw Error("Invalid saved progress");
  for (const c of Object.values(p.cards) as Card[])
    if (!c || ![c.due, c.interval, c.reviews, c.lapses].every(Number.isFinite))
      throw Error("Invalid review card");
  return p;
}
