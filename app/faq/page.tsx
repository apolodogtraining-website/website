import type { Metadata } from "next";
import Header from "@/components/Header";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Les réponses aux questions les plus fréquentes sur l'accompagnement canin proposé par Apolo Dog Training.",
};

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Faq />
        <section className="bg-brand-tint py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Une autre question ?</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Le meilleur point de départ reste votre chien.</h2>
            <a href="/contact" className="mt-7 inline-flex rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark">Prendre contact</a>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
