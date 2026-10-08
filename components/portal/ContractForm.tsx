"use client";

import { useState } from "react";
import { frequencyLabel, toLocalInput } from "@/lib/portal/format";
import { type ContractInput, usePortal } from "@/lib/portal/store";
import type { ClientRequest, Contract, Frequency } from "@/lib/portal/types";
import { btn, Field, inputCls, Modal } from "./ui";

export default function ContractForm({
  contract,
  presetPartnerId,
  request,
  onClose,
  onSaved,
}: {
  contract?: Contract;
  presetPartnerId?: string;
  /** Inscription client à transformer en contrat : préremplit le formulaire. */
  request?: ClientRequest;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const { partners, saveContract } = usePortal();
  const eligible = partners.filter((p) => p.active || p.id === contract?.partnerId);
  const initialPartner = contract?.partnerId ?? presetPartnerId ?? eligible[0]?.id ?? "";
  const defaultStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    return toLocalInput(d);
  })();

  const [f, setF] = useState<ContractInput>({
    partnerId: initialPartner,
    type: contract?.type ?? request?.type ?? "oneoff",
    clientName: contract?.clientName ?? request?.name ?? "",
    clientEmail: contract?.clientEmail ?? request?.email ?? "",
    clientPhone: contract?.clientPhone ?? request?.phone ?? "",
    address: contract?.address ?? request?.address ?? "",
    service: contract?.service ?? request?.service ?? "",
    price: contract?.price ?? 60,
    commissionRate: contract?.commissionRate ?? partners.find((p) => p.id === initialPartner)?.commissionRate ?? 15,
    frequency: contract?.frequency ?? "weekly",
    notes: contract?.notes ?? (request ? [request.dogName && `Chien : ${request.dogName}`, request.dogBreed, request.notes].filter(Boolean).join(" — ") : ""),
    firstDate: request?.preferredDate || defaultStart,
    count: 4,
  });
  const set = <K extends keyof ContractInput>(k: K, v: ContractInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const recurring = f.type === "recurring";

  return (
    <Modal title={contract ? "Modifier le contrat" : "Nouveau contrat client"} onClose={onClose} wide>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const id = await saveContract(
            { ...f, frequency: recurring ? f.frequency : null, price: Number(f.price), commissionRate: Number(f.commissionRate), requestId: request?.id },
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
                  if (!contract) set("commissionRate", partners.find((p) => p.id === e.target.value)?.commissionRate ?? 15);
                }}
              >
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company}
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
          <Field label="Client">
            {(id) => <input id={id} required className={inputCls} value={f.clientName} onChange={(e) => set("clientName", e.target.value)} />}
          </Field>
          <Field label="Téléphone du client">
            {(id) => <input id={id} type="tel" className={inputCls} value={f.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} />}
          </Field>
          <Field label="E-mail du client (facturation)">
            {(id) => <input id={id} type="email" className={inputCls} value={f.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />}
          </Field>
          <Field label="Prestation">
            {(id) => <input id={id} required className={inputCls} placeholder="Ex. Bilan comportemental" value={f.service} onChange={(e) => set("service", e.target.value)} />}
          </Field>
        </div>
        <Field label="Adresse d'intervention">
          {(id) => <input id={id} required className={inputCls} value={f.address} onChange={(e) => set("address", e.target.value)} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix d'une séance (€)">
            {(id) => <input id={id} type="number" min={0} step={0.5} required className={inputCls} value={f.price} onChange={(e) => set("price", Number(e.target.value))} />}
          </Field>
          <Field label="Commission (%)" hint="Figée sur ce contrat.">
            {(id) => <input id={id} type="number" min={0} max={100} step={0.5} required className={inputCls} value={f.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} />}
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
                  {(id) => <input id={id} type="number" min={2} max={52} required className={inputCls} value={f.count} onChange={(e) => set("count", Number(e.target.value))} />}
                </Field>
              </>
            )}
          </div>
        )}
        <Field label="Notes pour le partenaire">
          {(id) => <textarea id={id} rows={2} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} />}
        </Field>
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
