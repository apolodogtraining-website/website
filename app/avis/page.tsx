import type { Metadata } from "next";
import Header from "@/components/Header";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { getReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Avis Google",
  description: "Découvrez les avis Google des maîtres accompagnés par Apolo Dog Training à Bordeaux et alentours.",
};

export default async function AvisPage() {
  const reviews = await getReviews();
  return (
    <>
      <Header />
      <main className="pt-20">
        <Reviews data={reviews} />
        <section className="bg-brand-tint py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Envie de rejoindre les prochains avis ?</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Parlons de votre chien.</h2>
            <a href="/contact" className="mt-7 inline-flex rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark">Prendre contact</a>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
