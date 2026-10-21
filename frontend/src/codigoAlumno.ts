/** Código de alumno (spec 002): se guarda en localStorage y viaja en X-Usuario. */

const CLAVE = "codigoAlumno";

/** Mismo formato que el contrato (parámetro X-Usuario). */
export const FORMATO_CODIGO_ALUMNO = /^[A-Za-z0-9]{6,12}$/;

// localStorage puede lanzar si el navegador lo bloquea (algunos modos privados):
// en ese caso la app sigue funcionando como si no hubiera código guardado.

export function leerCodigoAlumno(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarCodigoAlumno(codigo: string | null): void {
  try {
    if (codigo === null) localStorage.removeItem(CLAVE);
    else localStorage.setItem(CLAVE, codigo);
  } catch {
    // Sin almacenamiento el código no persiste entre visitas, pero la sesión sigue.
  }
}
