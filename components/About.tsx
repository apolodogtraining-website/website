import Image from "next/image";
import { site } from "@/lib/site";
import Reveal from "./Reveal";

const values = [
  {
    title: "Bienveillance",
    text: "Des méthodes positives et respectueuses, sans contrainte ni violence.",
  },
  {
    title: "Expertise",
    text: "Une approche personnalisée, fondée sur la compréhension du comportement canin.",
  },
  {
    title: "Engagement",
    text: "Un accompagnement de A à Z, à vos côtés jusqu'à l'atteinte de vos objectifs.",
  },
];

type AboutProps = {
  /** Niveau de titre : `h1` sur la page dédiée /a-propos, `h2` en section d'accueil. */
  as?: "h1" | "h2";
  heading?: string;
};

export default function About({ as: Heading = "h2", heading }: AboutProps) {
  return (
    <section id="a-propos" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft lg:aspect-[4/5]">
            <Image
              src="/photos/a-propos.jpg"
              alt={`${site.trainer}, ${site.role}`}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-brand px-6 py-5 text-white shadow-brand sm:block lg:-right-6">
            <p className="text-3xl font-bold leading-none">100%</p>
            <p className="mt-1 text-sm font-medium text-white/90">
              méthodes
              <br />
              positives
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            À propos
          </span>
          <Heading className="mt-3 text-balance break-words text-3xl font-bold uppercase text-ink lg:text-4xl">
            {heading ?? `${site.trainer}, votre éducateur & comportementaliste canin`}
          </Heading>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft">
            <p>
              Passionné par la relation entre l&apos;humain et le chien, j&apos;accompagne
              les propriétaires de la métropole bordelaise pour construire une
              complicité durable et un chien épanoui, équilibré et bien dans ses
              pattes.
            </p>
            <p>
              Chaque chien est unique&nbsp;: plutôt que des recettes toutes
              faites, je m&apos;appuie sur l&apos;observation, la compréhension de ses
              besoins et de ses instincts naturels pour proposer un travail sur
              mesure, dans le respect de son rythme.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-brand-light bg-brand-tint p-4"
              >
              <p className="font-semibold text-brand-darker">{v.title}</p>
                <p className="mt-1 text-sm leading-snug text-ink-soft">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
