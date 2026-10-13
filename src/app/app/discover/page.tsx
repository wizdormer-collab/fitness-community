"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, List, ListRow } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { BottomSheet } from "@/components/ui/sheet";
import { EmptyState, Skeleton } from "@/components/ui/state";
import { ScreenHeader } from "@/components/ui/header";
import { Star } from "@/components/ui/icons";
import { DISCOVER_CATEGORIES, type DiscoverCategoryId } from "@/lib/types";
import { areaLabel, grouped } from "@/lib/format";
import { discoverItems, trainerById } from "@/lib/selectors";
import type { DiscoverItem } from "@/lib/types";
import { Glyph, GlyphTile } from "@/components/ui/glyph";

/** Local filter settle time — the gap is surfaced as a skeleton, not a stall. */
const SEARCH_SETTLE_MS = 180;

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DISCOVER_CATEGORIES.map((c) => [c.id, c.label]),
);

function DiscoverCard({
  item,
  onOpen,
}: {
  item: DiscoverItem;
  onOpen: (item: DiscoverItem) => void;
}) {
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

      {/* mt-auto anchors the footer to the card bottom so cards stretched by a
          taller neighbour do not leave a hole; gap-3 keeps the 12px minimum. */}
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

  // Trainers resolve to a detail sheet — PRD §21 profiles are Phase 2, so there
  // is no route to link to yet.
  if (item.category === "trainers") {
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full text-left"
      >
        {body}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link key={item.id} href={item.href} className="block h-full">
        {body}
      </Link>
    );
  }

  return (
    <div key={item.id} className="h-full">
      {body}
    </div>
  );
}

/** Mirrors the card grid so the layout does not jump when results settle. */
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

export default function Discover() {
  const [cat, setCat] = useState<DiscoverCategoryId>("all");
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<DiscoverItem | null>(null);

  const all = useMemo(() => discoverItems(), []);

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

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((item) => {
      if (cat !== "all" && item.category !== cat) return false;
      if (!q) return true;
      return [
        item.title,
        item.meta,
        item.badge ?? "",
        areaLabel(item.area),
        CATEGORY_LABEL[item.category] ?? "",
        item.sheet?.profession ?? "",
        item.sheet?.speciality ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [all, cat, query]);

  const clearSearch = () => setRawQuery("");
  const trainer = sheet?.sheet ? trainerById(sheet.id) : undefined;
  const activeLabel = CATEGORY_LABEL[cat] ?? "All";
  // "Nearby" is the voice the screen shipped with; only swap it once the user
  // narrows to a category or types a query.
  const sectionLabel = query
    ? `Results for “${query}”`
    : cat === "all"
      ? "Nearby"
      : activeLabel;

  return (
    <div>
      <ScreenHeader
        title="Discover"
        subtitle="Fitness opportunities around you in Lagos."
      />

      {/* Search (PRD §11) — a real field, not the decorative icon it replaces. */}
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
            placeholder="Search gyms, run clubs, trainers, areas…"
            className="h-12 w-full rounded-2xl border border-ink-700 bg-ink-800 pl-12 pr-11 text-[15px] text-ink-50 placeholder:text-ink-500 outline-none transition focus:border-volt-600"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-750 hover:text-ink-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
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

      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
          {sectionLabel}
        </span>
        <span className="num shrink-0 text-[11px] text-ink-500" aria-live="polite">
          {settling
            ? "Searching…"
            : `${results.length} ${results.length === 1 ? "result" : "results"}`}
        </span>
      </div>

      {settling ? (
        <DiscoverSkeleton />
      ) : results.length === 0 ? (
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
              <Button variant="secondary" onClick={() => setCat("all")}>
                Show all categories
              </Button>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {results.map((item) => (
            <DiscoverCard key={item.id} item={item} onOpen={setSheet} />
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
        title={sheet?.title}
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
                  {sheet.sheet?.profession}
                </p>
                <p className="num mt-0.5 text-xs text-ink-400">
                  {areaLabel(sheet.area)}
                  {sheet.distanceKm > 0 && (
                    <> · {grouped(sheet.distanceKm)} km away</>
                  )}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-volt-700">
                  <Star className="h-3.5 w-3.5" />
                  <span className="num font-bold">
                    {trainer?.rating ?? sheet.rating}
                  </span>
                  <span className="text-ink-500">
                    ({sheet.sheet?.reviewCount} reviews)
                  </span>
                </p>
              </div>
            </div>

            <List variant="surface">
              {(
                [
                  ["Speciality", sheet.sheet?.speciality],
                  ["From", sheet.sheet?.fromPrice],
                  ["Availability", sheet.sheet?.availability],
                  ["Rating", `${trainer?.rating ?? sheet.rating} / 5`],
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
