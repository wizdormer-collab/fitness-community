"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Curated photography for the surfaces where a picture earns its place:
 * the hero, today's session, the community band, check-in, the empty state,
 * and the activity browse cards (see `photoForActivity`). Everything else
 * stays typographic — the PRD and the redesign brief both push back on
 * decorative imagery, so this component is deliberately small.
 *
 * Assets live in public/photos and were downloaded under the Unsplash License
 * (<=1600px wide, ~110-255 KB each).
 * If a file is ever missing, the frame falls back to a volt→ink gradient so
 * the layout never collapses to an empty box.
 */

export type PhotoName =
  | "hero-run"
  | "session"
  | "checkin"
  | "community"
  | "empty"
  | "group"
  | "gym"
  | "running"
  | "yoga"
  | "swimming"
  | "football"
  | "cycling";

/**
 * Activity → photography for browse cards (Home's nearby grid, Discover's
 * result cards). Only the six activities that appear in `SESSIONS` get a
 * dedicated frame; anything else falls back to the generic session image so a
 * new activity added to the data never renders a broken box.
 */
const ACTIVITY_PHOTO: Partial<Record<string, PhotoName>> = {
  gym: "gym",
  running: "running",
  yoga: "yoga",
  swimming: "swimming",
  football: "football",
  cycling: "cycling",
};

export function photoForActivity(activity: string): PhotoName {
  return ACTIVITY_PHOTO[activity] ?? "session";
}

export function Photo({
  name,
  alt,
  className,
  ratio = "aspect-[3/2]",
  sizes = "(max-width: 440px) 100vw, 440px",
  priority = false,
  scrim = false,
}: {
  name: PhotoName;
  alt: string;
  className?: string;
  /** Tailwind aspect utility — pass "" when the parent already sets height. */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  /** Adds a top-to-bottom darkening veil so overlaid text stays readable. */
  scrim?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn(
          ratio,
          "bg-gradient-to-br from-volt-300 via-ink-750 to-ink-700",
          className,
        )}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-ink-750", ratio, className)}>
      <Image
        src={`/photos/${name}.jpg`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={() => setFailed(true)}
      />
      {scrim && (
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-50/70 via-ink-50/10 to-transparent"
        />
      )}
    </div>
  );
}
