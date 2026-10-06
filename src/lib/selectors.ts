import type { Challenge, Community, DiscoverItem, Session, Trainer, User } from "@/lib/types";
import {
  CHALLENGES,
  COMMUNITIES,
  DISCOVER_ITEMS,
  SESSIONS,
  TRAINERS,
  USERS,
} from "@/lib/mock-data";

/** Lookup helpers — keep component code free of array plumbing. */

export function userById(id: string): User {
  return USERS.find((u) => u.id === id) ?? USERS[0]!;
}

export function communityById(id: string): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}

export function sessionById(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

export function challengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function discoverById(id: string): DiscoverItem | undefined {
  return DISCOVER_ITEMS.find((d) => d.id === id);
}

export function trainerById(id: string): Trainer | undefined {
  return TRAINERS.find((t) => t.id === id);
}

/**
 * Session capacity after a join/leave toggle.
 * Mock `spotsTaken` already reflects the seed `joined` flag, so switching
 * state moves the meter by exactly one — which is what makes the join
 * interaction visibly do something.
 */
export function visibleSpots(session: Session, joined: boolean): number {
  if (session.joined === joined) return session.spotsTaken;
  return Math.max(0, Math.min(session.maxSpots, session.spotsTaken + (joined ? 1 : -1)));
}

export function upcoming(limit?: number): Session[] {
  const list = SESSIONS.filter((s) => s.status === "upcoming");
  return limit ? list.slice(0, limit) : list;
}
