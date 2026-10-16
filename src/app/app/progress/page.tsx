"use client";

import {
  Card,
  SectionHeader,
  Badge,
  Divider,
  Band,
  List,
  ListRow,
} from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { StatTile, Ring, StreakFlame } from "@/components/ui/metrics";
import { BarChart, Sparkline, Heatmap, ActivitySplit } from "@/components/ui/charts";
import { Chip } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/avatar";
import { Glyph } from "@/components/ui/glyph";
import { usePrototype } from "@/lib/prototype-state";
import { PROGRESS, WORKOUTS } from "@/lib/mock-data";
import { activityOf, duration, grouped, plural } from "@/lib/format";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const HEAT_LEGEND = ["#eceae0", "#eef7cf", "#b9dd57", "#628309"];

export default function Progress() {
  const { state } = usePrototype();

  const weeklyTrend = PROGRESS.weeklyTrend.slice(0, -1).concat(
    state.weeklyCompleted,
  );

  const target = PROGRESS.weeklyTarget;
  const completed = state.weeklyCompleted;
  // Clamped: overshooting the goal must not render "-1 to go".
  const remaining = Math.max(0, target - completed);
  const goalMet = completed >= target;

  // distanceTrend is weekly kilometres, so the 90-day figure is the sum of the
  // weeks actually charted — not a round number typed in beside it.
  const distanceKm = PROGRESS.distanceTrend.reduce((a, b) => a + b, 0);
  const peakKm = Math.max(...PROGRESS.distanceTrend);
  const peakWeek = PROGRESS.distanceTrend.indexOf(peakKm) + 1;

  // Consistency is counted off the same 90-day grid that is drawn below, so the
  // number can never disagree with the picture.
  const daysTrained = PROGRESS.heatmap.filter((d) => d.intensity > 0).length;

  // The seeded split covers the logged history; workouts added on the Log
  // screen have to move it, or the total here and the "Workouts" tile above
  // would drift apart.
  const counts = new Map<string, number>(
    PROGRESS.byActivity.map((i) => [i.activity, i.count]),
  );
  for (const w of state.extraWorkouts) {
    counts.set(w.activity, (counts.get(w.activity) ?? 0) + 1);
  }
  const splitTotal = [...counts.values()].reduce((a, b) => a + b, 0);
  const byActivity = [...counts.entries()]
    .map(([activity, count]) => ({
      activity,
      count,
      pct: splitTotal ? Math.round((count / splitTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const records = state.extraWorkouts.some((w) => w.isPR)
    ? [
        ...state.extraWorkouts
          .filter((w) => w.isPR)
          .map((w) => ({
            id: w.id,
            exercise: w.prNote ?? "New record",
            from: "",
            to: w.summary,
            unit: "",
            ago: "Just now",
            isNew: true,
          })),
        ...PROGRESS.records,
      ]
    : PROGRESS.records;

  const recent = [...state.extraWorkouts, ...WORKOUTS].slice(0, 6);
  const avgMin = Math.round(state.trainingMinutes / Math.max(1, state.totalWorkouts));

  return (
    <div>
      <ScreenHeader
        title="Progress"
        subtitle="Where the last 90 days actually went."
      />

      {/* 1. Summary — four across on desktop, two on mobile */}
      <Band divided className="mb-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
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
            sub={`${PROGRESS.weeklyAverage} sessions/wk avg`}
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
            value={grouped(distanceKm)}
            unit="km"
            sub={`${PROGRESS.distanceTrend.length} weeks charted`}
            icon="running"
          />
        </div>
      </Band>

      {/* 2. Weekly goal + commitment — straight on the canvas */}
      <Band divided className="mb-6">
        <SectionHeader
          label="This week"
          hint={`Committed to ${target} sessions`}
        />
        {/* Goal and streak read as one compact component — the ring is the
            progress indicator (the old bar underneath restated the same 3/4),
            and the streak chip that used to float in the header now sits with
            the goal it keeps alive. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Ring value={completed} max={target} size={84} label="sessions" />
          {/* min-w (not min-w-0): without a floor the flex-1 copy absorbs the
              squeeze on narrow screens and the streak chip wraps only after
              the headline is already crushed to ~110px. */}
          <div className="min-w-[13rem] flex-1">
            <p className="font-display text-base font-bold leading-tight text-ink-50">
              {goalMet
                ? "Weekly goal met"
                : `${remaining} ${plural(remaining, "session")} to go`}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
              {goalMet
                ? "Consistency beats intensity. Same time next week."
                : `${remaining} more ${plural(remaining, "session")} keeps your streak alive.`}
            </p>
          </div>
          {/* ml-auto keeps the chip on the right edge when it wraps to its own
              line on phones — mirroring its desktop position. */}
          <StreakFlame days={state.streak} size="md" className="ml-auto" />
        </div>
        {/* PRD §8 — the commitment is public, so it reads as a promise, not a private counter. */}
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-volt-400/10 px-3.5 py-3 text-[13px] leading-snug text-volt-800 ring-1 ring-inset ring-volt-600/25">
          <Glyph name="communities" size={16} className="mt-px shrink-0" />
          <span>
            Your community can see this commitment. {completed} of {target}{" "}
            logged — {goalMet ? "you showed up." : "still in progress."}
          </span>
        </p>
      </Band>

      {/* 3. Charts — side by side on desktop, stacked on mobile. Both are
          aria-hidden inside, so each carries a text equivalent below. */}
      <div className="mb-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <Band label="Weekly volume" hint="Sessions per week">
          <Card className="p-4">
            <BarChart data={weeklyTrend} height={96} />
            <span className="sr-only">
              Sessions per week:{" "}
              {weeklyTrend.map((v, i) => `week ${i + 1}, ${v}`).join("; ")}
            </span>
            <div className="mt-3 flex justify-between text-xs text-ink-500">
              <span>{weeklyTrend.length} weeks ago</span>
              <span>This week</span>
            </div>
            <Divider className="my-4" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Distance trend
              </p>
              <Sparkline data={PROGRESS.distanceTrend} height={56} />
              <p className="num mt-1 text-[11px] text-ink-400">
                Peaked at {peakKm} km in week {peakWeek} · {distanceKm} km over{" "}
                {PROGRESS.distanceTrend.length} weeks
              </p>
              <span className="sr-only">
                Weekly distance from {PROGRESS.distanceTrend[0]} kilometres to{" "}
                {PROGRESS.distanceTrend[PROGRESS.distanceTrend.length - 1]}{" "}
                kilometres, peaking at {peakKm} kilometres in week {peakWeek}.
              </span>
            </div>
          </Card>
        </Band>

        <Band
          label="Consistency"
          hint="Last 90 days"
          action={{ label: "Records", href: "#records" }}
          className="mt-6 lg:mt-0"
        >
          <Card className="p-4">
            {/* Rows are days of the week, columns are weeks — so the day
                letters belong down the left edge, aligned to the rows. */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-2">
              <div
                className="grid text-[9px] font-semibold leading-none text-ink-500"
                style={{
                  gridTemplateRows: "repeat(7, minmax(0,1fr))",
                  gap: "3px",
                }}
                aria-hidden
              >
                {DAY_LETTERS.map((d, i) => (
                  <span key={i} className="flex items-center">
                    {d}
                  </span>
                ))}
              </div>
              <Heatmap days={PROGRESS.heatmap} />
            </div>
            <span className="sr-only">
              You trained on {daysTrained} of the last {PROGRESS.days} days.
            </span>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-ink-500">
                {daysTrained} of {PROGRESS.days} days trained
              </span>
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
      </div>

      {/* 4. Where time goes */}
      <Band label="Where time goes" hint="By session type" className="mb-6">
        <ActivitySplit items={byActivity} />
        {/* Streak moved up to the goal band, and days-trained isn't repeated
            here — the heatmap footer above already states "N of 90 days
            trained". Avg session is the one summary that belongs with
            time-by-type, so it stays as a tail line under the split. */}
        <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-3">
          <span className="text-sm text-ink-400">Avg session</span>
          <span className="num font-display font-bold text-ink-100">
            {duration(avgMin)}
          </span>
        </div>
      </Band>

      {/* 5. Records + history — side by side on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <section id="records" className="mb-6">
          <SectionHeader
            label="Personal records"
            hint={`${records.length} ${plural(records.length, "record")}`}
          />
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
                      {/* A PR logged from the Log screen has no previous value
                          to compare against — show the result, not a dash. */}
                      {r.from ? `${r.from} → ${r.to}` : r.to}
                      {r.unit ? ` ${r.unit}` : ""}
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
                  {/* Phones: the metrics drop to their own line (indented to
                      the title) instead of sharing one row and truncating
                      mid-number. Side-by-side from sm up, as before. */}
                  <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3.5">
                    <span className="flex min-w-0 items-center gap-3.5 sm:flex-1">
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
                    </span>
                    {/* Let CSS truncate rather than slicing mid-number — the
                        desktop column is narrower now that history sits beside
                        records. */}
                    <span className="num truncate pl-[58px] text-xs font-semibold text-ink-300 sm:min-w-0 sm:flex-1 sm:pl-0 sm:text-right">
                      {w.summary}
                    </span>
                  </span>
                </ListRow>
              );
            })}
          </List>
        </section>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip size="sm" href="/app/log">
          Log workout
        </Chip>
        <Chip size="sm" href="/app/boards">
          Leaderboards
        </Chip>
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
    </div>
  );
}
