/** Fechas de negocio en hora de Lima (UTC−5 fijo), como AAAA-MM-DD. */

const DIA_MS = 24 * 60 * 60 * 1000;
const DESFASE_LIMA_MS = 5 * 60 * 60 * 1000;

export function hoyEnLima(ahora: Date): string {
  return new Date(ahora.getTime() - DESFASE_LIMA_MS).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * DIA_MS).toISOString().slice(0, 10);
}

export function esDomingo(fecha: string): boolean {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay() === 0;
}
