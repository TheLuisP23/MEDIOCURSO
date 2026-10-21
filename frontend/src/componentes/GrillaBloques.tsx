import type { Bloque } from "../tipos";

interface Props {
  bloques: Bloque[];
  /** false si no hay código de alumno: la grilla se muestra solo para consultar. */
  puedeReservar: boolean;
  ocupada: boolean;
  alElegir: (hora: string) => void;
}

/** Los 15 bloques del día. P1 (spec 002): un bloque tomado no muestra quién lo reservó. */
export function GrillaBloques({ bloques, puedeReservar, ocupada, alElegir }: Props) {
  return (
    <ul className="grilla-bloques">
      {bloques.map(({ hora, disponible }) => (
        <li key={hora}>
          {disponible && puedeReservar ? (
            <button
              type="button"
              className="bloque bloque-libre"
              aria-label={`Reservar ${hora}`}
              disabled={ocupada}
              onClick={() => alElegir(hora)}
            >
              {hora}
            </button>
          ) : (
            <button
              type="button"
              className={`bloque ${disponible ? "bloque-libre" : "bloque-tomado"}`}
              aria-label={disponible ? `${hora} libre` : `${hora} no disponible`}
              disabled
            >
              {hora}
              <span className="bloque-detalle">{disponible ? "Libre" : "No disponible"}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
