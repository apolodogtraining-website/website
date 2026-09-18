import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Google réécrivait le title déclaré (« Apolo Dog Training — Éducateur &
// comportementaliste canin à Bordeaux ») au profit d'une formulation tournée
// vers le flair : signe que le title décrivait mal la page. Il est désormais
// aligné sur le H1 et sur ce que le site raconte réellement.
const homeTitle = "Éducateur canin à Bordeaux — mantrailing, nosework, pistage";

const description = `${site.role} à ${site.area}. Rééduquez votre chien par les activités de flair : mantrailing, nosework, pistage et jeux de chasse. Évaluation sur mesure.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s | ${site.name}`,
  },
  description,
  keywords: [
    "éducateur canin Bordeaux",
    "comportementaliste canin Bordeaux",
    "dressage chien Bordeaux",
    "mantrailing",
    "pistage chien",
    "nosework",
    "balade éducative chien",
    "Apolo Dog Training",
  ],
  authors: [{ name: site.name }],
  // ⚠️ Ne PAS déclarer `alternates.canonical` ici : dans l'App Router, les métadonnées
  // du layout racine sont héritées par toutes les pages enfants qui ne les redéfinissent
  // pas. Chaque page déclare donc sa propre canonique.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${homeTitle}`,
    description,
    // Dimensions RÉELLES du fichier. Facebook, LinkedIn et WhatsApp réservent
    // l'espace de l'aperçu d'après ces valeurs : les annoncer fausses produit un
    // recadrage approximatif. À terme, une image OG dédiée en 1200×630 (logo +
    // accroche) se partagerait mieux que cette photo en 4:3.
    images: [{ url: "/photos/hero.jpg", width: 1600, height: 1200, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${homeTitle}`,
    description,
    images: ["/photos/hero.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#5AA7DD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-ink">
        {children}
        {/* Core Web Vitals mesurés chez les vrais visiteurs (LCP / INP / CLS),
            remontés dans le tableau de bord Vercel. Sans cookie : ni bandeau de
            consentement, ni ligne supplémentaire dans /confidentialite. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
