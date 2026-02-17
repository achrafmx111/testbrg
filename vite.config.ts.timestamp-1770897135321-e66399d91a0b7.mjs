// vite.config.ts
import { defineConfig } from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/Users/SAMSUNG/Downloads/bridging-academy-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\Users\\SAMSUNG\\Downloads\\bridging-academy-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxTQU1TVU5HXFxcXERvd25sb2Fkc1xcXFxicmlkZ2luZy1hY2FkZW15LW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFVzZXJzXFxcXFNBTVNVTkdcXFxcRG93bmxvYWRzXFxcXGJyaWRnaW5nLWFjYWRlbXktbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVXNlcnMvU0FNU1VORy9Eb3dubG9hZHMvYnJpZGdpbmctYWNhZGVteS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmICghaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdFwiKSB8fCBpZC5pbmNsdWRlcyhcInNjaGVkdWxlclwiKSB8fCBpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLXJlYWN0XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHJhZGl4LXVpXCIpIHx8IGlkLmluY2x1ZGVzKFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIpIHx8IGlkLmluY2x1ZGVzKFwibHVjaWRlLXJlYWN0XCIpIHx8IGlkLmluY2x1ZGVzKFwiZnJhbWVyLW1vdGlvblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLXVpXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJkMy1cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInZlbmRvci1jaGFydHNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAc3VwYWJhc2VcIikgfHwgaWQuaW5jbHVkZXMoXCJAdGFuc3RhY2tcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInZlbmRvci1kYXRhXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFwidmVuZG9yLW1pc2NcIjtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFUsU0FBUyxvQkFBb0I7QUFDelcsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxDQUFDLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDaEM7QUFBQSxVQUNGO0FBRUEsY0FBSSxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxXQUFXLEtBQUssR0FBRyxTQUFTLGNBQWMsR0FBRztBQUNuRixtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxXQUFXLEtBQUssR0FBRyxTQUFTLDBCQUEwQixLQUFLLEdBQUcsU0FBUyxjQUFjLEtBQUssR0FBRyxTQUFTLGVBQWUsR0FBRztBQUN0SSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLEtBQUssR0FBRztBQUNqRCxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxXQUFXLEtBQUssR0FBRyxTQUFTLFdBQVcsR0FBRztBQUN4RCxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
