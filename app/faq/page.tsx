import type { Metadata } from "next";
import Header from "@/components/Header";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Les réponses aux questions les plus fréquentes sur l'accompagnement canin proposé par Apolo Dog Training.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Faq as="h1" heading="Vos questions sur l'éducation canine et les activités de flair" />
        <section className="bg-brand-tint py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Une autre question ?</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Le meilleur point de départ reste votre chien.</h2>
            <Link href="/contact" className="mt-7 inline-flex rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark">Prendre contact</Link>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
