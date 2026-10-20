---
name: traspaso
description: Cierra una sesión de trabajo dejando el repo listo para que la otra persona o su agente continúe sin preguntar nada. Úsala SIEMPRE antes de terminar, al pausar a medias, o cuando pidan "deja todo listo", "handoff" o "voy a subir".
---

# Traspaso (handoff)

La otra persona usa **otro agente** (Claude Code ↔ Codex) y no ve tu chat.
Lo único que viaja entre ustedes es el repositorio. Escribe para ella.

## Pasos

1. Corre `npm run check` y anota si quedó en verde o en rojo (y por qué).
2. Revisa `tasks.md` de la spec: marca `[x]` lo terminado. Si una tarea quedó
   **a medias**, déjala `[ ]` y agrega al final de su línea:
   `— EN CURSO: <qué falta exactamente>`.
3. Agrega una entrada **al final** de `BITACORA.md` con el formato de su
   encabezado. En "Pendiente / siguiente paso" escribe una instrucción que
   se pueda ejecutar tal cual (archivo, función, test que falta).
4. Si tomaste una decisión que no está en la spec ni en el plan, anótala en
   "Decisiones" y, si es importante, propone un ADR.
5. Si descubriste un error recurrente del agente, agrega una línea en
   "Lecciones aprendidas" de `AGENTS.md`.
6. Commit: `chore(NNN): traspaso` (o inclúyelo en el último commit).
7. Recuérdale a la persona: `git push` de la rama y, si la spec está completa,
   abrir el Pull Request.
