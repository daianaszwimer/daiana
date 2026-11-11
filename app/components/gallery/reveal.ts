/**
 * Reveals each `[data-reveal]` inside `root` once as it scrolls into view, and
 * marks each painting's `<img>` as loaded so it can fade in.
 *
 * Runs twice by design: as an inline script during HTML parsing (so it works
 * before React hydrates), and from a layout effect on client-side navigations.
 * It is stringified into that script, so it must stay self-contained: no
 * imports and no variables from outside the function.
 */
export function setupReveal(root: HTMLElement | null) {
  if (!root || root.hasAttribute("data-reveal-ready")) return;
  root.setAttribute("data-reveal-ready", "");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-shown", "");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  root.querySelectorAll<HTMLImageElement>(".g-window img").forEach((img) => {
    const done = () => img.setAttribute("data-loaded", "");
    if (img.complete) return done();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

/** Inline script that runs `setupReveal` on the element with this id. */
export function revealScript(id: string) {
  return `(${setupReveal.toString()})(document.getElementById(${JSON.stringify(id)}))`;
}
