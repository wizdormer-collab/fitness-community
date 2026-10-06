"use client";

import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, SESSIONS, USERS } from "@/lib/mock-data";
import { sessionById, userById, visibleSpots } from "@/lib/selectors";
import { activityOf, areaLabel } from "@/lib/format";
import { useState } from "react";

export function SessionDetail({ id }: { id: string }) {
  const { isSessionJoined, toggleSession, isCheckedIn, checkIn } =
    usePrototype();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", from: "Ngozi Eze", text: "Rack 3 is reserved for us.", ago: "20m" },
    { id: "m2", from: "Tobi Alabi", text: "Bringing chalk, someone bring a belt.", ago: "12m" },
  ]);

  const s = sessionById(id);
  if (!s) return null;

  const joined = isSessionJoined(s.id);
  const spots = visibleSpots(s, joined);
  const activity = activityOf(s.activity);
  const community = s.communityId
    ? COMMUNITIES.find((c) => c.id === s.communityId)
    : undefined;
  const checkedIn = isCheckedIn(s.id);
  const full = spots >= s.maxSpots;

  const send = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `m${Date.now()}`, from: "You", text, ago: "now" }]);
    setMessage("");
  };

  return (
    <div>
      <ScreenHeader
        title=""
        backHref="/app/sessions"
        backLabel="Sessions"
        right={
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-ink-750 text-3xl ring-1 ring-inset ring-ink-600">
            {activity.emoji}
          </span>
        }
      />

      <div className="mb-5 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={s.cost === 0 ? "ok" : "info"}>
            {s.cost === 0 ? "Free" : `₦${s.cost.toLocaleString()}`}
          </Badge>
          <Badge tone="muted">{s.level}</Badge>
          {community && <Badge tone="volt">{community.emoji} {community.name}</Badge>}
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-50">
          {s.title}
        </h1>
        <p className="num mt-2 text-[15px] text-ink-300">
          {s.dayLabel} · {s.date} · {s.time}
        </p>
        <p className="num mt-1 text-[14px] text-ink-400">
          📍 {s.location} · {areaLabel(s.area)}
        </p>
      </div>

      {/* Capacity + join (PRD §12 spot meter) */}
      <Card className="mb-5 p-5">
        <SpotMeter taken={spots} max={s.maxSpots} />
        <div className="mt-4 flex gap-2.5">
          <Button
            full
            variant={joined ? "secondary" : "primary"}
            disabled={!joined && full}
            onClick={() => toggleSession(s.id)}
          >
            {full && !joined ? "Session full" : joined ? "Leave session" : "Join session"}
          </Button>
          {joined ? (
            <Button variant="primary" href={`/app/checkin?s=${s.id}`}>
              {checkedIn ? "Checked in ✓" : "Check in"}
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Check in
            </Button>
          )}
        </div>
        <p className="num mt-3 text-center text-[12px] text-ink-500">
          {joined
            ? "You're in. We'll remind you 1 hour before."
            : full
              ? "All spots taken — you can join the waitlist from Discover."
              : `${s.maxSpots - spots} ${s.maxSpots - spots === 1 ? "spot" : "spots"} left`}
        </p>
      </Card>

      {/* Organiser */}
      <section className="mb-6">
        <SectionHeader label="Organiser" />
        <Card className="flex items-center gap-3.5 p-4">
          <Avatar
            initials={initials(s.organizerName)}
            tone={2}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-50">
              {s.organizerName}
            </p>
            <p className="truncate text-[12px] text-ink-400">
              Verified organiser · {areaLabel(s.area)}
            </p>
          </div>
          <Chip size="sm" onClick={() => undefined}>
            Message
          </Chip>
        </Card>
      </section>

      {/* About */}
      <section className="mb-6">
        <SectionHeader label="About this session" />
        <Card className="p-4">
          <p className="text-[14px] leading-relaxed text-ink-300">
            {s.description}
          </p>
        </Card>
      </section>

      {/* Attendees */}
      <section className="mb-6">
        <SectionHeader
          label="Who's coming"
          hint={`${s.attendeeIds.length} confirmed`}
          action={{ label: "Invite friends", href: "#" }}
        />
        <Card className="p-4">
          <AvatarStack
            people={s.attendeeIds.map((aid) => {
              const u = userById(aid);
              return { initials: u.initials, tone: u.tone };
            })}
            size="md"
            max={6}
          />
          <div className="mt-4 space-y-2.5">
            {s.attendeeIds.slice(0, 4).map((aid) => {
              const u = userById(aid);
              return (
                <div key={aid} className="flex items-center gap-3">
                  <Avatar initials={u.initials} tone={u.tone} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink-100">
                      {u.name}
                    </p>
                    <p className="truncate text-[11px] text-ink-500">
                      {u.handle} · {u.fitnessLevel}
                    </p>
                  </div>
                </div>
              );
            })}
            {s.attendeeIds.length > 4 && (
              <p className="num pt-1 text-center text-[12px] text-ink-500">
                +{s.attendeeIds.length - 4} more
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Session chat (PRD §12) */}
      <section className="mb-6">
        <SectionHeader label="Session chat" hint="Participants only" />
        <Card className="p-4">
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.from === "You";
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                      mine
                        ? "bg-volt-400 text-ink-950"
                        : "bg-ink-750 text-ink-200"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[11px] font-bold text-ink-400">
                        {m.from}
                      </p>
                    )}
                    <p className="text-[13px] leading-snug">{m.text}</p>
                    <p
                      className={`num mt-1 text-[10px] ${
                        mine ? "text-ink-950/60" : "text-ink-600"
                      }`}
                    >
                      {m.ago}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="mt-4 flex gap-2 border-t border-ink-700 pt-3"
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message the group…"
              className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-2.5 text-sm text-ink-100 outline-none placeholder:text-ink-600 focus:border-volt-400"
            />
            <Button type="submit" size="sm" disabled={!message.trim()}>
              Send
            </Button>
          </form>
        </Card>
      </section>

      {/* Actions */}
      <section>
        <Card className="grid grid-cols-2 gap-2.5 p-4">
          <Button
            variant="secondary"
            onClick={() => checkIn(s.id)}
            disabled={checkedIn}
          >
            {checkedIn ? "Checked in ✓" : "Check in now"}
          </Button>
          <Button variant="secondary" onClick={() => undefined}>
            Add to calendar
          </Button>
          <Button variant="ghost" onClick={() => undefined}>
            Share session
          </Button>
          <Button variant="danger" onClick={() => undefined}>
            Report
          </Button>
        </Card>
      </section>

      <span className="sr-only">{USERS.length} attendees available</span>
      <span className="sr-only">{SESSIONS.length} sessions total</span>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
