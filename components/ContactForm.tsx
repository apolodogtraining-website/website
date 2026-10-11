"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { CheckIcon } from "./icons";
import { LIMITS, onlyDigits, SITUATIONS, validateContact, type ContactErrors } from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "failed";

const inputClass =
  "w-full rounded-xl border border-brand-light bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-red-500";

function FieldShell({
  id,
  label,
  optional,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-brand-dark">
            *
          </span>
        )}
        {optional && <span className="font-normal text-ink-soft"> (facultatif)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type FieldKey = "lastName" | "firstName" | "phone" | "email" | "dogName" | "dogInfo";

const FIELDS: {
  key: FieldKey;
  label: string;
  required: boolean;
  type: "text" | "email" | "tel";
  inputMode?: "numeric" | "email";
  autoComplete?: string;
  maxLength: number;
  placeholder: string;
}[] = [
  { key: "lastName", label: "Nom", required: true, type: "text", autoComplete: "family-name", maxLength: LIMITS.lastName, placeholder: "Ex. Dupont" },
  { key: "firstName", label: "Prénom", required: true, type: "text", autoComplete: "given-name", maxLength: LIMITS.firstName, placeholder: "Ex. Marie" },
  { key: "phone", label: "Téléphone", required: true, type: "tel", inputMode: "numeric", autoComplete: "tel", maxLength: LIMITS.phone, placeholder: "0612345678" },
  { key: "email", label: "E-mail", required: true, type: "email", inputMode: "email", autoComplete: "email", maxLength: LIMITS.email, placeholder: "marie.dupont@exemple.fr" },
  { key: "dogName", label: "Nom du chien", required: true, type: "text", maxLength: LIMITS.dogName, placeholder: "Ex. Max" },
  { key: "dogInfo", label: "Race et âge", required: false, type: "text", maxLength: LIMITS.dogInfo, placeholder: "Ex. Labrador, 5 mois" },
];

export default function ContactForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const [values, setValues] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    dogName: "",
    dogInfo: "",
    message: "",
    website: "",
  });
  const [situations, setSituations] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");

  const clearError = (key: keyof ContactErrors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const onField =
    (key: keyof typeof values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Téléphone : seuls les chiffres sont conservés.
      const value = key === "phone" ? onlyDigits(e.target.value).slice(0, LIMITS.phone) : e.target.value;
      setValues((prev) => ({ ...prev, [key]: value }));
      if (key in errors) clearError(key as keyof ContactErrors);
    };

  const toggleSituation = (s: string) =>
    setSituations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validateContact({ ...values, situations, consent });
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = (["lastName", "firstName", "phone", "email", "dogName", "message", "consent"] as const).find((k) => found[k]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          situations,
          consent,
          elapsed: Date.now() - startedAt.current,
        }),
      });
      if (res.ok) {
        setSentName(values.firstName.trim());
        setStatus("sent");
        return;
      }
      if (res.status === 422) {
        const data = (await res.json().catch(() => null)) as { errors?: ContactErrors } | null;
        if (data?.errors) {
          setErrors(data.errors);
          setStatus("idle");
          return;
        }
      }
      setStatus("failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="text-3xl font-semibold text-ink">Message envoyé</h2>
        <p className="leading-relaxed text-ink-soft">
          Merci {sentName}. Je lis votre message et je vous réponds rapidement.
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Une urgence ? Appelez-moi au{" "}
          <a href={`tel:${site.phoneIntl}`} className="font-semibold text-brand-darker underline underline-offset-2">
            {site.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-ink">Écrivez-moi</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Décrivez votre situation, je vous oriente vers l&apos;accompagnement le plus pertinent.
        </p>
      </div>

      <p className="text-sm text-ink-soft">
        Les champs marqués d&apos;un <span className="text-brand-dark">*</span> sont obligatoires.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <FieldShell key={f.key} id={id(f.key)} label={f.label} required={f.required} optional={!f.required} error={errors[f.key as keyof ContactErrors]}>
            <input
              id={id(f.key)}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              maxLength={f.maxLength}
              value={values[f.key]}
              onChange={onField(f.key)}
              placeholder={f.placeholder}
              aria-required={f.required}
              aria-invalid={!!errors[f.key as keyof ContactErrors]}
              aria-describedby={errors[f.key as keyof ContactErrors] ? `${id(f.key)}-error` : undefined}
              className={inputClass}
            />
          </FieldShell>
        ))}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">
          Ce qui vous amène <span className="font-normal text-ink-soft">(facultatif)</span>
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SITUATIONS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={situations.includes(s)}
                onChange={() => toggleSituation(s)}
              />
              <span className="inline-flex rounded-none border border-brand-light bg-brand-tint px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-brand/50 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-cta peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <FieldShell id={id("message")} label="Votre message" required error={errors.message}>
        <textarea
          id={id("message")}
          rows={5}
          maxLength={LIMITS.message}
          value={values.message}
          onChange={onField("message")}
          placeholder="Ce qui se passe au quotidien, ce que vous aimeriez améliorer…"
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${id("message")}-error` : undefined}
          className={`${inputClass} resize-y`}
        />
      </FieldShell>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={onField("website")}
          />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input
            id={id("consent")}
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              clearError("consent");
            }}
            aria-required="true"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${id("consent")}-error` : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-brand"
          />
          <span>
            J&apos;accepte que ces informations soient utilisées pour répondre à ma demande, comme
            décrit dans la{" "}
            <Link
              href="/confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-darker underline underline-offset-2"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={`${id("consent")}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.consent}
          </p>
        )}
      </div>

      {status === "failed" && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm leading-relaxed text-red-800">
          L&apos;envoi n&apos;a pas abouti. Réessayez dans un instant, ou contactez-moi directement au{" "}
          <a href={`tel:${site.phoneIntl}`} className="font-semibold underline">
            {site.phone}
          </a>{" "}
          ou à{" "}
          <a href={`mailto:${site.email}`} className="font-semibold underline">
            {site.email}
          </a>
          .
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center rounded-none bg-brand px-7 py-3.5 text-base font-semibold text-cta shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
