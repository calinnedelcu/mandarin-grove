import React, { useEffect, useRef, useState } from "react";
import { PanResponder, Text, View, Platform, ViewStyle } from "react-native";
import { characters } from "./content";
import { Button, C, Chip, s } from "./ui";
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
function Lines({
  points,
  color,
  width = 7,
}: {
  points: Point[];
  color: string;
  width?: number;
}) {
  return (
    <>
      {points.slice(1).map(([x, y], i) => {
        const [px, py] = points[i];
        const length = Math.hypot(x - px, y - py);
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: (x + px) / 2 - length / 2,
              top: (y + py) / 2 - width / 2,
              width: length + 1,
              height: width,
              borderRadius: width / 2,
              backgroundColor: color,
              transform: [
                {
                  rotate: `${(Math.atan2(y - py, x - px) * 180) / Math.PI}deg`,
                },
              ],
            }}
          />
        );
      })}
    </>
  );
}
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
    [message, setMessage] = useState("Follow the green stroke from the dot."),
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
  const at = completed ? medians.length : stroke;
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
      <View
        accessibilityLabel={`Trace ${character}, stroke ${Math.min(at + 1, medians.length)} of ${medians.length}`}
        {...responder.panHandlers}
        style={[
          {
            width: SIZE,
            height: SIZE,
            alignSelf: "center",
            backgroundColor: "#fff",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.line,
            overflow: "hidden",
          },
          Platform.OS === "web" && webDrawingStyle,
        ]}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: SIZE / 2,
            top: 0,
            width: 1,
            height: SIZE,
            backgroundColor: C.line,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: SIZE / 2,
            height: 1,
            width: SIZE,
            backgroundColor: C.line,
          }}
        />
        {medians.map((m, i) => (
          <Lines
            key={i}
            points={strokePoints(m)}
            color={i < at ? C.green : i === at ? "#A8C987" : "#E6EADD"}
          />
        ))}
        {at < medians.length && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: strokePoints(medians[at])[0][0] - 7,
              top: strokePoints(medians[at])[0][1] - 7,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#D48B4E",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        )}
        <Lines points={drawn} color="#D48B4E" width={5} />
      </View>
      <Text accessibilityLiveRegion="polite" style={s.caption}>
        {demo
          ? "Watch the order, then trace with your finger or mouse."
          : message}
      </Text>
      <Button
        light
        label="Start again"
        onPress={() => {
          setDemo(false);
          setStroke(0);
          strokeRef.current = 0;
          setCompleted(false);
          setDrawn([]);
          setMessage("Follow the green stroke from the dot.");
        }}
      />
      <Text style={s.caption}>
        Guided practice checks direction and approximate shape. It is not
        handwriting recognition.
      </Text>
    </View>
  );
}
