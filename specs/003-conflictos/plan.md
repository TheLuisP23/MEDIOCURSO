# Plan — Spec 003

## Resumen técnico

`RepoReservas.guardar` pasa a ser **"insertar si no existe"** y devuelve
`false` si el `id` ya existía: en DynamoDB con `ConditionExpression:
attribute_not_exists(pk)`, en memoria con comprobar-y-escribir sin `await` en
medio (atómico en el hilo único de Node, P1). Como el `id` es
laboratorio + fecha + hora, eso garantiza RN-05. RN-06 y RN-07 se validan
antes con una consulta de las reservas del usuario en ese día (no atómicas,
como dice la spec). El frontend traduce el `409` en un mensaje y recarga la grilla.

## Backend

- `src/repos/reservas.ts`: `guardar(reserva): Promise<boolean>` (`false` = ya
  existía) y nuevo `delUsuarioEnDia(usuario, fecha): Promise<Reserva[]>`.
- `src/repos/memoria.ts`: `guardar` comprueba `has(id)` y escribe en el mismo
  turno síncrono; `delUsuarioEnDia` filtra por usuario y fecha.
- `src/repos/dynamo.ts`: `PutItem` con `attribute_not_exists(pk)`; captura
  `ConditionalCheckFailedException` → `false`. `delUsuarioEnDia` = `Query` en
  el índice `porUsuario` con `begins_with(fechaHora, fecha)` (patrón de
  `docs/arquitectura.md`).
- `src/dominio/reservas.ts`, una función por regla:
  - `asegurarBloqueLibre(creada)` → **RN-05** · 409 `BLOQUE_OCUPADO`.
  - `validarLimiteDiario(reservasDelDia)` → **RN-06** (ya tiene 2) · 422 `LIMITE_DIARIO`.
  - `validarSinChoque(reservasDelDia, hora, laboratorioId)` → **RN-07** (misma hora, otro lab) · 409 `CHOQUE_USUARIO`.
- `src/rutas/reservas.ts`: tras RN-01…RN-04, consulta `delUsuarioEnDia`,
  valida RN-07 y RN-06, y luego `guardar` + RN-05.

## Frontend

- `src/componentes/GrillaBloques.tsx` (spec 002): si `crearReserva` falla con
  `ErrorApi` de status `409` y código `BLOQUE_OCUPADO`, muestra
  "Alguien acaba de reservar este bloque" (`role="alert"`) y recarga la
  disponibilidad. Otros errores siguen como en CA-10.

## Tests

| Qué se prueba | Archivo de test | Cubre |
|---------------|-----------------|-------|
| Segundo usuario sobre el mismo bloque → 409 `BLOQUE_OCUPADO` | `backend/test/conflictos.test.ts` | CA-11, RN-05 |
| 10 `POST` simultáneos (usuarios distintos) → 1×201 y 9×409 | `backend/test/conflictos.test.ts` | CA-12, RN-05 |
| Tercera reserva del mismo usuario en el día → 422 `LIMITE_DIARIO` | `backend/test/conflictos.test.ts` | RN-06 |
| Misma hora en otro laboratorio → 409 `CHOQUE_USUARIO` | `backend/test/conflictos.test.ts` | RN-07 |
| Reglas puras RN-05, RN-06, RN-07 | `backend/test/reglas-reserva.test.ts` | RN-05, RN-06, RN-07 |
| `ConditionalCheckFailedException` → `guardar` devuelve `false` | `backend/test/dynamo.test.ts` (cliente simulado) | RN-05 |
| 409 muestra el mensaje y recarga la grilla | `frontend/test/ReservarBloque.test.tsx` | CA-13 |

## Riesgos y decisiones

- **Orden en `POST`:** … RN-04 → RN-07 (409) → RN-06 (422) → RN-05 (409). Si
  el usuario ya tiene 2 bloques, recibe `LIMITE_DIARIO` aunque el bloque esté ocupado.
- **RN-06/RN-07 no son atómicas:** el mismo usuario con dos pestañas podría
  pasar el límite en una carrera. La spec lo deja fuera de alcance.
- **CA-12 contra AWS real** se demuestra en la spec 005 (CA-22).
- El frontend depende de que B haya terminado la grilla de la spec 002 (T10).
- Sin cambios de contrato (409 y 422 ya están) ni dependencias nuevas.
