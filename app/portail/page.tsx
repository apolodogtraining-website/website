"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePortal } from "@/lib/portal/store";
import { site } from "@/lib/site";
import { btn, Field, inputCls } from "@/components/portal/ui";

const googleErrors: Record<string, string> = {
  google_denied: "Ce compte Google n'est associé à aucun accès au portail. Utilisez l'adresse e-mail de votre fiche partenaire.",
  google_cancel: "Connexion Google annulée.",
  google_state: "La connexion Google a expiré. Réessayez.",
  google_token: "La connexion Google a échoué. Réessayez dans un instant.",
  google_off: "La connexion Google n'est pas configurée sur ce site.",
};

const home = (role: "admin" | "partner") => (role === "admin" ? "/portail/admin" : "/portail/partenaire");

export default function PortalLogin() {
  // useSearchParams impose une frontière Suspense pour le rendu statique.
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.800c1.800 0 3.300.6 4.600 1.800l3.400-3.400A12 12 0 0 0 1.400 6.600l4 3.100C6.300 6.900 8.900 4.800 12 4.800z" />
    </svg>
  );
}

function LoginView() {
  const { ready, session, login } = usePortal();
  const urlError = useSearchParams().get("error");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError ? (googleErrors[urlError] ?? "Connexion impossible.") : "");
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
          <a href="/api/portal/google/start" className={`${btn.secondary} mt-6 w-full gap-3 py-3`}>
            <GoogleIcon /> Se connecter avec Google
          </a>
          <div className="my-5 flex items-center gap-3 text-xs text-ink-soft" aria-hidden>
            <span className="h-px flex-1 bg-brand-light" /> ou avec un mot de passe (partenaires) <span className="h-px flex-1 bg-brand-light" />
          </div>
          <form
            className="space-y-4"
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
              {/* L'administrateur n'a pas de mot de passe : en local, ce raccourci remplace Google. */}
              <a href="/api/portal/dev-admin" className={btn.secondary}>
                Administrateur
              </a>
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
