import type {
  ActivityId,
  Challenge,
  Community,
  DiscoverItem,
  Session,
  Trainer,
  User,
} from "@/lib/types";
import { DISCOVER_CATEGORIES, type DiscoverCategoryId } from "@/lib/types";
import { activityLabel, areaLabel } from "@/lib/format";
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

// ---------------------------------------------------------------------------
// Discover (PRD §11)
// ---------------------------------------------------------------------------

type DiscoverCategory = Exclude<DiscoverCategoryId, "all">;

/**
 * Where a session is filed when browsing.
 *
 * The categories describe *what kind of thing* you are looking at, and the app
 * has no "sessions" category — so a session lands in the category a browser
 * would check for it. Venues stay in Gyms; instructor-led work goes to Classes;
 * group runs to Run clubs; everything court/pool/road based to Sports. Written
 * as a `Record<ActivityId, …>` so a new activity cannot slip through uncategorised.
 */
const SESSION_CATEGORY: Record<ActivityId, DiscoverCategory> = {
  gym: "classes",
  running: "run-clubs",
  cycling: "sports",
  football: "sports",
  basketball: "sports",
  swimming: "sports",
  padel: "sports",
  tennis: "sports",
  yoga: "classes",
  pilates: "classes",
  "home-workouts": "classes",
  other: "classes",
};

/**
 * One row of Discover, whatever it points at.
 *
 * `search` is a pre-folded haystack so the page can filter three different data
 * shapes with a single `.includes()` instead of re-deriving strings per keystroke.
 */
export type DiscoverResult =
  | {
      kind: "listing";
      id: string;
      category: DiscoverCategory;
      search: string;
      item: DiscoverItem;
      /** Set only on rows derived from TRAINERS, so the sheet can render an
       *  avatar and rating straight off the row instead of a second lookup. */
      trainer?: Trainer;
    }
  | {
      kind: "session";
      id: string;
      category: DiscoverCategory;
      search: string;
      session: Session;
    }
  | {
      kind: "community";
      id: string;
      category: DiscoverCategory;
      search: string;
      community: Community;
      item: DiscoverItem;
    };

const words = (...parts: Array<string | number | undefined>) =>
  parts
    .filter((p) => p !== undefined && p !== "")
    .join(" ")
    .toLowerCase();

const categoryLabel = (id: string) =>
  DISCOVER_CATEGORIES.find((c) => c.id === id)?.label ?? "";

/**
 * Everything Discover can show: the seeded listings, upcoming sessions, and the
 * seeded communities — each kept in its own shape so its card can show real
 * fields rather than a flattened string.
 *
 * Nothing here is duplicated into another collection. Trainers stay in
 * TRAINERS, communities stay in COMMUNITIES: mapping at read time is what keeps
 * one home for every name, member count and rating. (Before this, the Trainers
 * category shipped with zero rows, which made the filter and the trainer sheet
 * both dead ends.)
 */
export function buildDiscoverResults(): DiscoverResult[] {
  const results: DiscoverResult[] = [];

  for (const item of DISCOVER_ITEMS) {
    // The three seeded communities resolve to their full record so the card can
    // show a member count and tagline instead of a pre-stringified meta line.
    const community =
      item.category === "communities"
        ? COMMUNITIES.find((c) => c.name === item.title)
        : undefined;

    if (community) {
      results.push({
        kind: "community",
        id: item.id,
        category: "communities",
        community,
        item,
        search: words(
          community.name,
          community.tagline,
          community.description,
          community.cadence,
          activityLabel(community.activity),
          areaLabel(community.area),
          item.badge,
          categoryLabel("communities"),
        ),
      });
      continue;
    }

    results.push({
      kind: "listing",
      id: item.id,
      category: item.category,
      item,
      search: words(
        item.title,
        item.meta,
        item.badge,
        areaLabel(item.area),
        categoryLabel(item.category),
        item.sheet?.profession,
        item.sheet?.speciality,
      ),
    });
  }

  for (const session of upcoming()) {
    const category = SESSION_CATEGORY[session.activity];
    results.push({
      kind: "session",
      id: session.id,
      category,
      session,
      search: words(
        session.title,
        activityLabel(session.activity),
        session.dayLabel,
        session.time,
        session.location,
        areaLabel(session.area),
        session.organizerName,
        session.description,
        categoryLabel(category),
      ),
    });
  }

  // Trainers are mapped, not seeded twice — see the note above.
  for (const trainer of TRAINERS) {
    results.push({
      kind: "listing",
      id: trainer.id,
      category: "trainers",
      search: words(
        trainer.name,
        trainer.profession,
        trainer.speciality,
        trainer.availability,
        areaLabel(trainer.area),
        categoryLabel("trainers"),
      ),
      item: {
        id: trainer.id,
        category: "trainers",
        title: trainer.name,
        emoji:
          DISCOVER_CATEGORIES.find((c) => c.id === "trainers")?.emoji ?? "",
        area: trainer.area,
        // No address to measure from, so distance stays 0 and the card hides
        // the "km away" segment rather than rendering "0 km away".
        distanceKm: 0,
        meta: `${trainer.profession} · ${trainer.speciality}`,
        rating: trainer.rating,
        verified: trainer.verified,
        sheet: {
          profession: trainer.profession,
          speciality: trainer.speciality,
          fromPrice: trainer.fromPrice,
          availability: trainer.availability,
          reviewCount: trainer.reviewCount,
        },
      },
      trainer,
    });
  }

  return results;
}

/**
 * The seed's own highlight signal — a row only carries a badge because the data
 * says it is popular, verified, filling up or beginner-friendly. No ranking is
 * invented on top of it.
 */
export function discoverFeatured(results: DiscoverResult[]): DiscoverResult[] {
  return results.filter((r) => r.kind !== "session" && r.item.badge).slice(0, 3);
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
