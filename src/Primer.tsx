import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GridPaper, ToneContour } from "./art";
import { toneColors } from "./content";
import { Panda } from "./Panda";
import { C, s, toneNames } from "./theme";
import { AudioController } from "./useSpeech";
import { Button, IconButton, Meter, Zh } from "./ui";

const tones = [
  { hanzi: "妈", pinyin: "mā", tone: 1, meaning: "mother" },
  { hanzi: "麻", pinyin: "má", tone: 2, meaning: "hemp" },
  { hanzi: "马", pinyin: "mǎ", tone: 3, meaning: "horse" },
  { hanzi: "骂", pinyin: "mà", tone: 4, meaning: "to scold" },
];
const hints = [
  "High and level, like holding a note.",
  "Rising, like asking “what?”",
  "Dipping low, then up a little.",
  "Falling sharply, like a firm “no!”",
];

/** Two minutes for someone who has never seen pinyin or heard a tone. */
export function Primer({
  audio,
  onClose,
}: {
  audio: AudioController;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              name="close"
              label="Close the intro"
              onPress={onClose}
            />
            <Text style={s.eyebrow}>Pinyin & tones · {page + 1} of 3</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Meter slim value={((page + 1) / 3) * 100} />
          </View>
          <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
            {page === 0 && (
              <>
                <Text style={s.heroTitle}>
                  A character does not show its sound.
                </Text>
                <Text style={s.subtitle}>
                  So learners use pinyin: the sound of each character, spelled
                  with letters you already know.
                </Text>
                <View style={[s.card, s.center, { paddingVertical: 24 }]}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {["你", "好"].map((ch, i) => (
                      <View key={ch} style={{ alignItems: "center", gap: 6 }}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "600",
                            color: toneColors[3],
                          }}
                        >
                          {["nǐ", "hǎo"][i]}
                        </Text>
                        <GridPaper size={92}>
                          <Zh size={58} style={{ lineHeight: 76 }}>
                            {ch}
                          </Zh>
                        </GridPaper>
                      </View>
                    ))}
                  </View>
                  <Text style={s.title}>hello</Text>
                  <Button
                    light
                    icon="volume-medium-outline"
                    label="Hear it"
                    onPress={() => audio.say("你好")}
                  />
                </View>
                <Text style={s.body}>
                  In every story the pinyin sits above the characters and the
                  meaning below, until you no longer need them.
                </Text>
              </>
            )}
            {page === 1 && (
              <>
                <Text style={s.heroTitle}>One syllable, four meanings.</Text>
                <Text style={s.subtitle}>
                  The shape of your voice is part of the word. The little mark
                  over the vowel draws that shape. Tap each one.
                </Text>
                {tones.map((t, i) => (
                  <Pressable
                    key={t.tone}
                    accessibilityRole="button"
                    accessibilityLabel={`Tone ${t.tone}: ${t.pinyin}, ${t.meaning}`}
                    onPress={() => audio.say(t.hanzi)}
                    style={({ pressed }) => [
                      s.listRow,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <ToneContour tone={t.tone} width={54} guide />
                    <View style={{ width: 46, alignItems: "center" }}>
                      <Zh size={30} color={toneColors[t.tone]}>
                        {t.hanzi}
                      </Zh>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>
                        <Text style={{ color: toneColors[t.tone] }}>
                          {t.pinyin}
                        </Text>
                        {"  "}
                        {t.meaning}
                      </Text>
                      <Text style={s.caption}>
                        {t.tone} · {hints[i]}
                      </Text>
                    </View>
                  </Pressable>
                ))}
                <Text style={[s.caption, { marginTop: 4 }]}>
                  A fifth, neutral tone is short and light and has no mark, as
                  in 吗 ma, the word that turns a sentence into a question.
                </Text>
              </>
            )}
            {page === 2 && (
              <>
                <View style={{ alignItems: "center" }}>
                  <Panda size={150} bamboo mood="happy" />
                </View>
                <Text style={[s.heroTitle, { textAlign: "center" }]}>
                  That is all you need to start.
                </Text>
                <Text style={[s.subtitle, { textAlign: "center" }]}>
                  You will not remember the tones yet. Nobody does. Hearing them
                  in stories is how they settle.
                </Text>
                <View style={s.card}>
                  <Text style={s.cardTitle}>Tones have colours here</Text>
                  <View style={[s.row, { marginTop: 12 }]}>
                    {[1, 2, 3, 4, 0].map((t) => (
                      <View key={t} style={{ alignItems: "center", gap: 4 }}>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: toneColors[t],
                          }}
                        />
                        <Text style={[s.caption, { fontSize: 11 }]}>
                          {t ? `${t} · ${toneNames[t]}` : "Neutral"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={[s.caption, { textAlign: "center" }]}>
                  You can open this again from Practice → Tones.
                </Text>
              </>
            )}
            <View style={{ flex: 1 }} />
            <View style={s.row}>
              {page > 0 && (
                <Button
                  light
                  label="Back"
                  style={{ flex: 1 }}
                  onPress={() => setPage((v) => v - 1)}
                />
              )}
              <Button
                label={page === 2 ? "Start reading" : "Next"}
                style={{ flex: 1.6 }}
                onPress={() => (page === 2 ? onClose() : setPage((v) => v + 1))}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
