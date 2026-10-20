# src/repos

Acceso a datos detrás de interfaces (puertos). Dos implementaciones:

- `memoria.ts` → desarrollo local y tests (sin AWS).
- `dynamo.ts` → producción. Se activa cuando existe la variable `TABLA_RESERVAS`.

El modelo de datos en DynamoDB está en `docs/arquitectura.md`.
No cambiar las claves de la tabla sin un ADR nuevo en `docs/adr/`.
