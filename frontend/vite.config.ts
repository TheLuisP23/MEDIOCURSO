/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En local, /api se redirige al backend (puerto 3000).
// En AWS, CloudFront hace lo mismo: /api/* → API Gateway. Por eso el front
// siempre llama a rutas relativas "/api/..." y nunca necesita CORS ni URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3000" },
  },
  test: {
    environment: "jsdom",
  },
});
