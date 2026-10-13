"use client";

import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/controls";
import { ScreenHeader } from "@/components/ui/header";
import { SpotMeter } from "@/components/ui/metrics";
import { Photo } from "@/components/ui/photo";
import { usePrototype } from "@/lib/prototype-state";
import { COMMUNITIES } from "@/lib/mock-data";
import { sessionById, userById, visibleSpots } from "@/lib/selectors";
import { activityLabel, areaLabel, levelLabel, plural } from "@/lib/format";
import { Glyph } from "@/components/ui/glyph";
import { useState } from "react";

export function SessionDetail({ id }: { id: string }) {
  const { isSessionJoined, toggleSession, isCheckedIn, state } = usePrototype();
  const [message, setMessage] = useState("");
  const [inviteLabel, setInviteLabel] = useState("Invite friends");
  const [messages, setMessages] = useState([
    { id: "m1", from: "Ngozi Eze", text: "Rack 3 is reserved for us.", ago: "20m" },
    { id: "m2", from: "Tobi Alabi", text: "Bringing chalk, someone bring a belt.", ago: "12m" },
  ]);

  const s = sessionById(id);
  if (!s) return null;

  const joined = isSessionJoined(s.id);
  const spots = visibleSpots(s, joined);
  // Joining moves capacity by one; the attendee count takes the same delta so
  // the two can never disagree — the person who just joined is confirmed, but
  // the seed's attendee list has no room to append them.
  const going = s.attendeeIds.length + (spots - s.spotsTaken);
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

  /**
   * "Invite friends" used to be an href="#" placeholder. Share sheet where the
   * platform has one, clipboard otherwise, and the label itself carries the
   * confirmation — no toast system to reach for.
   */
  const invite = async () => {
    const flash = (label: string) => {
      setInviteLabel(label);
      window.setTimeout(() => setInviteLabel("Invite friends"), 1800);
    };

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return; // sheet dismissed
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link copied");
    } catch {
      flash("Couldn't copy");
    }
  };

  // Derived straight from the store, so the line is the actual outcome of the
  // last action rather than a scripted success message. `aria-live` below means
  // a screen reader hears it change too.
  const statusLine = checkedIn
    ? `Checked in — ${state.streak} ${plural(state.streak, "day")} on your streak.`
    : joined
      ? "You're in. We'll remind you 1 hour before."
      : full
        ? "All spots taken — you can join the waitlist from Discover."
        : `${s.maxSpots - spots} ${plural(s.maxSpots - spots, "spot")} left`;

  return (
    <div className="lg:max-w-4xl">
      <ScreenHeader
        title=""
        backHref="/app/sessions"
        backLabel="Sessions"
      />

      <div className="relative animate-fade-up overflow-hidden rounded-2xl">
        <Photo
          name="session"
          alt="People training together in a gym"
          ratio="aspect-[16/9] lg:aspect-[21/9]"
          sizes="(max-width: 440px) 100vw, 896px"
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
          <Badge tone="muted">{levelLabel(s.level)}</Badge>
          <Badge tone="info">{activityLabel(s.activity)}</Badge>
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

      {/* Desktop puts the booking panel beside the content instead of leaving a
          1000px column; on mobile it stays directly under the hero, where the
          join action belongs. Aside first in the DOM for that reason, ordered
          to the right column at `lg`. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
        <aside className="mb-7 lg:order-2 lg:mb-0 lg:sticky lg:top-8">
          {/* Capacity + join (PRD §12 spot meter). Exactly one primary action
              per state: join to commit, check in once you're committed. */}
          <Card className="p-5">
            <SpotMeter taken={spots} max={s.maxSpots} />
            <div className="mt-4 space-y-2.5">
              <Button
                full
                variant={joined ? "secondary" : "primary"}
                disabled={!joined && full}
                onClick={() => toggleSession(s.id)}
              >
                {full && !joined
                  ? "Session full"
                  : joined
                    ? "Leave session"
                    : "Join session"}
              </Button>
              {/* Check-in stays gated on membership — the venue flow at
                  /app/checkin owns the actual verification and feedback. */}
              {joined ? (
                <Button
                  full
                  variant={checkedIn ? "secondary" : "primary"}
                  href={`/app/checkin?s=${s.id}`}
                >
                  {checkedIn ? "Checked in" : "Check in"}
                </Button>
              ) : (
                <Button full variant="secondary" disabled>
                  Check in
                </Button>
              )}
            </div>
            <p
              className="num mt-3 text-center text-[12px] text-ink-500"
              aria-live="polite"
            >
              {statusLine}
            </p>
          </Card>

          {/* Organiser */}
          <section className="mt-6 border-b border-ink-700 pb-6 lg:mt-6">
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
            </div>
          </section>
        </aside>

        <div className="min-w-0 lg:order-1">
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
              hint={`${going} confirmed`}
              action={{ label: inviteLabel, onClick: invite }}
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
                        {u.handle} · {levelLabel(u.fitnessLevel)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {going > 4 && (
                <p className="num pt-2 text-center text-[12px] text-ink-500">
                  +{going - 4} more
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
        </div>
      </div>
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
