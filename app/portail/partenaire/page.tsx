"use client";

import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, Card, Empty, PageHeader, Stat } from "@/components/portal/ui";
import { contractBilling, fmtDateTime, money, nextSession } from "@/lib/portal/format";
import { partnerOverview } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

export default function PartnerHome() {
  const { currentPartner: p, contracts, invoices } = usePortal();
  if (!p) return <PortalShell role="partner">{null}</PortalShell>;
  const o = partnerOverview(p, contracts, invoices);
  const net = (xs: typeof o.invoices) => xs.reduce((n, i) => n + i.net, 0);

  const upcoming = o.contracts
    .map((c) => ({ c, next: nextSession(c) }))
    .filter((x): x is { c: typeof x.c; next: NonNullable<typeof x.next> } => Boolean(x.next))
    .sort((a, b) => a.next.date.localeCompare(b.next.date));

  return (
    <PortalShell role="partner">
      <PageHeader title={`Bonjour ${p.contact.split(" ")[0]}`} subtitle="Vos contrats et l'état de votre facturation." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Contrats" value={String(o.contracts.length)} hint={`${upcoming.length} avec un rendez-vous à venir`} />
        <Stat label="Net perçu" value={money(net(o.invoices.filter((i) => i.payoutAt)))} hint="déjà réglé" />
        <Stat label="À recevoir" value={money(o.summary.toPayOut)} hint="client payé, reversement en cours" />
        <Stat label="En attente client" value={money(net(o.invoices.filter((i) => !i.clientPaidAt)))} hint="factures non réglées" />
      </div>

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Prochains rendez-vous</h2>
          <Link href="/portail/partenaire/missions" className="text-sm font-semibold text-brand-dark hover:underline">
            Tous mes contrats
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Empty>Aucun rendez-vous planifié.</Empty>
        ) : (
          <ul className="divide-y divide-brand-light/60 text-sm">
            {upcoming.slice(0, 5).map(({ c, next }) => (
              <li key={c.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{c.clientName}</span>
                  <span className="text-ink-soft">{fmtDateTime(next.date)}</span>
                </div>
                <div className="text-ink-soft">
                  {c.service} · {c.address}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink">État de facturation par contrat</h2>
        {o.contracts.length === 0 ? (
          <Empty>Aucun contrat pour le moment.</Empty>
        ) : (
          <ul className="divide-y divide-brand-light/60 text-sm">
            {o.contracts.map((c) => {
              const b = contractBilling(c, invoices);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium text-ink">
                    {c.clientName} <span className="font-normal text-ink-soft">· {c.service}</span>
                  </span>
                  <Badge tone={b.tone}>{b.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </PortalShell>
  );
}
