"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { Comment, Heart } from "@/components/ui/icons";
import { usePrototype } from "@/lib/prototype-state";
import type { Post } from "@/lib/types";

const ACCENTS: Record<string, string> = {
  run: "from-info-500/20 to-info-600/5 ring-info-500/25",
  pr: "from-volt-400/20 to-volt-600/5 ring-volt-400/30",
  streak: "from-warn-500/20 to-warn-600/5 ring-warn-500/30",
  photo: "from-[#c084fc]/20 to-[#8b3ff0]/5 ring-[#c084fc]/25",
  recovery: "from-ok-500/20 to-ok-600/5 ring-ok-500/25",
};

const ACCENT_LABEL: Record<string, string> = {
  run: "Run logged",
  pr: "Personal record",
  streak: "Streak",
  photo: "Photo",
  recovery: "Recovery",
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
      {accent && (
        <div
          className={cn(
            "flex items-center justify-between bg-gradient-to-r px-4 py-2 ring-1 ring-inset",
            accent,
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-200">
            {ACCENT_LABEL[post.accent ?? ""]}
          </span>
          <span className="num text-[10px] text-ink-400">{post.ago} ago</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={initialsOf(post.authorName)} tone={post.authorTone} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-50">
              {post.authorName}
            </p>
            <p className="num truncate text-[11px] text-ink-500">
              {post.ago} ago
            </p>
          </div>
          {post.kind === "milestone" && <Badge tone="warn">Milestone</Badge>}
          {post.kind === "achievement" && <Badge tone="volt">PR</Badge>}
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-ink-100">
          {post.text}
        </p>

        {post.stats.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {post.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-ink-750 px-2.5 py-2.5 text-center"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-500">
                  {s.label}
                </p>
                <p className="num mt-1 text-[13px] font-bold text-volt-400">
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
              liked ? "text-volt-400" : "text-ink-400 hover:text-ink-200",
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
                  <p className="num mt-1 text-[10px] text-ink-600">{c.ago}</p>
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
