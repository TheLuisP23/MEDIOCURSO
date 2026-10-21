# Tareas — Spec 005

Leyenda: `[B]` backend · `[F]` frontend · `[D]` docs/infra.
Cada tarea debe poder hacerse y commitearse sola, con `npm run check` en verde.
Formato obligatorio de línea: `- [ ] T<n> [B|F|D] descripción (dueño: A|B)`.

- [x] T1 [D] Crear `infra/bootstrap/` (bucket de estado, OIDC, rol de GitHub, README) e ignorar su `terraform.tfstate` (dueño: A)
- [x] T2 [D] Ejecutar el bootstrap con la cuenta de A y configurar las variables de GitHub `AWS_REGION`, `AWS_ROLE_ARN` y `TF_STATE_BUCKET` (dueño: A)
- [x] T3 [D] Crear `infra/` con versiones, variables, DynamoDB, bucket de artefactos, red e IAM; borrar `infra/template.yaml` (dueño: A)
- [x] T4 [D] Agregar `ec2.tf`, `arranque.sh.tftpl` (Node 22, nginx, systemd) y `outputs.tf` (dueño: A)
- [x] T5 [B] Build del backend para Node: `dist/server.mjs` con AWS SDK incluido; borrar `lambda.ts` y actualizar comentarios (dueño: A)
- [x] T6 [D] CI: job `infra` con `fmt`/`validate` de Terraform y `plan` en PRs (CA-18) (dueño: A)
- [x] T7 [D] Reescribir `deploy.yml`: check, OIDC, `terraform apply`, artefacto a S3, SSM y verificación de `/api/health` (CA-19, CA-20, CA-23) (dueño: A)
- [x] T8 [F] Actualizar comentarios de CloudFront en `vite.config.ts` y `frontend/AGENTS.md` (dueño: B)
- [x] T9 [D] Reescribir `docs/despliegue.md` y actualizar `docs/arquitectura.md`, `AGENTS.md`, `backend/AGENTS.md` y `README.md` (dueño: A)
- [x] T10 [D] Activar `DESPLIEGUE_ACTIVO`, primer despliegue real y URL en la bitácora (CA-19, CA-20) (dueño: A)
- [ ] T11 [D] Verificar CA-21, CA-23 y CA-24 y dejar evidencias en `docs/informe/experimentos.md` (dueño: B)
- [ ] T12 [D] Verificar CA-22 cuando la spec 003 esté implementada; marcar la spec como Implementada (dueño: B)
