"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Verre visible dès qu'on n'est plus en haut du hero de l'accueil, ou que le
  // menu mobile est ouvert (il a alors besoin d'un fond lisible quel que soit
  // le défilement).
  const glass = !isHome || scrolled || open;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 md:top-6">
      {/* Même conteneur que le Hero (max-w-6xl px-5) : le logo tombe exactement
          à l'aplomb du titre. */}
      <div className="relative mx-auto max-w-6xl px-5">
        {/* Fond verre liquide : invisible en haut du hero, apparaît en douceur au défilement */}
        <div
          aria-hidden
          className={`absolute inset-0 border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:rounded-full ${
            open ? "rounded-[28px]" : "rounded-full"
          } ${
            glass
              ? "translate-y-0 scale-100 border-white/20 bg-gradient-to-b from-white/20 to-white/8 opacity-100 shadow-[inset_0_1px_0_rgba(255,255,255,.25),inset_0_-1px_0_rgba(14,95,130,.04),0_25px_50px_-22px_rgba(14,95,130,.24),0_2px_10px_rgba(14,95,130,.08)] backdrop-blur-[28px] backdrop-saturate-[1.8]"
              : "-translate-y-2 scale-[0.97] border-transparent bg-transparent opacity-0 shadow-none backdrop-blur-none backdrop-saturate-100"
          }`}
        />

        <div className="relative flex items-center justify-between gap-4 py-2 pl-4 pr-2 md:gap-5 md:py-2.5 md:pl-5 md:pr-2.5">
          <Link
            href="/"
            className="relative flex h-11 w-[148px] shrink-0 items-center md:h-12 md:w-[172px]"
            aria-label={site.name}
          >
            {/* Haut du hero : le même logo, en silhouette gris/noir translucide */}
            <Image
              src="/logo/logo.png"
              alt=""
              width={200}
              height={71}
              aria-hidden
              className={`absolute inset-0 h-11 w-auto object-contain object-left brightness-0 transition-opacity duration-500 md:h-12 ${
                glass ? "opacity-0" : "opacity-55"
              }`}
            />
            {/* Défilé : le logo en couleur */}
            <Image
              src="/logo/logo.png"
              alt={site.name}
              width={200}
              height={71}
              priority
              className={`absolute inset-0 h-11 w-auto object-contain object-left transition-opacity duration-500 md:h-12 ${
                glass ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-normal transition-colors duration-500 ${
                  glass ? "text-ink/75 hover:text-ink" : "text-white/85 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-500 hover:opacity-80 ${
                glass ? "bg-brand text-white" : "bg-white text-brand"
              }`}
            >
              Réserver
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
              glass ? "text-ink" : "text-white"
            }`}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <div className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full rounded bg-current transition-all ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded bg-current transition-all ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded bg-current transition-all ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Menu mobile : la capsule s'étire pour révéler les liens. Technique
            grid-template-rows (0fr → 1fr) plutôt que max-height : l'animation
            suit la vraie hauteur du contenu, sans à-coup ni troncature quel
            que soit le nombre de liens. */}
        <div
          className={`relative grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <nav
              className={`flex flex-col gap-1 px-5 pb-5 pt-1 transition-opacity duration-300 ${
                open ? "opacity-100 delay-150" : "opacity-0"
              }`}
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-brand-light/60"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-brand px-5 py-3 text-center text-base font-semibold text-white"
              >
                Réserver une séance
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
