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

const PIE_COLORS = ["#2aa9e1", "#8fd3f2", "#1985b4", "#f4efe6", "#a6a7a2", "#0e5f82", "#d5e6ed", "#5c5d59"];

/** Camembert (conic-gradient) avec légende : montant et part de chaque tranche. */
export function PieChart({ items, total, totalLabel, empty }: { items: { label: string; value: number }[]; total: number; totalLabel: string; empty: string }) {
  if (total <= 0 || items.length === 0) return <p className="text-sm text-ink-soft">{empty}</p>;
  const stops = items.map((it, i) => {
    const before = items.slice(0, i).reduce((n, x) => n + x.value, 0);
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${(before / total) * 100}% ${((before + it.value) / total) * 100}%`;
  });
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        role="img"
        aria-label={items.map((it) => `${it.label} : ${money(it.value)}`).join(", ")}
        className="h-44 w-44 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      />
      <div className="min-w-0 flex-1 self-stretch">
        <ul className="space-y-2.5">
          {items.map((it, i) => (
            <li key={it.label} className="flex items-center gap-2.5 text-sm">
              <span aria-hidden className="h-3 w-3 shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate text-ink">{it.label}</span>
              <span className="shrink-0 text-ink-soft">
                {money(it.value)} · {Math.round((it.value / total) * 100)} %
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-brand-light/60 pt-3 text-sm text-ink-soft">
          {totalLabel} : <span className="font-semibold text-ink">{money(total)}</span>
        </p>
      </div>
    </div>
  );
}
