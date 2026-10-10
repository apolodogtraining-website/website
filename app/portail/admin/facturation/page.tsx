"use client";

import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import InvoiceTable from "@/components/portal/InvoiceTable";
import PortalShell from "@/components/portal/PortalShell";
import { btn, Card, Empty, PageHeader, Stat, Table } from "@/components/portal/ui";
import { billableSessions, money, splitAmount } from "@/lib/portal/format";
import { billingSummary } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

export default function AdminBilling() {
  const router = useRouter();
  const { contracts, invoices, partners, invoiceContract } = usePortal();
  const t = billingSummary(contracts, invoices);
  const pending = contracts.filter((c) => billableSessions(c).length > 0);

  return (
    <PortalShell role="admin">
      <PageHeader title="Facturation" subtitle="Factures clients, encaissements et reversements aux partenaires." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Facturé" value={money(t.billed)} />
        <Stat label="Encaissé" value={money(t.collected)} hint={`${money(t.outstanding)} en attente`} />
        <Stat label="Commissions" value={money(t.commission)} />
        <Stat label="À reverser" value={money(t.toPayOut)} hint="aux partenaires" />
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink">Séances réalisées à facturer</h2>
        {pending.length === 0 ? (
          <Empty>Tout est facturé.</Empty>
        ) : (
          <Table head={["Client", "Partenaire", "Séances", "Montant", "Commission", ""]}>
            {pending.map((c) => {
              const n = billableSessions(c).length;
              const amount = splitAmount(n * c.price, c.commissionRate);
              return (
                <tr key={c.id}>
                  <td className="font-semibold">{c.clientName}</td>
                  <td>{partners.find((p) => p.id === c.partnerId)?.company}</td>
                  <td>{n}</td>
                  <td className="whitespace-nowrap">{money(amount.gross)}</td>
                  <td className="whitespace-nowrap text-ink-soft">{money(amount.commission)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className={btn.primary}
                      onClick={async () => {
                        const id = await invoiceContract(c.id);
                        if (id) router.push(`/portail/facture/${id}`);
                      }}
                    >
                      <Receipt className="h-4 w-4" /> Facturer
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink">Toutes les factures</h2>
        <InvoiceTable admin invoices={invoices} />
      </Card>
    </PortalShell>
  );
}
