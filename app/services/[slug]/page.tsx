import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { serviceAreas, services, site, type Service } from "@/lib/site";
import { ArrowIcon, CheckIcon, ServiceIcon } from "@/components/icons";
import { jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return {
    title: service.metaTitle ?? `${service.title} à Bordeaux`,
    description: service.metaDescription ?? service.description,
    alternates: { canonical: `/services/${slug}` },
  };
}

function buildJsonLd(service: Service) {
  const url = `${site.url}/services/${service.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.title,
      description: service.metaDescription ?? service.description,
      url,
      serviceType: service.tag ?? service.title,
      provider: { "@id": `${site.url}/#business` },
      areaServed: serviceAreas.map((city) => ({ "@type": "City", name: city })),
      audience: { "@type": "Audience", audienceType: "Propriétaires de chiens" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
        { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/services` },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  if (service.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: service.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const related = (service.related ?? [])
    .map((s) => services.find((item) => item.slug === s))
    .filter((s): s is Service => Boolean(s));

  const hasLongForm = Boolean(service.intro?.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildJsonLd(service)) }}
      />
      <Header />
      <main className="pt-28">
        {/* ── En-tête ──────────────────────────────────────────────────────── */}
        <section className="bg-brand-tint py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-5">
            <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-ink-soft">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-brand">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/services" className="hover:text-brand">
                    Services
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-ink" aria-current="page">
                  {service.title}
                </li>
              </ol>
            </nav>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
            </div>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              {site.area}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
              {service.h1 ?? service.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {service.description}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark"
            >
              Échanger sur mon chien <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {hasLongForm ? (
          <>
            {/* ── En quoi ça consiste ──────────────────────────────────────── */}
            <section className="bg-white py-16 md:py-24">
              <div className="mx-auto max-w-2xl px-5">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                  En quoi ça consiste
                </span>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  {service.intro!.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Pour quel chien ──────────────────────────────────────────── */}
            {service.forWhom?.length ? (
              <section className="bg-brand-tint py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                    Pour quel chien
                  </span>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold leading-tight text-ink md:text-4xl">
                    À qui cet accompagnement s&apos;adresse vraiment.
                  </h2>
                  <div className="mt-10 grid gap-4 md:grid-cols-2">
                    {service.forWhom.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-3xl border border-brand-light bg-white p-6"
                      >
                        <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                        <p className="mt-3 leading-relaxed text-ink-soft">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {/* ── Déroulé d'une séance : une vraie séquence, d'où la numérotation ── */}
            {service.sessionFlow?.length ? (
              <section className="bg-ink py-16 text-white md:py-24">
                <div className="mx-auto max-w-4xl px-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                    Déroulé d&apos;une séance
                  </span>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold leading-tight md:text-4xl">
                    Ce qui se passe, dans l&apos;ordre.
                  </h2>
                  <ol className="mt-10 divide-y divide-white/15">
                    {service.sessionFlow.map((step, i) => (
                      <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-3 py-5">
                        <span className="text-sm font-semibold text-brand">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                          <p className="mt-2 leading-relaxed text-white/70">{step.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ) : null}

            {/* ── Bénéfices ────────────────────────────────────────────────── */}
            {service.benefits?.length ? (
              <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-3xl px-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                    Ce que ça change
                  </span>
                  <ul className="mt-8 space-y-4">
                    {service.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brand" />
                        <span className="text-lg leading-relaxed text-ink-soft">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {/* ── FAQ propre au service ────────────────────────────────────── */}
            {service.faq?.length ? (
              <section className="bg-brand-tint py-16 md:py-24">
                <div className="mx-auto max-w-3xl px-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                    Questions fréquentes
                  </span>
                  <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight text-ink md:text-4xl">
                    Ce qu&apos;on me demande le plus souvent.
                  </h2>
                  <div className="mt-8 divide-y divide-brand-light border-y border-brand-light">
                    {service.faq.map(({ q, a }) => (
                      <details key={q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-ink">
                          <span>{q}</span>
                          <span className="text-2xl font-normal text-brand transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="max-w-2xl pt-3 leading-relaxed text-ink-soft">{a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        ) : (
          /* Gabarit court, tant que le contenu long n'est pas rédigé. */
          <section className="bg-white py-16 md:py-24">
            <div className="mx-auto grid max-w-4xl gap-12 px-5 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  Un accompagnement qui part de votre réalité.
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft">
                  Avant toute recommandation, nous prenons le temps d&apos;observer votre
                  situation, votre environnement et les besoins de votre chien.
                  L&apos;objectif : vous donner des repères concrets, applicables au quotidien.
                </p>
              </div>
              <div className="rounded-3xl bg-brand-tint p-7">
                <h2 className="text-xl font-semibold text-ink">Comment commencer ?</h2>
                <ol className="mt-5 space-y-4 text-ink-soft">
                  <li>
                    <span className="font-semibold text-brand">01 — </span>Prendre contact et
                    décrire votre besoin.
                  </li>
                  <li>
                    <span className="font-semibold text-brand">02 — </span>Planifier une première
                    évaluation adaptée.
                  </li>
                  <li>
                    <span className="font-semibold text-brand">03 — </span>Avancer avec un plan
                    clair et un suivi.
                  </li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* ── Maillage interne ───────────────────────────────────────────────── */}
        {related.length ? (
          <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-5">
              <h2 className="text-2xl font-semibold text-ink">
                Ces accompagnements vont souvent avec.
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/services/${item.slug}`}
                    className="flex h-full flex-col rounded-3xl border border-brand-light p-6 shadow-soft transition-transform hover:-translate-y-1"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
                      <ServiceIcon name={item.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-darker">
                      Découvrir {item.tag ?? item.title.toLowerCase()} à Bordeaux
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Appel à l'action ───────────────────────────────────────────────── */}
        <section className="bg-brand-tint py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Un doute sur le bon point de départ ?
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold text-ink">
              Parlons de votre chien avant de choisir.
            </h2>
            <Link
              href="/contact"
              className="mt-7 inline-flex rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark"
            >
              Réserver une évaluation
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCall />
    </>
  );
}
