# AGENTS.md — Guía para agentes de IA (Claude Code, Codex y cualquier otro)

Este archivo lo leen **todos** los agentes al iniciar. Claude Code lo carga a
través de `CLAUDE.md`; Codex lo lee directamente. Es la única fuente de reglas:
no dupliques reglas en otros archivos de configuración de agentes.

## Qué es este proyecto

Sistema web para **reservar laboratorios** de la universidad por bloques de una
hora. Monorepo: `backend/` (API Hono en Node 22, corre local o en una EC2) y
`frontend/` (React + Vite). Se despliega en AWS con Terraform (`infra/`) y
GitHub Actions.
Lo desarrollan dos personas: **A** (usa Claude Code) y **B** (usa Codex).

## Antes de hacer cualquier cosa, lee en este orden

0. Ejecuta `npm run contexto` (rama, cambios, commits recientes y última entrada
   de la bitácora en un solo resumen). En Claude Code ya se ejecutó solo al
   iniciar la sesión.
1. `BITACORA.md` — la **última entrada** dice en qué quedó el trabajo y qué sigue.
2. `specs/CONSTITUCION.md` — reglas no negociables.
3. La spec en la que vas a trabajar: `specs/NNN-*/spec.md`, `plan.md`, `tasks.md`.
4. `docs/api/openapi.yaml` si tocas la API o el cliente HTTP.
5. El `AGENTS.md` de la carpeta donde vas a trabajar (`backend/` o `frontend/`).
6. `git log --oneline -15` y `git status` para ver cambios recientes de la otra persona.

Si la persona te pide "continúa" o "¿qué sigue?" sin más contexto, la respuesta
está en esos archivos: no le pidas que te lo explique.

## Comandos

| Comando | Para qué |
|---------|----------|
| `npm install` | Instalar todo (raíz) |
| `npm run contexto` | Resumen del estado del repo y de la bitácora |
| `npm run dev` | Backend en :3000 y frontend en :5173 |
| `npm run check` | **Sensor principal**: specs + skills + tipos + tests. Debe pasar siempre |
| `npm run test -w backend` / `-w frontend` | Tests de una parte |
| `npm run build` | Build de producción de ambos |
| `npm run sync:skills` | Copia `.agents/skills/` → `.claude/skills/` tras editar una skill |

## Flujo de trabajo (SDD)

Usa las skills de `.agents/skills/` (en Claude Code también están en `.claude/skills/`):

- `sdd-especificar` — crear o modificar una `spec.md`. No escribe código.
- `sdd-planificar` — generar `plan.md` y `tasks.md` desde una spec **Aprobada**.
- `sdd-implementar` — implementar la siguiente tarea pendiente, con test primero.
- `traspaso` — **obligatoria al terminar cualquier sesión**: actualiza `BITACORA.md` y `tasks.md`.
- `revisar-pr` — revisar los cambios de la otra persona contra la spec.

## Reglas duras

- **Nunca** hagas commit ni push a `main`. Trabaja en la rama actual o crea una
  `feat/NNN-descripcion` / `spec/NNN-descripcion`.
- **Nunca** cambies `docs/api/openapi.yaml`, `specs/CONSTITUCION.md` ni
  `infra/` como efecto secundario: solo si la tarea lo pide.
- **Nunca** implementes algo que no esté en una spec Aprobada. Si falta algo,
  propón el cambio a la spec y detente.
- **Nunca** uses `--no-verify` para saltarte el hook de pre-commit.
- No edites la carpeta del otro (`backend/` ↔ `frontend/`) salvo que tu tarea
  esté marcada para esa parte en `tasks.md`.
- Tests: cada `RN-xx` necesita un test cuyo nombre empiece con `RN-xx:`; cada
  `CA-xx`, uno que lo mencione.
- Mensajes de commit en español: `feat(NNN): ...`, `fix(NNN): ...`,
  `docs(NNN): ...`, `test(NNN): ...`, `chore: ...`.
- Si `npm run check` falla, arréglalo antes de seguir. No desactives tests.

## Al resolver conflictos de merge

- En `spec.md` o `CONSTITUCION.md`: **no elijas tú**. Muestra ambas versiones a
  la persona y pregúntale; son decisiones de producto.
- En código: conserva la intención de ambos lados, luego corre `npm run check`.
- En `BITACORA.md`: conserva **todas** las entradas (es un registro, solo se agrega).

## Lecciones aprendidas

Cuando un agente cometa un error que se repite, agrega aquí una regla que lo
evite (una línea, con fecha y spec). El harness mejora con cada error.

- 2026-10-20 (001): En "Pendiente / siguiente paso" de `BITACORA.md` va la próxima tarea de la spec (archivo, función o test), no los pasos de git de la sesión actual (commit, push, abrir PR).
