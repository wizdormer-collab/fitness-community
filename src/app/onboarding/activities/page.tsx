"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import { ACTIVITIES, type ActivityId } from "@/lib/types";

export default function Activities() {
  const { profile, setDraft } = usePrototype();
  const [selected, setSelected] = useState<ActivityId[]>(
    profile.activities.length ? profile.activities : [],
  );

  const toggle = (id: ActivityId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const commit = () => setDraft({ activities: selected });

  return (
    <OnboardingShell
      step={4}
      back="/onboarding/goals"
      title="What do you enjoy doing?"
      subtitle="This decides which communities, sessions and events show up first."
      ctaLabel="Continue"
      nextHref="/onboarding/level"
      onNext={commit}
      valid={selected.length > 0}
      hint={
        selected.length === 0
          ? "Choose at least one activity"
          : `${selected.length} selected`
      }
    >
      <FieldLabel count={`${selected.length} / ${ACTIVITIES.length}`}>
        Select your activities
      </FieldLabel>

      <div className="grid grid-cols-3 gap-2.5">
        {ACTIVITIES.map((a) => {
          const active = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 transition active:scale-[0.97]",
                active
                  ? "border-volt-400 bg-volt-400 text-ink-950"
                  : "border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600",
              )}
            >
              <span className="text-xl" aria-hidden>
                {a.emoji}
              </span>
              <span className="text-[11px] font-bold leading-tight text-center">
                {a.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 rounded-2xl border border-ink-700 bg-ink-850 p-4">
        <p className="text-[13px] leading-relaxed text-ink-400">
          Don&apos;t see yours? <span className="text-ink-200">Other</span>{" "}
          covers padel-adjacent sports, CrossFit, martial arts and everything
          we haven&apos;t listed yet. Communities can be built around it from
          day one.
        </p>
      </div>
    </OnboardingShell>
  );
}
