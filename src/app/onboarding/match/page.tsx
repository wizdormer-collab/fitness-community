"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Button, Chip } from "@/components/ui/controls";
import { Badge, List, ListRow } from "@/components/ui/card";
import { Glyph, GlyphTile } from "@/components/ui/glyph";
import { StreakFlame } from "@/components/ui/metrics";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, USERS, ME } from "@/lib/mock-data";
import { userById } from "@/lib/selectors";
import { activityOf, areaLabel } from "@/lib/format";
import type { Community } from "@/lib/types";

/** Score a community against the onboarding answers (PRD §10 factors). */
function score(c: Community, profile: ReturnType<typeof usePrototype>["profile"]) {
  let s = 0;
  if (c.area === profile.area) s += 3;
  if (profile.activities.includes(c.activity)) s += 3;
  if (profile.goals.includes(c.goal)) s += 2;
  if (c.level === profile.fitnessLevel) s += 1;
  return s;
}

export default function Match() {
  const router = useRouter();
  const { profile, setDraft, completeOnboarding, isCommunityJoined, toggleCommunity } =
    usePrototype();

  // Joining here persists via the same store the dashboard reads from,
  // so the community is already on Home when the app opens.
  const [joined, setJoined] = useState<string[]>(
    COMMUNITIES.filter((c) => isCommunityJoined(c.id)).map((c) => c.id),
  );

  const ranked = useMemo(() => {
    return [...COMMUNITIES]
      .map((c) => ({ c, s: score(c, profile) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.c);
  }, [profile]);

  const partners = useMemo(
    () =>
      USERS.filter((u) => u.id !== ME.id)
        .map((u) => {
          let s = 0;
          if (u.area === profile.area) s += 3;
          const shared = u.activities.filter((a) =>
            profile.activities.includes(a),
          ).length;
          s += shared;
          if (u.fitnessLevel === profile.fitnessLevel) s += 1;
          return { u, s, shared };
        })
        .sort((a, b) => b.s - a.s)
        .slice(0, 3),
    [profile],
  );

  const toggle = (id: string) => {
    toggleCommunity(id);
    setJoined((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const finish = () => {
    setDraft({
      area: profile.area,
      goals: profile.goals,
      activities: profile.activities,
      fitnessLevel: profile.fitnessLevel,
      preferredDays: profile.preferredDays,
      preferredSlots: profile.preferredSlots,
    });
    completeOnboarding();
    router.push("/app");
  };

  return (
    <OnboardingShell
      step={6}
      back="/onboarding/level"
      title="We found your people"
      subtitle="Based on your area, activity, goal and level. Join one to start — you can leave anything later."
      ctaLabel={joined.length ? `Enter the app` : "Skip for now"}
      onNext={finish}
      note="You can discover and join more communities any time from Discover."
    >
      <FieldLabel count={`${ranked.length} matches`}>
        Recommended communities
      </FieldLabel>

      <List variant="surface">
        {ranked.map((c) => {
          const active = joined.includes(c.id);
          return (
            <ListRow
              key={c.id}
              layout="block"
              className={cn(
                "animate-fade-up py-4",
                active && "bg-volt-400/[0.12]",
              )}
            >
              <span className="flex items-start gap-3.5">
                <GlyphTile name={c.activity} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display text-[15px] font-bold leading-tight text-ink-50">
                      {c.name}
                    </span>
                    {c.badge && <Badge tone="volt">{c.badge}</Badge>}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-ink-400">
                    {c.tagline}
                  </span>
                  <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <Chip size="sm">{areaLabel(c.area)}</Chip>
                    <Chip size="sm">
                      <Glyph name={c.activity} size={13} strokeWidth={2} />
                      {activityOf(c.activity).label}
                    </Chip>
                    <Chip size="sm">{c.cadence}</Chip>
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <AvatarStack
                        people={c.featuredMemberIds.slice(0, 3).map((id) => {
                          const u = userById(id);
                          return { initials: u.initials, tone: u.tone };
                        })}
                        size="xs"
                        max={3}
                      />
                      <span className="num text-[11px] text-ink-400">
                        {c.members.toLocaleString("en-NG")} members
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-bold transition active:scale-95",
                        active
                          ? "border border-ink-600 bg-ink-750 text-ink-200"
                          : "bg-volt-400 text-onvolt hover:bg-volt-500",
                      )}
                    >
                      {active ? "Joined" : "Join"}
                    </button>
                  </span>
                </span>
              </span>
            </ListRow>
          );
        })}
      </List>

      <div className="mt-8">
        <FieldLabel>Compatible training partners</FieldLabel>
        <List variant="surface">
          {partners.map(({ u, shared }) => (
            <ListRow key={u.id}>
              <span className="flex items-center gap-3">
                <Avatar initials={u.initials} tone={u.tone} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-50">
                    {u.name}
                  </span>
                  <span className="num block truncate text-[11px] text-ink-400">
                    {areaLabel(u.area)} · {u.fitnessLevel} ·{" "}
                    {shared > 0
                      ? `${shared} shared ${shared === 1 ? "activity" : "activities"}`
                      : "compatible schedule"}
                  </span>
                </span>
                <Chip size="sm" onClick={() => undefined}>
                  View
                </Chip>
              </span>
            </ListRow>
          ))}
        </List>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-l-2 border-volt-600 pl-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-100">Your first week</p>
          <p className="mt-0.5 text-xs leading-snug text-ink-500">
            {profile.preferredDays.length} training{" "}
            {profile.preferredDays.length === 1 ? "day" : "days"} ·{" "}
            {profile.goals.length}{" "}
            {profile.goals.length === 1 ? "goal" : "goals"} ·{" "}
            {profile.activities.length}{" "}
            {profile.activities.length === 1 ? "activity" : "activities"}
          </p>
        </div>
        <StreakFlame days={0} size="sm" />
      </div>

      <Button variant="ghost" full onClick={finish} className="mt-4">
        Add a training partner later
      </Button>
    </OnboardingShell>
  );
}
