"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Photo en léger parallax : elle défile un peu plus lentement que le reste
 * de la section, pour une impression de profondeur. La photo est surdimensionnée
 * (inset -10%) pour ne jamais laisser de bord vide pendant le déplacement ;
 * le conteneur parent (rounded-[2rem] overflow-hidden dans Method.tsx) la
 * rogne à la forme visible.
 *
 * Coupé si prefers-reduced-motion : un décalage arrière-plan/premier-plan à
 * des vitesses différentes pendant le scroll est un déclencheur connu de
 * troubles vestibulaires (WCAG 2.3.3), pas juste une question de confort.
 */
export default function MethodPhoto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <div ref={ref} className="absolute inset-[-10%]">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/photos/methode.jpg"
          alt="Frédéric accompagne un chien lors d'une séance"
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
