# Curriculum, pronunciation and data provenance

Updated October 1, 2026. Mandarin Grove teaches beginners through intermediate learners, with every curriculum entry and study-level choice capped at **HSK 3**.

## Bundled vocabulary

`src/data/vocabulary.json` contains **618 unique entries**: 165 labeled HSK 1, 155 HSK 2 and 298 HSK 3. It combines 595 unique entries from the legacy HSK 2.0 levels 1–3, three retained location expressions, and 20 useful building blocks. The original 72 word IDs remain at indices 0–71; existing personal cards still identify the same words.

The base dataset is [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary), by Yanis Zafirópulos, under MIT. Source lists are `wordlists/exclusive/old/1.json`, `2.json` and `3.json`; the repository head observed during research was `7ac65bf1a6387d35f1ade478906172a19311c7f9`. The data uses dictionary entries with multiple possible pronunciations. Selecting the first alternative blindly is unsafe: it can select a surname or uncommon reading instead of the beginner word.

The bundled selection therefore curates ordinary meanings and readings. Examples include 听 tīng, 鸟 niǎo, 读 dú, 万 wàn, 都 dōu, 个 gè, 号 hào, 胖 pàng, 骑 qí and 教 jiāo. Multi-character readings include 音乐 yīn yuè and 银行 yín háng; functional readings include 的 de, 得 de, 地 de, 着 zhe and 了 le. 哪儿 is nǎr, and 一会儿 is yī huìr. Traditional forms are selected alongside the intended word reading, rather than accepting a mismatched alternative.

Every entry with an upstream equivalent was compared against **all** upstream pronunciation alternatives. Four use full-tone standard forms where that source prefers a neutral suffix: 后面 hòu miàn, 小姐 xiǎo jiě, 右边 yòu biān and 左边 zuǒ biān. Regional and conversational neutral-tone variation is normal. See the compact [pronunciation audit](research-data/pinyin-audit.json).

Pinyin shows dictionary pronunciation with tone marks, and leaves neutral syllables unmarked. It does not attempt to rewrite dictionary pinyin for every connected-speech change. The reader explains third-tone sandhi and changes to 一/不. Tokenization supplies **zhī / 隻** for animal-classifier 只, including 一只猫 and 一只小猫, while the dictionary entry is **zhǐ / 只** meaning only. This is a targeted context rule, not a general-purpose Chinese parser.

The level labels are a teaching guide based on legacy HSK vocabulary, not a claim about certification or complete coverage of a current exam specification. Small grammatical building blocks and retained starter expressions are intentionally available too.

## Original graded readings

`src/stories.ts` contains **12 story families, each with three versions**. The six original chapter IDs 0–5 are retained with expanded, coherent readings. The total is **42 readings**, each with English sentence translations, a grammar note, keywords and three comprehension checks.

Families: a slower breakfast, a visiting cat, changing weather, market shopping, a train trip, neighborhood books, a birthday, a park, learning to use a phone, learning Mandarin, a music performance and helping a neighbor. Topics cover Food, Nature, Travel, Community, Daily life, Technology, Learning and Culture.

HSK 1 versions use short concrete clauses; HSK 2 adds time, reasons, ongoing actions and simple results; HSK 3 develops sequencing, concession, purpose, comparisons and connected paragraphs. A few easier versions use useful words from another level within HSK 1–3. Those words are disclosed as a small stretch in the reader. The content audit rejects characters that have no tappable vocabulary entry and prevents advanced vocabulary from entering the bundled curriculum.

These are **original fictional practice scenes**, including the “News-style” pieces. Their October 1 edition date describes bundled educational content. They are not scraped journalism, actual current events, or WireLingo articles. No WireLingo article, artwork or app code is redistributed.

Writing exercises use an explicitly shown story model. The answer checker tolerates punctuation and whitespace; it is not an evaluator of every valid Chinese paraphrase. Pinyin recall requires the correct tone marks. Placement is a six-question suggestion, not a validated HSK assessment. Speech is device text-to-speech, not a native-speaker recording or pronunciation-scoring service.

## Character data and stroke practice

`src/data/characters.json` is a compact subset of [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), containing 620 characters used by the bundled vocabulary. Repository head observed: `bddc96d41bef78427ed0e034e9f7e31d71fd1b92`. Only the required dictionary fields and ordered stroke medians are retained; data values are unchanged. This avoids shipping the full upstream graphics collection.

Definitions, radicals and IDS visual decomposition come from `dictionary.txt`, which upstream derives from Unihan and CJKlib and licenses under **LGPL 3 or later**. Ordered stroke medians come from `graphics.txt`, derived from Arphic fonts and licensed under the **Arphic Public License**. The license notices and texts are included in [licenses](licenses/README.md). These data licenses apply separately from the app code's license.

Visual components are structural aids, not invented etymologies. The app renders median paths with React Native views, demonstrates their order, and checks tracing direction, endpoints and approximate shape. It does not recognize arbitrary handwriting. Guides use the simplified dictionary character even when traditional reading display is enabled.

## Checks

`npm test` validates unique IDs, all HSK bounds, marked-pinyin characters, common polyphonic corrections, legacy IDs, token coverage, three comprehension formats, all three versions per family, character metadata and review/quiz rules. The exported-app interaction test checks lookup, tone-aware typing, story versions and character-demo controls. A Chinese teacher/native editorial review and real-device speech acceptance remain valuable before publishing a commercial curriculum; automated integrity checks do not certify every usage choice.
