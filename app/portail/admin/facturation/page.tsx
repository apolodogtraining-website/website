"use client";

import { useRouter } from "next/navigation";
import { Download, Receipt } from "lucide-react";
import InvoiceTable from "@/components/portal/InvoiceTable";
import PortalShell from "@/components/portal/PortalShell";
import { btn, Card, Empty, PageHeader, Stat, Table } from "@/components/portal/ui";
import { billableSessions, money, splitAmount } from "@/lib/portal/format";
import { billingSummary } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

/** Export des factures au format CSV (séparateur « ; », virgule décimale, BOM : s'ouvre directement dans Excel). */
function exportCsv(rows: string[][]) {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `factures-apolo-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBilling() {
  const router = useRouter();
  const { contracts, invoices, partners, invoiceContract } = usePortal();
  const t = billingSummary(contracts, invoices);
  const pending = contracts.filter((c) => billableSessions(c).length > 0);

  return (
    <PortalShell role="admin">
      <PageHeader
        title="Facturation"
        subtitle="Factures clients, encaissements et reversements aux partenaires."
        action={
          <button
            type="button"
            className={btn.secondary}
            disabled={invoices.length === 0}
            onClick={() => {
              const n = (x: number) => x.toFixed(2).replace(".", ",");
              exportCsv([
                ["Numéro", "Émise le", "Échéance", "Client", "Partenaire", "Prestation", "Total", "Commission", "Net partenaire", "Payée le", "Reversée le"],
                ...[...invoices]
                  .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt) || a.number.localeCompare(b.number))
                  .map((i) => {
                    const c = contracts.find((x) => x.id === i.contractId);
                    const p = partners.find((x) => x.id === i.partnerId);
                    return [i.number, i.issuedAt, i.dueAt, c?.clientName ?? "", p?.isSelf ? "Moi-même" : (p?.company ?? ""), c?.service ?? "", n(i.gross), n(i.commission), n(i.net), i.clientPaidAt ?? "", i.payoutAt ?? ""];
                  }),
              ]);
            }}
          >
            <Download className="h-4 w-4" /> Exporter en CSV
          </button>
        }
      />

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
