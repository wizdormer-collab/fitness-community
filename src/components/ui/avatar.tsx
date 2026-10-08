import { cn } from "@/lib/cn";

// Initials + gradient — keeps the prototype free of image assets.
const TONES = [
  { g: "linear-gradient(135deg,#d7ff3e,#a3d90a)", fg: "#0a0b0d" },
  { g: "linear-gradient(135deg,#5b8cff,#3b6be0)", fg: "#ffffff" },
  { g: "linear-gradient(135deg,#ff7a59,#e0492a)", fg: "#ffffff" },
  { g: "linear-gradient(135deg,#c084fc,#8b3ff0)", fg: "#ffffff" },
  { g: "linear-gradient(135deg,#3ddc84,#12a86b)", fg: "#0a0b0d" },
  { g: "linear-gradient(135deg,#ffd166,#f59e0b)", fg: "#0a0b0d" },
  { g: "linear-gradient(135deg,#f472b6,#db2777)", fg: "#ffffff" },
  { g: "linear-gradient(135deg,#67e8f9,#0891b2)", fg: "#0a0b0d" },
] as const;

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, { box: string; text: string }> = {
  xs: { box: "h-6 w-6 text-[9px]", text: "" },
  sm: { box: "h-8 w-8 text-[11px]", text: "" },
  md: { box: "h-11 w-11 text-[13px]", text: "" },
  lg: { box: "h-16 w-16 text-lg", text: "" },
  xl: { box: "h-24 w-24 text-2xl", text: "" },
};

export function toneStyle(tone: number): React.CSSProperties {
  const t = TONES[tone % TONES.length]!;
  return { background: t.g, color: t.fg };
}

interface AvatarProps {
  initials: string;
  tone: number;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

export function Avatar({
  initials,
  tone,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const s = SIZES[size];
  return (
    <span
      style={toneStyle(tone)}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold tracking-tight",
        s.box,
        ring && "ring-2 ring-white",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

interface AvatarStackProps {
  people: { initials: string; tone: number }[];
  size?: AvatarSize;
  max?: number;
  className?: string;
}

export function AvatarStack({
  people,
  size = "sm",
  max = 4,
  className,
}: AvatarStackProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar
          key={`${p.initials}-${i}`}
          initials={p.initials}
          tone={p.tone}
          size={size}
          ring
          className={cn("-ml-2 first:ml-0")}
        />
      ))}
      {overflow > 0 && (
        <span className="-ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-[11px] font-semibold text-ink-200 ring-2 ring-white">
          +{overflow}
        </span>
      )}
    </div>
  );
}
