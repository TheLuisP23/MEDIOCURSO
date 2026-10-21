import type { RepoReservas, Reserva } from "./reservas.js";

/** Repositorio en memoria: desarrollo local y tests. Se pierde al reiniciar. */
export class RepoMemoria implements RepoReservas {
  private readonly reservas = new Map<string, Reserva>();

  async guardar(reserva: Reserva): Promise<boolean> {
    // Comprobar y escribir sin `await` en medio: atómico en el hilo único de Node,
    // igual que el PutItem condicional de DynamoDB (spec 003, P1).
    if (this.reservas.has(reserva.id)) return false;
    this.reservas.set(reserva.id, { ...reserva });
    return true;
  }

  async obtener(id: string): Promise<Reserva | undefined> {
    const reserva = this.reservas.get(id);
    return reserva && { ...reserva };
  }

  async eliminar(id: string): Promise<void> {
    this.reservas.delete(id);
  }

  async delUsuarioDesde(usuario: string, desde: string): Promise<Reserva[]> {
    const fechaHora = (r: Reserva) => `${r.fecha}T${r.hora}`;
    return [...this.reservas.values()]
      .filter((r) => r.usuario === usuario && fechaHora(r) >= desde)
      .sort((a, b) => fechaHora(a).localeCompare(fechaHora(b)));
  }

  async delDia(laboratorioId: string, fecha: string): Promise<Reserva[]> {
    return [...this.reservas.values()].filter(
      (reserva) => reserva.laboratorioId === laboratorioId && reserva.fecha === fecha,
    );
  }

  async delUsuarioEnDia(usuario: string, fecha: string): Promise<Reserva[]> {
    return [...this.reservas.values()].filter(
      (reserva) => reserva.usuario === usuario && reserva.fecha === fecha,
    );
  }
}
