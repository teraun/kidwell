export type Locale = "en" | "am" | "om" | "ti";

export const LOCALES: {
  code: Locale;
  label: string;
  native: string;
  aiLanguage: string;
  usesEthiopicScript: boolean;
}[] = [
  {
    code: "en",
    label: "English",
    native: "English",
    aiLanguage: "English",
    usesEthiopicScript: false,
  },
  {
    code: "am",
    label: "Amharic",
    native: "አማርኛ",
    aiLanguage: "Amharic",
    usesEthiopicScript: true,
  },
  {
    code: "om",
    label: "Afaan Oromo",
    native: "Afaan Oromoo",
    aiLanguage: "Afaan Oromo",
    usesEthiopicScript: false,
  },
  {
    code: "ti",
    label: "Tigrinya",
    native: "ትግርኛ",
    aiLanguage: "Tigrinya",
    usesEthiopicScript: true,
  },
];

export function getAiLanguageInstruction(locale: Locale): string {
  const lang = LOCALES.find((l) => l.code === locale)?.aiLanguage ?? "English";
  if (locale === "en") return "";
  return `Write all user-facing text (summary, rationale, concerns, conversation starters) in ${lang}. JSON keys stay in English.`;
}

export function detectDefaultLocale(): Locale {
  if (typeof navigator === "undefined") return "am";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("am")) return "am";
  if (lang.startsWith("om")) return "om";
  if (lang.startsWith("ti")) return "ti";
  return "en";
}

export function usesEthiopicFont(locale: Locale): boolean {
  return LOCALES.find((l) => l.code === locale)?.usesEthiopicScript ?? false;
}
