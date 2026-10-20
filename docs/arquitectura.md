# Arquitectura

## Vista general

```
                    ┌────────────── AWS ───────────────────────────────────┐
Navegador ──HTTPS──▶│ CloudFront ─┬─ /*     ─▶ S3 (build de frontend/)      │
                    │             └─ /api/* ─▶ API Gateway HTTP ─▶ Lambda   │
                    │                                      (backend/, Hono) │
                    │                                           │           │
                    │                                      DynamoDB         │
                    └───────────────────────────────────────────────────────┘
```

- **Un solo dominio** (el de CloudFront): el front llama a `/api/...` relativo,
  así no hay CORS ni URLs que configurar. En local, Vite hace el mismo papel
  con su proxy (`frontend/vite.config.ts`).
- **Sin router en el front**: es una sola página. No usar rutas tipo
  `/mis-reservas` (CloudFront no las conoce); usar secciones o pestañas.

## Repositorio (monorepo)

| Carpeta       | Qué contiene | Dueño por defecto |
|---------------|--------------|-------------------|
| `specs/`      | Constitución y specs SDD | Ambos |
| `docs/api/`   | Contrato OpenAPI | Ambos (PR revisado por el otro) |
| `backend/`    | API Hono (Node 22) que corre local o en Lambda | A |
| `frontend/`   | React + Vite | B |
| `infra/`      | Plantilla AWS SAM | A |
| `.agents/skills/`, `AGENTS.md` | Harness compartido | Ambos |

## Backend por capas

```
rutas/  (HTTP: valida, traduce errores a códigos)
   │
dominio/ (reglas RN puras, sin AWS, reloj inyectado)
   │
repos/  (interfaz) ──┬── memoria.ts  (local y tests)
                     └── dynamo.ts   (producción, si existe TABLA_RESERVAS)
```

## Modelo de datos en DynamoDB

Tabla `Reservas` (definida en `infra/template.yaml`):

| Atributo       | Tipo | Ejemplo | Nota |
|----------------|------|---------|------|
| `pk`           | S    | `LAB-101.2026-11-05.10` | **Clave primaria** = id de la reserva |
| `laboratorioId`| S    | `LAB-101` | |
| `fecha`        | S    | `2026-11-05` | |
| `hora`         | S    | `10:00` | |
| `usuario`      | S    | `20231234` | Clave de partición del GSI |
| `fechaHora`    | S    | `2026-11-05T10:00` | Clave de orden del GSI |
| `creadaEn`     | S    | ISO 8601 | |

Índice secundario global **`porUsuario`**: `usuario` (HASH) + `fechaHora` (RANGE).

### Patrones de acceso

| Necesidad | Operación |
|-----------|-----------|
| Disponibilidad de un lab en un día | `BatchGetItem` de los 15 `pk` posibles del día |
| Crear reserva sin doble reserva (RN-05) | `PutItem` con `ConditionExpression: attribute_not_exists(pk)` → si falla: `409 BLOQUE_OCUPADO` |
| Reservas de un usuario en un día (RN-06, RN-07) | `Query` en `porUsuario` con `begins_with(fechaHora, fecha)` |
| Mis reservas futuras | `Query` en `porUsuario` con `fechaHora >= ahora` |
| Cancelar | `DeleteItem` por `pk` (tras verificar dueño) |

**Por qué el id es la clave:** como el id se construye con laboratorio + fecha +
hora, dos reservas del mismo bloque tienen el *mismo* id, y la escritura
condicional de DynamoDB garantiza que solo una gana, aunque lleguen en el mismo
milisegundo. Eso es RN-05 resuelto por la nube, no por el código.
