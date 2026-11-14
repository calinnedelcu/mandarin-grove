import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { C, F } from "./theme";
import { toneColors } from "./content";

/* ───────────────────────────── bamboo parts ───────────────────────────── */

function leafPath(len: number) {
  return `M0 0 C${len * 0.22} ${-len * 0.2} ${len * 0.7} ${-len * 0.17} ${len} 0 C${len * 0.72} ${len * 0.08} ${len * 0.24} ${len * 0.13} 0 0 Z`;
}

/** One bamboo leaf with a midrib, growing from the origin along +x. */
export function Leaf({
  len,
  angle,
  fill,
  vein,
}: {
  len: number;
  angle: number;
  fill: string;
  vein: string;
}) {
  return (
    <G transform={`rotate(${angle})`}>
      <Path d={leafPath(len)} fill={fill} />
      <Path
        d={`M${len * 0.06} 0 Q${len * 0.5} ${-len * 0.035} ${len * 0.94} 0`}
        stroke={vein}
        strokeWidth={0.9}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
      />
    </G>
  );
}

/** A small fan of leaves on a twig. `flip` mirrors it to the left. */
function Spray({
  x,
  y,
  scale = 1,
  flip = false,
  fill,
  deep,
  vein,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  fill: string;
  deep: string;
  vein: string;
}) {
  return (
    <G
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      <Path
        d="M0 0 Q10 -4 20 -3"
        stroke={deep}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <G transform="translate(18 -3)">
        <Leaf len={30} angle={-58} fill={deep} vein={vein} />
        <Leaf len={42} angle={-26} fill={fill} vein={vein} />
        <Leaf len={46} angle={6} fill={fill} vein={vein} />
        <Leaf len={34} angle={36} fill={deep} vein={vein} />
      </G>
      <G transform="translate(8 -2)">
        <Leaf len={26} angle={58} fill={fill} vein={vein} />
      </G>
    </G>
  );
}

/** A jointed cane from `bottom` up to `top`. */
function Cane({
  x,
  top,
  bottom,
  w,
  fill,
  node,
  lean = 0,
  shine = 0.24,
}: {
  x: number;
  top: number;
  bottom: number;
  w: number;
  fill: string;
  node: string;
  lean?: number;
  shine?: number;
}) {
  const seg = Math.max(26, w * 4.4),
    parts: React.ReactNode[] = [];
  for (let y = bottom, i = 0; y > top; y -= seg, i++) {
    const h = Math.min(seg - 1.4, y - top),
      sx = x + lean * i;
    parts.push(
      <Rect
        key={`s${i}`}
        x={sx}
        y={y - h}
        width={w}
        height={h}
        rx={w * 0.3}
        fill={fill}
      />,
    );
    if (shine > 0 && h > 8)
      parts.push(
        <Rect
          key={`h${i}`}
          x={sx + w * 0.2}
          y={y - h + 3}
          width={Math.max(1, w * 0.17)}
          height={h - 6}
          rx={w * 0.08}
          fill="#FFFFFF"
          opacity={shine}
        />,
      );
    parts.push(
      <Rect
        key={`n${i}`}
        x={sx - w * 0.07}
        y={y - 1.7}
        width={w * 1.14}
        height={2.8}
        rx={1.4}
        fill={node}
      />,
    );
  }
  return <>{parts}</>;
}

const farCanes = [16, 382, 178, 268, 66, 318, 112, 216, 44, 348, 146, 244];
const midCanes = [
  { x: 298, w: 8, lean: 0.4 },
  { x: 378, w: 9, lean: -0.5 },
  { x: 232, w: 6, lean: 0.3 },
];

export type DayPart = "dawn" | "day" | "dusk" | "night";
/** Which light the grove is in at a given hour. */
export function dayPart(now = new Date()): DayPart {
  const h = now.getHours();
  return h < 5
    ? "night"
    : h < 8
      ? "dawn"
      : h < 17
        ? "day"
        : h < 20
          ? "dusk"
          : "night";
}

const light = {
  hillFar: "#DCEBC8",
  hillNear: "#C4DFA9",
  far: "#C3DFAF",
  mid: "#94CC80",
  near: ["#8FD47E", "#56B065", "#34904C"],
  node: "#2B8448",
  leaf: "#62B86C",
  leafDeep: "#3E9A55",
  vein: "#2B7A45",
  mist: C.bg,
  sun: "#FBE29A",
  sky: "",
  sunY: 78,
};
const scenes = {
  day: light,
  dawn: {
    ...light,
    hillFar: "#DFEFD6",
    hillNear: "#CBE4BA",
    far: "#CFE6C2",
    sun: "#FFD9A6",
    sky: "#FDEFD9",
    sunY: 128,
  },
  dusk: {
    ...light,
    hillFar: "#DCE6C2",
    hillNear: "#C3D8A4",
    far: "#C9DBB0",
    mid: "#8FC47C",
    sun: "#F8AE62",
    sky: "#FBDDBD",
    sunY: 122,
  },
  night: {
    hillFar: "#1A4E35",
    hillNear: "#205C3E",
    far: "#235F41",
    mid: "#2F7A51",
    near: ["#6CC47E", "#3F9F5C", "#2A7A45"],
    node: "#1B5E36",
    leaf: "#58B46C",
    leafDeep: "#398F52",
    vein: "#1B5E36",
    mist: C.forest,
    sun: "#F7DC86",
    sky: "",
    sunY: 78,
  },
};

/** A paper lantern on its string, lit from inside. */
function Lantern({ x, y, drop }: { x: number; y: number; drop: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Line x1={0} y1={0} x2={0} y2={drop} stroke="#8A5A2B" strokeWidth={0.9} />
      <Circle cx={0} cy={drop + 14} r={26} fill="url(#lantern-glow)" />
      <Rect x={-4.5} y={drop} width={9} height={3.4} rx={1.2} fill="#E0B24A" />
      <Ellipse
        cx={0}
        cy={drop + 14}
        rx={10}
        ry={11.5}
        fill="url(#lantern-body)"
      />
      <Path
        d={`M-5 ${drop + 4.5} Q-9.5 ${drop + 14} -5 ${drop + 23.5} M5 ${drop + 4.5} Q9.5 ${drop + 14} 5 ${drop + 23.5} M0 ${drop + 3} V${drop + 25}`}
        stroke="#B92F22"
        strokeWidth={0.8}
        fill="none"
        opacity={0.7}
      />
      <Rect
        x={-4.5}
        y={drop + 24.6}
        width={9}
        height={3.2}
        rx={1.2}
        fill="#E0B24A"
      />
      <Path
        d={`M0 ${drop + 28} V${drop + 35} M-2 ${drop + 35} V${drop + 42} M0 ${drop + 35} V${drop + 43} M2 ${drop + 35} V${drop + 42}`}
        stroke="#E0B24A"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </G>
  );
}

const fireflies = [
  [62, 96, 1],
  [118, 142, 0.7],
  [150, 74, 0.8],
  [196, 118, 1],
  [88, 178, 0.6],
  [232, 168, 0.8],
  [176, 196, 0.7],
];
/** Fireflies that slowly brighten and fade. */
function Fireflies() {
  const glow = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(glow, {
          toValue: 0.45,
          duration: 1700,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: glow }]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMax slice"
      >
        <Defs>
          <RadialGradient id="firefly" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#F4FBB0" stopOpacity="1" />
            <Stop offset="0.35" stopColor="#D9F27A" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#D9F27A" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {fireflies.map(([x, y, scale], i) => (
          <G key={i}>
            <Circle cx={x} cy={y} r={9 * scale} fill="url(#firefly)" />
            <Circle cx={x} cy={y} r={1.6 * scale} fill="#FBFFD6" />
          </G>
        ))}
      </Svg>
    </Animated.View>
  );
}

/**
 * The grove: layered bamboo fading into mist, low hills and the sky of the
 * hour. `time` picks the light (a lantern-lit dusk, a moonlit night with
 * fireflies), `grown` from 0 to 1 thickens the bamboo as the learner's deck
 * fills, and `dark` is the plain night palette used on dark cards. The left
 * and middle stay calm so text can sit there. Purely decorative.
 */
export function GroveScene({
  height = 200,
  dark = false,
  sun = true,
  time = "day",
  grown = 1,
  style,
}: {
  height?: number;
  dark?: boolean;
  sun?: boolean;
  time?: DayPart;
  grown?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const part: DayPart = dark ? "night" : time,
    k = scenes[part],
    id = part,
    night = part === "night",
    lit = !dark && (part === "dusk" || part === "night"),
    thick = Math.max(0, Math.min(1, grown));
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[
        { position: "absolute", left: 0, right: 0, bottom: 0, height },
        style,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMax slice"
      >
        <Defs>
          <LinearGradient id={`mist-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={k.mist} stopOpacity="0" />
            <Stop offset="1" stopColor={k.mist} stopOpacity="0.92" />
          </LinearGradient>
          <LinearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor={k.sky || k.mist}
              stopOpacity={k.sky ? 0.95 : 0}
            />
            <Stop offset="1" stopColor={k.sky || k.mist} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id={`cane-${id}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={k.near[0]} />
            <Stop offset="0.55" stopColor={k.near[1]} />
            <Stop offset="1" stopColor={k.near[2]} />
          </LinearGradient>
          <RadialGradient id={`sun-${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={k.sun} stopOpacity={night ? 0.9 : 1} />
            <Stop offset="0.45" stopColor={k.sun} stopOpacity="0.55" />
            <Stop offset="1" stopColor={k.sun} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="lantern-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFB866" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#FFB866" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="lantern-body" cx="45%" cy="40%" r="70%">
            <Stop offset="0" stopColor="#FF9A62" />
            <Stop offset="0.6" stopColor="#E5472F" />
            <Stop offset="1" stopColor="#C2301F" />
          </RadialGradient>
        </Defs>
        {!!k.sky && (
          <Rect x="0" y="0" width="400" height="170" fill={`url(#sky-${id})`} />
        )}
        {sun && !(night && !dark) && (
          <Circle cx="286" cy={k.sunY} r="64" fill={`url(#sun-${id})`} />
        )}
        {sun && night && !dark && (
          <G>
            <Circle
              cx="286"
              cy="62"
              r="52"
              fill={`url(#sun-${id})`}
              opacity={0.55}
            />
            <Circle cx="286" cy="62" r="19" fill="#FBF4CF" />
            <Circle cx="279" cy="56" r="4.2" fill="#E6DDAE" opacity={0.7} />
            <Circle cx="292" cy="68" r="3" fill="#E6DDAE" opacity={0.6} />
            <Circle cx="290" cy="54" r="1.8" fill="#E6DDAE" opacity={0.6} />
          </G>
        )}
        {farCanes.slice(0, Math.round(5 + 7 * thick)).map((x, i) => (
          <Cane
            key={x}
            x={x}
            top={-10}
            bottom={236}
            w={3.4 + (i % 3) * 0.7}
            fill={k.far}
            node={k.hillNear}
            lean={i % 2 ? 0.25 : -0.2}
            shine={0}
          />
        ))}
        <Path
          d="M0 172 C46 146 92 152 140 162 C192 172 232 134 292 142 C340 148 372 162 400 152 L400 240 L0 240 Z"
          fill={k.hillFar}
        />
        <Rect
          x="0"
          y={part === "dawn" ? 60 : 92}
          width="400"
          height={part === "dawn" ? 124 : 92}
          fill={`url(#mist-${id})`}
        />
        {midCanes.slice(0, Math.round(1 + 2 * thick)).map((c) => (
          <Cane
            key={c.x}
            x={c.x}
            top={-10}
            bottom={236}
            w={c.w}
            fill={k.mid}
            node={k.node}
            lean={c.lean}
            shine={0.16}
          />
        ))}
        <Path
          d="M0 208 C56 190 118 202 182 206 C250 210 306 192 400 202 L400 240 L0 240 Z"
          fill={k.hillNear}
        />
        <Cane
          x={-3}
          top={-10}
          bottom={238}
          w={13}
          fill={`url(#cane-${id})`}
          node={k.node}
          lean={0.7}
        />
        <Cane
          x={350}
          top={-10}
          bottom={238}
          w={14}
          fill={`url(#cane-${id})`}
          node={k.node}
          lean={-0.8}
        />
        <Spray
          x={8}
          y={196}
          scale={0.8}
          fill={k.leaf}
          deep={k.leafDeep}
          vein={k.vein}
        />
        <Spray
          x={352}
          y={44}
          flip
          fill={k.leaf}
          deep={k.leafDeep}
          vein={k.vein}
        />
        <Spray
          x={350}
          y={118}
          scale={0.85}
          flip
          fill={k.leaf}
          deep={k.leafDeep}
          vein={k.vein}
        />
        <Spray
          x={292}
          y={96}
          scale={0.55}
          flip
          fill={k.mid}
          deep={k.mid}
          vein={k.node}
        />
        <Path
          d="M58 236 q3 -14 9 -18 q-1 10 -3 18 M70 236 q5 -10 12 -12 q-4 7 -6 12 M318 236 q-2 -13 -8 -17 q1 9 2 17 M306 236 q-5 -9 -11 -11 q3 6 5 11 M150 238 q2 -9 6 -11 q0 6 -2 11 M246 238 q-2 -8 -6 -10 q0 5 2 10"
          fill={k.leafDeep}
        />
        {lit && (
          <>
            <Lantern x={322} y={-4} drop={30} />
            <Lantern x={296} y={-4} drop={58} />
          </>
        )}
        <Rect x="0" y="214" width="400" height="26" fill={`url(#mist-${id})`} />
      </Svg>
      {night && !dark && <Fireflies />}
    </View>
  );
}

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/**
 * The learner's own grove: one bamboo for each planted word (or for a few,
 * once there are many). Strong words stand tall, growing ones are half
 * height, and new ones are still shoots.
 */
export function GrovePlot({
  strong,
  growing,
  fresh,
  height = 150,
}: {
  strong: number;
  growing: number;
  fresh: number;
  height?: number;
}) {
  const total = strong + growing + fresh,
    per = Math.max(1, Math.ceil(total / 40)),
    count = (n: number) => (n ? Math.max(1, Math.round(n / per)) : 0),
    random = seeded(7),
    stalks = [
      ...Array.from({ length: count(strong) }, () => 2),
      ...Array.from({ length: count(growing) }, () => 1),
      ...Array.from({ length: count(fresh) }, () => 0),
    ]
      .map((kind) => ({ kind, x: 14 + random() * 372, jitter: random() }))
      .sort((a, b) => a.x - b.x);
  return (
    <View
      accessible={false}
      style={{ height, borderRadius: 18, overflow: "hidden" }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 150"
        preserveAspectRatio="xMidYMax slice"
      >
        <Defs>
          <LinearGradient id="plot-sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F4FAEA" />
            <Stop offset="1" stopColor="#E2F0D2" />
          </LinearGradient>
          <LinearGradient id="plot-cane" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#8FD47E" />
            <Stop offset="0.55" stopColor="#56B065" />
            <Stop offset="1" stopColor="#34904C" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="150" fill="url(#plot-sky)" />
        <Path
          d="M0 120 C70 104 130 116 200 112 C280 108 330 118 400 108 L400 150 L0 150 Z"
          fill="#D3E8BD"
        />
        {!total &&
          [128, 200, 272].map((x) => (
            <Path
              key={x}
              d={`M${x - 6} 138 Q${x - 8} 127 ${x} 114 Q${x + 8} 127 ${x + 6} 138 Z`}
              stroke="#8FBF6A"
              strokeWidth={1.6}
              strokeDasharray="4 4"
              fill="none"
            />
          ))}
        {stalks.map((st, i) => {
          const ground = 138 + st.jitter * 8;
          if (st.kind === 0)
            return (
              <G key={i}>
                <Path
                  d={`M${st.x - 5} ${ground} Q${st.x - 6.5} ${ground - 9} ${st.x} ${ground - 19 - st.jitter * 5} Q${st.x + 6.5} ${ground - 9} ${st.x + 5} ${ground} Z`}
                  fill="#A9D86E"
                />
                <Path
                  d={`M${st.x - 3.4} ${ground - 5} L${st.x} ${ground - 9} L${st.x + 3.4} ${ground - 5}`}
                  stroke="#6FA63C"
                  strokeWidth={1}
                  fill="none"
                />
              </G>
            );
          const tall = st.kind === 2,
            top = tall ? 14 + st.jitter * 22 : 66 + st.jitter * 20,
            w = tall ? 7.5 : 5.5;
          return (
            <G key={i}>
              <Cane
                x={st.x}
                top={top}
                bottom={ground}
                w={w}
                fill="url(#plot-cane)"
                node="#2B8448"
                lean={st.jitter > 0.5 ? 0.3 : -0.3}
              />
              <Spray
                x={st.x + w / 2}
                y={top + 8}
                scale={tall ? 0.42 : 0.3}
                flip={st.jitter > 0.5}
                fill="#62B86C"
                deep="#3E9A55"
                vein="#2B7A45"
              />
            </G>
          );
        })}
        <Path
          d="M0 142 C80 134 150 144 230 140 C300 136 350 144 400 138 L400 150 L0 150 Z"
          fill="#C4DFA9"
        />
      </Svg>
    </View>
  );
}

/**
 * One bamboo stalk, one segment per day. Grown segments are solid; the rest
 * are faint outlines waiting for their day.
 */
export function Bamboo({
  segments = 7,
  filled = 0,
  height = 132,
  width = 76,
}: {
  segments?: number;
  filled?: number;
  height?: number;
  width?: number;
}) {
  const sh = (height - 10) / segments,
    cx = width / 2 - 7,
    w = 11;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="streak-cane" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8FD47E" />
          <Stop offset="0.55" stopColor="#4FAE60" />
          <Stop offset="1" stopColor="#2F8C4A" />
        </LinearGradient>
      </Defs>
      {Array.from({ length: segments }, (_, i) => {
        const y = height - 5 - (i + 1) * sh,
          x = cx + i * 0.9,
          grown = i < filled,
          right = i % 2 === 0;
        return (
          <G key={i}>
            {grown && i > 0 && (
              <G
                transform={`translate(${x + (right ? w : 0)} ${y + sh - 1}) scale(${right ? 0.52 : -0.52} 0.52)`}
              >
                <Leaf len={44} angle={-34} fill="#62B86C" vein="#2B7A45" />
                <Leaf len={34} angle={-4} fill="#3E9A55" vein="#2B7A45" />
              </G>
            )}
            <Rect
              x={x}
              y={y + 1}
              width={w}
              height={sh - 2.6}
              rx={3.4}
              fill={grown ? "url(#streak-cane)" : "none"}
              stroke={grown ? "none" : C.faint}
              strokeWidth={1.2}
              strokeDasharray={grown ? undefined : "3 3"}
            />
            {grown && (
              <>
                <Rect
                  x={x + 2.2}
                  y={y + 4}
                  width={1.8}
                  height={sh - 9}
                  rx={0.9}
                  fill="#FFFFFF"
                  opacity={0.3}
                />
                <Rect
                  x={x - 0.8}
                  y={y + sh - 2.6}
                  width={w + 1.6}
                  height={2.8}
                  rx={1.4}
                  fill={C.primaryDeep}
                />
              </>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

/* ───────────────────────────── small pieces ───────────────────────────── */

/** A progress ring that fills with bamboo green. */
export function Ring({
  size = 120,
  progress,
  stroke = 10,
  color = C.primary,
  track = C.hair,
  children,
}: {
  size?: number;
  progress: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r,
    v = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        {v > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * v} ${c}`}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

/** 田字格 practice paper: the green-ruled square learners write inside. */
export function GridPaper({
  size,
  children,
  diagonal = true,
  style,
}: {
  size: number;
  children?: React.ReactNode;
  diagonal?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: C.card,
          borderWidth: 2,
          borderColor: "#A9D49A",
          borderRadius: Math.min(14, size * 0.14),
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <G
          stroke={C.primary}
          strokeWidth={1}
          strokeDasharray="4 5"
          opacity={0.28}
          fill="none"
        >
          <Line x1={size / 2} y1={0} x2={size / 2} y2={size} />
          <Line x1={0} y1={size / 2} x2={size} y2={size / 2} />
          {diagonal && <Line x1={0} y1={0} x2={size} y2={size} />}
          {diagonal && <Line x1={size} y1={0} x2={0} y2={size} />}
        </G>
      </Svg>
      {children}
    </View>
  );
}

/** A round badge with one to four characters, read top-down from the right. */
export function Stamp({
  text,
  size = 44,
  outline = false,
  color = C.primary,
  dim = false,
}: {
  text: string;
  size?: number;
  outline?: boolean;
  color?: string;
  dim?: boolean;
}) {
  const chars = Array.from(text).slice(0, 4),
    columns = chars.length > 2 ? [chars.slice(0, 2), chars.slice(2)] : [chars],
    font =
      chars.length === 1
        ? size * 0.54
        : chars.length === 2
          ? size * 0.34
          : size * 0.3;
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: outline ? "transparent" : color,
        borderWidth: outline ? 2 : 0,
        borderStyle: outline ? "dashed" : "solid",
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row-reverse",
        opacity: dim ? 0.38 : 1,
      }}
    >
      {!outline && (
        <View
          style={{
            position: "absolute",
            left: size * 0.07,
            right: size * 0.07,
            top: size * 0.07,
            bottom: size * 0.07,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,.45)",
          }}
        />
      )}
      {columns.map((column, i) => (
        <View key={i} style={{ alignItems: "center" }}>
          {column.map((ch, j) => (
            <Text
              key={j}
              style={{
                fontFamily: F.kaiBold,
                fontSize: font,
                lineHeight: font * 1.14,
                color: outline ? color : "#FFFFFF",
              }}
            >
              {ch}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Two small leaves, used under page headings. */
export function LeafRule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View accessible={false} style={style}>
      <Svg width={46} height={16} viewBox="0 0 46 16">
        <G transform="translate(2 12)">
          <Leaf len={22} angle={-18} fill="#62B86C" vein="#2B7A45" />
        </G>
        <G transform="translate(20 12)">
          <Leaf len={24} angle={-6} fill="#3E9A55" vein="#2B7A45" />
        </G>
      </Svg>
    </View>
  );
}

const CONTOURS = [
  "",
  "M6 7 L42 7",
  "M6 21 Q24 19 42 5",
  "M6 12 C12 27 21 29 27 23 S38 10 42 7",
  "M6 5 Q26 9 42 27",
];

/** The pitch shape of a tone on the five-level scale. */
export function ToneContour({
  tone,
  width = 48,
  color,
  guide = false,
}: {
  tone: number;
  width?: number;
  color?: string;
  guide?: boolean;
}) {
  const stroke = color || toneColors[tone] || C.muted;
  return (
    <Svg width={width} height={(width * 32) / 48} viewBox="0 0 48 32">
      {guide &&
        [5, 11, 17, 23, 29].map((y) => (
          <Line
            key={y}
            x1={2}
            y1={y}
            x2={46}
            y2={y}
            stroke={C.line}
            strokeWidth={0.7}
          />
        ))}
      {tone === 0 ? (
        <Circle cx={24} cy={18} r={3.6} fill={stroke} />
      ) : (
        <Path
          d={CONTOURS[tone]}
          stroke={stroke}
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </Svg>
  );
}
