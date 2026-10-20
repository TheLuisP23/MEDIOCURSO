import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("GET /api/laboratorios", () => {
  it("CA-01: responde 200 con los 4 laboratorios del catálogo ordenados por id", async () => {
    const res = await crearApp().request("/api/laboratorios");
    expect(res.status).toBe(200);
    const laboratorios = (await res.json()) as { id: string }[];
    expect(laboratorios.map((l) => l.id)).toEqual(["LAB-101", "LAB-102", "LAB-201", "LAB-202"]);
  });

  it("CA-02: cada laboratorio tiene id, nombre, capacidad > 0 y equipamiento como lista de textos", async () => {
    const res = await crearApp().request("/api/laboratorios");
    const laboratorios = (await res.json()) as Record<string, unknown>[];
    for (const laboratorio of laboratorios) {
      expect(Object.keys(laboratorio).sort()).toEqual(["capacidad", "equipamiento", "id", "nombre"]);
      expect(typeof laboratorio.id).toBe("string");
      expect(typeof laboratorio.nombre).toBe("string");
      expect(Number.isInteger(laboratorio.capacidad)).toBe(true);
      expect(laboratorio.capacidad as number).toBeGreaterThan(0);
      expect(Array.isArray(laboratorio.equipamiento)).toBe(true);
      for (const elemento of laboratorio.equipamiento as unknown[]) {
        expect(typeof elemento).toBe("string");
      }
    }
  });
});
