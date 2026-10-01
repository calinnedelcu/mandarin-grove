import sharp from "sharp";
async function main() {
  for (const [file, size] of [
    ["icon.png", 1024],
    ["favicon.png", 64],
    ["splash-icon.png", 200],
  ] as const) {
    await sharp("assets/grove-icon.svg")
      .resize(size, size)
      .png()
      .toFile(`assets/${file}`);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
