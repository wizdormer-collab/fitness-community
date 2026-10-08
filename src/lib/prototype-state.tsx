"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { CURRENT_USER_ID, ME, NOTIFICATIONS, PROGRESS } from "@/lib/mock-data";
import type {
  ActivityId,
  FitnessGoalId,
  FitnessLevelId,
  LagosAreaId,
  TimeSlotId,
  WeekdayId,
  Workout,
} from "@/lib/types";

// ============================================================
// Prototype state.
//
// One store drives every screen so the PRD §3 cycle
// Discover → Connect → Commit → Train → Track → Improve → Return
// actually closes on-screen instead of being described in a comment.
//
// Joining a community moves member counts, joining a session moves the
// spot meter, checking in moves the streak, logging a workout moves the
// dashboard and progress page. Persisted to localStorage so a refresh
// mid-flow doesn't reset the narrative.
//
// The store lives outside React and is subscribed to with
// useSyncExternalStore. That is deliberate: getServerSnapshot returns
// INITIAL, so prerendered HTML ships real content, hydration matches it
// exactly, and React then swaps in the persisted state. A plain
// useState + useEffect loader would either mismatch hydration or force
// every page behind a boot splash.
// ============================================================

const STORAGE_KEY = "fitproto.v1";

export interface DraftProfile {
  name: string;
  area: LagosAreaId;
  goals: FitnessGoalId[];
  activities: ActivityId[];
  fitnessLevel: FitnessLevelId;
  preferredDays: WeekdayId[];
  preferredSlots: TimeSlotId[];
  currentGym: string;
}

interface PersistedState {
  onboarded: boolean;
  draft: Partial<DraftProfile>;
  joinedCommunities: string[];
  joinedSessions: string[];
  checkedIn: string[];
  extraWorkouts: Workout[];
  likedPosts: string[];
  readNotifications: string[];
  weeklyCompleted: number;
  streak: number;
  totalWorkouts: number;
  personalRecords: number;
  trainingMinutes: number;
}

const INITIAL: PersistedState = {
  onboarded: false,
  draft: {},
  joinedCommunities: ["lekki-strength-crew", "lagos-runners"],
  joinedSessions: ["bench-squat-night", "sat-5km"],
  checkedIn: [],
  extraWorkouts: [],
  likedPosts: ["p-1", "p-4"],
  readNotifications: ["n-4", "n-5", "n-6", "n-7", "n-8"],
  weeklyCompleted: PROGRESS.weeklyCompleted,
  streak: PROGRESS.streak,
  totalWorkouts: PROGRESS.workouts,
  personalRecords: PROGRESS.personalRecords,
  trainingMinutes: PROGRESS.trainingHours * 60,
};

const DEFAULT_PROFILE: DraftProfile = {
  name: ME.name,
  area: ME.area,
  goals: [...ME.goals],
  activities: [...ME.activities],
  fitnessLevel: ME.fitnessLevel,
  preferredDays: [...ME.preferredDays],
  preferredSlots: [...ME.preferredSlots],
  currentGym: ME.currentGym ?? "",
};

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

function readPersisted(): PersistedState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...INITIAL, ...(JSON.parse(raw) as Partial<PersistedState>) };
    }
  } catch {
    // Corrupt storage should never block the prototype.
  }
  return INITIAL;
}

let current: PersistedState = readPersisted();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PersistedState {
  return current;
}

/** Server always renders the seeded Lagos state; storage never leaks into HTML. */
function getServerSnapshot(): PersistedState {
  return INITIAL;
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage full or blocked — prototype still works in-memory.
  }
}

function commit(updater: (state: PersistedState) => PersistedState) {
  const next = updater(current);
  if (next === current) return;
  current = next;
  persist();
  notify();
}

// Keep every open tab in sync while someone is showing the demo around.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    current = readPersisted();
    notify();
  });
}

// ------------------------------------------------------------
// Actions — module level so they never invalidate the memoised context
// ------------------------------------------------------------

function setDraft(patch: Partial<DraftProfile>) {
  commit((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
}

function completeOnboarding() {
  commit((s) => ({ ...s, onboarded: true }));
}

function reset() {
  current = { ...INITIAL, readNotifications: [...INITIAL.readNotifications] };
  persist();
  notify();
}

function toggleCommunity(id: string): boolean {
  const joined = current.joinedCommunities.includes(id);
  commit((s) => ({
    ...s,
    joinedCommunities: joined
      ? s.joinedCommunities.filter((c) => c !== id)
      : [...s.joinedCommunities, id],
  }));
  return !joined;
}

function toggleSession(id: string): boolean {
  const joined = current.joinedSessions.includes(id);
  commit((s) => ({
    ...s,
    joinedSessions: joined
      ? s.joinedSessions.filter((x) => x !== id)
      : [...s.joinedSessions, id],
  }));
  return !joined;
}

function checkIn(id: string) {
  commit((s) =>
    s.checkedIn.includes(id)
      ? s
      : { ...s, checkedIn: [...s.checkedIn, id], streak: s.streak + 1 },
  );
}

function toggleLike(id: string) {
  commit((s) => ({
    ...s,
    likedPosts: s.likedPosts.includes(id)
      ? s.likedPosts.filter((p) => p !== id)
      : [...s.likedPosts, id],
  }));
}

function markAllNotificationsRead() {
  const all = NOTIFICATIONS.map((n) => n.id);
  commit((s) =>
    all.every((id) => s.readNotifications.includes(id))
      ? s
      : { ...s, readNotifications: all },
  );
}

function addWorkout(w: Omit<Workout, "id" | "userId">) {
  commit((s) => {
    const workout: Workout = {
      ...w,
      id: `w-live-${Date.now()}`,
      userId: CURRENT_USER_ID,
    };
    return {
      ...s,
      extraWorkouts: [workout, ...s.extraWorkouts],
      weeklyCompleted: Math.min(PROGRESS.weeklyTarget, s.weeklyCompleted + 1),
      totalWorkouts: s.totalWorkouts + 1,
      trainingMinutes: s.trainingMinutes + w.durationMin,
      personalRecords: w.isPR ? s.personalRecords + 1 : s.personalRecords,
    };
  });
}

// ------------------------------------------------------------
// Context
// ------------------------------------------------------------

interface PrototypeStore {
  state: PersistedState;
  profile: DraftProfile;
  setDraft: (patch: Partial<DraftProfile>) => void;
  completeOnboarding: () => void;
  reset: () => void;
  toggleCommunity: (id: string) => boolean;
  toggleSession: (id: string) => boolean;
  isCommunityJoined: (id: string) => boolean;
  isSessionJoined: (id: string) => boolean;
  isCheckedIn: (id: string) => boolean;
  checkIn: (id: string) => void;
  isPostLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  isNotificationRead: (id: string) => boolean;
  markAllNotificationsRead: () => void;
  addWorkout: (w: Omit<Workout, "id" | "userId">) => void;
}

const StoreContext = createContext<PrototypeStore | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<PrototypeStore>(
    () => ({
      state,
      profile: { ...DEFAULT_PROFILE, ...state.draft },
      setDraft,
      completeOnboarding,
      reset,
      toggleCommunity,
      toggleSession,
      isCommunityJoined: (id) => state.joinedCommunities.includes(id),
      isSessionJoined: (id) => state.joinedSessions.includes(id),
      isCheckedIn: (id) => state.checkedIn.includes(id),
      checkIn,
      isPostLiked: (id) => state.likedPosts.includes(id),
      toggleLike,
      isNotificationRead: (id) =>
        state.readNotifications.includes(id) ||
        INITIAL.readNotifications.includes(id),
      markAllNotificationsRead,
      addWorkout,
    }),
    [state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePrototype(): PrototypeStore {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("usePrototype must be used inside <PrototypeProvider>");
  }
  return ctx;
}
