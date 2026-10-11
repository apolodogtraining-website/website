import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
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
      className="flex items-center gap-4 rounded-2xl bg-surface p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
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

/**
 * Téléphone et WhatsApp sur le même numéro : une tuile au gabarit des autres, avec le numéro en haut
 * et deux boutons dessous — « Appeler » (tel:) et « WhatsApp » (ouvre la conversation).
 */
function PhoneTile() {
  return (
    <div className="rounded-2xl bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <PhoneIcon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">Téléphone &amp; WhatsApp</span>
          <span className="block break-words text-base font-semibold text-ink sm:text-lg">{site.phone}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={`tel:${site.phoneIntl}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-cta transition-colors hover:bg-brand-dark"
        >
          <PhoneIcon className="h-4 w-4" /> Appeler
        </a>
        <a
          href={site.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Écrire sur WhatsApp au ${site.phone}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
        >
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

const STEPS = [
  ["1", "Vous m'écrivez", "Quelques lignes sur votre chien et votre quotidien."],
  ["2", "Je vous réponds", "Je vous oriente vers l'accompagnement adapté."],
  ["3", "On fait le point", "Étude de comportement, puis programme sur mesure."],
] as const;

/** Photo avec les trois étapes en surimpression, sur un fond flou et translucide comme le menu du site. */
function Photo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/photos/contact.jpg"
        alt="Un berger belge assis sur la plage face à un coucher de soleil rouge et orange"
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover object-top"
      />
      <ol className="absolute inset-x-3 bottom-3 grid gap-2 rounded-2xl bg-deep/75 p-3 backdrop-blur-md sm:grid-cols-3 sm:gap-2.5">
        {STEPS.map(([n, t, d]) => (
          <li key={n} className="flex gap-2.5 text-ink sm:block">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-cta">{n}</span>
            <span className="block sm:mt-1.5">
              <span className="block text-sm font-semibold leading-snug">{t}</span>
              <span className="hidden text-xs leading-snug text-ink/70 sm:block">{d}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Colonne de droite : photo avec étapes en surimpression, tuiles de contact, puis zone d'intervention. */
function Aside() {
  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      <Photo className="min-h-96 flex-1 rounded-2xl lg:min-h-56" />
      <PhoneTile />
      <Tile href={`mailto:${site.email}?subject=Demande%20d%27accompagnement%20canin`} icon={<MailIcon className="h-6 w-6" />} label="Email" value={site.email} />
      <Tile href={site.instagram.url} icon={<InstagramIcon className="h-6 w-6" />} label="Instagram" value={site.instagram.handle} external />
      <Tile href={site.facebook.url} icon={<FacebookIcon className="h-6 w-6" />} label="Facebook" value={site.facebook.handle} external />
      <ZoneModal variant="tile" />
    </div>
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
      <main className="pt-20">
        <section className="bg-brand-tint py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-5">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Prendre rendez-vous
            </span>
            <h1 className="mt-2 max-w-3xl text-balance text-5xl font-semibold leading-tight text-ink md:text-6xl">
              Parlons de votre chien et de ce que vous vivez au quotidien.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Décrivez-moi sa situation, son âge et ce que vous aimeriez améliorer. Je vous orienterai
              vers l&apos;accompagnement le plus pertinent.
            </p>
          </div>
        </section>

        <section className="bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="contact-gradient overflow-hidden rounded-none shadow-brand">
              <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:p-12">
                <div className="min-w-0 rounded-3xl bg-surface p-6 sm:p-8">
                  <ContactForm />
                </div>

                <Aside />
              </div>
            </Reveal>

          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
