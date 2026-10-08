"use client";

import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Band, List, ListRow, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { Ring, SpotMeter, StreakFlame } from "@/components/ui/metrics";
import { Glyph } from "@/components/ui/glyph";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, NOTIFICATIONS, PROGRESS, SESSIONS, ME } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import { areaLabel, greeting, attending } from "@/lib/format";

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
  const goalMet = state.weeklyCompleted >= PROGRESS.weeklyTarget;

  return (
    <div className="space-y-7">
      {/* ---- Header ---- */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
            {areaLabel(profile.area)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-50">
            {greeting()}, {name}
          </h1>
        </div>
        <Link
          href="/app/notifications"
          aria-label={`Notifications, ${unread} unread`}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-ink-700 bg-ink-800 text-ink-300 transition hover:text-ink-100"
        >
          <Glyph name="bell" size={19} />
          {unread > 0 && (
            <span className="num absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt-400 px-1 text-[11px] font-bold text-onvolt">
              {unread}
            </span>
          )}
        </Link>
      </header>

      {/* ---- Your week (PRD §8) — unboxed ---- */}
      <Band divided>
        <SectionHeader label="Your week" />
        <div className="flex items-center gap-5">
          <Ring
            value={state.weeklyCompleted}
            max={PROGRESS.weeklyTarget}
            size={84}
            label="workouts"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold leading-tight text-ink-50">
              {state.weeklyCompleted} / {PROGRESS.weeklyTarget} workouts completed
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-400">
              {goalMet
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
        </div>
      </Band>

      {/* ---- Today's activity (PRD §8) — the one framed thing on Home ---- */}
      <section>
        <SectionHeader
          label="Today's activity"
          action={{ label: "All sessions", href: "/app/sessions" }}
        />
        <div className="card-shine overflow-hidden rounded-2xl border border-ink-700 bg-ink-800">
          <div className="flex items-start gap-4 p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-volt-400/15 text-volt-700 ring-1 ring-inset ring-volt-600/30">
              <Glyph name={todaySession.activity} size={28} />
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

          <div className="px-5">
            <SpotMeter taken={todaySession.spotsTaken} max={todaySession.maxSpots} />
          </div>

          {/* Who's already in — PRD §9 people-first ordering. */}
          <div className="mt-4 flex items-center justify-between gap-3 px-5">
            <AvatarStack
              people={todaySession.attendeeIds.slice(0, 4).map((id) => {
                const u = userById(id);
                return { initials: u.initials, tone: u.tone };
              })}
              size="xs"
              max={4}
            />
            <span className="num text-[11px] text-ink-500">
              {attending(todaySession.spotsTaken)}
            </span>
          </div>

          <div className="mt-4 flex gap-2.5 border-t border-ink-700 p-4">
            <Button full href={`/app/sessions/${todaySession.id}`} className="flex-1">
              Join session
            </Button>
            <Button variant="secondary" href="/app/checkin">
              Check in
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Your community (PRD §8) — unboxed ---- */}
      <Band divided>
        <SectionHeader
          label="Your community"
          action={{ label: "Feed", href: "/app/community" }}
        />
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-ink-300">
            <Glyph name={community.activity} size={28} />
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
            <div className="mt-3">
              <Chip size="sm" href={`/app/community/${community.id}`}>
                Open community
              </Chip>
            </div>
          </div>
        </div>
      </Band>

      {/* ---- Nearby + your progress (PRD §8) as one list ---- */}
      <Band divided>
        <SectionHeader
          label="Nearby"
          action={{ label: "Discover", href: "/app/discover" }}
        />
        <List>
          <ListRow href={`/app/sessions/${nextRun.id}`} chevron>
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-info-500/25 to-info-600/10 text-info-400">
                <Glyph name={nextRun.activity} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[15px] font-bold text-ink-50">
                  {nextRun.title}
                </span>
                <span className="num block text-[13px] text-ink-300">
                  {nextRun.dayLabel} · {nextRun.time}
                </span>
                <span className="num block text-[13px] text-volt-700">
                  {attending(nextRun.spotsTaken)}
                </span>
              </span>
            </span>
          </ListRow>

          <ListRow href="/app/progress" chevron>
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-volt-400/15 text-volt-700">
                <Glyph name="trophy" size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  Personal record
                </span>
                <span className="mt-0.5 block truncate font-display text-[15px] font-bold text-ink-50">
                  {topRecord.exercise}
                </span>
                <span className="num block text-[15px] font-bold text-volt-700">
                  {topRecord.from}
                  <span className="mx-2 text-ink-500">→</span>
                  {topRecord.to}
                  <span className="ml-1 text-xs text-ink-400">{topRecord.unit}</span>
                </span>
              </span>
            </span>
          </ListRow>
        </List>
      </Band>

      {/* ---- Accountability nudge (PRD §17) — volt callout, not a card ---- */}
      <section className="rounded-2xl border border-volt-600/35 bg-volt-400/[0.09] p-5">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-volt-400/30 text-volt-800">
            <Glyph name={goalMet ? "trophy" : "clock"} size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-ink-50">
              You committed to {PROGRESS.weeklyTarget} workouts this week.
              You&apos;ve completed {state.weeklyCompleted}.
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-400">
              {goalMet
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
      </section>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-ink-600">
        Prototype data · Lagos MVP · {areaLabel(profile.area)} ·
        {" "}v0.1
      </p>
    </div>
  );
}
