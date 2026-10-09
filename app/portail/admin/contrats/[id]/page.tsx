"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Receipt, Trash2 } from "lucide-react";
import ContractForm from "@/components/portal/ContractForm";
import InvoiceTable from "@/components/portal/InvoiceTable";
import PortalShell from "@/components/portal/PortalShell";
import SessionList from "@/components/portal/SessionList";
import { Badge, btn, Card, ConfirmModal, Field, inputCls, PageHeader } from "@/components/portal/ui";
import { billableSessions, fmtDateTime, frequencyLabel, money, splitAmount, toLocalInput } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";

export default function AdminContractDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { contracts, partners, invoices, deleteContract, invoiceContract, addSession } = usePortal();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newDate, setNewDate] = useState("");

  const contract = contracts.find((c) => c.id === id);
  if (!contract) {
    return (
      <PortalShell role="admin">
        <p className="text-sm text-ink-soft">Contrat introuvable.</p>
        <Link href="/portail/admin/contrats" className={`${btn.ghost} mt-3`}>
          <ArrowLeft className="h-4 w-4" /> Retour aux contrats
        </Link>
      </PortalShell>
    );
  }

  const partner = partners.find((p) => p.id === contract.partnerId);
  const todo = billableSessions(contract);
  const preview = splitAmount(todo.length * contract.price, contract.commissionRate);

  return (
    <PortalShell role="admin">
      <Link href="/portail/admin/contrats" className={`${btn.ghost} mb-3`}>
        <ArrowLeft className="h-4 w-4" /> Contrats clients
      </Link>
      <PageHeader
        title={contract.clientName}
        subtitle={contract.service}
        action={
          <div className="flex gap-2">
            <button type="button" className={btn.secondary} onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button type="button" className={btn.danger} onClick={() => setDeleting(true)}>
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-bold text-ink">Client</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Type">{contract.type === "recurring" ? <Badge tone="blue">Récurrent · {contract.frequency ? frequencyLabel[contract.frequency] : ""}</Badge> : <Badge>Ponctuel</Badge>}</Row>
            <Row k="Adresse">{contract.address}</Row>
            <Row k="Téléphone">{contract.clientPhone || "—"}</Row>
            <Row k="E-mail">{contract.clientEmail || "—"}</Row>
            {contract.notes && <Row k="Notes">{contract.notes}</Row>}
            <Row k="Contrat client">
              {contract.clientSignedAt ? `Signé par ${contract.clientSignedBy}, le ${fmtDateTime(contract.clientSignedAt)}` : <Badge tone="gray">Non signé en ligne (client existant)</Badge>}
            </Row>
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-bold text-ink">Conditions</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Partenaire">
              {partner ? (
                <Link href={`/portail/admin/partenaires/${partner.id}`} className="font-semibold text-brand-dark hover:underline">
                  {partner.company}
                </Link>
              ) : (
                "—"
              )}
            </Row>
            <Row k="Prix / séance">{money(contract.price)}</Row>
            <Row k="Commission">{contract.commissionRate} %</Row>
            <Row k="Net partenaire / séance">{money(splitAmount(contract.price, contract.commissionRate).net)}</Row>
          </dl>
          <div className="mt-4 border-t border-brand-light/60 pt-4">
            {todo.length > 0 ? (
              <>
                <p className="text-sm text-ink-soft">
                  {todo.length} séance{todo.length > 1 ? "s" : ""} réalisée{todo.length > 1 ? "s" : ""} à facturer :{" "}
                  <strong className="text-ink">{money(preview.gross)}</strong> dont {money(preview.commission)} de commission.
                </p>
                <button
                  type="button"
                  className={`${btn.primary} mt-3`}
                  onClick={async () => {
                    const invId = await invoiceContract(contract.id);
                    if (invId) router.push(`/portail/facture/${invId}`);
                  }}
                >
                  <Receipt className="h-4 w-4" /> Générer la facture
                </button>
              </>
            ) : (
              <p className="text-sm text-ink-soft">Aucune séance réalisée en attente de facturation.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-1 text-base font-bold text-ink">Séances</h2>
        <SessionList contract={contract} admin />
        <form
          className="mt-4 flex flex-wrap items-end gap-3 border-t border-brand-light/60 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (newDate) {
              addSession(contract.id, newDate);
              setNewDate("");
            }
          }}
        >
          <Field label="Ajouter une séance">
            {(fid) => <input id={fid} type="datetime-local" required className={inputCls} value={newDate} min={toLocalInput(new Date())} onChange={(e) => setNewDate(e.target.value)} />}
          </Field>
          <button type="submit" className={btn.secondary}>
            Ajouter
          </button>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-ink">Factures du contrat</h2>
        <InvoiceTable admin invoices={invoices.filter((i) => i.contractId === contract.id)} />
      </Card>

      {editing && <ContractForm contract={contract} onClose={() => setEditing(false)} />}
      {deleting && (
        <ConfirmModal
          title="Supprimer ce contrat ?"
          message="Le contrat, ses séances et ses factures seront définitivement supprimés."
          confirmLabel="Supprimer"
          onConfirm={async () => {
            await deleteContract(contract.id);
            router.replace("/portail/admin/contrats");
          }}
          onClose={() => setDeleting(false)}
        />
      )}
    </PortalShell>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-soft">{k}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
