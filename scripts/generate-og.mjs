import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "../website/public");
const ogOut = path.join(publicDir, "og.png");
const appleOut = path.join(publicDir, "apple-touch-icon.png");

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3f6ef"/>
  <path d="M0 420 Q200 520 420 480 L0 630 Z" fill="#2d4a1c"/>
  <path d="M1200 0 Q900 80 1200 200 L1200 0 Z" fill="#1e3314"/>
  <text x="80" y="120" fill="#3d5c28" font-family="Segoe UI, system-ui, sans-serif" font-size="28">npm package · any framework</text>
  <text x="80" y="280" fill="#1a2e12" font-family="Segoe UI, system-ui, sans-serif" font-size="72" font-weight="700">universal-datetime-picker</text>
  <text x="80" y="360" fill="#3f6a28" font-family="Segoe UI, system-ui, sans-serif" font-size="40" font-weight="600">Date &amp; time picker for every stack</text>
  <g transform="translate(880, 140)" fill="none" stroke="#3f6a28" stroke-width="12">
    <rect x="0" y="0" width="220" height="200" rx="24"/>
    <line x1="0" y1="56" x2="220" y2="56"/>
    <circle cx="60" cy="130" r="14" fill="#3f6a28"/>
    <circle cx="110" cy="130" r="14" fill="#3f6a28"/>
    <circle cx="160" cy="130" r="14" fill="#3f6a28"/>
    <circle cx="185" cy="175" r="36" fill="#f3f6ef" stroke="#3f6a28" stroke-width="10"/>
    <line x1="185" y1="155" x2="185" y2="175" stroke-width="8"/>
    <line x1="185" y1="175" x2="200" y2="190" stroke-width="8"/>
  </g>
</svg>`;

const appleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="36" fill="#f3f6ef"/>
  <rect x="36" y="40" width="108" height="100" rx="16" fill="none" stroke="#3f6a28" stroke-width="8"/>
  <line x1="36" y1="68" x2="144" y2="68" stroke="#3f6a28" stroke-width="8"/>
  <circle cx="64" cy="100" r="7" fill="#3f6a28"/>
  <circle cx="90" cy="100" r="7" fill="#3f6a28"/>
  <circle cx="116" cy="100" r="7" fill="#3f6a28"/>
  <circle cx="128" cy="128" r="18" fill="#f3f6ef" stroke="#3f6a28" stroke-width="6"/>
  <line x1="128" y1="118" x2="128" y2="128" stroke="#3f6a28" stroke-width="5"/>
  <line x1="128" y1="128" x2="136" y2="136" stroke="#3f6a28" stroke-width="5"/>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(ogOut);
await sharp(Buffer.from(appleSvg)).png().toFile(appleOut);
console.log("Wrote", ogOut);
console.log("Wrote", appleOut);
