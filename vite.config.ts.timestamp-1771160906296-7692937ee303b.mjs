// vite.config.ts
import { defineConfig } from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\Users\\SAMSUNG\\Downloads\\bridging-academy-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxTQU1TVU5HXFxcXERvd25sb2Fkc1xcXFxicmlkZ2luZy1hY2FkZW15LW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFVzZXJzXFxcXFNBTVNVTkdcXFxcRG93bmxvYWRzXFxcXGJyaWRnaW5nLWFjYWRlbXktbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVXNlcnMvU0FNU1VORy9Eb3dubG9hZHMvYnJpZGdpbmctYWNhZGVteS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKCFpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0XCIpIHx8IGlkLmluY2x1ZGVzKFwic2NoZWR1bGVyXCIpIHx8IGlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItcmVhY3RcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAcmFkaXgtdWlcIikgfHwgaWQuaW5jbHVkZXMoXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIikgfHwgaWQuaW5jbHVkZXMoXCJsdWNpZGUtcmVhY3RcIikgfHwgaWQuaW5jbHVkZXMoXCJmcmFtZXItbW90aW9uXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItdWlcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWNoYXJ0c1wiKSB8fCBpZC5pbmNsdWRlcyhcImQzLVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLWNoYXJ0c1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkBzdXBhYmFzZVwiKSB8fCBpZC5pbmNsdWRlcyhcIkB0YW5zdGFja1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLWRhdGFcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItbWlzY1wiO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VSxTQUFTLG9CQUFvQjtBQUN6VyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUM5RSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLENBQUMsR0FBRyxTQUFTLGNBQWMsR0FBRztBQUNoQztBQUFBLFVBQ0Y7QUFFQSxjQUFJLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLFdBQVcsS0FBSyxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQ25GLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFdBQVcsS0FBSyxHQUFHLFNBQVMsMEJBQTBCLEtBQUssR0FBRyxTQUFTLGNBQWMsS0FBSyxHQUFHLFNBQVMsZUFBZSxHQUFHO0FBQ3RJLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFVBQVUsS0FBSyxHQUFHLFNBQVMsS0FBSyxHQUFHO0FBQ2pELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFdBQVcsS0FBSyxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQ3hELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
