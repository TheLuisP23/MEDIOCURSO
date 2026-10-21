import { Hono } from "hono";
import { ErrorNegocio } from "./dominio/errores.js";
import { RepoDynamo } from "./repos/dynamo.js";
import { RepoMemoria } from "./repos/memoria.js";
import type { RepoReservas } from "./repos/reservas.js";
import { rutasLaboratorios } from "./rutas/laboratorios.js";
import { rutasReservas } from "./rutas/reservas.js";

/** Dependencias inyectables (los tests pasan un repo en memoria y un reloj fijo). */
export interface Dependencias {
  repoReservas: RepoReservas;
  ahora: () => Date;
}

/** DynamoDB si existe TABLA_RESERVAS (producción); si no, memoria (local). */
function repoPorDefecto(): RepoReservas {
  const tabla = process.env.TABLA_RESERVAS;
  return tabla ? new RepoDynamo(tabla) : new RepoMemoria();
}

/**
 * Punto de entrada HTTP de la API. Todas las rutas cuelgan de /api
 * (así nginx puede enrutar /api/* al backend y el resto al frontend).
 *
 * Contrato: docs/api/openapi.yaml — NO agregar rutas que no estén ahí.
 * Las rutas de cada spec se registran desde src/rutas/ (ver backend/AGENTS.md).
 */
export function crearApp(dependencias: Partial<Dependencias> = {}) {
  const deps: Dependencias = {
    repoReservas: dependencias.repoReservas ?? repoPorDefecto(),
    ahora: dependencias.ahora ?? (() => new Date()),
  };
  const app = new Hono().basePath("/api");

  app.get("/health", (c) => c.json({ estado: "ok" }));

  // Rutas de cada spec (las specs 003–004 agregan las suyas aquí).
  app.route("/laboratorios", rutasLaboratorios(deps));
  app.route("/reservas", rutasReservas(deps));

  // Único lugar que traduce errores a respuestas HTTP.
  app.onError((error, c) => {
    if (error instanceof ErrorNegocio) {
      return c.json({ codigo: error.codigo, mensaje: error.message }, error.status);
    }
    console.error(error);
    return c.json({ mensaje: "Ocurrió un error inesperado en el servidor." }, 500);
  });

  return app;
}
