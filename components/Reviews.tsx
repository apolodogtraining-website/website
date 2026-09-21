import { site } from "@/lib/site";
import type { Review, ReviewsData } from "@/lib/reviews";
import { GoogleIcon, ArrowIcon } from "./icons";
import Reveal from "./Reveal";
import AnimatedNumber from "./AnimatedNumber";
import Stars from "./Stars";
import ReviewsColumn from "./ReviewsColumn";

/** Répartit les avis en `columns` colonnes (round-robin). En dessous de
 * `columns` avis dispo (repli sans clé Google, ou fiche toute neuve), chaque
 * colonne reprend l'ensemble plutôt que de laisser des colonnes vides. */
function splitColumns(items: Review[], columns: number): Review[][] {
  if (items.length === 0) return Array.from({ length: columns }, () => []);
  if (items.length < columns) return Array.from({ length: columns }, () => items);
  return Array.from({ length: columns }, (_, col) => items.filter((_, i) => i % columns === col));
}

type ReviewsProps = {
  data: ReviewsData;
  /** Niveau de titre : `h1` sur la page dédiée /avis, `h2` en section d'accueil. */
  as?: "h1" | "h2";
  heading?: string;
};

export default function Reviews({ data, as: Heading = "h2", heading }: ReviewsProps) {
  // On ne met en avant que les avis 5 étoiles. Repli sur l'ensemble des avis
  // s'il n'y en a aucun (mieux vaut montrer quelque chose que rien) — cas
  // purement défensif vu la note globale du profil.
  const fiveStarReviews = data.reviews.filter((r) => r.rating === 5);
  const featured = fiveStarReviews.length > 0 ? fiveStarReviews : data.reviews;
  const columns = splitColumns(featured, 3);

  return (
    <section id="avis" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Ils m&apos;ont fait confiance
          </span>
          <Heading className="max-w-xl text-balance text-3xl font-bold uppercase text-ink md:text-4xl">
            {heading ?? "Ce que disent les maîtres"}
          </Heading>

          <div className="inline-flex items-center gap-4 rounded-2xl border border-brand-light bg-brand-tint px-6 py-4">
            <GoogleIcon className="h-8 w-8" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <AnimatedNumber value={data.rating} decimals={1} className="text-2xl font-bold text-ink" />
                <Stars rating={data.rating} />
              </div>
              <p className="text-sm text-ink-soft">
                {data.total} avis Google
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal
          delay={100}
          variant="scale"
          className="mt-14 flex max-h-[620px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
        >
          <ReviewsColumn reviews={columns[0]} duration={26} />
          <div className="hidden md:block">
            <ReviewsColumn reviews={columns[1]} duration={32} />
          </div>
          <div className="hidden lg:block">
            <ReviewsColumn reviews={columns[2]} duration={29} />
          </div>
        </Reveal>

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
