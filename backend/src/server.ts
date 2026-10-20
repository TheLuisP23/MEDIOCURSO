// Servidor local para desarrollo (npm run dev). En AWS se usa src/lambda.ts.
import { serve } from "@hono/node-server";
import { crearApp } from "./app.js";

const puerto = Number(process.env.PORT ?? 3000);

serve({ fetch: crearApp().fetch, port: puerto }, () => {
  console.log(`API local en http://localhost:${puerto}/api/health`);
});
