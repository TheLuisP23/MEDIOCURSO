import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MisReservas } from "../src/componentes/MisReservas";

const reservas = [
  {
    id: "LAB-101.2026-11-06.10",
    laboratorioId: "LAB-101",
    fecha: "2026-11-06",
    hora: "10:00",
    usuario: "20231234",
    creadaEn: "2026-11-05T15:30:00.000Z",
  },
  {
    id: "LAB-202.2026-11-07.15",
    laboratorioId: "LAB-202",
    fecha: "2026-11-07",
    hora: "15:00",
    usuario: "20231234",
    creadaEn: "2026-11-05T15:31:00.000Z",
  },
];

function json(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
}

/** Simula GET /reservas/mias y DELETE /reservas/{id} (`alCancelar` decide la respuesta). */
function simularApi(alCancelar: () => Response = () => new Response(null, { status: 204 })) {
  let actuales = [...reservas];
  const llamadas: { metodo: string; url: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (entrada: RequestInfo | URL, opciones: RequestInit = {}) => {
      const url = String(entrada);
      const metodo = opciones.method ?? "GET";
      llamadas.push({ metodo, url });
      if (url === "/api/reservas/mias") return json(actuales);
      if (metodo === "DELETE") {
        const res = alCancelar();
        if (res.status === 204) actuales = actuales.filter((r) => !url.endsWith(r.id));
        return res;
      }
      return json({ codigo: "DESCONOCIDO", mensaje: "ruta no simulada" }, 500);
    }),
  );
  return { llamadas, listados: () => llamadas.filter((l) => l.url === "/api/reservas/mias").length };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MisReservas", () => {
  it("CA-16: lista las reservas con un botón Cancelar que pide confirmación", async () => {
    const { llamadas } = simularApi();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<MisReservas codigo="20231234" version={0} alCancelar={vi.fn()} />);

    expect(await screen.findByText(/LAB-101 · 2026-11-06 · 10:00/)).toBeTruthy();
    expect(screen.getByText(/LAB-202 · 2026-11-07 · 15:00/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva LAB-101 el 2026-11-06 a las 10:00" }));

    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(llamadas.some((l) => l.metodo === "DELETE")).toBe(false);
  });

  it("CA-17: al confirmar cancela, recarga la lista y avisa para recargar la grilla", async () => {
    const { llamadas, listados } = simularApi();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alCancelar = vi.fn();
    render(<MisReservas codigo="20231234" version={0} alCancelar={alCancelar} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Cancelar reserva LAB-101 el 2026-11-06 a las 10:00" }),
    );

    expect((await screen.findByRole("status")).textContent).toContain("Reserva cancelada");
    expect(llamadas).toContainEqual({ metodo: "DELETE", url: "/api/reservas/LAB-101.2026-11-06.10" });
    await waitFor(() => expect(screen.queryByText(/LAB-101 · 2026-11-06/)).toBeNull());
    expect(listados()).toBe(2);
    expect(alCancelar).toHaveBeenCalledTimes(1);
  });

  it("CA-17: si la API rechaza la cancelación muestra su mensaje y no avisa", async () => {
    simularApi(() =>
      json({ codigo: "CANCELACION_TARDIA", mensaje: "Solo se puede cancelar hasta 1 hora antes." }, 422),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alCancelar = vi.fn();
    render(<MisReservas codigo="20231234" version={0} alCancelar={alCancelar} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Cancelar reserva LAB-101 el 2026-11-06 a las 10:00" }),
    );

    expect((await screen.findByRole("alert")).textContent).toBe("Solo se puede cancelar hasta 1 hora antes.");
    expect(alCancelar).not.toHaveBeenCalled();
  });

  it("se recarga cuando cambia version (por ejemplo, tras reservar)", async () => {
    const { listados } = simularApi();
    const { rerender } = render(<MisReservas codigo="20231234" version={0} alCancelar={vi.fn()} />);
    await screen.findByText(/LAB-101 · 2026-11-06/);

    rerender(<MisReservas codigo="20231234" version={1} alCancelar={vi.fn()} />);

    await waitFor(() => expect(listados()).toBe(2));
  });

  it("sin código de alumno no consulta la API y lo pide", async () => {
    const { llamadas } = simularApi();
    render(<MisReservas codigo={null} version={0} alCancelar={vi.fn()} />);

    expect(screen.getByText(/Ingresa tu código de alumno/)).toBeTruthy();
    expect(llamadas).toHaveLength(0);
  });

  it("muestra un mensaje cuando no hay reservas próximas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json([])));
    render(<MisReservas codigo="20231234" version={0} alCancelar={vi.fn()} />);

    expect(await screen.findByText("No tienes reservas próximas.")).toBeTruthy();
  });
});
