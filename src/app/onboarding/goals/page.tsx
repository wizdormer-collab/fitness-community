"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import { FITNESS_GOALS, type FitnessGoalId } from "@/lib/types";

export default function Goals() {
  const { profile, setDraft } = usePrototype();
  const [selected, setSelected] = useState<FitnessGoalId[]>(
    profile.goals.length ? profile.goals : [],
  );

  const toggle = (id: FitnessGoalId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const commit = () => setDraft({ goals: selected });

  return (
    <OnboardingShell
      step={3}
      back="/onboarding/location"
      title="What are you working towards?"
      subtitle="Pick everything that applies. We use this to match communities and partners — not to sell you anything."
      ctaLabel="Continue"
      nextHref="/onboarding/activities"
      onNext={commit}
      valid={selected.length > 0}
      hint={
        selected.length === 0
          ? "Choose at least one goal"
          : `${selected.length} selected`
      }
    >
      <FieldLabel count={`${selected.length} / ${FITNESS_GOALS.length}`}>
        Select your goals
      </FieldLabel>

      <div className="grid grid-cols-2 gap-2.5">
        {FITNESS_GOALS.map((g) => {
          const active = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition active:scale-[0.97]",
                active
                  ? "border-volt-400 bg-volt-400 text-ink-950"
                  : "border-ink-700 bg-ink-800 text-ink-200 hover:border-ink-600",
              )}
            >
              <span className="text-base" aria-hidden>
                {g.emoji}
              </span>
              <span className="min-w-0 leading-tight">{g.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 rounded-2xl border border-dashed border-ink-700 bg-ink-850/60 p-4">
        <p className="text-[13px] leading-relaxed text-ink-400">
          <span className="font-semibold text-ink-200">Tip:</span> choosing two
          or three keeps recommendations sharp. Chasing weight loss and
          endurance at once is normal — picking all nine just dilutes the
          matches.
        </p>
      </div>
    </OnboardingShell>
  );
}
