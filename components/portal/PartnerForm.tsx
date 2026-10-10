"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { usePortal } from "@/lib/portal/store";
import type { Partner } from "@/lib/portal/types";
import { onlyDigits, parseDecimal } from "@/lib/portal/format";
import { btn, Field, inputCls, Modal, NumberInput, PhoneInput } from "./ui";

export default function PartnerForm({ partner, onClose }: { partner?: Partner; onClose: () => void }) {
  const { savePartner } = usePortal();
  const [f, setF] = useState({
    company: partner?.company ?? "",
    contact: partner?.contact ?? "",
    email: partner?.email ?? "",
    phone: onlyDigits(partner?.phone ?? ""),
    siret: partner?.siret ?? "",
    specialties: partner?.specialties ?? "",
    commissionRate: String(partner?.commissionRate ?? 15),
    active: partner?.active ?? true,
  });
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  if (created) {
    return (
      <Modal title="Compte partenaire créé" onClose={onClose}>
        <p className="text-sm text-ink-soft">
          Transmettez ces identifiants au partenaire. À sa première connexion, il devra lire et signer son contrat avant
          d&apos;accéder à la plateforme.
        </p>
        <dl className="mt-4 space-y-2 rounded-xl bg-brand-tint p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Identifiant</dt>
            <dd className="font-semibold">{created.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Mot de passe provisoire</dt>
            <dd className="font-mono font-semibold">{created.password}</dd>
          </div>
        </dl>
        <div className="mt-5 flex justify-end">
          <button type="button" className={btn.primary} onClick={onClose}>
            <Check className="h-4 w-4" /> Terminé
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={partner ? "Modifier le partenaire" : "Nouveau partenaire"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const commission = parseDecimal(f.commissionRate);
          if (Number.isNaN(commission) || commission < 0 || commission > 100) return setError("La commission doit être un nombre entre 0 et 100.");
          setError("");
          const res = await savePartner(
            { ...f, email: f.email.trim().toLowerCase(), commissionRate: commission },
            partner?.id,
          );
          if (!res) return; // erreur affichée par le bandeau du portail
          if (res.password) setCreated({ email: f.email.trim().toLowerCase(), password: res.password });
          else onClose();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Entreprise">
            {(id) => <input id={id} required className={inputCls} value={f.company} onChange={(e) => set("company", e.target.value)} />}
          </Field>
          <Field label="Contact">
            {(id) => <input id={id} required className={inputCls} value={f.contact} onChange={(e) => set("contact", e.target.value)} />}
          </Field>
          <Field label="E-mail (identifiant de connexion)">
            {(id) => <input id={id} type="email" required className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label="Téléphone">
            {(id) => <PhoneInput id={id} value={f.phone} onValueChange={(v) => set("phone", v)} />}
          </Field>
          <Field label="SIRET">
            {(id) => <input id={id} required className={inputCls} value={f.siret} onChange={(e) => set("siret", e.target.value)} />}
          </Field>
          <Field label="Commission (%)" hint="Prélevée sur le montant facturé au client.">
            {(id) => <NumberInput id={id} required value={f.commissionRate} onValueChange={(v) => set("commissionRate", v)} />}
          </Field>
        </div>
        <Field label="Spécialités">
          {(id) => <input id={id} className={inputCls} value={f.specialties} onChange={(e) => set("specialties", e.target.value)} />}
        </Field>
        {partner && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-brand" />
            Compte actif (un compte suspendu ne peut plus se connecter)
          </label>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btn.secondary} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={btn.primary}>
            {partner ? "Enregistrer" : "Créer le compte"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
