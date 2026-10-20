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
