import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { G } from "react-native-svg";
import { Leaf } from "./art";
import { motionReduced } from "./Panda";

const greens = ["#62B86C", "#3E9A55", "#A9D86E", "#8FCB7C"];

/** Bamboo leaves drifting down the screen, for moments worth marking. */
export function LeafFall({ count = 16 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * Math.min(width, 720),
        delay: Math.random() * 2400,
        time: 3400 + Math.random() * 2800,
        size: 18 + Math.random() * 16,
        turn: (Math.random() > 0.5 ? 1 : -1) * (160 + Math.random() * 220),
        drift: 24 + Math.random() * 46,
        fill: greens[i % greens.length],
        fall: new Animated.Value(0),
      })),
    [],
  );
  useEffect(() => {
    if (motionReduced()) return;
    const loops = leaves.map((leaf) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(leaf.delay),
          Animated.timing(leaf.fall, {
            toValue: 1,
            duration: leaf.time,
            easing: Easing.linear,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, []);
  if (motionReduced()) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {leaves.map((leaf, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: leaf.x,
            top: -50,
            transform: [
              {
                translateY: leaf.fall.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 100],
                }),
              },
              {
                translateX: leaf.fall.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, leaf.drift, 0],
                }),
              },
              {
                rotate: leaf.fall.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${leaf.turn}deg`],
                }),
              },
            ],
          }}
        >
          <Svg width={leaf.size} height={leaf.size * 0.5} viewBox="0 -6 30 12">
            <G>
              <Leaf len={28} angle={0} fill={leaf.fill} vein="#2B7A45" />
            </G>
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}
