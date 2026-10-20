import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { RepoMemoria } from "../src/repos/memoria.js";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = () => new Date("2026-11-05T10:30:00-05:00");

function nuevaApp() {
  return crearApp({ repoReservas: new RepoMemoria(), ahora });
}

function reservar(app: ReturnType<typeof crearApp>, usuario: string, laboratorioId: string, hora: string) {
  return app.request("/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Usuario": usuario },
    body: JSON.stringify({ laboratorioId, fecha: "2026-11-06", hora }),
  });
}

async function codigo(res: Response) {
  return ((await res.json()) as { codigo?: string }).codigo;
}

describe("conflictos al reservar (spec 003)", () => {
  it("CA-11 / RN-05: otro usuario no puede reservar un bloque ya reservado (409 BLOQUE_OCUPADO)", async () => {
    const app = nuevaApp();
    expect((await reservar(app, "ALUMNO01", "LAB-101", "10:00")).status).toBe(201);

    const res = await reservar(app, "ALUMNO02", "LAB-101", "10:00");
    expect(res.status).toBe(409);
    expect(await codigo(res)).toBe("BLOQUE_OCUPADO");
  });

  it("CA-12 / RN-05: de 10 peticiones simultáneas al mismo bloque solo 1 gana", async () => {
    const app = nuevaApp();
    const respuestas = await Promise.all(
      Array.from({ length: 10 }, (_, i) => reservar(app, `ALUMNO${String(i).padStart(2, "0")}`, "LAB-101", "10:00")),
    );
    const estados = respuestas.map((r) => r.status);

    expect(estados.filter((s) => s === 201)).toHaveLength(1);
    expect(estados.filter((s) => s === 409)).toHaveLength(9);
  });

  it("RN-06: la tercera reserva del mismo usuario en el día responde 422 LIMITE_DIARIO", async () => {
    const app = nuevaApp();
    expect((await reservar(app, "ALUMNO01", "LAB-101", "08:00")).status).toBe(201);
    expect((await reservar(app, "ALUMNO01", "LAB-102", "09:00")).status).toBe(201);

    const res = await reservar(app, "ALUMNO01", "LAB-201", "11:00");
    expect(res.status).toBe(422);
    expect(await codigo(res)).toBe("LIMITE_DIARIO");
  });

  it("RN-07: el mismo usuario a la misma hora en otro laboratorio responde 409 CHOQUE_USUARIO", async () => {
    const app = nuevaApp();
    expect((await reservar(app, "ALUMNO01", "LAB-101", "10:00")).status).toBe(201);

    const res = await reservar(app, "ALUMNO01", "LAB-102", "10:00");
    expect(res.status).toBe(409);
    expect(await codigo(res)).toBe("CHOQUE_USUARIO");
  });
});
