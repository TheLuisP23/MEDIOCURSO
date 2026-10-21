
import type {
  Laboratorio,
  Disponibilidad,
  NuevaReserva,
  Reserva,
} from "./tipos";

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
  const codigoAlumno = localStorage.getItem("codigoAlumno");

  const res = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(codigoAlumno ? { "X-Usuario": codigoAlumno } : {}),
      ...opciones.headers,
    },
  });

  if (!res.ok) {
    const cuerpo: unknown = await res.json().catch(() => null);

    const error =
      typeof cuerpo === "object" && cuerpo !== null
        ? (cuerpo as {
            codigo?: unknown;
            mensaje?: unknown;
            error?: unknown;
          })
        : null;

    const codigo =
      typeof error?.codigo === "string"
        ? error.codigo
        : "DESCONOCIDO";

    const mensaje =
      typeof error?.mensaje === "string" && error.mensaje.trim() !== ""
        ? error.mensaje
        : "No se pudo completar la solicitud. Inténtalo de nuevo.";

    throw new ErrorApi(res.status, codigo, mensaje);
  }

  return res.status === 204
    ? (undefined as T)
    : ((await res.json()) as T);
}

export const api = {
  salud: () => pedir<{ estado: string }>("/health"),

  laboratorios: () => pedir<Laboratorio[]>("/laboratorios"),

  disponibilidad: (id: string, fecha: string) =>
    pedir<Disponibilidad>(
      `/laboratorios/${encodeURIComponent(id)}/disponibilidad?fecha=${encodeURIComponent(fecha)}`,
    ),

  crearReserva: (nueva: NuevaReserva) =>
    pedir<Reserva>("/reservas", {
      method: "POST",
      body: JSON.stringify(nueva),
    }),
};
