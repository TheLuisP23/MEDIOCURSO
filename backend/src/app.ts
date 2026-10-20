import { Hono } from "hono";

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

  // Las specs 001–004 registran aquí sus rutas, por ejemplo:
  // app.route("/laboratorios", rutasLaboratorios(deps));

  return app;
}
