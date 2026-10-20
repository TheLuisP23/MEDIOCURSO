import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { RepoMemoria } from "../src/repos/memoria.js";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = () => new Date("2026-11-05T10:30:00-05:00");

function nuevaApp() {
  return crearApp({ repoReservas: new RepoMemoria(), ahora });
}

async function reservar(
  app: ReturnType<typeof crearApp>,
  cuerpo: unknown,
  usuario: string | null = "20231234",
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (usuario !== null) headers["X-Usuario"] = usuario;
  const res = await app.request("/api/reservas", {
    method: "POST",
    headers,
    body: JSON.stringify(cuerpo),
  });
  return { status: res.status, cuerpo: (await res.json()) as Record<string, unknown> };
}

const valida = { laboratorioId: "LAB-101", fecha: "2026-11-06", hora: "10:00" };

describe("POST /api/reservas", () => {
  it("CA-07: crea la reserva (201) y el bloque deja de estar disponible", async () => {
    const app = nuevaApp();
    const { status, cuerpo } = await reservar(app, valida);

    expect(status).toBe(201);
    expect(cuerpo).toEqual({
      id: "LAB-101.2026-11-06.10",
      laboratorioId: "LAB-101",
      fecha: "2026-11-06",
      hora: "10:00",
      usuario: "20231234",
      creadaEn: "2026-11-05T15:30:00.000Z",
    });

    const res = await app.request("/api/laboratorios/LAB-101/disponibilidad?fecha=2026-11-06");
    const { bloques } = (await res.json()) as { bloques: { hora: string; disponible: boolean }[] };
    expect(bloques.find((b) => b.hora === "10:00")?.disponible).toBe(false);
  });

  it("CA-08: responde 401 NO_AUTORIZADO sin X-Usuario o con formato inválido", async () => {
    const app = nuevaApp();
    for (const usuario of [null, "", "abc", "con-guion1", "1234567890123"]) {
      const { status, cuerpo } = await reservar(app, valida, usuario);
      expect(status).toBe(401);
      expect(cuerpo.codigo).toBe("NO_AUTORIZADO");
    }
  });

  it("responde 400 VALIDACION si al cuerpo le faltan datos o la fecha no es válida", async () => {
    const app = nuevaApp();
    for (const cuerpo of [{}, { ...valida, hora: undefined }, { ...valida, fecha: "06/11/2026" }, "texto"]) {
      const respuesta = await reservar(app, cuerpo);
      expect(respuesta.status).toBe(400);
      expect(respuesta.cuerpo.codigo).toBe("VALIDACION");
    }
  });

  it("RN-01: responde 404 LAB_NO_EXISTE al reservar un laboratorio inexistente", async () => {
    const { status, cuerpo } = await reservar(nuevaApp(), { ...valida, laboratorioId: "LAB-999" });
    expect(status).toBe(404);
    expect(cuerpo.codigo).toBe("LAB_NO_EXISTE");
  });

  it("RN-02: responde 422 BLOQUE_INVALIDO para una hora fuera de bloque o un domingo", async () => {
    const app = nuevaApp();
    expect((await reservar(app, { ...valida, hora: "10:30" })).cuerpo.codigo).toBe("BLOQUE_INVALIDO");
    const domingo = await reservar(app, { ...valida, fecha: "2026-11-08" });
    expect(domingo.status).toBe(422);
    expect(domingo.cuerpo.codigo).toBe("BLOQUE_INVALIDO");
  });

  it("RN-03: responde 422 FECHA_PASADA para un bloque que ya empezó", async () => {
    const { status, cuerpo } = await reservar(nuevaApp(), { ...valida, fecha: "2026-11-05", hora: "10:00" });
    expect(status).toBe(422);
    expect(cuerpo.codigo).toBe("FECHA_PASADA");
  });

  it("RN-04: responde 422 FUERA_DE_RANGO a más de 14 días", async () => {
    const { status, cuerpo } = await reservar(nuevaApp(), { ...valida, fecha: "2026-11-20" });
    expect(status).toBe(422);
    expect(cuerpo.codigo).toBe("FUERA_DE_RANGO");
  });
});
