import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react") || id.includes("scheduler") || id.includes("react-router")) {
            return "vendor-react";
          }

          if (id.includes("@radix-ui") || id.includes("class-variance-authority") || id.includes("lucide-react") || id.includes("framer-motion")) {
            return "vendor-ui";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }

          if (id.includes("@supabase") || id.includes("@tanstack")) {
            return "vendor-data";
          }

          return "vendor-misc";
        },
      },
    },
  },
}));
