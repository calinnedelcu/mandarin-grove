import { Lesson, Word } from "./content";
import { DeckStats, PlanStep } from "./extras";
import { Session } from "./exercises";
import { Mode, Progress } from "./learning";
import { AudioController } from "./useSpeech";

export type Tab = "Today" | "Path" | "Practice" | "Words" | "Me";

/** Everything a screen may read or ask the app to do. */
export type AppCtx = {
  p: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  now: number;
  audio: AudioController;
  due: Word[];
  deck: DeckStats;
  dailyXP: number;
  streak: number;
  today: Lesson;
  resume?: Lesson;
  plan: PlanStep[];
  go: (tab: Tab) => void;
  openLesson: (lesson: Lesson) => void;
  openWord: (word: Word) => void;
  plant: (word: Word) => void;
  startReview: () => void;
  smartPractice: () => void;
  wordQuiz: (
    pool: Word[],
    mode?: Mode,
    title?: string,
    options?: { zen?: boolean; timed?: boolean },
  ) => void;
  launch: (session: Session) => void;
  startPairs: (pool: Word[]) => void;
  startRadio: () => void;
  openSettings: () => void;
  openWriting: () => void;
  notify: (message: string) => void;
};
