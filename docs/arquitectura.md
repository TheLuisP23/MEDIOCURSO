# Arquitectura

## Vista general

Infraestructura descrita con Terraform en `infra/` (ADR 0002):

```
                   ┌─────────────────── AWS ───────────────────────────────┐
Navegador ──HTTP──▶│ IP elástica ─▶ EC2 (Amazon Linux 2023, t4g.micro)     │
                   │                 nginx ─┬─ /*     ─▶ build de frontend/ │
                   │                        └─ /api/* ─▶ Node (backend/,    │
                   │                                     Hono, systemd)     │
                   │                                          │             │
                   │                                       DynamoDB         │
                   │                                                        │
                   │ S3: estado de Terraform · artefactos de cada versión   │
                   └────────────────────────────────────────────────────────┘
GitHub Actions ──OIDC──▶ terraform apply · sube la versión a S3 · SSM a la EC2
```

- **Un solo origen** (el de la EC2): el front llama a `/api/...` relativo,
  así no hay CORS ni URLs que configurar. En local, Vite hace el mismo papel
  con su proxy (`frontend/vite.config.ts`).
- **Sin router en el front**: es una sola página. nginx devuelve `index.html`
  para rutas desconocidas, pero se siguen usando secciones o pestañas, no
  rutas tipo `/mis-reservas`.
- **Sin SSH**: la EC2 solo abre el puerto 80; se administra con SSM.

## Repositorio (monorepo)

| Carpeta       | Qué contiene | Dueño por defecto |
|---------------|--------------|-------------------|
| `specs/`      | Constitución y specs SDD | Ambos |
| `docs/api/`   | Contrato OpenAPI | Ambos (PR revisado por el otro) |
| `backend/`    | API Hono (Node 22) que corre local o en la EC2 | A |
| `frontend/`   | React + Vite | B |
| `infra/`      | Terraform (EC2, DynamoDB, S3, IAM) y `bootstrap/` | A |
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

Tabla `Reservas` (definida en `infra/dynamodb.tf`; en AWS se llama `reserva-labs-reservas`):

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
