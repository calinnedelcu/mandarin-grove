import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GridPaper, GrovePlot, GroveScene } from "./art";
import { Word, wordByHanzi } from "./content";
import { Outfit, Panda } from "./Panda";
import { PlaceArt } from "./PlaceArt";
import { C, s, shadow } from "./theme";
import { AudioController } from "./useSpeech";
import {
  Button,
  GlyphTile,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Pinyin,
  Zh,
} from "./ui";

const steps = ["温", "读", "练"] as const;
const stepNames = ["Remember", "Read", "Practise"];
const sentence = ["我", "想", "喝", "茶"].map((h) => wordByHanzi[h]);
const PAGES = 5;

/**
 * The one-minute tour shown after onboarding: what a day looks like, how a
 * word is opened and planted, what the panda eats and where the readings
 * live. Two pages are done by doing: tap a word, then plant it.
 */
export function Tour({
  audio,
  planted,
  outfit,
  onPlant,
  onStart,
  onClose,
}: {
  audio: AudioController;
  /** Whether a word is already in the learner's deck. */
  planted: (word: Word) => boolean;
  outfit: Outfit;
  onPlant: (word: Word) => void;
  /** Close the tour and open the first reading. */
  onStart: () => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0),
    [picked, setPicked] = useState<Word | null>(null);
  const word = picked || wordByHanzi["茶"],
    inDeck = planted(word);
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton name="close" label="Skip the tour" onPress={onClose} />
            <Text style={s.eyebrow}>
              How it works · {page + 1} of {PAGES}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Meter slim value={((page + 1) / PAGES) * 100} />
          </View>
          <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
            {page === 0 && (
              <>
                <View
                  style={{
                    height: 230,
                    marginHorizontal: -20,
                    marginTop: -18,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <GroveScene height={230} />
                  <Panda size={180} cheer mood="happy" outfit={outfit} />
                </View>
                <Text style={s.heroTitle}>Three small steps a day.</Text>
                <Text style={s.subtitle}>
                  Remember the words you kept, read one short story, practise
                  for a minute. That is the whole habit.
                </Text>
                <View style={[s.card, s.row]}>
                  {steps.map((glyph, i) => (
                    <View
                      key={glyph}
                      style={{ flex: 1, alignItems: "center", gap: 6 }}
                    >
                      <GlyphTile
                        glyph={glyph}
                        size={56}
                        wash={i === 1 ? C.amberWash : C.primaryWash}
                        ink={i === 1 ? C.amberDeep : C.primaryDeep}
                      />
                      <Text style={s.cardTitle}>{stepNames[i]}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.caption}>
                  Today always shows the three steps and one button that starts
                  the next.
                </Text>
              </>
            )}
            {page === 1 && (
              <>
                <Text style={s.heroTitle}>Tap any word.</Text>
                <Text style={s.subtitle}>
                  Every story is made of words you can open. Try it now: tap one
                  of these.
                </Text>
                <View style={[s.card, shadow, { paddingVertical: 20 }]}>
                  <View style={[s.wrap, { justifyContent: "center", gap: 6 }]}>
                    {sentence.map((w) => (
                      <Pressable
                        key={w.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Try the word ${w.hanzi}`}
                        onPress={() => {
                          setPicked(w);
                          audio.say(w.hanzi);
                        }}
                        style={({ pressed }) => [
                          s.token,
                          { paddingHorizontal: 8 },
                          picked?.id === w.id && {
                            backgroundColor: C.amberWash,
                          },
                          pressed && { backgroundColor: C.amberWash },
                        ]}
                      >
                        <Pinyin word={w} />
                        <Hanzi word={w} size={36} colored={false} />
                      </Pressable>
                    ))}
                    <Zh size={36} style={{ paddingTop: 22 }}>
                      。
                    </Zh>
                  </View>
                  <Text
                    style={[s.caption, { textAlign: "center", marginTop: 6 }]}
                  >
                    I would like to drink tea.
                  </Text>
                </View>
                {picked ? (
                  <View style={[s.card, s.line, { gap: 16 }]}>
                    <GridPaper size={76}>
                      <Hanzi word={picked} size={46} />
                    </GridPaper>
                    <View style={{ flex: 1 }}>
                      <Pinyin word={picked} size={18} />
                      <Text style={s.title}>{picked.meaning}</Text>
                      <Text style={s.caption}>
                        That is all reading takes. In a story you also see the
                        strokes and the sentence it came from.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={[s.line, { justifyContent: "center", gap: 8 }]}>
                    <Icon name="arrow-up" size={18} color={C.amberDeep} />
                    <Text style={[s.caption, { color: C.amberDeep }]}>
                      Tap 我, 想, 喝 or 茶
                    </Text>
                  </View>
                )}
              </>
            )}
            {page === 2 && (
              <>
                <Text style={s.heroTitle}>Plant the words you want.</Text>
                <Text style={s.subtitle}>
                  A planted word becomes a bamboo in your grove. It comes back
                  for review tomorrow, then after two days, then four: just
                  before you would forget it.
                </Text>
                <View style={[s.card, s.line, { gap: 16 }]}>
                  <GridPaper size={84}>
                    <Hanzi word={word} size={50} />
                  </GridPaper>
                  <View style={{ flex: 1 }}>
                    <Pinyin word={word} size={18} />
                    <Text style={s.title}>{word.meaning}</Text>
                  </View>
                </View>
                {inDeck ? (
                  <>
                    <View style={[s.card, { padding: 10 }]}>
                      <GrovePlot strong={0} growing={0} fresh={1} height={96} />
                    </View>
                    <View
                      style={[s.line, { justifyContent: "center", gap: 8 }]}
                    >
                      <Icon name="leaf" size={18} color={C.primary} />
                      <Text style={s.cardTitle}>
                        {word.hanzi} is planted. Your grove has begun.
                      </Text>
                    </View>
                  </>
                ) : (
                  <Button
                    icon="leaf-outline"
                    label={`Plant ${word.hanzi}`}
                    onPress={() => onPlant(word)}
                  />
                )}
              </>
            )}
            {page === 3 && (
              <>
                <View style={{ alignItems: "center" }}>
                  <Panda size={176} bamboo mood="happy" outfit={outfit} />
                </View>
                <Text style={s.heroTitle}>Feed the panda.</Text>
                <Text style={s.subtitle}>
                  Everything you do earns XP, and XP is the panda's bamboo. Fill
                  today's bar and the panda is full. Come back tomorrow and your
                  streak grows by a day.
                </Text>
                <View style={s.card}>
                  <View style={s.row}>
                    <Text style={s.cardTitle}>Today's bamboo</Text>
                    <Text style={[s.cardTitle, { color: C.primary }]}>
                      30/50
                    </Text>
                  </View>
                  <Meter value={60} />
                  <Text style={s.caption}>
                    Skip a day and the panda is hungry, nothing worse. Your
                    words and XP always stay.
                  </Text>
                </View>
              </>
            )}
            {page === 4 && (
              <>
                <View
                  style={[
                    s.row,
                    { justifyContent: "center", gap: 10, marginTop: 6 },
                  ]}
                >
                  <PlaceArt place="station" size={92} />
                  <PlaceArt place="park" size={92} />
                  <PlaceArt place="pandas" size={92} />
                </View>
                <Text style={s.heroTitle}>A walk through Chengdu.</Text>
                <Text style={s.subtitle}>
                  The readings live at seven places, from the train station to
                  the university. Path shows the map; the panda marks where you
                  are.
                </Text>
                <View style={[s.card, { gap: 12 }]}>
                  {(
                    [
                      ["练", "Practice", "Review and short drills"],
                      ["词", "Words", "The dictionary and your own deck"],
                      ["我", "Me", "Your panda, progress and settings"],
                    ] as const
                  ).map(([glyph, name, note]) => (
                    <View key={name} style={[s.line, { gap: 12 }]}>
                      <GlyphTile glyph={glyph} size={40} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardTitle}>{name}</Text>
                        <Text style={s.caption}>{note}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
            <View style={{ flex: 1 }} />
            {page === PAGES - 1 ? (
              <>
                <Button label="Start my first reading →" onPress={onStart} />
                <Button light label="Look around first" onPress={onClose} />
              </>
            ) : (
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
                  label="Next"
                  style={{ flex: 1.6 }}
                  onPress={() => setPage((v) => v + 1)}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
