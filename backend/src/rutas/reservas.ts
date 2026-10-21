import { Hono } from "hono";
import type { Dependencias } from "../app.js";
import { esFechaValida, hoyEnLima } from "../dominio/bloques.js";
import { ErrorNegocio } from "../dominio/errores.js";
import {
  asegurarBloqueLibre,
  asegurarExiste,
  idReserva,
  sigueVigente,
  validarCancelacionATiempo,
  validarDueno,
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

/** Rutas de las specs 002–004. Se montan en /api/reservas. */
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

  // Spec 004 (CA-14): reservas del usuario cuyo bloque aún no termina, por fecha y hora.
  rutas.get("/mias", async (c) => {
    const usuario = validarUsuario(c.req.header("X-Usuario"));
    const instante = ahora();
    const desdeHoy = `${hoyEnLima(instante)}T00:00`;
    const reservas = await repoReservas.delUsuarioDesde(usuario, desdeHoy);
    return c.json(reservas.filter((r) => sigueVigente(r, instante)));
  });

  // Spec 004 (CA-15). Orden fijo (P3): usuario (401) → RN-10 (404) → RN-08 (403) → RN-09 (422).
  rutas.delete("/:id", async (c) => {
    const usuario = validarUsuario(c.req.header("X-Usuario"));
    const reserva = await repoReservas.obtener(c.req.param("id"));
    asegurarExiste(reserva);
    validarDueno(reserva, usuario);
    validarCancelacionATiempo(reserva, ahora());
    await repoReservas.eliminar(reserva.id);
    return c.body(null, 204);
  });

  return rutas;
}
