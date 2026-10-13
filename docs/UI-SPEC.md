# UI spec — Show Up prototype

The visual contract for the prototype. Anything not listed here follows
Tailwind 4 defaults with the tokens below.

---

## 1. Colour

Defined in `src/app/globals.css` under `@theme`. `color-scheme: light`.

### Ink (neutral) — deep navy text on a warm cream canvas

Reading direction: **50 = darkest** (primary text) → **950 = lightest** (page).
Navy-tinted at the dark end, cream-tinted at the light end, so nothing reads as
a cold grey next to `#101F2D` / `#F8F7F1`.

| Token | Value | Use |
|---|---|---|
| `ink-50` | `#101f2d` | Headings, primary text (16.6:1 on white) |
| `ink-100` | `#1b2c3b` | Body text, input values |
| `ink-200` | `#2e4256` | Strong secondary text |
| `ink-300` | `#455a6e` | Secondary text on white (7.1:1) |
| `ink-400` | `#5b7085` | Tertiary text, section labels (5.1:1) |
| `ink-500` | `#64788d` | Muted hints, meta lines (4.6:1 — still AA) |
| `ink-600` | `#7b8ea1` | Placeholders, chevrons, hover borders |
| `ink-700` | `#dedacc` | **Hairline** — every divider and border |
| `ink-750` | `#edeae0` | Subtle chips, inactive tile fills |
| `ink-800` | `#ffffff` | **Card surface** |
| `ink-850` | `#f1efe7` | Inset field surface, sidebar rail |
| `ink-900` | `#ffffff` | Raised surface |
| `ink-950` | `#f8f7f1` | **Page canvas** (`#F8F7F1`) |

White cards sit on cream with only ~1.07:1 of fill contrast, so the separation
is carried by `card-shine` (a low, navy-tinted shadow) plus the `ink-700`
hairline rather than by colour.

### Volt (accent) — split by role, not hue

| Token | Value | Role |
|---|---|---|
| `volt-100/200/300` | `#f4fee4` `#e9fdcb` `#d5fa9e` | Tints, gradient stops |
| `volt-400` | `#b8f34a` | **Fill** — buttons, active pills, dots. Always with `text-onvolt` |
| `volt-500` | `#a6e02e` | Fill hover |
| `volt-600` | `#628309` | **Graphic** — bars, rings, chart lines, callout rules (4.4:1) |
| `volt-700` | `#4e6b0a` | **Text accent** on white (6.1:1) / cream (5.7:1) |
| `volt-800` | `#3b520a` | Text on a `volt-400/[0.13]` tint |

Rule: `#b8f34a` as *text on white* is 1.3:1 and must never be used. Reach for
`volt-700` instead; reach for `volt-600` when the element is a stroke or a bar —
it also has to separate from an `ink-700` track, which is why it is the darkest
of the three graphic steps.

### On-accent + scrim

| Token | Value | Use |
|---|---|---|
| `onvolt` | `#101f2d` | Text/icon on a `volt-400` fill (12.6:1 — past AAA) |
| `scrim` | `#101f2d` | Dark overlays — sheet backdrop, scanning toast |

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
- One shadow only: `card-shine`
  (`0 1px 2px rgba(16,31,45,.05), 0 12px 28px -20px rgba(16,31,45,.28)`). No
  stacked shadows, no glows on white. It is deliberately stronger than a
  typical hairline lift: white cards on `#F8F7F1` differ by ~1.07:1, so the
  shadow is what makes the card read as a separate plane.

### Box discipline

| Want | Use |
|---|---|
| A framed, genuinely-object thing (join CTA, chat, QR tool, one feed post) | `Card` |
| A titled section with content straight on the canvas | `Band` |
| A run of similar rows (list, settings, picker) | `List` + `ListRow` |
| A pulled-aside note | `border-l-2 border-volt-600 pl-4` callout |
| A 3-up stat strip | `grid grid-cols-3 divide-x divide-ink-700 border-y border-ink-700` |
| A browse grid of results | `grid grid-cols-1 gap-3 lg:grid-cols-2` of `Card`s (Discover) |

**Maximum two `Card`s per screen.** The pre-redesign screens had six or seven;
each was collapsed into a `Band`/`List` or merged. The rule is about *competing
framed sections stacked in a column* — it does not apply to a browse grid,
where the repeated cards are the content itself (Discover is the only such
screen today).

Card footers inside a stretched grid row use `mt-auto` with the parent on
`gap-3`: the auto margin absorbs the slack a taller neighbour creates, and the
gap keeps the 12px minimum so the divider never touches the text above it.

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
  `text-onvolt` + `shadow-[0_0_0_1px_rgba(184,243,74,0.45)]`.

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
| Home | 3 (week, today's session, community) + 1 `List` surface (nearby) |
| Progress | 2 (weekly volume, consistency) |
| Sessions | 0 (one `List` group) |
| Session detail | 2 (join CTA, chat) + photo hero |
| Check-in | 1 (QR tool) + photo band |
| Log | 0 (two `List` groups) |
| Community feed | 1 (pinned community) |
| Community detail | 1 (next session) + photo hero + feed posts |
| Discover | browse grid of result cards (see §3 exception) + one `List` group inside the trainer sheet |
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
- Contrast: body text ≥ 4.5:1 on white **and** on cream; accents use
  `volt-700` (6.1:1 white / 5.7:1 cream), `ok-400` (5.5:1), `info-400` (5.5:1).
  `onvolt` on a lime fill is 12.6:1.
- Interactive rows are real `<button>`/`<a>` elements via `ListRow`/`Chip`.
- Minimum text size 11px.
- The viewport sets no `maximumScale` — pinch-zoom must stay available
  (WCAG 1.4.4). Mobile browsers zoom into a focused input below 16px, so
  `globals.css` holds inputs at 16px below `lg`. Desktop keeps 14–15px,
  where no focus zoom exists. *(The spec previously claimed 15px inputs
  avoided iOS zoom; the threshold is 16px, so that never held.)*
- `SectionHeader` actions take either `href` (navigation) or `onClick`
  (command), never both — the union makes `href: "#"` a type error.

---

## 9. Responsive

`lg` (1024px) is the only custom breakpoint — everything else is a Tailwind
default. Below `lg` every screen stays a single centred phone column
(`max-w-[440px]`); tablets included.

| | `< lg` | `≥ lg` |
|---|---|---|
| Navigation | `AppNav` — fixed bottom tab bar + floating log action | `AppSidebar` — fixed 248px left rail (264px at `xl`), brand + Log workout + tabs + Notifications |
| Content frame | `max-w-[440px]`, centred | `lg:pl-[248px]`, content `max-w-[1120px]` centred inside, `px-10` (`px-14` at `xl`) |
| Home | single column | explicit 12-col placement: personal rail (4) left, live feed (8) right |
| Discover | single-column result cards, chip rail and the "Recommended" row scroll edge-to-edge | same DOM, `lg:grid-cols-2` for results and `lg:grid-cols-3` for the Recommended row; search field capped at `lg:max-w-xl`, chip rail needs no scroll |
| Onboarding | one column | brand rail left + form card right |

The desktop layouts are built with `lg:col-start/row-start` on the **same
DOM** as mobile, so no section is rendered twice and the mobile reading order
is untouched. Top/bottom clearance for the fixed tab bar lives on `<main>`
alone — do not re-add it to the wrapper, or the two paddings stack.
