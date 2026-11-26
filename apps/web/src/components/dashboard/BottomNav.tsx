"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TodayIcon,
  TasksIcon,
  CalendarIcon,
  FlameIcon,
  InsightsIcon,
  WellbeingIcon,
  SettingsIcon,
  ClockIcon,
  PlusIcon,
  MoreIcon,
} from "@/components/icons";

// Phone-only tab bar (hidden from md up, where the top nav takes over).
// 4 tabs + a central "new task" button; less-used pages live in "Plus".

const tabs = [
  { href: "/dashboard", label: "Aujourd'hui", icon: TodayIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: TasksIcon },
  { href: "/dashboard/calendar", label: "Agenda", icon: CalendarIcon },
];

const more = [
  { href: "/dashboard/habits", label: "Habitudes", icon: FlameIcon },
  { href: "/dashboard/insights", label: "Analyses", icon: InsightsIcon },
  { href: "/dashboard/wellbeing", label: "Bien-être", icon: WellbeingIcon },
  { href: "/dashboard/settings", label: "Réglages", icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function BottomNav({
  onNewTask,
  onFocus,
}: {
  onNewTask: () => void;
  onFocus: () => void;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = more.some((m) => isActive(pathname, m.href));

  // Close the sheet whenever the page changes.
  useEffect(() => setMoreOpen(false), [pathname]);

  const tab = (href: string, label: string, Icon: typeof TodayIcon) => {
    const active = isActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-center gap-1 h-full text-[11px] transition-colors ${
          active ? "text-primary font-medium" : "text-ink-muted"
        }`}
      >
        <Icon size={22} strokeWidth={active ? 2 : 1.6} />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* "Plus" sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-ink/25 animate-[fadeIn_0.15s_ease]" />
          <div
            className="absolute left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] glass rounded-[22px] p-2 animate-[popIn_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {more.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-sm transition-colors ${
                      active ? "bg-primary text-on-fill" : "bg-surface text-ink active:bg-cream"
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  onFocus();
                }}
                className="col-span-2 flex items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-sm bg-surface text-ink active:bg-cream"
              >
                <ClockIcon size={20} />
                Minuteur Pomodoro
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Navigation principale"
        className="md:hidden relative z-40 mx-3 mb-[max(env(safe-area-inset-bottom),12px)] glass rounded-[22px]"
      >
        <div className="flex items-stretch h-[64px] px-1">
          {tab(tabs[0].href, tabs[0].label, tabs[0].icon)}
          {tab(tabs[1].href, tabs[1].label, tabs[1].icon)}

          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={onNewTask}
              aria-label="Nouvelle tâche"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-fill glow-primary"
            >
              <PlusIcon size={24} strokeWidth={2} />
            </button>
          </div>

          {tab(tabs[2].href, tabs[2].label, tabs[2].icon)}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={`flex flex-1 flex-col items-center justify-center gap-1 h-full text-[11px] transition-colors ${
              moreOpen || moreActive ? "text-primary font-medium" : "text-ink-muted"
            }`}
          >
            <MoreIcon size={22} strokeWidth={moreOpen || moreActive ? 2 : 1.6} />
            Plus
          </button>
        </div>
      </nav>
    </>
  );
}
