import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GridPaper, GroveScene, ToneContour } from "./art";
import { Panda } from "./Panda";
import { lessons, tone, words } from "./content";
import { Progress, schedule, strength } from "./learning";
import { C, shadow } from "./theme";
import { AudioController } from "./useSpeech";
import { Button, Hanzi, IconButton, Meter, Pinyin, s, Zh } from "./ui";

type Grade = "again" | "good" | "easy";

function wait(days: number) {
  return days >= 30
    ? `${Math.round(days / 30)} mo`
    : `${days} ${days === 1 ? "day" : "days"}`;
}

/** Spaced review: look, recall, reveal, then grade your own memory. */
export function Review({
  queue,
  p,
  audio,
  onGrade,
  onClose,
}: {
  queue: string[];
  p: Progress;
  audio: AudioController;
  onGrade: (grade: Grade) => void;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const total = useRef(queue.length).current;
  const word = queue.length ? words.find((w) => w.id === queue[0]) : null;
  useEffect(() => setRevealed(false), [queue[0]]);
  const example = word
    ? lessons
        .flatMap((l) => l.story)
        .find((line) => line.tokens.some((t) => t.word?.id === word.id))
    : undefined;
  const card = word ? p.cards[word.id] : undefined,
    size = word ? Math.min(92, 190 / Array.from(word.hanzi).length) : 0;
  const grades: {
    grade: Grade;
    label: string;
    name: string;
    tint: string;
    ink: string;
  }[] = word
    ? [
        {
          grade: "again",
          name: "Again",
          label: "Again · 1 minute",
          tint: C.coralWash,
          ink: C.coralDeep,
        },
        {
          grade: "good",
          name: "Good",
          label: `Good · ${schedule(card, "good").interval} day(s)`,
          tint: C.primary,
          ink: "#FFFFFF",
        },
        {
          grade: "easy",
          name: "Easy",
          label: `Easy · ${schedule(card, "easy").interval} day(s)`,
          tint: C.amberWash,
          ink: C.amberDeep,
        },
      ]
    : [];
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              name="close"
              label="Close spaced review"
              onPress={onClose}
            />
            <Text style={s.eyebrow}>Recall before you reveal</Text>
            <Text style={[s.caption, { minWidth: 44, textAlign: "right" }]}>
              {queue.length} left
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Meter
              slim
              color={C.primary}
              value={total ? ((total - queue.length) / total) * 100 : 100}
            />
          </View>
          <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
            {word ? (
              <>
                <View
                  style={[
                    s.card,
                    shadow,
                    s.center,
                    { paddingVertical: 28, gap: 14 },
                  ]}
                >
                  <Text style={s.eyebrow}>What does this word mean?</Text>
                  <GridPaper size={210}>
                    <Hanzi
                      word={word}
                      size={size}
                      traditional={p.settings.traditional}
                      colored={revealed}
                    />
                  </GridPaper>
                  {revealed ? (
                    <>
                      <View style={[s.line, { gap: 4 }]}>
                        {word.pinyin.split(" ").map((sy, i) => (
                          <ToneContour key={i} tone={tone(sy)} width={36} />
                        ))}
                      </View>
                      <Pinyin word={word} large />
                      <Text style={[s.title, { textAlign: "center" }]}>
                        {word.meaning}
                      </Text>
                      {example && (
                        <View style={{ alignItems: "center", gap: 2 }}>
                          <Zh
                            size={18}
                            color={C.ink2}
                            style={{ textAlign: "center" }}
                          >
                            {example.text}
                          </Zh>
                          <Text style={[s.caption, { textAlign: "center" }]}>
                            {example.translation}
                          </Text>
                        </View>
                      )}
                      <View style={{ width: "70%" }}>
                        <Meter slim value={strength(card)} />
                        <Text style={[s.caption, { textAlign: "center" }]}>
                          {strength(card)}% strength
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={s.caption}>
                      Say it aloud first. Then turn the card.
                    </Text>
                  )}
                </View>
                <Button
                  light
                  icon="volume-medium-outline"
                  label="Listen to review word"
                  onPress={() => audio.say(word.hanzi)}
                />
                {revealed ? (
                  <>
                    <Text
                      style={[
                        s.caption,
                        { textAlign: "center", marginTop: 18, marginBottom: 2 },
                      ]}
                    >
                      Be kind, and be honest with your memory.
                    </Text>
                    <View style={[s.row, { alignItems: "stretch" }]}>
                      {grades.map((g) => (
                        <Pressable
                          key={g.grade}
                          accessibilityRole="button"
                          accessibilityLabel={g.label}
                          onPress={() => onGrade(g.grade)}
                          style={({ pressed }) => ({
                            flex: 1,
                            minHeight: 64,
                            marginTop: 10,
                            borderRadius: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: g.tint,
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <Text
                            style={[
                              s.cardTitle,
                              { color: g.ink, fontSize: 15 },
                            ]}
                          >
                            {g.name}
                          </Text>
                          <Text
                            style={[s.caption, { color: g.ink, opacity: 0.75 }]}
                          >
                            {g.grade === "again"
                              ? "1 min"
                              : wait(schedule(card, g.grade).interval)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : (
                  <Button
                    label="Reveal meaning"
                    onPress={() => setRevealed(true)}
                  />
                )}
              </>
            ) : (
              <View
                style={[s.center, { flex: 1, paddingVertical: 60, gap: 14 }]}
              >
                <GroveScene height={300} />
                <Panda size={170} mood="happy" cheer />
                <Text style={[s.heroTitle, { textAlign: "center" }]}>
                  Freshly watered.
                </Text>
                <Text
                  style={[s.subtitle, { textAlign: "center", marginTop: 0 }]}
                >
                  {total
                    ? `${total} ${total === 1 ? "word" : "words"} reviewed. Each one now has room to grow.`
                    : "Your words have a little room to grow."}
                </Text>
                <View style={{ width: "100%" }}>
                  <Button label="Back to the grove" onPress={onClose} />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
