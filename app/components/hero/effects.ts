import type { gsap as GSAP } from "gsap";
import type { Phase } from "@/app/lib/phase";

export type Gsap = typeof GSAP;
type Timeline = ReturnType<Gsap["timeline"]>;
type Select = (selector: string) => Element[];

/**
 * One small, looping timeline per phase. The layers are positioned at the
 * pointer by HeroEffects; these only animate their appearance. Every effect
 * starts from the resting state (opacity 0) and is stopped by fading the
 * `.fx` layers out, so builders only describe the "on" state.
 */

// A soft glare at the pointer that breathes gently. Tinted per phase in CSS.
function glare(gsap: Gsap, q: Select, peak: number) {
  const glint = q(".fx-glint");
  return gsap
    .timeline()
    .fromTo(
      glint,
      { opacity: 0, scale: 0.6, rotation: -8 },
      { opacity: peak, scale: 1, rotation: 0, duration: 0.6, ease: "power2.out" },
      0,
    )
    .to(
      glint,
      { scale: 0.9, rotation: 8, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true },
      0.6,
    );
}

export const EFFECTS: Record<Phase, (gsap: Gsap, q: Select) => Timeline> = {
  sunrise: (gsap, q) => glare(gsap, q, 0.8),

  // Glare plus two faint lens-flare ghosts mirrored through the container's center.
  day: (gsap, q) =>
    glare(gsap, q, 1).to(
      q(".fx-flare"),
      { opacity: 0.6, duration: 0.6, ease: "power2.out", stagger: 0.1 },
      0.1,
    ),

  // A small warm glow breathes around the pointer while embers drift up.
  sunset(gsap, q) {
    const glow = q(".fx-glow");
    return gsap
      .timeline()
      .fromTo(
        glow,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.9, scale: 1, duration: 0.8, ease: "sine.out" },
        0,
      )
      .to(
        glow,
        { scale: 1.08, opacity: 0.65, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true },
        0.8,
      )
      .set(q(".fx-embers"), { opacity: 1 }, 0)
      .fromTo(
        q(".fx-ember"),
        { opacity: 0, x: 0, y: 0 },
        {
          keyframes: { opacity: [0, 0.9, 0], ease: "none" },
          x: () => gsap.utils.random(-6, 6),
          y: () => gsap.utils.random(-24, -12),
          duration: () => gsap.utils.random(1.6, 2.4),
          ease: "sine.out",
          repeat: -1,
          repeatRefresh: true,
          stagger: { each: 0.5, from: "random" },
        },
        0.3,
      );
  },

  // A single star spark next to the pointer that twinkles slowly.
  night(gsap, q) {
    const spark = q(".fx-spark");
    return gsap
      .timeline()
      .fromTo(
        spark,
        { opacity: 0, scale: 0.6, rotation: -30 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" },
        0,
      )
      .to(
        spark,
        { opacity: 0.4, scale: 0.8, rotation: 15, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true },
        0.6,
      );
  },
};
