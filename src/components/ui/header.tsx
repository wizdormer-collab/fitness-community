import Link from "next/link";
import { cn } from "@/lib/cn";

export function ScreenHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  right,
  className,
  large = false,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <header className={cn("mb-5", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 transition hover:text-ink-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className={cn(
              "font-display font-bold tracking-tight text-ink-50",
              large ? "text-3xl leading-[1.1]" : "text-xl",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm leading-snug text-ink-400">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}

/** Progress dots for the onboarding flow. */
export function StepDots({
  step,
  total,
  className,
}: {
  step: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === step
              ? "w-6 bg-volt-400"
              : i < step
                ? "w-3 bg-volt-700"
                : "w-3 bg-ink-700",
          )}
        />
      ))}
    </div>
  );
}
