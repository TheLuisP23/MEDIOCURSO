import { Hono } from "hono";
import { CATALOGO_LABORATORIOS } from "../dominio/laboratorios.js";

/** Rutas de la spec 001. Se montan en /api/laboratorios. */
export function rutasLaboratorios() {
  const rutas = new Hono();

  rutas.get("/", (c) => c.json(CATALOGO_LABORATORIOS));

  return rutas;
}
