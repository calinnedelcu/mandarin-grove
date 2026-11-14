import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GridPaper, GroveScene, Stamp, ToneContour } from "./art";
import { LeafFall } from "./LeafFall";
import { Panda } from "./Panda";
import { Exercise, exerciseXP, Session, toneLabels } from "./exercises";
import { changeTone, checkTyped } from "./learning";
import { C, F, s, shadow } from "./theme";
import { AudioController } from "./useSpeech";
import {
  Button,
  Chip,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Mixed,
  Pinyin,
  Zh,
} from "./ui";

const han = /[㐀-鿿]/;

export function Quiz({
  session,
  audio,
  onAnswer,
  onComplete,
  onClose,
  after,
}: {
  session: Session;
  audio: AudioController;
  onAnswer: (correct: boolean, q: Exercise) => void;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
  /** What to offer after the result: the day's next step, or a next reading. */
  after?: { label: string; run: () => void } | null;
}) {
  const [index, setIndex] = useState(0),
    [chosen, setChosen] = useState<string | null>(null),
    [score, setScore] = useState(0),
    [done, setDone] = useState(false),
    [input, setInput] = useState(""),
    [built, setBuilt] = useState<number[]>([]),
    [seconds, setSeconds] = useState(60),
    [earned, setEarned] = useState(0),
    [missed, setMissed] = useState<string[]>([]);
  const lock = useRef(false),
    finished = useRef(false),
    scoreRef = useRef(0),
    answered = useRef(0),
    deadline = useRef(Date.now() + 60000),
    completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  function finish() {
    if (finished.current) return;
    finished.current = true;
    audio.stop();
    setDone(true);
    completeRef.current(scoreRef.current, answered.current);
  }
  useEffect(() => {
    if (!session.timed) return;
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setSeconds(remaining);
      if (!remaining) finish();
    }, 250);
    return () => clearInterval(timer);
  }, []);
  const enter = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    lock.current = false;
    setInput("");
    setBuilt([]);
    // Each question slides in from the right.
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 240,
      useNativeDriver: Platform.OS !== "web",
    }).start();
    // A listening question says itself once, without being asked.
    const item = session.exercises[index],
      spoken =
        item &&
        (item.mode === "listening" ||
          item.mode === "tone-hearing" ||
          item.mode === "dictation")
          ? item.spoken
          : undefined;
    if (!spoken) return;
    const timer = setTimeout(() => audio.say(spoken), 350);
    return () => clearTimeout(timer);
  }, [index]);
  const q = session.exercises[index];
  if (!q) return null;
  function answer(option: string) {
    if (lock.current || finished.current) return;
    lock.current = true;
    const correct = checkTyped(option, q.answer, q.mode === "typing");
    setChosen(option);
    answered.current++;
    if (correct) {
      scoreRef.current++;
      setScore(scoreRef.current);
    } else setMissed((v) => [...v, q.explanation]);
    setEarned((v) => v + (correct ? exerciseXP(q.mode) : 2));
    onAnswer(correct, q);
    audio.stop();
  }
  function next() {
    if (index === session.exercises.length - 1) finish();
    else {
      setIndex((v) => v + 1);
      setChosen(null);
      audio.stop();
    }
  }
  const listening =
      q.mode === "listening" ||
      q.mode === "tone-hearing" ||
      q.mode === "dictation",
    building = q.mode === "build" || q.mode === "dictation",
    right =
      chosen !== null && checkTyped(chosen, q.answer, q.mode === "typing"),
    ratio = answered.current ? score / answered.current : 0;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton name="close" label="Close quiz" onPress={onClose} />
            <Text style={s.eyebrow}>
              {done
                ? "A LITTLE MORE FLUENT"
                : `QUESTION ${index + 1} OF ${session.exercises.length}`}
            </Text>
            <View style={[s.badge, { minWidth: 62, alignItems: "center" }]}>
              <Text
                style={[
                  s.caption,
                  {
                    fontWeight: "700",
                    color: session.timed && !done ? C.coral : C.ink,
                  },
                ]}
              >
                {session.timed && !done ? `${seconds}s` : `+${earned} XP`}
              </Text>
            </View>
          </View>
          {!done && (
            <View style={{ paddingHorizontal: 20 }}>
              <Meter
                slim
                color={C.primary}
                value={
                  session.timed
                    ? (seconds / 60) * 100
                    : (index / session.exercises.length) * 100
                }
              />
            </View>
          )}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[s.content, { flexGrow: 1 }]}
          >
            {done ? (
              <View style={[s.center, { flex: 1, paddingVertical: 30 }]}>
                <GroveScene height={300} />
                {ratio >= 0.6 && <LeafFall count={12} />}
                <Panda
                  size={170}
                  cheer={ratio >= 0.6}
                  mood={ratio >= 0.9 ? "wow" : ratio >= 0.6 ? "happy" : "calm"}
                />
                <Text style={[s.heroTitle, { textAlign: "center" }]}>
                  Look at you grow.
                </Text>
                <Text
                  style={[s.subtitle, { textAlign: "center", marginTop: 0 }]}
                >
                  {score} of {answered.current} correct. Every little practice
                  counts.
                </Text>
                <View style={[s.row, { width: "100%" }]}>
                  {[
                    [`${score}/${answered.current}`, "correct"],
                    [`+${earned}`, "XP earned"],
                    [`${Math.round(ratio * 100)}%`, "accuracy"],
                  ].map(([value, label]) => (
                    <View
                      key={label}
                      style={[s.statCard, { alignItems: "center" }]}
                    >
                      <Text style={s.statNumber}>{value}</Text>
                      <Text style={s.caption}>{label}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.card, { width: "100%", marginBottom: 0 }]}>
                  <Text style={s.cardTitle}>
                    {session.timed
                      ? "A lovely little sprint"
                      : session.zen
                        ? "A calm moment, well spent"
                        : missed.length
                          ? "Worth another look"
                          : "Your next step is waiting"}
                  </Text>
                  {missed.length > 0 && !session.timed ? (
                    missed.slice(0, 5).map((line, i) => (
                      <Mixed key={i} style={{ marginTop: 6 }}>
                        {line}
                      </Mixed>
                    ))
                  ) : (
                    <Text style={s.body}>
                      Missed words return sooner. Successful reviews give your
                      memory more room.
                    </Text>
                  )}
                </View>
                <View style={{ width: "100%" }}>
                  {after && <Button label={after.label} onPress={after.run} />}
                  <Button
                    light={!!after}
                    label="Back to the grove"
                    onPress={onClose}
                  />
                </View>
              </View>
            ) : (
              <Animated.View
                style={{
                  flexGrow: 1,
                  opacity: enter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    {
                      translateX: enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={[s.eyebrow, { marginTop: 14 }]}>
                  {session.title.toUpperCase()}
                </Text>
                {han.test(q.prompt) ? (
                  <Zh size={26} style={{ marginTop: 8 }}>
                    {q.prompt}
                  </Zh>
                ) : (
                  <Text style={[s.title, { marginTop: 8 }]}>{q.prompt}</Text>
                )}
                <View
                  style={[s.center, { paddingVertical: 22, minHeight: 150 }]}
                >
                  {listening ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Play listening question"
                        onPress={() => audio.say(q.spoken!)}
                        style={({ pressed }) => [
                          shadow,
                          {
                            height: 104,
                            width: 104,
                            borderRadius: 52,
                            backgroundColor: C.primary,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Icon name="volume-high" color="#FFFFFF" size={40} />
                      </Pressable>
                      <Text style={s.caption}>
                        Tap to hear · replay anytime
                      </Text>
                    </>
                  ) : q.word ? (
                    q.mode === "reverse" ? (
                      <View
                        style={[
                          s.card,
                          {
                            width: "100%",
                            alignItems: "center",
                            marginBottom: 0,
                            paddingVertical: 26,
                          },
                        ]}
                      >
                        <Text style={[s.title, { textAlign: "center" }]}>
                          {q.word.meaning}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <GridPaper
                          size={150}
                          style={{
                            width: Math.max(
                              150,
                              Array.from(q.word.hanzi).length * 78 + 24,
                            ),
                          }}
                          diagonal={Array.from(q.word.hanzi).length === 1}
                        >
                          <Hanzi
                            word={q.word}
                            size={Array.from(q.word.hanzi).length > 3 ? 56 : 70}
                            colored={q.mode === "meaning"}
                          />
                        </GridPaper>
                        {q.mode === "meaning" && <Pinyin word={q.word} large />}
                      </>
                    )
                  ) : q.mode === "gap" ? (
                    <Text style={s.caption}>
                      Choose the missing word from this story.
                    </Text>
                  ) : (
                    <Text style={s.caption}>
                      {q.mode === "build"
                        ? "Put the story’s words back in order."
                        : "Recall the Chinese from the story. Use the sample wording."}
                    </Text>
                  )}
                </View>
                {listening && audio.error && (
                  <View style={[s.notice, { marginTop: 0, marginBottom: 6 }]}>
                    <Text style={s.body}>{audio.error}</Text>
                    <Text style={s.caption}>
                      Close this session and try meaning practice while audio is
                      unavailable.
                    </Text>
                  </View>
                )}
                {q.options.length > 0 ? (
                  q.options.map((option, i) => {
                    const correct = chosen !== null && option === q.answer;
                    const wrong = chosen === option && !correct;
                    const toneIndex =
                      q.mode === "tone-hearing"
                        ? toneLabels.indexOf(option)
                        : -1;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityLabel={`Answer ${String.fromCharCode(65 + i)}: ${option}`}
                        disabled={chosen !== null}
                        onPress={() => answer(option)}
                        style={({ pressed }) => [
                          s.option,
                          correct && s.correct,
                          wrong && s.wrong,
                          { opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        <View
                          style={[
                            s.optionKey,
                            correct && {
                              backgroundColor: C.primary,
                              borderColor: C.primary,
                            },
                            wrong && {
                              backgroundColor: C.coral,
                              borderColor: C.coral,
                            },
                          ]}
                        >
                          {correct || wrong ? (
                            <Icon
                              name={correct ? "checkmark" : "close"}
                              size={16}
                              color={C.card}
                            />
                          ) : (
                            <Text style={[s.eyebrow, { letterSpacing: 0 }]}>
                              {String.fromCharCode(65 + i)}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={
                            han.test(option)
                              ? {
                                  flex: 1,
                                  fontFamily: F.kai,
                                  fontSize: 23,
                                  lineHeight: 30,
                                  color: C.ink,
                                }
                              : [
                                  s.body,
                                  { flex: 1, fontSize: 16.5, color: C.ink },
                                ]
                          }
                        >
                          {option}
                        </Text>
                        {toneIndex >= 0 && (
                          <ToneContour tone={toneIndex} width={40} />
                        )}
                      </Pressable>
                    );
                  })
                ) : building ? (
                  <>
                    <View
                      style={[
                        s.card,
                        { minHeight: 84, justifyContent: "center" },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: F.kai,
                          fontSize: 25,
                          lineHeight: 36,
                          color: built.length ? C.ink : C.faint,
                        }}
                      >
                        {built.map((i) => q.tokens![i]).join(" ") ||
                          "Your sentence goes here"}
                      </Text>
                    </View>
                    <View style={s.wrap}>
                      {q.tokens!.map((token, i) => (
                        <Chip
                          key={i}
                          kai
                          label={token}
                          selected={built.includes(i)}
                          onPress={() => {
                            if (chosen !== null) return;
                            setBuilt((v) =>
                              v.includes(i)
                                ? v.filter((n) => n !== i)
                                : [...v, i],
                            );
                          }}
                        />
                      ))}
                    </View>
                    <Button
                      label="Check sentence"
                      disabled={chosen !== null || !built.length}
                      onPress={() =>
                        answer(built.map((i) => q.tokens![i]).join(""))
                      }
                    />
                  </>
                ) : (
                  <>
                    <TextInput
                      accessibilityLabel="Type your answer"
                      style={[s.search, { fontSize: 19 }]}
                      value={input}
                      onChangeText={setInput}
                      placeholder={
                        q.mode === "typing"
                          ? "e.g. nǐ hǎo"
                          : "Type the Chinese answer"
                      }
                      placeholderTextColor={C.faint}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={chosen === null}
                      onSubmitEditing={() => input.trim() && answer(input)}
                    />
                    {q.mode === "typing" && (
                      <>
                        <Text style={s.caption}>
                          Add a tone to the last syllable:
                        </Text>
                        <View style={[s.wrap, { marginTop: 10 }]}>
                          {[1, 2, 3, 4, 0].map((t) => (
                            <Chip
                              key={t}
                              label={["Neutral", "1 ˉ", "2 ↗", "3 ˇ", "4 ↘"][t]}
                              onPress={() => {
                                if (chosen !== null) return;
                                setInput((v) => {
                                  const parts = v.split(" ");
                                  parts[parts.length - 1] = changeTone(
                                    parts[parts.length - 1],
                                    t,
                                  );
                                  return parts.join(" ");
                                });
                              }}
                            />
                          ))}
                        </View>
                      </>
                    )}
                    <Button
                      label="Check answer"
                      disabled={chosen !== null || !input.trim()}
                      onPress={() => answer(input)}
                    />
                  </>
                )}
                {chosen !== null && (
                  <View
                    accessibilityLiveRegion="polite"
                    style={[
                      s.feedback,
                      {
                        borderColor: right ? C.primary : C.coral,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <View style={[s.line, { gap: 12 }]}>
                      <Panda
                        head
                        pop
                        size={54}
                        mood={right ? "happy" : "oops"}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            s.eyebrow,
                            { color: right ? C.primary : C.coralDeep },
                          ]}
                        >
                          {right ? "巴适 · bā shì" : "加油 · jiā yóu"}
                        </Text>
                        <Text style={s.cardTitle}>
                          {right
                            ? "That’s it! Nicely done."
                            : "A little more practice will help."}
                        </Text>
                      </View>
                    </View>
                    <Mixed zhSize={20} style={{ marginTop: 10 }}>
                      {q.explanation}
                    </Mixed>
                    {q.spoken && (
                      <Button
                        light
                        icon="volume-medium-outline"
                        label="Hear the answer"
                        onPress={() => audio.say(q.spoken!)}
                      />
                    )}
                    <Button
                      label={
                        index === session.exercises.length - 1
                          ? "See your growth →"
                          : "Next question →"
                      }
                      onPress={next}
                    />
                  </View>
                )}
                {session.zen && (
                  <Text
                    style={[s.caption, { textAlign: "center", marginTop: 22 }]}
                  >
                    No timer. No rush. Breathe, notice, remember.
                  </Text>
                )}
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
