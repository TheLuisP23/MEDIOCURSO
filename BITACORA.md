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
