export const PHASES = ["sunrise", "day", "sunset", "night"] as const;

export type Phase = (typeof PHASES)[number];

export const PHASE_LABELS: Record<Phase, string> = {
  sunrise: "Sunrise",
  day: "Daylight",
  sunset: "Sunset",
  night: "Night",
};

/** Phase rendered on the server, before the browser knows the local time. */
export const DEFAULT_PHASE: Phase = "day";

export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && PHASES.includes(value as Phase);
}

// Keep the hour ranges in getPhase and PHASE_SCRIPT identical.
export function getPhase(hour: number): Phase {
  if (hour >= 5 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

/**
 * Runs synchronously while the browser parses <head>, before first paint, so
 * the sky for the visitor's local time is painted on the first frame.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const PHASE_SCRIPT = `(function(){try{var h=new Date().getHours();var p=h>=5&&h<8?"sunrise":h>=8&&h<17?"day":h>=17&&h<20?"sunset":"night";document.documentElement.setAttribute("data-phase",p)}catch(e){}})()`;
