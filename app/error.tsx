"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ArrowIcon, PhoneIcon } from "@/components/icons";
import { site } from "@/lib/site";

/**
 * Filet de sécurité pour les erreurs d'exécution des pages (par exemple une
 * réponse inattendue de l'API Google dans `lib/reviews.ts`).
 *
 * Sans ce fichier, Next affiche sa page d'erreur générique : ni en-tête, ni
 * moyen de joindre Frédéric. Volontairement autonome — pas de <Footer/>, qui
 * est un composant serveur et basculerait tout son contenu côté client.
 *
 * Ne couvre pas les erreurs du layout racine : il faudrait un
 * `app/global-error.tsx` pour cela.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="pt-28">
        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Erreur technique
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Cette page n&apos;a pas pu s&apos;afficher.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              L&apos;incident est de mon côté, pas du vôtre. Réessayez dans un
              instant — et si cela se reproduit, appelez-moi directement, nous
              parlerons de votre chien de vive voix.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Réessayer
                <ArrowIcon className="h-5 w-5" />
              </button>
              <a
                href={`tel:${site.phoneIntl}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/30 bg-white px-7 py-3.5 text-base font-semibold text-brand-darker transition-colors hover:bg-brand-light"
              >
                <PhoneIcon className="h-5 w-5" />
                {site.phone}
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/30 bg-white px-7 py-3.5 text-base font-semibold text-brand-darker transition-colors hover:bg-brand-light"
              >
                Retour à l&apos;accueil
              </Link>
            </div>

            {error.digest && (
              <p className="mt-8 text-xs text-ink-soft">
                Référence de l&apos;incident : {error.digest}
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
