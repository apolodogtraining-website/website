"use client";

import { useState } from "react";
import { balanceDue, money, paidAmount, parseDecimal, todayISO } from "@/lib/portal/format";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/portal/payments";
import { usePortal } from "@/lib/portal/store";
import type { Invoice } from "@/lib/portal/types";
import { btn, Field, inputCls, Modal, NumberInput } from "./ui";

const asInput = (n: number) => String(n).replace(".", ",");

/**
 * Enregistre un règlement reçu du client : le total (par défaut, le solde), ou seulement une partie
 * (acompte). La facture n'est « payée » que lorsque le total reçu atteint son montant.
 */
export default function PaymentModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { recordPayment } = usePortal();
  const due = balanceDue(invoice);
  const paid = paidAmount(invoice);
  const [amount, setAmount] = useState(asInput(due));
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal title="Enregistrer un paiement" onClose={onClose}>
      <dl className="mb-4 space-y-1 rounded-sm bg-brand-tint px-4 py-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Facture {invoice.number}</dt>
          <dd>{money(invoice.gross)}</dd>
        </div>
        {paid > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-soft">Déjà réglé</dt>
            <dd>{money(paid)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-brand-light pt-1 font-semibold">
          <dt>Reste à payer</dt>
          <dd>{money(due)}</dd>
        </div>
      </dl>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const value = parseDecimal(amount);
          if (Number.isNaN(value) || value <= 0) return setError("Indiquez le montant reçu (un nombre, par exemple 300).");
          if (Math.round(value * 100) > Math.round(due * 100)) return setError(`Le montant dépasse le reste à payer (${money(due)}).`);
          if (!method) return setError("Choisissez le mode de règlement (chèque, virement…).");
          if (date > todayISO()) return setError("La date du règlement ne peut pas être dans le futur.");
          setError("");
          setBusy(true);
          const ok = await recordPayment(invoice.id, { amount: value, date, method, note });
          setBusy(false);
          if (ok) onClose(); // sinon, l'erreur est affichée par le bandeau du portail
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Montant reçu (€)" required hint="Tout le solde, ou seulement une partie.">
            {(id) => <NumberInput id={id} required value={amount} onValueChange={setAmount} />}
          </Field>
          <Field label="Date du règlement" required>
            {(id) => <input id={id} type="date" required max={todayISO()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />}
          </Field>
        </div>
        <button type="button" className={btn.ghost} onClick={() => setAmount(asInput(due))}>
          Régler tout le solde ({money(due)})
        </button>
        <Field label="Mode de règlement" required>
          {(id) => (
            <select id={id} required className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | "")}>
              <option value="">Choisir…</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Note" hint="Facultatif : n° de chèque, précision sur l'acompte…">
          {(id) => <input id={id} maxLength={120} className={inputCls} placeholder="Ex. Acompte, chèque n° 1234567" value={note} onChange={(e) => setNote(e.target.value)} />}
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
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
