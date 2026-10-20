# Constitución del proyecto

Principios que **ninguna spec, plan ni agente puede violar**. Si una spec choca
con la constitución, gana la constitución. Cambiarla requiere PR aprobado por
ambos integrantes y un ADR en `docs/adr/`.

## Art. 1 — La spec es la fuente de verdad
El código expresa la spec. Si el código y la spec no coinciden, el código está
mal. Para cambiar comportamiento, **primero** se cambia la spec (en un PR) y
después el código.

## Art. 2 — El contrato va primero
`docs/api/openapi.yaml` es el único acuerdo entre backend y frontend.
Ninguna ruta, campo ni código de error existe si no está en el contrato.
Cambiar el contrato es un PR propio, revisado por la otra persona.

## Art. 3 — Los tests son el juez
- Cada criterio de aceptación (`CA-xx`) tiene al menos un test.
- Cada regla de negocio (`RN-xx`) tiene al menos un test **cuyo nombre incluye
  el código** (ej. `it("RN-05: rechaza un bloque ya ocupado")`).
- `npm run check` debe pasar antes de cada commit (lo fuerza el hook de pre-commit)
  y en cada PR (lo fuerza el CI).

## Art. 4 — Dominio puro
Las reglas de negocio viven en `backend/src/dominio/` sin depender de Hono,
AWS ni del reloj del sistema (la hora actual se pasa como parámetro).

## Art. 5 — Nadie empuja a `main`
Todo cambio entra por rama + Pull Request + CI en verde + revisión de la otra
persona. Ramas: `spec/NNN-...` (cambios de spec), `feat/NNN-...` (código),
`fix/...`, `chore/...`.

## Art. 6 — Traspaso obligatorio
Al terminar una sesión de trabajo (humano o agente) se actualiza
`BITACORA.md` y las casillas de `tasks.md`. El repo debe bastar para que la
otra persona —o su agente— continúe **sin preguntar nada por chat**.

## Art. 7 — Simplicidad
- Nada fuera del alcance de una spec aprobada.
- Ninguna dependencia nueva sin justificarla en el plan o en un ADR.
- Preferir código aburrido y legible a código ingenioso.

## Art. 8 — Nube sin sorpresas
Toda la infraestructura está en `infra/template.yaml` (AWS SAM). No se crean
recursos a mano en la consola. Diseño serverless para costo cercano a cero.

## Art. 9 — Idioma y estilo
- Identificadores, comentarios, specs y commits **en español**.
- Commits con formato convencional y número de spec:
  `feat(002): crear reserva`, `fix(003): ...`, `docs(002): ...`, `chore: ...`.
- Hora de negocio: **America/Lima (UTC−5, sin horario de verano)**.
