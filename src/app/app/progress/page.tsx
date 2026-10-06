"use client";

import { Card, SectionHeader, Badge, Divider } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { StatTile, Ring, StreakFlame, ProgressBar } from "@/components/ui/metrics";
import { BarChart, Sparkline, Heatmap, ActivitySplit } from "@/components/ui/charts";
import { Button, Chip } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/avatar";
import { usePrototype } from "@/lib/prototype-state";
import { PROGRESS, WORKOUTS } from "@/lib/mock-data";
import { activityOf, duration, grouped } from "@/lib/format";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

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

  return (
    <div>
      <ScreenHeader
        title="Progress"
        subtitle="Where the last 90 days actually went."
        right={<StreakFlame days={state.streak} size="sm" />}
      />

      {/* Headline numbers */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatTile
          label="Workouts"
          value={grouped(state.totalWorkouts)}
          sub={`${PROGRESS.days}-day history`}
          emoji="💪"
        />
        <StatTile
          label="Training"
          value={(state.trainingMinutes / 60).toFixed(1)}
          unit="hrs"
          sub={`${PROGRESS.weeklyAverage} this week`}
          emoji="⏱"
        />
        <StatTile
          label="Personal records"
          value={state.personalRecords}
          sub="All time"
          emoji="🏆"
          accent
        />
        <StatTile
          label="Distance"
          value="128.4"
          unit="km"
          sub="Last 90 days"
          emoji="🏃"
        />
      </div>

      {/* Weekly goal */}
      <section className="mb-6">
        <SectionHeader
          label="This week"
          hint={`Target ${PROGRESS.weeklyTarget} sessions`}
        />
        <Card className="flex items-center gap-5 p-4">
          <Ring
            value={state.weeklyCompleted}
            max={PROGRESS.weeklyTarget}
            size={84}
            label="sessions"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-100">
              {state.weeklyCompleted >= PROGRESS.weeklyTarget
                ? "Weekly goal met"
                : `${PROGRESS.weeklyTarget - state.weeklyCompleted} to go`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              {state.weeklyCompleted >= PROGRESS.weeklyTarget
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
        </Card>
      </section>

      {/* Weekly volume */}
      <section className="mb-6">
        <SectionHeader label="Weekly volume" hint="Sessions per week" />
        <Card className="p-4">
          <BarChart data={weeklyTrend} height={96} />
          <div className="mt-3 flex justify-between text-[10px] text-ink-500">
            <span>8 weeks ago</span>
            <span>This week</span>
          </div>
          <Divider className="my-4" />
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Distance trend
              </p>
              <Sparkline data={PROGRESS.distanceTrend} height={56} />
              <p className="num mt-1 text-[11px] text-ink-400">
                Peaked at 42 km in week 6
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Consistency grid */}
      <section className="mb-6">
        <SectionHeader
          label="Consistency"
          hint="Last 90 days"
          action={{ label: "Records", href: "#records" }}
        />
        <Card className="p-4">
          <Heatmap days={PROGRESS.heatmap} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              {DAY_LETTERS.map((d, i) => (
                <span key={i} className="w-4 text-center text-[9px] text-ink-600">
                  {d}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-ink-500">
              <span>Less</span>
              {["#171a1f", "#4f660f", "#7a9e1b", "#d7ff3e"].map((c) => (
                <span
                  key={c}
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: c }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Activity split */}
      <section className="mb-6">
        <SectionHeader label="Where time goes" hint="By session type" />
        <Card className="p-4">
          <ActivitySplit items={PROGRESS.byActivity} />
          <Divider className="my-4" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-400">Longest streak</span>
            <span className="num font-display font-bold text-warn-400">
              21 days
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-ink-400">Avg session</span>
            <span className="num font-display font-bold text-ink-100">
              {duration(Math.round(state.trainingMinutes / Math.max(1, state.totalWorkouts)))}
            </span>
          </div>
        </Card>
      </section>

      {/* Personal records */}
      <section id="records" className="mb-6">
        <SectionHeader label="Personal records" hint="PRD §16 — tracked per exercise" />
        <Card className="divide-y divide-ink-700 p-0">
          {records.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-volt-400/[0.1] text-base">
                🏅
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-100">
                  {r.exercise}
                </p>
                <p className="num truncate text-[11px] text-ink-500">
                  {r.from} → {r.to} {r.unit}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge tone={r.isNew ? "volt" : "muted"}>
                  {r.isNew ? "New PR" : r.ago}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Recent workouts */}
      <section className="mb-6">
        <SectionHeader
          label="Recent workouts"
          action={{ label: "Log new", href: "/app/log" }}
        />
        <Card className="divide-y divide-ink-700 p-0">
          {recent.map((w) => {
            const a = activityOf(w.activity);
            return (
              <div key={w.id} className="flex items-center gap-3.5 px-4 py-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-750 text-xl">
                  {a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink-100">
                      {a.label}
                    </p>
                    {w.isPR && <Badge tone="volt">PR</Badge>}
                  </div>
                  <p className="num truncate text-[11px] text-ink-500">
                    {w.dayLabel} · {w.date} · {duration(w.durationMin)}
                  </p>
                </div>
                <p className="num shrink-0 text-right text-xs font-semibold text-ink-300">
                  {w.summary.length > 22
                    ? `${w.summary.slice(0, 20)}…`
                    : w.summary}
                </p>
              </div>
            );
          })}
        </Card>
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

      <Card className="mt-5 border-ink-700 bg-ink-850 p-4">
        <div className="flex items-start gap-3">
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
        <Button variant="ghost" full className="mt-3" href="#records">
          View all records
        </Button>
      </Card>
    </div>
  );
}
