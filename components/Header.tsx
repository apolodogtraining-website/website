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
  // template Evasion, piloté par isScrolled), ou dès que le menu mobile est
  // ouvert (il a besoin d'un fond lisible quel que soit le défilement).
  const glass = !isHome || scrolled || open;

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
      className={`${inter.className} fixed left-1/2 top-4 z-50 w-[92%] max-w-4xl -translate-x-1/2 md:top-5 md:w-fit md:max-w-[94vw]`}
    >
      {/* Le fond/flou/ombre "verre" vit sur CE bandeau (hauteur fixe, ~52px),
          jamais sur <header> lui-même : si on l'y met, dès que le panneau
          mobile s'ouvre en dessous, la boîte <header> devient très haute et
          `rounded-full` (border-radius: 9999px, plafonné à la moitié de la
          plus petite dimension) se transforme en capsule/ovale géant au lieu
          d'une pilule normale — c'était le bug du menu mobile "en boule". */}
      <div
        className={`transition-all duration-300 ${
          glass ? "rounded-full bg-white/60 backdrop-blur-md" : "bg-transparent"
        }`}
        style={{
          boxShadow: glass
            ? "rgba(14,95,130,.06) 0px 0px 0px 1px, rgba(22,35,44,.05) 0px 1px 1px -0.5px, rgba(22,35,44,.05) 0px 3px 3px -1.5px, rgba(22,35,44,.05) 0px 6px 6px -3px, rgba(14,95,130,.05) 0px 12px 12px -6px, rgba(14,95,130,.05) 0px 24px 24px -12px"
            : "none",
        }}
      >
        <div className="flex items-center justify-between gap-5 px-2 pl-5 py-2 md:justify-start">
          <Link
            href="/"
            className="relative h-7 w-[82px] shrink-0"
            aria-label={site.name}
          >
            {/* Recadrés au plus juste (public/logo/logo-header.png) pour ne
                pas agrandir le bandeau : 28px de haut, comme demandé. */}
            <Image
              src="/logo/logo-white.png"
              alt=""
              fill
              aria-hidden
              sizes="82px"
              className={`object-contain transition-opacity duration-300 ${
                glass ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src="/logo/logo-header.png"
              alt={site.name}
              fill
              priority
              sizes="82px"
              className={`object-contain transition-opacity duration-300 ${
                glass ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>

          <nav className="hidden shrink-0 flex-nowrap items-center gap-5 md:flex">
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
      </div>

      {open && (
        <div className="mt-2 overflow-hidden rounded-[28px] border border-white/25 bg-gradient-to-b from-white/70 to-white/45 px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,.4),inset_0_-1px_0_rgba(14,95,130,.05),0_25px_50px_-22px_rgba(14,95,130,.28)] backdrop-blur-[28px] backdrop-saturate-[1.6] md:hidden">
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
