import type { NextConfig } from "next";

/**
 * Hôte canonique du site. Toute requête arrivant sur un autre hôte
 * (www, ou un domaine secondaire) est redirigée en 301 vers celui-ci.
 * Doit rester aligné avec `site.url` dans lib/site.ts.
 */
const CANONICAL_HOST = "apolodogtraining.com";
const REDIRECTED_HOSTS = ["www.apolodogtraining.com"];

const nextConfig: NextConfig = {
  // Formats modernes : ~40 % de poids en moins sur les photos servies.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1920, 2560],
    minimumCacheTTL: 2678400, // 31 jours
  },

  // Un seul hôte indexable : le capital de liens ne se disperse plus sur deux domaines.
  async redirects() {
    return REDIRECTED_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Les fichiers de public/ sont versionnés par leur nom : cache long.
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
