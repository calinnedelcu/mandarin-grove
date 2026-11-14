import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppCtx } from "../app";
import { Tip } from "./Tip";
import { Lesson, lessons, Level, topics } from "../content";
import { glyphFor, pathUnits } from "../extras";
import { Panda } from "../Panda";
import { PlaceArt } from "../PlaceArt";
import { Place, placeOf, places, readingsAt } from "../places";
import { C, shadow, topicInk } from "../theme";
import {
  Button,
  Chip,
  GlyphTile,
  Icon,
  IconButton,
  Meter,
  Mixed,
  PageTitle,
  s,
  Segmented,
  Zh,
} from "../ui";

const ROW = 138,
  TILE = 104;

export function StoryRow({
  lesson,
  app,
  onOpen,
}: {
  lesson: Lesson;
  app: AppCtx;
  onOpen?: () => void;
}) {
  const tint = topicInk[lesson.topic] || topicInk["Daily life"],
    done = app.p.completed.includes(lesson.id),
    marked = app.p.bookmarks.includes(lesson.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title} · HSK ${lesson.level}`}
      onPress={() => {
        onOpen?.();
        app.openLesson(lesson);
      }}
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
          done ? "checkmark-circle" : marked ? "bookmark" : "chevron-forward"
        }
        size={done ? 22 : 18}
        color={done ? C.primary : marked ? C.amber : C.faint}
      />
    </Pressable>
  );
}

export function Journey({ app }: { app: AppCtx }) {
  const { p, audio } = app;
  const [view, setView] = useState<"Map" | "Library">("Map"),
    [level, setLevel] = useState<Level>(p.settings.level),
    [width, setWidth] = useState(0),
    [open, setOpen] = useState<Place | null>(null),
    [search, setSearch] = useState(""),
    [levelFilter, setLevelFilter] = useState<number>(p.settings.level),
    [topic, setTopic] = useState("All topics"),
    [filter, setFilter] = useState("All stories");

  const units = pathUnits(level),
    done = units.filter((l) => p.completed.includes(l.id)).length,
    current = units.find((l) => !p.completed.includes(l.id)),
    here = current ? placeOf(current) : null;
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
  // Tiles alternate left and right; the road runs through their centres.
  const centre = (i: number) => ({
    x: i % 2 ? width - TILE / 2 - 4 : TILE / 2 + 4,
    y: i * ROW + TILE / 2 + 6,
  });
  const road = places
    .map((_, i) => {
      const a = centre(i);
      if (!i) return `M${a.x} ${a.y}`;
      const b = centre(i - 1);
      return `C${b.x} ${b.y + ROW * 0.62} ${a.x} ${a.y - ROW * 0.62} ${a.x} ${a.y}`;
    })
    .join(" ");
  const opened = open ? readingsAt(open, level) : [];

  return (
    <>
      <PageTitle
        zh="路"
        pinyin="lù · the path"
        title="A walk through Chengdu."
      />
      <Tip id="tip-path" app={app}>
        Each picture is a place in Chengdu. Tap one to see what it is and to
        open its readings. The panda marks where you are.
      </Tip>
      <Segmented
        options={["Map", "Library"] as const}
        value={view}
        onChange={setView}
      />
      {view === "Map" ? (
        <>
          <View style={[s.row, { marginBottom: 6 }]}>
            <View style={s.wrap}>
              {([1, 2, 3] as Level[]).map((l) => (
                <Chip
                  key={l}
                  label={`HSK ${l}`}
                  selected={level === l}
                  onPress={() => setLevel(l)}
                />
              ))}
            </View>
            <Text style={[s.caption, { fontWeight: "700", color: C.ink2 }]}>
              {done} / {units.length}
            </Text>
          </View>
          <Meter value={(done / Math.max(1, units.length)) * 100} />
          <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={{ height: places.length * ROW, marginTop: 10 }}
          >
            {width > 0 && (
              <Svg
                width={width}
                height={places.length * ROW}
                style={{ position: "absolute", left: 0, top: 0 }}
                pointerEvents="none"
              >
                <Path
                  d={road}
                  stroke="#E6D9AE"
                  strokeWidth={18}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={road}
                  stroke="#F6EECF"
                  strokeWidth={13}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={road}
                  stroke="#D9C88F"
                  strokeWidth={2}
                  strokeDasharray="7 9"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            )}
            {places.map((place, i) => {
              const stories = readingsAt(place, level),
                read = stories.filter((l) => p.completed.includes(l.id)).length,
                finished = stories.length > 0 && read === stories.length,
                active = place.id === here?.id,
                right = i % 2 === 1;
              return (
                <Pressable
                  key={place.id}
                  accessibilityRole="button"
                  accessibilityLabel={place.en}
                  onPress={() => setOpen(place)}
                  style={({ pressed }) => ({
                    position: "absolute",
                    top: i * ROW,
                    left: 0,
                    right: 0,
                    height: ROW,
                    flexDirection: right ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    gap: 14,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <View
                    style={[
                      shadow,
                      {
                        padding: 4,
                        borderRadius: TILE * 0.3,
                        backgroundColor: C.card,
                        borderWidth: active ? 3 : 0,
                        borderColor: C.amber,
                        margin: active ? -3 : 0,
                      },
                    ]}
                  >
                    <PlaceArt place={place.id} size={TILE} />
                    {finished && (
                      <View
                        style={{
                          position: "absolute",
                          right: -4,
                          top: -4,
                          backgroundColor: C.card,
                          borderRadius: 14,
                        }}
                      >
                        <Icon
                          name="checkmark-circle"
                          size={28}
                          color={C.primary}
                        />
                      </View>
                    )}
                    {active && (
                      <View
                        style={{ position: "absolute", left: -10, bottom: -12 }}
                      >
                        <Panda head size={46} mood="happy" />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      flex: 1,
                      paddingTop: 10,
                      alignItems: right ? "flex-end" : "flex-start",
                    }}
                  >
                    {active ? (
                      <Text style={[s.eyebrow, { color: C.amberDeep }]}>
                        {i + 1} · You are here
                      </Text>
                    ) : (
                      <Text style={s.pinyin}>
                        {i + 1} · {place.pinyin}
                      </Text>
                    )}
                    <Zh size={23} bold color={C.forest}>
                      {place.zh}
                    </Zh>
                    <Text
                      style={[
                        s.cardTitle,
                        { textAlign: right ? "right" : "left" },
                      ]}
                    >
                      {place.en}
                    </Text>
                    <Text style={s.caption}>
                      {read} of {stories.length} readings
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

      {open && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(null)}
        >
          <View style={[StyleSheet.absoluteFill, s.scrim]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close place"
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(null)}
            />
            <View style={s.sheet}>
              <View style={s.grabber} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[s.row, { alignItems: "flex-start" }]}>
                  <PlaceArt place={open.id} size={96} />
                  <IconButton
                    name="close"
                    label="Close place details"
                    onPress={() => setOpen(null)}
                  />
                </View>
                <View style={[s.line, { marginTop: 12, gap: 10 }]}>
                  <Zh size={30} bold color={C.forest}>
                    {open.zh}
                  </Zh>
                  <IconButton
                    name="volume-medium-outline"
                    label={`Hear ${open.en} in Chinese`}
                    onPress={() => audio.say(open.zh)}
                  />
                </View>
                <Text style={s.pinyin}>{open.pinyin}</Text>
                <Text style={[s.title, { marginTop: 2 }]}>{open.en}</Text>
                <Mixed style={{ marginTop: 8, marginBottom: 16 }}>
                  {open.note}
                </Mixed>
                <Text style={[s.eyebrow, { marginBottom: 10 }]}>
                  Readings here · HSK {level}
                </Text>
                {opened.map((l) => (
                  <StoryRow
                    key={l.id}
                    lesson={l}
                    app={app}
                    onOpen={() => setOpen(null)}
                  />
                ))}
                {!opened.length && (
                  <Text style={s.caption}>
                    No readings here at this level yet.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
