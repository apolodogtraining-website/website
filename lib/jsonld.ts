import { site } from "./site";

/**
 * Sérialise un objet JSON-LD pour injection dans un <script>.
 *
 * `JSON.stringify` n'échappe pas `<` : une chaîne contenant `</script>` —
 * dans une question de FAQ, une description de service, un nom de commune —
 * refermerait la balise. Aujourd'hui toutes les données viennent de
 * `lib/site.ts`, écrit à la main ; le jour où un avis Google ou un champ de
 * CMS entrera dans le balisage, cette ligne sera ce qui tient.
 */
export const jsonLdScript = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export type Crumb = { name: string; path: string };

/**
 * Fil d'Ariane. Google l'affiche à la place de l'URL brute dans les résultats :
 * meilleure lisibilité, meilleur taux de clic sur les pages profondes.
 */
export function breadcrumb(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...crumbs].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: `${site.url}${crumb.path === "/" ? "" : crumb.path}`,
      })
    ),
  };
}

export type FaqEntry = { q: string; a: string };

export function faqPage(entries: FaqEntry[], id?: string) {
  return {
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: entries.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Enveloppe `@graph` : un seul <script> par page, plusieurs entités liées. */
export const graph = (...nodes: Record<string, unknown>[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});
