/**
 * Compatibility generator: keep old SentinelGrid logo variants available for
 * signed Windows installers and legacy update artifacts. Public site icons are
 * generated exclusively by generate-kenvoryx-assets.mjs.
 */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const requireFromNext = createRequire(require.resolve("next/package.json"));
const sharp = requireFromNext("sharp");
const root = new URL("../", import.meta.url);
const file = (path) => new URL(path, root);
const mark = await readFile(file("public/logos/sentinelgrid-mark.svg"), "utf8");
const wordmark = await readFile(file("public/logos/sentinelgrid-wordmark.svg"), "utf8");
const body = (svg) => svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" fill="none">
  <svg x="260" y="20" width="280" height="336" viewBox="0 0 320 384">${body(mark)}</svg>
  <svg x="40" y="390" width="720" height="144" viewBox="0 0 800 160">${body(wordmark)}</svg>
</svg>
`;

await writeFile(file("public/logos/sentinelgrid-logo.svg"), logo);
const markPng = await sharp(Buffer.from(mark))
  .resize(512, 512, { fit: "contain", background: "#00000000" })
  .png()
  .toBuffer();
const logoPng = await sharp(Buffer.from(logo)).resize(1600, 1120).png().toBuffer();

await Promise.all([
  writeFile(file("public/logos/sentinelgrid-mark.png"), markPng),
  writeFile(file("public/logos/sentinelgrid-logo.png"), logoPng),
  writeFile(file("public/logos/sentinelgrid_png.png"), markPng),
  writeFile(file("public/logos/sentinelgrid.png"), logoPng),
  sharp(Buffer.from(wordmark))
    .resize(1600, 320)
    .png()
    .toBuffer()
    .then((buffer) => writeFile(file("public/logos/sentinelgrid-wordmark.png"), buffer)),
]);

// Never regenerate the old app/icon.png: Next.js uses app/icon.svg.
await import("./generate-kenvoryx-assets.mjs");
console.log("Legacy agent brand assets retained; KenvoryX website branding refreshed.");
