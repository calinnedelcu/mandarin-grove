import { Lesson, Level, lessons, Word, words } from "./content";
import {
  activeStreak,
  dayKey,
  emptyActivity,
  Progress,
  strength,
} from "./learning";

/** One brushed character stands on the cover of each story family. */
const glyphs: Record<string, string> = {
  "starter-0": "好",
  "starter-1": "三",
  "starter-2": "家",
  "starter-3": "茶",
  "starter-4": "时",
  "starter-5": "邻",
  breakfast: "早",
  cat: "猫",
  rain: "雨",
  market: "果",
  train: "车",
  books: "书",
  birthday: "礼",
  park: "园",
  phone: "信",
  language: "句",
  music: "乐",
  help: "帮",
};
export function glyphFor(lesson: Lesson) {
  return glyphs[lesson.family] || lesson.words[0]?.hanzi[0] || "文";
}

export type Proverb = { zh: string; pinyin: string; meaning: string };
/** Well-known sayings about learning, patience and steady work. */
export const proverbs: Proverb[] = [
  {
    zh: "千里之行，始于足下",
    pinyin: "qiān lǐ zhī xíng, shǐ yú zú xià",
    meaning: "A journey of a thousand miles begins with a single step.",
  },
  {
    zh: "活到老，学到老",
    pinyin: "huó dào lǎo, xué dào lǎo",
    meaning: "Live until you are old, learn until you are old.",
  },
  {
    zh: "熟能生巧",
    pinyin: "shú néng shēng qiǎo",
    meaning: "Practice makes perfect.",
  },
  {
    zh: "不怕慢，就怕站",
    pinyin: "bù pà màn, jiù pà zhàn",
    meaning: "Do not fear going slowly; fear only standing still.",
  },
  {
    zh: "万事开头难",
    pinyin: "wàn shì kāi tóu nán",
    meaning: "Every beginning is hard.",
  },
  {
    zh: "水滴石穿",
    pinyin: "shuǐ dī shí chuān",
    meaning: "Dripping water wears through stone.",
  },
  {
    zh: "积少成多",
    pinyin: "jī shǎo chéng duō",
    meaning: "Many a little makes a lot.",
  },
  {
    zh: "有志者事竟成",
    pinyin: "yǒu zhì zhě shì jìng chéng",
    meaning: "Where there is a will, there is a way.",
  },
  {
    zh: "温故而知新",
    pinyin: "wēn gù ér zhī xīn",
    meaning: "Review the old and you will understand the new.",
  },
  {
    zh: "百闻不如一见",
    pinyin: "bǎi wén bù rú yī jiàn",
    meaning: "Seeing once is better than hearing a hundred times.",
  },
  {
    zh: "三人行，必有我师",
    pinyin: "sān rén xíng, bì yǒu wǒ shī",
    meaning: "Among any three people walking, one can be my teacher.",
  },
  {
    zh: "读万卷书，行万里路",
    pinyin: "dú wàn juàn shū, xíng wàn lǐ lù",
    meaning: "Read ten thousand books; travel ten thousand miles.",
  },
  {
    zh: "好好学习，天天向上",
    pinyin: "hǎo hǎo xué xí, tiān tiān xiàng shàng",
    meaning: "Study well and make progress every day.",
  },
  {
    zh: "一步一个脚印",
    pinyin: "yī bù yī gè jiǎo yìn",
    meaning: "One step, one footprint: steady, honest progress.",
  },
  {
    zh: "欲速则不达",
    pinyin: "yù sù zé bù dá",
    meaning: "Haste does not reach the goal.",
  },
  {
    zh: "学无止境",
    pinyin: "xué wú zhǐ jìng",
    meaning: "Learning has no end.",
  },
  {
    zh: "今日事，今日毕",
    pinyin: "jīn rì shì, jīn rì bì",
    meaning: "Finish today's work today.",
  },
  {
    zh: "一分耕耘，一分收获",
    pinyin: "yī fēn gēng yún, yī fēn shōu huò",
    meaning: "You harvest what you tend.",
  },
  {
    zh: "天道酬勤",
    pinyin: "tiān dào chóu qín",
    meaning: "Heaven rewards the diligent.",
  },
  {
    zh: "书山有路勤为径",
    pinyin: "shū shān yǒu lù qín wéi jìng",
    meaning: "Diligence is the path up the mountain of books.",
  },
  {
    zh: "慢慢来",
    pinyin: "màn màn lái",
    meaning: "Take your time.",
  },
];

function dayNumber(now: Date) {
  return Math.floor(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() /
      86400000,
  );
}
export function proverbOfDay(now = new Date()) {
  return proverbs[dayNumber(now) % proverbs.length];
}
/** A word at the learner's level that is not in their deck yet. */
export function wordOfDay(p: Progress, now = new Date()): Word {
  const level = words.filter((w) => w.level === p.settings.level),
    fresh = level.filter((w) => !p.cards[w.id] && w.hanzi.length > 1),
    pool = fresh.length ? fresh : level;
  return pool[(dayNumber(now) * 7) % pool.length];
}

const numerals = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
export function chineseNumber(n: number) {
  if (n <= 10) return n === 10 ? "十" : numerals[n];
  if (n < 20) return `十${numerals[n % 10]}`;
  return `${numerals[Math.floor(n / 10)]}十${n % 10 ? numerals[n % 10] : ""}`;
}
/** 十一月十三日 · 星期五 */
export function chineseDate(now = new Date()) {
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  return `${chineseNumber(now.getMonth() + 1)}月${chineseNumber(now.getDate())}日 · 星期${weekday}`;
}
export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 11
    ? { zh: "早上好", pinyin: "zǎo shang hǎo", en: "Good morning" }
    : h < 13
      ? { zh: "中午好", pinyin: "zhōng wǔ hǎo", en: "Good day" }
      : h < 18
        ? { zh: "下午好", pinyin: "xià wǔ hǎo", en: "Good afternoon" }
        : { zh: "晚上好", pinyin: "wǎn shang hǎo", en: "Good evening" };
}

/** XP turns a seed into a sea of bamboo. */
export const ranks = [
  { xp: 0, zh: "种子", pinyin: "zhǒng zi", en: "Seed" },
  { xp: 100, zh: "竹笋", pinyin: "zhú sǔn", en: "Bamboo shoot" },
  { xp: 400, zh: "新竹", pinyin: "xīn zhú", en: "Young bamboo" },
  { xp: 1000, zh: "青竹", pinyin: "qīng zhú", en: "Green bamboo" },
  { xp: 2500, zh: "竹林", pinyin: "zhú lín", en: "Bamboo grove" },
  { xp: 5000, zh: "竹海", pinyin: "zhú hǎi", en: "Sea of bamboo" },
];
export function rankFor(xp: number) {
  const index = ranks.reduce((best, r, i) => (xp >= r.xp ? i : best), 0),
    current = ranks[index],
    next = ranks[index + 1];
  return {
    ...current,
    index,
    next,
    progress: next ? (xp - current.xp) / (next.xp - current.xp) : 1,
    toNext: next ? next.xp - xp : 0,
  };
}

export type DeckStats = {
  saved: Word[];
  fresh: number;
  growing: number;
  strong: number;
};
export function deckStats(p: Progress): DeckStats {
  const saved = words.filter((w) => p.cards[w.id]);
  let fresh = 0,
    growing = 0,
    strong = 0;
  for (const w of saved) {
    const v = strength(p.cards[w.id]);
    if (v >= 75) strong++;
    else if (v > 0) growing++;
    else fresh++;
  }
  return { saved, fresh, growing, strong };
}

/** Saved words that have slipped at least once, hardest first. */
export function trickyWords(p: Progress): Word[] {
  return words
    .filter((w) => (p.cards[w.id]?.lapses || 0) > 0)
    .sort(
      (a, b) =>
        p.cards[b.id].lapses - p.cards[a.id].lapses ||
        strength(p.cards[a.id]) - strength(p.cards[b.id]),
    );
}

/** How much of a reading the learner has already planted. */
export function coverage(lesson: Lesson, p: Progress) {
  const ids = [...new Set(lesson.story.flatMap((line) => line.ids))],
    known = ids.filter((id) => p.cards[String(id)]).length;
  return { known, total: ids.length };
}

/**
 * The readings of one level in walking order: the starter chapters first,
 * then the learner's chosen interests, then everything else.
 */
export function pathUnits(level: Level, interests: string[] = []) {
  const all = lessons.filter((l) => l.level === level),
    starters = all.filter((l) => l.family.startsWith("starter-")),
    rest = all.filter((l) => !l.family.startsWith("starter-"));
  return [
    ...starters,
    ...rest.filter((l) => interests.includes(l.topic)),
    ...rest.filter((l) => !interests.includes(l.topic)),
  ];
}
/** The first reading on the learner's path that they have not finished. */
export function nextOnPath(p: Progress): Lesson {
  const level = pathUnits(p.settings.level, p.settings.topics);
  return (
    level.find((l) => !p.completed.includes(l.id)) ||
    lessons.find((l) => !p.completed.includes(l.id)) ||
    level[0]
  );
}
/** Pin one reading to today, so finishing it does not replace it. */
export function pinDaily(p: Progress, now = new Date()): Progress {
  const day = dayKey(now);
  if (p.daily?.day === day && lessons.some((l) => l.id === p.daily!.lessonId))
    return p;
  return { ...p, daily: { day, lessonId: nextOnPath(p).id } };
}

export type PlanStep = {
  key: "review" | "read" | "practice";
  done: boolean;
  idle?: boolean;
};
/** The three small steps of a day: remember, read, practise. */
export function dailyPlan(
  p: Progress,
  dueCount: number,
  today: Lesson,
  now = new Date(),
): PlanStep[] {
  const a = { ...emptyActivity, ...p.activity[dayKey(now)] },
    hasDeck = Object.keys(p.cards).length > 0;
  return [
    { key: "review", done: hasDeck && dueCount === 0, idle: !hasDeck },
    {
      key: "read",
      done: p.completed.includes(today.id) || a.stories > 0,
    },
    { key: "practice", done: a.answered >= 8 },
  ];
}

export type Achievement = {
  seal: string;
  title: string;
  detail: string;
  earned: boolean;
};
export function achievements(p: Progress, now = new Date()): Achievement[] {
  const deck = deckStats(p),
    streak = activeStreak(p, now),
    goalDays = Object.values(p.activity).filter(
      (a) => a.xp >= p.settings.dailyGoal,
    ).length,
    level1 = pathUnits(1);
  return [
    {
      seal: "始",
      title: "First word",
      detail: "Plant your first word",
      earned: deck.saved.length > 0,
    },
    {
      seal: "读",
      title: "First story",
      detail: "Finish a reading",
      earned: p.completed.length > 0,
    },
    {
      seal: "三",
      title: "Three-day ritual",
      detail: "Practise three days in a row",
      earned: streak >= 3,
    },
    {
      seal: "七",
      title: "A full week",
      detail: "Keep a seven-day streak",
      earned: streak >= 7,
    },
    {
      seal: "林",
      title: "50 words",
      detail: "Plant fifty words",
      earned: deck.saved.length >= 50,
    },
    {
      seal: "强",
      title: "Deep roots",
      detail: "Grow 25 strong words",
      earned: deck.strong >= 25,
    },
    {
      seal: "调",
      title: "Tone explorer",
      detail: "Answer ten tone questions",
      earned: p.toneCorrect >= 10,
    },
    {
      seal: "写",
      title: "Character gardener",
      detail: "Trace five characters",
      earned: Object.keys(p.writing).length >= 5,
    },
    {
      seal: "十",
      title: "Ten stories",
      detail: "Finish ten readings",
      earned: p.completed.length >= 10,
    },
    {
      seal: "快",
      title: "Quick brush",
      detail: "Score 10 in a keyword sprint",
      earned: p.bestSprint >= 10,
    },
    {
      seal: "满",
      title: "Seven full days",
      detail: "Meet your daily goal seven times",
      earned: goalDays >= 7,
    },
    {
      seal: "一",
      title: "First mountain",
      detail: "Finish every HSK 1 reading",
      earned: level1.every((l) => p.completed.includes(l.id)),
    },
  ];
}
