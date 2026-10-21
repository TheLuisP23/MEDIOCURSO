# Spec 003 — Conflictos y concurrencia

- **Estado:** Implementada
- **Dueños:** backend: A · frontend: B
- **Depende de:** 002

## Contexto

Es el corazón "cloud" del proyecto: si dos estudiantes intentan reservar el
mismo bloque **al mismo tiempo**, solo uno puede ganar. Esto no se resuelve
"leyendo y luego escribiendo" (hay una carrera entre ambos pasos), sino con una
**escritura condicional atómica** en DynamoDB (ver `docs/arquitectura.md`).

## Historias de usuario

- Como **estudiante**, quiero tener la seguridad de que si mi reserva fue
  confirmada, nadie más tiene ese mismo bloque.
- Como **encargado de laboratorio**, quiero que nadie acapare bloques.

## Criterios de aceptación

- **CA-11** — Dado un bloque ya reservado, cuando otro usuario intenta
  reservarlo, entonces responde `409 BLOQUE_OCUPADO`.
- **CA-12** — Dadas 10 peticiones simultáneas al mismo bloque libre, entonces
  exactamente 1 recibe `201` y 9 reciben `409` (test de concurrencia con el
  repositorio en memoria y, en la demo, contra AWS real).
- **CA-13** — En la UI, si al reservar se recibe `409`, se muestra
  "Alguien acaba de reservar este bloque" y la grilla se recarga.

## Reglas de negocio

| Código | Regla | Error si se incumple |
|--------|-------|----------------------|
| RN-05  | Un bloque de un laboratorio tiene como máximo una reserva, garantizado de forma atómica | 409 `BLOQUE_OCUPADO` |
| RN-06  | Un usuario puede tener como máximo 2 bloques por día (sumando todos los laboratorios) | 422 `LIMITE_DIARIO` |
| RN-07  | Un usuario no puede tener dos reservas a la misma hora en laboratorios distintos | 409 `CHOQUE_USUARIO` |

## Contrato de API

- `POST /api/reservas` (nuevas respuestas 409 y 422)

## Fuera de alcance

- Lista de espera cuando un bloque está ocupado.
- Garantía atómica de RN-06 y RN-07 (se validan con una consulta previa;
  hacerlas atómicas requiere un ADR nuevo).

## Preguntas abiertas

- **P1** — ¿El repositorio en memoria también debe ser atómico para que el
  test CA-12 tenga sentido? → *Respuesta:* Sí: debe comportarse igual que
  DynamoDB (operación "insertar si no existe").
