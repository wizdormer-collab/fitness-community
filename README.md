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

**Light · Clean · Athletic** — white canvas, dark ink text, volt-lime accent,
Inter throughout.

Tokens live in `src/app/globals.css`:

- **ink** — neutral scale. `50` is the darkest (primary text) → `950` is the
  lightest (page canvas). `700` is the hairline; `750–950` are surfaces.
  Names were kept from the original dark build so the class references could be
  inverted in place rather than renamed.
- **volt** — split by role, not by hue:
  - `volt-400` (#d7ff3e) = **fills** only, always paired with `text-onvolt`
  - `volt-600` (#7a9e1b) = **graphics** (bars, rings, chart lines, hairlines)
  - `volt-700` (#5f7a00) = **text accent** (4.9:1 on white)
- **onvolt** / **scrim** — text on a lime fill, and dark overlays. These two
  deliberately do not ride the ink scale.
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
mockup, so the redesign systematically collapsed them.

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
