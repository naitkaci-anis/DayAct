"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogoMark,
  TodayIcon,
  TasksIcon,
  CalendarIcon,
  InsightsIcon,
  WellbeingIcon,
  SettingsIcon,
  BoltIcon,
  PlusIcon,
  ClockIcon,
  FlameIcon,
  SparkIcon,
  SearchIcon,
  BellIcon,
} from "@/components/icons";
import { useStore } from "@/lib/store";
import { useNotifications } from "@/lib/notifications";
import { UserMenu } from "./UserMenu";

const nav = [
  { href: "/dashboard", label: "Aujourd'hui", icon: TodayIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: TasksIcon },
  { href: "/dashboard/calendar", label: "Calendrier", icon: CalendarIcon },
  { href: "/dashboard/habits", label: "Habitudes", icon: FlameIcon },
  { href: "/dashboard/insights", label: "Analyses", icon: InsightsIcon },
  { href: "/dashboard/wellbeing", label: "Bien-être", icon: WellbeingIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function TopNav({
  onNewTask,
  onFocus,
  onChat,
  onSearch,
  onNotifications,
}: {
  onNewTask: () => void;
  onFocus: () => void;
  onChat: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  const pathname = usePathname();
  const { state } = useStore();
  const { unread } = useNotifications();

  return (
    <header className="relative z-30 mx-3 lg:mx-6 mt-[max(env(safe-area-inset-top),12px)] rounded-[22px] glass">
      {/* top row: brand + actions */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-8 h-16">
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-md border border-line bg-surface glow-primary">
            <LogoMark size={20} />
          </div>
          <span className="font-display text-xl font-medium text-primary tracking-tight">
            DayAct
          </span>
        </Link>

        {/* desktop nav tabs — only when there's room (xl+), otherwise the
            scrollable second row below is shown. In-flow (not absolute) so it
            never overlaps the actions. */}
        <nav className="hidden xl:flex items-center gap-0.5 mx-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm whitespace-nowrap transition-colors ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-primary" : "text-ink-muted"}
                />
                {item.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-2 rounded-sm border border-line bg-surface text-sm">
            <BoltIcon size={15} className="text-warning" />
            <span className="text-ink font-medium">{state.settings.energy}%</span>
          </div>

          {/* icon tools group */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSearch}
              className="flex items-center justify-center w-9 h-9 rounded-sm border border-line text-ink-muted hover:text-ink hover:border-line-strong transition-colors"
              aria-label="Rechercher (Ctrl+K)"
              title="Rechercher (Ctrl+K)"
            >
              <SearchIcon size={18} />
            </button>

            <button
              onClick={onNotifications}
              className="relative flex items-center justify-center w-9 h-9 rounded-sm border border-line text-ink-muted hover:text-ink hover:border-line-strong transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <BellIcon size={18} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-danger text-on-fill text-[10px] font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <button
              onClick={onChat}
              className="flex items-center justify-center w-9 h-9 rounded-sm border border-secondary/40 text-secondary hover:bg-secondary/10 transition-colors"
              aria-label="Assistant IA"
              title="Parler à l'assistant"
            >
              <SparkIcon size={18} />
            </button>

            <button
              onClick={onFocus}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-sm border border-line text-ink-muted hover:text-primary hover:border-line-strong transition-colors"
              aria-label="Minuteur Pomodoro"
              title="Minuteur Pomodoro"
            >
              <ClockIcon size={18} />
            </button>
          </div>

          {/* divider */}
          <span className="hidden md:block w-px h-6 bg-line" />

          <button
            onClick={onNewTask}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Tâche</span>
          </button>

          <Link
            href="/dashboard/settings"
            className={`hidden md:flex items-center justify-center w-9 h-9 rounded-sm border transition-colors ${
              isActive(pathname, "/dashboard/settings")
                ? "border-primary text-primary"
                : "border-line text-ink-muted hover:text-ink hover:border-line-strong"
            }`}
            aria-label="Réglages"
          >
            <SettingsIcon size={18} />
          </Link>

          <div className="hidden sm:block">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* compact nav tabs (scrollable second row) — shown below xl */}
      <nav className="hidden md:flex xl:hidden items-center gap-1 px-3 pb-2 overflow-x-auto">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 rounded-sm text-sm transition-colors ${
                active ? "bg-surface text-ink border border-line" : "text-ink-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
