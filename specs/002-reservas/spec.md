# Spec 002 — Disponibilidad y crear reserva

- **Estado:** Aprobada
- **Dueños:** backend: A · frontend: B
- **Depende de:** 001

## Contexto

El estudiante elige un laboratorio y una fecha, ve qué bloques de una hora
están libres y reserva uno. Esta spec cubre el camino feliz y las validaciones
básicas de fecha y hora. Los conflictos entre reservas (doble reserva,
límites por usuario) son la spec 003.

### Identificación del usuario (sin login)

El estudiante escribe su **código de alumno** una vez; el front lo guarda en
`localStorage` y lo envía en la cabecera `X-Usuario` en cada petición que lo
requiera. Formato válido: 6 a 12 caracteres alfanuméricos.

### Bloques horarios

Bloques de **una hora** que empiezan en punto, de `07:00` a `21:00`
(el último termina 22:00), de **lunes a sábado**. Hora de Lima (UTC−5).

## Historias de usuario

- Como **estudiante**, quiero ver los bloques libres de un laboratorio en una
  fecha para saber cuándo puedo ir.
- Como **estudiante**, quiero reservar un bloque libre para asegurar mi lugar.

## Criterios de aceptación

- **CA-06** — Dado un laboratorio y una fecha válidos, cuando se consulta
  `GET /api/laboratorios/{id}/disponibilidad?fecha=AAAA-MM-DD`, entonces se
  reciben los 15 bloques (07:00…21:00) con `disponible: true|false`.
- **CA-07** — Dado un bloque libre y válido, cuando se hace `POST /api/reservas`
  con `X-Usuario`, entonces responde `201` con la reserva creada y ese bloque
  pasa a `disponible: false`.
- **CA-08** — Dada una petición sin `X-Usuario` o con formato inválido, entonces
  responde `401 NO_AUTORIZADO`.
- **CA-09** — En la UI, el estudiante elige laboratorio y fecha, ve la grilla de
  bloques (libres clicables, ocupados deshabilitados), reserva con un clic y
  ve un mensaje de confirmación; la grilla se actualiza sola.
- **CA-10** — Si la API rechaza la reserva, la UI muestra el `mensaje` del error
  sin perder la selección.

## Reglas de negocio

| Código | Regla | Error si se incumple |
|--------|-------|----------------------|
| RN-01  | El laboratorio debe existir en el catálogo | 404 `LAB_NO_EXISTE` |
| RN-02  | La hora debe ser un bloque válido (`07:00`…`21:00`, en punto) y el día de lunes a sábado | 422 `BLOQUE_INVALIDO` |
| RN-03  | No se puede reservar un bloque que ya empezó o que está en el pasado | 422 `FECHA_PASADA` |
| RN-04  | Solo se puede reservar con hasta 14 días de anticipación (incluido el día 14) | 422 `FUERA_DE_RANGO` |

## Contrato de API

- `GET /api/laboratorios/{id}/disponibilidad?fecha=AAAA-MM-DD`
- `POST /api/reservas`

## Fuera de alcance

- Que dos personas no reserven el mismo bloque → spec 003.
- Ver o cancelar mis reservas → spec 004.
- Login real (Cognito, Google, etc.).

## Preguntas abiertas

- **P1** — En la grilla, ¿un bloque ocupado muestra el código de quien lo
  reservó? → *Respuesta:* No. Solo se muestra "Ocupado": el contrato
  (`Bloque`) no expone al usuario y así no se publican datos de otros alumnos.
- **P2** — ¿La UI permite elegir domingos (y mostrar todo deshabilitado) o el
  selector de fecha los bloquea? → *Respuesta:* El selector no permite elegir
  domingos. La API igual responde los 15 bloques con `disponible: false` si se
  consulta un domingo, y RN-02 rechaza reservarlo.
- **P3** — En la disponibilidad, ¿un bloque libre pero no reservable (ya
  empezó, fuera de los 14 días o en domingo) sale como disponible? →
  *Respuesta:* No: `disponible` es `true` solo si el bloque está libre **y**
  se podría reservar ahora (cumple RN-02, RN-03 y RN-04). Así la grilla nunca
  ofrece un clic que la API va a rechazar.
