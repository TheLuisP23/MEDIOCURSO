# Despliegue en AWS (spec 005)

La app corre en una **EC2** descrita con **Terraform** (`infra/`) y se despliega
**sola** en cada merge a `main` con el workflow **Despliegue**
(`.github/workflows/deploy.yml`, ADR 0002). En cada ejecución:

1. corre `npm run check` y `npm run build`; si fallan, no toca AWS (CA-23);
2. entra a AWS por **OIDC** (sin claves guardadas en GitHub) y aplica Terraform;
3. sube `backend/dist` + `frontend/dist` como `versiones/<commit>.tar.gz` al
   bucket de artefactos;
4. ordena a la EC2, por **SSM**, instalar esa versión y reiniciar el servicio;
5. comprueba `GET /api/health` y muestra la URL en el resumen del job.

En cada PR, el CI valida el Terraform (`fmt` + `validate`) y, si el despliegue
está activo, muestra el `terraform plan` (CA-18).

Queda **apagado** hasta completar los pasos de abajo. Los hace **A**, dueño de
la cuenta AWS.

## 1. Arranque inicial (una sola vez)

Requisitos: Terraform ≥ 1.10 y AWS CLI configurada (`aws sts get-caller-identity`
debe mostrar tu cuenta).

```bash
cd infra/bootstrap
terraform init
terraform apply
```

Crea el bucket del estado de Terraform y el rol `reserva-labs-github`. Detalles
y problemas comunes en `infra/bootstrap/README.md`.

## 2. Variables de GitHub

*Settings → Secrets and variables → Actions → **Variables*** (no secrets):

| Variable | Valor |
|----------|-------|
| `AWS_REGION` | `terraform output -raw region` (normalmente `us-east-1`) |
| `AWS_ROLE_ARN` | `terraform output -raw rol_github_arn` |
| `TF_STATE_BUCKET` | `terraform output -raw bucket_estado` |
| `DESPLIEGUE_ACTIVO` | `true` (actívala al final) |

Con la CLI de GitHub, desde `infra/bootstrap`:

```bash
gh variable set AWS_REGION      --body "$(terraform output -raw region)"
gh variable set AWS_ROLE_ARN    --body "$(terraform output -raw rol_github_arn)"
gh variable set TF_STATE_BUCKET --body "$(terraform output -raw bucket_estado)"
gh variable set DESPLIEGUE_ACTIVO --body true
```

## 3. Primer despliegue

*Actions → Despliegue → Run workflow* (o un merge a `main`). La primera vez
tarda **5–10 minutos**: crea la EC2 y espera a que instale Node y nginx.
La URL (`http://<ip>`) aparece en el resumen del job; prueba `<url>/api/health`.

Recomendado: crea una **alerta de presupuesto** (Billing → Budgets) de 5 USD.

## Desplegar o revisar a mano

Con la AWS CLI configurada, desde `infra/`:

```bash
terraform init -backend-config="bucket=<TF_STATE_BUCKET>" -backend-config="region=us-east-1"
terraform plan       # qué cambiaría
terraform output     # URL, id de la instancia, bucket, tabla
```

No hagas `terraform apply` a mano mientras corre el workflow (el bloqueo del
estado lo impide, pero te hará esperar).

## Diagnosticar la EC2 (sin SSH)

```bash
aws ssm start-session --target <id_instancia>   # requiere el plugin de Session Manager
sudo journalctl -u reserva-labs -n 50            # logs del backend
sudo tail -n 50 /var/log/cloud-init-output.log   # logs del arranque
```

## Costos y apagado

- La EC2 `t4g.micro` y su IPv4 pública **cobran por hora** aunque nadie use la
  app. DynamoDB y S3 cuestan casi cero con poco uso.
- **Pausar** sin perder nada: `aws ec2 stop-instances --instance-ids <id>`
  (la IP elástica se mantiene; mientras está detenida se cobra solo el disco y la IP).
  Para volver: `aws ec2 start-instances --instance-ids <id>`.
- **Borrar todo al terminar el curso:**
  1. Pon `DESPLIEGUE_ACTIVO` en `false`.
  2. Quita `prevent_destroy` de `infra/dynamodb.tf` (protege las reservas a
     propósito) y, desde `infra/`, ejecuta `terraform destroy`.
  3. Desde `infra/bootstrap/`: vacía el bucket del estado
     (`aws s3 rm s3://<bucket_estado> --recursive`, incluidas sus versiones),
     quita su `prevent_destroy` y ejecuta `terraform destroy`.
