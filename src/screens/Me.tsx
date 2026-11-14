import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppCtx } from "../app";
import { Bamboo, GrovePlot, GroveScene, Ring, Stamp } from "../art";
import { Panda } from "../Panda";
import { Level, lessons, words } from "../content";
import { achievements, outfitFor, rankFor, wardrobe } from "../extras";
import { dayKey } from "../learning";
import { C, F } from "../theme";
import { Meter, s, Section, Segmented, Stat, Zh } from "../ui";
import { SettingsBody } from "../Settings";

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

export function Me({ app }: { app: AppCtx }) {
  const { p, deck, streak } = app;
  const [view, setView] = useState<"Panda" | "Progress" | "Settings">("Panda"),
    [picked, setPicked] = useState(""),
    [seal, setSeal] = useState("");
  const rank = rankFor(p.xp),
    goal = p.settings.dailyGoal,
    earned = achievements(p, new Date(app.now));
  const totals = Object.values(p.activity).reduce(
    (a, b) => ({
      readSeconds: a.readSeconds + b.readSeconds,
      reviews: a.reviews + b.reviews,
    }),
    { readSeconds: 0, reviews: 0 },
  );
  const attempts = p.quizzes.reduce((n, q) => n + q.total, 0),
    correct = p.quizzes.reduce((n, q) => n + q.score, 0);
  const day = (back: number) => {
    const d = new Date(app.now);
    d.setDate(d.getDate() - back);
    return d;
  };
  const week = Array.from({ length: 7 }, (_, i) => day(6 - i));
  // Twelve whole weeks, ending with the current one, Monday first.
  const lead = (new Date(app.now).getDay() + 6) % 7,
    grid = Array.from({ length: 12 }, (_, col) =>
      Array.from({ length: 7 }, (_, row) => {
        const back = (11 - col) * 7 + (lead - row);
        return back < 0 ? null : day(back);
      }),
    );
  const pickedSeal = earned.find((a) => a.title === seal);

  return (
    <>
      <Segmented
        options={["Panda", "Progress", "Settings"] as const}
        value={view}
        onChange={setView}
      />
      {view === "Panda" && (
        <>
          <View style={[s.darkCard, { paddingBottom: 24 }]}>
            <GroveScene dark sun={false} height={220} />
            <View style={[s.line, { gap: 16 }]}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: C.forestSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Panda head size={76} mood="happy" outfit={outfitFor(p)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.eyebrow, { color: C.onDarkMuted }]}>
                  Rank {rank.index + 1} · {rank.zh} {rank.pinyin}
                </Text>
                <Text
                  style={{
                    fontFamily: F.displayBold,
                    fontSize: 28,
                    lineHeight: 33,
                    color: C.onDark,
                  }}
                >
                  {rank.en}
                </Text>
              </View>
            </View>
            <View style={[s.row, { marginTop: 18, alignItems: "flex-end" }]}>
              <Text
                style={{
                  fontFamily: F.displayBold,
                  fontSize: 38,
                  lineHeight: 44,
                  color: C.onDark,
                }}
              >
                {p.xp}
                <Text style={{ fontSize: 20 }}> XP</Text>
              </Text>
              <Text
                style={[s.caption, { color: C.onDarkMuted, marginBottom: 8 }]}
              >
                {rank.next
                  ? `${rank.toNext} XP to ${rank.next.en.toLowerCase()}`
                  : "The grove is yours"}
              </Text>
            </View>
            <Meter
              value={rank.progress * 100}
              color={C.lime}
              track="rgba(243,249,236,.18)"
            />
          </View>

          <View style={[s.card, s.line, { gap: 6, paddingVertical: 14 }]}>
            <Bamboo segments={7} filled={Math.min(7, streak)} height={128} />
            <View style={{ flex: 1 }}>
              <View style={[s.line, { alignItems: "flex-end", gap: 8 }]}>
                <Text style={[s.statNumber, { fontSize: 40, lineHeight: 46 }]}>
                  {streak}
                </Text>
                <Text style={[s.cardTitle, { marginBottom: 7 }]}>
                  day streak
                </Text>
              </View>
              <Text style={s.caption}>
                {streak
                  ? "One new segment for every day you show up."
                  : "Practise today and the first segment grows."}
              </Text>
              <View style={[s.row, { marginTop: 12 }]}>
                {week.map((d) => {
                  const xp = p.activity[dayKey(d)]?.xp || 0,
                    today = dayKey(d) === dayKey(new Date(app.now));
                  return (
                    <View
                      key={dayKey(d)}
                      style={{ alignItems: "center", gap: 4 }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            xp >= goal
                              ? C.primary
                              : xp
                                ? C.primaryWash
                                : "transparent",
                          borderWidth: xp ? 0 : 1,
                          borderColor: today ? C.amber : C.line,
                        }}
                      >
                        <Zh
                          size={12}
                          color={
                            xp >= goal ? C.card : xp ? C.primaryDeep : C.faint
                          }
                          style={{ lineHeight: 15 }}
                        >
                          {weekdays[d.getDay()]}
                        </Zh>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <Section
            title="Your grove"
            zh="林"
            caption={`${deck.saved.length} planted`}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Your grove: ${deck.saved.length} words planted. Open your deck`}
            onPress={() => app.go("Words")}
            style={[s.card, { padding: 10 }]}
          >
            <GrovePlot
              strong={deck.strong}
              growing={deck.growing}
              fresh={deck.fresh}
              height={deck.saved.length ? 150 : 96}
            />
            <View style={[s.row, { paddingHorizontal: 8, paddingTop: 12 }]}>
              {[
                [`${deck.strong}`, "tall and strong"],
                [`${deck.growing}`, "growing"],
                [`${deck.fresh}`, "new shoots"],
              ].map(([value, label]) => (
                <View key={label} style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    style={[s.statNumber, { fontSize: 22, lineHeight: 26 }]}
                  >
                    {value}
                  </Text>
                  <Text style={s.caption}>{label}</Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                s.caption,
                { textAlign: "center", marginTop: 8, marginBottom: 4 },
              ]}
            >
              {deck.saved.length
                ? "Every word you plant becomes a bamboo. Review makes it grow."
                : "Plant your first word and a shoot appears here."}
            </Text>
          </Pressable>

          <Section
            title="Wardrobe"
            zh="衣"
            caption={`Rank ${rank.index + 1}`}
          />
          <View style={[s.card, { paddingVertical: 16 }]}>
            <View style={[s.wrap, { gap: 0, rowGap: 14 }]}>
              {wardrobe.map((item) => {
                const open = item.rank <= rank.index,
                  worn = outfitFor(p) === item.outfit;
                return (
                  <Pressable
                    key={item.outfit}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}${open ? "" : `, unlocks at rank ${item.rank + 1}`}`}
                    accessibilityState={{ selected: worn, disabled: !open }}
                    disabled={!open}
                    onPress={() =>
                      app.update((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, outfit: item.outfit },
                      }))
                    }
                    style={{ width: "33.33%", alignItems: "center", gap: 4 }}
                  >
                    <View
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: worn ? C.primaryWash : C.bg,
                        borderWidth: 2,
                        borderColor: worn ? C.primary : "transparent",
                        opacity: open ? 1 : 0.35,
                      }}
                    >
                      <Panda still size={70} outfit={item.outfit} />
                    </View>
                    <Text
                      style={[
                        s.caption,
                        { fontSize: 11.5, color: open ? C.ink2 : C.faint },
                      ]}
                    >
                      {open ? item.name : `Rank ${item.rank + 1}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}
      {view === "Progress" && (
        <>
          <View style={s.row}>
            <Stat value={`${p.completed.length}`} label="readings read" />
            <Stat
              value={
                attempts ? `${Math.round((correct / attempts) * 100)}%` : "—"
              }
              label="quiz accuracy"
            />
            <Stat
              value={`${Math.floor(totals.readSeconds / 60)}`}
              label="minutes reading"
            />
          </View>

          <Section title="Twelve weeks" zh="日" caption={`Goal ${goal} XP`} />
          <View style={s.card}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {grid.map((column, c) => (
                <View key={c} style={{ flex: 1, gap: 4 }}>
                  {column.map((d, r) => {
                    if (!d) return <View key={r} style={{ aspectRatio: 1 }} />;
                    const key = dayKey(d),
                      xp = p.activity[key]?.xp || 0;
                    return (
                      <Pressable
                        key={r}
                        accessibilityRole="button"
                        accessibilityLabel={`${key}: ${xp} XP`}
                        onPress={() => setPicked(key)}
                        style={{
                          aspectRatio: 1,
                          borderRadius: 4,
                          backgroundColor:
                            xp >= goal
                              ? C.primary
                              : xp >= goal / 2
                                ? "#7CC58A"
                                : xp
                                  ? C.primaryWash
                                  : C.hair,
                          borderWidth: picked === key ? 2 : 0,
                          borderColor: C.amber,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            <Text style={[s.caption, { marginTop: 12 }]}>
              {picked
                ? `${picked} · ${p.activity[picked]?.xp || 0} XP · ${p.activity[picked]?.reviews || 0} reviews · ${Math.round((p.activity[picked]?.readSeconds || 0) / 60)} min reading`
                : "Tap a day to see its little steps. Deep green means the goal was met."}
            </Text>
          </View>

          <Section title="Three mountains" zh="山" />
          {([1, 2, 3] as Level[]).map((level) => {
            const pool = words.filter((w) => w.level === level),
              grown = pool.filter((w) => p.cards[w.id]).length,
              stories = lessons.filter((l) => l.level === level),
              read = stories.filter((l) => p.completed.includes(l.id)).length;
            return (
              <View key={level} style={[s.card, s.line, { gap: 16 }]}>
                <Ring size={62} stroke={6} progress={read / stories.length}>
                  <Text
                    style={[s.statNumber, { fontSize: 21, lineHeight: 23 }]}
                  >
                    {level}
                  </Text>
                </Ring>
                <View style={{ flex: 1 }}>
                  <View style={s.row}>
                    <Text style={s.cardTitle}>HSK {level}</Text>
                    <Text style={s.caption}>
                      {read} of {stories.length} readings
                    </Text>
                  </View>
                  <Meter value={(grown / pool.length) * 100} slim />
                  <Text style={s.caption}>
                    {grown} / {pool.length} words planted
                  </Text>
                </View>
              </View>
            );
          })}

          <Section
            title="Badges"
            zh="印"
            caption={`${earned.filter((a) => a.earned).length} of ${earned.length}`}
          />
          <View style={[s.card, { paddingVertical: 20 }]}>
            <View style={[s.wrap, { gap: 0, rowGap: 18 }]}>
              {earned.map((a) => (
                <Pressable
                  key={a.title}
                  accessibilityRole="button"
                  accessibilityLabel={`${a.title}${a.earned ? ", earned" : ""}`}
                  onPress={() => setSeal(a.title)}
                  style={{ width: "25%", alignItems: "center", gap: 8 }}
                >
                  <Stamp
                    text={a.seal}
                    size={50}
                    outline={!a.earned}
                    dim={!a.earned}
                    color={a.earned ? C.amber : C.muted}
                  />
                  <Text
                    numberOfLines={2}
                    style={[
                      s.caption,
                      {
                        fontSize: 11,
                        lineHeight: 14,
                        textAlign: "center",
                        paddingHorizontal: 4,
                        color: a.earned ? C.ink2 : C.faint,
                      },
                    ]}
                  >
                    {a.title}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[s.caption, { marginTop: 16, textAlign: "center" }]}>
              {pickedSeal
                ? `${pickedSeal.title}: ${pickedSeal.detail.toLowerCase()}${pickedSeal.earned ? " · earned" : ""}`
                : "Tap a badge to see how it is earned."}
            </Text>
          </View>

          <Text style={[s.caption, { marginTop: 14 }]}>
            {Math.floor(totals.readSeconds / 60)} minutes reading ·{" "}
            {totals.reviews} reviews · quiz accuracy{" "}
            {attempts
              ? `${Math.round((correct / attempts) * 100)}%`
              : "not measured yet"}
            . Tone accuracy{" "}
            {p.toneAttempts
              ? `${Math.round((p.toneCorrect / p.toneAttempts) * 100)}%`
              : "not measured yet"}{" "}
            · best sprint {p.bestSprint} · {Object.keys(p.writing).length}{" "}
            characters traced. Everything stays on this device.
          </Text>
        </>
      )}
      {view === "Settings" && (
        <SettingsBody p={p} onChange={app.update} onNotice={app.notify} />
      )}
    </>
  );
}
