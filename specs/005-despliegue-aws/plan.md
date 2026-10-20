# Plan — Spec 005

## Resumen técnico

Terraform crea una EC2 (Amazon Linux 2023, ARM, `t4g.micro`) con IP elástica,
la tabla DynamoDB `Reservas` (mismo esquema que hoy) y un bucket S3 de
artefactos. En la EC2, **nginx** sirve el build del frontend y reenvía `/api/*`
al backend Hono, que corre con Node 22 como servicio **systemd**. GitHub
Actions entra a AWS por **OIDC**, aplica Terraform y publica cada versión
subiendo un `.tar.gz` a S3 y ordenando a la instancia, vía **SSM Run Command**,
que lo descargue y reinicie el servicio. No se abre el puerto 22 ni hay claves
SSH. El estado de Terraform vive en un bucket S3 que crea `infra/bootstrap/`.

## Infraestructura (`infra/`)

### `infra/bootstrap/` — se ejecuta una sola vez, a mano, por A (estado local)

- `main.tf`: proveedor AWS (`~> 6.0`), Terraform `>= 1.10`.
- `estado.tf`: bucket S3 `reserva-labs-tfstate-<cuenta>` con versionado,
  cifrado SSE-S3 y bloqueo de acceso público.
- `github_oidc.tf`: proveedor OIDC `token.actions.githubusercontent.com` y rol
  `reserva-labs-github` cuya confianza solo admite `repo:TheLuisP23/MEDIOCURSO:*`.
  Permisos: `AdministratorAccess` (ver Riesgos).
- `outputs.tf`: `bucket_estado`, `rol_github_arn` (se copian a variables de GitHub).
- `README.md`: los 3 comandos y qué copiar a GitHub.
- El `terraform.tfstate` local del bootstrap **no se sube** (`.gitignore`).

### `infra/` — lo aplica GitHub Actions en cada merge

- `versiones.tf`: Terraform `>= 1.10`, proveedor AWS `~> 6.0`, backend `s3`
  con `use_lockfile = true` (bloqueo nativo de S3, sin tabla extra). El nombre
  del bucket se pasa con `-backend-config` (no se escribe en el código).
- `variables.tf`: `region` (`us-east-1`), `tipo_instancia` (`t4g.micro`),
  `nombre` (`reserva-labs`).
- `dynamodb.tf`: tabla `Reservas` idéntica a la de `docs/arquitectura.md`
  (`pk` HASH, GSI `porUsuario` = `usuario` + `fechaHora`, `PAY_PER_REQUEST`),
  con `prevent_destroy` para no perder reservas (CA-21).
- `artefactos.tf`: bucket S3 privado para los `.tar.gz` de cada versión, con
  expiración a 30 días.
- `red.tf`: VPC por defecto; security group con entrada solo TCP 80 desde
  `0.0.0.0/0` y salida libre.
- `iam.tf`: rol de instancia con `AmazonSSMManagedInstanceCore`, acceso a la
  tabla (GetItem, BatchGetItem, PutItem, DeleteItem, Query sobre tabla e
  índices) y lectura del bucket de artefactos.
- `ec2.tf`: AMI tomada del parámetro SSM público de Amazon Linux 2023 arm64;
  `user_data` desde `arranque.sh.tftpl`; IP elástica asociada; IMDSv2 obligatorio.
- `arranque.sh.tftpl`: instala Node 22 y nginx, crea el usuario `reserva`,
  escribe la configuración de nginx (raíz `/opt/reserva-labs/actual/frontend`,
  `location /api/` → `127.0.0.1:3000`, `try_files ... /index.html`) y la unidad
  systemd `reserva-labs.service` con `TABLA_RESERVAS`, `AWS_REGION` y `PORT=3000`.
- `outputs.tf`: `url_app`, `id_instancia`, `bucket_artefactos`, `tabla_reservas`.
- Se **borra** `infra/template.yaml` (SAM).

## Backend

- `package.json` → `build`: empaquetar `src/server.ts` a `dist/server.mjs`
  **incluyendo** `@aws-sdk/*` (en EC2 no viene preinstalado como en Lambda).
- `src/server.ts`: actualizar comentario (ya no hay Lambda); el código no cambia
  (ya lee `PORT`).
- Se **borra** `src/lambda.ts`.
- `src/app.ts`: actualizar el comentario de CloudFront → nginx.
- Sin dependencias nuevas. Los repos de DynamoDB los traen las specs 002–004.

## Frontend

Sin cambios de código: ya llama a `/api/...` relativo, y nginx sirve ambos en
el mismo origen. Solo se actualizan comentarios que mencionan CloudFront
(`vite.config.ts`, `frontend/AGENTS.md`). nginx usa `try_files` para que la
página única funcione igual que antes.

## GitHub Actions

- `ci.yml`, job `infra` (reemplaza `cfn-lint`):
  `terraform fmt -check -recursive infra` y `terraform init -backend=false` +
  `terraform validate` en `infra/` e `infra/bootstrap/` (**CA-18**). En PRs del
  propio repo, además, `terraform plan` con OIDC y el resultado en el resumen
  del job (**CA-18**). Si `DESPLIEGUE_ACTIVO` no es `true`, el plan se omite.
- `deploy.yml` (reescrito), en push a `main` y manual, con `permissions:
  id-token: write`:
  1. `npm ci`, `npm run check`, `npm run build`: si fallan, el job termina
     antes de tocar AWS (**CA-23**).
  2. `aws-actions/configure-aws-credentials` con `role-to-assume: vars.AWS_ROLE_ARN`.
  3. `terraform init -backend-config="bucket=${{ vars.TF_STATE_BUCKET }}"` y
     `terraform apply -auto-approve`.
  4. Empaquetar `backend/dist` + `frontend/dist` en `version-<sha>.tar.gz` y
     subirlo al bucket de artefactos.
  5. `aws ssm send-command` (AWS-RunShellScript) que descarga, descomprime en
     `/opt/reserva-labs/versiones/<sha>`, mueve el enlace `actual` y reinicia
     el servicio; esperar con `aws ssm wait command-executed` (**CA-19**).
  6. `curl` con reintentos a `http://<ip>/api/health` esperando
     `{"estado":"ok"}` y URL en el resumen del job (**CA-20**).
- Variables de GitHub: `DESPLIEGUE_ACTIVO`, `AWS_REGION`, `AWS_ROLE_ARN`,
  `TF_STATE_BUCKET`. **Ningún secret de AWS.**

## Documentación

- `docs/despliegue.md`: reescrito (bootstrap, variables de GitHub, desplegar a
  mano, apagar y destruir).
- `docs/arquitectura.md`: diagrama nuevo; la tabla "definida en `infra/dynamodb.tf`".
- `AGENTS.md` raíz, `backend/AGENTS.md`, `README.md`: SAM → Terraform.
  En `AGENTS.md` la regla de "no cambiar como efecto secundario" pasa de
  `infra/template.yaml` a `infra/`.

## Tests

La spec es de verificación manual; los CA se verifican con pasos de CI que
llevan el código en el nombre y con evidencias en `docs/informe/experimentos.md`.

| Qué se prueba | Dónde | Cubre |
|---------------|-------|-------|
| `fmt` + `validate` de ambos directorios; `plan` en el PR | `ci.yml`, job `infra` | CA-18 |
| Merge a `main` aplica y publica; SSM termina con éxito | `deploy.yml` | CA-19 |
| `GET /api/health` responde `{"estado":"ok"}` tras desplegar | `deploy.yml` (paso de verificación) | CA-20 |
| Reserva creada sigue tras otro despliegue y tras `terraform apply -replace` de la EC2 | manual, `experimentos.md` | CA-21 |
| Dos celulares, mismo bloque, solo uno gana | manual, `experimentos.md` (requiere spec 003) | CA-22 |
| Un commit con check en rojo no llega a `terraform apply` | manual: rama de prueba, `experimentos.md` | CA-23 |
| `terraform destroy` (sin la tabla) + `apply` desde cero deja la app funcionando | manual, `experimentos.md` | CA-24 |

## Riesgos y decisiones

- **`AdministratorAccess` para el rol de GitHub:** Terraform crea roles IAM,
  así que necesita permisos amplios. Se acepta para un proyecto de curso; la
  confianza del rol se limita al repositorio. En un trabajo real se acotaría.
- **AWS SDK en el bundle:** el build anterior lo dejaba fuera (Lambda lo trae).
  Si no se incluye, el backend arranca pero falla al usar DynamoDB.
- **Costo:** la EC2 y su IPv4 pública cobran por hora aunque nadie use la app.
  `docs/despliegue.md` explica cómo destruir el entorno y crear una alerta de
  presupuesto. `t4g.micro` entra en la capa gratuita de cuentas nuevas.
- **Sin SSH:** si la instancia falla al arrancar, se diagnostica con
  *Session Manager* (`aws ssm start-session`) o con la consola serie.
- **Cambios de `user_data` reemplazan la instancia.** No se pierden datos
  (están en DynamoDB), pero la app queda caída unos minutos y el siguiente
  despliegue reinstala la versión.
- **Orden del primer despliegue:** la instancia nueva no tiene la app hasta el
  paso 5; `curl` con reintentos cubre ese intervalo.
- Sin dependencias npm nuevas. Herramientas nuevas: Terraform (CI y A), nginx
  y Node 22 en la instancia (paquetes del sistema operativo).
