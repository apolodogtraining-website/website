"use client";

import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, Card, PageHeader, Stat, Table } from "@/components/portal/ui";
import { fmtDateTime, money, nextSession } from "@/lib/portal/format";
import { billingSummary, partnerOverview } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

export default function AdminHome() {
  const { partners, contracts, invoices, requests } = usePortal();
  const total = billingSummary(contracts, invoices);
  const activeContracts = contracts.filter((c) => c.sessions.some((s) => s.status === "planned"));
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const unsigned = partners.filter((p) => p.active && !p.contractSignedAt);

  const upcoming = contracts
    .map((c) => ({ c, next: nextSession(c) }))
    .filter((x): x is { c: typeof x.c; next: NonNullable<typeof x.next> } => Boolean(x.next))
    .sort((a, b) => a.next.date.localeCompare(b.next.date))
    .slice(0, 5);

  return (
    <PortalShell role="admin">
      <PageHeader title="Vue d'ensemble" subtitle="Partenaires, contrats et état de la facturation." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Partenaires actifs" value={String(partners.filter((p) => p.active).length)} hint={`${partners.length} au total`} />
        <Stat label="Contrats en cours" value={String(activeContracts.length)} hint={`${contracts.length} au total`} />
        <Stat label="Commissions" value={money(total.commission)} hint={`sur ${money(total.billed)} facturés`} />
        <Stat label="Impayés clients" value={money(total.outstanding)} hint={total.lateCount ? `${total.lateCount} en retard` : "aucun retard"} tone={total.lateCount ? "red" : undefined} />
      </div>

      {(pendingRequests.length > 0 || unsigned.length > 0 || total.toInvoiceCount > 0 || total.toPayOut > 0) && (
        <Card className="mt-6">
          <h2 className="mb-3 text-base font-bold text-ink">À traiter</h2>
          <ul className="space-y-2 text-sm">
            {pendingRequests.length > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">Nouveau</Badge>
                <Link href="/portail/admin/inscriptions" className="font-semibold text-brand-dark hover:underline">
                  {pendingRequests.length} inscription{pendingRequests.length > 1 ? "s" : ""} client{pendingRequests.length > 1 ? "s" : ""} à affecter à un partenaire
                </Link>
              </li>
            )}
            {unsigned.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">Contrat non signé</Badge>
                <Link href={`/portail/admin/partenaires/${p.id}`} className="font-semibold text-brand-dark hover:underline">
                  {p.company}
                </Link>
              </li>
            ))}
            {total.toInvoiceCount > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">À facturer</Badge>
                <Link href="/portail/admin/facturation" className="font-semibold text-brand-dark hover:underline">
                  {total.toInvoiceCount} séance{total.toInvoiceCount > 1 ? "s" : ""} réalisée{total.toInvoiceCount > 1 ? "s" : ""} sans facture
                </Link>
              </li>
            )}
            {total.toPayOut > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">À reverser</Badge>
                <Link href="/portail/admin/facturation" className="font-semibold text-brand-dark hover:underline">
                  {money(total.toPayOut)} encaissés, en attente de reversement aux partenaires
                </Link>
              </li>
            )}
          </ul>
        </Card>
      )}

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Partenaires</h2>
          <Link href="/portail/admin/partenaires" className="text-sm font-semibold text-brand-dark hover:underline">
            Gérer
          </Link>
        </div>
        <Table head={["Partenaire", "Contrat partenaire", "Contrats clients", "Facturé", "À reverser", "Facturation"]}>
          {partners.map((p) => {
            const o = partnerOverview(p, contracts, invoices);
            return (
              <tr key={p.id}>
                <td>
                  <Link href={`/portail/admin/partenaires/${p.id}`} className="font-semibold text-brand-dark hover:underline">
                    {p.company}
                  </Link>
                  {!p.active && <span className="ml-2 text-xs text-ink-soft">(suspendu)</span>}
                </td>
                <td>{p.contractSignedAt ? <Badge tone="green">Signé</Badge> : <Badge tone="amber">En attente</Badge>}</td>
                <td>{o.contracts.length}</td>
                <td className="whitespace-nowrap">{money(o.summary.billed)}</td>
                <td className="whitespace-nowrap">{money(o.summary.toPayOut)}</td>
                <td>
                  {o.summary.lateCount > 0 ? (
                    <Badge tone="red">{o.summary.lateCount} en retard</Badge>
                  ) : o.summary.toInvoiceCount > 0 ? (
                    <Badge tone="amber">{o.summary.toInvoiceCount} à facturer</Badge>
                  ) : o.summary.outstanding > 0 ? (
                    <Badge tone="blue">En attente de paiement</Badge>
                  ) : (
                    <Badge tone="green">À jour</Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink">Prochains rendez-vous</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucun rendez-vous planifié.</p>
        ) : (
          <ul className="divide-y divide-brand-light/60 text-sm">
            {upcoming.map(({ c, next }) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <Link href={`/portail/admin/contrats/${c.id}`} className="font-semibold text-brand-dark hover:underline">
                    {c.clientName}
                  </Link>
                  <span className="text-ink-soft"> · {c.service}</span>
                </div>
                <div className="text-ink-soft">
                  {fmtDateTime(next.date)} · {partners.find((p) => p.id === c.partnerId)?.company}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PortalShell>
  );
}
