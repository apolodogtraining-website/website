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
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6 md:px-5">
      <div className="relative w-full max-w-4xl">
        {/* Fond verre liquide : invisible en haut du hero, apparaît en douceur au défilement */}
        <div
          aria-hidden
          className={`absolute inset-0 border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:rounded-full ${
            open ? "rounded-[28px]" : "rounded-full"
          } ${
            glass
              ? "translate-y-0 scale-100 border-white/60 bg-gradient-to-b from-white/70 to-white/50 opacity-100 shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(14,95,130,.06),0_22px_45px_-20px_rgba(14,95,130,.32),0_2px_10px_rgba(14,95,130,.12)] backdrop-blur-[28px] backdrop-saturate-[1.8]"
              : "-translate-y-2 scale-[0.97] border-transparent bg-transparent opacity-0 shadow-none backdrop-blur-none backdrop-saturate-100"
          }`}
        />

        <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 md:px-6 md:py-3">
          <Link
            href="/"
            className="relative flex h-9 w-[128px] shrink-0 items-center md:h-10 md:w-[150px]"
            aria-label={site.name}
          >
            <Image
              src="/logo/logo-white.png"
              alt=""
              width={200}
              height={71}
              aria-hidden
              className={`absolute inset-0 h-9 w-auto object-contain object-left transition-opacity duration-500 md:h-10 ${
                glass ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src="/logo/logo.png"
              alt={site.name}
              width={200}
              height={71}
              priority
              className={`absolute inset-0 h-9 w-auto object-contain object-left transition-opacity duration-500 md:h-10 ${
                glass ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex lg:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-500 hover:opacity-70 ${
                  glass ? "text-ink" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-500 hover:opacity-80 ${
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

        {/* Menu mobile : la capsule s'étire pour révéler les liens */}
        <div
          className={`relative overflow-hidden transition-[max-height] duration-300 md:hidden ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 px-5 pb-5 pt-1">
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
    </header>
  );
}
