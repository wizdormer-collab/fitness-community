"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  Badge,
  Card,
  List,
  ListRow,
  SectionHeader,
} from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { BottomSheet } from "@/components/ui/sheet";
import { EmptyState, Skeleton } from "@/components/ui/state";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { Star } from "@/components/ui/icons";
import { Glyph, GlyphTile } from "@/components/ui/glyph";
import {
  DISCOVER_CATEGORIES,
  type Community,
  type DiscoverCategoryId,
  type Session,
} from "@/lib/types";
import { activityLabel, areaLabel, grouped } from "@/lib/format";
// Type-only import: erased at build time, so `@/lib/selectors` stays a lazily
// loaded chunk. That boundary is what makes the loading and error states below
// real conditions rather than faked timers.
import type { DiscoverResult } from "@/lib/selectors";

/** Local filter settle time — the gap is surfaced as a skeleton, not a stall. */
const SEARCH_SETTLE_MS = 180;

type ListingResult = Extract<DiscoverResult, { kind: "listing" }>;

interface DiscoverData {
  results: DiscoverResult[];
  featured: DiscoverResult[];
}

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DISCOVER_CATEGORIES.map((c) => [c.id, c.label]),
);

/* -------------------------------------------------------------------------- */
/* Cards                                                                        */
/* -------------------------------------------------------------------------- */

function ListingCard({
  result,
  onOpen,
}: {
  result: ListingResult;
  onOpen: (result: ListingResult) => void;
}) {
  const item = result.item;
  const body = (
    <Card className="flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink-600">
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

      {/* mt-auto anchors the footer so cards stretched by a taller neighbour
          do not leave a hole; gap-3 keeps the 12px minimum. */}
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

      {item.badge && (
        <span className="block">
          <Badge tone="volt">{item.badge}</Badge>
        </span>
      )}
    </Card>
  );

  // Trainers resolve to a detail sheet — PRD §21 profiles are not built yet,
  // so there is no route to link to.
  if (item.sheet) {
    return (
      <button
        key={result.id}
        type="button"
        onClick={() => onOpen(result)}
        className="block w-full text-left"
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

/** PRD §11 — every field the brief asks for: title, activity, day, time,
 *  venue and attendance, all read straight off the session record. */
function SessionCard({ session }: { session: Session }) {
  return (
    <Link href={`/app/sessions/${session.id}`} className="block h-full">
      <Card className="flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink-600">
        <div className="flex items-start gap-3">
          <GlyphTile name={session.activity} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-bold leading-snug text-ink-50">
              {session.title}
            </div>
            <div className="mt-0.5 text-[13px] text-ink-400">
              {activityLabel(session.activity)} · {session.dayLabel} ·{" "}
              {session.time}
            </div>
          </div>
        </div>

        <div className="text-[13px] text-ink-400">
          {session.location} · {areaLabel(session.area)}
        </div>

        <div className="mt-auto border-t border-ink-700 pt-3">
          <SpotMeter taken={session.spotsTaken} max={session.maxSpots} />
          <div className="mt-2 text-right text-[13px] font-semibold text-volt-700">
            View session
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CommunityCard({
  community,
  badge,
}: {
  community: Community;
  badge?: string;
}) {
  return (
    <Link href={`/app/community/${community.id}`} className="block h-full">
      <Card className="flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink-600">
        <div className="flex items-start gap-3">
          <GlyphTile name="communities" size="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-bold leading-snug text-ink-50">
              {community.name}
            </div>
            <div className="num mt-0.5 text-[13px] text-ink-400">
              {community.members.toLocaleString("en-GB")} members ·{" "}
              {community.cadence}
            </div>
          </div>
          {badge && (
            <Badge tone="volt" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>

        {/* The brief asks for a short description — the seed's tagline is
            exactly that, so no copy has to be invented for it. */}
        <p className="text-[13px] leading-relaxed text-ink-500">
          {community.tagline}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-ink-700 pt-3 text-[12px] text-ink-500">
          <span>
            {areaLabel(community.area)} · {activityLabel(community.activity)}
          </span>
          <span className="font-semibold text-volt-700">View community</span>
        </div>
      </Card>
    </Link>
  );
}

function ResultCard({
  result,
  onOpen,
}: {
  result: DiscoverResult;
  onOpen: (result: ListingResult) => void;
}) {
  if (result.kind === "session") return <SessionCard session={result.session} />;
  if (result.kind === "community")
    return (
      <CommunityCard community={result.community} badge={result.item.badge} />
    );
  return <ListingCard result={result} onOpen={onOpen} />;
}

/** Mirrors the grid so the layout does not jump when results settle. */
function DiscoverSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-ink-700 bg-ink-800 p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <div className="mt-4 border-t border-ink-700 pt-3">
            <Skeleton className="h-3 w-1/3" />
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

  // Data is behind a dynamic import so "loading" and "error" are conditions the
  // screen can actually be in (chunk fetch fails offline or after a deploy),
  // not simulated. No setState runs synchronously here — results and failures
  // both arrive through the promise callbacks.
  useEffect(() => {
    let cancelled = false;
    import("@/lib/selectors")
      .then((mod) => {
        const results = mod.buildDiscoverResults();
        return { results, featured: mod.discoverFeatured(results) };
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
  }, [attempt]);

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

  // Recommended only shows on the unfiltered view, and those rows are then
  // pulled out of the grid below so nothing appears twice.
  const showFeatured =
    !!data && !loadError && !settling && cat === "all" && !query;
  const grid = useMemo(() => {
    if (!showFeatured || !data) return filtered;
    const ids = new Set(data.featured.map((r) => r.id));
    return filtered.filter((r) => !ids.has(r.id));
  }, [filtered, data, showFeatured]);

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
      ? "Nearby"
      : activeLabel;
  const trainer = sheet?.trainer;

  return (
    <div>
      <ScreenHeader
        title="Discover"
        subtitle="Fitness opportunities around you in Lagos."
      />

      {/* Search (PRD §11) — a real field, not a decorative icon. */}
      <div role="search" className="mb-5 lg:max-w-xl">
        <label htmlFor="discover-q" className="sr-only">
          Search Discover
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
            <Glyph name="search" size={18} />
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
            className="h-12 w-full rounded-2xl border border-ink-700 bg-ink-800 pl-12 pr-11 text-[15px] text-ink-50 placeholder:text-ink-500 outline-none transition focus:border-volt-600"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-750 hover:text-ink-100"
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

      {showFeatured && data && data.featured.length > 0 && (
        <section className="mb-7">
          <SectionHeader label="Recommended" />
          {/* Mobile scrolls the row sideways (no page overflow), desktop
              snaps the same three cards into an even grid. */}
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
            {data.featured.map((result) => (
              <div
                key={result.id}
                className="w-[78%] shrink-0 sm:w-[46%] lg:w-auto"
              >
                <ResultCard result={result} onOpen={setSheet} />
              </div>
            ))}
          </div>
        </section>
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {grid.map((result) => (
            <ResultCard key={result.id} result={result} onOpen={setSheet} />
          ))}
        </div>
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
