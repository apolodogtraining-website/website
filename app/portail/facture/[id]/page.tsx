"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Badge, btn } from "@/components/portal/ui";
import { statusTone } from "@/components/portal/InvoiceTable";
import { fmtDate, fmtDateTime, invoiceStatus, invoiceStatusLabel, money } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import { site } from "@/lib/site";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ready, session, invoices, contracts, partners } = usePortal();

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

      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-soft sm:p-10 print:rounded-none print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Image src="/logo/logo-header.png" alt={site.name} width={140} height={48} className="h-10 w-auto" />
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-soft">
              {site.legal.publisherLegalName}
              <br />
              {site.address.street}, {site.address.postalCode} {site.address.locality}
              <br />
              SIRET {site.siret}
            </address>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-ink">Facture {inv.number}</h1>
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
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="py-2.5">{contract?.service}</td>
                <td className="py-2.5 text-ink-soft">{fmtDateTime(s.date)}</td>
                <td className="py-2.5 text-right">{money(contract?.price ?? 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-brand-light">
              <td colSpan={2} className="pt-3 text-right font-semibold">
                Total à payer
              </td>
              <td className="pt-3 text-right text-lg font-bold">{money(inv.gross)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-3 text-xs text-ink-soft">TVA non applicable. Pénalités de retard et indemnité forfaitaire de recouvrement de 40 € applicables en cas de retard de paiement.</p>

        {/* Ventilation commission : visible dans le portail, retirée à l'impression (document client). */}
        <aside className="mt-6 rounded-xl bg-brand-tint p-4 text-sm print:hidden">
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
    </div>
  );
}
