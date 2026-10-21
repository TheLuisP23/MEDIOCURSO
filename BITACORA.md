# Bitácora de traspaso

Registro **solo de agregar** (nunca se borra ni se reescribe). Cada sesión de
trabajo —humana o de agente— termina con una entrada nueva **al final**.
Es lo primero que lee un agente al empezar: debe bastar para continuar sin
preguntar nada por chat.

Formato de cada entrada:

```
## AAAA-MM-DD HH:MM — <A|B> (<Claude Code|Codex|manual>) — rama `<rama>`
- **Spec/tareas:** 00X · T1, T2
- **Hecho:** ...
- **Estado de check:** verde | rojo (por qué)
- **Decisiones:** ... (o "ninguna")
- **Pendiente / siguiente paso:** ...
- **Bloqueos / preguntas para la otra persona:** ... (o "ninguno")
```

---

## (fecha del primer commit) — A (manual) — rama `main`
- **Spec/tareas:** —
- **Hecho:** Estructura inicial: monorepo, harness (AGENTS.md, skills, CI,
  pre-commit), constitución, specs 001–005, contrato OpenAPI, infraestructura SAM.
- **Estado de check:** verde
- **Decisiones:** ver `docs/adr/0001-monorepo-serverless.md`.
- **Pendiente / siguiente paso:** Ronda 1 de `GUIA_EQUIPO.md`: A implementa
  backend de la spec 001 (T1–T3) y B el frontend (T4–T7), en paralelo.
- **Bloqueos / preguntas para la otra persona:** ninguno.

## 2026-10-20 15:43 — B (Codex) — rama `feat/001-front`
- **Spec/tareas:** 001 · T4, T5, T6
- **Hecho:** Tipo `Laboratorio` en `frontend/src/tipos.ts`; tests CA-03/04/05; componente `ListaLaboratorios` integrado en `App.tsx`, con carga, error/reintento y tarjetas. Se actualizaron los mocks de `App.test.tsx` para responder a salud y catálogo.
- **Estado de check:** verde — `npm run check` (5 specs OK, 5 skills sincronizados, tipos de ambos workspaces y tests backend 1/1 y frontend 5/5).
- **Decisiones:** CA-04 simula rechazo de la petición `fetch`; el componente muestra un mensaje genérico claro para fallos de conexión y conserva el mensaje de `ErrorApi` para errores HTTP.
- **Pendiente / siguiente paso:** Cuando A integre T1–T3 y el endpoint `GET /api/laboratorios` esté disponible, ejecutar la integración frontend/backend y después completar T7 actualizando el estado de la spec y el índice de `specs/README.md`.
- **Bloqueos / preguntas para la otra persona:** T1–T3 del backend aún no están integradas. `package-lock.json` ya estaba modificado al iniciar esta sesión y se conservó sin cambios adicionales.
## 2026-10-20 15:56 — A (Claude Code) — rama `feat/001-back`
- **Spec/tareas:** 001 · T1, T2, T3 — 005 · spec, ADR y plan (sin tareas de código aún)
- **Hecho:**
  - Spec 001 backend: `dominio/laboratorios.ts` (catálogo + `buscarLaboratorio`),
    `rutas/laboratorios.ts` montada en `app.ts`, tests CA-01 y CA-02.
  - Spec 005 reescrita para EC2 + Terraform + GitHub Actions (PR #1), ADR 0002
    y nuevo Art. 8 de la constitución; `plan.md` y `tasks.md` (PR #2). Spec 005 `En curso`.
  - CODEOWNERS con `@TheLuisP23` y `@Sofia-Itusaca` (PR #3).
  - Protección de `main` en GitHub: PR + 1 aprobación + checks `check` e `infra`;
    el administrador (A) puede saltarla.
  - Revisión del PR #4 de B (frontend 001): aprobado con comentarios.
- **Estado de check:** verde (backend 3/3, frontend 2/2 en esta rama).
- **Decisiones:** PR #2 y #3 se mergearon **sin revisión de B** (bypass de
  administrador, a pedido de A). `GUIA_EQUIPO.md` no se versiona (`.gitignore`).
- **Pendiente / siguiente paso:**
  - B: atender en el PR #4 el comentario 1 (mensaje en español cuando la API
    responde 5xx sin JSON, más un test CA-04 con `500` sin cuerpo), mergear
    el PR #4 y, con este backend ya en `main`, probar la integración y hacer T7 de la spec 001.
  - A: spec 005 T1 (`infra/bootstrap/`) en `feat/005-terraform`.
  - Ambos: Ronda 2 de la guía (P1 y P2 de la spec 002) para aprobar la 002.
- **Bloqueos / preguntas para la otra persona:** B, revisa por favor después del
  merge los PR #2 (plan de la 005: rol de GitHub con `AdministratorAccess`,
  costo de la EC2) y #3 (CODEOWNERS); deja comentarios en GitHub si algo no te cuadra.

## 2026-10-20 — B (Codex) — rama `docs/001-cerrar-laboratorios`
- **Spec/tareas:** 001 · T7
- **Hecho:**
  - Verificada la integración del catálogo de laboratorios entre backend y frontend.
  - Actualizado el estado de la Spec 001 a `Implementada`.
  - Marcada T7 como completada y actualizado el índice de `specs/README.md`.
  - `npm run check` ejecutado correctamente: especificaciones, sincronización de skills, TypeScript y pruebas.
- **Estado de check:** verde; backend 3/3 pruebas y frontend 5/5 pruebas.
- **Pendiente / siguiente paso:** revisar los cambios, crear el commit, subir la rama y abrir un PR hacia `main`.
- **Bloqueos / preguntas para la otra persona:** ninguno identificado.
## 2026-10-20 16:05 — A (Claude Code) — rama `feat/002-back`
- **Spec/tareas:** 002 · T1–T6 (todo el backend)
- **Hecho:** P1–P3 de la spec 002 respondidas por A (sin la Ronda 2 de la guía),
  spec aprobada y planificada (PR #6). Backend completo: `ErrorNegocio` +
  `onError`, `crearApp({ repoReservas, ahora })`, RN-01…RN-04 en `dominio/`,
  repos memoria y DynamoDB, `GET /api/laboratorios/:id/disponibilidad` y
  `POST /api/reservas`. Probado también con el servidor real (`npm run dev:back`).
- **Estado de check:** verde (backend 24/24, frontend 2/2).
- **Decisiones:** P3 de la spec: `disponible` es `true` solo si el bloque está
  libre y es reservable ahora. Un error no previsto responde 500 con solo
  `{ mensaje }` (sin `codigo`): el front lo trata como `DESCONOCIDO`.
  Esta rama incluye `feat/001-back` (PR #5) y `spec/002-acuerdos` (PR #6), que
  quedaron sin mergear; cuando entren a `main`, el PR de esta rama queda solo con la 002.
- **Pendiente / siguiente paso:**
  - B: T7–T10 de la spec 002 en `feat/002-front` (ver `specs/002-reservas/plan.md`,
    sección Frontend). El backend ya responde en local con `npm run dev`.
  - A: spec 005 T1 (`infra/bootstrap/`) en `feat/005-terraform`.
- **Bloqueos / preguntas para la otra persona:** hasta la spec 003, reservar un
  bloque ya ocupado lo **sobrescribe** (no hay 409 todavía). Sofia: revisa P3 en el PR #6.

## 2026-10-20 16:20 — A (Claude Code) — rama `feat/003-back`
- **Spec/tareas:** 003 · T1–T4 (todo el backend)
- **Hecho:** Spec 003 aprobada por A (no tenía preguntas abiertas), planificada
  e implementada en backend: RN-05 atómica (memoria y DynamoDB con
  `attribute_not_exists(pk)`), RN-06 y RN-07 con consulta al índice `porUsuario`.
  Test de concurrencia CA-12: 10 peticiones simultáneas → 1×201 y 9×409.
  PR #5 y #6 mergeados a `main`.
- **Estado de check:** verde (backend 34/34, frontend 2/2).
- **Decisiones:** orden en `POST /reservas`: … RN-04 → RN-07 (409) → RN-06 (422)
  → RN-05 (409). El tipo `Reserva` pasa a `dominio/reservas.ts` (Art. 4);
  `repos/reservas.ts` lo reexporta. RN-06/RN-07 no son atómicas (fuera de alcance).
- **Pendiente / siguiente paso:**
  - A: mergear PR #7 (backend 002) y luego el de esta rama; después spec 005 T1.
  - B: spec 002 T7–T10 y luego spec 003 T5 (si `crearReserva` falla con 409
    `BLOQUE_OCUPADO`: mostrar "Alguien acaba de reservar este bloque" y recargar
    la grilla; test CA-13 en `frontend/test/ReservarBloque.test.tsx`).
- **Bloqueos / preguntas para la otra persona:** ninguno. Esta rama parte de
  `feat/002-back` (PR #7): mergear el #7 primero.

## 2026-10-20 18:50 — B (Codex) — rama `fix/001-error-api-comprensible`

- **Spec/tareas:** 001 · Corrección de manejo de errores para CA-04.
- **Hecho:**
  - Actualizado `frontend/src/api.ts` para mostrar un mensaje comprensible cuando la respuesta de error no contiene un `mensaje` válido.
  - Añadidas pruebas en `frontend/test/api.test.ts` para HTTP 500 sin cuerpo, error con mensaje válido y HTTP 502 con `{ error: "Bad Gateway" }`.
  - Ejecutado `npm run check`: verificaciones de specs y skills, TypeScript y pruebas completadas correctamente.
- **Estado de check:** verde; backend 34/34 pruebas y frontend 8/8 pruebas.
- **Decisiones:** no se modifica `docs/api/openapi.yaml`. `DESCONOCIDO` se conserva como identificador interno para errores inesperados, no como código oficial del contrato.
- **Pendiente / siguiente paso:**
  - Revisar `frontend/src/api.ts` y `frontend/test/api.test.ts`.
  - Ejecutar `npm run check`.
  - Completar la revisión del cambio, crear el commit y abrir un PR hacia `main`.
- **Bloqueos / preguntas para la otra persona:** ninguno identificado.

## 2026-10-20 19:45 — A (Claude Code) — rama `feat/005-terraform`
- **Spec/tareas:** 005 · T1, T3, T4, T5, T6, T7, T9
- **Hecho:** Terraform completo: `infra/bootstrap/` (bucket del estado + OIDC +
  rol de GitHub) e `infra/` (DynamoDB, EC2 t4g.micro con nginx + Node + systemd,
  IP elástica, bucket de artefactos, IAM). Backend empaquetado para Node
  (`dist/server.mjs`). CI valida Terraform (job `infra`) y muestra el plan en
  PRs; `deploy.yml` reescrito (check → OIDC → apply → S3 → SSM → /api/health).
  Docs actualizadas. `infra/template.yaml` y `backend/src/lambda.ts` borrados.
- **Estado de check:** verde (backend 34/34, frontend 8/8). `terraform fmt` y
  `validate` en verde en ambos directorios. Nada aplicado todavía en AWS.
- **Decisiones:** Node 22.12.0 desde nodejs.org (AL2023 no trae `node` en la ruta
  estándar); el bundle ESM necesita el banner `createRequire` (sin él falla con
  "Dynamic require"; verificado ejecutándolo fuera del repo). `ignore_changes = [ami]`
  para que una AMI nueva no reemplace la EC2. Un comando en el despliegue
  (`desplegar-reserva-labs`) queda instalado en la EC2 por el arranque.
- **Pendiente / siguiente paso:**
  - A: T2 — `cd infra/bootstrap && terraform init && terraform apply` y crear las
    variables de GitHub (`infra/bootstrap/README.md`). Luego T10: `DESPLIEGUE_ACTIVO=true`
    y ejecutar el workflow Despliegue.
  - B: T8 — en `frontend/vite.config.ts` y `frontend/AGENTS.md`, cambiar las
    menciones a CloudFront/API Gateway por nginx en la EC2.
- **Bloqueos / preguntas para la otra persona:** ninguno.

## 2026-10-20 20:45 — A (Claude Code) — rama `feat/002-003-front`
- **Spec/tareas:** 002 · T8–T11 · 003 · T5–T6 · 005 · T8 (todas de B, hechas por A a pedido de A)
- **Hecho:** Frontend de reservas: `CodigoAlumno` (CA-08), `ReservarBloque` +
  `GrillaBloques` (CA-09, CA-10; sin domingos, P2), aviso de 409
  `BLOQUE_OCUPADO` con recarga (CA-13). Lectura segura de `localStorage`
  (`src/codigoAlumno.ts`), pendiente de la revisión del PR #13 (que se mergeó
  sin bitácora). Comentarios de CloudFront en `frontend/` actualizados.
  Specs 002 y 003 marcadas **Implementadas**.
- **Estado de check:** verde (backend 34/34, frontend 20/20).
- **Decisiones:** A pidió completar todas las tareas pendientes, incluidas las
  de B, antes del primer despliegue; se editó `frontend/` con esa autorización.
  La grilla muestra "No disponible" tanto si está ocupado como si ya no es
  reservable (P1 y P3 de la 002). Fecha por defecto: hoy en Lima, o el lunes si es domingo.
- **Pendiente / siguiente paso:** spec 004 completa en `feat/004-mis-reservas`
  (siguiente PR). Luego despliegue (spec 005, T10).
- **Bloqueos / preguntas para la otra persona:** B, revisa por favor
  `ReservarBloque.tsx` y `MisReservas.tsx`: ahora son tuyos para mantener.

## 2026-10-20 20:50 — A (Claude Code) — rama `feat/004-mis-reservas`
- **Spec/tareas:** 004 · T1–T5 (backend era de B; hecho por A a pedido de A)
- **Hecho:** Spec 004 aprobada (P1–P3 respondidas), planificada e implementada:
  `GET /api/reservas/mias` (CA-14), `DELETE /api/reservas/:id` (CA-15),
  RN-08…RN-10, repos `obtener`/`eliminar`/`delUsuarioDesde` (memoria y
  DynamoDB), sección `MisReservas` con confirmación (CA-16) y recarga cruzada
  con la grilla (CA-17). Spec **Implementada**. Prueba de punta a punta con
  los builds de producción (`vite preview` + `dist/server.mjs`): reservar 201,
  doble reserva 409, mis reservas, cancelar ajena 403, cancelar propia 204.
- **Estado de check:** verde (backend 47/47, frontend 27/27).
- **Decisiones:** orden de errores al cancelar 401 → 404 → 403 → 422 (P3) para
  no revelar horarios ajenos; 60 minutos exactos sí permiten cancelar (P2).
- **Pendiente / siguiente paso:**
  - A: mergear en orden #12 (Terraform) → PR de `feat/002-003-front` → PR de
    esta rama; el merge del #12 hace el primer despliegue (spec 005, T10).
  - B: spec 005 T11 (verificar CA-21, CA-23, CA-24 en `docs/informe/experimentos.md`)
    y T12 (demo CA-22 con dos celulares) cuando la app esté en AWS.
- **Bloqueos / preguntas para la otra persona:** ninguno.
