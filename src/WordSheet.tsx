import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { characters, Lesson, lessons, Sentence, Word } from "./content";
import { Progress, strength } from "./learning";
import { AudioController } from "./useSpeech";
import { CharacterPractice } from "./CharacterPractice";
import { Button, C, Hanzi, IconButton, Meter, Pinyin, s } from "./ui";
export function WordSheet({
  word,
  context,
  lesson,
  p,
  audio,
  onSave,
  onClose,
  onWrite,
}: {
  word: Word;
  context?: Sentence;
  lesson?: Lesson;
  p: Progress;
  audio: AudioController;
  onSave: () => void;
  onClose: () => void;
  onWrite: (char: string) => void;
}) {
  const [char, setChar] = useState<string | null>(null);
  useEffect(() => setChar(null), [word.id]);
  const example =
    context ||
    lessons
      .flatMap((l) => l.story)
      .find((line) => line.tokens.some((t) => t.word?.id === word.id));
  const saved = p.cards[word.id];
  return (
    <View style={[StyleSheet.absoluteFill, s.scrim, { zIndex: 30 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss word details"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <View style={s.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.row, { marginBottom: 16 }]}>
            <Text style={s.eyebrow}>
              {char ? "CHARACTER STUDIO" : "YOUR POCKET DICTIONARY"}
            </Text>
            <IconButton
              name="close"
              label="Close word details"
              onPress={onClose}
            />
          </View>
          {char ? (
            <>
              <CharacterPractice character={char} onComplete={onWrite} />
              <Button
                light
                label="Back to word details"
                onPress={() => setChar(null)}
              />
            </>
          ) : (
            <>
              <View style={s.row}>
                <Hanzi
                  word={word}
                  size={Math.min(60, 190 / Array.from(word.hanzi).length)}
                  traditional={p.settings.traditional}
                />
                <IconButton
                  name="volume-high-outline"
                  label="Listen to word"
                  onPress={() => audio.say(word.hanzi)}
                />
              </View>
              <Pinyin word={word} large />
              {!!audio.error && (
                <View style={s.notice}>
                  <Text style={s.body}>{audio.error}</Text>
                </View>
              )}
              <Text style={[s.title, { marginTop: 8 }]}>{word.meaning}</Text>
              <Text style={s.caption}>
                HSK {word.level} ·{" "}
                {word.traditional !== word.hanzi
                  ? `Traditional: ${word.traditional}`
                  : "Simplified Mandarin"}
              </Text>
              {example && (
                <View style={s.hint}>
                  <Text style={s.eyebrow}>
                    {context ? "IN THIS SENTENCE" : "MEET IT IN A STORY"}
                  </Text>
                  <Text style={[s.body, { marginTop: 7 }]}>{example.text}</Text>
                  <Text style={s.caption}>{example.translation}</Text>
                  <Button
                    light
                    label="Hear the example"
                    onPress={() => audio.say(example.text)}
                  />
                </View>
              )}
              {lesson && (
                <View style={s.grammar}>
                  <Text style={s.eyebrow}>CONTEXT COACH</Text>
                  <Text style={[s.body, { marginTop: 8 }]}>
                    {lesson.grammar}
                  </Text>
                </View>
              )}
              <Text style={[s.cardTitle, { marginTop: 14 }]}>
                Inside the character
              </Text>
              {Array.from(word.hanzi).map((h, i) => {
                const d = characters[h];
                return (
                  <View
                    key={i}
                    style={[s.wordRow, { alignItems: "flex-start" }]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Practice writing ${h}`}
                      onPress={() => setChar(h)}
                      style={[s.badge, { minWidth: 54, alignItems: "center" }]}
                    >
                      <Text style={{ fontSize: 30, color: C.green }}>{h}</Text>
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={s.body}>
                        {d?.definition?.split(";").slice(0, 2).join(";") ||
                          "A character in this word"}
                      </Text>
                      <Text style={s.caption}>
                        Radical: {d?.radical || word.radical || h}
                        {d?.medians ? ` · ${d.medians.length} strokes` : ""}
                      </Text>
                      {d?.decomposition && !d.decomposition.includes("？") && (
                        <Text style={s.caption}>
                          Visual components:{" "}
                          {d.decomposition
                            .replace(/[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻]/g, "")
                            .split("")
                            .filter((c) => c.trim())
                            .join(" + ")}
                        </Text>
                      )}
                      {d?.medians && (
                        <Text style={[s.caption, { color: C.green }]}>
                          Tap the character to trace it →
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
              <Text style={[s.caption, { marginTop: 15 }]}>
                Tone marks show dictionary pronunciation. Third tones, 一, and
                不 can change in connected speech. Neutral syllables have no
                mark.
              </Text>
              {saved && (
                <>
                  <Meter value={strength(saved)} />
                  <Text style={s.caption}>
                    {strength(saved)}% strength · {saved.reviews} reviews ·{" "}
                    {saved.due <= Date.now()
                      ? "Ready to review"
                      : `Next review: ${new Date(saved.due).toLocaleDateString()}`}
                  </Text>
                </>
              )}
              <Button
                label={
                  saved
                    ? "Saved to your review garden ✓"
                    : "Plant this word for review +"
                }
                disabled={!!saved}
                onPress={onSave}
              />
            </>
          )}
          {audio.error && (
            <Text
              accessibilityLiveRegion="polite"
              style={[s.caption, { color: C.red, marginTop: 12 }]}
            >
              {audio.error}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
