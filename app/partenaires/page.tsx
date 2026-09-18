import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
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
      <main className="pt-28">
        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Réseau de confiance
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-6xl">
              Mes partenaires
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Pour chaque besoin hors de mes compétences, je fais confiance à
              ces professionnels que je recommande personnellement.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-2">
            {partners.map((partner) => (
              <article
                key={partner.name}
                className="flex flex-col rounded-3xl border border-brand-light p-7 shadow-soft"
              >
                <div className="flex h-20 w-20 items-center justify-center">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-lg font-bold text-brand-darker">
                      {partner.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-darker">
                    {partner.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {partner.location}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-ink">
                  {partner.name}
                </h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-soft">
                  {partner.description}
                </p>

                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-darker hover:text-brand"
                >
                  Visiter le site
                  <ArrowIcon className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-darker px-6 py-14 text-center text-white shadow-brand sm:px-10">
              <h2 className="text-balance text-2xl font-bold uppercase md:text-3xl">
                Vous ne savez pas vers qui vous tourner ?
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/85">
                Contactez-moi, je vous orienterai vers le bon professionnel
                selon votre situation.
              </p>
              <Link
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-brand-darker shadow-soft transition-transform hover:-translate-y-0.5"
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
