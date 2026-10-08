# Competitive landscape

Desk research done before the prototype was built. Two jobs: (a) confirm the
PRD's §37 rule — *"US/UK products provide inspiration, not the product
specification"* — and (b) find the gap this product sits in.

---

## 1. Global reference products

| Product | What it's strong at | What it isn't | Borrowed? |
|---|---|---|---|
| **Strava** | Activity log, clubs, kudos, segments. The default for "record a workout and see it socially." | Fitness-first communities in a single African city; session scheduling with capacity | Clubs → our Communities; **who's going** → `AvatarStack` |
| **Nike Run Club / Adidas Running** | Guided sessions, streaks, personal records, beautiful progress | No community formation, no local sessions | Streak + PR presentation |
| **Trainerize / TrainerFuel** | Coach↔client programming, habit check-ins | Built for trainers to sell, not for peers to find each other | Accountability nudge copy |
| **ClassPass / Mindbody** | Booking, credits, class inventory | Transactional. You book a slot, you don't join a *group* | Spot meter + capacity language |
| **MyFitnessPal** | Food and calorie tracking | Diary-heavy, not social, not location-aware | Nothing |
| **AllTrails** | Local discovery with distance-to-me and verified listings | Outdoor routes only | Discover's area + distance + "verified" row pattern |
| **WhatsApp groups** | Where Lagos fitness communities *actually* live today | No discovery, no schedule, no check-in, no record — the thread buries everything | Session flyer idea (deferred) |

### The recurring pattern
Every successful one combines **a record** (I trained), **a social layer**
(someone saw it) and **a next action** (here's the next session). Products
that ship only one of the three plateau — logging apps become solitary,
booking apps become utilities, groups become noise.

---

## 2. Nigerian / Lagos context

| Option today | Limitation |
|---|---|
| **WhatsApp & Telegram groups** | The incumbent. Discovery is word of mouth, schedules scroll away, there is no attendance record and no way to see who else is training near you |
| **Gym membership** | Access to a facility, not to a *people*. Check-in is invisible to peers |
| **Personal trainers** | One-to-many, expensive, doesn't scale past the trainer's own diary |
| **International fitness apps** | English/US content, US$ pricing, no Lagos geography, no ₦, no local activity vocabulary |

**Lagos-specific realities the incumbents don't handle:**

1. **Areas are the real geography.** Lekki, VI, Ikoyi, Yaba, Ikeja, Surulere
   behave as separate cities — commute time, not radius, decides membership.
2. **Group training is the norm.** Sunday runs, 5-a-side, outdoor yoga —
   people already train in groups; the tooling just doesn't exist.
3. **Trust is a feature.** Verified organisers, report/block, and never
   exposing a home address matter more than in a market with established
   platforms.
4. **Low bandwidth is normal.** A usable offline state and short copy are
   product features, not polish.
5. **Price in ₦, mobile-first only.** Desktop is not the entry point.

---

## 3. Where this product sits

```
                    transactional ◄──────────► community
                          │                        │
     ClassPass ●          │                        │        ● WhatsApp groups
     Mindbody ●           │                        │        ● Gym membership
                          │                        │
                          │            ● Show Up (this product)
                          │
              logging ────┼──── social
                          │
      MyFitnessPal ●      │                 ● Strava
      NRC ●               │
```

**Position:** *the community layer Lagos already has in WhatsApp, with the
record and schedule it's missing.*

Not a gym marketplace (Phase 2), not a calorie diary, not a coach's back
office. §34 — **people first, activities second, facilities third** — is the
tie-breaker for every layout decision in the prototype.

---

## 4. Implications for the prototype

| Finding | Decision |
|---|---|
| Every successful competitor shows *who* is coming | `AvatarStack` on Home, sessions, session detail, community |
| Booking apps feel transactional; groups feel noisy | Sessions carry capacity, organiser, chat **and** a community tie |
| Strava's progress is the most legible in the category | Progress rebuilt around one chart + consistency, not stat tiles |
| WhatsApp buries schedules | A dedicated weekly commitment line + notifications with a deliberately narrow scope |
| US products use US$ and US geography | Lagos areas, ₦ pricing, `en-NG` number formatting throughout |
| Low-bandwidth markets churn on slow loads | 5 curated photos (≤256 KB), gradient fallback, offline route |

---

## 5. What we deliberately did *not* copy

- **Feed-first home.** §34 puts people and the next session first; a social
  feed is one tab, not the landing screen.
- **Points/marketplace mechanics.** Monetisation waits for validated
  engagement (§28).
- **Calorie tracking.** Out of MVP; the log records the training, not the meal.
- **Gamified badges everywhere.** One streak flame and a PR marker — enough
  signal, no slot-machine loop.
