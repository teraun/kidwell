import type { Locale } from "./locales";
import { getAiLanguageInstruction } from "./locales";

export function parseLocale(value: unknown): Locale {
  if (value === "am" || value === "om" || value === "ti" || value === "en") {
    return value;
  }
  return "en";
}

export function withLocalePrompt(basePrompt: string, locale: Locale): string {
  const lang = getAiLanguageInstruction(locale);
  return lang ? `${basePrompt}\n\n${lang}` : basePrompt;
}
