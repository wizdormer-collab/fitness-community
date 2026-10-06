"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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

interface PrototypeStore {
  hydrated: boolean;
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

const noopSubscribe = () => () => {};

/**
 * Read persisted state outside of React so hydration stays deterministic:
 * the server and the client's first paint both see INITIAL, and storage is
 * only consulted once React has taken over.
 */
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

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(readPersisted);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked — prototype still works in-memory.
    }
  }, [state, hydrated]);

  const setDraft = useCallback((patch: Partial<DraftProfile>) => {
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...INITIAL, readNotifications: [...INITIAL.readNotifications] });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCommunity = useCallback((id: string) => {
    let next = false;
    setState((s) => {
      const joined = s.joinedCommunities.includes(id);
      next = !joined;
      return {
        ...s,
        joinedCommunities: joined
          ? s.joinedCommunities.filter((c) => c !== id)
          : [...s.joinedCommunities, id],
      };
    });
    return next;
  }, []);

  const toggleSession = useCallback((id: string) => {
    let next = false;
    setState((s) => {
      const joined = s.joinedSessions.includes(id);
      next = !joined;
      return {
        ...s,
        joinedSessions: joined
          ? s.joinedSessions.filter((x) => x !== id)
          : [...s.joinedSessions, id],
      };
    });
    return next;
  }, []);

  const checkIn = useCallback((id: string) => {
    setState((s) =>
      s.checkedIn.includes(id)
        ? s
        : {
            ...s,
            checkedIn: [...s.checkedIn, id],
            streak: s.streak + 1,
          },
    );
  }, []);

  const toggleLike = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      likedPosts: s.likedPosts.includes(id)
        ? s.likedPosts.filter((p) => p !== id)
        : [...s.likedPosts, id],
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const all = NOTIFICATIONS.map((n) => n.id);
    setState((s) =>
      all.every((id) => s.readNotifications.includes(id))
        ? s
        : { ...s, readNotifications: all },
    );
  }, []);

  const addWorkout = useCallback((w: Omit<Workout, "id" | "userId">) => {
    setState((s) => {
      const id = `w-live-${Date.now()}`;
      const workout: Workout = { ...w, id, userId: CURRENT_USER_ID };
      const completed = Math.min(PROGRESS.weeklyTarget, s.weeklyCompleted + 1);
      return {
        ...s,
        extraWorkouts: [workout, ...s.extraWorkouts],
        weeklyCompleted: completed,
        totalWorkouts: s.totalWorkouts + 1,
        trainingMinutes: s.trainingMinutes + w.durationMin,
        personalRecords: w.isPR ? s.personalRecords + 1 : s.personalRecords,
      };
    });
  }, []);

  const value = useMemo<PrototypeStore>(() => {
    const profile: DraftProfile = { ...DEFAULT_PROFILE, ...state.draft };
    return {
      hydrated,
      state,
      profile,
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
    };
  }, [
    hydrated,
    state,
    setDraft,
    completeOnboarding,
    reset,
    toggleCommunity,
    toggleSession,
    checkIn,
    toggleLike,
    markAllNotificationsRead,
    addWorkout,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {hydrated ? children : <PrototypeBoot />}
    </StoreContext.Provider>
  );
}

/** One-frame boot screen — keeps SSR and the client's first paint identical. */
function PrototypeBoot() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-label="Loading prototype"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-volt-400 font-display text-3xl font-black text-ink-950 volt-glow">
        S
      </span>
      <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-ink-500">
        Show Up
      </span>
      <span className="shimmer-band h-1.5 w-28 rounded-full bg-ink-800" />
    </div>
  );
}

export function usePrototype(): PrototypeStore {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("usePrototype must be used inside <PrototypeProvider>");
  }
  return ctx;
}
