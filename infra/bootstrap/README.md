# Arranque inicial de AWS (spec 005)

Se ejecuta **una sola vez**, lo hace **A** (dueño de la cuenta AWS), desde su
terminal. Crea:

- el bucket S3 donde Terraform guarda el estado de `infra/`;
- el acceso de GitHub Actions a AWS por OIDC (rol `reserva-labs-github`),
  sin claves de AWS guardadas en GitHub.

## Requisitos

- Terraform ≥ 1.10 y AWS CLI configurada con la cuenta del proyecto.
  Compruébalo con `aws sts get-caller-identity`.

## Pasos

```bash
cd infra/bootstrap
terraform init
terraform apply      # revisa el plan y escribe "yes"
terraform output     # tres valores para copiar a GitHub
```

Copia las salidas como **variables** del repositorio (*Settings → Secrets and
variables → Actions → Variables*), o con la CLI de GitHub:

```bash
gh variable set AWS_REGION      --body "$(terraform output -raw region)"
gh variable set AWS_ROLE_ARN    --body "$(terraform output -raw rol_github_arn)"
gh variable set TF_STATE_BUCKET --body "$(terraform output -raw bucket_estado)"
```

No hace falta ningún *secret* de AWS.

## Importante

- El estado de este arranque queda en `infra/bootstrap/terraform.tfstate`, en
  la máquina de A, y **no se sube a git**. Guárdalo: sin él, Terraform no
  sabrá que estos recursos ya existen. Si se pierde, los recursos siguen
  funcionando; para volver a gestionarlos hay que importarlos (`terraform import`).
- Si la cuenta ya tenía un proveedor OIDC de GitHub (lo usa otro proyecto),
  `apply` falla con `EntityAlreadyExists`. Impórtalo antes de aplicar:
  `terraform import aws_iam_openid_connect_provider.github arn:aws:iam::<cuenta>:oidc-provider/token.actions.githubusercontent.com`
- Si GitHub Actions falla con `Not authorized to perform sts:AssumeRoleWithWebIdentity`,
  revisa el formato del `sub` del token con
  `gh api repos/<dueño>/<repo>/actions/oidc/customization/sub`. Este repo usa el
  formato inmutable (`repo:dueño@id/repo@id:...`); el rol acepta ese y el clásico
  (variables `repositorio_github` y `repositorio_github_inmutable`).
- El bucket tiene `prevent_destroy`: `terraform destroy` se niega a borrarlo
  a propósito. Al terminar el curso, ver `docs/despliegue.md`.
