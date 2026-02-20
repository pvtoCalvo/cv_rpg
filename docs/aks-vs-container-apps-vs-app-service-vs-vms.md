# AKS vs Azure Container Apps vs App Service (Containers) vs Azure Virtual Machines (VM/VMSS)

## 1) TL;DR
- Si necesitas **Kubernetes (API k8s, CRDs, Helm, GitOps, políticas avanzadas)** → **AKS**.
- Si quieres **contenedores con mínimo esfuerzo operativo** (sin administrar clúster/nodos) y **autoescalado orientado a eventos/HTTP** → **Azure Container Apps**.
- Si tu caso es principalmente **una app web/API HTTP** y buscas **PaaS “app-centric”** (despliegue simple, slots, integración con plataforma) usando contenedor como empaquetado → **Azure App Service (Containers)**.
- Si necesitas **control total del SO/host** (drivers, agentes, hardening específico, software legado) o un runtime fuera de lo soportado por PaaS → **Azure Virtual Machines / VM Scale Sets**.
- En escenarios **regulated**, prioriza **red privada** (VNet/Private Link), **control de acceso (RBAC/identidades administradas)** y **auditoría/observabilidad**; si necesitas aislamiento fuerte, evalúa **App Service Environment** o despliegues privados (AKS/Container Apps).

Reglas rápidas:
- Si necesitas **API de Kubernetes** → elige **AKS**.
- Si necesitas **serverless containers** y tu app encaja en el modelo de Container Apps → elige **Azure Container Apps**.
- Si necesitas **PaaS para una app web** y no quieres operar plataforma de contenedores → elige **App Service (Containers)**.
- Si necesitas **control del host** → elige **VM/VMSS**.

## 2) Qué problema resuelve cada servicio

### Azure Kubernetes Service (AKS)
**Qué es:** Kubernetes administrado. Microsoft administra el plano de control de Kubernetes; tú sigues siendo responsable de diseñar y operar el clúster (versiones, add-ons, políticas, seguridad) y de la capacidad de cómputo (node pools), según el modelo elegido.

**Cuándo encaja:** cuando necesitas primitives y ecosistema Kubernetes (CRDs, control fino de networking/scheduling, herramientas CNCF/Helm/GitOps) o tienes requisitos de plataforma (multi-tenant, políticas, mallas de servicio, control a nivel de nodo) que exceden un PaaS app-centric.

**Qué NO es:**
- No es “cero operación”: aunque el plano de control sea administrado, Kubernetes requiere operación y gobernanza.
- No es la opción más simple para un único servicio web; la complejidad puede ser desproporcionada.

### Azure Container Apps
**Qué es:** plataforma administrada para ejecutar contenedores orientada a microservicios y workloads event-driven, con foco en reducir operación (sin administrar clúster/nodos) y en autoescalado (incluyendo escenarios donde la carga puede caer a casi cero).

**Cuándo encaja:** APIs y microservicios, procesamiento asíncrono, workers y jobs cuando quieres velocidad de entrega y simplicidad operativa, aceptando un conjunto de capacidades “curado” (no toda la superficie Kubernetes).

**Qué NO es:**
- No es Kubernetes “expuesto” para operar como en AKS (no asumas que podrás usar cualquier controlador/operador de Kubernetes).
- No es ideal si necesitas personalizaciones profundas de red/policy típicas de un clúster Kubernetes completo.

### Azure App Service (Containers)
**Qué es:** PaaS para hospedar aplicaciones web y APIs. En modo contenedor, App Service ejecuta tu imagen como la unidad de despliegue de la aplicación, con capacidades PaaS alrededor (configuración, despliegue, escalado, integración con servicios de plataforma).

**Cuándo encaja:** web apps/APIs HTTP con necesidades estándar de hosting, donde el contenedor es un artefacto de entrega y quieres minimizar operación de plataforma. En entornos con requisitos de aislamiento, App Service puede desplegarse en un **App Service Environment (ASE)**.

**Qué NO es:**
- No es un orquestador genérico de microservicios (no esperes semánticas tipo “cluster scheduler” como en AKS).
- No es la mejor opción para cargas puramente batch/event-driven si tu diseño no es “web-first”.

### Azure Virtual Machines (VM) y Virtual Machine Scale Sets (VMSS)
**Qué es:** cómputo IaaS. Tú administras sistema operativo, runtime, parches, agentes, hardening y arquitectura de alta disponibilidad. Con **VMSS** puedes escalar un conjunto de VMs de forma declarativa e integrar balanceo L4/L7.

**Cuándo encaja:** cuando necesitas control del host (drivers/GPU, módulos kernel, herramientas de seguridad específicas), cuando ejecutas software legado o cuando requieres patrones IaaS por restricciones organizacionales.

**Qué NO es:**
- No es PaaS: la carga operativa (parcheo, imágenes, vulnerabilidades, capacidad, backups) recae en tu equipo.
- No es automáticamente más barato: el costo total depende de operación, utilización y arquitectura.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón Azure típico |
|---|---|---|---|
| Kubernetes requerido (API k8s, CRDs, Helm/GitOps) | AKS | Máxima compatibilidad con Kubernetes y su ecosistema | Cliente -> Azure Front Door -> Application Gateway (WAF) -> AKS -> Azure SQL |
| “Serverless containers” con mínimo ops y escalado por eventos/HTTP | Azure Container Apps | Plataforma administrada, foco en simplicidad y autoscaling para microservicios | Cliente -> Azure Front Door -> Container Apps -> Azure SQL |
| Hosting PaaS para una app web/API con contenedor como empaquetado | App Service (Containers) | PaaS app-centric; despliegue y operación simplificados para web | Cliente -> Azure Front Door/CDN -> App Service -> Azure SQL Database |
| Control del SO/host, hardware especial o software fuera de PaaS | Azure VMs / VMSS | Control total y flexibilidad IaaS | Cliente -> Azure Load Balancer -> VMSS -> SQL Server en VM |
| Aislamiento fuerte en red privada (regulated) | AKS privado o Container Apps en entorno privado o App Service Environment | Opciones de despliegue con VNet/privatización para reducir exposición | Usuario interno -> Private DNS -> App Gateway (internal) -> AKS/ASE/Container Apps |
| Migración “lift-and-shift” de una plataforma existente con dependencias host-level | VMs/VMSS (y luego moderniza) | Minimiza cambios iniciales; habilita modernización por fases | Usuarios -> LB/App Gateway -> VMSS -> Servicios de datos |

## 4) Matriz comparativa por criterios

| Dimensión | Comparación (resumen) |
|---|---|
| Nivel de abstracción / operación | **AKS:** administras Kubernetes (gobernanza, add-ons) y capacidad de nodos. <br> **Container Apps:** experiencia administrada; no administras clúster/nodos. <br> **App Service (Containers):** PaaS para una app; operación centrada en la aplicación. <br> **VM/VMSS:** tú administras todo (SO, runtime, parches, capacity). |
| Escalado y HA (Zonas, multi-región si aplica) | **AKS:** HA depende de diseño de node pools, zonas y topología; multi-región requiere arquitectura (por ejemplo, Front Door) y datos replicados. <br> **Container Apps:** escalado automatizado a nivel de app/instancias; HA depende del entorno y región. <br> **App Service:** escalado por instancias del plan/servicio; HA regional según SKU/arquitectura; multi-región vía Front Door/Traffic Manager. <br> **VM/VMSS:** HA por zonas/availability sets y diseño; multi-región manual. |
| Networking y entrada/salida (VNet, Private Link, LB, etc.) | **AKS:** se integra con VNet; patrón típico con Ingress (p. ej. Application Gateway) y opciones de clúster privado. <br> **Container Apps:** opciones de networking del entorno (incluyendo escenarios de red privada) según configuración. <br> **App Service:** integración con VNet para salida; opciones para endpoints privados y, si necesitas aislamiento completo, **ASE**. <br> **VM/VMSS:** full control en VNet; LB (L4) y App Gateway (L7) como front-ends. |
| Seguridad (Entra ID/RBAC, identidades administradas, cifrado) | **AKS:** combina RBAC de Azure + RBAC de Kubernetes; requiere hardening y políticas. <br> **Container Apps/App Service:** RBAC a nivel de recurso + identidades administradas; reduces superficie operativa del clúster. <br> **VM/VMSS:** tú gestionas hardening del SO, agentes y postura; RBAC aplica a recursos; cifrado depende de configuración de discos y datos. |
| Observabilidad (Azure Monitor, logs, métricas, trazas) | **AKS:** requiere estandarizar logs/métricas/trazas (Azure Monitor/Container insights u otros). <br> **Container Apps/App Service:** integración orientada a app (logs/métricas) con menor fricción. <br> **VM/VMSS:** instrumentación y agentes a tu cargo; Azure Monitor para métricas/logs. |
| Portabilidad / lock-in | **AKS:** alta portabilidad a nivel de orquestación (Kubernetes), aunque integraciones Azure pueden introducir dependencia. <br> **Container Apps:** portabilidad media (modelo de plataforma y APIs específicas). <br> **App Service:** portabilidad media-baja (PaaS con modelo propio). <br> **VM/VMSS:** portabilidad alta (IaaS), pero menos eficiencia operativa. |
| Modelo de costes (drivers típicos) | **AKS:** costos de nodos (VMs), balanceadores/egress, almacenamiento; posible costo asociado al tier/SLA del clúster (verifica pricing actual de AKS/control plane/uptime SLA en tu región) [NEEDS_VERIFICATION]. <br> **Container Apps:** consumo por recursos/instancias y eventos de ejecución; egress y servicios dependientes. <br> **App Service:** costo del App Service Plan/instancias (y add-ons); egress y servicios dependientes. <br> **VM/VMSS:** costo de VMs, discos, balanceo, operación (parcheo/gestión). |
| Limitaciones y cuotas relevantes (con fuente) | **AKS:** cuotas/SKUs/regiones: ver `quotas-skus-regions`. <br> **Container Apps:** cuotas del servicio: ver `quotas`. <br> **App Service:** límites por plan/entorno y límites de suscripción: ver `azure-subscription-service-limits` (App Service) y docs de App Service/ASE. <br> **VM/VMSS:** cuotas de cómputo por suscripción/región: ver `azure-subscription-service-limits` (Compute limits). |

Notas:
- Costos y cuotas pueden variar por región y por tipo de oferta; valida en Azure Portal y documentación de límites antes de comprometer arquitectura.

## 5) Patrones recomendados

### Patrón 1: API global “managed-first” (rápido, bajo ops)
```
Cliente -> Azure Front Door -> Azure Container Apps -> Azure SQL Database
                      |-> Azure Monitor (logs/metrics)
```
**Por qué:** minimiza operación de plataforma y acelera time-to-market manteniendo prácticas Well-Architected (observabilidad y separación de capas).

**Cuándo usarlo:** APIs/microservicios con carga variable, equipos pequeños, necesidad de escalar por eventos.

### Patrón 2: Plataforma Kubernetes para microservicios con gobernanza
```
Cliente -> Azure Front Door -> Application Gateway (WAF) -> AKS -> Azure SQL / Cosmos DB
                                                 |-> Azure Monitor / Logs
```
**Por qué:** AKS habilita capacidades completas de Kubernetes (políticas, controladores, herramientas) y un modelo consistente para múltiples equipos.

**Cuándo usarlo:** organización enterprise, plataforma interna, requisitos de políticas/estandarización, workloads complejos.

### Patrón 3: Regulated con aislamiento fuerte (VNet-first)
```
Usuario (red corporativa) -> Private DNS -> Application Gateway (internal) -> App Service Environment (Containers) -> SQL Managed Instance
```
**Por qué:** despliegue en red privada reduce exposición pública y facilita controles de cumplimiento; ASE aporta aislamiento dedicado para App Service.

**Cuándo usarlo:** requisitos de red privada end-to-end, controles estrictos de entrada/salida, dependencia de App Service.

### Patrón 4: Migración por fases (IaaS primero, modernización después)
```
Clientes -> Azure Load Balancer -> VM Scale Set (apps) -> SQL Server en Azure VM
                       |-> Backups/artefactos -> Azure Blob Storage
```
**Por qué:** reduce cambios iniciales en aplicaciones legadas; habilita modernización gradual hacia PaaS/containers.

**Cuándo usarlo:** “lift-and-shift”, dependencias host-level, ventanas de migración acotadas.

## 6) Antipatrones y errores comunes

- Elegir **AKS** para una sola API pequeña “porque es estándar”: suele aumentar complejidad y costo; considera **Container Apps** o **App Service**.
- Usar **VMs** para correr contenedores sin requerimientos de host: pierdes beneficios de PaaS; valida primero **Container Apps/App Service**.
- Asumir que **Container Apps** es “AKS sin clúster” para cualquier cosa: si necesitas controladores, CRDs o políticas avanzadas, ve a **AKS**.
- Diseñar sin **red privada** en entornos regulated y “compensar” solo con WAF: evalúa **Private Link/VNet** y opciones privadas (AKS/ASE/Container Apps).
- Mezclar secretos en variables de entorno sin gobernanza: usa **Key Vault** + identidades administradas (y políticas de rotación).
- Tratar el almacenamiento local del contenedor como persistente: usa servicios de datos administrados o almacenamiento gestionado según el caso.
- No definir estrategia de escalado y límites: revisa cuotas del servicio y configura alertas (Azure Monitor).
- Ignorar el costo de **egress** y dependencias: modela rutas de tráfico y cachés (Front Door/CDN) cuando aplique.

## 7) Checklist de selección (sí/no)

- ¿Necesitas **API Kubernetes**, CRDs, operadores o tooling CNCF? Si sí → **AKS**.
- ¿Tu prioridad es **minimizar operación de plataforma** (sin clúster/nodos) y escalar por eventos/HTTP? Si sí → **Container Apps**.
- ¿Es principalmente una **app web/API HTTP** y quieres PaaS “por aplicación” con despliegue simple? Si sí → **App Service (Containers)**.
- ¿Necesitas **control del host** (drivers, GPU, hardening específico, agentes) o software que no encaja en PaaS? Si sí → **VM/VMSS**.
- ¿Requieres **red privada end-to-end** (entrada/salida) por compliance? Si sí → valida **AKS privado**, **Container Apps en entorno privado** o **ASE**.
- ¿Necesitas **portabilidad Kubernetes** como requisito explícito? Si sí → **AKS** (y estandariza manifests/pipelines).
- ¿Tu equipo puede operar Kubernetes 24x7 (upgrades, políticas, incident response)? Si no → evita **AKS** salvo requisito.

## 8) Referencias (fuentes oficiales)

- Azure Architecture Center: Technology choices overview y Compute decision tree (secciones: visión general + árbol de decisión de cómputo)  
  https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/technology-choices-overview  
  https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree
- Azure Architecture Center: Choose an Azure container service (secciones: comparación y cuándo usar cada opción)  
  https://learn.microsoft.com/en-us/azure/architecture/guide/choose-azure-container-service
- Azure Container Apps: Overview (secciones: qué es y casos de uso)  
  https://learn.microsoft.com/en-us/azure/container-apps/overview
- Azure Container Apps: Compare options (secciones: comparación con AKS/App Service/Functions)  
  https://learn.microsoft.com/en-us/azure/container-apps/compare-options
- AKS: What is AKS (secciones: responsabilidades y conceptos base)  
  https://learn.microsoft.com/en-us/azure/aks/what-is-aks
- AKS: Compare container options with AKS (secciones: cuándo usar AKS vs alternativas)  
  https://learn.microsoft.com/en-us/azure/aks/compare-container-options-with-aks
- App Service: Overview (secciones: conceptos PaaS y capacidades)  
  https://learn.microsoft.com/en-us/azure/app-service/overview
- App Service: App Service Environment overview (secciones: aislamiento y despliegue en VNet)  
  https://learn.microsoft.com/en-us/azure/app-service/environment/overview
- Limits/quotas: AKS quotas/SKUs/regions; Container Apps quotas; Azure subscription service limits (Compute/App Service)  
  https://learn.microsoft.com/en-us/azure/aks/quotas-skus-regions  
  https://learn.microsoft.com/en-us/azure/container-apps/quotas  
  https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits
- Azure Well-Architected Framework (pilares y guías)  
  https://learn.microsoft.com/en-us/azure/well-architected/
