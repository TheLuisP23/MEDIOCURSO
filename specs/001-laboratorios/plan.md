# Plan — Spec 001

## Resumen técnico

El catálogo es una constante en el dominio del backend. Una ruta Hono lo expone
en `GET /api/laboratorios`. El frontend agrega `api.laboratorios()` y un
componente `ListaLaboratorios` con estados cargando / error / datos.
Backend y frontend pueden trabajarse **en paralelo** porque el contrato ya
existe en `docs/api/openapi.yaml`.

## Backend

- `src/dominio/laboratorios.ts`: tipo `Laboratorio` y constante
  `CATALOGO_LABORATORIOS` (ordenada por id) + función `buscarLaboratorio(id)`
  (la usará la spec 002).
- `src/rutas/laboratorios.ts`: `rutasLaboratorios()` devuelve un `Hono` con
  `GET /` → `c.json(CATALOGO_LABORATORIOS)`.
- `src/app.ts`: `app.route("/laboratorios", rutasLaboratorios())`.

## Frontend

- `src/tipos.ts`: tipo `Laboratorio` (copiado del contrato).
- `src/api.ts`: `laboratorios: () => pedir<Laboratorio[]>("/laboratorios")`.
- `src/componentes/ListaLaboratorios.tsx`: muestra tarjetas; estado de carga;
  en error, mensaje + botón **Reintentar** que vuelve a pedir.
- `src/App.tsx`: renderiza `<ListaLaboratorios />` debajo del encabezado.

## Tests

| Qué se prueba | Archivo | Cubre |
|---------------|---------|-------|
| Responde 200 con 4 labs ordenados | `backend/test/laboratorios.test.ts` | CA-01 |
| Cada lab tiene los 4 campos válidos | `backend/test/laboratorios.test.ts` | CA-02 |
| Muestra una tarjeta por lab | `frontend/test/ListaLaboratorios.test.tsx` | CA-03 |
| Error + Reintentar vuelve a llamar | `frontend/test/ListaLaboratorios.test.tsx` | CA-04 |
| Indicador de carga | `frontend/test/ListaLaboratorios.test.tsx` | CA-05 |

## Riesgos y decisiones

- El frontend no espera al backend: en sus tests simula `fetch` con los datos
  del catálogo de la spec.
