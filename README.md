# Show Up — community fitness platform (prototype)

Mobile-first PWA prototype for a community-based fitness platform launching in
Lagos, Nigeria. Built from `Product Requirements Document (fitness community).docx`
and delivered as a clickable UI/UX prototype of the six MVP modules.

**Live:** https://fitness-community-drab.vercel.app
**Repo:** https://github.com/wizdormer-collab/fitness-community

## Stack

| | |
|---|---|
| Framework | Next.js 16.3.6 (App Router, `src/`, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind 4 (`@theme` tokens in `src/app/globals.css`) |
| Type | Inter via `next/font/google` (`--font-inter`) |
| Data | In-memory prototype store (`src/lib/prototype-state.tsx`) + static mocks |
| PWA | `manifest.webmanifest`, `public/sw.js`, offline route |

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

Lint and type-check:

```bash
npx tsc --noEmit     # ~1 min
npx eslint src       # fast
npm run lint         # full, ~7 min
```

## Routes

`/` redirects to onboarding. Prototype flow:

```
/onboarding/welcome → signin → location → goals → activities → level → match
  → /app (home)  → /app/sessions  → /app/sessions/[id]  → /app/checkin  → /app/log
               → /app/progress   → /app/community → /app/community/[id]
               → /app/discover   → /app/boards    → /app/notifications → /app/profile
/offline  /manifest.webmanifest
```

State (joined communities, sessions, check-ins, likes, streak) lives in a
module-level store read through `useSyncExternalStore`, so it survives
navigation and has no hydration mismatch.

## Design system

**Deep navy · warm cream · lime** — `#101F2D` text, `#F8F7F1` canvas, white
cards, `#B8F34A` accent, Inter throughout.

Tokens live in `src/app/globals.css`:

- **ink** — neutral scale. `50` is the darkest (primary text) → `950` is the
  lightest (page canvas). `700` is the hairline; `750–950` are surfaces.
  Names were kept from the original dark build so the class references could be
  re-pointed in place rather than renamed — which is also how the whole app was
  moved onto the navy/cream palette without touching component files.
- **volt** — split by role, not by hue:
  - `volt-400` (#b8f34a) = **fills** only, always paired with `text-onvolt`
  - `volt-600` (#628309) = **graphics** (bars, rings, chart lines, hairlines)
  - `volt-700` (#4e6b0a) = **text accent** (6.1:1 on white, 5.7:1 on cream)
- **onvolt** / **scrim** — text on a lime fill, and dark overlays. Both are
  `#101F2D`; these two deliberately do not ride the ink scale.
- **ok / warn / bad / info** — `-400` stops are read as text (darkened for AA),
  `-500` stops are used as fills (kept vivid).

### Components (`src/components/ui/`)

| File | Exports |
|---|---|
| `glyph.tsx` | `Glyph`, `GlyphTile` — the SVG icon registry, keyed by domain id |
| `photo.tsx` | `Photo` — curated Unsplash photography with a gradient fallback |
| `card.tsx` | `Card`, `SectionHeader`, `Band`, `List`, `ListRow`, `Badge`, `Pill`, `Divider` |
| `controls.tsx` | `Button`, `Chip`, `Tag`, `SegmentedControl`, `Toggle` |
| `header.tsx` | `ScreenHeader`, onboarding header |
| `metrics.tsx` | `StatTile`, `ProgressBar`, `SpotMeter`, `StreakFlame`, `Ring` |
| `charts.tsx` | `Sparkline`, `BarChart`, `Heatmap`, `ActivitySplit` |
| `state.tsx` | `EmptyState`, `Skeleton`, `ListSkeleton` |
| `avatar.tsx`, `nav.tsx`, `sheet.tsx`, `qr.tsx`, `icons.tsx` | supporting |

**Box discipline.** `Card` is reserved for a genuinely framed object — at most
one or two per screen. Everything else uses `Band` (unboxed section),
`List`/`ListRow` (one white group per section), or a plain hairline-divided
block. A column of six identical cards is what makes a screen read as a
mockup, so the redesign systematically collapsed them. Discover and Sessions
are the two deliberate exceptions: a browse grid of repeated result cards *is*
the content, not competing framed sections (`docs/UI-SPEC.md` §3). Sessions
took the grid because the old single-column `ListRow` stretched every spot
meter across ~900px, separating "12/40 spots" from its "Open" label by half a
screen.

**Session state.** `visibleSpots()` in `selectors.ts` is the one source of truth
for capacity: it moves by exactly one when you join or leave, and the attendee
count on both the list card and the detail takes the same delta, so the number
beside the avatars can never disagree with the meter. The status line on the
detail is derived from the store (checked in / joined / full / spots left) and
is marked `aria-live`, so it is the actual result of your last action rather
than a scripted success message. Check-in stays gated on membership and hands
off to the venue-code flow at `/app/checkin` — there is no shortcut around it.

**Progress data.** Every figure on `/app/progress` is derived at render time
from `PROGRESS` plus the live store — none of it is a typed-in literal. Distance
is the sum of `distanceTrend` (229 km over the 12 weeks actually charted), the
peak caption and the "N weeks ago" axis label come off the same arrays, "days
trained" counts the heatmap's non-rest cells, and the activity split folds
`state.extraWorkouts` into the seeded counts so logging a workout moves the
split and the Workouts tile together. Weekly-goal copy and the commitment line
are derived and clamped: overshooting the target reads "Weekly goal met", never
"-1 to go". The charts are `aria-hidden` decoration over real numbers, so each
one ships a `.sr-only` text equivalent carrying those numbers.

**Discover data.** `buildDiscoverResults()` in `selectors.ts` is the single
entry point: it returns the seeded `DISCOVER_ITEMS` (communities expanded into
their full `COMMUNITIES` record so a card can show a member count and tagline),
the upcoming `SESSIONS`, and the `TRAINERS` collection mapped into the listing
shape. Nothing is duplicated into the seed — a copy would give every name,
area and rating two homes to drift apart. Mapping at read time is what makes
the "Trainers" category and the trainer detail sheet resolve; the category
shipped with zero rows, so both were dead ends.

A session has no category of its own (the app has no "sessions" category), so
`SESSION_CATEGORY` files it under the category a browser would look in:
venues stay in **Gyms**, instructor-led work goes to **Classes**, group runs to
**Run clubs**, courts/pools/roads to **Sports**. It is a
`Record<ActivityId, …>`, so a new activity cannot ship uncategorised.

Each result carries a pre-folded `search` haystack, which is why the filter is
one `.includes()` across three data shapes. The screen loads the module behind
a dynamic import — the loading and error states are real conditions (a chunk
fetch can fail offline or across a deploy), not simulated timers.

**Icons.** `Glyph` is keyed by **domain id** (`ActivityId`, `FitnessGoalId`,
`DiscoverCategoryId`, `TimeSlotId`, notification kind, venue icon) — never by
emoji character. The `emoji` fields on `types.ts` / `mock-data.ts` are part of
the future REST contract and are intentionally untouched; the render layer
reads them nowhere.

**Photography.** Five curated images in `public/photos/` (Unsplash License,
122–256 KB): `hero-run`, `session`, `checkin`, `community`, `empty`. Used only
where a picture earns its place — welcome hero, session hero, community hero,
check-in venue, offline. `Photo` falls back to a volt→ink gradient if a file
is ever missing.

## PRD decisions worth knowing

- **People first → activities second → facilities third** (§34). Imagery and
  home layout lead with people.
- **US/UK products are inspiration, not specification** (§37). The copy,
  pricing, areas and venues are Lagos-specific.
- **Lagos only** (§35): Lekki, VI, Ikoyi, Yaba, Ikeja, Surulere.
- **Gym crowd levels cut** (§14) — experimental, revisit after PMF. The
  Discover screen states this rather than showing a disabled placeholder.
- **GPS check-in deferred** — needs per-gym geofencing, so v1 ships QR + a
  manual venue code.
- **Wearables deferred** — manual workout entry ships now.
- Roadmap, cuts and borrows are written up in `docs/MVP-SCOPE.md`.

## What this is not

No auth, no backend, no persistence beyond the tab session. Every write is
local to the prototype store. Payment, booking and trainer profiles are
Phase 2 in the PRD and are represented as information only.
