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
                `Le site ${site.url.replace("https://", "")} est édité par ${site.legal.publisherLegalName}, exerçant sous l'enseigne ${site.name}.`,
                `Statut : ${site.legal.publisherStatus}. SIREN : ${site.siren} — SIRET : ${site.siret} — Code APE : ${site.legal.ape}`,
                `Siège : ${site.address.street}, ${site.address.postalCode} ${site.address.locality}, France.`,
                `Téléphone : ${site.phone} — Courriel : ${site.email}`,
              ],
            },
            {
              heading: "Directeur de la publication",
              body: [site.legal.publisherLegalName],
            },
            {
              heading: "Hébergement",
              body: [
                "Le site est hébergé par :",
                `${site.legal.hostName}, ${site.legal.hostAddress}`,
                `Site : ${site.legal.hostContact}`,
              ],
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
              body: [
                "Conformément à l'article L.616-1 du code de la consommation, tout client particulier peut recourir gratuitement, en cas de litige, au médiateur de la consommation auquel l'entreprise a adhéré :",
                `${site.legal.mediatorName} — ${site.legal.mediatorAddress}`,
                "La saisine n'est recevable qu'après une réclamation écrite adressée au préalable à l'entreprise, et dans un délai d'un an à compter de cette réclamation.",
              ],
              link: { href: site.legal.mediatorUrl, label: "Saisir le CMAP" },
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
