"use client";

import { useEffect, useId, useRef, useState } from "react";

const GLASS = "border border-white/20 bg-black/50 text-white";

export function InfoTip({ className = "" }: { className?: string }) {
  const tipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  // Toggled by taps; hover and keyboard focus are handled in CSS.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-open={open}
      className={`group flex items-center ${className}`}
    >
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute right-full mr-2 w-max max-w-[calc(100vw-5rem)] translate-x-1 rounded-full px-3 py-1.5 text-sm opacity-0 transition duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0 group-hover:opacity-100 group-has-[:focus-visible]:translate-x-0 group-has-[:focus-visible]:opacity-100 group-data-[open=true]:translate-x-0 group-data-[open=true]:opacity-100 motion-reduce:translate-x-0 ${GLASS}`}
      >
        The sky follows your local time
      </span>
      <button
        type="button"
        aria-label="About the background"
        aria-expanded={open}
        aria-describedby={tipId}
        onClick={() => setOpen((o) => !o)}
        className={`grid size-8 cursor-pointer place-items-center rounded-full transition-[background-color,scale] duration-[160ms] ease-out hover:bg-black/60 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)] ${GLASS}`}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M8 7.25v4" />
          <circle cx="8" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
