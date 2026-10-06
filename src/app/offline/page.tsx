import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/controls";

export const metadata = {
  title: "Offline — Show Up",
  robots: { index: false },
};

export default function Offline() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center">
      <span className="text-5xl" aria-hidden>
        📡
      </span>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-50">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-ink-400">
        Show Up works with a signal for live sessions. Saved workouts and your
        progress are still on this device.
      </p>

      <Card className="mt-6 w-full max-w-[320px] divide-y divide-ink-700 p-0 text-left">
        {[
          ["Progress", "Your streak, records and history", "/app/progress"],
          ["Log a workout", "Manual entry works offline", "/app/log"],
          ["Profile", "Your goals and communities", "/app/profile"],
        ].map(([title, sub, href]) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-100">{title}</span>
              <span className="block text-[11px] text-ink-500">{sub}</span>
            </span>
            <span className="text-ink-600">›</span>
          </Link>
        ))}
      </Card>

      <div className="mt-6 w-full max-w-[320px]">
        <Button full size="lg" href="/">
          Try again
        </Button>
      </div>
    </div>
  );
}
