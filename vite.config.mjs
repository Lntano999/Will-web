import { defineConfig } from "vite";

const SOURCE_VENDOR_PREFIX = "./public/vendor/";
const SERVED_VENDOR_PREFIX = "/vendor/";

export function rewriteVendorPathsForVite(html) {
  return html.replaceAll(SOURCE_VENDOR_PREFIX, SERVED_VENDOR_PREFIX);
}

const directFileVendorPathsPlugin = {
  name: "will-web-direct-file-vendor-paths",
  transformIndexHtml: {
    order: "pre",
    handler: rewriteVendorPathsForVite,
  },
};

export default defineConfig({
  plugins: [directFileVendorPathsPlugin],
  appType: "mpa",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});
