import type { Metadata } from "next";
import { PortalProvider } from "@/lib/portal/store";

// Espace privé : jamais indexé, jamais dans le sitemap.
export const metadata: Metadata = {
  title: "Portail partenaires",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalProvider>{children}</PortalProvider>;
}
