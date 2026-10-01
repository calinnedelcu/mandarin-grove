# Validation

Completed October 1, 2026.

## Passed

- `npx tsc --noEmit`: strict TypeScript checks for application and verification scripts.
- `npm test`: 72-word / six-lesson content integrity, tone detection, one-minute retry, day-based intervals, streak rollover and gaps, local-date keys, saved-progress parsing, and unique valid choices for all quiz modes.
- `npx expo export --platform web`: successful production web bundle in `dist/`.
- `npx tsx scripts/dom-smoke.ts`: executes the exported app in jsdom, opens a lesson and its dictionary overlay, saves a word, completes a spaced review, finishes eight mixed quiz questions, and checks XP, streak, lesson completion, and AsyncStorage contents. Speech is stubbed; no actual audio is validated by this test.

## Reproduce exported-app checks

```sh
npx expo export --platform web
python3 -m http.server 8081 --directory dist
```

In another terminal in this folder:

```sh
npx tsx scripts/dom-smoke.ts
```

A real Chromium mobile-layout and reload-persistence test is also provided:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache" npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache" npx tsx scripts/web-smoke.ts
```

The Chromium test could not run here: macOS rejected the browser's MachPortRendezvous bootstrap registration under the execution sandbox. The in-app browser was unavailable too. Consequently visual layout, screenshot checks, and the real-browser reload test are **not claimed as passed**. jsdom verifies interactions and storage, but does not implement actual layout or device APIs.

## Phone acceptance checks

Use the README's Expo Go instructions. Open Today → story → a word → listen; try slow audio, complete a quiz, save a word, reveal a review card, and relaunch to confirm progress. Check listening audio with the phone unmuted, haptics, small-screen text wrapping, dictionary overlays, and Android back navigation. These physical-device checks remain unverified in this environment.
