"use client";

import Link from "next/link";
import { useState } from "react";
import { balanceDue, fmtDate, invoiceLabel, invoiceStatus, invoiceStatusLabel, money, paidAmount } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { Invoice, InvoiceStatus } from "@/lib/portal/types";
import PaymentModal from "./PaymentModal";
import { Badge, btn, ConfirmModal, Empty, type Tone, Table } from "./ui";

export const statusTone: Record<InvoiceStatus, Tone> = { sent: "blue", partial: "blue", late: "red", paid: "amber", settled: "green" };

/** Vue admin : actions d'encaissement et de reversement. Vue partenaire : lecture seule, montants nets. */
export default function InvoiceTable({ invoices, admin }: { invoices: Invoice[]; admin?: boolean }) {
  const { contracts, partners, markPayout, remindInvoice } = usePortal();
  const [reminding, setReminding] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  if (invoices.length === 0) return <Empty>Aucune facture pour le moment.</Empty>;

  const sorted = [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt) || b.number.localeCompare(a.number));
  const head = admin
    ? ["Facture", "Partenaire", "Client", "Total", "Commission", "Net partenaire", "État", ""]
    : ["Facture", "Client", "Total", "Commission", "Net à percevoir", "État", ""];

  return (
    <>
    <Table head={head}>
      {sorted.map((inv) => {
        const st = invoiceStatus(inv);
        const contract = contracts.find((c) => c.id === inv.contractId);
        const partner = partners.find((p) => p.id === inv.partnerId);
        const paid = paidAmount(inv);
        const partiallyPaid = !inv.clientPaidAt && paid > 0;
        return (
          <tr key={inv.id}>
            <td className="whitespace-nowrap">
              <Link href={`/portail/facture/${inv.id}`} className="font-semibold text-brand-dark hover:underline">
                {inv.number}
              </Link>
              <div className="text-xs text-ink-soft">émise le {fmtDate(inv.issuedAt)}</div>
            </td>
            {admin && <td>{partner?.isSelf ? "Moi-même" : (partner?.company ?? "—")}</td>}
            <td>
              {contract?.clientName ?? "—"}
              <div className="text-xs text-ink-soft">{invoiceLabel(inv, contract)}</div>
            </td>
            <td className="whitespace-nowrap">{money(inv.gross)}</td>
            <td className="whitespace-nowrap text-ink-soft">{money(inv.commission)}</td>
            <td className="whitespace-nowrap font-semibold">{money(inv.net)}</td>
            <td>
              <Badge tone={statusTone[st]}>{partner?.isSelf && st === "settled" ? "Payée" : invoiceStatusLabel[st]}</Badge>
              <div className="mt-1 text-xs text-ink-soft">
                {st === "settled" && inv.payoutAt
                  ? `réglé le ${fmtDate(inv.payoutAt)}`
                  : st === "paid" && inv.clientPaidAt
                    ? `payée le ${fmtDate(inv.clientPaidAt)}`
                    : `échéance ${fmtDate(inv.dueAt)}`}
              </div>
              {partiallyPaid && (
                <div className="text-xs font-semibold text-ink">
                  payé {money(paid)} sur {money(inv.gross)}
                </div>
              )}
              {admin && inv.lastReminderAt && !inv.clientPaidAt && <div className="text-xs text-ink-soft">relancée le {fmtDate(inv.lastReminderAt)}</div>}
            </td>
            <td className="whitespace-nowrap text-right">
              {admin && st === "late" && (
                <>
                  <button type="button" className={`${btn.secondary} mr-2`} onClick={() => setReminding(inv)}>
                    Relancer
                  </button>
                </>
              )}
              {admin && !inv.clientPaidAt && (
                <button type="button" className={btn.secondary} onClick={() => setPaying(inv)}>
                  {partiallyPaid ? "Ajouter un paiement" : "Enregistrer un paiement"}
                </button>
              )}
              {admin && inv.clientPaidAt && !inv.payoutAt && (
                <button type="button" className={btn.primary} onClick={() => markPayout(inv.id)}>
                  Reverser {money(inv.net)}
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </Table>
    {paying && <PaymentModal invoice={paying} onClose={() => setPaying(null)} />}
    {reminding && (
      <ConfirmModal
        title="Relancer le client ?"
        message={`Un e-mail de rappel de paiement pour la facture ${reminding.number} (reste à payer : ${money(balanceDue(reminding))}) sera envoyé à ${contracts.find((c) => c.id === reminding.contractId)?.clientEmail ?? "son adresse"}.`}
        confirmLabel="Envoyer la relance"
        onConfirm={() => void remindInvoice(reminding.id)}
        onClose={() => setReminding(null)}
      />
    )}
    </>
  );
}
