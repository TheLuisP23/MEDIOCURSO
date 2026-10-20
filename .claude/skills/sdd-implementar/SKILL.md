---
name: sdd-implementar
description: Implementa la siguiente tarea pendiente de una spec (tasks.md) con test primero. Úsala cuando pidan "implementa", "continúa", "sigue con la spec NNN" o "haz la tarea Tn".
---

# Implementar (SDD, paso 3)

## Pasos

1. Ubícate: lee la última entrada de `BITACORA.md`, `git status` y
   `git log --oneline -10`. Identifica la spec y la **primera tarea sin marcar
   cuyo dueño sea la persona con la que trabajas** (pregunta si es A o B si no
   lo sabes y no se deduce de la bitácora ni de la rama).
2. Verifica que estás en una rama `feat/NNN-...`, nunca en `main`.
3. Lee la spec, el plan y el `AGENTS.md` de la carpeta que vas a tocar.
4. **Primero el test**: escribe el/los tests de la tarea (nombres con `CA-xx`
   o `RN-xx:`). Córrelos y confirma que fallan por la razón correcta.
5. Implementa lo mínimo para que pasen. Respeta el contrato al pie de la letra.
6. Corre `npm run check`. Si falla, corrige; nunca desactives tests.
7. Marca la tarea `[x]` en `tasks.md`.
8. Haz commit con mensaje `feat(NNN): Tn descripción` (o `test(NNN)`, `fix(NNN)`).
9. ¿Quedan tareas tuyas y la persona quiere seguir? Repite. Si no, ejecuta la
   skill `traspaso`.

## Si algo no cuadra

Si la spec es ambigua, contradice al contrato o falta algo: **no improvises**.
Detente, explica el problema y propone el cambio a la spec (skill
`sdd-especificar`).
