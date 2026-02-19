import type { ProfileKey, ResumeLang, ResumeLength, SectionMeta } from "./types";

type UserInteractionResult = boolean | { confirmed?: boolean; accepted?: boolean };

type RequestUserInteraction = (input: {
  type?: "confirm" | string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) => Promise<UserInteractionResult>;

interface ToolClient {
  requestUserInteraction?: RequestUserInteraction;
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: {
    readOnlyHint: boolean;
  };
  execute: (input: unknown, client?: ToolClient) => Promise<unknown> | unknown;
}

interface ModelContextAPI {
  provideContext?: (ctx: { tools: WebMCPTool[] }) => Promise<void> | void;
  registerTool?: (tool: WebMCPTool) => Promise<void> | void;
}

declare global {
  interface Navigator {
    modelContext?: ModelContextAPI;
  }
}

interface WebMCPOptions {
  getActiveProfile: () => ProfileKey;
  setActiveProfile: (profile: ProfileKey) => void;
  getActiveLang: () => ResumeLang;
  setActiveLang?: (lang: ResumeLang) => void;
  getSections: (profile: ProfileKey, lang: ResumeLang) => SectionMeta[];
  getResumeJson: (profile: ProfileKey, lang: ResumeLang, length: ResumeLength) => unknown;
  getResumeMarkdown: (profile: ProfileKey, lang: ResumeLang, length: ResumeLength) => string;
}

const PROFILES: ProfileKey[] = ["platform_sre", "devops", "hybrid"];

function parseProfile(value: unknown, fallback: ProfileKey): ProfileKey {
  if (value === "platform_sre" || value === "devops" || value === "hybrid") {
    return value;
  }

  return fallback;
}

function parseLang(value: unknown, fallback: ResumeLang): ResumeLang {
  if (value === "en" || value === "es") {
    return value;
  }

  return fallback;
}

function parseLength(value: unknown): ResumeLength {
  return value === "extended" ? "extended" : "one_page";
}

function parseBooleanResult(result: UserInteractionResult | undefined | null): boolean {
  if (typeof result === "boolean") {
    return result;
  }

  if (!result || typeof result !== "object") {
    return false;
  }

  return Boolean(result.confirmed ?? result.accepted);
}

function createTools(options: WebMCPOptions): WebMCPTool[] {
  return [
    {
      name: "list_profiles",
      description: "Returns the available resume profile variants.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: () => PROFILES
    },
    {
      name: "list_sections",
      description: "Returns section ids and titles for a profile variant.",
      inputSchema: {
        type: "object",
        properties: {
          profile: {
            type: "string",
            enum: PROFILES
          },
          lang: {
            type: "string",
            enum: ["es", "en"]
          }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: (input: unknown) => {
        const parsed = (input ?? {}) as { profile?: string; lang?: string };
        const profile = parseProfile(parsed.profile, options.getActiveProfile());
        const lang = parseLang(parsed.lang, options.getActiveLang());
        return options.getSections(profile, lang).map((section) => ({
          id: section.id,
          title: section.title
        }));
      }
    },
    {
      name: "get_resume_json",
      description: "Returns typed resume data for a profile and language.",
      inputSchema: {
        type: "object",
        properties: {
          profile: {
            type: "string",
            enum: PROFILES
          },
          lang: {
            type: "string",
            enum: ["es", "en"]
          },
          length: {
            type: "string",
            enum: ["one_page", "extended"]
          }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: (input: unknown) => {
        const parsed = (input ?? {}) as { profile?: string; lang?: string; length?: string };
        const profile = parseProfile(parsed.profile, options.getActiveProfile());
        const lang = parseLang(parsed.lang, options.getActiveLang());
        const length = parseLength(parsed.length);

        return options.getResumeJson(profile, lang, length);
      }
    },
    {
      name: "get_resume_markdown",
      description: "Returns resume markdown for a profile, language, and length.",
      inputSchema: {
        type: "object",
        properties: {
          profile: {
            type: "string",
            enum: PROFILES
          },
          lang: {
            type: "string",
            enum: ["es", "en"]
          },
          length: {
            type: "string",
            enum: ["one_page", "extended"]
          }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: (input: unknown) => {
        const parsed = (input ?? {}) as { profile?: string; lang?: string; length?: string };
        const profile = parseProfile(parsed.profile, options.getActiveProfile());
        const lang = parseLang(parsed.lang, options.getActiveLang());
        const length = parseLength(parsed.length);

        return options.getResumeMarkdown(profile, lang, length);
      }
    },
    {
      name: "download_pdf",
      description: "Requests user confirmation and opens print dialog for PDF export.",
      inputSchema: {
        type: "object",
        properties: {
          profile: {
            type: "string",
            enum: PROFILES
          },
          lang: {
            type: "string",
            enum: ["es", "en"]
          }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: async (input: unknown, client?: ToolClient) => {
        const parsed = (input ?? {}) as { profile?: string; lang?: string };
        const profile = parseProfile(parsed.profile, options.getActiveProfile());
        const lang = parseLang(parsed.lang, options.getActiveLang());

        let approved = true;

        if (client && typeof client.requestUserInteraction === "function") {
          const promptMessage =
            lang === "es"
              ? "Se abrira el cuadro de impresion para guardar el CV como PDF. Quieres continuar?"
              : "This will open the print dialog to save the resume as PDF. Continue?";

          const interactionResult = await client.requestUserInteraction({
            type: "confirm",
            message: promptMessage,
            confirmLabel: lang === "es" ? "Continuar" : "Continue",
            cancelLabel: lang === "es" ? "Cancelar" : "Cancel"
          });

          approved = parseBooleanResult(interactionResult);
        }

        if (!approved) {
          return { status: "cancelled" };
        }

        options.setActiveProfile(profile);
        if (options.setActiveLang) {
          options.setActiveLang(lang);
        }
        window.print();
        return { status: "ok" };
      }
    }
  ];
}

export async function initWebMCP(options: WebMCPOptions): Promise<void> {
  const modelContext = navigator.modelContext;

  if (!modelContext) {
    return;
  }

  const tools = createTools(options);

  if (typeof modelContext.provideContext === "function") {
    await modelContext.provideContext({ tools });
    return;
  }

  if (typeof modelContext.registerTool === "function") {
    await Promise.all(tools.map((tool) => modelContext.registerTool?.(tool)));
  }
}
