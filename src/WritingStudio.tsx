import React, { useMemo, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CharacterPractice } from "./CharacterPractice";
import { characters, words } from "./content";
import { Progress } from "./learning";
import { C, s } from "./theme";
import { Button, Chip, IconButton, PageTitle } from "./ui";

/** A short queue of characters to trace, drawn from the learner's own deck. */
export function WritingStudio({
  p,
  onWrite,
  onClose,
}: {
  p: Progress;
  onWrite: (char: string) => void;
  onClose: () => void;
}) {
  // Fixed for the session, so a finished character does not jump the queue.
  const queue = useMemo(() => {
    const saved = words.filter((w) => p.cards[w.id]),
      source = saved.length
        ? saved
        : words.filter((w) => w.level <= p.settings.level),
      all = [...new Set(source.flatMap((w) => Array.from(w.hanzi)))].filter(
        (ch) => characters[ch]?.medians?.length,
      );
    return [
      ...all.filter((ch) => !p.writing[ch]),
      ...all.filter((ch) => p.writing[ch]),
    ].slice(0, 12);
  }, []);
  const [index, setIndex] = useState(0);
  const char = queue[index],
    info = characters[char];
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              name="close"
              label="Close brush practice"
              onPress={onClose}
            />
            <Text style={s.eyebrow}>Brush practice</Text>
            <Text style={[s.caption, { minWidth: 44, textAlign: "right" }]}>
              {index + 1} / {queue.length}
            </Text>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <PageTitle
              zh="写字"
              pinyin="xiě zì · to write"
              title="Stroke by stroke."
              caption={
                Object.keys(p.cards).length
                  ? "Characters from the words in your deck. New ones come first."
                  : "Characters from your level. Plant words to make this queue your own."
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20, marginBottom: 16 }}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
            >
              {queue.map((ch, i) => (
                <Chip
                  key={ch}
                  kai
                  label={p.writing[ch] ? `${ch} ✓` : ch}
                  selected={i === index}
                  onPress={() => setIndex(i)}
                />
              ))}
            </ScrollView>
            {char && (
              <>
                <CharacterPractice character={char} onComplete={onWrite} />
                <View style={[s.card, { marginTop: 14 }]}>
                  <Text style={s.eyebrow}>
                    {info?.pinyin?.join(" · ") || ""}
                    {info?.radical ? ` · radical ${info.radical}` : ""}
                  </Text>
                  <Text style={[s.body, { marginTop: 4 }]}>
                    {info?.definition?.split(";").slice(0, 3).join(";") ||
                      "A character from your deck."}
                  </Text>
                  <Text style={[s.caption, { marginTop: 6 }]}>
                    {p.writing[char]
                      ? `Written ${p.writing[char]} ${p.writing[char] === 1 ? "time" : "times"}`
                      : "Not written yet · 8 XP the first time"}
                  </Text>
                </View>
                <View style={s.row}>
                  <Button
                    light
                    label="Previous"
                    disabled={index === 0}
                    style={{ flex: 1 }}
                    onPress={() => setIndex((v) => Math.max(0, v - 1))}
                  />
                  <Button
                    label={
                      index === queue.length - 1 ? "Finish" : "Next character"
                    }
                    style={{ flex: 1.4 }}
                    onPress={() =>
                      index === queue.length - 1
                        ? onClose()
                        : setIndex((v) => v + 1)
                    }
                  />
                </View>
              </>
            )}
            {!char && (
              <Text style={[s.body, { color: C.muted }]}>
                No stroke guides are available yet.
              </Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
