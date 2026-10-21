import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  type BatchGetCommandOutput,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  type QueryCommandOutput,
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

  /** RN-05: escritura condicional; si dos llegan a la vez, DynamoDB deja ganar solo a una. */
  async guardar(reserva: Reserva): Promise<boolean> {
    try {
      await this.cliente.send(
        new PutCommand({
          TableName: this.tabla,
          Item: aItem(reserva),
          ConditionExpression: "attribute_not_exists(pk)",
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  }

  async obtener(id: string): Promise<Reserva | undefined> {
    const res = await this.cliente.send(new GetCommand({ TableName: this.tabla, Key: { pk: id } }));
    return res.Item ? deItem(res.Item as ItemReserva) : undefined;
  }

  async eliminar(id: string): Promise<void> {
    await this.cliente.send(new DeleteCommand({ TableName: this.tabla, Key: { pk: id } }));
  }

  /** Query en el índice porUsuario con begins_with(fechaHora, fecha). */
  delUsuarioEnDia(usuario: string, fecha: string): Promise<Reserva[]> {
    return this.consultarPorUsuario("begins_with(fechaHora, :fecha)", { ":usuario": usuario, ":fecha": fecha });
  }

  /** Query en el índice porUsuario con fechaHora >= desde (ordenado por el índice). */
  delUsuarioDesde(usuario: string, desde: string): Promise<Reserva[]> {
    return this.consultarPorUsuario("fechaHora >= :desde", { ":usuario": usuario, ":desde": desde });
  }

  private async consultarPorUsuario(
    condicionFechaHora: string,
    valores: Record<string, string>,
  ): Promise<Reserva[]> {
    const items: ItemReserva[] = [];
    let siguiente: Record<string, unknown> | undefined;
    do {
      const res: QueryCommandOutput = await this.cliente.send(
        new QueryCommand({
          TableName: this.tabla,
          IndexName: "porUsuario",
          KeyConditionExpression: `usuario = :usuario AND ${condicionFechaHora}`,
          ExpressionAttributeValues: valores,
          ExclusiveStartKey: siguiente,
        }),
      );
      items.push(...((res.Items ?? []) as ItemReserva[]));
      siguiente = res.LastEvaluatedKey;
    } while (siguiente);
    return items.map(deItem);
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
