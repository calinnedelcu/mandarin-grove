import React from "react";
import { Text, View } from "react-native";
import { AppCtx } from "../app";
import { C } from "../theme";
import { Icon, IconButton, s } from "../ui";

/** A one-time note at the top of a screen, gone for good once dismissed. */
export function Tip({
  id,
  app,
  children,
}: {
  id: string;
  app: AppCtx;
  children: string;
}) {
  if (app.p.hints?.includes(id)) return null;
  return (
    <View
      style={[
        s.line,
        {
          gap: 10,
          alignItems: "flex-start",
          backgroundColor: C.amberWash,
          borderRadius: 18,
          paddingLeft: 14,
          paddingVertical: 6,
          marginBottom: 14,
        },
      ]}
    >
      <View style={{ paddingTop: 11 }}>
        <Icon name="bulb-outline" size={19} color={C.amberDeep} />
      </View>
      <Text style={[s.body, { flex: 1, paddingVertical: 9 }]}>{children}</Text>
      <IconButton
        plain
        size={18}
        color={C.amberDeep}
        name="close"
        label="Dismiss tip"
        onPress={() =>
          app.update((prev) => ({
            ...prev,
            hints: [...(prev.hints || []), id],
          }))
        }
      />
    </View>
  );
}
