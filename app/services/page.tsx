import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { services } from "@/lib/site";
import { ArrowIcon, ServiceIcon } from "@/components/icons";
import Link from "next/link";
import { breadcrumb, graph, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Accompagnements canins à Bordeaux",
  description: "Éducation, accompagnement comportemental et activités de flair à Bordeaux et alentours.",
  alternates: { canonical: "/services" },
};

const jsonLd = graph(breadcrumb([{ name: "Services", path: "/services" }]));

export default function ServicesPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} /><Header /><main className="pt-28"><section className="bg-brand-tint py-16 md:py-24"><div className="mx-auto max-w-6xl px-5"><span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Accompagnements</span><h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-tight text-ink md:text-6xl">Une réponse juste pour votre chien et votre quotidien.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">Éducation, comportement et activités de flair : chaque accompagnement commence par vos besoins réels et le rythme de votre chien.</p></div></section><section className="bg-white py-16 md:py-24"><div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-2">{services.map((service) => <article key={service.slug} className="flex flex-col rounded-3xl border border-brand-light p-7 shadow-soft"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand"><ServiceIcon name={service.icon} className="h-6 w-6" /></div><h2 className="mt-5 text-xl font-semibold text-ink">{service.title}</h2><p className="mt-3 flex-1 leading-relaxed text-ink-soft">{service.description}</p><Link href={`/services/${service.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-darker hover:text-brand">Découvrir l&apos;accompagnement <ArrowIcon className="h-4 w-4" /></Link></article>)}</div></section><section className="bg-ink py-16 text-white"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 md:flex-row md:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Un doute sur le bon accompagnement ?</p><h2 className="mt-2 text-3xl font-semibold">Parlons de votre chien.</h2></div><Link href="/contact" className="inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold shadow-brand hover:bg-brand-dark">Réserver une évaluation <ArrowIcon className="h-5 w-5" /></Link></div></section></main><Footer /><StickyCall /></>;
}
