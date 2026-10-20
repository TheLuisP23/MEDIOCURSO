/** Laboratorio del catálogo (spec 001). Coincide con `Laboratorio` en docs/api/openapi.yaml. */
export interface Laboratorio {
  id: string;
  nombre: string;
  capacidad: number;
  equipamiento: string[];
}

/** Catálogo fijo (spec 001, P1: vive en el código, sin base de datos). Ordenado por id. */
export const CATALOGO_LABORATORIOS: readonly Laboratorio[] = [
  {
    id: "LAB-101",
    nombre: "Laboratorio de Redes",
    capacidad: 30,
    equipamiento: ["Switches Cisco", "Routers", "Proyector"],
  },
  {
    id: "LAB-102",
    nombre: "Cómputo General",
    capacidad: 40,
    equipamiento: ["PCs i5", "Proyector"],
  },
  {
    id: "LAB-201",
    nombre: "Desarrollo Móvil",
    capacidad: 25,
    equipamiento: ["Macs", "Dispositivos Android", "Proyector"],
  },
  {
    id: "LAB-202",
    nombre: "Ciencia de Datos",
    capacidad: 20,
    equipamiento: ["PCs con GPU", "Pizarra digital"],
  },
];

/** Devuelve el laboratorio con ese id, o `undefined` si no existe (la usará la spec 002, RN-01). */
export function buscarLaboratorio(id: string): Laboratorio | undefined {
  return CATALOGO_LABORATORIOS.find((laboratorio) => laboratorio.id === id);
}
