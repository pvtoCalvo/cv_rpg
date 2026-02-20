# S3 vs EBS vs EFS vs FSx

## 1) TL;DR
- Si necesitas **storage de objetos** (data lake, backups, estáticos, logs) y acceso por API/HTTP → **Amazon S3**.
- Si necesitas **disco/bloque** de baja latencia para **una instancia** (boot, DB en EC2, filesystem local) → **Amazon EBS**.
- Si necesitas **filesystem compartido** (NFS) montable por múltiples instancias/contendedores en una VPC → **Amazon EFS**.
- Si necesitas un **filesystem específico** por protocolo/semántica/performance (SMB Windows, Lustre HPC, NetApp ONTAP, OpenZFS) → **Amazon FSx** (elige el tipo adecuado).

Reglas rápidas:
- Si tu aplicación habla “GET/PUT por objeto” → elige **S3**.
- Si tu aplicación espera un **disco** (block device) → elige **EBS**.
- Si tu aplicación espera un **mount NFS compartido** → elige **EFS**.
- Si necesitas **SMB/Windows** o HPC tipo Lustre → elige **FSx**.

## 2) Qué problema resuelve cada servicio

### Amazon S3
**Qué es:** almacenamiento de objetos altamente escalable. Ideal para datos no estructurados, estáticos, backups, data lakes y *artifact storage*.

**Qué NO es:**
- No es un disco (block device) ni un filesystem POSIX montable vía NFS/SMB.
- No es “shared file storage” para aplicaciones que requieren locks/semánticas POSIX completas.

### Amazon EBS
**Qué es:** almacenamiento en bloques para instancias EC2 (volúmenes). Se comporta como un disco que montas en una instancia.

**Qué NO es:**
- No es object storage.
- No es un filesystem compartido de propósito general (para eso, EFS/FSx).

### Amazon EFS
**Qué es:** filesystem administrado accesible por NFS (orientado a Linux/POSIX) que puede montarse desde múltiples clientes.

**Qué NO es:**
- No es block storage.
- No es SMB/Windows nativo (para eso, FSx for Windows File Server).

### Amazon FSx
**Qué es:** familia de filesystems administrados para casos donde necesitas un filesystem “con apellido”:
- **FSx for Windows File Server** (SMB/Windows).
- **FSx for Lustre** (HPC / alto rendimiento).
- **FSx for NetApp ONTAP** (features ONTAP).
- **FSx for OpenZFS** (semántica ZFS).

**Qué NO es:**
- No es object storage.
- No es block storage.
- No es “uno solo”: el tipo de FSx define protocolo, performance y features.

## 3) Tabla de decisión

| Necesidad | Elige | Por qué | Patrón AWS típico |
|---|---|---|---|
| Data lake, backups, logs, estáticos | S3 | Objeto, escalable, integra con analytics y CDN | CloudFront -> S3 (static) |
| Disco para EC2 (boot, DB en EC2, low-latency block) | EBS | Block device para una instancia | EC2 -> EBS -> Snapshots |
| Compartir archivos entre múltiples instancias/containers (Linux) | EFS | NFS administrado, mount múltiple | ECS/EKS/EC2 -> EFS |
| Windows file shares (SMB) | FSx for Windows | Semántica Windows/SMB administrada | EC2 Windows -> FSx Windows |
| HPC/ML training con alto throughput | FSx for Lustre | Filesystem HPC, puede integrarse con S3 | EC2 HPC -> FSx Lustre <-> S3 |
| Migración/compatibilidad con ONTAP | FSx for NetApp ONTAP | Features ONTAP administradas | EC2/EKS -> FSx ONTAP |
| Necesitas POSIX compartido pero con requisitos de performance específicos | EFS o FSx (según caso) | EFS general; FSx si necesitas “filesystem con features” | App -> (EFS/FSx) |

## 4) Matriz comparativa por criterios

| Criterio | S3 | EBS | EFS | FSx |
|---|---|---|---|---|
| Nivel de abstracción / operación | Objeto administrado (API) | Block device administrado por volumen | Filesystem NFS administrado | Filesystem administrado (varios tipos) |
| Escalado y HA | Escala a nivel de objetos/buckets; patrones multi-region con replicación cuando aplique | Durabilidad/HA según diseño; atado a la zona/arquitectura EC2 | Diseñado para acceso compartido en VPC; HA administrada | Depende del tipo de FSx; orientado a necesidades específicas |
| Networking y entrada/salida | Acceso por endpoints/Internet; integra con CloudFront | Adjunta a instancias EC2 | Montaje NFS dentro de VPC | Montaje/uso según protocolo (SMB/NFS/Lustre) dentro de VPC |
| Seguridad | IAM/bucket policies, cifrado SSE/KMS | IAM + cifrado (KMS) + control a nivel de instancia | IAM + SG/NACL + cifrado (KMS) | IAM + cifrado + control según tipo/protocolo |
| Observabilidad | CloudWatch/CloudTrail (según configuración) | Métricas de volumen/snapshots | Métricas/alerts de throughput, etc. | Métricas específicas por tipo (capacidad/throughput/backups) |
| Portabilidad / lock-in | Media (API S3 es estándar de facto pero con features AWS) | Media (block estándar, pero integración AWS) | Media (NFS estándar) | Variable: protocolos estándar (SMB/NFS/Lustre) pero servicio administrado AWS |
| Modelo de costes (drivers típicos) | GB-mes por clase + requests + transferencia | GB-mes por tipo de volumen + IOPS/throughput (según tipo) | GB-mes + throughput (según modo) | GB-mes + throughput/capacidad según tipo |
| Limitaciones y cuotas relevantes (con fuente) | Tamaño máximo de objeto determinado por multipart upload: hasta 53.7 TB (48.8 TiB) y 10,000 partes | Tamaños de volumen dependen del tipo: p. ej. hasta 64 TiB para ciertos tipos | Tamaño máximo de archivo 47.9 TiB (límite por archivo) y cuotas de throughput/recursos | Ejemplo FSx Lustre: mínimos de capacidad (SSD/HDD) y cuotas por filesystem; cuotas varían por tipo |

## 5) Patrones recomendados

### Patrón 1: Web estática y assets
```
Cliente -> CloudFront -> S3
          |-> (logs) S3
```
**Por qué:** CloudFront reduce latencia y descarga el origin; S3 simplifica hosting de assets.

**Cuándo usarlo:** SPA, contenido estático, descargas.

### Patrón 2: App stateful en EC2 con disco
```
EC2 (ASG) -> EBS (por instancia)
          -> Snapshots (backup)
```
**Por qué:** EBS encaja con filesystem local y baja latencia por instancia.

**Cuándo usarlo:** workloads legacy en EC2, componentes que requieren block storage.

### Patrón 3: Compartir uploads entre contenedores
```
Cliente -> ALB -> ECS (Fargate/EC2) -> EFS
```
**Por qué:** varios tasks/instancias necesitan ver el mismo árbol de archivos.

**Cuándo usarlo:** procesamiento de archivos, CMS, pipelines simples.

### Patrón 4: HPC/Analytics con FSx for Lustre + S3
```
S3 (dataset) <-> FSx for Lustre -> EC2 HPC/ML
```
**Por qué:** S3 como data lake barato; FSx Lustre como capa de alto rendimiento para cómputo intensivo.

**Cuándo usarlo:** training/EDA/HPC, IO intensivo.

## 6) Antipatrones y errores comunes
- Tratar **S3** como si fuera un filesystem POSIX compartido (locks, rename semantics): usa **EFS/FSx** o rediseña.
- Usar **EBS** para compartir archivos entre muchas instancias: usa **EFS** o **FSx**.
- Usar **EFS** como si fuera object storage para millones de objetos pequeños sin revisar performance/costos: evalúa S3.
- Elegir **FSx** sin especificar el tipo (Windows/Lustre/ONTAP/OpenZFS): define protocolo y requisitos primero.
- No planear backup/DR (snapshots, replicación, versioning): define RPO/RTO y usa servicios administrados.
- Copiar datos “a mano” entre capas en vez de usar patrones nativos (S3 <-> FSx Lustre, snapshots, lifecycle).

## 7) Checklist de selección (sí/no)
- ¿Tu app consume/produce datos como **objetos** vía API (HTTP) o como **archivos montados**?
- ¿Necesitas un **block device** para un filesystem local o un motor que exige disco?
- ¿Necesitas **compartir** el mismo conjunto de archivos entre múltiples compute nodes?
- ¿Necesitas **SMB/Windows** o NFS/Linux?
- ¿Tu workload es **HPC/ML** con alta demanda de throughput/IOPS?
- ¿Necesitas clases de almacenamiento/retención/lifecycle (S3) o performance predecible (EBS/FSx)?
- ¿Cuál es tu RPO/RTO y cómo lo cumplirás (snapshots, replicación, multi-region)?

## 8) Referencias
- AWS Decision Guides: “Choosing an AWS storage service” (secciones: Definitions, Consider, Choose). https://docs.aws.amazon.com/decision-guides/latest/storage-on-aws-how-to-choose/choosing-aws-storage-service.html
- Amazon S3 User Guide: “Working with Amazon S3 objects” (nota sobre tamaño máximo de objeto 53.7 TB / 48.8 TiB). https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingObjects.html
- Amazon S3 User Guide: “Amazon S3 multipart upload limits” (máx. 10,000 partes; tamaños). https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
- Amazon EBS User Guide: “Amazon EBS volume types” (rangos de tamaño/IOPS/throughput por tipo). https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html
- Amazon EFS User Guide: “Amazon EFS quotas” (tamaño máximo de archivo 47.9 TiB y cuotas). https://docs.aws.amazon.com/efs/latest/ug/limits.html
- Amazon FSx for Lustre User Guide: “Service quotas for Amazon FSx for Lustre” (mínimos y cuotas por filesystem). https://docs.aws.amazon.com/fsx/latest/LustreGuide/limits.html
- AWS Well-Architected Framework. https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
