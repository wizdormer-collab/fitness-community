"use client";

import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Band, Card, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { Ring, SpotMeter, StreakFlame } from "@/components/ui/metrics";
import { Glyph } from "@/components/ui/glyph";
import { Photo } from "@/components/ui/photo";
import { SessionCard } from "@/components/ui/session-card";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, NOTIFICATIONS, PROGRESS, SESSIONS, ME } from "@/lib/mock-data";
import { userById, visibleSpots } from "@/lib/selectors";
import { activityLabel, areaLabel, greeting, attending } from "@/lib/format";

/**
 * Home is composed as an editorial dashboard rather than a stack of equal
 * cards: a navy hero that carries the greeting, the promise and the week's
 * real numbers; today's session as the one horizontal feature card; the
 * community as a photo-led section; nearby sessions as a browse grid (the
 * §3 exception, same treatment as Discover and Sessions); and the personal
 * record as an unboxed Band so it supports instead of competes.
 *
 * Every number on this page is derived from the store or mock data at render
 * time — nothing here is typed in. Spot counts go through `visibleSpots` so
 * Home, Sessions and the session detail page never disagree about capacity,
 * and the check-in action is enabled only when the session detail page would
 * enable it (you have to be in the session first).
 */
export default function Home() {
  const { profile, state, isSessionJoined, isCommunityJoined, isNotificationRead } =
    usePrototype();

  const unread = NOTIFICATIONS.filter((n) => !n.read && !isNotificationRead(n.id)).length;
  const name = profile.name || ME.name;

  const todaySession =
    SESSIONS.find((s) => s.dayLabel === "Today" && s.status === "upcoming") ??
    SESSIONS[0]!;
  const community =
    COMMUNITIES.find((c) => isCommunityJoined(c.id) && c.todayTraining > 0) ??
    COMMUNITIES[0]!;
  const topRecord = PROGRESS.records[0]!;

  const joinedToday = isSessionJoined(todaySession.id);
  const takenToday = visibleSpots(todaySession, joinedToday);

  const goalMet = state.weeklyCompleted >= PROGRESS.weeklyTarget;
  const remaining = PROGRESS.weeklyTarget - state.weeklyCompleted;

  // Upcoming sessions other than the one featured above — real rows from the
  // same source the Sessions screen reads, capped at what fits the grid.
  const nearby = SESSIONS.filter(
    (s) => s.status === "upcoming" && s.id !== todaySession.id,
  ).slice(0, 4);

  const avatars = (ids: string[], size: "xs" | "sm" = "xs") => (
    <AvatarStack
      size={size}
      people={ids.slice(0, 4).map((id) => {
        const u = userById(id);
        return { initials: u.initials, tone: u.tone };
      })}
      max={4}
    />
  );

  return (
    /* Mobile: one column, hero first. lg: each block is placed explicitly so
       the same DOM builds a two-column dashboard — a wide left rail of live
       content and a narrow right rail of context. */
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
      {/* ---- A. Hero: greeting, promise, weekly goal, streak ---- */}
      <section className="overflow-hidden rounded-2xl border border-ink-700 bg-navy-50 lg:col-span-12 lg:row-start-1 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:col-start-1 lg:row-start-1 lg:justify-between lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-onnavy-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-volt-400" />
              {areaLabel(profile.area)} · Lagos
            </p>

            {/* Below lg the top bar does not exist, so the bell lives here.
                At lg it is already in AppTopBar — one bell per breakpoint. */}
            <Link
              href="/app/notifications"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-navy-line bg-navy-100 text-onnavy-dim transition hover:text-onnavy lg:hidden"
            >
              <Glyph name="bell" size={18} />
              {unread > 0 && (
                <span className="num absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt-400 px-1 text-[11px] font-bold text-onvolt">
                  {unread}
                </span>
              )}
            </Link>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-onnavy-dim">{greeting()},</p>
            <h1 className="mt-0.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-onnavy sm:text-[42px]">
              {name}
            </h1>
            <p className="mt-3 font-display text-xl font-extrabold leading-snug tracking-tight text-volt-400 sm:text-2xl">
              Make showing up a habit.
            </p>
            <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-onnavy-dim">
              Train with people near you, and let showing up become the easy part.
            </p>
          </div>

          {/* The week's real numbers sit on a cream inset: Ring's track, value
              and label are all specified for light surfaces, so they stay
              legible here instead of being restated in navy-only colours. */}
          <div className="rounded-2xl border border-ink-700 bg-ink-950 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <Ring value={state.weeklyCompleted} max={PROGRESS.weeklyTarget} size={76} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  Weekly goal
                </p>
                <p className="num mt-1 font-display text-[15px] font-bold text-ink-50">
                  {state.weeklyCompleted} of {PROGRESS.weeklyTarget} workouts
                </p>
                <p className="mt-1 text-[13px] leading-snug text-ink-400">
                  {goalMet
                    ? "Weekly goal met. Everything else this week is a bonus."
                    : `${remaining} more ${remaining === 1 ? "session" : "sessions"} closes the week.`}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-3">
              <StreakFlame days={state.streak} size="sm" />
              <Link
                href="/app/progress"
                className="text-[13px] font-semibold text-volt-700 transition hover:text-volt-800"
              >
                View progress
              </Link>
            </div>
          </div>
        </div>

        <Photo
          name="hero-run"
          alt="Runners training together at first light"
          ratio="aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto"
          className="lg:col-start-2 lg:row-start-1"
          sizes="(max-width: 1024px) 600px, 500px"
          priority
        />
      </section>

      {/* ---- B. Today's session: photo · information · action ---- */}
      <section className="flex flex-col lg:col-span-8 lg:col-start-1 lg:row-start-2">
        <SectionHeader
          label="Today's session"
          action={{ label: "All sessions", href: "/app/sessions" }}
        />
        <Card className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <Photo
            name="session"
            alt="A barbell being lifted from the gym floor"
            ratio="aspect-[16/9] lg:aspect-auto"
            className="w-full shrink-0 lg:w-[240px] lg:self-stretch"
            sizes="(max-width: 1024px) 600px, 240px"
          />

          {/* justify-between has nothing to distribute at natural height (the
              phone stack), but the desktop row stretches to the taller
              community card, and without it the feature card would end in a
              dead white quarter. */}
          <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                <Glyph name={todaySession.activity} size={13} strokeWidth={2} />
                {activityLabel(todaySession.activity)}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {joinedToday && <Badge tone="ok">Joined</Badge>}
                <Badge tone="muted">{todaySession.dayLabel}</Badge>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight text-ink-50">
                {todaySession.title}
              </h3>
              <p className="num mt-1.5 text-[13px] text-ink-300">
                {todaySession.time} · {todaySession.location}
              </p>
              <p className="num mt-0.5 text-[13px] text-ink-400">
                {areaLabel(todaySession.area)} · Lagos
              </p>
            </div>

            <div className="mt-4">
              <SpotMeter taken={takenToday} max={todaySession.maxSpots} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-700 pt-4">
              {avatars(todaySession.attendeeIds)}
              <span className="num text-[11px] text-ink-500">
                {attending(takenToday)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col justify-center gap-2.5 border-t border-ink-700 p-4 lg:w-[176px] lg:border-l lg:border-t-0">
            <Button full href={`/app/sessions/${todaySession.id}`}>
              {joinedToday ? "View session" : "Join session"}
            </Button>

            {/* Same rule the session detail page applies: you cannot check in
                to something you have not joined, so the control is present but
                disabled rather than leading somewhere that cannot complete. */}
            {joinedToday ? (
              <Button full variant="secondary" href={`/app/checkin?s=${todaySession.id}`}>
                Check in
              </Button>
            ) : (
              <Button full variant="secondary" disabled>
                Check in
              </Button>
            )}

            <p className="num pt-1 text-center text-[11px] leading-snug text-ink-500">
              {joinedToday ? "Check in at the venue." : "Join the session to check in."}
            </p>
          </div>
        </Card>
      </section>

      {/* ---- C. Your community: identity, activity, membership ---- */}
      <section className="flex flex-col lg:col-span-4 lg:col-start-9 lg:row-start-2">
        <SectionHeader
          label="Your community"
          action={{ label: "Feed", href: "/app/community" }}
        />
        <Card className="flex flex-1 flex-col overflow-hidden">
          <Photo
            name="group"
            alt="Members of a training group resting together after a session"
            ratio="aspect-[16/9]"
            className="w-full"
            sizes="(max-width: 1024px) 350px, 350px"
          />

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  <Glyph name={community.activity} size={13} strokeWidth={2} />
                  {activityLabel(community.activity)}
                </p>
                <h3 className="mt-1 font-display text-base font-bold leading-tight text-ink-50">
                  {community.name}
                </h3>
              </div>
              {community.badge && (
                <Badge tone="volt" className="shrink-0">
                  {community.badge}
                </Badge>
              )}
            </div>

            <p className="num mt-2 text-[13px] text-ink-300">
              {community.members.toLocaleString("en-NG")} members ·{" "}
              {areaLabel(community.area)}
            </p>

            <p className="num mt-2 flex items-center gap-2 text-[13px] text-ink-300">
              <span className="inline-flex h-2 w-2 rounded-full bg-ok-500" />
              {community.todayTraining} people training today
            </p>

            <div className="mt-4 border-t border-ink-700 pt-4">
              {avatars(community.featuredMemberIds, "sm")}
            </div>

            <div className="mt-auto pt-4">
              <Chip size="sm" href={`/app/community/${community.id}`}>
                Open community
              </Chip>
            </div>
          </div>
        </Card>
      </section>

      {/* ---- D. Nearby: browse grid of visual cards ---- */}
      <section className="flex flex-col lg:col-span-8 lg:col-start-1 lg:row-start-3">
        <SectionHeader
          label="Nearby"
          hint="Sessions around your area"
          action={{ label: "Discover", href: "/app/discover" }}
        />
        {/* md, not sm: below md the frame is still a phone-width column, where
            two columns would squeeze the cards the brief warns against. */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {nearby.map((s) => {
            const joined = isSessionJoined(s.id);
            const taken = visibleSpots(s, joined);
            return (
              <SessionCard
                key={s.id}
                session={s}
                variant="compact"
                taken={taken}
                joined={joined}
                people={s.attendeeIds.map((id) => {
                  const u = userById(id);
                  return { initials: u.initials, tone: u.tone };
                })}
                sizes="(max-width: 1024px) 300px, 340px"
              />
            );
          })}
        </div>
      </section>

      {/* ---- E. Personal record: an unboxed supporting band ----
          Deliberately not a third Card — §3 caps a screen at two framed
          sections, and the quick actions (log / find) already live in the
          callout below, so repeating them here would duplicate working
          controls rather than add any. */}
      <Band
        label="Personal record"
        action={{ label: "View progress", href: "/app/progress" }}
        className="lg:col-span-4 lg:col-start-9 lg:row-start-3"
      >
        <p className="text-[13px] text-ink-400">{topRecord.exercise}</p>
        <p className="num mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink-50">
          {topRecord.from}
          <span className="mx-2 text-ink-500">→</span>
          {topRecord.to}
          <span className="ml-1.5 text-sm font-semibold text-ink-400">
            {topRecord.unit}
          </span>
        </p>
      </Band>

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
