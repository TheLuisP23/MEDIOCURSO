/** Horas de inicio de los 15 bloques de una hora: "07:00" … "21:00". */
export const HORAS_BLOQUE: readonly string[] = Array.from(
  { length: 15 },
  (_, i) => `${String(7 + i).padStart(2, "0")}:00`,
);

const DIA_MS = 24 * 60 * 60 * 1000;
const DESFASE_LIMA_MS = 5 * 60 * 60 * 1000; // UTC−5 fijo, sin horario de verano

/** Instante en que empieza un bloque, en hora de Lima. */
export function instanteBloque(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00-05:00`);
}

/** `true` si el texto es una fecha real con formato AAAA-MM-DD. */
export function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

export function esDomingo(fecha: string): boolean {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay() === 0;
}

/** Fecha de hoy (AAAA-MM-DD) en Lima para el instante dado. */
export function hoyEnLima(ahora: Date): string {
  return new Date(ahora.getTime() - DESFASE_LIMA_MS).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * DIA_MS).toISOString().slice(0, 10);
}
