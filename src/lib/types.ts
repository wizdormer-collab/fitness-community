// ============================================================
// Domain types — the prototype's data contract.
//
// These mirror the future REST/API contract 1:1. The mock data in
// ./mock-data.ts conforms to these types, so swapping the mock layer
// for a real API later is a call-site change, not a re-model.
//
// Source of every field: the PRD, section referenced inline.
// ============================================================

// ---------- Option sets (drive pickers AND keep type safety) ----------

export const LAGOS_AREAS = [
  { id: "lekki", label: "Lekki", note: "Phase 1 & Phase 2" },
  { id: "victoria-island", label: "Victoria Island", note: "VI & Eko Atlantic" },
  { id: "ikoyi", label: "Ikoyi", note: "Old & New Ikoyi" },
  { id: "yaba", label: "Yaba", note: "Herbert Macaulay strip" },
  { id: "ikeja", label: "Ikeja", note: "GRA, Opebi, Allen" },
  { id: "surulere", label: "Surulere", note: "Adeniran Ogunsanya" },
] as const;
export type LagosAreaId = (typeof LAGOS_AREAS)[number]["id"];

// PRD §7 — 9 selectable goals
export const FITNESS_GOALS = [
  { id: "weight-loss", label: "Weight loss", emoji: "⚖️" },
  { id: "muscle-gain", label: "Muscle gain", emoji: "💪" },
  { id: "strength", label: "Strength", emoji: "🏋️" },
  { id: "general-fitness", label: "General fitness", emoji: "🌟" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "endurance", label: "Endurance", emoji: "🫀" },
  { id: "sports-performance", label: "Sports performance", emoji: "🏆" },
  { id: "flexibility", label: "Flexibility / mobility", emoji: "🤸" },
  { id: "healthy-lifestyle", label: "Healthy lifestyle", emoji: "🥗" },
] as const;
export type FitnessGoalId = (typeof FITNESS_GOALS)[number]["id"];

// PRD §7 — 12 selectable activities
export const ACTIVITIES = [
  { id: "gym", label: "Gym", emoji: "🏋️" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
  { id: "padel", label: "Padel", emoji: "🎾" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "pilates", label: "Pilates", emoji: "🤸" },
  { id: "home-workouts", label: "Home workouts", emoji: "🏠" },
  { id: "other", label: "Other", emoji: "✨" },
] as const;
export type ActivityId = (typeof ACTIVITIES)[number]["id"];

export const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", note: "Under 12 months consistent" },
  { id: "intermediate", label: "Intermediate", note: "1–3 years, knows the basics" },
  { id: "advanced", label: "Advanced", note: "3+ years, training with intent" },
] as const;
export type FitnessLevelId = (typeof FITNESS_LEVELS)[number]["id"];

export const WEEKDAYS = [
  { id: "mon", label: "Mon", long: "Monday" },
  { id: "tue", label: "Tue", long: "Tuesday" },
  { id: "wed", label: "Wed", long: "Wednesday" },
  { id: "thu", label: "Thu", long: "Thursday" },
  { id: "fri", label: "Fri", long: "Friday" },
  { id: "sat", label: "Sat", long: "Saturday" },
  { id: "sun", label: "Sun", long: "Sunday" },
] as const;
export type WeekdayId = (typeof WEEKDAYS)[number]["id"];

// PRD §7 — preferred workout time
export const TIME_SLOTS = [
  { id: "dawn", label: "Dawn", time: "5 – 8 AM", emoji: "🌅" },
  { id: "morning", label: "Morning", time: "8 – 11 AM", emoji: "☀️" },
  { id: "midday", label: "Midday", time: "11 AM – 2 PM", emoji: "🌤️" },
  { id: "afternoon", label: "Afternoon", time: "2 – 5 PM", emoji: "🌇" },
  { id: "evening", label: "Evening", time: "5 – 9 PM", emoji: "🌆" },
  { id: "night", label: "Night", time: "9 PM – 12 AM", emoji: "🌙" },
] as const;
export type TimeSlotId = (typeof TIME_SLOTS)[number]["id"];

// PRD §11 — Discover categories
export const DISCOVER_CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "gyms", label: "Gyms", emoji: "🏋️" },
  { id: "run-clubs", label: "Run clubs", emoji: "🏃" },
  { id: "classes", label: "Classes", emoji: "🧘" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "events", label: "Events", emoji: "📅" },
  { id: "trainers", label: "Trainers", emoji: "🧑‍🏫" },
  { id: "communities", label: "Communities", emoji: "👥" },
  { id: "challenges", label: "Challenges", emoji: "🏆" },
] as const;
export type DiscoverCategoryId = (typeof DISCOVER_CATEGORIES)[number]["id"];

export const NOTIFICATION_KINDS = {
  social: { label: "Social", emoji: "👥" },
  fitness: { label: "Fitness", emoji: "🏋️" },
  event: { label: "Event", emoji: "📅" },
  accountability: { label: "Accountability", emoji: "🔥" },
} as const;
export type NotificationKind = keyof typeof NOTIFICATION_KINDS;

// ---------- Entities ----------

// PRD §7 — profile collected during onboarding
export interface User {
  id: string;
  name: string;
  initials: string;
  tone: number; // avatar gradient index — no image assets required
  age: number;
  area: LagosAreaId;
  fitnessLevel: FitnessLevelId;
  goals: FitnessGoalId[];
  activities: ActivityId[];
  preferredDays: WeekdayId[];
  preferredSlots: TimeSlotId[];
  currentGym?: string;
  bio?: string;
  verified: boolean;
  handle: string;
}

// PRD §9 — the core differentiator
export interface Community {
  id: string;
  name: string;
  emoji: string;
  area: LagosAreaId;
  activity: ActivityId;
  goal: FitnessGoalId;
  level: FitnessLevelId;
  cadence: string;
  members: number;
  featuredMemberIds: string[];
  tagline: string;
  description: string;
  adminNames: string[];
  todayTraining: number;
  badge?: string;
  nextSessionId?: string;
  joined: boolean;
  schedule: { day: WeekdayId; time: string; activity: string }[];
}

// PRD §12 — sessions & events
export interface Session {
  id: string;
  title: string;
  activity: ActivityId;
  dayLabel: string;
  date: string;
  time: string;
  location: string;
  area: LagosAreaId;
  level: FitnessLevelId;
  maxSpots: number;
  spotsTaken: number;
  cost: number; // 0 = free
  organizerName: string;
  communityId?: string;
  description: string;
  attendeeIds: string[];
  status: "upcoming" | "live" | "completed";
  joined: boolean;
  checkedIn: boolean;
}

// PRD §11 — Discover listing surface
export interface DiscoverItem {
  id: string;
  category: Exclude<DiscoverCategoryId, "all">;
  title: string;
  emoji: string;
  area: LagosAreaId;
  distanceKm: number;
  meta: string;
  rating?: number;
  verified?: boolean;
  badge?: string;
  href?: string;
  // Trainers resolve to a sheet, not a route (PRD §21 = Phase 2)
  sheet?: {
    profession: string;
    speciality: string;
    fromPrice: string;
    availability: string;
    reviewCount: number;
  };
}

// PRD §19 — fitness-focused social feed
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTone: number;
  communityId?: string;
  kind: "workout" | "achievement" | "photo" | "text" | "milestone";
  text: string;
  ago: string;
  likes: number;
  liked: boolean;
  comments: { id: string; authorName: string; text: string; ago: string }[];
  stats: { label: string; value: string }[];
  accent?: string;
}

// PRD §15 — workout tracking (manual entry in MVP)
export interface Workout {
  id: string;
  userId: string;
  activity: ActivityId;
  dayLabel: string;
  date: string;
  time: string;
  durationMin: number;
  calories?: number;
  location?: string;
  sessionId?: string;
  sharedToFeed: boolean;
  isPR: boolean;
  prNote?: string;
  strength?: { exercise: string; sets: number; reps: number; weightKg: number }[];
  run?: { distanceKm: number; pacePerKm: string };
  summary: string;
}

// PRD §16 — fitness progress
export interface ProgressSnapshot {
  days: number;
  workouts: number;
  trainingHours: number;
  personalRecords: number;
  weeklyAverage: number;
  streak: number;
  weeklyTarget: number;
  weeklyCompleted: number;
  weeklyTrend: number[];
  distanceTrend: number[];
  byActivity: { activity: ActivityId; count: number; pct: number }[];
  heatmap: { date: string; intensity: 0 | 1 | 2 | 3; label: string }[];
  records: {
    id: string;
    exercise: string;
    from: string;
    to: string;
    unit: string;
    ago: string;
    isNew: boolean;
  }[];
}

// PRD §18 — challenges + leaderboards
export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  communityId?: string;
  hostName: string;
  goal: string;
  metric: "workouts" | "distance" | "streak";
  target: number;
  unit: string;
  participants: number;
  endsIn: string;
  joined: boolean;
  you: { rank: number; value: number; pct: number };
  leaderboard: {
    rank: number;
    name: string;
    tone: number;
    value: number;
    you: boolean;
  }[];
}

// PRD §11 — Trainers (discovery surface only; §21 profiles = Phase 2)
export interface Trainer {
  id: string;
  name: string;
  initials: string;
  tone: number;
  profession: string;
  speciality: string;
  area: LagosAreaId;
  rating: number;
  reviewCount: number;
  fromPrice: string;
  availability: string;
  verified: boolean;
}

// PRD §20 — notifications
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  text: string;
  sub?: string;
  ago: string;
  read: boolean;
  href?: string;
}

// PRD §13 — check-ins (QR prioritized for MVP)
export interface CheckIn {
  id: string;
  sessionId?: string;
  venueName?: string;
  method: "qr" | "manual" | "gps";
  at: string;
}
