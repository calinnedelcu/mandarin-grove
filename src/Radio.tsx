import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GroveScene } from "./art";
import { Lesson, lessons } from "./content";
import { glyphFor } from "./extras";
import { Progress } from "./learning";
import { C, F, s } from "./theme";
import { AudioController } from "./useSpeech";
import { Icon, IconButton, IconName, Meter, Zh } from "./ui";

function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={{
        minHeight: 40,
        paddingHorizontal: 14,
        justifyContent: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: selected ? C.onDark : "rgba(243,237,224,.25)",
        backgroundColor: selected ? C.onDark : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: selected ? C.forest : C.onDark,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Control({
  name,
  label,
  onPress,
  primary = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const size = primary ? 76 : 52;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? C.primary : "rgba(243,237,224,.1)",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Icon name={name} size={primary ? 30 : 22} color={C.onDark} />
    </Pressable>
  );
}

/** Grove Radio: the level's stories read aloud, one after another. */
export function Radio({
  p,
  audio,
  sleepMinutes,
  onSleep,
  onRate,
  onRestart,
  onOpen,
  onNotice,
  onClose,
}: {
  p: Progress;
  audio: AudioController;
  sleepMinutes: number;
  onSleep: (minutes: number) => void;
  onRate: (rate: number) => void;
  onRestart: () => void;
  onOpen: (lesson: Lesson) => void;
  onNotice: (message: string) => void;
  onClose: () => void;
}) {
  const playing = lessons.find((l) => l.id === audio.current?.lessonId),
    line = playing?.story[audio.current?.line ?? 0],
    total = audio.queue.length || 1;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <StatusBar style="light" />
      <SafeAreaView style={[s.root, { backgroundColor: C.forest }]}>
        <GroveScene dark height={360} />
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              plain
              name="chevron-down"
              label="Close Grove Radio"
              color={C.onDark}
              onPress={onClose}
            />
            <Text style={[s.eyebrow, { color: C.onDarkMuted }]}>
              Grove Radio · HSK {p.settings.level}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
            <View style={[s.center, { marginTop: 10 }]}>
              <View
                style={{
                  width: 132,
                  height: 132,
                  borderRadius: 66,
                  borderWidth: 1,
                  borderColor: "rgba(243,237,224,.3)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: F.kaiBold,
                    fontSize: 72,
                    lineHeight: 90,
                    color: C.onDark,
                  }}
                >
                  {playing ? glyphFor(playing) : "听"}
                </Text>
              </View>
              <Text
                style={[
                  s.title,
                  { color: C.onDark, textAlign: "center", marginTop: 6 },
                ]}
              >
                {playing?.title || "Your listening moment"}
              </Text>
              <Text style={[s.caption, { color: C.onDarkMuted }]}>
                {playing
                  ? `${playing.topic} · ${playing.format}`
                  : "A local playlist at your level"}
              </Text>
            </View>
            <View style={{ minHeight: 132, justifyContent: "center" }}>
              <Zh
                size={27}
                color={C.onDark}
                style={{ textAlign: "center", lineHeight: 40 }}
              >
                {audio.current?.text || "Press play to begin."}
              </Zh>
              {line && p.settings.translation && (
                <Text
                  style={[
                    s.caption,
                    { color: C.onDarkMuted, textAlign: "center", marginTop: 8 },
                  ]}
                >
                  {line.translation}
                </Text>
              )}
            </View>
            <Meter
              slim
              color={C.primary}
              track="rgba(243,237,224,.16)"
              value={((audio.cursor + 1) / total) * 100}
            />
            <Text
              style={[s.caption, { color: C.onDarkMuted, textAlign: "center" }]}
            >
              {audio.cursor + 1} of {audio.queue.length} sentences · pausing
              resumes this sentence
            </Text>
            <View
              style={[
                s.row,
                { justifyContent: "center", gap: 22, marginVertical: 22 },
              ]}
            >
              <Control
                name="play-back"
                label="Previous sentence"
                onPress={() =>
                  audio.play(audio.queue, Math.max(0, audio.cursor - 1))
                }
              />
              <Control
                primary
                name={audio.playing ? "pause" : "play"}
                label={audio.playing ? "Pause Grove Radio" : "Play Grove Radio"}
                onPress={() => (audio.playing ? audio.stop() : audio.resume())}
              />
              <Control
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
                    onNotice(
                      "You reached the end of this playlist. Start a new mix when you are ready.",
                    );
                  }
                }}
              />
            </View>
            {!!audio.error && (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: "rgba(233,96,78,.28)",
                  marginBottom: 14,
                }}
              >
                <Text style={[s.body, { color: C.onDark }]}>{audio.error}</Text>
              </View>
            )}
            <Text
              style={[s.eyebrow, { color: C.onDarkMuted, marginBottom: 8 }]}
            >
              Speed
            </Text>
            <View style={s.wrap}>
              {[0.65, 0.85, 1, 1.15].map((rate) => (
                <Pill
                  key={rate}
                  label={`${rate}×`}
                  selected={p.settings.rate === rate}
                  onPress={() => onRate(rate)}
                />
              ))}
            </View>
            <Text
              style={[
                s.eyebrow,
                { color: C.onDarkMuted, marginBottom: 8, marginTop: 18 },
              ]}
            >
              Sleep timer
            </Text>
            <View style={s.wrap}>
              {[0, 5, 10, 15].map((n) => (
                <Pill
                  key={n}
                  label={n ? `${n} min` : "Off"}
                  selected={sleepMinutes === n}
                  onPress={() => onSleep(n)}
                />
              ))}
            </View>
            <View style={[s.wrap, { marginTop: 22 }]}>
              {playing && (
                <Pill
                  label="Open this story"
                  selected={false}
                  onPress={() => onOpen(playing)}
                />
              )}
              <Pill
                label="Start a new mix"
                selected={false}
                onPress={onRestart}
              />
            </View>
            <Text style={[s.caption, { color: C.onDarkMuted, marginTop: 18 }]}>
              Keep the app open; audio pauses when it goes into the background.
              Install a Mandarin voice for offline speech.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
