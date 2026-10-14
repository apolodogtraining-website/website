"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Badge, btn, ConfirmModal } from "@/components/portal/ui";
import PaymentModal from "@/components/portal/PaymentModal";
import { statusTone } from "@/components/portal/InvoiceTable";
import { balanceDue, fmtDate, fmtDateTime, invoiceLabel, invoicePayments, invoiceStatus, invoiceStatusLabel, money } from "@/lib/portal/format";
import { methodLabel } from "@/lib/portal/payments";
import { usePortal } from "@/lib/portal/store";
import { site } from "@/lib/site";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ready, session, invoices, contracts, partners, deletePayment } = usePortal();
  const [paying, setPaying] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace("/portail");
  }, [ready, session, router]);

  const inv = invoices.find((i) => i.id === id);
  const allowed = inv && session && (session.role === "admin" || session.partnerId === inv.partnerId);
  const back = session?.role === "partner" ? "/portail/partenaire/facturation" : "/portail/admin/facturation";

  if (!ready || !session) return <div className="grid min-h-screen-mobile place-items-center text-sm text-ink-soft">Chargement…</div>;
  if (!inv || !allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">Facture introuvable.</p>
        <Link href={back} className={`${btn.ghost} mt-3`}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>
    );
  }

  const contract = contracts.find((c) => c.id === inv.contractId);
  const partner = partners.find((p) => p.id === inv.partnerId);
  const sessions = contract?.sessions.filter((s) => inv.sessionIds.includes(s.id)) ?? [];
  const st = invoiceStatus(inv);
  const isPartner = session.role === "partner";
  const payments = invoicePayments(inv);
  const due = balanceDue(inv);

  return (
    <div className="min-h-screen-mobile bg-brand-tint px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between print:hidden">
        <Link href={back} className={btn.ghost}>
          <ArrowLeft className="h-4 w-4" /> Facturation
        </Link>
        <button type="button" className={btn.primary} onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimer / PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl rounded-sm bg-white p-6 shadow-soft sm:p-10 print:rounded-none print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Image src="/logo/logo-white.png" alt={site.name} width={140} height={48} className="h-10 w-auto" />
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-soft">
              {site.legal.publisherLegalName}
              <br />
              {site.address.street}, {site.address.postalCode} {site.address.locality}
              <br />
              SIRET {site.siret}
            </address>
          </div>
          <div className="text-right">
            <h1 className="font-display uppercase tracking-wide text-2xl font-normal text-ink">Facture {inv.number}</h1>
            <p className="mt-1 text-sm text-ink-soft">Émise le {fmtDate(inv.issuedAt)}</p>
            <p className="text-sm text-ink-soft">Échéance : {fmtDate(inv.dueAt)}</p>
            <div className="mt-2 print:hidden">
              <Badge tone={statusTone[st]}>{invoiceStatusLabel[st]}</Badge>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Facturé à</h2>
            <p className="font-semibold text-ink">{contract?.clientName}</p>
            <p className="text-ink-soft">{contract?.address}</p>
            {contract?.clientEmail && <p className="text-ink-soft">{contract.clientEmail}</p>}
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Prestation réalisée par</h2>
            <p className="font-semibold text-ink">{partner?.isSelf ? site.name : partner?.company}</p>
            <p className="text-ink-soft">SIRET {partner?.isSelf ? site.siret : partner?.siret}</p>
          </div>
        </section>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light text-xs uppercase tracking-wide text-ink-soft">
              <th className="py-2 font-semibold">Prestation</th>
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 text-right font-semibold">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light/60">
            {inv.packId ? (
              <tr>
                <td className="py-2.5">{invoiceLabel(inv, contract)}</td>
                <td className="py-2.5 text-ink-soft">Pack d&apos;accompagnement</td>
                <td className="py-2.5 text-right">{money(inv.gross)}</td>
              </tr>
            ) : contract?.pricing === "package" ? (
              <tr>
                <td className="py-2.5">{contract.service}</td>
                <td className="py-2.5 text-ink-soft">Forfait global</td>
                <td className="py-2.5 text-right">{money(inv.gross)}</td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5">{contract?.service}</td>
                  <td className="py-2.5 text-ink-soft">{fmtDateTime(s.date)}</td>
                  <td className="py-2.5 text-right">{money(contract?.price ?? 0)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-brand-light">
              <td colSpan={2} className="pt-3 text-right font-semibold">
                {payments.length > 0 ? "Total de la facture" : "Total à payer"}
              </td>
              <td className={`pt-3 text-right ${payments.length > 0 ? "font-semibold" : "text-lg font-bold"}`}>{money(inv.gross)}</td>
            </tr>
            {payments.map((p) => (
              <tr key={p.id}>
                <td colSpan={2} className="pt-1 text-right text-ink-soft">
                  Règlement reçu le {fmtDate(p.paidAt)}
                  {methodLabel(p.method) ? ` · ${methodLabel(p.method)}` : ""}
                  {p.note ? ` · ${p.note}` : ""}
                </td>
                <td className="pt-1 text-right">− {money(p.amount)}</td>
              </tr>
            ))}
            {payments.length > 0 && (
              <tr className="border-t border-brand-light">
                <td colSpan={2} className="pt-2 text-right font-semibold">
                  {due > 0 ? "Reste à payer" : "Solde"}
                </td>
                <td className="pt-2 text-right text-lg font-bold">{money(due)}</td>
              </tr>
            )}
          </tfoot>
        </table>
        <p className="mt-3 text-xs text-ink-soft">TVA non applicable. Pénalités de retard et indemnité forfaitaire de recouvrement de 40 € applicables en cas de retard de paiement.</p>

        {/* Gestion des règlements : administrateur uniquement, jamais imprimée. */}
        {!isPartner && (
          <section className="mt-6 rounded-sm border border-brand-light p-4 text-sm print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">Règlements du client</h2>
              {due > 0 && (
                <button type="button" className={btn.primary} onClick={() => setPaying(true)}>
                  {payments.length > 0 ? "Ajouter un paiement" : "Enregistrer un paiement"}
                </button>
              )}
            </div>
            {payments.length === 0 ? (
              <p className="mt-2 text-ink-soft">Aucun règlement reçu pour l&apos;instant : {money(inv.gross)} à encaisser.</p>
            ) : (
              <ul className="mt-2 divide-y divide-brand-light/60">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-ink-soft">
                      {fmtDate(p.paidAt)}
                      {methodLabel(p.method) ? ` · ${methodLabel(p.method)}` : ""}
                      {p.note ? ` · ${p.note}` : p.id.startsWith("legacy-") ? " · facture marquée payée" : ""}
                    </span>
                    <span className="flex items-center gap-3">
                      <strong className="text-ink">{money(p.amount)}</strong>
                      {!p.id.startsWith("legacy-") && (
                        <button type="button" className="text-xs font-semibold text-red-700 hover:underline" onClick={() => setRemoving(p.id)}>
                          Supprimer
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {payments.length > 0 && <p className="mt-2 text-ink-soft">{due > 0 ? `Reste à payer : ${money(due)}.` : "Facture réglée en totalité."}</p>}
          </section>
        )}

        {/* Ventilation commission : visible dans le portail, retirée à l'impression (document client). */}
        <aside className="mt-6 rounded-sm bg-brand-tint p-4 text-sm print:hidden">
          <h2 className="mb-2 font-semibold text-ink">{isPartner ? "Votre règlement" : "Ventilation interne"}</h2>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Montant facturé</dt>
              <dd>{money(inv.gross)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Commission ({contract?.commissionRate} %)</dt>
              <dd>− {money(inv.commission)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-light pt-1 font-semibold">
              <dt>Net {isPartner ? "pour vous" : "partenaire"}</dt>
              <dd>{money(inv.net)}</dd>
            </div>
          </dl>
        </aside>
      </article>
      {paying && <PaymentModal invoice={inv} onClose={() => setPaying(false)} />}
      {removing && (
        <ConfirmModal
          title="Supprimer ce règlement ?"
          message="Le règlement sera retiré de la facture, qui repassera en attente de paiement pour ce montant."
          confirmLabel="Supprimer"
          onConfirm={() => void deletePayment(removing)}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
