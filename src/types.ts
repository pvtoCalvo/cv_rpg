export type ProfileKey = "platform_sre" | "devops" | "hybrid";
export type ResumeLang = "es" | "en";
export type ResumeLength = "one_page" | "extended";

export interface Contact {
  phone?: string;
  email: string;
  linkedin: string;
  work_authorization: string;
  work_preferences?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface CandidateData {
  name: string;
  headline_base: string;
  contact: Contact;
  summary_facts: string[];
  impact_metrics: string[];
  core_competencies: string[];
  experience: ExperienceEntry[];
  certifications: string[];
  languages: string[];
}

export interface SectionMeta {
  id: "summary" | "impact" | "focus" | "experience" | "skills" | "certs" | "contact";
  title: string;
}

export interface ProfileConfig {
  headline: Record<ResumeLang, string>;
  summary: Record<ResumeLang, string[]>;
  focusTitle: Record<ResumeLang, string>;
  focusBullets: Record<ResumeLang, string[]>;
  sectionOrder: Record<ResumeLang, SectionMeta[]>;
  competencyOrder: number[];
  experienceBulletOrder: number[][];
}

export interface ProfileResume {
  profile: ProfileKey;
  lang: ResumeLang;
  length: ResumeLength;
  name: string;
  headline: string;
  contact: Contact;
  summary: string[];
  impact: string[];
  focusTitle: string;
  focusBullets: string[];
  competencies: string[];
  experience: ExperienceEntry[];
  certifications: string[];
  languages: string[];
  sectionOrder: SectionMeta[];
}
