"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Printer, Send } from "lucide-react";
import { answeredCount, FICHE_FIELDS, FICHE_SECTIONS, type FicheAnswers, type FicheStatus, type FieldDef } from "@/lib/portal/fiche";
import { fmtDateTime, fmtPhone, toLocalInput } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import { site } from "@/lib/site";
import { Badge, btn, Card, inputCls, Modal, NumberInput } from "./ui";

type View = {
  dog: { id: string; name: string; breed: string; sex: string; age: string; chip: string };
  owner: { name: string; phone: string; email: string; address: string };
  answers: FicheAnswers;
  status: FicheStatus;
  updatedAt: string | null;
  updatedBy: string | null;
  lastSentAt: string | null;
  lastSentTo: string | null;
};

const SAVE_DELAY = 1500;
const sexLabel = (s: string) => (s === "M" ? "Mâle" : s === "F" ? "Femelle" : "");

/** Zone de texte qui grandit avec son contenu (à l'écran comme à l'impression). */
function AutoTextarea({ value, onChange, id, rows = 2 }: { value: string; onChange: (v: string) => void; id?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} id={id} rows={rows} className={`${inputCls} resize-none overflow-hidden`} value={value} onChange={(e) => onChange(e.target.value)} />;
}

const chip =
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition [print-color-adjust:exact] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";
const chipOn = "border-brand bg-brand text-white";
const chipOff = "border-brand-light bg-white text-ink-soft hover:bg-brand-tint";

export default function FicheEditor({ dogId, backHref }: { dogId: string; backHref: string }) {
  const { refresh } = usePortal();
  const [view, setView] = useState<View | null>(null);
  const [answers, setAnswers] = useState<FicheAnswers>({});
  const [status, setStatus] = useState<FicheStatus>("draft");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const conflictRef = useRef(false); // lisible depuis les minuteurs sans valeur périmée
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastSent, setLastSent] = useState<{ at: string; to: string } | null>(null);

  const base = useRef<string | null>(null); // version ouverte (contrôle de conflit)
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ answers, status });
  useEffect(() => {
    latest.current = { answers, status };
  });

  // Chargement
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/portal/fiche?dogId=${encodeURIComponent(dogId)}`, { cache: "no-store" })
      .then(async (r) => {
        const p = await r.json();
        if (!r.ok) throw new Error(p.error ?? "Chargement impossible.");
        return p as View;
      })
      .then((v) => {
        if (cancelled) return;
        const a = { ...v.answers };
        if (!a.date) a.date = toLocalInput(new Date()).slice(0, 10);
        base.current = v.updatedAt;
        setView(v);
        setAnswers(a);
        setStatus(v.status);
        setSavedAt(v.updatedAt);
        setLastSent(v.lastSentAt && v.lastSentTo ? { at: v.lastSentAt, to: v.lastSentTo } : null);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [dogId]);

  const saveRef = useRef<(override?: { status?: FicheStatus }) => Promise<void>>(async () => {});
  const save = async (override?: { status?: FicheStatus }) => {
    if (inFlight.current || conflictRef.current) return;
    inFlight.current = true;
    dirty.current = false;
    setSaving(true);
    try {
      const { answers: a, status: s } = latest.current;
      const nextStatus = override?.status ?? s;
      const res = await fetch("/api/portal/fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId, answers: a, status: nextStatus, baseUpdatedAt: base.current }),
      });
      const p = await res.json();
      if (res.status === 409) {
        conflictRef.current = true;
        setConflict(true);
        setError(p.error ?? "Fiche modifiée entre-temps.");
        return;
      }
      if (!res.ok) throw new Error(p.error ?? "Enregistrement impossible.");
      base.current = p.updatedAt;
      setSavedAt(p.updatedAt);
      setStatus(nextStatus);
      setError("");
    } catch (e) {
      dirty.current = true; // on réessaiera à la prochaine modification
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      inFlight.current = false;
      setSaving(false);
      if (dirty.current && !conflictRef.current) timer.current = setTimeout(() => void saveRef.current(), SAVE_DELAY);
    }
  };
  useEffect(() => {
    saveRef.current = save;
  });

  /** Enregistre les dernières modifications et attend la fin de toute sauvegarde en cours. */
  const flush = async () => {
    if (timer.current) clearTimeout(timer.current);
    if (dirty.current) await save();
    for (let i = 0; i < 100 && inFlight.current; i++) await new Promise((r) => setTimeout(r, 100));
  };

  const send = async () => {
    setSending(true);
    setNotice("");
    setError("");
    try {
      await flush();
      if (conflictRef.current || dirty.current) throw new Error("Les dernières modifications n'ont pas pu être enregistrées : l'envoi est annulé.");
      const res = await fetch("/api/portal/fiche/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId }),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error ?? "Envoi impossible.");
      setLastSent({ at: p.sentAt, to: p.sentTo });
      setNotice(`L'étude de ${view?.dog.name ?? "votre chien"} a bien été envoyée à ${p.sentTo}.`);
      setConfirmSend(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
      setConfirmSend(false);
    } finally {
      setSending(false);
    }
  };

  const change = (key: string, value: string | string[]) => {
    setAnswers((a) => {
      const next = { ...a };
      if (value === "" || (Array.isArray(value) && value.length === 0)) delete next[key];
      else next[key] = value;
      return next;
    });
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveRef.current(), SAVE_DELAY);
  };

  // Enregistre ce qui reste à la sortie de la page, puis met à jour la liste des chiens du portail.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (dirty.current && !conflictRef.current) {
        const { answers: a, status: s } = latest.current;
        fetch("/api/portal/fiche", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dogId, answers: a, status: s, baseUpdatedAt: base.current }),
          keepalive: true,
        }).finally(() => void refresh());
      } else void refresh();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uniquement au démontage
    [],
  );

  if (error && !view) {
    return (
      <div>
        <Link href={backHref} className={`${btn.ghost} mb-3`}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }
  if (!view) return <p className="text-sm text-ink-soft">Chargement de la fiche…</p>;

  const total = FICHE_FIELDS.length;
  const done = answeredCount(answers);
  const completed = status === "completed";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={backHref} className={btn.ghost}>
          <ArrowLeft className="h-4 w-4" /> Retour au client
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn.secondary} onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </button>
          <button
            type="button"
            className={btn.secondary}
            disabled={conflict || sending || !view.owner.email}
            title={view.owner.email ? undefined : "Ce client n'a pas d'adresse e-mail : ajoutez-la dans sa fiche contrat."}
            onClick={() => setConfirmSend(true)}
          >
            <Mail className="h-4 w-4" /> Envoyer au client
          </button>
          <button type="button" className={completed ? btn.secondary : btn.primary} disabled={conflict || saving} onClick={() => save({ status: completed ? "draft" : "completed" })}>
            <CheckCircle2 className="h-4 w-4" /> {completed ? "Rouvrir la fiche" : "Marquer comme terminée"}
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">
          {notice}
        </p>
      )}
      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          <span>{error}</span>
          {conflict && (
            <button type="button" className={btn.secondary} onClick={() => window.location.reload()}>
              Recharger la fiche
            </button>
          )}
        </div>
      )}

      <Card className="print:border-0 print:shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Apolo Dog Training</p>
        <h1 className="mt-1 text-2xl font-bold text-brand md:text-3xl">Étude de comportement</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Confidentiel : réservé à l&apos;administration et au partenaire en charge du client.
        </p>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <dl className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Propriétaire</p>
            <Row k="Nom">{view.owner.name}</Row>
            <Row k="Téléphone">{view.owner.phone ? fmtPhone(view.owner.phone) : "—"}</Row>
            <Row k="E-mail">{view.owner.email || "—"}</Row>
            <Row k="Adresse">{view.owner.address}</Row>
          </dl>
          <dl className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Chien</p>
            <Row k="Nom">{view.dog.name}</Row>
            <Row k="Race">{view.dog.breed || "—"}</Row>
            <Row k="Sexe / âge">{[sexLabel(view.dog.sex), view.dog.age].filter(Boolean).join(" · ") || "—"}</Row>
            <Row k="N° de puce">{view.dog.chip || "—"}</Row>
          </dl>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-soft print:hidden">
          <Badge tone={completed ? "green" : "amber"}>{completed ? "Terminée" : "En cours"}</Badge>
          <span>
            {done} champ{done > 1 ? "s" : ""} renseigné{done > 1 ? "s" : ""} sur {total}
          </span>
          {lastSent && (
            <span>
              Envoyée à {lastSent.to} le {fmtDateTime(lastSent.at)}
            </span>
          )}
          <span aria-live="polite">
            {saving ? "Enregistrement…" : savedAt ? `Enregistré le ${fmtDateTime(savedAt)}${view.updatedBy && savedAt === view.updatedAt ? ` par ${view.updatedBy}` : ""}` : "Pas encore enregistrée"}
          </span>
        </div>
      </Card>

      {confirmSend && (
        <Modal title="Envoyer l'étude au client ?" onClose={() => !sending && setConfirmSend(false)}>
          <p className="text-sm text-ink-soft">
            L&apos;étude de comportement de <strong className="text-ink">{view.dog.name}</strong> sera envoyée en PDF, avec un message de présentation, à :
          </p>
          <p className="mt-3 rounded-xl bg-brand-tint px-4 py-3 text-center text-sm font-semibold text-ink">{view.owner.email}</p>
          <p className="mt-3 text-xs text-ink-soft">
            Vos dernières modifications sont enregistrées avant l&apos;envoi. Le document contient les informations que vous avez saisies (santé, comportement) : relisez-le au besoin avant d&apos;envoyer.
            Une copie est adressée à {site.email}.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={btn.secondary} disabled={sending} onClick={() => setConfirmSend(false)}>
              Annuler
            </button>
            <button type="button" className={btn.primary} disabled={sending} onClick={send}>
              <Send className="h-4 w-4" /> {sending ? "Envoi en cours…" : "Envoyer"}
            </button>
          </div>
        </Modal>
      )}

      {FICHE_SECTIONS.map((section) => (
        <Card key={section.id} className="mt-4 break-inside-avoid-page print:border-0 print:shadow-none">
          <h2 className="text-lg font-bold uppercase tracking-wide text-brand">{section.title}</h2>
          {section.blocks.map((block, bi) => (
            <div key={bi} className="mt-4">
              {block.title && <h3 className="mb-1 text-sm font-bold text-ink">{block.title}</h3>}
              {block.hint && <p className="mb-2 text-xs text-ink-soft">{block.hint}</p>}
              <div className={`grid gap-x-6 gap-y-4 ${block.columns === 2 ? "md:grid-cols-2" : ""}`}>
                {block.fields.map((f) => (
                  <FieldView key={f.key} f={f} answers={answers} onChange={change} />
                ))}
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-ink-soft">{k}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

function FieldView({ f, answers, onChange }: { f: FieldDef; answers: FicheAnswers; onChange: (key: string, v: string | string[]) => void }) {
  const val = answers[f.key];
  const str = typeof val === "string" ? val : "";
  const arr = Array.isArray(val) ? val : [];
  const detailKey = `${f.key}__detail`;
  const detail = typeof answers[detailKey] === "string" ? (answers[detailKey] as string) : "";
  const labelId = `lbl-${f.key}`;

  const showDetail =
    "detail" in f && f.detail
      ? f.type === "yesno"
        ? str === "oui"
        : f.type === "choice"
          ? str === "Autre"
          : f.type === "multi"
            ? arr.length > 0
            : false
      : false;

  // Élément (et non composant) : un composant défini ici serait recréé à chaque frappe et ferait perdre le focus.
  const detailEl =
    showDetail && "detail" in f && f.detail ? (
      <div className="mt-2">
        <label htmlFor={`det-${f.key}`} className="mb-1 block text-xs font-medium text-ink-soft">
          {f.detail}
        </label>
        <AutoTextarea id={`det-${f.key}`} value={detail} onChange={(v) => onChange(detailKey, v)} />
      </div>
    ) : null;

  switch (f.type) {
    case "text":
    case "date":
      return (
        <div>
          <label htmlFor={`f-${f.key}`} className="mb-1.5 block text-sm font-medium text-ink">
            {f.label}
          </label>
          <input id={`f-${f.key}`} type={f.type === "date" ? "date" : "text"} maxLength={300} className={inputCls} value={str} onChange={(e) => onChange(f.key, e.target.value)} />
        </div>
      );
    case "number":
      return (
        <div>
          <label htmlFor={`f-${f.key}`} className="mb-1.5 block text-sm font-medium text-ink">
            {f.label}
          </label>
          <div className="flex items-center gap-2">
            <div className="w-28">
              <NumberInput id={`f-${f.key}`} value={str} onValueChange={(v) => onChange(f.key, v)} />
            </div>
            {f.suffix && <span className="text-sm text-ink-soft">{f.suffix}</span>}
          </div>
        </div>
      );
    case "longtext":
      return (
        <div className="md:col-span-full">
          <label htmlFor={`f-${f.key}`} className="mb-1.5 block text-sm font-medium text-ink">
            {f.label}
          </label>
          <AutoTextarea id={`f-${f.key}`} value={str} onChange={(v) => onChange(f.key, v)} rows={f.key.startsWith("seance_") ? 3 : 2} />
        </div>
      );
    case "yesno":
      return (
        <div className={showDetail ? "md:col-span-full" : ""}>
          <p id={labelId} className="mb-1.5 text-sm font-medium text-ink">
            {f.label}
          </p>
          <div role="radiogroup" aria-labelledby={labelId} className="flex gap-2">
            {(["oui", "non"] as const).map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={str === o}
                className={`${chip} ${str === o ? chipOn : chipOff}`}
                onClick={() => onChange(f.key, str === o ? "" : o)} // un second clic efface la réponse
              >
                {o === "oui" ? "Oui" : "Non"}
              </button>
            ))}
          </div>
          {detailEl}
        </div>
      );
    case "choice":
      return (
        <div className={`${showDetail ? "md:col-span-full" : ""}`}>
          <p id={labelId} className="mb-1.5 text-sm font-medium text-ink">
            {f.label}
          </p>
          <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <button key={o} type="button" role="radio" aria-checked={str === o} className={`${chip} ${str === o ? chipOn : chipOff}`} onClick={() => onChange(f.key, str === o ? "" : o)}>
                {o}
              </button>
            ))}
          </div>
          {detailEl}
        </div>
      );
    case "multi":
      return (
        <div className={`${showDetail ? "md:col-span-full" : ""}`}>
          <p id={labelId} className="mb-1.5 text-sm font-medium text-ink">
            {f.label}
          </p>
          <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
            {f.options.map((o) => {
              const on = arr.includes(o);
              return (
                <button key={o} type="button" aria-pressed={on} className={`${chip} ${on ? chipOn : chipOff}`} onClick={() => onChange(f.key, on ? arr.filter((x) => x !== o) : [...arr, o])}>
                  {o}
                </button>
              );
            })}
          </div>
          {detailEl}
        </div>
      );
  }
}
