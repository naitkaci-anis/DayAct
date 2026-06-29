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
} from "@/components/icons";
import { useStore } from "@/lib/store";
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
}: {
  onNewTask: () => void;
  onFocus: () => void;
  onChat: () => void;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const { state } = useStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[#0a0a14]/85 backdrop-blur-sm">
      {/* top row: brand + actions */}
      <div className="flex items-center justify-between gap-4 px-5 lg:px-8 h-16">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-deep glow-cyan">
            <LogoMark size={20} />
          </div>
          <span className="text-lg font-light text-gradient-cyan tracking-tight">DayAct</span>
        </Link>

        {/* desktop nav tabs (centered) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm transition-colors ${
                  active ? "text-text" : "text-text-muted hover:text-text hover:bg-deep/50"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-act-cyan" : "text-text-muted"}
                />
                {item.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-act-cyan" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-sm border border-border bg-deep text-sm">
            <BoltIcon size={15} className="text-energy-amber" />
            <span className="text-text font-medium">{state.settings.energy}%</span>
          </div>

          <button
            onClick={onSearch}
            className="flex items-center justify-center w-9 h-9 rounded-sm border border-border text-text-muted hover:text-text hover:border-[#2a3441] transition-colors"
            aria-label="Rechercher (Ctrl+K)"
            title="Rechercher (Ctrl+K)"
          >
            <SearchIcon size={18} />
          </button>

          <button
            onClick={onChat}
            className="flex items-center justify-center w-9 h-9 rounded-sm border border-focus-violet/40 text-focus-violet hover:bg-focus-violet/10 transition-colors"
            aria-label="Assistant IA"
            title="Parler à l'assistant"
          >
            <SparkIcon size={18} />
          </button>

          <button
            onClick={onFocus}
            className="flex items-center justify-center w-9 h-9 rounded-sm border border-border text-text-muted hover:text-act-cyan hover:border-[#2a3441] transition-colors"
            aria-label="Minuteur Pomodoro"
            title="Minuteur Pomodoro"
          >
            <ClockIcon size={18} />
          </button>

          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-act-cyan text-[#0a0a14] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Tâche</span>
          </button>

          <Link
            href="/dashboard/settings"
            className={`flex items-center justify-center w-9 h-9 rounded-sm border transition-colors ${
              isActive(pathname, "/dashboard/settings")
                ? "border-act-cyan text-act-cyan"
                : "border-border text-text-muted hover:text-text hover:border-[#2a3441]"
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

      {/* mobile nav tabs (scrollable second row) */}
      <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 rounded-sm text-sm transition-colors ${
                active ? "bg-deep text-text border border-border" : "text-text-muted"
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
