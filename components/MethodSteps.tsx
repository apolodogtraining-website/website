"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type Step = readonly [string, string, string];

/**
 * Liste des étapes avec une ligne verticale qui se remplit au fil du scroll
 * (repère de progression), derrière des pastilles numérotées.
 */
export default function MethodSteps({ steps }: { steps: readonly Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scaleY = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <div ref={ref} className="relative mt-9">
      <span aria-hidden className="absolute left-6 top-6 bottom-6 w-px -translate-x-1/2 bg-white/15" />
      <motion.span
        aria-hidden
        style={{ scaleY }}
        className="absolute left-6 top-6 bottom-6 w-px -translate-x-1/2 origin-top bg-brand"
      />
      <div className="divide-y divide-white/15">
        {steps.map(([number, title, text]) => (
          <div key={number} className="grid grid-cols-[3rem_1fr] gap-3 py-5">
            <span className="relative flex h-9 w-9 items-center justify-center justify-self-center rounded-full border border-white/15 bg-ink text-xs font-semibold text-brand">
              {number}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-white/70">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
