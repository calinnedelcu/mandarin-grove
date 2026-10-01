# Mandarin Grove 🌱

A mobile-first Mandarin learning app inspired by WireLingo's story → practice → review loop. Built with Expo SDK 57, React Native, and TypeScript. No account, backend, paid APIs, or API keys.

## Run on your phone

Requires Node.js 22.13+ and npm. In this folder:

```sh
npm ci
npx expo start --lan
```

1. Install the latest **Expo Go** from the iPhone App Store or Android Play Store. This project needs an Expo Go version supporting SDK 57 ([version selector](https://expo.dev/go)).
2. Connect your computer and phone to the same Wi-Fi network.
3. On iPhone, scan the terminal QR code using Camera and open it in Expo Go. On Android, scan using Expo Go's QR scanner.
4. Keep the development server running while using the app.

If LAN connectivity fails, install the optional tunnel helper locally and start a tunnel:

```sh
npm install --save-dev @expo/ngrok
npx expo start --tunnel
```

Scan the new QR code. Tunnel startup requires internet and can be slower. It does not require an API key. For a browser preview, run `npm run web`.

## What's inside

- 72 bundled Mandarin starter words, six short lessons with original micro-readings and grammar notes.
- Tap-to-open dictionary with tone-colored hanzi and pinyin. First tone: red; second: gold; third: teal; fourth: purple; neutral: gray. Written tone marks remain visible.
- Mandarin audio via `expo-speech`, language `zh-CN`, with normal and slow lesson speed. On iPhone **turn off silent mode** and raise media volume. Install a Chinese text-to-speech voice in device settings if needed. Voice availability and offline speech depend on the device; browser voices can differ.
- Eight-question mixed lesson quizzes plus separate meaning, exact pinyin/tone, and listening practice. Listening prompts are replayable; answers and explanations appear after selection.
- Spaced review: reveal a card and honestly choose Again (1 minute), Good (at least 1 day; doubles a previous interval), or Easy (at least 4 days; triples a previous interval). Quiz answers also schedule cards. Saved dictionary words are due immediately.
- Local XP, 50-XP daily goal, streaks, lesson completion, and review history using AsyncStorage. Correct quiz answers earn 10 XP, missed answers 2; first chapter completion adds 25. A finished quiz marks a chapter explored regardless of score; missed words return sooner.
- Subtle entrance animations, native modal transitions, and haptic feedback where available.

Progress stays on this device/browser. Reloading preserves it; clearing app data or site storage removes it. There is no sync. Due counts update every 30 seconds and on returning to the app. The UI does not block practice when the daily goal is reached.

## Verify

```sh
npx tsc --noEmit
npm test
npx expo export --platform web
```

The export is written to `dist/` (ignored by git). Automated tests cover scheduling, local calendar streaks, progress parsing, content integrity, and quiz answers. Exported-app DOM interaction checks passed; real-browser visual checks were blocked by this environment. Details and reproduction commands are in `VALIDATION.md`. Phone audio and haptics still need confirmation on an actual device.

If all tool caches must stay in this folder, prefix npm commands with `npm_config_cache="$PWD/.npm-cache"` and Expo commands with `__UNSAFE_EXPO_HOME_DIRECTORY="$PWD/.expo-home" EXPO_NO_TELEMETRY=1`. These directories are ignored by git. The Expo directory variable is a CLI escape hatch used for this constrained workspace, not an app requirement.

Read [RESEARCH.md](RESEARCH.md) for the WireLingo research and design rationale. Source: `App.tsx` (UI), `src/content.ts` (curriculum), `src/learning.ts` (learning rules).

## Commit

This environment prevented the requested commit because `.git` is mounted read-only (`git add` could not create `.git/index.lock`). All project files are saved. To commit from a normal terminal in this folder:

```sh
git add .
git commit -m "Build Mandarin Grove Expo learning app with WireLingo research"
```
