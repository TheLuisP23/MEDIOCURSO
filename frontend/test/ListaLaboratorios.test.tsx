import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ListaLaboratorios } from "../src/componentes/ListaLaboratorios";

const laboratorios = [
  {
    id: "LAB-101",
    nombre: "Laboratorio de Redes",
    capacidad: 30,
    equipamiento: ["Switches Cisco", "Routers", "Proyector"],
  },
  {
    id: "LAB-102",
    nombre: "Cómputo General",
    capacidad: 40,
    equipamiento: ["PCs i5", "Proyector"],
  },
  {
    id: "LAB-201",
    nombre: "Desarrollo Móvil",
    capacidad: 25,
    equipamiento: ["Macs", "Dispositivos Android", "Proyector"],
  },
  {
    id: "LAB-202",
    nombre: "Ciencia de Datos",
    capacidad: 20,
    equipamiento: ["PCs con GPU", "Pizarra digital"],
  },
];

function respuestaLaboratorios(status = 200) {
  return new Response(JSON.stringify(laboratorios), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ListaLaboratorios", () => {
  it("CA-03: muestra una tarjeta por laboratorio con nombre, capacidad y equipamiento", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuestaLaboratorios()));

    render(<ListaLaboratorios />);

    for (const laboratorio of laboratorios) {
      const encabezado = await screen.findByRole("heading", { name: laboratorio.nombre });
      const tarjeta = encabezado.closest("article");
      expect(tarjeta).not.toBeNull();
      expect(within(tarjeta!).getByText(`Capacidad: ${laboratorio.capacidad}`)).toBeTruthy();
      for (const elemento of laboratorio.equipamiento) {
        expect(within(tarjeta!).getByText(elemento)).toBeTruthy();
      }
    }
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("CA-04: muestra el error y Reintentar vuelve a pedir el listado", async () => {
    const fetchSimulado = vi
      .fn()
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValueOnce(respuestaLaboratorios());
    vi.stubGlobal("fetch", fetchSimulado);

    render(<ListaLaboratorios />);

    await waitFor(() => expect(fetchSimulado).toHaveBeenCalledTimes(1));
    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar los laboratorios");
    const reintentar = screen.getByRole("button", { name: "Reintentar" });
    expect(fetchSimulado).toHaveBeenCalledTimes(1);

    fireEvent.click(reintentar);

    expect(await screen.findByRole("heading", { name: "Laboratorio de Redes" })).toBeTruthy();
    await waitFor(() => expect(fetchSimulado).toHaveBeenCalledTimes(2));
  });

  it("CA-05: mantiene visible la carga hasta recibir los datos", async () => {
    let resolver!: (respuesta: Response) => void;
    const respuestaPendiente = new Promise<Response>((resolve) => {
      resolver = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(respuestaPendiente));

    render(<ListaLaboratorios />);

    expect(screen.getByRole("status").textContent).toContain("Cargando laboratorios");
    expect(screen.queryByRole("article")).toBeNull();

    resolver(respuestaLaboratorios());

    expect(await screen.findByRole("heading", { name: "Laboratorio de Redes" })).toBeTruthy();
    expect(screen.queryByText("Cargando laboratorios")).toBeNull();
  });
});
