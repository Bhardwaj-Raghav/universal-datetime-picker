import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "../website/public");
const faviconPath = path.join(publicDir, "favicon.svg");
const ogOut = path.join(publicDir, "og.png");
const appleOut = path.join(publicDir, "apple-touch-icon.png");

const faviconSvg = await fs.readFile(faviconPath, "utf8");

await sharp(Buffer.from(faviconSvg))
  .resize(180, 180)
  .png()
  .toFile(appleOut);
console.log("Wrote", appleOut);

const faviconInner = faviconSvg
  .replace(/<\?xml[^>]*>/i, "")
  .replace(/<svg[^>]*>/i, "")
  .replace(/<\/svg>\s*$/i, "")
  .trim();

// favicon viewBox is 32×32; scale to a 200px mark on the OG card.
const markSize = 200;
const markScale = markSize / 32;
const markX = 1200 - 80 - markSize;
const markY = Math.round((630 - markSize) / 2);

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3f6ef"/>
  <path d="M0 420 Q200 520 420 480 L0 630 Z" fill="#2d4a1c"/>
  <path d="M1200 0 Q900 80 1200 200 L1200 0 Z" fill="#1e3314"/>
  <text x="80" y="120" fill="#3d5c28" font-family="Segoe UI, system-ui, sans-serif" font-size="28">npm package · any framework</text>
  <text x="80" y="280" fill="#1a2e12" font-family="Segoe UI, system-ui, sans-serif" font-size="64" font-weight="700">universal-datetime-picker</text>
  <text x="80" y="360" fill="#3f6a28" font-family="Segoe UI, system-ui, sans-serif" font-size="40" font-weight="600">Date &amp; time picker for every stack</text>
  <g transform="translate(${markX} ${markY}) scale(${markScale})">
    ${faviconInner}
  </g>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(ogOut);
console.log("Wrote", ogOut);
