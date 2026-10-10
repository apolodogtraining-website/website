"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysISO, todayISO } from "@/lib/portal/format";
import type { Contract, Partner } from "@/lib/portal/types";

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });
const rangeFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

/** Lundi de la semaine contenant `iso`. */
function mondayOf(iso: string) {
  const d = new Date(`${iso}T12:00`);
  const shift = (d.getDay() + 6) % 7;
  return addDaysISO(iso, -shift);
}

/** Mini-calendrier de la semaine : les séances planifiées et réalisées, jour par jour. */
export default function WeekCalendar({ contracts, partners }: { contracts: Contract[]; partners: Partner[] }) {
  const today = todayISO();
  const [monday, setMonday] = useState(() => mondayOf(today));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i)), [monday]);
  const items = useMemo(
    () =>
      contracts
        .flatMap((c) => c.sessions.filter((s) => s.status !== "cancelled").map((s) => ({ c, s })))
        .filter(({ s }) => s.date.slice(0, 10) >= days[0] && s.date.slice(0, 10) <= days[6])
        .sort((a, b) => a.s.date.localeCompare(b.s.date)),
    [contracts, days],
  );
  const nav = "grid h-8 w-8 place-items-center border border-brand-light text-ink-soft hover:bg-brand-tint";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          Du {rangeFmt.format(new Date(`${days[0]}T12:00`))} au {rangeFmt.format(new Date(`${days[6]}T12:00`))}
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Semaine précédente" className={nav} onClick={() => setMonday(addDaysISO(monday, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="h-8 border border-brand-light px-3 text-xs font-semibold text-ink-soft hover:bg-brand-tint" onClick={() => setMonday(mondayOf(today))}>
            Aujourd&apos;hui
          </button>
          <button type="button" aria-label="Semaine suivante" className={nav} onClick={() => setMonday(addDaysISO(monday, 7))}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const list = items.filter(({ s }) => s.date.startsWith(day));
          return (
            <div key={day} className={`min-h-24 border p-2 ${day === today ? "border-brand" : "border-brand-light/70"}`}>
              <p className={`text-xs font-semibold capitalize ${day === today ? "text-brand" : "text-ink-soft"}`}>{dayFmt.format(new Date(`${day}T12:00`))}</p>
              <ul className="mt-1.5 space-y-1.5">
                {list.map(({ c, s }) => {
                  const partner = partners.find((p) => p.id === c.partnerId);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/portail/admin/contrats/${c.id}`}
                        className={`block border-l-2 px-1.5 py-1 text-xs leading-snug hover:bg-brand-tint ${s.status === "done" ? "border-emerald-600 text-ink-soft" : "border-brand text-ink"}`}
                      >
                        <span className="font-semibold">{s.date.slice(11, 16)}</span> {c.clientName}
                        <span className="block truncate text-ink-soft">{partner?.isSelf ? "Moi-même" : partner?.company}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
