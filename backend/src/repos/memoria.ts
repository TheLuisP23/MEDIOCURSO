import type { RepoReservas, Reserva } from "./reservas.js";

/** Repositorio en memoria: desarrollo local y tests. Se pierde al reiniciar. */
export class RepoMemoria implements RepoReservas {
  private readonly reservas = new Map<string, Reserva>();

  async guardar(reserva: Reserva): Promise<void> {
    this.reservas.set(reserva.id, { ...reserva });
  }

  async delDia(laboratorioId: string, fecha: string): Promise<Reserva[]> {
    return [...this.reservas.values()].filter(
      (reserva) => reserva.laboratorioId === laboratorioId && reserva.fecha === fecha,
    );
  }
}
