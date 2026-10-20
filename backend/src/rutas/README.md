# src/rutas

Un archivo por recurso (`laboratorios.ts`, `reservas.ts`). Cada uno exporta
una función que recibe sus dependencias (repos, reloj) y devuelve un `Hono`.
Las rutas solo traducen HTTP ⇄ dominio: validan entrada, llaman al dominio,
devuelven el código y el cuerpo exactos que dice `docs/api/openapi.yaml`.
