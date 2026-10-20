# Specs (Spec-Driven Development)

Cada funcionalidad vive en una carpeta `NNN-nombre/` con hasta tres archivos:

| Archivo    | Responde a…                | Lo escribe…                           |
|------------|----------------------------|---------------------------------------|
| `spec.md`  | **Qué** y **por qué**      | Humanos (con ayuda del agente)        |
| `plan.md`  | **Cómo** (diseño técnico)  | El agente, revisado por un humano     |
| `tasks.md` | **Pasos** con casillas     | El agente; se marcan al avanzar       |

## Flujo

```
CONSTITUCION.md ─┐
                 ▼
  spec.md ──(PR + revisión)──▶ plan.md + tasks.md ──(PR)──▶ implementación ──(PR + CI)──▶ main
     ▲                                                              │
     └──────────── si algo no cuadra, se corrige la spec ◀──────────┘
```

Los agentes tienen una *skill* para cada paso (ver `.agents/skills/`):
`sdd-especificar` → `sdd-planificar` → `sdd-implementar` → `traspaso`,
y `revisar-pr` para revisar el trabajo de la otra persona.

## Estados de una spec

`Borrador` → `Aprobada` (se puede planificar) → `En curso` → `Implementada`.

Cuando una spec pasa a **Implementada**, `npm run check:specs` exige que todas
sus tareas estén marcadas y que cada `RN-xx` tenga un test que lo mencione.

## Índice

| Spec | Tema                          | Estado    |
|------|-------------------------------|-----------|
| 001  | Listado de laboratorios       | Aprobada  |
| 002  | Disponibilidad y crear reserva| En curso  |
| 003  | Conflictos y concurrencia     | En curso  |
| 004  | Mis reservas y cancelación    | Borrador  |
| 005  | Despliegue en AWS (EC2 + Terraform) | En curso  |

Plantillas en `_plantillas/`.
