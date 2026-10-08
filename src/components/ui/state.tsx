import { cn } from "@/lib/cn";
import { Glyph, type GlyphName } from "@/components/ui/glyph";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: GlyphName;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-850/60 px-6 py-10 text-center animate-fade-up",
        className,
      )}
    >
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-750 text-ink-300">
        <Glyph name={icon} size={22} />
      </span>
      <h3 className="font-display text-base font-bold text-ink-100">{title}</h3>
      <p className="mt-1.5 max-w-[26ch] text-sm leading-relaxed text-ink-400">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({
  className,
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={cn("shimmer-band bg-ink-750", rounded, className)} />
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0" rounded="rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
