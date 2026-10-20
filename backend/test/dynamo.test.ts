import { describe, expect, it } from "vitest";
import { aItem, deItem } from "../src/repos/dynamo.js";

const reserva = {
  id: "LAB-101.2026-11-06.10",
  laboratorioId: "LAB-101",
  fecha: "2026-11-06",
  hora: "10:00",
  usuario: "20231234",
  creadaEn: "2026-11-05T15:30:00.000Z",
};

describe("repos/dynamo: conversión al modelo de la tabla", () => {
  it("usa el id como pk y arma fechaHora para el índice porUsuario", () => {
    expect(aItem(reserva)).toEqual({
      pk: "LAB-101.2026-11-06.10",
      laboratorioId: "LAB-101",
      fecha: "2026-11-06",
      hora: "10:00",
      usuario: "20231234",
      fechaHora: "2026-11-06T10:00",
      creadaEn: "2026-11-05T15:30:00.000Z",
    });
  });

  it("deItem recupera la reserva del contrato", () => {
    expect(deItem(aItem(reserva))).toEqual(reserva);
  });
});
