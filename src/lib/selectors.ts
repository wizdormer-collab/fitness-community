import type { Challenge, Community, DiscoverItem, Session, Trainer, User } from "@/lib/types";
import { DISCOVER_CATEGORIES } from "@/lib/types";
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
  return discoverItems().find((d) => d.id === id);
}

/**
 * The complete Discover listing: the seeded rows plus trainers.
 *
 * Trainers are deliberately NOT duplicated into DISCOVER_ITEMS — they already
 * exist in TRAINERS with their own detail shape, and copying them across would
 * give the name, area and rating two homes to drift apart. Mapping them at read
 * time is what makes the "Trainers" category and the trainer bottom sheet both
 * resolve; the category shipped with zero rows, so both were dead ends.
 */
export function discoverItems(): DiscoverItem[] {
  const trainerGlyph =
    DISCOVER_CATEGORIES.find((c) => c.id === "trainers")?.emoji ?? "";

  const trainers: DiscoverItem[] = TRAINERS.map((t) => ({
    id: t.id,
    category: "trainers",
    title: t.name,
    emoji: trainerGlyph,
    area: t.area,
    // Trainers have no address to measure from, so distance stays 0 and the
    // listing hides the "km away" segment rather than rendering "0 km away".
    distanceKm: 0,
    meta: `${t.profession} · ${t.speciality}`,
    rating: t.rating,
    verified: t.verified,
    sheet: {
      profession: t.profession,
      speciality: t.speciality,
      fromPrice: t.fromPrice,
      availability: t.availability,
      reviewCount: t.reviewCount,
    },
  }));

  return [...DISCOVER_ITEMS, ...trainers];
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
