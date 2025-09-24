import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import fs from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // 👇 Important: set base path for subfolder
  base: "/itsm_app/",

  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    // 👇 Put final build directly in `dist`
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        {
          name: 'copy-redirects',
          closeBundle() {
            const from = path.resolve(import.meta.dirname, "_redirects");
            const to = path.resolve(import.meta.dirname, "dist/_redirects");
            if (fs.existsSync(from)) {
              fs.copyFileSync(from, to);
            }
          }
        }
      ]
    }
  },
});
