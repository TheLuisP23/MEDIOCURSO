import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { RepoMemoria } from "../src/repos/memoria.js";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = () => new Date("2026-11-05T10:30:00-05:00");

interface Bloque {
  hora: string;
  disponible: boolean;
}

async function disponibilidad(app: ReturnType<typeof crearApp>, ruta: string) {
  const res = await app.request(`/api/laboratorios/${ruta}`);
  return { status: res.status, cuerpo: (await res.json()) as Record<string, unknown> };
}

describe("GET /api/laboratorios/{id}/disponibilidad", () => {
  it("CA-06: devuelve los 15 bloques de 07:00 a 21:00 con disponible", async () => {
    const app = crearApp({ repoReservas: new RepoMemoria(), ahora });
    const { status, cuerpo } = await disponibilidad(app, "LAB-101/disponibilidad?fecha=2026-11-06");

    expect(status).toBe(200);
    expect(cuerpo.laboratorioId).toBe("LAB-101");
    expect(cuerpo.fecha).toBe("2026-11-06");
    const bloques = cuerpo.bloques as Bloque[];
    expect(bloques.map((b) => b.hora)).toEqual([
      "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
    ]);
    expect(bloques.every((b) => b.disponible)).toBe(true);
  });

  it("CA-06: un bloque reservado y los bloques ya empezados salen no disponibles (P3)", async () => {
    const repoReservas = new RepoMemoria();
    await repoReservas.guardar({
      id: "LAB-101.2026-11-05.15",
      laboratorioId: "LAB-101",
      fecha: "2026-11-05",
      hora: "15:00",
      usuario: "20231234",
      creadaEn: "2026-11-01T12:00:00.000Z",
    });
    const app = crearApp({ repoReservas, ahora });
    const { cuerpo } = await disponibilidad(app, "LAB-101/disponibilidad?fecha=2026-11-05");

    const noDisponibles = (cuerpo.bloques as Bloque[]).filter((b) => !b.disponible).map((b) => b.hora);
    expect(noDisponibles).toEqual(["07:00", "08:00", "09:00", "10:00", "15:00"]);
  });

  it("CA-06: un domingo devuelve los 15 bloques no disponibles (P2)", async () => {
    const app = crearApp({ repoReservas: new RepoMemoria(), ahora });
    const { status, cuerpo } = await disponibilidad(app, "LAB-101/disponibilidad?fecha=2026-11-08");

    expect(status).toBe(200);
    expect((cuerpo.bloques as Bloque[]).some((b) => b.disponible)).toBe(false);
  });

  it("responde 400 VALIDACION si falta la fecha o no es válida", async () => {
    const app = crearApp({ repoReservas: new RepoMemoria(), ahora });
    for (const ruta of ["LAB-101/disponibilidad", "LAB-101/disponibilidad?fecha=2026-02-30"]) {
      const { status, cuerpo } = await disponibilidad(app, ruta);
      expect(status).toBe(400);
      expect(cuerpo.codigo).toBe("VALIDACION");
    }
  });

  it("RN-01: responde 404 LAB_NO_EXISTE si el laboratorio no existe", async () => {
    const app = crearApp({ repoReservas: new RepoMemoria(), ahora });
    const { status, cuerpo } = await disponibilidad(app, "LAB-999/disponibilidad?fecha=2026-11-06");

    expect(status).toBe(404);
    expect(cuerpo.codigo).toBe("LAB_NO_EXISTE");
    expect(typeof cuerpo.mensaje).toBe("string");
  });
});
