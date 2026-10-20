import { Hono } from "hono";
import type { Dependencias } from "../app.js";
import { esFechaValida } from "../dominio/bloques.js";
import { ErrorNegocio } from "../dominio/errores.js";
import {
  asegurarBloqueLibre,
  idReserva,
  validarAnticipacion,
  validarBloque,
  validarLaboratorio,
  validarLimiteDiario,
  validarNoPasado,
  validarSinChoque,
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
    // Orden fijo: usuario (401) → cuerpo (400) → RN-01 (404) → RN-02, RN-03, RN-04 (422)
    // → RN-07 (409) → RN-06 (422) → RN-05 (409).
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

    // Spec 003: RN-07 y RN-06 con una consulta previa; RN-05 atómica al guardar.
    const delUsuario = await repoReservas.delUsuarioEnDia(usuario, fecha);
    validarSinChoque(delUsuario, hora, laboratorioId);
    validarLimiteDiario(delUsuario);

    const reserva: Reserva = {
      id: idReserva(laboratorioId, fecha, hora),
      laboratorioId,
      fecha,
      hora,
      usuario,
      creadaEn: instante.toISOString(),
    };
    asegurarBloqueLibre(await repoReservas.guardar(reserva));
    return c.json(reserva, 201);
  });

  return rutas;
}
