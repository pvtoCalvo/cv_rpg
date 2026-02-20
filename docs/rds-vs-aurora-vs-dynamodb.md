# RDS vs Aurora vs DynamoDB

## 1) TL;DR
- Si necesitas **SQL/relacional** y quieres un servicio administrado con motores comunes (MySQL/PostgreSQL/SQL Server/Oracle/MariaDB/Db2) → **Amazon RDS**.
- Si necesitas **relacional compatible con MySQL/PostgreSQL** y priorizas **escala/HA** con una arquitectura de almacenamiento diseñada para crecer automáticamente (y features específicas de Aurora) → **Amazon Aurora**.
- Si tu modelo encaja en **key-value/document** y tu prioridad es **latencia baja predecible** y **escala masiva** sin gestionar capacidad de instancias → **Amazon DynamoDB**.

Reglas rápidas:
- Si necesitas **joins**, consultas complejas ad-hoc y SQL estándar → elige **RDS/Aurora**.
- Si puedes modelar por **access patterns** (partition/sort keys) y quieres escalar sin operar instancias → elige **DynamoDB**.
- Si estás en MySQL/PostgreSQL y el cuello es HA/escala/operación → evalúa **Aurora** antes de “shardear a mano”.

## 2) Qué problema resuelve cada servicio

### Amazon RDS
**Qué es:** base de datos relacional administrada. AWS automatiza tareas comunes (provisioning, backups, parches según configuración, monitoreo), y tú eliges engine y tamaño de instancia.

**Qué NO es:**
- No es un sistema NoSQL de baja latencia por clave con escalado horizontal ilimitado (para eso, DynamoDB).
- No elimina el diseño HA: debes elegir opciones como Multi-AZ, estrategia de backups y DR.

### Amazon Aurora
**Qué es:** motor relacional administrado (compatible con MySQL y PostgreSQL) dentro de la familia RDS, con arquitectura de almacenamiento y opciones enfocadas en alta disponibilidad y escalabilidad.

**Qué NO es:**
- No es “cualquier engine”: si necesitas SQL Server/Oracle/Db2, Aurora no aplica.
- No reemplaza el modelado de datos relacional: si tu caso es key-value simple a escala extrema, DynamoDB puede encajar mejor.

### Amazon DynamoDB
**Qué es:** base de datos NoSQL administrada (key-value y document) diseñada para baja latencia y escalado horizontal. Requiere modelar acceso por claves y patrones de consulta.

**Qué NO es:**
- No es un RDBMS: no hay joins arbitrarios ni SQL relacional completo.
- No es ideal si tu requisito principal es consultas ad-hoc complejas sin un modelo de claves bien definido.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón AWS típico |
|---|---|---|---|
| SQL relacional, engine específico (p. ej., SQL Server/Oracle) | RDS | Soporta múltiples engines administrados | App -> RDS (Multi-AZ) |
| MySQL/PostgreSQL con foco en HA/escala y features Aurora | Aurora | Arquitectura y límites de almacenamiento a nivel cluster; read scaling | App -> Aurora (writer + readers) |
| Escala masiva con baja latencia por clave, sin gestionar instancias | DynamoDB | NoSQL administrado orientado a throughput/latencia | API -> DynamoDB (+ Streams) |
| Reglas de integridad relacional, transacciones SQL complejas | RDS/Aurora | Modelo relacional | Servicios -> RDS/Aurora |
| Global active-active con latencia regional | DynamoDB (Global Tables) | Replicación multi-region orientada a NoSQL | Multi-region API -> DynamoDB GT |
| Necesitas máximos de almacenamiento por cluster relacional administrado | Aurora | Límite de volumen por cluster (según engine/version) | App -> Aurora |
| Item/documentos pequeños, alto QPS, patrón por PK/SK | DynamoDB | Límite de item 400 KB; modelo por claves | API -> DynamoDB |

## 4) Matriz comparativa por criterios

| Criterio | RDS | Aurora | DynamoDB |
|---|---|---|---|
| Nivel de abstracción / operación | Relacional administrado por instancia | Relacional administrado por cluster | NoSQL administrado (sin instancias que administres a nivel OS) |
| Escalado y HA | Opciones Multi-AZ y read replicas (varía por engine) | Read scaling y HA a nivel cluster; storage auto-crece hasta límites del engine/version | Escala horizontal; patrones globales con Global Tables |
| Networking y entrada/salida | En VPC; endpoints privados; security groups | En VPC; endpoints privados; security groups | Acceso por API; endpoints privados (VPC endpoints) según diseño |
| Seguridad | IAM, KMS, SG, opciones de auth según engine | IAM, KMS, SG, opciones de auth según engine | IAM, KMS, control fino por tablas/ítems según patrón |
| Observabilidad | CloudWatch, Performance Insights/monitoring según configuración | CloudWatch, Performance Insights/monitoring según configuración | CloudWatch; métricas por tabla/índices/consumo |
| Portabilidad / lock-in | Media: engines conocidos | Media: compatible MySQL/PostgreSQL pero con features Aurora | Media: NoSQL portable en concepto, pero APIs/operación son AWS |
| Modelo de costes (drivers típicos) | Instancia + storage + I/O + backups + data transfer | Instancia(s) + I/O/storage + features (según edición) | Capacidad (on-demand/provisioned), storage, streams, global tables |
| Limitaciones y cuotas relevantes (con fuente) | Ver cuotas/constraints por engine y región | Volumen máximo de cluster (p. ej., 128 TiB o 256 TiB según engine/version) | Tamaño máximo de item 400 KB; tamaño máximo de partición 10 GB |

## 5) Patrones recomendados

### Patrón 1: OLTP clásico con Aurora (writer + readers)
```
Cliente -> ALB -> ECS/EKS -> Aurora (Writer)
                       \-> Aurora (Readers)
```
**Por qué:** separa lecturas y escrituras y aprovecha el modelo de cluster.

**Cuándo usarlo:** e-commerce, APIs transaccionales, microservicios con SQL.

### Patrón 2: Lift-and-shift relacional con RDS
```
App (EC2/ECS) -> RDS (engine requerido, Multi-AZ)
```
**Por qué:** minimiza cambios de aplicación cuando el engine es requisito.

**Cuándo usarlo:** migraciones, software comercial, engines no disponibles en Aurora.

### Patrón 3: Event-driven con DynamoDB + Streams
```
API -> DynamoDB -> DynamoDB Streams -> Lambda -> (S3/analytics/EventBridge)
```
**Por qué:** habilita reacciones a cambios sin polling y reduce acoplamiento.

**Cuándo usarlo:** auditoría, materialized views, integraciones.

### Patrón 4: Multi-region activo-activo con DynamoDB
```
Route 53 -> API (Region A) -> DynamoDB Global Tables
        \-> API (Region B) -> DynamoDB Global Tables
```
**Por qué:** latencia baja regional y resiliencia multi-region.

**Cuándo usarlo:** B2C global, requisitos de continuidad fuertes.

## 6) Antipatrones y errores comunes
- Usar **DynamoDB** como si fuera un RDBMS (joins/ad-hoc queries) sin modelar access patterns: rediseña el modelo o usa RDS/Aurora.
- Poner payloads grandes (BLOBs) dentro de DynamoDB y chocar con límites de item: usa **S3** y guarda referencias.
- Usar RDS/Aurora sin diseñar HA/DR (Multi-AZ, backups, restore tests): define RPO/RTO y automatiza.
- “Shardear” un relacional prematuramente: evalúa opciones administradas (Aurora/read scaling, caching) antes.
- Ignorar límites (Aurora volumen máximo; DynamoDB item/partition) hasta producción.

## 7) Checklist de selección (sí/no)
- ¿Necesitas SQL relacional, joins y transacciones complejas?
- ¿Estás atado a un engine específico (SQL Server/Oracle/Db2)?
- ¿Tu patrón principal es por clave (PK/SK) con latencia baja y QPS alto?
- ¿Puedes definir access patterns estables y diseñar índices acorde?
- ¿Necesitas multi-region activo-activo con latencia regional?
- ¿Tu crecimiento esperado te acerca a límites de almacenamiento o throughput?
- ¿Qué tan importante es minimizar operación vs maximizar portabilidad?

## 8) Referencias
- AWS Decision Guides: “Choosing an AWS database service” (secciones: Key concepts, Use cases, Compare services). https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html
- Amazon RDS User Guide: “Quotas and constraints for Amazon RDS”. https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Limits.html
- Amazon Aurora User Guide: “Quotas and constraints for Amazon Aurora” (incluye límites de volumen por cluster y Data API cuotas si aplica). https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_Limits.html
- Amazon DynamoDB Developer Guide: “Constraints in Amazon DynamoDB” (límite item 400 KB; partición 10 GB). https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html
- Amazon DynamoDB Developer Guide: “Quotas in Amazon DynamoDB” (cuotas por cuenta/tabla/global tables). https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html
- AWS Well-Architected Framework. https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
