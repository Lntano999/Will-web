import {
  copyFile,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const publicDir = path.join(repoDir, "public");
const vendorDir = path.join(publicDir, "vendor");
const relativeTarget = path
  .relative(publicDir, vendorDir)
  .split(path.sep)
  .join("/");

if (relativeTarget !== "vendor") {
  throw new Error(`Refusing to clean unexpected vendor path: ${vendorDir}`);
}

const assets = [
  {
    source: "animejs/dist/bundles/anime.umd.min.js",
    target: "anime/anime.umd.min.js",
  },
  {
    source: "gsap/dist/gsap.min.js",
    target: "gsap/gsap.min.js",
  },
  {
    source: "gsap/dist/SplitText.min.js",
    target: "gsap/SplitText.min.js",
  },
  {
    source: "gsap/dist/ScrollTrigger.min.js",
    target: "gsap/ScrollTrigger.min.js",
  },
  {
    source: "lenis/dist/lenis.min.js",
    target: "lenis/lenis.min.js",
  },
  {
    source: "lenis/dist/lenis.css",
    target: "lenis/lenis.css",
  },
  {
    source: "animejs/LICENSE.md",
    target: "licenses/ANIMEJS-LICENSE.md",
  },
  {
    source: "lenis/LICENSE",
    target: "licenses/LENIS-LICENSE.txt",
  },
];

await rm(vendorDir, { recursive: true, force: true });

for (const asset of assets) {
  const sourcePath = path.join(repoDir, "node_modules", asset.source);
  const targetPath = path.join(vendorDir, asset.target);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

const gsapPackage = JSON.parse(
  await readFile(path.join(repoDir, "node_modules", "gsap", "package.json"), "utf8"),
);
const gsapNotice = [
  `GSAP ${gsapPackage.version}`,
  `License: ${gsapPackage.license}`,
  "Official terms: https://gsap.com/standard-license/",
  "",
  "The npm package does not include a standalone license text file.",
  "This notice records the license metadata distributed with the package.",
  "",
].join("\n");
const gsapNoticePath = path.join(
  vendorDir,
  "licenses",
  "GSAP-LICENSE-NOTICE.txt",
);
await mkdir(path.dirname(gsapNoticePath), { recursive: true });
await writeFile(gsapNoticePath, gsapNotice, "utf8");

console.log(`Synced ${assets.length + 1} approved vendor files.`);
