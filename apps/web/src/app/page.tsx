import Link from "next/link";
import {
  LogoMark,
  SparkIcon,
  CalendarIcon,
  TasksIcon,
  ClockIcon,
  FlameIcon,
  InsightsIcon,
  WellbeingIcon,
  CheckIcon,
} from "@/components/icons";
import { InstallApp } from "@/components/InstallApp";

const features = [
  {
    icon: SparkIcon,
    title: "Assistant IA",
    desc: "Parle ou écris « réunion lundi 9h » — l'IA crée, déplace et planifie tes tâches.",
    color: "#c026ff",
  },
  {
    icon: CalendarIcon,
    title: "Calendrier intelligent",
    desc: "Vues mois / semaine / jour, glisser-déposer, détection des chevauchements.",
    color: "#5be7ff",
  },
  {
    icon: TasksIcon,
    title: "Tâches & priorités",
    desc: "Créneaux, durées, récurrence, rappels — tout ce qu'il faut pour avancer.",
    color: "#8b5cf6",
  },
  {
    icon: ClockIcon,
    title: "Focus & Pomodoro",
    desc: "Minuteur intégré qui mesure ton temps de concentration réel.",
    color: "#5be7ff",
  },
  {
    icon: FlameIcon,
    title: "Habitudes & séries",
    desc: "Suis tes habitudes au quotidien et garde tes séries 🔥 vivantes.",
    color: "#f59e0b",
  },
  {
    icon: InsightsIcon,
    title: "Analyses & bien-être",
    desc: "Heatmap d'activité, objectifs, humeur et énergie — vois tes progrès.",
    color: "#22c55e",
  },
];

function GlassPreview() {
  // Stylized in-CSS mock of the app — gives the marketing "screenshot" feel.
  return (
    <div className="glass rounded-[24px] p-3 lift">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 px-2 py-2">
        <span className="w-2.5 h-2.5 rounded-full bg-alert-red/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-energy-amber/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-done-green/70" />
        <span className="ml-3 text-[10px] text-text-muted">dayact.app · Aujourd'hui</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 p-1">
        {/* left: greeting + stats */}
        <div className="col-span-1 space-y-2.5">
          <div className="rounded-[14px] bg-deep border border-border p-3">
            <p className="text-xs text-text-muted">Bonjour</p>
            <p className="text-lg font-light text-gradient-cyan">Anis 👋</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "4/7", l: "Tâches" },
              { v: "2h45", l: "Focus" },
              { v: "72%", l: "Énergie" },
              { v: "12 j", l: "Série" },
            ].map((s) => (
              <div key={s.l} className="rounded-[12px] bg-deep border border-border p-2">
                <p className="text-sm text-text">{s.v}</p>
                <p className="text-[9px] text-text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* center: timeline */}
        <div className="col-span-1 rounded-[14px] bg-deep border border-border p-3 space-y-2">
          <p className="text-[10px] text-text-muted mb-1">Planning</p>
          {[
            { t: "Sprint", c: "#5be7ff" },
            { t: "Sport", c: "#22c55e" },
            { t: "Doc API", c: "#8b5cf6" },
            { t: "Consulat", c: "#f59e0b" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.c }} />
              <span className="flex-1 h-2 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* right: focus ring + assistant */}
        <div className="col-span-1 space-y-2.5">
          <div className="rounded-[14px] bg-deep border border-border p-3 flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full"
              style={{
                background:
                  "conic-gradient(#5be7ff, #8b5cf6 60%, rgba(255,255,255,0.08) 60%)",
                mask: "radial-gradient(circle 18px at center, transparent 97%, #000 0)",
                WebkitMask: "radial-gradient(circle 18px at center, transparent 97%, #000 0)",
              }}
            />
            <p className="text-[9px] text-text-muted mt-1.5">Focus du jour</p>
          </div>
          <div className="rounded-[14px] border border-focus-violet/30 bg-focus-violet/10 p-3 glow-violet">
            <p className="text-[10px] text-focus-violet font-medium">✨ Assistant IA</p>
            <span className="block mt-1.5 h-1.5 w-3/4 rounded-full bg-white/10" />
            <span className="block mt-1 h-1.5 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen text-text">
      {/* Nav */}
      <header className="sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 mt-4">
          <div className="glass rounded-[18px] flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-deep glow-cyan">
                <LogoMark size={20} />
              </span>
              <span className="text-lg font-light text-gradient-cyan tracking-tight">DayAct</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-sm text-sm text-text-muted hover:text-text transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-2 rounded-sm bg-act-cyan text-[#050816] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 lg:px-8 pt-16 lg:pt-24 pb-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rise">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-deep text-xs text-text-muted mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-done-green animate-pulse" />
              Productivité & bien-être, propulsés par l'IA
            </span>
            <h1 className="text-4xl lg:text-6xl font-light leading-[1.05] tracking-tight">
              Agis sur ta journée,
              <br />
              <span className="text-gradient-cyan gradient-flow">pas juste la planifier.</span>
            </h1>
            <p className="mt-6 text-lg text-text-muted leading-relaxed max-w-xl">
              DayAct réunit tes <strong className="text-text">tâches</strong>, ton{" "}
              <strong className="text-text">calendrier</strong>, tes{" "}
              <strong className="text-text">habitudes</strong> et un{" "}
              <strong className="text-text">assistant IA</strong> dans une seule app élégante.
              Planifie en parlant, reste concentré, et suis tes progrès.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-[14px] bg-gradient-to-r from-act-cyan via-focus-violet to-accent text-[#050816] text-sm font-semibold glow-violet hover:opacity-95 transition-opacity"
              >
                Accéder gratuitement →
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-[14px] glass text-sm font-medium hover:border-white/20 transition-colors"
              >
                J'ai déjà un compte
              </Link>
              <InstallApp variant="hero" />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7">
              {["100% gratuit", "Données privées", "S'installe comme une app"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckIcon size={13} className="text-done-green" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="rise" style={{ animationDelay: "0.1s" }}>
            <GlassPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight">
            Tout pour <span className="text-gradient-cyan">agir</span>, au même endroit
          </h2>
          <p className="mt-3 text-text-muted">Six modules pensés pour ta journée.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass border-glow lift rounded-[22px] p-6 relative overflow-hidden"
              >
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-[12px] mb-4"
                  style={{
                    color: f.color,
                    background: `color-mix(in srgb, ${f.color} 16%, transparent)`,
                  }}
                >
                  <Icon size={20} />
                </span>
                <h3 className="text-base font-medium text-text">{f.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 lg:px-8 py-16">
        <div className="glass rounded-[28px] p-10 lg:p-14 text-center relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(192,38,255,0.16), transparent 70%)",
            }}
          />
          <div className="relative">
            <WellbeingIcon size={28} className="mx-auto text-accent mb-4" />
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight">
              Prêt à reprendre ta journée en main ?
            </h2>
            <p className="mt-4 text-text-muted max-w-lg mx-auto">
              Crée ton compte gratuitement en 30 secondes. Aucune carte bancaire.
            </p>
            <Link
              href="/signup"
              className="inline-block mt-8 px-8 py-3.5 rounded-[14px] bg-gradient-to-r from-act-cyan via-focus-violet to-accent text-[#050816] text-sm font-semibold glow-violet hover:opacity-95 transition-opacity"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 lg:px-8 py-10 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={18} />
            <span className="text-sm text-text-muted">DayAct — Act on your day</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-text-muted">
            <Link href="/login" className="hover:text-text transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-text transition-colors">
              Inscription
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-text-muted/60 mt-6">
          © 2026 DayAct · Productivité & bien-être
        </p>
      </footer>
    </main>
  );
}
