"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, List, ListRow } from "@/components/ui/card";
import { Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/cn";
import { SESSIONS, USERS } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import { usePrototype } from "@/lib/prototype-state";
import { areaLabel } from "@/lib/format";
import { Glyph, GlyphTile } from "@/components/ui/glyph";

type Filter = "upcoming" | "joined" | "free";

export default function Sessions() {
  const { isSessionJoined } = usePrototype();
  const [filter, setFilter] = useState<Filter>("upcoming");

  const list = useMemo(() => {
    const withState = SESSIONS.map((s) => ({
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

      <div className="mb-5 flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
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
          title={filter === "joined" ? "No sessions joined yet" : "Nothing scheduled"}
          body={
            filter === "joined"
              ? "Join a session and it will show up here with reminders and a check-in code."
              : "No sessions match this filter. Try Upcoming or create your own."
          }
          action={
            filter === "joined" ? (
              <Chip onClick={() => setFilter("upcoming")}>Browse upcoming</Chip>
            ) : undefined
          }
        />
      ) : (
        <List variant="surface">
          {list.map((s) => {
            const full = s.spotsTaken >= s.maxSpots;
            return (
              <ListRow
                key={s.id}
                href={`/app/sessions/${s.id}`}
                layout="block"
                className="animate-fade-up"
              >
                <span className="flex items-start gap-3.5">
                  <GlyphTile name={s.activity} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate font-display text-[15px] font-bold text-ink-50">
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
                          <Badge tone="info">₦{s.cost.toLocaleString()}</Badge>
                        )}
                      </span>
                    </span>
                    <span className="num mt-1 block truncate text-[13px] text-ink-300">
                      {s.dayLabel} · {s.time}
                    </span>
                    <span className="num mt-0.5 block truncate text-[12px] text-ink-500">
                      {s.location} · {areaLabel(s.area)} · {s.level}
                    </span>

                    <span className="mt-3 block">
                      <SpotMeter taken={s.spotsTaken} max={s.maxSpots} />
                    </span>

                    <span className="mt-3 flex items-center justify-between gap-3">
                      <AvatarStack
                        people={s.attendeeIds.slice(0, 4).map((id) => {
                          const u = userById(id);
                          return { initials: u.initials, tone: u.tone };
                        })}
                        size="xs"
                        max={4}
                      />
                      <span className="text-[11px] text-ink-500">
                        Organised by {s.organizerName}
                      </span>
                    </span>
                  </span>
                </span>
              </ListRow>
            );
          })}
        </List>
      )}

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          GPS-based check-in is deferred to a later version — it needs per-gym
          geofencing, which depends on the business layer that is out of v1.
          QR and manual check-in ship now.
        </p>
      </div>

      <span className="sr-only">{USERS.length} people on the platform</span>
    </div>
  );
}
