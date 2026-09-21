"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowIcon, StarIcon } from "./icons";
import ZoneModal from "./ZoneModal";

type HeroIntroProps = {
  rating: number;
  total: number;
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Contenu texte du hero, révélé en cascade au chargement (chaque bloc avec un
 * léger décalage). `.motion-safe` neutralise l'état "hidden" initial sans JS
 * ou avec prefers-reduced-motion (voir globals.css) : sans ce filet, le texte
 * le plus important de la page resterait invisible pour ces visiteurs.
 */
export default function HeroIntro({ rating, total }: HeroIntroProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <motion.div variants={item} className="motion-safe flex items-center gap-3 text-white/90">
        <div className="flex text-[#fbbc05]">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-5 w-5" />
          ))}
        </div>
        <p className="text-sm font-medium">
          {rating.toFixed(1)}/5 sur Google · {total} avis clients
        </p>
      </motion.div>

      <motion.h1
        variants={item}
        className="motion-safe mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl"
      >
        Rééduquez votre chien grâce aux <span className="text-brand">activités de flair.</span>
      </motion.h1>

      <motion.p variants={item} className="motion-safe mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
        Observez les premiers changements{" "}
        <strong className="font-semibold text-white">
          dès les premières séances et retrouvez un chien plus calme
        </strong>
        , concentré et épanoui en quelques semaines grâce à l&apos;obéissance fonctionnelle, au Tracking, à la détection sportive, au Hunting Game.
      </motion.p>

      <motion.div variants={item} className="motion-safe mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          Réserver une évaluation
          <ArrowIcon className="h-5 w-5" />
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-ink"
        >
          Découvrir les accompagnements
        </Link>
      </motion.div>

      <motion.div variants={item} className="motion-safe">
        <ZoneModal variant="badge" />
      </motion.div>
    </motion.div>
  );
}
