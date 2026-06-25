// Genera el icono de la app (sol de verano) y todos los tamaños PWA con sharp.
import sharp from "sharp";
import fs from "node:fs";

const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((a) => `<rect x="244" y="72" width="24" height="50" rx="12" transform="rotate(${a} 256 246)"/>`)
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFC65A"/>
      <stop offset="0.52" stop-color="#F2884B"/>
      <stop offset="1" stop-color="#E0455E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="0" fill="url(#sky)"/>
  <g fill="#FFF6EA">
    <circle cx="256" cy="246" r="86"/>
    ${rays}
  </g>
</svg>`;

fs.writeFileSync("public/icon.svg", svg);

const buf = Buffer.from(svg);
const out = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/icon-maskable-512.png", 512],
  ["app/icon.png", 256],
  ["app/apple-icon.png", 180],
];

for (const [path, size] of out) {
  await sharp(buf).resize(size, size).png().toFile(path);
  console.log("ok", path, size);
}
console.log("Iconos generados.");
