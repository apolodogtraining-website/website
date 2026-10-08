"use client";

import Link from "next/link";
import { fmtDate, invoiceStatus, invoiceStatusLabel, money } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { Invoice, InvoiceStatus } from "@/lib/portal/types";
import { Badge, btn, Empty, type Tone, Table } from "./ui";

export const statusTone: Record<InvoiceStatus, Tone> = { sent: "blue", late: "red", paid: "amber", settled: "green" };

/** Vue admin : actions d'encaissement et de reversement. Vue partenaire : lecture seule, montants nets. */
export default function InvoiceTable({ invoices, admin }: { invoices: Invoice[]; admin?: boolean }) {
  const { contracts, partners, markClientPaid, markPayout } = usePortal();
  if (invoices.length === 0) return <Empty>Aucune facture pour le moment.</Empty>;

  const sorted = [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt) || b.number.localeCompare(a.number));
  const head = admin
    ? ["Facture", "Partenaire", "Client", "Total", "Commission", "Net partenaire", "État", ""]
    : ["Facture", "Client", "Total", "Commission", "Net à percevoir", "État", ""];

  return (
    <Table head={head}>
      {sorted.map((inv) => {
        const st = invoiceStatus(inv);
        const contract = contracts.find((c) => c.id === inv.contractId);
        const partner = partners.find((p) => p.id === inv.partnerId);
        return (
          <tr key={inv.id}>
            <td className="whitespace-nowrap">
              <Link href={`/portail/facture/${inv.id}`} className="font-semibold text-brand-dark hover:underline">
                {inv.number}
              </Link>
              <div className="text-xs text-ink-soft">émise le {fmtDate(inv.issuedAt)}</div>
            </td>
            {admin && <td>{partner?.company ?? "—"}</td>}
            <td>{contract?.clientName ?? "—"}</td>
            <td className="whitespace-nowrap">{money(inv.gross)}</td>
            <td className="whitespace-nowrap text-ink-soft">{money(inv.commission)}</td>
            <td className="whitespace-nowrap font-semibold">{money(inv.net)}</td>
            <td>
              <Badge tone={statusTone[st]}>{invoiceStatusLabel[st]}</Badge>
              <div className="mt-1 text-xs text-ink-soft">
                {st === "settled" && inv.payoutAt
                  ? `réglé le ${fmtDate(inv.payoutAt)}`
                  : st === "paid" && inv.clientPaidAt
                    ? `payée le ${fmtDate(inv.clientPaidAt)}`
                    : `échéance ${fmtDate(inv.dueAt)}`}
              </div>
            </td>
            <td className="whitespace-nowrap text-right">
              {admin && !inv.clientPaidAt && (
                <button type="button" className={btn.secondary} onClick={() => markClientPaid(inv.id)}>
                  Marquer payée
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
  );
}
