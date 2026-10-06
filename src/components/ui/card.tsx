import Link from "next/link";
import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  as?: "div" | "article";
}

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
        <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.14em] text-ink-300">
          {label}
        </h2>
        {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-xs font-semibold text-volt-400 transition hover:text-volt-300"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: "volt" | "ok" | "warn" | "bad" | "muted" | "info";
  className?: string;
}

const BADGE_TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  volt: "bg-volt-400/15 text-volt-400 ring-volt-400/30",
  ok: "bg-ok-500/15 text-ok-400 ring-ok-500/30",
  warn: "bg-warn-500/15 text-warn-400 ring-warn-500/30",
  bad: "bg-bad-500/15 text-bad-400 ring-bad-500/30",
  info: "bg-info-500/15 text-info-400 ring-info-500/30",
  muted: "bg-ink-700 text-ink-300 ring-ink-600",
};

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
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
        "inline-flex items-center gap-1.5 rounded-lg bg-ink-750 px-2.5 py-1 text-xs font-medium text-ink-200",
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
