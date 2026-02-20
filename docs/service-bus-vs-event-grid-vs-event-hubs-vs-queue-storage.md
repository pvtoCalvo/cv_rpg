# Azure Service Bus vs Event Grid vs Event Hubs vs Azure Queue Storage

## 1) TL;DR
- Si necesitas **mensajería empresarial** (colas/tópicos, DLQ, sesiones, patrones request-reply, control fino de reintentos) → **Azure Service Bus**.
- Si necesitas **notificación y enrutamiento de eventos** (fan-out a múltiples handlers, integración con eventos de Azure) → **Azure Event Grid**.
- Si necesitas **ingesta de streaming de alto volumen** (telemetría, logs, clickstream) con consumidores por offset/partición → **Azure Event Hubs**.
- Si necesitas una **cola simple y económica** para desacoplar componentes con requisitos básicos → **Azure Queue Storage**.
- Si necesitas **reaccionar a eventos** pero además **procesar de forma durable y desacoplada** → patrón común: **Event Grid → Service Bus** (evento dispara mensaje durable).

Reglas rápidas:
- “**Evento**” (notificar que algo pasó) → **Event Grid**.
- “**Comando/mensaje**” (alguien debe procesarlo con garantías y control) → **Service Bus**.
- “**Stream**” (flujo continuo y consumidores paralelos) → **Event Hubs**.
- “**Cola básica**” (simple, barata, sin features avanzadas) → **Queue Storage**.

## 2) Qué problema resuelve cada servicio

### Azure Service Bus
**Qué es:** broker de mensajería empresarial con **colas** y **tópicos/suscripciones** para desacoplar productores y consumidores. Está pensado para flujos de integración entre aplicaciones donde necesitas durabilidad y control del procesamiento (p. ej., reintentos, dead-lettering).

**Cuándo encaja:** comandos asincrónicos, integración B2B, flujos con “backlog” real, fan-out controlado con tópicos, y escenarios donde el consumidor debe completar trabajo con semánticas de procesamiento bien definidas.

**Qué NO es:**
- No es un bus de eventos “ligero” para notificar cambios a múltiples servicios sin estado; para eso suele encajar mejor Event Grid.
- No es el servicio típico para ingesta masiva de telemetría/streaming; Event Hubs está más orientado a ese caso.

### Azure Event Grid
**Qué es:** servicio de enrutamiento de eventos (pub/sub) para arquitecturas reactivas. Conecta “fuentes de evento” (servicios Azure o aplicaciones) con “handlers” (Functions, Webhooks, Service Bus, etc.) mediante suscripciones a eventos.

**Cuándo encaja:** disparar automatizaciones y microservicios cuando ocurre un evento (p. ej., “blob creado”, “resource changed”), fan-out a múltiples consumidores y orquestación por eventos entre servicios.

**Qué NO es:**
- No es una cola/broker para “trabajo” con control fino de DLQ/sesiones/transacciones como Service Bus.
- No es un stream de alta retención/alto throughput como Event Hubs.

### Azure Event Hubs
**Qué es:** plataforma de streaming para **ingesta de eventos** de alto volumen, con particiones y consumer groups. Es el “front door” típico para telemetría, logs y eventos que alimentan analítica/stream processing.

**Cuándo encaja:** pipelines de observabilidad, IoT/telemetría, clickstream, integración con motores de streaming y consumidores paralelos.

**Qué NO es:**
- No es un broker de comandos con semántica “una vez por mensaje” y features tipo DLQ/sesiones como Service Bus.
- No es una cola simple de baja fricción; Queue Storage suele ser más simple para casos básicos.

### Azure Queue Storage
**Qué es:** cola simple dentro de una Storage Account para procesamiento asíncrono básico. Su foco es simplicidad y costo bajo, con un set reducido de features comparado con Service Bus.

**Cuándo encaja:** desacoplar componentes, colas de trabajo simples, “buffering” básico entre servicios.

**Qué NO es:**
- No es mensajería empresarial (tópicos avanzados, sesiones, transacciones) como Service Bus.
- No es un router de eventos ni un stream particionado para analítica como Event Grid/Event Hubs.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón Azure típico |
|---|---|---|---|
| Cola durable para comandos/trabajo con control de reintentos y DLQ | Service Bus (Queue) | Broker diseñado para procesamiento controlado y desacoplado | API -> Service Bus Queue -> Workers (Container Apps/Functions) -> DB |
| Fan-out a múltiples consumidores con suscripciones a eventos | Service Bus (Topic) | Pub/sub con tópicos y suscripciones orientado a integración entre apps | Sistema A -> Service Bus Topic -> N servicios consumidores |
| Notificar eventos de servicios Azure o apps y enrutar a handlers | Event Grid | Enrutamiento de eventos y suscripciones; integración amplia con Azure | Storage/Apps -> Event Grid -> Functions/Webhook/Service Bus |
| Ingesta de streaming de alto volumen (telemetría/logs) | Event Hubs | Diseño particionado y consumer groups para streaming | Apps/Devices -> Event Hubs -> Stream Analytics/Spark -> Data Lake |
| Cola simple y económica sin necesidades avanzadas | Queue Storage | Simplicidad y costo para desacople básico | Web/API -> Queue Storage -> Function/Worker -> Blob/DB |
| Evento dispara procesamiento durable con backlog real | Event Grid + Service Bus | Event Grid enruta; Service Bus asegura backlog y control de procesamiento | Event Grid -> Service Bus -> Worker idempotente |

## 4) Matriz comparativa por criterios

| Dimensión | Comparación (resumen) |
|---|---|
| Nivel de abstracción / operación | **Service Bus:** broker administrado con features de mensajería; operas entidades (colas/tópicos), reglas, DLQ. <br> **Event Grid:** router de eventos; operas tópicos/dominios y suscripciones. <br> **Event Hubs:** streaming administrado; operas namespaces, hubs, particiones, consumer groups. <br> **Queue Storage:** cola simple dentro de Storage Account; operación mínima. |
| Escalado y HA (Zonas, multi-región si aplica) | Todos son servicios administrados con HA regional según oferta/SKU; multi-región suele resolverse por arquitectura (por ejemplo, replicación, active/active) y depende del servicio y la región. Para diseños multi-región, valida capacidades específicas y patrones recomendados por el servicio. |
| Networking y entrada/salida (VNet, Private Link/Endpoints, etc.) | **Service Bus/Event Hubs/Queue Storage:** típicamente soportan escenarios de red privada vía Private Link/Private Endpoints (ver docs de cada servicio). <br> **Event Grid:** soporte de red privada depende del tipo de recurso y configuración; valida opciones de networking/Private Link para tu caso [NEEDS_VERIFICATION]. |
| Seguridad (Entra ID/RBAC, identidades administradas, cifrado) | Todos integran con control de acceso a nivel Azure (RBAC) y autenticación/credenciales del servicio; para productores/consumidores, prioriza identidades administradas donde aplique y cifrado en tránsito. Para requisitos estrictos, añade red privada y controles de firewall. |
| Observabilidad (Azure Monitor, logs, métricas, trazas) | Todos exponen métricas y diagnósticos hacia Azure Monitor. En escenarios críticos, define SLOs (latencia, tasa de errores, backlog) y alertas por DLQ/poison messages/lag de consumidores. |
| Portabilidad / lock-in | **Service Bus:** lock-in medio; soporta protocolos estándar (p. ej. AMQP) pero features avanzadas son específicas. <br> **Event Hubs:** lock-in medio; incluye compatibilidad con Kafka en escenarios soportados (ver docs). <br> **Event Grid:** lock-in medio; se apoya en modelos de evento y suscripciones del servicio. <br> **Queue Storage:** lock-in medio-alto por API/semántica de Storage Queues. |
| Modelo de costes (drivers típicos) | **Service Bus:** depende de SKU (Standard/Premium) y uso (operaciones/recursos reservados). <br> **Event Grid:** suele cobrar por operaciones/entrega de eventos. <br> **Event Hubs:** depende de capacidad (throughput/capacity), retención y operaciones. <br> **Queue Storage:** transacciones y almacenamiento dentro de la cuenta. |
| Limitaciones y cuotas relevantes (con fuente) | **Service Bus:** cuotas por SKU/entidad: https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quotas <br> **Event Grid:** cuotas y límites: https://learn.microsoft.com/en-us/azure/event-grid/quotas-limits <br> **Event Hubs:** cuotas y límites: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas <br> **Queue Storage:** escalabilidad/targets: https://learn.microsoft.com/en-us/azure/storage/queues/scalability-targets |

## 5) Patrones recomendados

### Patrón 1: Event-driven con backlog durable (evento → trabajo)
```
Fuente (Azure o app) -> Event Grid -> Service Bus (Queue/Topic) -> Worker (Functions/Container Apps) -> DB
                                                |-> DLQ
```
**Por qué:** Event Grid es ideal para notificar; Service Bus absorbe picos, conserva backlog y habilita control de reintentos/DLQ.

**Cuándo usarlo:** integración entre microservicios, automatizaciones, flujos donde el trabajo puede tardar o fallar.

### Patrón 2: Streaming para analítica/observabilidad
```
Apps/Dispositivos -> Event Hubs -> Stream processing (Stream Analytics/Spark) -> Data Lake/Blob
                           |-> Consumer groups (alerting/monitoring)
```
**Por qué:** Event Hubs optimiza ingesta y lectura paralela; separa productores de múltiples consumidores.

**Cuándo usarlo:** telemetría, logs, clickstream, near-real-time analytics.

### Patrón 3: Cola simple para trabajos cortos
```
API/Web -> Queue Storage -> Worker (Functions/Container Apps job) -> Blob/DB
                 |-> Poison queue (por convención)
```
**Por qué:** costo y complejidad mínimos cuando no necesitas features avanzadas.

**Cuándo usarlo:** tareas idempotentes, procesamiento básico, pipelines simples.

## 6) Antipatrones y errores comunes

- Usar **Event Grid** como si fuera una cola de trabajo con backlog y control de DLQ: si necesitas eso, usa **Service Bus** (o Event Grid → Service Bus).
- Usar **Service Bus** para telemetría de altísimo volumen sin modelar throughput/costos: evalúa **Event Hubs**.
- Meter **payloads grandes** en mensajes/eventos: usa **Blob Storage** para el payload y envía un puntero (URL/ID) en el mensaje.
- Diseñar esperando **exactly-once**: diseña consumidores **idempotentes** y usa deduplicación/llaves de idempotencia a nivel aplicación.
- No planificar **DLQ/poison messages**: configura DLQ (Service Bus) o estrategia equivalente y alerta sobre acumulación.
- Crear múltiples consumidores sin estrategia en **Event Hubs**: define consumer groups y controla el lag.
- Ignorar límites por **SKU** (Service Bus) o por **capacidad** (Event Hubs): valida cuotas antes de ir a producción.
- Exponer servicios a Internet sin necesidad: prioriza **Private Link/Endpoints** en escenarios sensibles.

## 7) Checklist de selección (sí/no)

- ¿Necesitas **fan-out de eventos** desde servicios Azure (eventos del plano de datos/control) a múltiples handlers? Si sí → **Event Grid**.
- ¿Necesitas **procesamiento durable de comandos** con DLQ/sesiones/transacciones? Si sí → **Service Bus**.
- ¿Necesitas **ingesta de streaming** con múltiples consumidores y alto throughput? Si sí → **Event Hubs**.
- ¿Necesitas una **cola simple** sin features avanzadas y con mínima complejidad? Si sí → **Queue Storage**.
- ¿El consumidor puede caerse y necesitas conservar backlog por horas/días? Si sí → **Service Bus** (o Event Hubs si es streaming).
- ¿Tu payload supera lo razonable para mensajería? Si sí → **Blob** + puntero en el mensaje.
- ¿Tienes requisitos de **red privada**? Si sí → valida **Private Link/Endpoints** del servicio elegido y del tipo de recurso.

## 8) Referencias (fuentes oficiales)

- Compare messaging services (secciones: cuándo usar Event Grid vs Event Hubs vs Service Bus)  
  https://learn.microsoft.com/en-us/azure/service-bus-messaging/compare-messaging-services
- Storage queues vs Service Bus queues (secciones: diferencias y criterios de elección)  
  https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-azure-and-service-bus-queues-compared-contrasted
- Service Bus overview (secciones: colas, tópicos, DLQ)  
  https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview
- Service Bus quotas (secciones: límites por SKU/entidad)  
  https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quotas
- Event Grid overview (secciones: conceptos de eventos y suscripciones)  
  https://learn.microsoft.com/en-us/azure/event-grid/overview
- Event Grid quotas and limits (secciones: límites de entrega, throughput, recursos)  
  https://learn.microsoft.com/en-us/azure/event-grid/quotas-limits
- Event Hubs: About (secciones: particiones, consumer groups, casos de uso; compatibilidad Kafka donde aplique)  
  https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about
- Event Hubs quotas (secciones: límites por tier/capacidad)  
  https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quotas
- Queue Storage overview y scalability targets (secciones: conceptos + límites/tamaño/throughput)  
  https://learn.microsoft.com/en-us/azure/storage/queues/storage-queues-introduction  
  https://learn.microsoft.com/en-us/azure/storage/queues/scalability-targets
- Azure Well-Architected Framework (pilares y guías)  
  https://learn.microsoft.com/en-us/azure/well-architected/
