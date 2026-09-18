"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import { nav, site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Verre visible dès qu'on quitte le haut du hero de l'accueil (comme le
  // template Evasion, piloté par isScrolled) — sur les autres pages, qui
  // n'ont pas de photo en fond, le verre reste toujours visible.
  const glass = !isHome || scrolled;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={`${inter.className} fixed left-1/2 top-4 z-50 w-[92%] max-w-4xl -translate-x-1/2 transition-all duration-300 md:top-5 ${
        glass ? "rounded-full bg-white/60 backdrop-blur-md" : "bg-transparent"
      }`}
      style={{
        boxShadow: glass
          ? "rgba(14,95,130,.06) 0px 0px 0px 1px, rgba(22,35,44,.05) 0px 1px 1px -0.5px, rgba(22,35,44,.05) 0px 3px 3px -1.5px, rgba(22,35,44,.05) 0px 6px 6px -3px, rgba(14,95,130,.05) 0px 12px 12px -6px, rgba(14,95,130,.05) 0px 24px 24px -12px"
          : "none",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-2 pl-5 py-2">
        <Link
          href="/"
          className="relative flex h-12 w-[160px] shrink-0 items-center md:h-14 md:w-[190px]"
          aria-label={site.name}
        >
          {/* Haut du hero : silhouette gris/noir translucide sur la photo */}
          <Image
            src="/logo/logo.png"
            alt=""
            fill
            sizes="190px"
            aria-hidden
            className={`object-contain object-left brightness-0 transition-opacity duration-300 ${
              glass ? "opacity-0" : "opacity-60"
            }`}
          />
          {/* Défilé / pages intérieures : logo en couleur */}
          <Image
            src="/logo/logo.png"
            alt={site.name}
            fill
            sizes="190px"
            priority
            className={`object-contain object-left transition-opacity duration-300 ${
              glass ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>

        <nav className="hidden shrink-0 flex-nowrap items-center gap-4 md:flex lg:gap-5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 whitespace-nowrap text-sm transition-colors ${
                glass ? "text-ink-soft hover:text-ink" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all hover:opacity-85 ${
              glass ? "bg-brand text-white" : "bg-white text-brand"
            }`}
          >
            Réserver
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`transition-colors md:hidden ${glass ? "text-ink" : "text-white"}`}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="rounded-b-2xl border-t border-ink/10 bg-white px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-lg text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Réserver une séance
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
