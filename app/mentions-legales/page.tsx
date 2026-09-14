import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Legal from "@/components/Legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${site.name} : éditeur, directeur de publication, hébergeur et propriété intellectuelle.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="pt-28">
        <Legal
          title="Mentions légales"
          updatedAt={site.legal.lastUpdated}
          sections={[
            {
              heading: "Éditeur du site",
              body: [
                `Le site ${site.url.replace("https://", "")} est édité par ${site.legal.publisherFullName}, exerçant sous l'enseigne ${site.name}.`,
                `Statut : ${site.legal.publisherStatus}. SIREN : ${site.siren}.`,
                `Siège : ${site.address.locality} (${site.address.postalCode}), ${site.address.region}, France.`,
                `Téléphone : ${site.phone} — Courriel : ${site.email}`,
              ],
            },
            {
              heading: "Directeur de la publication",
              body: [site.legal.publisherFullName],
            },
            {
              heading: "Hébergement",
              body: site.legal.hostName
                ? [site.legal.hostName, site.legal.hostAddress, site.legal.hostContact].filter(Boolean)
                : ["À compléter avant mise en ligne : dénomination, adresse et téléphone de l'hébergeur du site."],
            },
            {
              heading: "Activité",
              body: [
                `${site.role}. Prestations d'éducation canine, d'accompagnement comportemental et d'activités de flair (mantrailing, nosework, pistage) à ${site.area}.`,
                "L'activité d'éducateur canin n'est pas une activité vétérinaire. Aucun diagnostic ni traitement médical n'est proposé ; en cas de doute sur la santé de votre chien, consultez un vétérinaire.",
              ],
            },
            {
              heading: "Propriété intellectuelle",
              body: [
                `L'ensemble des contenus de ce site — textes, photographies, logo, identité visuelle — est la propriété de ${site.name}, sauf mention contraire. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable est interdite.`,
                "Les marques et logos des partenaires cités restent la propriété de leurs titulaires respectifs.",
              ],
            },
            {
              heading: "Liens externes",
              body: [
                "Ce site comporte des liens vers des sites tiers. Leur contenu n'engage que leurs éditeurs et ne saurait engager la responsabilité de l'éditeur du présent site.",
              ],
            },
            {
              heading: "Médiation de la consommation",
              body: site.legal.mediatorName
                ? [
                    `Conformément à l'article L.616-1 du code de la consommation, tout consommateur peut recourir gratuitement au médiateur suivant : ${site.legal.mediatorName} — ${site.legal.mediatorUrl}`,
                  ]
                : [
                    "À compléter avant mise en ligne : coordonnées du médiateur de la consommation auquel l'entreprise a adhéré (obligatoire pour toute prestation de service à destination de consommateurs).",
                  ],
            },
            {
              heading: "Données personnelles",
              body: [
                "Le traitement des données personnelles est décrit dans la politique de confidentialité.",
              ],
              link: { href: "/confidentialite", label: "Lire la politique de confidentialité" },
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
