import { Platform } from "react-native";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { clips, effects } from "./data/audio";

// Bundled recordings: a studio voice for sentences, words and sayings, and
// four short interface sounds. Everything plays from files shipped with the
// app, so no network is needed. Whatever has no recording, or cannot play,
// falls back to the device's own Mandarin voice in useSpeech.

let supported: boolean | undefined;
/** False where there is no media engine, such as a test DOM. */
export function canPlayFiles() {
  if (supported !== undefined) return supported;
  if (Platform.OS !== "web") {
    supported = true;
    // A language lesson should be heard even with the ringer switched off.
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  } else
    try {
      supported =
        typeof Audio === "function" &&
        new Audio().canPlayType("audio/mpeg") !== "";
    } catch {
      supported = false;
    }
  return supported;
}

export function clipFor(text: string): number | undefined {
  return clips[text];
}

let voice: AudioPlayer | null = null,
  onEnd: (() => void) | null = null,
  onFail: (() => void) | null = null,
  started = false,
  watchdog: ReturnType<typeof setTimeout> | undefined;

function settle(callback: (() => void) | null) {
  clearTimeout(watchdog);
  onEnd = null;
  onFail = null;
  callback?.();
}

/**
 * Play one recording. Exactly one of `done` or `failed` is called, unless
 * `stopClip` cancels it first.
 */
export function playClip(
  source: number,
  rate: number,
  done: () => void,
  failed: () => void,
) {
  try {
    if (!voice) {
      voice = createAudioPlayer(null);
      voice.addListener("playbackStatusUpdate", (status) => {
        if (status.playing) started = true;
        if (status.didJustFinish) settle(onEnd);
      });
    }
    settle(null);
    started = false;
    onEnd = done;
    onFail = failed;
    voice.replace(source);
    voice.shouldCorrectPitch = true;
    voice.setPlaybackRate(rate);
    voice.play();
    // A file that never starts must not leave a story stuck mid-sentence.
    watchdog = setTimeout(() => {
      if (!started) {
        try {
          voice?.pause();
        } catch {}
        settle(onFail);
      }
    }, 4000);
  } catch {
    settle(failed);
  }
}

export function stopClip() {
  settle(null);
  try {
    voice?.pause();
  } catch {}
}

export type Effect = "correct" | "wrong" | "complete" | "plant";
const players: Partial<Record<Effect, AudioPlayer>> = {};
/** A short interface sound. Silent when there is no file or no engine. */
export function playEffect(name: Effect) {
  const source = effects[name];
  if (source === undefined || !canPlayFiles()) return;
  try {
    const player = (players[name] ||= createAudioPlayer(source));
    player.volume = 0.55;
    void player.seekTo(0).catch(() => {});
    player.play();
  } catch {}
}
