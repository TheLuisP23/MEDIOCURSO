# Registro de experimentos (para el informe)

Llénenlo **en el momento** en que pasa cada cosa. Guarden capturas en
`docs/informe/capturas/` y enlácenlas aquí.

| # | Experimento | Ronda |
|---|-------------|-------|
| E1 | ¿El agente entiende el proyecto solo con el repo? | 0 |
| E2 | Push directo a `main` | 1 |
| E3 | Rebase con conflicto en archivo compartido (bitácora) | 1 |
| E4 | Push rechazado + conflicto de producto en la spec | 2 |
| E5 | Traspaso Claude Code → Codex sin hablar | 3 |
| E6 | Roles invertidos (cada uno en la carpeta del otro) | 4 |
| E7 | Concurrencia real en AWS (dos celulares, un bloque) | 5 |

---

## E1 — Contexto inicial

- **Pregunta usada:** "Soy la persona A/B. ¿Qué es este proyecto, en qué estado está y qué me toca hacer primero?"
- **Claude Code (A) respondió:**
- **Codex (B) respondió:**
- **¿Qué archivos leyó cada uno?**
- **¿Acertaron la tarea siguiente?**
- **Conclusión / mejora al harness:**

## E2 — Push directo a main

- **Comando:**
- **Mensaje de error (captura):**
- **Conclusión:**

## E3 — Rebase con conflicto en BITACORA.md

- **Quién / comando:**
- **Archivos en conflicto:**
- **Cómo se resolvió:**
- **Mejora al harness aplicada:** `BITACORA.md merge=union` en `.gitattributes`
- **¿Volvió a pasar después?**

## E4 — Push rechazado y conflicto en la spec 002

- **Mensaje del push rechazado (captura):**
- **Mensaje del conflicto (captura):**
- **¿El agente eligió una versión por su cuenta o preguntó?**
- **Decisión final de P1 y P2:**
- **Conclusión:**

## E5 — Traspaso entre agentes

- **Última entrada de bitácora que dejó A:**
- **Prompt de B:** "Continúa con lo que dejó A."
- **Tiempo hasta la primera acción útil:**
- **Archivos que leyó Codex (en orden):**
- **¿Necesitó preguntar algo? ¿Qué?**
- **Errores cometidos:**
- **Qué faltaba en el repo para que fuera perfecto (mejora al harness):**

## E6 — Roles invertidos

- **B en backend con Codex:**
- **A en frontend con Claude Code:**
- **¿Los AGENTS.md por carpeta ayudaron? ¿Qué faltaba?**

## E7 — Concurrencia en AWS

- **URL:**
- **Resultado (quién ganó, qué vio el otro):**
- **Video/captura:**
- **Explicación técnica (escritura condicional en DynamoDB):**

---

## Comparación de agentes (completar al final)

| Aspecto | Claude Code | Codex |
|---------|-------------|-------|
| Lectura de contexto al iniciar | | |
| Respeto a las reglas de AGENTS.md | | |
| Uso de skills | | |
| Calidad de tests | | |
| Manejo de conflictos | | |
| Diferencias de harness (ej. hook SessionStart solo en Claude) | | |
