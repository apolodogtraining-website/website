"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
  /** Amplitude maximale de rotation, en degrés. */
  max?: number;
};

/**
 * Incline la carte en suivant le curseur (perspective + rotateX/rotateY) et
 * fait glisser un reflet radial sous le pointeur, pour un effet de carte 3D.
 *
 * Désactivé au clavier/tactile (pas de pointeur "mouse") et si
 * prefers-reduced-motion, pour éviter un effet parasite ou coûteux là où il
 * n'a pas de sens.
 */
export default function TiltCard({ children, className = "", as: Tag = "div", max = 10 }: TiltCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || reduced.current) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--tilt-rx", `${((0.5 - py) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--tilt-ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--tilt-glare-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--tilt-glare-y", `${(py * 100).toFixed(1)}%`);
      el.style.setProperty("--tilt-glare-o", "1");
      el.style.setProperty("--tilt-scale", "1.02");
    });
  }

  function handlePointerLeave() {
    const el = ref.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    el.style.setProperty("--tilt-rx", "0deg");
    el.style.setProperty("--tilt-ry", "0deg");
    el.style.setProperty("--tilt-glare-o", "0");
    el.style.setProperty("--tilt-scale", "1");
  }

  const Component = Tag as "div";

  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement>}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`tilt-card ${className}`}
    >
      {children}
      <span className="tilt-card-glare" aria-hidden="true" />
    </Component>
  );
}
