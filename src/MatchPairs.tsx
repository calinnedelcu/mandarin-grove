import React, { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Panda } from "./art";
import { Word } from "./content";
import { matchingWords } from "./exercises";
import { shuffle } from "./learning";
import { C, F, s } from "./theme";
import { Button, IconButton, Meter } from "./ui";

function Tile({
  label,
  kai,
  selected,
  matched,
  missed,
  onPress,
}: {
  label: string;
  kai?: boolean;
  selected: boolean;
  matched: boolean;
  missed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selected || matched }}
      aria-selected={selected || matched}
      onPress={onPress}
      style={({ pressed }) => [
        s.option,
        {
          marginTop: 0,
          minHeight: 72,
          justifyContent: "center",
          opacity: pressed ? 0.75 : matched ? 0.55 : 1,
        },
        selected && { borderColor: C.amber, backgroundColor: C.amberWash },
        matched && s.correct,
        missed && s.wrong,
      ]}
    >
      <Text
        style={
          kai
            ? {
                fontFamily: F.kai,
                fontSize: 28,
                lineHeight: 36,
                color: C.ink,
                textAlign: "center",
              }
            : [s.body, { textAlign: "center", color: C.ink }]
        }
      >
        {matched ? `${label} ✓` : label}
      </Text>
    </Pressable>
  );
}

export function MatchPairs({
  pool,
  onAnswer,
  onComplete,
  onClose,
}: {
  pool: Word[];
  onAnswer: (correct: boolean, word: Word) => void;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}) {
  const [deck] = useState(() => matchingWords(pool)),
    [right] = useState(() => shuffle(deck)),
    [left, setLeft] = useState<string | null>(null),
    [matched, setMatched] = useState<string[]>([]),
    [missed, setMissed] = useState<string | null>(null),
    [message, setMessage] = useState("Choose a character, then its meaning.");
  const finished = useRef(false),
    attempts = useRef(0);
  const done = matched.length === deck.length;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              name="close"
              label="Close matching practice"
              onPress={onClose}
            />
            <Text style={s.eyebrow}>Match pairs</Text>
            <Text style={[s.caption, { minWidth: 44, textAlign: "right" }]}>
              {matched.length} / {deck.length}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Meter
              slim
              color={C.primary}
              value={(matched.length / Math.max(1, deck.length)) * 100}
            />
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.heroTitle}>Find their other half.</Text>
            <Text style={s.subtitle}>
              A few familiar words, together again.
            </Text>
            <View style={[s.row, { alignItems: "flex-start", gap: 12 }]}>
              <View style={{ flex: 1, gap: 12 }}>
                {deck.map((w) => (
                  <Tile
                    key={w.id}
                    kai
                    label={w.hanzi}
                    selected={left === w.id}
                    matched={matched.includes(w.id)}
                    missed={false}
                    onPress={() => {
                      if (!matched.includes(w.id)) setLeft(w.id);
                    }}
                  />
                ))}
              </View>
              <View style={{ flex: 1.25, gap: 12 }}>
                {right.map((w) => (
                  <Tile
                    key={w.id}
                    label={w.meaning}
                    selected={false}
                    matched={matched.includes(w.id)}
                    missed={missed === w.id}
                    onPress={() => {
                      if (!left || matched.includes(w.id) || finished.current)
                        return;
                      const chosen = deck.find((x) => x.id === left)!;
                      const correct = left === w.id;
                      attempts.current++;
                      onAnswer(correct, chosen);
                      setLeft(null);
                      setMissed(correct ? null : w.id);
                      setMessage(
                        correct
                          ? "A perfect pair."
                          : "Try another meaning. You have this.",
                      );
                      if (correct) {
                        const next = [...matched, w.id];
                        setMatched(next);
                        if (next.length === deck.length) {
                          finished.current = true;
                          onComplete(deck.length, attempts.current);
                          setMessage("All together. Lovely work!");
                        }
                      }
                    }}
                  />
                ))}
              </View>
            </View>
            <View style={[s.notice, s.line, { gap: 12 }]}>
              {done && <Panda head size={50} mood="happy" />}
              <Text
                accessibilityLiveRegion="polite"
                style={[s.body, { flex: 1 }]}
              >
                {message}
              </Text>
            </View>
            {done && <Button label="Back to the grove" onPress={onClose} />}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
