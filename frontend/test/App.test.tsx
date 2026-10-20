import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { App } from "../src/App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("muestra 'API conectada' cuando /api/health responde ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ estado: "ok" }), { status: 200 })),
    );
    render(<App />);
    expect(await screen.findByText("API conectada")).toBeTruthy();
  });

  it("muestra error cuando la API no responde", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("sin red")));
    render(<App />);
    expect(await screen.findByText("No se pudo conectar con la API")).toBeTruthy();
  });
});
