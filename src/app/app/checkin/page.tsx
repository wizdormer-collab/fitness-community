"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, Chip } from "@/components/ui/controls";
import { Card, SectionHeader } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { QRFrame } from "@/components/ui/qr";
import { StreakFlame } from "@/components/ui/metrics";
import { cn } from "@/lib/cn";
import { usePrototype } from "@/lib/prototype-state";
import { SESSIONS } from "@/lib/mock-data";
import { CHECKIN_VENUES } from "@/lib/venues";
import { activityOf, areaLabel } from "@/lib/format";

type Phase = "idle" | "scanning" | "done";

const noopSubscribe = () => () => {};

export default function CheckIn() {
  const { isSessionJoined, isCheckedIn, checkIn, state } = usePrototype();
  const [phase, setPhase] = useState<Phase>("idle");
  const [manual, setManual] = useState("");

  // Resolve ?s= without useSearchParams so the page needs no Suspense boundary.
  const search = useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => "",
  );

  const session = useMemo(() => {
    const qs = new URLSearchParams(search).get("s");
    return (
      (qs ? SESSIONS.find((s) => s.id === qs) : undefined) ??
      SESSIONS.find((s) => isSessionJoined(s.id)) ??
      SESSIONS[0]
    );
  }, [search, isSessionJoined]);

  const venue = CHECKIN_VENUES.find((v) => v.name === session?.location);
  const alreadyCheckedIn = session ? isCheckedIn(session.id) : false;
  const done = phase === "done" || alreadyCheckedIn;

  const startScan = () => {
    if (!session) return;
    setPhase("scanning");
    window.setTimeout(() => {
      checkIn(session.id);
      setPhase("done");
    }, 1900);
  };

  const manualCheckIn = () => {
    if (!session || manual.trim().length < 4) return;
    checkIn(session.id);
    setPhase("done");
  };

  return (
    <div>
      <ScreenHeader
        title="Check in"
        subtitle="Scan the venue code to log your attendance."
        backHref="/app/sessions"
        backLabel="Sessions"
      />

      {/* QR scanner (PRD §13 — QR prioritised for MVP) */}
      <Card className="mb-6 flex flex-col items-center gap-5 p-6">
        <div className="relative">
          <QRFrame scanning={phase === "scanning"} size={220} />
          {phase === "scanning" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg bg-ink-950/85 px-3 py-1.5 text-xs font-semibold text-volt-400">
                Scanning…
              </span>
            </span>
          )}
        </div>

        {done ? (
          <div className="w-full text-center animate-pop">
            <p className="text-3xl" aria-hidden>
              ✅
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold text-ink-50">
              Checked in
            </h2>
            <p className="num mt-1 text-[13px] text-ink-400">
              {session?.location} · {session?.time}
            </p>
            <div className="mt-4 flex justify-center">
              <StreakFlame days={state.streak} />
            </div>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-sm font-semibold text-ink-100">
              {venue?.name ?? "Venue check-in"}
            </p>
            <p className="num mt-1 text-[12px] text-ink-400">
              {session
                ? `${activityOf(session.activity).label} · ${areaLabel(session.area)}`
                : "Select a session"}
            </p>
            <div className="mt-4">
              <Button full size="lg" onClick={startScan} disabled={phase === "scanning"}>
                {phase === "scanning" ? "Scanning…" : "Scan QR code"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Manual fallback */}
      {!done && (
        <section className="mb-6">
          <SectionHeader label="Can't scan?" hint="Enter the venue code" />
          <div className="flex gap-2.5">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value.toUpperCase())}
              placeholder="e.g. LEK-4471"
              className="num min-w-0 flex-1 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-sm tracking-wider text-ink-100 outline-none placeholder:tracking-normal placeholder:text-ink-600 focus:border-volt-400"
            />
            <Button
              onClick={manualCheckIn}
              disabled={manual.trim().length < 4}
            >
              Check in
            </Button>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-ink-500">
            Venue codes are printed at the front desk and rotate daily. GPS
            verification is not in v1 — it needs per-gym geofencing.
          </p>
        </section>
      )}

      {/* Recent check-ins */}
      <section className="mb-6">
        <SectionHeader label="Recent check-ins" />
        <Card className="divide-y divide-ink-700 p-0">
          {CHECKIN_VENUES.map((v) => {
            const used = state.checkedIn.length > 0 && v.recent;
            return (
              <div
                key={v.name}
                className="flex items-center gap-3.5 px-4 py-3.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-750 text-xl">
                  {v.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-100">
                    {v.name}
                  </p>
                  <p className="num truncate text-[11px] text-ink-500">
                    {v.code} · {v.method}
                  </p>
                </div>
                <Badgeish on={used} />
              </div>
            );
          })}
        </Card>
      </section>

      {/* What check-in does */}
      <section>
        <Card className="border-ink-700 bg-ink-850 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
            What checking in does
          </p>
          <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink-400">
            <li>· Records attendance against the session</li>
            <li>· Extends your consistency streak</li>
            <li>· Counts toward weekly and monthly goals</li>
            <li>· Shows your community that you showed up</li>
          </ul>
        </Card>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Chip size="sm" href="/app/log">
          Log the workout →
        </Chip>
        <Chip size="sm" href="/app/progress">
          See progress
        </Chip>
      </div>
    </div>
  );
}

function Badgeish({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        on ? "bg-ok-500/15 text-ok-400" : "bg-ink-750 text-ink-500",
      )}
    >
      {on ? "Checked in" : "Available"}
    </span>
  );
}
