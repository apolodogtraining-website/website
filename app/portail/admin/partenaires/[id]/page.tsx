"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Pencil, Plus } from "lucide-react";
import ContractForm from "@/components/portal/ContractForm";
import InvoiceTable from "@/components/portal/InvoiceTable";
import PartnerForm from "@/components/portal/PartnerForm";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, Empty, Modal, PageHeader, Stat, Table } from "@/components/portal/ui";
import { contractBilling, fmtDate, fmtDateTime, money, nextSession } from "@/lib/portal/format";
import { partnerOverview } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

export default function AdminPartnerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { partners, contracts, invoices, resetPartnerPassword } = usePortal();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const partner = partners.find((p) => p.id === id);
  if (!partner) {
    return (
      <PortalShell role="admin">
        <p className="text-sm text-ink-soft">Partenaire introuvable.</p>
        <Link href="/portail/admin/partenaires" className={`${btn.ghost} mt-3`}>
          <ArrowLeft className="h-4 w-4" /> Retour aux partenaires
        </Link>
      </PortalShell>
    );
  }

  const o = partnerOverview(partner, contracts, invoices);

  return (
    <PortalShell role="admin">
      <Link href="/portail/admin/partenaires" className={`${btn.ghost} mb-3`}>
        <ArrowLeft className="h-4 w-4" /> Partenaires
      </Link>
      <PageHeader
        title={partner.company}
        subtitle={`${partner.contact} · ${partner.email}${partner.phone ? ` · ${partner.phone}` : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn.secondary} onClick={async () => setNewPassword((await resetPartnerPassword(partner.id)) ?? null)}>
              <KeyRound className="h-4 w-4" /> Réinitialiser le mot de passe
            </button>
            <button type="button" className={btn.secondary} onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Modifier
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Facturé" value={money(o.summary.billed)} hint={`${o.invoices.length} facture${o.invoices.length > 1 ? "s" : ""}`} />
        <Stat label="Commission" value={money(o.summary.commission)} hint={`taux ${partner.commissionRate} %`} />
        <Stat label="À reverser" value={money(o.summary.toPayOut)} hint="client déjà payé" />
        <Stat label="Impayés" value={money(o.summary.outstanding)} hint={o.summary.lateCount ? `${o.summary.lateCount} en retard` : undefined} tone={o.summary.lateCount ? "red" : undefined} />
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-ink">Contrat partenaire</h2>
        {partner.contractSignedAt ? (
          <p className="text-sm text-ink-soft">
            <Badge tone="green">Signé</Badge> par <strong className="text-ink">{partner.contractSignedBy}</strong> le{" "}
            {fmtDateTime(partner.contractSignedAt)} (version {partner.contractVersion}).
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            <Badge tone="amber">En attente de signature</Badge> Le partenaire devra signer à sa prochaine connexion avant
            d&apos;accéder au portail. Compte créé le {fmtDate(partner.createdAt)}.
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ink">Contrats clients</h2>
          <button type="button" className={btn.secondary} onClick={() => setAdding(true)} disabled={!partner.active}>
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
        {o.contracts.length === 0 ? (
          <Empty>Aucun contrat client pour ce partenaire.</Empty>
        ) : (
          <Table head={["Client", "Type", "Prochain rendez-vous", "Prix / séance", "Facturation"]}>
            {o.contracts.map((c) => {
              const next = nextSession(c);
              const b = contractBilling(c, invoices);
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={`/portail/admin/contrats/${c.id}`} className="font-semibold text-brand-dark hover:underline">
                      {c.clientName}
                    </Link>
                    <div className="text-xs text-ink-soft">{c.service}</div>
                  </td>
                  <td>{c.type === "recurring" ? <Badge tone="blue">Récurrent</Badge> : <Badge>Ponctuel</Badge>}</td>
                  <td className="whitespace-nowrap">{next ? fmtDateTime(next.date) : "—"}</td>
                  <td className="whitespace-nowrap">{money(c.price)}</td>
                  <td>
                    <Badge tone={b.tone}>{b.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-ink">Factures</h2>
        <InvoiceTable admin invoices={o.invoices} />
      </Card>

      {editing && <PartnerForm partner={partner} onClose={() => setEditing(false)} />}
      {adding && <ContractForm presetPartnerId={partner.id} onClose={() => setAdding(false)} />}
      {newPassword && (
        <Modal title="Nouveau mot de passe" onClose={() => setNewPassword(null)}>
          <p className="text-sm text-ink-soft">Transmettez-le au partenaire :</p>
          <p className="mt-3 rounded-xl bg-brand-tint p-4 text-center font-mono text-base font-semibold">{newPassword}</p>
          <div className="mt-5 flex justify-end">
            <button type="button" className={btn.primary} onClick={() => setNewPassword(null)}>
              Terminé
            </button>
          </div>
        </Modal>
      )}
    </PortalShell>
  );
}
