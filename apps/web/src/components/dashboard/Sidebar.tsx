"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogoMark,
  TodayIcon,
  TasksIcon,
  CalendarIcon,
  FlameIcon,
  InsightsIcon,
  WellbeingIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  SparkIcon,
  PlusIcon,
  ClockIcon,
} from "@/components/icons";
import { useNotifications } from "@/lib/notifications";
import { UserMenu } from "./UserMenu";

// Computer & tablet navigation: a calm column on the left.

export const mainNav = [
  { href: "/dashboard", label: "Aujourd'hui", icon: TodayIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: TasksIcon },
  { href: "/dashboard/calendar", label: "Agenda", icon: CalendarIcon },
  { href: "/dashboard/habits", label: "Habitudes", icon: FlameIcon },
  { href: "/dashboard/insights", label: "Analyses", icon: InsightsIcon },
  { href: "/dashboard/wellbeing", label: "Bien-être", icon: WellbeingIcon },
];

export function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar({
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
  const { unread } = useNotifications();

  const tool =
    "w-full flex items-center gap-3 min-h-[44px] px-3 rounded-[12px] text-[15px] text-ink/80 hover:bg-ink/[0.05] hover:text-ink transition-colors";

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-6 border-r border-line bg-panel/70 px-4 py-6 overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-[12px] border border-line bg-surface">
          <LogoMark size={22} />
        </span>
        <span className="font-display text-2xl font-medium text-primary tracking-tight">DayAct</span>
      </Link>

      <button
        onClick={onNewTask}
        className="flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-primary text-on-fill text-[15px] font-medium hover:bg-primary-hover transition-colors"
      >
        <PlusIcon size={18} />
        Nouvelle tâche
      </button>

      <nav aria-label="Navigation principale" className="flex flex-col gap-1">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 min-h-[46px] px-3 rounded-[12px] text-[15px] transition-colors ${
                active ? "bg-primary text-on-fill" : "text-ink/80 hover:bg-ink/[0.05] hover:text-ink"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <button onClick={onChat} className={tool}>
          <SparkIcon size={19} className="text-secondary" />
          Assistant
        </button>
        <button onClick={onSearch} className={tool}>
          <SearchIcon size={19} />
          <span className="flex-1 text-left">Rechercher</span>
          <kbd className="text-[11px] text-ink-muted font-sans">Ctrl K</kbd>
        </button>
        <button onClick={onNotifications} className={tool}>
          <BellIcon size={19} />
          <span className="flex-1 text-left">Notifications</span>
          {unread > 0 && (
            <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-danger text-on-fill text-xs font-semibold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={onFocus}
          className="flex items-center gap-3 rounded-[18px] bg-secondary text-on-fill p-4 text-left hover:opacity-95"
        >
          <ClockIcon size={22} />
          <span>
            <span className="block text-xs uppercase tracking-[0.06em] text-on-fill/80">Focus</span>
            <span className="block font-display text-xl leading-tight">Lancer 25 min</span>
          </span>
        </button>
        <div className="flex items-center gap-3 px-1">
          <UserMenu placement="up" />
          <Link
            href="/dashboard/settings"
            aria-current={isActive(pathname, "/dashboard/settings") ? "page" : undefined}
            className="flex items-center gap-2 min-h-[44px] text-[15px] text-ink/80 hover:text-ink"
          >
            <SettingsIcon size={18} />
            Réglages
          </Link>
        </div>
      </div>
    </aside>
  );
}
