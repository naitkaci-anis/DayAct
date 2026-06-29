"use client";

import { useState } from "react";
import { useStore, categoryMeta, todayISO, addDays } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { addMonths } from "@/lib/calendar";
import { CalendarToolbar, type CalView } from "@/components/dashboard/calendar/CalendarToolbar";
import { MonthView } from "@/components/dashboard/calendar/MonthView";
import { WeekView } from "@/components/dashboard/calendar/WeekView";
import { DayView } from "@/components/dashboard/calendar/DayView";

export default function CalendarPage() {
  const { state, dispatch } = useStore();
  const { openNew } = useUI();

  const [view, setView] = useState<CalView>("month");
  const [anchor, setAnchor] = useState<string>(state.selectedDate);

  function shift(delta: number) {
    if (view === "month") setAnchor(addMonths(anchor, delta));
    else if (view === "week") setAnchor(addDays(anchor, delta * 7));
    else setAnchor(addDays(anchor, delta));
  }

  function goToday() {
    const t = todayISO();
    setAnchor(t);
    dispatch({ type: "SET_DATE", date: t });
  }

  function openDay(date: string) {
    setAnchor(date);
    setView("day");
    dispatch({ type: "SET_DATE", date });
  }

  return (
    <>
      <CalendarToolbar
        view={view}
        anchor={anchor}
        onView={setView}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onToday={goToday}
        onAdd={() => openNew({ date: anchor })}
      />

      {view === "month" && <MonthView anchor={anchor} onOpenDay={openDay} />}
      {view === "week" && <WeekView anchor={anchor} onOpenDay={openDay} />}
      {view === "day" && <DayView date={anchor} />}

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4">
        {Object.entries(categoryMeta).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            <span className="text-[11px] text-text-muted">{meta.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
