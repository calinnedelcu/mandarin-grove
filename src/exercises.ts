import { Lesson, Word, tone, words, characters } from "./content";
import { makeQuestions, Mode, shuffle } from "./learning";
export type Exercise = {
  mode:
    | Mode
    | "choice"
    | "gap"
    | "write"
    | "build"
    | "dictation"
    | "tone-hearing"
    | "match";
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
  word?: Word;
  spoken?: string;
  tokens?: string[];
};
export type Session = {
  exercises: Exercise[];
  title: string;
  lessonId: string | null;
  timed?: boolean;
  zen?: boolean;
};
export function wordExercises(pool: Word[], mode?: Mode): Exercise[] {
  return makeQuestions(pool, mode).map((q) => ({
    ...q,
    prompt:
      q.mode === "meaning"
        ? "What does this mean?"
        : q.mode === "tone"
          ? "Which pinyin is right?"
          : q.mode === "reverse"
            ? "Which word fits this meaning?"
            : q.mode === "typing"
              ? "Type the pinyin, with its tones."
              : "Which word do you hear?",
    explanation: `${q.word.hanzi} · ${q.word.pinyin} · ${q.word.meaning}`,
    spoken: q.word.hanzi,
  }));
}
export function readingExercises(lesson: Lesson): Exercise[] {
  return lesson.checks.map((q) => ({
    mode: q.kind === "choice" ? "choice" : q.kind === "gap" ? "gap" : "write",
    prompt: q.prompt,
    answer: q.answer,
    options: q.options ? shuffle(q.options) : [],
    explanation: q.explanation,
  }));
}
export function sentenceExercises(
  lesson: Lesson,
  mode: "build" | "write",
): Exercise[] {
  return shuffle(lesson.story)
    .slice(0, 4)
    .map((line) => ({
      mode,
      prompt: line.translation,
      answer: line.text,
      options: [],
      tokens: shuffle(line.tokens.filter((t) => t.word).map((t) => t.text)),
      spoken: line.text,
      explanation: `${line.text} · ${line.translation}`,
    }));
}
/** Hear a sentence from the story, then rebuild it from its words. */
export function dictationExercises(lesson: Lesson): Exercise[] {
  return shuffle(lesson.story)
    .slice(0, 4)
    .map((line) => ({
      mode: "dictation",
      prompt: "Listen, then rebuild the sentence.",
      answer: line.text,
      options: [],
      tokens: shuffle(line.tokens.filter((t) => t.word).map((t) => t.text)),
      spoken: line.text,
      explanation: `${line.text} · ${line.translation}`,
    }));
}
export const toneLabels = [
  "• · Neutral",
  "1 · High",
  "2 · Rising",
  "3 · Dipping",
  "4 · Falling",
];
export function matchingWords(pool: Word[]) {
  // Identical visible meanings must never force learners to guess hidden IDs.
  return [...new Map(shuffle(pool).map((w) => [w.meaning, w])).values()].slice(
    0,
    4,
  );
}
export function toneExercises(level: number): Exercise[] {
  return shuffle(
    words.filter(
      (w) =>
        w.hanzi.length === 1 &&
        w.level <= level &&
        (characters[w.hanzi]?.pinyin.length || 0) === 1,
    ),
  )
    .slice(0, 8)
    .map((word) => ({
      mode: "tone-hearing",
      word,
      spoken: word.hanzi,
      prompt: "Which tone do you hear?",
      answer: toneLabels[tone(word.pinyin)],
      options: [...toneLabels],
      explanation: `${word.hanzi} · ${word.pinyin} · ${word.meaning}`,
    }));
}
export function exerciseXP(mode: Exercise["mode"]) {
  return mode === "match"
    ? 14
    : mode === "typing"
      ? 12
      : mode === "gap"
        ? 13
        : mode === "listening" || mode === "tone-hearing" || mode === "build"
          ? 15
          : mode === "write" || mode === "dictation"
            ? 16
            : 10;
}
