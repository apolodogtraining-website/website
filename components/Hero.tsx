import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowIcon, StarIcon } from "./icons";

export default function Hero() {
  return (
    <section id="accueil" className="relative isolate overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/hero.jpg"
          alt="Malinois joyeux courant après un frisbee lors d'une séance d'activité canine"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/45 to-ink/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker/55 to-transparent" />
      </div>

      <div className="min-h-screen-mobile mx-auto flex max-w-6xl flex-col justify-center px-5 pb-16 pt-28 md:pt-32">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-white/90">
            <div className="flex text-[#fbbc05]">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-5 w-5" />
              ))}
            </div>
            <p className="text-sm font-medium">
              {site.google.rating.toFixed(1)}/5 sur Google · {site.google.count} avis clients
            </p>
          </div>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            Rééduquez votre chien grâce aux <span className="text-sand">activités de flair.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
            Observez les premiers changements{" "}
            <strong className="font-semibold text-white">
              dès les premières séances et retrouvez un chien plus calme
            </strong>
            , concentré et épanoui en quelques semaines grâce à l&apos;obéissance fonctionnelle, au Tracking, à la détection sportive, au Hunting Game.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Réserver une évaluation
              <ArrowIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-ink"
            >
              Découvrir les accompagnements
            </Link>
          </div>

          <span className="mt-10 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
            Éducateur canin à {site.area}
          </span>
        </div>
      </div>
    </section>
  );
}
