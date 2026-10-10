"use client";

import { useState } from "react";
import { frequencyLabel, onlyDigits, parseDecimal, toLocalInput } from "@/lib/portal/format";
import { type ContractInput, usePortal } from "@/lib/portal/store";
import type { ClientRequest, Contract, Frequency } from "@/lib/portal/types";
import { btn, Field, inputCls, Modal, NumberInput, PhoneInput } from "./ui";

// Les champs numériques restent du texte tant que le formulaire est ouvert (voir NumberInput).
type Draft = Omit<ContractInput, "price" | "commissionRate" | "count"> & { price: string; commissionRate: string; count: string };

export default function ContractForm({
  contract,
  presetPartnerId,
  request,
  existingClient,
  onClose,
  onSaved,
}: {
  contract?: Contract;
  presetPartnerId?: string;
  /** Inscription client à transformer en contrat : préremplit le formulaire. */
  request?: ClientRequest;
  /** Ancien client ajouté à la main : aucune signature en ligne, séances passées à rattraper. */
  existingClient?: boolean;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const { partners, saveContract } = usePortal();
  // « Moi-même » en tête de liste, puis les partenaires actifs.
  const eligible = partners
    .filter((p) => p.active || p.id === contract?.partnerId)
    .sort((a, b) => Number(b.isSelf) - Number(a.isSelf));
  const initialPartner = contract?.partnerId ?? presetPartnerId ?? eligible[0]?.id ?? "";
  const defaultStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    return toLocalInput(d);
  })();

  const [f, setF] = useState<Draft>({
    partnerId: initialPartner,
    type: contract?.type ?? request?.type ?? "oneoff",
    // Anciens contrats sans prénom enregistré : le nom complet va dans « Nom », le prénom reste vide.
    clientFirstName: contract ? (contract.clientFirstName ?? "") : (request?.firstName ?? ""),
    clientLastName: contract ? (contract.clientLastName ?? contract.clientName) : (request?.lastName ?? request?.name ?? ""),
    clientEmail: contract?.clientEmail ?? request?.email ?? "",
    clientPhone: onlyDigits(contract?.clientPhone ?? request?.phone ?? ""),
    address: contract?.address ?? request?.address ?? "",
    service: contract?.service ?? request?.service ?? "",
    price: String(contract?.price ?? 60),
    commissionRate: String(contract?.commissionRate ?? partners.find((p) => p.id === initialPartner)?.commissionRate ?? 15),
    frequency: contract?.frequency ?? "weekly",
    notes: contract?.notes ?? (request ? [request.dogName && `Chien : ${request.dogName}`, request.dogBreed, request.notes].filter(Boolean).join(" — ") : ""),
    firstDate: request?.preferredDate || defaultStart,
    count: "4",
    markPastDone: Boolean(existingClient),
  });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((x) => ({ ...x, [k]: v }));
  const [error, setError] = useState("");
  const recurring = f.type === "recurring";
  const self = partners.find((p) => p.id === f.partnerId)?.isSelf ?? false;

  return (
    <Modal title={contract ? "Modifier le contrat" : existingClient ? "Ajouter un client existant" : "Nouveau contrat client"} onClose={onClose} wide>
      {existingClient && !contract && (
        <p className="mb-4 rounded-xl bg-brand-tint px-4 py-3 text-sm text-ink-soft">
          Pour un ancien client : il est ajouté <strong className="text-ink">sans signature de contrat en ligne</strong>. Indiquez la date de sa première séance
          (même passée) pour enregistrer son historique.
        </p>
      )}
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const price = parseDecimal(f.price);
          const commission = self ? 0 : parseDecimal(f.commissionRate);
          const count = parseDecimal(f.count);
          if (Number.isNaN(price) || price < 0) return setError("Indiquez le prix d'une séance (un nombre, par exemple 60).");
          if (Number.isNaN(commission) || commission < 0 || commission > 100) return setError("La commission doit être un nombre entre 0 et 100.");
          if (!contract && recurring && (!Number.isInteger(count) || count < 2 || count > 52)) return setError("Le nombre de séances doit être un entier entre 2 et 52.");
          setError("");
          const id = await saveContract(
            {
              ...f,
              frequency: recurring ? f.frequency : null,
              price,
              commissionRate: commission,
              count: recurring ? count : 1,
              requestId: request?.id,
            },
            contract?.id,
          );
          if (!id) return; // erreur affichée par le bandeau du portail
          onSaved?.(id);
          onClose();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Partenaire">
            {(id) => (
              <select
                id={id}
                required
                className={inputCls}
                value={f.partnerId}
                onChange={(e) => {
                  set("partnerId", e.target.value);
                  // Le taux proposé suit le partenaire choisi (modifiable ensuite).
                  const chosen = partners.find((p) => p.id === e.target.value);
                  if (!contract || chosen?.isSelf) set("commissionRate", String(chosen?.commissionRate ?? 15));
                }}
              >
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isSelf ? "Moi-même (aucune commission)" : p.company}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Type de contrat">
            {(id) => (
              <select id={id} className={inputCls} value={f.type} onChange={(e) => set("type", e.target.value as ContractInput["type"])}>
                <option value="oneoff">Client ponctuel</option>
                <option value="recurring">Client récurrent</option>
              </select>
            )}
          </Field>
          <Field label="Nom du client">
            {(id) => <input id={id} required maxLength={60} autoComplete="off" className={inputCls} value={f.clientLastName} onChange={(e) => set("clientLastName", e.target.value)} />}
          </Field>
          <Field label="Prénom du client" hint="Facultatif (famille, M. X…).">
            {(id) => <input id={id} maxLength={60} autoComplete="off" className={inputCls} value={f.clientFirstName} onChange={(e) => set("clientFirstName", e.target.value)} />}
          </Field>
          <Field label="Téléphone du client">
            {(id) => <PhoneInput id={id} value={f.clientPhone} onValueChange={(v) => set("clientPhone", v)} />}
          </Field>
          <Field label="E-mail du client (facturation)">
            {(id) => <input id={id} type="email" className={inputCls} value={f.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />}
          </Field>
          <div className="sm:col-span-2">
            <Field label="Prestation">
              {(id) => <input id={id} required className={inputCls} placeholder="Ex. Bilan comportemental" value={f.service} onChange={(e) => set("service", e.target.value)} />}
            </Field>
          </div>
        </div>
        <Field label="Adresse d'intervention">
          {(id) => <input id={id} required className={inputCls} value={f.address} onChange={(e) => set("address", e.target.value)} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix d'une séance (€)">
            {(id) => <NumberInput id={id} required value={f.price} onValueChange={(v) => set("price", v)} />}
          </Field>
          <Field label="Commission (%)" hint={self ? "Aucune : vous réalisez la prestation." : "Figée sur ce contrat."}>
            {(id) => <NumberInput id={id} required readOnly={self} value={self ? "0" : f.commissionRate} onValueChange={(v) => set("commissionRate", v)} />}
          </Field>
        </div>
        {!contract && (
          <div className="grid gap-4 rounded-xl bg-brand-tint p-4 sm:grid-cols-3">
            <Field label={recurring ? "Première séance" : "Date du rendez-vous"}>
              {(id) => <input id={id} type="datetime-local" required className={inputCls} value={f.firstDate} onChange={(e) => set("firstDate", e.target.value)} />}
            </Field>
            {recurring && (
              <>
                <Field label="Fréquence">
                  {(id) => (
                    <select id={id} className={inputCls} value={f.frequency ?? "weekly"} onChange={(e) => set("frequency", e.target.value as Frequency)}>
                      {(Object.keys(frequencyLabel) as Frequency[]).map((k) => (
                        <option key={k} value={k}>
                          {frequencyLabel[k]}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label="Nombre de séances">
                  {(id) => <NumberInput id={id} required value={f.count} onValueChange={(v) => set("count", v)} />}
                </Field>
              </>
            )}
          </div>
        )}
        {!contract && f.firstDate && f.firstDate < toLocalInput(new Date()) && (
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={Boolean(f.markPastDone)}
              onChange={(e) => set("markPastDone", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
            />
            Marquer les séances déjà passées comme réalisées (elles pourront être facturées)
          </label>
        )}
        <Field label="Notes pour le partenaire">
          {(id) => <textarea id={id} rows={2} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} />}
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btn.secondary} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={btn.primary} disabled={!f.partnerId}>
            {contract ? "Enregistrer" : "Créer le contrat"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
