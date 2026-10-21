// Servidor HTTP de la API: local (npm run dev) y en la EC2 (dist/server.mjs, spec 005).
import { serve } from "@hono/node-server";
import { crearApp } from "./app.js";

const puerto = Number(process.env.PORT ?? 3000);

serve({ fetch: crearApp().fetch, port: puerto }, () => {
  console.log(`API local en http://localhost:${puerto}/api/health`);
});
