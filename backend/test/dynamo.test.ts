import { describe, expect, it } from "vitest";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { aItem, deItem, RepoDynamo } from "../src/repos/dynamo.js";

const reserva = {
  id: "LAB-101.2026-11-06.10",
  laboratorioId: "LAB-101",
  fecha: "2026-11-06",
  hora: "10:00",
  usuario: "20231234",
  creadaEn: "2026-11-05T15:30:00.000Z",
};

describe("repos/dynamo: conversión al modelo de la tabla", () => {
  it("usa el id como pk y arma fechaHora para el índice porUsuario", () => {
    expect(aItem(reserva)).toEqual({
      pk: "LAB-101.2026-11-06.10",
      laboratorioId: "LAB-101",
      fecha: "2026-11-06",
      hora: "10:00",
      usuario: "20231234",
      fechaHora: "2026-11-06T10:00",
      creadaEn: "2026-11-05T15:30:00.000Z",
    });
  });

  it("deItem recupera la reserva del contrato", () => {
    expect(deItem(aItem(reserva))).toEqual(reserva);
  });
});

/** Cliente simulado: guarda los comandos recibidos y responde lo que se le indique. */
function clienteSimulado(responder: (comando: { input: Record<string, unknown> }) => unknown) {
  const comandos: { nombre: string; input: Record<string, unknown> }[] = [];
  const cliente = {
    send: async (comando: { constructor: { name: string }; input: Record<string, unknown> }) => {
      comandos.push({ nombre: comando.constructor.name, input: comando.input });
      return responder(comando);
    },
  };
  return { cliente: cliente as unknown as DynamoDBDocumentClient, comandos };
}

describe("RepoDynamo (cliente simulado)", () => {
  it("RN-05: guardar usa PutItem condicional y devuelve false si el pk ya existía", async () => {
    let existe = false;
    const { cliente, comandos } = clienteSimulado(() => {
      if (existe) {
        throw new ConditionalCheckFailedException({ message: "existe", $metadata: {} });
      }
      existe = true;
      return {};
    });
    const repo = new RepoDynamo("Reservas", cliente);

    expect(await repo.guardar(reserva)).toBe(true);
    expect(await repo.guardar(reserva)).toBe(false);
    expect(comandos[0]?.nombre).toBe("PutCommand");
    expect(comandos[0]?.input.ConditionExpression).toBe("attribute_not_exists(pk)");
  });

  it("guardar no oculta otros errores de DynamoDB", async () => {
    const { cliente } = clienteSimulado(() => {
      throw new Error("sin conexión");
    });
    await expect(new RepoDynamo("Reservas", cliente).guardar(reserva)).rejects.toThrow("sin conexión");
  });

  it("delUsuarioEnDia consulta el índice porUsuario con begins_with de la fecha", async () => {
    const { cliente, comandos } = clienteSimulado(() => ({ Items: [aItem(reserva)] }));
    const repo = new RepoDynamo("Reservas", cliente);

    expect(await repo.delUsuarioEnDia("20231234", "2026-11-06")).toEqual([reserva]);
    expect(comandos[0]?.nombre).toBe("QueryCommand");
    expect(comandos[0]?.input).toMatchObject({
      TableName: "Reservas",
      IndexName: "porUsuario",
      KeyConditionExpression: "usuario = :usuario AND begins_with(fechaHora, :fecha)",
      ExpressionAttributeValues: { ":usuario": "20231234", ":fecha": "2026-11-06" },
    });
  });
});
