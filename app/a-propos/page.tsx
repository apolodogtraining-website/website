import type { Metadata } from "next";
import Header from "@/components/Header";
import About from "@/components/About";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import Link from "next/link";
import { partners, serviceAreas, site } from "@/lib/site";
import { breadcrumb, graph, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "À propos de Frédéric",
  description: "Découvrez l'approche de Frédéric, éducateur et comportementaliste canin à Bordeaux.",
  alternates: { canonical: "/a-propos" },
};

// `Person` est le support direct du critère d'expertise : il dit explicitement
// à Google ce que la page raconte en prose, et relie la personne à l'entreprise.
const jsonLd = graph(
  {
    "@type": "Person",
    "@id": `${site.url}/#frederic`,
    name: site.legal.publisherFullName,
    givenName: site.trainer,
    jobTitle: site.role,
    description: `${site.role} à ${site.area}.`,
    url: `${site.url}/a-propos`,
    image: `${site.url}/photos/a-propos.jpg`,
    email: site.email,
    telephone: site.phoneIntl,
    knowsLanguage: ["fr", "es"],
    knowsAbout: [
      "Éducation canine",
      "Comportement canin",
      "Mantrailing",
      "Nosework",
      "Détection sportive",
      "Pistage canin",
    ],
    // Organisme de formation dont Frédéric est issu — déclaré via le partenaire
    // déjà listé, pour éviter une deuxième source de vérité.
    alumniOf: partners
      .filter((partner) => partner.name === "CynoTrust")
      .map((partner) => ({
        "@type": "Organization",
        name: partner.name,
        url: partner.url,
      })),
    worksFor: { "@id": `${site.url}/#business` },
    areaServed: serviceAreas.map((city) => ({ "@type": "City", name: city })),
    sameAs: [site.instagram.url, site.facebook.url],
  },
  breadcrumb([{ name: "À propos", path: "/a-propos" }])
);

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Header />
      <main className="pt-20">
        <About
          as="h1"
          heading="Frédéric, éducateur et comportementaliste canin à Bassens et Bordeaux"
        />
        <section className="bg-brand-tint py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Une question avant de démarrer ?
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">
              Le meilleur point de départ reste votre chien.
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
