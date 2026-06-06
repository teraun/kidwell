"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {t("language")}
        </span>
      )}
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="h-9 min-w-[9rem] gap-1 border-muted bg-background text-xs">
          <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="font-medium">{l.native}</span>
              {l.code !== "en" && (
                <span className="ml-1 text-muted-foreground">({l.label})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
