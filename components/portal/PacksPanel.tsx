"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Receipt } from "lucide-react";
import { fmtDate, money, packCommissionRate, paidAmount, parseDecimal, splitAmount, todayISO } from "@/lib/portal/format";
import { PACKS, packFrom, packLabel, type PackKind } from "@/lib/portal/packs";
import { usePortal } from "@/lib/portal/store";
import type { Contract, Invoice, Pack } from "@/lib/portal/types";
import { Badge, btn, Card, ConfirmModal, Empty, Field, inputCls, Modal, NumberInput } from "./ui";

const asInput = (n: number) => String(n).replace(".", ",");

type Preset = { kind: PackKind; price: number; commissionRate: number };

/** Ajout, modification ou renouvellement d'un pack : choix d'une des 3 formules, prix convenu modifiable. */
function PackForm({ contract, self, pack, preset, invoiced, onClose }: { contract: Contract; self: boolean; pack?: Pack; preset?: Preset; invoiced?: boolean; onClose: () => void }) {
  const { savePack } = usePortal();
  const [kind, setKind] = useState<PackKind>(pack?.kind ?? preset?.kind ?? "initial");
  const [price, setPrice] = useState(asInput(pack?.price ?? preset?.price ?? packFrom(kind)));
  // Tant que le prix n'a pas été modifié à la main, il suit le tarif de référence de la formule choisie.
  const [priceEdited, setPriceEdited] = useState(Boolean(pack || preset));
  // Commission du partenaire sur ce pack : celle du contrat par défaut, modifiable pour chaque pack.
  const [commission, setCommission] = useState(asInput(self ? 0 : (pack?.commissionRate ?? preset?.commissionRate ?? contract.commissionRate)));
  const [orderedAt, setOrderedAt] = useState(pack?.orderedAt ?? todayISO());
  const [notes, setNotes] = useState(pack?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal title={pack ? "Modifier le pack" : preset ? "Renouveler le pack" : "Ajouter un pack"} onClose={onClose}>
      {invoiced && <p className="mb-4 rounded-sm bg-brand-tint px-4 py-3 text-sm text-ink-soft">Ce pack est déjà facturé : son type et son prix ne peuvent plus changer.</p>}
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const value = parseDecimal(price);
          if (Number.isNaN(value) || value <= 0) return setError("Indiquez le prix convenu (un nombre, par exemple 899).");
          const rate = self ? 0 : parseDecimal(commission);
          if (Number.isNaN(rate) || rate < 0 || rate > 100) return setError("La commission doit être un nombre entre 0 et 100.");
          setError("");
          setBusy(true);
          const id = await savePack(contract.id, { kind, price: value, orderedAt, notes, commissionRate: rate }, pack?.id);
          setBusy(false);
          if (id) onClose();
        }}
      >
        <Field label="Pack choisi" required>
          {(id) => (
            <select
              id={id}
              className={inputCls}
              value={kind}
              disabled={invoiced}
              onChange={(e) => {
                const next = e.target.value as PackKind;
                setKind(next);
                if (!priceEdited) setPrice(asInput(packFrom(next)));
              }}
            >
              {PACKS.map((p) => (
                <option key={p.kind} value={p.kind}>
                  {p.label} (à partir de {p.from} €)
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix convenu (€)" required hint={`Tarif de référence : à partir de ${packFrom(kind)} €. Modifiez-le si le prix convenu avec le client est différent.`}>
            {(id) => (
              <NumberInput
                id={id}
                required
                disabled={invoiced}
                value={price}
                onValueChange={(v) => {
                  setPrice(v);
                  setPriceEdited(true);
                }}
              />
            )}
          </Field>
          <Field label="Date de l'accord" required hint="Après l'étude de comportement.">
            {(id) => <input id={id} type="date" required className={inputCls} value={orderedAt} onChange={(e) => setOrderedAt(e.target.value)} />}
          </Field>
        </div>
        <Field
          label="Commission du partenaire (%)"
          hint={self ? "Aucune : vous réalisez la prestation." : invoiced ? "Figée : le pack est déjà facturé." : "Propre à ce pack. Reprise du contrat par défaut."}
        >
          {(id) => <NumberInput id={id} required readOnly={self || invoiced} value={self ? "0" : commission} onValueChange={setCommission} />}
        </Field>
        <Field label="Notes" hint="Facultatif : contenu convenu, particularités…">
          {(id) => <textarea id={id} rows={2} maxLength={500} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />}
        </Field>
        {error && (
          <p role="alert" className="rounded-sm bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className={btn.secondary} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={btn.primary} disabled={busy}>
            {pack ? "Enregistrer" : "Ajouter le pack"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Packs commandés par un client. Le client choisit son pack après l'étude de comportement : on l'enregistre ici
 * avec le prix convenu, puis on le facture. Un client peut enchaîner plusieurs packs (renouvellement).
 */
export default function PacksPanel({ contract, self, invoices }: { contract: Contract; self: boolean; invoices: Invoice[] }) {
  const router = useRouter();
  const { setPackClosed, deletePack, invoicePack } = usePortal();
  const [form, setForm] = useState<{ pack?: Pack; preset?: Preset } | null>(null);
  const [deleting, setDeleting] = useState<Pack | null>(null);

  const packs = [...(contract.packs ?? [])].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt) || b.id.localeCompare(a.id));
  const invoiceOf = (p: Pack) => invoices.find((i) => i.packId === p.id);

  return (
    <Card className="mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ink">Packs</h2>
        <button type="button" className={btn.secondary} onClick={() => setForm({})}>
          <Plus className="h-4 w-4" /> Ajouter un pack
        </button>
      </div>

      {packs.length === 0 ? (
        <Empty>Aucun pack pour l&apos;instant. Après l&apos;étude de comportement, ajoutez le pack convenu avec le client.</Empty>
      ) : (
        <ul className="divide-y divide-brand-light/60">
          {packs.map((p) => {
            const inv = invoiceOf(p);
            const paid = inv ? paidAmount(inv) : 0;
            return (
              <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {packLabel(p.kind)} · {money(p.price)}{" "}
                      {p.closedAt ? <Badge tone="gray">Terminé le {fmtDate(p.closedAt)}</Badge> : <Badge tone="green">En cours</Badge>}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      Convenu le {fmtDate(p.orderedAt)}
                      {!self && ` · commission ${packCommissionRate(p, contract)} % (net partenaire ${money(splitAmount(p.price, packCommissionRate(p, contract)).net)})`}
                    </p>
                    {p.notes && <p className="mt-1 text-sm text-ink-soft">{p.notes}</p>}
                    <p className="mt-1 text-sm">
                      {inv ? (
                        <>
                          <Link href={`/portail/facture/${inv.id}`} className="font-semibold text-brand-dark hover:underline">
                            {inv.number}
                          </Link>{" "}
                          <span className="text-ink-soft">
                            {inv.clientPaidAt ? "· payée en totalité" : paid > 0 ? `· payé ${money(paid)} sur ${money(inv.gross)}` : "· en attente de paiement"}
                          </span>
                        </>
                      ) : (
                        <Badge tone="amber">À facturer</Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {!inv && (
                      <button
                        type="button"
                        className={btn.primary}
                        onClick={async () => {
                          const id = await invoicePack(p.id);
                          if (id) router.push(`/portail/facture/${id}`);
                        }}
                      >
                        <Receipt className="h-4 w-4" /> Facturer
                      </button>
                    )}
                    <button type="button" className={btn.secondary} onClick={() => setForm({ pack: p })}>
                      Modifier
                    </button>
                    {p.closedAt ? (
                      <>
                        <button type="button" className={btn.secondary} onClick={() => setForm({ preset: { kind: p.kind, price: p.price, commissionRate: packCommissionRate(p, contract) } })}>
                          Renouveler
                        </button>
                        <button type="button" className={btn.secondary} onClick={() => setPackClosed(p.id, false)}>
                          Rouvrir
                        </button>
                      </>
                    ) : (
                      <button type="button" className={btn.secondary} onClick={() => setPackClosed(p.id, true)}>
                        Terminer
                      </button>
                    )}
                    {!inv && (
                      <button type="button" className={btn.danger} onClick={() => setDeleting(p)}>
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {form && <PackForm contract={contract} self={self} pack={form.pack} preset={form.preset} invoiced={form.pack ? Boolean(invoiceOf(form.pack)) : false} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmModal
          title="Supprimer ce pack ?"
          message={`${packLabel(deleting.kind)} (${money(deleting.price)}) sera supprimé. Il n'a pas encore été facturé.`}
          confirmLabel="Supprimer"
          onConfirm={() => void deletePack(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </Card>
  );
}
