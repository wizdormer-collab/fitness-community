"use client";

import Link from "next/link";
import { Button } from "@/components/ui/controls";

const PROMISES = [
  { emoji: "👥", title: "Find your people", body: "Communities matched to your area, activity and level." },
  { emoji: "🤝", title: "Find a training partner", body: "Compatible by goal, schedule and frequency." },
  { emoji: "📅", title: "Show up", body: "Sessions, check-ins and reminders that keep you honest." },
  { emoji: "📈", title: "Get better", body: "Workouts, streaks and personal records in one place." },
];

export default function Welcome() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden px-6">
      {/* Volt bloom behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-30 blur-[90px]"
        style={{ background: "radial-gradient(circle, #d7ff3e 0%, rgba(215,255,62,0) 70%)" }}
      />

      <div className="flex items-center justify-between pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-400">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-volt-400 text-sm text-ink-950">
            ⚡
          </span>
          Lagos
        </span>
        <Link
          href="/onboarding/signin"
          className="text-xs font-semibold text-ink-300 transition hover:text-volt-400"
        >
          Sign in
        </Link>
      </div>

      <main className="flex flex-1 flex-col justify-center pb-8">
        <div className="animate-fade-up">
          <h1 className="font-display text-[44px] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink-50">
            Find your
            <br />
            people.
            <br />
            <span className="text-volt-400">Show up.</span>
            <br />
            Get better.
          </h1>

          <p className="mt-6 max-w-[34ch] text-[15px] leading-relaxed text-ink-300">
            The community-based fitness platform for Nigeria. Discover fitness
            activities, connect with people who train like you, and stay
            accountable to your goals.
          </p>
        </div>

        <ul className="mt-9 space-y-3">
          {PROMISES.map((p, i) => (
            <li
              key={p.title}
              className="flex items-start gap-3.5 rounded-2xl border border-ink-700/70 bg-ink-850/70 p-4 animate-fade-up"
              style={{ animationDelay: `${140 + i * 90}ms` }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-750 text-lg">
                {p.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink-50">
                  {p.title}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-400">
                  {p.body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <Link href="/onboarding/signin">
          <Button full size="lg">
            Get started
          </Button>
        </Link>
        <p className="mt-3.5 text-center text-[11px] text-ink-600">
          Free while we&apos;re building. No card required.
        </p>
      </footer>
    </div>
  );
}
