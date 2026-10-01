import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Level, topics } from "./content";
import { defaultSettings, placementLevel, Settings, toggle } from "./learning";
import { Button, Chip, C, GroveArt, Meter, s } from "./ui";
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
      <View style={[s.wrap, { marginVertical: 14 }]}>
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
      <View style={[s.wrap, { marginVertical: 14 }]}>
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
      <View style={[s.wrap, { marginVertical: 14 }]}>
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
        You can change your level, goal, and interests anytime.
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
          <View style={[s.row, { marginBottom: 22 }]}>
            <Text style={s.brand}>
              mandarin <Text style={{ fontWeight: "400" }}>grove</Text>
            </Text>
            <Text style={s.caption}>
              {placing ? "A gentle level check" : `${step + 1} / 3`}
            </Text>
          </View>
          <Meter
            value={
              placing ? (answers.length / 6) * 100 : ((step + 1) / 3) * 100
            }
          />
          {placing && q ? (
            <>
              <Text style={s.eyebrow}>
                NO PRESSURE. “NOT SURE” IS A GOOD ANSWER.
              </Text>
              <Text style={[s.heroTitle, { marginVertical: 22 }]}>
                {q.text}
              </Text>
              <Text style={s.title}>{q.prompt}</Text>
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
                style={[
                  s.cover,
                  s.center,
                  {
                    backgroundColor: C.green,
                    marginTop: 20,
                    paddingVertical: 35,
                  },
                ]}
              >
                <GroveArt />
                <Text style={{ color: C.lime, fontSize: 22, marginTop: 18 }}>
                  一点一点，慢慢成长。
                </Text>
                <Text style={{ color: "#D4E4D1", fontSize: 13 }}>
                  Little by little, let it grow.
                </Text>
              </View>
              <Text style={s.heroTitle}>
                A little Mandarin.{`\n`}A lovely daily ritual.
              </Text>
              <Text style={s.subtitle}>
                Read something small. Hear it come alive. Keep the words that
                matter to you.
              </Text>
              <View style={s.card}>
                <Text style={s.body}>
                  🌱 HSK 1–3, at your pace{`\n`}📖 Stories you can tap and
                  understand{`\n`}🍃 Everything stays on your device
                </Text>
              </View>
              <Button
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
              <Text style={s.eyebrow}>A COMFORTABLE PLACE TO BEGIN</Text>
              <Text style={s.heroTitle}>Meet yourself{`\n`}where you are.</Text>
              <Text style={s.subtitle}>
                Brand new? Start with HSK 1. Already know a little? Try a
                six-question check.
              </Text>
              {suggested && (
                <View style={s.notice}>
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
                label="Try the gentle level check"
                onPress={() => {
                  setAnswers([]);
                  setPlacing(true);
                }}
              />
              <Button label="Make it mine →" onPress={() => setStep(2)} />
            </>
          ) : (
            <>
              <Text style={s.eyebrow}>YOUR GROVE, YOUR PACE</Text>
              <Text style={s.heroTitle}>
                Make room{`\n`}for a little growth.
              </Text>
              <Text style={s.subtitle}>
                A few enjoyable minutes are a good place to start.
              </Text>
              <Preferences settings={settings} onChange={setSettings} />
              <Button label="Let's grow →" onPress={() => onFinish(settings)} />
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
