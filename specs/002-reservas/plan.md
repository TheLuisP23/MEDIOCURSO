# Plan — Spec 002

## Resumen técnico

El dominio valida RN-01 a RN-04 con funciones puras que reciben `ahora`.
`crearApp({ repoReservas, ahora })` inyecta un repositorio (memoria por defecto,
DynamoDB si existe `TABLA_RESERVAS`) y el reloj. Dos rutas nuevas:
`GET /api/laboratorios/{id}/disponibilidad` y `POST /api/reservas`. Los errores
de negocio se lanzan como `ErrorNegocio` y un único `app.onError` los traduce
al formato `Error` del contrato. El frontend agrega identificación por código
de alumno, selector de laboratorio y fecha, y la grilla de 15 bloques.
**Depende de que el PR #5 (backend de la 001) esté en `main`.**

## Backend

- `src/dominio/errores.ts`: clase `ErrorNegocio(codigo, mensaje, status)`;
  `codigo` tipado con el enum `Error` del contrato.
- `src/dominio/bloques.ts`: `HORAS_BLOQUE` (`"07:00"`…`"21:00"`, 15 horas),
  `instanteBloque(fecha, hora)` → `new Date(\`${fecha}T${hora}:00-05:00\`)`,
  `esDomingo(fecha)`, `hoyEnLima(ahora)` → `AAAA-MM-DD`, `esFechaValida(texto)`.
- `src/dominio/reservas.ts`, una función por regla:
  - `validarLaboratorio(id)` → **RN-01** (`buscarLaboratorio` de la 001) · 404 `LAB_NO_EXISTE`.
  - `validarBloque(fecha, hora)` → **RN-02** (hora en `HORAS_BLOQUE`, no domingo) · 422 `BLOQUE_INVALIDO`.
  - `validarNoPasado(fecha, hora, ahora)` → **RN-03** (`instanteBloque <= ahora` rechaza) · 422 `FECHA_PASADA`.
  - `validarAnticipacion(fecha, ahora)` → **RN-04** (fecha ≤ `hoyEnLima(ahora)` + 14 días) · 422 `FUERA_DE_RANGO`.
  - `esReservable(fecha, hora, ahora)`: `true` si RN-02, RN-03 y RN-04 pasan (P3).
  - `idReserva(laboratorioId, fecha, hora)` → `LAB-101.2026-11-05.10`.
- `src/dominio/usuario.ts`: `validarUsuario(cabecera)` → `^[A-Za-z0-9]{6,12}$` · 401 `NO_AUTORIZADO` (CA-08).
- `src/repos/reservas.ts`: tipo `Reserva` (contrato) e interfaz
  `RepoReservas { guardar(reserva); delDia(laboratorioId, fecha): Reserva[] }`.
- `src/repos/memoria.ts`: `Map` por `id`.
- `src/repos/dynamo.ts`: `delDia` = `BatchGetItem` de los 15 `pk` del día;
  `guardar` = `PutItem` con los atributos de `docs/arquitectura.md`
  (`pk`, `laboratorioId`, `fecha`, `hora`, `usuario`, `fechaHora`, `creadaEn`).
  La condición `attribute_not_exists(pk)` (RN-05) la agrega la spec 003.
- `src/rutas/laboratorios.ts`: `GET /:id/disponibilidad?fecha=` → valida
  `fecha` (400 `VALIDACION`), RN-01, y responde `{ laboratorioId, fecha, bloques }`
  con `disponible = !ocupado && esReservable(...)`.
- `src/rutas/reservas.ts`: `POST /` → `validarUsuario`, cuerpo `NuevaReserva`
  (400 `VALIDACION` si falta un campo o la fecha no es válida), RN-01…RN-04,
  `guardar`, `201` con la `Reserva`.
- `src/app.ts`: `crearApp(deps?)` con `repoReservas` y `ahora` por defecto,
  `app.onError` para `ErrorNegocio` (cualquier otro error → 500 sin detalles).

## Frontend

- `src/tipos.ts`: `Bloque`, `Disponibilidad`, `NuevaReserva`, `Reserva`.
- `src/api.ts`: `disponibilidad(id, fecha)`, `crearReserva(nueva)`; `pedir()`
  agrega `X-Usuario` desde `localStorage["codigoAlumno"]` si existe.
- `src/componentes/CodigoAlumno.tsx`: campo + botón Guardar; valida el formato
  antes de guardar; muestra el código actual y permite cambiarlo.
- `src/componentes/ReservarBloque.tsx`: selector de laboratorio (usa
  `api.laboratorios()`), selector de fecha con `min` = hoy y `max` = hoy + 14;
  si se elige un domingo muestra "Los domingos no hay atención" y no consulta (P2).
- `src/componentes/GrillaBloques.tsx`: 15 botones; libres clicables, ocupados
  o no reservables deshabilitados con texto "Ocupado"/"No disponible" (P1).
  Al reservar: confirmación con `role="status"` y recarga la grilla; si falla,
  muestra el `mensaje` del error con `role="alert"` y conserva la selección.
- `src/App.tsx`: `<CodigoAlumno />` y `<ReservarBloque />` debajo del listado.
- Estados: cargando, error, sin código de alumno (pide ingresarlo), éxito.

## Tests

Backend con `crearApp({ repoReservas: new RepoMemoria(), ahora: () => fecha fija })`.

| Qué se prueba | Archivo de test | Cubre |
|---------------|-----------------|-------|
| 15 bloques 07:00…21:00 con `disponible` | `backend/test/disponibilidad.test.ts` | CA-06 |
| Bloque reservado y bloques pasados salen `false` | `backend/test/disponibilidad.test.ts` | CA-06, P3 |
| Fecha inválida → 400 `VALIDACION`; lab inexistente → 404 | `backend/test/disponibilidad.test.ts` | RN-01 |
| Reserva válida → 201 y el bloque queda `false` | `backend/test/reservas.test.ts` | CA-07 |
| Sin `X-Usuario` o con formato inválido → 401 | `backend/test/reservas.test.ts` | CA-08 |
| `RN-01:` laboratorio inexistente → 404 `LAB_NO_EXISTE` | `backend/test/reservas.test.ts` | RN-01 |
| `RN-02:` hora 06:00, 07:30, 22:00 y domingo → 422 `BLOQUE_INVALIDO` | `backend/test/reglas-reserva.test.ts` | RN-02 |
| `RN-03:` bloque pasado y bloque ya empezado → 422 `FECHA_PASADA` | `backend/test/reglas-reserva.test.ts` | RN-03 |
| `RN-04:` día 14 se acepta, día 15 → 422 `FUERA_DE_RANGO` | `backend/test/reglas-reserva.test.ts` | RN-04 |
| Elegir lab y fecha muestra la grilla; reservar confirma y recarga | `frontend/test/ReservarBloque.test.tsx` | CA-09 |
| Domingo no consulta la API | `frontend/test/ReservarBloque.test.tsx` | CA-09, P2 |
| Error de la API muestra `mensaje` y conserva la selección | `frontend/test/ReservarBloque.test.tsx` | CA-10 |
| Código inválido no se guarda; válido va en `X-Usuario` | `frontend/test/CodigoAlumno.test.tsx` | CA-08 |

## Riesgos y decisiones

- **Doble reserva:** hasta la spec 003, `guardar` sobrescribe si el bloque ya
  existe. No hay que desplegar a usuarios reales antes de la 003.
- **`dynamo.ts` no tiene tests automáticos** (requiere AWS); se verifica en el
  despliegue (spec 005). Los tests usan siempre el repo en memoria.
- **"Hoy" es el de Lima**, no el del servidor: `hoyEnLima` resta 5 h a `ahora`
  en UTC. Los tests fijan `ahora` cerca de medianoche para comprobarlo.
- **Orden de validación en `POST`:** usuario (401) → cuerpo (400) → RN-01 (404)
  → RN-02 → RN-03 → RN-04 (422). Determinista para que los tests no dependan del azar.
- Sin cambios de contrato ni dependencias nuevas (`@aws-sdk/lib-dynamodb` ya está).
