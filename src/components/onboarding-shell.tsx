"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepDots } from "@/components/ui/header";
import { Button } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

const TOTAL_STEPS = 7;

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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
      <header className="flex items-center justify-between gap-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
        <StepDots step={step} total={TOTAL_STEPS} />
        <span className="h-9 w-9" />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="animate-fade-up">
          <h1 className="font-display text-[28px] font-bold leading-[1.12] tracking-tight text-ink-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400">
              {subtitle}
            </p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </main>

      <footer className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6">
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
        <span className="num text-[11px] font-semibold text-volt-400">
          {count}
        </span>
      )}
    </div>
  );
}
