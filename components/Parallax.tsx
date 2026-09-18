"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Amplitude du déplacement (en % de la hauteur de la fenêtre). Positif :
   * l'élément "traîne" derrière le scroll (effet classique pour les images de
   * fond). Négatif : il devance légèrement le scroll. Rester discret : 0.06–0.15
   * pour des cartes, 0.1–0.2 pour une image plein cadre.
   */
  speed?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Décale verticalement son contenu en continu selon la position de l'élément
 * dans la fenêtre (effet de profondeur / parallax léger), au lieu du simple
 * fade-in "one-shot" de <Reveal>. Les deux se combinent : Parallax en
 * wrapper externe (mouvement continu au scroll), Reveal en interne
 * (apparition à l'entrée dans le viewport).
 *
 * Désactivé si prefers-reduced-motion, et atténué sur mobile (le scroll y est
 * plus saccadé et le gain visuel moindre).
 */
export default function Parallax({ children, speed = 0.12, className = "", style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    let inView = false;

    const update = () => {
      ticking = false;
      if (!inView) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const mobile = window.innerWidth < 768;
      // -1 (juste sorti en haut) → 0 (centré dans l'écran) → 1 (juste entré en bas)
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const amplitude = mobile ? speed * 0.4 : speed;
      el.style.setProperty("--parallax-y", `${(progress * amplitude * vh).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) onScroll();
      },
      { rootMargin: "25% 0px 25% 0px" }
    );
    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: "translateY(var(--parallax-y, 0px))", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}
