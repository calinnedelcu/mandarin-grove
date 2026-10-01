import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkTyped, changeTone } from "./learning";
import { Exercise, exerciseXP, Session } from "./exercises";
import { AudioController } from "./useSpeech";
import {
  Button,
  C,
  Chip,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Pinyin,
  s,
} from "./ui";
export function Quiz({
  session,
  audio,
  onAnswer,
  onComplete,
  onClose,
}: {
  session: Session;
  audio: AudioController;
  onAnswer: (correct: boolean, q: Exercise) => void;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0),
    [chosen, setChosen] = useState<string | null>(null),
    [score, setScore] = useState(0),
    [done, setDone] = useState(false),
    [input, setInput] = useState(""),
    [built, setBuilt] = useState<number[]>([]),
    [seconds, setSeconds] = useState(60),
    [earned, setEarned] = useState(0);
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
  useEffect(() => {
    lock.current = false;
    setInput("");
    setBuilt([]);
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
    }
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
  const listening = q.mode === "listening" || q.mode === "tone-hearing";
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
            <Text style={s.caption}>
              {session.timed && !done ? `${seconds}s` : `+${earned} XP`}
            </Text>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[s.content, { flexGrow: 1 }]}
          >
            {done ? (
              <View style={[s.center, { flex: 1, paddingVertical: 40 }]}>
                <Text style={{ fontSize: 72 }}>🌸</Text>
                <Text style={s.heroTitle}>Look at you grow.</Text>
                <Text style={[s.subtitle, { textAlign: "center" }]}>
                  {score} of {answered.current} correct. Every little practice
                  counts.
                </Text>
                <View style={[s.card, { width: "100%" }]}>
                  <Text style={s.cardTitle}>
                    {session.timed
                      ? "A lovely little sprint"
                      : session.zen
                        ? "A calm moment, well spent"
                        : "Your next step is waiting"}
                  </Text>
                  <Text style={s.body}>
                    Missed words return sooner. Successful reviews give your
                    memory more room.
                  </Text>
                </View>
                <Button label="Back to the grove" onPress={onClose} />
              </View>
            ) : (
              <>
                <Meter value={(index / session.exercises.length) * 100} />
                <Text style={[s.eyebrow, { marginTop: 24 }]}>
                  {session.title.toUpperCase()}
                </Text>
                <Text style={[s.title, { marginTop: 10 }]}>{q.prompt}</Text>
                <View
                  style={[s.center, { paddingVertical: 30, minHeight: 150 }]}
                >
                  {listening ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Play listening question"
                        onPress={() => audio.say(q.spoken!)}
                        style={s.audioCircle}
                      >
                        <Icon name="volume-high" color={C.green} size={42} />
                      </Pressable>
                      <Text style={s.caption}>
                        Tap to hear · replay anytime
                      </Text>
                    </>
                  ) : q.word ? (
                    <>
                      {q.mode === "reverse" ? (
                        <Text style={s.title}>{q.word.meaning}</Text>
                      ) : (
                        <Hanzi
                          word={q.word}
                          size={58}
                          colored={q.mode === "meaning"}
                        />
                      )}{" "}
                      {q.mode === "meaning" && <Pinyin word={q.word} large />}
                    </>
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
                  <View style={s.notice}>
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
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityLabel={`Answer ${String.fromCharCode(65 + i)}: ${option}`}
                        disabled={chosen !== null}
                        onPress={() => answer(option)}
                        style={[
                          s.option,
                          correct && s.correct,
                          wrong && s.wrong,
                        ]}
                      >
                        <Text style={s.eyebrow}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                        <Text style={[s.body, { flex: 1, fontSize: 17 }]}>
                          {option}
                        </Text>
                        {correct && (
                          <Icon name="checkmark-circle" color={C.green} />
                        )}
                      </Pressable>
                    );
                  })
                ) : q.mode === "build" ? (
                  <>
                    <View style={[s.card, { minHeight: 80 }]}>
                      <Text style={[s.body, { fontSize: 24 }]}>
                        {built.map((i) => q.tokens![i]).join(" ") ||
                          "Your sentence goes here"}
                      </Text>
                    </View>
                    <View style={s.wrap}>
                      {q.tokens!.map((token, i) => (
                        <Chip
                          key={i}
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
                      style={s.search}
                      value={input}
                      onChangeText={setInput}
                      placeholder={
                        q.mode === "typing"
                          ? "e.g. nǐ hǎo"
                          : "Type the Chinese answer"
                      }
                      placeholderTextColor={C.muted}
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
                  <View accessibilityLiveRegion="polite" style={s.feedback}>
                    <Text style={s.cardTitle}>
                      {checkTyped(chosen, q.answer, q.mode === "typing")
                        ? "That’s it! Nicely done."
                        : "A little more practice will help."}
                    </Text>
                    <Text style={[s.body, { marginTop: 8 }]}>
                      {q.explanation}
                    </Text>
                    {q.spoken && (
                      <Button
                        light
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
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
