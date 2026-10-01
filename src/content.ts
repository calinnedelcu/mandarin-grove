export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
};
// Dictionary tones; connected speech may use tone sandhi (e.g. nǐ hǎo).
const rows = [
  ["你", "nǐ", "you"],
  ["好", "hǎo", "good"],
  ["我", "wǒ", "I; me"],
  ["是", "shì", "to be"],
  ["叫", "jiào", "to be called"],
  ["什么", "shén me", "what"],
  ["名字", "míng zi", "name"],
  ["吗", "ma", "question particle"],
  ["不", "bù", "not"],
  ["谢谢", "xiè xie", "thank you"],
  ["再见", "zài jiàn", "goodbye"],
  ["中国", "zhōng guó", "China"],
  ["一", "yī", "one"],
  ["二", "èr", "two"],
  ["三", "sān", "three"],
  ["四", "sì", "four"],
  ["五", "wǔ", "five"],
  ["六", "liù", "six"],
  ["七", "qī", "seven"],
  ["八", "bā", "eight"],
  ["九", "jiǔ", "nine"],
  ["十", "shí", "ten"],
  ["几", "jǐ", "how many (small number)"],
  ["岁", "suì", "years old"],
  ["人", "rén", "person"],
  ["朋友", "péng you", "friend"],
  ["爸爸", "bà ba", "dad"],
  ["妈妈", "mā ma", "mom"],
  ["儿子", "ér zi", "son"],
  ["女儿", "nǚ ér", "daughter"],
  ["老师", "lǎo shī", "teacher"],
  ["学生", "xué sheng", "student"],
  ["他", "tā", "he"],
  ["她", "tā", "she"],
  ["我们", "wǒ men", "we; us"],
  ["的", "de", "possessive particle"],
  ["水", "shuǐ", "water"],
  ["茶", "chá", "tea"],
  ["米饭", "mǐ fàn", "cooked rice"],
  ["苹果", "píng guǒ", "apple"],
  ["吃", "chī", "to eat"],
  ["喝", "hē", "to drink"],
  ["喜欢", "xǐ huan", "to like"],
  ["想", "xiǎng", "to want; to think"],
  ["买", "mǎi", "to buy"],
  ["钱", "qián", "money"],
  ["多少", "duō shao", "how much; how many"],
  ["块", "kuài", "yuan (colloquial)"],
  ["今天", "jīn tiān", "today"],
  ["明天", "míng tiān", "tomorrow"],
  ["昨天", "zuó tiān", "yesterday"],
  ["现在", "xiàn zài", "now"],
  ["点", "diǎn", "o’clock; point"],
  ["分钟", "fēn zhōng", "minute"],
  ["年", "nián", "year"],
  ["月", "yuè", "month; moon"],
  ["日", "rì", "day; sun"],
  ["星期", "xīng qī", "week"],
  ["去", "qù", "to go"],
  ["来", "lái", "to come"],
  ["家", "jiā", "home; family"],
  ["学校", "xué xiào", "school"],
  ["商店", "shāng diàn", "shop"],
  ["医院", "yī yuàn", "hospital"],
  ["在", "zài", "at; in"],
  ["这里", "zhè lǐ", "here"],
  ["那里", "nà lǐ", "there"],
  ["哪儿", "nǎ r", "where"],
  ["有", "yǒu", "to have; there is"],
  ["看", "kàn", "to look; to watch"],
  ["书", "shū", "book"],
  ["学习", "xué xí", "to study"],
] as const;
export const words: Word[] = rows.map(([hanzi, pinyin, meaning], i) => ({
  id: String(i),
  hanzi,
  pinyin,
  meaning,
}));
export type Sentence = { ids: number[]; translation: string };
export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  words: Word[];
  story: Sentence[];
  grammar: string;
};
const themes = [
  {
    title: "A little hello",
    subtitle: "Meet someone new",
    emoji: "👋",
    color: "#FFE4BA",
    story: [
      { ids: [0, 1], translation: "Hello! (Literally: you + good.)" },
      {
        ids: [0, 1, 7],
        translation:
          "How are you? 吗 turns a statement into a yes/no question.",
      },
      { ids: [9, 10], translation: "Thank you. Goodbye!" },
    ],
    grammar:
      "Put 吗 at the end of a statement to make a yes/no question: 你好吗？ Are you well?",
  },
  {
    title: "Small numbers, big steps",
    subtitle: "Count your everyday world",
    emoji: "🪁",
    color: "#DDD9FF",
    story: [
      { ids: [12, 13, 14], translation: "One, two, three." },
      { ids: [2, 21, 23], translation: "I am ten years old." },
      { ids: [0, 22, 23], translation: "How old are you?" },
    ],
    grammar:
      "For age, Chinese usually skips 是: 我十岁。 I am ten years old. Ask with 几岁 for children.",
  },
  {
    title: "My favorite people",
    subtitle: "Friends, family & belonging",
    emoji: "🌷",
    color: "#F8DCE4",
    story: [
      { ids: [26, 3, 30], translation: "Dad is a teacher." },
      { ids: [27, 3, 30], translation: "Mom is a teacher." },
      { ids: [2, 3, 31], translation: "I am a student." },
    ],
    grammar:
      "的 links a person to something they belong to or own: 我的朋友 means my friend.",
  },
  {
    title: "Tea for two",
    subtitle: "A tiny tea-shop story",
    emoji: "🍵",
    color: "#DCEBC8",
    story: [
      { ids: [2, 41, 37], translation: "I drink tea." },
      { ids: [0, 42, 37, 7], translation: "Do you like tea?" },
      { ids: [2, 43, 44, 38], translation: "I want to buy cooked rice." },
    ],
    grammar:
      "想 + verb expresses what you would like to do. 我想喝茶。 I would like to drink tea.",
  },
  {
    title: "Make time for Mandarin",
    subtitle: "Today, tomorrow, a little daily",
    emoji: "☀️",
    color: "#FFE4BA",
    story: [
      { ids: [48, 2, 58], translation: "Today I am going." },
      { ids: [49, 0, 59, 7], translation: "Are you coming tomorrow?" },
      { ids: [51, 14, 52], translation: "It is three o’clock now." },
    ],
    grammar:
      "Time often goes before the action: 今天我去学校。 Today I am going to school.",
  },
  {
    title: "A day in the neighborhood",
    subtitle: "Find your place in the city",
    emoji: "🏡",
    color: "#D7E8F4",
    story: [
      { ids: [2, 64, 60], translation: "I am at home." },
      { ids: [65, 68, 70], translation: "There is a book here." },
      { ids: [2, 58, 61, 71], translation: "I go to school to study." },
    ],
    grammar:
      "在 + place describes location. 有 introduces what exists: 这里有书。 There are books here.",
  },
];
export const lessons: Lesson[] = themes.map((t, i) => ({
  ...t,
  id: String(i),
  words: words.slice(i * 12, i * 12 + 12),
}));
export const toneColors = [
  "#78827B",
  "#B94A43",
  "#B58118",
  "#328477",
  "#7461B7",
];
export function tone(s: string) {
  if (/[āēīōūǖ]/.test(s)) return 1;
  if (/[áéíóúǘ]/.test(s)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(s)) return 3;
  if (/[àèìòùǜ]/.test(s)) return 4;
  return 0;
}
