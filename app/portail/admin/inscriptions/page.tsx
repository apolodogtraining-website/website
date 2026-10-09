"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, UserPlus } from "lucide-react";
import ContractForm from "@/components/portal/ContractForm";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, ConfirmModal, Empty, PageHeader } from "@/components/portal/ui";
import { fmtDateTime } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { ClientRequest } from "@/lib/portal/types";

const statusBadge = {
  pending: <Badge tone="amber">À traiter</Badge>,
  converted: <Badge tone="green">Contrat créé</Badge>,
  declined: <Badge>Refusée</Badge>,
};

export default function AdminRequests() {
  const { requests, partners, declineRequest, deleteRequest } = usePortal();
  const [converting, setConverting] = useState<ClientRequest | null>(null);
  const [deleting, setDeleting] = useState<ClientRequest | null>(null);
  const [copied, setCopied] = useState(false);
  const [addingExisting, setAddingExisting] = useState(false);

  const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <PortalShell role="admin">
      <PageHeader
        title="Inscriptions clients"
        subtitle="Dossiers créés et contrats signés par les clients. Affectez-les à un partenaire pour créer le contrat."
        action={
          <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.primary} onClick={() => setAddingExisting(true)} disabled={!partners.some((p) => p.active)}>
            <UserPlus className="h-4 w-4" /> Ajouter un client existant
          </button>
          <button
            type="button"
            className={btn.secondary}
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/portail/inscription`).then(() => setCopied(true));
            }}
          >
            {copied ? "Lien copié" : "Copier le lien d'inscription"}
          </button>
          </div>
        }
      />
      {sorted.length === 0 ? (
        <Card>
          <Empty>Aucune inscription. Partagez le lien d&apos;inscription avec vos clients.</Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">{r.name}</h2>
                  <p className="text-sm text-ink-soft">
                    {r.service} · {r.type === "recurring" ? "suivi régulier" : "séance ponctuelle"}
                  </p>
                </div>
                {statusBadge[r.status]}
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <Info k="E-mail" v={r.email} />
                <Info k="Téléphone" v={r.phone} />
                <Info k="Adresse" v={r.address} />
                <Info k="Chien" v={[r.dogName, r.dogBreed].filter(Boolean).join(" — ")} />
                <Info k="Date souhaitée" v={r.preferredDate ? fmtDateTime(r.preferredDate) : "—"} />
                <Info k="Contrat signé" v={`${r.signedBy}, le ${fmtDateTime(r.signedAt)} (v. ${r.contractVersion})`} />
              </dl>
              {r.notes && <p className="mt-3 rounded-xl bg-brand-tint px-3.5 py-2.5 text-sm text-ink-soft">{r.notes}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {r.status === "pending" && (
                  <>
                    <button type="button" className={btn.primary} onClick={() => setConverting(r)} disabled={!partners.some((p) => p.active)}>
                      Créer le contrat
                    </button>
                    <button type="button" className={btn.secondary} onClick={() => declineRequest(r.id)}>
                      Refuser
                    </button>
                  </>
                )}
                {r.contractId && (
                  <Link href={`/portail/admin/contrats/${r.contractId}`} className={btn.ghost}>
                    Voir le contrat
                  </Link>
                )}
                <button type="button" aria-label={`Supprimer l'inscription de ${r.name}`} className="ml-auto rounded-full p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(r)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {converting && <ContractForm request={converting} onClose={() => setConverting(null)} />}
      {addingExisting && <ContractForm existingClient onClose={() => setAddingExisting(false)} />}
      {deleting && (
        <ConfirmModal
          title="Supprimer cette inscription ?"
          message="Le dossier et la trace de la signature du client seront définitivement supprimés."
          confirmLabel="Supprimer"
          onConfirm={() => deleteRequest(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </PortalShell>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-soft">{k} :</dt>
      <dd className="text-ink">{v || "—"}</dd>
    </div>
  );
}
