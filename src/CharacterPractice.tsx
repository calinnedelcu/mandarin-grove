import React, { useEffect, useRef, useState } from "react";
import { PanResponder, Platform, Text, View, ViewStyle } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { GridPaper } from "./art";
import { characters } from "./content";
import { C } from "./theme";
import { Button, Chip, s } from "./ui";

type Point = [number, number];
const SIZE = 240;
const webDrawingStyle: ViewStyle & { touchAction: string } = {
  touchAction: "none",
};
export function strokePoints(median: number[][]): Point[] {
  return median.map(([x, y]) => [(x / 1024) * SIZE, ((900 - y) / 1024) * SIZE]);
}
export function matchesStroke(drawn: Point[], expected: Point[]) {
  if (drawn.length < 2 || expected.length < 2) return false;
  const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (
    distance(drawn[0], expected[0]) > 32 ||
    distance(drawn[drawn.length - 1], expected[expected.length - 1]) > 36
  )
    return false;
  return (
    drawn.filter((p) => Math.min(...expected.map((e) => distance(p, e))) < 38)
      .length /
      drawn.length >
    0.65
  );
}
const path = (points: Point[]) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Guided stroke-order practice on a sheet of grid paper. */
export function CharacterPractice({
  character,
  onComplete,
}: {
  character: string;
  onComplete: (char: string) => void;
}) {
  const data = characters[character],
    medians = data?.medians || [];
  const [stroke, setStroke] = useState(0),
    [drawn, setDrawn] = useState<Point[]>([]),
    [message, setMessage] = useState(
      "Follow the pale stroke from the red dot.",
    ),
    [demo, setDemo] = useState(false),
    [completed, setCompleted] = useState(false);
  const strokeRef = useRef(0),
    drawRef = useRef<Point[]>([]),
    demoRef = useRef(false),
    mediansRef = useRef(medians),
    completeRef = useRef(onComplete);
  useEffect(() => {
    mediansRef.current = medians;
    completeRef.current = onComplete;
  }, [medians, onComplete]);
  useEffect(() => {
    setStroke(0);
    strokeRef.current = 0;
    setCompleted(false);
    setDrawn([]);
    setDemo(false);
    setMessage("Follow the pale stroke from the red dot.");
  }, [character]);
  useEffect(() => {
    demoRef.current = demo;
    if (!demo) return;
    const timer = setInterval(
      () => setStroke((v) => (v >= medians.length - 1 ? 0 : v + 1)),
      750,
    );
    return () => clearInterval(timer);
  }, [demo, medians.length]);
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !demoRef.current,
      onMoveShouldSetPanResponder: () => !demoRef.current,
      onPanResponderGrant: (e) => {
        drawRef.current = [[e.nativeEvent.locationX, e.nativeEvent.locationY]];
        setDrawn([...drawRef.current]);
      },
      onPanResponderMove: (e) => {
        drawRef.current.push([
          e.nativeEvent.locationX,
          e.nativeEvent.locationY,
        ]);
        setDrawn([...drawRef.current]);
      },
      onPanResponderRelease: () => {
        const at = strokeRef.current;
        const expected = strokePoints(mediansRef.current[at] || []);
        if (matchesStroke(drawRef.current, expected)) {
          if (at === mediansRef.current.length - 1) {
            setCompleted(true);
            strokeRef.current = mediansRef.current.length;
            setMessage("Lovely! You wrote the whole character.");
            completeRef.current(character);
          } else {
            strokeRef.current = at + 1;
            setStroke(at + 1);
            setMessage("Good stroke. Try the next one.");
          }
        } else
          setMessage("Try again: start at the dot and follow its direction.");
        setDrawn([]);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => setDrawn([]),
    }),
  ).current;
  if (!medians.length)
    return (
      <Text style={s.caption}>
        No stroke guide is bundled for this character.
      </Text>
    );
  const at = completed ? medians.length : stroke,
    start = at < medians.length ? strokePoints(medians[at])[0] : null;
  return (
    <View style={{ gap: 12 }}>
      <View style={s.row}>
        <Text style={s.cardTitle}>
          {character} · {medians.length} strokes
        </Text>
        <Chip
          label={demo ? "Stop demo" : "Stroke demo"}
          selected={demo}
          onPress={() => {
            setDemo(!demo);
            setCompleted(false);
            setStroke(0);
            strokeRef.current = 0;
          }}
        />
      </View>
      <GridPaper size={SIZE} style={{ alignSelf: "center" }}>
        <View
          accessibilityLabel={`Trace ${character}, stroke ${Math.min(at + 1, medians.length)} of ${medians.length}`}
          {...responder.panHandlers}
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              width: SIZE,
              height: SIZE,
            },
            Platform.OS === "web" && webDrawingStyle,
          ]}
        >
          <Svg width={SIZE} height={SIZE} pointerEvents="none">
            {medians.map((m, i) => (
              <Polyline
                key={i}
                points={path(strokePoints(m))}
                stroke={i < at ? C.ink : i === at ? "#B9C9B0" : C.hair}
                strokeWidth={i < at ? 13 : 11}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {start && (
              <Circle
                cx={start[0]}
                cy={start[1]}
                r={7}
                fill={C.primary}
                stroke={C.card}
                strokeWidth={2}
              />
            )}
            {drawn.length > 1 && (
              <Polyline
                points={path(drawn)}
                stroke={C.primary}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.85}
              />
            )}
          </Svg>
        </View>
      </GridPaper>
      <Text
        accessibilityLiveRegion="polite"
        style={[s.caption, { textAlign: "center" }]}
      >
        {demo
          ? "Watch the order, then trace with your finger or mouse."
          : message}
      </Text>
      <Button
        light
        icon="refresh-outline"
        label="Start again"
        onPress={() => {
          setDemo(false);
          setStroke(0);
          strokeRef.current = 0;
          setCompleted(false);
          setDrawn([]);
          setMessage("Follow the pale stroke from the red dot.");
        }}
      />
      <Text style={s.caption}>
        Guided practice checks direction and approximate shape. It is not
        handwriting recognition.
      </Text>
    </View>
  );
}
