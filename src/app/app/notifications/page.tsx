"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Badge, SectionHeader } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/header";
import { SegmentedControl } from "@/components/ui/controls";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/cn";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { NOTIFICATION_KINDS, type NotificationKind } from "@/lib/types";
import { usePrototype } from "@/lib/prototype-state";

type Filter = "all" | "unread" | NotificationKind;

export default function Notifications() {
  const { isNotificationRead, markAllNotificationsRead } = usePrototype();
  const [filter, setFilter] = useState<Filter>("all");

  const withRead = useMemo(
    () =>
      NOTIFICATIONS.map((n) => ({ ...n, isRead: isNotificationRead(n.id) })),
    [isNotificationRead],
  );

  const unreadCount = withRead.filter((n) => !n.isRead).length;

  const filtered = withRead.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.kind === filter;
  });

  const today = filtered.slice(0, 3);
  const earlier = filtered.slice(3);

  return (
    <div>
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread · nudges, not spam`
            : "You're all caught up"
        }
        backHref="/app"
        backLabel="Home"
        right={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="rounded-lg border border-ink-600 px-2.5 py-1.5 text-[11px] font-semibold text-ink-200 transition hover:border-volt-400 hover:text-volt-400"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      <SegmentedControl<Filter>
        className="mb-5"
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All" },
          { id: "unread", label: unreadCount > 0 ? `Unread ${unreadCount}` : "Unread" },
          { id: "social", label: "Social" },
          { id: "event", label: "Events" },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔕"
          title="Nothing here yet"
          body="Nudges appear when a session you joined is about to start, someone interacts with your workout, or your weekly goal is close."
          action={
            <Link
              href="/app/sessions"
              className="text-sm font-semibold text-volt-400"
            >
              Browse sessions →
            </Link>
          }
        />
      ) : (
        <>
          {today.length > 0 && (
            <section className="mb-6">
              <SectionHeader label="Recent" hint="Last few hours" />
              <Card className="divide-y divide-ink-700 p-0">
                {today.map((n) => (
                  <Row key={n.id} n={n} />
                ))}
              </Card>
            </section>
          )}

          {earlier.length > 0 && (
            <section className="mb-6">
              <SectionHeader label="Earlier" />
              <Card className="divide-y divide-ink-700 p-0">
                {earlier.map((n) => (
                  <Row key={n.id} n={n} />
                ))}
              </Card>
            </section>
          )}
        </>
      )}

      <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-850/60 p-4">
        <p className="text-[13px] leading-relaxed text-ink-400">
          <span className="font-semibold text-ink-200">Notification rules</span>{" "}
          are deliberately narrow in v1: session reminders, accountability
          nudges and replies on your posts. Marketing pushes are opt-in and
          off by default.
        </p>
      </div>
    </div>
  );
}

function Row({
  n,
}: {
  n: (typeof NOTIFICATIONS)[number] & { isRead: boolean };
}) {
  const kind = NOTIFICATION_KINDS[n.kind];
  const body = (
    <div
      className={cn(
        "flex items-start gap-3.5 px-4 py-3.5 transition",
        !n.isRead && "bg-volt-400/[0.045]",
      )}
    >
      <span
        className={cn(
          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
          n.isRead ? "bg-ink-750" : "bg-ink-700 ring-1 ring-volt-400/30",
        )}
      >
        <span aria-hidden>{kind.emoji}</span>
        {!n.isRead && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-volt-400 ring-2 ring-ink-800" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-sm leading-snug",
              n.isRead ? "text-ink-300" : "font-semibold text-ink-50",
            )}
          >
            {n.text}
          </p>
          <span className="num shrink-0 text-[11px] text-ink-500">{n.ago}</span>
        </div>
        {n.sub && (
          <p className="mt-1 text-xs leading-relaxed text-ink-500">{n.sub}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Badge tone={n.isRead ? "muted" : "volt"}>{kind.label}</Badge>
          {!n.isRead && <span className="text-[11px] font-bold text-volt-400">New</span>}
        </div>
      </div>
    </div>
  );

  return n.href ? (
    <Link href={n.href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
