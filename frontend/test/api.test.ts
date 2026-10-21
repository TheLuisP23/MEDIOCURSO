
import { afterEach, describe, expect, it, vi } from "vitest";
import { pedir } from "../src/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Cliente de API", () => {
  it("muestra un mensaje comprensible cuando el servidor responde 500 sin cuerpo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 500,
        }),
      ),
    );

    await expect(pedir("/laboratorios")).rejects.toMatchObject({
      name: "ErrorApi",
      status: 500,
      codigo: "DESCONOCIDO",
      message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
    });
  });

  it("conserva el mensaje de error definido por el servidor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            codigo: "VALIDACION",
            mensaje: "La solicitud no es válida.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    await expect(pedir("/laboratorios")).rejects.toMatchObject({
      status: 400,
      codigo: "VALIDACION",
      message: "La solicitud no es válida.",
    });
  });

  it("no muestra el error técnico del servidor cuando solo llega el campo error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Bad Gateway" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(pedir("/laboratorios")).rejects.toMatchObject({
      status: 502,
      codigo: "DESCONOCIDO",
      message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
    });
  });
});
