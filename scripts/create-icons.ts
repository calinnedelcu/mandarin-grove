// Renders the app icons from assets/grove-icon.svg: the native icons in
// assets/, and the web app's home-screen icons in public/.
import sharp from "sharp";
async function main() {
  for (const [file, size] of [
    ["assets/icon.png", 1024],
    ["assets/favicon.png", 64],
    ["assets/splash-icon.png", 200],
    ["public/icon-192.png", 192],
    ["public/icon-512.png", 512],
    ["public/apple-touch-icon.png", 180],
  ] as const)
    await sharp("assets/grove-icon.svg").resize(size, size).png().toFile(file);
  // A maskable icon is cropped to a circle or squircle by the launcher, so
  // the drawing sits smaller on a full square of the same green.
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: "#2F9654" },
  })
    .composite([
      {
        input: await sharp("assets/grove-icon.svg")
          .resize(400, 400)
          .png()
          .toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toFile("public/icon-maskable-512.png");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
