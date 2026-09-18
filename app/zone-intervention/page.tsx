import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { MapPinIcon } from "@/components/icons";
import { serviceAreas, site } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";

const url = `${site.url}/zone-intervention`;

export const metadata: Metadata = {
  title: "Zone d'intervention à Bordeaux et en Gironde",
  description:
    "Éducateur canin et activités de flair (mantrailing, nosework, pistage) à domicile et en extérieur : Bassens, la Rive Droite et toute la Bordeaux Métropole.",
  alternates: { canonical: "/zone-intervention" },
};

// Communes de la Rive Droite (base à Bassens) : sous-ensemble de `serviceAreas`,
// la seule liste de référence. Une commune ajoutée à `serviceAreas` sans être
// listée ici tombe simplement dans le second groupe (Rive Gauche / métropole).
const RIVE_DROITE = new Set([
  "Ambarès-et-Lagrave",
  "Ambès",
  "Artigues-près-Bordeaux",
  "Bassens",
  "Bouliac",
  "Carbon-Blanc",
  "Cenon",
  "Floirac",
  "Lormont",
  "Saint-Louis-de-Montferrand",
  "Saint-Vincent-de-Paul",
]);

const riveDroite = serviceAreas.filter((city) => RIVE_DROITE.has(city));
const metropole = serviceAreas.filter((city) => !RIVE_DROITE.has(city));

const faq = [
  {
    q: "Les séances ont-elles lieu à domicile ou en extérieur ?",
    a: "Les deux, selon l'objectif de la séance : à domicile et dans votre jardin pour le quotidien et l'obéissance, et en extérieur (parcs, forêts, bords de Garonne) pour la sociabilisation et les activités de flair comme le mantrailing ou le nosework.",
  },
  {
    q: "Votre commune n'apparaît pas dans la liste, intervenez-vous quand même ?",
    a: "Souvent, oui. Cette liste couvre le rayon d'intervention habituel autour de Bassens ; une extension reste possible selon la commune et le type de séance. Le plus simple est de me contacter directement pour vérifier la disponibilité.",
  },
  {
    q: "Le tarif change-t-il selon la commune ?",
    a: "Non, les tarifs des accompagnements restent identiques dans tout le rayon d'intervention listé ci-dessous ; aucun frais de déplacement n'est ajouté.",
  },
];

function jsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: "Zone d'intervention",
      description:
        "Éducation canine et activités de flair à domicile et en extérieur autour de Bassens, sur la Rive Droite et dans toute la Bordeaux Métropole.",
      url,
      about: { "@id": `${site.url}/#business` },
      inLanguage: "fr-FR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
        { "@type": "ListItem", position: 2, name: "Zone d'intervention", item: url },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}

function CityGrid({ cities }: { cities: string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2.5">
      {cities.map((city) => (
        <li
          key={city}
          className="flex items-center gap-1.5 rounded-full bg-brand-tint px-4 py-2 text-sm font-medium text-ink"
        >
          <MapPinIcon className="h-3.5 w-3.5 text-brand" />
          {city}
        </li>
      ))}
    </ul>
  );
}

export default function ZoneInterventionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd()) }}
      />
      <Header />
      <main className="pt-20">
        <section className="bg-brand-tint py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Zone d&apos;intervention
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Éducateur canin et activités de flair à Bordeaux, Bassens et dans
              toute la métropole
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Basé à {site.address.locality} ({site.address.postalCode}),
              j&apos;interviens à domicile et en extérieur pour l&apos;éducation
              canine classique comme pour les activités de flair — mantrailing,
              nosework, pistage — une offre encore rare sur ce territoire.
              Séances chez vous, dans votre jardin, en forêt ou en bord de
              Garonne selon l&apos;objectif du travail.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-ink-soft">
              <MapPinIcon className="h-4 w-4 text-brand" />
              {site.address.locality} ({site.address.postalCode}),{" "}
              {site.address.region}
            </p>
          </div>
        </section>

        <section className="bg-white py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-2xl font-semibold text-ink">
              Bassens et la Rive Droite
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              C&apos;est mon secteur historique : j&apos;y habite et j&apos;y
              travaille au quotidien, ce qui permet des créneaux plus
              flexibles et une bonne connaissance des terrains adaptés au
              mantrailing et aux jeux de piste.
            </p>
            <CityGrid cities={riveDroite} />

            <h2 className="mt-12 text-2xl font-semibold text-ink">
              Bordeaux et le reste de la métropole
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Je me déplace également sur l&apos;ensemble de Bordeaux et de la
              Rive Gauche pour les accompagnements en éducation
              comportementale, en obéissance fonctionnelle et pour les
              activités de flair, aux mêmes conditions tarifaires que sur la
              Rive Droite.
            </p>
            <CityGrid cities={metropole} />
          </div>
        </section>

        <section className="bg-brand-tint py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-2xl font-semibold text-ink">
              Questions fréquentes sur la zone d&apos;intervention
            </h2>
            <div className="mt-8 flex flex-col gap-8">
              {faq.map(({ q, a }) => (
                <div key={q}>
                  <h3 className="text-lg font-semibold text-ink">{q}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Votre commune n&apos;apparaît pas dans la liste ?
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">
              Contactez-moi : une extension du rayon d&apos;intervention est
              souvent possible.
            </h2>
            <Link
              href="/contact"
              className="mt-7 inline-flex rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark"
            >
              Prendre contact
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
