"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { List, ListRow } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import { FITNESS_GOALS, type FitnessGoalId } from "@/lib/types";
import { Glyph } from "@/components/ui/glyph";

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

      <List variant="surface">
        {FITNESS_GOALS.map((g) => {
          const active = selected.includes(g.id);
          return (
            <ListRow
              key={g.id}
              layout="block"
              className={cn("py-3.5", active && "bg-volt-400/[0.12]")}
              onClick={() => toggle(g.id)}
            >
              <span className="flex items-center gap-3">
                <Glyph
                  name={g.id}
                  size={19}
                  className={active ? "text-volt-700" : "text-ink-500"}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm font-semibold",
                    active ? "text-volt-800" : "text-ink-100",
                  )}
                >
                  {g.label}
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

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-100">Tip:</span> choosing two
          or three keeps recommendations sharp. Chasing weight loss and
          endurance at once is normal — picking all nine just dilutes the
          matches.
        </p>
      </div>
    </OnboardingShell>
  );
}
