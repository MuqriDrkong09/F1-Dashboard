import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Open Dashboard on first dev start (matches in-app `/` → `/dashboard` redirect).
    open: "/dashboard",
  },
});
