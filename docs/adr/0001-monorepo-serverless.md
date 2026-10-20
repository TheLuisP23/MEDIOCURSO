# ADR 0001 — Monorepo y arquitectura serverless en AWS

- **Estado:** Aceptada
- **Fecha:** (fecha del primer commit)

## Contexto

El curso pide un solo proyecto con backend y frontend, trabajado por dos
personas con agentes de IA distintos (Claude Code y Codex), y desplegado en AWS.

## Decisión

1. **Monorepo** con `backend/` y `frontend/` como workspaces de npm.
2. **TypeScript en ambos lados**, para que ambos agentes y ambas personas
   puedan trabajar en cualquier carpeta.
3. **Serverless**: Lambda + API Gateway HTTP + DynamoDB + S3 + CloudFront,
   descrito con AWS SAM en `infra/template.yaml`.
4. **Hono** como framework HTTP porque el mismo código corre local (Node) y en
   Lambda sin cambios.

## Consecuencias

- (+) Costo casi cero con poco tráfico; nada que administrar.
- (+) La doble reserva se resuelve con escritura condicional de DynamoDB.
- (−) DynamoDB obliga a pensar los patrones de acceso antes (ver `docs/arquitectura.md`).
- (−) Arranque en frío de Lambda: la primera petición tarda ~1 s.

## Alternativas descartadas

- **EC2 + Docker Compose**: más simple de entender, pero hay que administrar
  el servidor y pagarlo aunque nadie lo use.
- **App Runner**: AWS dejó de aceptar clientes nuevos en abril de 2026.
- **ECS Fargate + RDS**: más profesional, pero RDS consume créditos rápido.
