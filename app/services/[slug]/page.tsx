import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { services, site } from "@/lib/site";
import { ArrowIcon, ServiceIcon } from "@/components/icons";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return { title: `${service.title} à Bordeaux`, description: service.description };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  return <><Header /><main className="pt-28"><section className="bg-brand-tint py-16 md:py-24"><div className="mx-auto max-w-4xl px-5"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand"><ServiceIcon name={service.icon} className="h-7 w-7" /></div><p className="mt-7 text-sm font-semibold uppercase tracking-[0.14em] text-brand">{site.area}</p><h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-6xl">{service.title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{service.description}</p><a href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-brand hover:bg-brand-dark">Échanger sur mon chien <ArrowIcon className="h-5 w-5" /></a></div></section><section className="bg-white py-16 md:py-24"><div className="mx-auto grid max-w-4xl gap-12 px-5 md:grid-cols-2"><div><h2 className="text-2xl font-semibold text-ink">Un accompagnement qui part de votre réalité.</h2><p className="mt-4 leading-relaxed text-ink-soft">Avant toute recommandation, nous prenons le temps d&apos;observer votre situation, votre environnement et les besoins de votre chien. L&apos;objectif : vous donner des repères concrets, applicables au quotidien.</p></div><div className="rounded-3xl bg-brand-tint p-7"><h2 className="text-xl font-semibold text-ink">Comment commencer ?</h2><ol className="mt-5 space-y-4 text-ink-soft"><li><span className="font-semibold text-brand">01 — </span>Prendre contact et décrire votre besoin.</li><li><span className="font-semibold text-brand">02 — </span>Planifier une première évaluation adaptée.</li><li><span className="font-semibold text-brand">03 — </span>Avancer avec un plan clair et un suivi.</li></ol></div></div></section></main><Footer /><StickyCall /></>;
}
