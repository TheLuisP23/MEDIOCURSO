import { esDomingo, HORAS_BLOQUE, hoyEnLima, instanteBloque, sumarDias } from "./bloques.js";
import { ErrorNegocio } from "./errores.js";
import { buscarLaboratorio } from "./laboratorios.js";

/** Reserva tal como la define `Reserva` en docs/api/openapi.yaml. */
export interface Reserva {
  id: string;
  laboratorioId: string;
  fecha: string;
  hora: string;
  usuario: string;
  creadaEn: string;
}

/** Días de anticipación máximos, incluido el último (RN-04). */
export const DIAS_ANTICIPACION = 14;

/** RN-01: el laboratorio debe existir en el catálogo. */
export function validarLaboratorio(id: string): void {
  if (!buscarLaboratorio(id)) {
    throw new ErrorNegocio("LAB_NO_EXISTE", `El laboratorio ${id} no existe.`, 404);
  }
}

/** RN-02: bloque en punto de 07:00 a 21:00, de lunes a sábado. */
export function validarBloque(fecha: string, hora: string): void {
  if (!HORAS_BLOQUE.includes(hora)) {
    throw new ErrorNegocio(
      "BLOQUE_INVALIDO",
      "La hora debe ser un bloque en punto entre las 07:00 y las 21:00.",
      422,
    );
  }
  if (esDomingo(fecha)) {
    throw new ErrorNegocio("BLOQUE_INVALIDO", "Los domingos no se puede reservar.", 422);
  }
}

/** RN-03: no se reserva un bloque que ya empezó o que está en el pasado. */
export function validarNoPasado(fecha: string, hora: string, ahora: Date): void {
  if (instanteBloque(fecha, hora).getTime() <= ahora.getTime()) {
    throw new ErrorNegocio("FECHA_PASADA", "Ese bloque ya empezó o está en el pasado.", 422);
  }
}

/** RN-04: hasta 14 días de anticipación, contados desde hoy en Lima (el día 14 se incluye). */
export function validarAnticipacion(fecha: string, ahora: Date): void {
  if (fecha > sumarDias(hoyEnLima(ahora), DIAS_ANTICIPACION)) {
    throw new ErrorNegocio(
      "FUERA_DE_RANGO",
      `Solo se puede reservar con hasta ${DIAS_ANTICIPACION} días de anticipación.`,
      422,
    );
  }
}

/** Máximo de bloques por usuario y día, sumando laboratorios (RN-06). */
export const MAX_BLOQUES_POR_DIA = 2;

/** RN-05: `creada` es `false` si el repositorio ya tenía una reserva en ese bloque. */
export function asegurarBloqueLibre(creada: boolean): void {
  if (!creada) {
    throw new ErrorNegocio("BLOQUE_OCUPADO", "Alguien acaba de reservar este bloque.", 409);
  }
}

/** RN-06: con las reservas del usuario en ese día, no puede sumar otra si ya tiene el máximo. */
export function validarLimiteDiario(reservasDelDia: readonly Reserva[]): void {
  if (reservasDelDia.length >= MAX_BLOQUES_POR_DIA) {
    throw new ErrorNegocio(
      "LIMITE_DIARIO",
      `Ya tienes ${MAX_BLOQUES_POR_DIA} bloques reservados ese día.`,
      422,
    );
  }
}

/** RN-07: el usuario no puede tener otra reserva a la misma hora en otro laboratorio. */
export function validarSinChoque(
  reservasDelDia: readonly Reserva[],
  hora: string,
  laboratorioId: string,
): void {
  const choque = reservasDelDia.find((r) => r.hora === hora && r.laboratorioId !== laboratorioId);
  if (choque) {
    throw new ErrorNegocio(
      "CHOQUE_USUARIO",
      `Ya tienes una reserva a las ${hora} en ${choque.laboratorioId}.`,
      409,
    );
  }
}

/** Spec 002, P3: un bloque libre solo se ofrece si se podría reservar ahora. */
export function esReservable(fecha: string, hora: string, ahora: Date): boolean {
  try {
    validarBloque(fecha, hora);
    validarNoPasado(fecha, hora, ahora);
    validarAnticipacion(fecha, ahora);
    return true;
  } catch (error) {
    if (error instanceof ErrorNegocio) return false;
    throw error;
  }
}

/** Id de la reserva según el contrato: `{laboratorioId}.{fecha}.{HH}`. */
export function idReserva(laboratorioId: string, fecha: string, hora: string): string {
  return `${laboratorioId}.${fecha}.${hora.slice(0, 2)}`;
}
