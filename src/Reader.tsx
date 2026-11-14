import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stamp } from "./art";
import {
  displayText,
  Lesson,
  lessons,
  Sentence,
  speakers,
  Word,
} from "./content";
import { coverage, glyphFor } from "./extras";
import { Progress, saveWord, strength } from "./learning";
import { C, F, s, shadow, topicInk } from "./theme";
import { AudioController } from "./useSpeech";
import {
  Button,
  Chip,
  GlyphTile,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Mixed,
  Pinyin,
  Section,
} from "./ui";
import { WordSheet } from "./WordSheet";

const rates = [0.65, 0.85, 1, 1.15];

/** The first sense of a word, short enough to sit under it. */
function gloss(word: Word) {
  return word.meaning.split(/[;(]/)[0].trim();
}
type Phrase = { text: string; word?: Word; tail: string };
/** A word with the punctuation that follows it, so a comma never wraps alone. */
function phrases(sentence: Sentence): Phrase[] {
  const result: Phrase[] = [];
  for (const token of sentence.tokens) {
    if (token.word)
      result.push({ text: token.text, word: token.word, tail: "" });
    else if (result.length) result[result.length - 1].tail += token.text;
    else result.push({ text: "", tail: token.text });
  }
  return result;
}

export function Reader({
  lesson,
  p,
  audio,
  onClose,
  onLesson,
  onProgress,
  onWordSave,
  onQuiz,
  onComprehension,
  onWrite,
  next,
}: {
  lesson: Lesson;
  p: Progress;
  audio: AudioController;
  onClose: () => void;
  onLesson: (l: Lesson) => void;
  onProgress: (update: (p: Progress) => Progress) => void;
  onWordSave: (w: Word) => void;
  onQuiz: () => void;
  onComprehension: () => void;
  onWrite: (char: string) => void;
  /** The next unread reading at the same place, offered once this is done. */
  next?: Lesson | null;
}) {
  const [word, setWord] = useState<Word | null>(null),
    [context, setContext] = useState<Sentence | undefined>(),
    [settingsOpen, setSettingsOpen] = useState(false),
    [translationLines, setTranslationLines] = useState<number[]>([]);
  const scroll = useRef<ScrollView>(null),
    positions = useRef<Record<number, number>>({}),
    page = useRef(0);
  const [line, setLine] = useState(
    Math.min(p.positions[lesson.id] || 0, lesson.story.length - 1),
  );
  const mine = audio.current?.lessonId === lesson.id,
    activeLine = mine ? audio.current!.line : undefined,
    playing = audio.playing && mine;
  const versions = lessons.filter((l) => l.family === lesson.family);
  const stretch = [
    ...new Set(
      lesson.story
        .flatMap((l) => l.tokens)
        .filter((t) => t.word && t.word.level > lesson.level)
        .map((t) => t.text),
    ),
  ];
  const tint = topicInk[lesson.topic] || topicInk["Daily life"],
    cover = coverage(lesson, p),
    unplanted = lesson.words.filter((w) => !p.cards[w.id]),
    finished = p.completed.includes(lesson.id);
  useEffect(() => {
    setTranslationLines([]);
    setLine(Math.min(p.positions[lesson.id] || 0, lesson.story.length - 1));
  }, [lesson.id]);
  const scrollToLine = (i: number) =>
    scroll.current?.scrollTo({
      y: Math.max(0, page.current + (positions.current[i] || 0) - 24),
      animated: true,
    });
  useEffect(() => {
    if (activeLine !== undefined) {
      setLine(activeLine);
      onProgress((prev) => ({
        ...prev,
        positions: { ...prev.positions, [lesson.id]: activeLine },
      }));
      scrollToLine(activeLine);
    }
  }, [activeLine]);
  const lookup = (w: Word, sentence?: Sentence) => {
    audio.stop();
    setWord(w);
    setContext(sentence);
  };
  function position(i: number) {
    setLine(i);
    onProgress((prev) => ({
      ...prev,
      positions: { ...prev.positions, [lesson.id]: i },
    }));
  }
  function play() {
    if (playing) audio.stop();
    else
      audio.play(
        lesson.story.map((l, i) => ({
          text: l.text,
          voice: l.speaker,
          lessonId: lesson.id,
          line: i,
        })),
        line,
      );
  }
  const settings = p.settings,
    focus = !!settings.focus,
    seenHint = !!p.hints?.includes("reader");
  // The translate button flips one sentence against the reader's setting:
  // it reveals the English when it is hidden, and hides it when it is shown.
  const shown = (i: number) =>
    settings.translation !== translationLines.includes(i);
  const set = (change: Partial<Progress["settings"]>) =>
    onProgress((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...change },
    }));
  const echo = (w: Word) => {
    const card = p.cards[w.id];
    if (!settings.echo || !card) return null;
    const v = strength(card);
    return v >= 75 ? "#BFE3B0" : v > 0 ? C.limeWash : C.amberWash;
  };
  /** In one-line mode: move to a line and say it. */
  function step(i: number) {
    position(i);
    const item = lesson.story[i];
    audio.play([
      { text: item.text, voice: item.speaker, lessonId: lesson.id, line: i },
    ]);
  }
  /** One line of the story: who speaks, its words, then the English. */
  const sentence = (item: Sentence, i: number, big: boolean) => {
    const size = settings.fontSize + (big ? 6 : 0);
    return (
      <>
        {item.speaker && (
          <View style={[s.line, { gap: 8, marginBottom: 6 }]}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.speaker === "L" ? C.coralWash : C.skyWash,
              }}
            >
              <Text
                style={{
                  fontFamily: F.kaiBold,
                  fontSize: 16,
                  lineHeight: 20,
                  color: item.speaker === "L" ? C.coralDeep : C.sky,
                }}
              >
                {speakers[item.speaker].zh[0]}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: F.kai,
                fontSize: 15,
                color: C.ink,
              }}
            >
              {speakers[item.speaker].zh}
            </Text>
            <Text style={s.caption}>{speakers[item.speaker].en}</Text>
          </View>
        )}
        <View
          style={[
            s.wrap,
            {
              gap: settings.spacious ? 12 : settings.gloss ? 6 : 2,
              alignItems: "flex-end",
              justifyContent: big ? "center" : "flex-start",
            },
          ]}
        >
          {phrases(item).map((phrase, j) => (
            <View
              key={j}
              style={{ flexDirection: "row", alignItems: "flex-end" }}
            >
              {phrase.word && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${displayText(phrase.text, settings.traditional)} · ${phrase.word.pinyin} · ${phrase.word.meaning}`}
                  onPress={() => {
                    position(i);
                    lookup(phrase.word!, item);
                  }}
                  style={({ pressed }) => [
                    s.token,
                    {
                      backgroundColor: echo(phrase.word!) || undefined,
                    },
                    pressed && { backgroundColor: C.amberWash },
                  ]}
                >
                  {settings.pinyin && <Pinyin word={phrase.word} />}
                  {/* Punctuation stays against its word, on the hanzi line. */}
                  <View style={{ flexDirection: "row" }}>
                    <Hanzi
                      word={phrase.word}
                      size={size}
                      colored={false}
                      traditional={settings.traditional}
                    />
                    {!!phrase.tail && (
                      <Text
                        style={{
                          fontFamily: F.kai,
                          fontSize: size,
                          lineHeight: size * 1.35,
                          color: C.ink,
                        }}
                      >
                        {phrase.tail}
                      </Text>
                    )}
                  </View>
                  {settings.gloss && (
                    <Text
                      numberOfLines={2}
                      style={{
                        fontSize: 10.5,
                        lineHeight: 13,
                        color: C.muted,
                        textAlign: "center",
                        maxWidth: 74,
                        minHeight: 26,
                        marginTop: 1,
                      }}
                    >
                      {gloss(phrase.word)}
                    </Text>
                  )}
                </Pressable>
              )}
              {!phrase.word && !!phrase.tail && (
                <Text
                  style={{
                    fontFamily: F.kai,
                    fontSize: size,
                    lineHeight: size * 1.35,
                    color: C.ink,
                    paddingBottom: settings.gloss ? 31 : 4,
                  }}
                >
                  {phrase.tail}
                </Text>
              )}
            </View>
          ))}
        </View>
        <View style={[s.line, { marginTop: 2, alignItems: "flex-start" }]}>
          <Text
            style={[
              s.body,
              { flex: 1, color: C.muted, paddingTop: 10 },
              big && { textAlign: "center", fontSize: 16 },
            ]}
          >
            {shown(i) ? item.translation : ""}
          </Text>
          <IconButton
            plain
            size={19}
            color={C.muted}
            name="volume-medium-outline"
            label={`Listen to sentence ${i + 1}`}
            onPress={() => {
              position(i);
              audio.play([
                {
                  text: item.text,
                  voice: item.speaker,
                  lessonId: lesson.id,
                  line: i,
                },
              ]);
            }}
          />
          <IconButton
            plain
            size={19}
            color={shown(i) ? C.primary : C.muted}
            name="language-outline"
            label={`${shown(i) ? "Hide" : "Show"} translation of sentence ${i + 1}`}
            onPress={() =>
              setTranslationLines((v) =>
                v.includes(i) ? v.filter((n) => n !== i) : [...v, i],
              )
            }
          />
        </View>
      </>
    );
  };
  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={() => (word ? setWord(null) : onClose())}
    >
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton name="close" label="Close lesson" onPress={onClose} />
            <Text style={s.eyebrow}>
              {focus
                ? `Line ${line + 1} of ${lesson.story.length}`
                : "Read · listen"}
            </Text>
            <View style={[s.line, { gap: 8 }]}>
              <IconButton
                name={focus ? "list-outline" : "albums-outline"}
                color={focus ? C.primary : C.ink}
                label={
                  focus ? "Read the whole page" : "Read one line at a time"
                }
                onPress={() => set({ focus: !focus })}
              />
              <IconButton
                name="options-outline"
                label="Reader settings"
                onPress={() => setSettingsOpen((v) => !v)}
              />
            </View>
          </View>
          <ScrollView
            ref={scroll}
            contentContainerStyle={[s.content, { paddingTop: 6 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!focus && (
              <>
                <View
                  style={{
                    backgroundColor: tint.wash,
                    borderRadius: 22,
                    padding: 20,
                    marginBottom: 14,
                  }}
                >
                  <View style={[s.row, { alignItems: "flex-start" }]}>
                    <GlyphTile
                      glyph={glyphFor(lesson)}
                      size={84}
                      wash={C.card}
                      ink={tint.ink}
                    />
                    <View style={[s.line, { gap: 10 }]}>
                      {finished && <Stamp text="读" size={42} />}
                      <IconButton
                        name={
                          p.bookmarks.includes(lesson.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        color={
                          p.bookmarks.includes(lesson.id) ? C.primary : C.ink
                        }
                        label={
                          p.bookmarks.includes(lesson.id)
                            ? "Remove story bookmark"
                            : "Bookmark story"
                        }
                        onPress={() =>
                          onProgress((prev) => ({
                            ...prev,
                            bookmarks: prev.bookmarks.includes(lesson.id)
                              ? prev.bookmarks.filter((id) => id !== lesson.id)
                              : [...prev.bookmarks, lesson.id],
                          }))
                        }
                      />
                    </View>
                  </View>
                  <Text style={[s.eyebrow, { marginTop: 14, color: tint.ink }]}>
                    HSK {lesson.level} · {lesson.topic} · {lesson.format}
                  </Text>
                  <Text style={[s.heroTitle, { fontSize: 36, lineHeight: 38 }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[s.body, { marginTop: 6 }]}>
                    {lesson.subtitle}
                  </Text>
                  <View style={{ marginTop: 12 }}>
                    <Meter
                      slim
                      color={tint.ink}
                      track="rgba(20,63,43,.12)"
                      value={(cover.known / Math.max(1, cover.total)) * 100}
                    />
                    <Text style={s.caption}>
                      {cover.known} of {cover.total} words in your deck
                    </Text>
                  </View>
                  {versions.length > 1 && (
                    <View style={[s.wrap, { marginTop: 14 }]}>
                      {versions.map((v) => (
                        <Chip
                          key={v.id}
                          label={`HSK ${v.level}`}
                          selected={v.id === lesson.id}
                          onPress={() => {
                            audio.stop();
                            setWord(null);
                            onLesson(v);
                            scroll.current?.scrollTo({ y: 0, animated: false });
                          }}
                        />
                      ))}
                    </View>
                  )}
                </View>
                {!!stretch.length && (
                  <View style={[s.notice, { marginTop: 0, marginBottom: 14 }]}>
                    <Mixed style={s.caption}>
                      {`A small stretch: ${stretch.join(" · ")}. Tap these words for a little help.`}
                    </Mixed>
                  </View>
                )}
              </>
            )}
            {settingsOpen && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Make reading comfortable</Text>
                <View style={[s.wrap, { marginTop: 12 }]}>
                  {(
                    [
                      "pinyin",
                      "translation",
                      "echo",
                      "traditional",
                      "gloss",
                      "spacious",
                    ] as const
                  ).map((key) => (
                    <Chip
                      key={key}
                      label={
                        {
                          pinyin: "Pinyin",
                          translation: "English",
                          echo: "Word echo",
                          traditional: "Traditional",
                          gloss: "Word meanings",
                          spacious: "More spacing",
                        }[key]
                      }
                      selected={settings[key]}
                      onPress={() => set({ [key]: !settings[key] })}
                    />
                  ))}
                </View>
                <View style={[s.wrap, { marginTop: 12 }]}>
                  {[22, 27, 32].map((fontSize) => (
                    <Chip
                      key={fontSize}
                      label={`${fontSize} px`}
                      selected={settings.fontSize === fontSize}
                      onPress={() => set({ fontSize })}
                    />
                  ))}
                </View>
                <View style={[s.line, { marginTop: 14, gap: 14 }]}>
                  {[
                    [C.amberWash, "new"],
                    [C.limeWash, "growing"],
                    ["#BFE3B0", "strong"],
                  ].map(([color, label]) => (
                    <View key={label} style={[s.line, { gap: 6 }]}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: C.line,
                        }}
                      />
                      <Text style={s.caption}>{label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[s.caption, { marginTop: 8 }]}>
                  Word echo tints the words already in your deck. Your settings
                  are saved.
                </Text>
              </View>
            )}
            {!seenHint && (
              <View
                style={[
                  s.card,
                  { backgroundColor: C.amberWash, borderColor: C.amberWash },
                ]}
              >
                <Text style={s.cardTitle}>Three things to try</Text>
                {(
                  [
                    [
                      "finger-print-outline",
                      "Tap any word to see what it means and hear it.",
                    ],
                    [
                      "leaf-outline",
                      "Plant the words you want to keep. They come back for review.",
                    ],
                    [
                      "play-outline",
                      "Press play at the bottom to hear the whole story.",
                    ],
                  ] as const
                ).map(([icon, tip]) => (
                  <View key={tip} style={[s.line, { gap: 10, marginTop: 10 }]}>
                    <Icon name={icon} size={20} color={C.amberDeep} />
                    <Text style={[s.body, { flex: 1 }]}>{tip}</Text>
                  </View>
                ))}
                <Button
                  light
                  label="Got it"
                  onPress={() =>
                    onProgress((prev) => ({
                      ...prev,
                      hints: [...(prev.hints || []), "reader"],
                    }))
                  }
                />
              </View>
            )}
            {focus ? (
              <>
                <Text style={[s.title, { marginBottom: 10 }]}>
                  {lesson.title}
                </Text>
                <View
                  style={[
                    s.card,
                    shadow,
                    {
                      minHeight: 300,
                      justifyContent: "center",
                      paddingVertical: 22,
                    },
                  ]}
                >
                  {sentence(lesson.story[line], line, true)}
                </View>
                <View
                  style={[
                    s.line,
                    { justifyContent: "center", gap: 6, marginVertical: 6 },
                  ]}
                >
                  {lesson.story.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === line ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: i <= line ? C.primary : C.line,
                      }}
                    />
                  ))}
                </View>
                <View style={s.row}>
                  <Button
                    light
                    label="Back"
                    disabled={line === 0}
                    style={{ flex: 1 }}
                    onPress={() => step(line - 1)}
                  />
                  {line < lesson.story.length - 1 ? (
                    <Button
                      label="Next line"
                      style={{ flex: 1.6 }}
                      onPress={() => step(line + 1)}
                    />
                  ) : (
                    <Button
                      label="To the questions →"
                      style={{ flex: 1.6 }}
                      onPress={onComprehension}
                    />
                  )}
                </View>
              </>
            ) : (
              <>
                {line > 0 && !audio.playing && (
                  <Button
                    light
                    icon="arrow-down"
                    label={`Continue at sentence ${line + 1}`}
                    onPress={() => scrollToLine(line)}
                  />
                )}
                <Section title="A tiny reading" caption="Tap a word" zh="文" />
                <View
                  onLayout={(e) => {
                    page.current = e.nativeEvent.layout.y;
                  }}
                  style={[
                    s.card,
                    shadow,
                    { paddingHorizontal: 6, paddingVertical: 8 },
                  ]}
                >
                  {lesson.story.map((item, i) => (
                    <View
                      key={i}
                      onLayout={(e) => {
                        positions.current[i] = e.nativeEvent.layout.y;
                      }}
                      style={[
                        s.sentence,
                        activeLine === i && {
                          borderColor: C.lime,
                          backgroundColor: C.limeWash,
                        },
                      ]}
                    >
                      {sentence(item, i, false)}
                    </View>
                  ))}
                </View>
              </>
            )}
            <View style={[s.grammar, { marginTop: 8 }]}>
              <Text style={s.eyebrow}>A pattern to notice</Text>
              <Mixed style={{ marginTop: 8 }} zhSize={18}>
                {lesson.grammar}
              </Mixed>
              <Button
                light
                icon={
                  p.grammarSaved.includes(lesson.id)
                    ? "bookmark"
                    : "bookmark-outline"
                }
                label={
                  p.grammarSaved.includes(lesson.id)
                    ? "Pattern saved ✓"
                    : "Save this grammar pattern +"
                }
                onPress={() =>
                  onProgress((prev) => ({
                    ...prev,
                    grammarSaved: prev.grammarSaved.includes(lesson.id)
                      ? prev.grammarSaved
                      : [...prev.grammarSaved, lesson.id],
                  }))
                }
              />
            </View>
            <Section
              title="Key words"
              caption={`${lesson.words.length - unplanted.length} / ${lesson.words.length} planted`}
              zh="词"
            />
            {lesson.words.map((w) => (
              <Pressable
                key={w.id}
                accessibilityRole="button"
                accessibilityLabel={`Word ${w.hanzi}`}
                onPress={() => lookup(w)}
                style={({ pressed }) => [
                  s.wordRow,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={{ width: 108 }}>
                  <Hanzi
                    word={w}
                    size={25}
                    traditional={settings.traditional}
                  />
                  <Pinyin word={w} />
                </View>
                <Text style={[s.body, { flex: 1 }]}>{w.meaning}</Text>
                <Icon
                  name={p.cards[w.id] ? "leaf" : "add-circle-outline"}
                  size={p.cards[w.id] ? 16 : 20}
                  color={p.cards[w.id] ? C.primary : C.faint}
                />
              </Pressable>
            ))}
            {unplanted.length > 0 && (
              <Button
                light
                icon="leaf-outline"
                label={`Plant all ${unplanted.length} key words`}
                onPress={() =>
                  onProgress((prev) =>
                    unplanted.reduce((next, w) => saveWord(next, w.id), prev),
                  )
                }
              />
            )}
            <Section title="Make the story yours" zh="练" />
            {finished && next && (
              <Button
                label={`Next reading: “${next.title}” →`}
                onPress={() => {
                  scroll.current?.scrollTo({ y: 0, animated: false });
                  onLesson(next);
                }}
              />
            )}
            <Button
              accent
              light={finished && !!next}
              label="Story comprehension →"
              onPress={onComprehension}
            />
            <Button light label="Check what stuck →" onPress={onQuiz} />
            <Text style={[s.caption, { marginTop: 12, textAlign: "center" }]}>
              Comprehension checks the story. Word practice mixes meaning,
              tones, and listening. Either one finishes the reading. Original
              practice, added {lesson.published}.
            </Text>
            <View style={s.notice}>
              <Text style={s.cardTitle}>Say it out loud</Text>
              <Text style={[s.body, { marginTop: 6 }]}>
                Read one sentence, listen, then say it again. Hide the English
                for an extra challenge.
              </Text>
              <Text style={s.caption}>
                Your device reads Mandarin aloud; speaking practice is self
                guided.
              </Text>
            </View>
          </ScrollView>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: C.line,
              backgroundColor: C.card,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <View style={[s.line, { gap: 12 }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  playing ? "Pause story audio" : "Play story audio"
                }
                onPress={play}
                style={({ pressed }) => ({
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: C.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Icon
                  name={playing ? "pause" : "play"}
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
              <View style={{ flex: 1 }}>
                <View style={s.row}>
                  <Text style={s.caption} numberOfLines={1}>
                    Line {line + 1} of {lesson.story.length}
                  </Text>
                  <View style={[s.line, { gap: 4 }]}>
                    {rates.map((rate) => (
                      <Pressable
                        key={rate}
                        accessibilityRole="button"
                        accessibilityLabel={`${rate}×`}
                        accessibilityState={{
                          selected: settings.rate === rate,
                        }}
                        onPress={() => set({ rate })}
                        style={{
                          minWidth: 42,
                          minHeight: 30,
                          borderRadius: 15,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            settings.rate === rate ? C.primary : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: settings.rate === rate ? "#FFFFFF" : C.muted,
                          }}
                        >
                          {rate}×
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Meter
                  slim
                  color={C.primary}
                  value={((line + 1) / lesson.story.length) * 100}
                />
              </View>
            </View>
            {!!audio.error && (
              <Text style={[s.caption, { color: C.coralDeep, marginTop: 4 }]}>
                {audio.error}
              </Text>
            )}
          </View>
          {word && (
            <WordSheet
              word={word}
              context={context}
              lesson={lesson}
              p={p}
              audio={audio}
              onClose={() => {
                audio.stop();
                setWord(null);
              }}
              onSave={() => onWordSave(word)}
              onWrite={onWrite}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
