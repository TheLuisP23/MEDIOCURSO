import { Hono } from "hono";
import type { Dependencias } from "../app.js";
import { esFechaValida, HORAS_BLOQUE } from "../dominio/bloques.js";
import { ErrorNegocio } from "../dominio/errores.js";
import { CATALOGO_LABORATORIOS } from "../dominio/laboratorios.js";
import { esReservable, validarLaboratorio } from "../dominio/reservas.js";

/** Rutas de las specs 001 y 002. Se montan en /api/laboratorios. */
export function rutasLaboratorios({ repoReservas, ahora }: Dependencias) {
  const rutas = new Hono();

  rutas.get("/", (c) => c.json(CATALOGO_LABORATORIOS));

  rutas.get("/:id/disponibilidad", async (c) => {
    const id = c.req.param("id");
    const fecha = c.req.query("fecha") ?? "";
    if (!esFechaValida(fecha)) {
      throw new ErrorNegocio("VALIDACION", "La fecha debe tener el formato AAAA-MM-DD.", 400);
    }
    validarLaboratorio(id);

    const ocupadas = new Set((await repoReservas.delDia(id, fecha)).map((r) => r.hora));
    const instante = ahora();
    const bloques = HORAS_BLOQUE.map((hora) => ({
      hora,
      disponible: !ocupadas.has(hora) && esReservable(fecha, hora, instante),
    }));

    return c.json({ laboratorioId: id, fecha, bloques });
  });

  return rutas;
}
