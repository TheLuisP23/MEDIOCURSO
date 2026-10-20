import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  type BatchGetCommandOutput,
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { HORAS_BLOQUE } from "../dominio/bloques.js";
import { idReserva } from "../dominio/reservas.js";
import type { RepoReservas, Reserva } from "./reservas.js";

/** Ítem de la tabla Reservas (modelo en docs/arquitectura.md). */
export interface ItemReserva {
  pk: string;
  laboratorioId: string;
  fecha: string;
  hora: string;
  usuario: string;
  fechaHora: string;
  creadaEn: string;
}

export function aItem(reserva: Reserva): ItemReserva {
  const { id, ...resto } = reserva;
  return { pk: id, ...resto, fechaHora: `${reserva.fecha}T${reserva.hora}` };
}

export function deItem(item: ItemReserva): Reserva {
  const { pk, laboratorioId, fecha, hora, usuario, creadaEn } = item;
  return { id: pk, laboratorioId, fecha, hora, usuario, creadaEn };
}

/** Repositorio de producción. Se usa cuando existe la variable TABLA_RESERVAS. */
export class RepoDynamo implements RepoReservas {
  private readonly cliente: DynamoDBDocumentClient;

  constructor(
    private readonly tabla: string,
    cliente?: DynamoDBDocumentClient,
  ) {
    this.cliente = cliente ?? DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async guardar(reserva: Reserva): Promise<void> {
    // La condición attribute_not_exists(pk) contra la doble reserva (RN-05) llega con la spec 003.
    await this.cliente.send(new PutCommand({ TableName: this.tabla, Item: aItem(reserva) }));
  }

  /** BatchGetItem de los 15 pk posibles del día. */
  async delDia(laboratorioId: string, fecha: string): Promise<Reserva[]> {
    let pendientes: Record<string, unknown>[] | undefined = HORAS_BLOQUE.map((hora) => ({
      pk: idReserva(laboratorioId, fecha, hora),
    }));
    const items: ItemReserva[] = [];
    while (pendientes && pendientes.length > 0) {
      const res: BatchGetCommandOutput = await this.cliente.send(
        new BatchGetCommand({ RequestItems: { [this.tabla]: { Keys: pendientes } } }),
      );
      items.push(...((res.Responses?.[this.tabla] ?? []) as ItemReserva[]));
      pendientes = res.UnprocessedKeys?.[this.tabla]?.Keys;
    }
    return items.map(deItem);
  }
}
