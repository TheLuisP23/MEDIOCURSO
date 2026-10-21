import { useEffect, useState } from "react";
import { api, ErrorApi } from "../api";
import { esDomingo, hoyEnLima, sumarDias } from "../fechas";
import type { Disponibilidad, Laboratorio } from "../tipos";
import { GrillaBloques } from "./GrillaBloques";

/** Días de anticipación permitidos (RN-04). */
const DIAS_ANTICIPACION = 14;

interface Props {
  codigo: string | null;
  /** Cambia cuando otra sección modifica reservas (p. ej. una cancelación): recarga la grilla. */
  version: number;
  alReservar: () => void;
  ahora?: () => Date;
}

function primerDiaHabil(fecha: string): string {
  return esDomingo(fecha) ? sumarDias(fecha, 1) : fecha;
}

/** Spec 002 (CA-09, CA-10) y spec 003 (CA-13): elegir laboratorio y fecha, y reservar un bloque. */
export function ReservarBloque({ codigo, version, alReservar, ahora = () => new Date() }: Props) {
  const hoy = hoyEnLima(ahora());
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [laboratorioId, setLaboratorioId] = useState("");
  const [fecha, setFecha] = useState(() => primerDiaHabil(hoy));
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [errorReserva, setErrorReserva] = useState<string | null>(null);
  const [reservando, setReservando] = useState(false);
  const [recargas, setRecargas] = useState(0);

  useEffect(() => {
    api
      .laboratorios()
      .then((labs) => {
        setLaboratorios(labs);
        setLaboratorioId((actual) => actual || labs[0]?.id || "");
      })
      .catch(() => setErrorCarga("No se pudieron cargar los laboratorios."));
  }, []);

  const domingo = esDomingo(fecha);

  useEffect(() => {
    if (!laboratorioId || !fecha || esDomingo(fecha)) {
      setDisponibilidad(null);
      return;
    }
    let vigente = true;
    setCargando(true);
    setErrorCarga(null);
    api
      .disponibilidad(laboratorioId, fecha)
      .then((datos) => vigente && setDisponibilidad(datos))
      .catch((fallo) => {
        if (!vigente) return;
        setDisponibilidad(null);
        setErrorCarga(fallo instanceof ErrorApi ? fallo.message : "No se pudo cargar la disponibilidad.");
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [laboratorioId, fecha, version, recargas]);

  function cambiarSeleccion(cambio: () => void) {
    setConfirmacion(null);
    setErrorReserva(null);
    cambio();
  }

  async function reservar(hora: string) {
    setReservando(true);
    setConfirmacion(null);
    setErrorReserva(null);
    try {
      await api.crearReserva({ laboratorioId, fecha, hora });
      setConfirmacion(`Reserva confirmada: ${laboratorioId} el ${fecha} a las ${hora}.`);
      alReservar();
    } catch (fallo) {
      if (fallo instanceof ErrorApi && fallo.status === 409 && fallo.codigo === "BLOQUE_OCUPADO") {
        setErrorReserva("Alguien acaba de reservar este bloque");
      } else {
        setErrorReserva(fallo instanceof ErrorApi ? fallo.message : "No se pudo reservar. Inténtalo de nuevo.");
      }
    } finally {
      setReservando(false);
      setRecargas((n) => n + 1);
    }
  }

  return (
    <section className="reservar" aria-labelledby="titulo-reservar">
      <h2 id="titulo-reservar">Reservar un bloque</h2>

      <div className="selectores">
        <label>
          Laboratorio{" "}
          <select
            value={laboratorioId}
            onChange={(e) => cambiarSeleccion(() => setLaboratorioId(e.target.value))}
          >
            {laboratorios.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.id} — {lab.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha{" "}
          <input
            type="date"
            value={fecha}
            min={hoy}
            max={sumarDias(hoy, DIAS_ANTICIPACION)}
            onChange={(e) => cambiarSeleccion(() => setFecha(e.target.value))}
          />
        </label>
      </div>

      {domingo && <p>Los domingos no hay atención. Elige otro día.</p>}
      {!codigo && !domingo && <p>Ingresa tu código de alumno para reservar.</p>}
      {cargando && !disponibilidad && <p>Cargando bloques…</p>}
      {errorCarga && <p role="alert">{errorCarga}</p>}
      {confirmacion && <p role="status">{confirmacion}</p>}
      {errorReserva && <p role="alert">{errorReserva}</p>}

      {disponibilidad && !domingo && (
        <GrillaBloques
          bloques={disponibilidad.bloques}
          puedeReservar={codigo !== null}
          ocupada={reservando}
          alElegir={(hora) => void reservar(hora)}
        />
      )}
    </section>
  );
}
