import type { NextConfig } from "next";

/**
 * Hôte canonique du site. Toute requête arrivant sur un autre hôte
 * (www, ou un domaine secondaire) est redirigée en 301 vers celui-ci.
 * Doit rester aligné avec `site.url` dans lib/site.ts.
 */
const CANONICAL_HOST = "apolodogtraining.com";
const REDIRECTED_HOSTS = ["www.apolodogtraining.com"];

/**
 * Anciennes URL encore indexées par Google, qui renverraient 404.
 * Sans redirection, le lien entrant est perdu et le visiteur avec.
 *
 * Pour compléter cette liste : Search Console → Pages → « Introuvable (404) ».
 * Chaque URL qui y apparaît et qui a un équivalent actuel mérite une ligne ici.
 */
const LEGACY_PATHS: Record<string, string> = {
  "/services/hunting-games": "/services/jeux-de-chasse-chien-bordeaux",
};

const nextConfig: NextConfig = {
  // Formats modernes : ~40 % de poids en moins sur les photos servies.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1920, 2560],
    minimumCacheTTL: 2678400, // 31 jours
    // Photos de profil des avis Google (lib/reviews.ts, authorAttribution.photoUri) :
    // servies depuis plusieurs sous-domaines lh*.googleusercontent.com selon la charge.
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },

  // Un seul hôte indexable : le capital de liens ne se disperse plus sur deux domaines.
  async redirects() {
    return [
      ...REDIRECTED_HOSTS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      })),
      ...Object.entries(LEGACY_PATHS).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Interdit l'affichage du site dans une iframe tierce (clickjacking,
          // et réaffichage du site sous une autre marque).
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            // `interest-cohort` visait FLoC, abandonné : la directive n'est plus
            // reconnue et génère un avertissement en console. Topics l'a remplacé.
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        // ⚠️ Contrairement aux fichiers de /_next/static, ceux de public/ ne
        // portent PAS de hash dans leur nom : `hero.jpg` reste `hero.jpg` d'un
        // déploiement à l'autre. Un `max-age=31536000, immutable` gèlerait donc
        // l'ancienne version chez tout visiteur déjà venu, pendant un an, sans
        // qu'aucun déploiement puisse la déloger.
        // ⚠️ Vérifié en production : les réponses de /_next/image reprennent
        // CETTE valeur, pas `minimumCacheTTL`. Une heure de cache signifiait
        // donc que chaque visiteur revalidait toutes les photos du site dans la
        // journée. Sept jours + revalidation en arrière-plan est le compromis :
        // une photo remplacée se propage en une semaine au pire.
        // Pour revenir à un cache d'un an sans cet inconvénient, il faut
        // versionner les noms de fichiers (`hero-2026-09.jpg`) et changer le nom
        // à chaque remplacement.
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2|mp4)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },

  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
