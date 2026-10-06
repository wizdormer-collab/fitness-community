"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto thin-scrollbar animate-sheet-up rounded-t-3xl border-t border-ink-700 bg-ink-850 px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-600" />
        {title && (
          <h2 className="mb-4 font-display text-lg font-bold text-ink-50">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
