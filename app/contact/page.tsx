import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCall from "@/components/StickyCall";
import { site } from "@/lib/site";
import { MailIcon, PhoneIcon } from "@/components/icons";
import ZoneModal from "@/components/ZoneModal";

export const metadata: Metadata = { title: "Contact & prise de rendez-vous", description: "Prenez contact avec Apolo Dog Training pour parler de votre chien à Bordeaux et alentours." };

export default function ContactPage() {
  return <><Header /><main className="pt-28"><section className="bg-brand-tint py-16 md:py-24"><div className="mx-auto max-w-4xl px-5"><span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Prendre rendez-vous</span><h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-tight text-ink md:text-6xl">Parlons de votre chien et de ce que vous vivez au quotidien.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">Décrivez-moi sa situation, son âge et ce que vous aimeriez améliorer. Je vous orienterai vers l&apos;accompagnement le plus pertinent.</p></div></section><section className="bg-white py-16 md:py-24"><div className="mx-auto grid max-w-4xl gap-6 px-5 md:grid-cols-2"><a href={`tel:${site.phoneIntl}`} className="rounded-3xl border border-brand-light p-7 shadow-soft transition-transform hover:-translate-y-1"><PhoneIcon className="h-7 w-7 text-brand" /><p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Téléphone</p><p className="mt-2 text-2xl font-semibold text-ink">{site.phone}</p><p className="mt-3 text-sm leading-relaxed text-ink-soft">Pour une première prise de contact directe.</p></a><a href={`mailto:${site.email}?subject=Demande%20d%27accompagnement%20canin`} className="rounded-3xl border border-brand-light p-7 shadow-soft transition-transform hover:-translate-y-1"><MailIcon className="h-7 w-7 text-brand" /><p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Email</p><p className="mt-2 break-all text-xl font-semibold text-ink">{site.email}</p><p className="mt-3 text-sm leading-relaxed text-ink-soft">Idéal pour expliquer votre situation en quelques lignes.</p></a></div><div className="mx-auto mt-6 max-w-4xl"><ZoneModal variant="banner" /></div></section></main><Footer /><StickyCall /></>;
}
