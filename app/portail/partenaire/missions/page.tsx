"use client";

import { MapPin, Phone } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import DogsPanel from "@/components/portal/DogsPanel";
import SessionList from "@/components/portal/SessionList";
import { Badge, Card, Empty, PageHeader } from "@/components/portal/ui";
import { contractBilling, fmtPhone, frequencyLabel, money, splitAmount } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";

export default function PartnerContracts() {
  const { currentPartner: p, contracts, invoices } = usePortal();
  const mine = contracts.filter((c) => c.partnerId === p?.id);

  return (
    <PortalShell role="partner">
      <PageHeader title="Mes contrats" subtitle="Clients qui vous sont confiés, ponctuels ou récurrents." />
      {mine.length === 0 ? (
        <Card>
          <Empty>Aucun contrat pour le moment.</Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {mine.map((c) => {
            const b = contractBilling(c, invoices);
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-ink">{c.clientName}</h2>
                    <p className="text-sm text-ink-soft">{c.service}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.type === "recurring" ? <Badge tone="blue">Récurrent · {c.frequency ? frequencyLabel[c.frequency] : ""}</Badge> : <Badge>Ponctuel</Badge>}
                    <Badge tone={b.tone}>{b.label}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden /> {c.address}
                  </span>
                  {c.clientPhone && (
                    <a href={`tel:${c.clientPhone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-brand-dark">
                      <Phone className="h-4 w-4" aria-hidden /> {fmtPhone(c.clientPhone)}
                    </a>
                  )}
                </div>
                <p className="mt-3 text-sm text-ink">
                  {money(c.price)} / séance · <strong>{money(splitAmount(c.price, c.commissionRate).net)} net pour vous</strong>{" "}
                  <span className="text-ink-soft">(commission {c.commissionRate} %)</span>
                </p>
                {c.notes && <p className="mt-2 rounded-xl bg-brand-tint px-3.5 py-2.5 text-sm text-ink-soft">{c.notes}</p>}
                <div className="mt-4 border-t border-brand-light/60 pt-2">
                  <SessionList contract={c} />
                </div>
                <DogsPanel contract={c} area="partner" embedded />
              </Card>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}
