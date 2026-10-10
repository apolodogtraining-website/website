"use client";

import PortalShell from "@/components/portal/PortalShell";
import { Card, PageHeader } from "@/components/portal/ui";
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
  const { settings, saveSettings } = usePortal();
  const opt = (active: boolean) =>
    `flex-1 px-4 py-2 text-sm font-semibold transition ${active ? "bg-brand text-white" : "text-ink-soft hover:bg-brand-tint"}`;

  return (
    <PortalShell role="admin">
      <PageHeader title="Paramètres" subtitle="Activez ou désactivez les fonctions du portail. Les changements sont enregistrés tout de suite." />

      <Card>
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
