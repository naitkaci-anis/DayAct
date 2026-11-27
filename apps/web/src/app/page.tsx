import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { InstallApp } from "@/components/InstallApp";
import { Reveal, Stagger, StaggerItem, Float } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "DayAct — Agis sur ta journée",
  description:
    "Planifie ta journée en parlant, reste concentré et suis tes progrès : tâches, agenda, habitudes et assistant IA dans une appli gratuite qui s'installe sur ton téléphone.",
};

// ── Static phone preview (mirrors the real "Journée" screen) ──────────────

function PhonePreview() {
  const tasks = [
    { time: "09:00", title: "Revue du sprint", meta: "Travail · 45 min", color: "var(--cat-work)", done: true },
    { time: "10:30", title: "Séance de sport", meta: "Santé · 1 h", color: "var(--cat-health)", done: true },
    { time: "18:00", title: "Méditation guidée", meta: "Santé · 15 min", color: "var(--cat-health)", done: false },
  ];
  return (
    <div className="relative mx-auto w-[300px] rounded-[44px] bg-ink p-3 shadow-2xl">
      <div className="rounded-[34px] bg-canvas px-4 pt-6 pb-5 flex flex-col gap-3">
        <div>
          <p className="text-xs text-ink-muted">Jeudi 26 novembre</p>
          <p className="font-display text-2xl text-ink mt-0.5">
            Bonjour <em className="text-primary">Anis</em>
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 350 150" className="w-full h-auto" aria-hidden="true">
            <path d="M27 118 A148 92 0 0 1 323 118" fill="none" stroke="rgb(var(--line-strong-rgb))" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
            <path d="M27 118 A148 92 0 0 1 209.5 28.5" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="38.3" cy="82.8" r="8" fill="var(--cat-work)" />
            <circle cx="60.6" cy="59.6" r="8" fill="var(--cat-health)" />
            <circle cx="132" cy="30" r="8" fill="var(--cat-work)" />
            <circle cx="257.2" cy="41.5" r="8" fill="rgb(var(--canvas-rgb))" stroke="var(--cat-health)" strokeWidth="3" />
            <circle cx="298.1" cy="66.9" r="8" fill="rgb(var(--canvas-rgb))" stroke="var(--cat-personal)" strokeWidth="3" />
            <circle cx="209.5" cy="28.5" r="20" fill="var(--cream)" />
            <circle cx="209.5" cy="28.5" r="13" fill="var(--cat-learning)" />
          </svg>
          <p className="absolute inset-x-0 top-[42%] text-center font-display text-2xl text-ink">16 h 12</p>
        </div>
        <div className="rounded-[18px] bg-primary text-on-fill p-3.5">
          <p className="text-[10px] tracking-[0.06em] text-cream">ENSUITE · DANS 18 MIN</p>
          <p className="font-display text-lg leading-tight mt-0.5">Appeler le consulat</p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <span className="rounded-full bg-canvas text-primary text-xs font-semibold text-center py-2">C&apos;est fait</span>
            <span className="rounded-full border border-cream/40 text-xs text-center py-2">Plus tard</span>
          </div>
        </div>
        {tasks.map((t) => (
          <div key={t.title} className="flex items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3 py-2">
            <span className="text-[11px] text-ink-muted w-9">{t.time}</span>
            <span className="w-1 self-stretch rounded-full" style={{ background: t.color }} />
            <span className="flex-1 min-w-0">
              <span className={`block text-[13px] ${t.done ? "line-through text-ink-muted" : "text-ink"}`}>{t.title}</span>
              <span className="block text-[10px] text-ink-muted">{t.meta}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

const moments = [
  {
    when: "Matin",
    color: "var(--primary)",
    title: "Tu planifies en deux minutes",
    text: "DayAct te montre ta journée, te prévient si tu en prévois trop et te propose quoi reporter. Tu valides, c'est parti.",
  },
  {
    when: "Journée",
    color: "var(--secondary)",
    title: "Tu suis la course du soleil",
    text: "Ta journée est un arc du réveil au coucher. Tu vois d'un coup d'œil où tu en es et ce qui vient ensuite.",
  },
  {
    when: "Soir",
    color: "var(--cat-learning)",
    title: "Tu fais le bilan",
    text: "Ce qui est fait, ce qui reste, que tu reportes en un geste. Tu notes ton humeur et tu fermes la journée l'esprit léger.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen text-ink">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-5 lg:px-8 pt-[max(env(safe-area-inset-top),20px)]">
        <div className="flex items-center justify-between gap-2 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="font-display text-[22px] sm:text-2xl font-medium text-primary tracking-tight">DayAct</span>
          </Link>
          <nav aria-label="Sections" className="hidden md:flex items-center gap-7 text-[15px] text-ink-muted">
            <a href="#journee" className="hover:text-ink">Une journée</a>
            <a href="#modules" className="hover:text-ink">Fonctionnalités</a>
            <a href="#telephone" className="hover:text-ink">Sur téléphone</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <Link href="/login" className="px-2 sm:px-3 min-h-[44px] inline-flex items-center text-[15px] whitespace-nowrap text-ink hover:text-primary">
              <span className="sm:hidden">Connexion</span>
              <span className="hidden sm:inline">Se connecter</span>
            </Link>
            <Link href="/signup" className="px-4 sm:px-5 min-h-[44px] inline-flex items-center rounded-full bg-primary text-on-fill text-[15px] font-medium whitespace-nowrap hover:bg-primary-hover">
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 lg:px-8 pt-10 lg:pt-16 pb-20 grid gap-14 lg:grid-cols-[1.15fr_1fr] items-center">
        <Reveal y={20}>
          <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface text-sm text-secondary">
            <span className="w-2 h-2 rounded-full bg-success" />
            Productivité et bien-être, avec l&apos;IA
          </p>
          <h1 className="font-display font-normal text-[2.9rem] sm:text-6xl lg:text-[4.6rem] leading-[1.02] tracking-tight mt-6">
            Agis sur ta journée, <em className="text-primary">pas juste la planifier.</em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted max-w-xl">
            Tâches, agenda, habitudes et un assistant qui t&apos;écoute. Dis « réunion lundi 9 h », DayAct s&apos;occupe du reste.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="min-h-[52px] px-7 inline-flex items-center rounded-full bg-primary text-on-fill text-base font-medium hover:bg-primary-hover">
              Créer mon compte gratuit
            </Link>
            <InstallApp variant="hero" />
          </div>
          <p className="mt-5 text-sm text-ink-muted">Gratuit · Sans carte bancaire · Tes données restent à toi</p>
        </Reveal>
        <Float>
          <PhonePreview />
        </Float>
      </section>

      {/* A day with DayAct */}
      <section id="journee" className="border-y border-line bg-panel/70">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
          <Reveal>
            <h2 className="font-display font-normal text-4xl lg:text-5xl tracking-tight max-w-2xl">
              Une journée avec <em className="text-primary">DayAct</em>
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-10 md:grid-cols-3">
            {moments.map((m) => (
              <StaggerItem key={m.when}>
                <div style={{ borderColor: m.color }} className="border-t-2 pt-5">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: m.color }}>
                  {m.when}
                </p>
                <h3 className="font-display text-2xl mt-2">{m.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{m.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
        <Reveal>
          <h2 className="font-display font-normal text-4xl lg:text-5xl tracking-tight">
            Tout pour <em className="text-primary">agir</em>, au même endroit
          </h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem className="sm:col-span-2 rounded-[28px] bg-primary text-on-fill p-8 min-h-[240px] flex flex-col justify-end" hover>
            <h3 className="font-display text-3xl">Assistant IA</h3>
            <p className="mt-2 text-base leading-relaxed text-cream max-w-md">
              Écris ou parle normalement : il crée, déplace et planifie tes tâches, et te propose une journée réaliste.
            </p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <h3 className="font-display text-2xl">Agenda</h3>
            <p className="mt-2 text-ink-muted">Mois, semaine, jour, glisser-déposer et alertes de chevauchement.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <h3 className="font-display text-2xl">Tâches</h3>
            <p className="mt-2 text-ink-muted">Priorités, durées, récurrence, rappels. Fait, reporté ou annulé en un geste.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] bg-sage p-7 text-ink" hover>
            <h3 className="font-display text-2xl">Habitudes</h3>
            <p className="mt-2 text-ink/80">Coche chaque jour et garde tes séries vivantes.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <h3 className="font-display text-2xl">Focus</h3>
            <p className="mt-2 text-ink-muted">Minuteur Pomodoro qui compte ton vrai temps de concentration.</p>
          </StaggerItem>
          <StaggerItem className="sm:col-span-2 rounded-[28px] bg-cream p-7" hover>
            <h3 className="font-display text-2xl">Analyses et bien-être</h3>
            <p className="mt-2 text-ink/80 max-w-lg">
              Activité, objectifs, humeur, énergie et coach santé, pour comprendre ce qui te réussit.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Install on phone */}
      <section id="telephone" className="mx-auto max-w-6xl px-5 lg:px-8 pb-20">
        <Reveal className="rounded-[36px] bg-secondary text-on-fill p-8 lg:p-14 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display font-normal text-4xl tracking-tight">
              Sur ton téléphone, <em>sans passer par un store</em>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-fill/85">
              DayAct s&apos;installe comme une vraie appli, gratuitement, sur iPhone et Android.
            </p>
          </div>
          <ol className="flex flex-col gap-3">
            {[
              "Ouvre DayAct dans ton navigateur",
              "Touche Partager (iPhone) ou le menu ⋮ (Android)",
              "Choisis « Sur l'écran d'accueil »",
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-4 rounded-[18px] bg-canvas text-ink px-5 py-4 text-base">
                <span className="font-display text-3xl text-primary">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Final call */}
      <section className="bg-primary text-on-fill">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20 text-center">
          <Reveal>
            <h2 className="font-display font-normal text-4xl lg:text-6xl tracking-tight max-w-3xl mx-auto">
              Prêt à reprendre ta journée <em className="text-cream">en main</em> ?
            </h2>
          </Reveal>
          <Link href="/signup" className="mt-9 inline-flex items-center min-h-[54px] px-8 rounded-full bg-canvas text-primary text-base font-semibold">
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <LogoMark size={18} /> © 2026 DayAct · Agis sur ta journée
        </span>
        <span className="flex gap-5">
          <Link href="/login" className="hover:text-ink">Connexion</Link>
          <Link href="/signup" className="hover:text-ink">Inscription</Link>
        </span>
      </footer>
    </main>
  );
}
