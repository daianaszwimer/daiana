"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { InlineScript } from "@/app/components/inline-script";
import {
  DEFAULT_PHASE,
  PHASES,
  PHASE_LABELS,
  getPhase,
  isPhase,
  type Phase,
} from "@/app/lib/phase";

function readInitialPhase(): Phase {
  if (typeof window === "undefined") return DEFAULT_PHASE;
  // The inline script in layout.tsx already set this before paint.
  const fromDom = document.documentElement.dataset.phase;
  return isPhase(fromDom) ? fromDom : getPhase(new Date().getHours());
}

export function PhaseSelect({ className = "" }: { className?: string }) {
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const [phase, setPhase] = useState<Phase>(readInitialPhase);

  // Applies dropdown changes. Also restores the attribute after React's
  // dev-only Strict Mode remount clears attributes on <html>, and keeps the
  // <select> in sync, since hydration keeps the server-rendered option.
  useLayoutEffect(() => {
    document.documentElement.dataset.phase = phase;
    if (selectRef.current) selectRef.current.value = phase;
  }, [phase]);

  return (
    <label className={`block ${className}`}>
      <span className="sr-only">Time of day</span>
      <select
        id={id}
        ref={selectRef}
        value={phase}
        onChange={(e) => {
          if (isPhase(e.target.value)) setPhase(e.target.value);
        }}
        suppressHydrationWarning
        className="cursor-pointer rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-[var(--fg)] backdrop-blur-md transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]"
      >
        {PHASES.map((p) => (
          <option key={p} value={p} className="text-black">
            {PHASE_LABELS[p]}
          </option>
        ))}
      </select>
      {/* Shows the right option before hydration on a hard load. */}
      <InlineScript
        html={`{var s=document.getElementById(${JSON.stringify(id)});var p=document.documentElement.getAttribute("data-phase");if(s&&p)s.value=p}`}
      />
    </label>
  );
}
