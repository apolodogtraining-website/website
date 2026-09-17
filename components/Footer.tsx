import Image from "next/image";
import Link from "next/link";
import { legalNav, nav, site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from "./icons";
import Reveal from "./Reveal";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-brand opacity-40 blur-[70px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-brand-darker opacity-50 blur-[70px]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="inline-flex" aria-label={`${site.name} — retour à l'accueil`}>
            <Image
              src="/logo/logo-white.png"
              alt={site.name}
              width={160}
              height={56}
              className="h-12 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {site.role} à {site.area}. {site.slogan}
          </p>
          {/* NAP : doit rester strictement identique à la fiche Google et aux annuaires. */}
          <address className="mt-4 max-w-xs text-sm not-italic leading-relaxed">
            {site.address.locality} ({site.address.postalCode}), {site.address.region}
            <br />
            Interventions à {site.area}
            <br />
            <span className="text-white/50">SIREN {site.siren}</span>
          </address>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={`tel:${site.phoneIntl}`}
                className="flex items-center gap-2 transition-colors hover:text-brand"
              >
                <PhoneIcon className="h-4 w-4" />
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 transition-colors hover:text-brand"
              >
                <MailIcon className="h-4 w-4" />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-brand"
              >
                <InstagramIcon className="h-4 w-4" />
                {site.instagram.handle}
              </a>
            </li>
            <li>
              <a
                href={site.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-brand"
              >
                <FacebookIcon className="h-4 w-4" />
                {site.facebook.handle}
              </a>
            </li>
          </ul>
        </div>
        </div>

        <Reveal className="reveal-fade-only flex justify-center">
          <nav
            aria-label="Pied de page"
            className="footer-capsule flex flex-wrap justify-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-4"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs sm:flex-row">
          <p>
            © {year} {site.name}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            Site créé par{" "}
            <span className="font-semibold text-white">STUDIO APOLO</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
