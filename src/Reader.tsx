import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { displayText, Lesson, lessons, Sentence, Word } from "./content";
import { Progress, strength } from "./learning";
import { AudioController } from "./useSpeech";
import {
  Button,
  C,
  Chip,
  Hanzi,
  IconButton,
  Meter,
  Pinyin,
  Section,
  s,
} from "./ui";
import { WordSheet } from "./WordSheet";
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
}) {
  const [word, setWord] = useState<Word | null>(null),
    [context, setContext] = useState<Sentence | undefined>(),
    [settingsOpen, setSettingsOpen] = useState(false),
    [translationLines, setTranslationLines] = useState<number[]>([]);
  const scroll = useRef<ScrollView>(null),
    positions = useRef<Record<number, number>>({});
  const [line, setLine] = useState(
    Math.min(p.positions[lesson.id] || 0, lesson.story.length - 1),
  );
  const activeLine =
    audio.current?.lessonId === lesson.id ? audio.current.line : undefined;
  const versions = lessons.filter((l) => l.family === lesson.family);
  const stretch = [
    ...new Set(
      lesson.story
        .flatMap((l) => l.tokens)
        .filter((t) => t.word && t.word.level > lesson.level)
        .map((t) => t.text),
    ),
  ];
  useEffect(() => {
    setTranslationLines([]);
    setLine(Math.min(p.positions[lesson.id] || 0, lesson.story.length - 1));
  }, [lesson.id]);
  useEffect(() => {
    if (activeLine !== undefined) {
      setLine(activeLine);
      onProgress((prev) => ({
        ...prev,
        positions: { ...prev.positions, [lesson.id]: activeLine },
      }));
      scroll.current?.scrollTo({
        y: Math.max(0, (positions.current[activeLine] || 0) - 20),
        animated: true,
      });
    }
  }, [activeLine]);
  const lookup = (w: Word, context?: Sentence) => {
    audio.stop();
    setWord(w);
    setContext(context);
  };
  function position(i: number) {
    setLine(i);
    onProgress((prev) => ({
      ...prev,
      positions: { ...prev.positions, [lesson.id]: i },
    }));
  }
  function play() {
    if (audio.playing && audio.current?.lessonId === lesson.id) audio.stop();
    else
      audio.play(
        lesson.story.map((l, i) => ({
          text: l.text,
          lessonId: lesson.id,
          line: i,
        })),
        line,
      );
  }
  const settings = p.settings;
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
            <Text style={s.eyebrow}>READ · LISTEN · DISCOVER</Text>
            <IconButton
              name="options-outline"
              label="Reader settings"
              onPress={() => setSettingsOpen((v) => !v)}
            />
          </View>
          <ScrollView
            ref={scroll}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[s.cover, { backgroundColor: lesson.color }]}>
              <View style={s.row}>
                <Text style={{ fontSize: 49 }}>{lesson.emoji}</Text>
                <IconButton
                  name={
                    p.bookmarks.includes(lesson.id)
                      ? "bookmark"
                      : "bookmark-outline"
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
              <Text style={s.heroTitle}>{lesson.title}</Text>
              <Text style={[s.body, { marginTop: 8 }]}>{lesson.subtitle}</Text>
              <Text style={[s.caption, { marginTop: 12 }]}>
                HSK {lesson.level} · {lesson.format} · {lesson.words.length} key
                words{`\n`}Original practice · added {lesson.published}
              </Text>
            </View>
            {!!stretch.length && (
              <View style={[s.notice, { marginTop: 0, marginBottom: 16 }]}>
                <Text style={s.caption}>
                  A small stretch: {stretch.join(" · ")}. Tap these words for a
                  little help.
                </Text>
              </View>
            )}
            {versions.length > 1 && (
              <View style={[s.wrap, { marginBottom: 16 }]}>
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
                          spacious: "More spacing",
                        }[key]
                      }
                      selected={settings[key]}
                      onPress={() =>
                        onProgress((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            [key]: !prev.settings[key],
                          },
                        }))
                      }
                    />
                  ))}
                </View>
                <View style={[s.wrap, { marginTop: 12 }]}>
                  {[22, 27, 32].map((fontSize) => (
                    <Chip
                      key={fontSize}
                      label={`${fontSize} px`}
                      selected={settings.fontSize === fontSize}
                      onPress={() =>
                        onProgress((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, fontSize },
                        }))
                      }
                    />
                  ))}
                </View>
                <Text style={[s.caption, { marginTop: 12 }]}>
                  Word echo: peach = new, pale green = growing, deeper green =
                  strong. Your settings are saved.
                </Text>
              </View>
            )}
            <View style={s.card}>
              <View style={s.row}>
                <View>
                  <Text style={s.cardTitle}>Let the story come alive</Text>
                  <Text style={s.caption}>
                    Sentence {line + 1} of {lesson.story.length}
                  </Text>
                </View>
                <IconButton
                  name={
                    audio.playing && audio.current?.lessonId === lesson.id
                      ? "pause"
                      : "play"
                  }
                  label={
                    audio.playing && audio.current?.lessonId === lesson.id
                      ? "Pause story audio"
                      : "Play story audio"
                  }
                  onPress={play}
                />
              </View>
              <Meter value={((line + 1) / lesson.story.length) * 100} />
              <View style={s.wrap}>
                {[0.65, 0.85, 1, 1.15].map((rate) => (
                  <Chip
                    key={rate}
                    label={`${rate}×`}
                    selected={settings.rate === rate}
                    onPress={() =>
                      onProgress((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, rate },
                      }))
                    }
                  />
                ))}
              </View>
              {audio.error && (
                <Text style={[s.caption, { color: C.red, marginTop: 10 }]}>
                  {audio.error}
                </Text>
              )}
            </View>
            {line > 0 && !audio.playing && (
              <Button
                light
                label={`Continue at sentence ${line + 1}`}
                onPress={() =>
                  scroll.current?.scrollTo({
                    y: Math.max(0, (positions.current[line] || 0) - 20),
                    animated: true,
                  })
                }
              />
            )}
            <Section title="A tiny reading" caption="TAP A WORD" />
            {lesson.story.map((item, i) => (
              <View
                key={i}
                onLayout={(e) => {
                  positions.current[i] = e.nativeEvent.layout.y;
                }}
                style={[
                  s.sentence,
                  activeLine === i && {
                    borderColor: "#85A96C",
                    backgroundColor: "#F1F6E9",
                  },
                ]}
              >
                <View
                  style={[
                    s.wrap,
                    { gap: settings.spacious ? 9 : 2, alignItems: "flex-end" },
                  ]}
                >
                  {item.tokens.map((token, j) =>
                    token.word ? (
                      <Pressable
                        key={j}
                        accessibilityRole="button"
                        accessibilityLabel={`${displayText(token.text, settings.traditional)} · ${token.word.pinyin} · ${token.word.meaning}`}
                        onPress={() => {
                          position(i);
                          lookup(token.word!, item);
                        }}
                        style={[
                          s.token,
                          settings.echo &&
                            p.cards[token.word.id] && {
                              backgroundColor:
                                strength(p.cards[token.word.id]) >= 75
                                  ? "#CEE2B7"
                                  : strength(p.cards[token.word.id]) > 0
                                    ? "#E7EFDA"
                                    : "#F7E5D3",
                            },
                        ]}
                      >
                        {settings.pinyin && <Pinyin word={token.word} />}
                        <Hanzi
                          word={token.word}
                          size={settings.fontSize}
                          colored={false}
                          traditional={settings.traditional}
                        />
                      </Pressable>
                    ) : (
                      <Text
                        key={j}
                        style={{
                          fontSize: settings.fontSize,
                          lineHeight: settings.fontSize * 1.35,
                          color: C.ink,
                          paddingBottom: 5,
                        }}
                      >
                        {token.text}
                      </Text>
                    ),
                  )}
                </View>
                <View
                  style={[s.row, { justifyContent: "flex-end", marginTop: 5 }]}
                >
                  <IconButton
                    name="language-outline"
                    label={`Translate sentence ${i + 1}`}
                    onPress={() =>
                      setTranslationLines((v) =>
                        v.includes(i) ? v.filter((n) => n !== i) : [...v, i],
                      )
                    }
                  />
                  <IconButton
                    name="volume-medium-outline"
                    label={`Listen to sentence ${i + 1}`}
                    onPress={() => {
                      position(i);
                      audio.play([
                        { text: item.text, lessonId: lesson.id, line: i },
                      ]);
                    }}
                  />
                </View>
                {(settings.translation || translationLines.includes(i)) && (
                  <Text style={[s.body, { marginTop: 8 }]}>
                    {item.translation}
                  </Text>
                )}
              </View>
            ))}
            <View style={s.grammar}>
              <Text style={s.eyebrow}>A PATTERN TO NOTICE</Text>
              <Text style={[s.body, { marginTop: 10 }]}>{lesson.grammar}</Text>
              <Button
                light
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
            <Section title="Preview & revisit" caption="KEY WORDS" />
            {lesson.words.map((w) => (
              <Pressable
                key={w.id}
                accessibilityRole="button"
                accessibilityLabel={`Word ${w.hanzi}`}
                onPress={() => lookup(w)}
                style={s.wordRow}
              >
                <View style={{ width: 110 }}>
                  <Hanzi
                    word={w}
                    size={25}
                    traditional={settings.traditional}
                  />
                  <Pinyin word={w} />
                </View>
                <Text style={[s.body, { flex: 1 }]}>{w.meaning}</Text>
              </Pressable>
            ))}
            <Section title="Make the story yours" />
            <Button label="Story comprehension →" onPress={onComprehension} />
            <Button light label="Check what stuck →" onPress={onQuiz} />
            <Text style={[s.caption, { marginTop: 12, textAlign: "center" }]}>
              Comprehension checks the story. Word practice mixes meaning,
              tones, and listening.
            </Text>
            <View style={s.notice}>
              <Text style={s.cardTitle}>Say it out loud</Text>
              <Text style={[s.body, { marginTop: 7 }]}>
                Read one sentence, listen, then say it again. Hide the English
                for an extra challenge.
              </Text>
              <Text style={s.caption}>
                Your device reads Mandarin aloud; speaking practice is self
                guided.
              </Text>
            </View>
          </ScrollView>
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
