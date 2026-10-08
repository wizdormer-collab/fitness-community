import { cn } from "@/lib/cn";

/**
 * Line-icon set replacing emoji as the prototype's visual vocabulary.
 *
 * Keys are the domain ids already in the data (ActivityId, FitnessGoalId,
 * DiscoverCategoryId, TimeSlotId, NotificationKind) plus a handful of UI-only
 * names. Keying by id rather than by emoji character means the option sets in
 * lib/types.ts never have to change, and shared concepts (gym + strength both
 * being "lift something") resolve to one glyph instead of two near-identical
 * emoji.
 *
 * House style matches components/ui/icons.tsx: 24 viewBox, 1.8 stroke,
 * round caps, currentColor throughout.
 */

const G = (d: React.ReactNode) => d;

const GLYPHS: Record<string, React.ReactNode> = {
  // ---- Training ----
  gym: (
    <>
      <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" />
    </>
  ),
  strength: (
    <>
      <path d="M2.5 12h19" />
      <rect x="4.5" y="8" width="3" height="8" rx="1.2" />
      <rect x="16.5" y="8" width="3" height="8" rx="1.2" />
      <rect x="9.5" y="9.8" width="1.6" height="4.4" rx="0.6" />
      <rect x="12.9" y="9.8" width="1.6" height="4.4" rx="0.6" />
    </>
  ),
  "muscle-gain": <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" />,

  // ---- Cardio / sport ----
  running: (
    <>
      <circle cx="15" cy="4.6" r="2.1" />
      <path d="M7.5 20.5l3.2-4.8-2.4-3.1 1.1-4.4 3.6 2.1 3.1.8" />
      <path d="M12.9 13.2L16 16l4.5 1.5" />
      <path d="M6.7 10.4l3-1.6" />
    </>
  ),
  "run-clubs": (
    <>
      <circle cx="15" cy="4.6" r="2.1" />
      <path d="M7.5 20.5l3.2-4.8-2.4-3.1 1.1-4.4 3.6 2.1 3.1.8" />
      <path d="M12.9 13.2L16 16l4.5 1.5" />
      <path d="M6.7 10.4l3-1.6" />
    </>
  ),
  cycling: (
    <>
      <circle cx="5.5" cy="16.5" r="3.6" />
      <circle cx="18.5" cy="16.5" r="3.6" />
      <path d="M5.5 16.5l4.2-7.5h4.1l4.7 7.5" />
      <path d="M9.7 9h5.1" />
      <path d="M13 16.5h5.5" />
    </>
  ),
  football: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.3l4.3 3.1-1.6 5H9.3l-1.6-5z" />
      <path d="M12 3.4v3.9M3.7 10.3l3.6 2.5M20.3 10.3l-3.6 2.5M7.8 19.7l1.1-4.3M16.2 19.7l-1.1-4.3" />
    </>
  ),
  basketball: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 3.4v17.2M3.4 12h17.2" />
      <path d="M5.9 5.9c3.6 3.6 3.6 8.6 0 12.2M18.1 5.9c-3.6 3.6-3.6 8.6 0 12.2" />
    </>
  ),
  sports: <circle cx="12" cy="12" r="8.6" />,
  swimming: (
    <>
      <circle cx="16.5" cy="6.5" r="1.9" />
      <path d="M3.5 12.5l3.6-2.3 3 1.9 2.7-2.8" />
      <path d="M3 17.4c1.8 0 1.8 1.5 3.6 1.5s1.8-1.5 3.6-1.5 1.8 1.5 3.6 1.5 1.8-1.5 3.6-1.5 1.8 1.5 3.6 1.5" />
      <path d="M3 21c1.8 0 1.8 1.5 3.6 1.5" />
    </>
  ),
  padel: (
    <>
      <ellipse cx="12" cy="8.4" rx="5" ry="5.9" />
      <path d="M8.7 5.9l6.6 5M15.3 5.9l-6.6 5" />
      <path d="M12 14.3v6.2M9.6 17.4h4.8" />
    </>
  ),
  tennis: (
    <>
      <ellipse cx="12" cy="8.4" rx="5" ry="5.9" />
      <path d="M8.7 5.9l6.6 5M15.3 5.9l-6.6 5" />
      <path d="M12 14.3v6.2M9.6 17.4h4.8" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 8.4c-2.1 0-3.7 1.6-3.7 3.6S9.7 17 12 17s3.7-2.6 3.7-5-1.6-3.6-3.7-3.6z" />
      <path d="M4.5 19c2.5-1.7 4.8-2.5 7.5-2.5s5 .8 7.5 2.5" />
    </>
  ),
  pilates: (
    <>
      <circle cx="7.5" cy="6.5" r="2.1" />
      <path d="M9.4 8.6l4.4 3.2 6.7 1.1" />
      <path d="M4 19.5l4.6-4.2 4.8.6" />
      <path d="M18.5 12.9l1.8 6.6" />
    </>
  ),
  flexibility: (
    <>
      <circle cx="12" cy="4.6" r="2.1" />
      <path d="M12 7v5.5M12 12.5l-4.6 4.4M12 12.5l4.6 4.4M6.6 8.9l5.4 1.6 5.4-1.6" />
    </>
  ),
  "home-workouts": (
    <>
      <path d="M4 11l8-6.6 8 6.6v8.1a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.1z" />
      <path d="M9.8 20.6v-5.9h4.4v5.9" />
    </>
  ),
  cycling2: <path d="M12 3.4v17.2" />,

  // ---- Goals ----
  "weight-loss": (
    <>
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="3.4" />
      <path d="M8.4 15.6a4.6 4.6 0 0 1 7.2 0" />
      <path d="M12 8.4v2.4" />
      <path d="M12 10.8l2.4-2.4" />
    </>
  ),
  endurance: <path d="M3 12.5h3.6l1.9-5.2 3.2 10.4 2.2-7.2 1.6 4.6 1.4-2.6H21" />,
  "sports-performance": (
    <>
      <path d="M7.6 4h8.8v5.1a4.4 4.4 0 0 1-8.8 0z" />
      <path d="M7.6 5.4H5a2.6 2.6 0 0 0 2.7 4.3M16.4 5.4H19a2.6 2.6 0 0 1-2.7 4.3" />
      <path d="M12 13.5v3.6M9 20.4h6M10 17.1h4" />
    </>
  ),
  "general-fitness": (
    <>
      <path d="M11 3l1.9 5.4 5.4 1.9-5.4 1.9L11 17.6 9.1 12.2 3.7 10.3l5.4-1.9z" />
      <path d="M18.2 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  "healthy-lifestyle": (
    <>
      <path d="M5 19.2c0-7.2 5.1-13.2 14-13.2 0 9.2-5.1 14.2-11.1 14.2-1.5 0-2.9-.4-2.9-1z" />
      <path d="M5 19.2c3-4.1 6.1-6.2 10.2-7.8" />
    </>
  ),

  // ---- Time of day ----
  dawn: (
    <>
      <path d="M12 3.6v3M5.6 7.6l2 2M18.4 7.6l-2 2M2.6 17h18.8" />
      <path d="M7.6 17a4.4 4.4 0 0 1 8.8 0" />
      <path d="M4 20.8h16" />
    </>
  ),
  morning: (
    <>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
    </>
  ),
  midday: (
    <>
      <circle cx="12" cy="10.5" r="3.6" />
      <path d="M12 3.6v1.8M4.9 10.5H3.1M20.9 10.5h-1.8M6.9 5.4L5.7 4.2M17.1 5.4l1.2-1.2" />
      <path d="M3 18.4h6.4M12.6 18.4H21" />
    </>
  ),
  afternoon: (
    <>
      <circle cx="12" cy="10.5" r="3.6" />
      <path d="M12 3.6v1.8M4.9 10.5H3.1M20.9 10.5h-1.8M6.9 5.4L5.7 4.2M17.1 5.4l1.2-1.2" />
      <path d="M3 18.4h6.4M12.6 18.4H21" />
    </>
  ),
  evening: (
    <>
      <path d="M12 3.4v6.2M9.6 7.2L12 9.6l2.4-2.4" />
      <path d="M4 17h16" />
      <path d="M7.6 17a4.4 4.4 0 0 1 8.8 0" />
      <path d="M4 20.8h16" />
    </>
  ),
  night: (
    <>
      <path d="M20.4 14.6A8.7 8.7 0 0 1 9.4 3.6a8.7 8.7 0 1 0 11 11z" />
    </>
  ),

  // ---- Discovery ----
  all: (
    <>
      <path d="M11 3.6l1.7 4.9 4.9 1.7-4.9 1.7L11 16.8 9.3 11.9 4.4 10.2l4.9-1.7z" />
      <path d="M17.8 15.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),
  gyms: <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" />,
  classes: (
    <>
      <rect x="3.5" y="5.2" width="17" height="15.3" rx="2.6" />
      <path d="M3.5 10.2h17M8 3.4v3.4M16 3.4v3.4" />
      <path d="M8.4 14.4h3.2M8.4 17.4h7.2" />
    </>
  ),
  events: (
    <>
      <rect x="3.5" y="5.2" width="17" height="15.3" rx="2.6" />
      <path d="M3.5 10.2h17M8 3.4v3.4M16 3.4v3.4" />
    </>
  ),
  event: (
    <>
      <rect x="3.5" y="5.2" width="17" height="15.3" rx="2.6" />
      <path d="M3.5 10.2h17M8 3.4v3.4M16 3.4v3.4" />
    </>
  ),
  trainers: (
    <>
      <path d="M14.4 5.2H19a2 2 0 0 1 0 4h-4.6" />
      <circle cx="9.4" cy="12" r="5.8" />
      <path d="M9.4 6.2V3.8" />
      <path d="M6.2 14.6l-2.4 4.4" />
    </>
  ),
  communities: (
    <>
      <circle cx="9" cy="8.4" r="3.4" />
      <path d="M2.8 19.8c.7-3.3 3.3-5.2 6.2-5.2s5.5 1.9 6.2 5.2" />
      <path d="M16.4 5.4a3.4 3.4 0 0 1 0 6.6M18 14.7c2 .6 3.5 2.3 4 5.1" />
    </>
  ),
  social: (
    <>
      <circle cx="9" cy="8.4" r="3.4" />
      <path d="M2.8 19.8c.7-3.3 3.3-5.2 6.2-5.2s5.5 1.9 6.2 5.2" />
      <path d="M16.4 5.4a3.4 3.4 0 0 1 0 6.6M18 14.7c2 .6 3.5 2.3 4 5.1" />
    </>
  ),
  challenges: (
    <>
      <path d="M7.6 4h8.8v5.1a4.4 4.4 0 0 1-8.8 0z" />
      <path d="M7.6 5.4H5a2.6 2.6 0 0 0 2.7 4.3M16.4 5.4H19a2.6 2.6 0 0 1-2.7 4.3" />
      <path d="M12 13.5v3.6M9 20.4h6M10 17.1h4" />
    </>
  ),
  other: (
    <>
      <path d="M11 3.6l1.7 4.9 4.9 1.7-4.9 1.7L11 16.8 9.3 11.9 4.4 10.2l4.9-1.7z" />
      <path d="M17.8 15.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),

  // ---- Feedback / status ----
  accountability: (
    <>
      <path d="M12 20.9a5.9 5.9 0 0 0 5.9-5.9c0-4.4-4.4-6.7-5.9-11.9-1.5 5.2-5.9 7.5-5.9 11.9a5.9 5.9 0 0 0 5.9 5.9z" />
      <path d="M12 20.9c1.7 0 3-1.3 3-3s-1.5-2.7-3-5c-1.5 2.3-3 3.4-3 5s1.3 3 3 3z" />
    </>
  ),
  flame: (
    <>
      <path d="M12 20.9a5.9 5.9 0 0 0 5.9-5.9c0-4.4-4.4-6.7-5.9-11.9-1.5 5.2-5.9 7.5-5.9 11.9a5.9 5.9 0 0 0 5.9 5.9z" />
      <path d="M12 20.9c1.7 0 3-1.3 3-3s-1.5-2.7-3-5c-1.5 2.3-3 3.4-3 5s1.3 3 3 3z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.6 4h8.8v5.1a4.4 4.4 0 0 1-8.8 0z" />
      <path d="M7.6 5.4H5a2.6 2.6 0 0 0 2.7 4.3M16.4 5.4H19a2.6 2.6 0 0 1-2.7 4.3" />
      <path d="M12 13.5v3.6M9 20.4h6M10 17.1h4" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15.4" r="5.1" />
      <path d="M8.4 4.2l2.4 6M15.6 4.2l-2.4 6" />
      <path d="m12 13.3.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z" />
    </>
  ),
  check: <path d="M5 12.9l4.4 4.4L19 7.6" />,
  flag: (
    <>
      <path d="M5.5 21V4.2" />
      <path d="M5.5 5.1h11.6l-2 3.4 2 3.4H5.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 6.8v5.4l3.4 2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9.4a6 6 0 1 1 12 0c0 4.4 1.5 5.9 1.5 5.9h-15S6 13.8 6 9.4z" />
      <path d="M10.4 18.8a1.9 1.9 0 0 0 3.2 0" />
    </>
  ),
  mute: (
    <>
      <path d="M6 9.4a6 6 0 0 1 9-5.2M18 11.2v4.1s1.5-1.5 1.5-5.9" />
      <path d="M6 9.4c0 4.4-1.5 5.9-1.5 5.9h12" />
      <path d="M10.4 18.8a1.9 1.9 0 0 0 3.2 0" />
      <path d="M3.6 3.6l16.8 16.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  signal: (
    <>
      <path d="M5.4 17.6a9 9 0 0 1 13.2 0" />
      <path d="M8.6 14.2a4.9 4.9 0 0 1 6.8 0" />
      <circle cx="12" cy="19.4" r="1.5" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.6" height="6.6" rx="1.4" />
      <rect x="13.9" y="3.5" width="6.6" height="6.6" rx="1.4" />
      <rect x="3.5" y="13.9" width="6.6" height="6.6" rx="1.4" />
      <path d="M13.9 13.9h3.2v3.2h-3.2zM20.5 13.9v6.6H17" />
    </>
  ),
  lock: (
    <>
      <rect x="4.6" y="10.4" width="14.8" height="10" rx="2.4" />
      <path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8" />
      <path d="M12 14.6v2.2" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7.2" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m15.4 8.6-2 5.4-5.4 2 2-5.4z" />
    </>
  ),
  star: <path d="M12 2.9l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.75l-5.9 3.05 1.1-6.45-4.7-4.6 6.5-.95z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.1" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="6.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="m8.9 10.8 6.2-3.5M8.9 13.2l6.2 3.5" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  spark: (
    <>
      <path d="M11 3.6l1.7 4.9 4.9 1.7-4.9 1.7L11 16.8 9.3 11.9 4.4 10.2l4.9-1.7z" />
    </>
  ),
  bolt: <path d="M13.2 2.4L4.8 13.6h5.6L9.4 21.6l8.8-11.6h-5.6z" />,
};

export type GlyphName = keyof typeof GLYPHS | string;

export function Glyph({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
}: {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const glyph = GLYPHS[name] ?? GLYPHS.spark;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {G(glyph)}
    </svg>
  );
}

/** Convenience for list/tile icons that should sit in a coloured chip. */
export function GlyphTile({
  name,
  size = "md",
  tone = "neutral",
  className,
}: {
  name: GlyphName;
  size?: "sm" | "md" | "lg";
  tone?: "neutral" | "volt" | "info";
  className?: string;
}) {
  const box = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-2xl",
    lg: "h-14 w-14 rounded-2xl",
  }[size];
  const paint = {
    neutral: "bg-ink-750 text-ink-300",
    volt: "bg-volt-400/25 text-volt-800",
    info: "bg-info-500/15 text-info-400",
  }[tone];
  const icon = { sm: 17, md: 21, lg: 26 }[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        box,
        paint,
        className,
      )}
    >
      <Glyph name={name} size={icon} strokeWidth={1.9} />
    </span>
  );
}
