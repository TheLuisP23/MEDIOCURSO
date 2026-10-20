/** Códigos del enum `Error` de docs/api/openapi.yaml. */
export type CodigoError =
  | "VALIDACION"
  | "NO_AUTORIZADO"
  | "LAB_NO_EXISTE"
  | "BLOQUE_INVALIDO"
  | "FECHA_PASADA"
  | "FUERA_DE_RANGO"
  | "BLOQUE_OCUPADO"
  | "LIMITE_DIARIO"
  | "CHOQUE_USUARIO"
  | "PROHIBIDO"
  | "CANCELACION_TARDIA"
  | "RESERVA_NO_EXISTE";

/** Error de negocio: `app.onError` lo traduce a `{ codigo, mensaje }` con su status. */
export class ErrorNegocio extends Error {
  constructor(
    readonly codigo: CodigoError,
    mensaje: string,
    readonly status: 400 | 401 | 403 | 404 | 409 | 422,
  ) {
    super(mensaje);
    this.name = "ErrorNegocio";
  }
}
