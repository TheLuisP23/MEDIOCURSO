# Despliegue en AWS (spec 005)

El despliegue es automático: cada merge a `main` ejecuta el workflow
**Despliegue** (`.github/workflows/deploy.yml`), que:

1. corre `npm run check` y `npm run build`;
2. crea/actualiza la infraestructura con SAM (`infra/template.yaml`);
3. sube el frontend a S3 e invalida la caché de CloudFront;
4. muestra la URL pública en el resumen del job.

Queda **apagado** hasta que configures lo de abajo. Lo hace la persona dueña
de la cuenta AWS (A).

## Opción 1 — Cuenta AWS propia (recomendada)

1. En AWS, crea un usuario IAM `github-deploy` con acceso programático.
   Para un proyecto de curso basta la política `AdministratorAccess`
   (en un trabajo real se limitaría a lo necesario).
2. Crea una **alerta de presupuesto** (Billing → Budgets) de 5 USD.
3. En GitHub: *Settings → Secrets and variables → Actions*:
   - **Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - **Variables:** `DESPLIEGUE_ACTIVO` = `true`, `AWS_REGION` = `us-east-1`
4. Ve a *Actions → Despliegue → Run workflow* (o haz merge a `main`).
5. Abre la URL del resumen y prueba `/api/health`.

## Opción 2 — AWS Academy Learner Lab

Learner Lab no permite crear roles IAM y sus credenciales **caducan** al
cerrar la sesión del laboratorio (≈4 h).

1. Inicia el lab y en *AWS Details* copia las tres credenciales.
2. En GitHub agrega los secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   **y** `AWS_SESSION_TOKEN`.
3. Variables: `DESPLIEGUE_ACTIVO` = `true`, `AWS_REGION` = `us-east-1`,
   `LAB_ROLE_ARN` = `arn:aws:iam::<tu-cuenta>:role/LabRole`
   (el número de cuenta sale en la consola, arriba a la derecha).
4. Ejecuta el workflow. **Cada nueva sesión del lab** hay que volver a pegar
   los tres secrets antes de desplegar.

> Si Learner Lab rechaza algún recurso (por ejemplo CloudFront), anótenlo en
> la bitácora y abran un ADR: la alternativa es servir el frontend desde S3
> como sitio web estático y configurar CORS en la API.

## Desplegar a mano (para probar)

Requiere AWS CLI y SAM CLI instalados y configurados (`aws configure`):

```bash
npm run build
sam deploy --template-file infra/template.yaml --stack-name reserva-labs \
  --resolve-s3 --capabilities CAPABILITY_IAM
```

## Borrar todo al terminar el curso

```bash
aws s3 rm s3://<BucketFrontend> --recursive
sam delete --stack-name reserva-labs
```
