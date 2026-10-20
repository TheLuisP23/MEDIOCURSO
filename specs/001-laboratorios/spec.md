# Spec 001 — Listado de laboratorios

- **Estado:** Implementada
- **Dueños:** backend: A · frontend: B
- **Depende de:** —

## Contexto

Antes de reservar, el estudiante necesita ver qué laboratorios existen, su
capacidad y su equipamiento. Es la spec más simple del proyecto: sirve para que
el equipo practique el flujo completo (spec → plan → tareas → PR) sin reglas
complicadas. Por eso `plan.md` y `tasks.md` ya vienen escritos como ejemplo.

## Historias de usuario

- Como **estudiante**, quiero ver la lista de laboratorios con su capacidad y
  equipamiento para elegir dónde reservar.

## Criterios de aceptación

- **CA-01** — Dado que la API está activa, cuando se hace `GET /api/laboratorios`,
  entonces responde `200` con los 4 laboratorios del catálogo, ordenados por `id`.
- **CA-02** — Dado un laboratorio, cada elemento incluye `id`, `nombre`,
  `capacidad` (entero > 0) y `equipamiento` (lista de textos, puede estar vacía).
- **CA-03** — Dado que el estudiante abre la app, cuando cargan los datos,
  entonces ve una tarjeta por laboratorio con nombre, capacidad y equipamiento.
- **CA-04** — Dado que la API falla, cuando el estudiante abre la app, entonces
  ve un mensaje de error comprensible y un botón **Reintentar**.
- **CA-05** — Mientras se cargan los datos se muestra un indicador de carga.

## Reglas de negocio

No aplica (catálogo fijo, solo lectura).

### Catálogo inicial (fijo en el código, sin base de datos)

| id      | nombre                    | capacidad | equipamiento                              |
|---------|---------------------------|-----------|-------------------------------------------|
| LAB-101 | Laboratorio de Redes      | 30        | Switches Cisco, Routers, Proyector        |
| LAB-102 | Cómputo General           | 40        | PCs i5, Proyector                         |
| LAB-201 | Desarrollo Móvil          | 25        | Macs, Dispositivos Android, Proyector     |
| LAB-202 | Ciencia de Datos          | 20        | PCs con GPU, Pizarra digital              |

## Contrato de API

- `GET /api/laboratorios` → `Laboratorio[]`

## Fuera de alcance

- Crear, editar o borrar laboratorios (no hay panel de administración).
- Fotos de los laboratorios.

## Preguntas abiertas

- **P1** — ¿El catálogo debería vivir en DynamoDB? → *Respuesta:* No por ahora;
  es fijo y va en el código (Art. 7, simplicidad).
