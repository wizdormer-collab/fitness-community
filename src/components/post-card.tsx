"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { Comment, Heart } from "@/components/ui/icons";
import { usePrototype } from "@/lib/prototype-state";
import type { Post } from "@/lib/types";

const ACCENTS: Record<string, { tone: "ok" | "warn" | "info" | "volt" | "muted"; label: string }> = {
  run: { tone: "info", label: "Run logged" },
  pr: { tone: "volt", label: "Personal record" },
  streak: { tone: "warn", label: "Streak" },
  photo: { tone: "muted", label: "Photo" },
  recovery: { tone: "ok", label: "Recovery" },
};

export function PostCard({ post }: { post: Post }) {
  const { isPostLiked, toggleLike } = usePrototype();
  const [expanded, setExpanded] = useState(false);
  const liked = isPostLiked(post.id);
  const likeDelta = liked && !post.liked ? 1 : !liked && post.liked ? -1 : 0;
  const likeCount = post.likes + likeDelta;
  const accent = ACCENTS[post.accent ?? ""];

  return (
    <Card className="overflow-hidden animate-fade-up">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={initialsOf(post.authorName)} tone={post.authorTone} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-50">
              {post.authorName}
            </p>
            <p className="num truncate text-[12px] text-ink-500">
              {post.ago} ago
            </p>
          </div>
          {post.kind === "milestone" && <Badge tone="warn">Milestone</Badge>}
          {post.kind === "achievement" && <Badge tone="volt">PR</Badge>}
        </div>

        {accent && (
          <p className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-volt-700">
            <span className="h-px w-5 bg-volt-600" aria-hidden />
            {accent.label}
          </p>
        )}

        <p className="mt-2 text-[15px] leading-relaxed text-ink-100">
          {post.text}
        </p>

        {post.stats.length > 0 && (
          <div className="mt-3.5 grid grid-cols-3 divide-x divide-ink-700 border-y border-ink-700">
            {post.stats.map((s) => (
              <div key={s.label} className="px-2.5 py-2.5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  {s.label}
                </p>
                <p className="num mt-0.5 text-[13px] font-bold text-volt-700">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-1 border-t border-ink-700 pt-3">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            aria-pressed={liked}
            aria-label="Like"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition active:scale-95",
              liked ? "text-volt-700" : "text-ink-400 hover:text-ink-200",
            )}
          >
            <Heart className="h-4 w-4" filled={liked} />
            <span className="num">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-400 transition hover:text-ink-200 active:scale-95"
          >
            <Comment className="h-4 w-4" />
            <span className="num">{post.comments.length}</span>
          </button>

          <button
            type="button"
            className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-400 transition hover:text-ink-200 active:scale-95"
          >
            Share
          </button>
        </div>

        {expanded && post.comments.length > 0 && (
          <ul className="mt-3 space-y-3 border-t border-ink-700 pt-3 animate-fade-up">
            {post.comments.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                <Avatar
                  initials={initialsOf(c.authorName)}
                  tone={c.authorName.length % 8}
                  size="xs"
                />
                <div className="min-w-0 flex-1 rounded-xl bg-ink-750 px-3 py-2">
                  <p className="text-[12px] font-bold text-ink-100">
                    {c.authorName}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-300">
                    {c.text}
                  </p>
                  <p className="num mt-1 text-[11px] text-ink-600">{c.ago}</p>
                </div>
              </li>
            ))}
            <li>
              <input
                placeholder="Add a comment…"
                className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-2.5 text-sm text-ink-100 outline-none placeholder:text-ink-600 focus:border-volt-400"
              />
            </li>
          </ul>
        )}
      </div>
    </Card>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
