"use client";

import Link from "next/link";
import { LogoMark, SparkIcon, SearchIcon, BellIcon } from "@/components/icons";
import { useNotifications } from "@/lib/notifications";

// Phone header (the sidebar replaces it from md up).
export function TopNav({
  onChat,
  onSearch,
  onNotifications,
}: {
  onChat: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  const { unread } = useNotifications();
  const btn =
    "relative flex items-center justify-center w-11 h-11 rounded-full border border-line bg-surface text-ink/80 hover:text-ink transition-colors";

  return (
    <header className="md:hidden relative z-30 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
      <Link href="/dashboard" className="flex items-center gap-2">
        <LogoMark size={26} />
        <span className="font-display text-[22px] font-medium text-primary tracking-tight">DayAct</span>
      </Link>
      <div className="flex items-center gap-2">
        <button onClick={onSearch} className={btn} aria-label="Rechercher">
          <SearchIcon size={19} />
        </button>
        <button onClick={onNotifications} className={btn} aria-label="Notifications">
          <BellIcon size={19} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-on-fill text-[10px] font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <button onClick={onChat} className={`${btn} text-secondary`} aria-label="Assistant">
          <SparkIcon size={19} />
        </button>
      </div>
    </header>
  );
}
