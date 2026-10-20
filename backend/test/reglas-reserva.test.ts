import { describe, expect, it } from "vitest";
import { ErrorNegocio } from "../src/dominio/errores.js";
import {
  esReservable,
  idReserva,
  validarAnticipacion,
  validarBloque,
  validarLaboratorio,
  validarNoPasado,
} from "../src/dominio/reservas.js";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = new Date("2026-11-05T10:30:00-05:00");

function codigoDeError(fn: () => void): string | undefined {
  try {
    fn();
  } catch (error) {
    if (error instanceof ErrorNegocio) return error.codigo;
    throw error;
  }
  return undefined;
}

describe("reglas de reserva (dominio)", () => {
  it("RN-01: rechaza un laboratorio que no está en el catálogo", () => {
    expect(codigoDeError(() => validarLaboratorio("LAB-999"))).toBe("LAB_NO_EXISTE");
    expect(codigoDeError(() => validarLaboratorio("LAB-101"))).toBeUndefined();
  });

  it("RN-02: solo acepta bloques en punto de 07:00 a 21:00, de lunes a sábado", () => {
    for (const hora of ["06:00", "07:30", "22:00", "7:00", "abc"]) {
      expect(codigoDeError(() => validarBloque("2026-11-06", hora))).toBe("BLOQUE_INVALIDO");
    }
    expect(codigoDeError(() => validarBloque("2026-11-08", "10:00"))).toBe("BLOQUE_INVALIDO"); // domingo
    expect(codigoDeError(() => validarBloque("2026-11-07", "07:00"))).toBeUndefined(); // sábado
    expect(codigoDeError(() => validarBloque("2026-11-06", "21:00"))).toBeUndefined();
  });

  it("RN-03: rechaza un bloque pasado o que ya empezó", () => {
    expect(codigoDeError(() => validarNoPasado("2026-11-04", "15:00", ahora))).toBe("FECHA_PASADA");
    expect(codigoDeError(() => validarNoPasado("2026-11-05", "10:00", ahora))).toBe("FECHA_PASADA");
    expect(codigoDeError(() => validarNoPasado("2026-11-05", "11:00", ahora))).toBeUndefined();
  });

  it("RN-04: acepta hasta el día 14 incluido y rechaza el día 15", () => {
    expect(codigoDeError(() => validarAnticipacion("2026-11-19", ahora))).toBeUndefined();
    expect(codigoDeError(() => validarAnticipacion("2026-11-20", ahora))).toBe("FUERA_DE_RANGO");
  });

  it("RN-04: cuenta los días desde la fecha de Lima, no la UTC", () => {
    // 22:00 del 5 en Lima = 03:00 del 6 en UTC.
    const casiMedianoche = new Date("2026-11-06T03:00:00Z");
    expect(codigoDeError(() => validarAnticipacion("2026-11-19", casiMedianoche))).toBeUndefined();
    expect(codigoDeError(() => validarAnticipacion("2026-11-20", casiMedianoche))).toBe("FUERA_DE_RANGO");
  });

  it("esReservable combina RN-02, RN-03 y RN-04 (spec 002, P3)", () => {
    expect(esReservable("2026-11-05", "11:00", ahora)).toBe(true);
    expect(esReservable("2026-11-05", "10:00", ahora)).toBe(false);
    expect(esReservable("2026-11-08", "11:00", ahora)).toBe(false);
    expect(esReservable("2026-11-20", "11:00", ahora)).toBe(false);
  });

  it("idReserva sigue el formato del contrato", () => {
    expect(idReserva("LAB-101", "2026-11-05", "10:00")).toBe("LAB-101.2026-11-05.10");
  });
});
