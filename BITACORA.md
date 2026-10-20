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
