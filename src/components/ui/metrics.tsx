import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  unit,
  sub,
  emoji,
  accent = false,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  emoji?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-shine flex flex-col gap-1 rounded-2xl border p-4",
        accent
          ? "border-volt-400/30 bg-volt-400/[0.07]"
          : "border-ink-700 bg-ink-800",
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        {emoji && <span aria-hidden>{emoji}</span>}
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <span
          className={cn(
            "num font-display text-2xl font-bold leading-none tracking-tight",
            accent ? "text-volt-400" : "text-ink-50",
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-ink-400">{unit}</span>
        )}
      </span>
      {sub && <span className="text-[11px] text-ink-400">{sub}</span>}
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  accent = "volt",
  showLabel = false,
  height = "h-2",
  className,
}: {
  value: number;
  max: number;
  accent?: "volt" | "ok" | "warn" | "info";
  showLabel?: boolean;
  height?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bars = {
    volt: "bg-volt-400",
    ok: "bg-ok-500",
    warn: "bg-warn-500",
    info: "bg-info-500",
  };
  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-ink-700",
          height,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-700", bars[accent])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className="num text-ink-300">
            {value} / {max}
          </span>
          <span className="num font-semibold text-volt-400">{pct}%</span>
        </div>
      )}
    </div>
  );
}

/** PRD §12 — session capacity. Renders the literal "47/100 spots" pattern. */
export function SpotMeter({
  taken,
  max,
  className,
}: {
  taken: number;
  max: number;
  className?: string;
}) {
  const full = taken >= max;
  const nearlyFull = taken / max >= 0.85;
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="num font-semibold text-ink-200">
          {taken}/{max} spots
        </span>
        <span
          className={cn(
            "font-semibold",
            full ? "text-bad-400" : nearlyFull ? "text-warn-400" : "text-ok-400",
          )}
        >
          {full ? "Full" : nearlyFull ? "Filling fast" : "Open"}
        </span>
      </div>
      <ProgressBar
        value={taken}
        max={max}
        accent={full ? "warn" : "volt"}
        height="h-1.5"
      />
    </div>
  );
}

/** PRD §17 — streak indicator with a soft pulse. */
export function StreakFlame({
  days,
  size = "md",
  className,
}: {
  days: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: "text-base px-2 py-1 gap-1",
    md: "text-lg px-3 py-1.5 gap-1.5",
    lg: "text-2xl px-4 py-2 gap-2",
  };
  return (
    <span
      className={cn(
        "relative inline-flex items-center rounded-xl bg-gradient-to-r from-bad-500/25 to-warn-500/20 font-display font-bold text-warn-400 ring-1 ring-inset ring-warn-500/30",
        dims[size],
        className,
      )}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-warn-500/50 animate-pulse-ring" />
        <span className="relative" aria-hidden>
          🔥
        </span>
      </span>
      <span className="num text-sm">{days}-day streak</span>
    </span>
  );
}

/** Goal ring — weekly/monthly target progress. */
export function Ring({
  value,
  max,
  size = 72,
  stroke = 7,
  label,
  accent = "#d7ff3e",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  accent?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#22262d"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="num font-display text-base font-bold text-ink-50">
          {value}/{max}
        </span>
        {label && (
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-ink-400">
            {label}
          </span>
        )}
      </span>
    </div>
  );
}
