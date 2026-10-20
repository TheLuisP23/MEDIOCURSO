import { useEffect, useState } from "react";
import { api } from "./api";
import { ListaLaboratorios } from "./componentes/ListaLaboratorios";

type EstadoApi = "cargando" | "ok" | "caida";

export function App() {
  const [estado, setEstado] = useState<EstadoApi>("cargando");

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
      </header>
      <ListaLaboratorios />
    </main>
  );
}
