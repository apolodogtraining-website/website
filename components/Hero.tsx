import Image from "next/image";
import { site } from "@/lib/site";
import HeroTextParallax from "./HeroTextParallax";
import HeroIntro from "./HeroIntro";

type HeroProps = {
  rating?: number;
  total?: number;
};

export default function Hero({
  rating = site.google.rating,
  total = site.google.count,
}: HeroProps) {
  return (
    <section id="accueil" className="relative isolate overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/hero.jpg"
          alt="Frédéric et son chien Malinois en séance de travail face à l'océan"
          fill
          priority
          sizes="100vw"
          className="hero-kenburns object-cover object-center"
        />
        {/* Assombrissement léger (40%) validé par Frédéric — juste de quoi
            garder le texte lisible, sans écraser la photo. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/15 to-ink/60" />
      </div>

      <div className="min-h-screen-mobile mx-auto flex max-w-6xl flex-col justify-center px-5 pb-16 pt-28 md:pt-32">
        <HeroTextParallax className="max-w-2xl">
          <HeroIntro rating={rating} total={total} />
        </HeroTextParallax>
      </div>
    </section>
  );
}
