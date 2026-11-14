import { Lesson, lessons, Level } from "./content";

export type PlaceId =
  | "station"
  | "kuanzhai"
  | "park"
  | "jinli"
  | "pandas"
  | "chunxi"
  | "university";

export type Place = {
  id: PlaceId;
  zh: string;
  pinyin: string;
  en: string;
  /** A sentence or two about the real place. */
  note: string;
  /** The story families that happen here. */
  families: string[];
  wash: string;
  ink: string;
};

/**
 * A walk through Chengdu, in the order a visitor might take it. Every reading
 * belongs to one place; the order of the places is the order of the path.
 */
export const places: Place[] = [
  {
    id: "station",
    zh: "成都东站",
    pinyin: "Chéngdū Dōng Zhàn",
    en: "Chengdu East Station",
    note: "Chengdu East is the city's main high-speed rail station, and for many visitors the first place they say 你好.",
    families: ["arrival", "starter-0", "train"],
    wash: "#DCECF6",
    ink: "#2F6F9E",
  },
  {
    id: "kuanzhai",
    zh: "宽窄巷子",
    pinyin: "Kuān Zhǎi Xiàngzi",
    en: "Kuanzhai Alley",
    note: "Three restored Qing-dynasty lanes, Wide Alley, Narrow Alley and Well Alley, lined with courtyard houses, teahouses and snack stalls.",
    families: ["starter-5", "starter-2", "help", "birthday"],
    wash: "#F1EBDD",
    ink: "#6B5B3E",
  },
  {
    id: "park",
    zh: "人民公园",
    pinyin: "Rénmín Gōngyuán",
    en: "People's Park",
    note: "This is where Chengdu slows down. At the century-old Heming teahouse people sip tea from lidded bowls called 盖碗 and talk for hours.",
    families: ["teahouse", "starter-3", "park", "music"],
    wash: "#E4F3D6",
    ink: "#1C6E3A",
  },
  {
    id: "jinli",
    zh: "锦里",
    pinyin: "Jǐnlǐ",
    en: "Jinli Street",
    note: "An old-style street beside Wuhou Shrine, hung with red lanterns and known for street snacks such as candied haws on a stick.",
    families: ["starter-1", "market", "breakfast"],
    wash: "#FCEFC8",
    ink: "#B67C0B",
  },
  {
    id: "pandas",
    zh: "熊猫基地",
    pinyin: "Xióngmāo Jīdì",
    en: "Panda Base",
    note: "The Chengdu Research Base of Giant Panda Breeding is home to pandas of every age. Go in the morning: that is when they eat.",
    families: ["pandas", "cat", "rain"],
    wash: "#D6EFCB",
    ink: "#1C6E3A",
  },
  {
    id: "chunxi",
    zh: "春熙路",
    pinyin: "Chūnxī Lù",
    en: "Chunxi Road",
    note: "Chengdu's busiest shopping street. A giant panda sculpture climbs the side of the IFS tower above it.",
    families: ["phone", "starter-4"],
    wash: "#DCECF6",
    ink: "#2F6F9E",
  },
  {
    id: "university",
    zh: "四川大学",
    pinyin: "Sìchuān Dàxué",
    en: "Sichuan University",
    note: "One of China's oldest national universities, with a leafy campus beside the Jin River.",
    families: ["books", "language"],
    wash: "#ECE1F3",
    ink: "#7A4E9A",
  },
];

export function placeOf(lesson: Lesson): Place {
  return places.find((p) => p.families.includes(lesson.family)) || places[0];
}

/** The readings of one level that happen at a place, in reading order. */
export function readingsAt(place: Place, level: Level): Lesson[] {
  return lessons
    .filter((l) => l.level === level && placeOf(l).id === place.id)
    .sort(
      (a, b) =>
        place.families.indexOf(a.family) - place.families.indexOf(b.family),
    );
}
