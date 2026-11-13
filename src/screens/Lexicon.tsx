import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AppCtx } from "../app";
import { Panda } from "../Panda";
import { lessons, Word, words } from "../content";
import { searchWord, strength } from "../learning";
import { C } from "../theme";
import {
  Button,
  Chip,
  Hanzi,
  Icon,
  IconButton,
  Mixed,
  PageTitle,
  Pinyin,
  s,
  Segmented,
} from "../ui";

type View_ = "Dictionary" | "My deck" | "Grammar";

function WordRow({ word, app }: { word: Word; app: AppCtx }) {
  const card = app.p.cards[word.id],
    v = strength(card);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Word ${word.hanzi}`}
      onPress={() => app.openWord(word)}
      style={({ pressed }) => [s.wordRow, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={{ width: 104 }}>
        <Hanzi word={word} size={26} traditional={app.p.settings.traditional} />
        <Pinyin word={word} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.body}>{word.meaning}</Text>
        <Text style={s.caption}>
          HSK {word.level}
          {card ? ` · ${v}% strength` : ""}
        </Text>
      </View>
      {card ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor:
              v >= 75 ? C.primary : v > 0 ? C.primaryWash : C.amberWash,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="leaf"
            size={14}
            color={v >= 75 ? C.card : v > 0 ? C.primaryDeep : C.amberDeep}
          />
        </View>
      ) : (
        <Icon name="add-circle-outline" color={C.faint} />
      )}
    </Pressable>
  );
}

export function Lexicon({ app }: { app: AppCtx }) {
  const { p, deck, due } = app;
  const [view, setView] = useState<View_>("Dictionary"),
    [search, setSearch] = useState(""),
    [level, setLevel] = useState(0),
    [limit, setLimit] = useState(60),
    [strongOnly, setStrongOnly] = useState(false),
    [savedOnly, setSavedOnly] = useState(false);

  const source = view === "My deck" ? deck.saved : words,
    list = source
      .filter(
        (w) =>
          (!level || w.level === level) &&
          (!strongOnly ||
            view !== "My deck" ||
            strength(p.cards[w.id]) >= 75) &&
          searchWord(w, search),
      )
      .sort((a, b) =>
        view === "My deck"
          ? strength(p.cards[a.id]) - strength(p.cards[b.id])
          : 0,
      );
  const patterns = lessons.filter(
    (l) =>
      (!level || l.level === level) &&
      (!savedOnly || p.grammarSaved.includes(l.id)) &&
      `${l.title} ${l.grammar}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const total = Math.max(1, deck.saved.length);
  const reset = (next: () => void) => {
    next();
    setLimit(60);
  };

  return (
    <>
      <PageTitle
        zh="词"
        pinyin="cí · words"
        title={`${words.length} words to keep.`}
        caption="Tap a word to hear it, see inside its characters and plant it in your deck."
      />
      <Segmented
        options={["Dictionary", "My deck", "Grammar"] as const}
        value={view}
        onChange={(v) => reset(() => setView(v))}
      />
      <TextInput
        accessibilityLabel={
          view === "Grammar" ? "Search grammar" : "Search vocabulary"
        }
        placeholder={
          view === "Grammar" ? "Search patterns" : "Hanzi, pinyin, or English"
        }
        placeholderTextColor={C.faint}
        value={search}
        onChangeText={(v) => reset(() => setSearch(v))}
        style={s.search}
      />
      <View style={[s.wrap, { marginBottom: 14 }]}>
        {[0, 1, 2, 3].map((l) => (
          <Chip
            key={l}
            label={l ? `HSK ${l}` : "All levels"}
            selected={level === l}
            onPress={() => reset(() => setLevel(l))}
          />
        ))}
        {view === "My deck" && (
          <Chip
            label="Strong words"
            selected={strongOnly}
            onPress={() => setStrongOnly((v) => !v)}
          />
        )}
        {view === "Grammar" && (
          <Chip
            label="Saved"
            selected={savedOnly}
            onPress={() => setSavedOnly((v) => !v)}
          />
        )}
      </View>

      {view === "My deck" && deck.saved.length > 0 && (
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.cardTitle}>{deck.saved.length} words planted</Text>
            <Text style={s.caption}>{due.length} due now</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              height: 10,
              borderRadius: 5,
              overflow: "hidden",
              marginVertical: 12,
              backgroundColor: C.hair,
            }}
          >
            <View
              style={{ flex: deck.strong / total, backgroundColor: C.primary }}
            />
            <View
              style={{ flex: deck.growing / total, backgroundColor: C.lime }}
            />
            <View
              style={{ flex: deck.fresh / total, backgroundColor: C.amberDeep }}
            />
          </View>
          <View style={s.row}>
            {[
              [C.primary, `${deck.strong} strong`],
              [C.lime, `${deck.growing} growing`],
              [C.amberDeep, `${deck.fresh} new`],
            ].map(([color, label]) => (
              <View key={label} style={[s.line, { gap: 6 }]}>
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: color,
                  }}
                />
                <Text style={s.caption}>{label}</Text>
              </View>
            ))}
          </View>
          {due.length > 0 && (
            <Button label="Start spaced review →" onPress={app.startReview} />
          )}
        </View>
      )}

      {view !== "Grammar" ? (
        <>
          <Text style={s.caption}>
            {list.length} words
            {view === "My deck"
              ? " · weakest first"
              : " · tones shown in colour"}
          </Text>
          {list.slice(0, limit).map((w) => (
            <WordRow key={w.id} word={w} app={app} />
          ))}
          {list.length > limit && (
            <Button
              light
              label={`Show more words (${list.length - limit} left)`}
              onPress={() => setLimit((v) => v + 60)}
            />
          )}
          {!list.length && (
            <View
              style={[s.empty, { minHeight: 240, justifyContent: "center" }]}
            >
              <Panda size={120} mood="sleepy" />
              <Text style={s.cardTitle}>
                {view === "My deck" && !deck.saved.length
                  ? "Your deck is waiting"
                  : "No words here yet"}
              </Text>
              <Text style={[s.caption, { textAlign: "center" }]}>
                {view === "My deck" && !deck.saved.length
                  ? "Tap any word in a story or the dictionary and plant it."
                  : "Try another search or a different level."}
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={[s.caption, { marginBottom: 10 }]}>
            {patterns.length} patterns · one from every reading
          </Text>
          {patterns.map((l) => {
            const saved = p.grammarSaved.includes(l.id);
            return (
              <View key={l.id} style={s.card}>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eyebrow}>HSK {l.level}</Text>
                    <Text style={s.cardTitle}>{l.title}</Text>
                  </View>
                  <IconButton
                    plain
                    name={saved ? "bookmark" : "bookmark-outline"}
                    color={saved ? C.primary : C.muted}
                    label={
                      saved
                        ? `Remove saved pattern from ${l.title}`
                        : `Save pattern from ${l.title}`
                    }
                    onPress={() =>
                      app.update((prev) => ({
                        ...prev,
                        grammarSaved: saved
                          ? prev.grammarSaved.filter((id) => id !== l.id)
                          : [...prev.grammarSaved, l.id],
                      }))
                    }
                  />
                </View>
                <Mixed style={{ marginTop: 6 }}>{l.grammar}</Mixed>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Revisit ${l.title}`}
                  onPress={() => app.openLesson(l)}
                  style={[s.line, { marginTop: 12, minHeight: 32 }]}
                >
                  <Text
                    style={[s.caption, { color: C.primary, fontWeight: "600" }]}
                  >
                    See it in the story
                  </Text>
                  <Icon name="arrow-forward" size={14} color={C.primary} />
                </Pressable>
              </View>
            );
          })}
          {!patterns.length && (
            <View style={s.empty}>
              <Panda head size={84} mood="sleepy" />
              <Text style={s.cardTitle}>No patterns here yet</Text>
              <Text style={[s.caption, { textAlign: "center" }]}>
                Save a pattern from any reading and it will wait for you here.
              </Text>
            </View>
          )}
        </>
      )}
    </>
  );
}
