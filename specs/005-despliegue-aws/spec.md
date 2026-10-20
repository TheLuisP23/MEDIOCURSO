# Spec 005 — Despliegue en AWS

- **Estado:** Borrador
- **Dueños:** infraestructura: A (dueño de la cuenta AWS) · verificación: B
- **Depende de:** 001 (mínimo); idealmente 002–004
- **Verificación:** manual (evidencias en `docs/informe/experimentos.md`)

## Contexto

La app debe quedar pública en AWS y desplegarse **sola** cada vez que se hace
merge a `main`, sin que nadie suba archivos a mano.

Arquitectura (ya descrita en `infra/template.yaml` y `docs/arquitectura.md`):

```
Navegador ──▶ CloudFront ──┬── /*      ──▶ S3 (frontend estático)
                           └── /api/*  ──▶ API Gateway (HTTP) ──▶ Lambda (Hono) ──▶ DynamoDB
```

## Historias de usuario

- Como **equipo**, queremos que cada merge a `main` actualice la app en la nube.
- Como **profesor**, quiero abrir una URL pública y probar la app desde el celular.

## Criterios de aceptación

- **CA-18** — `sam validate --lint` pasa sobre `infra/template.yaml` (lo corre el CI).
- **CA-19** — Con los secretos configurados, un merge a `main` ejecuta el
  workflow `Despliegue` y la app queda accesible en la URL de CloudFront.
- **CA-20** — `GET https://<cloudfront>/api/health` responde `{"estado":"ok"}`.
- **CA-21** — Las reservas persisten en DynamoDB (sobreviven a un nuevo despliegue).
- **CA-22** — Demo: dos celulares reservan el mismo bloque a la vez; solo uno lo logra (RN-05).

## Reglas de negocio

No aplica.

## Contrato de API

Sin cambios.

## Fuera de alcance

- Dominio propio y HTTPS con certificado propio (se usa el de CloudFront).
- Ambientes separados de staging y producción.

## Preguntas abiertas

- **P1** — ¿Cuenta AWS propia o AWS Academy Learner Lab? → *Respuesta:* (pendiente).
  Con Learner Lab: usar el parámetro `LabRoleArn` y renovar los secretos de
  GitHub en cada sesión (ver `docs/despliegue.md`).
