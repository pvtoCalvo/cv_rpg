# CloudFront vs Global Accelerator

## 1) TL;DR
- Si tu tráfico es **HTTP/HTTPS** y te beneficia **caching**, compresión y capacidades de edge → **Amazon CloudFront**.
- Si necesitas **IPs estáticas anycast** y optimizar **latencia/availability** para **TCP/UDP** hacia endpoints en múltiples regiones → **AWS Global Accelerator**.
- Si tienes una API HTTP global con poco caché pero quieres mejorar performance, CloudFront sigue siendo candidato (con TTL bajos), pero si tu requisito clave es **IP fija** o **UDP** → Global Accelerator.

Reglas rápidas:
- Si necesitas **CDN** → elige **CloudFront**.
- Si necesitas **aceleración de red (L4)** y **static anycast IPs** → elige **Global Accelerator**.

## 2) Qué problema resuelve cada servicio

### Amazon CloudFront
**Qué es:** una CDN para distribuir contenido web (estático y dinámico) mediante una red de edge locations. Se configura con *distributions* y *origins* (S3, ALB, etc.).

**Qué NO es:**
- No es un acelerador genérico para TCP/UDP (está orientado a entrega web HTTP/HTTPS).
- No es un “router global” con IPs anycast estáticas que mantienes independientemente del hostname.

### AWS Global Accelerator
**Qué es:** un servicio de capa de red (L4) donde creas *accelerators* con **IPs estáticas anycast**. Acepta tráfico en edge locations y lo enruta por la red global de AWS hacia endpoints óptimos (ALB, NLB, EC2, EIP, subnets según tipo). Soporta escenarios TCP y UDP.

**Qué NO es:**
- No es una CDN: no cachea contenido.
- No reemplaza WAF/controles a nivel HTTP ni optimizaciones propias de un CDN.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón AWS típico |
|---|---|---|---|
| Distribución global de web estática (caching fuerte) | CloudFront | CDN con caching en edge | Cliente -> CloudFront -> S3 |
| Mejorar performance global de API HTTP/HTTPS | CloudFront | Edge + optimizaciones; TTL bajos si es dinámico | Cliente -> CloudFront -> ALB |
| Acelerar TCP/UDP (gaming, VoIP, IoT) | Global Accelerator | L4, rutas óptimas, edge ingress | Cliente -> GA -> NLB -> EC2 |
| Necesitas IPs estáticas anycast para allowlists/partners | Global Accelerator | IPs fijas asociadas al accelerator | Partner -> GA IPs -> ALB/NLB |
| Failover multi-region a endpoints saludables | Global Accelerator (o CloudFront con origin failover según caso) | GA enruta a endpoint group sano; CloudFront puede hacer origin failover | Cliente -> GA -> (ALB Region A/B) |
| Tráfico altamente cacheable + protección web | CloudFront | CDN + controles web (según stack) | CloudFront -> ALB/S3 |

## 4) Matriz comparativa por criterios

| Criterio | CloudFront | Global Accelerator |
|---|---|---|
| Nivel de abstracción / operación | CDN administrada (distributions, behaviors, origins) | Acelerador L4 administrado (accelerators, listeners, endpoint groups) |
| Escalado y HA | Global por diseño; se apoya en edge | Global por diseño; enruta por red AWS y usa health checks/endpoints |
| Networking y entrada/salida | Orientado a HTTP/HTTPS hacia origins (S3/ALB/etc.) | Entrada por IP anycast; enruta a endpoints (ALB/NLB/EC2/EIP/subnets) |
| Seguridad | Controles a nivel web (TLS, controles por distribution/origin, etc.) | IPs estáticas; control de endpoints y salud; TLS/HTTP depende del endpoint (ALB/NLB) |
| Observabilidad | Métricas/logs de distribución (según configuración) | Métricas del accelerator/endpoints (según configuración) |
| Portabilidad / lock-in | Media (CDN patrón portable, implementación AWS) | Media (aceleración anycast patrón portable, implementación AWS) |
| Modelo de costes (drivers típicos) | Transferencia + requests + features (edge compute, etc.) | Costo por accelerator + data transfer; endpoints aparte |
| Limitaciones y cuotas relevantes (con fuente) | CloudFront tiene cuotas por distributions, funciones, etc. | GA tiene cuotas por accelerators/listeners/endpoint groups/endpoints |

## 5) Patrones recomendados

### Patrón 1: Web estática global
```
Cliente -> CloudFront -> S3
```
**Por qué:** caching en edge y simplicidad operativa.

**Cuándo usarlo:** landing pages, SPAs, descarga de assets.

### Patrón 2: API global con IPs fijas y failover regional
```
Cliente/Partner -> Global Accelerator (anycast IPs)
                -> Endpoint Group (Region A: ALB)
                -> Endpoint Group (Region B: ALB)
                -> ECS/EKS -> DB
```
**Por qué:** mejora disponibilidad y latencia, y facilita allowlists por IP fija.

**Cuándo usarlo:** APIs B2B, partners que exigen allowlists, multi-region activo/pasivo.

### Patrón 3: UDP/TCP de baja latencia (gaming/VoIP)
```
Cliente -> Global Accelerator (UDP/TCP) -> NLB -> EC2 (fleet)
```
**Por qué:** edge ingress + ruteo óptimo para protocolos no HTTP.

**Cuándo usarlo:** juegos, streaming de voz, IoT con UDP.

### Patrón 4: Front web con CDN + origen regional
```
Cliente -> CloudFront -> ALB -> ECS/EKS
```
**Por qué:** CloudFront acelera entrega web y reduce carga al origen.

**Cuándo usarlo:** aplicaciones web con mezcla de contenido cacheable y dinámico.

## 6) Antipatrones y errores comunes
- Intentar usar **CloudFront** para acelerar **UDP/TCP no-HTTP**: usa **Global Accelerator**.
- Asumir que **Global Accelerator** cachea contenido: si necesitas caching, usa **CloudFront**.
- Poner un solo endpoint/una sola región detrás de GA y esperar “resiliencia global”: define múltiples endpoint groups/regiones.
- No definir health checks/failover correctamente y descubrirlo en incidentes.
- No alinear seguridad: CloudFront protege capa web; GA es L4, la protección HTTP depende del origen.

## 7) Checklist de selección (sí/no)
- ¿Tu tráfico es principalmente **HTTP/HTTPS**?
- ¿El contenido es **cacheable** (aunque sea parcialmente) y quieres reducir latencia global?
- ¿Necesitas **IPs estáticas anycast** para allowlists o requisitos regulatorios/partners?
- ¿Necesitas acelerar **TCP/UDP** (no HTTP) globalmente?
- ¿Necesitas failover multi-region a nivel de red hacia endpoints saludables?
- ¿Tu control de seguridad es principalmente web (WAF/HTTP) o de red (L4)?

## 8) Referencias
- AWS Decision Guides: “Choosing an AWS networking and content delivery service” (secciones: Understand/Consider/Choose; incluye CloudFront y Global Accelerator). https://docs.aws.amazon.com/decision-guides/latest/networking-on-aws-how-to-choose/choosing-networking-and-content-delivery-service.html
- Amazon CloudFront Developer Guide: “What is Amazon CloudFront?” https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html
- Amazon CloudFront Developer Guide: “Quotas” (límites por distribuciones y edge features). https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html
- AWS Global Accelerator Developer Guide: “What is AWS Global Accelerator?” (IPs estáticas anycast). https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html
- AWS Global Accelerator Developer Guide: “How AWS Global Accelerator works” (TCP/UDP, edge ingress, conexión TCP terminada en edge). https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-how-it-works.html
- AWS Global Accelerator Developer Guide: “Quotas for AWS Global Accelerator”. https://docs.aws.amazon.com/global-accelerator/latest/dg/limits-global-accelerator.html
- AWS Well-Architected Framework. https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
