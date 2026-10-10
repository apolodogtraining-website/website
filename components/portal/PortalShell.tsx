"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileSignature, Handshake, LayoutDashboard, LogOut, Receipt, UserPlus, Users } from "lucide-react";
import { usePortal } from "@/lib/portal/store";
import type { Role } from "@/lib/portal/types";
import { site } from "@/lib/site";

const NAV = {
  admin: [
    { href: "/portail/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/portail/admin/partenaires", label: "Partenaires", icon: Users },
    { href: "/portail/admin/inscriptions", label: "Inscriptions clients", icon: UserPlus },
    { href: "/portail/admin/contrats", label: "Contrats clients", icon: Handshake },
    { href: "/portail/admin/facturation", label: "Facturation", icon: Receipt },
  ],
  partner: [
    { href: "/portail/partenaire", label: "Accueil", icon: LayoutDashboard },
    { href: "/portail/partenaire/missions", label: "Mes contrats", icon: Handshake },
    { href: "/portail/partenaire/facturation", label: "Facturation", icon: Receipt },
    { href: "/portail/partenaire/contrat", label: "Contrat partenaire", icon: FileSignature },
  ],
} as const;

const isActive = (pathname: string, href: string) =>
  pathname === href || (href.split("/").length > 3 && pathname.startsWith(`${href}/`));

export default function PortalShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { ready, session, currentPartner, logout, error, clearError } = usePortal();
  const router = useRouter();
  const pathname = usePathname();
  const contractPath = "/portail/partenaire/contrat";
  const mustSign = role === "partner" && currentPartner && !currentPartner.contractSignedAt;

  useEffect(() => {
    if (!ready) return;
    if (!session || session.role !== role || (role === "partner" && !currentPartner)) {
      router.replace("/portail");
    } else if (mustSign && pathname !== contractPath) {
      // Le contrat doit être signé avant tout autre usage de la plateforme.
      router.replace(contractPath);
    }
  }, [ready, session, role, currentPartner, mustSign, pathname, router]);

  const allowed = ready && session?.role === role && (role === "admin" || currentPartner) && !(mustSign && pathname !== contractPath);
  if (!allowed) {
    return <div className="grid min-h-screen-mobile place-items-center text-sm text-ink-soft">Chargement…</div>;
  }

  const items = NAV[role];
  const who = role === "admin" ? "Administration" : currentPartner!.company;

  return (
    <div className="min-h-screen-mobile bg-brand-tint md:flex">
      {error && (
        <div role="alert" className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-3 bg-red-600 px-4 py-2.5 text-sm font-medium text-white">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30">
            Fermer
          </button>
        </div>
      )}
      <aside className="border-b border-brand-light bg-white print:hidden md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-6">
          <Link href={role === "admin" ? "/portail/admin" : "/portail/partenaire"} aria-label={site.name}>
            <Image src="/logo/logo-header.png" alt={site.name} width={140} height={48} className="h-9 w-auto md:h-11" />
          </Link>
          <div className="min-w-0 text-right md:mt-4 md:text-left">
            <p className="truncate text-sm font-semibold text-ink">{who}</p>
            <p className="text-xs text-ink-soft">{role === "admin" ? "Espace administrateur" : "Espace partenaire"}</p>
          </div>
        </div>
        <nav aria-label="Navigation du portail" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const locked = mustSign && href !== contractPath;
            return (
              <Link
                key={href}
                href={locked ? contractPath : href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active ? "bg-brand text-white shadow-brand" : "text-ink-soft hover:bg-brand-tint hover:text-brand-darker"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-3 pb-5 md:absolute md:bottom-0 md:block md:w-64">
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/portail");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft hover:bg-brand-tint"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-9 print:p-0">
        <div className="mx-auto max-w-5xl">{children}</div>
        <div className="mt-8 md:hidden">
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/portail");
            }}
            className="flex items-center gap-2 text-sm font-medium text-ink-soft"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
          </button>
        </div>
      </main>
    </div>
  );
}
