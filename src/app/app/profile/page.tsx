"use client";

import Link from "next/link";
import { Badge, Band, List, ListRow, Pill, SectionHeader } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { Avatar } from "@/components/ui/avatar";
import { Button, Toggle } from "@/components/ui/controls";
import { StatTile, StreakFlame } from "@/components/ui/metrics";
import { BottomSheet } from "@/components/ui/sheet";
import { Glyph } from "@/components/ui/glyph";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { usePrototype, STORAGE_KEY } from "@/lib/prototype-state";
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

/** Bounds mirror what onboarding already accepts — nothing narrower. */
const NAME_MIN = 2;
const NAME_MAX = 40;
const GYM_MAX = 60;

type Status = { kind: "ok" | "warn" | "error"; msg: string } | null;

const STATUS_TONE = {
  ok: "bg-volt-400/10 text-volt-800 ring-1 ring-inset ring-volt-600/25",
  warn: "bg-warn-500/10 text-warn-600 ring-1 ring-inset ring-warn-500/30",
  error: "bg-bad-500/10 text-bad-600 ring-1 ring-inset ring-bad-500/30",
} as const;

export default function Profile() {
  const router = useRouter();
  const {
    profile,
    state,
    reset,
    setDraft,
    setSessionReminders,
    isCommunityJoined,
    isSessionJoined,
  } = usePrototype();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [gym, setGym] = useState(profile.currentGym);
  const [status, setStatus] = useState<Status>(null);

  const goals = labelOf(FITNESS_GOALS, profile.goals);
  const activities = labelOf(ACTIVITIES, profile.activities);
  const slots = labelOf(TIME_SLOTS, profile.preferredSlots);
  const level = FITNESS_LEVELS.find((l) => l.id === profile.fitnessLevel);
  const joined = COMMUNITIES.filter((c) => isCommunityJoined(c.id));
  const joinedSessions = SESSIONS.filter((s) => isSessionJoined(s.id));

  function openEditor() {
    // Seed from the store every time so a cancelled edit never leaves
    // stale text in the fields.
    setName(profile.name);
    setGym(profile.currentGym);
    setStatus(null);
    setEditing(true);
  }

  /**
   * Save through the same `setDraft` path onboarding uses, then read the
   * write back out of storage. Success is reported from the *observed*
   * result — never assumed.
   */
  function save() {
    const n = name.trim();
    const g = gym.trim();

    if (n.length < NAME_MIN) {
      setStatus({ kind: "error", msg: `Enter a display name of at least ${NAME_MIN} characters.` });
      return;
    }
    if (n.length > NAME_MAX) {
      setStatus({ kind: "error", msg: `Display names are limited to ${NAME_MAX} characters.` });
      return;
    }
    if (g.length > GYM_MAX) {
      setStatus({ kind: "error", msg: `Home gym is limited to ${GYM_MAX} characters.` });
      return;
    }

    try {
      setDraft({ name: n, currentGym: g });
    } catch {
      setStatus({
        kind: "error",
        msg: "Couldn't save your changes — nothing was applied. Please try again.",
      });
      return;
    }

    // The store always applies in memory; what can fail is the write. Check it.
    let persisted = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      persisted =
        !!raw && (JSON.parse(raw) as { draft?: { name?: string } }).draft?.name === n;
    } catch {
      persisted = false;
    }

    setStatus(
      persisted
        ? { kind: "ok", msg: "Profile saved." }
        : {
            kind: "warn",
            msg: "Saved for this session — this device is blocking local storage, so it won't survive a reload.",
          },
    );
  }

  const applied = status?.kind === "ok" || status?.kind === "warn";

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
            onClick={openEditor}
            className="rounded-lg border border-ink-600 px-2.5 py-1.5 text-[11px] font-semibold text-ink-200 transition hover:border-volt-400 hover:text-volt-700"
          >
            Edit
          </button>
        }
      />

      {/* Desktop: profile on the left, activity and settings on the right,
          so settings aren't pushed below a full-width stack. Below lg the
          wrappers are plain blocks and the mobile reading order is unchanged. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10">
        <div>
          {/* Identity — the one navy surface on Profile, echoing the Home
              hero: this block is about *who*, not *what*. `StreakFlame` and
              `StatTile` keep their light-surface colours (warn-600 on navy
              measures 4.4:1, under AA at 11px), so they sit on the canvas
              directly below rather than needing a second palette. */}
          <section className="mb-4 overflow-hidden rounded-2xl border border-ink-700 bg-navy-50 p-5">
            <div className="flex items-start gap-4">
              <Avatar initials={ME.initials} tone={ME.tone} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-onnavy">
                    {profile.name || ME.name}
                  </h2>
                </div>
                <p className="num mt-0.5 text-xs text-onnavy-mute">{ME.handle}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-onnavy-dim">
                  {areaLabel(profile.area)} · {level?.label} · {ME.age}
                </p>
              </div>
            </div>
          </section>

          {/* Badges stay off the navy: `Badge`'s ok tone is dark green on a
              10% tint, which measures 4.1:1 on navy — under AA at 11px. Same
              semantics, same component, just the light surface it is built for. */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StreakFlame days={state.streak} size="sm" />
            {ME.verified && <Badge tone="ok">Verified</Badge>}
          </div>

          {/* 3-up strip. Same treatment Progress already uses (gap, not a
              divided table — StatTile is built for the gap form), and the
              hairline below matches what the `Band`s further down the column
              do, so the rhythm is identical left of the divider. */}
          <div className="mb-6 grid grid-cols-3 gap-4 border-b border-ink-700 pb-6">
            <StatTile label="Workouts" value={grouped(state.totalWorkouts)} icon="gym" />
            <StatTile label="Streak" value={state.streak} unit="d" icon="flame" />
            <StatTile label="PRs" value={state.personalRecords} icon="trophy" accent />
          </div>

          {/* Bio */}
          {ME.bio && (
            <Band divided className="mb-6">
              <SectionHeader label="About" />
              <p className="text-sm leading-relaxed text-ink-300">{ME.bio}</p>
            </Band>
          )}

          {/* Matching inputs (PRD §7) — one list, not a box of dividers */}
          <section className="mb-6">
            <SectionHeader
              label="Matched on"
              hint="Set in onboarding · editable here"
              action={{ label: "Re-do setup", href: "/onboarding/goals" }}
            />
            <List>
              <ListRow className="px-0 py-4">
                <Field label="Goals">
                  {goals.map((g) => (
                    <Pill key={g} className="mr-1.5 mb-1.5 inline-flex">
                      {g}
                    </Pill>
                  ))}
                </Field>
              </ListRow>
              <ListRow className="px-0 py-4">
                <Field label="Activities">
                  {activities.map((a) => (
                    <Pill key={a} className="mr-1.5 mb-1.5 inline-flex">
                      {a}
                    </Pill>
                  ))}
                </Field>
              </ListRow>
              <ListRow className="px-0 py-4">
                <Field label="Training days">
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((d) => (
                      <span
                        key={d.id}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold ${
                          profile.preferredDays.includes(d.id)
                            ? "bg-volt-400 text-onvolt"
                            : "bg-ink-750 text-ink-500"
                        }`}
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                </Field>
              </ListRow>
              <ListRow className="px-0 py-4">
                <Field label="Preferred time">
                  {slots.map((s) => (
                    <Pill key={s} className="mr-1.5 mb-1.5 inline-flex">
                      {s}
                    </Pill>
                  ))}
                </Field>
              </ListRow>
              <ListRow className="px-0 py-4">
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-500">
                      Home gym
                    </span>
                    <span className="mt-1 block text-sm text-ink-300">
                      {profile.currentGym || "Not set"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={openEditor}
                    className="shrink-0 rounded-lg border border-ink-600 px-2.5 py-1.5 text-[11px] font-semibold text-ink-200 transition hover:border-volt-400 hover:text-volt-700"
                  >
                    Edit
                  </button>
                </span>
              </ListRow>
            </List>
          </section>
        </div>

        <div>
          {/* Communities */}
          <section className="mb-6">
            <SectionHeader
              label={`Communities (${joined.length})`}
              action={{ label: "Manage", href: "/app/community" }}
            />
            {joined.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-ink-400">No communities joined yet.</p>
                <Link
                  href="/app/discover"
                  className="mt-2 inline-block text-sm font-semibold text-volt-700"
                >
                  Find your people →
                </Link>
              </div>
            ) : (
              <List>
                {joined.map((c) => (
                  <ListRow key={c.id} href={`/app/community/${c.id}`} chevron>
                    <span className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-750 text-ink-300">
                        <Glyph name={c.activity} size={21} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-100">
                          {c.name}
                        </span>
                        <span className="num block truncate text-[11px] text-ink-500">
                          {c.members} members · {areaLabel(c.area)}
                        </span>
                      </span>
                      <Badge tone="volt">Member</Badge>
                    </span>
                  </ListRow>
                ))}
              </List>
            )}
          </section>

          {/* Upcoming commitments */}
          <section className="mb-6">
            <SectionHeader
              label={`Upcoming (${joinedSessions.length})`}
              action={{ label: "All sessions", href: "/app/sessions" }}
            />
            {joinedSessions.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-ink-400">Nothing committed yet.</p>
              </div>
            ) : (
              <List>
                {joinedSessions.map((s) => (
                  <ListRow key={s.id} href={`/app/sessions/${s.id}`} chevron>
                    <span className="flex items-center gap-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-100">
                          {s.title}
                        </span>
                        <span className="num block truncate text-[11px] text-ink-500">
                          {s.dayLabel} {s.date} · {s.time} · {s.location}
                        </span>
                      </span>
                      {state.checkedIn.includes(s.id) && (
                        <Badge tone="ok">Checked in</Badge>
                      )}
                    </span>
                  </ListRow>
                ))}
              </List>
            )}
          </section>

          {/* Settings — only controls that actually do something. The old
              "Account & privacy" row linked back to this page and "Data
              export" was a label over the Progress route; both are gone. */}
          <section className="mb-6">
            <SectionHeader label="Settings" />
            <List>
              <ListRow>
                <Toggle
                  checked={state.sessionReminders}
                  onChange={setSessionReminders}
                  label="Session reminders"
                  hint="Preference saved on this device"
                />
              </ListRow>
              <ListRow href="/app/notifications" chevron>
                <span className="block text-sm font-medium text-ink-100">
                  Notification history
                </span>
              </ListRow>
            </List>
          </section>

          <div className="flex flex-col gap-3">
            <Button full variant="secondary" onClick={openEditor}>
              Edit profile
            </Button>
            <Button full variant="ghost" href="/onboarding/welcome">
              Back to onboarding
            </Button>
            {/* Confirmation flow preserved exactly as it was. */}
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
        </div>
      </div>

      {/* Edit sheet */}
      <BottomSheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Display name
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (status) setStatus(null);
              }}
              maxLength={NAME_MAX}
              aria-invalid={status?.kind === "error"}
              className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-3 text-sm text-ink-100 outline-none focus:border-volt-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Home gym
            </span>
            <input
              value={gym}
              onChange={(e) => {
                setGym(e.target.value);
                if (status) setStatus(null);
              }}
              maxLength={GYM_MAX}
              placeholder="e.g. i-Fitness Lekki"
              className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-3 text-sm text-ink-100 outline-none focus:border-volt-400"
            />
          </label>

          {status && (
            <p
              role={status.kind === "error" ? "alert" : "status"}
              className={cn(
                "rounded-xl px-3.5 py-2.5 text-[13px] leading-snug",
                STATUS_TONE[status.kind],
              )}
            >
              {status.msg}
            </p>
          )}

          <div className="flex gap-2.5 pb-2">
            <Button full variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button full onClick={applied ? () => setEditing(false) : save}>
              {applied ? "Done" : "Save"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}
