import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import {
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
} from "@/components/icons";
import ZoneModal from "@/components/ZoneModal";
import { breadcrumb, graph, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Contact & prise de rendez-vous",
  description: "Prenez contact avec Apolo Dog Training pour parler de votre chien à Bordeaux et alentours.",
  alternates: { canonical: "/contact" },
};

const jsonLd = graph(
  breadcrumb([{ name: "Contact", path: "/contact" }]),
  {
    "@type": "ContactPage",
    "@id": `${site.url}/contact#page`,
    mainEntity: { "@id": `${site.url}/#business` },
  }
);

function Tile({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
        <span className="block break-words text-base font-semibold text-ink sm:text-lg">{value}</span>
      </span>
    </a>
  );
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Header />
      <main className="pt-28">
        <section className="bg-brand-tint py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-5">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Prendre rendez-vous
            </span>
            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-tight text-ink md:text-6xl">
              Parlons de votre chien et de ce que vous vivez au quotidien.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Décrivez-moi sa situation, son âge et ce que vous aimeriez améliorer. Je vous orienterai
              vers l&apos;accompagnement le plus pertinent.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="contact-gradient overflow-hidden rounded-[2.5rem] shadow-brand">
              <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:p-12">
                <div className="min-w-0 rounded-3xl bg-white p-6 sm:p-8">
                  <ContactForm />
                </div>

                <div className="flex min-w-0 flex-col justify-center gap-4">
                  <h2 className="text-2xl font-bold text-white">Ou contactez-moi directement</h2>
                  <Tile
                    href={`tel:${site.phoneIntl}`}
                    icon={<PhoneIcon className="h-6 w-6" />}
                    label="Téléphone"
                    value={site.phone}
                  />
                  <Tile
                    href={`mailto:${site.email}?subject=Demande%20d%27accompagnement%20canin`}
                    icon={<MailIcon className="h-6 w-6" />}
                    label="Email"
                    value={site.email}
                  />
                  <Tile
                    href={site.instagram.url}
                    icon={<InstagramIcon className="h-6 w-6" />}
                    label="Instagram"
                    value={site.instagram.handle}
                    external
                  />
                  <Tile
                    href={site.facebook.url}
                    icon={<FacebookIcon className="h-6 w-6" />}
                    label="Facebook"
                    value={site.facebook.handle}
                    external
                  />
                  <Tile
                    href={site.google.url}
                    icon={<GoogleIcon className="h-6 w-6" />}
                    label="Avis Google"
                    value={`${site.google.rating.toFixed(1)}/5 · ${site.google.count} avis`}
                    external
                  />
                </div>
              </div>
            </Reveal>

            <div className="mx-auto mt-6 max-w-4xl">
              <ZoneModal variant="banner" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
