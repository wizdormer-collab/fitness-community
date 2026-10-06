"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/controls";
import { BottomSheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/state";
import { ScreenHeader } from "@/components/ui/header";
import { Star } from "@/components/ui/icons";
import { DISCOVER_ITEMS } from "@/lib/mock-data";
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
} from "@/lib/types";
import { areaLabel, grouped } from "@/lib/format";
import { trainerById } from "@/lib/selectors";
import type { DiscoverItem } from "@/lib/types";

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
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-800 text-lg ring-1 ring-ink-700">
            🔍
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
              <span aria-hidden>{c.emoji}</span>
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
          emoji="🗺️"
          title="Nothing here yet"
          body="No results in this category near your area. Try another category or widen your search."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const inner = (
              <Card className="flex items-center gap-4 p-4 transition active:scale-[0.99]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-3xl">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-display text-[15px] font-bold text-ink-50">
                      {item.title}
                    </h3>
                    {item.verified && (
                      <Badge tone="info" className="shrink-0">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[13px] text-ink-300">
                    {item.meta}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
                    <span className="num">{areaLabel(item.area)}</span>
                    {item.distanceKm > 0 && (
                      <span className="num">· {item.distanceKm} km away</span>
                    )}
                    {item.rating && (
                      <span className="num flex items-center gap-1">
                        · <Star className="h-3 w-3" /> {item.rating}
                      </span>
                    )}
                  </div>
                  {item.badge && (
                    <div className="mt-2">
                      <Badge tone="volt">{item.badge}</Badge>
                    </div>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-ink-600"
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
              </Card>
            );

            // Trainers resolve to a detail sheet — PRD §21 profiles are Phase 2,
            // so there is no route to link to yet.
            if (item.category === "trainers") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSheet(item)}
                  className="block w-full text-left"
                >
                  {inner}
                </button>
              );
            }

            return item.href ? (
              <Link key={item.id} href={item.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-dashed border-ink-700 bg-ink-850/60 p-4">
        <p className="text-[13px] leading-relaxed text-ink-400">
          <span className="font-semibold text-ink-200">Gym crowd levels</span>{" "}
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
                <p className="num mt-0.5 text-xs text-ink-300">
                  {areaLabel(sheet.area)} · {grouped(sheet.distanceKm * 1000 / 1000)}{" "}
                  km away
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-volt-400">
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

            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Speciality", sheet.sheet?.speciality],
                ["From", sheet.sheet?.fromPrice],
                ["Availability", sheet.sheet?.availability],
                ["Rating", `${trainer?.rating ?? sheet.rating} / 5`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-ink-700 bg-ink-800 p-3"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    {k}
                  </dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink-100">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="rounded-xl border border-info-500/30 bg-info-500/10 p-3.5">
              <p className="text-[12px] leading-relaxed text-info-400">
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
