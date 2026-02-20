import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

type GuideCategory = "aws" | "azure" | "monitoring" | "other";

type Guide = {
  id: string;
  filename: string;
  title: string;
  markdown: string;
  category: GuideCategory;
};

const rawDocs = import.meta.glob("../../docs/*.md", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

const preferredOrder = [
  "index.md",
  "aks-vs-container-apps-vs-app-service-vs-vms.md",
  "service-bus-vs-event-grid-vs-event-hubs-vs-queue-storage.md",
  "blob-vs-managed-disks-vs-azure-files-vs-azure-netapp-files.md",
  "azure-sql-vs-managed-instance-vs-sql-vm-vs-cosmosdb.md",
  "front-door-vs-traffic-manager-vs-cdn-vs-app-gateway-vs-load-balancer.md",
  "alb-vs-api-gateway-vs-nlb.md",
  "ecs-vs-ec2-vs-eks.md",
  "sqs-vs-sns-vs-eventbridge.md",
  "s3-vs-ebs-vs-efs-vs-fsx.md",
  "rds-vs-aurora-vs-dynamodb.md",
  "cloudfront-vs-global-accelerator.md"
];

function fileFromPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function titleFromMarkdown(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) {
    return fallback;
  }

  return match[1].trim();
}

function inferCategory(filename: string, content: string): GuideCategory {
  const signal = `${filename} ${content}`.toLowerCase();

  if (/(aws|alb|nlb|api gateway|ecs|eks|ec2|sqs|sns|eventbridge|aurora|rds|dynamodb|cloudfront)/.test(signal)) {
    return "aws";
  }

  if (
    /azure|aks|container apps|app service|service bus|event grid|event hubs|queue storage|blob|managed disks|azure files|netapp|cosmos db|front door|traffic manager|app gateway|sql vm/.test(
      signal
    )
  ) {
    return "azure";
  }

  if (/(monitor|monitorizacion|observability|prometheus|grafana|datadog|elk|cloudwatch)/.test(signal)) {
    return "monitoring";
  }

  return "other";
}

function buildGuides(): Guide[] {
  const parsed = Object.entries(rawDocs).map(([path, markdown]) => {
    const filename = fileFromPath(path);
    const id = slugFromFilename(filename);

    return {
      id,
      filename,
      title: titleFromMarkdown(markdown, id),
      markdown,
      category: inferCategory(filename, markdown)
    } satisfies Guide;
  });

  parsed.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.filename);
    const bIndex = preferredOrder.indexOf(b.filename);

    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    }

    return a.title.localeCompare(b.title);
  });

  return parsed;
}

const guides = buildGuides();

const initialGuideId =
  guides.find((guide) => guide.id === "alb-vs-api-gateway-vs-nlb")?.id ?? guides[0]?.id ?? "";

const sectionConfig: Array<{ id: GuideCategory; label: string }> = [
  { id: "azure", label: "Azure" },
  { id: "aws", label: "AWS" },
  { id: "monitoring", label: "Monitorizacion" },
  { id: "other", label: "Otros" }
];

function selectedGuideFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return null;
  }

  const params = new URLSearchParams(hash);
  return params.get("guide");
}

export default function ComparacionesApp() {
  const [selectedGuideId, setSelectedGuideId] = useState(initialGuideId);

  useEffect(() => {
    const applyFromHash = () => {
      const id = selectedGuideFromHash();
      if (id && guides.some((guide) => guide.id === id)) {
        setSelectedGuideId(id);
      }
    };

    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.id === selectedGuideId) ?? guides[0],
    [selectedGuideId]
  );

  const html = useMemo(() => {
    if (!selectedGuide) {
      return "<p>No hay guias cargadas en /docs.</p>";
    }

    const rawHtml = marked.parse(selectedGuide.markdown, { async: false }) as string;

    return rawHtml
      .replace(/href="\.\/([^"]+)\.md"/g, (_, guideSlug: string) => `href="#guide=${guideSlug}"`)
      .replace(/href="([^"]+)\.md"/g, (_, guideSlug: string) => `href="#guide=${guideSlug}"`);
  }, [selectedGuide]);

  const chooseGuide = (guideId: string) => {
    setSelectedGuideId(guideId);
    window.history.replaceState(null, "", `#guide=${guideId}`);
  };

  return (
    <main className="comparaciones-page">
      <header className="comparaciones-card hero">
        <p className="tag">Decision Guides</p>
        <h1>Comparaciones</h1>
      </header>

      <div className="comparaciones-layout">
        <aside className="comparaciones-card nav-card" aria-label="Guia selector">
          {sectionConfig.map((section) => {
            const sectionGuides = guides.filter((guide) => guide.category === section.id);

            if (sectionGuides.length === 0) {
              return null;
            }

            return (
              <section key={section.id} className="nav-section">
                <h2>{section.label}</h2>
                <ul>
                  {sectionGuides.map((guide) => {
                    const active = guide.id === selectedGuide?.id;

                    return (
                      <li key={guide.id}>
                        <button
                          type="button"
                          className={active ? "guide-btn active" : "guide-btn"}
                          aria-pressed={active}
                          onClick={() => chooseGuide(guide.id)}
                        >
                          {guide.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </aside>

        <section className="comparaciones-card doc-card" aria-live="polite">
          {selectedGuide ? (
            <>
              <p className="doc-meta">Guia activa: {selectedGuide.title}</p>
              <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
            </>
          ) : (
            <p>No hay guias disponibles.</p>
          )}
        </section>
      </div>
    </main>
  );
}
