import { Hono } from "hono";
import { rutasLaboratorios } from "./rutas/laboratorios.js";

/**
 * Punto de entrada HTTP de la API. Todas las rutas cuelgan de /api
 * (así CloudFront puede enrutar /api/* al backend y el resto al frontend).
 *
 * Contrato: docs/api/openapi.yaml — NO agregar rutas que no estén ahí.
 * Las rutas de cada spec se registran desde src/rutas/ (ver backend/AGENTS.md).
 */
export function crearApp() {
  const app = new Hono().basePath("/api");

  app.get("/health", (c) => c.json({ estado: "ok" }));

  // Rutas de cada spec (las specs 002–004 agregan las suyas aquí).
  app.route("/laboratorios", rutasLaboratorios());

  return app;
}
