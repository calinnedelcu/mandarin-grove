import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppCtx } from "../app";
import { GroveScene, Panda, ToneContour } from "../art";
import { toneColors, Word, words } from "../content";
import {
  dictationExercises,
  sentenceExercises,
  toneExercises,
} from "../exercises";
import { trickyWords } from "../extras";
import { Practice as Pool, practicePool } from "../learning";
import { C, F, toneNames } from "../theme";
import {
  Button,
  Chip,
  GlyphTile,
  IconButton,
  PageTitle,
  Row,
  s,
  Section,
  Zh,
} from "../ui";

const pools: { pool: Pool; label: string }[] = [
  { pool: "Mixed practice", label: "Whole deck" },
  { pool: "Daily review", label: "Due now" },
  { pool: "Practice weak", label: "Weak" },
  { pool: "Reinforce", label: "Growing" },
  { pool: "Retain", label: "Strong" },
  { pool: "Learn new", label: "New words" },
];
const toneDemo = [
  { hanzi: "妈", pinyin: "mā", tone: 1 },
  { hanzi: "麻", pinyin: "má", tone: 2 },
  { hanzi: "马", pinyin: "mǎ", tone: 3 },
  { hanzi: "骂", pinyin: "mà", tone: 4 },
];
type Area = "Words" | "Listening" | "Tones" | "Sentences";
type Drill = { glyph: string; title: string; caption: string; run: () => void };
const areas: {
  area: Area;
  glyph: string;
  caption: string;
  wash: string;
  ink: string;
}[] = [
  {
    area: "Words",
    glyph: "词",
    caption: "Meanings, recall, pairs and a sprint",
    wash: C.primaryWash,
    ink: C.primaryDeep,
  },
  {
    area: "Listening",
    glyph: "听",
    caption: "Train your ear with words and sentences",
    wash: C.skyWash,
    ink: C.sky,
  },
  {
    area: "Tones",
    glyph: "调",
    caption: "Hear, see and spell the four tones",
    wash: C.plumWash,
    ink: C.plum,
  },
  {
    area: "Sentences",
    glyph: "句",
    caption: "Rebuild and write lines from your story",
    wash: C.amberWash,
    ink: C.amberDeep,
  },
];

export function Practice({ app }: { app: AppCtx }) {
  const { p, due, deck, audio } = app;
  const [pool, setPool] = useState<Pool>("Mixed practice"),
    [open, setOpen] = useState<Area | null>(null);
  const story = app.resume || app.today,
    tricky = trickyWords(p),
    starter = words.filter((w) => w.level <= p.settings.level).slice(0, 20),
    chosen = practicePool(p, pool, app.now),
    // An empty deck still deserves a drill: fall back to the level's words.
    active: Word[] = chosen.length ? chosen : deck.saved.length ? [] : starter;
  const start = (action: () => void) => () => {
    setOpen(null);
    action();
  };
  const quiz = (
    mode: Parameters<AppCtx["wordQuiz"]>[1],
    title: string,
    options?: { zen?: boolean; timed?: boolean },
  ) => start(() => app.wordQuiz(active, mode, title, options));

  const drills: Record<Area, Drill[]> = {
    Words: [
      {
        glyph: "义",
        title: "Meaning detective",
        caption: "See a word, find what it means",
        run: quiz("meaning", "Meaning detective"),
      },
      {
        glyph: "忆",
        title: "Recall the characters",
        caption: "See a meaning, find the word",
        run: quiz("reverse", "Recall the characters"),
      },
      {
        glyph: "配",
        title: "Match pairs",
        caption: "Four words, four meanings",
        run: start(() => app.startPairs(active)),
      },
      {
        glyph: "快",
        title: "Keyword sprint",
        caption: `60 seconds · best ${p.bestSprint}`,
        run: quiz("meaning", "Keyword sprint", { timed: true }),
      },
      {
        glyph: "静",
        title: "Zen mode",
        caption: "No timer, no rush",
        run: quiz(undefined, "Zen mode", { zen: true }),
      },
    ],
    Listening: [
      {
        glyph: "听",
        title: "Listen & recognize",
        caption: "Hear a word, find its characters",
        run: quiz("listening", "Listen & recognize"),
      },
      {
        glyph: "默",
        title: "Dictation",
        caption: "Hear a sentence, rebuild it",
        run: start(() =>
          app.launch({
            title: "Dictation",
            lessonId: null,
            exercises: dictationExercises(story),
          }),
        ),
      },
      {
        glyph: "播",
        title: "Grove Radio",
        caption: "Stories at your level, back to back",
        run: start(app.startRadio),
      },
    ],
    Tones: [
      {
        glyph: "耳",
        title: "Hear & name the tone",
        caption: "One syllable, which tone?",
        run: start(() =>
          app.launch({
            title: "Tone studio",
            lessonId: null,
            exercises: toneExercises(p.settings.level),
          }),
        ),
      },
      {
        glyph: "声",
        title: "Find the right tones",
        caption: "Same syllables, different tones",
        run: quiz("tone", "Find the tones"),
      },
      {
        glyph: "拼",
        title: "Pinyin recall",
        caption: "Type the pinyin, tones and all",
        run: quiz("typing", "Pinyin recall"),
      },
    ],
    Sentences: [
      {
        glyph: "造",
        title: "Sentence building",
        caption: "Put the words back in order",
        run: start(() =>
          app.launch({
            title: "Sentence building",
            lessonId: null,
            exercises: sentenceExercises(story, "build"),
          }),
        ),
      },
      {
        glyph: "写",
        title: "Sentence writing",
        caption: "Type a line from memory",
        run: start(() =>
          app.launch({
            title: "Sentence writing",
            lessonId: null,
            exercises: sentenceExercises(story, "write"),
          }),
        ),
      },
    ],
  };
  const current = areas.find((a) => a.area === open);

  return (
    <>
      <PageTitle zh="练" pinyin="liàn · practise" title="A little, often." />

      <View style={s.darkCard}>
        <GroveScene dark sun={false} height={190} />
        <Text style={[s.eyebrow, { color: C.onDarkMuted }]}>Spaced review</Text>
        <View style={[s.line, { alignItems: "flex-end", gap: 10 }]}>
          <Text
            style={{
              fontFamily: F.displayBold,
              fontSize: 64,
              lineHeight: 70,
              color: C.onDark,
            }}
          >
            {due.length}
          </Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={[s.cardTitle, { color: C.onDark }]}>
              {due.length === 1 ? "word is ready" : "words are ready"}
            </Text>
            <Text style={[s.caption, { color: C.onDarkMuted }]}>
              {deck.saved.length} planted · {deck.strong} strong
            </Text>
          </View>
        </View>
        <View style={{ width: "66%" }}>
          {due.length ? (
            <Button label="Start spaced review →" onPress={app.startReview} />
          ) : (
            <Button
              label={deck.saved.length ? "Surprise me →" : "Explore a story →"}
              onPress={() =>
                deck.saved.length ? app.smartPractice() : app.go("Path")
              }
            />
          )}
        </View>
        <Panda
          head
          size={112}
          mood={due.length ? "calm" : "sleepy"}
          style={{ position: "absolute", right: -8, bottom: -14 }}
        />
      </View>

      {tricky.length > 0 && (
        <Row
          title="Tricky words"
          caption={`${tricky.length} ${tricky.length === 1 ? "word has" : "words have"} slipped. Try again.`}
          onPress={() => app.wordQuiz(tricky, undefined, "Tricky words")}
          left={
            <GlyphTile
              glyph="难"
              size={50}
              wash={C.coralWash}
              ink={C.coralDeep}
            />
          }
        />
      )}

      <Section title="Choose a drill" />
      {areas.map((a) => (
        <Row
          key={a.area}
          title={a.area}
          caption={a.caption}
          label={`${a.area} drills`}
          onPress={() => setOpen(a.area)}
          left={
            <GlyphTile glyph={a.glyph} size={50} wash={a.wash} ink={a.ink} />
          }
        />
      ))}
      <Row
        title="Writing"
        caption={`Trace characters stroke by stroke · ${Object.keys(p.writing).length} written`}
        label="Brush practice"
        onPress={app.openWriting}
        left={
          <GlyphTile glyph="写" size={50} wash={C.limeWash} ink={C.forest} />
        }
      />

      {current && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(null)}
        >
          <View style={[StyleSheet.absoluteFill, s.scrim]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close drills"
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(null)}
            />
            <View style={s.sheet}>
              <View style={s.grabber} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[s.row, { marginBottom: 12 }]}>
                  <View style={[s.line, { gap: 12 }]}>
                    <GlyphTile
                      glyph={current.glyph}
                      size={46}
                      wash={current.wash}
                      ink={current.ink}
                    />
                    <Text style={s.title}>{current.area}</Text>
                  </View>
                  <IconButton
                    name="close"
                    label="Close drill list"
                    onPress={() => setOpen(null)}
                  />
                </View>
                {open === "Words" && (
                  <>
                    <Text style={[s.caption, { marginBottom: 8 }]}>
                      Which words?
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -20, marginBottom: 12 }}
                      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
                    >
                      {pools.map((item) => (
                        <Chip
                          key={item.pool}
                          label={`${item.label} · ${practicePool(p, item.pool, app.now).length}`}
                          selected={pool === item.pool}
                          onPress={() => setPool(item.pool)}
                        />
                      ))}
                    </ScrollView>
                    {!chosen.length && (
                      <Text style={[s.caption, { marginBottom: 10 }]}>
                        {deck.saved.length
                          ? "No words in this group yet. Pick another."
                          : "Your deck is empty, so drills use the first words of your level."}
                      </Text>
                    )}
                  </>
                )}
                {open === "Tones" && (
                  <View style={[s.card, { paddingVertical: 12 }]}>
                    <View style={s.row}>
                      {toneDemo.map((t) => (
                        <Pressable
                          key={t.tone}
                          accessibilityRole="button"
                          accessibilityLabel={`Hear tone ${t.tone}: ${t.pinyin}`}
                          onPress={() => audio.say(t.hanzi)}
                          style={({ pressed }) => ({
                            flex: 1,
                            alignItems: "center",
                            paddingVertical: 6,
                            borderRadius: 14,
                            backgroundColor: pressed ? C.bgDeep : "transparent",
                          })}
                        >
                          <ToneContour tone={t.tone} width={46} guide />
                          <Zh size={24} color={toneColors[t.tone]}>
                            {t.hanzi}
                          </Zh>
                          <Text
                            style={[s.caption, { color: toneColors[t.tone] }]}
                          >
                            {t.pinyin}
                          </Text>
                          <Text style={[s.caption, { fontSize: 10.5 }]}>
                            {toneNames[t.tone]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text
                      style={[s.caption, { textAlign: "center", marginTop: 6 }]}
                    >
                      Tap a tone to hear its shape.
                    </Text>
                  </View>
                )}
                {open === "Sentences" && (
                  <Text style={[s.caption, { marginBottom: 10 }]}>
                    Lines from {story.title}.
                  </Text>
                )}
                {drills[current.area].map((d) => (
                  <Row
                    key={d.title}
                    title={d.title}
                    caption={d.caption}
                    onPress={d.run}
                    left={
                      <GlyphTile
                        glyph={d.glyph}
                        size={44}
                        wash={current.wash}
                        ink={current.ink}
                      />
                    }
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
