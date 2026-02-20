# Azure SQL Database vs Azure SQL Managed Instance vs SQL Server on Azure VMs vs Azure Cosmos DB

## 1) TL;DR
- Si estás construyendo una app nueva y quieres **relacional PaaS con mínima operación** → **Azure SQL Database**.
- Si vienes de SQL Server y necesitas **alta compatibilidad a nivel de instancia** con enfoque de migración y PaaS → **Azure SQL Managed Instance**.
- Si necesitas **control total** (SO, parches, agentes, features específicas no disponibles en PaaS) → **SQL Server en Azure Virtual Machines**.
- Si necesitas **NoSQL distribuido globalmente** con baja latencia y escalado elástico → **Azure Cosmos DB**.
- En entornos regulated: prioriza **red privada (Private Link/VNet)**, **RBAC/Entra ID**, **auditoría** y **cifrado**; evita endpoints públicos si no son necesarios.

Reglas rápidas:
- “Relacional con mínimo ops” → **Azure SQL Database**.
- “Lift-and-shift SQL Server con compatibilidad” → **SQL Managed Instance**.
- “Necesito el control/feature de SQL Server completo” → **SQL Server en VM**.
- “NoSQL global y escala masiva” → **Cosmos DB**.

## 2) Qué problema resuelve cada servicio

### Azure SQL Database
**Qué es:** base de datos relacional PaaS (SQL Server) administrada. Está orientada a aplicaciones modernas que quieren delegar operación de infraestructura (parches, HA de la plataforma, backups administrados según opciones).

**Cuándo encaja:** OLTP para apps web y APIs, SaaS, bases de datos por tenant (single DB o pools) y escenarios donde priorizas agilidad y menor carga operativa.

**Qué NO es:**
- No es una VM con SQL Server “completo”: ciertas capacidades a nivel de instancia/OS no aplican.
- No es NoSQL ni un almacén de documentos; para eso evalúa Cosmos DB.

### Azure SQL Managed Instance
**Qué es:** servicio PaaS que expone una instancia administrada de SQL Server con foco en compatibilidad y migración. Está pensado para reducir fricción al migrar desde SQL Server, manteniendo un modelo administrado.

**Cuándo encaja:** migraciones desde SQL Server con dependencias de características a nivel de instancia (por ejemplo, features y comportamientos comunes en entornos on-prem), y cuando necesitas despliegue en VNet como parte del diseño.

**Qué NO es:**
- No es IaaS: no administras el SO ni instalas extensiones arbitrarias como en una VM.
- No es el camino más simple para una base nueva “greenfield” si SQL Database cubre el caso.

### SQL Server on Azure Virtual Machines
**Qué es:** SQL Server ejecutándose sobre VMs (IaaS). Te da control completo del sistema operativo y del runtime SQL Server, con responsabilidad completa de operación (parcheo, HA, backups, hardening).

**Cuándo encaja:** requisitos de control total, dependencias de software/agentes de terceros, configuraciones avanzadas o cuando necesitas replicar un entorno on-prem casi sin cambios.

**Qué NO es:**
- No es PaaS: la disponibilidad, escalado y seguridad dependen de tu arquitectura y operación.
- No elimina tareas recurrentes (parches, capacity, tuning, DR).

### Azure Cosmos DB
**Qué es:** base de datos NoSQL multi-modelo con distribución global y opciones de consistencia. Está diseñada para baja latencia, alto throughput y escalado horizontal mediante particionado.

**Cuándo encaja:** IoT/telemetría, catálogos, perfiles de usuario, eventos, microservicios con patrones de lectura/escritura a gran escala, y aplicaciones globales que requieren replicación multi-región.

**Qué NO es:**
- No es una base relacional: no asumas joins/constraints ni transacciones tipo RDBMS; verifica el modelo transaccional/consistencia de la API elegida y sus límites (por ejemplo, alcance de transacciones por partición) [NEEDS_VERIFICATION].
- No es “barata por defecto”: el costo depende fuertemente del modelo de throughput y del diseño de particiones.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón Azure típico |
|---|---|---|---|
| Base relacional PaaS para app nueva (mínimo ops) | Azure SQL Database | Servicio administrado, rápido para producir y operar | App Service/Container Apps -> Azure SQL Database |
| Migración SQL Server con compatibilidad a nivel de instancia y PaaS | Azure SQL Managed Instance | Orientado a migraciones con menos reescritura que otros modelos PaaS | Apps en VNet -> SQL Managed Instance (Private) |
| Requisito de control total (SO/agentes/features) | SQL Server en Azure VMs | IaaS permite control y compatibilidad máxima | App en VM/VMSS -> SQL Server VM |
| NoSQL global, baja latencia multi-región, escalado elástico | Azure Cosmos DB | Distribución global y modelo NoSQL para escala | Front Door -> App -> Cosmos DB (multi-región) |
| “Core” relacional + datos globales/escala para features específicas | Azure SQL + Cosmos DB | Poliglot persistence: usa cada almacén para lo que optimiza | API -> Azure SQL (core) + Cosmos (perfil/eventos) |
| Necesitas red privada y aislamiento por compliance | SQL MI o SQL VM (VNet-first) o SQL DB con Private Endpoint | Opciones de despliegue/consumo en VNet y Private Link | VNet -> Private Endpoint -> SQL / Cosmos |

## 4) Matriz comparativa por criterios

| Dimensión | Comparación (resumen) |
|---|---|
| Nivel de abstracción / operación | **SQL Database:** PaaS (operación mínima a nivel infraestructura). <br> **SQL Managed Instance:** PaaS con compatibilidad a nivel de instancia; operación menor que VM. <br> **SQL en VM:** IaaS; operación completa por tu equipo. <br> **Cosmos DB:** PaaS NoSQL; diseñas particionado y modelo, operas capacidad/consistencia. |
| Escalado y HA (Zonas, multi-región si aplica) | **SQL Database/MI:** HA y backups administrados según opciones; escalado depende del modelo (vCore/pools). Multi-región se resuelve con capacidades de replicación/failover del servicio y arquitectura; verifica qué opciones aplican a tu tier y región (por ejemplo, geo-replicación/failover groups) [NEEDS_VERIFICATION]. <br> **SQL en VM:** HA/DR (Always On, clustering, etc.) por tu diseño y operación. <br> **Cosmos DB:** diseño orientado a distribución global y replicación multi-región; requiere modelar consistencia y partición. |
| Networking y entrada/salida (VNet, Private Link/Endpoints, etc.) | **SQL Database:** típicamente consume endpoints del servicio; para red privada usa Private Endpoint/Private Link según el caso. <br> **SQL MI:** se integra a VNet como parte del modelo. <br> **SQL en VM:** dentro de VNet (control total). <br> **Cosmos DB:** opciones de acceso de red incluyendo escenarios con Private Link/EndPoints según configuración. |
| Seguridad (Entra ID/RBAC, identidades administradas, cifrado) | Todos soportan controles de Azure (RBAC) y cifrado; en SQL, combina autenticación/autorización (incluyendo Entra ID donde aplique) con hardening. En Cosmos DB, controla claves/roles y exposición de red. En regulated, añade Private Link + auditoría. |
| Observabilidad (Azure Monitor) | **SQL (todas):** métricas y diagnósticos; monitorea performance, deadlocks, saturación de recursos y errores de conectividad. <br> **Cosmos DB:** métricas de throughput/latencia, consumo, throttling y disponibilidad por región. |
| Portabilidad / lock-in | **SQL Database/MI/VM:** lock-in bajo-medio por usar SQL Server, pero el modelo PaaS y algunas features son específicas. <br> **Cosmos DB:** lock-in medio-alto (modelo y APIs específicas), aunque hay APIs compatibles (según elección). |
| Modelo de costes (drivers típicos) | **SQL Database:** capacidad (vCore/DTU), almacenamiento, features (HA/DR) y transferencia. <br> **SQL MI:** capacidad de instancia (vCores), almacenamiento, red; orientado a cargas “instance-level”. <br> **SQL en VM:** VM + discos + licenciamiento (si aplica) + operación. <br> **Cosmos DB:** throughput/capacidad, replicación multi-región, almacenamiento y operaciones; el diseño (partición y patrón de acceso) impacta mucho el costo. |
| Limitaciones y cuotas relevantes (con fuente) | **SQL Database:** límites de recursos: https://learn.microsoft.com/en-us/azure/azure-sql/database/resource-limits-vcore-single-databases?view=azuresql <br> **SQL Managed Instance:** límites de recursos: https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/resource-limits?view=azuresql <br> **Cosmos DB:** límites: https://learn.microsoft.com/en-us/azure/cosmos-db/concepts-limits <br> **SQL en VM:** cuotas de compute por suscripción/región: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits |

## 5) Patrones recomendados

### Patrón 1: App PaaS con base relacional PaaS (default recomendado)
```
Cliente -> Azure Front Door -> App Service/Container Apps -> Azure SQL Database
                                           |-> Azure Monitor
```
**Por qué:** acelera entrega y reduce carga operativa, alineado con Azure Well-Architected (Operational Excellence y Cost Optimization).

**Cuándo usarlo:** la mayoría de apps web y APIs con modelo relacional.

### Patrón 2: Migración SQL Server con red privada (VNet-first)
```
Apps (VNet) -> Private Endpoint/DNS -> Azure SQL Managed Instance -> (opcional) Integraciones
```
**Por qué:** MI reduce fricción de compatibilidad y facilita controles de red privada.

**Cuándo usarlo:** migraciones desde SQL Server con dependencias a nivel de instancia y requisitos de red privada.

### Patrón 3: Arquitectura global con NoSQL para baja latencia
```
Cliente -> Azure Front Door -> App -> Azure Cosmos DB (multi-región)
                         |-> Azure SQL Database (core transaccional, si aplica)
```
**Por qué:** Cosmos DB habilita latencias bajas globales y escalado; combina con SQL cuando necesitas modelo relacional para el “core”.

**Cuándo usarlo:** apps globales, perfiles de usuario, catálogos, eventos, workloads con picos y necesidad de escala.

### Patrón 4: IaaS por requisitos de control (legacy/agents)
```
App en VM/VMSS -> SQL Server en Azure VM -> Backups -> Blob Storage
```
**Por qué:** mantiene compatibilidad y control total; útil como etapa inicial de modernización.

**Cuándo usarlo:** software legado, agentes de terceros, requisitos de SO, restricciones de PaaS.

## 6) Antipatrones y errores comunes

- Elegir **SQL en VM** “por costumbre” cuando SQL Database/MI cubren el caso: suele aumentar el costo total por operación.
- Elegir **SQL Managed Instance** para una base nueva sin requisitos de compatibilidad: **SQL Database** suele ser más simple.
- Usar **Cosmos DB** como reemplazo directo de relacional para dominios con joins/constraints complejos: evalúa SQL o rediseña el modelo.
- No definir **RPO/RTO** y asumir que “PaaS lo resuelve”: debes seleccionar opciones de HA/DR y probar failover.
- Diseñar sin **idempotencia** en consumidores que escriben en bases (especialmente con colas/eventos): previene duplicados y corrupción lógica.
- No modelar **partition key** y patrones de acceso en Cosmos DB: puede causar hot partitions y costos altos.
- Exponer bases con endpoints públicos sin necesidad: usa **Private Link** y controles de red.
- No monitorear **throttling/consumo** (Cosmos) o saturación de recursos (SQL): define alertas y capacidad.

## 7) Checklist de selección (sí/no)

- ¿Necesitas una base **relacional** para una app nueva con mínimo ops? Si sí → **Azure SQL Database**.
- ¿Estás migrando SQL Server y necesitas alta compatibilidad a nivel de instancia? Si sí → **SQL Managed Instance**.
- ¿Necesitas instalar agentes/softwares específicos o control total del SO y del motor? Si sí → **SQL Server en VM**.
- ¿Necesitas distribución global NoSQL con baja latencia y escalado horizontal? Si sí → **Cosmos DB**.
- ¿Tienes requisito de **red privada** (sin exposición pública)? Si sí → valida **Private Link** (SQL DB/Cosmos) o **VNet-first** (MI/VM).
- ¿Tu equipo puede operar parches/HA/DR de SQL Server? Si no → evita **SQL en VM** salvo requisito.
- ¿Tu dominio requiere joins/constraints y transacciones relacionales complejas? Si sí → prioriza **Azure SQL** sobre **Cosmos**.

## 8) Referencias (fuentes oficiales)

- Prepare to choose a data store (secciones: criterios generales de selección)  
  https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-stores-getting-started
- Azure SQL: IaaS vs PaaS overview (secciones: diferencias de responsabilidad/operación)  
  https://learn.microsoft.com/en-us/azure/azure-sql/azure-sql-iaas-vs-paas-what-is-overview?view=azuresql
- Azure SQL Database vs Managed Instance features comparison (secciones: tabla de capacidades y compatibilidad)  
  https://learn.microsoft.com/en-us/azure/azure-sql/database/features-comparison?view=azuresql
- SQL Managed Instance overview (secciones: modelo PaaS y VNet)  
  https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview?view=azuresql
- SQL Database resource limits (secciones: límites por tier/modelo)  
  https://learn.microsoft.com/en-us/azure/azure-sql/database/resource-limits-vcore-single-databases?view=azuresql
- SQL Managed Instance resource limits (secciones: límites por tier/modelo)  
  https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/resource-limits?view=azuresql
- Cosmos DB use cases (secciones: cuándo usar Cosmos DB)  
  https://learn.microsoft.com/en-us/azure/cosmos-db/use-cases
- Cosmos DB limits (secciones: límites de API/recursos/throughput)  
  https://learn.microsoft.com/en-us/azure/cosmos-db/concepts-limits
- Well-Architected service guide: Cosmos DB (secciones: reliability/security/cost patterns)  
  https://learn.microsoft.com/en-us/azure/well-architected/service-guides/cosmos-db
- Azure subscription/service limits (secciones: cuotas de compute para SQL en VM)  
  https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits
