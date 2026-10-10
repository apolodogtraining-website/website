"use client";

import { useState } from "react";
import { CalendarSync } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import { btn, Card, PageHeader } from "@/components/portal/ui";
import { usePortal } from "@/lib/portal/store";

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span aria-hidden className="block h-6 w-11 bg-brand-light transition peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40" />
        <span aria-hidden className="absolute left-0.5 top-0.5 h-5 w-5 bg-ink transition peer-checked:translate-x-5 peer-checked:bg-white" />
      </span>
    </label>
  );
}

export default function AdminSettings() {
  const { settings, saveSettings, syncCalendar } = usePortal();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const opt = (active: boolean) =>
    `flex-1 px-4 py-2 text-sm font-semibold transition ${active ? "bg-brand text-white" : "text-ink-soft hover:bg-brand-tint"}`;

  return (
    <PortalShell role="admin">
      <PageHeader title="Paramètres" subtitle="Activez ou désactivez les fonctions du portail. Les changements sont enregistrés tout de suite." />

      <Card>
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">Google Agenda</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Les séances et les demandes d&apos;inscription se synchronisent déjà automatiquement. Ce bouton remet tout l&apos;agenda à jour d&apos;un coup : utile après une première configuration, une suppression à la main dans Google Agenda ou
          une synchronisation qui a échoué.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={btn.primary}
            disabled={syncing}
            onClick={async () => {
              setSyncing(true);
              setSyncMsg("");
              const n = await syncCalendar();
              setSyncing(false);
              setSyncMsg(n === undefined ? "" : `Agenda à jour (${n} événement${n > 1 ? "s" : ""}).`);
            }}
          >
            <CalendarSync className="h-4 w-4" /> {syncing ? "Synchronisation…" : "Synchroniser l'agenda"}
          </button>
          {syncMsg && (
            <span role="status" className="text-sm text-ink-soft">
              {syncMsg}
            </span>
          )}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">E-mails aux clients</h2>
        <div className="divide-y divide-brand-light/60">
          <Toggle
            checked={settings.reminderEmail}
            onChange={(v) => saveSettings({ reminderEmail: v })}
            label="Rappel de rendez-vous par e-mail"
            hint="La veille de chaque séance planifiée, le client reçoit un e-mail avec la date, le lieu et l'éducateur. Envoi automatique chaque jour vers 18 h."
          />
        </div>
        {settings.reminderEmail && (
          <p className="mt-1 bg-brand-tint px-3.5 py-2.5 text-xs text-ink-soft">
            Les rappels s&apos;appuient sur une tâche quotidienne de Vercel : la variable <code>CRON_SECRET</code> doit être définie dans Vercel (une valeur aléatoire, par exemple obtenue avec
            <code> openssl rand -base64 32</code>), puis le site redéployé.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">Tableau de bord</h2>
        <div className="py-4">
          <p className="text-sm font-semibold text-ink">Rendez-vous à venir</p>
          <p className="mt-0.5 text-sm text-ink-soft">Mini-calendrier de la semaine, ou liste des 5 prochains rendez-vous.</p>
          <div className="mt-3 flex max-w-md border border-brand-light" role="group" aria-label="Affichage des rendez-vous">
            <button type="button" aria-pressed={settings.agendaView === "week"} className={opt(settings.agendaView === "week")} onClick={() => saveSettings({ agendaView: "week" })}>
              Calendrier de la semaine
            </button>
            <button type="button" aria-pressed={settings.agendaView === "list"} className={opt(settings.agendaView === "list")} onClick={() => saveSettings({ agendaView: "list" })}>
              Liste des 5 prochains
            </button>
          </div>
        </div>
        <div className="divide-y divide-brand-light/60 border-t border-brand-light/60">
          <Toggle
            checked={settings.showCharts}
            onChange={(v) => saveSettings({ showCharts: v })}
            label="Graphiques"
            hint="Chiffre d'affaires sur 6 mois, répartition par partenaire et par prestation."
          />
          <Toggle
            checked={settings.showAlerts}
            onChange={(v) => saveSettings({ showAlerts: v })}
            label="Alertes"
            hint="Demandes sans réponse depuis 48 h, séances passées non validées, contrats récurrents sans séance, partenaires sans contrat signé."
          />
        </div>
      </Card>
    </PortalShell>
  );
}
