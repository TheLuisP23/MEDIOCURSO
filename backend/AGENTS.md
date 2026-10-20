# AGENTS.md — backend/

Complementa al `AGENTS.md` de la raíz (léelo primero).

## Stack

Node 22 · TypeScript estricto · Hono · Vitest · AWS SDK v3 (DynamoDB).
El mismo `crearApp()` corre en local (`src/server.ts`) y en Lambda (`src/lambda.ts`).

## Estructura obligatoria

```
src/
  app.ts           crearApp(deps?) — registra rutas bajo /api
  dominio/         reglas RN puras. Sin Hono, sin AWS, reloj como parámetro
  repos/           interfaz + memoria.ts + dynamo.ts
  rutas/           un archivo por recurso; solo HTTP ⇄ dominio
test/              *.test.ts — usa crearApp(...).request() con repos en memoria
```

## Convenciones

- Errores de negocio: lanza/retorna un `ErrorNegocio(codigo, mensaje, status)`
  y tradúcelo en un único `app.onError`. Los códigos son los del enum `Error`
  de `docs/api/openapi.yaml`; los mensajes, en español y entendibles por un alumno.
- Inyección de dependencias: `crearApp({ repoReservas, ahora })`. Por defecto
  usa memoria y `() => new Date()`. Si existe `process.env.TABLA_RESERVAS`, usa DynamoDB.
- Hora de negocio America/Lima (UTC−5 fijo): para el instante de un bloque usa
  `new Date(\`${fecha}T${hora}:00-05:00\`)`.
- Modelo de DynamoDB y patrones de acceso: `docs/arquitectura.md`. No los cambies sin ADR.
- No agregues dependencias sin justificarlas en el `plan.md` de la spec.
