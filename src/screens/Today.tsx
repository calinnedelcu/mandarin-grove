import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppCtx } from "../app";
import { GridPaper, GroveScene } from "../art";
import { Panda } from "../Panda";
import {
  chineseDate,
  glyphFor,
  greeting,
  pandaLines,
  PlanStep,
  proverbOfDay,
  wordOfDay,
} from "../extras";
import { C, shadow, topicInk } from "../theme";
import {
  Button,
  GlyphTile,
  Hanzi,
  Icon,
  IconButton,
  Meter,
  Pinyin,
  Row,
  s,
  Section,
  Zh,
} from "../ui";

const stepCopy = {
  review: { glyph: "温", title: "Remember" },
  read: { glyph: "读", title: "Read" },
  practice: { glyph: "练", title: "Practise" },
} as const;

export function Today({ app }: { app: AppCtx }) {
  const { p, today, plan, due, audio } = app,
    date = new Date(app.now),
    hello = greeting(date),
    goal = p.settings.dailyGoal,
    proverb = proverbOfDay(date),
    daily = wordOfDay(p, date),
    next = plan.find((step) => !step.done && !step.idle),
    finished = plan.filter((step) => step.done).length,
    fed = app.dailyXP >= goal;
  // Tapping the panda makes it hop and say something short.
  const [taps, setTaps] = useState(0),
    [line, setLine] = useState(-1);
  useEffect(() => {
    if (line < 0) return;
    const timer = setTimeout(() => setLine(-1), 3200);
    return () => clearTimeout(timer);
  }, [line, taps]);
  const said = pandaLines[line];

  function run(step: PlanStep) {
    if (step.key === "review")
      due.length ? app.startReview() : app.openLesson(today);
    else if (step.key === "read") app.openLesson(today);
    else app.smartPractice();
  }
  function caption(step: PlanStep) {
    if (step.key === "review")
      return step.idle
        ? "No words yet. Plant some as you read."
        : due.length
          ? `${due.length} ${due.length === 1 ? "word is" : "words are"} ready`
          : "All caught up";
    if (step.key === "read") return `${today.title} · HSK ${today.level}`;
    return step.done ? "Done for today" : "A short mix, picked for you";
  }

  return (
    <>
      <View
        style={{
          marginHorizontal: -20,
          marginTop: -18,
          paddingHorizontal: 20,
          paddingTop: 12,
          height: 262,
          overflow: "hidden",
        }}
      >
        <GroveScene height={262} />
        <Zh size={14} color={C.muted}>
          {chineseDate(date)}
        </Zh>
        <Zh size={40} bold color={C.forest} style={{ lineHeight: 50 }}>
          {hello.zh}
        </Zh>
        <Text style={s.pinyin}>
          {hello.pinyin} · {hello.en}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Daily goal: ${Math.min(app.dailyXP, goal)} of ${goal} XP. View progress`}
          onPress={() => app.go("Me")}
          style={[
            shadow,
            {
              marginTop: 14,
              width: "56%",
              backgroundColor: C.card,
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 10,
            },
          ]}
        >
          <View style={s.row}>
            <Text style={[s.caption, { fontWeight: "700", color: C.ink2 }]}>
              {fed ? "Panda is full!" : "Today's bamboo"}
            </Text>
            <Text style={[s.caption, { fontWeight: "700", color: C.primary }]}>
              {Math.min(app.dailyXP, goal)}/{goal}
            </Text>
          </View>
          <Meter slim value={(app.dailyXP / goal) * 100} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Say hello to the panda"
          onPress={() => {
            const next =
              (line + 1 + Math.floor(Math.random() * 3)) % pandaLines.length;
            setLine(next);
            setTaps((v) => v + 1);
            audio.say(pandaLines[next].zh);
          }}
          style={{ position: "absolute", right: 4, bottom: 6 }}
        >
          <Panda size={168} bamboo pulse={taps} mood={fed ? "happy" : "calm"} />
        </Pressable>
        {said && (
          <View
            accessibilityLiveRegion="polite"
            style={[
              shadow,
              {
                position: "absolute",
                right: 14,
                top: 8,
                maxWidth: 200,
                backgroundColor: C.card,
                borderRadius: 18,
                borderBottomRightRadius: 4,
                paddingHorizontal: 14,
                paddingVertical: 9,
              },
            ]}
          >
            <Zh size={21} bold color={C.forest}>
              {said.zh}
            </Zh>
            <Text style={[s.caption, { fontSize: 11.5 }]}>
              {said.pinyin} · {said.meaning}
            </Text>
          </View>
        )}
      </View>

      <View style={[s.card, shadow, { padding: 0, marginTop: -14 }]}>
        <View style={[s.row, { padding: 18, paddingBottom: 4 }]}>
          <Text style={s.sectionTitle}>Today's three steps</Text>
          <View
            style={[
              s.badge,
              finished === 3 && {
                backgroundColor: C.primary,
                borderColor: C.primary,
              },
            ]}
          >
            <Text
              style={[
                s.caption,
                { fontWeight: "700", color: finished === 3 ? "#FFF" : C.ink2 },
              ]}
            >
              {finished} / 3
            </Text>
          </View>
        </View>
        {plan.map((step, i) => {
          const copy = stepCopy[step.key],
            active = step === next;
          return (
            <Pressable
              key={step.key}
              accessibilityRole="button"
              accessibilityLabel={`Step ${i + 1}: ${copy.title}${step.done ? ", done" : ""}`}
              onPress={() => run(step)}
              style={({ pressed }) => [
                s.line,
                {
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <GlyphTile
                glyph={copy.glyph}
                size={48}
                wash={step.done ? C.primaryWash : active ? C.amberWash : C.hair}
                ink={step.done ? C.primaryDeep : active ? C.amberDeep : C.faint}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.cardTitle,
                    (step.done || step.idle) && { color: C.muted },
                  ]}
                >
                  {copy.title}
                </Text>
                <Text style={s.caption} numberOfLines={1}>
                  {caption(step)}
                </Text>
              </View>
              <Icon
                name={
                  step.done
                    ? "checkmark-circle"
                    : active
                      ? "chevron-forward-circle"
                      : "ellipse-outline"
                }
                color={step.done ? C.primary : active ? C.amber : C.line}
                size={26}
              />
            </Pressable>
          );
        })}
        <View style={{ padding: 18, paddingTop: 2 }}>
          {next ? (
            <Button
              label={
                finished
                  ? `Continue: ${stepCopy[next.key].title.toLowerCase()}`
                  : "Begin today's session"
              }
              onPress={() => run(next)}
            />
          ) : (
            <Text style={[s.caption, { marginTop: 8 }]}>
              All three done. Anything more is a gift to tomorrow.
            </Text>
          )}
        </View>
      </View>

      {app.resume &&
        app.resume.id !== today.id &&
        !p.completed.includes(app.resume.id) && (
          <Row
            title={app.resume.title}
            caption={`Pick up where you left off · HSK ${app.resume.level}`}
            label={`Continue ${app.resume.title}`}
            onPress={() => app.openLesson(app.resume!)}
            left={
              <GlyphTile
                glyph={glyphFor(app.resume)}
                size={48}
                wash={(topicInk[app.resume.topic] || topicInk.Food).wash}
                ink={(topicInk[app.resume.topic] || topicInk.Food).ink}
              />
            }
          />
        )}

      <Section title="Word of the day" zh="词" />
      <View style={[s.card, s.line, { gap: 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Word of the day: ${daily.hanzi}`}
          onPress={() => app.openWord(daily)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <GridPaper size={92}>
            <Hanzi
              word={daily}
              size={Math.min(52, 76 / Array.from(daily.hanzi).length)}
              traditional={p.settings.traditional}
              colored={false}
            />
          </GridPaper>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Pinyin word={daily} size={17} />
          <Text style={[s.cardTitle, { fontSize: 18, marginTop: 2 }]}>
            {daily.meaning}
          </Text>
          <View style={[s.line, { marginTop: 10 }]}>
            <IconButton
              name="volume-medium-outline"
              label="Hear the word of the day"
              onPress={() => audio.say(daily.hanzi)}
            />
            {p.cards[daily.id] ? (
              <View style={[s.badge, s.line, { gap: 5, minHeight: 44 }]}>
                <Icon name="leaf" size={14} color={C.primary} />
                <Text style={s.caption}>In your deck</Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Plant the word of the day"
                onPress={() => app.plant(daily)}
                style={[
                  s.badge,
                  s.line,
                  {
                    gap: 5,
                    minHeight: 44,
                    paddingHorizontal: 14,
                    backgroundColor: C.primaryWash,
                    borderColor: C.primaryWash,
                  },
                ]}
              >
                <Icon name="add" size={17} color={C.primaryDeep} />
                <Text
                  style={[
                    s.caption,
                    { color: C.primaryDeep, fontWeight: "700" },
                  ]}
                >
                  Plant it
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: 22, gap: 4 }}>
        <Zh size={19} bold color={C.primaryDeep}>
          {proverb.zh}
        </Zh>
        <Text style={[s.caption, { textAlign: "center" }]}>
          {proverb.pinyin}
        </Text>
        <Text style={[s.caption, { textAlign: "center", color: C.ink2 }]}>
          {proverb.meaning}
        </Text>
      </View>
    </>
  );
}
