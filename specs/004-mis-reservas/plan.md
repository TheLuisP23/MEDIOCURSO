# Plan — Spec 004

## Resumen técnico

Dos rutas nuevas en `rutas/reservas.ts`: `GET /mias` y `DELETE /:id`. El
repositorio gana tres operaciones (`obtener`, `eliminar`, `delUsuarioDesde`),
en memoria y en DynamoDB, siguiendo los patrones de `docs/arquitectura.md`
(`Query` en `porUsuario` con `fechaHora >= …` y `DeleteItem` por `pk`). Las
reglas RN-08 a RN-10 son funciones puras con el reloj inyectado. En el
frontend, una sección `MisReservas` lista y cancela; `App` comparte un contador
`version` para que la lista y la grilla se recarguen mutuamente (CA-17).

## Backend

- `src/dominio/reservas.ts`:
  - `asegurarExiste(reserva)` → **RN-10** · 404 `RESERVA_NO_EXISTE`.
  - `validarDueno(reserva, usuario)` → **RN-08** · 403 `PROHIBIDO`.
  - `validarCancelacionATiempo(reserva, ahora)` → **RN-09** (faltan ≥ 60 min, P2) · 422 `CANCELACION_TARDIA`.
  - `sigueVigente(reserva, ahora)`: el bloque termina después de `ahora` (CA-14, P1).
- `src/repos/reservas.ts`: `obtener(id)`, `eliminar(id)`, `delUsuarioDesde(usuario, fechaHora)`.
- `src/repos/memoria.ts` y `src/repos/dynamo.ts`: `GetItem`, `DeleteItem` y
  `Query` en `porUsuario` con `fechaHora >= :desde` (ordenado por el índice).
- `src/rutas/reservas.ts`:
  - `GET /mias`: `validarUsuario`, consulta desde el inicio de hoy en Lima,
    filtra con `sigueVigente` y ordena por fecha y hora.
  - `DELETE /:id`: `validarUsuario` → RN-10 → RN-08 → RN-09 (P3) → `eliminar` → `204`.

## Frontend

- `src/api.ts`: `misReservas()` y `cancelarReserva(id)`.
- `src/componentes/MisReservas.tsx`: sin código de alumno pide ingresarlo;
  con código lista "LAB · fecha · hora" con botón **Cancelar**, que pide
  confirmación (`window.confirm`) antes de llamar a la API (CA-16). Estados:
  cargando, vacío ("No tienes reservas próximas"), error (`mensaje` de la API).
- `src/App.tsx`: `<MisReservas />` recibe `version` y avisa con `alCancelar`;
  `ReservarBloque` recibe la misma `version` (CA-17).

## Tests

| Qué se prueba | Archivo de test | Cubre |
|---------------|-----------------|-------|
| Solo las del usuario, sin las terminadas, ordenadas | `backend/test/mis-reservas.test.ts` | CA-14 |
| Cancelar → 204 y el bloque vuelve a estar disponible | `backend/test/mis-reservas.test.ts` | CA-15 |
| `RN-08:` cancelar una reserva ajena → 403 `PROHIBIDO` | `backend/test/mis-reservas.test.ts` | RN-08 |
| `RN-09:` a menos de 60 min → 422; con 60 min exactos se permite | `backend/test/mis-reservas.test.ts` | RN-09 |
| `RN-10:` id inexistente → 404 `RESERVA_NO_EXISTE` | `backend/test/mis-reservas.test.ts` | RN-10 |
| Reglas puras RN-08 a RN-10 | `backend/test/reglas-reserva.test.ts` | RN-08, RN-09, RN-10 |
| `obtener`, `eliminar`, `delUsuarioDesde` con cliente simulado | `backend/test/dynamo.test.ts` | CA-14, CA-15 |
| Lista con Cancelar que pide confirmación; si se rechaza no llama a la API | `frontend/test/MisReservas.test.tsx` | CA-16 |
| Tras cancelar se recarga la lista y se avisa (`alCancelar`) | `frontend/test/MisReservas.test.tsx` | CA-17 |

## Riesgos y decisiones

- Los dueños de la spec están invertidos (backend B, frontend A). A pedido de
  A, todo lo implementa A; queda anotado en la bitácora.
- Cancelar no es atómico contra una reserva simultánea del mismo bloque: el
  `DeleteItem` es por `pk` y el `PutItem` condicional de RN-05 sigue
  garantizando que no haya dos reservas a la vez.
- Sin cambios de contrato ni dependencias nuevas.
