"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import {
  FITNESS_LEVELS,
  TIME_SLOTS,
  WEEKDAYS,
  type FitnessLevelId,
  type TimeSlotId,
  type WeekdayId,
} from "@/lib/types";

export default function Level() {
  const { profile, setDraft } = usePrototype();
  const [level, setLevel] = useState<FitnessLevelId>(profile.fitnessLevel);
  const [days, setDays] = useState<WeekdayId[]>(profile.preferredDays);
  const [slots, setSlots] = useState<TimeSlotId[]>(profile.preferredSlots);

  const toggleDay = (id: WeekdayId) =>
    setDays((p) => (p.includes(id) ? p.filter((d) => d !== id) : [...p, id]));
  const toggleSlot = (id: TimeSlotId) =>
    setSlots((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  const commit = () =>
    setDraft({
      fitnessLevel: level,
      preferredDays: days,
      preferredSlots: slots,
    });

  return (
    <OnboardingShell
      step={5}
      back="/onboarding/activities"
      title="How do you train?"
      subtitle="Your level and schedule are the two things a training partner actually needs to match on."
      ctaLabel="Continue"
      nextHref="/onboarding/match"
      onNext={commit}
      valid={days.length > 0}
      hint={days.length === 0 ? "Pick at least one training day" : undefined}
    >
      <FieldLabel>Your level</FieldLabel>
      <div className="space-y-2.5">
        {FITNESS_LEVELS.map((l) => {
          const active = l.id === level;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
                active
                  ? "border-volt-400 bg-volt-400/[0.08]"
                  : "border-ink-700 bg-ink-800 hover:border-ink-600",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  active ? "border-volt-400" : "border-ink-500",
                )}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-volt-400" />}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-bold",
                    active ? "text-volt-400" : "text-ink-100",
                  )}
                >
                  {l.label}
                </span>
                <span className="mt-0.5 block text-xs text-ink-400">
                  {l.note}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <FieldLabel count={days.length ? `${days.length} days` : undefined}>
          Preferred training days
        </FieldLabel>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => {
            const active = days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDay(d.id)}
                aria-pressed={active}
                aria-label={d.long}
                className={cn(
                  "flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-bold transition active:scale-95",
                  active
                    ? "border-volt-400 bg-volt-400 text-ink-950"
                    : "border-ink-700 bg-ink-800 text-ink-400 hover:border-ink-600",
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel count={slots.length ? `${slots.length} selected` : undefined}>
          Preferred workout time
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {TIME_SLOTS.map((t) => {
            const active = slots.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleSlot(t.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition active:scale-[0.97]",
                  active
                    ? "border-volt-400 bg-volt-400/[0.1]"
                    : "border-ink-700 bg-ink-800 hover:border-ink-600",
                )}
              >
                <span className="text-base" aria-hidden>
                  {t.emoji}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-xs font-bold",
                      active ? "text-volt-400" : "text-ink-200",
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="num block text-[10px] text-ink-500">
                    {t.time}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}
