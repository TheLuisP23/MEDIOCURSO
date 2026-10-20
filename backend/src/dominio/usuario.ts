import { ErrorNegocio } from "./errores.js";

const FORMATO_CODIGO_ALUMNO = /^[A-Za-z0-9]{6,12}$/;

/** Spec 002 (CA-08): la cabecera X-Usuario debe ser un código de alumno válido. */
export function validarUsuario(cabecera: string | undefined): string {
  if (!cabecera || !FORMATO_CODIGO_ALUMNO.test(cabecera)) {
    throw new ErrorNegocio(
      "NO_AUTORIZADO",
      "Ingresa tu código de alumno (de 6 a 12 letras o números).",
      401,
    );
  }
  return cabecera;
}
