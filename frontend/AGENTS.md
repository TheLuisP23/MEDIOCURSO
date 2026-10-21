# AGENTS.md — frontend/

Complementa al `AGENTS.md` de la raíz (léelo primero).

## Stack

React 19 · TypeScript estricto · Vite · Vitest + Testing Library (jsdom).
Sin librerías de UI ni de estado: `useState`/`useEffect` y CSS simple en `src/estilos.css`.

## Estructura obligatoria

```
src/
  api.ts           ÚNICO lugar que hace fetch. Rutas relativas /api/...
  tipos.ts         tipos copiados de docs/api/openapi.yaml
  componentes/     un componente por archivo, nombre en PascalCase
  App.tsx          compone las secciones (sin router)
test/              *.test.tsx — simula fetch con vi.stubGlobal
```

## Convenciones

- **No hay router**: una sola página con secciones (ver `docs/arquitectura.md`).
- Todo componente que llama a la API muestra los estados: cargando, error
  (con el `mensaje` del `ErrorApi`) y datos/vacío.
- El código de alumno se guarda en `localStorage` con la clave `codigoAlumno`
  y se envía como cabecera `X-Usuario` desde `api.ts`.
- Los tests **no** dependen del backend: simulan `fetch` con datos que cumplan
  el contrato. Busca elementos por texto o rol, no por clases CSS.
- Accesibilidad mínima: botones con texto, `aria-label` en controles sin texto,
  `role="status"` / `role="alert"` para mensajes.
