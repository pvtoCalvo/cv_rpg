# SQS vs SNS vs EventBridge

## 1) TL;DR
- Si necesitas **desacoplar** productores/consumidores con **buffer**, “backpressure”, reintentos y DLQ → **Amazon SQS**.
- Si necesitas **pub/sub push** y **fanout** a múltiples suscriptores (HTTP/S, Lambda, SQS, email/SMS según caso) → **Amazon SNS** (y para procesamiento asíncrono resiliente, el patrón típico es **SNS -> SQS**).
- Si necesitas un **bus de eventos** para **ruteo por reglas** entre servicios y/o cuentas, y quieres estandarizar eventos (en AWS y SaaS) → **Amazon EventBridge**.
- Si necesitas **orden estricto** por entidad y deduplicación → **SQS FIFO** o **SNS FIFO topics**; EventBridge **no** garantiza orden.

Reglas rápidas:
- Si necesitas **cola de trabajo** → elige **SQS**.
- Si necesitas **notificar a muchos** → elige **SNS**.
- Si necesitas **enrutar eventos** por atributos/patrón hacia múltiples destinos → elige **EventBridge**.

## 2) Qué problema resuelve cada servicio

### Amazon SQS
**Qué es:** un servicio administrado de colas. El consumidor hace *polling* y procesa mensajes cuando puede. SQS está orientado a desacoplar componentes y absorber picos.

**Qué NO es:**
- No es un bus de eventos con ruteo por reglas (para eso, EventBridge).
- No es pub/sub push a múltiples endpoints (para eso, SNS).

### Amazon SNS
**Qué es:** pub/sub administrado. Publicas en un *topic* y SNS entrega a suscriptores (por ejemplo, SQS, Lambda, HTTP/S, email/SMS según configuración). Es ideal para fanout y notificaciones.

**Qué NO es:**
- No es una cola con buffer “por consumidor” ni un mecanismo de backpressure (para eso, SQS).
- No es un bus de eventos con modelo de *event routing* por reglas entre muchos productores/consumidores (para eso, EventBridge).

### Amazon EventBridge
**Qué es:** un *event bus* serverless para recibir eventos (AWS, SaaS y custom) y enviarlos a *targets* según reglas (filtros sobre metadatos). Enfocado a integración y arquitecturas event-driven.

**Qué NO es:**
- No es una cola: no lo uses como “work queue” con consumidores leyendo a su ritmo.
- No es para payloads grandes (usa referencias a S3 si necesitas transportar “carga pesada”).

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón AWS típico |
|---|---|---|---|
| Buffer + desacople + consumidores a su ritmo | SQS | Cola durable, control de reintentos/visibilidad | API -> SQS -> Workers (Lambda/ECS) |
| Fanout a N consumidores/servicios | SNS | Pub/sub; un publish, múltiples entregas | Servicio -> SNS -> (SQS A, SQS B, Lambda) |
| Integración event-driven con ruteo por reglas | EventBridge | Reglas + targets; buen encaje para “event bus” | Servicios -> EventBridge -> Rules -> Targets |
| Enviar notificaciones a endpoints (webhook/email/SMS) | SNS | Entrega push por protocolo | App -> SNS -> HTTP/S/email/SMS |
| Centralizar eventos AWS (cambios de estado) | EventBridge | Eventos de servicios AWS llegan al bus | AWS service -> EventBridge -> Target |
| Orden estricto por entidad (p. ej., por pedido) | SQS FIFO / SNS FIFO | FIFO + message group para orden | Producer -> SQS FIFO -> Worker |
| Worker pool con scaling y DLQ | SQS | SQS + DLQ + autoscaling por métricas | SQS -> ECS workers + DLQ |
| Necesitas “pipes” (source -> filter/transform -> target) | EventBridge (Pipes) | Conecta fuentes/targets con menos glue | DynamoDB Stream -> Pipes -> SQS |

## 4) Matriz comparativa por criterios

| Criterio | SQS | SNS | EventBridge |
|---|---|---|---|
| Nivel de abstracción / operación | Cola administrada; el consumidor controla ritmo | Pub/sub administrado; entrega push | Bus de eventos administrado; ruteo por reglas |
| Escalado y HA | Gestionado por AWS; adecuado para picos | Gestionado por AWS; fanout | Gestionado por AWS; reglas/targets escalan |
| Networking y entrada/salida | Acceso por API; opciones de endpoints privados en VPC (según diseño) | Acceso por API; entrega a múltiples protocolos/targets | Acceso por API; integra con targets AWS (y SaaS) |
| Seguridad | IAM + cifrado (KMS) + políticas de cola | IAM + cifrado (KMS) + políticas de topic | IAM + políticas de bus + cifrado donde aplique |
| Observabilidad | CloudWatch metrics/logs (según integración), DLQ para fallos | CloudWatch; delivery status/logging según configuración | CloudWatch; métricas por reglas/targets; reintentos configurables |
| Portabilidad / lock-in | Media: patrón de colas es portable, APIs no | Media: patrón pub/sub portable, APIs no | Media: patrón event bus portable, pero reglas/targets son AWS |
| Modelo de costes (drivers típicos) | Requests (send/receive/delete), data, features (FIFO, etc.) | Requests/publicaciones, entregas por protocolo (y SMS en servicio aparte) | Ingesta/publicación de eventos, reglas, invocaciones a targets (según feature) |
| Limitaciones y cuotas relevantes (con fuente) | Retención hasta 14 días; visibilidad hasta 12 h; delay hasta 15 min; tamaño de mensaje hasta 1 MiB (ver cuotas) | Mensajes >256 KB requieren patrón de payload offloading a S3 (extended client) | PutEvents: límite 1 MB por *entry*; máximo 10 *entries* por request; EventBridge no garantiza orden |

Notas prácticas:
- Aunque el servicio hable de “exactly-once” en ciertos caminos, en arquitecturas distribuidas la **idempotencia del consumidor** y la **deduplicación por clave** siguen siendo buenas prácticas.

## 5) Patrones recomendados

### Patrón 1: Cola de trabajo (work queue)
```
API/Servicio -> SQS -> Workers (Lambda/ECS) -> DB/S3
              |-> DLQ
```
**Por qué:** absorbe picos, desacopla despliegues, controla reintentos y errores.

**Cuándo usarlo:** procesamiento asíncrono, jobs idempotentes, batch liviano.

### Patrón 2: Fanout resiliente (SNS -> SQS)
```
Productor -> SNS Topic -> SQS (Servicio A) -> Worker A
                     \-> SQS (Servicio B) -> Worker B
                     \-> Lambda (opcional)
```
**Por qué:** un publish alimenta múltiples flujos; SQS agrega buffer por consumidor.

**Cuándo usarlo:** eventos de dominio que varios equipos consumen con ritmos distintos.

### Patrón 3: Event bus con ruteo por reglas
```
Servicios -> EventBridge Bus -> Rules -> (Step Functions | Lambda | SQS | SNS | otros)
```
**Por qué:** desacopla productores/consumidores con contratos de eventos y ruteo por atributos.

**Cuándo usarlo:** integración entre microservicios, eventos de AWS, integración con SaaS.

### Patrón 4: Pipes para conectar fuentes y colas
```
DynamoDB Streams -> EventBridge Pipes -> (Filter/Transform) -> SQS -> Workers
```
**Por qué:** reduce “glue code” y estandariza el enlace source->target.

**Cuándo usarlo:** mover eventos de streams/colas con transformación simple.

## 6) Antipatrones y errores comunes
- Usar **SNS** como si fuera una cola para procesamiento pesado: usa **SNS -> SQS** o directamente **SQS**.
- Publicar **payloads grandes** directamente (o asumir límites altos): usa “payload offloading” a **S3** y manda referencia.
- No configurar **DLQ** en colas/suscripciones donde aplica: agrega DLQ y alarmas.
- No diseñar consumidores **idempotentes**: asume reintentos y posibles duplicados.
- Usar **EventBridge** como work queue con “consumidores que hacen polling”: si necesitas polling/backpressure, usa **SQS**.
- Mezclar **comandos** (imperativos) con **eventos** (hechos) en el mismo canal sin disciplina: define contratos y nombres.

## 7) Checklist de selección (sí/no)
- ¿Necesitas que el consumidor lea a su ritmo y absorber picos? (SQS)
- ¿Necesitas fanout a múltiples consumidores con entrega push? (SNS)
- ¿Necesitas ruteo por reglas y estandarizar eventos entre muchos productores/consumidores? (EventBridge)
- ¿Necesitas orden estricto por entidad (FIFO)? (SQS FIFO / SNS FIFO)
- ¿Necesitas retener mensajes hasta días para re-procesar? (SQS)
- ¿Necesitas integrar eventos de servicios AWS o SaaS sin “polling”? (EventBridge)
- ¿Tu payload puede exceder límites por mensaje? (S3 + referencia)
- ¿Tus consumidores están preparados para reintentos/duplicados (idempotencia)?

## 8) Referencias
- AWS Decision Guides: “Amazon SQS, Amazon SNS, or Amazon EventBridge?” (secciones: Details on the differences, Persistence and delivery guarantees, Ordering). https://docs.aws.amazon.com/decision-guides/latest/sns-or-sqs-or-eventbridge/sns-or-sqs-or-eventbridge.html
- Amazon SQS Developer Guide: “Amazon SQS message quotas” (retención, visibilidad, delay, tamaño). https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html
- Amazon SNS Developer Guide: “Publishing large messages with Amazon SNS and Amazon S3” (límite 256 KB y patrón con S3). https://docs.aws.amazon.com/sns/latest/dg/large-message-payloads.html
- Amazon EventBridge User Guide: “Sending events with PutEvents… / Calculating PutEvents event entry size” (1 MB por entry; recomendación de S3). https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevents.html
- Amazon EventBridge API Reference: “PutEvents” (máx. 10 entries por request). https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_PutEvents.html
- Amazon EventBridge User Guide: “Amazon EventBridge quotas” (cuotas de reglas, buses, pipes, schemas). https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-quota.html
- Amazon EventBridge User Guide: “Events in Amazon EventBridge” (estructura y uso). https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html
- AWS Well-Architected Framework. https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
