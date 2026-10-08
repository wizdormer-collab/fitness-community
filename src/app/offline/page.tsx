import { List, ListRow } from "@/components/ui/card";
import { Button } from "@/components/ui/controls";
import { Glyph } from "@/components/ui/glyph";
import { Photo } from "@/components/ui/photo";

export const metadata = {
  title: "Offline — Show Up",
  robots: { index: false },
};

export default function Offline() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center">
      <div className="w-full max-w-[320px] overflow-hidden rounded-2xl">
        <Photo
          name="empty"
          alt="An empty gym floor in low light"
          ratio="aspect-[16/9]"
          sizes="320px"
        />
      </div>

      <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-50">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-500">
        Show Up works with a signal for live sessions. Saved workouts and your
        progress are still on this device.
      </p>

      <List variant="surface" className="mt-6 w-full max-w-[320px] text-left">
        {[
          ["Progress", "Your streak, records and history", "/app/progress", "trophy"],
          ["Log a workout", "Manual entry works offline", "/app/log", "check"],
          ["Profile", "Your goals and communities", "/app/profile", "communities"],
        ].map(([title, sub, href, icon]) => (
          <ListRow key={href} href={href}>
            <span className="flex items-center gap-3">
              <Glyph name={icon as "trophy"} size={18} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-100">
                  {title}
                </span>
                <span className="block text-[11px] text-ink-500">{sub}</span>
              </span>
              <span className="text-ink-500">›</span>
            </span>
          </ListRow>
        ))}
      </List>

      <div className="mt-6 w-full max-w-[320px]">
        <Button full size="lg" href="/">
          Try again
        </Button>
      </div>
    </div>
  );
}
