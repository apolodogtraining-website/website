import { site } from "@/lib/site";
import {
  PhoneIcon,
  MailIcon,
  InstagramIcon,
  MapPinIcon,
  StarIcon,
} from "./icons";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-darker shadow-brand">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:p-14">
            <div className="text-white">
              <h2 className="text-balance text-3xl font-bold uppercase lg:text-4xl">
                Parlons de votre chien
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-white/85">
                Décrivez-moi brièvement votre situation ou votre objectif. Je vous réponds rapidement pour vous orienter vers l&apos;accompagnement le plus pertinent.
              </p>

              <div className="mt-8 flex items-center gap-3 text-white/90">
                <MapPinIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm">
                  {site.areaLong}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-white/90">
                <div className="flex text-[#fbbc05]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4" />
                  ))}
                </div>
                <span className="text-sm">
                  {site.google.rating}/5 · {site.google.count} avis Google
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
              <a
                href={`tel:${site.phoneIntl}`}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand sm:h-12 sm:w-12">
                  <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Téléphone
                  </span>
                  <span className="block text-lg font-semibold text-ink">
                    {site.phone}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${site.email}`}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand sm:h-12 sm:w-12">
                  <MailIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Email
                  </span>
                  <span className="block break-all text-xs font-semibold text-ink sm:text-lg">
                    {site.email}
                  </span>
                </span>
              </a>

              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand sm:h-12 sm:w-12">
                  <InstagramIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Instagram
                  </span>
                  <span className="block text-lg font-semibold text-ink">
                    {site.instagram.handle}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
