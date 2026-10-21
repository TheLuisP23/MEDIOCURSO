import { useEffect, useState } from "react";
import { api } from "./api";
import { leerCodigoAlumno } from "./codigoAlumno";
import { CodigoAlumno } from "./componentes/CodigoAlumno";
import { ListaLaboratorios } from "./componentes/ListaLaboratorios";
import { ReservarBloque } from "./componentes/ReservarBloque";

type EstadoApi = "cargando" | "ok" | "caida";

export function App() {
  const [estado, setEstado] = useState<EstadoApi>("cargando");
  const [codigo, setCodigo] = useState<string | null>(() => leerCodigoAlumno());
  // Se incrementa cuando cambian las reservas, para que las secciones se recarguen.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api
      .salud()
      .then(() => setEstado("ok"))
      .catch(() => setEstado("caida"));
  }, []);

  return (
    <main className="contenedor">
      <header>
        <h1>Reserva de Laboratorios</h1>
        <p className={`estado estado-${estado}`} role="status">
          {estado === "cargando" && "Conectando con la API…"}
          {estado === "ok" && "API conectada"}
          {estado === "caida" && "No se pudo conectar con la API"}
        </p>
        <CodigoAlumno codigo={codigo} alCambiar={setCodigo} />
      </header>
      <ListaLaboratorios />
      <ReservarBloque codigo={codigo} version={version} alReservar={() => setVersion((v) => v + 1)} />
    </main>
  );
}
