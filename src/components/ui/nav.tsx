"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/avatar";
import { usePrototype } from "@/lib/prototype-state";
import { ME, NOTIFICATIONS } from "@/lib/mock-data";
import { areaLabel } from "@/lib/format";

const ICONS = {
  home: (
    <path
      d="M3 10.8 12 3.5l9 7.3V20a1 1 0 0 1-1 1h-5.5v-6.2h-5V21H4a1 1 0 0 1-1-1z"
      strokeLinejoin="round"
    />
  ),
  discover: (
    <>
      <circle cx="11" cy="11" r="7.2" />
      <path d="m20 20-3.6-3.6" strokeLinecap="round" />
    </>
  ),
  sessions: (
    <>
      <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
      <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" strokeLinecap="round" />
    </>
  ),
  progress: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path
        d="M4.5 20.5c.9-3.7 3.9-5.8 7.5-5.8s6.6 2.1 7.5 5.8"
        strokeLinecap="round"
      />
    </>
  ),
} as const;

const TABS: {
  href: string;
  label: string;
  key: keyof typeof ICONS;
  exact?: boolean;
}[] = [
  { href: "/app", label: "Home", key: "home", exact: true },
  { href: "/app/discover", label: "Discover", key: "discover" },
  { href: "/app/sessions", label: "Sessions", key: "sessions" },
  { href: "/app/progress", label: "Progress", key: "progress" },
  { href: "/app/profile", label: "Profile", key: "profile" },
];

/**
 * Desktop sidebar — replaces the bottom tab bar at lg and up. Same tabs, same
 * active logic, but laid out as a left rail with the brand and the Log action
 * promoted to the top so the phone's floating button has a desktop home.
 *
 * The rail is a navy surface (#101F2D) rather than a light panel: it reads as
 * a deliberate structural edge against the cream canvas, and it lets the
 * selected destination carry a solid lime fill — 12.6:1 with navy text, so the
 * current location is unmistakable instead of being a pale tint.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = usePrototype();
  const navItem = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
      active
        ? "bg-volt-400 text-onvolt volt-glow"
        : "text-onnavy-dim hover:bg-navy-100 hover:text-onnavy",
    );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-navy-line bg-navy-50 px-4 py-6 lg:flex xl:w-[264px]">
      <Link href="/app" className="flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-volt-400 text-onvolt">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M13.2 2.4L4.8 13.6h5.6L9.4 21.6l8.8-11.6h-5.6z" />
          </svg>
        </span>
        <span className="font-display text-[15px] font-extrabold tracking-tight text-onnavy">
          Show Up
        </span>
      </Link>

      <Button size="sm" href="/app/log" className="mt-6 w-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        Log workout
      </Button>

      <nav className="mt-7 flex flex-col gap-1" aria-label="Main">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={navItem(active)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={active ? 2.1 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {ICONS[tab.key]}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* The rail's foot carries what the phone header used to say: where you
          are training. Notifications moved up to the top bar — one bell, not
          two — and the tab bar has no room for it. */}
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <div className="rounded-xl border border-navy-line bg-navy-100 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-onnavy-mute">
            Your area
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-onnavy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-volt-400" aria-hidden>
              <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            {areaLabel(profile.area)} · Lagos
          </p>
        </div>

        <p className="px-1 text-[11px] leading-relaxed text-onnavy-mute">
          Prototype data · Lagos MVP · v0.1
        </p>
      </div>
    </aside>
  );
}

/**
 * Desktop top bar — sticky above the content column at lg and up. It holds the
 * three account-level controls the phone spreads across pages: search (which
 * lives on Discover), notifications, and the profile avatar. The left slot is
 * the section name, which stays put while a long page scrolls under it.
 *
 * Hidden below lg, where ScreenHeader plus the bottom tab bar already do this
 * job — so there is exactly one set of these controls at any width.
 */
export function AppTopBar() {
  const pathname = usePathname();
  const { isNotificationRead } = usePrototype();
  const unread = NOTIFICATIONS.filter((n) => !n.read && !isNotificationRead(n.id)).length;
  const current = TABS.find((t) =>
    t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/"),
  );

  const iconBtn =
    "inline-flex h-9 items-center justify-center rounded-xl border border-ink-700 bg-ink-900 text-ink-300 transition hover:bg-ink-750 hover:text-ink-100";

  return (
    <div className="sticky top-0 z-30 hidden border-b border-ink-700 bg-ink-950/85 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-10 xl:px-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
          {current?.label ?? "Show Up"}
        </p>

        <div className="flex items-center gap-2">
          <Link
            href="/app/discover"
            className={cn(iconBtn, "gap-2 px-3 text-[13px] font-semibold")}
            title="Search sessions, trainers and communities"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7.2" />
              <path d="m20 20-3.6-3.6" />
            </svg>
            Search
          </Link>

          <Link
            href="/app/notifications"
            aria-current={pathname === "/app/notifications" ? "page" : undefined}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            title="Notifications"
            /* One full class set per branch: `cn` is a plain join here, so a
               second `bg-*` would not reliably win — it would come down to
               Tailwind's emit order rather than intent. */
            className={
              pathname === "/app/notifications"
                ? "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-volt-400 bg-volt-400 text-onvolt transition"
                : iconBtn
            }
          >
            <span className="relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 8.5a6 6 0 1 0-12 0c0 5.2-2 7-2 7h16s-2-1.8-2-7" />
                <path d="M13.7 19.2a2 2 0 0 1-3.4 0" />
              </svg>
              {unread > 0 && (
                <span className="num absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-volt-400 px-1 text-[10px] font-bold text-onvolt ring-2 ring-ink-950">
                  {unread}
                </span>
              )}
            </span>
          </Link>

          <Link
            href="/app/profile"
            aria-current={pathname === "/app/profile" ? "page" : undefined}
            aria-label="Profile"
            title="Profile"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-80",
              pathname === "/app/profile" && "ring-2 ring-volt-400",
            )}
          >
            <Avatar initials={ME.initials} tone={ME.tone} size="sm" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AppNav({ logHref = "/app/log" }: { logHref?: string }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_-12px_rgba(16,31,45,0.3)] lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1.5 py-2.5 transition",
                active ? "text-ink-50" : "text-ink-500 hover:text-ink-300",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-9 items-center justify-center rounded-full transition-colors",
                  active && "bg-volt-400",
                )}
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.1 : 1.7}
                  aria-hidden
                >
                  {ICONS[tab.key]}
                </svg>
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold tracking-wide",
                  active && "font-bold",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Floating log action — keeps TRAIN → TRACK one tap away. */}
      <Link
        href={logHref}
        aria-label="Log a workout"
        className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-volt-400 text-onvolt ring-4 ring-white shadow-[0_10px_24px_-8px_rgba(16,31,45,0.4)] transition active:scale-95 hover:bg-volt-500"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </nav>
  );
}
