import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Leaf } from "./art";
import { C } from "./theme";

// The grove's panda, drawn in three stacked layers so each part can move on
// its own: the body breathes, the head sways, bobs and shakes, and the bamboo
// tips towards the mouth. Blinking and chewing swap shapes on the face.

export type PandaMood = "calm" | "happy" | "sleepy" | "oops" | "wow" | "hungry";
/** Things the panda can wear, earned one rank at a time. */
export type Outfit = "none" | "sprout" | "flower" | "scarf" | "hat" | "medal";

const native = Platform.OS !== "web";
let reduceMotion = false;
void AccessibilityInfo.isReduceMotionEnabled()
  .then((v) => (reduceMotion = v))
  .catch(() => {});
AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
  reduceMotion = v;
});

const FUR = "url(#panda-fur)",
  INK = "url(#panda-ink)",
  PAD = "#7C8A81";

function Gradients() {
  return (
    <Defs>
      <RadialGradient id="panda-fur" cx="38%" cy="28%" r="80%">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.7" stopColor="#F6F9F3" />
        <Stop offset="1" stopColor="#DFE8DA" />
      </RadialGradient>
      <RadialGradient id="panda-ink" cx="34%" cy="24%" r="85%">
        <Stop offset="0" stopColor="#4A5850" />
        <Stop offset="0.6" stopColor="#27332C" />
        <Stop offset="1" stopColor="#161F1A" />
      </RadialGradient>
      <LinearGradient id="panda-straw" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F6E3A1" />
        <Stop offset="1" stopColor="#D6AE52" />
      </LinearGradient>
      <RadialGradient id="panda-gold" cx="38%" cy="32%" r="75%">
        <Stop offset="0" stopColor="#FFF0A8" />
        <Stop offset="0.6" stopColor="#F2C23C" />
        <Stop offset="1" stopColor="#C8901A" />
      </RadialGradient>
      <LinearGradient id="panda-cane" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#9BDB86" />
        <Stop offset="0.55" stopColor="#57B466" />
        <Stop offset="1" stopColor="#30904C" />
      </LinearGradient>
    </Defs>
  );
}

function Arm({ cx, cy, angle }: { cx: number; cy: number; angle: number }) {
  return (
    <Ellipse
      cx={cx}
      cy={cy}
      rx={17}
      ry={30}
      fill={INK}
      transform={`rotate(${angle} ${cx} ${cy})`}
    />
  );
}

function Foot({ flip = false }: { flip?: boolean }) {
  return (
    <G transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      <Ellipse
        cx={58}
        cy={171}
        rx={26}
        ry={19}
        fill={INK}
        transform="rotate(-14 58 171)"
      />
      <Ellipse cx={57} cy={175} rx={11.5} ry={8} fill={PAD} />
      <Circle cx={45} cy={163} r={4.3} fill={PAD} />
      <Circle cx={55} cy={158.5} r={4.6} fill={PAD} />
      <Circle cx={66} cy={160} r={4.3} fill={PAD} />
    </G>
  );
}

function Body({
  bamboo,
  cheer,
  mood,
  outfit,
}: {
  bamboo: boolean;
  cheer: boolean;
  mood: PandaMood;
  outfit: Outfit;
}) {
  return (
    <>
      <Ellipse cx={100} cy={118} rx={58} ry={31} fill={INK} />
      <Ellipse
        cx={100}
        cy={147}
        rx={50}
        ry={42}
        fill={FUR}
        stroke="#CCD8C8"
        strokeWidth={1.2}
      />
      <Ellipse
        cx={100}
        cy={166}
        rx={32}
        ry={15}
        fill="#DCE6D6"
        opacity={0.55}
      />
      <Foot />
      <Foot flip />
      {cheer ? (
        <>
          <Arm cx={37} cy={101} angle={-36} />
          <Arm cx={163} cy={101} angle={36} />
        </>
      ) : bamboo ? (
        <>
          <Arm cx={60} cy={134} angle={34} />
          <Arm cx={143} cy={128} angle={-34} />
        </>
      ) : (
        <>
          <Arm cx={55} cy={133} angle={18} />
          <Arm cx={145} cy={133} angle={-18} />
        </>
      )}
      {mood === "hungry" && (
        <Path
          d="M86 149 q4 -3.4 8 0 t8 0 t8 0 M90 158 q4 -3.4 8 0 t8 0"
          stroke="#9AA79E"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {outfit === "scarf" && (
        <>
          <Path d="M80 130 L73 161 L91 164 L95 133 Z" fill="#E5472F" />
          <Path
            d="M74.6 153 L92 156 M76 146.5 L93 149.5"
            stroke="#FBE29A"
            strokeWidth={2.2}
          />
          <Path
            d="M54 110 C70 127 130 127 146 110 C149 121 141 132 128 136 C110 141 90 141 72 136 C59 132 51 121 54 110 Z"
            fill="#E5472F"
          />
          <Path
            d="M60 119 C78 132 122 132 140 119"
            stroke="#C2301F"
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
            opacity={0.65}
          />
        </>
      )}
      {outfit === "medal" && (
        <>
          <Path
            d="M84 124 L100 153 L116 124 L108.5 124 L100 140 L91.5 124 Z"
            fill="#D9503F"
          />
          <Circle cx={100} cy={156} r={11} fill="url(#panda-gold)" />
          <Circle
            cx={100}
            cy={156}
            r={7.6}
            stroke="#C8901A"
            strokeWidth={1}
            fill="none"
            opacity={0.8}
          />
          <Path
            d="M100 150.4 L101.7 154.2 L105.8 154.6 L102.7 157.3 L103.6 161.3 L100 159.2 L96.4 161.3 L97.3 157.3 L94.2 154.6 L98.3 154.2 Z"
            fill="#FFF6C9"
          />
        </>
      )}
    </>
  );
}

function Eye({
  cx,
  mood,
  closed,
}: {
  cx: number;
  mood: PandaMood;
  closed: boolean;
}) {
  if (mood === "happy")
    return (
      <Path
        d={`M${cx - 8} 74 Q${cx} 63 ${cx + 8} 74`}
        stroke="#FFFFFF"
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
      />
    );
  if (mood === "sleepy" || closed)
    return (
      <Path
        d={`M${cx - 8} 69 Q${cx} 77 ${cx + 8} 69`}
        stroke="#FFFFFF"
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
      />
    );
  const r = mood === "wow" ? 8.6 : 7,
    down = mood === "oops" || mood === "hungry" ? 2.4 : 0;
  return (
    <G>
      <Circle cx={cx} cy={70 + down} r={r} fill="#FFFFFF" />
      <Circle cx={cx + 0.5} cy={70.6 + down} r={r * 0.7} fill="#2A1C12" />
      <Circle cx={cx - 1.6} cy={68 + down} r={r * 0.28} fill="#FFFFFF" />
      <Circle
        cx={cx + 2.3}
        cy={72.6 + down}
        r={r * 0.13}
        fill="#FFFFFF"
        opacity={0.85}
      />
    </G>
  );
}

function Head({
  mood,
  closed,
  chewing,
  outfit,
}: {
  mood: PandaMood;
  closed: boolean;
  chewing: boolean;
  outfit: Outfit;
}) {
  return (
    <>
      {[50, 150].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={34} r={21.5} fill={INK} />
          <Circle
            cx={cx + (cx < 100 ? 1.5 : -1.5)}
            cy={36.5}
            r={10}
            fill="#63736A"
            opacity={0.5}
          />
        </G>
      ))}
      <Path
        d="M40 74 C40 38 66 18 100 18 C134 18 160 38 160 74 C160 105 136 127 100 127 C64 127 40 105 40 74 Z"
        fill={FUR}
        stroke="#CCD8C8"
        strokeWidth={1.2}
      />
      <Path
        d="M62 30 C74 22 90 19 100 19 C110 19 126 22 138 30 C126 26 112 24 100 24 C88 24 74 26 62 30 Z"
        fill="#FFFFFF"
        opacity={0.9}
      />
      <Ellipse
        cx={72}
        cy={72}
        rx={15.5}
        ry={20}
        fill={INK}
        transform="rotate(26 72 72)"
      />
      <Ellipse
        cx={128}
        cy={72}
        rx={15.5}
        ry={20}
        fill={INK}
        transform="rotate(-26 128 72)"
      />
      <Eye cx={75} mood={mood} closed={closed} />
      <Eye cx={125} mood={mood} closed={closed} />
      <Ellipse
        cx={57}
        cy={95}
        rx={chewing ? 11 : 9.5}
        ry={chewing ? 6.6 : 5.6}
        fill="#F08C7E"
        opacity={0.34}
      />
      <Ellipse
        cx={143}
        cy={95}
        rx={chewing ? 11 : 9.5}
        ry={chewing ? 6.6 : 5.6}
        fill="#F08C7E"
        opacity={0.34}
      />
      <Ellipse cx={100} cy={96} rx={21} ry={chewing ? 16 : 15} fill="#FFFFFF" />
      <Path
        d="M83 102 Q100 115 117 102"
        stroke="#DCE5D7"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      {(mood === "happy" || mood === "wow" || chewing) && (
        <Path
          d={
            chewing
              ? "M94 101 Q100 110 106 101 Q100 98.5 94 101 Z"
              : mood === "wow"
                ? "M95 101 Q100 111 105 101 Q100 98 95 101 Z"
                : "M91 101 Q100 114 109 101 Z"
          }
          fill="#D7675C"
        />
      )}
      <Path
        d="M91 86.5 Q100 81.5 109 86.5 Q108 94.5 100 96 Q92 94.5 91 86.5 Z"
        fill="#18211C"
      />
      <Ellipse
        cx={97}
        cy={87}
        rx={3.2}
        ry={1.4}
        fill="#FFFFFF"
        opacity={0.38}
      />
      <Path
        d={
          mood === "oops" || mood === "hungry"
            ? "M100 96 V99 M92 105 Q100 99 108 105"
            : mood === "sleepy"
              ? "M100 96 V99.5 M95 101 Q100 104.5 105 101"
              : "M100 96 V100.5 M100 100.5 Q94.5 106 89 101.5 M100 100.5 Q105.5 106 111 101.5"
        }
        stroke="#18211C"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {mood === "oops" && (
        <Path
          d="M156 40 Q162 50 156 54 Q150 50 156 40 Z"
          fill="#7CC1EC"
          opacity={0.9}
        />
      )}
      {outfit === "sprout" && (
        <>
          <Path
            d="M100 21 Q98.6 12 100 5"
            stroke="#3E9A55"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
          <G transform="translate(100 7)">
            <Leaf len={19} angle={-32} fill="#62B86C" vein="#2B7A45" />
          </G>
          <G transform="translate(100 9) scale(-1 1)">
            <Leaf len={16} angle={-28} fill="#3E9A55" vein="#2B7A45" />
          </G>
        </>
      )}
      {outfit === "flower" && (
        <>
          {[0, 72, 144, 216, 288].map((angle) => (
            <Ellipse
              key={angle}
              cx={138}
              cy={21.5}
              rx={5.8}
              ry={8.4}
              fill="#F58FA4"
              stroke="#E0607A"
              strokeWidth={0.7}
              transform={`rotate(${angle} 138 29)`}
            />
          ))}
          <Circle cx={138} cy={29} r={3.8} fill="#FBD66A" />
        </>
      )}
      {outfit === "hat" && (
        <>
          <Ellipse cx={100} cy={42} rx={73} ry={9.5} fill="#C39A45" />
          <Path
            d="M27 42 L100 5 L173 42 Q100 57 27 42 Z"
            fill="url(#panda-straw)"
          />
          <Path
            d="M100 5 L58 46 M100 5 L79 49.5 M100 5 L100 50.5 M100 5 L121 49.5 M100 5 L142 46 M50 31 Q100 42 150 31 M72 20 Q100 26.5 128 20"
            stroke="#B0832F"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
        </>
      )}
    </>
  );
}

function Cane() {
  return (
    <>
      <G transform="rotate(26 132 118)">
        <Rect
          x={126}
          y={36}
          width={12}
          height={44}
          rx={4}
          fill="url(#panda-cane)"
        />
        <Rect
          x={126}
          y={82}
          width={12}
          height={46}
          rx={4}
          fill="url(#panda-cane)"
        />
        <Rect
          x={126}
          y={130}
          width={12}
          height={40}
          rx={4}
          fill="url(#panda-cane)"
        />
        <Rect
          x={128.4}
          y={40}
          width={2.2}
          height={36}
          rx={1.1}
          fill="#FFFFFF"
          opacity={0.32}
        />
        <Rect
          x={128.4}
          y={86}
          width={2.2}
          height={38}
          rx={1.1}
          fill="#FFFFFF"
          opacity={0.32}
        />
        <Rect
          x={128.4}
          y={134}
          width={2.2}
          height={32}
          rx={1.1}
          fill="#FFFFFF"
          opacity={0.32}
        />
        <Rect
          x={124.6}
          y={79.4}
          width={14.8}
          height={3.2}
          rx={1.6}
          fill="#236F3D"
        />
        <Rect
          x={124.6}
          y={127.4}
          width={14.8}
          height={3.2}
          rx={1.6}
          fill="#236F3D"
        />
        <G transform="translate(136 62)">
          <Leaf len={40} angle={-48} fill="#62B86C" vein="#2B7A45" />
          <Leaf len={34} angle={-14} fill="#3E9A55" vein="#2B7A45" />
        </G>
        <G transform="translate(127 46) scale(-1 1)">
          <Leaf len={32} angle={-56} fill="#3E9A55" vein="#2B7A45" />
          <Leaf len={38} angle={-22} fill="#62B86C" vein="#2B7A45" />
        </G>
      </G>
      <Ellipse cx={133} cy={139} rx={15} ry={12.5} fill={INK} />
    </>
  );
}

/**
 * `bamboo` gives the panda a cane to chew, `cheer` raises both arms and makes
 * it hop, and `head` crops the drawing to the face. Change `pulse` to make it
 * hop once and smile, for example when it is tapped. `still` switches every
 * movement off, for tiny pandas such as the logo.
 */
export function Panda({
  size = 160,
  mood = "calm",
  bamboo = false,
  cheer = false,
  head = false,
  still = false,
  pop = false,
  pulse = 0,
  outfit = "none",
  style,
}: {
  size?: number;
  mood?: PandaMood;
  bamboo?: boolean;
  cheer?: boolean;
  head?: boolean;
  still?: boolean;
  pop?: boolean;
  pulse?: number;
  outfit?: Outfit;
  style?: StyleProp<ViewStyle>;
}) {
  const [closed, setClosed] = useState(false),
    [chewing, setChewing] = useState(false),
    [joy, setJoy] = useState(false);
  const breath = useRef(new Animated.Value(0)).current,
    sway = useRef(new Animated.Value(0)).current,
    hop = useRef(new Animated.Value(0)).current,
    shake = useRef(new Animated.Value(0)).current,
    nibble = useRef(new Animated.Value(0)).current,
    doze = useRef(new Animated.Value(0)).current,
    entrance = useRef(new Animated.Value(pop ? 0 : 1)).current;
  const face: PandaMood = joy && mood === "calm" ? "happy" : mood,
    moving = !still && !reduceMotion;
  const height = head ? size * 0.9 : size,
    // The face crop leaves room above the ears for a sprout or a hat.
    box = head ? "22 -6 156 146" : "0 0 200 200",
    // The neck, in pixels, so the head turns about the right point.
    neck = head
      ? `${(78 / 156) * size}px ${(130 / 146) * height}px`
      : `${size / 2}px ${0.62 * size}px`;
  const tween = (
    value: Animated.Value,
    toValue: number,
    duration: number,
    easing = Easing.inOut(Easing.sin),
  ) =>
    Animated.timing(value, {
      toValue,
      duration,
      easing,
      useNativeDriver: native,
    });
  const hopOnce = () =>
    Animated.sequence([
      tween(hop, 1, 170, Easing.out(Easing.quad)),
      tween(hop, 0, 240, Easing.in(Easing.quad)),
    ]);

  // Breathing and a slow sway of the head.
  useEffect(() => {
    if (!moving) return;
    const pace = mood === "sleepy" ? 2100 : 1400;
    const loops = [
      Animated.loop(
        Animated.sequence([tween(breath, 1, pace), tween(breath, 0, pace)]),
      ),
      Animated.loop(
        Animated.sequence([
          tween(sway, 1, 2600),
          tween(sway, -1, 5200),
          tween(sway, 0, 2600),
        ]),
      ),
    ];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [moving, mood]);

  // Blinking, at uneven intervals, with the odd double blink.
  useEffect(() => {
    if (!moving || (face !== "calm" && face !== "hungry")) {
      setClosed(false);
      return;
    }
    let timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number, then: () => void) =>
      timers.push(setTimeout(then, ms));
    const blink = (again: boolean) => {
      setClosed(true);
      wait(130, () => {
        setClosed(false);
        if (again) wait(160, () => blink(false));
        else
          wait(2400 + Math.random() * 3200, () => blink(Math.random() < 0.2));
      });
    };
    wait(900 + Math.random() * 2000, () => blink(false));
    return () => timers.forEach(clearTimeout);
  }, [moving, face]);

  // Eating: every few seconds the cane tips to the mouth for a bout of chewing.
  useEffect(() => {
    if (!moving || !bamboo || head) return;
    let timers: ReturnType<typeof setTimeout>[] = [],
      munch: ReturnType<typeof setInterval> | undefined;
    const wait = (ms: number, then: () => void) =>
      timers.push(setTimeout(then, ms));
    const bout = () => {
      tween(nibble, 1, 260).start();
      wait(220, () => {
        munch = setInterval(() => setChewing((v) => !v), 190);
      });
      wait(1900, () => {
        clearInterval(munch);
        setChewing(false);
        tween(nibble, 0, 320).start();
        wait(2200 + Math.random() * 2400, bout);
      });
    };
    wait(1200, bout);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(munch);
      setChewing(false);
      nibble.setValue(0);
    };
  }, [moving, bamboo, head]);

  // Celebration: two hops, a rest, again.
  useEffect(() => {
    if (!moving || !(cheer || mood === "wow")) return;
    const loop = Animated.loop(
      Animated.sequence([hopOnce(), hopOnce(), Animated.delay(1300)]),
    );
    loop.start();
    return () => {
      loop.stop();
      hop.setValue(0);
    };
  }, [moving, cheer, mood]);

  // A mistake: one shake of the head.
  useEffect(() => {
    if (!moving || mood !== "oops") return;
    const once = Animated.sequence(
      [1, -1, 0.7, -0.7, 0].map((v) => tween(shake, v, 90)),
    );
    once.start();
    return () => {
      once.stop();
      shake.setValue(0);
    };
  }, [moving, mood]);

  // Asleep: the Zs drift up and fade.
  useEffect(() => {
    if (!moving || mood !== "sleepy") return;
    const loop = Animated.loop(
      Animated.sequence([
        tween(doze, 1, 2400, Easing.out(Easing.quad)),
        Animated.delay(500),
        tween(doze, 0, 1),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, mood]);

  // Entrance and reaction to a tap.
  useEffect(() => {
    if (!pop) return;
    if (!moving) entrance.setValue(1);
    else
      Animated.spring(entrance, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: native,
      }).start();
  }, [pop, moving]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setJoy(true);
    const timer = setTimeout(() => setJoy(false), 1100);
    if (moving) Animated.sequence([hopOnce(), hopOnce()]).start();
    return () => clearTimeout(timer);
  }, [pulse]);

  const unit = size / 200;
  return (
    <Animated.View
      accessible={false}
      style={[
        { width: size, height },
        style,
        {
          transform: [
            {
              translateY: hop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -14 * unit],
              }),
            },
            { scale: entrance },
          ],
        },
      ]}
    >
      {!head && (
        <>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" viewBox={box}>
              <Ellipse
                cx={100}
                cy={189}
                rx={66}
                ry={7}
                fill="#143F2B"
                opacity={0.13}
              />
            </Svg>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                transformOrigin: `${size / 2}px ${0.95 * size}px`,
                transform: [
                  {
                    scaleY: breath.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, mood === "sleepy" ? 1.03 : 1.018],
                    }),
                  },
                ],
              },
            ]}
          >
            <Svg width="100%" height="100%" viewBox={box}>
              <Gradients />
              <Body bamboo={bamboo} cheer={cheer} mood={face} outfit={outfit} />
            </Svg>
          </Animated.View>
        </>
      )}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            transformOrigin: neck,
            transform: [
              {
                translateY: Animated.add(
                  breath.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, (head ? -1 : -2.2) * unit],
                  }),
                  nibble.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 2 * unit],
                  }),
                ),
              },
              {
                rotate: sway.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ["-2.4deg", "2.4deg"],
                }),
              },
              {
                rotate: shake.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ["-9deg", "9deg"],
                }),
              },
              {
                rotate: nibble.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "4deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox={box}>
          <Gradients />
          <Head mood={face} closed={closed} chewing={chewing} outfit={outfit} />
        </Svg>
      </Animated.View>
      {bamboo && !head && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              // The cane pivots in the paw that holds it.
              transformOrigin: `${0.665 * size}px ${0.695 * size}px`,
              transform: [
                {
                  rotate: nibble.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-7deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox={box}>
            <Gradients />
            <Cane />
          </Svg>
        </Animated.View>
      )}
      {mood === "sleepy" && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: moving
                ? doze.interpolate({
                    inputRange: [0, 0.15, 0.75, 1],
                    outputRange: [0, 1, 1, 0],
                  })
                : 1,
              transform: [
                {
                  translateY: doze.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6 * unit, -8 * unit],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox={box}>
            <G
              stroke={C.primary}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <Path d="M152 38 h9 l-9 10 h9" />
              <Path d="M164 20 h6.5 l-6.5 7.5 h6.5" opacity={0.7} />
            </G>
          </Svg>
        </Animated.View>
      )}
    </Animated.View>
  );
}
