"use client";

import InvoiceTable from "@/components/portal/InvoiceTable";
import PortalShell from "@/components/portal/PortalShell";
import { Card, PageHeader, Stat } from "@/components/portal/ui";
import { money } from "@/lib/portal/format";
import { partnerOverview } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

export default function PartnerBilling() {
  const { currentPartner: p, contracts, invoices } = usePortal();
  if (!p) return <PortalShell role="partner">{null}</PortalShell>;
  const o = partnerOverview(p, contracts, invoices);
  const net = (xs: typeof o.invoices) => xs.reduce((n, i) => n + i.net, 0);

  return (
    <PortalShell role="partner">
      <PageHeader
        title="Facturation"
        subtitle="Le client règle la plateforme ; vous êtes réglé du net une fois la facture encaissée."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total facturé" value={money(o.summary.billed)} />
        <Stat label="Commission" value={money(o.summary.commission)} hint={`taux ${p.commissionRate} %`} />
        <Stat label="Net réglé" value={money(net(o.invoices.filter((i) => i.payoutAt)))} />
        <Stat label="Net à recevoir" value={money(net(o.invoices.filter((i) => !i.payoutAt)))} hint="y compris factures non payées" />
      </div>
      <Card className="mt-6">
        <InvoiceTable invoices={o.invoices} />
      </Card>
    </PortalShell>
  );
}
