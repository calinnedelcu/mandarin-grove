import React from "react";
import { View } from "react-native";
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
import { Leaf } from "./art";
import { PlaceId } from "./places";

// One small scene for each place on the Chengdu map, drawn on a 120 × 120
// board. They are pictures, not buttons: the map row carries the label.

function Station() {
  return (
    <>
      <Path d="M2 50 Q60 10 118 50 L118 58 Q60 20 2 58 Z" fill="#8FAFC6" />
      <Path
        d="M2 54 Q60 16 118 54"
        stroke="#C9DBE8"
        strokeWidth={1.4}
        fill="none"
      />
      <Rect x={12} y={54} width={4} height={50} fill="#7C98AD" />
      <Rect x={104} y={54} width={4} height={50} fill="#7C98AD" />
      <Circle
        cx={60}
        cy={30}
        r={7.5}
        fill="#FFFFFF"
        stroke="#7C98AD"
        strokeWidth={1.4}
      />
      <Path
        d="M60 25.5 V30 L63.4 32"
        stroke="#35506A"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={0} y={100} width={120} height={20} fill="#C9D3DA" />
      <Path
        d="M27 100 L27 68 Q27 46 50 44 L72 44 Q94 46 98 70 L102 100 Z"
        fill="#FFFFFF"
        stroke="#C2D0DA"
        strokeWidth={1.2}
      />
      <Path d="M37 66 Q39 52 52 51 L70 51 Q83 52 88 66 Z" fill="#26384A" />
      <Path
        d="M43 62 Q45 55 53 54.5 L60 54.5 L60 62 Z"
        fill="#4A6680"
        opacity={0.7}
      />
      <Path d="M27 78 L99.6 78 L101 87 L27 87 Z" fill="#3F8BC0" />
      <Path d="M27 89.5 L101.3 89.5" stroke="#E9604E" strokeWidth={1.6} />
      <Circle
        cx={38}
        cy={94.5}
        r={3}
        fill="#FBE29A"
        stroke="#D9B45A"
        strokeWidth={0.8}
      />
      <Circle
        cx={90}
        cy={94.5}
        r={3}
        fill="#FBE29A"
        stroke="#D9B45A"
        strokeWidth={0.8}
      />
      <Rect x={22} y={100} width={84} height={5} rx={2} fill="#4B5A66" />
      <Path d="M8 112 H112 M8 116 H112" stroke="#9AA9B4" strokeWidth={1.4} />
      <Path
        d="M20 109 V119 M40 109 V119 M60 109 V119 M80 109 V119 M100 109 V119"
        stroke="#B3C0C9"
        strokeWidth={2}
      />
    </>
  );
}

function Alley() {
  return (
    <>
      <Rect x={0} y={102} width={120} height={18} fill="#D6CFBB" />
      <Rect x={14} y={54} width={92} height={50} fill="#B4AEA0" />
      <Path
        d="M14 62 H106 M14 70 H106 M14 78 H106 M14 86 H106 M14 94 H106 M26 54 V62 M50 54 V62 M74 54 V62 M98 54 V62 M38 62 V70 M86 62 V70 M26 70 V78 M98 70 V78 M38 78 V86 M86 78 V86 M26 86 V94 M98 86 V94 M38 94 V104 M86 94 V104"
        stroke="#9C968A"
        strokeWidth={0.8}
      />
      <Path
        d="M2 56 Q16 53 24 40 L96 40 Q104 53 118 56 L114 61 L6 61 Z"
        fill="#3B4743"
      />
      <Path
        d="M24 40 L96 40 M20 46 H100 M14 52 H106"
        stroke="#55625D"
        strokeWidth={1}
      />
      <Rect x={28} y={33} width={64} height={7} rx={3.5} fill="#2A3431" />
      <Path
        d="M2 56 Q-1 52 3 49 M118 56 Q121 52 117 49"
        stroke="#3B4743"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={46} y={62} width={28} height={8} rx={1.5} fill="#2A3431" />
      <Path
        d="M50 66 H70"
        stroke="#E0B24A"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path d="M42 104 L42 80 Q60 66 78 80 L78 104 Z" fill="#8A2F23" />
      <Path d="M60 71.5 V104" stroke="#5E1D15" strokeWidth={1.2} />
      <Circle cx={55.5} cy={90} r={1.9} fill="#E0B24A" />
      <Circle cx={64.5} cy={90} r={1.9} fill="#E0B24A" />
      {[28, 92].map((x) => (
        <G key={x}>
          <Line
            x1={x}
            y1={61}
            x2={x}
            y2={68}
            stroke="#8A5A2B"
            strokeWidth={0.9}
          />
          <Rect x={x - 3} y={68} width={6} height={2.4} rx={1} fill="#E0B24A" />
          <Ellipse cx={x} cy={77} rx={6.4} ry={7.4} fill="url(#pl-red)" />
          <Rect
            x={x - 3}
            y={83.6}
            width={6}
            height={2.4}
            rx={1}
            fill="#E0B24A"
          />
          <Path
            d={`M${x} 86 V92`}
            stroke="#E0B24A"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </G>
      ))}
    </>
  );
}

function Teahouse() {
  return (
    <>
      <G transform="translate(98 26) scale(-1 1)">
        <Leaf len={30} angle={18} fill="#8FCB7C" vein="#3E9A55" />
        <Leaf len={24} angle={52} fill="#62B86C" vein="#2B7A45" />
      </G>
      <Ellipse cx={60} cy={104} rx={56} ry={13} fill="#C89A5C" />
      <Ellipse cx={60} cy={102} rx={56} ry={12} fill="#DDB274" />
      <Path
        d="M12 102 Q60 110 108 102"
        stroke="#C89A5C"
        strokeWidth={1}
        fill="none"
      />
      <Path
        d="M48 44 q-7 -8 0 -15 q6 -7 0 -13 M62 40 q-7 -8 0 -15 q6 -7 0 -13 M75 44 q-7 -8 0 -15 q6 -7 0 -13"
        stroke="#B5CBBB"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
        opacity={0.85}
      />
      <Ellipse
        cx={60}
        cy={95}
        rx={37}
        ry={8}
        fill="#FFFFFF"
        stroke="#C8D6CE"
        strokeWidth={1.2}
      />
      <Ellipse cx={60} cy={94} rx={26} ry={4.6} fill="#EAF1EC" />
      <Path
        d="M31 66 Q33 93 60 93 Q87 93 89 66 Z"
        fill="#FFFFFF"
        stroke="#C8D6CE"
        strokeWidth={1.2}
      />
      <Path
        d="M33 73 Q60 82 87 73"
        stroke="#3F8BC0"
        strokeWidth={2.6}
        fill="none"
      />
      <Path
        d="M44 82 q4 -4 8 0 t8 0 t8 0 t8 0"
        stroke="#3F8BC0"
        strokeWidth={1.3}
        fill="none"
        opacity={0.7}
      />
      <Ellipse cx={60} cy={66} rx={29} ry={6.4} fill="#D9E6DE" />
      <Ellipse
        cx={60}
        cy={63.5}
        rx={31}
        ry={7}
        fill="#FFFFFF"
        stroke="#C8D6CE"
        strokeWidth={1.2}
      />
      <Path
        d="M35 62 Q60 42 85 62 Q60 68 35 62 Z"
        fill="#FFFFFF"
        stroke="#C8D6CE"
        strokeWidth={1.2}
      />
      <Path
        d="M42 59 Q60 46 78 59"
        stroke="#3F8BC0"
        strokeWidth={1.6}
        fill="none"
        opacity={0.75}
      />
      <Ellipse cx={60} cy={50.5} rx={7} ry={3.6} fill="#3F8BC0" />
      <Ellipse cx={58} cy={49.6} rx={2.6} ry={1} fill="#FFFFFF" opacity={0.5} />
    </>
  );
}

function Snacks() {
  const stick = (x: number, lean: number, top: number) => (
    <G key={x} transform={`rotate(${lean} ${x} 104)`}>
      <Line
        x1={x}
        y1={104}
        x2={x}
        y2={top - 6}
        stroke="#B98A4E"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <G key={i}>
          <Circle cx={x} cy={top + 8 + i * 13.4} r={7.6} fill="url(#pl-red)" />
          <Ellipse
            cx={x - 2.6}
            cy={top + 5 + i * 13.4}
            rx={2.4}
            ry={1.5}
            fill="#FFFFFF"
            opacity={0.55}
          />
        </G>
      ))}
    </G>
  );
  return (
    <>
      <Path
        d="M-2 10 Q60 30 122 10"
        stroke="#8A5A2B"
        strokeWidth={1}
        fill="none"
      />
      {[
        [20, 15.5],
        [47, 21.5],
        [73, 21.5],
        [100, 15.5],
      ].map(([x, y]) => (
        <G key={x}>
          <Rect
            x={x - 2.6}
            y={y}
            width={5.2}
            height={2}
            rx={0.8}
            fill="#E0B24A"
          />
          <Ellipse cx={x} cy={y + 8} rx={5.4} ry={6.2} fill="url(#pl-red)" />
          <Rect
            x={x - 2.6}
            y={y + 13.6}
            width={5.2}
            height={2}
            rx={0.8}
            fill="#E0B24A"
          />
          <Path
            d={`M${x} ${y + 15.6} V${y + 20}`}
            stroke="#E0B24A"
            strokeWidth={1}
            strokeLinecap="round"
          />
        </G>
      ))}
      {stick(40, -10, 36)}
      {stick(60, 0, 30)}
      {stick(80, 10, 36)}
      <Path d="M26 100 Q60 92 94 100 L90 116 Q60 122 30 116 Z" fill="#D9B45A" />
      <Path
        d="M30 104 Q60 97 90 104 M31 109 Q60 103 89 109 M40 99 L42 117 M60 96.5 V119 M80 99 L78 117"
        stroke="#B58E3A"
        strokeWidth={1}
        fill="none"
      />
    </>
  );
}

function Pandas() {
  const cane = (x: number, w: number) => (
    <G key={x}>
      <Rect
        x={x}
        y={-4}
        width={w}
        height={128}
        rx={w / 3}
        fill="url(#pl-cane)"
      />
      {[26, 62, 98].map((y) => (
        <Rect
          key={y}
          x={x - 0.8}
          y={y}
          width={w + 1.6}
          height={2.6}
          rx={1.3}
          fill="#236F3D"
        />
      ))}
      <Rect
        x={x + w * 0.2}
        y={0}
        width={w * 0.17}
        height={120}
        fill="#FFFFFF"
        opacity={0.25}
      />
    </G>
  );
  return (
    <>
      {cane(8, 9)}
      {cane(101, 10)}
      {cane(24, 5)}
      <G transform="translate(17 30)">
        <Leaf len={26} angle={-20} fill="#62B86C" vein="#2B7A45" />
        <Leaf len={20} angle={18} fill="#3E9A55" vein="#2B7A45" />
      </G>
      <G transform="translate(103 64) scale(-1 1)">
        <Leaf len={28} angle={-24} fill="#62B86C" vein="#2B7A45" />
        <Leaf len={22} angle={12} fill="#3E9A55" vein="#2B7A45" />
      </G>
      <Ellipse cx={60} cy={112} rx={34} ry={7} fill="#143F2B" opacity={0.12} />
      <G transform="translate(-3 20) scale(0.63)">
        <Circle cx={50} cy={34} r={21.5} fill="url(#pl-ink)" />
        <Circle cx={150} cy={34} r={21.5} fill="url(#pl-ink)" />
        <Circle cx={51.5} cy={36.5} r={10} fill="#63736A" opacity={0.5} />
        <Circle cx={148.5} cy={36.5} r={10} fill="#63736A" opacity={0.5} />
        <Path
          d="M40 74 C40 38 66 18 100 18 C134 18 160 38 160 74 C160 105 136 127 100 127 C64 127 40 105 40 74 Z"
          fill="url(#pl-fur)"
          stroke="#CCD8C8"
          strokeWidth={1.6}
        />
        <Ellipse
          cx={72}
          cy={72}
          rx={15.5}
          ry={20}
          fill="url(#pl-ink)"
          transform="rotate(26 72 72)"
        />
        <Ellipse
          cx={128}
          cy={72}
          rx={15.5}
          ry={20}
          fill="url(#pl-ink)"
          transform="rotate(-26 128 72)"
        />
        <Path
          d="M67 74 Q75 63 83 74 M117 74 Q125 63 133 74"
          stroke="#FFFFFF"
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
        <Ellipse
          cx={57}
          cy={95}
          rx={9.5}
          ry={5.6}
          fill="#F08C7E"
          opacity={0.36}
        />
        <Ellipse
          cx={143}
          cy={95}
          rx={9.5}
          ry={5.6}
          fill="#F08C7E"
          opacity={0.36}
        />
        <Ellipse cx={100} cy={96} rx={21} ry={15} fill="#FFFFFF" />
        <Path d="M91 101 Q100 114 109 101 Z" fill="#D7675C" />
        <Path
          d="M91 86.5 Q100 81.5 109 86.5 Q108 94.5 100 96 Q92 94.5 91 86.5 Z"
          fill="#18211C"
        />
        <Path
          d="M100 96 V100.5 M100 100.5 Q94.5 106 89 101.5 M100 100.5 Q105.5 106 111 101.5"
          stroke="#18211C"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </>
  );
}

function Tower() {
  return (
    <>
      <Rect x={10} y={56} width={30} height={64} fill="#A9C1D3" />
      <Rect x={84} y={66} width={28} height={54} fill="#B9CEDD" />
      <Path
        d="M15 63 H35 M15 71 H35 M15 79 H35 M15 87 H35 M15 95 H35 M15 103 H35 M89 73 H107 M89 81 H107 M89 89 H107 M89 97 H107 M89 105 H107"
        stroke="#E4EEF5"
        strokeWidth={2.2}
      />
      <Rect x={38} y={34} width={48} height={86} fill="url(#pl-glass)" />
      <Path
        d="M46 34 V120 M54 34 V120 M62 34 V120 M70 34 V120 M78 34 V120"
        stroke="#FFFFFF"
        strokeWidth={0.9}
        opacity={0.45}
      />
      <Path
        d="M38 52 H86 M38 70 H86 M38 88 H86 M38 106 H86"
        stroke="#FFFFFF"
        strokeWidth={0.9}
        opacity={0.35}
      />
      <Rect x={36} y={32} width={52} height={4} rx={1.2} fill="#35506A" />
      {/* the panda climbing over the roof, seen from behind */}
      <Ellipse
        cx={47}
        cy={30}
        rx={8}
        ry={12}
        fill="url(#pl-ink)"
        transform="rotate(34 47 30)"
      />
      <Ellipse
        cx={77}
        cy={30}
        rx={8}
        ry={12}
        fill="url(#pl-ink)"
        transform="rotate(-34 77 30)"
      />
      <Ellipse
        cx={62}
        cy={32}
        rx={17}
        ry={14}
        fill="url(#pl-fur)"
        stroke="#CCD8C8"
        strokeWidth={0.9}
      />
      <Circle cx={62} cy={41} r={3.4} fill="#27332C" />
      <Circle cx={52} cy={8.5} r={5.4} fill="url(#pl-ink)" />
      <Circle cx={72} cy={8.5} r={5.4} fill="url(#pl-ink)" />
      <Ellipse
        cx={62}
        cy={16}
        rx={12.5}
        ry={10.5}
        fill="url(#pl-fur)"
        stroke="#CCD8C8"
        strokeWidth={0.9}
      />
      <Rect x={0} y={112} width={120} height={8} fill="#C9D3DA" />
      <Path d="M40 112 L44 100 H80 L84 112 Z" fill="#E9604E" />
      <Path
        d="M48 100 L46 112 M56 100 V112 M64 100 V112 M72 100 L74 112"
        stroke="#FFFFFF"
        strokeWidth={1.4}
        opacity={0.75}
      />
    </>
  );
}

function Campus() {
  return (
    <>
      <Ellipse cx={60} cy={104} rx={50} ry={7} fill="#5B3E78" opacity={0.14} />
      <Path d="M60 50 L60 102" stroke="#BBA9CC" strokeWidth={2} />
      <Path
        d="M14 46 Q38 36 60 50 L60 102 Q38 90 14 98 Z"
        fill="#FFFFFF"
        stroke="#CDBFDB"
        strokeWidth={1.2}
      />
      <Path
        d="M106 46 Q82 36 60 50 L60 102 Q82 90 106 98 Z"
        fill="#FFFFFF"
        stroke="#CDBFDB"
        strokeWidth={1.2}
      />
      <Path
        d="M22 55 Q38 49 53 57 M22 64 Q38 58 53 66 M22 73 Q38 67 53 75 M22 82 Q38 76 53 84"
        stroke="#CDBFDB"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M80 55 L83.5 59.5 M67 64 H95 M89 65 Q84 80 68 89 M74 67 Q82 82 96 89"
        stroke="#27332C"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={88} y={84} width={10} height={10} rx={2} fill="#E9604E" />
      <Path
        d="M90.5 89 H95.5 M93 86.5 V91.5"
        stroke="#FFFFFF"
        strokeWidth={1.2}
      />
      <G transform="rotate(34 92 30)">
        <Rect x={89} y={-2} width={6} height={40} rx={3} fill="#B98A4E" />
        <Rect
          x={89}
          y={-2}
          width={2}
          height={40}
          rx={1}
          fill="#FFFFFF"
          opacity={0.3}
        />
        <Rect x={88} y={36} width={8} height={6} rx={1.4} fill="#E0B24A" />
        <Path d="M88.6 42 Q92 60 92 62 Q92 60 95.4 42 Z" fill="#27332C" />
      </G>
    </>
  );
}

const scenes: Record<PlaceId, [() => React.ReactElement, string, string]> = {
  station: [Station, "#EAF4FB", "#D3E6F3"],
  kuanzhai: [Alley, "#F7F3E8", "#EDE5D2"],
  park: [Teahouse, "#F0F8E6", "#DDF0CD"],
  jinli: [Snacks, "#FEF6DD", "#FBE9B8"],
  pandas: [Pandas, "#E4F5DB", "#C9E9BB"],
  chunxi: [Tower, "#EAF4FB", "#D3E6F3"],
  university: [Campus, "#F4ECF8", "#E6D8EF"],
};

export function PlaceArt({
  place,
  size = 104,
}: {
  place: PlaceId;
  size?: number;
}) {
  const [Scene, top, bottom] = scenes[place];
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        overflow: "hidden",
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id={`pl-sky-${place}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
          <RadialGradient id="pl-red" cx="38%" cy="32%" r="75%">
            <Stop offset="0" stopColor="#FF8E6A" />
            <Stop offset="0.6" stopColor="#E5472F" />
            <Stop offset="1" stopColor="#BE2B1C" />
          </RadialGradient>
          <RadialGradient id="pl-fur" cx="38%" cy="28%" r="80%">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.7" stopColor="#F6F9F3" />
            <Stop offset="1" stopColor="#DFE8DA" />
          </RadialGradient>
          <RadialGradient id="pl-ink" cx="34%" cy="24%" r="85%">
            <Stop offset="0" stopColor="#4A5850" />
            <Stop offset="0.6" stopColor="#27332C" />
            <Stop offset="1" stopColor="#161F1A" />
          </RadialGradient>
          <LinearGradient id="pl-cane" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#9BDB86" />
            <Stop offset="0.55" stopColor="#57B466" />
            <Stop offset="1" stopColor="#30904C" />
          </LinearGradient>
          <LinearGradient id="pl-glass" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8DBBDC" />
            <Stop offset="1" stopColor="#4F86B4" />
          </LinearGradient>
        </Defs>
        <Rect width={120} height={120} fill={`url(#pl-sky-${place})`} />
        <Scene />
      </Svg>
    </View>
  );
}
