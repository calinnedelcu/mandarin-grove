// Builds the small Kai-style hanzi fonts bundled with the app.
//
// LXGW WenKai (SIL OFL 1.1) is ~9 MB per weight. The app only ever shows the
// characters found in its own curriculum, stories and interface, so this
// script collects exactly those and writes a subset of a few hundred KB.
// Run `npm run fonts` after adding Chinese text anywhere in App.tsx or src/.
import fs from "node:fs";
import path from "node:path";
import subsetFont from "subset-font";

const root = path.join(__dirname, "..");
const source = path.join(root, "node_modules/@fontsource/lxgw-wenkai/files");
const out = path.join(root, "assets/fonts");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx?|json)$/.test(entry.name) ? [full] : [];
  });
}

const cjk = /[⺀-⿟　-〿㐀-䶿一-鿿豈-﫿＀-￯]/gu;
const chars = new Set<string>(
  "0123456789·…—–“”‘’，。！？、：；（）《》「」『』〇一二三四五六七八九十百千万年月日星期天",
);
for (const file of [
  path.join(root, "App.tsx"),
  ...walk(path.join(root, "src")),
])
  for (const match of fs.readFileSync(file, "utf8").match(cjk) || [])
    chars.add(match);

async function build(weight: number, name: string) {
  const input = fs.readFileSync(
    path.join(source, `lxgw-wenkai-latin-${weight}-normal.woff2`),
  );
  const subset = await subsetFont(input, [...chars].join(""), {
    targetFormat: "truetype",
  });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, name), subset);
  console.log(`${name}: ${chars.size} characters, ${subset.length} bytes`);
}

void (async () => {
  await build(500, "GroveKai-Regular.ttf");
  await build(700, "GroveKai-Bold.ttf");
})();
