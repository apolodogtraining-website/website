import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

const shortcuts = [
  { href: "/services", label: "Les accompagnements", text: "Éducation, comportement et activités de flair." },
  { href: "/a-propos", label: "À propos de Frédéric", text: "L'approche, le parcours et la méthode." },
  { href: "/contact", label: "Prendre contact", text: "Parlons de votre chien et de votre quotidien." },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-28">
        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Erreur 404
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Cette page n&apos;existe pas (ou plus).
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Le lien est peut-être ancien, ou l&apos;adresse comporte une faute de
              frappe. Voici les pages les plus utiles pour repartir du bon pied.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-3xl gap-4 px-5">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-5 rounded-3xl border border-brand-light p-6 shadow-soft transition-transform hover:-translate-y-1"
              >
                <span>
                  <span className="block text-lg font-semibold text-ink">{item.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{item.text}</span>
                </span>
                <ArrowIcon className="h-5 w-5 shrink-0 text-brand" />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
