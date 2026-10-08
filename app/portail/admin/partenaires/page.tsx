"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PartnerForm from "@/components/portal/PartnerForm";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, ConfirmModal, Empty, PageHeader, Table } from "@/components/portal/ui";
import { money } from "@/lib/portal/format";
import { partnerOverview } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";
import type { Partner } from "@/lib/portal/types";

export default function AdminPartners() {
  const { partners, contracts, invoices, deletePartner } = usePortal();
  const [editing, setEditing] = useState<Partner | "new" | null>(null);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  return (
    <PortalShell role="admin">
      <PageHeader
        title="Partenaires"
        subtitle="Création, modification et suppression des comptes partenaires."
        action={
          <button type="button" className={btn.primary} onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Nouveau partenaire
          </button>
        }
      />
      <Card>
        {partners.length === 0 ? (
          <Empty>Aucun partenaire. Créez le premier compte.</Empty>
        ) : (
          <Table head={["Partenaire", "Contact", "Commission", "Contrat partenaire", "Contrats", "Facturé", "Compte", ""]}>
            {partners.map((p) => {
              const o = partnerOverview(p, contracts, invoices);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/portail/admin/partenaires/${p.id}`} className="font-semibold text-brand-dark hover:underline">
                      {p.company}
                    </Link>
                    <div className="text-xs text-ink-soft">{p.specialties}</div>
                  </td>
                  <td>
                    {p.contact}
                    <div className="text-xs text-ink-soft">{p.email}</div>
                  </td>
                  <td>{p.commissionRate} %</td>
                  <td>{p.contractSignedAt ? <Badge tone="green">Signé</Badge> : <Badge tone="amber">En attente</Badge>}</td>
                  <td>{o.contracts.length}</td>
                  <td className="whitespace-nowrap">{money(o.summary.billed)}</td>
                  <td>{p.active ? <Badge tone="green">Actif</Badge> : <Badge tone="gray">Suspendu</Badge>}</td>
                  <td className="whitespace-nowrap text-right">
                    <button type="button" aria-label={`Modifier ${p.company}`} className="rounded-full p-2 text-ink-soft hover:bg-brand-tint" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Supprimer ${p.company}`} className="rounded-full p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(p)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {editing && <PartnerForm partner={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmModal
          title={`Supprimer ${deleting.company} ?`}
          message="Le compte, ses contrats clients et ses factures seront définitivement supprimés. Pour conserver l'historique, suspendez plutôt le compte depuis « Modifier »."
          confirmLabel="Supprimer"
          onConfirm={() => deletePartner(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </PortalShell>
  );
}
