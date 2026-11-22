import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createPreviewLifecycle } from "./preview-lifecycle.mjs";

export const manualPreviewUrl = "http://127.0.0.1:4173/";
const repoDir = fileURLToPath(new URL("../", import.meta.url));
export const viteEntry = path.join(repoDir, "node_modules", "vite", "bin", "vite.js");
export const previewArguments = [
  viteEntry,
  "preview",
  "--host",
  "127.0.0.1",
  "--port",
  "4173",
  "--strictPort",
];

function openBrowser(url) {
  if (process.env.MANUAL_PREVIEW_OPEN === "0") return;
  if (process.platform !== "win32") return;
  const opener = spawn("cmd.exe", ["/c", "start", "", url], {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  opener.unref();
}

export async function main() {
  // Use npm's prebuild hook for the same vendor assets as CI. The shell
  // resolves npm.cmd on Windows as well as npm on POSIX.
  const build = spawnSync("npm run build", { cwd: repoDir, shell: true, stdio: "inherit" });
  if (build.status !== 0) process.exitCode = build.status ?? 1;
  if (process.exitCode) return;

  const preview = spawn(process.execPath, previewArguments, {
    cwd: repoDir,
    stdio: ["ignore", "pipe", "inherit"],
  });
  const lifecycle = createPreviewLifecycle(preview, { baseUrl: manualPreviewUrl });
  await lifecycle.waitForReady();
  console.log(`Manual acceptance: ${manualPreviewUrl}`);
  console.log("Press Ctrl+C to stop the preview.");
  openBrowser(manualPreviewUrl);

  await Promise.race([
    new Promise((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    }),
    new Promise((_, reject) => {
      preview.once("close", (code, signal) => {
        reject(
          new Error(
            `Vite preview closed unexpectedly (code ${code ?? "none"}, signal ${signal ?? "none"})`,
          ),
        );
      });
    }),
  ]);
  await lifecycle.stop();
}

const isEntry =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isEntry) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
