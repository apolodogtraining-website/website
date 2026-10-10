"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, inputCls, PageHeader } from "@/components/portal/ui";
import { CONTRACT_VERSION, contractArticles } from "@/lib/portal/contract-text";
import { fmtDateTime } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";

export default function PartnerContract() {
  const { currentPartner: p, signContract } = usePortal();
  const router = useRouter();
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  if (!p) return <PortalShell role="partner">{null}</PortalShell>;

  const signed = Boolean(p.contractSignedAt);
  const nameOk = name.trim().toLowerCase() === p.contact.trim().toLowerCase();

  return (
    <PortalShell role="partner">
      <PageHeader
        title="Contrat de partenariat"
        subtitle={signed ? undefined : "Lisez et signez ce contrat pour accéder à votre espace."}
        action={
          signed && (
            <button type="button" className={btn.secondary} onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimer / PDF
            </button>
          )
        }
      />
      {!signed && (
        <p role="status" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Première connexion : la signature du contrat est nécessaire avant d&apos;utiliser le portail.
        </p>
      )}

      <Card className="print:border-0 print:shadow-none">
        <div className="space-y-5 text-sm leading-relaxed text-ink">
          {contractArticles(p).map((a) => (
            <div key={a.title}>
              <h2 className="font-bold">{a.title}</h2>
              <p className="mt-1 text-ink-soft">{a.body}</p>
            </div>
          ))}
        </div>
        {signed && (
          <p className="mt-6 border-t border-brand-light pt-4 text-sm">
            <Badge tone="green">Signé</Badge> par <strong>{p.contractSignedBy}</strong> le {fmtDateTime(p.contractSignedAt!)} · version{" "}
            {p.contractVersion}
            {p.copySentAt && <> · exemplaire envoyé à {p.email}</>}
          </p>
        )}
      </Card>

      {!signed && (
        <Card className="mt-4">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await signContract(name.trim());
              router.replace("/portail/partenaire");
            }}
          >
            <label className="flex items-start gap-2.5 text-sm text-ink">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
              J&apos;ai lu le contrat (version {CONTRACT_VERSION}) et j&apos;accepte ses conditions, dont la commission de {p.commissionRate} %.
            </label>
            <div>
              <label htmlFor="sign-name" className="mb-1.5 block text-sm font-medium text-ink">
                Pour signer, saisissez votre nom complet : <span className="font-semibold">{p.contact}</span>
              </label>
              <input id="sign-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            </div>
            <button type="submit" className={btn.primary} disabled={!accepted || !nameOk}>
              Signer le contrat
            </button>
          </form>
        </Card>
      )}
    </PortalShell>
  );
}
