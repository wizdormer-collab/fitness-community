"use client";

import { useState } from "react";
import { FieldLabel, OnboardingShell } from "@/components/onboarding-shell";
import { cn } from "@/lib/cn";
import { LAGOS_AREAS } from "@/lib/types";
import { usePrototype } from "@/lib/prototype-state";
import type { LagosAreaId } from "@/lib/types";

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
      <div className="grid grid-cols-2 gap-3">
        {LAGOS_AREAS.map((a) => {
          const active = a.id === area;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setArea(a.id)}
              aria-pressed={active}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition active:scale-[0.97]",
                active
                  ? "border-volt-400 bg-volt-400/[0.08] shadow-[0_0_0_1px_rgba(215,255,62,0.3)]"
                  : "border-ink-700 bg-ink-800 hover:border-ink-600",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span className="text-lg" aria-hidden>
                  {active ? "📍" : "🗺️"}
                </span>
                {active && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "mt-1 text-sm font-bold",
                  active ? "text-volt-400" : "text-ink-100",
                )}
              >
                {a.label}
              </span>
              <span className="text-[11px] leading-snug text-ink-500">
                {a.note}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <FieldLabel>Your current gym (optional)</FieldLabel>
        <label className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3.5 focus-within:border-volt-400">
          <span aria-hidden className="text-lg">
            🏋️
          </span>
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
