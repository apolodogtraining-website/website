import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Legal from "@/components/Legal";
import { CGV_PATH, CGV_VERSION, cgvSections } from "@/lib/cgv";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de ${site.name} : réservation, paiement, annulation, rétractation et garanties.`,
  alternates: { canonical: CGV_PATH },
};

export default function CgvPage() {
  return (
    <>
      <Header />
      <main className="pt-28">
        <Legal
          title="Conditions générales de vente"
          intro={`Prestations d'éducation canine pour les consommateurs. Version ${CGV_VERSION}.`}
          updatedAt="10 octobre 2026"
          sections={cgvSections}
        />
      </main>
      <Footer />
    </>
  );
}
