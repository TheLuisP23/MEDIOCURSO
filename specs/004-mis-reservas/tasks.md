# Tareas — Spec 004

Leyenda: `[B]` backend · `[F]` frontend · `[D]` docs/infra.
Cada tarea debe poder hacerse y commitearse sola, con `npm run check` en verde.
Formato obligatorio de línea: `- [ ] T<n> [B|F|D] descripción (dueño: A|B)`.

- [x] T1 [B] Reglas RN-08, RN-09, RN-10 y `sigueVigente` con tests `RN-xx:` (dueño: B)
- [x] T2 [B] Repos memoria y DynamoDB: `obtener`, `eliminar` y `delUsuarioDesde` (dueño: B)
- [x] T3 [B] `GET /reservas/mias` y `DELETE /reservas/:id` con tests CA-14, CA-15 y RN-08…RN-10 (dueño: B)
- [ ] T4 [F] `api.misReservas`, `api.cancelarReserva` y componente `MisReservas` con tests CA-16 y CA-17 (dueño: A)
- [ ] T5 [D] Marcar spec como Implementada y actualizar índice en `specs/README.md` (dueño: A)
