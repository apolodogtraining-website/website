import Image from "next/image";
import type { Review } from "@/lib/reviews";
import Stars from "./Stars";

type ReviewsColumnProps = {
  reviews: Review[];
  duration?: number;
  className?: string;
};

/**
 * Colonne d'avis qui défile verticalement en boucle continue (le tableau
 * est dupliqué pour une boucle sans coupure visible). Voir `.reviews-marquee`
 * dans globals.css : pause au survol/focus et coupée si
 * prefers-reduced-motion — un contenu qui défile seul plus de 5s doit
 * pouvoir être arrêté (WCAG 2.2.2).
 */
export default function ReviewsColumn({ reviews, duration = 24, className = "" }: ReviewsColumnProps) {
  if (reviews.length === 0) return null;

  return (
    <div
      className={`reviews-marquee flex flex-col gap-5 ${className}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {[...reviews, ...reviews].map((r, i) => (
        <div
          key={i}
          className="flex w-full max-w-xs flex-col rounded-3xl border border-brand-light bg-white p-7 shadow-[0_6px_30px_-18px_rgba(20,36,46,0.35)]"
        >
          <Stars rating={r.rating} />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">&ldquo;{r.text}&rdquo;</p>
          <div className="mt-6 flex items-center gap-3 border-t border-brand-light pt-4">
            {r.profilePhoto ? (
              <Image
                src={r.profilePhoto}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {r.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{r.author}</p>
              {r.relativeTime && <p className="text-xs text-ink-soft">{r.relativeTime}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
