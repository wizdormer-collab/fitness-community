"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

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

export function AppNav({ logHref = "/app/log" }: { logHref?: string }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_-12px_rgba(11,13,15,0.3)]">
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
        className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-volt-400 text-onvolt ring-4 ring-white shadow-[0_10px_24px_-8px_rgba(11,13,15,0.4)] transition active:scale-95 hover:bg-volt-500"
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
