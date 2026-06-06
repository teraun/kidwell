"use client";

import {
  Heart,
  LayoutDashboard,
  LogOut,
  Salad,
  ClipboardList,
  Users,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type Role = "student" | "parent" | "counsellor";

type Props = {
  user: { full_name: string; role: Role };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export function DashboardLayout({
  user,
  activeTab,
  onTabChange,
  onLogout,
  children,
}: Props) {
  const { t } = useI18n();

  const navByRole: Record<Role, { id: string; label: string; icon: React.ReactNode }[]> = {
    student: [
      { id: "checkin", label: t("navCheckin"), icon: <Heart className="h-4 w-4" /> },
      { id: "nutrition", label: t("navNutrition"), icon: <Salad className="h-4 w-4" /> },
    ],
    parent: [
      { id: "overview", label: t("navOverview"), icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
    counsellor: [
      { id: "students", label: t("navStudents"), icon: <Users className="h-4 w-4" /> },
      { id: "briefs", label: t("navBriefs"), icon: <ClipboardList className="h-4 w-4" /> },
    ],
  };

  const nav = navByRole[user.role];
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === "student"
      ? t("student")
      : user.role === "parent"
        ? t("parent")
        : t("counsellor");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{t("appName")}</p>
            <p className="text-xs text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t p-4 space-y-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.full_name}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px]">
                {roleLabel}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("logOut")}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="font-bold">{t("appName")}</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">
              {nav.find((n) => n.id === activeTab)?.label ?? activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <LanguageSwitcher compact />
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user.full_name}</span>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="outline" className="text-xs">
                {roleLabel}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b bg-card p-2 md:hidden">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
