"use client";

import { useEffect } from "react";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Anime les calques du hero (bandes bleues, chien, sol) selon le défilement, dans les deux sens.
 * Ne rend rien : il ne fait qu'écrire des variables CSS sur la scène (transform uniquement).
 * Avec « réduire les animations », la scène reste statique (voir aussi le CSS).
 */
export default function HeroScroll() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-hero]");
    const scene = section?.querySelector<HTMLElement>("[data-hero-scene]");
    if (!section || !scene) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let queued = false;

    const render = () => {
      queued = false;
      const travel = section.offsetHeight - scene.offsetHeight;
      const p = media.matches || travel <= 0 ? 0 : clamp(-section.getBoundingClientRect().top / travel);
      const mobile = window.innerWidth <= 700;
      scene.style.setProperty("--rear-x", `${-p * (mobile ? 15 : 35)}px`);
      scene.style.setProperty("--rear-y", `${p * 22}px`);
      scene.style.setProperty("--dog-y", `${-p * (mobile ? 4 : 8)}px`);
      scene.style.setProperty("--dog-scale", `${1 + p * 0.008}`);
      scene.style.setProperty("--ground-y", `${-p * 3}px`);
      scene.style.setProperty("--front-y", `${-p * scene.offsetHeight * (mobile ? 0.34 : 0.68)}px`);
    };
    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(render);
      }
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return null;
}
