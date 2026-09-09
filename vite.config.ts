import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mantine": [
            "@mantine/core",
            "@mantine/hooks",
            "@mantine/notifications",
            "@mantine/modals",
            "@mantine/dates",
          ],
          "vendor-dnd": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
          ],
          "vendor-firebase": ["firebase/app", "firebase/messaging"],
        },
      },
    },
  },
});
