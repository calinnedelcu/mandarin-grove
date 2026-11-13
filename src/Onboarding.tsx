import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroveScene } from "./art";
import { Panda } from "./Panda";
import { Level, topics } from "./content";
import { defaultSettings, placementLevel, Settings, toggle } from "./learning";
import { C, s } from "./theme";
import { Button, Chip, GlyphTile, Meter, Zh } from "./ui";

const placement = [
  {
    text: "你好",
    prompt: "What does this greeting mean?",
    options: ["Hello", "Goodbye", "Thank you"],
    answer: "Hello",
  },
  {
    text: "我喜欢喝茶。",
    prompt: "What does the speaker like?",
    options: ["Drinking tea", "Reading books", "Buying apples"],
    answer: "Drinking tea",
  },
  {
    text: "今天比昨天冷。",
    prompt: "Which day is colder?",
    options: ["Today", "Yesterday", "They are the same"],
    answer: "Today",
  },
  {
    text: "她已经回家了。",
    prompt: "Where is she now?",
    options: ["Back home", "Still at work", "At the shop"],
    answer: "Back home",
  },
  {
    text: "虽然下雨了，但是我们还是去了公园。",
    prompt: "Did they go to the park?",
    options: [
      "Yes, despite the rain",
      "No, because it rained",
      "The sentence does not say",
    ],
    answer: "Yes, despite the rain",
  },
  {
    text: "我把书放在桌子上了。",
    prompt: "Where did the speaker put the book?",
    options: ["On the table", "Under the bed", "In a bag"],
    answer: "On the table",
  },
];
const promises = [
  ["读", "Stories you can tap", "Every word opens: meaning, sound, strokes."],
  ["温", "Review that remembers", "Words return just before they fade."],
  ["写", "Characters, stroke by stroke", "Trace them on grid paper."],
  ["家", "All on your device", "No account, no subscription."],
];

export function Preferences({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  return (
    <>
      <Text style={s.cardTitle}>Your comfortable starting point</Text>
      <View style={[s.wrap, { marginVertical: 12 }]}>
        {([1, 2, 3] as Level[]).map((level) => (
          <Chip
            key={level}
            label={`HSK ${level}`}
            selected={settings.level === level}
            onPress={() => onChange({ ...settings, level })}
          />
        ))}
      </View>
      <Text style={s.caption}>
        {
          [
            "Your first words & everyday sentences",
            "Familiar words, longer conversations",
            "Short stories & everyday opinions",
          ][settings.level - 1]
        }
      </Text>
      <Text style={[s.cardTitle, { marginTop: 24 }]}>
        A little goal for each day
      </Text>
      <View style={[s.wrap, { marginVertical: 12 }]}>
        {[25, 50, 100].map((goal) => (
          <Chip
            key={goal}
            label={`${goal} XP · ${goal === 25 ? "Gentle" : goal === 50 ? "Steady" : "Curious"}`}
            selected={settings.dailyGoal === goal}
            onPress={() => onChange({ ...settings, dailyGoal: goal })}
          />
        ))}
      </View>
      <Text style={[s.cardTitle, { marginTop: 16 }]}>
        What makes you curious?
      </Text>
      <View style={[s.wrap, { marginVertical: 12 }]}>
        {topics.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            selected={settings.topics.includes(topic)}
            onPress={() =>
              onChange({ ...settings, topics: toggle(settings.topics, topic) })
            }
          />
        ))}
      </View>
      <Text style={s.caption}>
        Your interests come first on the path. You can change all of this
        anytime.
      </Text>
    </>
  );
}

export function Onboarding({
  initial = defaultSettings,
  onFinish,
}: {
  initial?: Settings;
  onFinish: (settings: Settings) => void;
}) {
  const [step, setStep] = useState(0),
    [settings, setSettings] = useState(initial),
    [placing, setPlacing] = useState(false),
    [answers, setAnswers] = useState<boolean[]>([]),
    [suggested, setSuggested] = useState<Level | null>(null);
  const q = placement[answers.length];
  return (
    <SafeAreaView style={s.root}>
      <View style={s.shell}>
        <ScrollView contentContainerStyle={[s.content, { flexGrow: 1 }]}>
          <View style={[s.row, { marginBottom: 6 }]}>
            <View style={[s.line, { gap: 10 }]}>
              <Panda head still size={38} />
              <Text style={s.brand}>Mandarin Grove</Text>
            </View>
            <Text style={s.caption}>
              {placing ? "A gentle level check" : `${step + 1} / 3`}
            </Text>
          </View>
          <Meter
            slim
            color={C.primary}
            value={
              placing ? (answers.length / 6) * 100 : ((step + 1) / 3) * 100
            }
          />
          {placing && q ? (
            <>
              <Text style={[s.eyebrow, { marginTop: 18 }]}>
                No pressure. “Not sure” is a good answer.
              </Text>
              <View
                style={[
                  s.card,
                  { marginTop: 14, paddingVertical: 30, alignItems: "center" },
                ]}
              >
                <Zh size={34} bold style={{ textAlign: "center" }}>
                  {q.text}
                </Zh>
              </View>
              <Text style={[s.title, { marginTop: 8 }]}>{q.prompt}</Text>
              {[...q.options, "Not sure yet"].map((option) => (
                <Button
                  key={option}
                  light
                  label={option}
                  onPress={() => {
                    const next = [...answers, option === q.answer];
                    setAnswers(next);
                    if (next.length === 6) {
                      const level = placementLevel(next);
                      setSuggested(level);
                      setSettings({ ...settings, level });
                      setPlacing(false);
                    }
                  }}
                />
              ))}
              <Button
                light
                label="Back to level choice"
                onPress={() => setPlacing(false)}
              />
            </>
          ) : step === 0 ? (
            <>
              <View
                style={{
                  height: 264,
                  marginHorizontal: -20,
                  paddingHorizontal: 24,
                  paddingTop: 22,
                  overflow: "hidden",
                }}
              >
                <GroveScene height={264} />
                <Zh size={30} bold color={C.forest} style={{ lineHeight: 42 }}>
                  一点一点，{`\n`}慢慢成长。
                </Zh>
                <Text style={[s.pinyin, { marginTop: 6 }]}>
                  Little by little,{`\n`}let it grow.
                </Text>
                <Panda
                  size={176}
                  bamboo
                  style={{ position: "absolute", right: 6, bottom: 4 }}
                />
              </View>
              <Text style={s.heroTitle}>
                A little Mandarin.{`\n`}A lovely daily ritual.
              </Text>
              <Text style={s.subtitle}>
                Read something small. Hear it come alive. Keep the words that
                matter to you, from your first 你好 to HSK 3.
              </Text>
              <View style={[s.card, { gap: 14 }]}>
                {promises.map(([glyph, title, note]) => (
                  <View key={title} style={[s.line, { gap: 14 }]}>
                    <GlyphTile glyph={glyph} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{title}</Text>
                      <Text style={s.caption}>{note}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button
                accent
                label="Find my starting point →"
                onPress={() => setStep(1)}
              />
              <Button
                light
                label="Start as a beginner"
                onPress={() => {
                  setSettings({ ...settings, level: 1 });
                  setStep(2);
                }}
              />
            </>
          ) : step === 1 ? (
            <>
              <Text style={[s.eyebrow, { marginTop: 18 }]}>
                A comfortable place to begin
              </Text>
              <Text style={s.heroTitle}>Meet yourself{`\n`}where you are.</Text>
              <Text style={s.subtitle}>
                Brand new? Start with HSK 1. Already know a little? Try a
                six-question check.
              </Text>
              {suggested && (
                <View style={[s.notice, { marginTop: 0, marginBottom: 6 }]}>
                  <Text style={s.cardTitle}>
                    Your suggested path: HSK {suggested}
                  </Text>
                  <Text style={s.caption}>
                    This is a starting suggestion, not an exam result.
                  </Text>
                </View>
              )}
              {([1, 2, 3] as Level[]).map((level) => (
                <Button
                  key={level}
                  light={settings.level !== level}
                  label={`HSK ${level} · ${["First steps", "Building confidence", "Everyday stories"][level - 1]}`}
                  onPress={() => setSettings({ ...settings, level })}
                />
              ))}
              <Button
                light
                icon="help-circle-outline"
                label="Try the gentle level check"
                onPress={() => {
                  setAnswers([]);
                  setPlacing(true);
                }}
              />
              <Button
                accent
                label="Make it mine →"
                onPress={() => setStep(2)}
              />
            </>
          ) : (
            <>
              <Text style={[s.eyebrow, { marginTop: 18 }]}>
                Your grove, your pace
              </Text>
              <Text style={s.heroTitle}>
                Make room{`\n`}for a little growth.
              </Text>
              <Text style={s.subtitle}>
                A few enjoyable minutes are a good place to start.
              </Text>
              <Preferences settings={settings} onChange={setSettings} />
              <Button
                accent
                label="Let's grow →"
                onPress={() => onFinish(settings)}
              />
              <Button
                light
                label="Back to level choice"
                onPress={() => setStep(1)}
              />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
