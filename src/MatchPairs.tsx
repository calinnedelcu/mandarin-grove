import React, { useRef, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Word } from "./content";
import { shuffle } from "./learning";
import { matchingWords } from "./exercises";
import { Button, Chip, IconButton, s } from "./ui";
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
    [message, setMessage] = useState("Choose a character, then its meaning.");
  const finished = useRef(false),
    attempts = useRef(0);
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
            <Text style={s.eyebrow}>MATCH PAIRS</Text>
            <Text style={s.caption}>
              {matched.length} / {deck.length}
            </Text>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.heroTitle}>Find their other half.</Text>
            <Text style={s.subtitle}>
              A few familiar words, together again.
            </Text>
            <View style={[s.row, { alignItems: "flex-start" }]}>
              <View style={{ flex: 1, gap: 16 }}>
                {deck.map((w) => (
                  <Chip
                    key={w.id}
                    label={matched.includes(w.id) ? `${w.hanzi} ✓` : w.hanzi}
                    selected={left === w.id || matched.includes(w.id)}
                    onPress={() => {
                      if (!matched.includes(w.id)) setLeft(w.id);
                    }}
                  />
                ))}
              </View>
              <View style={{ flex: 1, gap: 16 }}>
                {right.map((w) => (
                  <Chip
                    key={w.id}
                    label={
                      matched.includes(w.id) ? `${w.meaning} ✓` : w.meaning
                    }
                    selected={matched.includes(w.id)}
                    onPress={() => {
                      if (!left || matched.includes(w.id) || finished.current)
                        return;
                      const chosen = deck.find((x) => x.id === left)!;
                      const correct = left === w.id;
                      attempts.current++;
                      onAnswer(correct, chosen);
                      setLeft(null);
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
            <View style={s.notice}>
              <Text accessibilityLiveRegion="polite" style={s.body}>
                {message}
              </Text>
            </View>
            {matched.length === deck.length && (
              <Button label="Back to the grove" onPress={onClose} />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
