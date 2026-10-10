"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Turnstile, { turnstileSiteKey } from "@/components/portal/Turnstile";
import { btn, Card, Field, inputCls, PhoneInput } from "@/components/portal/ui";
import { CLIENT_CONTRACT_VERSION, clientContractArticles } from "@/lib/portal/contract-text";
import { composeName, toLocalInput } from "@/lib/portal/format";
import { type RequestInput, submitClientRequest } from "@/lib/portal/store";
import { services, site } from "@/lib/site";

const empty: RequestInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  dogName: "",
  dogBreed: "",
  service: services[0]?.title ?? "",
  type: "oneoff",
  preferredDate: "",
  notes: "",
};

export default function ClientSignup() {
  const [step, setStep] = useState<"form" | "contract" | "done">("form");
  const [f, setF] = useState<RequestInput>(empty);
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [website, setWebsite] = useState(""); // champ piège anti-robots
  const [captcha, setCaptcha] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof RequestInput>(k: K, v: RequestInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const fullName = composeName(f.firstName, f.lastName); // « Prénom NOM », identique à ce que stocke le serveur
  const nameOk = signature.trim().toLowerCase() === fullName.toLowerCase();

  return (
    <main className="min-h-screen-mobile bg-brand-tint px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mx-auto mb-6 block w-fit" aria-label={`${site.name} — retour au site`}>
          <Image src="/logo/logo-header.png" alt={site.name} width={160} height={55} priority className="h-12 w-auto" />
        </Link>

        {step === "done" ? (
          <Card className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
            <h1 className="mt-3 text-2xl font-bold text-ink">Merci, votre contrat est signé</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              Un exemplaire de votre contrat vous est envoyé par e-mail à {f.email}. Nous revenons vers vous très vite pour confirmer le partenaire et la date du premier rendez-vous.
            </p>
            <Link href="/" className={`${btn.primary} mt-6`}>
              Retour au site
            </Link>
          </Card>
        ) : step === "form" ? (
          <Card>
            <h1 className="text-2xl font-bold text-ink">Créer mon dossier client</h1>
            <p className="mt-1 text-sm text-ink-soft">Étape 1 sur 2 · Vos informations et votre demande.</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("contract");
                window.scrollTo({ top: 0 });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom">
                  {(id) => <input id={id} required autoComplete="family-name" maxLength={60} className={inputCls} value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />}
                </Field>
                <Field label="Prénom">
                  {(id) => <input id={id} required autoComplete="given-name" maxLength={60} className={inputCls} value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />}
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Téléphone" hint="Chiffres uniquement.">
                  {(id) => <PhoneInput id={id} required value={f.phone} onValueChange={(v) => set("phone", v)} />}
                </Field>
                <Field label="Adresse e-mail">
                  {(id) => <input id={id} type="email" required autoComplete="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} />}
                </Field>
              </div>
              <Field label="Adresse d'intervention">
                {(id) => <input id={id} required autoComplete="street-address" className={inputCls} value={f.address} onChange={(e) => set("address", e.target.value)} />}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du chien">
                  {(id) => <input id={id} required className={inputCls} value={f.dogName} onChange={(e) => set("dogName", e.target.value)} />}
                </Field>
                <Field label="Race et âge">
                  {(id) => <input id={id} className={inputCls} placeholder="Ex. Labrador, 5 mois" value={f.dogBreed} onChange={(e) => set("dogBreed", e.target.value)} />}
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prestation souhaitée">
                  {(id) => (
                    <select id={id} className={inputCls} value={f.service} onChange={(e) => set("service", e.target.value)}>
                      {services.map((s) => (
                        <option key={s.slug} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label="Fréquence">
                  {(id) => (
                    <select id={id} className={inputCls} value={f.type} onChange={(e) => set("type", e.target.value as RequestInput["type"])}>
                      <option value="oneoff">Une séance ponctuelle</option>
                      <option value="recurring">Un suivi régulier</option>
                    </select>
                  )}
                </Field>
              </div>
              <Field label="Date souhaitée pour le premier rendez-vous" hint="Indicative : elle sera confirmée avec vous.">
                {(id) => <input id={id} type="datetime-local" min={toLocalInput(new Date())} className={inputCls} value={f.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} />}
              </Field>
              <Field label="Précisions (comportement, disponibilités…)">
                {(id) => <textarea id={id} rows={3} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} />}
              </Field>
              <button type="submit" className={`${btn.primary} w-full sm:w-auto`}>
                Continuer vers le contrat
              </button>
            </form>
          </Card>
        ) : (
          <>
            <button type="button" className={`${btn.ghost} mb-3`} onClick={() => setStep("form")}>
              <ArrowLeft className="h-4 w-4" /> Modifier mes informations
            </button>
            <Card>
              <h1 className="text-2xl font-bold text-ink">Contrat de prestation</h1>
              <p className="mt-1 text-sm text-ink-soft">Étape 2 sur 2 · Lisez puis signez pour valider votre dossier.</p>
              <div className="mt-5 space-y-4 text-sm leading-relaxed">
                {clientContractArticles({ name: fullName, service: f.service }).map((a) => (
                  <div key={a.title}>
                    <h2 className="font-bold text-ink">{a.title}</h2>
                    <p className="mt-1 text-ink-soft">{a.body}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="mt-4">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  const err = await submitClientRequest(f, signature.trim(), website, captcha);
                  setBusy(false);
                  if (err) {
                    setError(err);
                    setCaptcha(""); // un jeton ne sert qu'une fois : le widget est à refaire
                    return;
                  }
                  setStep("done");
                  window.scrollTo({ top: 0 });
                }}
              >
                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                  J&apos;ai lu le contrat (version {CLIENT_CONTRACT_VERSION}) et j&apos;en accepte les conditions.
                </label>
                <Field label={`Pour signer, saisissez votre nom complet : ${fullName}`}>
                  {(id) => <input id={id} autoComplete="off" className={inputCls} value={signature} onChange={(e) => setSignature(e.target.value)} />}
                </Field>
                <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Ne pas remplir
                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </div>
                {turnstileSiteKey ? (
                  <Turnstile key={error} onToken={setCaptcha} />
                ) : (
                  <p role="alert" className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                    Les inscriptions sont momentanément indisponibles. Appelez-nous au {site.phone}.
                  </p>
                )}
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button type="submit" className={btn.primary} disabled={!accepted || !nameOk || busy || !captcha}>
                  Signer et envoyer
                </button>
              </form>
            </Card>
          </>
        )}
        <p className="mt-6 text-center text-xs text-ink-soft">
          <Link href="/confidentialite" className="hover:underline">
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </main>
  );
}
