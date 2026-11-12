import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { ArrowIcon, BallIcon, BookIcon, CalmIcon, CareIcon, LeashIcon, TugIcon } from "@/components/icons";
import { accessoryCategories, accessoryCount, amazonDisclosure, type AccessoryIcon } from "@/lib/accessories";
import { breadcrumb, graph, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Accessoires recommandés pour votre chien",
  description:
    "Le matériel que Frédéric conseille à ses clients : longe de pistage, tugs, balles résistantes, tapis de léchage, soins et lectures pour comprendre son chien.",
  alternates: { canonical: "/accessoires" },
};

const jsonLd = graph(breadcrumb([{ name: "Accessoires recommandés", path: "/accessoires" }]));

const icons: Record<AccessoryIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  leash: LeashIcon,
  tug: TugIcon,
  ball: BallIcon,
  calm: CalmIcon,
  care: CareIcon,
  book: BookIcon,
};

export default function AccessoiresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Header />
      <main className="pt-28">
        <section className="bg-brand-tint py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Mes recommandations
            </span>
            <h1 className="mt-2 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Les accessoires que j&apos;utilise et que je recommande
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              On me demande souvent quel matériel acheter après une séance. Voici ma sélection de{" "}
              {accessoryCount} accessoires testés sur le terrain, avec pour chacun la raison pour laquelle
              je le conseille.
            </p>

            {/* Sommaire : une seule ligne qui défile sur mobile, retour à la ligne centré dès `sm`. */}
            <nav
              aria-label="Catégories d'accessoires"
              className="-mx-5 mt-8 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
            >
              {accessoryCategories.map((category) => {
                const Icon = icons[category.icon];
                return (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-brand-light bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-darker"
                  >
                    <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                    {category.title}
                  </a>
                );
              })}
            </nav>
          </div>
        </section>

        <div className="bg-white pb-16 pt-8 md:pb-24 md:pt-10">
          <div className="mx-auto max-w-7xl px-5">
            <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{amazonDisclosure}</span> Les liens de cette page ne
              vous coûtent rien de plus, et je ne recommande que ce que j&apos;utilise ou ce qui a fait ses
              preuves chez mes clients.
            </p>

            <div className="mt-12 space-y-16 md:space-y-20">
              {accessoryCategories.map((category) => {
                const Icon = icons[category.icon];
                return (
                  <section key={category.id} id={category.id} className="scroll-mt-28" aria-labelledby={`${category.id}-titre`}>
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 id={`${category.id}-titre`} className="text-2xl font-semibold leading-tight text-ink md:text-3xl">
                          {category.title}
                        </h2>
                        <p className="mt-1 max-w-2xl leading-relaxed text-ink-soft">{category.intro}</p>
                      </div>
                    </div>

                    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((item, i) => (
                        <Reveal key={item.url} as="li" delay={(i % 3) * 80} variant="scale" className="h-full">
                          <TiltCard
                            as="article"
                            max={6}
                            className="group flex h-full flex-col rounded-3xl border border-brand-light bg-white p-5 shadow-[0_6px_30px_-18px_rgba(20,36,46,0.35)] transition-colors duration-300 hover:border-brand/40 hover:shadow-brand"
                          >
                            <span className="self-start rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-darker">
                              {item.tag}
                            </span>
                            <h3 className="mt-4 text-lg font-semibold leading-snug text-ink">{item.name}</h3>
                            <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{item.why}</p>
                            {/* Lien étiré : toute la carte est cliquable, le lien reste le seul élément focalisable. */}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="sponsored nofollow noopener noreferrer"
                              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors after:absolute after:inset-0 after:rounded-3xl hover:bg-brand-dark"
                            >
                              Voir sur Amazon<span className="sr-only"> : {item.name}</span>
                              <ArrowIcon className="h-4 w-4" />
                            </a>
                          </TiltCard>
                        </Reveal>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </div>

        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-darker px-6 py-14 text-center text-white shadow-brand sm:px-10">
              <h2 className="text-balance text-2xl font-bold uppercase md:text-3xl">
                Un doute sur le bon matériel ?
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/85">
                Chaque chien est différent. Posez-moi la question en séance ou écrivez-moi : je vous dirai ce
                qui convient vraiment au vôtre.
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
