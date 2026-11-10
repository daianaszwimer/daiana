"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { isPhase } from "@/app/lib/phase";
import { EFFECTS, type Gsap } from "./effects";

type QuickTo = ReturnType<Gsap["quickTo"]>;

type Runtime = {
  gsap: Gsap;
  ctx: ReturnType<Gsap["context"]>;
  q: (selector: string) => Element[];
  timeline?: ReturnType<Gsap["timeline"]>;
  followers: { k: number; dx: number; dy: number; x: QuickTo; y: QuickTo }[];
};

// GSAP is loaded on demand so it stays out of the first-load bundle
// (see node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md).
let gsapPromise: Promise<Gsap> | null = null;
function loadGsap() {
  gsapPromise ??= import("gsap").then((m) => m.gsap);
  return gsapPromise;
}

type Follower = { className: string; k: number; lag: number; dx?: number; dy?: number };

/**
 * Layers that track the pointer. `k` places the layer along the line from the
 * container's center through the cursor: 1 = on the cursor, negative = mirrored
 * (lens-flare ghosts). `dx`/`dy` nudge it off the cursor, in px. `lag` is how
 * long it takes to catch up, in seconds.
 */
const BACK_FOLLOWERS: Follower[] = [{ className: "fx-glow size-28", k: 1, lag: 0.8 }];
const FRONT_FOLLOWERS: Follower[] = [
  { className: "fx-glint size-12", k: 1, lag: 0.35 },
  { className: "fx-flare size-5", k: -0.35, lag: 0.6 },
  { className: "fx-flare size-7", k: -0.8, lag: 0.6 },
  { className: "fx-spark size-4", k: 1, lag: 0.5, dx: 14, dy: -14 },
];

// Fixed positions (in % of the cluster) so server and client markup match.
const EMBERS = [
  { left: 30, top: 60 },
  { left: 50, top: 70 },
  { left: 65, top: 55 },
  { left: 42, top: 50 },
];

const TAP_DURATION_MS = 3200;

export function HeroEffects({
  children,
  className = "",
}: {
  children: ReactNode;
  /** Sizes the hover/tap area; effects play anywhere inside it. */
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const active = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const tapTimer = useRef<number | undefined>(undefined);

  function ensureRuntime(gsap: Gsap) {
    if (runtime.current || !rootRef.current) return runtime.current;
    const q = gsap.utils.selector(rootRef.current);
    const ctx = gsap.context(() => {}, rootRef.current);
    const rt: Runtime = { gsap, ctx, q, followers: [] };
    // Newer tweens take over conflicting properties (e.g. a fade-out in progress).
    gsap.defaults({ overwrite: "auto" });
    ctx.add(() => {
      const els = q(".fx-follow") as HTMLElement[];
      gsap.set(els, { xPercent: -50, yPercent: -50 });
      rt.followers = els.map((el) => {
        const vars = { duration: Number(el.dataset.lag), ease: "power3" };
        return {
          k: Number(el.dataset.k),
          dx: Number(el.dataset.dx ?? 0),
          dy: Number(el.dataset.dy ?? 0),
          x: gsap.quickTo(el, "x", vars),
          y: gsap.quickTo(el, "y", vars),
        };
      });
    });
    runtime.current = rt;
    return rt;
  }

  /** Moves followers toward the pointer; `jump` snaps them there instantly. */
  function follow(jump = false) {
    const rt = runtime.current;
    const root = rootRef.current;
    if (!rt || !root || !pointer.current) return;
    const { width, height } = root.getBoundingClientRect();
    const cx = width / 2;
    const cy = height / 2;
    const { x, y } = pointer.current;
    for (const f of rt.followers) {
      const tx = cx + (x - cx) * f.k + f.dx;
      const ty = cy + (y - cy) * f.k + f.dy;
      if (jump) {
        f.x(tx, tx);
        f.y(ty, ty);
      } else {
        f.x(tx);
        f.y(ty);
      }
    }
  }

  function fadeOut(rt: Runtime) {
    rt.gsap.to(rt.q(".fx"), { opacity: 0, duration: 0.5, ease: "power2.out" });
  }

  // (Re)starts the effect for whatever phase <html data-phase> currently has.
  function start(jump: boolean) {
    const rt = runtime.current;
    const phase = document.documentElement.dataset.phase;
    if (!rt || !isPhase(phase)) return;
    rt.ctx.add(() => {
      rt.timeline?.kill();
      fadeOut(rt);
      rt.timeline = EFFECTS[phase](rt.gsap, rt.q);
    });
    follow(jump);
  }

  function stop() {
    active.current = false;
    const rt = runtime.current;
    if (!rt) return;
    rt.ctx.add(() => {
      rt.timeline?.kill();
      rt.timeline = undefined;
      fadeOut(rt);
    });
  }

  async function play() {
    active.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gsap = await loadGsap();
    // The pointer may have left while GSAP was loading.
    if (!active.current || !ensureRuntime(gsap)) return;
    start(true);
  }

  function trackPointer(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  useEffect(() => {
    // Warm GSAP once the browser is idle so the first hover is instant.
    // Safari has no requestIdleCallback, so fall back to a timeout there.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => void loadGsap(), { timeout: 2000 })
      : setTimeout(() => void loadGsap(), 1500);

    // Swap effects if the phase dropdown changes mid-hover.
    const observer = new MutationObserver(() => {
      if (active.current) start(false);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-phase"],
    });

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
      window.clearTimeout(tapTimer.current);
      observer.disconnect();
      runtime.current?.ctx.revert();
      runtime.current = null;
      active.current = false;
    };
    // start() only reads refs, so it is safe to capture once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        trackPointer(e);
        void play();
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        trackPointer(e);
        follow();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        stop();
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        trackPointer(e);
        window.clearTimeout(tapTimer.current);
        if (active.current) follow(true);
        void play();
        tapTimer.current = window.setTimeout(stop, TAP_DURATION_MS);
      }}
    >
      {/* Behind the text */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {BACK_FOLLOWERS.map((f) => (
          <FollowerLayer key={f.className} {...f} />
        ))}
      </div>

      <div className="relative">{children}</div>

      {/* In front of the text */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FRONT_FOLLOWERS.map((f) => (
          <FollowerLayer key={f.className} {...f} />
        ))}
        <div
          data-k={1}
          data-lag={0.5}
          className="fx fx-follow fx-embers absolute left-0 top-0 size-16"
        >
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="fx-ember absolute size-0.5"
              style={{ top: `${e.top}%`, left: `${e.left}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FollowerLayer({ className, k, lag, dx, dy }: Follower) {
  return (
    <div
      data-k={k}
      data-lag={lag}
      data-dx={dx}
      data-dy={dy}
      className={`fx fx-follow absolute left-0 top-0 ${className}`}
    />
  );
}
