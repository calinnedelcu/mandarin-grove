import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Speech from "expo-speech";
export type AudioLine = { text: string; lessonId?: string; line?: number };
export function useSpeech(rate: number) {
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [queue, setQueue] = useState<AudioLine[]>([]);
  const [error, setError] = useState("");
  const generation = useRef(0),
    queueRef = useRef<AudioLine[]>([]),
    cursorRef = useRef(0),
    rateRef = useRef(rate),
    playingRef = useRef(false);
  const voiceRef = useRef<string | undefined>(undefined);
  function stop() {
    generation.current++;
    playingRef.current = false;
    setPlaying(false);
    void Speech.stop().catch(() => {});
  }
  async function run(items: AudioLine[], index = 0) {
    const gen = ++generation.current;
    playingRef.current = true;
    setPlaying(true);
    setError("");
    queueRef.current = items;
    setQueue(items);
    cursorRef.current = index;
    setCursor(index);
    try {
      await Speech.stop();
      if (gen !== generation.current) return;
      if (
        Platform.OS === "web" &&
        (typeof window === "undefined" ||
          !("speechSynthesis" in window) ||
          !("SpeechSynthesisUtterance" in window))
      )
        throw Error("Speech unavailable");
      let voiceTimer: ReturnType<typeof setTimeout> | undefined;
      const voices = await Promise.race([
        Speech.getAvailableVoicesAsync(),
        new Promise<Speech.Voice[]>((_, reject) => {
          voiceTimer = setTimeout(
            () => reject(Error("No speech voices")),
            2000,
          );
        }),
      ]).finally(() => clearTimeout(voiceTimer));
      if (gen !== generation.current) return;
      const mandarin = voices.filter(
        (v) =>
          /^(?:zh(?:$|[-_](?:CN|TW|SG)(?:$|[-_]))|cmn(?:$|[-_]))/i.test(
            v.language,
          ) &&
          (!("localService" in v) || (v as Speech.WebVoice).localService),
      );
      voiceRef.current =
        mandarin.find((v) => /^zh[-_]CN/i.test(v.language))?.identifier ||
        mandarin[0]?.identifier;
      if (!voiceRef.current) throw Error("Install a local Mandarin voice");
      function next(at: number) {
        if (gen !== generation.current) return;
        if (at >= items.length) {
          playingRef.current = false;
          setPlaying(false);
          return;
        }
        cursorRef.current = at;
        setCursor(at);
        Speech.speak(items[at].text, {
          language: "zh-CN",
          voice: voiceRef.current,
          rate: rateRef.current,
          onDone: () => next(at + 1),
          onError: () => {
            if (gen === generation.current) {
              playingRef.current = false;
              setPlaying(false);
              setError(
                "Audio unavailable. Install a Mandarin voice in your device speech settings.",
              );
            }
          },
          onStopped: () => {},
        });
      }
      next(index);
    } catch {
      if (gen === generation.current) {
        playingRef.current = false;
        setPlaying(false);
        setError(
          "Audio unavailable. Install a Mandarin voice in your device speech settings.",
        );
      }
    }
  }
  useEffect(() => {
    rateRef.current = rate;
    if (playingRef.current) void run(queueRef.current, cursorRef.current);
  }, [rate]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") stop();
    });
    return () => {
      sub.remove();
      generation.current++;
      void Speech.stop().catch(() => {});
    };
  }, []);
  return {
    playing,
    cursor,
    queue,
    error,
    clearError: () => setError(""),
    stop,
    play: (items: AudioLine[], index = 0) => void run(items, index),
    say: (text: string) => void run([{ text }]),
    resume: () => void run(queueRef.current, cursorRef.current),
    current: queue[cursor],
  };
}
export type AudioController = ReturnType<typeof useSpeech>;
