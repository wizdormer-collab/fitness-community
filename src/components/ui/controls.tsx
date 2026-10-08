import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Internal destinations go through the router so the prototype does not full
 * reload on every tap; external or hash links stay plain anchors.
 */
function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const internal = href.startsWith("/") || href.startsWith("#");
  if (!internal) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Selectable option chip — onboarding, filters, schedule pickers. */
export function Chip({
  children,
  selected = false,
  onClick,
  href,
  size = "md",
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) {
  const interactive = onClick && !disabled;
  const cls = cn(
    "inline-flex select-none items-center gap-1.5 rounded-xl border font-medium transition",
    size === "md" ? "px-3.5 py-2.5 text-sm" : "px-3 py-1.5 text-xs",
    selected
      ? "border-volt-400 bg-volt-400 text-onvolt shadow-[0_0_0_1px_rgba(215,255,62,0.35)]"
      : "border-ink-700 bg-ink-800 text-ink-200 hover:border-ink-600 hover:text-ink-100",
    interactive && "active:scale-[0.97]",
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  if (href) {
    return (
      <SmartLink href={href} className={cls}>
        {children}
      </SmartLink>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cls}
    >
      {children}
    </button>
  );
}

/** Static chip for display contexts (list rows, filters summary). */
export function Tag({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "volt" | "ok";
  className?: string;
}) {
  const tones = {
    muted: "bg-ink-750 text-ink-300",
    volt: "bg-volt-400/15 text-volt-700",
    ok: "bg-ok-500/15 text-ok-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Two-or-more tab switcher. Used on Log (Strength/Run) and Profile. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-volt-400 text-onvolt"
                : "text-ink-300 hover:text-ink-100",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-100">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-400">{hint}</span>}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-volt-400" : "bg-ink-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

/** Primary / secondary / ghost button system. */
export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const variants = {
    primary: "bg-volt-400 text-onvolt hover:bg-volt-500 volt-glow",
    secondary: "border border-ink-600 bg-ink-800 text-ink-100 hover:bg-ink-750",
    ghost: "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
    danger: "border border-bad-500/40 bg-bad-500/10 text-bad-400",
  };
  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-[15px]",
  };
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
  if (href) {
    return (
      <SmartLink href={href} className={cls}>
        {children}
      </SmartLink>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
