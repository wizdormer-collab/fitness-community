import Link from "next/link";
import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  as?: "div" | "article";
}

/** A genuinely framed thing — one per screen where possible. */
export function Card({
  children,
  className,
  onClick,
  style,
  as = "div",
}: CardProps) {
  const Tag = as;
  return (
    <Tag
      onClick={onClick}
      style={style}
      className={cn(
        "card-shine rounded-2xl border border-ink-700 bg-ink-800",
        onClick && "cursor-pointer transition active:scale-[0.985]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  label: string;
  hint?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({
  label,
  hint,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
          {label}
        </h2>
        {hint && <p className="mt-1 text-[13px] text-ink-500">{hint}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-[13px] font-semibold text-volt-700 transition hover:text-volt-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/**
 * Unboxed section — overline, content straight on the canvas, optional
 * hairline underneath. Use this instead of wrapping every section in a Card:
 * six framed boxes in a column is what makes a screen read as a mockup.
 */
export function Band({
  label,
  hint,
  action,
  children,
  className,
  divided = false,
}: {
  label?: string;
  hint?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <section className={cn(divided && "border-b border-ink-700 pb-6", className)}>
      {label && <SectionHeader label={label} hint={hint} action={action} />}
      {children}
    </section>
  );
}

interface ListProps {
  children: React.ReactNode;
  /** `plain` sits directly on the canvas; `surface` is one white group. */
  variant?: "plain" | "surface";
  className?: string;
}

export function List({ children, variant = "plain", className }: ListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-ink-700",
        variant === "surface" &&
          "card-shine overflow-hidden rounded-2xl border border-ink-700 bg-ink-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ListRowProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  /** `row` is the compact one-line/one-chip row; `block` stacks full-width content. */
  layout?: "row" | "block";
  className?: string;
}

export function ListRow({
  children,
  href,
  onClick,
  chevron = false,
  layout = "row",
  className,
}: ListRowProps) {
  const cls = cn(
    layout === "block" ? "w-full px-4 py-4 text-left" : "flex w-full items-center gap-3 px-4 py-3.5 text-left",
    (href || onClick) && "transition hover:bg-ink-750/70 active:bg-ink-750",
    className,
  );
  const inner = (
    <>
      <span className={cn("min-w-0", layout === "row" ? "flex-1" : "block")}>{children}</span>

      {chevron && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-ink-500"
          aria-hidden
        >
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: "volt" | "ok" | "warn" | "bad" | "muted" | "info";
  className?: string;
}

const BADGE_TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  volt: "bg-volt-400/20 text-volt-800 ring-volt-600/40",
  ok: "bg-ok-500/15 text-ok-400 ring-ok-500/35",
  warn: "bg-warn-500/15 text-warn-400 ring-warn-500/35",
  bad: "bg-bad-500/15 text-bad-400 ring-bad-500/35",
  info: "bg-info-500/15 text-info-400 ring-info-500/35",
  muted: "bg-ink-750 text-ink-400 ring-ink-600/40",
};

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-ink-750 px-2.5 py-1 text-xs font-medium text-ink-300",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-ink-700", className)} />;
}
