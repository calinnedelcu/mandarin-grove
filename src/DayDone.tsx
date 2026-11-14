import React from "react";
import { Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dayPart, GroveScene } from "./art";
import { LeafFall } from "./LeafFall";
import { Outfit, Panda } from "./Panda";
import { C, s } from "./theme";
import { Button, Zh } from "./ui";

/** Shown once a day, when all three of the day's steps are done. */
export function DayDone({
  xp,
  streak,
  planted,
  outfit,
  onClose,
}: {
  xp: number;
  streak: number;
  planted: number;
  outfit: Outfit;
  onClose: () => void;
}) {
  const night = dayPart() === "night";
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[s.root, night && { backgroundColor: C.forest }]}>
        <GroveScene height={520} time={dayPart()} />
        <LeafFall />
        <View style={[s.shell, s.center, { padding: 24, gap: 6 }]}>
          <Panda size={200} cheer mood="happy" outfit={outfit} />
          <Zh
            size={46}
            bold
            color={night ? C.onDark : C.forest}
            style={{ lineHeight: 58, marginTop: 6 }}
          >
            太棒了！
          </Zh>
          <Text style={[s.pinyin, night && { color: C.onDarkMuted }]}>
            tài bàng le · Wonderful!
          </Text>
          <Text
            style={[
              s.title,
              { textAlign: "center", marginTop: 10 },
              night && { color: C.onDark },
            ]}
          >
            Today's path is walked.
          </Text>
          <View style={[s.row, { width: "100%", marginTop: 18 }]}>
            {[
              [`+${xp}`, "XP today"],
              [`${streak}`, streak === 1 ? "day streak" : "days in a row"],
              [`${planted}`, "words planted"],
            ].map(([value, label]) => (
              <View key={label} style={[s.statCard, { alignItems: "center" }]}>
                <Text style={s.statNumber}>{value}</Text>
                <Text style={[s.caption, { textAlign: "center" }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ width: "100%", marginTop: 8 }}>
            <Button label="Done for today" onPress={onClose} />
          </View>
          <Text
            style={[
              s.caption,
              { textAlign: "center", marginTop: 10 },
              night && { color: C.onDarkMuted },
            ]}
          >
            The panda is fed. Anything more is a gift to tomorrow.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
