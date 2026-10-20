import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const requireFromNext = createRequire(require.resolve("next/package.json"));
const sharp = requireFromNext("sharp");
const root = new URL("../", import.meta.url);
const file = (name) => new URL(name, root);

const mark = await readFile(file("public/logos/kenvoryx-mark.svg"));
const wordmark = await readFile(file("public/logos/kenvoryx-wordmark.svg"));
const lockup = await readFile(file("public/logos/kenvoryx-lockup.svg"));

const markPng = await sharp(mark)
  .resize(512, 512, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();

const wordmarkPng = await sharp(wordmark)
  .resize(1600, 300, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();

const lockupPng = await sharp(lockup)
  .resize(1600, 420, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();

const appleIcon = await sharp(mark)
  .resize(156, 156, { fit: "contain", background: "#00000000" })
  .extend({ top: 12, bottom: 12, left: 12, right: 12, background: "#071221" })
  .png()
  .toBuffer();

const socialMark = await sharp(mark)
  .resize(240, 250, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();
const socialWordmark = await sharp(wordmark)
  .resize(630, 120, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();
const tagline = Buffer.from(
  '<svg width="760" height="80" xmlns="http://www.w3.org/2000/svg"><text x="0" y="54" fill="#9CAEC4" font-family="Arial,Helvetica,sans-serif" font-weight="500" font-size="35">Monitor. Manage. Secure.</text></svg>'
);
const social = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#06101e" },
})
  .composite([
    { input: socialMark, left: 93, top: 174 },
    { input: socialWordmark, left: 352, top: 190 },
    { input: tagline, left: 365, top: 327 },
  ])
  .png()
  .toBuffer();

await Promise.all([
  writeFile(file("public/logos/kenvoryx-mark.png"), markPng),
  writeFile(file("public/logos/kenvoryx-wordmark.png"), wordmarkPng),
  writeFile(file("public/logos/kenvoryx-lockup.png"), lockupPng),
  writeFile(file("app/apple-icon.png"), appleIcon),
  writeFile(file("public/og-image.png"), social),
]);

console.log("KenvoryX site logo, Apple icon and social card generated.");
