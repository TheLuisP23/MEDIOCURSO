# Tareas — Spec 003

Leyenda: `[B]` backend · `[F]` frontend · `[D]` docs/infra.
Cada tarea debe poder hacerse y commitearse sola, con `npm run check` en verde.
Formato obligatorio de línea: `- [ ] T<n> [B|F|D] descripción (dueño: A|B)`.

Requisito: backend de la spec 002 en `main` (PR #7). El frontend requiere T10 de la 002.

- [x] T1 [B] Reglas RN-05, RN-06 y RN-07 en `dominio/reservas.ts` con tests `RN-xx:` (dueño: A)
- [x] T2 [B] Repo memoria: `guardar` atómico que devuelve `boolean` y `delUsuarioEnDia` (dueño: A)
- [x] T3 [B] `POST /reservas` con RN-05, RN-06, RN-07 y tests CA-11 y CA-12 (dueño: A)
- [x] T4 [B] Repo DynamoDB: `PutItem` condicional y `Query` en `porUsuario`, con test de cliente simulado (dueño: A)
- [x] T5 [F] Test CA-13 e implementación del mensaje de 409 con recarga de la grilla (dueño: B)
- [ ] T6 [D] Marcar spec como Implementada y actualizar índice en `specs/README.md` (dueño: B)
