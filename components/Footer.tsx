import Image from "next/image";
import Link from "next/link";
import { footerNav, legalNav, site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brand-light/70 bg-deep text-ink-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex" aria-label={`${site.name} — retour à l'accueil`}>
            <Image
              src="/hero/logo-apolo.webp"
              alt={site.name}
              width={1200}
              height={474}
              sizes="180px"
              className="h-16 w-auto"
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
            <span className="text-ink-soft/70">SIREN {site.siren}</span>
          </address>
        </div>

        <div>
          <h3 className="text-xl text-ink">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-ink">
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

      <div className="border-t border-brand-light/70">
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
            <span className="font-semibold text-ink">STUDIO APOLO</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
