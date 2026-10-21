import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReservarBloque } from "../src/componentes/ReservarBloque";

// Jueves 5 de noviembre de 2026, 10:30 en Lima.
const ahora = () => new Date("2026-11-05T10:30:00-05:00");

const laboratorios = [
  { id: "LAB-101", nombre: "Laboratorio de Redes", capacidad: 30, equipamiento: [] },
  { id: "LAB-102", nombre: "Cómputo General", capacidad: 40, equipamiento: [] },
];

const HORAS = Array.from({ length: 15 }, (_, i) => `${String(7 + i).padStart(2, "0")}:00`);

function disponibilidad(laboratorioId: string, fecha: string, noDisponibles: string[] = []) {
  return {
    laboratorioId,
    fecha,
    bloques: HORAS.map((hora) => ({ hora, disponible: !noDisponibles.includes(hora) })),
  };
}

function json(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Simula la API: `alReservar` decide la respuesta del POST. */
function simularApi(alReservar: () => Response = () => json({}, 201)) {
  const llamadas: { metodo: string; url: string; cuerpo?: unknown }[] = [];
  const fetchSimulado = vi.fn(async (entrada: RequestInfo | URL, opciones: RequestInit = {}) => {
    const url = String(entrada);
    const metodo = opciones.method ?? "GET";
    llamadas.push({ metodo, url, cuerpo: opciones.body ? JSON.parse(String(opciones.body)) : undefined });
    if (url === "/api/laboratorios") return json(laboratorios);
    const disp = url.match(/^\/api\/laboratorios\/([^/]+)\/disponibilidad\?fecha=(.+)$/);
    if (disp) return json(disponibilidad(disp[1]!, disp[2]!, ["08:00"]));
    if (url === "/api/reservas" && metodo === "POST") return alReservar();
    return json({ codigo: "DESCONOCIDO", mensaje: "ruta no simulada" }, 500);
  });
  vi.stubGlobal("fetch", fetchSimulado);
  const consultasDe = (fecha: string) =>
    llamadas.filter((l) => l.url.includes("/disponibilidad") && l.url.endsWith(fecha)).length;
  return { llamadas, consultasDe };
}

async function elegir(laboratorioId: string, fecha: string) {
  await screen.findByRole("option", { name: /Cómputo General/ });
  fireEvent.change(screen.getByLabelText("Laboratorio"), { target: { value: laboratorioId } });
  fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: fecha } });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ReservarBloque", () => {
  it("CA-09: elige laboratorio y fecha, ve la grilla, reserva con un clic y la grilla se recarga", async () => {
    const { llamadas, consultasDe } = simularApi();
    const alReservar = vi.fn();
    render(<ReservarBloque codigo="20231234" version={0} alReservar={alReservar} ahora={ahora} />);

    await elegir("LAB-102", "2026-11-06");

    const libre = await screen.findByRole("button", { name: "Reservar 10:00" });
    expect(screen.getAllByRole("button", { name: /^Reservar \d\d:00$/ })).toHaveLength(14);
    expect((screen.getByRole("button", { name: "08:00 no disponible" }) as HTMLButtonElement).disabled).toBe(true);
    expect(consultasDe("2026-11-06")).toBe(1);

    fireEvent.click(libre);

    expect((await screen.findByRole("status")).textContent).toContain("Reserva confirmada");
    expect(llamadas.find((l) => l.metodo === "POST")?.cuerpo).toEqual({
      laboratorioId: "LAB-102",
      fecha: "2026-11-06",
      hora: "10:00",
    });
    await waitFor(() => expect(consultasDe("2026-11-06")).toBe(2));
    expect(alReservar).toHaveBeenCalledTimes(1);
  });

  it("CA-09: el selector no consulta los domingos (spec 002, P2)", async () => {
    const { consultasDe } = simularApi();
    render(<ReservarBloque codigo="20231234" version={0} alReservar={vi.fn()} ahora={ahora} />);

    await elegir("LAB-101", "2026-11-08");

    expect((await screen.findByText(/domingos no hay atención/)).textContent).toBeTruthy();
    expect(consultasDe("2026-11-08")).toBe(0);
    expect(screen.queryByRole("button", { name: /^Reservar/ })).toBeNull();
  });

  it("CA-09: sin código de alumno la grilla se ve pero no permite reservar", async () => {
    simularApi();
    render(<ReservarBloque codigo={null} version={0} alReservar={vi.fn()} ahora={ahora} />);

    await elegir("LAB-101", "2026-11-06");

    expect(await screen.findByText(/Ingresa tu código de alumno/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Reservar/ })).toBeNull();
  });

  it("CA-10: si la API rechaza la reserva muestra su mensaje y conserva la selección", async () => {
    simularApi(() =>
      json({ codigo: "LIMITE_DIARIO", mensaje: "Ya tienes 2 bloques reservados ese día." }, 422),
    );
    render(<ReservarBloque codigo="20231234" version={0} alReservar={vi.fn()} ahora={ahora} />);

    await elegir("LAB-102", "2026-11-06");
    fireEvent.click(await screen.findByRole("button", { name: "Reservar 10:00" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Ya tienes 2 bloques reservados ese día.");
    expect((screen.getByLabelText("Laboratorio") as HTMLSelectElement).value).toBe("LAB-102");
    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe("2026-11-06");
  });

  it("CA-17: la grilla se recarga cuando cambia version (por ejemplo, tras cancelar)", async () => {
    const { consultasDe } = simularApi();
    const props = { codigo: "20231234", alReservar: vi.fn(), ahora };
    const { rerender } = render(<ReservarBloque {...props} version={0} />);
    await elegir("LAB-102", "2026-11-06");
    await screen.findByRole("button", { name: "Reservar 10:00" });

    rerender(<ReservarBloque {...props} version={1} />);

    await waitFor(() => expect(consultasDe("2026-11-06")).toBe(2));
  });

  it("CA-13: con 409 BLOQUE_OCUPADO avisa que alguien lo reservó y recarga la grilla", async () => {
    const { consultasDe } = simularApi(() =>
      json({ codigo: "BLOQUE_OCUPADO", mensaje: "Ocupado." }, 409),
    );
    render(<ReservarBloque codigo="20231234" version={0} alReservar={vi.fn()} ahora={ahora} />);

    await elegir("LAB-102", "2026-11-06");
    fireEvent.click(await screen.findByRole("button", { name: "Reservar 10:00" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Alguien acaba de reservar este bloque");
    await waitFor(() => expect(consultasDe("2026-11-06")).toBe(2));
  });
});
