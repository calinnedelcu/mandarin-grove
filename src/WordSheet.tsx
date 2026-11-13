import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GridPaper, ToneContour } from "./art";
import { CharacterPractice } from "./CharacterPractice";
import { characters, Lesson, lessons, Sentence, tone, Word } from "./content";
import { Progress, strength } from "./learning";
import { C, F, s } from "./theme";
import { AudioController } from "./useSpeech";
import { Button, Icon, IconButton, Meter, Mixed, Pinyin, Zh } from "./ui";
import { toneColors } from "./content";

export function WordSheet({
  word,
  context,
  p,
  audio,
  onSave,
  onClose,
  onWrite,
  onLesson,
}: {
  word: Word;
  context?: Sentence;
  lesson?: Lesson;
  p: Progress;
  audio: AudioController;
  onSave: () => void;
  onClose: () => void;
  onWrite: (char: string) => void;
  onLesson?: (lesson: Lesson) => void;
}) {
  const [char, setChar] = useState<string | null>(null);
  useEffect(() => setChar(null), [word.id]);
  const homes = lessons.filter((l) =>
      l.story.some((line) => line.tokens.some((t) => t.word?.id === word.id)),
    ),
    example =
      context ||
      homes
        .flatMap((l) => l.story)
        .find((line) => line.tokens.some((t) => t.word?.id === word.id));
  const saved = p.cards[word.id],
    shown = Array.from(p.settings.traditional ? word.traditional : word.hanzi),
    syllables = word.pinyin.split(" "),
    tile = Math.min(92, 260 / shown.length);
  return (
    <View style={[StyleSheet.absoluteFill, s.scrim, { zIndex: 30 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss word details"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <View style={s.sheet}>
        <View style={s.grabber} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.row, { marginBottom: 12 }]}>
            <Text style={s.eyebrow}>
              {char ? "Character studio" : "Your pocket dictionary"}
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
              <View style={[s.row, { alignItems: "flex-start" }]}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {shown.map((ch, i) => (
                    <GridPaper key={i} size={tile}>
                      <Text
                        style={{
                          fontFamily: F.kai,
                          fontSize: tile * 0.68,
                          lineHeight: tile * 0.9,
                          color: toneColors[tone(syllables[i] || "")],
                        }}
                      >
                        {ch}
                      </Text>
                    </GridPaper>
                  ))}
                </View>
                <IconButton
                  name="volume-high-outline"
                  label="Listen to word"
                  onPress={() => audio.say(word.hanzi)}
                />
              </View>
              <View style={[s.line, { marginTop: 12, gap: 12 }]}>
                <Pinyin word={word} large />
                <View style={[s.line, { gap: 2 }]}>
                  {syllables.map((sy, i) => (
                    <ToneContour key={i} tone={tone(sy)} width={30} />
                  ))}
                </View>
              </View>
              {!!audio.error && (
                <View style={s.notice}>
                  <Text style={s.body}>{audio.error}</Text>
                </View>
              )}
              <Text style={[s.title, { marginTop: 4 }]}>{word.meaning}</Text>
              <Text style={s.caption}>
                HSK {word.level} ·{" "}
                {word.traditional !== word.hanzi
                  ? `Traditional: ${word.traditional}`
                  : "Simplified Mandarin"}
              </Text>
              {saved && (
                <View style={{ marginTop: 10 }}>
                  <Meter slim value={strength(saved)} />
                  <Text style={s.caption}>
                    {strength(saved)}% strength · {saved.reviews} reviews ·{" "}
                    {saved.due <= Date.now()
                      ? "Ready to review"
                      : `Next review: ${new Date(saved.due).toLocaleDateString()}`}
                  </Text>
                </View>
              )}
              <Button
                accent={!saved}
                light={!!saved}
                icon={saved ? "leaf" : undefined}
                label={
                  saved
                    ? "Saved to your review garden ✓"
                    : "Plant this word for review +"
                }
                disabled={!!saved}
                onPress={onSave}
              />
              {example && (
                <View style={s.hint}>
                  <Text style={s.eyebrow}>
                    {context ? "In this sentence" : "Meet it in a story"}
                  </Text>
                  <Zh size={20} style={{ marginTop: 6 }}>
                    {example.text}
                  </Zh>
                  <Text style={s.caption}>{example.translation}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Hear the example"
                    onPress={() => audio.say(example.text)}
                    style={[s.line, { minHeight: 40, gap: 6 }]}
                  >
                    <Icon
                      name="volume-medium-outline"
                      size={17}
                      color={C.primary}
                    />
                    <Text
                      style={[
                        s.caption,
                        { color: C.primary, fontWeight: "600" },
                      ]}
                    >
                      Hear the example
                    </Text>
                  </Pressable>
                </View>
              )}
              <Text style={[s.cardTitle, { marginTop: 10 }]}>
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
                    >
                      <GridPaper size={56}>
                        <Zh size={34} style={{ lineHeight: 44 }}>
                          {h}
                        </Zh>
                      </GridPaper>
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
                        <Text
                          style={[
                            s.caption,
                            { color: C.primary, fontWeight: "600" },
                          ]}
                        >
                          Tap the character to trace it →
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
              {onLesson && homes.length > 0 && (
                <>
                  <Text style={[s.cardTitle, { marginTop: 18 }]}>
                    Where it lives
                  </Text>
                  {homes.slice(0, 3).map((l) => (
                    <Pressable
                      key={l.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${l.title}, HSK ${l.level}`}
                      onPress={() => onLesson(l)}
                      style={[s.wordRow, { minHeight: 48 }]}
                    >
                      <Text style={[s.body, { flex: 1 }]}>{l.title}</Text>
                      <Text style={s.caption}>HSK {l.level}</Text>
                      <Icon name="chevron-forward" size={16} color={C.faint} />
                    </Pressable>
                  ))}
                </>
              )}
              <Text style={[s.caption, { marginTop: 15 }]}>
                Tone marks show dictionary pronunciation. Third tones, 一, and
                不 can change in connected speech. Neutral syllables have no
                mark.
              </Text>
            </>
          )}
          {audio.error && (
            <Text
              accessibilityLiveRegion="polite"
              style={[s.caption, { color: C.coralDeep, marginTop: 12 }]}
            >
              {audio.error}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
