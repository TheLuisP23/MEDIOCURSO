# ADR 0002 — Despliegue en EC2 con Terraform y GitHub Actions

- **Estado:** Propuesta (se acepta al aprobar el PR de la spec 005)
- **Fecha:** 2026-10-20
- **Reemplaza:** el punto 3 del ADR 0001 (serverless con AWS SAM)

## Contexto

El curso exige que la app corra en una **instancia EC2**, que la
infraestructura se describa con **Terraform** y que el despliegue automático
lo haga **GitHub Actions**. El ADR 0001 había elegido Lambda + API Gateway +
CloudFront con AWS SAM y descartado EC2.

Se usa una cuenta AWS propia de A (no AWS Academy), así que se pueden crear
roles IAM y federar GitHub Actions con OIDC.

## Decisión

1. **Cómputo:** una sola instancia EC2 pequeña sirve el frontend estático y
   el backend Hono sobre Node. Hono ya corre igual en Node que en Lambda, así
   que el código de la app no cambia.
2. **Datos:** se mantiene **DynamoDB**, accedido desde la EC2 con un rol IAM
   de instancia. La escritura condicional que evita la doble reserva (spec 003)
   no cambia, y los datos sobreviven si se reemplaza la instancia.
3. **Infraestructura como código:** Terraform en `infra/`, reemplaza a
   `infra/template.yaml` (SAM).
4. **Estado de Terraform:** en un bucket S3 con versionado y bloqueo nativo de
   S3, compartido por A, B y GitHub Actions.
5. **Arranque inicial (`infra/bootstrap/`):** un Terraform aparte, que A
   ejecuta **una sola vez** desde su terminal, crea el bucket del estado y el
   rol que GitHub Actions asume por **OIDC** (sin claves de AWS guardadas en
   GitHub).
6. **Despliegue:** en cada PR, GitHub Actions valida Terraform y muestra el
   plan; en cada merge a `main` corre `npm run check`, aplica Terraform y
   publica la nueva versión en la instancia.
7. **Sin HTTPS propio:** la app se sirve por `http://` (spec 005, P4).

## Consecuencias

- (+) Cumple el requisito del curso.
- (+) Sin claves de AWS de larga duración en GitHub (OIDC).
- (+) Toda la infraestructura se recrea desde cero con código (spec 005, CA-24).
- (−) La instancia cuesta dinero aunque nadie use la app (mitigación: tipo de
  instancia pequeño y apagarla o destruirla cuando no se necesite).
- (−) Hay un servidor que mantener (actualizaciones del sistema operativo).
- (−) Sin CloudFront ni HTTPS: el navegador marcará la página como "no segura".
- (−) El arranque inicial es un paso manual (aunque sea código) que solo A
  puede ejecutar, porque es el dueño de la cuenta.

## Alternativas descartadas

- **Seguir con SAM y Lambda (ADR 0001):** no cumple el requisito del curso.
- **Base de datos dentro de la EC2:** obligaría a cambiar la spec 003 y a
  respaldar el disco para que las reservas sobrevivan a un reemplazo de la
  instancia.
- **Access keys de un usuario IAM en los secrets de GitHub:** funcionan, pero
  son claves de larga duración; OIDC es más seguro y no caduca.
- **Crear el bucket del estado en la consola:** contradice "nada a mano en la
  consola"; el arranque inicial como código deja registro de qué se creó.
