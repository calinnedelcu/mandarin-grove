import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lesson, Word, lessons, words, tone, toneColors } from "./src/content";
import {
  Progress,
  Question,
  Mode,
  emptyProgress,
  parseProgress,
  reward,
  schedule,
  makeQuestions,
  dayKey,
  activeStreak,
} from "./src/learning";
const C = {
  bg: "#F7F8F2",
  ink: "#203B30",
  muted: "#758177",
  green: "#285E45",
  lime: "#DBF2A4",
  line: "#E4E8DD",
};
const KEY = "mandarin-grove.v1";
type Tab = "Today" | "Stories" | "Review" | "Words";
function Icon({
  name,
  size = 22,
  color = C.ink,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
function Button({
  label,
  onPress,
  light = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  light?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"

      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        light && s.lightButton,
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[s.buttonText, light && { color: C.green }]}>{label}</Text>
    </Pressable>
  );
}
function Pinyin({ word, large = false }: { word: Word; large?: boolean }) {
  return (
    <View style={s.pinyin}>
      {word.pinyin.split(" ").map((sy, i) => (
        <Text
          key={i}
          style={{
            color: toneColors[tone(sy)],
            fontSize: large ? 22 : 14,
            fontWeight: "600",
          }}
        >
          {sy}
          {i < word.pinyin.split(" ").length - 1 ? " " : ""}
        </Text>
      ))}
    </View>
  );
}
function Hanzi({ word, size = 30 }: { word: Word; size?: number }) {
  const syllables = word.pinyin.split(" ");
  return (
    <Text style={{ fontSize: size, fontWeight: "600", letterSpacing: 2 }}>
      {Array.from(word.hanzi).map((char, i) => (
        <Text key={i} style={{ color: toneColors[tone(syllables[i] || "")] }}>
          {char}
        </Text>
      ))}
    </Text>
  );
}
function AppContent() {
  const [p, setP] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Today");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [word, setWord] = useState<Word | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [quizLesson, setQuizLesson] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now());
  const [slow, setSlow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setP(parseProgress(raw));
      })
      .catch(() =>
        setError(
          "Saved progress could not be loaded. This session starts fresh.",
        ),
      )
      .finally(() => setReady(true));
    return () => {
      void Speech.stop().catch(() => {});
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
      else void Speech.stop().catch(() => {});
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(p)))
      .catch(() =>
        setError(
          "Progress could not be saved. Please check available device storage.",
        ),
      );
  }, [p, ready]);
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [tab]);
  const due = words.filter((w) => p.cards[w.id] && p.cards[w.id].due <= now);
  const learned = Object.keys(p.cards).length;
  const daily = p.lastDay === dayKey(new Date(now)) ? p.dailyXP : 0;
  function buzz(success = true) {
    void Haptics.notificationAsync(
      success
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
  }
  async function speak(text: string) {
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: "zh-CN",
        rate: slow ? 0.65 : 0.85,
        onError: () =>
          setError(
            "Audio unavailable. Enable a Mandarin voice in your device settings.",
          ),
      });
    } catch {
      setError("Unable to play audio. Check your device speech settings.");
    }
  }
  function startQuiz(pool: Word[], mode?: Mode, lid: string | null = null) {
    void Speech.stop().catch(() => {});
    setQuestions(makeQuestions(pool, mode));
    setIndex(0);
    setChosen(null);
    setScore(0);
    setDone(false);
    setQuizLesson(lid);
    setLesson(null);
  }
  function answer(option: string) {
    if (chosen !== null) return;
    const q = questions[index];
    const correct = option === q.answer;
    setChosen(option);
    if (correct) setScore((v) => v + 1);
    buzz(correct);
    setP((prev) => ({
      ...reward(prev, correct ? 10 : 2),
      cards: {
        ...prev.cards,
        [q.word.id]: schedule(
          prev.cards[q.word.id],
          correct ? "good" : "again",
        ),
      },
    }));
    setNow(Date.now());
  }
  function nextQuestion() {
    void Speech.stop().catch(() => {});
    if (index === questions.length - 1) {
      setDone(true);
      if (quizLesson)
        setP((prev) =>
          prev.completed.includes(quizLesson)
            ? prev
            : {
                ...reward(prev, 25),
                completed: [...prev.completed, quizLesson],
              },
        );
    } else {
      setIndex((v) => v + 1);
      setChosen(null);
    }
  }
  function review(grade: "again" | "good" | "easy") {
    const id = reviewQueue[0];
    setP((prev) => ({
      ...reward(prev, grade === "again" ? 2 : 8),
      cards: { ...prev.cards, [id]: schedule(prev.cards[id], grade) },
    }));
    setReviewQueue((v) => v.slice(1));
    setRevealed(false);
    setNow(Date.now());
    buzz(grade !== "again");
  }
  const section = (title: string, caption?: string) => (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {caption && <Text style={s.caption}>{caption}</Text>}
    </View>
  );
  function lessonCard(l: Lesson, i: number) {
    const complete = p.completed.includes(l.id);
    return (
      <Pressable
        accessibilityRole="button"

        key={l.id}
        onPress={() => setLesson(l)}
        style={({ pressed }) => [s.lessonCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={[s.lessonEmoji, { backgroundColor: l.color }]}>
          <Text style={{ fontSize: 30 }}>{l.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>
            CHAPTER {String(i + 1).padStart(2, "0")} · 3 MIN
          </Text>
          <Text style={s.cardTitle}>{l.title}</Text>
          <Text style={s.caption}>{l.subtitle}</Text>
        </View>
        <Icon
          name={complete ? "checkmark-circle" : "chevron-forward"}
          color={complete ? C.green : C.muted}
        />
      </Pressable>
    );
  }
  const dictionary =
    word !== null ? (
      <View style={[StyleSheet.absoluteFill, s.scrim, { zIndex: 20 }]}>
        <Pressable
          accessibilityRole="button"

          style={StyleSheet.absoluteFill}
          accessibilityLabel="Dismiss word details"
          onPress={() => setWord(null)}
        />
        <View style={s.wordSheet}>
          {word && (
            <>
              <View style={s.row}>
                <Text style={s.eyebrow}>YOUR POCKET DICTIONARY</Text>
                <Pressable
                  accessibilityRole="button"

                  accessibilityLabel="Close word details"
                  onPress={() => {
                    setWord(null);
                    void Speech.stop().catch(() => {});
                  }}
                  style={s.close}
                >
                  <Icon name="close" />
                </Pressable>
              </View>
              <Hanzi word={word} size={65} />
              <Pinyin word={word} large />
              <Text style={s.title}>{word.meaning}</Text>
              <Text style={s.caption}>
                Tone colors show dictionary tones.{"\n"}In sentences, some tones
                change naturally.
              </Text>
              <Button
                label="♫  Listen in Mandarin"
                onPress={() => speak(word.hanzi)}
              />
              <Button
                light
                label={
                  p.cards[word.id]
                    ? "Saved to your review garden ✓"
                    : "Plant this word for review +"
                }
                disabled={!!p.cards[word.id]}
                onPress={() => {
                  const plantedAt = Date.now();
                  setNow(plantedAt);
                  setP((prev) => ({
                    ...prev,
                    cards: {
                      ...prev.cards,
                      [word.id]: {
                        due: plantedAt,
                        interval: 0,
                        reviews: 0,
                        lapses: 0,
                      },
                    },
                  }));
                }}
              />
            </>
          )}
        </View>
      </View>
    ) : null;
  if (!ready)
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Text style={s.title}>🌱 Growing your grove…</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={s.shell}>
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Icon name="leaf" color={C.green} size={21} />
            </View>
            <Text style={s.brandText}>
              mandarin<Text style={{ fontWeight: "400" }}> grove</Text>
            </Text>
          </View>
          <View style={s.streak}>
            <Icon name="flame" size={17} color="#B76B32" />
            <Text style={s.streakText}>{activeStreak(p, new Date(now))}</Text>
          </View>
        </View>
        {error !== "" && (
          <Pressable
            accessibilityRole="button"

            onPress={() => setError("")}
            style={s.error}
          >
            <Text>{error} Tap to dismiss.</Text>
          </Pressable>
        )}
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fade,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            {tab === "Today" && (
              <>
                <Text style={s.eyebrow}>
                  A LITTLE EVERY DAY. A WORLD OF POSSIBILITY.
                </Text>
                <Text style={s.heroTitle}>
                  Your Mandarin,
                  <Text style={{ color: C.green }}> blooming.</Text>
                </Text>
                <Text style={s.subtitle}>
                  Small stories. Real understanding. Your pace.
                </Text>
                <LinearGradient colors={["#285E45", "#1A4434"]} style={s.hero}>
                  <View style={s.row}>
                    <View style={s.pill}>
                      <Text style={s.pillText}>YOUR DAILY MOMENT</Text>
                    </View>
                    <Text style={{ fontSize: 24 }}>✦</Text>
                  </View>
                  <Text style={s.heroLabel}>A cup of tea.{"\n"}</Text>
                  <Text style={s.heroChinese}>一杯茶，一个故事。</Text>
                  <Text style={s.heroCopy}>
                    One cup of tea, one story. Step into a tiny{"\n"}
                    conversation and make it yours.
                  </Text>
                  <View style={s.heroArt}>
                    <Text style={{ fontSize: 66 }}>🍵</Text>
                    <Text style={s.artSpark}>✧</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"

                    onPress={() => setLesson(lessons[3])}
                    style={s.heroCTA}
                  >
                    <Text style={s.heroCTAText}>Read today's story</Text>
                    <Icon name="arrow-forward" color={C.ink} />
                  </Pressable>
                  <Text style={s.heroMeta}>
                    HSK 1 STARTER · 3 MIN · 12 WORDS
                  </Text>
                </LinearGradient>
                <View style={s.stats}>
                  <View style={s.stat}>
                    <Text style={s.statNumber}>
                      {p.xp}
                      <Text style={s.statUnit}> XP</Text>
                    </Text>
                    <Text style={s.caption}>curiosity earned</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statNumber}>
                      {learned}
                      <Text style={s.statUnit}> / 72</Text>
                    </Text>
                    <Text style={s.caption}>words planted</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statNumber}>
                      {p.completed.length}
                      <Text style={s.statUnit}> / 6</Text>
                    </Text>
                    <Text style={s.caption}>chapters explored</Text>
                  </View>
                </View>
                <View style={s.goalCard}>
                  <View style={s.row}>
                    <Text style={s.cardTitle}>
                      {daily >= 50
                        ? "A lovely day of growth ✨"
                        : "Your daily bloom"}
                    </Text>
                    <Text style={s.caption}>{Math.min(daily, 50)} / 50 XP</Text>
                  </View>
                  <View style={s.track}>
                    <View
                      style={[
                        s.fill,
                        { width: `${Math.min(100, daily * 2)}%` },
                      ]}
                    />
                  </View>
                  <Text style={s.caption}>
                    Read a little. Practice a little. Let it stick.
                  </Text>
                </View>
                {section("Keep your words growing", `${due.length} ready`)}
                <Pressable
                  accessibilityRole="button"

                  style={s.reviewBanner}
                  onPress={() => {
                    setTab("Review");
                  }}
                >
                  <View style={s.reviewIcon}>
                    <Icon name="refresh" color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>
                      {due.length
                        ? "Your review garden is ready"
                        : "Plant your first words"}
                    </Text>
                    <Text style={s.caption}>
                      {due.length
                        ? "A quick refresh for lasting memory."
                        : "Complete a quiz to start spaced review."}
                    </Text>
                  </View>
                  <Icon name="arrow-forward" />
                </Pressable>
                {section("Your first chapters", "HSK 1")}
                {lessons.slice(0, 2).map(lessonCard)}
                <View style={s.note}>
                  <Text style={s.noteText}>慢慢来 · màn màn lái</Text>
                  <Text style={s.caption}>
                    Take your time. Growth is a daily practice.
                  </Text>
                </View>
              </>
            )}
            {tab === "Stories" && (
              <>
                <Text style={s.eyebrow}>THE WORLD, A FEW WORDS AT A TIME</Text>
                <Text style={s.heroTitle}>
                  Little stories.{"\n"} Big discoveries.
                </Text>
                <Text style={s.subtitle}>
                  Six beginner chapters for everyday Mandarin.
                </Text>
                {lessons.map(lessonCard)}
                <View style={s.goalCard}>
                  <Text style={s.cardTitle}>Context makes it click.</Text>
                  <Text style={s.subtitle}>
                    Read each tiny scene, tap a word, listen, then check what
                    stayed with you. These are original practice stories, not
                    live news.
                  </Text>
                </View>
              </>
            )}
            {tab === "Review" && (
              <>
                <Text style={s.eyebrow}>A LITTLE RECALL GOES A LONG WAY</Text>
                <Text style={s.heroTitle}>Your review garden.</Text>
                <Text style={s.subtitle}>
                  Words return just when they need a little care.
                </Text>
                <View style={s.reviewHero}>
                  <Text style={{ fontSize: 55 }}>🌱</Text>
                  <Text style={s.bigNumber}>{due.length}</Text>
                  <Text style={s.cardTitle}>words ready to refresh</Text>
                  <Text style={s.subtitle}>
                    {learned} planted ·{" "}
                    {
                      words.filter((w) => (p.cards[w.id]?.interval || 0) >= 4)
                        .length
                    }{" "}
                    taking root
                  </Text>
                  <Button
                    label={
                      due.length ? "Start spaced review →" : "Explore a story →"
                    }
                    onPress={() => {
                      if (due.length) {
                        setReviewQueue(due.map((w) => w.id));
                        setRevealed(false);
                      } else setTab("Stories");
                    }}
                  />
                </View>
                {section("Choose your practice")}
                {(
                  [
                    {
                      mode: "meaning",
                      icon: "language",
                      title: "Meaning detective",
                      text: "Connect characters to meaning.",
                    },
                    {
                      mode: "tone",
                      icon: "musical-notes",
                      title: "Find the right tones",
                      text: "Choose the exact pinyin spelling.",
                    },
                    {
                      mode: "listening",
                      icon: "headset",
                      title: "Listen & recognize",
                      text: "Hear a word. Find its characters.",
                    },
                  ] as const
                ).map((m) => (
                  <Pressable
                    accessibilityRole="button"

                    key={m.mode}
                    style={s.lessonCard}
                    onPress={() =>
                      startQuiz(
                        learned
                          ? words.filter((w) => p.cards[w.id])
                          : lessons[0].words,
                        m.mode,
                      )
                    }
                  >
                    <View style={s.reviewIcon}>
                      <Icon name={m.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{m.title}</Text>
                      <Text style={s.caption}>{m.text}</Text>
                    </View>
                    <Icon name="chevron-forward" />
                  </Pressable>
                ))}
                <Text style={[s.caption, { marginTop: 16 }]}>
                  Again: 1 minute · Good: at least 1 day · Easy: at least 4
                  days. Successful reviews extend the interval.
                </Text>
              </>
            )}
            {tab === "Words" && (
              <>
                <Text style={s.eyebrow}>YOUR POCKET MANDARIN COMPANION</Text>
                <Text style={s.heroTitle}>72 little possibilities.</Text>
                <Text style={s.subtitle}>
                  Tap any word to hear it and make it familiar.
                </Text>
                <TextInput
                  accessibilityLabel="Search vocabulary"
                  placeholder="Search hanzi, pinyin, or meaning"
                  placeholderTextColor={C.muted}
                  value={search}
                  onChangeText={setSearch}
                  style={s.search}
                />
                <View style={s.tones}>
                  {[
                    "1 high",
                    "2 rising",
                    "3 dipping",
                    "4 falling",
                    "• neutral",
                  ].map((t, i) => (
                    <Text
                      key={t}
                      style={{
                        color: toneColors[(i + 1) % 5],
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {t}
                    </Text>
                  ))}
                </View>
                {words
                  .filter((w) =>
                    `${w.hanzi} ${w.pinyin} ${w.pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "")} ${w.meaning}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((w) => (
                    <Pressable
                      accessibilityRole="button"

                      key={w.id}
                      style={s.wordRow}
                      onPress={() => setWord(w)}
                    >
                      <View style={{ width: 90 }}>
                        <Hanzi word={w} size={25} />
                        <Pinyin word={w} />
                      </View>
                      <Text style={[s.body, { flex: 1 }]}>{w.meaning}</Text>
                      <Icon
                        name={
                          p.cards[w.id]
                            ? "leaf-outline"
                            : "volume-medium-outline"
                        }
                        color={C.muted}
                      />
                    </Pressable>
                  ))}
              </>
            )}
          </Animated.View>
        </ScrollView>
        <SafeAreaView edges={["bottom"]} style={s.nav}>
          <View style={s.navInner}>
            {(["Today", "Stories", "Review", "Words"] as Tab[]).map((t, i) => (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t }}
                onPress={() => setTab(t)}
                style={s.navItem}
              >
                <View
                  style={[s.navIcon, tab === t && { backgroundColor: C.lime }]}
                >
                  <Icon
                    name={
                      (
                        [
                          "sunny-outline",
                          "book-outline",
                          "leaf-outline",
                          "grid-outline",
                        ] as const
                      )[i]
                    }
                    color={tab === t ? C.green : C.muted}
                  />
                </View>
                <Text
                  style={[
                    s.navText,
                    tab === t && { color: C.green, fontWeight: "700" },
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </View>
      <Modal
        visible={lesson !== null}
        animationType="slide"
        onRequestClose={() => {
          setLesson(null);
          void Speech.stop().catch(() => {});
        }}
      >
        <SafeAreaView style={s.root}>
          <View style={s.modalHeader}>
            <Pressable
              accessibilityRole="button"

              accessibilityLabel="Close lesson"
              onPress={() => {
                setLesson(null);
                void Speech.stop().catch(() => {});
              }}
              style={s.close}
            >
              <Icon name="close" />
            </Pressable>
            <Text style={s.eyebrow}>READ · LISTEN · DISCOVER</Text>
            <Pressable
              accessibilityRole="button"

              onPress={() => setSlow((v) => !v)}
              style={s.close}
            >
              <Text>{slow ? "0.65×" : "0.85×"}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            {lesson && (
              <>
                <View style={[s.storyCover, { backgroundColor: lesson.color }]}>
                  <Text style={{ fontSize: 65 }}>{lesson.emoji}</Text>
                  <Text style={s.heroTitle}>{lesson.title}</Text>
                  <Text style={s.caption}>
                    HSK 1 starter · 12 words · 3 minutes
                  </Text>
                </View>
                {section("A tiny reading", "TAP A WORD")}
                {lesson.story.map((line, i) => (
                  <View key={i} style={s.sentence}>
                    <View
                      style={[
                        s.row,
                        {
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                          gap: 8,
                        },
                      ]}
                    >
                      {line.ids.map((id, j) => (
                        <Pressable
                          accessibilityRole="button"

                          key={j}
                          onPress={() => setWord(words[id])}
                        >
                          <Hanzi word={words[id]} size={29} />
                          <Pinyin word={words[id]} />
                        </Pressable>
                      ))}
                      <Pressable
                        accessibilityRole="button"

                        accessibilityLabel="Listen to sentence"
                        onPress={() =>
                          speak(line.ids.map((id) => words[id].hanzi).join(""))
                        }
                        style={s.close}
                      >
                        <Icon name="volume-medium-outline" color={C.green} />
                      </Pressable>
                    </View>
                    <Text style={[s.body, { marginTop: 14 }]}>
                      {line.translation}
                    </Text>
                  </View>
                ))}
                <View style={s.grammar}>
                  <Text style={s.eyebrow}>A PATTERN TO NOTICE</Text>
                  <Text style={[s.body, { marginTop: 10, lineHeight: 25 }]}>
                    {lesson.grammar}
                  </Text>
                </View>
                {section("Words in this chapter")}
                {lesson.words.map((w) => (
                  <Pressable
                    accessibilityRole="button"

                    key={w.id}
                    onPress={() => setWord(w)}
                    style={s.wordRow}
                  >
                    <View style={{ width: 100 }}>
                      <Hanzi word={w} size={25} />
                      <Pinyin word={w} />
                    </View>
                    <Text style={[s.body, { flex: 1 }]}>{w.meaning}</Text>
                    <Icon name="volume-medium-outline" />
                  </Pressable>
                ))}
                <Button
                  label="Check what stuck →"
                  onPress={() => startQuiz(lesson.words, undefined, lesson.id)}
                />
                <Text
                  style={[s.caption, { textAlign: "center", marginTop: 12 }]}
                >
                  8 questions · meaning, tones & listening · +25 XP for first
                  completion
                </Text>
              </>
            )}
          </ScrollView>
          {dictionary}
        </SafeAreaView>
      </Modal>
      <Modal
        visible={questions.length > 0}
        animationType="slide"
        onRequestClose={() => {
          setQuestions([]);
          void Speech.stop().catch(() => {});
        }}
      >
        <SafeAreaView style={s.root}>
          <View style={s.modalHeader}>
            <Pressable
              accessibilityRole="button"

              accessibilityLabel="Close quiz"
              style={s.close}
              onPress={() => {
                setQuestions([]);
                void Speech.stop().catch(() => {});
              }}
            >
              <Icon name="close" />
            </Pressable>
            <Text style={s.eyebrow}>
              {done
                ? "A LITTLE MORE FLUENT"
                : `QUESTION ${index + 1} OF ${questions.length}`}
            </Text>
            <Text style={s.caption}>+{score * 10} XP</Text>
          </View>
          <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
            {done ? (
              <View style={[s.center, { flex: 1 }]}>
                <Text style={{ fontSize: 75 }}>🌸</Text>
                <Text style={s.heroTitle}>Look at you grow.</Text>
                <Text style={s.subtitle}>
                  {score} of {questions.length} correct. Your words are planted.
                </Text>
                <Text
                  style={[s.body, { textAlign: "center", marginBottom: 24 }]}
                >
                  Missed words return in a minute. The others will bloom again
                  tomorrow.
                </Text>
                <Button
                  label="Back to the grove"
                  onPress={() => {
                    setQuestions([]);
                    setTab("Review");
                  }}
                />
              </View>
            ) : (
              questions[index] &&
              (() => {
                const q = questions[index];
                return (
                  <>
                    <View style={s.track}>
                      <View
                        style={[
                          s.fill,
                          { width: `${(index / questions.length) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={[s.eyebrow, { marginTop: 32 }]}>
                      {q.mode === "meaning"
                        ? "MEANING DETECTIVE"
                        : q.mode === "tone"
                          ? "FIND THE TONES"
                          : "LISTEN & RECOGNIZE"}
                    </Text>
                    <Text style={s.title}>
                      {q.mode === "meaning"
                        ? "What does this mean?"
                        : q.mode === "tone"
                          ? "Which pinyin is right?"
                          : "Which word do you hear?"}
                    </Text>
                    <View style={s.quizPrompt}>
                      {q.mode === "listening" ? (
                        <Pressable
                          accessibilityRole="button"

                          accessibilityLabel="Play listening question"
                          onPress={() => speak(q.word.hanzi)}
                          style={s.audioCircle}
                        >
                          <Icon name="volume-high" color={C.green} size={40} />
                        </Pressable>
                      ) : (
                        <Text
                          style={{
                            fontSize: 58,
                            color: C.ink,
                            fontWeight: "600",
                          }}
                        >
                          {q.word.hanzi}
                        </Text>
                      )}
                      {q.mode === "meaning" && <Pinyin word={q.word} large />}
                      {q.mode === "listening" && (
                        <Text style={s.caption}>
                          Tap to listen · replay anytime
                        </Text>
                      )}
                    </View>
                    {q.options.map((option, i) => {
                      const correct = chosen !== null && option === q.answer;
                      const wrong = chosen === option && !correct;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          key={option}

                          disabled={chosen !== null}
                          onPress={() => answer(option)}
                          style={[
                            s.option,
                            correct && s.correct,
                            wrong && s.wrong,
                          ]}
                        >
                          <Text style={s.optionLetter}>
                            {String.fromCharCode(65 + i)}
                          </Text>
                          <Text style={[s.optionText, { flex: 1 }]}>
                            {option}
                          </Text>
                          {correct && (
                            <Icon name="checkmark-circle" color={C.green} />
                          )}
                          {wrong && (
                            <Icon name="close-circle" color="#B94A43" />
                          )}
                        </Pressable>
                      );
                    })}
                    {chosen !== null && (
                      <View style={s.feedback}>
                        <Text style={s.cardTitle}>
                          {chosen === q.answer
                            ? "Lovely. That’s the one!"
                            : "A new chance to learn."}
                        </Text>
                        <Text style={[s.body, { marginTop: 6 }]}>
                          {q.word.hanzi} · {q.word.pinyin} · {q.word.meaning}
                        </Text>
                        <Button
                          label={
                            index === questions.length - 1
                              ? "See your growth →"
                              : "Next question →"
                          }
                          onPress={nextQuestion}
                        />
                      </View>
                    )}
                  </>
                );
              })()
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={reviewQueue.length > 0}
        animationType="slide"
        onRequestClose={() => setReviewQueue([])}
      >
        <SafeAreaView style={s.root}>
          <View style={s.modalHeader}>
            <Pressable
              accessibilityRole="button"

              accessibilityLabel="Close review"
              onPress={() => {
                setReviewQueue([]);
                void Speech.stop().catch(() => {});
              }}
              style={s.close}
            >
              <Icon name="close" />
            </Pressable>
            <Text style={s.eyebrow}>{reviewQueue.length} WORDS TO REFRESH</Text>
            <View style={s.close} />
          </View>
          {reviewQueue.length > 0 &&
            (() => {
              const w = words.find((v) => v.id === reviewQueue[0])!;
              return (
                <ScrollView
                  contentContainerStyle={[
                    s.content,
                    { flexGrow: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={[s.caption, { textAlign: "center" }]}>
                    Say the meaning before you reveal it.
                  </Text>
                  <View style={s.flashcard}>
                    <Hanzi word={w} size={72} />
                    {revealed ? (
                      <>
                        <Pinyin word={w} large />
                        <Text style={s.title}>{w.meaning}</Text>
                        <Pressable
                          accessibilityRole="button"

                          accessibilityLabel="Hear review word"
                          onPress={() => speak(w.hanzi)}
                          style={s.close}
                        >
                          <Icon name="volume-high" color={C.green} />
                        </Pressable>
                      </>
                    ) : (
                      <Text style={s.caption}>
                        Take a breath. Try to recall.
                      </Text>
                    )}
                  </View>
                  {revealed ? (
                    <>
                      <Text
                        style={[
                          s.caption,
                          { textAlign: "center", marginBottom: 12 },
                        ]}
                      >
                        How did that feel?
                      </Text>
                      <Button
                        light
                        label="Again · 1 minute"
                        onPress={() => review("again")}
                      />
                      <Button
                        label={`Good · ${schedule(p.cards[w.id], "good").interval} day(s)`}
                        onPress={() => review("good")}
                      />
                      <Button
                        light
                        label={`Easy · ${schedule(p.cards[w.id], "easy").interval} days`}
                        onPress={() => review("easy")}
                      />
                    </>
                  ) : (
                    <Button
                      label="Reveal meaning"
                      onPress={() => setRevealed(true)}
                    />
                  )}
                </ScrollView>
              );
            })()}
        </SafeAreaView>
      </Modal>
      {lesson === null && dictionary}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, width: "100%", maxWidth: 600, alignSelf: "center" },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 33,
    height: 33,
    borderRadius: 12,
    backgroundColor: "#E5EDDB",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.6,
  },
  streak: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    backgroundColor: "#F4EAD8",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  streakText: { color: "#986232", fontWeight: "700" },
  content: { padding: 24, paddingTop: 12, paddingBottom: 32 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: C.muted,
    lineHeight: 17,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 42,
    color: C.ink,
    marginTop: 12,
    marginBottom: 10,
  },
  subtitle: { fontSize: 14, lineHeight: 22, color: C.muted, marginBottom: 24 },
  hero: { borderRadius: 26, padding: 24, overflow: "hidden", marginBottom: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff18",
  },
  pillText: {
    fontSize: 9,
    color: "#E2F2CE",
    letterSpacing: 1.3,
    fontWeight: "700",
  },
  heroLabel: {
    fontSize: 31,
    color: "#F1F6E8",
    fontWeight: "600",
    marginTop: 24,
    letterSpacing: -1,
  },
  heroChinese: { fontSize: 21, color: "#DBF2A4", marginTop: 12 },
  heroCopy: {
    fontSize: 13,
    lineHeight: 21,
    color: "#C8D8CB",
    marginTop: 12,
    marginBottom: 24,
    maxWidth: 290,
  },
  heroArt: {
    position: "absolute",
    right: 14,
    top: 58,
    opacity: 0.28,
    transform: [{ rotate: "-12deg" }],
  },
  artSpark: {
    fontSize: 45,
    color: C.lime,
    position: "absolute",
    top: -25,
    right: 5,
  },
  heroCTA: {
    backgroundColor: C.lime,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroCTAText: { fontSize: 15, fontWeight: "700", color: C.ink },
  heroMeta: {
    fontSize: 9,
    color: "#B8CFBD",
    letterSpacing: 1.5,
    marginTop: 16,
    textAlign: "center",
  },
  stats: { flexDirection: "row", marginBottom: 24 },
  stat: { flex: 1, paddingLeft: 8, borderRightWidth: 1, borderColor: C.line },
  statNumber: {
    fontSize: 25,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 5,
  },
  statUnit: { fontSize: 12, color: C.muted, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 19, color: C.muted },
  goalCard: {
    backgroundColor: "#EDF1E5",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.ink, marginBottom: 3 },
  track: {
    height: 7,
    borderRadius: 9,
    backgroundColor: "#DFE6D4",
    overflow: "hidden",
    marginVertical: 14,
  },
  fill: { height: "100%", backgroundColor: "#669053", borderRadius: 9 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.5,
  },
  reviewBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  reviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EDF2E5",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  lessonEmoji: {
    width: 60,
    height: 68,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  note: { alignItems: "center", paddingTop: 28, paddingBottom: 8, gap: 6 },
  noteText: { fontSize: 15, color: C.green },
  nav: { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderColor: C.line },
  navInner: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4 },
  navIcon: {
    width: 54,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  navText: { fontSize: 10, color: C.muted },
  button: {
    backgroundColor: C.green,
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
  },
  lightButton: { backgroundColor: "#EAF0DE" },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  storyCover: { padding: 24, borderRadius: 24, marginBottom: 16 },
  sentence: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  pinyin: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  body: { fontSize: 15, color: C.ink, lineHeight: 22 },
  grammar: {
    backgroundColor: "#EAF0DD",
    padding: 20,
    borderRadius: 18,
    marginTop: 8,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  search: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    fontSize: 14,
    color: C.ink,
  },
  tones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
    marginBottom: 6,
  },
  title: {
    fontSize: 25,
    lineHeight: 33,
    fontWeight: "700",
    color: C.ink,
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  reviewHero: {
    alignItems: "center",
    padding: 26,
    backgroundColor: "#EDF2E2",
    borderRadius: 24,
  },
  bigNumber: { fontSize: 64, fontWeight: "700", color: C.green },
  center: { justifyContent: "center", alignItems: "center", padding: 24 },
  quizPrompt: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 170,
  },
  audioCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  option: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 62,
  },
  optionLetter: {
    fontSize: 12,
    color: C.muted,
    backgroundColor: C.bg,
    padding: 7,
    borderRadius: 8,
  },
  optionText: { fontSize: 17, color: C.ink },
  correct: { backgroundColor: "#E2F1D2", borderColor: "#7BA565" },
  wrong: { backgroundColor: "#F9E1DB", borderColor: "#CA8178" },
  feedback: {
    padding: 18,
    backgroundColor: "#EEF2E6",
    borderRadius: 18,
    marginTop: 10,
  },
  flashcard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    minHeight: 300,
    marginVertical: 24,
  },
  scrim: {
    flex: 1,
    backgroundColor: "#16271FCC",
    justifyContent: "center",
    padding: 24,
  },
  wordSheet: {
    padding: 26,
    borderRadius: 28,
    backgroundColor: C.bg,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  error: {
    padding: 12,
    backgroundColor: "#FFE9BC",
    marginHorizontal: 20,
    borderRadius: 10,
  },
});
