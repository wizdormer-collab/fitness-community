"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, List, ListRow } from "@/components/ui/card";
import { Chip } from "@/components/ui/controls";
import { BottomSheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/state";
import { ScreenHeader } from "@/components/ui/header";
import { Star } from "@/components/ui/icons";
import { DISCOVER_ITEMS } from "@/lib/mock-data";
import { DISCOVER_CATEGORIES, type DiscoverCategoryId } from "@/lib/types";
import { areaLabel, grouped } from "@/lib/format";
import { trainerById } from "@/lib/selectors";
import type { DiscoverItem } from "@/lib/types";
import { Glyph, GlyphTile } from "@/components/ui/glyph";

export default function Discover() {
  const [cat, setCat] = useState<DiscoverCategoryId>("all");
  const [sheet, setSheet] = useState<DiscoverItem | null>(null);

  const items = useMemo(
    () =>
      cat === "all"
        ? DISCOVER_ITEMS
        : DISCOVER_ITEMS.filter((i) => i.category === cat),
    [cat],
  );

  const trainer = sheet?.sheet ? trainerById(sheet.id) : undefined;

  return (
    <div>
      <ScreenHeader
        title="Discover"
        subtitle="Fitness opportunities around you in Lagos."
        right={
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink-400 ring-1 ring-ink-700">
            <Glyph name="search" size={20} />
          </span>
        }
      />

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

      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
          {cat === "all"
            ? "Nearby"
            : DISCOVER_CATEGORIES.find((c) => c.id === cat)?.label}
        </span>
        <span className="num text-[11px] text-ink-500">
          {items.length} results
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="compass"
          title="Nothing here yet"
          body="No results in this category near your area. Try another category or widen your search."
        />
      ) : (
        <List variant="surface">
          {items.map((item) => {
            const inner = (
              <span className="flex items-start gap-3.5 py-1">
                <GlyphTile name={item.category} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate font-display text-[15px] font-bold text-ink-50">
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
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
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
                    <span className="mt-2 block">
                      <Badge tone="volt">{item.badge}</Badge>
                    </span>
                  )}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-1 shrink-0 text-ink-600"
                  aria-hidden
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            );

            // Trainers resolve to a detail sheet — PRD §21 profiles are Phase 2,
            // so there is no route to link to yet.
            if (item.category === "trainers") {
              return (
                <ListRow key={item.id} onClick={() => setSheet(item)} layout="block">
                  {inner}
                </ListRow>
              );
            }

            return item.href ? (
              <ListRow key={item.id} href={item.href} layout="block">
                {inner}
              </ListRow>
            ) : (
              <ListRow key={item.id} layout="block">
                {inner}
              </ListRow>
            );
          })}
        </List>
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
                  {areaLabel(sheet.area)} · {grouped((sheet.distanceKm * 1000) / 1000)}{" "}
                  km away
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
