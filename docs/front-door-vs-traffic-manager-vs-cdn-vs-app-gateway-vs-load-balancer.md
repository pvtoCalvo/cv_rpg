# Azure Front Door vs Azure Traffic Manager vs Azure CDN vs Application Gateway vs Azure Load Balancer

## 1) TL;DR
- Si necesitas **entrada global L7 en el edge** (routing, failover multi-región por solicitud, TLS, WAF y, en muchos casos, caching) → **Azure Front Door**.
- Si necesitas **balanceo global por DNS** (simple, funciona para HTTP y no-HTTP, también para endpoints fuera de Azure) → **Azure Traffic Manager**.
- Si necesitas **cache de contenido estático** en edge y no quieres un “front door” de aplicación completo → **Azure CDN**.
- Si necesitas **balanceo L7 regional dentro de una VNet** (HTTP/S, reverse proxy, WAF, backends privados) → **Azure Application Gateway**.
- Si necesitas **balanceo L4 regional** (TCP/UDP) para VMs/VMSS y workloads no HTTP → **Azure Load Balancer**.

Reglas rápidas:
- Global + HTTP/S + WAF/routing avanzado → **Front Door**.
- Global + DNS (no proxy) → **Traffic Manager**.
- Static cache → **CDN** (o Front Door si quieres unificar entrypoint).
- Regional + HTTP/S en VNet → **Application Gateway**.
- Regional + TCP/UDP → **Load Balancer**.

## 2) Qué problema resuelve cada servicio

### Azure Front Door
**Qué es:** punto de entrada global para aplicaciones web (L7) en el edge, con capacidades de aceleración/ruteo y opciones de seguridad (por ejemplo, WAF) según SKU.

**Cuándo encaja:** aplicaciones públicas multi-región, mejora de latencia global, failover activo-activo, enrutamiento por host/path, y cuando quieres centralizar TLS y políticas de seguridad a nivel global.

**Qué NO es:**
- No es un balanceador L4 genérico para TCP/UDP.
- No reemplaza un balanceador regional dentro de VNet cuando necesitas control “in-VNet” del front-end (para eso suele encajar Application Gateway o Load Balancer).

### Azure Traffic Manager
**Qué es:** balanceo global basado en DNS. Devuelve al cliente el endpoint “mejor” según política (prioridad, performance, weighted, etc.). No es un proxy: el tráfico de la aplicación no pasa por Traffic Manager.

**Cuándo encaja:** failover global simple, balanceo entre endpoints heterogéneos (Azure y no-Azure), y escenarios donde DNS-based routing es suficiente.

**Qué NO es:**
- No ofrece WAF ni terminación TLS (no ve el tráfico HTTP).
- No garantiza conmutación instantánea por solicitud: depende de TTL/propagación/cachés DNS.

### Azure CDN
**Qué es:** red de entrega de contenido para cachear y servir contenido estático (y algunos patrones de aceleración) desde edge, reduciendo latencia y carga sobre el origen.

**Cuándo encaja:** estáticos (imágenes, JS/CSS, descargas), media, y cuando quieres reducir egress/latencia desde Blob/App Service/orígenes web.

**Qué NO es:**
- No es el front door ideal para routing complejo de microservicios; para eso suele encajar Front Door o Application Gateway.
- No es un balanceador L4.

### Azure Application Gateway
**Qué es:** balanceador L7 regional para HTTP/S con reverse proxy y opciones de WAF. Se despliega en una VNet y se usa para publicar backends (incluyendo privados) dentro de esa red.

**Cuándo encaja:** entrada regional con requisitos de WAF, TLS end-to-end, path-based routing hacia múltiples backends, y como patrón común de ingress regional para AKS.

**Qué NO es:**
- No es un servicio global: es regional; para global necesitas Front Door/Traffic Manager.
- No es L4 (TCP/UDP).

### Azure Load Balancer
**Qué es:** balanceador L4 regional para TCP/UDP. Se usa típicamente con VMs/VMSS para exponer servicios no HTTP o para balanceo básico sin capacidades L7.

**Cuándo encaja:** protocolos no HTTP, alta performance L4, exposición de servicios de VM/VMSS y escenarios donde un reverse proxy L7 no aplica.

**Qué NO es:**
- No ofrece WAF, routing por path/host, ni terminación TLS a nivel aplicación.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón Azure típico |
|---|---|---|---|
| Entrada global HTTP/S con routing, failover y WAF | Front Door | Servicio global L7 en edge para apps web | Cliente -> Front Door (WAF) -> App Service/AKS (multi-región) |
| Balanceo/failover global simple por DNS (cualquier protocolo) | Traffic Manager | DNS-based, no proxy; funciona con endpoints diversos | Cliente -> DNS (Traffic Manager) -> Endpoint A/B |
| Cache y entrega de estáticos desde edge | Azure CDN | Optimiza latencia y reduce carga/egress del origen | Cliente -> CDN -> Blob/App Service |
| Entrada regional HTTP/S en VNet con WAF y backends privados | Application Gateway | Reverse proxy L7 en VNet; WAF y routing por path/host | Cliente -> App Gateway (WAF) -> AKS/VMs |
| Balanceo regional TCP/UDP para VMs/VMSS | Load Balancer | L4 de alta performance para servicios no HTTP | Cliente -> Load Balancer -> VMSS |
| Global entry + backends privados por región (defensa en profundidad) | Front Door + Application Gateway | Edge global + control L7 regional in-VNet | Cliente -> Front Door -> App Gateway -> AKS/VMs |

## 4) Matriz comparativa por criterios

| Dimensión | Comparación (resumen) |
|---|---|
| Nivel de abstracción / operación | **Front Door/CDN/Traffic Manager:** servicios globales administrados; operas perfiles/endpoints/reglas/políticas. <br> **Application Gateway/Load Balancer:** recursos regionales en tu suscripción/VNet; operas listeners/rules/probes y capacidad según SKU. |
| Escalado y HA (Zonas, multi-región si aplica) | **Front Door/CDN/Traffic Manager:** diseñados para uso global y patrones multi-región. <br> **Application Gateway/Load Balancer:** regionales; HA dentro de región depende de SKU/configuración y del diseño del backend; multi-región se logra combinando con Front Door/Traffic Manager y replicando backends. |
| Networking y entrada/salida (VNet, Private Link, etc.) | **Front Door/CDN:** front-end global; para orígenes privados hay opciones/patrones específicos (por ejemplo, Private Link/origin privado) que dependen del SKU y del tipo de origen; verifica soporte actual para tu caso [NEEDS_VERIFICATION]. <br> **Traffic Manager:** DNS-only; no toca VNet. <br> **Application Gateway/Load Balancer:** viven en VNet/subnets; aptos para publicar backends privados y segmentación de red. |
| Seguridad (Entra ID/RBAC, WAF, TLS, aislamiento) | **Front Door/App Gateway:** opciones de WAF y políticas a nivel L7 (según SKU). <br> **CDN:** controles a nivel edge según SKU; no sustituye WAF completo en todos los casos. <br> **Traffic Manager/Load Balancer:** no aportan WAF L7; se complementan con WAF, DDoS y controles de red. |
| Observabilidad (Azure Monitor) | Todos exponen métricas y diagnósticos hacia Azure Monitor. Define alertas por health probes, tasa de errores, latencia y disponibilidad por región. |
| Portabilidad / lock-in | **Traffic Manager:** lock-in bajo (concepto DNS). <br> **Front Door/CDN/App Gateway/Load Balancer:** lock-in medio por reglas/terminología, aunque conceptos (proxy/CDN/LB) son estándar. |
| Modelo de costes (drivers típicos) | **Front Door/CDN:** requests, reglas/features, transferencia/egress; WAF puede agregar costo. <br> **Traffic Manager:** consultas DNS y endpoints monitoreados. <br> **Application Gateway:** capacidad/SKU/instancias y procesamiento; WAF puede agregar costo. <br> **Load Balancer:** reglas, data processed y SKU. |
| Limitaciones y cuotas relevantes (con fuente) | Límites por servicio y suscripción: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits <br> Restricciones específicas de Traffic Manager: https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-restrictions |

## 5) Patrones recomendados

### Patrón 1: App global multi-región (edge-first)
```
Cliente -> Azure Front Door (WAF) -> Region A (App Service/AKS) -> DB
                         |-> Region B (App Service/AKS) -> DB
```
**Por qué:** Front Door enruta por proximidad/salud y habilita failover activo-activo; centraliza políticas globales.

**Cuándo usarlo:** aplicaciones globales, necesidad de baja latencia y resiliencia multi-región.

### Patrón 2: Defensa en profundidad con front door global y gateway regional en VNet
```
Cliente -> Front Door (WAF) -> Application Gateway (WAF, regional) -> AKS/VMs (private)
```
**Por qué:** Front Door aporta edge global; Application Gateway controla entrada regional dentro de VNet, útil para segmentación y backends privados.

**Cuándo usarlo:** enterprise/regulated, backends privados, políticas regionales y control de red.

### Patrón 3: DNS-based failover (simple y heterogéneo)
```
Cliente -> DNS (Traffic Manager) -> Endpoint A (Azure) / Endpoint B (no-Azure)
```
**Por qué:** Traffic Manager funciona incluso si los endpoints no están detrás de un proxy global; útil para DR y migraciones.

**Cuándo usarlo:** failover simple, coexistencia Azure y on-prem/otros clouds, protocolos no HTTP.

### Patrón 4: Estáticos en edge
```
Cliente -> Azure CDN -> Azure Blob Storage
```
**Por qué:** reduce latencia y costo de salida del origen, y descarga el backend.

**Cuándo usarlo:** SPAs, imágenes, media, descargas y assets versionados.

## 6) Antipatrones y errores comunes

- Usar **Traffic Manager** esperando failover inmediato por solicitud: al ser DNS-based, depende de TTL/cachés; para control L7 por request usa **Front Door**.
- Usar **Load Balancer** para apps HTTP esperando features L7 (WAF, path routing, TLS): usa **Application Gateway** o **Front Door**.
- Usar **Application Gateway** como entrypoint global entre continentes: es regional; usa **Front Door** para global.
- Usar **CDN** como front door de APIs dinámicas con routing complejo: evalúa **Front Door** o **Application Gateway**.
- Duplicar capas sin motivo (CDN + Front Door + App Gateway) sin modelar latencia/costo: simplifica a lo mínimo que cumple requisitos.
- No definir probes/health checks correctos: genera failovers erráticos o “flapping”.
- No planificar certificados y terminación TLS: define dónde termina TLS y si requieres end-to-end.
- Exponer backends públicos innecesariamente: prioriza backends privados y patrones de origen privado cuando aplique.

## 7) Checklist de selección (sí/no)

- ¿Necesitas un **entrypoint global** para HTTP/S con routing avanzado y WAF? Si sí → **Front Door**.
- ¿Necesitas balanceo global para **protocolos no HTTP** o endpoints fuera de Azure, y DNS es suficiente? Si sí → **Traffic Manager**.
- ¿Tu necesidad principal es **cachear estáticos** en edge? Si sí → **Azure CDN** (o Front Door si quieres unificar).
- ¿Necesitas **WAF/routing L7 regional** en una **VNet** con backends privados? Si sí → **Application Gateway**.
- ¿Necesitas balanceo **L4 TCP/UDP** regional para VMs/VMSS? Si sí → **Load Balancer**.
- ¿Tu escenario es regulated y requiere minimizar exposición pública del backend? Si sí → **Front Door + App Gateway** (y backends privados) es un patrón común.
- ¿Tienes requisitos explícitos de multi-región y RTO bajo? Si sí → diseña activo-activo con **Front Door** y datos replicados.

## 8) Referencias (fuentes oficiales)

- Azure Architecture Center: Load balancing options (secciones: comparativa y cuándo usar cada opción)  
  https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview
- Azure Front Door best practices (secciones: recomendaciones operativas y diseño)  
  https://learn.microsoft.com/en-us/azure/frontdoor/best-practices
- Azure Front Door overview (secciones: qué es y capacidades)  
  https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview
- Traffic Manager overview (secciones: DNS-based routing y métodos)  
  https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview
- Traffic Manager restrictions (secciones: límites y consideraciones)  
  https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-restrictions
- Azure CDN overview (secciones: casos de uso de CDN)  
  https://learn.microsoft.com/en-us/azure/cdn/cdn-overview
- Application Gateway overview (secciones: L7, WAF, despliegue en VNet)  
  https://learn.microsoft.com/en-us/azure/application-gateway/overview
- Azure Load Balancer overview (secciones: L4 y escenarios típicos)  
  https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview
- Azure subscription/service limits (secciones: cuotas por servicio de red)  
  https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits
- Azure Well-Architected Framework (pilares y guías)  
  https://learn.microsoft.com/en-us/azure/well-architected/
