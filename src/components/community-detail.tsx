"use client";

import Link from "next/link";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, List, ListRow, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/state";
import { PostCard } from "@/components/post-card";
import { Glyph } from "@/components/ui/glyph";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, POSTS, SESSIONS } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import {
  activityOf,
  areaLabel,
  grouped,
  plural,
} from "@/lib/format";
import { WEEKDAYS } from "@/lib/types";

export function CommunityDetail({ id }: { id: string }) {
  const { isCommunityJoined, toggleCommunity } = usePrototype();
  const c = COMMUNITIES.find((x) => x.id === id);
  if (!c) return null;

  const joined = isCommunityJoined(c.id);
  const posts = POSTS.filter((p) => p.communityId === c.id);
  const nextSession = SESSIONS.find((s) => s.id === c.nextSessionId);
  const activity = activityOf(c.activity);

  return (
    <div>
      <ScreenHeader
        title=""
        backHref="/app/community"
        backLabel="Community"
      />

      {/* Hero */}
      <div className="mb-5 animate-fade-up">
        <div className="relative overflow-hidden rounded-2xl">
          <Photo
            name="community"
            alt="A group stretching together after training"
            ratio="aspect-[16/9]"
            sizes="(max-width: 440px) 100vw, 440px"
            priority
            scrim
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-extrabold leading-tight tracking-tight text-white">
                {c.name}
              </h1>
              {c.badge && (
                <span className="rounded-full bg-volt-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-onvolt">
                  {c.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-snug text-white/75">
              {c.tagline}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip size="sm">
            <Glyph name="pin" size={13} strokeWidth={2} />
            {areaLabel(c.area)}
          </Chip>
          <Chip size="sm">
            <Glyph name={c.activity} size={13} strokeWidth={2} />
            {activity.label}
          </Chip>
          <Chip size="sm">
            <Glyph name="target" size={13} strokeWidth={2} />
            {c.level}
          </Chip>
          <Chip size="sm">
            <Glyph name="clock" size={13} strokeWidth={2} />
            {c.cadence}
          </Chip>
        </div>

        <div className="mt-4 flex gap-2.5">
          <Button
            full
            variant={joined ? "secondary" : "primary"}
            onClick={() => toggleCommunity(c.id)}
          >
            {joined ? "Joined · Leave" : "Join community"}
          </Button>
          <Button variant="secondary" href="/app/sessions">
            Sessions
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-3 divide-x divide-ink-700 border-y border-ink-700">
        {[
          { label: "Members", value: grouped(c.members) },
          { label: "Training today", value: String(c.todayTraining) },
          { label: "Cadence", value: c.cadence.replace(" per week", "/wk") },
        ].map((s) => (
          <div key={s.label} className="px-2 py-3.5 text-center">
            <p className="num font-display text-lg font-bold text-volt-700">
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* About */}
      <section className="mb-7 border-b border-ink-700 pb-6">
        <SectionHeader label="About" />
        <p className="text-[14px] leading-relaxed text-ink-300">
          {c.description}
        </p>
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
            Led by
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {c.adminNames.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink-750 px-2.5 py-1 text-xs font-semibold text-ink-200"
              >
                <Glyph name="star" size={13} strokeWidth={2} />
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly schedule */}
      <section className="mb-7">
        <SectionHeader label="Weekly schedule" hint={c.cadence} />
        <List variant="surface">
          {c.schedule.map((s) => (
            <ListRow key={`${s.day}-${s.time}`}>
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-11 items-center justify-center rounded-lg bg-ink-750 text-[11px] font-bold text-ink-400">
                    {WEEKDAYS.find((w) => w.id === s.day)?.label}
                  </span>
                  <span className="text-sm font-medium text-ink-100">
                    {s.activity}
                  </span>
                </span>
                <span className="num text-sm font-semibold text-volt-700">
                  {s.time}
                </span>
              </span>
            </ListRow>
          ))}
        </List>
      </section>

      {/* Next session */}
      {nextSession && (
        <section className="mb-6">
          <SectionHeader
            label="Next session"
            action={{ label: "All", href: "/app/sessions" }}
          />
          <Link href={`/app/sessions/${nextSession.id}`}>
            <Card className="p-4 transition active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-ink-50">
                    {nextSession.title}
                  </h3>
                  <p className="num mt-1 text-[13px] text-ink-300">
                    {nextSession.dayLabel} · {nextSession.time} ·{" "}
                    {nextSession.location}
                  </p>
                </div>
                <Badge tone={nextSession.cost === 0 ? "ok" : "info"}>
                  {nextSession.cost === 0
                    ? "Free"
                    : `₦${nextSession.cost.toLocaleString()}`}
                </Badge>
              </div>
              <div className="mt-3">
                <SpotMeter
                  taken={nextSession.spotsTaken}
                  max={nextSession.maxSpots}
                />
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Members */}
      <section className="mb-7 border-b border-ink-700 pb-6">
        <SectionHeader
          label="Members"
          hint={`${grouped(c.members)} ${plural(c.members, "person", "people")}`}
        />
        <AvatarStack
          people={c.featuredMemberIds.map((mid) => {
            const u = userById(mid);
            return { initials: u.initials, tone: u.tone };
          })}
          size="md"
          max={5}
        />
        <div className="mt-3.5">
          {c.featuredMemberIds.slice(0, 3).map((mid) => {
            const u = userById(mid);
            return (
              <div
                key={mid}
                className="flex items-center gap-3 border-b border-ink-700 py-2.5 last:border-0"
              >
                <Avatar initials={u.initials} tone={u.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-100">
                    {u.name}
                  </p>
                  <p className="truncate text-[11px] text-ink-500">
                    {areaLabel(u.area)} · {u.fitnessLevel}
                  </p>
                </div>
                <Chip size="sm">View</Chip>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feed */}
      <section className="mb-6">
        <SectionHeader
          label="Community feed"
          hint={`${posts.length} recent`}
        />
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="chat"
            title="No posts yet"
            body="Be the first to share a session or a win."
          />
        )}
      </section>

      {/* Safety (PRD §24) */}
      <section className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
          Safety &amp; trust
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Organisers are verified. You can report content, block a member or
          leave quietly at any time. Home address, exact location and phone
          number are never shown publicly.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip size="sm" onClick={() => undefined}>
            <Glyph name="flag" size={13} strokeWidth={2} />
            Report content
          </Chip>
          <Chip size="sm" onClick={() => undefined}>
            <Glyph name="mute" size={13} strokeWidth={2} />
            Block member
          </Chip>
          <Chip size="sm" onClick={() => undefined}>
            <Glyph name="lock" size={13} strokeWidth={2} />
            Privacy controls
          </Chip>
        </div>
      </section>
    </div>
  );
}
