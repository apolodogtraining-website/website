import { money } from "@/lib/portal/format";

/** Barres verticales (ex. chiffre d'affaires des 6 derniers mois). Le dernier mois est mis en avant. */
export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={data.map((d) => `${d.label} : ${money(d.value)}`).join(", ")}>
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
          <span className="mb-1 truncate text-center text-[11px] font-semibold text-ink-soft">{d.value > 0 ? money(d.value) : ""}</span>
          <div
            className={`w-full ${i === data.length - 1 ? "bg-brand" : "bg-brand/40"}`}
            style={{ height: `${Math.max(d.value > 0 ? 4 : 1, (d.value / max) * 100)}%` }}
          />
          <span className="mt-1.5 text-center text-xs capitalize text-ink-soft">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Barres horizontales avec part en %, triées par l'appelant. */
export function ShareBars({ items, empty }: { items: { label: string; value: number }[]; empty: string }) {
  const total = items.reduce((a, b) => a + b.value, 0);
  if (total <= 0) return <p className="text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const pct = Math.round((it.value / total) * 100);
        return (
          <li key={it.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink">{it.label}</span>
              <span className="shrink-0 text-ink-soft">
                {money(it.value)} · {pct} %
              </span>
            </div>
            <div className="mt-1 h-2 bg-brand-tint">
              <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
