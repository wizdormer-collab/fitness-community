"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, SectionHeader, Divider } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { Avatar } from "@/components/ui/avatar";
import { Button, Chip, SegmentedControl } from "@/components/ui/controls";
import { ProgressBar } from "@/components/ui/metrics";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/cn";
import { CHALLENGES, USERS } from "@/lib/mock-data";
import { grouped } from "@/lib/format";
import type { Challenge } from "@/lib/types";

type Tab = "challenges" | "board";

const fmt = (c: Challenge, v: number) =>
  c.metric === "distance" ? `${v} km` : c.metric === "streak" ? `${v} d` : `${v}`;

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
          <section className="mb-6">
            <SectionHeader
              label={`Your challenges (${mine.length})`}
              hint="Tap a card for the full standings"
            />
            {mine.length === 0 ? (
              <EmptyState
                emoji="🏁"
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

          <section className="mb-6">
            <SectionHeader label="Open to join" hint="Community-hosted" />
            <div className="space-y-3">
              {openList.length === 0 ? (
                <EmptyState
                  emoji="✅"
                  title="You're in everything"
                  body="Every open challenge on the platform is already on your board."
                />
              ) : (
                openList.map((c) => (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-xl">
                        {c.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold text-ink-50">
                            {c.title}
                          </p>
                          <Badge tone="warn">{c.endsIn}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-ink-400">
                          {c.goal} · hosted by {c.hostName}
                        </p>
                        <p className="num mt-1.5 text-[11px] text-ink-500">
                          {grouped(c.participants)} participants
                        </p>
                      </div>
                    </div>
                    <Button
                      full
                      size="sm"
                      className="mt-3.5"
                      onClick={() => setJoined((s) => ({ ...s, [c.id]: true }))}
                    >
                      Join challenge
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="mb-6">
            <SectionHeader
              label="Weekly leaderboard"
              hint="Points from check-ins, sessions and PRs"
              action={{ label: "Rules", href: "/app/progress" }}
            />
            <Card className="divide-y divide-ink-700 p-0">
              {USERS.slice(0, 8).map((u, i) => {
                const score = 420 - i * 37;
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3",
                      u.id === "david" && "bg-volt-400/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "num w-6 text-center text-sm font-display font-bold",
                        i === 0
                          ? "text-volt-400"
                          : i < 3
                            ? "text-ink-200"
                            : "text-ink-500",
                      )}
                    >
                      {i + 1}
                    </span>
                    <Avatar initials={u.initials} tone={u.tone} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-100">
                        {u.name}
                        {u.id === "david" && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-volt-400">
                            You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-ink-500">
                        {u.area.replace("-", " ")} · {u.fitnessLevel}
                      </p>
                    </div>
                    <span className="num shrink-0 text-sm font-display font-bold text-ink-200">
                      {score}
                    </span>
                  </div>
                );
              })}
            </Card>
            <p className="mt-2.5 text-xs leading-relaxed text-ink-500">
              Your community gets to see when you skip — that is the point.
              Scores reset every Monday 00:00 WAT.
            </p>
          </section>

          <section className="mb-6">
            <SectionHeader label="Challenge standings" />
            <div className="space-y-3">
              {mine.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {c.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-50">
                        {c.title}
                      </p>
                      <p className="num text-[11px] text-ink-500">
                        You&apos;re #{grouped(c.you.rank)} of{" "}
                        {grouped(c.participants)}
                      </p>
                    </div>
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
                  <Divider className="my-3.5" />
                  <div className="space-y-2.5">
                    {c.leaderboard.map((row) => (
                      <div
                        key={`${c.id}-${row.rank}`}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-2 py-1.5",
                          row.you && "bg-volt-400/[0.08] ring-1 ring-volt-400/25",
                        )}
                      >
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
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="flex flex-wrap gap-2">
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
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3.5 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-xl">
          {c.emoji}
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
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-ink-500">
            Standings
          </p>
          <div className="space-y-2.5">
            {c.leaderboard.map((row) => (
              <div
                key={`${c.id}-lb-${row.rank}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-1.5",
                  row.you && "bg-volt-400/[0.08] ring-1 ring-volt-400/25",
                )}
              >
                <span
                  className={cn(
                    "num w-7 text-center text-xs font-bold",
                    row.rank <= 3 ? "text-volt-400" : "text-ink-500",
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
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" onClick={onLeave}>
              Leave challenge
            </Button>
            <Link
              href="/app/progress"
              className="inline-flex items-center px-3 text-xs font-semibold text-volt-400"
            >
              See your log →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
