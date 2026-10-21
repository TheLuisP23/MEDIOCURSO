# Tareas — Spec 002

Leyenda: `[B]` backend · `[F]` frontend · `[D]` docs/infra.
Cada tarea debe poder hacerse y commitearse sola, con `npm run check` en verde.
Formato obligatorio de línea: `- [ ] T<n> [B|F|D] descripción (dueño: A|B)`.

Requisito: el PR #5 (backend de la spec 001) debe estar en `main`.

- [x] T1 [B] `ErrorNegocio`, `app.onError` y `crearApp({ repoReservas, ahora })` con valores por defecto (dueño: A)
- [x] T2 [B] `dominio/bloques.ts` y reglas RN-02, RN-03, RN-04 con tests `RN-xx:` en `reglas-reserva.test.ts` (dueño: A)
- [x] T3 [B] `repos/reservas.ts` (interfaz) y `repos/memoria.ts` (dueño: A)
- [x] T4 [B] `GET /laboratorios/:id/disponibilidad` con tests CA-06 y RN-01 (dueño: A)
- [x] T5 [B] `validarUsuario` y `POST /reservas` con tests CA-07, CA-08 y RN-01 (dueño: A)
- [x] T6 [B] `repos/dynamo.ts` (BatchGetItem y PutItem) elegido si existe `TABLA_RESERVAS` (dueño: A)
- [x] T7 [F] Tipos `Bloque`, `Disponibilidad`, `NuevaReserva`, `Reserva`; `api.disponibilidad`, `api.crearReserva` y cabecera `X-Usuario` (dueño: B)
- [ ] T8 [F] `CodigoAlumno` con test de formato y guardado en `localStorage` (dueño: B)
- [ ] T9 [F] Tests CA-09 y CA-10 de `ReservarBloque` (dueño: B)
- [ ] T10 [F] Implementar `ReservarBloque` y `GrillaBloques` y usarlos en `App.tsx` (dueño: B)
- [ ] T11 [D] Marcar spec como Implementada y actualizar índice en `specs/README.md` (dueño: B)
