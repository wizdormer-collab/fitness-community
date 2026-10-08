"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { List, ListRow } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { LAGOS_AREAS } from "@/lib/types";
import { usePrototype } from "@/lib/prototype-state";
import type { LagosAreaId } from "@/lib/types";
import { Glyph } from "@/components/ui/glyph";

export default function Location() {
  const { profile, setDraft } = usePrototype();
  const [area, setArea] = useState<LagosAreaId>(profile.area);
  const [gym, setGym] = useState(profile.currentGym);

  const commit = () => {
    setDraft({ area, currentGym: gym });
  };

  return (
    <OnboardingShell
      step={2}
      back="/onboarding/signin"
      title="Where do you train?"
      subtitle="Lagos first — we're launching neighbourhood by neighbourhood so the community near you is actually alive."
      ctaLabel="Continue"
      nextHref="/onboarding/goals"
      onNext={commit}
      hint="You can change this later in Profile."
    >
      <FieldLabel>Choose your area</FieldLabel>
      <List variant="surface">
        {LAGOS_AREAS.map((a) => {
          const active = a.id === area;
          return (
            <ListRow
              key={a.id}
              layout="block"
              className={cn("py-3.5", active && "bg-volt-400/[0.12]")}
              onClick={() => setArea(a.id)}
            >
              <span className="flex items-center gap-3">
                <Glyph
                  name="pin"
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
                    {a.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {a.note}
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

      <div className="mt-8">
        <FieldLabel>Your current gym (optional)</FieldLabel>
        <label className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3.5 focus-within:border-volt-400">
          <Glyph name="gym" size={19} className="text-ink-500" />
          <input
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            placeholder="e.g. i-Fitness Lekki"
            className="w-full min-w-0 bg-transparent text-[15px] text-ink-50 outline-none placeholder:text-ink-600"
          />
        </label>
        <p className="mt-2.5 text-xs leading-relaxed text-ink-500">
          Used to suggest nearby communities and sessions. Never shown on your
          public profile without your permission.
        </p>
      </div>
    </OnboardingShell>
  );
}
