"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge, List, ListRow, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { BottomSheet } from "@/components/ui/sheet";
import { EmptyState, Skeleton } from "@/components/ui/state";
import { ScreenHeader } from "@/components/ui/header";
import { SessionCard } from "@/components/ui/session-card";
import { Photo, photoForActivity } from "@/components/ui/photo";
import { Star } from "@/components/ui/icons";
import { Glyph, GlyphTile } from "@/components/ui/glyph";
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
} from "@/lib/types";
import { attending, activityLabel, areaLabel, grouped } from "@/lib/format";
import { usePrototype } from "@/lib/prototype-state";
// Type-only import: erased at build time, so `@/lib/selectors` stays a lazily
// loaded chunk. That boundary is what makes the loading and error states below
// real conditions rather than faked timers — every *value* the screen needs
// from that module (`buildDiscoverResults`, `visibleSpots`, `userById`) is
// pulled through the dynamic import below instead of being imported here.
import type { DiscoverResult } from "@/lib/selectors";

/** Local filter settle time — the gap is surfaced as a skeleton, not a stall. */
const SEARCH_SETTLE_MS = 180;

type ListingResult = Extract<DiscoverResult, { kind: "listing" }>;
type SessionResult = Extract<DiscoverResult, { kind: "session" }>;
type CommunityResult = Extract<DiscoverResult, { kind: "community" }>;
type Person = { initials: string; tone: number };

/**
 * Everything the lazy import has to hand back. `taken` and `people` are derived
 * there rather than looked up during render so this file never needs a value
 * import from `@/lib/selectors`.
 */
interface DiscoverData {
  results: DiscoverResult[];
  /** attendee initials/tone per session id, for the avatar stacks. */
  people: Record<string, Person[]>;
  /** capacity per session id, already reconciled with the join state. */
  taken: Record<string, number>;
}

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DISCOVER_CATEGORIES.map((c) => [c.id, c.label]),
);

/**
 * One column at phone width, two once the shell has widened at md (600px there),
 * three across a desktop rail. The brief asks for a balanced multi-column
 * layout — the same three-switch grid Home's nearby row uses, so cards are
 * never squeezed into a phone viewport.
 *
 * Cards are left to stretch (no `items-start`) so a row shares one height. That
 * only reads well because sessions, listings and communities each get their own
 * grid: mixing a photo card with a one-line listing would stretch the short one
 * into a card that is mostly air.
 */
const GRID = "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3";

/**
 * Shared card shell. Sessions and communities carry photography; venues,
 * coaches, events and challenges stay typographic because the data holds no
 * image for them — borrowing a sport photo for a gym would be a fabrication.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-800 card-shine transition hover:-translate-y-0.5 hover:border-ink-600">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured — the next session on the board                                    */
/* -------------------------------------------------------------------------- */

/**
 * The one spotlight on the screen. It features the *next upcoming session*
 * rather than a promoted listing, because a session is the only thing in this
 * data that carries a photograph, a time, a venue and live attendance — a
 * promoted gym or challenge would have to invent most of those.
 *
 * Spots come from `visibleSpots`, the same helper Sessions and Home read, so
 * the three screens cannot disagree about capacity after a join.
 */
function FeaturedCard({
  result,
  taken,
  people,
}: {
  result: SessionResult;
  taken: number;
  people: Person[];
}) {
  const s = result.session;
  const left = Math.max(0, s.maxSpots - taken);

  return (
    <section className="mb-7">
      <SectionHeader label="Featured" hint="Next up on the board" />
      <Link
        href={`/app/sessions/${s.id}`}
        className="group block overflow-hidden rounded-2xl border border-ink-700 bg-navy-50 lg:grid lg:grid-cols-[1.02fr_0.98fr]"
      >
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:col-start-1 lg:row-start-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-onnavy-mute">
            <Glyph name={s.activity} size={13} strokeWidth={2} />
            {activityLabel(s.activity)}
          </p>

          <div>
            <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-onnavy sm:text-[26px]">
              {s.title}
            </h2>
            <p className="num mt-2 text-sm text-onnavy-dim">
              {s.dayLabel} · {s.time}
            </p>
            <p className="num mt-1 text-sm text-onnavy-mute">
              {s.location} · {areaLabel(s.area)} · Lagos
            </p>
          </div>

          {/* SpotMeter's label is specified for light surfaces, so availability
              is set as plain text here rather than restating the palette. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-navy-line pt-4">
            <AvatarStack size="xs" max={4} people={people} />
            <span className="num text-[13px] text-onnavy-dim">
              {attending(taken)}
            </span>
            <span
              className={`num text-[13px] font-bold ${
                left > 0 ? "text-volt-400" : "text-warn-500"
              }`}
            >
              {left > 0 ? `${left} spots left` : "Full"}
            </span>
          </div>

          <span className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-volt-400 px-5 py-3 text-sm font-semibold text-onvolt transition group-hover:bg-volt-500">
            View session
          </span>
        </div>

        <Photo
          name={photoForActivity(s.activity)}
          alt=""
          ratio="aspect-[16/9] lg:aspect-auto"
          className="w-full lg:col-start-2 lg:row-start-1"
          sizes="(max-width: 1024px) 600px, 480px"
        />
      </Link>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Result cards                                                                 */
/* -------------------------------------------------------------------------- */

/* Sessions render through the shared `SessionCard` (components/ui/session-card),
   fed from data this page already derives in its dynamic import — capacity and
   avatars are passed in, so the card never reaches into `@/lib/selectors` and
   this page's lazy-chunk boundary stays intact. */

/** Communities get their own band, but still honour a category filter. */
function CommunityCard({ result }: { result: CommunityResult }) {
  const c = result.community;
  return (
    <Link href={`/app/community/${c.id}`} className="block h-full">
      <Frame>
        <Photo
          name={photoForActivity(c.activity)}
          alt=""
          ratio="aspect-[16/9]"
          className="w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 300px, 340px"
        />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
              <Glyph name={c.activity} size={13} strokeWidth={2} />
              {activityLabel(c.activity)}
            </p>
            {result.item.badge && (
              <Badge tone="volt" className="shrink-0">
                {result.item.badge}
              </Badge>
            )}
          </div>
          <h3 className="mt-1 font-display text-[15px] font-bold leading-tight text-ink-50">
            {c.name}
          </h3>
          <p className="num mt-1.5 text-[13px] text-ink-300">
            {c.members.toLocaleString("en-GB")} members · {c.cadence}
          </p>
          {/* The seed's tagline is the short description — nothing invented. */}
          <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
            {c.tagline}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink-700 pt-3 text-[12px] text-ink-500">
            <span className="truncate">{areaLabel(c.area)}</span>
            <span className="shrink-0 font-semibold text-volt-700">
              View community
            </span>
          </div>
        </div>
      </Frame>
    </Link>
  );
}

/** Venues, coaches, events and challenges — the data holds no image for these. */
function ListingCard({
  result,
  onOpen,
}: {
  result: ListingResult;
  onOpen: (result: ListingResult) => void;
}) {
  const item = result.item;
  const body = (
    <Frame>
      <div className="flex flex-1 flex-col p-4">
        <span className="flex items-start gap-3">
          <GlyphTile name={item.category} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="flex items-start gap-2">
              <span className="min-w-0 flex-1 font-display text-[15px] font-bold leading-snug text-ink-50">
                {item.title}
              </span>
              {item.verified && (
                <Badge tone="info" className="shrink-0">
                  ✓ Verified
                </Badge>
              )}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-ink-400">
              {item.meta}
            </span>
          </span>
        </span>

        {item.badge && (
          <span className="mt-3 block">
            <Badge tone="volt">{item.badge}</Badge>
          </span>
        )}

        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-700 pt-3 text-[12px] text-ink-500">
          <span className="num">{areaLabel(item.area)}</span>
          {item.distanceKm > 0 && (
            <span className="num">· {item.distanceKm} km away</span>
          )}
          {item.rating && (
            <span className="num flex items-center gap-1">
              · <Star className="h-3 w-3" /> {item.rating}
            </span>
          )}
        </span>
      </div>
    </Frame>
  );

  // Trainers resolve to a detail sheet — PRD §21 profiles are not built yet,
  // so there is no route to link to.
  if (item.sheet) {
    return (
      <button
        key={result.id}
        type="button"
        onClick={() => onOpen(result)}
        className="block h-full w-full text-left"
      >
        {body}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link key={result.id} href={item.href} className="block h-full">
        {body}
      </Link>
    );
  }

  return (
    <div key={result.id} className="h-full">
      {body}
    </div>
  );
}

/** Mirrors the grid so the layout does not jump when results settle. */
function DiscoverSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800"
        >
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                       */
/* -------------------------------------------------------------------------- */

export default function Discover() {
  const [cat, setCat] = useState<DiscoverCategoryId>("all");
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<ListingResult | null>(null);
  const [data, setData] = useState<DiscoverData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Join state feeds the attendance figures. Without it a card would report
  // the seeded count forever and drift from Sessions and Home the moment the
  // user joined or left something.
  const { isSessionJoined } = usePrototype();

  // Data is behind a dynamic import so "loading" and "error" are conditions the
  // screen can actually be in (chunk fetch fails offline or after a deploy),
  // not simulated. No setState runs synchronously here — results and failures
  // both arrive through the promise callbacks. Re-running when the join state
  // changes keeps `taken` honest without giving up the boundary.
  useEffect(() => {
    let cancelled = false;
    import("@/lib/selectors")
      .then((mod) => {
        const results = mod.buildDiscoverResults();
        const people: Record<string, Person[]> = {};
        const taken: Record<string, number> = {};

        for (const r of results) {
          if (r.kind !== "session") continue;
          const id = r.session.id;
          taken[id] = mod.visibleSpots(r.session, isSessionJoined(id));
          people[id] = r.session.attendeeIds.slice(0, 4).map((uid) => {
            const u = mod.userById(uid);
            return { initials: u.initials, tone: u.tone };
          });
        }

        return { results, people, taken };
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, isSessionJoined]);

  // Debounce the applied query so typing does not re-filter on every keystroke.
  // The pending gap is *derived* (rawQuery vs query) rather than stored — no
  // setState in the effect body, and the skeleton cannot desync from reality.
  useEffect(() => {
    const target = rawQuery.trim();
    if (target === query) return;
    const timer = setTimeout(() => setQuery(target), SEARCH_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [rawQuery, query]);

  const settling = rawQuery.trim() !== query;

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase();
    return data.results.filter(
      (r) =>
        (cat === "all" || r.category === cat) && (!q || r.search.includes(q)),
    );
  }, [data, cat, query]);

  // The spotlight only shows on the unfiltered view, and the session it names
  // is pulled out of the grid so nothing appears twice.
  const showFeatured =
    !!data && !loadError && !settling && cat === "all" && !query;

  const featured = useMemo(
    () =>
      showFeatured ? filtered.find((r) => r.kind === "session") : undefined,
    [filtered, showFeatured],
  );

  // One filter, three sections. Sessions, listings and communities have very
  // different card shapes, so each gets its own grid rather than being mixed
  // into one where the short cards stretch to fill a photo card's height.
  const { sessions, listings, communities } = useMemo(() => {
    const keep = filtered.filter((r) => r.id !== featured?.id);
    return {
      sessions: keep.filter((r) => r.kind === "session"),
      listings: keep.filter((r) => r.kind === "listing"),
      communities: keep.filter((r) => r.kind === "community"),
    };
  }, [filtered, featured]);

  const retry = () => {
    setLoadError(false);
    setAttempt((a) => a + 1);
  };
  const clearAll = () => {
    setCat("all");
    setRawQuery("");
  };
  const clearSearch = () => setRawQuery("");

  const hasFilters = cat !== "all" || query !== "";
  const activeLabel = CATEGORY_LABEL[cat] ?? "All";
  const sectionLabel = query
    ? `Results for “${query}”`
    : cat === "all"
      ? "All results"
      : activeLabel;
  const trainer = sheet?.trainer;

  return (
    <div>
      <ScreenHeader
        large
        title="Find your people"
        subtitle="Sessions, gyms, coaches and communities around you in Lagos."
      />

      {/* Search (PRD §11) — a real field, not a decorative icon. */}
      <div role="search" className="mb-4 lg:max-w-xl">
        <label htmlFor="discover-q" className="sr-only">
          Search Discover
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
            <Glyph name="search" size={20} strokeWidth={2} />
          </span>
          <input
            id="discover-q"
            type="text"
            inputMode="search"
            autoComplete="off"
            enterKeyHint="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search sessions, gyms, communities, areas…"
            className="h-14 w-full rounded-2xl border border-ink-700 bg-ink-800 pl-12 pr-12 text-[15px] text-ink-50 placeholder:text-ink-500 outline-none transition focus:border-volt-600"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-750 hover:text-ink-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category rail (PRD §11) */}
      <div className="-mx-4 mb-6 overflow-x-auto no-scrollbar px-4">
        <div className="flex w-max gap-2">
          {DISCOVER_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              size="md"
              selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className="whitespace-nowrap"
            >
              <Glyph name={c.id} size={15} strokeWidth={2} />
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {!loadError &&
        data &&
        featured &&
        featured.kind === "session" && (
          <FeaturedCard
            result={featured}
            taken={data.taken[featured.id] ?? 0}
            people={data.people[featured.id] ?? []}
          />
        )}

      {data && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
            {sectionLabel}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="num text-[11px] text-ink-500" aria-live="polite">
              {settling
                ? "Searching…"
                : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-bold uppercase tracking-[0.1em] text-volt-700 transition hover:text-volt-800"
              >
                Clear filters
              </button>
            )}
          </span>
        </div>
      )}

      {loadError ? (
        <EmptyState
          icon="flag"
          title="Couldn't load Discover"
          body="The listings didn't come through. Your search and filters are untouched — try again."
          action={
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : !data || settling ? (
        <DiscoverSkeleton />
      ) : filtered.length === 0 ? (
        query ? (
          <EmptyState
            icon="search"
            title={`No matches for “${query}”`}
            body="Nothing here matches that. Try an area like Lekki, or an activity like running — or clear the search to see everything nearby."
            action={
              <Button variant="secondary" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="compass"
            title={`Nothing in ${activeLabel} yet`}
            body="No results in this category near your area. Try another category or widen your search."
            action={
              <Button variant="secondary" onClick={clearAll}>
                Show all categories
              </Button>
            }
          />
        )
      ) : (
        <>
          {sessions.length > 0 && (
            <section>
              <SectionHeader
                label="Sessions"
                hint={`${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}`}
              />
              <div className={GRID}>
                {(sessions as SessionResult[]).map((result) => {
                  const taken = data.taken[result.id] ?? 0;
                  return (
                    <SessionCard
                      key={result.id}
                      session={result.session}
                      taken={taken}
                      going={
                        result.session.attendeeIds.length +
                        (taken - result.session.spotsTaken)
                      }
                      joined={isSessionJoined(result.id)}
                      people={data.people[result.id] ?? []}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {listings.length > 0 && (
            <section className="mt-8">
              <SectionHeader
                label="Places & people"
                hint={`${listings.length} ${listings.length === 1 ? "listing" : "listings"}`}
              />
              <div className={GRID}>
                {(listings as ListingResult[]).map((result) => (
                  <ListingCard
                    key={result.id}
                    result={result}
                    onOpen={setSheet}
                  />
                ))}
              </div>
            </section>
          )}

          {communities.length > 0 && (
            <section className="mt-8">
              <SectionHeader
                label="Communities"
                hint={`${communities.length} ${communities.length === 1 ? "group" : "groups"}`}
              />
              <div className={GRID}>
                {(communities as CommunityResult[]).map((result) => (
                  <CommunityCard key={result.id} result={result} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-100">Gym crowd levels</span>{" "}
          are deliberately absent. The PRD marks them experimental and not a
          core MVP dependency, so they are cut from v1 rather than shown as a
          disabled placeholder.
        </p>
      </div>

      <BottomSheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={sheet?.item.title}
      >
        {sheet && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {trainer && (
                <Avatar
                  initials={trainer.initials}
                  tone={trainer.tone}
                  size="lg"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-50">
                  {sheet.item.sheet?.profession}
                </p>
                <p className="num mt-0.5 text-xs text-ink-400">
                  {areaLabel(sheet.item.area)}
                  {sheet.item.distanceKm > 0 && (
                    <> · {grouped(sheet.item.distanceKm)} km away</>
                  )}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-volt-700">
                  <Star className="h-3.5 w-3.5" />
                  <span className="num font-bold">
                    {trainer?.rating ?? sheet.item.rating}
                  </span>
                  <span className="text-ink-500">
                    ({sheet.item.sheet?.reviewCount} reviews)
                  </span>
                </p>
              </div>
            </div>

            <List variant="surface">
              {(
                [
                  ["Speciality", sheet.item.sheet?.speciality],
                  ["From", sheet.item.sheet?.fromPrice],
                  ["Availability", sheet.item.sheet?.availability],
                  ["Rating", `${trainer?.rating ?? sheet.item.rating} / 5`],
                ] as [string, string | undefined][]
              ).map(([k, v]) => (
                <ListRow key={k}>
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                      {k}
                    </span>
                    <span className="text-[13px] font-semibold text-ink-100">
                      {v}
                    </span>
                  </span>
                </ListRow>
              ))}
            </List>

            <div className="rounded-xl border border-info-500/30 bg-info-500/10 p-3.5">
              <p className="text-[12px] leading-relaxed text-info-600">
                Bookings and payments arrive in Phase 2 (PRD §32). Trainers are
                discoverable in v1 so you can find and follow them.
              </p>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
