import type { MetadataRoute } from "next";
import { footerNav, legalNav, services, site } from "@/lib/site";

/**
 * Dates de dernière modification éditoriale.
 *
 * À mettre à jour quand le contenu d'une page change réellement.
 * Surtout pas `new Date()` : toutes les URL afficheraient la date du build et
 * changeraient à chaque déploiement — Google ignore purement et simplement un
 * signal de fraîcheur qui bouge sans que le contenu bouge.
 */
const DEFAULT_LAST_MODIFIED = "2026-09-14";

const LAST_MODIFIED: Record<string, string> = {
  // "/": "2026-09-14",
  // "/services/mantrailing-bordeaux": "2026-10-02",
};

const lastModified = (path: string) =>
  new Date(LAST_MODIFIED[path] ?? DEFAULT_LAST_MODIFIED);

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/services": 0.9,
  "/contact": 0.9,
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Dérivé de `footerNav` (nav + Zone d'intervention) : toute page ajoutée à
  // l'un des deux menus entre automatiquement dans le sitemap. C'est l'oubli
  // de cette étape qui avait laissé /avis, /faq et /partenaires hors du
  // sitemap.
  const pages = footerNav.map(({ href }) => ({
    url: `${site.url}${href === "/" ? "" : href}`,
    lastModified: lastModified(href),
    changeFrequency: "monthly" as const,
    priority: PRIORITY[href] ?? 0.8,
  }));

  const servicePages = services.map(({ slug }) => {
    const path = `/services/${slug}`;
    return {
      url: `${site.url}${path}`,
      lastModified: lastModified(path),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  // Indexables et utiles comme signal de confiance, mais faible priorité.
  const legalPages = legalNav.map(({ href }) => ({
    url: `${site.url}${href}`,
    lastModified: lastModified(href),
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [...pages, ...servicePages, ...legalPages];
}
