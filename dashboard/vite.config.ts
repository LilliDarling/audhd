import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [vue(), svgLoader()],
  base: "./",
  build: {
    chunkSizeWarningLimit: 1000,
    minify: true,
    sourcemap: "inline",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".js", ".vue", ".png", ".json"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {},
    watch: {
      usePolling: true,
    },
  },
});
