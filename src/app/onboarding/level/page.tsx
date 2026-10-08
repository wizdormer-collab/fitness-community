"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { List, ListRow } from "@/components/ui/card";
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
import { Glyph } from "@/components/ui/glyph";

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
      <List variant="surface">
        {FITNESS_LEVELS.map((l) => {
          const active = l.id === level;
          return (
            <ListRow
              key={l.id}
              layout="block"
              className={cn("py-3.5", active && "bg-volt-400/[0.12]")}
              onClick={() => setLevel(l.id)}
            >
              <span className="flex items-center gap-3.5">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-volt-600" : "border-ink-500",
                  )}
                >
                  {active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-volt-600" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-bold",
                      active ? "text-volt-800" : "text-ink-100",
                    )}
                  >
                    {l.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {l.note}
                  </span>
                </span>
              </span>
            </ListRow>
          );
        })}
      </List>

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
                    ? "border-volt-400 bg-volt-400 text-onvolt"
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
        <List variant="surface">
          {TIME_SLOTS.map((t) => {
            const active = slots.includes(t.id);
            return (
              <ListRow
                key={t.id}
                layout="block"
                className={cn("py-3.5", active && "bg-volt-400/[0.12]")}
                onClick={() => toggleSlot(t.id)}
              >
                <span className="flex items-center gap-3">
                  <Glyph
                    name={t.id}
                    size={19}
                    className={active ? "text-volt-700" : "text-ink-500"}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-bold",
                        active ? "text-volt-800" : "text-ink-100",
                      )}
                    >
                      {t.label}
                    </span>
                    <span className="num block text-[12px] text-ink-500">
                      {t.time}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      active
                        ? "bg-volt-400 text-onvolt"
                        : "border border-ink-600 text-transparent",
                    )}
                  >
                    <Glyph name="check" size={12} strokeWidth={3.4} />
                  </span>
                </span>
              </ListRow>
            );
          })}
        </List>
      </div>
    </OnboardingShell>
  );
}
