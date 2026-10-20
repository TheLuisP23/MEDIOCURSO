/** Reserva tal como la define `Reserva` en docs/api/openapi.yaml. */
export interface Reserva {
  id: string;
  laboratorioId: string;
  fecha: string;
  hora: string;
  usuario: string;
  creadaEn: string;
}

/** Puerto de acceso a reservas. Implementaciones: memoria.ts y dynamo.ts. */
export interface RepoReservas {
  guardar(reserva: Reserva): Promise<void>;
  delDia(laboratorioId: string, fecha: string): Promise<Reserva[]>;
}
