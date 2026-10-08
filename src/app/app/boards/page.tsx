"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Band, List, ListRow, SectionHeader } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { Avatar } from "@/components/ui/avatar";
import { Button, Chip, SegmentedControl } from "@/components/ui/controls";
import { ProgressBar } from "@/components/ui/metrics";
import { EmptyState } from "@/components/ui/state";
import { Glyph, type GlyphName } from "@/components/ui/glyph";
import { cn } from "@/lib/cn";
import { CHALLENGES, USERS } from "@/lib/mock-data";
import { grouped } from "@/lib/format";
import type { Challenge } from "@/lib/types";

type Tab = "challenges" | "board";

const fmt = (c: Challenge, v: number) =>
  c.metric === "distance" ? `${v} km` : c.metric === "streak" ? `${v} d` : `${v}`;

const METRIC_ICON: Record<Challenge["metric"], GlyphName> = {
  workouts: "gym",
  distance: "running",
  streak: "flame",
};

export default function Boards() {
  const [tab, setTab] = useState<Tab>("challenges");
  const [joined, setJoined] = useState<Record<string, boolean>>(
    Object.fromEntries(CHALLENGES.map((c) => [c.id, c.joined])),
  );
  const [open, setOpen] = useState<string | null>(CHALLENGES[0]!.id);

  const mine = CHALLENGES.filter((c) => joined[c.id]);
  const openList = CHALLENGES.filter((c) => !joined[c.id]);

  return (
    <div>
      <ScreenHeader
        title="Boards"
        subtitle="Challenges and leaderboards. Progress, not vanity metrics."
        backHref="/app/sessions"
        backLabel="Sessions"
      />

      <SegmentedControl<Tab>
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[
          { id: "challenges", label: "Challenges" },
          { id: "board", label: "Leaderboard" },
        ]}
      />

      {tab === "challenges" ? (
        <>
          <section className="mb-7">
            <SectionHeader
              label={`Your challenges (${mine.length})`}
              hint="Tap a card for the full standings"
            />
            {mine.length === 0 ? (
              <EmptyState
                icon="flag"
                title="No active challenges"
                body="Join one below and your workouts start counting toward a shared goal."
              />
            ) : (
              <div className="space-y-3">
                {mine.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    c={c}
                    open={open === c.id}
                    onToggle={() => setOpen(open === c.id ? null : c.id)}
                    onLeave={() => setJoined((s) => ({ ...s, [c.id]: false }))}
                  />
                ))}
              </div>
            )}
          </section>

          <Band label="Open to join" hint="Community-hosted">
            {openList.length === 0 ? (
              <EmptyState
                icon="check"
                title="You're in everything"
                body="Every open challenge on the platform is already on your board."
              />
            ) : (
              <List>
                {openList.map((c) => (
                  <ListRow key={c.id} className="py-4">
                    <span className="flex items-start gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-750 text-ink-300">
                        <Glyph name={METRIC_ICON[c.metric]} size={21} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm font-bold text-ink-50">
                            {c.title}
                          </span>
                          <Badge tone="warn">{c.endsIn}</Badge>
                        </span>
                        <span className="mt-1 block text-xs text-ink-400">
                          {c.goal} · hosted by {c.hostName}
                        </span>
                        <span className="num mt-1 block text-[11px] text-ink-500">
                          {grouped(c.participants)} participants
                        </span>
                        <span className="mt-2.5 flex">
                          <Button
                            size="sm"
                            onClick={() =>
                              setJoined((s) => ({ ...s, [c.id]: true }))
                            }
                          >
                            Join challenge
                          </Button>
                        </span>
                      </span>
                    </span>
                  </ListRow>
                ))}
              </List>
            )}
          </Band>
        </>
      ) : (
        <>
          <section className="mb-7">
            <SectionHeader
              label="Weekly leaderboard"
              hint="Points from check-ins, sessions and PRs"
              action={{ label: "Rules", href: "/app/progress" }}
            />
            <List>
              {USERS.slice(0, 8).map((u, i) => {
                const score = 420 - i * 37;
                return (
                  <ListRow key={u.id} className={cn(u.id === "david" && "bg-volt-400/[0.06]")}>
                    <span className="flex items-center gap-3.5">
                      <span
                        className={cn(
                          "num w-6 text-center text-sm font-display font-bold",
                          i === 0
                            ? "text-volt-700"
                            : i < 3
                              ? "text-ink-200"
                              : "text-ink-500",
                        )}
                      >
                        {i + 1}
                      </span>
                      <Avatar initials={u.initials} tone={u.tone} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-100">
                          {u.name}
                          {u.id === "david" && (
                            <span className="ml-1.5 text-[11px] font-bold uppercase tracking-wider text-volt-700">
                              You
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-ink-500">
                          {u.area.replace("-", " ")} · {u.fitnessLevel}
                        </span>
                      </span>
                      <span className="num shrink-0 text-sm font-display font-bold text-ink-200">
                        {score}
                      </span>
                    </span>
                  </ListRow>
                );
              })}
            </List>
            <p className="mt-2.5 text-xs leading-relaxed text-ink-500">
              Your community gets to see when you skip — that is the point.
              Scores reset every Monday 00:00 WAT.
            </p>
          </section>

          <Band label="Challenge standings">
            <div className="space-y-3">
              {mine.map((c) => (
                <div key={c.id} className="py-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-volt-400/20 text-volt-700">
                      <Glyph name={METRIC_ICON[c.metric]} size={21} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink-50">
                        {c.title}
                      </span>
                      <span className="num block text-[11px] text-ink-500">
                        You&apos;re #{grouped(c.you.rank)} of {grouped(c.participants)}
                      </span>
                    </span>
                    <Badge tone={c.you.pct >= 70 ? "ok" : "volt"}>
                      {c.you.pct}%
                    </Badge>
                  </div>
                  <ProgressBar
                    className="mt-3"
                    value={c.you.value}
                    max={c.target}
                    showLabel
                  />
                  <List className="mt-3.5">
                    {c.leaderboard.map((row) => (
                      <ListRow
                        key={`${c.id}-lb-${row.rank}`}
                        className={cn(
                          "px-2",
                          row.you && "bg-volt-400/[0.08] ring-1 ring-inset ring-volt-400/30",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className="num w-7 text-center text-xs font-bold text-ink-500">
                            {grouped(row.rank)}
                          </span>
                          <Avatar
                            initials={row.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)}
                            tone={row.tone}
                            size="sm"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm text-ink-200">
                            {row.name}
                          </span>
                          <span className="num text-xs font-bold text-ink-300">
                            {fmt(c, row.value)}
                          </span>
                        </span>
                      </ListRow>
                    ))}
                  </List>
                </div>
              ))}
            </div>
          </Band>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip size="sm" href="/app/progress">
          Your progress
        </Chip>
        <Chip size="sm" href="/app/community">
          Communities
        </Chip>
      </div>
    </div>
  );
}

function ChallengeCard({
  c,
  open,
  onToggle,
  onLeave,
}: {
  c: Challenge;
  open: boolean;
  onToggle: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="card-shine overflow-hidden rounded-2xl border border-ink-700 bg-ink-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3.5 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-ink-300">
          <Glyph name={METRIC_ICON[c.metric]} size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-bold text-ink-50">{c.title}</p>
            <span className="num shrink-0 text-[11px] text-ink-500">
              {open ? "−" : "+"}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-400">
            {c.goal} · {grouped(c.participants)} in
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Badge tone="warn">{c.endsIn}</Badge>
            <Badge tone="volt">
              #{grouped(c.you.rank)} · {fmt(c, c.you.value)}
            </Badge>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4">
        <ProgressBar value={c.you.value} max={c.target} showLabel />
        <p className="mt-2 text-[11px] text-ink-500">
          {c.you.pct}% of {c.goal} · hosted by {c.hostName}
        </p>
      </div>

      {open && (
        <div className="border-t border-ink-700 bg-ink-850/60 p-4 animate-fade-up">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            Standings
          </p>
          <List>
            {c.leaderboard.map((row) => (
              <ListRow
                key={`${c.id}-lb-${row.rank}`}
                className={cn(
                  "px-2",
                  row.you && "bg-volt-400/[0.08] ring-1 ring-inset ring-volt-400/30",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "num w-7 text-center text-xs font-bold",
                      row.rank <= 3 ? "text-volt-700" : "text-ink-500",
                    )}
                  >
                    {grouped(row.rank)}
                  </span>
                  <Avatar
                    initials={row.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                    tone={row.tone}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-200">
                    {row.name}
                  </span>
                  <span className="num text-xs font-bold text-ink-300">
                    {fmt(c, row.value)}
                  </span>
                </span>
              </ListRow>
            ))}
          </List>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={onLeave}>
              Leave challenge
            </Button>
            <Link
              href="/app/progress"
              className="text-xs font-semibold text-volt-700"
            >
              See your log →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
