import { services, site } from "@/lib/site";
import { ArrowIcon, ServiceIcon } from "./icons";
import Reveal from "./Reveal";
import Link from "next/link";

export default function Services() {
  return (
    <section id="services" className="bg-brand-tint py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Mes services
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl text-balance text-3xl font-bold uppercase text-ink sm:text-4xl lg:whitespace-nowrap">
            Révélez le super pouvoir de votre chien
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Un accompagnement pensé pour votre quotidien, les besoins de votre chien et vos objectifs communs.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal
              as="article"
              key={s.title}
              delay={(i % 4) * 80}
              className="group flex h-full flex-col rounded-3xl border border-brand-light bg-white p-7 shadow-[0_6px_30px_-18px_rgba(20,36,46,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-brand"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                <ServiceIcon name={s.icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {s.description}
              </p>
              <Link href={`/services/${s.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-darker transition-colors hover:text-brand">
                En savoir plus <ArrowIcon className="h-4 w-4" />
              </Link>
            </Reveal>
          ))}

          {/* CTA card */}
          <Reveal
            as="article"
            delay={90}
            className="flex h-full flex-col justify-center rounded-3xl bg-brand p-7 text-white shadow-brand"
          >
            <h3 className="text-xl font-bold">Un projet en tête&nbsp;?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Parlons de votre chien et construisons ensemble le programme qui
              lui correspond.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-darker transition-transform hover:-translate-y-0.5"
            >
              Réserver une étude
            </Link>
            <p className="mt-4 text-xs text-white/70">
              {site.role} · {site.area}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
