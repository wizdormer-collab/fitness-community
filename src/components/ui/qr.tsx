import { cn } from "@/lib/cn";

/**
 * PRD §13 — QR check-in. The corner-bracket frame is the recognisable
 * scanner affordance; the sweep line implies an active scan.
 */
export function QRFrame({
  scanning = false,
  size = 220,
  className,
}: {
  scanning?: boolean;
  size?: number;
  className?: string;
}) {
  const bracket = "absolute h-8 w-8 border-volt-400";
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="QR code scanner"
    >
      {/* Faux code — deterministic pattern, no asset required. */}
      <div className="absolute inset-4 grid grid-cols-7 gap-1 opacity-90">
        {Array.from({ length: 49 }).map((_, i) => {
          const on = (i * 7 + Math.floor(i / 7) * 3) % 5 < 2;
          return (
            <div
              key={i}
              className={on ? "rounded-[2px] bg-ink-100" : "rounded-[2px]"}
            />
          );
        })}
      </div>

      <span className={cn(bracket, "left-0 top-0 border-l-4 border-t-4")} />
      <span className={cn(bracket, "right-0 top-0 border-r-4 border-t-4")} />
      <span className={cn(bracket, "bottom-0 left-0 border-b-4 border-l-4")} />
      <span className={cn(bracket, "bottom-0 right-0 border-b-4 border-r-4")} />

      {scanning && (
        <span
          className="absolute inset-x-4 top-4 h-0.5 bg-volt-400 shadow-[0_0_18px_3px_rgba(215,255,62,0.7)] animate-scan"
          style={{ ["--scan-height" as string]: `${size - 36}px` }}
        />
      )}
    </div>
  );
}
