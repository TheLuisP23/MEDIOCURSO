import { Hono } from "hono";
import type { Dependencias } from "../app.js";
import { esFechaValida } from "../dominio/bloques.js";
import { ErrorNegocio } from "../dominio/errores.js";
import {
  idReserva,
  validarAnticipacion,
  validarBloque,
  validarLaboratorio,
  validarNoPasado,
} from "../dominio/reservas.js";
import { validarUsuario } from "../dominio/usuario.js";
import type { Reserva } from "../repos/reservas.js";

interface NuevaReserva {
  laboratorioId: string;
  fecha: string;
  hora: string;
}

function esNuevaReserva(cuerpo: unknown): cuerpo is NuevaReserva {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;
  const { laboratorioId, fecha, hora } = cuerpo as Record<string, unknown>;
  return (
    typeof laboratorioId === "string" &&
    typeof fecha === "string" &&
    esFechaValida(fecha) &&
    typeof hora === "string"
  );
}

/** Rutas de la spec 002. Se montan en /api/reservas. */
export function rutasReservas({ repoReservas, ahora }: Dependencias) {
  const rutas = new Hono();

  rutas.post("/", async (c) => {
    // Orden fijo: usuario (401) → cuerpo (400) → RN-01 (404) → RN-02, RN-03, RN-04 (422).
    const usuario = validarUsuario(c.req.header("X-Usuario"));
    const cuerpo: unknown = await c.req.json().catch(() => null);
    if (!esNuevaReserva(cuerpo)) {
      throw new ErrorNegocio(
        "VALIDACION",
        "Faltan datos: laboratorioId, fecha (AAAA-MM-DD) y hora.",
        400,
      );
    }
    const { laboratorioId, fecha, hora } = cuerpo;
    const instante = ahora();
    validarLaboratorio(laboratorioId);
    validarBloque(fecha, hora);
    validarNoPasado(fecha, hora, instante);
    validarAnticipacion(fecha, instante);

    const reserva: Reserva = {
      id: idReserva(laboratorioId, fecha, hora),
      laboratorioId,
      fecha,
      hora,
      usuario,
      creadaEn: instante.toISOString(),
    };
    await repoReservas.guardar(reserva);
    return c.json(reserva, 201);
  });

  return rutas;
}
