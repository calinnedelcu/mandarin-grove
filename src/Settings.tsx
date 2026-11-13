import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { parseProgress, Progress } from "./learning";
import { Preferences } from "./Onboarding";
import { C, s } from "./theme";
import { Button, Chip, IconButton, Section } from "./ui";

const toggles = [
  ["pinyin", "Pinyin above words"],
  ["translation", "English under sentences"],
  ["echo", "Word echo colours"],
  ["traditional", "Traditional characters"],
] as const;
const sound = [
  ["studioVoice", "Studio voice"],
  ["sounds", "Sound effects"],
] as const;

/** Level, goal, interests, reading defaults and an on-device backup. */
export function Settings({
  p,
  onChange,
  onNotice,
  onClose,
}: {
  p: Progress;
  onChange: (update: (p: Progress) => Progress) => void;
  onNotice: (message: string) => void;
  onClose: () => void;
}) {
  const [backup, setBackup] = useState(""),
    [incoming, setIncoming] = useState(""),
    [confirm, setConfirm] = useState(false),
    [problem, setProblem] = useState("");
  function restore() {
    try {
      const parsed = parseProgress(incoming.trim());
      if (!confirm) {
        setConfirm(true);
        setProblem("");
        return;
      }
      onChange(() => parsed);
      setIncoming("");
      setConfirm(false);
      onNotice("Backup restored. Welcome back to your grove.");
      onClose();
    } catch {
      setConfirm(false);
      setProblem(
        "That does not look like a Mandarin Grove backup. Paste the whole code.",
      );
    }
  }
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.shell}>
          <View style={s.modalHeader}>
            <IconButton
              name="close"
              label="Close preferences"
              onPress={onClose}
            />
            <Text style={s.eyebrow}>Your grove, your pace</Text>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.heroTitle, { marginBottom: 22 }]}>
              Make it yours.
            </Text>
            <Preferences
              settings={p.settings}
              onChange={(settings) =>
                onChange((prev) => ({ ...prev, settings }))
              }
            />
            <Section title="Reading" zh="读" />
            <View style={s.wrap}>
              {toggles.map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={p.settings[key]}
                  onPress={() =>
                    onChange((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        [key]: !prev.settings[key],
                      },
                    }))
                  }
                />
              ))}
            </View>
            <Section title="Sound" zh="听" />
            <View style={s.wrap}>
              {sound.map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={p.settings[key]}
                  onPress={() =>
                    onChange((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        [key]: !prev.settings[key],
                      },
                    }))
                  }
                />
              ))}
            </View>
            <Text style={[s.caption, { marginTop: 8 }]}>
              Stories, longer words and sayings have a recorded studio voice.
              Single characters and anything without a recording use your
              device's Mandarin voice.
            </Text>
            <Section title="Backup" zh="存" />
            <Text style={s.caption}>
              Progress lives only on this device. Keep a backup code somewhere
              safe, and paste it here to move to a new phone or browser.
            </Text>
            <Button
              light
              icon="download-outline"
              label="Create a backup code"
              onPress={() => {
                const code = JSON.stringify(p);
                setBackup(code);
                if (Platform.OS !== "web")
                  void Share.share({ message: code }).catch(() => {});
              }}
            />
            {!!backup && (
              <TextInput
                accessibilityLabel="Backup code"
                value={backup}
                multiline
                editable={Platform.OS === "web"}
                selectTextOnFocus
                onChangeText={() => {}}
                style={[
                  s.search,
                  { marginTop: 12, height: 96, fontSize: 11, color: C.muted },
                ]}
              />
            )}
            <TextInput
              accessibilityLabel="Paste a backup code"
              placeholder="Paste a backup code to restore"
              placeholderTextColor={C.faint}
              value={incoming}
              onChangeText={(v) => {
                setIncoming(v);
                setConfirm(false);
                setProblem("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              style={[s.search, { marginTop: 12, height: 72, fontSize: 12 }]}
            />
            {!!problem && (
              <Text style={[s.caption, { color: C.coralDeep }]}>{problem}</Text>
            )}
            {confirm && (
              <Text style={[s.caption, { color: C.coralDeep }]}>
                This replaces the progress on this device and cannot be undone.
              </Text>
            )}
            <Button
              light
              icon="refresh-outline"
              disabled={!incoming.trim()}
              label={
                confirm ? "Yes, replace my progress" : "Restore from backup"
              }
              onPress={restore}
            />
            <Button label="Done →" onPress={onClose} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
