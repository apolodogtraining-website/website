import { site } from "@/lib/site";
import { ArrowIcon } from "./icons";
import Reveal from "./Reveal";
import ReelPlayer from "./ReelPlayer";

export default function Reel() {
  return (
    <section className="bg-brand-tint py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <Reveal className="flex flex-col items-start gap-5">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">En vidéo</span>
          <h2 className="text-balance text-3xl font-semibold leading-tight text-ink md:text-4xl">
            On s&apos;entraîne, on vous montre.
          </h2>
          <p className="max-w-md leading-relaxed text-ink-soft">
            Extraits de séances réelles — obéissance, pistage, mantrailing — pour voir concrètement la méthode Apolo en action, de jour comme de nuit.
          </p>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          >
            Voir d&apos;autres reels sur Instagram
            <ArrowIcon className="h-4 w-4" />
          </a>
        </Reveal>

        <Reveal delay={100} className="flex justify-center lg:justify-end">
          <ReelPlayer />
        </Reveal>
      </div>
    </section>
  );
}
