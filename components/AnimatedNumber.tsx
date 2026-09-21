"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  className?: string;
};

/**
 * Anime un nombre de 0 à `value` quand il entre dans le viewport (une seule
 * fois). Le texte rendu au départ (SSR compris) est déjà la valeur finale :
 * l'animation est un bonus visuel, jamais une condition pour lire le
 * chiffre sans JS.
 */
export default function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = latest.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
