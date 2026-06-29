import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#f9fafb 1px, transparent 1px), linear-gradient(90deg, #f9fafb 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Logo mark */}
        <div className="flex items-center justify-center w-16 h-16 rounded-[12px] border border-[#1f2937] bg-[#111827] glow-cyan mb-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="DayAct logo"
          >
            <path
              d="M8 24 L16 8 L24 24"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 19 H21"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="1.5" fill="#a78bfa" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-light text-6xl tracking-tight text-gradient-cyan">
          DayAct
        </h1>

        {/* Tagline */}
        <p className="text-[#6b7280] text-lg font-light tracking-wide">
          Act on your day
        </p>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-40 mt-2" />

        {/* Status badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#1f2937] bg-[#111827] text-sm text-[#6b7280]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          Phase 2 — Dashboard
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#06b6d4] text-[#0a0a14] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ouvrir le tableau de bord
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
