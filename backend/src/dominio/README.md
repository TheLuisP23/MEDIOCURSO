# src/dominio

Reglas de negocio **puras**: sin Hono, sin AWS, sin `Date.now()` escondido
(la hora actual se recibe como parámetro para poder testear).

Cada regla `RN-xx` de una spec debe tener aquí una función y, en `test/`,
al menos un test cuyo nombre incluya el código `RN-xx`.
