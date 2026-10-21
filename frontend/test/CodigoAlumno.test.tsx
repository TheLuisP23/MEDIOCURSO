import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CodigoAlumno } from "../src/componentes/CodigoAlumno";
import { leerCodigoAlumno } from "../src/codigoAlumno";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function escribirYGuardar(texto: string) {
  fireEvent.change(screen.getByLabelText("Código de alumno"), { target: { value: texto } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
}

describe("CodigoAlumno", () => {
  it("CA-08: no guarda un código con formato inválido y explica el formato", () => {
    const alCambiar = vi.fn();
    render(<CodigoAlumno codigo={null} alCambiar={alCambiar} />);

    for (const invalido of ["abc", "con-guion1", "1234567890123"]) {
      escribirYGuardar(invalido);
      expect(screen.getByRole("alert").textContent).toContain("6 a 12 letras o números");
    }
    expect(alCambiar).not.toHaveBeenCalled();
    expect(leerCodigoAlumno()).toBeNull();
  });

  it("CA-08: guarda un código válido en localStorage (clave codigoAlumno) y avisa", () => {
    const alCambiar = vi.fn();
    render(<CodigoAlumno codigo={null} alCambiar={alCambiar} />);

    escribirYGuardar("20231234");

    expect(localStorage.getItem("codigoAlumno")).toBe("20231234");
    expect(alCambiar).toHaveBeenCalledWith("20231234");
  });

  it("muestra el código guardado y permite cambiarlo", () => {
    const alCambiar = vi.fn();
    render(<CodigoAlumno codigo="20231234" alCambiar={alCambiar} />);

    expect(screen.getByText(/20231234/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cambiar código" }));

    expect(alCambiar).toHaveBeenCalledWith(null);
    expect(leerCodigoAlumno()).toBeNull();
  });

  it("leerCodigoAlumno devuelve null si localStorage no está disponible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("almacenamiento bloqueado");
    });
    expect(leerCodigoAlumno()).toBeNull();
  });
});
