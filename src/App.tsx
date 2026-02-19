import { useEffect, useMemo, useRef, useState } from "react";
import { buildProfileResume, buildResumeJson, buildResumeMarkdown, getSectionOrder } from "./resume.builders";
import { initWebMCP } from "./webmcp";
import type { ProfileKey, ResumeLang, SectionMeta } from "./types";

const DEFAULT_PROFILE: ProfileKey = "hybrid";
const LANG_ORDER: ResumeLang[] = ["en", "es"];

function sectionTitleContact(lang: ResumeLang): string {
  return lang === "es" ? "Permiso de trabajo" : "Work authorization";
}

function sectionTitleWorkPreference(lang: ResumeLang): string {
  return lang === "es" ? "Preferencia laboral" : "Work preference";
}

function languageShortLabel(lang: ResumeLang): string {
  return lang === "es" ? "ES" : "EN";
}

function uiCopy(lang: ResumeLang): {
  skipLink: string;
  heroAria: string;
  languageSelector: string;
  actionsLabel: string;
  printButton: string;
  timelineTitle: string;
  timelineHint: string;
  characterTitle: string;
  xpLabel: string;
  levelLabel: string;
  gearLabel: string;
  selectedExpLabel: string;
  summaryTitle: string;
  impactTitle: string;
  skillsTitle: string;
  certifications: string;
  languages: string;
} {
  if (lang === "es") {
    return {
      skipLink: "Saltar al contenido",
      heroAria: "Perfil profesional",
      languageSelector: "Selector de idioma",
      actionsLabel: "Acciones",
      printButton: "Imprimir / Guardar PDF",
      timelineTitle: "Ruta de Experiencia",
      timelineHint: "Empieza en Telfy y cada etapa suma XP, nivel y habilidades.",
      characterTitle: "Personaje",
      xpLabel: "Experiencia",
      levelLabel: "Nivel",
      gearLabel: "Habilidades desbloqueadas",
      selectedExpLabel: "Mision activa",
      summaryTitle: "Resumen",
      impactTitle: "Impacto",
      skillsTitle: "Habilidades",
      certifications: "Certificaciones",
      languages: "Idiomas"
    };
  }

  return {
    skipLink: "Skip to content",
    heroAria: "Professional profile",
    languageSelector: "Language selector",
    actionsLabel: "Actions",
    printButton: "Print / Save PDF",
    timelineTitle: "Experience Route",
    timelineHint: "Starts at Telfy and each stage adds XP, level, and skills.",
    characterTitle: "Character",
    xpLabel: "Experience",
    levelLabel: "Level",
    gearLabel: "Unlocked skills",
    selectedExpLabel: "Active quest",
    summaryTitle: "Summary",
    impactTitle: "Impact",
    skillsTitle: "Skills",
    certifications: "Certifications",
    languages: "Languages"
  };
}

function gearByStage(lang: ResumeLang): string[][] {
  if (lang === "es") {
    const stages = [
      {
        gear: "Taparrabos",
        skills: [
          "Linux & Networking (TCP/IP, DNS, TLS)",
          "Incident Management; RCA/Postmortems; On-call Operations"
        ]
      },
      {
        gear: "Pantalones",
        skills: [
          "Kubernetes Operations",
          "Observability (Prometheus, Grafana, Datadog, ELK, CloudWatch)",
          "MySQL Operations"
        ]
      },
      {
        gear: "Ropa completa",
        skills: [
          "Infrastructure as Code (Terraform, Ansible)",
          "CI/CD and Release Safety (GitLab CI, Argo CD, GitHub Actions)",
          "API Development and Integration",
          "Python Automation",
          "PHP & Laravel",
          "SLOs and Alert Hygiene",
          "Resilience/DR (failover, backup/restore validation)",
          "Cloud Infrastructure (AWS, Azure)"
        ]
      },
      {
        gear: "Ropa completa + Espada + Escudo",
        skills: [
          "Platform Engineering",
          "Site Reliability Engineering (SRE)",
          "Security Baselines/Hardening",
          "Cost Optimization",
          "Hands-on leader setting technical direction and removing blockers"
        ]
      }
    ];

    return stages.map((_, index) => stages.slice(0, index + 1).flatMap((current) => current.skills));
  }

  const stages = [
    {
      gear: "Loincloth",
      skills: [
        "Linux & Networking (TCP/IP, DNS, TLS)",
        "Incident Management; RCA/Postmortems; On-call Operations"
      ]
    },
    {
      gear: "Pants",
      skills: [
        "Kubernetes Operations",
        "Observability (Prometheus, Grafana, Datadog, ELK, CloudWatch)",
        "MySQL Operations"
      ]
    },
    {
      gear: "Full outfit",
      skills: [
        "Infrastructure as Code (Terraform, Ansible)",
        "CI/CD and Release Safety (GitLab CI, Argo CD, GitHub Actions)",
        "API Development and Integration",
        "Python Automation",
        "PHP & Laravel",
        "SLOs and Alert Hygiene",
        "Resilience/DR (failover, backup/restore validation)",
        "Cloud Infrastructure (AWS, Azure)"
      ]
    },
    {
      gear: "Full outfit + Sword + Shield",
      skills: [
        "Platform Engineering",
        "Site Reliability Engineering (SRE)",
        "Security Baselines/Hardening",
        "Cost Optimization",
        "Hands-on leader setting technical direction and removing blockers"
      ]
    }
  ];

  return stages.map((_, index) => stages.slice(0, index + 1).flatMap((current) => current.skills));
}

function renderSectionContent(
  sectionId: SectionMeta["id"],
  resume: ReturnType<typeof buildProfileResume>,
  copy: ReturnType<typeof uiCopy>,
  displayLang: ResumeLang
): JSX.Element | null {
  if (sectionId === "summary") {
    return (
      <ul>
        {resume.summary.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (sectionId === "impact") {
    return (
      <ul>
        {resume.impact.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (sectionId === "focus") {
    return (
      <ul>
        {resume.focusBullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (sectionId === "skills") {
    return (
      <ul className="chip-list" aria-label={copy.skillsTitle}>
        {resume.competencies.map((skill) => (
          <li className="chip" key={skill}>
            {skill}
          </li>
        ))}
      </ul>
    );
  }

  if (sectionId === "certs") {
    return (
      <div className="stack-small">
        <p>
          <strong>{copy.certifications}:</strong> {resume.certifications.join(", ")}
        </p>
        <p>
          <strong>{copy.languages}:</strong> {resume.languages.join(", ")}
        </p>
      </div>
    );
  }

  if (sectionId === "contact") {
    return (
      <ul>
        <li>{resume.contact.email}</li>
        <li>{resume.contact.linkedin}</li>
        <li>
          {sectionTitleContact(displayLang)}: {resume.contact.work_authorization}
        </li>
        {resume.contact.work_preferences ? (
          <li>
            {sectionTitleWorkPreference(displayLang)}: {resume.contact.work_preferences}
          </li>
        ) : null}
      </ul>
    );
  }

  return null;
}

export default function App() {
  const [displayLang, setDisplayLang] = useState<ResumeLang>("en");
  const [selectedStage, setSelectedStage] = useState(0);

  const resume = useMemo(() => buildProfileResume(DEFAULT_PROFILE, displayLang, "extended"), [displayLang]);

  const copy = useMemo(() => uiCopy(displayLang), [displayLang]);

  const langRef = useRef(displayLang);
  langRef.current = displayLang;

  useEffect(() => {
    void initWebMCP({
      getActiveProfile: () => DEFAULT_PROFILE,
      setActiveProfile: () => undefined,
      getActiveLang: () => langRef.current,
      setActiveLang: setDisplayLang,
      getSections: (selectedProfile, lang) => getSectionOrder(selectedProfile, lang),
      getResumeJson: (selectedProfile, lang, length) => buildResumeJson(selectedProfile, lang, length),
      getResumeMarkdown: (selectedProfile, lang, length) =>
        buildResumeMarkdown(selectedProfile, lang, length)
    });
  }, []);

  const journeyExperience = useMemo(() => [...resume.experience].reverse(), [resume.experience]);

  useEffect(() => {
    setSelectedStage(0);
  }, [displayLang]);

  const stageMax = Math.max(1, journeyExperience.length);
  const safeStage = Math.min(selectedStage, stageMax - 1);
  const stageExp = journeyExperience[safeStage];

  const xpPercent = ((safeStage + 1) / stageMax) * 100;
  const level = 1 + safeStage * 7;

  const gearSets = gearByStage(displayLang);
  const gear = gearSets[Math.min(safeStage, gearSets.length - 1)] ?? gearSets[0];

  return (
    <div className="page-shell">
      <a href="#main-content" className="skip-link">
        {copy.skipLink}
      </a>

      <header className="hero card" aria-label={copy.heroAria}>
        <h1>RPG Cristo Fernando</h1>
        <p className="headline">{resume.headline}</p>

        <div className="control-row">
          <nav aria-label={copy.languageSelector} className="toggle lang-toggle">
            {LANG_ORDER.map((option) => {
              const active = option === displayLang;
              return (
                <button
                  key={option}
                  type="button"
                  className={active ? "toggle-btn active" : "toggle-btn"}
                  aria-pressed={active}
                  onClick={() => setDisplayLang(option)}
                >
                  {languageShortLabel(option)}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="actions-row" aria-label={copy.actionsLabel}>
          <button type="button" className="print-btn" onClick={() => window.print()}>
            {copy.printButton}
          </button>
        </div>
      </header>

      <main id="main-content" className="game-layout" aria-live="polite">
        <section className="card character-panel" aria-labelledby="character-title">
          <h2 id="character-title">{copy.characterTitle}</h2>

          <div className={`pixel-character tier-${Math.min(safeStage, 3)}`} aria-hidden="true">
            <span className="pc-shadow" />
            <span className="pc-sprite" />
            <span className="pc-aura" />
          </div>

          <div className="stats-box">
            <p>
              <strong>{copy.levelLabel}:</strong> {level}
            </p>

            <p className="xp-title">
              <strong>{copy.xpLabel}:</strong> {Math.round(xpPercent)}%
            </p>
            <div className="xp-bar" aria-label={`${copy.xpLabel} ${Math.round(xpPercent)}%`}>
              <span className="xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>

            <p>
              <strong>{copy.gearLabel}:</strong>
            </p>
            <ul>
              {gear.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card journey-panel" aria-labelledby="journey-title">
          <h2 id="journey-title">{copy.timelineTitle}</h2>
          <p className="panel-hint">{copy.timelineHint}</p>

          <ol className="journey-list">
            {journeyExperience.map((exp, index) => {
              const current = index === safeStage;
              const completed = index < safeStage;
              const className = current
                ? "journey-node current"
                : completed
                  ? "journey-node completed"
                  : "journey-node";

              return (
                <li key={`${exp.company}-${exp.dates}`}>
                  <button
                    type="button"
                    className={className}
                    aria-pressed={current}
                    onClick={() => setSelectedStage(index)}
                  >
                    <span className="journey-company">{exp.company}</span>
                    <span className="journey-role">{exp.role}</span>
                    <span className="journey-dates">{exp.dates}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {stageExp ? (
            <article className="quest-log">
              <h3>{copy.selectedExpLabel}</h3>
              <p className="quest-title">{stageExp.role} | {stageExp.company}</p>
              <p className="quest-dates">{stageExp.dates}</p>
              <ul>
                {stageExp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </section>
      </main>

      <section className="info-grid">
        <article className="card info-card">
          <h2>{copy.summaryTitle}</h2>
          {renderSectionContent("summary", resume, copy, displayLang)}
        </article>

        <article className="card info-card">
          <h2>{copy.impactTitle}</h2>
          {renderSectionContent("impact", resume, copy, displayLang)}
        </article>

        <article className="card info-card">
          <h2>{copy.skillsTitle}</h2>
          {renderSectionContent("skills", resume, copy, displayLang)}
        </article>
      </section>

      <section className="print-resume" aria-hidden="true">
        {resume.sectionOrder.map((section) => (
          <article key={section.id} className="print-section">
            <h2>{section.title}</h2>

            {section.id === "experience" ? (
              <div>
                {[...resume.experience].reverse().map((role) => (
                  <div key={`${role.company}-${role.role}`} className="print-role">
                    <h3>{role.role} | {role.company}</h3>
                    <p>{role.dates}</p>
                    <ul>
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              renderSectionContent(section.id, resume, copy, displayLang)
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
