"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding-shell";
import { Button, Chip } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

type Method = "phone" | "email";

export default function SignIn() {
  const [method, setMethod] = useState<Method>("phone");
  const [value, setValue] = useState("");

  const valid = value.trim().length >= (method === "phone" ? 7 : 5);

  return (
    <OnboardingShell
      step={1}
      back="/onboarding/welcome"
      title="Create your account"
      subtitle="Verify with your phone or email. We never post without asking."
      ctaLabel="Continue"
      nextHref="/onboarding/location"
      valid={valid}
      hint={valid ? undefined : `Enter your ${method === "phone" ? "number" : "address"} to continue`}
      note="By continuing you agree to our Terms and Community Guidelines."
    >
      <div className="mb-6 flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
        {(
          [
            { id: "phone", label: "Phone number" },
            { id: "email", label: "Email" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              method === m.id
                ? "bg-volt-400 text-ink-950"
                : "text-ink-300 hover:text-ink-100",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
          {method === "phone" ? "Phone number" : "Email address"}
        </span>
        <span className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3.5 focus-within:border-volt-400">
          {method === "phone" && (
            <span className="shrink-0 text-sm font-semibold text-ink-300">
              🇳🇬 +234
            </span>
          )}
          <input
            type={method === "phone" ? "tel" : "email"}
            inputMode={method === "phone" ? "tel" : "email"}
            autoComplete={method === "phone" ? "tel" : "email"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={method === "phone" ? "803 123 4567" : "you@example.com"}
            className="num w-full min-w-0 bg-transparent text-[15px] text-ink-50 outline-none placeholder:text-ink-600"
          />
        </span>
      </label>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink-700" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          or continue with
        </span>
        <span className="h-px flex-1 bg-ink-700" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={() => undefined}>
          <span aria-hidden>G</span> Google
        </Button>
        <Button variant="secondary" size="lg" onClick={() => undefined}>
          <span aria-hidden></span> Apple
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip size="sm" selected={false} onClick={() => undefined}>
          ✓ Phone verification
        </Chip>
        <Chip size="sm" selected={false} onClick={() => undefined}>
          ✓ Report &amp; block
        </Chip>
        <Chip size="sm" selected={false} onClick={() => undefined}>
          ✓ Privacy controls
        </Chip>
      </div>
    </OnboardingShell>
  );
}
