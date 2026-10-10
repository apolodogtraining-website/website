"use client";

import { fmtDateTime, money, toLocalInput } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { Contract, SessionStatus } from "@/lib/portal/types";
import { Badge, type Tone } from "./ui";

const label: Record<SessionStatus, string> = { planned: "Planifiée", done: "Réalisée", cancelled: "Annulée" };
const tone: Record<SessionStatus, Tone> = { planned: "blue", done: "green", cancelled: "gray" };

/** Liste des séances d'un contrat. Le partenaire valide une séance réalisée ; l'administrateur gère tout. */
export default function SessionList({ contract, admin }: { contract: Contract; admin?: boolean }) {
  const { setSessionStatus, removeSession, invoices } = usePortal();
  const now = toLocalInput(new Date());

  return (
    <ul className="divide-y divide-brand-light/60 text-sm">
      {contract.sessions.map((s) => {
        const invoice = invoices.find((i) => i.id === s.invoiceId);
        const locked = Boolean(s.invoiceId);
        return (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{fmtDateTime(s.date)}</span>
              <Badge tone={tone[s.status]}>{label[s.status]}</Badge>
              <span className="text-ink-soft">{money(contract.price)}</span>
              {invoice && <span className="text-xs text-ink-soft">· facture {invoice.number}</span>}
            </div>
            {!locked && (
              <div className="flex flex-wrap gap-3">
                {s.status !== "done" && s.date <= now && (
                  <button type="button" className="text-sm font-semibold text-brand-dark hover:underline" onClick={() => setSessionStatus(contract.id, s.id, "done")}>
                    Marquer réalisée
                  </button>
                )}
                {admin && s.status === "done" && (
                  <button type="button" className="text-sm font-semibold text-ink-soft hover:underline" onClick={() => setSessionStatus(contract.id, s.id, "planned")}>
                    Remettre en planifiée
                  </button>
                )}
                {s.status === "planned" && (
                  <button type="button" className="text-sm font-semibold text-ink-soft hover:underline" onClick={() => setSessionStatus(contract.id, s.id, "cancelled")}>
                    Annuler
                  </button>
                )}
                {admin && (
                  <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => removeSession(contract.id, s.id)}>
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
