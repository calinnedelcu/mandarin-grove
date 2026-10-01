import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  displayText,
  Lesson,
  lessons,
  Level,
  topics,
  Word,
  words,
} from "./src/content";
import {
  activity,
  activeStreak,
  dayKey,
  emptyProgress,
  parseProgress,
  Practice,
  practicePool,
  Progress,
  recommend,
  reward,
  saveWord,
  schedule,
  searchWord,
  shuffle,
  strength,
  toggle,
} from "./src/learning";
import {
  Exercise,
  exerciseXP,
  readingExercises,
  sentenceExercises,
  Session,
  toneExercises,
  wordExercises,
} from "./src/exercises";
import { useSpeech } from "./src/useSpeech";
import {
  Button,
  C,
  Chip,
  GroveArt,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Pinyin,
  Section,
  s,
} from "./src/ui";
import { Onboarding, Preferences } from "./src/Onboarding";
import { Reader } from "./src/Reader";
import { WordSheet } from "./src/WordSheet";
import { Quiz } from "./src/Quiz";
import { MatchPairs } from "./src/MatchPairs";
const KEY = "mandarin-grove.v1";
type Tab = "Today" | "Stories" | "Review" | "Words" | "Progress";
function AppContent() {
  const [p, setP] = useState<Progress>(emptyProgress),
    [ready, setReady] = useState(false),
    [storageWritable, setStorageWritable] = useState(false),
    [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Today"),
    [lesson, setLesson] = useState<Lesson | null>(null),
    [word, setWord] = useState<Word | null>(null),
    [session, setSession] = useState<Session | null>(null),
    [pairs, setPairs] = useState<Word[] | null>(null),
    [reviewQueue, setReviewQueue] = useState<string[] | null>(null),
    [revealed, setRevealed] = useState(false);
  const [search, setSearch] = useState(""),
    [storySearch, setStorySearch] = useState(""),
    [levelFilter, setLevelFilter] = useState<number>(1),
    [topic, setTopic] = useState("All topics"),
    [libraryFilter, setLibraryFilter] = useState("All stories"),
    [wordFilter, setWordFilter] = useState("All words"),
    [wordLevel, setWordLevel] = useState(0),
    [wordLimit, setWordLimit] = useState(60);
  const [now, setNow] = useState(Date.now()),
    [settingsOpen, setSettingsOpen] = useState(false),
    [listening, setListening] = useState(false),
    [sleepMinutes, setSleepMinutes] = useState(0),
    [heatmapDay, setHeatmapDay] = useState(""),
    [notice, setNotice] = useState(""),
    [reducedMotion, setReducedMotion] = useState(false);
  const fade = useRef(new Animated.Value(1)).current,
    saveQueue = useRef(Promise.resolve()),
    writeAllowed = useRef(false),
    loadingRaw = useRef<string | null>(null),
    answerLock = useRef(false),
    activeState = useRef(AppState.currentState);
  const audio = useSpeech(p.settings.rate);
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        loadingRaw.current = raw;
        if (raw) {
          const parsed = parseProgress(raw);
          if (mounted) {
            setP(parsed);
            setLevelFilter(parsed.settings.level);
          }
        }
        writeAllowed.current = true;
        setStorageWritable(true);
      })
      .catch(async () => {
        // Keep the original snapshot, and only replace the live key if a recovery
        // copy was safely written. A failed read never silently overwrites data.
        if (loadingRaw.current)
          try {
            await AsyncStorage.setItem(`${KEY}.recovery`, loadingRaw.current);
            writeAllowed.current = true;
            setStorageWritable(true);
          } catch {}
        if (mounted)
          setError(
            loadingRaw.current
              ? "Saved data needs recovery. The original snapshot is kept under mandarin-grove.v1.recovery."
              : "Could not read device storage. Progress will stay in this session until storage works again.",
          );
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(setReducedMotion)
      .catch(() => {});
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => {
      mounted = false;
      motion.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready || !storageWritable || !writeAllowed.current) return;
    const snapshot = JSON.stringify(p);
    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(KEY, snapshot))
      .catch(() =>
        setError(
          "Progress could not be saved. Please check your available device storage.",
        ),
      );
  }, [p, ready, storageWritable]);
  useEffect(() => {
    fade.setValue(reducedMotion ? 1 : 0);
    if (!reducedMotion)
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
  }, [tab, reducedMotion]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    const sub = AppState.addEventListener("change", (state) => {
      activeState.current = state;
      if (state === "active") setNow(Date.now());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!lesson || session || pairs) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const ms = Date.now();
      if (activeState.current === "active") {
        const seconds = Math.min(15, Math.round((ms - last) / 1000));
        if (seconds) setP((prev) => activity(prev, { readSeconds: seconds }));
      }
      last = ms;
    }, 15000);
    return () => {
      clearInterval(timer);
      if (activeState.current === "active") {
        const seconds = Math.min(15, Math.round((Date.now() - last) / 1000));
        if (seconds) setP((prev) => activity(prev, { readSeconds: seconds }));
      }
    };
  }, [lesson?.id, session, pairs]);
  useEffect(() => {
    if (!listening || !sleepMinutes) return;
    const timer = setTimeout(() => {
      audio.stop();
      setNotice("Your listening sleep timer has finished.");
    }, sleepMinutes * 60000);
    return () => clearTimeout(timer);
  }, [listening, sleepMinutes]);
  const due = words
    .filter((w) => p.cards[w.id] && p.cards[w.id].due <= now)
    .sort((a, b) => p.cards[a.id].due - p.cards[b.id].due);
  const saved = words.filter((w) => p.cards[w.id]),
    daily = p.lastDay === dayKey(new Date(now)) ? p.dailyXP : 0,
    currentStreak = activeStreak(p, new Date(now)),
    today = recommend(p, lessons, new Date(now));
  const mastered = saved.filter((w) => strength(p.cards[w.id]) >= 75).length;
  const resume = lessons.find((l) => l.id === p.lastLesson);
  const practiceFallback = saved.length
    ? saved
    : words.filter((w) => w.level <= p.settings.level).slice(0, 20);
  function buzz(correct = true) {
    void Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
  }
  function plant(w: Word) {
    const plantedAt = Date.now();
    setP((prev) => saveWord(prev, w.id, plantedAt));
    setNow(plantedAt);
    setNotice(`${w.hanzi} is planted in your personal deck.`);
    buzz();
  }
  function openLesson(l: Lesson) {
    audio.stop();
    setWord(null);
    setLesson(l);
    setP((prev) => ({ ...prev, lastLesson: l.id }));
  }
  function closeLesson() {
    audio.stop();
    setLesson(null);
  }
  function launch(next: Session) {
    audio.stop();
    setLesson(null);
    setWord(null);
    setPairs(null);
    setSession(next);
  }
  function wordQuiz(
    pool: Word[],
    mode?: Parameters<typeof wordExercises>[1],
    lessonId: string | null = null,
    title = "Meaning, tones & listening",
    zen = false,
    timed = false,
  ) {
    if (!pool.length) {
      setNotice(
        "No words in this group yet. Save a few words from a story first.",
      );
      return;
    }
    launch({
      exercises: wordExercises(pool, mode),
      title,
      lessonId,
      zen,
      timed,
    });
  }
  function onAnswer(correct: boolean, q: Exercise) {
    const at = Date.now();
    setP((prev) => {
      let next = activity(reward(prev, correct ? exerciseXP(q.mode) : 2), {
        answered: 1,
        correct: correct ? 1 : 0,
      });
      if (q.word)
        next = {
          ...next,
          cards: {
            ...next.cards,
            [q.word.id]: schedule(
              next.cards[q.word.id],
              correct ? "good" : "again",
              at,
            ),
          },
        };
      if (q.mode === "tone" || q.mode === "tone-hearing")
        next = {
          ...next,
          toneAttempts: next.toneAttempts + 1,
          toneCorrect: next.toneCorrect + (correct ? 1 : 0),
        };
      return next;
    });
    setNow(at);
    buzz(correct);
  }
  function quizComplete(
    score: number,
    total: number,
    lessonId: string | null,
    mode: string,
    timed = false,
  ) {
    setP((prev) => {
      let next = {
        ...prev,
        quizzes: [
          ...prev.quizzes,
          { score, total, lessonId, mode, day: dayKey() },
        ].slice(-200),
        bestSprint: timed ? Math.max(prev.bestSprint, score) : prev.bestSprint,
      };
      if (lessonId && !prev.completed.includes(lessonId)) {
        next = activity(
          { ...reward(next, 25), completed: [...prev.completed, lessonId] },
          { stories: 1 },
        );
      }
      return next;
    });
    buzz();
  }
  function written(char: string) {
    setP((prev) => ({
      ...(!prev.writing[char] ? reward(prev, 8) : prev),
      writing: { ...prev.writing, [char]: (prev.writing[char] || 0) + 1 },
    }));
    setNotice(`Beautifully written: ${char}`);
    buzz();
  }
  function gradeReview(grade: "again" | "good" | "easy") {
    if (answerLock.current || !reviewQueue?.length) return;
    answerLock.current = true;
    const id = reviewQueue[0];
    setP((prev) =>
      activity(
        {
          ...reward(prev, grade === "again" ? 2 : 8),
          cards: { ...prev.cards, [id]: schedule(prev.cards[id], grade) },
        },
        { reviews: 1 },
      ),
    );
    setReviewQueue((q) => q!.slice(1));
    setRevealed(false);
    setNow(Date.now());
    buzz(grade !== "again");
  }
  useEffect(() => {
    answerLock.current = false;
  }, [reviewQueue?.[0]]);
  function storyCard(l: Lesson) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${l.title} · HSK ${l.level}`}
        key={l.id}
        onPress={() => openLesson(l)}
        style={({ pressed }) => [s.storyRow, { opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={[s.storyEmoji, { backgroundColor: l.color }]}>
          <Text style={{ fontSize: 30 }}>{l.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>
            HSK {l.level} · {l.topic.toUpperCase()}
          </Text>
          <Text style={s.cardTitle}>{l.title}</Text>
          <Text style={s.caption}>
            {l.format} · {l.words.length} key words
          </Text>
        </View>
        <Icon
          name={
            p.completed.includes(l.id)
              ? "checkmark-circle"
              : p.bookmarks.includes(l.id)
                ? "bookmark"
                : "chevron-forward"
          }
          color={C.green}
        />
      </Pressable>
    );
  }
  function startListening() {
    audio.stop();
    const playlist = shuffle(
      lessons.filter((l) => l.level === p.settings.level),
    );
    setListening(true);
    audio.play(
      playlist.flatMap((l) =>
        l.story.map((line, i) => ({
          text: line.text,
          lessonId: l.id,
          line: i,
        })),
      ),
    );
  }
  function stopListening() {
    audio.stop();
    setListening(false);
    setSleepMinutes(0);
  }
  if (!ready)
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <GroveArt small />
        <Text style={s.title}>Growing your grove…</Text>
      </SafeAreaView>
    );
  if (!p.onboarded)
    return (
      <Onboarding
        initial={p.settings}
        onFinish={(settings) => {
          setP((prev) => ({ ...prev, onboarded: true, settings }));
          setLevelFilter(settings.level);
        }}
      />
    );
  const library = lessons.filter(
    (l) =>
      (!levelFilter || l.level === levelFilter) &&
      (topic === "All topics" || l.topic === topic) &&
      (libraryFilter !== "Bookmarked" || p.bookmarks.includes(l.id)) &&
      (libraryFilter !== "Completed" || p.completed.includes(l.id)) &&
      `${l.title} ${l.subtitle} ${l.topic} ${l.story.map((s) => s.text).join("")}`
        .toLowerCase()
        .includes(storySearch.trim().toLowerCase()),
  );
  const dictionary = words.filter(
    (w) =>
      (!wordLevel || w.level === wordLevel) &&
      (wordFilter !== "My deck" || p.cards[w.id]) &&
      (wordFilter !== "Strong words" || strength(p.cards[w.id]) >= 75) &&
      searchWord(w, search),
  );
  const currentWord = reviewQueue?.length
    ? words.find((w) => w.id === reviewQueue[0])
    : null;
  const totals = Object.values(p.activity).reduce(
    (a, b) => ({
      readSeconds: a.readSeconds + b.readSeconds,
      reviews: a.reviews + b.reviews,
    }),
    { readSeconds: 0, reviews: 0 },
  );
  const attempts = p.quizzes.reduce((n, q) => n + q.total, 0),
    correct = p.quizzes.reduce((n, q) => n + q.score, 0);
  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={s.shell}>
        <View style={s.header}>
          <View style={[s.row, { justifyContent: "flex-start" }]}>
            <View style={s.logo}>
              <Icon name="leaf" size={20} color={C.green} />
            </View>
            <Text style={s.brand}>
              mandarin <Text style={{ fontWeight: "400" }}>grove</Text>
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${currentStreak} day streak. View progress`}
            style={[s.row, s.badge, { gap: 5 }]}
            onPress={() => setTab("Progress")}
          >
            <Icon name="flame" color="#B67A37" size={17} />
            <Text style={[s.cardTitle, { fontSize: 13 }]}>{currentStreak}</Text>
          </Pressable>
        </View>
        {error && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setError("")}
            style={s.error}
          >
            <Text style={s.body}>{error} Tap to dismiss.</Text>
          </Pressable>
        )}
        {(notice || audio.error) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notice"
            onPress={() => {
              setNotice("");
              audio.clearError();
            }}
            style={[s.notice, { margin: 12, marginBottom: 0 }]}
          >
            <Text accessibilityLiveRegion="polite" style={s.caption}>
              {notice || audio.error}
            </Text>
          </Pressable>
        )}
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fade,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
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
                  Your Mandarin,{`\n`}
                  <Text style={{ color: C.green }}>blooming.</Text>
                </Text>
                <Text style={s.subtitle}>
                  Small stories. Real understanding. Your pace.
                </Text>
                <LinearGradient
                  colors={["#285E45", "#193F30"]}
                  style={[s.cover, { padding: 22 }]}
                >
                  <View style={s.row}>
                    <View style={s.pill}>
                      <Text style={[s.eyebrow, { color: "#E1EBCA" }]}>
                        YOUR DAILY MOMENT
                      </Text>
                    </View>
                    <Text style={{ color: C.lime, fontSize: 23 }}>✦</Text>
                  </View>
                  <View
                    style={[s.row, { alignItems: "center", marginTop: 17 }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 30,
                          lineHeight: 37,
                          color: "#fff",
                          fontWeight: "700",
                          letterSpacing: -0.9,
                        }}
                      >
                        {today.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: 22,
                          color: "#D0DDC9",
                          marginTop: 10,
                        }}
                      >
                        {today.subtitle}
                      </Text>
                    </View>
                    <GroveArt small />
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      lineHeight: 35,
                      color: C.lime,
                      marginTop: 18,
                    }}
                  >
                    {today.story[0].text}
                  </Text>
                  <Button
                    light
                    label="Read today's story"
                    onPress={() => openLesson(today)}
                  />
                  <Text
                    style={[
                      s.eyebrow,
                      { color: "#D0DDC9", marginTop: 12, letterSpacing: 0.9 },
                    ]}
                  >
                    HSK {today.level} · {today.topic.toUpperCase()} · ORIGINAL
                    PRACTICE
                  </Text>
                </LinearGradient>
                <View style={s.stats}>
                  {[
                    [`${p.xp}`, "XP earned"],
                    [`${saved.length}`, "words planted"],
                    [`${p.completed.length}`, "stories explored"],
                  ].map(([number, label]) => (
                    <View key={label}>
                      <Text style={s.statNumber}>{number}</Text>
                      <Text style={s.caption}>{label}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.card}>
                  <View style={s.row}>
                    <Text style={s.cardTitle}>
                      {daily >= p.settings.dailyGoal
                        ? "A lovely day of growth ✨"
                        : "Your daily bloom"}
                    </Text>
                    <Text style={s.caption}>
                      {Math.min(daily, p.settings.dailyGoal)} /{" "}
                      {p.settings.dailyGoal} XP
                    </Text>
                  </View>
                  <Meter value={(daily / p.settings.dailyGoal) * 100} />
                  <Text style={s.caption}>
                    Read a little. Remember a little. Let it stick.
                  </Text>
                </View>
                {resume && !p.completed.includes(resume.id) && (
                  <>
                    <Section title="Pick up where you left off" />
                    {storyCard(resume)}
                  </>
                )}
                <Section
                  title="Keep your words growing"
                  caption={`${due.length} ready`}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTab("Review")}
                  style={s.storyRow}
                >
                  <View style={s.logo}>
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
                        : "Tap a story word and save it for later."}
                    </Text>
                  </View>
                  <Icon name="arrow-forward" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start Grove Radio"
                  onPress={startListening}
                  style={[s.storyRow, { backgroundColor: "#EBEFDF" }]}
                >
                  <Icon name="headset-outline" color={C.green} size={28} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>Grove Radio</Text>
                    <Text style={s.caption}>
                      Your level. Your pace. Just press play.
                    </Text>
                  </View>
                  <Icon name="play-circle" color={C.green} />
                </Pressable>
                <Section
                  title={
                    p.settings.level === 1
                      ? "Your first chapters"
                      : "A little more to discover"
                  }
                  caption={`HSK ${p.settings.level}`}
                />
                {lessons
                  .filter((l) => l.level === p.settings.level)
                  .slice(0, 3)
                  .map(storyCard)}
                <View style={[s.center, { paddingVertical: 20 }]}>
                  <Text style={[s.body, { color: C.green }]}>
                    慢慢来 · màn màn lái
                  </Text>
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
                  Little stories.{`\n`}Big discoveries.
                </Text>
                <Text style={s.subtitle}>
                  42 original readings. Everyday worlds, at HSK 1–3.
                </Text>
                <TextInput
                  accessibilityLabel="Search stories"
                  value={storySearch}
                  onChangeText={setStorySearch}
                  style={s.search}
                  placeholder="Find a story or a topic"
                  placeholderTextColor={C.muted}
                />
                <View style={[s.wrap, { marginBottom: 12 }]}>
                  {[0, 1, 2, 3].map((level) => (
                    <Chip
                      key={level}
                      label={level ? `HSK ${level}` : "All levels"}
                      selected={levelFilter === level}
                      onPress={() => setLevelFilter(level)}
                    />
                  ))}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 14 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {["All topics", ...topics].map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={topic === t}
                      onPress={() => setTopic(t)}
                    />
                  ))}
                </ScrollView>
                <View style={[s.wrap, { marginBottom: 18 }]}>
                  {["All stories", "Bookmarked", "Completed"].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter}
                      selected={libraryFilter === filter}
                      onPress={() => setLibraryFilter(filter)}
                    />
                  ))}
                </View>
                <Text style={[s.caption, { marginBottom: 12 }]}>
                  {library.length} readings · switch levels inside a story
                </Text>
                {library.map(storyCard)}
                {!library.length && (
                  <View style={s.empty}>
                    <Text style={{ fontSize: 40 }}>🍃</Text>
                    <Text style={s.cardTitle}>A little room for curiosity</Text>
                    <Text style={s.caption}>
                      Try another filter, or bookmark a story you love.
                    </Text>
                    <Button
                      light
                      label="Show all stories"
                      onPress={() => {
                        setLevelFilter(0);
                        setTopic("All topics");
                        setLibraryFilter("All stories");
                        setStorySearch("");
                      }}
                    />
                  </View>
                )}
                <View style={s.notice}>
                  <Text style={s.cardTitle}>Context makes it click.</Text>
                  <Text style={s.body}>
                    Read, tap a word, listen, then check what stayed with you.
                    News-style scenes are original learning content, with a
                    visible added date.
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
                <View style={[s.card, s.center]}>
                  <Text style={{ fontSize: 45 }}>🌱</Text>
                  <Text style={[s.heroTitle, { fontSize: 48 }]}>
                    {due.length}
                  </Text>
                  <Text style={s.cardTitle}>words ready to refresh</Text>
                  <Text style={s.caption}>
                    {saved.length} planted · {mastered} taking root
                  </Text>
                  <View style={{ width: "100%" }}>
                    <Button
                      label={
                        due.length
                          ? "Start spaced review →"
                          : "Explore a story →"
                      }
                      onPress={() => {
                        audio.stop();
                        if (due.length) {
                          setReviewQueue(due.map((w) => w.id));
                          setRevealed(false);
                        } else setTab("Stories");
                      }}
                    />
                  </View>
                </View>
                <Section
                  title="Choose your rhythm"
                  caption="7 WAYS TO PRACTICE"
                />
                <View style={[s.wrap, { marginBottom: 12 }]}>
                  {(
                    [
                      "Learn new",
                      "Practice weak",
                      "Reinforce",
                      "Retain",
                      "Mixed practice",
                      "Daily review",
                      "Zen mode",
                    ] as Practice[]
                  ).map((mode) => (
                    <Chip
                      key={mode}
                      label={mode}
                      onPress={() =>
                        wordQuiz(
                          practicePool(p, mode, now),
                          undefined,
                          null,
                          mode,
                          mode === "Zen mode",
                        )
                      }
                    />
                  ))}
                </View>
                <Section title="A little challenge" />
                {[
                  [
                    "Meaning detective",
                    "Connect characters to meaning.",
                    "language-outline",
                    () => wordQuiz(practiceFallback, "meaning"),
                  ],
                  [
                    "Find the right tones",
                    "Same syllables. Different tones.",
                    "musical-notes-outline",
                    () =>
                      wordQuiz(
                        practiceFallback,
                        "tone",
                        null,
                        "Find the tones",
                      ),
                  ],
                  [
                    "Listen & recognize",
                    "Hear a word. Find its characters.",
                    "headset-outline",
                    () => wordQuiz(practiceFallback, "listening"),
                  ],
                  [
                    "Recall the characters",
                    "See a meaning. Find the word.",
                    "swap-horizontal-outline",
                    () => wordQuiz(practiceFallback, "reverse"),
                  ],
                  [
                    "Pinyin recall",
                    "Write the tones you remember.",
                    "pencil-outline",
                    () => wordQuiz(practiceFallback, "typing"),
                  ],
                  [
                    "Match pairs",
                    "Four words, four familiar meanings.",
                    "grid-outline",
                    () => {
                      audio.stop();
                      setPairs(practiceFallback);
                    },
                  ],
                  [
                    "Keyword sprint",
                    "60 seconds with your weakest words.",
                    "timer-outline",
                    () =>
                      wordQuiz(
                        practicePool(p, "Practice weak").length
                          ? practicePool(p, "Practice weak")
                          : practiceFallback,
                        "meaning",
                        null,
                        "Keyword sprint",
                        false,
                        true,
                      ),
                  ],
                ].map(([title, caption, icon, action]) => (
                  <Pressable
                    key={title as string}
                    accessibilityRole="button"
                    accessibilityLabel={title as string}
                    style={s.storyRow}
                    onPress={action as () => void}
                  >
                    <View style={s.logo}>
                      <Icon
                        name={icon as React.ComponentProps<typeof Icon>["name"]}
                        color={C.green}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{title as string}</Text>
                      <Text style={s.caption}>{caption as string}</Text>
                    </View>
                    <Icon name="chevron-forward" />
                  </Pressable>
                ))}
                <Section title="Let your ear lead" />
                <View style={s.card}>
                  <Text style={s.cardTitle}>Tone studio</Text>
                  <View style={[s.row, { marginVertical: 16 }]}>
                    {[
                      ["ˉ", "1 · high"],
                      ["↗", "2 · rising"],
                      ["ˇ", "3 · dipping"],
                      ["↘", "4 · falling"],
                      ["·", "neutral"],
                    ].map(([mark, label]) => (
                      <View key={label} style={s.center}>
                        <Text style={s.toneMark}>{mark}</Text>
                        <Text style={[s.caption, { fontSize: 10 }]}>
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.body}>
                    Listen to a single syllable and name its tone. A third tone
                    often sounds low; the full dip is clearest in isolation.
                  </Text>
                  <Button
                    label="Hear & name the tone →"
                    onPress={() =>
                      launch({
                        title: "Tone studio",
                        lessonId: null,
                        exercises: toneExercises(p.settings.level),
                      })
                    }
                  />
                </View>
                <Section title="Build it. Say it. Remember it." />
                <Text style={s.caption}>
                  Practice sentences from {resume?.title || today.title}.
                </Text>
                <Button
                  light
                  label="Sentence building →"
                  onPress={() =>
                    launch({
                      title: "Sentence building",
                      lessonId: null,
                      exercises: sentenceExercises(resume || today, "build"),
                    })
                  }
                />
                <Button
                  light
                  label="Sentence writing →"
                  onPress={() =>
                    launch({
                      title: "Sentence writing",
                      lessonId: null,
                      exercises: sentenceExercises(resume || today, "write"),
                    })
                  }
                />
                {!!p.grammarSaved.length && (
                  <>
                    <Section
                      title="Patterns you kept"
                      caption={`${p.grammarSaved.length} saved`}
                    />
                    {lessons
                      .filter((l) => p.grammarSaved.includes(l.id))
                      .map((l) => (
                        <View key={l.id} style={s.card}>
                          <Text style={s.cardTitle}>{l.title}</Text>
                          <Text style={[s.body, { marginTop: 8 }]}>
                            {l.grammar}
                          </Text>
                          <Button
                            light
                            label={`Revisit ${l.title}`}
                            onPress={() => openLesson(l)}
                          />
                        </View>
                      ))}
                  </>
                )}
                <Text style={[s.caption, { marginTop: 22 }]}>
                  Again: 1 minute · Good: at least 1 day · Easy: at least 4
                  days. Successful reviews extend the interval, up to one year.
                </Text>
              </>
            )}
            {tab === "Words" && (
              <>
                <Text style={s.eyebrow}>YOUR POCKET MANDARIN COMPANION</Text>
                <Text style={s.heroTitle}>
                  {words.length} little{`\n`}possibilities.
                </Text>
                <Text style={s.subtitle}>
                  Tap a word. Hear it. Keep it. Watch it grow.
                </Text>
                <TextInput
                  accessibilityLabel="Search vocabulary"
                  placeholder="Hanzi, pinyin, or English"
                  placeholderTextColor={C.muted}
                  value={search}
                  onChangeText={(v) => {
                    setSearch(v);
                    setWordLimit(60);
                  }}
                  style={s.search}
                />
                <View style={[s.wrap, { marginBottom: 12 }]}>
                  {["All words", "My deck", "Strong words"].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter}
                      selected={wordFilter === filter}
                      onPress={() => {
                        setWordFilter(filter);
                        setWordLimit(60);
                      }}
                    />
                  ))}
                </View>
                <View style={[s.wrap, { marginBottom: 14 }]}>
                  {[0, 1, 2, 3].map((level) => (
                    <Chip
                      key={level}
                      label={level ? `HSK ${level}` : "All levels"}
                      selected={wordLevel === level}
                      onPress={() => {
                        setWordLevel(level);
                        setWordLimit(60);
                      }}
                    />
                  ))}
                </View>
                <Text style={s.caption}>
                  {dictionary.length} words · dictionary tones shown in color
                </Text>
                {dictionary.slice(0, wordLimit).map((w) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Word ${w.hanzi}`}
                    key={w.id}
                    style={s.wordRow}
                    onPress={() => {
                      audio.stop();
                      setWord(w);
                    }}
                  >
                    <View style={{ width: 105 }}>
                      <Hanzi
                        word={w}
                        size={25}
                        traditional={p.settings.traditional}
                      />
                      <Pinyin word={w} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.body}>{w.meaning}</Text>
                      <Text style={s.caption}>
                        HSK {w.level}
                        {p.cards[w.id]
                          ? ` · ${strength(p.cards[w.id])}% strength`
                          : ""}
                      </Text>
                    </View>
                    <Icon
                      name={
                        p.cards[w.id] ? "leaf-outline" : "add-circle-outline"
                      }
                      color={C.green}
                    />
                  </Pressable>
                ))}
                {dictionary.length > wordLimit && (
                  <Button
                    light
                    label={`Show more words (${dictionary.length - wordLimit} left)`}
                    onPress={() => setWordLimit((v) => v + 60)}
                  />
                )}{" "}
                {!dictionary.length && (
                  <View style={s.empty}>
                    <Text style={{ fontSize: 38 }}>🌿</Text>
                    <Text style={s.cardTitle}>No words here yet</Text>
                    <Text style={s.caption}>
                      Try another search or save a word from a story.
                    </Text>
                  </View>
                )}
              </>
            )}
            {tab === "Progress" && (
              <>
                <Text style={s.eyebrow}>LOOK HOW FAR YOUR LITTLE STEPS GO</Text>
                <Text style={s.heroTitle}>A grove of{`\n`}your own.</Text>
                <Text style={s.subtitle}>
                  Progress is what you understand and remember.
                </Text>
                <View style={[s.cover, { backgroundColor: C.green }]}>
                  <View style={s.row}>
                    <View>
                      <Text
                        style={{
                          fontSize: 40,
                          color: C.lime,
                          fontWeight: "700",
                        }}
                      >
                        {p.xp} XP
                      </Text>
                      <Text style={{ color: "#DFE8D0", marginTop: 8 }}>
                        {p.xp < 250
                          ? "A new seedling"
                          : p.xp < 1000
                            ? "Taking root"
                            : p.xp < 3000
                              ? "Growing branches"
                              : "A flourishing grove"}
                      </Text>
                    </View>
                    <GroveArt small />
                  </View>
                  <Meter value={((p.xp % 250) / 250) * 100} />
                  <Text style={{ color: "#DFE8D0", fontSize: 12 }}>
                    {250 - (p.xp % 250)} XP to your next growth milestone
                  </Text>
                </View>
                <View style={[s.row, { marginBottom: 14 }]}>
                  <View style={s.statCard}>
                    <Text style={s.statNumber}>{currentStreak}</Text>
                    <Text style={s.caption}>day streak</Text>
                  </View>
                  <View style={s.statCard}>
                    <Text style={s.statNumber}>{mastered}</Text>
                    <Text style={s.caption}>strong words</Text>
                  </View>
                  <View style={s.statCard}>
                    <Text style={s.statNumber}>{p.completed.length}</Text>
                    <Text style={s.caption}>readings explored</Text>
                  </View>
                </View>
                <View style={s.card}>
                  <View style={s.row}>
                    <Text style={s.cardTitle}>Your daily bloom</Text>
                    <Text style={s.caption}>
                      {daily} / {p.settings.dailyGoal} XP
                    </Text>
                  </View>
                  <Meter value={(daily / p.settings.dailyGoal) * 100} />
                  <Text style={s.caption}>
                    A missed day starts a fresh streak. Your words and XP always
                    stay.
                  </Text>
                </View>
                <Section title="The last four weeks" />
                <View style={s.card}>
                  <View style={s.wrap}>
                    {Array.from({ length: 28 }, (_, i) => {
                      const d = new Date(now);
                      d.setDate(d.getDate() - 27 + i);
                      const key = dayKey(d),
                        xp = p.activity[key]?.xp || 0;
                      return (
                        <Pressable
                          key={key}
                          accessibilityRole="button"
                          accessibilityLabel={`${key}: ${xp} XP`}
                          onPress={() => setHeatmapDay(key)}
                          style={{
                            width: "12%",
                            height: 30,
                            borderRadius: 7,
                            backgroundColor:
                              xp >= p.settings.dailyGoal
                                ? C.green
                                : xp
                                  ? "#B9D69A"
                                  : "#EEF1E8",
                            marginBottom: 2,
                          }}
                        />
                      );
                    })}
                  </View>
                  <Text style={[s.caption, { marginTop: 12 }]}>
                    {heatmapDay
                      ? `${heatmapDay} · ${p.activity[heatmapDay]?.xp || 0} XP · ${p.activity[heatmapDay]?.reviews || 0} reviews`
                      : "Tap a day to see its little steps. Dark green means goal met."}
                  </Text>
                </View>
                <Section title="Your Mandarin, in numbers" />
                <View style={s.card}>
                  {[
                    [`${saved.length} / ${words.length}`, "words planted"],
                    [
                      `${Math.floor(totals.readSeconds / 60)} min`,
                      "reading time",
                    ],
                    [`${totals.reviews}`, "recall reviews"],
                    [
                      attempts
                        ? `${Math.round((correct / attempts) * 100)}%`
                        : "—",
                      "quiz accuracy",
                    ],
                    [
                      p.toneAttempts
                        ? `${Math.round((p.toneCorrect / p.toneAttempts) * 100)}%`
                        : "—",
                      "tone accuracy",
                    ],
                    [`${p.bestSprint}`, "best keyword sprint"],
                    [`${Object.keys(p.writing).length}`, "characters traced"],
                  ].map(([value, label]) => (
                    <View key={label} style={[s.row, { paddingVertical: 10 }]}>
                      <Text style={s.body}>{label}</Text>
                      <Text style={s.cardTitle}>{value}</Text>
                    </View>
                  ))}
                </View>
                <Section title="Your three stepping stones" />
                {([1, 2, 3] as Level[]).map((level) => {
                  const pool = words.filter((w) => w.level === level),
                    grown = pool.filter((w) => p.cards[w.id]).length;
                  return (
                    <View key={level} style={s.card}>
                      <View style={s.row}>
                        <Text style={s.cardTitle}>HSK {level}</Text>
                        <Text style={s.caption}>
                          {grown} / {pool.length} words planted
                        </Text>
                      </View>
                      <Meter value={(grown / pool.length) * 100} />
                      <Text style={s.caption}>
                        {
                          lessons.filter(
                            (l) =>
                              l.level === level && p.completed.includes(l.id),
                          ).length
                        }{" "}
                        of {lessons.filter((l) => l.level === level).length}{" "}
                        readings explored
                      </Text>
                    </View>
                  );
                })}
                <Section title="Little milestones" />
                <View style={s.wrap}>
                  {[
                    ["🌱", "First word", saved.length > 0],
                    ["📖", "First story", p.completed.length > 0],
                    ["🔥", "Three-day ritual", currentStreak >= 3],
                    ["🌳", "50 words", saved.length >= 50],
                    ["🎵", "Tone explorer", p.toneCorrect >= 10],
                    [
                      "✍️",
                      "Character gardener",
                      Object.keys(p.writing).length >= 5,
                    ],
                  ].map(([emoji, label, earned]) => (
                    <View
                      key={label as string}
                      style={[
                        s.badge,
                        { padding: 13, opacity: earned ? 1 : 0.5 },
                      ]}
                    >
                      <Text style={s.caption}>
                        {emoji as string} {label as string}
                        {earned ? " ✓" : ""}
                      </Text>
                    </View>
                  ))}
                </View>
                <Section title="Make it comfortable" />
                <Button
                  light
                  label="Change level, goal & interests"
                  onPress={() => setSettingsOpen(true)}
                />
                <Text style={[s.caption, { marginTop: 20 }]}>
                  Your progress is saved on this device. No account,
                  subscription, keys, or paid API. The course uses the familiar
                  HSK 2.0 level 1–3 scope, plus a few beginner building blocks.
                </Text>
              </>
            )}
          </Animated.View>
        </ScrollView>
        <SafeAreaView edges={["bottom"]} style={s.nav}>
          <View style={s.navInner}>
            {(["Today", "Stories", "Review", "Words", "Progress"] as Tab[]).map(
              (t, i) => (
                <Pressable
                  key={t}
                  accessibilityRole="tab"
                  accessibilityLabel={t}
                  accessibilityState={{ selected: tab === t }}
                  aria-selected={tab === t}
                  onPress={() => {
                    audio.stop();
                    setTab(t);
                    setWord(null);
                  }}
                  style={s.navItem}
                >
                  <View
                    style={[
                      s.navIcon,
                      tab === t && { backgroundColor: C.lime },
                    ]}
                  >
                    <Icon
                      name={
                        (
                          [
                            "sunny-outline",
                            "book-outline",
                            "leaf-outline",
                            "grid-outline",
                            "stats-chart-outline",
                          ] as const
                        )[i]
                      }
                      color={tab === t ? C.green : C.muted}
                      size={21}
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
              ),
            )}
          </View>
        </SafeAreaView>
        {word && (
          <WordSheet
            word={word}
            p={p}
            audio={audio}
            onSave={() => plant(word)}
            onClose={() => {
              setWord(null);
              audio.stop();
            }}
            onWrite={written}
          />
        )}
      </View>
      {lesson && (
        <Reader
          lesson={lesson}
          p={p}
          audio={audio}
          onClose={closeLesson}
          onLesson={openLesson}
          onProgress={setP}
          onWordSave={plant}
          onWrite={written}
          onQuiz={() => wordQuiz(lesson.words, undefined, lesson.id)}
          onComprehension={() =>
            launch({
              title: "Story comprehension",
              lessonId: lesson.id,
              exercises: readingExercises(lesson),
            })
          }
        />
      )}
      {session && (
        <Quiz
          session={session}
          audio={audio}
          onAnswer={onAnswer}
          onComplete={(score, total) =>
            quizComplete(
              score,
              total,
              session.lessonId,
              session.title,
              session.timed,
            )
          }
          onClose={() => {
            audio.stop();
            setSession(null);
            setTab("Review");
          }}
        />
      )}
      {pairs && (
        <MatchPairs
          pool={pairs}
          onAnswer={(correct, word) =>
            onAnswer(correct, {
              mode: "match",
              word,
              prompt: "",
              options: [],
              answer: word.meaning,
              explanation: "",
            })
          }
          onComplete={(score, total) =>
            quizComplete(score, total, null, "Match pairs")
          }
          onClose={() => {
            setPairs(null);
            audio.stop();
          }}
        />
      )}
      <Modal
        visible={reviewQueue !== null}
        animationType="slide"
        onRequestClose={() => {
          setReviewQueue(null);
          audio.stop();
        }}
      >
        <SafeAreaView style={s.root}>
          <View style={s.shell}>
            <View style={s.modalHeader}>
              <IconButton
                name="close"
                label="Close spaced review"
                onPress={() => {
                  setReviewQueue(null);
                  audio.stop();
                }}
              />
              <Text style={s.eyebrow}>RECALL BEFORE YOU REVEAL</Text>
              <Text style={s.caption}>{reviewQueue?.length || 0} left</Text>
            </View>
            <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
              {currentWord ? (
                <>
                  <View style={[s.card, s.center, { paddingVertical: 40 }]}>
                    <Text style={s.eyebrow}>WHAT DOES THIS WORD MEAN?</Text>
                    <Hanzi
                      word={currentWord}
                      size={68}
                      traditional={p.settings.traditional}
                      colored={false}
                    />
                    {revealed && (
                      <>
                        <Pinyin word={currentWord} large />
                        <Text style={[s.title, { textAlign: "center" }]}>
                          {currentWord.meaning}
                        </Text>
                        <Meter value={strength(p.cards[currentWord.id])} />
                      </>
                    )}
                  </View>
                  <Button
                    light
                    label="Listen to review word"
                    onPress={() => audio.say(currentWord.hanzi)}
                  />
                  {revealed ? (
                    <>
                      <Text
                        style={[
                          s.caption,
                          { textAlign: "center", marginTop: 18 },
                        ]}
                      >
                        Be kind, and be honest with your memory.
                      </Text>
                      <Button
                        light
                        label="Again · 1 minute"
                        onPress={() => gradeReview("again")}
                      />
                      <Button
                        label={`Good · ${schedule(p.cards[currentWord.id], "good").interval} day(s)`}
                        onPress={() => gradeReview("good")}
                      />
                      <Button
                        light
                        label={`Easy · ${schedule(p.cards[currentWord.id], "easy").interval} day(s)`}
                        onPress={() => gradeReview("easy")}
                      />
                    </>
                  ) : (
                    <Button
                      label="Reveal meaning"
                      onPress={() => setRevealed(true)}
                    />
                  )}
                </>
              ) : (
                <View style={[s.center, { flex: 1, paddingVertical: 70 }]}>
                  <Text style={{ fontSize: 68 }}>🌿</Text>
                  <Text style={s.heroTitle}>Freshly watered.</Text>
                  <Text style={s.subtitle}>
                    Your words have a little room to grow.
                  </Text>
                  <Button
                    label="Back to the grove"
                    onPress={() => setReviewQueue(null)}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={settingsOpen}
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <SafeAreaView style={s.root}>
          <View style={s.shell}>
            <View style={s.modalHeader}>
              <IconButton
                name="close"
                label="Close preferences"
                onPress={() => setSettingsOpen(false)}
              />
              <Text style={s.eyebrow}>YOUR GROVE, YOUR PACE</Text>
              <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={s.content}>
              <Text style={[s.heroTitle, { marginBottom: 24 }]}>
                Make it yours.
              </Text>
              <Preferences
                settings={p.settings}
                onChange={(settings) => {
                  setP((prev) => ({ ...prev, settings }));
                  setLevelFilter(settings.level);
                }}
              />
              <Button label="Done →" onPress={() => setSettingsOpen(false)} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={listening}
        animationType="slide"
        onRequestClose={stopListening}
      >
        <SafeAreaView style={s.root}>
          <View style={s.shell}>
            <View style={s.modalHeader}>
              <IconButton
                name="close"
                label="Close Grove Radio"
                onPress={stopListening}
              />
              <Text style={s.eyebrow}>GROVE RADIO</Text>
              <Text style={s.caption}>HSK {p.settings.level}</Text>
            </View>
            <ScrollView contentContainerStyle={s.content}>
              {(() => {
                const playingLesson = lessons.find(
                  (l) => l.id === audio.current?.lessonId,
                );
                return (
                  <>
                    <View
                      style={[
                        s.cover,
                        s.center,
                        { backgroundColor: C.green, paddingVertical: 34 },
                      ]}
                    >
                      <GroveArt />
                      <Text
                        style={{
                          fontSize: 28,
                          color: "#fff",
                          fontWeight: "700",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        {playingLesson?.title || "Your listening moment"}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#DCE8CD" }}>
                        A local playlist at your level
                      </Text>
                    </View>
                    <Text
                      style={[
                        s.title,
                        { textAlign: "center", marginVertical: 16 },
                      ]}
                    >
                      {audio.current?.text || "Press play to begin."}
                    </Text>
                    <View
                      style={[s.row, { justifyContent: "center", gap: 20 }]}
                    >
                      <IconButton
                        name="play-back"
                        label="Previous sentence"
                        onPress={() =>
                          audio.play(audio.queue, Math.max(0, audio.cursor - 1))
                        }
                      />
                      <IconButton
                        name={audio.playing ? "pause" : "play"}
                        label={
                          audio.playing
                            ? "Pause Grove Radio"
                            : "Play Grove Radio"
                        }
                        onPress={() =>
                          audio.playing ? audio.stop() : audio.resume()
                        }
                      />
                      <IconButton
                        name="play-forward"
                        label="Skip story"
                        onPress={() => {
                          const next = audio.queue.findIndex(
                            (l, i) =>
                              i > audio.cursor &&
                              l.lessonId !== audio.current?.lessonId,
                          );
                          if (next >= 0) audio.play(audio.queue, next);
                          else {
                            audio.stop();
                            setNotice(
                              "You reached the end of this playlist. Start a new mix when you are ready.",
                            );
                          }
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        s.caption,
                        { textAlign: "center", marginVertical: 15 },
                      ]}
                    >
                      {audio.cursor + 1} of {audio.queue.length} sentences ·
                      pausing resumes this sentence
                    </Text>
                    <View style={[s.wrap, { justifyContent: "center" }]}>
                      {[0.65, 0.85, 1, 1.15].map((rate) => (
                        <Chip
                          key={rate}
                          label={`${rate}×`}
                          selected={p.settings.rate === rate}
                          onPress={() =>
                            setP((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, rate },
                            }))
                          }
                        />
                      ))}
                    </View>
                    <Section title="A little sleep timer" />
                    <View style={s.wrap}>
                      {[0, 5, 10, 15].map((n) => (
                        <Chip
                          key={n}
                          label={n ? `${n} min` : "Off"}
                          selected={sleepMinutes === n}
                          onPress={() => setSleepMinutes(n)}
                        />
                      ))}
                    </View>
                    {audio.error && (
                      <View style={s.notice}>
                        <Text style={s.body}>{audio.error}</Text>
                      </View>
                    )}
                    <Text style={[s.caption, { marginTop: 22 }]}>
                      Bundled stories play once per mix. Keep the app open;
                      audio pauses when it goes into the background. Install a
                      Mandarin voice for offline speech.
                    </Text>
                    {playingLesson && (
                      <Button
                        light
                        label="Open this story"
                        onPress={() => {
                          stopListening();
                          openLesson(playingLesson);
                        }}
                      />
                    )}
                    <Button
                      light
                      label="Start a new mix"
                      onPress={startListening}
                    />
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
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
