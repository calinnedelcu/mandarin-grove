# Mandarin Grove 🐼

A friendly, mobile-first Mandarin companion for **beginners through HSK 3**, set in a Chengdu bamboo grove. Read something small, hear it, keep useful words, and feed the panda a little every day. Inspired by WireLingo's contextual reading → listening → practice → review loop, with original content and a fully local learning system.

Built with **Expo SDK 57, React Native and TypeScript**. The app needs no account, backend, API key or subscription: all content and audio ship inside it.

## Run

```sh
npx expo start --lan
```

Open the QR code using an **Expo Go version compatible with SDK 57**, with your phone and computer on the same Wi-Fi. Use `npm run web` for a browser preview. For a clean dependency installation, run `npm ci`.

## The five tabs

- **Today (今):** one card with the day's three steps — remember, read, practise — and a single button that starts the next one. The reading is pinned for the day, so finishing it does not swap it. Below it, a word of the day and a saying.
- **Path (路):** the readings of each HSK level as stepping stones in walking order: starter chapters first, then your interests, then the rest. A **Library** view keeps search, topic and level filters, bookmarks and completed stories.
- **Practice (练):** spaced review on top, then four drill areas that open as a short list — Words, Listening, Tones, Sentences — plus guided writing. Word drills run on a pool you choose (whole deck, due, weak, growing, strong, new). Words that have slipped appear as **Tricky words**.
- **Words (词):** the 618-word dictionary, your own deck sorted weakest first with a strength bar, and a **Grammar** library with one pattern from every reading.
- **Me (我):** rank, a bamboo stalk that grows a segment per streak day, a twelve-week activity grid, progress per HSK level, twelve badges, and settings with an on-device **backup code** to move progress between devices.

In a reading, tap **any Chinese word** for its meaning, pronunciation, tone shapes and the sentence it came from; plant it in your deck, or plant all key words at once. Sentence audio, four speeds, pinyin/English/traditional toggles, font size, spacing and word-echo tints are remembered. New in this version: **dictation** (hear a sentence, rebuild it), a **brush practice** queue built from your own deck, tone contours, a pinned daily plan, tricky words, the grammar library and backups.

Grove Radio plays a shuffled, finite playlist at your level with skip, pause and a sleep timer. It stops in the background. News-style pieces are clearly labeled **original practice**, not live journalism. Placement is a six-question starting suggestion; you can change levels at any time.

## Design

The look is defined in three files. `src/theme.ts` holds every colour, typeface and shared style: bamboo greens, panda black and white, bamboo-shoot amber for "next", hibiscus coral for mistakes. `src/art.tsx` holds the vector drawings — the panda (five moods, with or without bamboo), the layered grove scene, the streak stalk, grid paper and tone contours. `src/ui.tsx` holds the shared components. Screens live in `src/screens/`.

Chinese is set in a subset of **LXGW WenKai**, a Kai face close to handwriting; English headings use **Fredoka**. The hanzi font contains only the characters the app shows. After adding Chinese text anywhere in `App.tsx` or `src/`, run:

```sh
npm run fonts
```

`npm run icons` regenerates the app icons from `assets/grove-icon.svg`.

## Speech and pronunciation

Story sentences, multi-character words and the daily sayings have a **recorded studio voice** bundled with the app (generated once with ElevenLabs, then shipped as files in `assets/audio/voice`). They play offline, at 0.65×, 0.85×, 1× and 1.15× with the pitch kept. Single characters, and any text without a recording, use the device's own voice through `expo-speech`, requesting **zh-CN**: without context a synthetic voice cannot know which reading or tone of a lone character is meant. Settings → Sound switches the studio voice and the four interface sounds (right, wrong, finished, planted) on or off.

For the device voice, install a Mandarin speech voice in your device settings. On iPhone the recordings play even in silent mode; the device voice needs the ringer on. Web uses an installed local Mandarin voice and rejects remote-only browser voices; missing voices produce an actionable message.

To regenerate audio after changing stories or the voice, set `ELEVENLABS_API_KEY` in your environment or in `.env.local` (ignored by git) and run:

```sh
npm run audio -- voice    # only text without a file is generated
npm run audio -- sfx
```

The voice, model and sound prompts are in `scripts/audio.json`. The app itself never calls ElevenLabs and needs no key.

Pinyin shows dictionary tones, including neutral syllables. Connected speech can change third tones, 一 and 不. Tone practice includes written discrimination, typed tone recall and hearing isolated tones. Character guides use real ordered stroke medians and approximate tracing checks; they are not general handwriting recognition. Shadowing is self-guided, without microphone scoring.

## Progress and review rules

AsyncStorage keeps progress on the current device/browser. The existing `mandarin-grove.v1` key and original word/chapter IDs are retained. Old saves migrate to the expanded structure while preserving XP, streaks, completed chapters and review cards. Writes are serialized; malformed saves are backed up before replacement. Clearing app/site data removes progress. There is no cloud sync.

Saved words are due immediately. **Again** returns a card in one minute; **Good** schedules at least one day and doubles a previous interval; **Easy** schedules at least four days and triples it. Intervals cap at one year. Strength is a local practice estimate, not an exam score. Due counts refresh every 30 seconds and when the app becomes active.

Correct exercises earn 10–16 XP according to their effort; mistakes earn 2 XP. First exploration of a story adds 25 XP. Story completion records exploration regardless of quiz score; accuracy and vocabulary strength are shown separately. Daily goals are 25, 50 or 100 XP. Goals and streaks never block continued practice.

## Verify

```sh
npx tsc --noEmit
npm test
npx expo export --platform web
```

For exported-app interaction checks, serve `dist/` in one terminal:

```sh
python3 -m http.server 8081 --bind 127.0.0.1 --directory dist
```

Then run `npm run test:dom` in another (set `SMOKE_URL` to use a different port). `npm run test:web` runs the Playwright mobile/desktop flow where Chromium is available; this sandbox's specific browser-launch restriction triggers a clearly reported DOM fallback. A fallback pass **does not** mean visual browser QA passed. Details, coverage and outstanding device checks are in [VALIDATION.md](VALIDATION.md).

To keep command caches inside this project:

```sh
export npm_config_cache="$PWD/.npm-cache"
export __UNSAFE_EXPO_HOME_DIRECTORY="$PWD/.expo-home"
export EXPO_NO_TELEMETRY=1
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache"
```

The Expo home override is a CLI escape hatch for this constrained workspace, not an app requirement. The web export needs a server for initial loading; it does not include a service worker for offline cold starts.

## Content and research

[RESEARCH.md](RESEARCH.md) documents public WireLingo features, teaching method, onboarding, pricing/FAQs, blog posts, reviews and the implementation matrix. [CONTENT.md](CONTENT.md) documents the 618-word curriculum, pronunciation audit, original graded stories and third-party data. Keep the notices in [licenses](licenses/README.md) with redistributed data.

Main source: `App.tsx` holds state, persistence and the modals; `src/screens/` holds the five tabs; `src/Reader.tsx` handles readings; `src/learning.ts` handles scheduling/progress; `src/extras.ts` holds the daily plan, path order, ranks, badges and sayings; `src/exercises.ts` defines practice; `src/stories.ts` and `src/data/` hold bundled content.
