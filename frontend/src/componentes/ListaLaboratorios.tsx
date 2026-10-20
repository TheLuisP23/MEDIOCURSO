import { useCallback, useEffect, useState } from "react";
import { api, ErrorApi } from "../api";
import type { Laboratorio } from "../tipos";

export function ListaLaboratorios() {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarLaboratorios = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setLaboratorios(await api.laboratorios());
    } catch (fallo) {
      setError(
        fallo instanceof ErrorApi
          ? fallo.message
          : "No se pudieron cargar los laboratorios. Comprueba tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarLaboratorios();
  }, [cargarLaboratorios]);

  return (
    <section className="lista-laboratorios" aria-labelledby="titulo-laboratorios">
      <h2 id="titulo-laboratorios">Laboratorios disponibles</h2>

      {cargando && <p role="status">Cargando laboratorios…</p>}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void cargarLaboratorios()}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && (
        <div className="tarjetas-laboratorios">
          {laboratorios.map((laboratorio) => (
            <article className="tarjeta-laboratorio" key={laboratorio.id}>
              <h3>{laboratorio.nombre}</h3>
              <p>Capacidad: {laboratorio.capacidad}</p>
              <h4>Equipamiento</h4>
              <ul>
                {laboratorio.equipamiento.map((elemento) => (
                  <li key={elemento}>{elemento}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
