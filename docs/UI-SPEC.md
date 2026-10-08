# UI spec — Show Up prototype

The visual contract for the prototype. Anything not listed here follows
Tailwind 4 defaults with the tokens below.

---

## 1. Colour

Defined in `src/app/globals.css` under `@theme`. `color-scheme: light`.

### Ink (neutral) — light canvas

Reading direction: **50 = darkest** (primary text) → **950 = lightest** (page).

| Token | Value | Use |
|---|---|---|
| `ink-50` | `#0b0d0f` | Headings, primary text, `onvolt`-equivalent dark |
| `ink-100` | `#171b20` | Body text, input values |
| `ink-200` | `#2f353d` | Strong secondary text |
| `ink-300` | `#4c5460` | Secondary text on white |
| `ink-400` | `#626a77` | Tertiary text, section labels |
| `ink-500` | `#7b8391` | Muted/again hints, meta lines |
| `ink-600` | `#949ca8` | Placeholders, disabled |
| `ink-700` | `#e1e5eb` | **Hairline** — every divider and border |
| `ink-750` | `#e7ebf0` | Subtle chips, inactive tile fills |
| `ink-800` | `#ffffff` | **Card surface** |
| `ink-850` | `#eef1f5` | Inset field surface (inputs on cards) |
| `ink-900` | `#ffffff` | Raised surface |
| `ink-950` | `#f2f4f7` | **Page canvas** |

### Volt (accent) — split by role, not hue

| Token | Value | Role |
|---|---|---|
| `volt-100/200/300` | `#fbffeb` `#f3ffcf` `#e6ff9b` | Tints, gradient stops |
| `volt-400` | `#d7ff3e` | **Fill** — buttons, active pills, dots. Always with `text-onvolt` |
| `volt-500` | `#c2ef1a` | Fill hover |
| `volt-600` | `#7a9e1b` | **Graphic** — bars, rings, chart lines, callout rules (3.1:1) |
| `volt-700` | `#5f7a00` | **Text accent** on white (4.9:1) |
| `volt-800` | `#475c00` | Text on a `volt-400/[0.12]` tint |

Rule: `#d7ff3e` as *text on white* is 1.2:1 and must never be used. Reach for
`volt-700` instead; reach for `volt-600` when the element is a stroke or a bar.

### On-accent + scrim

| Token | Value | Use |
|---|---|---|
| `onvolt` | `#0b0d0f` | Text/icon on a `volt-400` fill |
| `scrim` | `#0b0d0f` | Dark overlays — sheet backdrop, scanning toast |

### Semantic

`-400` stops are consumed as **text** (darkened to pass AA on white);
`-500` stops are consumed as **fills** (kept vivid).

| | text | fill |
|---|---|---|
| ok | `ok-400` `#0e7a45` | `ok-500` `#2dd881` |
| warn | `warn-400` `#8a5a00` | `warn-500` `#ffb020` |
| bad | `bad-400` `#c62828` | `bad-500` `#ff5252` |
| info | `info-400` `#1f5fd0` | `info-500` `#5b8cff` |

`Badge` tones combine `bg-<tone>-500/15` + `text-<tone>-400` + `ring-<tone>-500/35`.

---

## 2. Type

Inter for everything (`--font-inter` → `--font-display` / `--font-body`).

| Role | Recipe |
|---|---|
| Screen title | `font-display text-2xl font-extrabold tracking-tight` |
| Hero title | `font-display text-[38px] font-extrabold leading-[0.95] tracking-[-0.03em]` |
| Card/row title | `font-display text-[15px] font-bold` |
| Section overline | `font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400` |
| Micro-label | `text-[11px] font-bold uppercase tracking-wider text-ink-500` |
| Body | `text-sm` / `text-[15px] leading-relaxed` |
| Meta, hints | `text-[13px]` or `text-[12px] text-ink-500` |
| Numbers | add `.num` (`font-variant-numeric: tabular-nums`) |

**Floor is `text-[11px]`** — the original build's `text-[10px]` was swept to
`11px` across the codebase. Nothing smaller ships.

---

## 3. Space & shape

- Page gutter: `px-4` (`ScreenHeader` handles it).
- Section rhythm: `mb-6` / `mb-7` between sections; `pb-6` + `border-b` when a
  hairline is wanted underneath.
- Card radius `rounded-2xl`, hero/photo radius `rounded-2xl`, tiles `rounded-xl`,
  chips/pills `rounded-lg`, badges/buttons `rounded-full` / `rounded-lg`.
- One shadow only: `card-shine` (`0 1px 2px rgba(11,13,15,.04)`). No stacked
  shadows, no glows on white.

### Box discipline

| Want | Use |
|---|---|
| A framed, genuinely-object thing (join CTA, chat, QR tool, one feed post) | `Card` |
| A titled section with content straight on the canvas | `Band` |
| A run of similar rows (list, settings, picker) | `List` + `ListRow` |
| A pulled-aside note | `border-l-2 border-volt-600 pl-4` callout |
| A 3-up stat strip | `grid grid-cols-3 divide-x divide-ink-700 border-y border-ink-700` |

**Maximum two `Card`s per screen.** The pre-redesign screens had six or seven;
each was collapsed into a `Band`/`List` or merged.

`ListRow` has `layout="row"` (default, centred single line) and
`layout="block"` (full-width stacked content) — pass the prop, not a `block`
class, because `cn()` is a plain join and does not merge conflicting utilities.

---

## 4. Components in detail

### Card
`rounded-2xl border border-ink-700 bg-ink-800 card-shine`. Optional `onClick`
adds `active:scale-[0.985]`.

### List / ListRow
`List` is `divide-y divide-ink-700`; with `variant="surface"` it wraps itself
in one rounded white group. `ListRow` accepts `href` (renders a link),
`onClick` (renders a button), `chevron`, `layout`, `className`.

### Badge / Pill / Tag / Chip
- `Badge` — uppercase, `ring-1 ring-inset`, tone-driven.
- `Pill` — quiet static inline label on `ink-750`.
- `Tag` — micro static label for footnotes/eyebrows.
- `Chip` — interactive selectable. `size="sm" | "md"`, `selected` → volt fill +
  `text-onvolt` + `shadow-[0_0_0_1px_rgba(215,255,62,0.35)]`.

### Button
`primary` = volt-400 fill + `text-onvolt`; `secondary` = white + hairline;
`ghost` = no chrome; `danger` = bad tint. Sizes `sm | md | lg`, `full` spans.

### Glyph / GlyphTile
`Glyph` = bare 24-viewBox stroke icon (`size`, `strokeWidth`, `currentColor`).
`GlyphTile` = the icon in a chip — `size: sm|md|lg`,
`tone: neutral|volt|info`. Registry keys are domain ids (see README).

### Photo
`Photo name alt ratio sizes priority scrim`. `next/image` with `fill` +
`object-cover`; `onError` swaps in a volt→ink gradient so layout never
collapses. `scrim` adds a bottom darkening veil for overlaid white text.

### Callout (no component — a pattern)
```jsx
<section className="mt-7 border-l-2 border-volt-600 pl-4">
  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">Label</p>
  <p className="mt-2 text-[13px] leading-relaxed text-ink-500">Body…</p>
</section>
```
This replaced every `border-dashed` explanation box.

### Dark overlays that stay dark
Sheet backdrop and the scanning toast use `scrim`, not `ink-*`, because
`ink-950` is now the light canvas.

---

## 5. Per-screen card budget (post-redesign)

| Screen | Framed objects |
|---|---|
| Welcome | 0 (photo hero + divided `<ul>`) |
| Home | 1 (today's session) |
| Progress | 2 (weekly volume, consistency) |
| Sessions | 0 (one `List` group) |
| Session detail | 2 (join CTA, chat) + photo hero |
| Check-in | 1 (QR tool) + photo band |
| Log | 0 (two `List` groups) |
| Community feed | 1 (pinned community) |
| Community detail | 1 (next session) + photo hero + feed posts |
| Discover | 0 (one `List` group) |
| Boards | 1 (expandable challenge) |
| Notifications | 0 (two `List` groups) |
| Profile | 0 (bands + lists) |
| Onboarding goals/location/level/match | 0 (selectable `List` rows) |

---

## 6. Photography

`public/photos/` — Unsplash License, 122–256 KB, `?w=1600&q=72&fm=jpg&fit=max`.

| File | Used on |
|---|---|
| `hero-run.jpg` | Welcome hero (`aspect-[4/5]`) |
| `session.jpg` | Session detail hero (`aspect-[16/9]`) |
| `checkin.jpg` | Check-in venue band (`aspect-[16/9]`) |
| `community.jpg` | Community detail hero (`aspect-[16/9]`) |
| `empty.jpg` | Offline screen (`aspect-[16/9]`) |

Nowhere else. Icons, type and space carry the rest.

---

## 7. Motion

| Name | Use |
|---|---|
| `animate-fade-up` | Sections entering on scroll/navigation |
| `animate-fade-in` | Sheets, overlays |
| `animate-pop` | Success states |
| `animate-sheet-up` | Bottom sheets |
| `animate-shimmer` | Skeletons (`shimmer-band`) |
| `animate-scan` | QR scan line |

`prefers-reduced-motion` is honoured by the browser for `animation-duration`;
entrance animations are opacity+transform only.

---

## 8. Accessibility

- Focus: `2px solid volt-700`, offset `2px` (global `:focus-visible`).
- All icon-only controls carry `aria-label`; toggles carry `aria-pressed`.
- Contrast: body text ≥ 4.5:1 on white; accents use `volt-700` (4.9:1),
  `ok-400` (4.9:1), `info-400` (5.9:1).
- Interactive rows are real `<button>`/`<a>` elements via `ListRow`/`Chip`.
- Minimum text size 11px; inputs are 15px to avoid iOS zoom.
