# AWS Decision Guides Internos (Comparativas)

Tabla resumen:

| Comparativa | Útil cuando… | Documento |
|---|---|---|
| ALB vs API Gateway vs NLB | Estás eligiendo front door, tipo de balanceo y nivel de gestión de API | ./alb-vs-api-gateway-vs-nlb.md |
| ECS vs EC2 vs EKS (incluye Fargate) | Estás eligiendo plataforma de contenedores y nivel de operación | ./ecs-vs-ec2-vs-eks.md |
| SQS vs SNS vs EventBridge | Estás diseñando mensajería/eventos y desacople entre servicios | ./sqs-vs-sns-vs-eventbridge.md |
| S3 vs EBS vs EFS vs FSx | Estás eligiendo tipo de almacenamiento (objeto/bloque/archivo) | ./s3-vs-ebs-vs-efs-vs-fsx.md |
| RDS vs Aurora vs DynamoDB | Estás eligiendo base de datos (relacional vs NoSQL) | ./rds-vs-aurora-vs-dynamodb.md |
| CloudFront vs Global Accelerator | Estás optimizando entrega global (CDN vs aceleración L4) | ./cloudfront-vs-global-accelerator.md |

## Cómo usar estas guías

- Empieza por el **TL;DR**: si tu caso encaja, ya tienes una primera elección.
- Usa la **Tabla de decisión** para mapear necesidades concretas a un servicio (y un patrón típico).
- Recorre la **Matriz comparativa** para validar trade-offs en operación, HA, seguridad, observabilidad, lock-in y costos.
- Elige un **Patrón recomendado** como baseline y adapta según tu RPO/RTO, latencia, compliance y topología (multi-account/multi-region).
- Revisa **Antipatrones**: suelen explicar por qué “algo que funciona” termina siendo frágil o caro.
- Completa el **Checklist** (sí/no) como revisión final antes de comprometerte.

Convenciones:
- Cualquier punto marcado como **[NEEDS_VERIFICATION]** indica que falta confirmar un detalle (por ejemplo, una cuota/región/feature específica) y se explica qué verificar.
- Las cuotas y límites pueden variar por región y cambiar con el tiempo: revisa siempre las referencias oficiales y el servicio **Service Quotas** cuando aplique.
