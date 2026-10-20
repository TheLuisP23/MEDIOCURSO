import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("GET /api/health", () => {
  it("responde estado ok", async () => {
    const res = await crearApp().request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ estado: "ok" });
  });
});
