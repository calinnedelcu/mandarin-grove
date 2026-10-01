# Mandarin Grove 🌱

A warm, mobile-first Mandarin companion for **beginners through HSK 3**. Read something small, hear it, keep useful words, and watch your understanding grow. Inspired by WireLingo's contextual reading → listening → practice → review loop, with original content and a fully local learning system.

Built with the existing **Expo SDK 57, React Native and TypeScript** stack. No account, backend, paid API, API key or subscription.

## Run

From this project, with the existing dependencies installed:

```sh
npx expo start --lan
```

Open the QR code using an **Expo Go version compatible with SDK 57**, with your phone and computer on the same Wi-Fi. A development server is needed for this development workflow. Use `npm run web` for a browser preview. For an installed native build, learning data and progress are local and need no network service.

For a clean dependency installation, run `npm ci`. No new runtime dependencies or generated Android changes are required by this update.

## Explore the grove

- **Today:** your personalized reading, resume point, flexible daily goal, streak and Grove Radio.
- **Stories:** 42 original readings, topic/level/search filters, bookmarks and explored-story filters. Twelve stories have separate HSK 1, 2 and 3 versions; the six original starter chapters remain available.
- **Review:** reveal-before-answer spaced cards; seven practice pools; meaning, reverse meaning, pinyin, listening, matching pairs, sentence building/writing, tone studio, a 60-second sprint and calm Zen practice.
- **Words:** 618 entries with tone-marked pinyin, English, traditional forms and searchable personal vocabulary. Tap a character for its radical, visual components and guided stroke practice.
- **Progress:** activity heatmap, reading minutes, vocabulary strength, HSK growth, accuracy, tone practice, writing, milestones and your level/goal/interests.

In a reading, tap **any Chinese word** for its meaning, pronunciation and current sentence. Plant it in your personal deck; save grammar patterns; reveal sentence translations; switch story levels; or listen sentence by sentence. Reader preferences remember pinyin, English, simplified/traditional display, WordEcho highlighting, font size and spacing.

Grove Radio plays a shuffled, finite library at your chosen level, with automatic story transitions, skip, pause and a sleep timer. It stops in the background. News-style pieces are clearly labeled **original practice**, not live journalism. Placement is a six-question starting suggestion; you can change levels at any time.

The UI uses an ivory/green garden palette, illustrated cards, generous touch controls, entrance animations, completion feedback and native haptics where supported. Tab animation respects the device's reduced-motion preference.

## Speech and pronunciation

Audio uses `expo-speech`, requesting **zh-CN**, with 0.65×, 0.85×, 1× and 1.15× speeds. Install a Mandarin speech voice in your device settings for offline audio. On iPhone, turn off silent mode and raise media volume. Web uses an installed local Mandarin voice and rejects remote-only browser voices; missing voices produce an actionable message. Actual voice quality and native offline availability depend on the device.

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

Then run `npm run test:dom` in another. `npm run test:web` runs the Playwright mobile/desktop flow where Chromium is available; this sandbox's specific browser-launch restriction triggers a clearly reported DOM fallback. A fallback pass **does not** mean visual browser QA passed. Details, coverage and outstanding device checks are in [VALIDATION.md](VALIDATION.md).

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

Main source: `App.tsx` coordinates the five tabs and persistence; `src/Reader.tsx` handles readings; `src/learning.ts` handles scheduling/progress; `src/exercises.ts` defines practice; `src/stories.ts` and `src/data/` hold bundled content. All changes are saved in this folder. No commit was attempted.
