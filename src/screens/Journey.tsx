import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppCtx } from "../app";
import { Ring, Stamp } from "../art";
import { Panda } from "../Panda";
import { Lesson, lessons, Level, topics, words } from "../content";
import { glyphFor, pathUnits } from "../extras";
import { C, topicInk } from "../theme";
import {
  Button,
  Chip,
  GlyphTile,
  Icon,
  PageTitle,
  s,
  Segmented,
  Zh,
} from "../ui";

const mountains = [
  {
    zh: "第一座山",
    en: "The first mountain",
    note: "First words and everyday sentences",
  },
  {
    zh: "第二座山",
    en: "The second mountain",
    note: "Familiar words, longer conversations",
  },
  {
    zh: "第三座山",
    en: "The third mountain",
    note: "Short stories and everyday opinions",
  },
];
const ROW = 94,
  STONE = 62,
  sway = [0, 30, 58, 30];

export function StoryRow({ lesson, app }: { lesson: Lesson; app: AppCtx }) {
  const tint = topicInk[lesson.topic] || topicInk["Daily life"],
    done = app.p.completed.includes(lesson.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title} · HSK ${lesson.level}`}
      onPress={() => app.openLesson(lesson)}
      style={({ pressed }) => [s.listRow, { opacity: pressed ? 0.75 : 1 }]}
    >
      <GlyphTile
        glyph={glyphFor(lesson)}
        size={54}
        wash={tint.wash}
        ink={tint.ink}
      />
      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>
          HSK {lesson.level} · {lesson.topic}
        </Text>
        <Text style={s.cardTitle}>{lesson.title}</Text>
        <Text style={s.caption}>
          {lesson.format} · {lesson.words.length} key words
        </Text>
      </View>
      <Icon
        name={
          done
            ? "checkmark-circle"
            : app.p.bookmarks.includes(lesson.id)
              ? "bookmark"
              : "chevron-forward"
        }
        size={done ? 22 : 18}
        color={
          done
            ? C.primary
            : app.p.bookmarks.includes(lesson.id)
              ? C.primary
              : C.faint
        }
      />
    </Pressable>
  );
}

export function Journey({ app }: { app: AppCtx }) {
  const { p } = app;
  const [view, setView] = useState<"Path" | "Library">("Path"),
    [level, setLevel] = useState<Level>(p.settings.level),
    [width, setWidth] = useState(0),
    [search, setSearch] = useState(""),
    [levelFilter, setLevelFilter] = useState<number>(p.settings.level),
    [topic, setTopic] = useState("All topics"),
    [filter, setFilter] = useState("All stories");

  const units = pathUnits(level, p.settings.topics),
    done = units.filter((l) => p.completed.includes(l.id)).length,
    current = units.find((l) => !p.completed.includes(l.id)),
    pool = words.filter((w) => w.level === level),
    planted = pool.filter((w) => p.cards[w.id]).length;
  const library = lessons.filter(
    (l) =>
      (!levelFilter || l.level === levelFilter) &&
      (topic === "All topics" || l.topic === topic) &&
      (filter !== "Bookmarked" || p.bookmarks.includes(l.id)) &&
      (filter !== "Completed" || p.completed.includes(l.id)) &&
      `${l.title} ${l.subtitle} ${l.topic} ${l.story.map((line) => line.text).join("")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const centre = (i: number) => ({
    x: sway[i % 4] + STONE / 2 + 4,
    y: i * ROW + STONE / 2 + 6,
  });

  return (
    <>
      <PageTitle
        zh="路"
        pinyin="lù · the path"
        title="One reading at a time."
        caption="Follow the stones up each mountain, or wander the whole library."
      />
      <Segmented
        options={["Path", "Library"] as const}
        value={view}
        onChange={setView}
      />
      {view === "Path" ? (
        <>
          <View style={[s.wrap, { marginBottom: 14 }]}>
            {([1, 2, 3] as Level[]).map((l) => (
              <Chip
                key={l}
                label={`HSK ${l}`}
                selected={level === l}
                onPress={() => setLevel(l)}
              />
            ))}
          </View>
          <View style={[s.card, s.line, { gap: 16, marginBottom: 22 }]}>
            <Ring size={72} stroke={8} progress={done / units.length}>
              {done === units.length ? (
                <Stamp text="顶" size={44} color={C.amber} />
              ) : (
                <Text style={[s.statNumber, { fontSize: 20, lineHeight: 24 }]}>
                  {done}/{units.length}
                </Text>
              )}
            </Ring>
            <View style={{ flex: 1 }}>
              <Zh size={22} bold color={C.forest}>
                {mountains[level - 1].zh}
              </Zh>
              <Text style={s.cardTitle}>{mountains[level - 1].en}</Text>
              <Text style={s.caption}>
                {mountains[level - 1].note} · {planted} of {pool.length} words
                planted
              </Text>
            </View>
          </View>
          <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={{ height: units.length * ROW }}
          >
            {width > 0 && (
              <Svg
                width={width}
                height={units.length * ROW}
                style={{ position: "absolute", left: 0, top: 0 }}
                pointerEvents="none"
              >
                {units.slice(1).map((l, i) => {
                  const a = centre(i),
                    b = centre(i + 1),
                    walked =
                      p.completed.includes(units[i].id) &&
                      p.completed.includes(l.id);
                  return (
                    <Path
                      key={l.id}
                      d={`M${a.x} ${a.y} C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`}
                      stroke={walked ? C.primary : C.line}
                      strokeWidth={walked ? 3 : 2.5}
                      strokeDasharray={walked ? undefined : "2 7"}
                      strokeLinecap="round"
                      fill="none"
                    />
                  );
                })}
              </Svg>
            )}
            {units.map((l, i) => {
              const tint = topicInk[l.topic] || topicInk["Daily life"],
                finished = p.completed.includes(l.id),
                here = l.id === current?.id;
              return (
                <Pressable
                  key={l.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${l.title} · HSK ${l.level}`}
                  onPress={() => app.openLesson(l)}
                  style={({ pressed }) => ({
                    position: "absolute",
                    top: i * ROW,
                    left: 0,
                    right: 0,
                    height: ROW,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      marginLeft: sway[i % 4],
                      width: STONE + 8,
                      height: STONE + 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: STONE + 8,
                        height: STONE + 8,
                        borderRadius: (STONE + 8) / 2,
                        borderWidth: here ? 3 : 0,
                        borderColor: C.amber,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: C.bg,
                      }}
                    >
                      <GlyphTile
                        glyph={glyphFor(l)}
                        size={STONE - 4}
                        wash={
                          finished ? C.primaryWash : here ? C.card : tint.wash
                        }
                        ink={finished ? C.primaryDeep : tint.ink}
                        style={{
                          borderRadius: STONE / 2,
                          borderWidth: 1,
                          borderColor: finished ? C.primary : C.line,
                        }}
                      />
                    </View>
                    {finished && (
                      <View
                        style={{ position: "absolute", right: -2, bottom: 2 }}
                      >
                        <Stamp text="读" size={22} />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      position: "absolute",
                      left: 58 + STONE + 22,
                      right: 0,
                      top: 8,
                    }}
                  >
                    <View style={[s.line, { gap: 6 }]}>
                      <Text style={s.eyebrow}>
                        {i + 1} · {l.topic}
                      </Text>
                      {here && (
                        <View
                          style={{
                            backgroundColor: C.amber,
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                          }}
                        >
                          <Text
                            style={[
                              s.eyebrow,
                              {
                                color: C.forest,
                                fontSize: 9,
                                letterSpacing: 1,
                              },
                            ]}
                          >
                            Next
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[s.cardTitle, finished && { color: C.muted }]}
                    >
                      {l.title}
                    </Text>
                    <Text numberOfLines={1} style={s.caption}>
                      {l.subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {level !== p.settings.level && (
            <Text style={[s.caption, { marginTop: 10 }]}>
              Your daily reading follows HSK {p.settings.level}. Change your
              level any time in Me.
            </Text>
          )}
        </>
      ) : (
        <>
          <TextInput
            accessibilityLabel="Search stories"
            value={search}
            onChangeText={setSearch}
            style={s.search}
            placeholder="Find a story or a topic"
            placeholderTextColor={C.faint}
          />
          <View style={[s.wrap, { marginBottom: 10 }]}>
            {[0, 1, 2, 3].map((l) => (
              <Chip
                key={l}
                label={l ? `HSK ${l}` : "All levels"}
                selected={levelFilter === l}
                onPress={() => setLevelFilter(l)}
              />
            ))}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10, marginHorizontal: -20 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          >
            {["All topics", ...topics].map((t) => (
              <Chip
                key={t}
                label={t}
                selected={topic === t}
                onPress={() => setTopic(t)}
              />
            ))}
          </ScrollView>
          <View style={[s.wrap, { marginBottom: 16 }]}>
            {["All stories", "Bookmarked", "Completed"].map((f) => (
              <Chip
                key={f}
                label={f}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </View>
          <Text style={[s.caption, { marginBottom: 12 }]}>
            {library.length} readings · switch levels inside a story
          </Text>
          {library.map((l) => (
            <StoryRow key={l.id} lesson={l} app={app} />
          ))}
          {!library.length && (
            <View style={s.empty}>
              <Panda head size={84} mood="sleepy" />
              <Text style={s.cardTitle}>Nothing on this shelf</Text>
              <Text style={[s.caption, { textAlign: "center" }]}>
                Try another filter, or bookmark a story you love.
              </Text>
              <Button
                light
                label="Show all stories"
                onPress={() => {
                  setLevelFilter(0);
                  setTopic("All topics");
                  setFilter("All stories");
                  setSearch("");
                }}
              />
            </View>
          )}
          <Text style={[s.caption, { marginTop: 14 }]}>
            Every reading is original practice written for this app. News-style
            pieces are learning scenes, not live journalism.
          </Text>
        </>
      )}
    </>
  );
}
