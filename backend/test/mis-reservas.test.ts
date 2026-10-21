import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import type { Reserva } from "../src/dominio/reservas.js";
import { RepoMemoria } from "../src/repos/memoria.js";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = () => new Date("2026-11-05T10:30:00-05:00");

function reserva(usuario: string, laboratorioId: string, fecha: string, hora: string): Reserva {
  return {
    id: `${laboratorioId}.${fecha}.${hora.slice(0, 2)}`,
    laboratorioId,
    fecha,
    hora,
    usuario,
    creadaEn: "2026-11-01T12:00:00.000Z",
  };
}

async function appCon(...reservas: Reserva[]) {
  const repoReservas = new RepoMemoria();
  for (const r of reservas) await repoReservas.guardar(r);
  return crearApp({ repoReservas, ahora });
}

function pedir(app: ReturnType<typeof crearApp>, ruta: string, usuario: string | null, metodo = "GET") {
  const headers: Record<string, string> = {};
  if (usuario !== null) headers["X-Usuario"] = usuario;
  return app.request(ruta, { method: metodo, headers });
}

async function codigo(res: Response) {
  return ((await res.json()) as { codigo?: string }).codigo;
}

describe("GET /api/reservas/mias", () => {
  it("CA-14: devuelve solo las del usuario cuyo bloque no terminó, ordenadas por fecha y hora", async () => {
    const app = await appCon(
      reserva("ALUMNO01", "LAB-102", "2026-11-06", "09:00"),
      reserva("ALUMNO01", "LAB-101", "2026-11-05", "08:00"), // ya terminó
      reserva("ALUMNO01", "LAB-101", "2026-11-05", "10:00"), // en curso: aún no termina
      reserva("ALUMNO01", "LAB-201", "2026-11-05", "15:00"),
      reserva("ALUMNO02", "LAB-101", "2026-11-05", "16:00"), // de otro usuario
    );

    const res = await pedir(app, "/api/reservas/mias", "ALUMNO01");

    expect(res.status).toBe(200);
    const ids = ((await res.json()) as Reserva[]).map((r) => r.id);
    expect(ids).toEqual(["LAB-101.2026-11-05.10", "LAB-201.2026-11-05.15", "LAB-102.2026-11-06.09"]);
  });

  it("CA-14: sin X-Usuario responde 401 NO_AUTORIZADO", async () => {
    const res = await pedir(await appCon(), "/api/reservas/mias", null);
    expect(res.status).toBe(401);
    expect(await codigo(res)).toBe("NO_AUTORIZADO");
  });
});

describe("DELETE /api/reservas/{id}", () => {
  it("CA-15: el dueño cancela (204) y el bloque vuelve a estar disponible", async () => {
    const app = await appCon(reserva("ALUMNO01", "LAB-101", "2026-11-06", "10:00"));

    const res = await pedir(app, "/api/reservas/LAB-101.2026-11-06.10", "ALUMNO01", "DELETE");
    expect(res.status).toBe(204);

    const disp = await app.request("/api/laboratorios/LAB-101/disponibilidad?fecha=2026-11-06");
    const { bloques } = (await disp.json()) as { bloques: { hora: string; disponible: boolean }[] };
    expect(bloques.find((b) => b.hora === "10:00")?.disponible).toBe(true);
    const mias = await pedir(app, "/api/reservas/mias", "ALUMNO01");
    expect(await mias.json()).toEqual([]);
  });

  it("RN-08: otro usuario no puede cancelarla (403 PROHIBIDO) y la reserva sigue", async () => {
    const app = await appCon(reserva("ALUMNO01", "LAB-101", "2026-11-06", "10:00"));

    const res = await pedir(app, "/api/reservas/LAB-101.2026-11-06.10", "ALUMNO02", "DELETE");
    expect(res.status).toBe(403);
    expect(await codigo(res)).toBe("PROHIBIDO");
    expect(((await (await pedir(app, "/api/reservas/mias", "ALUMNO01")).json()) as Reserva[])).toHaveLength(1);
  });

  it("RN-09: a menos de 1 hora del inicio responde 422 CANCELACION_TARDIA", async () => {
    // Bloque de las 11:00 y son las 10:30.
    const app = await appCon(reserva("ALUMNO01", "LAB-101", "2026-11-05", "11:00"));

    const res = await pedir(app, "/api/reservas/LAB-101.2026-11-05.11", "ALUMNO01", "DELETE");
    expect(res.status).toBe(422);
    expect(await codigo(res)).toBe("CANCELACION_TARDIA");
  });

  it("RN-10: cancelar una reserva inexistente responde 404 RESERVA_NO_EXISTE", async () => {
    const res = await pedir(await appCon(), "/api/reservas/LAB-101.2026-11-06.10", "ALUMNO01", "DELETE");
    expect(res.status).toBe(404);
    expect(await codigo(res)).toBe("RESERVA_NO_EXISTE");
  });
});
