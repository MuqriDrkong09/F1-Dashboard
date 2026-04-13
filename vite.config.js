import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.VITE_GNEWS_API_KEY": JSON.stringify(
        env.VITE_GNEWS_API_KEY ?? "",
      ),
    },
    plugins: [react()],
    server: {
      // Open Dashboard on first dev start (matches in-app `/` → `/dashboard` redirect).
      open: "/dashboard",
    },
  };
});
