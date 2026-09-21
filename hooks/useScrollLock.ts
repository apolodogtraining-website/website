"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Bloque le scroll de la page (menu mobile, modales, lecteur plein écran).
 * Met aussi Lenis en pause : `overflow: hidden` seul ne suffit pas, Lenis
 * continue sinon de répondre à la molette et le fond défile derrière la
 * modale.
 */
export default function useScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [locked, lenis]);
}
