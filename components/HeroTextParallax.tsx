"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HeroTextParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Vitesse du décalage : le texte "s'éloigne" un peu plus vite que le scroll. */
  speed?: number;
};

/**
 * Fait dériver le bloc de texte du hero vers le haut, un peu plus vite que le
 * scroll, pour un léger effet de profondeur (le texte "s'efface" avant que la
 * photo ne défile). Scopé au hero (toujours en haut de page) donc basé
 * directement sur window.scrollY plutôt que sur la position de l'élément.
 *
 * Désactivé si prefers-reduced-motion, atténué sur mobile, et le calcul
 * s'arrête une fois le hero largement sorti de l'écran.
 */
export default function HeroTextParallax({ children, className = "", speed = 0.18 }: HeroTextParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      const y = window.scrollY;
      if (y > vh * 1.2) return;
      const mobile = window.innerWidth < 768;
      const amplitude = mobile ? speed * 0.5 : speed;
      el.style.setProperty("--hero-parallax-y", `${(-(y * amplitude)).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: "translateY(var(--hero-parallax-y, 0px))", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
