
import type { Laboratorio } from "./tipos";

/**
 * Cliente HTTP del frontend.
 * Toda llamada a la API pasa por aquí.
 * Tipos y rutas deben coincidir con docs/api/openapi.yaml.
 */

export class ErrorApi extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

export async function pedir<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...opciones.headers,
    },
  });

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));

    throw new ErrorApi(
      res.status,
      cuerpo.codigo ?? "DESCONOCIDO",
      cuerpo.mensaje ?? res.statusText,
    );
  }

  return res.status === 204
    ? (undefined as T)
    : ((await res.json()) as T);
}

export const api = {
  salud: () => pedir<{ estado: string }>("/health"),

  laboratorios: () => pedir<Laboratorio[]>("/laboratorios"),
};
