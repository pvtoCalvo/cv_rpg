# ALB vs API Gateway vs NLB

## 1) Tabla de decision: ALB vs API Gateway vs NLB (AWS)

| Si necesitas… | Elige | Por qué (en 1 línea) | Patrón típico AWS |
|---|---|---|---|
| Tráfico NO-HTTP (TCP/UDP), protocolos propios, IoT/telemetría | NLB | Balanceo L4 para TCP/UDP/TLS/QUIC, muy eficiente a nivel de red | Internet/VPC -> NLB -> servicio (ECS/EKS/EC2) |
| HTTP/HTTPS con routing por host/path/headers (p. ej. /users vs /orders) | ALB | Balanceo L7 con reglas avanzadas de enrutamiento | Internet/VPC -> ALB -> Target Groups (ECS/EKS/EC2/Lambda) |
| Publicar una API como producto (auth, cuotas, throttling, stages) | API Gateway | Capa de API management gestionado | Clientes -> API Gateway -> (Lambda) o (VPC Link -> ALB/NLB) |
| WebSocket para tiempo real (rutas $connect/$disconnect) | API Gateway (WebSocket API) | WebSocket nativo orientado a APIs y rutas | Clientes -> WebSocket API -> Lambda/HTTP backend |
| WebSockets como parte de una app web (upgrade WS dentro de la app) | ALB | Soporta WebSockets y enrutamiento HTTP | Internet -> ALB -> app |
| gRPC hacia microservicios | ALB | Encaja bien con routing L7 (HTTP/2/gRPC) | Internet/VPC -> ALB -> servicios gRPC |
| IP estática de entrada o preservar IP origen del cliente | NLB | Mejor opción para requisitos de red/L4 y origen | Internet -> NLB -> servicio |
| Backend en VPC privado pero API pública con gobierno | API Gateway + VPC Link | API pública + backend privado (sin exponer ALB/NLB) | Clientes -> API GW -> VPC Link -> ALB/NLB privado -> servicios |
| Quieres CORS + JWT/OIDC y una API ligera | API Gateway (HTTP API) | Más simple/ligero para APIs HTTP modernas | Clientes -> HTTP API -> Lambda / VPC Link |
| Necesitas API Keys / Usage Plans, validación avanzada, caché de stage, features enterprise | API Gateway (REST API) | Set más completo de funcionalidades | Clientes -> REST API -> Lambda / VPC Link |
| Solo necesitas front door HTTP (TLS, health checks, balanceo) sin gestión de API | ALB | Balanceo L7 estándar para apps HTTP | Internet -> ALB -> app |
| WAF en la entrada (seguridad L7) | API Gateway (REST) o ALB + WAF | Depende si es API-producto (GW) o app (ALB) | (Opcional CloudFront+WAF) -> GW/ALB |

## 2) Tabla de decision: tipos de API Gateway

| Si necesitas… | Tipo de API Gateway | Recomendación rápida |
|---|---|---|
| API HTTP moderna, simple, con JWT/OIDC, CORS, menor complejidad | HTTP API | Elige esta por defecto si no necesitas features avanzadas |
| Planes por cliente, API Keys/Usage Plans, validación más potente, caché de stage, más controles | REST API | Elige esta si necesitas gobierno y funcionalidades enterprise |
| Comunicación bidireccional en tiempo real (chat, live updates) | WebSocket API | Elige esta si necesitas conexión persistente y push desde backend |

## 3) Regla rápida (ultra-resumen)

- ¿No es HTTP? -> NLB
- ¿Es HTTP y quieres routing L7 (host/path)? -> ALB
- ¿Necesitas API management (auth/cuotas/planes/stages)? -> API Gateway
  - Simple/ligero -> HTTP API
  - Avanzado/enterprise -> REST API
  - Tiempo real bidireccional -> WebSocket API

## 4) Referencias

- AWS ALB docs: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html
- AWS NLB docs: https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html
- AWS API Gateway docs: https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html
