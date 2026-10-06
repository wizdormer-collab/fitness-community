"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, SegmentedControl, Tag, Toggle } from "@/components/ui/controls";
import { Card, SectionHeader } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { usePrototype } from "@/lib/prototype-state";
import { activityOf, pace } from "@/lib/format";
import { ACTIVITIES, type ActivityId } from "@/lib/types";

type Mode = "strength" | "run" | "other";

interface SetRow {
  id: number;
  exercise: string;
  sets: number;
  reps: number;
  weightKg: number;
}

let uid = 0;

export default function LogWorkout() {
  const router = useRouter();
  const { addWorkout, profile } = usePrototype();

  const [mode, setMode] = useState<Mode>("strength");
  const [rows, setRows] = useState<SetRow[]>([
    { id: uid++, exercise: "Bench Press", sets: 4, reps: 6, weightKg: 55 },
  ]);
  const [durationMin, setDuration] = useState(60);
  const [distanceKm, setDistance] = useState(5);
  const [activity, setActivity] = useState<ActivityId>("running");
  const [location, setLocation] = useState(profile.currentGym || "");
  const [shared, setShared] = useState(true);
  const [saved, setSaved] = useState(false);

  const updateRow = (id: number, patch: Partial<SetRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: uid++, exercise: "", sets: 3, reps: 10, weightKg: 40 },
    ]);

  const removeRow = (id: number) =>
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r));

  const topWeight = rows.reduce((max, r) => Math.max(max, r.weightKg), 0);

  const save = () => {
    const isRun = mode === "run";
    const isStrength = mode === "strength";
    const summary = isRun
      ? `${distanceKm.toFixed(2)} km · ${durationMin} min · ${pace(durationMin, distanceKm)}`
      : isStrength
        ? `${rows.length} exercise${rows.length === 1 ? "" : "s"} · ${durationMin} min`
        : `${durationMin} min · ${activityOf(activity).label}`;

    addWorkout({
      activity: isRun ? "running" : isStrength ? "gym" : activity,
      dayLabel: "Today",
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      durationMin,
      location: location || undefined,
      sharedToFeed: shared,
      isPR: isStrength && topWeight >= 55,
      prNote: isStrength && topWeight >= 55 ? `Bench ${topWeight}kg` : undefined,
      strength: isStrength
        ? rows.map((r) => ({
            exercise: r.exercise || "Exercise",
            sets: r.sets,
            reps: r.reps,
            weightKg: r.weightKg,
          }))
        : undefined,
      run: isRun ? { distanceKm, pacePerKm: pace(durationMin, distanceKm).split(" ")[0]! } : undefined,
      summary,
    });

    setSaved(true);
    window.setTimeout(() => router.push("/app/progress"), 1100);
  };

  if (saved) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-pop">
        <span className="text-5xl" aria-hidden>
          🎉
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-50">
          Workout logged
        </h1>
        <p className="mt-2 max-w-[28ch] text-sm text-ink-400">
          Your week, streak and progress are updated. Taking you there now.
        </p>
        <div className="mt-6 flex gap-2.5">
          <Button onClick={() => router.push("/app/progress")}>See progress</Button>
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Log another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        title="Log workout"
        subtitle="Manual entry in v1 — wearable integrations come after product-market validation."
        backHref="/app"
        backLabel="Home"
      />

      <SegmentedControl<Mode>
        className="mb-6"
        value={mode}
        onChange={setMode}
        options={[
          { id: "strength", label: "Strength" },
          { id: "run", label: "Run" },
          { id: "other", label: "Other" },
        ]}
      />

      {mode === "strength" && (
        <section className="mb-6">
          <SectionHeader
            label="Exercises"
            action={{ label: "+ Add", href: "#" }}
          />
          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-3.5">
                <div className="flex gap-2">
                  <input
                    value={r.exercise}
                    onChange={(e) => updateRow(r.id, { exercise: e.target.value })}
                    placeholder="Exercise name"
                    className="min-w-0 flex-1 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm font-semibold text-ink-100 outline-none placeholder:font-normal placeholder:text-ink-600 focus:border-volt-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    aria-label="Remove exercise"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-700 text-ink-500 transition hover:border-bad-500/50 hover:text-bad-400"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: "sets", label: "Sets", step: 1, min: 1 },
                      { key: "reps", label: "Reps", step: 1, min: 1 },
                      { key: "weightKg", label: "Weight (kg)", step: 2.5, min: 0 },
                    ] as const
                  ).map((f) => (
                    <label key={f.key} className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        {f.label}
                      </span>
                      <span className="flex items-center rounded-lg border border-ink-700 bg-ink-850">
                        <button
                          type="button"
                          aria-label={`Decrease ${f.label}`}
                          onClick={() =>
                            updateRow(r.id, {
                              [f.key]: Math.max(f.min, r[f.key] - f.step),
                            } as Partial<SetRow>)
                          }
                          className="h-9 w-8 shrink-0 text-ink-400 transition hover:text-ink-100"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={r[f.key]}
                          onChange={(e) =>
                            updateRow(r.id, {
                              [f.key]: Math.max(f.min, Number(e.target.value) || 0),
                            } as Partial<SetRow>)
                          }
                          className="num w-full min-w-0 bg-transparent py-2 text-center text-sm font-bold text-ink-50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Increase ${f.label}`}
                          onClick={() =>
                            updateRow(r.id, { [f.key]: r[f.key] + f.step } as Partial<SetRow>)
                          }
                          className="h-9 w-8 shrink-0 text-ink-400 transition hover:text-ink-100"
                        >
                          +
                        </button>
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Button variant="secondary" full onClick={addRow} className="mt-3">
            + Add exercise
          </Button>
        </section>
      )}

      {mode === "run" && (
        <section className="mb-6">
          <SectionHeader label="Run details" />
          <Card className="space-y-4 p-4">
            <Stepper
              label="Distance"
              unit="km"
              value={distanceKm}
              step={1}
              min={0.5}
              onChange={setDistance}
            />
            <Stepper
              label="Duration"
              unit="min"
              value={durationMin}
              step={5}
              min={5}
              onChange={setDuration}
            />
            <div className="rounded-xl bg-ink-750 p-3.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Average pace
              </p>
              <p className="num mt-1 font-display text-2xl font-bold text-volt-400">
                {pace(durationMin, distanceKm)}
              </p>
            </div>
          </Card>
        </section>
      )}

      {mode === "other" && (
        <section className="mb-6">
          <SectionHeader label="Activity" />
          <div className="grid grid-cols-3 gap-2.5">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActivity(a.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 transition ${
                  activity === a.id
                    ? "border-volt-400 bg-volt-400/[0.1]"
                    : "border-ink-700 bg-ink-800"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {a.emoji}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    activity === a.id ? "text-volt-400" : "text-ink-400"
                  }`}
                >
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Shared settings */}
      <section className="mb-6">
        <SectionHeader label="Details" />
        <Card className="divide-y divide-ink-700 p-0 px-4">
          <Stepper
            label="Duration"
            unit="min"
            value={durationMin}
            step={5}
            min={5}
            onChange={setDuration}
            borderless
          />
          <label className="block py-3.5">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Location
            </span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where did you train?"
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-ink-100 outline-none placeholder:text-ink-600 focus:border-volt-400"
            />
          </label>
          <Toggle
            checked={shared}
            onChange={setShared}
            label="Share to my feed"
            hint={shared ? "Your community will see this workout" : "Only you can see it"}
          />
        </Card>
      </section>

      <Button full size="lg" onClick={save}>
        Save workout
      </Button>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Tag>Wearables connect after product-market validation</Tag>
        <Tag>Export data</Tag>
      </div>
    </div>
  );
}

function Stepper({
  label,
  unit,
  value,
  step,
  min,
  onChange,
  borderless = false,
}: {
  label: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  onChange: (v: number) => void;
  borderless?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        borderless ? "py-3.5" : ""
      }`}
    >
      <span className="text-sm font-medium text-ink-200">
        {label}
        <span className="num ml-1.5 text-xs text-ink-500">{unit}</span>
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-ink-300 transition hover:border-ink-500"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
          className="num w-16 rounded-lg border border-ink-700 bg-ink-850 py-2 text-center text-sm font-bold text-ink-50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-ink-300 transition hover:border-ink-500"
        >
          +
        </button>
      </span>
    </div>
  );
}
