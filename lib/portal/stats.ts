import { billableSessions, invoiceStatus, round2 } from "./format";
import type { Contract, Invoice, Partner } from "./types";

const sum = (xs: number[]) => round2(xs.reduce((a, b) => a + b, 0));

/** Synthèse de facturation d'un partenaire (ou de toute la plateforme si on passe tout). */
export function billingSummary(contracts: Contract[], invoices: Invoice[]) {
  return {
    billed: sum(invoices.map((i) => i.gross)),
    collected: sum(invoices.filter((i) => i.clientPaidAt).map((i) => i.gross)),
    commission: sum(invoices.map((i) => i.commission)),
    /** Encaissé auprès du client mais pas encore reversé au partenaire. */
    toPayOut: sum(invoices.filter((i) => i.clientPaidAt && !i.payoutAt).map((i) => i.net)),
    outstanding: sum(invoices.filter((i) => !i.clientPaidAt).map((i) => i.gross)),
    lateCount: invoices.filter((i) => invoiceStatus(i) === "late").length,
    toInvoiceCount: contracts.reduce((n, c) => n + billableSessions(c).length, 0),
  };
}

export function partnerOverview(p: Partner, contracts: Contract[], invoices: Invoice[]) {
  const mine = contracts.filter((c) => c.partnerId === p.id);
  const inv = invoices.filter((i) => i.partnerId === p.id);
  return { contracts: mine, invoices: inv, summary: billingSummary(mine, inv) };
}
