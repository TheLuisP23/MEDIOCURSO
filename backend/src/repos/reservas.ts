import type { Reserva } from "../dominio/reservas.js";

export type { Reserva };

/** Puerto de acceso a reservas. Implementaciones: memoria.ts y dynamo.ts. */
export interface RepoReservas {
  /** Inserta si no existe una reserva con el mismo id, de forma atómica (RN-05). `false` = ya existía. */
  guardar(reserva: Reserva): Promise<boolean>;
  delDia(laboratorioId: string, fecha: string): Promise<Reserva[]>;
  delUsuarioEnDia(usuario: string, fecha: string): Promise<Reserva[]>;
}
