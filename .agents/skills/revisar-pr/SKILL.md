---
name: revisar-pr
description: Revisa los cambios de una rama o Pull Request contra su spec, el contrato y la constitución. Úsala cuando pidan "revisa el PR", "revisa lo que hizo mi compañera/o" o antes de aprobar un merge.
---

# Revisar PR

## Pasos

1. Obtén los cambios: `git fetch` y `git diff origin/main...<rama>` (o el PR
   con `gh pr diff <n>` si `gh` está disponible).
2. Identifica la spec por el nombre de la rama o los commits (`(NNN)`).
3. Verifica, en este orden, y reporta cada punto como ✅ / ⚠️ / ❌:
   - **Spec:** cada `CA-xx` y `RN-xx` de la spec tiene implementación y test.
   - **Contrato:** rutas, campos y códigos de error coinciden con `openapi.yaml`.
   - **Constitución:** dominio puro, nada fuera de alcance, sin dependencias
     no justificadas, sin cambios en la carpeta ajena sin tarea.
   - **Harness:** `tasks.md` actualizado y entrada nueva en `BITACORA.md`.
   - **Calidad:** nombres claros, sin código muerto, manejo de errores.
4. Corre `npm run check` sobre la rama.
5. Termina con un veredicto: **Aprobar**, **Aprobar con comentarios** o
   **Pedir cambios**, y una lista corta de cambios concretos.
6. No hagas tú los cambios en la rama ajena salvo que te lo pidan.
