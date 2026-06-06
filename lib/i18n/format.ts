import type { Locale } from "./locales";

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-ET",
  am: "am-ET",
  om: "om-ET",
  ti: "ti-ET",
};

export function formatDate(date: string | Date, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(DATE_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
