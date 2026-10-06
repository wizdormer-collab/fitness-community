"use client";

import Link from "next/link";
import { Card, Badge, SectionHeader, Divider, Pill } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { Avatar } from "@/components/ui/avatar";
import { Button, Toggle } from "@/components/ui/controls";
import { StatTile, StreakFlame } from "@/components/ui/metrics";
import { BottomSheet } from "@/components/ui/sheet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, ME, SESSIONS } from "@/lib/mock-data";
import {
  ACTIVITIES,
  FITNESS_GOALS,
  FITNESS_LEVELS,
  TIME_SLOTS,
  WEEKDAYS,
} from "@/lib/types";
import { areaLabel, grouped } from "@/lib/format";

const labelOf = (
  list: readonly { id: string; label: string }[],
  ids: string[],
) => ids.map((id) => list.find((x) => x.id === id)?.label).filter(Boolean);

export default function Profile() {
  const router = useRouter();
  const { profile, state, reset, isCommunityJoined, isSessionJoined } =
    usePrototype();
  const [editing, setEditing] = useState(false);
  const [notify, setNotify] = useState(true);

  const goals = labelOf(FITNESS_GOALS, profile.goals);
  const activities = labelOf(ACTIVITIES, profile.activities);
  const slots = labelOf(TIME_SLOTS, profile.preferredSlots);
  const level = FITNESS_LEVELS.find((l) => l.id === profile.fitnessLevel);
  const joined = COMMUNITIES.filter((c) => isCommunityJoined(c.id));
  const joinedSessions = SESSIONS.filter((s) => isSessionJoined(s.id));

  return (
    <div>
      <ScreenHeader
        title="Profile"
        subtitle="Your fitness profile — what the app matches you on."
        backHref="/app"
        backLabel="Home"
        right={
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-ink-600 px-2.5 py-1.5 text-[11px] font-semibold text-ink-200 transition hover:border-volt-400 hover:text-volt-400"
          >
            Edit
          </button>
        }
      />

      {/* Identity */}
      <Card className="mb-4 flex items-start gap-4 p-5">
        <Avatar initials={ME.initials} tone={ME.tone} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink-50">
              {profile.name || ME.name}
            </h2>
            {ME.verified && <Badge tone="ok">Verified</Badge>}
          </div>
          <p className="num mt-0.5 text-xs text-ink-500">{ME.handle}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
            {areaLabel(profile.area)} · {level?.label} · {ME.age}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StreakFlame days={state.streak} size="sm" />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Workouts" value={grouped(state.totalWorkouts)} emoji="💪" />
        <StatTile label="Streak" value={state.streak} unit="d" emoji="🔥" />
        <StatTile label="PRs" value={state.personalRecords} emoji="🏆" accent />
      </div>

      {/* Bio */}
      {ME.bio && (
        <section className="mb-6">
          <SectionHeader label="About" />
          <Card className="p-4">
            <p className="text-sm leading-relaxed text-ink-300">{ME.bio}</p>
          </Card>
        </section>
      )}

      {/* Matching inputs (PRD §7) */}
      <section className="mb-6">
        <SectionHeader
          label="Matched on"
          hint="Edited during onboarding"
          action={{ label: "Re-do setup", href: "/onboarding/goals" }}
        />
        <Card className="space-y-4 p-4">
          <Field label="Goals">
            {goals.map((g) => (
              <Pill key={g} className="mr-1.5 mb-1.5 inline-flex">
                {g}
              </Pill>
            ))}
          </Field>
          <Divider />
          <Field label="Activities">
            {activities.map((a) => (
              <Pill key={a} className="mr-1.5 mb-1.5 inline-flex">
                {a}
              </Pill>
            ))}
          </Field>
          <Divider />
          <Field label="Training days">
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <span
                  key={d.id}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold ${
                    profile.preferredDays.includes(d.id)
                      ? "bg-volt-400 text-ink-950"
                      : "bg-ink-750 text-ink-500"
                  }`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </Field>
          <Divider />
          <Field label="Preferred time">
            {slots.map((s) => (
              <Pill key={s} className="mr-1.5 mb-1.5 inline-flex">
                {s}
              </Pill>
            ))}
          </Field>
          <Divider />
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-medium text-ink-100">Home gym</p>
              <p className="text-xs text-ink-500">
                {profile.currentGym || "Not set"}
              </p>
            </div>
            <Badge tone="muted">Gym crowd cut from v1</Badge>
          </div>
        </Card>
      </section>

      {/* Communities */}
      <section className="mb-6">
        <SectionHeader
          label={`Communities (${joined.length})`}
          action={{ label: "Manage", href: "/app/community" }}
        />
        <Card className="divide-y divide-ink-700 p-0">
          {joined.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-ink-400">No communities joined yet.</p>
              <Link
                href="/app/discover"
                className="mt-2 inline-block text-sm font-semibold text-volt-400"
              >
                Find your people →
              </Link>
            </div>
          ) : (
            joined.map((c) => (
              <Link
                key={c.id}
                href={`/app/community/${c.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-750 text-xl">
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-100">
                    {c.name}
                  </p>
                  <p className="num truncate text-[11px] text-ink-500">
                    {c.members} members · {areaLabel(c.area)}
                  </p>
                </div>
                <Badge tone="volt">Member</Badge>
              </Link>
            ))
          )}
        </Card>
      </section>

      {/* Upcoming commitments */}
      <section className="mb-6">
        <SectionHeader
          label={`Upcoming (${joinedSessions.length})`}
          action={{ label: "All sessions", href: "/app/sessions" }}
        />
        <Card className="divide-y divide-ink-700 p-0">
          {joinedSessions.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-ink-400">Nothing committed yet.</p>
            </div>
          ) : (
            joinedSessions.map((s) => (
              <Link
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-100">
                    {s.title}
                  </p>
                  <p className="num truncate text-[11px] text-ink-500">
                    {s.dayLabel} {s.date} · {s.time} · {s.location}
                  </p>
                </div>
                {state.checkedIn.includes(s.id) && <Badge tone="ok">Checked in</Badge>}
              </Link>
            ))
          )}
        </Card>
      </section>

      {/* Settings */}
      <section className="mb-6">
        <SectionHeader label="Settings" />
        <Card className="divide-y divide-ink-700 px-4">
          <Toggle
            checked={notify}
            onChange={setNotify}
            label="Session reminders"
            hint="Push 1 hour before a session you joined"
          />
          <SettingRow label="Notification history" href="/app/notifications" />
          <SettingRow label="Account & privacy" href="/app/profile" />
          <SettingRow label="Data export" href="/app/progress" />
        </Card>
      </section>

      <div className="flex flex-col gap-3">
        <Button full variant="secondary" onClick={() => setEditing(true)}>
          Edit profile
        </Button>
        <Button full variant="ghost" href="/onboarding/welcome">
          Back to onboarding
        </Button>
        <Button
          full
          variant="danger"
          onClick={() => {
            if (window.confirm("Reset all prototype state on this device?")) {
              reset();
              router.push("/onboarding/welcome");
            }
          }}
        >
          Reset prototype data
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-ink-700 bg-ink-850/60 p-4">
        <p className="text-[13px] leading-relaxed text-ink-400">
          <span className="font-semibold text-ink-200">Rich profiles</span>{" "}
          (photos, badges, public history) are PRD §21 and scheduled for Phase 2.
          v1 shows only what matching needs.
        </p>
      </div>

      {/* Edit sheet */}
      <BottomSheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Display name
            </span>
            <input
              defaultValue={profile.name}
              className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-3 text-sm text-ink-100 outline-none focus:border-volt-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Home gym
            </span>
            <input
              defaultValue={profile.currentGym}
              placeholder="e.g. i-Fitness Lekki"
              className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-3 text-sm text-ink-100 outline-none focus:border-volt-400"
            />
          </label>
          <p className="text-xs leading-relaxed text-ink-500">
            Saving is disabled in the prototype — matching inputs are edited
            from onboarding so the loop stays visible.
          </p>
          <div className="flex gap-2.5 pb-2">
            <Button full variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button full onClick={() => setEditing(false)}>
              Done
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

function SettingRow({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between py-3.5">
      <span className="text-sm font-medium text-ink-100">{label}</span>
      <span className="text-ink-600">›</span>
    </Link>
  );
}
