
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../src/api";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("API de reservas", () => {
  it("consulta la disponibilidad con el laboratorio y la fecha indicados", async () => {
    const respuesta = {
      laboratorioId: "LAB-101",
      fecha: "2026-10-21",
      bloques: [{ hora: "10:00", disponible: true }],
    };

    const fetchSimulado = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(respuesta), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchSimulado);

    await api.disponibilidad("LAB-101", "2026-10-21");

    expect(fetchSimulado).toHaveBeenCalledWith(
      "/api/laboratorios/LAB-101/disponibilidad?fecha=2026-10-21",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("crea una reserva enviando el código del alumno en X-Usuario", async () => {
    localStorage.setItem("codigoAlumno", "ALUMNO123");

    const respuesta = {
      id: "LAB-101.2026-10-21.10",
      laboratorioId: "LAB-101",
      fecha: "2026-10-21",
      hora: "10:00",
      usuario: "ALUMNO123",
      creadaEn: "2026-10-20T15:00:00.000Z",
    };

    const fetchSimulado = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(respuesta), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchSimulado);

    await api.crearReserva({
      laboratorioId: "LAB-101",
      fecha: "2026-10-21",
      hora: "10:00",
    });

    expect(fetchSimulado).toHaveBeenCalledWith(
      "/api/reservas",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Usuario": "ALUMNO123",
        }),
        body: JSON.stringify({
          laboratorioId: "LAB-101",
          fecha: "2026-10-21",
          hora: "10:00",
        }),
      }),
    );
  });

  it("no envía X-Usuario cuando no hay código guardado", async () => {
    const fetchSimulado = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "LAB-101.2026-10-21.10",
          laboratorioId: "LAB-101",
          fecha: "2026-10-21",
          hora: "10:00",
          usuario: "ALUMNO123",
          creadaEn: "2026-10-20T15:00:00.000Z",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchSimulado);

    await api.crearReserva({
      laboratorioId: "LAB-101",
      fecha: "2026-10-21",
      hora: "10:00",
    });

    const llamada = fetchSimulado.mock.calls[0];
    expect(llamada).toBeDefined();

    const opciones = llamada![1] as RequestInit;
    expect(opciones.headers).not.toHaveProperty("X-Usuario");
  });
});
