"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarSync, Plus } from "lucide-react";
import ContractForm from "@/components/portal/ContractForm";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, Empty, PageHeader, Table } from "@/components/portal/ui";
import { contractBilling, fmtDateTime, money, nextSession } from "@/lib/portal/format";
import { usePortal } from "@/lib/portal/store";

export default function AdminContracts() {
  const { contracts, partners, invoices, syncCalendar } = usePortal();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "recurring" | "oneoff">("all");
  const shown = contracts.filter((c) => filter === "all" || c.type === filter);

  return (
    <PortalShell role="admin">
      <PageHeader
        title="Contrats clients"
        subtitle="Chaque contrat confie un client, ponctuel ou récurrent, à un partenaire."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btn.secondary}
              disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                setSynced(null);
                const n = await syncCalendar();
                setSyncing(false);
                if (n !== undefined) setSynced(n);
              }}
            >
              <CalendarSync className="h-4 w-4" /> {syncing ? "Synchronisation…" : "Synchroniser l'agenda"}
            </button>
            <button type="button" className={btn.primary} onClick={() => setCreating(true)} disabled={partners.length === 0}>
              <Plus className="h-4 w-4" /> Nouveau contrat
            </button>
          </div>
        }
      />
      <p className="mb-4 text-xs text-ink-soft">
        Agenda Google « Apolo » :{" "}
        <span className="font-semibold text-ink">gris</span> = demande d&apos;inscription à confirmer ·{" "}
        <span className="font-semibold text-brand-darker">bleu</span> = rendez-vous que vous assurez ·{" "}
        <span className="font-semibold text-emerald-700">vert</span> = rendez-vous confié à un partenaire.
        {synced !== null && <strong className="ml-2 text-emerald-700">Agenda à jour ({synced} événement{synced > 1 ? "s" : ""}).</strong>}
      </p>
      <div className="mb-4 flex gap-2" role="group" aria-label="Filtrer par type">
        {([["all", "Tous"], ["recurring", "Récurrents"], ["oneoff", "Ponctuels"]] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === k ? "bg-brand text-white" : "bg-white text-ink-soft ring-1 ring-brand-light hover:bg-brand-tint"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <Card>
        {shown.length === 0 ? (
          <Empty>Aucun contrat.</Empty>
        ) : (
          <Table head={["Client", "Type", "Partenaire", "Prochain rendez-vous", "Prix / séance", "Facturation"]}>
            {shown.map((c) => {
              const next = nextSession(c);
              const billing = contractBilling(c, invoices);
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={`/portail/admin/contrats/${c.id}`} className="font-semibold text-brand-dark hover:underline">
                      {c.clientName}
                    </Link>
                    <div className="text-xs text-ink-soft">{c.service}</div>
                  </td>
                  <td>{c.type === "recurring" ? <Badge tone="blue">Récurrent</Badge> : <Badge>Ponctuel</Badge>}</td>
                  <td>{partners.find((p) => p.id === c.partnerId)?.company ?? "—"}</td>
                  <td className="whitespace-nowrap">{next ? fmtDateTime(next.date) : "—"}</td>
                  <td className="whitespace-nowrap">{money(c.price)}</td>
                  <td>
                    <Badge tone={billing.tone}>{billing.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
      {creating && <ContractForm onClose={() => setCreating(false)} />}
    </PortalShell>
  );
}
