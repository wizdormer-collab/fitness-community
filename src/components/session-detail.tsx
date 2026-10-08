"use client";

import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button, Chip } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { Photo } from "@/components/ui/photo";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES, SESSIONS, USERS } from "@/lib/mock-data";
import { sessionById, userById, visibleSpots } from "@/lib/selectors";
import { areaLabel } from "@/lib/format";
import { Glyph } from "@/components/ui/glyph";
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
      />

      <div className="relative animate-fade-up overflow-hidden rounded-2xl">
        <Photo
          name="session"
          alt="People training together in a gym"
          ratio="aspect-[16/9]"
          sizes="(max-width: 440px) 100vw, 440px"
          priority
          scrim
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-ink-50">
            <Glyph name={s.activity} size={22} />
          </span>
          <h1 className="font-display text-xl font-extrabold leading-tight tracking-tight text-white">
            {s.title}
          </h1>
          <p className="num mt-1 text-[13px] text-white/75">
            {s.dayLabel} · {s.date} · {s.time}
          </p>
        </div>
      </div>

      <div className="mt-4 mb-5 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={s.cost === 0 ? "ok" : "info"}>
            {s.cost === 0 ? "Free" : `₦${s.cost.toLocaleString()}`}
          </Badge>
          <Badge tone="muted">{s.level}</Badge>
          {community && (
            <Badge tone="volt">
              <Glyph name={community.activity} size={12} strokeWidth={2.2} />
              {community.name}
            </Badge>
          )}
        </div>
        <p className="num mt-3 flex items-center gap-1.5 text-[14px] text-ink-400">
          <Glyph name="pin" size={13} strokeWidth={2} />
          {s.location} · {areaLabel(s.area)}
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
              {checkedIn ? "Checked in" : "Check in"}
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
      <section className="mb-7 border-b border-ink-700 pb-6">
        <SectionHeader label="Organiser" />
        <div className="flex items-center gap-3.5">
          <Avatar initials={initials(s.organizerName)} tone={2} size="md" />
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
        </div>
      </section>

      {/* About */}
      <section className="mb-7 border-b border-ink-700 pb-6">
        <SectionHeader label="About this session" />
        <p className="text-[14px] leading-relaxed text-ink-300">
          {s.description}
        </p>
      </section>

      {/* Attendees */}
      <section className="mb-7 border-b border-ink-700 pb-6">
        <SectionHeader
          label="Who's coming"
          hint={`${s.attendeeIds.length} confirmed`}
          action={{ label: "Invite friends", href: "#" }}
        />
        <AvatarStack
          people={s.attendeeIds.map((aid) => {
            const u = userById(aid);
            return { initials: u.initials, tone: u.tone };
          })}
          size="md"
          max={6}
        />
        <div className="mt-4">
          {s.attendeeIds.slice(0, 4).map((aid) => {
            const u = userById(aid);
            return (
              <div
                key={aid}
                className="flex items-center gap-3 border-b border-ink-700 py-2.5 last:border-0"
              >
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
            <p className="num pt-2 text-center text-[12px] text-ink-500">
              +{s.attendeeIds.length - 4} more
            </p>
          )}
        </div>
      </section>

      {/* Session chat (PRD §12) */}
      <section className="mt-7">
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
                        ? "bg-volt-400 text-onvolt"
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
                      className={`num mt-1 text-[11px] ${
                        mine ? "text-onvolt/60" : "text-ink-600"
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
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="secondary"
            onClick={() => checkIn(s.id)}
            disabled={checkedIn}
          >
            {checkedIn ? "Checked in" : "Check in now"}
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
        </div>
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
