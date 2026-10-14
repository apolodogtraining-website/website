"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { fmtDate } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { Invoice } from "@/lib/portal/types";
import { btn, Modal } from "./ui";

/** Envoie la facture au client par e-mail (message + PDF joint, sans commission). Administrateur uniquement. */
export default function SendInvoiceButton({ invoice, className = btn.secondary }: { invoice: Invoice; className?: string }) {
  const { contracts, sendInvoice } = usePortal();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const contract = contracts.find((c) => c.id === invoice.contractId);
  const email = contract?.clientEmail ?? "";
  const resend = Boolean(invoice.sentAt);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" /> {resend ? "Renvoyer au client" : "Envoyer au client"}
      </button>
      {open && (
        <Modal title="Envoyer la facture au client" onClose={() => !busy && setOpen(false)}>
          {email ? (
            <p className="text-sm text-ink-soft">
              La facture <strong className="text-ink">{invoice.number}</strong> sera envoyée à <strong className="text-ink">{email}</strong>, avec le PDF en pièce jointe.
              {resend && invoice.sentAt ? ` Elle lui a déjà été envoyée le ${fmtDate(invoice.sentAt)}.` : ""} Aucune commission n&apos;y figure.
            </p>
          ) : (
            <p role="alert" className="rounded-sm bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              Ce client n&apos;a pas d&apos;adresse e-mail. Ajoutez-la en modifiant son contrat, puis réessayez.
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => setOpen(false)}>
              Annuler
            </button>
            {email && (
              <button
                type="button"
                className={btn.primary}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const ok = await sendInvoice(invoice.id);
                  setBusy(false);
                  if (ok) setOpen(false); // sinon, l'erreur est affichée par le bandeau du portail
                }}
              >
                {busy ? "Envoi…" : "Envoyer"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
