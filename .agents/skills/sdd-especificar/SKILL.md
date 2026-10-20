---
name: sdd-especificar
description: Crea o modifica una spec (specs/NNN-*/spec.md) a partir de lo que pide la persona. Úsala cuando pidan una funcionalidad nueva, cambiar una regla de negocio, responder una pregunta abierta o "escribir/ajustar la spec". No escribe código.
---

# Especificar (SDD, paso 1)

Objetivo: dejar una `spec.md` clara, verificable y sin decisiones técnicas.

## Pasos

1. Lee `specs/CONSTITUCION.md`, `specs/README.md` y las specs existentes para
   no duplicar ni contradecir nada.
2. Si es una spec nueva: copia `specs/_plantillas/spec.md` a
   `specs/NNN-nombre-corto/spec.md` usando el siguiente número libre.
3. Redacta **qué** y **por qué**, nunca **cómo** (nada de nombres de
   archivos, librerías ni tablas: eso va en el plan).
4. Criterios de aceptación en formato *Dado / cuando / entonces*, numerados
   con el siguiente `CA-xx` libre de todo el proyecto.
5. Reglas de negocio con el siguiente `RN-xx` libre (búscalo con
   `grep -rho "RN-[0-9]*" specs | sort -u`), cada una con su código de error
   del contrato. Si el código de error no existe en `docs/api/openapi.yaml`,
   dilo explícitamente: hará falta un PR de contrato.
6. Todo lo dudoso va a **Preguntas abiertas** (`P1`, `P2`…). **No inventes
   respuestas**: pregúntale a la persona.
7. Deja `Estado: Borrador`. Solo la persona la cambia a `Aprobada`, tras
   revisión de la otra persona en un PR.
8. Actualiza el índice de `specs/README.md`.
9. Corre `npm run check:specs`.
10. Sugiere el commit: `docs(NNN): ...` en una rama `spec/NNN-...`.
