import { billableSessions, invoiceStatus, round2 } from "./format";
import type { ClientRequest, Contract, Invoice, Partner } from "./types";

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

/* ---------- tableau de bord administrateur ---------- */

export type PeriodKind = "month" | "quarter" | "year";
export type Range = { from: string; to: string };

const p2 = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m0: number) => {
  const d = new Date(y, m0, 1); // m0 hors bornes accepté (-1 → décembre précédent)
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-01`;
};

/** Période courante et période précédente de même durée (bornes « YYYY-MM-DD », fin exclue). */
export function periodRanges(kind: PeriodKind, now = new Date()): { cur: Range; prev: Range; label: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (kind === "year") return { cur: { from: ymd(y, 0), to: ymd(y + 1, 0) }, prev: { from: ymd(y - 1, 0), to: ymd(y, 0) }, label: String(y) };
  if (kind === "quarter") {
    const q = Math.floor(m / 3) * 3;
    return { cur: { from: ymd(y, q), to: ymd(y, q + 3) }, prev: { from: ymd(y, q - 3), to: ymd(y, q) }, label: `T${q / 3 + 1} ${y}` };
  }
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(now);
  return { cur: { from: ymd(y, m), to: ymd(y, m + 1) }, prev: { from: ymd(y, m - 1), to: ymd(y, m) }, label };
}

const within = (iso: string | null | undefined, r: Range) => Boolean(iso) && iso!.slice(0, 10) >= r.from && iso!.slice(0, 10) < r.to;
const daysBetween = (a: string, b: string) => Math.max(0, Math.round((new Date(`${b.slice(0, 10)}T12:00`).getTime() - new Date(`${a.slice(0, 10)}T12:00`).getTime()) / 86_400_000));

export type Alert = { key: string; tone: "red" | "amber" | "blue"; text: string; href: string };

export function dashboardStats(partners: Partner[], contracts: Contract[], invoices: Invoice[], requests: ClientRequest[], kind: PeriodKind, now = new Date()) {
  const { cur, prev, label } = periodRanges(kind, now);
  const gross = (r: Range) => sum(invoices.filter((i) => within(i.issuedAt, r)).map((i) => i.gross));
  const revenue = gross(cur);
  const prevRevenue = gross(prev);
  const sessions = contracts.flatMap((c) => c.sessions).filter((x) => within(x.date, cur));
  const inPeriod = requests.filter((r) => within(r.createdAt, cur));
  const converted = inPeriod.filter((r) => r.status === "converted");
  const delays = converted.map((r) => {
    const c = contracts.find((x) => x.id === r.contractId);
    return c ? daysBetween(r.createdAt, c.createdAt) : null;
  }).filter((d): d is number => d !== null);

  const group = (key: (i: Invoice) => string) => {
    const m = new Map<string, number>();
    for (const i of invoices.filter((x) => within(x.issuedAt, cur))) m.set(key(i), round2((m.get(key(i)) ?? 0) + i.gross));
    return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  const serviceOf = (i: Invoice) => contracts.find((c) => c.id === i.contractId)?.service ?? "Autre";
  const partnerOf = (i: Invoice) => {
    const p = partners.find((x) => x.id === i.partnerId);
    return p ? (p.isSelf ? "Moi-même" : p.company) : "—";
  };

  // Six derniers mois (mois courant compris), selon la date d'émission des factures.
  const months = Array.from({ length: 6 }, (_, k) => {
    const from = ymd(now.getFullYear(), now.getMonth() - (5 - k));
    const to = ymd(now.getFullYear(), now.getMonth() - (4 - k));
    const lbl = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(`${from}T12:00`)).replace(".", "");
    return { label: lbl, value: gross({ from, to }) };
  });

  const activeContracts = contracts.filter((c) => c.sessions.some((x) => x.status === "planned"));
  const dogsTodo = activeContracts.flatMap((c) => c.dogs ?? []).filter((d) => d.ficheStatus !== "completed").length;

  return {
    label,
    revenue,
    prevRevenue,
    /** Évolution en % par rapport à la période précédente (null si rien à comparer). */
    delta: prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null,
    collected: sum(invoices.filter((i) => within(i.clientPaidAt, cur)).map((i) => i.gross)),
    outstanding: sum(invoices.filter((i) => !i.clientPaidAt).map((i) => i.gross)),
    sessions: {
      done: sessions.filter((x) => x.status === "done").length,
      planned: sessions.filter((x) => x.status === "planned").length,
      cancelled: sessions.filter((x) => x.status === "cancelled").length,
    },
    newClients: contracts.filter((c) => within(c.createdAt, cur)).length,
    requests: {
      total: inPeriod.length,
      converted: converted.length,
      declined: inPeriod.filter((r) => r.status === "declined").length,
      /** Part des inscriptions de la période devenues contrat (null sans inscription). */
      rate: inPeriod.length ? Math.round((converted.length / inPeriod.length) * 100) : null,
      avgDays: delays.length ? Math.round((delays.reduce((a, b) => a + b, 0) / delays.length) * 10) / 10 : null,
    },
    dogsTodo,
    byService: group(serviceOf),
    byPartner: group(partnerOf),
    months,
  };
}

/** Points d'attention du tableau de bord (hors « À traiter », qui garde ses propres entrées). */
export function dashboardAlerts(partners: Partner[], contracts: Contract[], requests: ClientRequest[], now = new Date()): Alert[] {
  const out: Alert[] = [];
  const iso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const nowIso = iso(now);
  const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

  const stale = requests.filter((r) => r.status === "pending" && r.createdAt < iso(new Date(now.getTime() - 48 * 3_600_000)));
  if (stale.length) out.push({ key: "stale", tone: "red", text: `${plural(stale.length, "demande", "demandes")} sans réponse depuis plus de 48 h`, href: "/portail/admin/inscriptions" });

  const past = contracts.flatMap((c) => c.sessions).filter((x) => x.status === "planned" && x.date < nowIso);
  if (past.length) out.push({ key: "past", tone: "amber", text: `${plural(past.length, "séance passée", "séances passées")} à marquer comme réalisée ou annulée`, href: "/portail/admin/contrats" });

  const idle = contracts.filter((c) => c.type === "recurring" && !c.sessions.some((x) => x.status === "planned"));
  if (idle.length) out.push({ key: "idle", tone: "blue", text: `${plural(idle.length, "contrat récurrent", "contrats récurrents")} sans séance planifiée`, href: "/portail/admin/contrats" });

  const weekAgo = iso(new Date(now.getTime() - 7 * 86_400_000)).slice(0, 10);
  const unsigned = partners.filter((p) => p.active && !p.isSelf && !p.contractSignedAt && p.createdAt < weekAgo);
  if (unsigned.length) out.push({ key: "unsigned", tone: "amber", text: `${plural(unsigned.length, "partenaire", "partenaires")} sans contrat signé depuis plus de 7 jours`, href: "/portail/admin/partenaires" });

  return out;
}
