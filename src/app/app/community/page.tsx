"use client";

import { useState } from "react";
import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/cn";
import { COMMUNITIES, POSTS } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import { usePrototype } from "@/lib/prototype-state";
import { areaLabel, activityOf } from "@/lib/format";
import { Glyph } from "@/components/ui/glyph";

type Scope = "feed" | "mine";

export default function CommunityFeed() {
  const { isCommunityJoined, isCommunityJoined: joinedFn } = usePrototype();
  const [scope, setScope] = useState<Scope>("feed");
  const [activeId, setActiveId] = useState<string | null>(null);

  const mine = COMMUNITIES.filter((c) => isCommunityJoined(c.id));
  const rail = mine.length ? mine : COMMUNITIES.slice(0, 4);

  const scoped =
    scope === "mine"
      ? mine
      : activeId
        ? COMMUNITIES.filter((c) => c.id === activeId)
        : COMMUNITIES;

  const scopedIds = scoped.map((c) => c.id);
  const posts = POSTS.filter(
    (p) => !p.communityId || scopedIds.includes(p.communityId),
  );

  return (
    <div>
      <ScreenHeader
        title="Community"
        subtitle="Fitness-first posts from people near you — not a generic social feed."
        right={
          <Link href="/app/discover" aria-label="Find communities">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-800 text-ink-400 ring-1 ring-ink-700">
              <Glyph name="search" size={20} />
            </span>
          </Link>
        }
      />

      {/* Scope switch */}
      <div className="mb-5 flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
        {(
          [
            { id: "feed", label: "All feed" },
            { id: "mine", label: "My communities" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScope(s.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              scope === s.id
                ? "bg-volt-400 text-onvolt"
                : "text-ink-300 hover:text-ink-100",
            )}
          >
            {s.label}
            {s.id === "mine" && mine.length > 0 && (
              <span className="num ml-1.5 opacity-70">{mine.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Community rail */}
      <div className="-mx-4 mb-6 overflow-x-auto no-scrollbar px-4">
        <div className="flex w-max gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveId(null);
              setScope("feed");
            }}
            className={cn(
              "flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 transition",
              !activeId && scope === "feed"
                ? "bg-volt-400/[0.16]"
                : "hover:bg-ink-750",
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink-300 ring-1 ring-ink-700">
              <Glyph name="all" size={20} />
            </span>
            <span
              className={cn(
                "text-[11px] font-bold",
                !activeId && scope === "feed" ? "text-volt-800" : "text-ink-400",
              )}
            >
              All
            </span>
          </button>

          {rail.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveId(c.id);
                setScope("feed");
              }}
              className={cn(
                "flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 transition",
                activeId === c.id
                  ? "bg-volt-400/[0.16]"
                  : "hover:bg-ink-750",
              )}
            >
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink-300 ring-1 ring-ink-700">
                <Glyph name={c.activity} size={20} />
                {isCommunityJoined(c.id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-volt-400" />
                )}
              </span>
              <span
                className={cn(
                  "w-full truncate text-center text-[11px] font-bold",
                  activeId === c.id ? "text-volt-800" : "text-ink-400",
                )}
              >
                {c.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pinned community card */}
      {activeId && (
        <div className="mb-6">
          <PinnedCommunity id={activeId} />
        </div>
      )}

      <SectionHeader
        label={scope === "mine" ? "From your communities" : "Latest activity"}
        hint={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
      />

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          Every post here is tied to a workout, a record or a community event.
          The PRD is explicit that this must stay fitness-focused rather than
          becoming a generic social platform.
        </p>
      </div>

      {/* Keeps the joined predicate in view even when scope is the global feed. */}
      <span className="sr-only">
        {mine.length} of {COMMUNITIES.length} communities joined ·{" "}
        {joinedFn(activeId ?? COMMUNITIES[0]!.id) ? "active community" : "browsing"}
      </span>
    </div>
  );
}

function PinnedCommunity({ id }: { id: string }) {
  const { isCommunityJoined } = usePrototype();
  const c = COMMUNITIES.find((x) => x.id === id);
  if (!c) return null;
  const joined = isCommunityJoined(c.id);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3.5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-750 text-ink-300">
          <Glyph name={c.activity} size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/app/community/${c.id}`}
              className="font-display text-[15px] font-bold leading-tight text-ink-50 hover:text-volt-700"
            >
              {c.name}
            </Link>
            {joined && <Badge tone="ok">Joined</Badge>}
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-400">
            {c.tagline}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Chip size="sm">{areaLabel(c.area)}</Chip>
            <Chip size="sm">{activityOf(c.activity).label}</Chip>
            <Chip size="sm">{c.cadence}</Chip>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <AvatarStack
              people={c.featuredMemberIds.map((mid) => {
                const u = userById(mid);
                return { initials: u.initials, tone: u.tone };
              })}
            />
            <span className="num text-[11px] text-ink-400">
              {c.members.toLocaleString("en-NG")} members
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
