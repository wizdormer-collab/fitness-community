import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/card";
import { Glyph } from "@/components/ui/glyph";
import { Photo, photoForActivity } from "@/components/ui/photo";
import { SpotMeter } from "@/components/ui/metrics";
import { attending, activityLabel, areaLabel, levelLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Session } from "@/lib/types";

/**
 * The shared session card — one implementation serving all three places a
 * session is browsed: the Sessions list, Discover's grid and Home's nearby
 * row. Those used to be three hand-rolled copies that had already drifted
 * (Sessions had badges and capacity but no photo; Home had a photo but no
 * capacity; Discover sat between them).
 *
 * Variants:
 *   grid     — Sessions + Discover. Photo, status badge, venue with level,
 *              the SpotMeter (attendee count *and* remaining spaces), and an
 *              organizer in the footer.
 *   compact  — Home's nearby row. Same photo treatment and type stack, minus
 *              the meter and level so the card stays small; keeps its
 *              "N people attending" footer wording.
 *
 * Deliberately presentational: `taken` arrives already reconciled with join
 * state (visibleSpots, computed by the page) and avatars arrive as
 * initials/tone, so this module never imports `@/lib/selectors`. That is what
 * keeps Discover's dynamic-import boundary — and its real loading/error
 * states — intact.
 *
 * The whole card is the link (existing behaviour: cards open the session
 * detail, where join/check-in live). Hover/focus comes from the shared
 * transition and the global focus-visible rule.
 */
export interface SessionCardPerson {
  initials: string;
  tone: number;
}

interface SessionCardProps {
  session: Session;
  /** Capacity after join/leave reconciliation — required, so no call site can
   *  fall back to the raw seed count and drift from Sessions/Home. */
  taken: number;
  /** Avatar stack entries for the first attendees. */
  people?: SessionCardPerson[];
  /** Footer count for `grid` (the visible-attendee number Sessions shows).
   *  Falls back to `taken` when a page has only the capacity figure. */
  going?: number;
  joined?: boolean;
  variant?: "grid" | "compact";
  /** next/image `sizes` for the md+ card — each grid has a different card
   *  width, and the default matches Discover's three-column desktop card.
   *  The phone row photo is a fixed 112px; that clause is prefixed here. */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = "(max-width: 1024px) 300px, 340px";

export function SessionCard({
  session,
  taken,
  people = [],
  going,
  joined = false,
  variant = "grid",
  sizes = DEFAULT_SIZES,
  className,
}: SessionCardProps) {
  const s = session;
  const grid = variant === "grid";
  const full = taken >= s.maxSpots;

  const badge = grid ? (
    joined ? (
      <Badge tone="ok">Joined</Badge>
    ) : full ? (
      <Badge tone="bad">Full</Badge>
    ) : s.cost === 0 ? (
      <Badge tone="volt">Free</Badge>
    ) : (
      <Badge tone="info">₦{s.cost.toLocaleString()}</Badge>
    )
  ) : joined ? (
    <Badge tone="ok">Joined</Badge>
  ) : null;

  return (
    <Link
      href={`/app/sessions/${s.id}`}
      className={cn(
        "group flex overflow-hidden rounded-2xl border border-ink-700 bg-ink-800 card-shine transition hover:-translate-y-0.5 hover:border-ink-600 md:flex-col",
        className,
      )}
    >
      {/* Below md the card is a row: photo left (width fixed, height from the
          stretched flex item), info right — a phone-sized card (~180px vs the
          ~430px a full-width 16/10 photo card would take). At md+, where the
          grids kick in, the ratio restores the photo-on-top card. */}
      <Photo
        name={photoForActivity(s.activity)}
        alt=""
        ratio="md:aspect-[16/10]"
        className="w-[112px] shrink-0 self-stretch md:w-full"
        sizes={`(max-width: 767px) 112px, ${sizes}`}
      />
      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
          <Glyph name={s.activity} size={13} strokeWidth={2} />
          {activityLabel(s.activity)}
        </p>

        <div className="mt-1 flex items-start justify-between gap-2">
          <h4 className="min-w-0 font-display text-[15px] font-bold leading-tight text-ink-50">
            {s.title}
          </h4>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        <p className="num mt-1 text-[13px] text-ink-300">
          {s.dayLabel} · {s.time}
        </p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[13px] text-ink-400">
          <Glyph name="pin" size={13} strokeWidth={2} />
          <span className="truncate">
            {s.location} · {areaLabel(s.area)}
            {grid && ` · ${levelLabel(s.level)}`}
          </span>
        </p>

        {grid && <SpotMeter className="mt-3" taken={taken} max={s.maxSpots} />}

        {/* mt-auto pins the footer so cards stretched by a taller neighbour
            keep their capacity line on the same baseline. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink-700 pt-3">
          <AvatarStack size="xs" max={4} people={people.slice(0, 4)} />
          <span
            className={cn(
              "num text-[11px]",
              grid
                ? "truncate text-ink-500"
                : "font-semibold text-volt-700",
            )}
          >
            {grid
              ? `${going ?? taken} going${s.organizerName ? ` · ${s.organizerName}` : ""}`
              : attending(taken)}
          </span>
        </div>
      </div>
    </Link>
  );
}
