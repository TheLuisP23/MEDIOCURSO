---
name: sdd-planificar
description: Genera plan.md y tasks.md para una spec con estado Aprobada. Úsala cuando pidan "planifica la spec NNN", "divide en tareas" o antes de implementar una spec que no tenga tasks.md.
---

# Planificar (SDD, paso 2)

## Precondiciones

- La spec existe y dice `Estado: Aprobada`. Si dice `Borrador`, detente y avisa.
- No hay preguntas abiertas sin respuesta que afecten al diseño. Si las hay,
  lístalas y detente.

## Pasos

1. Lee la spec, `specs/CONSTITUCION.md`, `docs/arquitectura.md`,
   `docs/api/openapi.yaml` y los `AGENTS.md` de `backend/` y `frontend/`.
2. Usa `specs/001-laboratorios/plan.md` y `tasks.md` como **ejemplo de nivel
   de detalle**.
3. Escribe `plan.md` desde `specs/_plantillas/plan.md`:
   - archivos a crear/modificar en backend y frontend;
   - una función de dominio por cada `RN-xx`;
   - cambios en repos (memoria **y** DynamoDB) respetando `docs/arquitectura.md`;
   - tabla de tests que cubra **todos** los `CA-xx` y `RN-xx` de la spec.
4. Escribe `tasks.md` desde `specs/_plantillas/tasks.md`:
   - tareas pequeñas (≤ 1 hora cada una), cada una commiteable con check en verde;
   - formato exacto: `- [ ] T<n> [B|F|D] descripción (dueño: A|B)`;
   - asigna dueño según la línea `Dueños:` de la spec;
   - ordena para que backend y frontend puedan avanzar **en paralelo** (el
     front trabaja contra el contrato con `fetch` simulado).
5. Si el plan requiere cambiar el contrato o agregar dependencias, sepáralo en
   una tarea `[D]` explícita al inicio.
6. Cambia el estado de la spec a `En curso` y corre `npm run check:specs`.
7. Sugiere commit `docs(NNN): plan y tareas`.
