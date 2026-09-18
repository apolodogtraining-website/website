import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Qualification from "@/components/Qualification";
import Method from "@/components/Method";
import Faq from "@/components/Faq";
import StickyCall from "@/components/StickyCall";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getReviews } from "@/lib/reviews";
import { serviceAreas, services, site } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const reviews = await getReviews();

  // ⚠️ Pas d'`aggregateRating` ici : Google n'accepte pas les extraits d'avis
  // auto-référencés (une entreprise qui balise sa propre note sur son propre site).
  // Les étoiles affichées dans les résultats viennent de la fiche Google Business Profile.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${site.url}/#business`,
    name: site.name,
    description: `${site.role} à ${site.area}.`,
    url: site.url,
    email: site.email,
    telephone: site.phoneIntl,
    image: `${site.url}/photos/hero.jpg`,
    logo: `${site.url}/logo/logo-full.png`,
    priceRange: "120€ – 699€",
    currenciesAccepted: "EUR",
    knowsLanguage: ["fr", "es"],
    founder: {
      "@type": "Person",
      name: site.trainer,
      jobTitle: "Éducateur et comportementaliste canin",
    },
    identifier: { "@type": "PropertyValue", name: "SIREN", value: site.siren },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    // TODO SEO local : ajouter `geo` (GeoCoordinates), `openingHoursSpecification`
    // et `hasMap` (lien Maps de la fiche) une fois les valeurs exactes confirmées.
    areaServed: serviceAreas.map((city) => ({ "@type": "City", name: city })),
    // `sameAs` relie explicitement le site et l'établissement dans le graphe de Google.
    sameAs: [site.instagram.url, site.facebook.url, site.google.url],
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        url: `${site.url}/services/${s.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero rating={reviews.rating} total={reviews.total} />
        <Qualification />
        <Services />
        <Method />
        <Reviews data={reviews} />
        <Faq />
        <Contact rating={reviews.rating} total={reviews.total} />
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
