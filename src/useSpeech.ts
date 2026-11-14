import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Speech from "expo-speech";
import { canPlayFiles, clipFor, playClip, stopClip } from "./sound";
export type AudioLine = {
  text: string;
  /** The character speaking, when the line has its own recorded voice. */
  voice?: string;
  lessonId?: string;
  line?: number;
};
/**
 * Speaks Chinese. A line with a bundled studio recording plays that file;
 * anything else, or everything when `studio` is off, uses the device's own
 * Mandarin voice.
 */
export function useSpeech(rate: number, studio = true) {
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [queue, setQueue] = useState<AudioLine[]>([]);
  const [error, setError] = useState("");
  const generation = useRef(0),
    queueRef = useRef<AudioLine[]>([]),
    cursorRef = useRef(0),
    rateRef = useRef(rate),
    studioRef = useRef(studio),
    playingRef = useRef(false);
  studioRef.current = studio;
  const voiceRef = useRef<string | undefined>(undefined);
  function stop() {
    generation.current++;
    playingRef.current = false;
    setPlaying(false);
    stopClip();
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
    const fail = () => {
      if (gen !== generation.current) return;
      playingRef.current = false;
      setPlaying(false);
      setError(
        "Audio unavailable. Install a Mandarin voice in your device speech settings.",
      );
    };
    // Looked up only when a line has no recording, so stories with studio
    // audio play even on a device without a Mandarin voice.
    async function deviceVoice() {
      if (voiceRef.current) return voiceRef.current;
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
      return voiceRef.current;
    }
    async function speakWithDevice(at: number) {
      try {
        const voice = await deviceVoice();
        if (gen !== generation.current) return;
        Speech.speak(items[at].text, {
          language: "zh-CN",
          voice,
          rate: rateRef.current,
          onDone: () => next(at + 1),
          onError: fail,
          onStopped: () => {},
        });
      } catch {
        fail();
      }
    }
    function next(at: number) {
      if (gen !== generation.current) return;
      if (at >= items.length) {
        playingRef.current = false;
        setPlaying(false);
        return;
      }
      cursorRef.current = at;
      setCursor(at);
      const clip = studioRef.current
        ? clipFor(items[at].text, items[at].voice)
        : undefined;
      if (clip !== undefined && canPlayFiles())
        playClip(
          clip,
          rateRef.current,
          () => next(at + 1),
          () => {
            if (gen === generation.current) void speakWithDevice(at);
          },
        );
      else void speakWithDevice(at);
    }
    try {
      stopClip();
      await Speech.stop();
    } catch {}
    if (gen !== generation.current) return;
    next(index);
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
      stopClip();
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
