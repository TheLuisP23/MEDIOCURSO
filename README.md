# Reserva de Laboratorios

Proyecto de medio curso — **Desarrollo de Aplicaciones para la Nube**.
Aplicación web para reservar laboratorios por bloques de una hora, construida
con **Spec-Driven Development (SDD)** y **harness engineering**, por dos
personas con agentes de IA distintos (Claude Code y Codex), y desplegada en
**AWS** con CI/CD desde GitHub.

👉 **Empiecen por [`GUIA_EQUIPO.md`](GUIA_EQUIPO.md)**: quién hace qué, en qué
orden se hacen los commits y push, y qué experimentos documentar.

## Arranque rápido

```bash
git init -b main      # solo quien crea el repo (si se clonó, omitir)
npm install
npm run check         # specs + skills + tipos + tests
npm run dev           # API en http://localhost:3000/api · web en http://localhost:5173
```

Requiere Node.js 24 LTS y Git.

## Estructura

```
reserva-labs/
├── AGENTS.md              ← reglas para TODOS los agentes (Codex lo lee directo)
├── CLAUDE.md              ← solo importa AGENTS.md (para Claude Code)
├── BITACORA.md            ← traspaso entre sesiones: "en qué quedé, qué sigue"
├── GUIA_EQUIPO.md         ← guion de trabajo de A y B
├── specs/
│   ├── CONSTITUCION.md    ← principios no negociables
│   ├── 001-laboratorios/  ← spec + plan + tareas (ejemplo completo)
│   ├── 002-reservas/      ← specs listas para planificar…
│   ├── 003-conflictos/
│   ├── 004-mis-reservas/
│   ├── 005-despliegue-aws/
│   └── _plantillas/
├── docs/
│   ├── api/openapi.yaml   ← contrato único back ⇄ front
│   ├── arquitectura.md    ← capas, modelo DynamoDB, patrones de acceso
│   ├── despliegue.md      ← cómo activar el despliegue a AWS
│   ├── adr/               ← decisiones de arquitectura
│   └── informe/           ← registro de experimentos para el informe
├── backend/               ← API Hono (Node 22) · local o AWS Lambda
│   └── AGENTS.md
├── frontend/              ← React + Vite
│   └── AGENTS.md
├── infra/template.yaml    ← AWS SAM: Lambda, API Gateway, DynamoDB, S3, CloudFront
├── .agents/skills/        ← skills compartidas (Codex) ─┐ sincronizadas con
├── .claude/skills/        ← copia para Claude Code ─────┘ npm run sync:skills
├── .claude/settings.json  ← permisos y hook de inicio de sesión de Claude Code
├── .husky/pre-commit      ← corre npm run check antes de cada commit
└── .github/workflows/     ← CI (cada push/PR) y Despliegue (merge a main)
```

## El harness, pieza por pieza

Un agente = modelo + harness. El harness tiene **guías** (le dicen qué hacer
antes de actuar) y **sensores** (detectan cuando se equivocó para que corrija).

| Pieza | Tipo | Claude Code | Codex |
|-------|------|:-----------:|:-----:|
| `AGENTS.md` raíz y por carpeta | Guía | ✅ (vía `CLAUDE.md`) | ✅ |
| Constitución + specs + contrato | Guía | ✅ | ✅ |
| Skills `sdd-*`, `traspaso`, `revisar-pr` | Guía | ✅ `.claude/skills` | ✅ `.agents/skills` |
| `BITACORA.md` + `npm run contexto` | Memoria | ✅ automático (hook) | ✅ lo indica AGENTS.md |
| Permisos (no push a main, no `--no-verify`) | Límite | ✅ `.claude/settings.json` | ⚠️ solo por reglas de texto |
| Tests + `tsc` | Sensor | ✅ | ✅ |
| `check:specs` (trazabilidad spec → test) | Sensor | ✅ | ✅ |
| Hook pre-commit (Husky) | Sensor | ✅ | ✅ |
| CI en GitHub + protección de `main` | Sensor | ✅ | ✅ |

Las diferencias (⚠️) son material para el informe: los sensores que viven en
Git y en el CI aplican igual a cualquier agente; los que viven en la
configuración de un agente, no.

## Scripts

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Backend + frontend en local |
| `npm run check` | Todo lo que debe estar verde antes de un commit |
| `npm run contexto` | Resumen del estado del repo y de la bitácora |
| `npm run build` | Build de producción (Lambda + sitio estático) |
| `npm run sync:skills` | Copia `.agents/skills` → `.claude/skills` |
