"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { fmtDateTime } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";
import type { Contract, Dog } from "@/lib/portal/types";
import { Badge, btn, Card, ConfirmModal, Empty, Field, inputCls, Modal } from "./ui";

const sexLabel = (s: string) => (s === "M" ? "Mâle" : s === "F" ? "Femelle" : "");

function DogForm({ contractId, dog, onClose }: { contractId: string; dog?: Dog; onClose: () => void }) {
  const { saveDog } = usePortal();
  const [f, setF] = useState({ name: dog?.name ?? "", breed: dog?.breed ?? "", sex: (dog?.sex ?? "") as "M" | "F" | "", age: dog?.age ?? "", chip: dog?.chip ?? "" });
  const [busy, setBusy] = useState(false);

  return (
    <Modal title={dog ? `Modifier ${dog.name}` : "Ajouter un chien"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const id = await saveDog(contractId, f, dog?.id);
          setBusy(false);
          if (id) onClose(); // en cas d'erreur, le bandeau du portail l'affiche
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du chien">
            {(id) => <input id={id} required maxLength={60} className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
          </Field>
          <Field label="Race">
            {(id) => <input id={id} maxLength={80} className={inputCls} value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })} />}
          </Field>
          <Field label="Sexe">
            {(id) => (
              <select id={id} className={inputCls} value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value as "M" | "F" | "" })}>
                <option value="">Non précisé</option>
                <option value="M">Mâle</option>
                <option value="F">Femelle</option>
              </select>
            )}
          </Field>
          <Field label="Âge" hint="Ex. 5 mois, 3 ans.">
            {(id) => <input id={id} maxLength={30} className={inputCls} value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />}
          </Field>
        </div>
        <Field label="N° de puce" hint="15 chiffres, facultatif.">
          {(id) => (
            <input id={id} inputMode="numeric" maxLength={15} className={inputCls} value={f.chip} onChange={(e) => setF({ ...f, chip: e.target.value.replace(/\D/g, "") })} />
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btn.secondary} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={btn.primary} disabled={busy}>
            {dog ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const status = {
  none: { tone: "gray", label: "Étude non commencée" },
  draft: { tone: "amber", label: "Étude en cours" },
  completed: { tone: "green", label: "Étude terminée" },
} as const;

/**
 * Chiens d'un client + accès à l'étude de comportement de chacun.
 * `area` choisit l'espace (les adresses des fiches diffèrent) ; seul l'admin supprime.
 */
export default function DogsPanel({ contract, area, embedded }: { contract: Contract; area: "admin" | "partner"; embedded?: boolean }) {
  const { deleteDog } = usePortal();
  const [editing, setEditing] = useState<Dog | "new" | null>(null);
  const [deleting, setDeleting] = useState<Dog | null>(null);
  const dogs = contract.dogs ?? [];
  const ficheHref = (d: Dog) =>
    area === "admin" ? `/portail/admin/contrats/${contract.id}/chiens/${d.id}` : `/portail/partenaire/missions/${contract.id}/chiens/${d.id}`;

  const body = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ink">
          {dogs.length > 1 ? "Chiens" : "Chien"} <span className="font-normal text-ink-soft">({dogs.length})</span>
        </h2>
        <button type="button" className={btn.secondary} onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Ajouter un chien
        </button>
      </div>
      {dogs.length === 0 ? (
        <Empty>Aucun chien enregistré. Ajoutez celui du client pour ouvrir son étude de comportement.</Empty>
      ) : (
        <ul className="divide-y divide-brand-light/60">
          {dogs.map((d) => {
            const st = status[d.ficheStatus];
            return (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{d.name}</p>
                  <p className="text-sm text-ink-soft">{[d.breed, sexLabel(d.sex), d.age].filter(Boolean).join(" · ") || "Informations à compléter"}</p>
                  {d.ficheUpdatedAt && <p className="text-xs text-ink-soft">Étude modifiée le {fmtDateTime(d.ficheUpdatedAt)}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <Link href={ficheHref(d)} className={btn.primary}>
                    <ClipboardList className="h-4 w-4" /> {d.ficheStatus === "none" ? "Remplir l'étude" : "Ouvrir l'étude"}
                  </Link>
                  <button type="button" aria-label={`Modifier ${d.name}`} className="rounded-full p-2 text-ink-soft hover:bg-brand-tint" onClick={() => setEditing(d)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  {area === "admin" && (
                    <button type="button" aria-label={`Supprimer ${d.name}`} className="rounded-full p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(d)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <DogForm contractId={contract.id} dog={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmModal
          title={`Supprimer ${deleting.name} ?`}
          message="Le chien et son étude de comportement seront définitivement supprimés."
          confirmLabel="Supprimer"
          onConfirm={() => deleteDog(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );

  // Intégré à une autre carte (page partenaire) : simple séparateur, sans carte dans la carte.
  return embedded ? <div className="mt-4 border-t border-brand-light/60 pt-4">{body}</div> : <Card className="mt-4">{body}</Card>;
}
