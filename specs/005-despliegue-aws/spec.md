# Spec 005 — Despliegue en AWS

- **Estado:** En curso
- **Dueños:** infraestructura: A (dueño de la cuenta AWS) · verificación: B
- **Depende de:** 001 (mínimo); idealmente 002–004
- **Verificación:** manual (evidencias en `docs/informe/experimentos.md`)
- **Va junto con:** ADR 0002 (reemplaza la decisión serverless del ADR 0001)
  y el cambio del Art. 8 de la constitución; se aprueban en el mismo PR.

## Contexto

La app debe quedar pública en AWS y desplegarse **sola** cada vez que se hace
merge a `main`, sin que nadie suba archivos ni cree recursos a mano.

**Requisito del curso:** la app corre en una **instancia EC2**, toda la
infraestructura se describe como código con **Terraform**, y el despliegue
automático lo hace **GitHub Actions**. Esto reemplaza la versión anterior de
esta spec (Lambda + API Gateway + CloudFront descritos con AWS SAM).

```
Navegador ──▶ EC2 (servidor web) ──┬── /*      ──▶ frontend estático
                                   └── /api/*  ──▶ backend (Hono en Node)
                                                      │
                                                      ▼
                                                   DynamoDB
```

## Historias de usuario

- Como **equipo**, queremos que cada merge a `main` actualice la app en la nube
  sin pasos manuales.
- Como **equipo**, queremos poder recrear toda la infraestructura desde cero
  con un solo comando, sin tocar la consola de AWS.
- Como **profesor**, quiero abrir una URL pública y probar la app desde el celular.

## Criterios de aceptación

- **CA-18** — Dado el código de infraestructura, cuando corre el CI en un PR,
  entonces la validación de formato y sintaxis de Terraform pasa (y el PR
  muestra qué cambiaría en la nube si se aplicara).
- **CA-19** — Dados los secretos configurados en GitHub, cuando se hace merge a
  `main`, entonces el workflow `Despliegue` aplica la infraestructura, publica
  la nueva versión en la instancia EC2 y la app queda accesible en su URL pública.
- **CA-20** — Dada la app desplegada, cuando se llama `GET http://<host>/api/health`,
  entonces responde `{"estado":"ok"}`.
- **CA-21** — Dadas reservas creadas, cuando se hace un nuevo despliegue (o se
  reemplaza la instancia), entonces las reservas siguen existiendo.
- **CA-22** — Demo: dados dos celulares, cuando reservan el mismo bloque a la
  vez, entonces solo uno lo logra (RN-05).
- **CA-23** — Dado un merge a `main` cuyo `npm run check` falla, cuando corre el
  workflow `Despliegue`, entonces no se modifica nada en la nube.
- **CA-24** — Dada una cuenta AWS sin recursos del proyecto, cuando se aplica la
  infraestructura desde cero, entonces la app queda funcionando sin crear nada
  a mano en la consola (el arranque inicial de P3 también es código).

## Reglas de negocio

No aplica.

## Contrato de API

Sin cambios.

## Fuera de alcance

- Dominio propio y certificado HTTPS propio.
- Ambientes separados de staging y producción.
- Alta disponibilidad (varias instancias, balanceador de carga, autoescalado).

## Preguntas abiertas

- **P1** — ¿Cuenta AWS propia o AWS Academy Learner Lab? → *Respuesta:* cuenta
  AWS propia de A (con AWS CLI configurada).
- **P2** — ¿Dónde se guardan las reservas? → *Respuesta:* se mantiene DynamoDB,
  accedido desde la EC2. La spec 003 no cambia.
- **P3** — El estado de Terraform debe vivir fuera de la máquina de cada uno
  para que GitHub Actions y ambas personas lo compartan. ¿Se acepta crear a
  mano, una sola vez, el lugar donde se guarda ese estado? → *Respuesta:* sí,
  pero como código: un arranque inicial que A ejecuta una sola vez desde su
  terminal crea el almacenamiento del estado y el acceso de GitHub Actions a
  AWS sin claves guardadas. Nada se crea en la consola.
- **P4** — Sin dominio propio la URL será `http://` (sin candado). ¿Es
  aceptable para el curso o se exige HTTPS? → *Respuesta:* basta con `http://`.
- **P5** — ¿La app corre dentro de contenedores Docker en la EC2 o directamente
  con Node? → *Respuesta:* el curso no lo exige; se decide en el plan.
