"use client";

import { Card, SectionHeader, Badge, Divider, Band, List, ListRow } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { StatTile, Ring, StreakFlame, ProgressBar } from "@/components/ui/metrics";
import { BarChart, Sparkline, Heatmap, ActivitySplit } from "@/components/ui/charts";
import { Button, Chip } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/avatar";
import { Glyph } from "@/components/ui/glyph";
import { usePrototype } from "@/lib/prototype-state";
import { PROGRESS, WORKOUTS } from "@/lib/mock-data";
import { activityOf, duration, grouped } from "@/lib/format";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const HEAT_LEGEND = ["#e9edf2", "#eef7cf", "#b9dd57", "#7a9e1b"];

export default function Progress() {
  const { state } = usePrototype();

  const weeklyTrend = PROGRESS.weeklyTrend.slice(0, -1).concat(
    state.weeklyCompleted,
  );

  const records = state.extraWorkouts.some((w) => w.isPR)
    ? [
        ...state.extraWorkouts
          .filter((w) => w.isPR)
          .map((w) => ({
            id: w.id,
            exercise: w.prNote ?? "New record",
            from: "—",
            to: w.summary,
            unit: "",
            ago: "Just now",
            isNew: true,
          })),
        ...PROGRESS.records,
      ]
    : PROGRESS.records;

  const recent = [...state.extraWorkouts, ...WORKOUTS].slice(0, 6);
  const goalMet = state.weeklyCompleted >= PROGRESS.weeklyTarget;

  return (
    <div>
      <ScreenHeader
        title="Progress"
        subtitle="Where the last 90 days actually went."
        right={<StreakFlame days={state.streak} size="sm" />}
      />

      {/* Headline numbers — unframed, one hairline under the block */}
      <Band divided className="mb-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <StatTile
            label="Workouts"
            value={grouped(state.totalWorkouts)}
            sub={`${PROGRESS.days}-day history`}
            icon="gym"
          />
          <StatTile
            label="Training"
            value={(state.trainingMinutes / 60).toFixed(1)}
            unit="hrs"
            sub={`${PROGRESS.weeklyAverage} this week`}
            icon="clock"
          />
          <StatTile
            label="Personal records"
            value={state.personalRecords}
            sub="All time"
            icon="trophy"
            accent
          />
          <StatTile
            label="Distance"
            value="128.4"
            unit="km"
            sub="Last 90 days"
            icon="running"
          />
        </div>
      </Band>

      {/* Weekly goal + commitment — straight on the canvas */}
      <Band divided className="mb-6">
        <SectionHeader
          label="This week"
          hint={`Committed to ${PROGRESS.weeklyTarget} sessions`}
        />
        <div className="flex items-center gap-5">
          <Ring
            value={state.weeklyCompleted}
            max={PROGRESS.weeklyTarget}
            size={84}
            label="sessions"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold leading-tight text-ink-50">
              {goalMet ? "Weekly goal met" : `${PROGRESS.weeklyTarget - state.weeklyCompleted} to go`}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
              {goalMet
                ? "Consistency beats intensity. Same time next week."
                : "Two more sessions keeps your streak alive."}
            </p>
            <ProgressBar
              className="mt-3"
              value={state.weeklyCompleted}
              max={PROGRESS.weeklyTarget}
              showLabel
            />
          </div>
        </div>
        {/* PRD §8 — the commitment is public, so it reads as a promise, not a private counter. */}
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-volt-400/10 px-3.5 py-3 text-[13px] leading-snug text-volt-800 ring-1 ring-inset ring-volt-600/25">
          <Glyph name="communities" size={16} className="mt-px shrink-0" />
          <span>
            Your community can see this commitment. {state.weeklyCompleted} of{" "}
            {PROGRESS.weeklyTarget} logged — {goalMet ? "you showed up." : "still in progress."}
          </span>
        </p>
      </Band>

      {/* Charts — the only framed surfaces on this screen */}
      <Band label="Weekly volume" hint="Sessions per week" className="mb-6">
        <Card className="p-4">
          <BarChart data={weeklyTrend} height={96} />
          <div className="mt-3 flex justify-between text-xs text-ink-500">
            <span>8 weeks ago</span>
            <span>This week</span>
          </div>
          <Divider className="my-4" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Distance trend
            </p>
            <Sparkline data={PROGRESS.distanceTrend} height={56} />
            <p className="num mt-1 text-[11px] text-ink-400">
              Peaked at 42 km in week 6
            </p>
          </div>
        </Card>
      </Band>

      {/* Consistency */}
      <Band
        label="Consistency"
        hint="Last 90 days"
        action={{ label: "Records", href: "#records" }}
        className="mb-6"
      >
        <Card className="p-4">
          <Heatmap days={PROGRESS.heatmap} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {DAY_LETTERS.map((d, i) => (
                <span key={i} className="w-4 text-center text-[11px] text-ink-500">
                  {d}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
              <span>Less</span>
              {HEAT_LEGEND.map((c) => (
                <span
                  key={c}
                  className="h-2.5 w-2.5 rounded-[3px] ring-1 ring-ink-700"
                  style={{ background: c }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </Card>
      </Band>

      {/* Where time goes — unboxed bars, stats as divided rows */}
      <Band label="Where time goes" hint="By session type" className="mb-6">
        <ActivitySplit items={PROGRESS.byActivity} />
        <List className="mt-4">
          <ListRow>
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-400">Longest streak</span>
              <span className="num font-display font-bold text-warn-400">21 days</span>
            </span>
          </ListRow>
          <ListRow>
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-400">Avg session</span>
              <span className="num font-display font-bold text-ink-100">
                {duration(
                  Math.round(state.trainingMinutes / Math.max(1, state.totalWorkouts)),
                )}
              </span>
            </span>
          </ListRow>
        </List>
      </Band>

      {/* Personal records */}
      <section id="records" className="mb-6">
        <SectionHeader label="Personal records" hint="Tracked per exercise" />
        <List>
          {records.map((r) => (
            <ListRow key={r.id} className="px-0 py-3.5">
              <span className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-volt-400/[0.18] text-volt-700">
                  <Glyph name="medal" size={19} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-100">
                    {r.exercise}
                  </span>
                  <span className="num block truncate text-[11px] text-ink-500">
                    {r.from} → {r.to} {r.unit}
                  </span>
                </span>
                <Badge tone={r.isNew ? "volt" : "muted"}>
                  {r.isNew ? "New PR" : r.ago}
                </Badge>
              </span>
            </ListRow>
          ))}
        </List>
      </section>

      {/* Recent workouts */}
      <section className="mb-6">
        <SectionHeader
          label="Recent workouts"
          action={{ label: "Log new", href: "/app/log" }}
        />
        <List>
          {recent.map((w) => {
            const a = activityOf(w.activity);
            return (
              <ListRow key={w.id} className="px-0 py-3.5">
                <span className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-750 text-ink-300">
                    <Glyph name={a.id} size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink-100">
                        {a.label}
                      </span>
                      {w.isPR && <Badge tone="volt">PR</Badge>}
                    </span>
                    <span className="num block truncate text-[11px] text-ink-500">
                      {w.dayLabel} · {w.date} · {duration(w.durationMin)}
                    </span>
                  </span>
                  <span className="num shrink-0 text-right text-xs font-semibold text-ink-300">
                    {w.summary.length > 22
                      ? `${w.summary.slice(0, 20)}…`
                      : w.summary}
                  </span>
                </span>
              </ListRow>
            );
          })}
        </List>
      </section>

      <div className="flex flex-wrap gap-2">
        <Chip size="sm" href="/app/log">
          Log workout
        </Chip>
        <Chip size="sm" href="/app/boards">
          Leaderboards
        </Chip>
        <Chip size="sm">Export data</Chip>
      </div>

      <div className="mt-5 flex items-start gap-3 border-l-2 border-volt-600 pl-4">
        <Avatar initials="TB" tone={3} size="sm" />
        <div className="min-w-0">
          <p className="text-[13px] leading-relaxed text-ink-300">
            “Volume without progression is just motion. Add 2.5kg or one rep
            every week.”
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-ink-500">
            Tunde Bakare · Strength coach
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Button variant="ghost" full href="#records">
          View all records
        </Button>
      </div>
    </div>
  );
}
