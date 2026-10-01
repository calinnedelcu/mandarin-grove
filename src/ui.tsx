import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Word, tone, toneColors } from "./content";
export const C = {
  bg: "#F7F8F2",
  paper: "#FFFFFF",
  ink: "#203B30",
  muted: "#627268",
  green: "#285E45",
  lime: "#DBF2A4",
  line: "#E3E8DC",
  peach: "#F9E3CE",
  red: "#B04C44",
};
export function Icon({
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
export function Button({
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
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        light && s.lightButton,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[s.buttonText, light && { color: C.green }]}>{label}</Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        selected && s.chipSelected,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[s.chipText, selected && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  color = C.green,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={s.iconButton}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}
export function Pinyin({
  word,
  large = false,
}: {
  word: Word;
  large?: boolean;
}) {
  return (
    <Text
      style={{
        fontSize: large ? 21 : 13,
        lineHeight: large ? 29 : 20,
        fontWeight: "600",
      }}
    >
      {word.pinyin.split(" ").map((sy, i) => (
        <Text key={i} style={{ color: toneColors[tone(sy)] }}>
          {i ? " " : ""}
          {sy}
        </Text>
      ))}
    </Text>
  );
}
export function Hanzi({
  word,
  size = 28,
  traditional = false,
  colored = true,
}: {
  word: Word;
  size?: number;
  traditional?: boolean;
  colored?: boolean;
}) {
  const syllables = word.pinyin.split(" ");
  return (
    <Text
      style={{
        fontSize: size,
        fontWeight: "500",
        lineHeight: size * 1.35,
        color: C.ink,
      }}
    >
      {Array.from(traditional ? word.traditional : word.hanzi).map((ch, i) => (
        <Text
          key={i}
          style={{
            color: colored ? toneColors[tone(syllables[i] || "")] : C.ink,
          }}
        >
          {ch}
        </Text>
      ))}
    </Text>
  );
}
export function Section({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) {
  return (
    <View style={[s.row, { marginTop: 26, marginBottom: 12 }]}>
      <Text style={s.sectionTitle}>{title}</Text>
      {caption && <Text style={s.caption}>{caption}</Text>}
    </View>
  );
}
export function Meter({ value }: { value: number }) {
  return (
    <View style={s.track}>
      <View
        style={[s.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]}
      />
    </View>
  );
}
export function GroveArt({ small = false }: { small?: boolean }) {
  return (
    <View
      accessible={false}
      style={{
        width: small ? 100 : 135,
        height: small ? 100 : 150,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: small ? 78 : 120,
          height: small ? 78 : 120,
          borderRadius: 70,
          backgroundColor: "#42765A",
          top: 0,
        }}
      />
      <View
        style={{
          height: small ? 65 : 100,
          width: 5,
          backgroundColor: "#CAE59B",
          transform: [{ rotate: "-8deg" }],
          borderRadius: 4,
        }}
      />
      {[-1, 1, -1, 1].map((dir, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: small ? 30 : 42,
            height: small ? 18 : 27,
            backgroundColor: i === 3 ? "#F4C892" : "#DBF2A4",
            borderTopLeftRadius: 40,
            borderBottomRightRadius: 40,
            borderTopRightRadius: 5,
            borderBottomLeftRadius: 5,
            bottom: (small ? 22 : 30) + i * (small ? 14 : 21),
            left: (small ? 45 : 64) + dir * (small ? 14 : 20),
            transform: [{ rotate: `${dir * 30}deg` }],
          }}
        />
      ))}
      <View
        style={{
          width: small ? 42 : 58,
          height: small ? 26 : 35,
          backgroundColor: "#EAB68A",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      />
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" },
  content: { padding: 22, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  brand: { fontSize: 19, color: C.ink, fontWeight: "700", letterSpacing: -0.8 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#E6EDDE",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1.5,
    lineHeight: 18,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1.5,
    color: C.ink,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    color: C.ink,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  sectionTitle: {
    fontSize: 19,
    color: C.ink,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  cardTitle: { fontSize: 16, lineHeight: 23, color: C.ink, fontWeight: "700" },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: C.muted,
    marginTop: 8,
    marginBottom: 20,
  },
  body: { fontSize: 15, lineHeight: 24, color: C.ink },
  caption: { fontSize: 12, lineHeight: 19, color: C.muted },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
  },
  button: {
    backgroundColor: C.green,
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
  },
  buttonText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  lightButton: { backgroundColor: "#E9EEDF" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: "#ECF0E5",
    minHeight: 40,
  },
  chipSelected: { backgroundColor: C.green },
  chipText: { color: C.ink, fontSize: 12, fontWeight: "600" },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#EDF1E6",
  },
  track: {
    height: 7,
    borderRadius: 8,
    backgroundColor: "#E5EBDD",
    overflow: "hidden",
    marginVertical: 12,
  },
  fill: { height: 7, borderRadius: 8, backgroundColor: C.green },
  search: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 15,
    fontSize: 15,
    color: C.ink,
    marginBottom: 16,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.paper,
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  storyEmoji: {
    width: 60,
    height: 70,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  nav: { backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.line },
  navInner: {
    flexDirection: "row",
    paddingVertical: 8,
    justifyContent: "space-around",
  },
  navItem: { alignItems: "center", gap: 3, flex: 1, minHeight: 54 },
  navIcon: {
    width: 45,
    height: 29,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 10, color: C.muted },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: C.line,
    gap: 8,
  },
  cover: { borderRadius: 25, padding: 24, marginBottom: 20 },
  sentence: {
    backgroundColor: C.paper,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  token: {
    paddingHorizontal: 3,
    paddingVertical: 5,
    borderRadius: 6,
    minHeight: 44,
    alignItems: "center",
  },
  scrim: { backgroundColor: "rgba(14,38,27,.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 30,
  },
  option: {
    padding: 17,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    marginTop: 10,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    minHeight: 60,
  },
  correct: { backgroundColor: "#E4F1D9", borderColor: "#88AD6C" },
  wrong: { backgroundColor: "#F8E2DE", borderColor: "#D5968E" },
  feedback: {
    padding: 17,
    backgroundColor: "#EDF1E6",
    borderRadius: 18,
    marginTop: 16,
  },
  badge: {
    backgroundColor: "#EDF1E6",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  error: {
    padding: 14,
    backgroundColor: "#F9E3CE",
    borderRadius: 14,
    margin: 12,
  },
  statNumber: { fontSize: 24, fontWeight: "700", color: C.ink },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 22,
  },
  audioCircle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#DBEACA",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    borderLeftWidth: 3,
    borderColor: "#ABC681",
    paddingLeft: 14,
    marginVertical: 16,
  },
  grammar: {
    backgroundColor: "#E9EEDF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.paper,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 18 },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: C.line,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,.15)",
  },
  notice: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#EAF0E2",
    marginTop: 14,
  },
  empty: { padding: 28, alignItems: "center", gap: 10 },
  toneMark: { fontSize: 42, color: C.ink, fontWeight: "600" },
});
