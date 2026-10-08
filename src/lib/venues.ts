import type { CheckIn } from "@/lib/types";

// PRD §13 — check-in targets. `code` is what the QR encodes.
export const CHECKIN_VENUES: {
  name: string;
  icon: string;
  code: string;
  method: string;
  recent: boolean;
}[] = [
  {
    name: "i-Fitness Lekki",
    icon: "gym",
    code: "LEK-4471",
    method: "QR at reception",
    recent: true,
  },
  {
    name: "Lekki Phase 1",
    icon: "running",
    code: "RUN-8820",
    method: "Organiser QR",
    recent: true,
  },
  {
    name: "Eko Atlantic Lawn",
    icon: "yoga",
    code: "VI-1093",
    method: "Manual code",
    recent: false,
  },
  {
    name: "Rocks Gym, Opebi",
    icon: "gym",
    code: "IKJ-7712",
    method: "QR at turnstile",
    recent: false,
  },
];

export const RECENT_CHECKINS: CheckIn[] = [
  {
    id: "ci-1",
    sessionId: "bench-squat-night",
    venueName: "i-Fitness Lekki",
    method: "qr",
    at: "Mon 6:12 PM",
  },
  {
    id: "ci-2",
    sessionId: "sat-5km",
    venueName: "Lekki Phase 1",
    method: "qr",
    at: "Sun 7:04 AM",
  },
  {
    id: "ci-3",
    venueName: "Eko Atlantic Lawn",
    method: "manual",
    at: "Sat 8:11 AM",
  },
];
