import { candidateData, profileConfigs } from "./resume.data";
import type {
  ExperienceEntry,
  ProfileKey,
  ProfileResume,
  ResumeLang,
  ResumeLength,
  SectionMeta
} from "./types";

const ONE_PAGE_BULLETS_PER_ROLE = 3;

function pickOrderedItems<T>(items: T[], order: number[]): T[] {
  return order.map((index) => items[index]).filter((item) => item !== undefined);
}

function buildExperience(profile: ProfileKey, length: ResumeLength): ExperienceEntry[] {
  const orderByRole = profileConfigs[profile].experienceBulletOrder;

  return candidateData.experience.map((role, roleIndex) => {
    const orderedBullets = pickOrderedItems(role.bullets, orderByRole[roleIndex]);
    const bullets =
      length === "one_page"
        ? orderedBullets.slice(0, ONE_PAGE_BULLETS_PER_ROLE)
        : orderedBullets;

    return {
      ...role,
      bullets
    };
  });
}

function buildCompetencies(profile: ProfileKey): string[] {
  return pickOrderedItems(candidateData.core_competencies, profileConfigs[profile].competencyOrder);
}

export function getSectionOrder(profile: ProfileKey, lang: ResumeLang): SectionMeta[] {
  return profileConfigs[profile].sectionOrder[lang];
}

export function buildProfileResume(
  profile: ProfileKey,
  lang: ResumeLang,
  length: ResumeLength
): ProfileResume {
  const config = profileConfigs[profile];

  return {
    profile,
    lang,
    length,
    name: candidateData.name,
    headline: config.headline[lang],
    contact: candidateData.contact,
    summary: config.summary[lang],
    impact: candidateData.impact_metrics,
    focusTitle: config.focusTitle[lang],
    focusBullets: config.focusBullets[lang],
    competencies: buildCompetencies(profile),
    experience: buildExperience(profile, length),
    certifications: candidateData.certifications,
    languages: candidateData.languages,
    sectionOrder: getSectionOrder(profile, lang)
  };
}

function sectionTitle(
  sectionId: SectionMeta["id"],
  lang: ResumeLang,
  dynamicFocusTitle: string
): string {
  if (sectionId === "focus") {
    return dynamicFocusTitle;
  }

  const titlesEs: Record<Exclude<SectionMeta["id"], "focus">, string> = {
    summary: "Resumen",
    impact: "Impacto",
    experience: "Experiencia",
    skills: "Competencias clave",
    certs: "Certificaciones e Idiomas",
    contact: "Contacto"
  };

  const titlesEn: Record<Exclude<SectionMeta["id"], "focus">, string> = {
    summary: "Summary",
    impact: "Impact",
    experience: "Experience",
    skills: "Core Competencies",
    certs: "Certifications and Languages",
    contact: "Contact"
  };

  return lang === "es" ? titlesEs[sectionId] : titlesEn[sectionId];
}

export function buildResumeMarkdown(
  profile: ProfileKey,
  lang: ResumeLang,
  length: ResumeLength
): string {
  const resume = buildProfileResume(profile, lang, length);
  const lines: string[] = [];

  lines.push(`# ${resume.name}`);
  lines.push(`**${resume.headline}**`);
  lines.push("");

  const contactLabel = lang === "es" ? "Permiso de trabajo" : "Work authorization";
  const preferenceLabel = lang === "es" ? "Preferencia laboral" : "Work preference";
  const contactSegments = [
    resume.contact.email,
    resume.contact.linkedin,
    `${contactLabel}: ${resume.contact.work_authorization}`
  ];

  if (resume.contact.work_preferences) {
    contactSegments.push(`${preferenceLabel}: ${resume.contact.work_preferences}`);
  }

  lines.push(`- ${contactSegments.join(" | ")}`);
  lines.push("");

  resume.sectionOrder.forEach((section) => {
    lines.push(`## ${sectionTitle(section.id, lang, resume.focusTitle)}`);

    if (section.id === "summary") {
      resume.summary.forEach((item) => lines.push(`- ${item}`));
    }

    if (section.id === "impact") {
      resume.impact.forEach((item) => lines.push(`- ${item}`));
    }

    if (section.id === "focus") {
      resume.focusBullets.forEach((item) => lines.push(`- ${item}`));
    }

    if (section.id === "experience") {
      resume.experience.forEach((role) => {
        lines.push(`### ${role.role} | ${role.company}`);
        lines.push(`- ${role.dates}`);
        role.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
      });
    }

    if (section.id === "skills") {
      resume.competencies.forEach((skill) => lines.push(`- ${skill}`));
    }

    if (section.id === "certs") {
      const certLabel = lang === "es" ? "Certificaciones" : "Certifications";
      const langLabel = lang === "es" ? "Idiomas" : "Languages";
      lines.push(`- ${certLabel}: ${resume.certifications.join(", ")}`);
      lines.push(`- ${langLabel}: ${resume.languages.join(", ")}`);
    }

    if (section.id === "contact") {
      lines.push(`- ${resume.contact.email}`);
      lines.push(`- ${resume.contact.linkedin}`);
      lines.push(`- ${contactLabel}: ${resume.contact.work_authorization}`);
      if (resume.contact.work_preferences) {
        lines.push(`- ${preferenceLabel}: ${resume.contact.work_preferences}`);
      }
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

export function buildResumeJson(
  profile: ProfileKey,
  lang: ResumeLang,
  length: ResumeLength
): ProfileResume {
  return buildProfileResume(profile, lang, length);
}
