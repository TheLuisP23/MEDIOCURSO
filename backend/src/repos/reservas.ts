import type { Reserva } from "../dominio/reservas.js";

export type { Reserva };

/** Puerto de acceso a reservas. Implementaciones: memoria.ts y dynamo.ts. */
export interface RepoReservas {
  /** Inserta si no existe una reserva con el mismo id, de forma atómica (RN-05). `false` = ya existía. */
  guardar(reserva: Reserva): Promise<boolean>;
  obtener(id: string): Promise<Reserva | undefined>;
  eliminar(id: string): Promise<void>;
  delDia(laboratorioId: string, fecha: string): Promise<Reserva[]>;
  delUsuarioEnDia(usuario: string, fecha: string): Promise<Reserva[]>;
  /** Reservas del usuario con `fechaHora` (AAAA-MM-DDTHH:MM) mayor o igual a `desde`, en orden. */
  delUsuarioDesde(usuario: string, desde: string): Promise<Reserva[]>;
}
