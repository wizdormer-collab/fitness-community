import type {
  ActivityId,
  Challenge,
  Community,
  DiscoverItem,
  ProgressSnapshot,
  Session,
  Trainer,
  User,
  Workout,
} from "@/lib/types";
import { DISCOVER_CATEGORIES, type DiscoverCategoryId } from "@/lib/types";
import { activityLabel, areaLabel } from "@/lib/format";
import {
  CHALLENGES,
  COMMUNITIES,
  DISCOVER_ITEMS,
  PROGRESS,
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

// ---------------------------------------------------------------------------
// Real PR tracking
//
// A personal record is a comparison, not a threshold: a logged set counts as
// a PR only when it beats the best weight already recorded for that exercise
// — the seed record table plus every lift logged since, walked oldest first.
// An exercise with no recorded history sets a silent baseline on its first
// logged lift and can only PR from the second one onward, so nothing is ever
// claimed against an empty history. (The rule this replaced flagged any
// strength set >= 55 kg, so the same 60 kg bench earned "NEW PR" twice.)
// ---------------------------------------------------------------------------

/** Trim, collapse inner whitespace, case-fold — exercise-name identity. */
export function normalizeExercise(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Best weight (kg) on record for an exercise, or null when it has no history. */
export function baselineFor(
  exercise: string,
  extraWorkouts: Workout[],
): number | null {
  const name = normalizeExercise(exercise);
  if (!name) return null;
  let best: number | null = null;
  for (const r of PROGRESS.records) {
    if (r.unit !== "kg" || normalizeExercise(r.exercise) !== name) continue;
    const to = Number(r.to);
    if (Number.isFinite(to)) best = best === null ? to : Math.max(best, to);
  }
  for (const w of extraWorkouts) {
    for (const s of w.strength ?? []) {
      if (normalizeExercise(s.exercise) !== name) continue;
      best = best === null ? s.weightKg : Math.max(best, s.weightKg);
    }
  }
  return best;
}

export interface RecordEvent {
  exercise: string;
  from: number;
  to: number;
}

/**
 * Which rows of a pending workout beat their baseline. Walks the rows in
 * order and advances the baseline as it goes, so duplicate rows inside one
 * workout each have to beat the previous one — never the same number twice.
 */
export function recordEvents(
  rows: { exercise: string; weightKg: number }[],
  extraWorkouts: Workout[],
): RecordEvent[] {
  const events: RecordEvent[] = [];
  const seen = new Map<string, number>();
  for (const r of rows) {
    const name = normalizeExercise(r.exercise);
    if (!name) continue;
    const base = seen.get(name) ?? baselineFor(r.exercise, extraWorkouts);
    if (base === null) {
      seen.set(name, r.weightKg); // silent first baseline
      continue;
    }
    if (r.weightKg > base) {
      events.push({ exercise: r.exercise.trim(), from: base, to: r.weightKg });
      seen.set(name, r.weightKg);
    }
  }
  return events;
}

/**
 * The record table Progress renders: the seed rows, with each beaten
 * exercise replaced in place by its latest improvement (never duplicated),
 * plus rows for exercises that only exist in the live log. Same rules as
 * `recordEvents`; `extraWorkouts` is newest-first, so the walk reverses it.
 */
export function deriveRecordRows(
  extraWorkouts: Workout[],
): ProgressSnapshot["records"] {
  const baseline = new Map<string, number>();
  const seeded = new Map<string, string>(); // normalized name -> seed row id (kg rows)
  for (const r of PROGRESS.records) {
    if (r.unit !== "kg") continue;
    const name = normalizeExercise(r.exercise);
    const to = Number(r.to);
    if (!name || !Number.isFinite(to)) continue;
    baseline.set(name, Math.max(baseline.get(name) ?? -Infinity, to));
    seeded.set(name, r.id);
  }

  const latest = new Map<string, RecordEvent>();
  for (const w of [...extraWorkouts].reverse()) {
    for (const s of w.strength ?? []) {
      const name = normalizeExercise(s.exercise);
      if (!name) continue;
      const base = baseline.get(name) ?? null;
      if (base === null) {
        baseline.set(name, s.weightKg); // silent first baseline
        continue;
      }
      if (s.weightKg > base) {
        latest.set(name, {
          exercise: s.exercise.trim(),
          from: base,
          to: s.weightKg,
        });
        baseline.set(name, s.weightKg);
      }
    }
  }

  const rows: ProgressSnapshot["records"] = PROGRESS.records.map((r) => {
    const name = normalizeExercise(r.exercise);
    const ev = name ? latest.get(name) : undefined;
    if (r.unit === "kg" && ev) {
      return {
        ...r,
        from: String(ev.from),
        to: String(ev.to),
        ago: "Just now",
        isNew: true,
      };
    }
    return r;
  });
  for (const [name, ev] of latest) {
    if (seeded.has(name)) continue;
    rows.push({
      id: `live-${name.replace(/[^a-z0-9]+/g, "-")}`,
      exercise: ev.exercise,
      from: String(ev.from),
      to: String(ev.to),
      unit: "kg",
      ago: "Just now",
      isNew: true,
    });
  }
  return rows;
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
