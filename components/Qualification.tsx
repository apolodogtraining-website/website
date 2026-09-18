import { ArrowIcon } from "./icons";
import Reveal from "./Reveal";
import Link from "next/link";

const situations = [
  "Les promenades sont devenues tendues : tirage, aboiements ou réactions imprévisibles.",
  "Votre chien semble anxieux, s'excite vite, détruit ou a du mal à rester seul.",
  "Vous souhaitez de meilleures bases : rappel, marche en laisse et écoute au quotidien.",
  "Vous cherchez une activité qui canalise vraiment son énergie et développe sa confiance.",
];

export default function Qualification() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Pour qui ?</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight text-ink md:text-4xl">Vous ne devriez pas avoir à choisir entre aimer votre chien et subir votre quotidien.</h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink-soft">Chaque chien communique à sa manière. Le point de départ est de comprendre ce qui se joue, sans étiquette ni solution toute faite.</p>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-darker hover:text-brand">Parler de votre situation <ArrowIcon className="h-4 w-4" /></Link>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {situations.map((s, i) => (
            <Reveal key={s} delay={i * 80} className="rounded-3xl border border-brand-light bg-brand-tint p-6">
              <span className="text-sm font-semibold text-brand">0{i + 1}</span>
              <p className="mt-6 text-base leading-relaxed text-ink">{s}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
