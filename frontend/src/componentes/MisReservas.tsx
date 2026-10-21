import { useEffect, useState } from "react";
import { api, ErrorApi } from "../api";
import type { Reserva } from "../tipos";

interface Props {
  codigo: string | null;
  /** Cambia cuando otra sección modifica reservas (p. ej. al reservar): recarga la lista. */
  version: number;
  alCancelar: () => void;
}

function describir(r: Reserva) {
  return `${r.laboratorioId} el ${r.fecha} a las ${r.hora}`;
}

/** Spec 004 (CA-16, CA-17): próximas reservas del alumno y cancelación. */
export function MisReservas({ codigo, version, alCancelar }: Props) {
  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [recargas, setRecargas] = useState(0);

  useEffect(() => {
    if (!codigo) {
      setReservas(null);
      return;
    }
    let vigente = true;
    setErrorCarga(null);
    api
      .misReservas()
      .then((datos) => vigente && setReservas(datos))
      .catch((fallo) => {
        if (!vigente) return;
        setErrorCarga(fallo instanceof ErrorApi ? fallo.message : "No se pudieron cargar tus reservas.");
      });
    return () => {
      vigente = false;
    };
  }, [codigo, version, recargas]);

  async function cancelar(reserva: Reserva) {
    if (!window.confirm(`¿Cancelar tu reserva de ${describir(reserva)}?`)) return;
    setCancelando(reserva.id);
    setAviso(null);
    setErrorCancelar(null);
    try {
      await api.cancelarReserva(reserva.id);
      setAviso(`Reserva cancelada: ${describir(reserva)}.`);
      setRecargas((n) => n + 1);
      alCancelar();
    } catch (fallo) {
      setErrorCancelar(fallo instanceof ErrorApi ? fallo.message : "No se pudo cancelar. Inténtalo de nuevo.");
    } finally {
      setCancelando(null);
    }
  }

  return (
    <section className="mis-reservas" aria-labelledby="titulo-mis-reservas">
      <h2 id="titulo-mis-reservas">Mis reservas</h2>

      {!codigo && <p>Ingresa tu código de alumno para ver tus reservas.</p>}
      {codigo && reservas === null && !errorCarga && <p>Cargando tus reservas…</p>}
      {errorCarga && <p role="alert">{errorCarga}</p>}
      {aviso && <p role="status">{aviso}</p>}
      {errorCancelar && <p role="alert">{errorCancelar}</p>}

      {codigo && reservas?.length === 0 && <p>No tienes reservas próximas.</p>}
      {codigo && reservas && reservas.length > 0 && (
        <ul className="lista-mis-reservas">
          {reservas.map((r) => (
            <li key={r.id}>
              <span>
                {r.laboratorioId} · {r.fecha} · {r.hora}
              </span>
              <button
                type="button"
                aria-label={`Cancelar reserva ${describir(r)}`}
                disabled={cancelando !== null}
                onClick={() => void cancelar(r)}
              >
                Cancelar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
