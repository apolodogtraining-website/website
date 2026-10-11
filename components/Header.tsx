"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { headerNav, site } from "@/lib/site";
import useScrollLock from "@/hooks/useScrollLock";
import { ArrowIcon, MapPinIcon } from "./icons";

/**
 * Barre de navigation sombre, pleine largeur (charte Apolo).
 * Sur l'accueil, le hero porte sa propre barre : celle-ci n'apparaît qu'une fois le hero dépassé.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const visible = !isHome || pastHero || open;

  useScrollLock(open);

  useEffect(() => {
    if (!isHome) return;
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;
    const update = () => setPastHero(hero.getBoundingClientRect().bottom < 140);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-brand-light/70 bg-surface/90 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      {...(!visible ? { inert: true, "aria-hidden": true } : {})}
    >
      <div className="mx-auto flex h-20 max-w-[1672px] items-center justify-between gap-6 px-6 lg:px-[4.3vw]">
        <Link href="/" className="relative block h-14 w-[142px] shrink-0" aria-label={`${site.name} — accueil`}>
          <Image src="/hero/logo-apolo.webp" alt="" fill sizes="142px" priority={!isHome} className="object-contain object-left" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-9 lg:flex xl:gap-14">
          {headerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-1 text-[17px] transition-colors hover:text-brand-dark ${
                isActive(item.href) ? "border-brand text-ink" : "border-transparent text-[#cccbc6]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-8 lg:flex">
          <span className="hidden items-center gap-3 whitespace-nowrap text-[17px] text-ink-soft min-[1350px]:flex">
            <MapPinIcon className="h-5 w-5 text-brand" />
            {site.areaLong}
          </span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-4 whitespace-nowrap bg-brand px-7 py-3.5 text-lg font-semibold text-cta transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Réserver une évaluation
            <ArrowIcon className="h-5 w-5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-light/70 bg-surface px-6 pb-8 pt-6 lg:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-5">
            {headerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`text-xl ${isActive(item.href) ? "text-brand-darker" : "text-ink"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-between bg-brand px-6 py-4 text-lg font-semibold text-cta"
            >
              Réserver une évaluation
              <ArrowIcon className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
