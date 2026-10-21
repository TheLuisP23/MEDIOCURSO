import { useState, type FormEvent } from "react";
import { FORMATO_CODIGO_ALUMNO, guardarCodigoAlumno } from "../codigoAlumno";

interface Props {
  codigo: string | null;
  alCambiar: (codigo: string | null) => void;
}

/** Identificación sin login (spec 002): pide el código una vez y lo recuerda. */
export function CodigoAlumno({ codigo, alCambiar }: Props) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  function guardar(evento: FormEvent) {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!FORMATO_CODIGO_ALUMNO.test(limpio)) {
      setError("El código debe tener de 6 a 12 letras o números, sin espacios ni símbolos.");
      return;
    }
    setError(null);
    guardarCodigoAlumno(limpio);
    alCambiar(limpio);
  }

  function cambiar() {
    guardarCodigoAlumno(null);
    setTexto("");
    alCambiar(null);
  }

  if (codigo) {
    return (
      <section className="codigo-alumno" aria-label="Identificación">
        <p>
          Reservando como <strong>{codigo}</strong>{" "}
          <button type="button" onClick={cambiar}>
            Cambiar código
          </button>
        </p>
      </section>
    );
  }

  return (
    <section className="codigo-alumno" aria-label="Identificación">
      <form onSubmit={guardar}>
        <label htmlFor="codigo-alumno">Código de alumno</label>{" "}
        <input
          id="codigo-alumno"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
        />{" "}
        <button type="submit">Guardar</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
