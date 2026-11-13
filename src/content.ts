import vocabulary from "./data/vocabulary.json";
import characterData from "./data/characters.json";
import { storySeeds } from "./stories";

export type Level = 1 | 2 | 3;
export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  level: Level;
  traditional: string;
  radical: string;
};
export const words = vocabulary as Word[];
export const wordById = Object.fromEntries(words.map((w) => [w.id, w]));
export const wordByHanzi = Object.fromEntries(words.map((w) => [w.hanzi, w]));
export type Character = {
  definition: string | null;
  pinyin: string[];
  decomposition: string;
  radical: string;
  medians: number[][][] | null;
};
export const characters = characterData as Record<string, Character>;
export type Token = { text: string; word?: Word };
export type Sentence = {
  text: string;
  translation: string;
  tokens: Token[];
  ids: number[];
};
export type ReadingCheck = {
  prompt: string;
  options?: string[];
  answer: string;
  kind: "choice" | "gap" | "write";
  explanation: string;
};
export type Lesson = {
  id: string;
  family: string;
  level: Level;
  topic: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  words: Word[];
  story: Sentence[];
  grammar: string;
  checks: ReadingCheck[];
  published: string;
  format: "Story" | "News-style";
};
const lexicon = [...words].sort((a, b) => b.hanzi.length - a.hanzi.length);
export function tokenize(text: string): Token[] {
  const result: Token[] = [];
  let rest = text;
  while (rest) {
    const found = lexicon.find((w) => rest.startsWith(w.hanzi));
    if (found) {
      const word =
        found.hanzi === "只" && /^只(?:小|大)?(?:猫|狗|鸟)/.test(rest)
          ? {
              ...found,
              pinyin: "zhī",
              meaning: "classifier for animals",
              traditional: "隻",
            }
          : found;
      result.push({ text: found.hanzi, word });
      rest = rest.slice(found.hanzi.length);
    } else {
      result.push({ text: Array.from(rest)[0] });
      rest = rest.slice(Array.from(rest)[0].length);
    }
  }
  return result;
}
export function sentence(text: string, translation: string): Sentence {
  const tokens = tokenize(text);
  return {
    text,
    translation,
    tokens,
    ids: tokens.flatMap((t) => (t.word ? [Number(t.word.id)] : [])),
  };
}
const legacy = [
  [
    "A little hello",
    "Meet someone new",
    "👋",
    "#FFE4BA",
    [
      ["你好！", "Hello!"],
      ["你叫什么名字？", "What is your name?"],
      ["我是学生。你也是学生吗？", "I am a student. Are you a student too?"],
      ["很高兴认识你！", "Nice to meet you!"],
    ],
    "Put 吗 at the end of a statement to ask a yes/no question. 我是学生。→ 你是学生吗？",
    "What does the speaker do?",
    "A student",
    ["A student", "A doctor", "A teacher"],
  ],
  [
    "Small numbers, big steps",
    "Count your everyday world",
    "🪁",
    "#DDD9FF",
    [
      ["我有三个苹果。", "I have three apples."],
      ["你有几个苹果？", "How many apples do you have?"],
      ["我有五个。", "I have five."],
      ["我们有八个苹果。", "We have eight apples."],
    ],
    "Use a measure word between a number and a noun: 三个苹果。个 is a useful general classifier.",
    "How many apples do they have together?",
    "Eight",
    ["Eight", "Three", "Five"],
  ],
  [
    "My favorite people",
    "Friends, family & belonging",
    "🌷",
    "#F8DCE4",
    [
      ["爸爸是老师。", "Dad is a teacher."],
      ["妈妈是医生。", "Mom is a doctor."],
      ["我是学生。", "I am a student."],
      ["我们都喜欢看书。", "We all like reading books."],
    ],
    "的 links an owner to a noun: 我的朋友 means my friend. With close family, 我的妈妈 can also be 我妈妈.",
    "What does Mom do?",
    "A doctor",
    ["A doctor", "A teacher", "A student"],
  ],
  [
    "Tea for two",
    "A tiny tea-shop story",
    "🍵",
    "#DCEBC8",
    [
      ["今天我和朋友去商店。", "Today my friend and I go to the shop."],
      ["你想喝茶吗？", "Would you like to drink tea?"],
      ["我想喝茶。", "I would like to drink tea."],
      ["一杯茶十块钱。", "A cup of tea costs ten yuan."],
      ["谢谢！再见！", "Thank you! Goodbye!"],
    ],
    "想 + verb expresses what you would like to do: 我想喝茶。Dictionary 一 is yī; before 杯 (first tone), it is usually pronounced yì.",
    "How much is a cup of tea?",
    "Ten yuan",
    ["Ten yuan", "Five yuan", "Two yuan"],
  ],
  [
    "Make time for Mandarin",
    "Today, tomorrow, a little daily",
    "☀️",
    "#FFE4BA",
    [
      ["今天是星期三。", "Today is Wednesday."],
      ["上午我去学校。", "In the morning I go to school."],
      ["下午三点我学习汉语。", "At three in the afternoon I study Chinese."],
      ["明天我也学习。", "I will study tomorrow too."],
    ],
    "Place time before the action: 下午三点我学习汉语。You can also put the subject first: 我下午三点学习汉语。",
    "When does the speaker study?",
    "Three in the afternoon",
    ["Three in the afternoon", "Ten at night", "Six in the morning"],
  ],
  [
    "A day in the neighborhood",
    "Find your place in the city",
    "🏡",
    "#D7E8F4",
    [
      ["我家在学校后面。", "My home is behind the school."],
      ["这里有一个商店。", "There is a shop here."],
      ["我去商店买水果。", "I go to the shop to buy fruit."],
      ["今天的苹果很好吃。", "Today’s apples are delicious."],
    ],
    "在 + place describes location. 有 introduces what exists: 这里有一个商店。",
    "What does the speaker buy?",
    "Fruit",
    ["Fruit", "Clothes", "Books"],
  ],
] as const;
export const lessons: Lesson[] = [
  ...legacy.map((r, i): Lesson => {
    const story = r[4].map((line) => sentence(line[0], line[1]));
    const key = story
      .flatMap((l) => l.tokens)
      .find((t) => t.word && t.word.hanzi.length > 1)!.word!;
    const gap = story.find((l) => l.text.includes(key.hanzi))!;
    const write =
      words
        .slice(i * 12, i * 12 + 12)
        .find((w) => w.id !== key.id && w.hanzi.length > 1) || key;
    return {
      id: String(i),
      family: `starter-${i}`,
      level: 1,
      topic: i === 3 ? "Food" : "Daily life",
      title: r[0],
      subtitle: r[1],
      emoji: r[2],
      color: r[3],
      story,
      words: words.slice(i * 12, i * 12 + 12),
      grammar: r[5],
      checks: [
        {
          prompt: r[6],
          answer: r[7],
          options: [...r[8]],
          kind: "choice",
          explanation: r[4].map((l) => l[1]).join(" "),
        },
        {
          prompt: gap.text.replace(key.hanzi, "___"),
          answer: key.hanzi,
          options: [
            key.hanzi,
            ...words
              .filter((w) => w.level === 1 && w.id !== key.id)
              .slice(0, 2)
              .map((w) => w.hanzi),
          ],
          kind: "gap",
          explanation: `${gap.translation} · ${key.pinyin}: ${key.meaning}`,
        },
        {
          prompt: `Type the Chinese word for “${write.meaning}”.`,
          answer: write.hanzi,
          kind: "write",
          explanation: `${write.hanzi} · ${write.pinyin} · ${write.meaning}`,
        },
      ],
      published: "2026-10-01",
      format: "Story",
    };
  }),
  ...storySeeds.flatMap((seed) =>
    seed.versions.map((version, i): Lesson => {
      const story = version.lines.map((l) => sentence(l[0], l[1]));
      const encountered = [...new Set(story.flatMap((line) => line.ids))].map(
        (id) => words[id],
      );
      const keyWords = encountered
        .filter(
          (w) =>
            !["的", "了", "是", "我", "你", "在", "和", "有", "个"].includes(
              w.hanzi,
            ),
        )
        .slice(0, 12);
      const gapWord = keyWords.find((w) => w.hanzi.length > 1) || keyWords[0];
      const gapLine = story.find((l) => l.text.includes(gapWord.hanzi))!;
      return {
        id: `${seed.id}-${i + 1}`,
        family: seed.id,
        level: (i + 1) as Level,
        topic: seed.topic,
        title: seed.title,
        subtitle: seed.subtitle,
        emoji: seed.emoji,
        color: seed.color,
        story,
        words: keyWords,
        grammar: version.grammar,
        published: "2026-10-01",
        format: seed.format,
        checks: [
          {
            prompt: version.check[0],
            answer: version.check[1],
            options: [...version.check[2]],
            kind: "choice",
            explanation: version.check[3],
          },
          {
            prompt: gapLine.text.replace(gapWord.hanzi, "___"),
            answer: gapWord.hanzi,
            options: [
              gapWord.hanzi,
              ...keyWords
                .filter((w) => w.id !== gapWord.id)
                .slice(0, 2)
                .map((w) => w.hanzi),
            ],
            kind: "gap",
            explanation: `${gapLine.translation} · ${gapWord.pinyin}: ${gapWord.meaning}`,
          },
          {
            prompt: version.reply[0],
            answer: version.reply[1],
            kind: "write",
            explanation: version.reply[2],
          },
        ],
      };
    }),
  ),
];
export const topics = [
  "Daily life",
  "Food",
  "Travel",
  "Nature",
  "Culture",
  "Learning",
  "Community",
  "Technology",
];
// Neutral, then tones 1–4: grey, hibiscus coral, bamboo-shoot amber, leaf
// green and sky blue.
export const toneColors = [
  "#66786B",
  "#D9503F",
  "#B67C0B",
  "#2C9150",
  "#3B82B8",
];
export function tone(s: string) {
  if (/[āēīōūǖ]/.test(s)) return 1;
  if (/[áéíóúǘ]/.test(s)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(s)) return 3;
  if (/[àèìòùǜ]/.test(s)) return 4;
  return 0;
}
export function normalizePinyin(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s’']/g, "");
}
export function displayText(text: string, traditional: boolean) {
  if (!traditional) return text;
  return tokenize(text)
    .map((t) => t.word?.traditional || t.text)
    .join("");
}
