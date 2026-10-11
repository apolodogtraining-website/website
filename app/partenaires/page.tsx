import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { partners } from "@/lib/site";
import { ArrowIcon, MapPinIcon } from "@/components/icons";
import Link from "next/link";
import { breadcrumb, graph, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mes partenaires",
  description:
    "Le réseau de professionnels que Frédéric recommande pour tout besoin hors de ses compétences : formation, agility, nutrition, animalerie.",
  alternates: { canonical: "/partenaires" },
};

const jsonLd = graph(breadcrumb([{ name: "Partenaires", path: "/partenaires" }]));

export default function PartenairesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Header />
      <main className="pt-20">
        <section className="bg-brand-tint py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Réseau de confiance
            </span>
            <h1 className="mt-2 text-balance text-5xl font-semibold leading-tight text-ink md:text-6xl">
              Mes partenaires
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Pour chaque besoin hors de mes compétences, je fais confiance à
              ces professionnels que je recommande personnellement.
            </p>
          </div>
        </section>

        <section className="bg-surface pb-16 pt-8 md:pb-24 md:pt-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 xl:grid-cols-4">
            {partners.map((partner, i) => (
              <Reveal key={partner.name} delay={(i % 4) * 80} variant="scale" className="h-full">
                <TiltCard
                  as="article"
                  className="group flex h-full flex-col rounded-3xl border border-brand-light bg-surface p-5 transition-colors duration-300 hover:border-brand/40 hover:shadow-brand"
                >
                  <div className="tilt-card-pop flex h-36 items-center justify-center rounded-2xl bg-ink">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={`Logo ${partner.name}`}
                        width={240}
                        height={120}
                        className="h-24 w-auto max-w-[70%] object-contain"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-xl font-bold text-brand-darker">
                        {partner.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
                    <h2 className="text-xl font-semibold leading-snug text-ink">{partner.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-brand-darker">{partner.tag}</span>
                      <span className="flex items-center gap-1 text-xs text-ink-soft">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {partner.location}
                      </span>
                    </div>
                    <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{partner.description}</p>
                    {/* Lien étiré : toute la carte est cliquable, le lien reste le seul élément focalisable. */}
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-darker transition-colors after:absolute after:inset-0 after:rounded-3xl hover:text-brand"
                    >
                      Visiter le site<span className="sr-only"> de {partner.name}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </a>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="overflow-hidden rounded-none bg-brand px-6 py-14 text-center text-cta shadow-brand sm:px-10">
              <h2 className="text-balance text-3xl font-bold uppercase md:text-4xl">
                Vous ne savez pas vers qui vous tourner ?
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-cta/85">
                Contactez-moi, je vous orienterai vers le bon professionnel
                selon votre situation.
              </p>
              <Link
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-none bg-deep px-6 py-3.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                Me contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
