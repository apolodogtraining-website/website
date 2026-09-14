import { site } from "@/lib/site";
import type { ReviewsData } from "@/lib/reviews";
import { StarIcon, GoogleIcon, ArrowIcon } from "./icons";
import Reveal from "./Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex text-[#fbbc05]" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "" : "text-ink/15"}`}
        />
      ))}
    </div>
  );
}

export default function Reviews({ data }: { data: ReviewsData }) {
  return (
    <section id="avis" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Ils m&apos;ont fait confiance
          </span>
          <h2 className="max-w-xl text-balance text-3xl font-bold uppercase text-ink md:text-4xl">
            Ce que disent les maîtres
          </h2>

          <div className="inline-flex items-center gap-4 rounded-2xl border border-brand-light bg-brand-tint px-6 py-4">
            <GoogleIcon className="h-8 w-8" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-ink">
                  {data.rating.toFixed(1)}
                </span>
                <Stars rating={data.rating} />
              </div>
              <p className="text-sm text-ink-soft">
                {data.total} avis Google
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {data.reviews.slice(0, 3).map((r, i) => (
            <Reveal
              as="article"
              key={i}
              delay={(i % 3) * 90}
              className="flex h-full flex-col rounded-3xl border border-brand-light bg-white p-7 shadow-[0_6px_30px_-18px_rgba(20,36,46,0.35)]"
            >
              <Stars rating={r.rating} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                “{r.text}”
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-brand-light pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {r.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{r.author}</p>
                  {r.relativeTime && (
                    <p className="text-xs text-ink-soft">{r.relativeTime}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={site.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white px-6 py-3 text-sm font-semibold text-brand-darker transition-colors hover:bg-brand-light"
          >
            Voir tous les avis sur Google
            <ArrowIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
