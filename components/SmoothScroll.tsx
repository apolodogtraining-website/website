"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Côté serveur (et avant hydratation) on ne peut pas savoir : on part sans
// Lenis, le scroll natif s'applique le temps que le client tranche.
function getServerSnapshot() {
  return false;
}

/**
 * Scroll inertiel sur tout le site (molette desktop ; le tactile garde son
 * scroll natif, Lenis ne le lisse pas par défaut). Désactivé si
 * prefers-reduced-motion, y compris si ce réglage change en cours de visite.
 * Désactivé aussi sur le portail (/portail) : écrans de gestion, tableaux et
 * modales, où le scroll natif est plus prévisible.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const motionOk = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const inPortal = usePathname().startsWith("/portail");

  if (!motionOk || inPortal) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}
