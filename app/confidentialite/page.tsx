import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Legal from "@/components/Legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${site.name} collecte, utilise et protège vos données personnelles, et comment exercer vos droits.`,
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main className="pt-28">
        <Legal
          title="Politique de confidentialité"
          intro="Ce site collecte le strict minimum. Voici précisément quoi, pourquoi, combien de temps, et ce que vous pouvez exiger."
          updatedAt={site.legal.lastUpdated}
          sections={[
            {
              heading: "Responsable du traitement",
              body: [
                `${site.legal.publisherFullName}, exerçant sous l'enseigne ${site.name}, SIREN ${site.siren}, ${site.address.locality} (${site.address.postalCode}).`,
                `Contact : ${site.email} — ${site.phone}`,
              ],
            },
            {
              heading: "Données collectées",
              body: [
                "Ce site ne comporte pas de formulaire de contact. La prise de contact se fait par téléphone ou par courriel, à votre initiative.",
                "Lorsque vous m'écrivez, je reçois les données que vous choisissez de me transmettre : nom, coordonnées, et les informations concernant votre chien et votre situation.",
                "Aucune donnée n'est collectée à votre insu en naviguant sur le site.",
              ],
            },
            {
              heading: "Finalité et base légale",
              body: [
                "Vos données servent uniquement à répondre à votre demande, préparer et assurer l'accompagnement, puis établir la facturation.",
                "La base légale est l'exécution de mesures précontractuelles et du contrat de prestation (article 6.1.b du RGPD), ainsi que les obligations comptables (article 6.1.c) pour les pièces de facturation.",
              ],
            },
            {
              heading: "Durée de conservation",
              body: [
                "Demandes sans suite : jusqu'à trois ans après le dernier échange.",
                "Dossiers clients et comptes rendus d'accompagnement : cinq ans après la fin de la prestation.",
                "Pièces comptables : dix ans, conformément au code de commerce.",
              ],
            },
            {
              heading: "Destinataires",
              body: [
                "Vos données ne sont ni vendues ni transmises à des tiers à des fins commerciales.",
                "Elles peuvent être traitées par mes prestataires techniques (hébergeur du site, service de messagerie, outil de facturation), dans le seul cadre de leur mission et dans l'Union européenne ou sous un cadre de transfert conforme au RGPD.",
              ],
            },
            {
              heading: "Cookies et mesure d'audience",
              body: [
                "Ce site ne dépose aucun cookie publicitaire et n'utilise aucun traceur à des fins de ciblage.",
                "Les polices de caractères sont servies depuis le site lui-même, sans appel à un service tiers lors de votre visite.",
                "À compléter si une mesure d'audience est mise en place : nom de l'outil, données collectées, durée de conservation, et bandeau de consentement si l'outil utilise des cookies.",
              ],
            },
            {
              heading: "Avis Google",
              body: [
                "Les avis affichés sur ce site proviennent de la fiche Google Business Profile de l'entreprise et sont publics. Ils sont récupérés côté serveur : votre navigateur n'établit aucune connexion avec Google lors de votre visite.",
              ],
            },
            {
              heading: "Vos droits",
              body: [
                "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données.",
                `Pour les exercer, écrivez à ${site.email}. Une réponse vous sera apportée dans un délai d'un mois.`,
                "Si la réponse ne vous satisfait pas, vous pouvez introduire une réclamation auprès de la CNIL — cnil.fr.",
              ],
            },
            {
              heading: "Sécurité",
              body: [
                "Le site est servi exclusivement en HTTPS. Les échanges et dossiers clients sont conservés sur des comptes protégés par mot de passe et double authentification.",
              ],
            },
            {
              heading: "Mentions légales",
              body: ["L'identité de l'éditeur et de l'hébergeur figure sur la page dédiée."],
              link: { href: "/mentions-legales", label: "Voir les mentions légales" },
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
