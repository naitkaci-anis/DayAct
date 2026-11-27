import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LogoMark } from "@/components/icons";
import { InstallApp } from "@/components/InstallApp";
import { Reveal, Stagger, StaggerItem, Float } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "DayAct — Agis sur ta journée",
  description:
    "Planifie ta journée en parlant, reste concentré et suis tes progrès : tâches, agenda, habitudes et assistant IA dans une appli gratuite qui s'installe sur ton téléphone.",
};

// ── Small building blocks ─────────────────────────────────────────────────

// Tiny stacked uppercase label with a short rule under it.
function Kicker({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <p className={`text-[10.5px] leading-[1.6] tracking-[0.24em] uppercase text-ink-muted ${className}`}>
      {lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
      <span className="block w-8 h-px bg-line-strong mt-3" />
    </p>
  );
}

// Lime pill with an arrow.
function PillLink({ href, children, size = "md" }: { href: string; children: React.ReactNode; size?: "sm" | "md" }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full bg-primary text-on-fill font-semibold uppercase whitespace-nowrap hover:bg-primary-hover transition-colors ${
        size === "sm" ? "min-h-[40px] px-3.5 sm:px-4 text-[10.5px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.16em]" : "min-h-[50px] px-6 text-xs tracking-[0.16em]"
      }`}
    >
      {children}
      <ArrowRightIcon size={size === "sm" ? 14 : 16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// Abstract bloom of cobalt petals behind the phone (decoration only).
function Bloom() {
  const petals = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full spin-slow" aria-hidden="true">
      <defs>
        <radialGradient id="petal" cx="50%" cy="85%" r="90%">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.9 }} />
          <stop offset="45%" style={{ stopColor: "var(--secondary)", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "var(--secondary)", stopOpacity: 0.05 }} />
        </radialGradient>
      </defs>
      {petals.map((a) => (
        <ellipse
          key={a}
          cx="200"
          cy="112"
          rx="52"
          ry="104"
          fill="url(#petal)"
          transform={`rotate(${a} 200 200)`}
          opacity="0.75"
        />
      ))}
      <circle cx="200" cy="200" r="30" style={{ fill: "var(--primary)" }} opacity="0.9" />
    </svg>
  );
}

// ── Static phone preview (mirrors the real "Journée" screen) ──────────────

function PhonePreview() {
  const tasks = [
    { time: "09:00", title: "Revue du sprint", meta: "Travail · 45 min", color: "var(--cat-work)", done: true },
    { time: "10:30", title: "Séance de sport", meta: "Santé · 1 h", color: "var(--cat-health)", done: true },
    { time: "18:00", title: "Méditation guidée", meta: "Santé · 15 min", color: "var(--cat-health)", done: false },
  ];
  return (
    <div
      className="relative mx-auto w-[290px] rounded-[44px] p-3 shadow-2xl ring-1 ring-line-strong"
      style={{ background: "var(--device)" }}
    >
      <div className="rounded-[34px] bg-canvas px-4 pt-6 pb-5 flex flex-col gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-muted">Jeudi 26 novembre</p>
          <p className="font-display text-2xl text-ink mt-1">
            Bonjour <em className="text-primary">Anis</em>
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 350 150" className="w-full h-auto" aria-hidden="true">
            <defs>
              <linearGradient id="phoneArc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--secondary)" }} />
                <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
              </linearGradient>
            </defs>
            <path d="M27 118 A148 92 0 0 1 323 118" fill="none" stroke="rgb(var(--line-strong-rgb))" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
            <path d="M27 118 A148 92 0 0 1 209.5 28.5" fill="none" stroke="url(#phoneArc)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="38.3" cy="82.8" r="8" fill="var(--cat-work)" />
            <circle cx="60.6" cy="59.6" r="8" fill="var(--cat-health)" />
            <circle cx="132" cy="30" r="8" fill="var(--cat-work)" />
            <circle cx="257.2" cy="41.5" r="8" fill="rgb(var(--canvas-rgb))" stroke="var(--cat-health)" strokeWidth="3" />
            <circle cx="298.1" cy="66.9" r="8" fill="rgb(var(--canvas-rgb))" stroke="var(--cat-personal)" strokeWidth="3" />
            <circle cx="209.5" cy="28.5" r="20" fill="var(--sun-halo)" />
            <circle cx="209.5" cy="28.5" r="13" fill="var(--sun)" />
          </svg>
          <p className="absolute inset-x-0 top-[42%] text-center font-display text-2xl text-ink">16 h 12</p>
        </div>
        <div className="rounded-[18px] bg-primary text-on-fill p-3.5">
          <p className="text-[9.5px] tracking-[0.18em] uppercase text-on-fill/70">Ensuite · dans 18 min</p>
          <p className="font-display text-lg leading-tight mt-0.5">Appeler le consulat</p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <span className="rounded-full bg-canvas text-primary text-xs font-semibold text-center py-2">C&apos;est fait</span>
            <span className="rounded-full border border-on-fill/30 text-xs text-center py-2">Plus tard</span>
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
    color: "var(--secondary-ink)",
    title: "Tu suis la course du soleil",
    text: "Ta journée est un arc du réveil au coucher. Tu vois d'un coup d'œil où tu en es et ce qui vient ensuite.",
  },
  {
    when: "Soir",
    color: "var(--accent)",
    title: "Tu fais le bilan",
    text: "Ce qui est fait, ce qui reste, que tu reportes en un geste ou que tu gardes « pour plus tard ».",
  },
];

const stats = [
  { value: "3", label: ["moments", "par jour"] },
  { value: "IA", label: ["écris", "ou parle"] },
  { value: "0 €", label: ["gratuit,", "sans store"] },
];

export default function Landing() {
  return (
    <main className="min-h-screen text-ink overflow-x-hidden">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-5 lg:px-8 pt-[max(env(safe-area-inset-top),20px)]">
        <div className="flex items-center justify-between gap-2 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="font-display text-[22px] sm:text-2xl font-medium text-ink tracking-tight">DayAct</span>
          </Link>
          <nav aria-label="Sections" className="hidden md:flex items-center gap-9 text-[11px] tracking-[0.22em] uppercase text-ink-muted">
            <a href="#journee" className="hover:text-ink">Une journée</a>
            <a href="#modules" className="hover:text-ink">Fonctionnalités</a>
            <a href="#telephone" className="hover:text-ink">Sur téléphone</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-1.5 sm:px-3 min-h-[44px] inline-flex items-center text-[13px] sm:text-[11px] sm:tracking-[0.18em] sm:uppercase whitespace-nowrap text-ink hover:text-primary"
            >
              Connexion
            </Link>
            <PillLink href="/signup" size="sm">
              Commencer
            </PillLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 lg:px-8 pt-10 lg:pt-14 pb-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
        <Reveal y={20}>
          <Kicker lines={["Ta journée", "qui avance", "avec toi"]} />
          <h1 className="mt-6 tracking-tight">
            <span className="block font-display italic font-normal text-primary text-[6.2rem] sm:text-[8rem] lg:text-[9.5rem] leading-[0.82]">
              Agis
            </span>
            <span className="block font-display font-normal text-primary text-[3.4rem] sm:text-[4.4rem] lg:text-[5.2rem] leading-[1.02]">
              sur ta
            </span>
            <span className="block font-sans font-extralight text-accent text-[3.6rem] sm:text-[4.8rem] lg:text-[5.6rem] leading-[0.98] -ml-0.5">
              journée
            </span>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-muted max-w-md">
            Tâches, agenda, habitudes et un assistant qui t&apos;écoute. Dis « réunion lundi 9 h », DayAct
            s&apos;occupe du reste.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <PillLink href="/signup">Créer mon compte</PillLink>
            <InstallApp variant="hero" />
          </div>

          <dl className="mt-12 flex items-stretch gap-5 sm:gap-7">
            {stats.map((s, i) => (
              <div key={s.value} className={`flex flex-col gap-1.5 ${i > 0 ? "pl-5 sm:pl-7 border-l border-line-strong" : ""}`}>
                <dt className="font-sans text-xl text-ink tracking-tight">{s.value}</dt>
                <dd className="text-[9.5px] leading-[1.5] tracking-[0.2em] uppercase text-ink-muted">
                  {s.label[0]}
                  <br />
                  {s.label[1]}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="relative">
          {/* bloom + glow behind the phone */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] max-w-[130vw] pointer-events-none">
            <div className="absolute inset-[18%] rounded-full blur-[70px]" style={{ background: "rgb(var(--secondary-rgb) / 0.45)" }} />
            <Bloom />
          </div>

          {/* side labels, large screens */}
          <Kicker lines={["Planifie", "en parlant"]} className="hidden xl:block absolute -left-2 top-6 z-10" />
          <Kicker
            lines={["Rappels", "au bon", "moment"]}
            className="hidden xl:block absolute -right-4 top-16 z-10 text-right [&>span:last-child]:ml-auto"
          />
          <Kicker
            lines={["Gratuit", "sur iPhone", "et Android"]}
            className="hidden xl:block absolute -right-4 bottom-10 z-10 text-right [&>span:last-child]:ml-auto"
          />

          <Float>
            <PhonePreview />
          </Float>
        </div>
      </section>

      {/* A day with DayAct */}
      <section id="journee" className="border-y border-line bg-panel/60">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
          <Reveal>
            <Kicker lines={["Du réveil", "au coucher"]} />
            <h2 className="mt-5 tracking-tight max-w-3xl leading-[1.02] text-5xl lg:text-7xl">
              <em className="font-display font-normal text-primary">Une journée</em>{" "}
              <span className="font-sans font-extralight text-accent">avec DayAct</span>
            </h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
            {moments.map((m, i) => (
              <StaggerItem key={m.when}>
                <div style={{ borderColor: m.color }} className="border-t pt-5">
                  <p className="flex items-baseline justify-between text-[11px] tracking-[0.24em] uppercase" style={{ color: m.color }}>
                    {m.when}
                    <span className="font-display italic text-2xl tracking-normal normal-case">0{i + 1}</span>
                  </p>
                  <h3 className="font-display text-2xl mt-3">{m.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{m.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
        <Reveal>
          <Kicker lines={["Tout au", "même endroit"]} />
          <h2 className="mt-5 tracking-tight leading-[1.02] text-5xl lg:text-7xl">
            <span className="font-sans font-extralight text-accent">Tout pour</span>{" "}
            <em className="font-display font-normal text-primary">agir</em>
          </h2>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem
            className="relative overflow-hidden sm:col-span-2 rounded-[28px] bg-secondary text-on-secondary p-8 min-h-[260px] flex flex-col justify-end"
            hover
          >
            <span className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl" style={{ background: "rgb(var(--accent-rgb) / 0.55)" }} />
            <p className="relative text-[10.5px] tracking-[0.24em] uppercase text-on-secondary/75">Assistant</p>
            <h3 className="relative font-display italic text-4xl mt-2">Parle, il organise</h3>
            <p className="relative mt-2 text-[15px] leading-relaxed text-on-secondary/85 max-w-md">
              Colle ton planning ou dis-le à voix haute : il crée tes tâches, les place sans chevauchement et
              répond à « qu&apos;est-ce que j&apos;ai demain ? ».
            </p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-ink-muted">Agenda</p>
            <h3 className="font-display text-2xl mt-2">Mois, semaine, jour</h3>
            <p className="mt-2 text-[15px] text-ink-muted">Glisser-déposer et alertes de chevauchement.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-ink-muted">Tâches</p>
            <h3 className="font-display text-2xl mt-2">Fait, reporté, annulé</h3>
            <p className="mt-2 text-[15px] text-ink-muted">Et une zone « À reprogrammer » pour ce qui attend.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] bg-sage p-7 text-ink" hover>
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-ink/70">Habitudes</p>
            <h3 className="font-display text-2xl mt-2">Garde ta série</h3>
            <p className="mt-2 text-[15px] text-ink/80">Coche chaque jour, regarde la chaîne grandir.</p>
          </StaggerItem>
          <StaggerItem className="rounded-[28px] border border-line bg-surface p-7" hover>
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-ink-muted">Focus</p>
            <h3 className="font-display text-2xl mt-2">25 minutes</h3>
            <p className="mt-2 text-[15px] text-ink-muted">Un minuteur qui compte ton vrai temps de concentration.</p>
          </StaggerItem>
          <StaggerItem className="sm:col-span-2 rounded-[28px] border border-primary/40 bg-primary/[0.06] p-7" hover>
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-primary">Rappels</p>
            <h3 className="font-display text-2xl mt-2">Une notification claire</h3>
            <p className="mt-2 text-[15px] text-ink-muted max-w-lg">
              Le nom, le lieu et l&apos;heure. « J&apos;ai compris », « Reporter » ou « Annuler », sans quitter ce
              que tu fais.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Install on phone */}
      <section id="telephone" className="mx-auto max-w-6xl px-5 lg:px-8 pb-20">
        <Reveal className="rounded-[36px] border border-line bg-panel/80 p-8 lg:p-14 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <Kicker lines={["Sans", "App Store"]} />
            <h2 className="mt-5 tracking-tight leading-[1.04] text-4xl lg:text-5xl">
              <span className="font-sans font-extralight text-accent">Sur ton téléphone,</span>{" "}
              <em className="font-display font-normal text-primary">en trois gestes</em>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              DayAct s&apos;installe comme une vraie appli, gratuitement, sur iPhone et Android.
            </p>
          </div>
          <ol className="flex flex-col">
            {[
              "Ouvre DayAct dans ton navigateur",
              "Touche Partager (iPhone) ou le menu ⋮ (Android)",
              "Choisis « Sur l'écran d'accueil »",
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-5 border-b border-line last:border-b-0 py-4 text-[15px] text-ink">
                <span className="font-display italic text-4xl text-primary w-8">{i + 1}</span>
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
              Prêt à reprendre ta journée <em>en main</em> ?
            </h2>
          </Reveal>
          <Link
            href="/signup"
            className="group mt-9 inline-flex items-center gap-2.5 min-h-[54px] px-8 rounded-full bg-canvas text-primary text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Commencer gratuitement
            <ArrowRightIcon size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
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
