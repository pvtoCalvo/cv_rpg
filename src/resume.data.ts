import type { CandidateData, ProfileConfig, ProfileKey } from "./types";

export const candidateData: CandidateData = {
  name: "Cristo Fernando Abadia Lopez",
  headline_base: "Platform Lead / Principal DevOps & Site Reliability Engineer",
  contact: {
    email: "cv@kram.pro",
    linkedin: "linkedin.com/in/cristo-abadia",
    work_authorization: "EU passport holder",
    work_preferences: "Remoto, Híbrido, Presencial (Flexible)"
  },
  summary_facts: [
    "10+ years owning production reliability, delivery standards, and operational excellence",
    "Cloud and Kubernetes environments",
    "Platform foundations and guardrails (Infrastructure as Code, CI/CD, release safety)",
    "Observability, incident management, postmortem-led hardening",
    "Hands-on leader setting technical direction and removing blockers"
  ],
  impact_metrics: [
    "Reduced time-to-root-cause by 35% via actionable diagnostics and operational visibility for infrastructure and Kubernetes health",
    "Improved mean time to detect (MTTD) by 25% via alert hygiene and SLO-aligned dashboards",
    "Reduced cost by 20% while improving uptime via tuned autoscaling/routing policies and monitoring improvements across tiers",
    "Reduced manual operational effort by 20% via standardizing and automating day-2 operations workflows",
    "Reduced downtime by 30% via disciplined incident response, RCA, and permanent fixes across Linux/network layers"
  ],
  core_competencies: [
    "Platform Engineering",
    "Site Reliability Engineering (SRE)",
    "Kubernetes Operations",
    "Cloud Infrastructure (AWS 60%, Azure 40%)",
    "Infrastructure as Code (Terraform, Ansible)",
    "CI/CD and Release Safety (GitLab CI, Argo CD, GitHub Actions)",
    "Observability (Prometheus, Grafana, Datadog, ELK, CloudWatch)",
    "Incident Management; RCA/Postmortems; On-call Operations",
    "SLOs and Alert Hygiene",
    "Resilience/DR (failover, backup/restore validation)",
    "Linux & Networking (TCP/IP, DNS, TLS)",
    "Security Baselines/Hardening",
    "Cost Optimization",
    "MySQL Operations",
    "API Development and Integration",
    "Python Automation",
    "PHP & Laravel"
  ],
  experience: [
    {
      company: "KRAM.PRO / Freelance",
      role: "Production and Systems Engineer",
      dates: "Nov 2022 - Present",
      bullets: [
        "Owned design and operation of production Kubernetes platform patterns (multi-AZ connectivity, ingress/LB/WAF, network segmentation, storage/CSI, rollout strategies).",
        "Introduced diagnostics and operational visibility for kernel/disk/NIC issues and Kubernetes node health; reduced time-to-root-cause by 35%.",
        "Standardized cloud networking and IAM changes with Infrastructure as Code, adding drift detection, policy checks, operational runbooks, and API-driven automation workflows in Python and PHP/Laravel.",
        "Improved release reliability by embedding checks and controls for infrastructure/platform changes and promoting consistent delivery practices.",
        "Led incident response and postmortems end-to-end; converted findings into preventative fixes and platform standards."
      ]
    },
    {
      company: "Comunistone SL",
      role: "Senior SRE & DevOps (Tech Lead)",
      dates: "Nov 2021 - Nov 2022",
      bullets: [
        "Hands-on tech lead establishing DevOps/SRE guardrails across Infrastructure as Code, CI/CD, observability, and API delivery patterns, including Python automation and PHP/Laravel service practices for multiple teams.",
        "Improved delivery pipelines and release strategies (progressive delivery and rollback readiness) to reduce deployment risk.",
        "Standardized AWS/Azure foundations and hardened images to strengthen security baselines and enable repeatable provisioning.",
        "Improved mean time to detect by 25% through alert tuning and SLO-aligned dashboards; aligned monitoring to operational health reviews and on-call readiness.",
        "Strengthened resilience through failover and restore exercises for Kubernetes and MySQL across regions; validated backup/restore procedures and runbooks."
      ]
    },
    {
      company: "BB PHONE LENVATE SL",
      role: "Site Reliability Engineer",
      dates: "Nov 2019 - Nov 2021",
      bullets: [
        "Built cross-tier observability and alerting (application, load balancer, database); reduced cost by 20% and improved uptime via tuned autoscaling and routing policies.",
        "Led Kubernetes enablement with standardized deployment templates, ingress patterns, operational playbooks, and security controls.",
        "Supported MySQL operations and reliability improvements, coordinating upgrades and validating backup/restore procedures.",
        "Participated in on-call operations and incident response; produced RCAs and improved runbooks to reduce recurring incidents.",
        "Reduced operational toil through API integrations, Python-based automation, and PHP/Laravel operational tooling standardization."
      ]
    },
    {
      company: "Telfy Telecom SL",
      role: "Site Reliability Engineer",
      dates: "Aug 2014 - Nov 2019",
      bullets: [
        "Owned DNS/DHCP services in a telecom production environment, ensuring stability and availability for core network workloads.",
        "Standardized and automated OSS workflows and operational tasks through API integrations, Python automation, and PHP/Laravel tooling, reducing manual effort by 20% and improving process reliability.",
        "Owned and maintained provisioning/operations support systems (including an ACS - Auto Configuration Server) and internal services supporting day-to-day operations.",
        "Led incident troubleshooting across Linux and networking layers (TCP/IP, DNS, TLS), driving RCA and permanent fixes; reduced downtime by 30%.",
        "Created SOPs/runbooks and standardized processes to speed up incident response and knowledge sharing."
      ]
    }
  ],
  certifications: ["Kubestronaut", "CKA", "CKAD", "CKS", "KCNA", "KCSA"],
  languages: ["Spanish", "English"]
};

export const profileLabels: Record<ProfileKey, string> = {
  platform_sre: "Platform/SRE",
  devops: "DevOps",
  hybrid: "Hybrid"
};

export const profileConfigs: Record<ProfileKey, ProfileConfig> = {
  platform_sre: {
    headline: {
      es: "Platform Lead / Principal Site Reliability Engineer",
      en: "Platform Lead / Principal Site Reliability Engineer"
    },
    summary: {
      es: [
        "10+ años liderando fiabilidad en producción, estándares de entrega y excelencia operativa.",
        "Experiencia en entornos Cloud y Kubernetes con foco en estabilidad, observabilidad y operaciones.",
        "Disponibilidad para guardias on-call y operación continua en producción.",
        "Impulsa SLOs, higiene de alertas y gestión de incidentes con postmortems orientados a hardening.",
        "Liderazgo hands-on de alcance técnico transversal, definiendo dirección y removiendo bloqueos de ejecución."
      ],
      en: [
        "10+ years improving production reliability, delivery standards, and operational excellence.",
        "Deep background in cloud and Kubernetes environments with a reliability-first mindset.",
        "Available for on-call rotations and continuous production support.",
        "Drives SLOs, alert hygiene, incident management, and postmortem-driven hardening.",
        "Hands-on technical leader with cross-functional ownership who sets direction and removes delivery blockers."
      ]
    },
    focusTitle: {
      es: "Fiabilidad y Observabilidad",
      en: "Reliability and Observability"
    },
    focusBullets: {
      es: [
        "SLOs y alerta accionable alineada a salud operacional.",
        "Gestión de incidentes, RCA y postmortems con acciones permanentes.",
        "Resiliencia/DR con ejercicios de failover y validación de backup/restore.",
        "Operación de Kubernetes en producción con prácticas estandarizadas."
      ],
      en: [
        "SLO-driven operations and actionable alerting tied to service health.",
        "Incident response, RCA, and postmortems converted into durable fixes.",
        "Resilience/DR practice through failover drills and backup/restore validation.",
        "Production Kubernetes operations with repeatable standards."
      ]
    },
    sectionOrder: {
      es: [
        { id: "summary", title: "Resumen" },
        { id: "impact", title: "Impacto" },
        { id: "focus", title: "Fiabilidad y Observabilidad" },
        { id: "experience", title: "Experiencia" },
        { id: "skills", title: "Competencias clave" },
        { id: "certs", title: "Certificaciones e Idiomas" },
        { id: "contact", title: "Contacto" }
      ],
      en: [
        { id: "summary", title: "Summary" },
        { id: "impact", title: "Impact" },
        { id: "focus", title: "Reliability and Observability" },
        { id: "experience", title: "Experience" },
        { id: "skills", title: "Core Competencies" },
        { id: "certs", title: "Certifications and Languages" },
        { id: "contact", title: "Contact" }
      ]
    },
    competencyOrder: [1, 0, 2, 6, 8, 7, 9, 10, 3, 4, 12, 11, 13, 14, 15, 16, 5],
    experienceBulletOrder: [
      [1, 4, 0, 3, 2],
      [3, 4, 0, 1, 2],
      [0, 3, 1, 2, 4],
      [3, 0, 4, 1, 2]
    ]
  },
  devops: {
    headline: {
      es: "Platform Lead / Principal DevOps Engineer",
      en: "Platform Lead / Principal DevOps Engineer"
    },
    summary: {
      es: [
        "10+ años elevando estándares de entrega, fiabilidad y excelencia operativa en producción.",
        "Construye foundations y guardrails de plataforma con IaC, CI/CD y release safety.",
        "Disponibilidad para guardias on-call con foco en estabilidad operativa.",
        "Opera entornos Cloud y Kubernetes con automatización y procesos repetibles de day-2.",
        "Liderazgo hands-on de alcance transversal para coordinar equipos y eliminar bloqueos técnicos críticos."
      ],
      en: [
        "10+ years raising delivery standards, reliability, and operational excellence in production.",
        "Builds platform guardrails across IaC, CI/CD, and release safety controls.",
        "Available for on-call rotations with a reliability-first operating mindset.",
        "Runs cloud and Kubernetes platforms with day-2 automation and repeatable workflows.",
        "Hands-on cross-functional lead aligning teams and removing critical technical blockers."
      ]
    },
    focusTitle: {
      es: "Entrega, IaC y CI/CD",
      en: "Delivery, IaC and CI/CD"
    },
    focusBullets: {
      es: [
        "Estandarización de cambios de infraestructura con IaC, drift detection y policy checks.",
        "Pipelines y estrategias de release con readiness de rollback y menor riesgo de despliegue.",
        "Guardrails de plataforma para múltiples equipos y prácticas de entrega consistentes.",
        "Hardening de imágenes y bases de seguridad para aprovisionamiento repetible."
      ],
      en: [
        "Infrastructure changes standardized with IaC, drift detection, and policy checks.",
        "Pipeline and release patterns focused on rollback readiness and safer deployments.",
        "Platform guardrails scaled across multiple teams with consistent delivery standards.",
        "Image hardening and security baselines for repeatable provisioning."
      ]
    },
    sectionOrder: {
      es: [
        { id: "summary", title: "Resumen" },
        { id: "impact", title: "Impacto" },
        { id: "focus", title: "Entrega, IaC y CI/CD" },
        { id: "experience", title: "Experiencia" },
        { id: "skills", title: "Competencias clave" },
        { id: "certs", title: "Certificaciones e Idiomas" },
        { id: "contact", title: "Contacto" }
      ],
      en: [
        { id: "summary", title: "Summary" },
        { id: "impact", title: "Impact" },
        { id: "focus", title: "Delivery, IaC and CI/CD" },
        { id: "experience", title: "Experience" },
        { id: "skills", title: "Core Competencies" },
        { id: "certs", title: "Certifications and Languages" },
        { id: "contact", title: "Contact" }
      ]
    },
    competencyOrder: [5, 4, 14, 15, 16, 0, 3, 11, 2, 6, 7, 8, 9, 12, 10, 13, 1],
    experienceBulletOrder: [
      [2, 3, 0, 4, 1],
      [0, 1, 2, 3, 4],
      [1, 4, 0, 2, 3],
      [1, 2, 4, 3, 0]
    ]
  },
  hybrid: {
    headline: {
      es: "Platform Lead / Principal DevOps & Site Reliability Engineer",
      en: "Platform Lead / Principal DevOps & Site Reliability Engineer"
    },
    summary: {
      es: [
        "10+ años combinando fiabilidad en producción, estándares de entrega y excelencia operativa.",
        "Experiencia en Cloud y Kubernetes construyendo foundations, guardrails y operación estable.",
        "Disponibilidad para guardias on-call y respuesta a incidentes.",
        "Aplica observabilidad, incident management y postmortems para mejoras permanentes.",
        "Perfil hands-on de liderazgo técnico transversal: dirección, ejecución y eliminación de bloqueos."
      ],
      en: [
        "10+ years balancing production reliability, delivery standards, and operational excellence.",
        "Cloud and Kubernetes experience across platform foundations, guardrails, and stable operations.",
        "Available for on-call rotations and incident response coverage.",
        "Uses observability, incident management, and postmortems to drive permanent improvements.",
        "Hands-on cross-functional technical leadership across strategy, execution, and blocker removal."
      ]
    },
    focusTitle: {
      es: "Fiabilidad y Entrega",
      en: "Reliability and Delivery"
    },
    focusBullets: {
      es: [
        "Equilibrio entre estabilidad operativa y velocidad de entrega con controles de release.",
        "IaC, CI/CD y observabilidad como base común para operación y entrega confiables.",
        "Respuesta a incidentes y RCA integradas con mejoras de plataforma.",
        "Automatización y estandarización de operaciones day-2 para reducir toil."
      ],
      en: [
        "Balances operational stability with delivery speed through release controls.",
        "IaC, CI/CD, and observability as a shared foundation for reliable operations and delivery.",
        "Incident response and RCA tightly integrated with platform improvements.",
        "Day-2 automation and standardization to reduce operational toil."
      ]
    },
    sectionOrder: {
      es: [
        { id: "summary", title: "Resumen" },
        { id: "impact", title: "Impacto" },
        { id: "focus", title: "Fiabilidad y Entrega" },
        { id: "experience", title: "Experiencia" },
        { id: "skills", title: "Competencias clave" },
        { id: "certs", title: "Certificaciones e Idiomas" },
        { id: "contact", title: "Contacto" }
      ],
      en: [
        { id: "summary", title: "Summary" },
        { id: "impact", title: "Impact" },
        { id: "focus", title: "Reliability and Delivery" },
        { id: "experience", title: "Experience" },
        { id: "skills", title: "Core Competencies" },
        { id: "certs", title: "Certifications and Languages" },
        { id: "contact", title: "Contact" }
      ]
    },
    competencyOrder: [0, 1, 5, 4, 14, 15, 16, 2, 6, 7, 8, 9, 3, 11, 10, 12, 13],
    experienceBulletOrder: [
      [0, 1, 2, 3, 4],
      [0, 3, 1, 2, 4],
      [0, 1, 3, 4, 2],
      [0, 1, 3, 2, 4]
    ]
  }
};
