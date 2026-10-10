import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { PortalProvider } from "@/lib/portal/store";

// Police d'affichage des titres du portail (grasse et condensée) ; le corps de texte reste en Poppins.
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400", display: "swap" });

// Espace privé : jamais indexé, jamais dans le sitemap.
export const metadata: Metadata = {
  title: "Portail partenaires",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`portal-theme ${anton.variable} min-h-screen-mobile`}>
      <PortalProvider>{children}</PortalProvider>
    </div>
  );
}
