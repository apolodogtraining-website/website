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
  const transparent = isHome && !scrolled;

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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-brand-light/70 bg-white/95 shadow-[0_4px_20px_-12px_rgba(28,43,36,0.18)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20">
        <Link href="/" className="flex items-center" aria-label={site.name}>
          <Image
            src="/logo/logo.png"
            alt={site.name}
            width={200}
            height={142}
            priority
            className="h-14 w-auto md:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-ink/80 hover:text-brand"
              }`}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Réserver
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden ${
            transparent && !open ? "text-white" : "text-ink"
          }`}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-6 flex-col gap-1.5">
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden bg-white transition-[max-height] duration-300 ${
          open ? "max-h-96 border-t border-brand-light" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-brand-light hover:text-brand"
            >
              {item.label}
            </a>
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
    </header>
  );
}
