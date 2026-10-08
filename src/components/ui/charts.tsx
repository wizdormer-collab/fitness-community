import { cn } from "@/lib/cn";
import { activityOf } from "@/lib/format";
import { Glyph } from "@/components/ui/glyph";

/** Line + area trend (distance, weekly volume). */
export function Sparkline({
  data,
  height = 72,
  accent = "#7a9e1b",
  className,
}: {
  data: number[];
  height?: number;
  accent?: string;
  className?: string;
}) {
  const w = 320;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 6;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      className={cn("block", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path
        d={line}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill={accent} />
    </svg>
  );
}

/** Weekly workout volume — vertical bars. */
export function BarChart({
  data,
  height = 96,
  accent = "#7a9e1b",
  className,
}: {
  data: number[];
  height?: number;
  accent?: string;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div
      className={cn("flex items-end gap-1.5", className)}
      style={{ height }}
      aria-hidden
    >
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${(v / max) * 100}%`,
              background:
                i === data.length - 1
                  ? accent
                  : "rgba(122,158,27,0.30)",
              minHeight: 4,
            }}
          />
          <span className="num text-[11px] text-ink-500">{v}</span>
        </div>
      ))}
    </div>
  );
}

const HEAT = ["#e9edf2", "#eef7cf", "#b9dd57", "#7a9e1b"];

/** 90-day consistency grid (PRD §16). Column-major = calendar weeks. */
export function Heatmap({
  days,
  className,
}: {
  days: { date: string; intensity: 0 | 1 | 2 | 3; label: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn("w-full", className)}
      style={{
        display: "grid",
        gridTemplateRows: "repeat(7, minmax(0, 1fr))",
        gridAutoFlow: "column",
        gridAutoColumns: "minmax(0, 1fr)",
        gap: "3px",
      }}
      role="img"
      aria-label="Workout consistency over the last 90 days"
    >
      {days.map((d) => (
        <div
          key={d.date}
          title={`${d.label} · ${d.intensity === 0 ? "rest" : "trained"}`}
          className="aspect-square rounded-[3px]"
          style={{ background: HEAT[d.intensity] }}
        />
      ))}
    </div>
  );
}

/** Split-by-activity horizontal bars. */
export function ActivitySplit({
  items,
  className,
}: {
  items: { activity: string; count: number; pct: number }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((it) => {
        const a = activityOf(it.activity as never);
        return (
          <div key={it.activity} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink-200">
                <Glyph name={a.id} size={14} />
                {a.label}
              </span>
              <span className="num font-semibold text-ink-300">
                {it.count} · {it.pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-volt-600"
                style={{ width: `${it.pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
