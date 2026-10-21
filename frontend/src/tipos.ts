
/** Tipos copiados del contrato docs/api/openapi.yaml. */

export interface Laboratorio {
  id: string;
  nombre: string;
  capacidad: number;
  equipamiento: string[];
}

export interface Bloque {
  hora: string;
  disponible: boolean;
}

export interface Disponibilidad {
  laboratorioId: string;
  fecha: string;
  bloques: Bloque[];
}

export interface NuevaReserva {
  laboratorioId: string;
  fecha: string;
  hora: string;
}

export interface Reserva {
  id: string;
  laboratorioId: string;
  fecha: string;
  hora: string;
  usuario: string;
  creadaEn: string;
}
