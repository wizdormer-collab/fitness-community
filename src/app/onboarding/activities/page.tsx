"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { Chip } from "@/components/ui/controls";
import { usePrototype } from "@/lib/prototype-state";
import { ACTIVITIES, type ActivityId } from "@/lib/types";
import { Glyph } from "@/components/ui/glyph";

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

      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map((a) => {
          const active = selected.includes(a.id);
          return (
            <Chip
              key={a.id}
              size="md"
              selected={active}
              onClick={() => toggle(a.id)}
            >
              <Glyph name={a.id} size={16} strokeWidth={2} />
              {a.label}
            </Chip>
          );
        })}
      </div>

      <div className="mt-7 border-l-2 border-volt-600 pl-4">
        <p className="text-[13px] leading-relaxed text-ink-500">
          Don&apos;t see yours? <span className="font-semibold text-ink-100">Other</span>{" "}
          covers padel-adjacent sports, CrossFit, martial arts and everything
          we haven&apos;t listed yet. Communities can be built around it from
          day one.
        </p>
      </div>
    </OnboardingShell>
  );
}
