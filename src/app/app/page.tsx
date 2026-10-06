"use client";

import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { Ring, SpotMeter, StreakFlame } from "@/components/ui/metrics";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, NOTIFICATIONS, PROGRESS, SESSIONS, ME } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import { activityOf, areaLabel, greeting, attending } from "@/lib/format";

export default function Home() {
  const { profile, state, isSessionJoined, isCommunityJoined, isNotificationRead } =
    usePrototype();

  const unread = NOTIFICATIONS.filter((n) => !n.read && !isNotificationRead(n.id)).length;
  const name = profile.name || ME.name;

  const todaySession =
    SESSIONS.find((s) => s.dayLabel === "Today" && s.status === "upcoming") ??
    SESSIONS[0]!;
  const nextRun = SESSIONS.find((s) => s.activity === "running") ?? SESSIONS[1]!;
  const community =
    COMMUNITIES.find((c) => isCommunityJoined(c.id) && c.todayTraining > 0) ??
    COMMUNITIES[0]!;
  const topRecord = PROGRESS.records[0]!;

  const joinedToday = isSessionJoined(todaySession.id);

  return (
    <div className="space-y-7">
      {/* ---- Header ---- */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
            {areaLabel(profile.area)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-50">
            {greeting()}, {name} 👋
          </h1>
        </div>
        <Link
          href="/app/notifications"
          aria-label={`Notifications, ${unread} unread`}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-ink-700 bg-ink-800 text-ink-300 transition hover:text-ink-100"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9zM10.5 19a1.8 1.8 0 0 0 3 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unread > 0 && (
            <span className="num absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt-400 px-1 text-[10px] font-bold text-ink-950">
              {unread}
            </span>
          )}
        </Link>
      </header>

      {/* ---- Your week (PRD §8) ---- */}
      <section>
        <SectionHeader label="Your week" />
        <Card className="flex items-center gap-5 p-5">
          <Ring
            value={state.weeklyCompleted}
            max={PROGRESS.weeklyTarget}
            size={84}
            label="workouts"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold leading-tight text-ink-50">
              {state.weeklyCompleted} / {PROGRESS.weeklyTarget} workouts
              completed
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-400">
              {state.weeklyCompleted >= PROGRESS.weeklyTarget
                ? "Weekly goal met. Everything else this week is a bonus."
                : `${PROGRESS.weeklyTarget - state.weeklyCompleted} more ${
                    PROGRESS.weeklyTarget - state.weeklyCompleted === 1
                      ? "session"
                      : "sessions"
                  } closes the week.`}
            </p>
            <div className="mt-3">
              <StreakFlame days={state.streak} size="sm" />
            </div>
          </div>
        </Card>
      </section>

      {/* ---- Today's activity (PRD §8) ---- */}
      <section>
        <SectionHeader
          label="Today's activity"
          action={{ label: "All sessions", href: "/app/sessions" }}
        />
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-volt-400/15 text-3xl ring-1 ring-inset ring-volt-400/30">
              {activityOf(todaySession.activity).emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold leading-tight text-ink-50">
                  {todaySession.title}
                </h3>
                {joinedToday && <Badge tone="ok">Joined</Badge>}
              </div>
              <p className="num mt-1 text-[13px] text-ink-300">
                {todaySession.time} · {areaLabel(todaySession.area)}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-400">
                {todaySession.location}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <SpotMeter
              taken={todaySession.spotsTaken}
              max={todaySession.maxSpots}
            />
          </div>

          <div className="mt-4 flex gap-2.5">
            <Button full href={`/app/sessions/${todaySession.id}`} className="flex-1">
              Join session
            </Button>
            <Button variant="secondary" href="/app/checkin">
              Check in
            </Button>
          </div>
        </Card>
      </section>

      {/* ---- Your community (PRD §8) ---- */}
      <section>
        <SectionHeader
          label="Your community"
          action={{ label: "Feed", href: "/app/community" }}
        />
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-3xl">
              {community.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold leading-tight text-ink-50">
                  {community.name}
                </h3>
                {community.badge && <Badge tone="volt">{community.badge}</Badge>}
              </div>
              <p className="num mt-1.5 flex items-center gap-2 text-[13px] text-ink-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-ok-500" />
                {community.todayTraining} people training today
              </p>
              <div className="mt-3 flex items-center gap-3">
                <AvatarStack
                  people={community.featuredMemberIds.map((id) => {
                    const u = userById(id);
                    return { initials: u.initials, tone: u.tone };
                  })}
                />
                <span className="num text-[11px] text-ink-500">
                  {community.members.toLocaleString("en-NG")} members
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button full variant="secondary" href={`/app/community/${community.id}`}>
              Open community
            </Button>
          </div>
        </Card>
      </section>

      {/* ---- Nearby (PRD §8) ---- */}
      <section>
        <SectionHeader
          label="Nearby"
          action={{ label: "Discover", href: "/app/discover" }}
        />
        <Link href={`/app/sessions/${nextRun.id}`}>
          <Card className="p-5 transition active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-info-500/25 to-info-600/10 text-3xl ring-1 ring-inset ring-info-500/25">
                {activityOf(nextRun.activity).emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-base font-bold text-ink-50">
                  {nextRun.title}
                </h3>
                <p className="num mt-1 text-[13px] text-ink-300">
                  {nextRun.dayLabel} · {nextRun.time}
                </p>
                <p className="num mt-1 text-[13px] text-volt-400">
                  {attending(nextRun.spotsTaken)}
                </p>
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 text-ink-500"
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
            </div>
          </Card>
        </Link>
      </section>

      {/* ---- Your progress (PRD §8) ---- */}
      <section>
        <SectionHeader
          label="Your progress"
          action={{ label: "90-day view", href: "/app/progress" }}
        />
        <Link href="/app/progress">
          <Card className="flex items-center gap-4 p-5 transition active:scale-[0.99]">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                Personal record
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-ink-50">
                {topRecord.exercise}
              </p>
              <p className="num mt-1 text-lg font-bold text-volt-400">
                {topRecord.from}
                <span className="mx-2 text-ink-500">→</span>
                {topRecord.to}
                <span className="ml-1 text-xs text-ink-400">
                  {topRecord.unit}
                </span>
              </p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-volt-400/12 text-3xl ring-1 ring-inset ring-volt-400/25">
              🏆
            </span>
          </Card>
        </Link>
      </section>

      {/* ---- Accountability nudge (PRD §17) ---- */}
      <section>
        <Card className="border-volt-400/25 bg-volt-400/[0.06] p-5">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl" aria-hidden>
              {state.weeklyCompleted >= PROGRESS.weeklyTarget ? "🎉" : "⏰"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug text-ink-50">
                {state.weeklyCompleted >= PROGRESS.weeklyTarget
                  ? `You planned ${PROGRESS.weeklyTarget} workouts this week. You've completed ${state.weeklyCompleted}.`
                  : `You planned ${PROGRESS.weeklyTarget} workouts this week. You've completed ${state.weeklyCompleted}.`}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-ink-400">
                {state.weeklyCompleted >= PROGRESS.weeklyTarget
                  ? "Log it if you haven't — then rest. Recovery is part of the programme."
                  : "One more session gets you to your weekly goal."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" href="/app/log">
              Log a workout
            </Button>
            <Chip size="sm" href="/app/discover">
              Find a session
            </Chip>
          </div>
        </Card>
      </section>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-ink-600">
        Prototype data · Lagos MVP · {areaLabel(profile.area)} ·
        {" "}v0.1
      </p>
    </div>
  );
}
