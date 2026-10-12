"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepDots } from "@/components/ui/header";
import { Button } from "@/components/ui/controls";
import { Photo } from "@/components/ui/photo";
import { cn } from "@/lib/cn";

const TOTAL_STEPS = 7;

/** Step names shown in the desktop side panel (index = dot position). */
const STEP_NAMES = [
  "Welcome",
  "Create account",
  "Your area",
  "Your goals",
  "Activities",
  "Level & schedule",
  "Matches",
];

/**
 * Shared frame for the 7-step onboarding described in PRD §7 and walked
 * end-to-end by the §26 MVP user journey.
 */
export function OnboardingShell({
  step,
  title,
  subtitle,
  back,
  children,
  ctaLabel,
  nextHref,
  onNext,
  valid = true,
  note,
  hint,
}: {
  step: number;
  title: string;
  subtitle?: string;
  back?: string;
  children: React.ReactNode;
  ctaLabel: string;
  nextHref?: string;
  onNext?: () => void;
  valid?: boolean;
  note?: string;
  hint?: string;
}) {
  const router = useRouter();

  const advance = () => {
    if (nextHref) router.push(nextHref);
    onNext?.();
  };

  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Desktop brand rail — hidden on phones/tablets, where the step dots
          in the header carry progress instead. */}
      <aside className="relative hidden overflow-hidden bg-ink-50 lg:block">
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
        <div className="relative flex min-h-dvh flex-col justify-between gap-10 p-12 xl:p-16">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-volt-400 text-onvolt">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
              </svg>
            </span>
            Show Up — Lagos
          </span>

          <div>
            <p className="font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.03em] text-white xl:text-[54px]">
              Find your
              <br />
              people.
              <br />
              <span className="text-volt-400">Show up.</span>
            </p>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-white/70">
              The community-based fitness platform for Nigeria. Seven quick
              questions and we&apos;ll match you with communities, sessions
              and training partners near you.
            </p>
          </div>

          <ol className="flex flex-col gap-3" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
            {STEP_NAMES.map((name, i) => {
              const current = i === step;
              const done = i < step;
              return (
                <li key={name} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                      current
                        ? "bg-volt-400 text-onvolt"
                        : done
                          ? "bg-white/20 text-white"
                          : "border border-white/25 text-white/45",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      current ? "text-white" : done ? "text-white/65" : "text-white/40",
                    )}
                  >
                    {name}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* Form column — the phone layout on mobile, a centred card on desktop. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 lg:max-w-none lg:px-14 lg:py-12 xl:px-20">
        <div className="flex min-h-dvh w-full max-w-md flex-col lg:my-auto lg:min-h-0 lg:max-w-[520px] lg:rounded-3xl lg:border lg:border-ink-700 lg:bg-white lg:p-10 lg:shadow-[0_24px_60px_-30px_rgba(11,13,15,0.25)] xl:max-w-[560px]">
          <header className="flex items-center justify-between gap-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:pt-0">
            {back ? (
              <Link
                href={back}
                aria-label="Back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition hover:text-ink-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <span className="h-9 w-9" />
            )}
            <StepDots step={step} total={TOTAL_STEPS} className="lg:hidden" />
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400 lg:inline">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="h-9 w-9" />
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="animate-fade-up">
              <h1 className="font-display text-[28px] font-bold leading-[1.12] tracking-tight text-ink-50 lg:text-[32px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400 lg:text-base">
                  {subtitle}
                </p>
              )}
              <div className="mt-7">{children}</div>
            </div>
          </main>

          <footer className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 lg:pb-0 lg:pt-8">
            {hint && (
              <p className="mb-3 text-center text-xs text-ink-500">{hint}</p>
            )}
            <Button full size="lg" disabled={!valid} onClick={advance}>
              {ctaLabel}
            </Button>
            {note && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-600">
                {note}
              </p>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}

/** Optional sub-heading above a group of pickers. */
export function FieldLabel({
  children,
  className,
  count,
}: {
  children: React.ReactNode;
  className?: string;
  count?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-baseline justify-between gap-2",
        className,
      )}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
        {children}
      </span>
      {count && (
        <span className="num text-[11px] font-semibold text-volt-700">
          {count}
        </span>
      )}
    </div>
  );
}
