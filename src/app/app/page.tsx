"use client";

import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, List, ListRow, SectionHeader } from "@/components/ui/card";
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
  const remaining = PROGRESS.weeklyTarget - state.weeklyCompleted;

  return (
    /* Mobile: one column, order unchanged from the original screen.
       lg: each block is placed explicitly so the same DOM builds a two-column
       dashboard — a rail of personal context on the left, the live feed on the
       right — without duplicating a single section. */
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
      {/* ---- Header ---- */}
      <header className="flex items-start justify-between gap-4 lg:col-span-12 lg:row-start-1">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-volt-600" />
            {areaLabel(profile.area)}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-50 sm:text-[30px]">
            {greeting()}, {name}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop already has the floating action covered by the sidebar, so
              this is a second, in-context way to start a log from the top.
              Wrapped rather than className="hidden lg:inline-flex": Button's
              own `inline-flex` and `hidden` are the same property, so the
              winner would be stylesheet order, not the variant. */}
          <span className="hidden lg:block">
            <Button size="sm" href="/app/log">
              Log workout
            </Button>
          </span>
          <Link
            href="/app/notifications"
            aria-label={`Notifications, ${unread} unread`}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-700 bg-ink-800 text-ink-300 card-shine transition hover:border-ink-600 hover:text-ink-100"
          >
            <Glyph name="bell" size={19} />
            {unread > 0 && (
              <span className="num absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt-400 px-1 text-[11px] font-bold text-onvolt">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ---- Your week (PRD §8) — rail, row 2 ---- */}
      <section className="lg:col-span-4 lg:col-start-1 lg:row-start-2">
        <Card className="flex h-full flex-col p-5">
          <SectionHeader label="Your week" />
          <div className="flex items-center gap-5">
            <Ring
              value={state.weeklyCompleted}
              max={PROGRESS.weeklyTarget}
              size={84}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold leading-tight text-ink-50">
                {state.weeklyCompleted} of {PROGRESS.weeklyTarget} workouts
              </p>
              <p className="mt-1 text-[13px] leading-snug text-ink-400">
                {goalMet
                  ? "Weekly goal met. Everything else this week is a bonus."
                  : `${remaining} more ${remaining === 1 ? "session" : "sessions"} closes the week.`}
              </p>
            </div>
          </div>
          <div className="mt-auto pt-5">
            <StreakFlame days={state.streak} size="sm" />
          </div>
        </Card>
      </section>

      {/* ---- Today's activity (PRD §8) — the hero card, row 2 ---- */}
      <section className="lg:col-span-8 lg:col-start-5 lg:row-start-2">
        <Card className="flex h-full flex-col">
          <div className="flex items-start gap-4 p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-volt-400 text-onvolt">
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

          <div className="mt-auto flex gap-2.5 border-t border-ink-700 p-4">
            <Button full href={`/app/sessions/${todaySession.id}`} className="flex-1">
              Join session
            </Button>
            <Button variant="secondary" href="/app/checkin">
              Check in
            </Button>
          </div>
        </Card>
      </section>

      {/* ---- Your community (PRD §8) — rail, row 3 ---- */}
      <section className="lg:col-span-4 lg:col-start-1 lg:row-start-3">
        <Card className="flex h-full flex-col p-5">
          <SectionHeader
            label="Your community"
            action={{ label: "Feed", href: "/app/community" }}
          />
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-ink-300">
              <Glyph name={community.activity} size={28} />
            </span>
            <span className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold leading-tight text-ink-50">
                {community.name}
              </h3>
              {community.badge && (
                <span className="mt-1.5 block">
                  <Badge tone="volt">{community.badge}</Badge>
                </span>
              )}
              <p className="num mt-1.5 flex items-center gap-2 text-[13px] text-ink-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-ok-500" />
                {community.todayTraining} people training today
              </p>
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-700 pt-4">
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

          <div className="mt-auto pt-4">
            <Chip size="sm" href={`/app/community/${community.id}`}>
              Open community
            </Chip>
          </div>
        </Card>
      </section>

      {/* ---- Nearby + your progress (PRD §8) — unboxed, row 4 ---- */}
      <section className="lg:col-span-8 lg:col-start-5 lg:row-start-3">
        <SectionHeader
          label="Nearby"
          action={{ label: "Discover", href: "/app/discover" }}
        />
        <List variant="surface">
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
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-volt-400/20 text-volt-700">
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
      </section>

      {/* ---- Accountability nudge (PRD §17) — lime callout, full width ---- */}
      <section className="rounded-2xl border border-volt-600/40 bg-volt-400/[0.13] p-5 lg:col-span-12 lg:row-start-4 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-volt-400 text-onvolt">
            <Glyph name={goalMet ? "trophy" : "clock"} size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-ink-50">
              You committed to {PROGRESS.weeklyTarget} workouts this week. You&apos;ve
              completed {state.weeklyCompleted}.
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-300">
              {goalMet
                ? "Log it if you haven't — then rest. Recovery is part of the programme."
                : "One more session gets you to your weekly goal."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex shrink-0 flex-wrap gap-2 lg:mt-0">
          <Button size="sm" href="/app/log">
            Log a workout
          </Button>
          <Chip size="sm" href="/app/discover">
            Find a session
          </Chip>
        </div>
      </section>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-ink-400 lg:hidden">
        Prototype data · Lagos MVP · {areaLabel(profile.area)} · v0.1
      </p>
    </div>
  );
}
