import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Word, tone, toneColors } from "./content";
import { C, F, s } from "./theme";
import { LeafRule } from "./art";

export { C, F, s } from "./theme";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];

export function Icon({
  name,
  size = 22,
  color = C.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Button({
  label,
  onPress,
  light = false,
  accent = false,
  disabled = false,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  light?: boolean;
  /** Kept for call sites that mark the main action; primary is the default. */
  accent?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const color = light ? C.ink : "#FFFFFF";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        light && s.lightButton,
        {
          opacity: disabled ? 0.45 : 1,
          // The button sinks onto its darker edge when pressed.
          borderBottomWidth: pressed ? 2 : 4,
          marginTop: pressed ? 14 : 12,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={19} color={color} />}
      <Text style={[s.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  kai = false,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  kai?: boolean;
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
      <Text
        style={[
          s.chipText,
          kai && { fontFamily: F.kai, fontSize: 19, lineHeight: 24 },
          selected && { color: "#FFFFFF" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  color = C.ink,
  plain = false,
  size = 21,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  plain?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconButton,
        plain && { backgroundColor: "transparent", borderWidth: 0 },
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Icon name={name} color={color} size={size} />
    </Pressable>
  );
}

/** Chinese text in the Kai brush face. */
export function Zh({
  children,
  size = 20,
  color = C.ink,
  bold = false,
  style,
  lines,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  bold?: boolean;
  style?: StyleProp<TextStyle>;
  lines?: number;
}) {
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          fontFamily: bold ? F.kaiBold : F.kai,
          fontSize: size,
          lineHeight: size * 1.38,
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const HAN = /([㐀-鿿豈-﫿]+[，。！？、：；“”]*)/;
/** English prose with its Chinese examples set in the Kai face. */
export function Mixed({
  children,
  style,
  zhSize = 17,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
  zhSize?: number;
}) {
  return (
    <Text style={[s.body, style]}>
      {children.split(HAN).map((part, i) =>
        i % 2 ? (
          <Text
            key={i}
            style={{ fontFamily: F.kai, fontSize: zhSize, color: C.ink }}
          >
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export function Pinyin({
  word,
  large = false,
  size,
}: {
  word: Word;
  large?: boolean;
  size?: number;
}) {
  const fontSize = size || (large ? 20 : 12.5);
  return (
    <Text
      style={{
        fontSize,
        lineHeight: fontSize * 1.45,
        fontWeight: "500",
        letterSpacing: 0.2,
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
  color = C.ink,
}: {
  word: Word;
  size?: number;
  traditional?: boolean;
  colored?: boolean;
  color?: string;
}) {
  const syllables = word.pinyin.split(" ");
  return (
    <Text
      style={{
        fontFamily: F.kai,
        fontSize: size,
        lineHeight: size * 1.35,
        color,
      }}
    >
      {Array.from(traditional ? word.traditional : word.hanzi).map((ch, i) => (
        <Text
          key={i}
          style={{
            color: colored ? toneColors[tone(syllables[i] || "")] : color,
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
  zh,
}: {
  title: string;
  caption?: string;
  zh?: string;
}) {
  return (
    <View style={[s.row, { marginTop: 28, marginBottom: 12 }]}>
      <View style={[s.line, { flex: 1, gap: 9 }]}>
        {zh ? (
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              backgroundColor: C.primaryWash,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zh size={17} bold color={C.primaryDeep} style={{ lineHeight: 22 }}>
              {zh}
            </Zh>
          </View>
        ) : null}
        <Text style={[s.sectionTitle, { flexShrink: 1 }]}>{title}</Text>
      </View>
      {caption && <Text style={s.eyebrow}>{caption}</Text>}
    </View>
  );
}

export function Meter({
  value,
  color = C.primary,
  track,
  slim = false,
}: {
  value: number;
  color?: string;
  track?: string;
  slim?: boolean;
}) {
  const target = Math.max(0, Math.min(100, value || 0)),
    width = useRef(new Animated.Value(target)).current;
  // The bar slides to a new value rather than jumping.
  useEffect(() => {
    Animated.timing(width, {
      toValue: target,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [target]);
  return (
    <View
      style={[
        s.track,
        track ? { backgroundColor: track } : null,
        slim && { marginVertical: 6, height: 5 },
      ]}
    >
      <Animated.View
        style={[
          s.fill,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: color,
          },
          slim && { height: 5 },
        ]}
      />
    </View>
  );
}

/** The page heading: a word worth knowing, its pinyin, then the English. */
export function PageTitle({
  zh,
  pinyin,
  title,
  caption,
}: {
  zh: string;
  pinyin: string;
  title: string;
  caption?: string;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={[s.line, { alignItems: "flex-end", gap: 10 }]}>
        <Zh size={36} bold color={C.primaryDeep} style={{ lineHeight: 44 }}>
          {zh}
        </Zh>
        <Text style={[s.pinyin, { marginBottom: 7 }]}>{pinyin}</Text>
        <LeafRule style={{ marginBottom: 8 }} />
      </View>
      <Text style={[s.heroTitle, { marginTop: 2 }]}>{title}</Text>
      {caption && (
        <Text style={[s.subtitle, { marginBottom: 0 }]}>{caption}</Text>
      )}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: C.bgDeep,
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
      }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? C.card : "transparent",
              borderWidth: selected ? 1 : 0,
              borderColor: C.line,
            }}
          >
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: selected ? "700" : "500",
                color: selected ? C.primaryDeep : C.muted,
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A brushed character on a wash of colour: the cover of a story or drill. */
export function GlyphTile({
  glyph,
  wash = C.primaryWash,
  ink = C.primaryDeep,
  size = 56,
  style,
}: {
  glyph: string;
  wash?: string;
  ink?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessible={false}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: wash,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: F.kaiBold,
          fontSize: size * 0.56,
          lineHeight: size * 0.7,
          color: ink,
        }}
      >
        {glyph}
      </Text>
    </View>
  );
}

export function Stat({
  value,
  label,
  color = C.ink,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statNumber, { color }]}>{value}</Text>
      <Text style={[s.caption, { marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

/** A tappable row: a tile on the left, two lines of text, a chevron. */
export function Row({
  title,
  caption,
  left,
  right,
  onPress,
  label,
  style,
}: {
  title: string;
  caption?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || title}
      onPress={onPress}
      style={({ pressed }) => [
        s.listRow,
        { opacity: pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {left}
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        {caption && <Text style={s.caption}>{caption}</Text>}
      </View>
      {right === undefined ? (
        <Icon name="chevron-forward" size={18} color={C.faint} />
      ) : (
        right
      )}
    </Pressable>
  );
}
