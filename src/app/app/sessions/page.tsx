"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/cn";
import { userById, upcoming, visibleSpots } from "@/lib/selectors";
import { usePrototype } from "@/lib/prototype-state";
import { activityLabel, areaLabel, levelLabel } from "@/lib/format";
import { Glyph, GlyphTile } from "@/components/ui/glyph";

type Filter = "upcoming" | "joined" | "free";

export default function Sessions() {
  const { isSessionJoined } = usePrototype();
  const [filter, setFilter] = useState<Filter>("upcoming");

  // `upcoming()` — not the raw collection — so a completed session can never
  // surface under a tab that promises one you can still join.
  const list = useMemo(() => {
    const withState = upcoming().map((s) => ({
      ...s,
      nowJoined: isSessionJoined(s.id),
    }));
    if (filter === "joined") return withState.filter((s) => s.nowJoined);
    if (filter === "free") return withState.filter((s) => s.cost === 0);
    return withState;
  }, [filter, isSessionJoined]);

  const filters: { id: Filter; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "joined", label: "Joined" },
    { id: "free", label: "Free" },
  ];

  return (
    <div>
      <ScreenHeader
        title="Sessions"
        subtitle="Create or join a workout. Check in when you arrive."
        right={
          <Link href="/app/checkin" aria-label="Check in">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-volt-400 text-onvolt">
              <Glyph name="qr" size={20} strokeWidth={1.9} />
            </span>
          </Link>
        }
      />

      {/* Segmented filter — kept narrow on desktop, where a full-bleed lime
          slab across 1120px reads as a banner rather than a control. */}
      <div className="mb-5 flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1 lg:max-w-lg">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              filter === f.id
                ? "bg-volt-400 text-onvolt"
                : "text-ink-300 hover:text-ink-100",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="classes"
          title={
            filter === "joined"
              ? "No sessions joined yet"
              : filter === "free"
                ? "No free sessions right now"
                : "Nothing scheduled"
          }
          body={
            filter === "joined"
              ? "Join a session and it will show up here with reminders and a check-in code."
              : filter === "free"
                ? "Every session on the schedule has a fee this week. Browse Upcoming to see them all."
                : "No sessions match this filter. Try Upcoming or check Discover for more."
          }
          action={
            filter === "upcoming" ? undefined : (
              <Chip onClick={() => setFilter("upcoming")}>Browse upcoming</Chip>
            )
          }
        />
      ) : (
        /* A browse grid of repeated session cards is the documented exception
           to the two-card budget (UI-SPEC §3) — same treatment as Discover,
           and the only layout that keeps the spot meter readable on desktop. */
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {list.map((s) => {
            // Joining/leaving moves capacity by one (visibleSpots) — the
            // attendee count moves with it, from the same delta, so the
            // number beside the avatars can never disagree with the meter.
            const spots = visibleSpots(s, s.nowJoined);
            const going = s.attendeeIds.length + (spots - s.spotsTaken);
            const full = spots >= s.maxSpots;

            return (
              <Link
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="block h-full animate-fade-up"
              >
                <Card className="flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink-600">
                  <span className="flex items-start gap-3">
                    <GlyphTile name={s.activity} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-display text-[15px] font-bold leading-snug text-ink-50">
                          {s.title}
                        </span>
                        <span className="shrink-0">
                          {s.nowJoined ? (
                            <Badge tone="ok">Joined</Badge>
                          ) : full ? (
                            <Badge tone="bad">Full</Badge>
                          ) : s.cost === 0 ? (
                            <Badge tone="volt">Free</Badge>
                          ) : (
                            <Badge tone="info">
                              ₦{s.cost.toLocaleString()}
                            </Badge>
                          )}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-ink-400">
                        {activityLabel(s.activity)} · {s.dayLabel} · {s.time}
                      </span>
                    </span>
                  </span>

                  <span className="block truncate text-[13px] text-ink-400">
                    {s.location} · {areaLabel(s.area)} · {levelLabel(s.level)}
                  </span>

                  <SpotMeter taken={spots} max={s.maxSpots} />

                  <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-ink-700 pt-3">
                    <AvatarStack
                      people={s.attendeeIds.slice(0, 4).map((id) => {
                        const u = userById(id);
                        return { initials: u.initials, tone: u.tone };
                      })}
                      size="xs"
                      max={4}
                    />
                    <span className="num text-[11px] text-ink-500">
                      {going} going · {s.organizerName}
                    </span>
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          GPS-based check-in is deferred to a later version — it needs per-gym
          geofencing, which depends on the business layer that is out of v1.
          QR and manual check-in ship now.
        </p>
      </div>
    </div>
  );
}
