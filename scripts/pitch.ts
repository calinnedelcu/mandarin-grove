// Reads the tone of a one-syllable recording from its pitch contour.
//
// A Mandarin tone is a shape of pitch over the syllable: level, rising,
// dipping or falling. This file decodes a clip, tracks its fundamental
// frequency with the YIN method, and says which of the four shapes it is.
// It is used to check that a generated one-character clip really carries
// the tone the app teaches. It needs macOS's `afconvert` to decode MP3.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RATE = 16000;

function decode(file: string): Float32Array {
  const wav = path.join(os.tmpdir(), `grove-${process.pid}-${Date.now()}.wav`);
  execFileSync("afconvert", [
    "-f",
    "WAVE",
    "-d",
    `LEI16@${RATE}`,
    "-c",
    "1",
    file,
    wav,
  ]);
  const bytes = fs.readFileSync(wav);
  fs.unlinkSync(wav);
  const start = bytes.indexOf(Buffer.from("data")) + 8,
    count = Math.floor((bytes.length - start) / 2),
    samples = new Float32Array(count);
  for (let i = 0; i < count; i++)
    samples[i] = bytes.readInt16LE(start + i * 2) / 32768;
  return samples;
}

/** Fundamental frequency, in Hz, of each voiced 5 ms frame (YIN). */
function track(samples: Float32Array): number[] {
  const size = 512,
    hop = 80,
    minLag = Math.floor(RATE / 500),
    maxLag = Math.floor(RATE / 75),
    rms = (at: number) => {
      let sum = 0;
      for (let i = 0; i < size; i++) sum += samples[at + i] ** 2;
      return Math.sqrt(sum / size);
    };
  let loudest = 0;
  for (let at = 0; at + size + maxLag < samples.length; at += hop)
    loudest = Math.max(loudest, rms(at));
  const f0: number[] = [];
  for (let at = 0; at + size + maxLag < samples.length; at += hop) {
    if (rms(at) < loudest * 0.1) continue;
    const norm = new Float32Array(maxLag + 1);
    let running = 0;
    norm[0] = 1;
    for (let lag = 1; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        const d = samples[at + i] - samples[at + i + lag];
        sum += d * d;
      }
      running += sum;
      // Cumulative mean normalised difference.
      norm[lag] = running ? (sum * lag) / running : 1;
    }
    // The first clear dip is the period; failing that, the deepest one.
    let best = -1;
    for (let lag = minLag; lag <= maxLag; lag++)
      if (norm[lag] < 0.2) {
        while (lag + 1 <= maxLag && norm[lag + 1] < norm[lag]) lag++;
        best = lag;
        break;
      }
    if (best < 0) {
      let deepest = minLag;
      for (let lag = minLag; lag <= maxLag; lag++)
        if (norm[lag] < norm[deepest]) deepest = lag;
      if (norm[deepest] > 0.4) continue;
      best = deepest;
    }
    const a = norm[best - 1] ?? norm[best],
      b = norm[best],
      c = norm[best + 1] ?? norm[best],
      shift = a - 2 * b + c ? (a - c) / (2 * (a - 2 * b + c)) : 0;
    f0.push(RATE / (best + shift));
  }
  return f0;
}

export type Contour = {
  /** Pitch in semitones above 100 Hz: at the start, at the end, on average. */
  start: number;
  end: number;
  mean: number;
  /** The lowest point, and where it falls from 0 (start) to 1 (end). */
  low: number;
  lowAt: number;
  /** Voiced 5 ms frames measured; under a dozen is too little to judge. */
  frames: number;
};

/** The pitch shape of a one-syllable clip. */
export function contourOf(file: string): Contour {
  const raw = track(decode(file));
  // An octave slip shows as a sudden jump between neighbouring frames, so
  // each frame is brought back within reach of the one before it. (Folding
  // towards the clip's median instead would turn a steep fall into a rise.)
  const anchor =
      [...raw.slice(0, 7)].sort((x, y) => x - y)[
        Math.floor(Math.min(7, raw.length) / 2)
      ] || 100,
    steady: number[] = [];
  for (const value of raw) {
    // A frame with no usable pitch is skipped rather than folded forever.
    if (!Number.isFinite(value) || value <= 0) continue;
    let f = value;
    const before = steady.length ? steady[steady.length - 1] : anchor;
    for (let i = 0; i < 4 && f > before * 1.55; i++) f /= 2;
    for (let i = 0; i < 4 && f < before / 1.55; i++) f *= 2;
    steady.push(f);
  }
  // Trim the unsteady first and last twentieth, then a five-point median.
  const cut = Math.floor(steady.length * 0.05),
    st = steady
      .slice(cut, steady.length - cut)
      .map((f) => 12 * Math.log2(f / 100)),
    smooth = st.map(
      (v, i) =>
        [
          st[i - 2] ?? v,
          st[i - 1] ?? v,
          v,
          st[i + 1] ?? v,
          st[i + 2] ?? v,
        ].sort((x, y) => x - y)[2],
    );
  const n = smooth.length;
  if (n < 12) return { start: 0, end: 0, mean: 0, low: 0, lowAt: 0, frames: n };
  const edge = Math.max(2, Math.round(n * 0.2)),
    mean = (values: number[]) =>
      values.reduce((sum, v) => sum + v, 0) / values.length,
    low = Math.min(...smooth);
  return {
    start: mean(smooth.slice(0, edge)),
    end: mean(smooth.slice(-edge)),
    mean: mean(smooth),
    low,
    lowAt: smooth.indexOf(low) / (n - 1),
    frames: n,
  };
}
