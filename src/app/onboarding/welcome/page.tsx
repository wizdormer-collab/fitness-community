"use client";

import Link from "next/link";
import { Button } from "@/components/ui/controls";
import { Glyph, type GlyphName } from "@/components/ui/glyph";
import { Photo } from "@/components/ui/photo";

const PROMISES: { icon: GlyphName; title: string; body: string }[] = [
  { icon: "communities", title: "Find your people", body: "Communities matched to your area, activity and level." },
  { icon: "social", title: "Find a training partner", body: "Compatible by goal, schedule and frequency." },
  { icon: "clock", title: "Show up", body: "Sessions, check-ins and reminders that keep you honest." },
  { icon: "target", title: "Get better", body: "Workouts, streaks and personal records in one place." },
];

export default function Welcome() {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Desktop hero rail — on phones the hero card below carries this. */}
      <div className="relative hidden overflow-hidden bg-ink-50 lg:block">
        <div className="absolute inset-0">
          <Photo
            name="hero-run"
            alt="Three people running together at sunrise"
            ratio=""
            sizes="50vw"
            className="h-full w-full opacity-90"
            scrim
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-ink-50/70 via-ink-50/30 to-volt-800/20" />
        <div className="relative flex min-h-dvh flex-col justify-end p-12 xl:p-16">
          <p className="font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.03em] text-white xl:text-[54px]">
            Find your
            <br />
            people.
            <br />
            <span className="text-volt-400">Show up.</span>
          </p>
        </div>
      </div>

      {/* Content column — the phone layout on mobile, a centred card on desktop. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 lg:max-w-none lg:px-14 lg:py-12 xl:px-20">
        <div className="flex min-h-dvh w-full max-w-md flex-col lg:my-auto lg:min-h-0 lg:max-w-[520px] lg:rounded-3xl lg:border lg:border-ink-700 lg:bg-white lg:p-10 lg:shadow-[0_24px_60px_-30px_rgba(16,31,45,0.25)] xl:max-w-[560px]">
          <div className="flex items-center justify-between pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:pt-0">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-400">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-volt-400 text-onvolt">
                <Glyph name="bolt" size={13} strokeWidth={2.4} />
              </span>
              Lagos
            </span>
            <Link
              href="/onboarding/signin"
              className="text-xs font-semibold text-ink-300 transition hover:text-volt-700"
            >
              Sign in
            </Link>
          </div>

          <main className="flex-1">
            {/* Hero — people first (PRD §34), not facilities */}
            <div className="relative animate-fade-up overflow-hidden rounded-3xl lg:hidden">
              <Photo
                name="hero-run"
                alt="Three people running together at sunrise"
                ratio="aspect-[4/5]"
                sizes="100vw"
                priority
                scrim
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h1 className="font-display text-[38px] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
                  Find your
                  <br />
                  people.
                  <br />
                  <span className="text-volt-400">Show up.</span>
                </h1>
              </div>
            </div>

            <h1 className="hidden font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink-50 lg:block">
              Find your people.
              <br />
              <span className="text-volt-700">Show up.</span>
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-ink-300 lg:text-ink-400">
              The community-based fitness platform for Nigeria. Discover fitness
              activities, connect with people who train like you, and stay
              accountable to your goals.
            </p>

            <ul className="mt-6 divide-y divide-ink-700 border-y border-ink-700">
              {PROMISES.map((p) => (
                <li key={p.title} className="flex items-start gap-3.5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-volt-400/15 text-volt-700">
                    <Glyph name={p.icon} size={18} />
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

          <footer className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 lg:pb-0 lg:pt-8">
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
      </div>
    </div>
  );
}
