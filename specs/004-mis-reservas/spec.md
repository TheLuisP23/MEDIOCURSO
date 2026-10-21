# Spec 004 — Mis reservas y cancelación

- **Estado:** En curso
- **Dueños:** backend: B · frontend: A  ← *roles invertidos a propósito*
- **Depende de:** 002

## Contexto

El estudiante necesita ver sus próximas reservas y cancelar las que ya no
usará, liberando el bloque para otros.

## Historias de usuario

- Como **estudiante**, quiero ver mis reservas futuras ordenadas por fecha.
- Como **estudiante**, quiero cancelar una reserva para liberar el bloque.

## Criterios de aceptación

- **CA-14** — `GET /api/reservas/mias` con `X-Usuario` devuelve solo las
  reservas de ese usuario cuyo bloque aún no termina, ordenadas por fecha y hora.
- **CA-15** — `DELETE /api/reservas/{id}` del dueño responde `204` y el bloque
  vuelve a aparecer como disponible.
- **CA-16** — En la UI, la sección "Mis reservas" lista las reservas con un
  botón **Cancelar** que pide confirmación antes de llamar a la API.
- **CA-17** — Tras cancelar, la lista y la grilla de disponibilidad se actualizan.

## Reglas de negocio

| Código | Regla | Error si se incumple |
|--------|-------|----------------------|
| RN-08  | Solo el dueño de una reserva puede cancelarla | 403 `PROHIBIDO` |
| RN-09  | Solo se puede cancelar hasta 1 hora antes del inicio del bloque | 422 `CANCELACION_TARDIA` |
| RN-10  | Cancelar una reserva inexistente responde error | 404 `RESERVA_NO_EXISTE` |

## Contrato de API

- `GET /api/reservas/mias`
- `DELETE /api/reservas/{id}`

## Fuera de alcance

- Historial de reservas pasadas.
- Notificaciones por correo.

## Preguntas abiertas

- **P1** — ¿Mostrar reservas de hoy que ya terminaron? → *Respuesta:* No (CA-14).
  Un bloque que empezó pero aún no termina **sí** se muestra (no se puede cancelar, RN-09).
- **P2** — ¿"Hasta 1 hora antes" incluye exactamente 60 minutos? → *Respuesta:* Sí:
  se puede cancelar si faltan 60 minutos o más para el inicio del bloque.
- **P3** — Si una petición incumple varias reglas, ¿qué error gana? → *Respuesta:*
  en este orden: sin `X-Usuario` (401) → la reserva no existe (404, RN-10) →
  no es del usuario (403, RN-08) → demasiado tarde (422, RN-09). Así no se
  revela a otros usuarios el horario de una reserva ajena.
