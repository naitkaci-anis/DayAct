"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import { frMonthYear, frWeekRange, frDayLong } from "@/lib/calendar";

export type CalView = "month" | "week" | "day";

const views: { id: CalView; label: string }[] = [
  { id: "month", label: "Mois" },
  { id: "week", label: "Semaine" },
  { id: "day", label: "Jour" },
];

export function CalendarToolbar({
  view,
  anchor,
  onView,
  onPrev,
  onNext,
  onToday,
  onAdd,
}: {
  view: CalView;
  anchor: string;
  onView: (v: CalView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd: () => void;
}) {
  const title =
    view === "month" ? frMonthYear(anchor) : view === "week" ? frWeekRange(anchor) : frDayLong(anchor);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      {/* left: nav */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-sm border border-line text-sm text-ink-muted hover:text-ink hover:border-line-strong transition-colors"
        >
          Aujourd'hui
        </button>
        <div className="flex items-center">
          <button
            onClick={onPrev}
            className="flex items-center justify-center w-8 h-8 rounded-sm border border-line text-ink-muted hover:text-ink hover:border-line-strong transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button
            onClick={onNext}
            className="flex items-center justify-center w-8 h-8 ml-1.5 rounded-sm border border-line text-ink-muted hover:text-ink hover:border-line-strong transition-colors"
            aria-label="Suivant"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
        <h2 className="ml-1 text-base font-light text-ink capitalize">{title}</h2>
      </div>

      {/* right: view switcher + add */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-sm border border-line bg-surface">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onView(v.id)}
              className={`px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
                view === v.id ? "bg-field text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={16} />
          <span className="hidden sm:inline">Tâche</span>
        </button>
      </div>
    </div>
  );
}
