import { StarIcon } from "./icons";

export default function Stars({ rating }: { rating: number }) {
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
