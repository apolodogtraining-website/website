"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePortal } from "@/lib/portal/store";
import { site } from "@/lib/site";
import { btn, Field, inputCls } from "@/components/portal/ui";

const home = (role: "admin" | "partner") => (role === "admin" ? "/portail/admin" : "/portail/partenaire");

export default function PortalLogin() {
  const { ready, session, login } = usePortal();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace(home(session.role));
  }, [ready, session, router]);

  return (
    <main className="grid min-h-screen-mobile place-items-center bg-brand-tint px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 block w-fit" aria-label={`${site.name} — retour au site`}>
          <Image src="/logo/logo-header.png" alt={site.name} width={160} height={55} priority className="h-12 w-auto" />
        </Link>
        <div className="rounded-3xl border border-brand-light bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold text-ink">Portail partenaires</h1>
          <p className="mt-1 text-sm text-ink-soft">Connectez-vous pour suivre vos contrats et votre facturation.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const res = await login(email, password);
              setBusy(false);
              if (res.session) router.replace(home(res.session.role));
              else setError(res.error ?? "Connexion impossible.");
            }}
          >
            <Field label="Adresse e-mail">
              {(id) => (
                <input id={id} type="email" autoComplete="username" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
            </Field>
            <Field label="Mot de passe">
              {(id) => (
                <input id={id} type="password" autoComplete="current-password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
              )}
            </Field>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
            <button type="submit" className={`${btn.primary} w-full`} disabled={busy}>
              Se connecter
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Vous êtes client ?{" "}
          <Link href="/portail/inscription" className="font-semibold text-brand-dark hover:underline">
            Créer mon dossier et signer mon contrat
          </Link>
        </p>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-4 rounded-2xl border border-dashed border-brand/40 bg-white/70 p-4 text-sm">
            <p className="font-semibold text-brand-darker">Environnement de développement</p>
            <p className="mt-1 text-ink-soft">Données de démonstration, base locale. Comptes de test :</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={btn.secondary}
                onClick={() => {
                  setEmail("admin@apolodogtraining.com");
                  setPassword("admin-demo");
                }}
              >
                Administrateur
              </button>
              <button
                type="button"
                className={btn.secondary}
                onClick={() => {
                  setEmail("marie@canin-nature.example");
                  setPassword("partenaire-demo");
                }}
              >
                Partenaire
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
