"use client";

import { useStore, formatLongDate } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { Timeline } from "@/components/dashboard/Timeline";
import { TaskPanel } from "@/components/spine/TaskPanel";
import { MoodLogger } from "@/components/spine/MoodLogger";
import { Assistant } from "@/components/spine/Assistant";

export default function TodayPage() {
  const { state } = useStore();
  const { openNew, openEdit } = useUI();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-light text-text" style={{ letterSpacing: "-0.02em" }}>
          Bonjour, <span className="text-gradient-cyan">Anis</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">{formatLongDate(state.selectedDate)}</p>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Timeline />
          <TaskPanel onAdd={() => openNew()} onEdit={openEdit} />
        </div>
        <div className="space-y-6">
          <Assistant />
          <MoodLogger />
        </div>
      </div>
    </>
  );
}
