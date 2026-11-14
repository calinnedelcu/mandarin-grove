// Generates the bundled audio with ElevenLabs and writes the manifest the
// app reads. Nothing here runs inside the app: the app only plays the files.
//
//   npm run audio -- samples            three short voice samples in audio-samples/
//   npm run audio -- voice [--limit n]  every story sentence, word and saying
//   npm run audio -- singles            record one-character words, keeping only takes whose pitch fits the tone
//   npm run audio -- sfx                the four interface sounds
//   npm run audio -- manifest           rebuild src/data/audio.ts from the files on disk
//
// The key is read from ELEVENLABS_API_KEY (or from .env.local). It is never
// written anywhere. Existing files are skipped, so a run can be resumed and
// only new text costs credits. To change the voice, edit scripts/audio.json,
// delete assets/audio/voice and run `voice` again.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pinyin } from "pinyin-pro";
import { Contour, contourOf } from "./pitch";
import { lessons, tone, words } from "../src/content";
import { pandaLines, proverbs } from "../src/extras";
import { places } from "../src/places";

const root = path.join(__dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "audio.json"), "utf8"),
) as {
  model: string;
  voice: { id: string; name: string };
  settings: Record<string, number | boolean>;
  /** Characters who speak with a voice of their own, by speaker key. */
  speakers: Record<string, { id: string; name: string }>;
  /** The speech-to-text model used to check one-character clips. */
  transcriber?: string;
  /** The middle of the main voice's pitch range, in semitones above 100 Hz. */
  middle?: number;
  samples: { id: string; name: string }[];
  sfx: { name: string; prompt: string; seconds: number }[];
};
const voiceDir = path.join(root, "assets/audio/voice"),
  sfxDir = path.join(root, "assets/audio/sfx");

function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const local = path.join(root, ".env.local");
  if (fs.existsSync(local)) {
    const match = fs
      .readFileSync(local, "utf8")
      .match(/^\s*ELEVENLABS_API_KEY\s*=\s*["']?([^"'\s]+)/m);
    if (match) return match[1];
  }
  console.error("Set ELEVENLABS_API_KEY, or add it to .env.local.");
  process.exit(1);
}

async function request(
  url: string,
  body: unknown,
  attempt = 0,
): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io${url}`, {
    method: "POST",
    headers: { "xi-api-key": key(), "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (res.ok) return Buffer.from(await res.arrayBuffer());
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    return request(url, body, attempt + 1);
  }
  throw Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

function speak(voice: string, text: string, extra: object = {}) {
  return request(`/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
    text,
    model_id: config.model,
    language_code: "zh",
    voice_settings: config.settings,
    ...extra,
  });
}

type Clip = { key: string; text: string; voice: string };

// A single character is the risky case. Asked for one bare syllable, the
// voice often lets sentence intonation win over the word's tone: a first
// tone that falls like a fourth, a fourth that stays high. A wrong tone in
// a language app teaches a mistake, so a one-character clip is only shipped
// if its measured pitch has the shape of its tone (`npm run audio -- singles`
// records several takes and keeps the first that does). Characters with no
// passing take, neutral-tone words and characters whose taught reading is
// not their usual one are left out and keep the device voice.
const checkFile = path.join(__dirname, "audio-check.json");
type Check = {
  ok: boolean;
  why?: string;
  take?: string;
  /** Start, end and mean pitch, in semitones around the speaker's middle. */
  shape?: [number, number, number];
};
const checks: Record<string, Check> = fs.existsSync(checkFile)
  ? JSON.parse(fs.readFileSync(checkFile, "utf8"))
  : {};
/** Syllables spoken in the app that are not vocabulary entries. */
const extraSyllables: Record<string, string> = { 麻: "má", 骂: "mà" };
const single = (text: string) => Array.from(text).length === 1;
const expected = (char: string) =>
  extraSyllables[char] || words.find((w) => w.hanzi === char)?.pinyin || "";
const plain = (syllable: string) =>
  syllable.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function hear(file: string): Promise<string> {
  const form = new FormData();
  form.append("model_id", config.transcriber || "scribe_v1");
  form.append("language_code", "zh");
  form.append(
    "file",
    new Blob([fs.readFileSync(file)], { type: "audio/mpeg" }),
    "clip.mp3",
  );
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key() },
    body: form,
    signal: AbortSignal.timeout(60000),
  }).catch(() => null);
  if (!res) return "";
  if (!res.ok) return "";
  const text = ((await res.json()) as { text?: string }).text || "";
  return text.replace(/[^\u3400-\u9FFF]/g, "");
}

/**
 * Whether a contour has the shape of a tone. Pitch is measured in semitones
 * around `config.middle`, the middle of the main voice's range.
 */
function fits(wanted: number, c: Contour) {
  if (c.frames < 12) return false;
  const middle = config.middle ?? 13,
    start = c.start - middle,
    end = c.end - middle,
    mean = c.mean - middle,
    low = c.low - middle;
  if (wanted === 1)
    return start >= 1.5 && mean >= 1 && Math.abs(end - start) <= 2.5;
  if (wanted === 2) return end - start >= 3 && end >= 0;
  if (wanted === 3)
    return mean <= -1.5 && start <= 1.5 && low <= -3.5 && end - start <= 3;
  if (wanted === 4) return start >= 2.5 && start - end >= 5;
  return false;
}

const fileFor = (key: string) =>
  `${createHash("sha1").update(key).digest("hex").slice(0, 12)}.mp3`;

/**
 * Every line the app may speak that is worth a studio voice. A line spoken
 * by a character with a voice of their own is keyed "who|text".
 */
function wanted(): Clip[] {
  const main = config.voice.id,
    lines = lessons.flatMap((l) => l.story),
    vocabulary = words.map((w) => w.hanzi),
    all: Clip[] = [
      ...lines.map((line) => {
        const own = line.speaker && config.speakers[line.speaker];
        return own
          ? {
              key: `${line.speaker}|${line.text}`,
              text: line.text,
              voice: own.id,
            }
          : { key: line.text, text: line.text, voice: main };
      }),
      ...[
        ...vocabulary,
        ...proverbs.map((p) => p.zh),
        ...pandaLines.map((p) => p.zh),
        ...places.map((p) => p.zh),
        ...Object.keys(extraSyllables),
        "你好",
      ].map((text) => ({ key: text, text, voice: main })),
    ];
  return [...new Map(all.map((clip) => [clip.key, clip])).values()];
}

async function pool<T>(
  items: T[],
  size: number,
  work: (item: T) => Promise<void>,
) {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) await work(items[next++]);
    }),
  );
}

function manifest() {
  const made = wanted().filter(
      (c) =>
        fs.existsSync(path.join(voiceDir, fileFor(c.key))) &&
        (!single(c.text) || checks[c.text]?.ok),
    ),
    entries = new Map(made.map((c) => [c.key, fileFor(c.key)]));
  // A line that exists only in a character's voice is also reachable by its
  // text alone, so "hear the answer" plays it too.
  for (const c of made)
    if (!entries.has(c.text)) entries.set(c.text, fileFor(c.key));
  const effects = fs.existsSync(sfxDir)
    ? fs.readdirSync(sfxDir).filter((f) => f.endsWith(".mp3"))
    : [];
  const lines = [
    "// Generated by `npm run audio`. Do not edit by hand.",
    `// Voice: ${config.voice.name} · model ${config.model} · ${made.length} clips.`,
    "",
    "/** Studio recordings, keyed by the Chinese text (or who|text) they speak. */",
    "export const clips: Record<string, number> = {",
    ...[...entries].map(
      ([key, file]) =>
        `  ${JSON.stringify(key)}: require("../../assets/audio/voice/${file}"),`,
    ),
    "};",
    "",
    "/** Short interface sounds. */",
    "export const effects: Record<string, number> = {",
    ...effects.map(
      (f) =>
        `  ${JSON.stringify(f.replace(".mp3", ""))}: require("../../assets/audio/sfx/${f}"),`,
    ),
    "};",
    "",
  ];
  fs.writeFileSync(path.join(root, "src/data/audio.ts"), lines.join("\n"));
  console.log(
    `Manifest: ${made.length} voice clips, ${effects.length} effects.`,
  );
}

const [command, ...rest] = process.argv.slice(2);
const flag = (name: string) => {
  const at = rest.indexOf(`--${name}`);
  return at >= 0 ? rest[at + 1] : undefined;
};

void (async () => {
  if (command === "samples") {
    const dir = path.join(root, "audio-samples"),
      text = "今天我和朋友去商店。你想喝茶吗？我想喝茶，谢谢！";
    fs.mkdirSync(dir, { recursive: true });
    for (const v of config.samples) {
      fs.writeFileSync(
        path.join(dir, `${v.name}.mp3`),
        await speak(v.id, text),
      );
      console.log(`Sample: ${v.name}`);
    }
  } else if (command === "singles") {
    fs.mkdirSync(voiceDir, { recursive: true });
    const todo = wanted().filter((c) => single(c.text) && !checks[c.text]);
    console.log(`${todo.length} one-character clips to record and check.`);
    const takes: [string, (ch: string) => [string, object]][] = [
      ["bare", (ch) => [ch, {}]],
      ["sentence", (ch) => [`${ch}。`, {}]],
      ["prompted", (ch) => [`${ch}。`, { previous_text: "请跟我读：" }]],
      [
        "prompted, take 2",
        (ch) => [`${ch}。`, { previous_text: "请跟我读：", seed: 2 }],
      ],
      ["sentence, take 2", (ch) => [`${ch}。`, { seed: 3 }]],
      [
        "prompted, take 3",
        (ch) => [`${ch}。`, { previous_text: "请跟我读：", seed: 4 }],
      ],
    ];
    let done = 0;
    await pool(todo, 3, async (clip) => {
      const ch = clip.text,
        want = expected(ch),
        file = path.join(voiceDir, fileFor(clip.key)),
        scratch = `${file}.take`;
      if (!tone(want))
        checks[ch] = { ok: false, why: "neutral tone cannot be measured" };
      else if (pinyin(ch) !== want)
        checks[ch] = { ok: false, why: "taught reading is not the usual one" };
      else {
        checks[ch] = { ok: false, why: "no take had the shape of its tone" };
        for (const [name, make] of takes) {
          if (name === "bare" && fs.existsSync(file))
            fs.copyFileSync(file, scratch);
          else {
            const [text, extra] = make(ch);
            fs.writeFileSync(scratch, await speak(clip.voice, text, extra));
          }
          const contour = contourOf(scratch);
          if (!fits(tone(want), contour)) continue;
          // A transcript that names a different syllable vetoes the take.
          const heard = await hear(scratch);
          if (
            Array.from(heard).length === 1 &&
            !(pinyin(heard, { multiple: true, type: "array" }) as string[])
              .map(plain)
              .includes(plain(want))
          )
            continue;
          fs.copyFileSync(scratch, file);
          const middle = config.middle ?? 13;
          checks[ch] = {
            ok: true,
            take: name,
            shape: [
              +(contour.start - middle).toFixed(1),
              +(contour.end - middle).toFixed(1),
              +(contour.mean - middle).toFixed(1),
            ],
          };
          break;
        }
        if (fs.existsSync(scratch)) fs.unlinkSync(scratch);
      }
      if (++done % 25 === 0) {
        console.log(`${done} / ${todo.length}`);
        fs.writeFileSync(checkFile, JSON.stringify(checks, null, 2) + "\n");
      }
    });
    const sorted = Object.fromEntries(
      Object.entries(checks).sort(([x], [y]) => x.localeCompare(y)),
    );
    fs.writeFileSync(checkFile, JSON.stringify(sorted, null, 2) + "\n");
    const all = Object.entries(checks),
      passed = all.filter(([, c]) => c.ok);
    console.log(
      `${passed.length} of ${all.length} one-character clips have the shape of their tone.`,
    );
    for (const why of new Set(
      all.filter(([, c]) => !c.ok).map(([, c]) => c.why),
    ))
      console.log(
        `Left on the device voice (${why}): ${all
          .filter(([, c]) => !c.ok && c.why === why)
          .map(([text]) => text)
          .join("")}`,
      );
    manifest();
  } else if (command === "voice") {
    fs.mkdirSync(voiceDir, { recursive: true });
    const limit = Number(flag("limit")) || Infinity,
      todo = wanted()
        .filter((c) => !fs.existsSync(path.join(voiceDir, fileFor(c.key))))
        .slice(0, limit);
    console.log(
      `${todo.length} clips to make, ${todo.map((c) => c.text).join("").length} characters.`,
    );
    let done = 0;
    await pool(todo, 3, async (clip) => {
      fs.writeFileSync(
        path.join(voiceDir, fileFor(clip.key)),
        await speak(clip.voice, clip.text),
      );
      if (++done % 50 === 0) console.log(`${done} / ${todo.length}`);
    });
    manifest();
  } else if (command === "sfx") {
    fs.mkdirSync(sfxDir, { recursive: true });
    for (const s of config.sfx) {
      const out = path.join(sfxDir, `${s.name}.mp3`);
      if (fs.existsSync(out)) continue;
      fs.writeFileSync(
        out,
        await request("/v1/sound-generation?output_format=mp3_44100_64", {
          text: s.prompt,
          duration_seconds: s.seconds,
          prompt_influence: 0.6,
        }),
      );
      console.log(`Effect: ${s.name}`);
    }
    manifest();
  } else if (command === "manifest") manifest();
  else console.log("Usage: npm run audio -- samples | voice | sfx | manifest");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
