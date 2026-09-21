"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronDownIcon } from "./icons";

/**
 * Invite à défiler, en bas du hero. S'estompe avec le scroll et disparaît une
 * fois qu'on a commencé à lire la page. Le rebond est coupé si
 * prefers-reduced-motion, mais le repère reste visible (statique).
 */
export default function ScrollCue() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-7 hidden flex-col items-center gap-2 text-white/70 sm:flex"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Défiler</span>
      <motion.span
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDownIcon className="h-5 w-5" />
      </motion.span>
    </motion.div>
  );
}
