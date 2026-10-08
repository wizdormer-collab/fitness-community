# MVP scope — what shipped, what was cut, and why

The PRD's §25 *"MVP Scope"* has the heading and the line *"I would not build
everything above in version 1. MVP should contain:"* — but the bullet list
underneath is **empty**. This document is that list: the scope was derived
from §26 (MVP user journey), §27 (core user loop), §14–§21 (feature
breakdown) and §37 (the US/UK-as-inspiration rule).

---

## 1. Derived MVP list

Mapped to §27's loop — every item below serves at least one stage.

| Loop stage | MVP capability | Screens |
|---|---|---|
| **DISCOVER** | Browse communities, sessions, venues, trainers by area/category | `/app/discover`, `/app/community`, `/app/community/[id]` |
| **CONNECT** | Join a community, join a session, see who's coming | `/app/match` (onboarding), `/app/sessions`, `/app/sessions/[id]` |
| **COMMIT** | Weekly commitment, preferred days/times, session schedule | `/onboarding/level`, `/app/progress` |
| **TRAIN** | QR + manual venue check-in, spot meter | `/app/checkin`, `/app/sessions/[id]` |
| **TRACK** | Manual workout log, streaks, personal records | `/app/log`, `/app/progress` |
| **IMPROVE** | Weekly volume, consistency heatmap, PR list, activity split | `/app/progress` |
| **SHARE** | Fitness-first community feed, challenges, leaderboards | `/app/community`, `/app/boards` |
| **RETURN** | Narrow notification set, accountability nudge on Home | `/app/notifications`, `/app` |

### Supporting MVP surfaces
- **Onboarding** — 7 steps covering §26's new-user journey end to end.
- **Profile** — goals, activities, level, communities, edit sheet.
- **Offline** — service worker + `/offline` with the low-bandwidth copy (§37).
- **Safety** — report, block, privacy controls, no exact location shown (§24).

---

## 2. Explicitly cut from v1

| Cut | PRD | Why |
|---|---|---|
| **Gym crowd levels** | §14 *"Cut, revisit after PMF"* | Marked experimental by the PRD itself. Discover shows a line stating it is cut rather than a disabled placeholder. |
| **GPS-based check-in** | §13 | Needs per-gym geofencing, which depends on the business layer. v1 ships QR + manual venue code. |
| **Wearable integrations** | §15 | Manual entry first; integrations come after product-market validation. Stated on the Log screen. |
| **WhatsApp session flyer** | — | Borrowed as an idea, **not built**. Deferred with the create-session host flow. |
| **Create-session host flow** | — | Deferred. Every session in the prototype is seed data. |
| **Bookings & payments** | §32 | Phase 2. Trainers are discoverable in v1; the detail sheet says so. |
| **Trainer profiles (full)** | §21 | Phase 2. Discover surfaces trainers via a bottom sheet instead of a route. |
| **Monetization** | §28 | PRD: monetisation comes *after* engagement is validated. No pricing UI. |
| **Non-Lagos cities** | §35 | Lagos only: Lekki, VI, Ikoyi, Yaba, Ikeja, Surulere. |

---

## 3. Deliberate borrows

The redesign borrowed three ideas from competitors that fit the existing
prototype, without adding new modules:

| # | Borrow | Where it landed |
|---|---|---|
| 1 | **Show who's going**, not just a count | `AvatarStack` on Home's today-session, session list rows, session detail, community rails |
| 2 | ~~WhatsApp session flyer~~ | **Deferred** — not built |
| 3 | ~~Create-session host flow~~ | **Deferred** — not built |
| 4 | **Public weekly commitment** | Home callout ("This week I'm training 4×") and Progress commitment line |
| 5 | — | — |
| 6 | **Low-bandwidth / copy discipline** | `/offline` copy, short verbs, plain sentence lengths throughout |

---

## 4. Roadmap position

| Phase | Content | Status in this prototype |
|---|---|---|
| **0 — Now (MVP)** | 6 modules above, Lagos only, manual entry, QR check-in | **Built** |
| **1** | Workout plans, wearables, full trainer profiles, host flow | Not built |
| **2** | Bookings, payments, business subscriptions, trainer marketplace | Not built (information only) |
| **3** | Events & paid event commission, sponsored challenges | Not built |
| **4** | AI assistance, advanced analytics | Not built |
| **5** | Marketplace (equipment, apparel, wellness, nutrition) | Not built |

Monetisation enters only from Phase 2, per §28.

---

## 5. Data the prototype assumes

Static mocks in `src/lib/mock-data.ts` — no backend:

- 8 people (including `ME`), 7 communities, 7 sessions, 6 posts, 6 discover
  items (trainers/gyms/events), 3 challenges, 8 notifications, 6 workouts,
  1 progress snapshot, 5 venues with rotating codes.
- Areas, activities, goals, levels, time slots, weekdays and notification
  kinds are declared in `src/lib/types.ts` and are the vocabulary the icons
  are keyed on.

**No emoji reaches the render layer.** The `emoji` fields on `types.ts` /
`mock-data.ts` are retained as a future REST contract; the UI keys icons by
domain id instead.

---

## 6. Acceptance for "MVP done"

- [x] §26 new-user journey walkable end to end in the prototype
- [x] All 8 loop stages have at least one working screen
- [x] QR and manual check-in both functional
- [x] Manual workout log writes to shared state and updates progress
- [x] Cuts are *stated in the UI*, not shown as disabled placeholders
- [x] Lagos-only vocabulary throughout (areas, venues, ₦ pricing)
- [x] Works offline (service worker + `/offline` recovery route)
- [x] 21 routes build, lint clean, type clean
