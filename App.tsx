import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lesson, lessons, Word, words } from "./src/content";
import {
  activity,
  activeStreak,
  dayKey,
  emptyProgress,
  Mode,
  parseProgress,
  practicePool,
  Progress,
  reward,
  saveWord,
  schedule,
  shuffle,
} from "./src/learning";
import {
  Exercise,
  exerciseXP,
  readingExercises,
  Session,
  wordExercises,
} from "./src/exercises";
import {
  dailyPlan,
  deckStats,
  nextOnPath,
  pinDaily,
  trickyWords,
} from "./src/extras";
import { useSpeech } from "./src/useSpeech";
import { Effect, playEffect } from "./src/sound";
import { AppCtx, Tab } from "./src/app";
import { C, F, fontAssets, s } from "./src/theme";
import { Icon, Zh } from "./src/ui";
import { GroveScene } from "./src/art";
import { Panda } from "./src/Panda";
import { Onboarding } from "./src/Onboarding";
import { Reader } from "./src/Reader";
import { WordSheet } from "./src/WordSheet";
import { Quiz } from "./src/Quiz";
import { MatchPairs } from "./src/MatchPairs";
import { Review } from "./src/Review";
import { Radio } from "./src/Radio";
import { Settings } from "./src/Settings";
import { WritingStudio } from "./src/WritingStudio";
import { Today } from "./src/screens/Today";
import { Journey } from "./src/screens/Journey";
import { Practice } from "./src/screens/Practice";
import { Lexicon } from "./src/screens/Lexicon";
import { Me } from "./src/screens/Me";

const KEY = "mandarin-grove.v1";
const tabs: { tab: Tab; glyph: string }[] = [
  { tab: "Today", glyph: "今" },
  { tab: "Path", glyph: "路" },
  { tab: "Practice", glyph: "练" },
  { tab: "Words", glyph: "词" },
  { tab: "Me", glyph: "我" },
];

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
    [reviewQueue, setReviewQueue] = useState<string[] | null>(null);
  const [now, setNow] = useState(Date.now()),
    [settingsOpen, setSettingsOpen] = useState(false),
    [writingOpen, setWritingOpen] = useState(false),
    [listening, setListening] = useState(false),
    [sleepMinutes, setSleepMinutes] = useState(0),
    [notice, setNotice] = useState(""),
    [reducedMotion, setReducedMotion] = useState(false),
    [fontWait, setFontWait] = useState(false);
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const fade = useRef(new Animated.Value(1)).current,
    scroll = useRef<ScrollView>(null),
    saveQueue = useRef(Promise.resolve()),
    writeAllowed = useRef(false),
    loadingRaw = useRef<string | null>(null),
    answerLock = useRef(false),
    activeState = useRef(AppState.currentState);
  const audio = useSpeech(p.settings.rate, p.settings.studioVoice);

  useEffect(() => {
    let mounted = true;
    // Never hold the app hostage to a font: after a moment, carry on with
    // the system faces and let the brush faces arrive when they can.
    const fontTimer = setTimeout(() => setFontWait(true), 2500);
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        loadingRaw.current = raw;
        if (raw) {
          const parsed = parseProgress(raw);
          if (mounted) setP(parsed);
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
      clearTimeout(fontTimer);
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
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (!reducedMotion)
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
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
  const todayKey = dayKey(new Date(now));
  useEffect(() => {
    if (ready && p.onboarded) setP((prev) => pinDaily(prev, new Date(now)));
  }, [ready, p.onboarded, todayKey, p.settings.level]);
  useEffect(() => {
    answerLock.current = false;
  }, [reviewQueue?.[0]]);

  const due = words
    .filter((w) => p.cards[w.id] && p.cards[w.id].due <= now)
    .sort((a, b) => p.cards[a.id].due - p.cards[b.id].due);
  const deck = deckStats(p),
    dailyXP = p.lastDay === todayKey ? p.dailyXP : 0,
    streak = activeStreak(p, new Date(now)),
    pinned = lessons.find(
      (l) => p.daily?.day === todayKey && l.id === p.daily.lessonId,
    ),
    today = pinned || nextOnPath(p),
    resume = lessons.find((l) => l.id === p.lastLesson),
    plan = dailyPlan(p, due.length, today, new Date(now));
  const fallback = deck.saved.length
    ? deck.saved
    : words.filter((w) => w.level <= p.settings.level).slice(0, 20);

  function chime(effect: Effect) {
    if (p.settings.sounds) playEffect(effect);
  }
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
    chime("plant");
  }
  function openLesson(l: Lesson) {
    audio.stop();
    setWord(null);
    setLesson(l);
    setP((prev) => ({ ...prev, lastLesson: l.id }));
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
    mode?: Mode,
    title = "Meaning, tones & listening",
    options: { zen?: boolean; timed?: boolean; lessonId?: string } = {},
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
      lessonId: options.lessonId || null,
      zen: options.zen,
      timed: options.timed,
    });
  }
  function smartPractice() {
    const tricky = trickyWords(p);
    if (tricky.length >= 4) wordQuiz(tricky, undefined, "Tricky words");
    else if (deck.saved.length >= 4)
      wordQuiz(practicePool(p, "Mixed practice", now), undefined, "Daily mix");
    else wordQuiz(today.words, undefined, "First words");
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
    chime(correct ? "correct" : "wrong");
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
    chime("complete");
  }
  function written(char: string) {
    setP((prev) => ({
      ...(!prev.writing[char] ? reward(prev, 8) : prev),
      writing: { ...prev.writing, [char]: (prev.writing[char] || 0) + 1 },
    }));
    setNotice(`Beautifully written: ${char}`);
    buzz();
    chime("correct");
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
    if (reviewQueue.length === 1) chime("complete");
    setReviewQueue((q) => q!.slice(1));
    setNow(Date.now());
    buzz(grade !== "again");
  }
  function startRadio() {
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
  function stopRadio() {
    audio.stop();
    setListening(false);
    setSleepMinutes(0);
  }

  if (!ready || !(fontsLoaded || fontError || fontWait))
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <GroveScene height={420} />
        <Panda size={170} bamboo />
        <Text style={s.heroTitle}>Mandarin Grove</Text>
        <Text style={s.caption}>Fetching fresh bamboo…</Text>
      </SafeAreaView>
    );
  if (!p.onboarded)
    return (
      <Onboarding
        initial={p.settings}
        onFinish={(settings) =>
          setP((prev) => ({ ...prev, onboarded: true, settings }))
        }
      />
    );

  const app: AppCtx = {
    p,
    update: setP,
    now,
    audio,
    due,
    deck,
    dailyXP,
    streak,
    today,
    resume,
    plan,
    go: (next) => {
      audio.stop();
      setWord(null);
      setTab(next);
    },
    openLesson,
    openWord: (w) => {
      audio.stop();
      setWord(w);
    },
    plant,
    startReview: () => {
      audio.stop();
      if (due.length) setReviewQueue(due.map((w) => w.id));
      else setNotice("Nothing is due. Your words are resting.");
    },
    smartPractice,
    wordQuiz,
    launch,
    startPairs: (pool) => {
      audio.stop();
      setPairs(pool.length ? pool : fallback);
    },
    startRadio,
    openSettings: () => setSettingsOpen(true),
    openWriting: () => {
      audio.stop();
      setWritingOpen(true);
    },
    notify: setNotice,
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={s.shell}>
        <View style={s.header}>
          <View style={[s.line, { gap: 10 }]}>
            <Panda head still size={38} />
            <Text style={s.brand}>Mandarin Grove</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${streak} day streak. View progress`}
            style={[s.badge, s.line, { gap: 5, minHeight: 36 }]}
            onPress={() => app.go("Me")}
          >
            <Icon name="flame" color={streak ? C.coral : C.faint} size={16} />
            <Text style={[s.cardTitle, { fontSize: 14 }]}>{streak}</Text>
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
        <ScrollView
          ref={scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            // Only a small slide: content never depends on the animation
            // finishing to become visible.
            style={{
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
            {tab === "Today" && <Today app={app} />}
            {tab === "Path" && <Journey app={app} />}
            {tab === "Practice" && <Practice app={app} />}
            {tab === "Words" && <Lexicon app={app} />}
            {tab === "Me" && <Me app={app} />}
          </Animated.View>
        </ScrollView>
        {(notice || audio.error) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notice"
            onPress={() => {
              setNotice("");
              audio.clearError();
            }}
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 84,
              backgroundColor: C.forest,
              borderRadius: 16,
              paddingVertical: 13,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon
              name={notice ? "leaf" : "volume-mute-outline"}
              size={16}
              color={C.onDark}
            />
            <Text
              accessibilityLiveRegion="polite"
              style={[s.caption, { color: C.onDark, flex: 1 }]}
            >
              {notice || audio.error}
            </Text>
          </Pressable>
        )}
        <SafeAreaView edges={["bottom"]} style={s.nav}>
          <View style={s.navInner}>
            {tabs.map(({ tab: t, glyph }) => {
              const selected = tab === t;
              return (
                <Pressable
                  key={t}
                  accessibilityRole="tab"
                  accessibilityLabel={t}
                  accessibilityState={{ selected }}
                  aria-selected={selected}
                  onPress={() => app.go(t)}
                  style={s.navItem}
                >
                  <View
                    style={{
                      width: 46,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? C.primary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: selected ? F.kaiBold : F.kai,
                        fontSize: 21,
                        lineHeight: 26,
                        color: selected ? "#FFFFFF" : C.ink2,
                      }}
                    >
                      {glyph}
                    </Text>
                  </View>
                  <Text
                    style={[
                      s.navText,
                      selected && { color: C.primaryDeep, fontWeight: "800" },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
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
            onLesson={(l) => {
              setWord(null);
              openLesson(l);
            }}
          />
        )}
      </View>
      {lesson && (
        <Reader
          lesson={lesson}
          p={p}
          audio={audio}
          onClose={() => {
            audio.stop();
            setLesson(null);
          }}
          onLesson={openLesson}
          onProgress={setP}
          onWordSave={plant}
          onWrite={written}
          onQuiz={() =>
            wordQuiz(lesson.words, undefined, "Words from the story", {
              lessonId: lesson.id,
            })
          }
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
          }}
        />
      )}
      {pairs && (
        <MatchPairs
          pool={pairs}
          onAnswer={(correct, w) =>
            onAnswer(correct, {
              mode: "match",
              word: w,
              prompt: "",
              options: [],
              answer: w.meaning,
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
      {reviewQueue !== null && (
        <Review
          queue={reviewQueue}
          p={p}
          audio={audio}
          onGrade={gradeReview}
          onClose={() => {
            setReviewQueue(null);
            audio.stop();
          }}
        />
      )}
      {settingsOpen && (
        <Settings
          p={p}
          onChange={setP}
          onNotice={setNotice}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {writingOpen && (
        <WritingStudio
          p={p}
          onWrite={written}
          onClose={() => setWritingOpen(false)}
        />
      )}
      {listening && (
        <Radio
          p={p}
          audio={audio}
          sleepMinutes={sleepMinutes}
          onSleep={setSleepMinutes}
          onRate={(rate) =>
            setP((prev) => ({ ...prev, settings: { ...prev.settings, rate } }))
          }
          onRestart={startRadio}
          onOpen={(l) => {
            stopRadio();
            openLesson(l);
          }}
          onNotice={setNotice}
          onClose={stopRadio}
        />
      )}
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
