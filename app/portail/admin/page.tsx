"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { BarChart, PieChart, ShareBars } from "@/components/portal/DashboardCharts";
import PortalShell from "@/components/portal/PortalShell";
import { Badge, btn, Card, PageHeader, Stat, Table } from "@/components/portal/ui";
import WeekCalendar from "@/components/portal/WeekCalendar";
import { fmtDateTime, money, nextSession } from "@/lib/portal/format";
import { billingSummary, dashboardAlerts, dashboardStats, partnerOverview, type PeriodKind } from "@/lib/portal/stats";
import { usePortal } from "@/lib/portal/store";

const PERIODS: { key: PeriodKind; label: string }[] = [
  { key: "month", label: "Mois" },
  { key: "quarter", label: "Trimestre" },
  { key: "year", label: "Année" },
];

export default function AdminHome() {
  const { partners, contracts, invoices, requests, settings } = usePortal();
  const [period, setPeriod] = useState<PeriodKind>("month");
  const total = billingSummary(contracts, invoices);
  const st = useMemo(() => dashboardStats(partners, contracts, invoices, requests, period), [partners, contracts, invoices, requests, period]);
  const alerts = useMemo(() => dashboardAlerts(partners, contracts, requests), [partners, contracts, requests]);
  const plural = (n: number, a: string, b: string) => (n > 1 ? b : a);
  const activeContracts = contracts.filter((c) => c.sessions.some((s) => s.status === "planned"));
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const unsigned = partners.filter((p) => p.active && !p.isSelf && !p.contractSignedAt);

  const upcoming = contracts
    .map((c) => ({ c, next: nextSession(c) }))
    .filter((x): x is { c: typeof x.c; next: NonNullable<typeof x.next> } => Boolean(x.next))
    .sort((a, b) => a.next.date.localeCompare(b.next.date))
    .slice(0, 5);

  return (
    <PortalShell role="admin">
      <PageHeader title="Vue d'ensemble" subtitle="Partenaires, contrats et état de la facturation." />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="ml-auto flex border border-brand-light" role="group" aria-label="Période des statistiques">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-2 text-sm font-semibold transition ${period === p.key ? "bg-brand text-white" : "text-ink-soft hover:bg-brand-tint"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-sm capitalize text-ink-soft">Période : {st.label}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Chiffre d'affaires"
          value={money(st.revenue)}
          hint={st.delta === null ? "pas de période précédente" : `${st.delta > 0 ? "+" : ""}${st.delta} % vs période précédente`}
        />
        <Stat label="Encaissé" value={money(st.collected)} hint={`${money(st.outstanding)} à encaisser`} />
        <Stat label="Impayés clients" value={money(total.outstanding)} hint={total.lateCount ? `${total.lateCount} en retard` : "aucun retard"} tone={total.lateCount ? "red" : undefined} />
        <Stat label="Commissions" value={money(total.commission)} hint={`sur ${money(total.billed)} facturés`} />
        <Stat label="Séances" value={String(st.sessions.done + st.sessions.planned)} hint={`${st.sessions.done} réalisée${plural(st.sessions.done, "", "s")} · ${st.sessions.planned} à venir · ${st.sessions.cancelled} annulée${plural(st.sessions.cancelled, "", "s")}`} />
        <Stat label="Nouveaux clients" value={String(st.newClients)} hint={`${contracts.length} contrats au total`} />
        <Stat
          label="Inscriptions → contrats"
          value={st.requests.rate === null ? "—" : `${st.requests.rate} %`}
          hint={st.requests.total ? `${st.requests.converted} sur ${st.requests.total}${st.requests.avgDays !== null ? ` · ${st.requests.avgDays} j en moyenne` : ""}` : "aucune inscription"}
        />
        <Stat label="Études à compléter" value={String(st.dogsTodo)} hint="chiens suivis sans étude terminée" />
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        {partners.filter((p) => p.active && !p.isSelf).length} partenaire{plural(partners.filter((p) => p.active && !p.isSelf).length, "", "s")} actif{plural(partners.filter((p) => p.active && !p.isSelf).length, "", "s")} · {activeContracts.length} contrat{plural(activeContracts.length, "", "s")} en cours
      </p>

      {settings.showAlerts && alerts.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 font-display text-lg uppercase tracking-wide text-ink">Alertes</h2>
          <ul className="space-y-2 text-sm">
            {alerts.map((a) => (
              <li key={a.key} className="flex flex-wrap items-center gap-2">
                <Badge tone={a.tone === "red" ? "red" : a.tone === "amber" ? "amber" : "blue"}>{a.tone === "red" ? "Urgent" : "À vérifier"}</Badge>
                <Link href={a.href} className="font-semibold text-brand-dark hover:underline">
                  {a.text}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(pendingRequests.length > 0 || unsigned.length > 0 || total.toInvoiceCount > 0 || total.toPayOut > 0 || total.lateCount > 0) && (
        <Card className="mt-6">
          <h2 className="mb-3 text-base font-bold text-ink">À traiter</h2>
          <ul className="space-y-2 text-sm">
            {pendingRequests.length > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">Nouveau</Badge>
                <Link href="/portail/admin/inscriptions" className="font-semibold text-brand-dark hover:underline">
                  {pendingRequests.length} inscription{pendingRequests.length > 1 ? "s" : ""} client{pendingRequests.length > 1 ? "s" : ""} à affecter à un partenaire
                </Link>
              </li>
            )}
            {unsigned.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">Contrat non signé</Badge>
                <Link href={`/portail/admin/partenaires/${p.id}`} className="font-semibold text-brand-dark hover:underline">
                  {p.company}
                </Link>
              </li>
            ))}
            {total.toInvoiceCount > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">À facturer</Badge>
                <Link href="/portail/admin/facturation" className="font-semibold text-brand-dark hover:underline">
                  {total.toInvoiceCount} facture{total.toInvoiceCount > 1 ? "s" : ""} à établir (séances réalisées, études ou packs)
                </Link>
                <Link href="/portail/admin/facturation" className={`${btn.secondary} !px-3 !py-1`}>
                  <Receipt className="h-3.5 w-3.5" /> Facturer
                </Link>
              </li>
            )}
            {total.lateCount > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="red">En retard</Badge>
                <Link href="/portail/admin/facturation" className="font-semibold text-brand-dark hover:underline">
                  {total.lateCount} facture{total.lateCount > 1 ? "s" : ""} impayée{total.lateCount > 1 ? "s" : ""} après l&apos;échéance
                </Link>
                <Link href="/portail/admin/facturation" className={`${btn.secondary} !px-3 !py-1`}>
                  Relancer
                </Link>
              </li>
            )}
            {total.toPayOut > 0 && (
              <li className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">À reverser</Badge>
                <Link href="/portail/admin/facturation" className="font-semibold text-brand-dark hover:underline">
                  {money(total.toPayOut)} encaissés, en attente de reversement aux partenaires
                </Link>
              </li>
            )}
          </ul>
        </Card>
      )}

      {settings.showCharts && (
        <>
          <Card className="mt-6">
            <h2 className="mb-4 font-display text-lg uppercase tracking-wide text-ink">Chiffre d&apos;affaires · 6 derniers mois</h2>
            <BarChart data={st.months} />
          </Card>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-display text-lg uppercase tracking-wide text-ink">Commissions par partenaire</h2>
              <PieChart items={st.commissionByPartner} total={st.commissionTotal} totalLabel="Commissions gagnées" empty="Aucune commission sur la période." />
            </Card>
            <Card>
              <h2 className="mb-4 font-display text-lg uppercase tracking-wide text-ink">Par prestation</h2>
              <ShareBars items={st.byService} empty="Aucune facture sur la période." />
            </Card>
          </div>
        </>
      )}

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Partenaires</h2>
          <Link href="/portail/admin/partenaires" className="text-sm font-semibold text-brand-dark hover:underline">
            Gérer
          </Link>
        </div>
        <Table head={["Partenaire", "Contrat partenaire", "Contrats clients", "Facturé", "À reverser", "Facturation"]}>
          {partners.map((p) => {
            const o = partnerOverview(p, contracts, invoices);
            return (
              <tr key={p.id}>
                <td>
                  <Link href={`/portail/admin/partenaires/${p.id}`} className="font-semibold text-brand-dark hover:underline">
                    {p.company}
                  </Link>
                  {!p.active && <span className="ml-2 text-xs text-ink-soft">(suspendu)</span>}
                </td>
                <td>{p.isSelf ? <Badge tone="blue">Non requis</Badge> : p.contractSignedAt ? <Badge tone="green">Signé</Badge> : <Badge tone="amber">En attente</Badge>}</td>
                <td>{o.contracts.length}</td>
                <td className="whitespace-nowrap">{money(o.summary.billed)}</td>
                <td className="whitespace-nowrap">{money(o.summary.toPayOut)}</td>
                <td>
                  {o.summary.lateCount > 0 ? (
                    <Badge tone="red">{o.summary.lateCount} en retard</Badge>
                  ) : o.summary.toInvoiceCount > 0 ? (
                    <Badge tone="amber">{o.summary.toInvoiceCount} à facturer</Badge>
                  ) : o.summary.outstanding > 0 ? (
                    <Badge tone="blue">En attente de paiement</Badge>
                  ) : (
                    <Badge tone="green">À jour</Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink">{settings.agendaView === "week" ? "Agenda de la semaine" : "Prochains rendez-vous"}</h2>
        {settings.agendaView === "week" ? (
          <WeekCalendar contracts={contracts} partners={partners} />
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucun rendez-vous planifié.</p>
        ) : (
          <ul className="divide-y divide-brand-light/60 text-sm">
            {upcoming.map(({ c, next }) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <Link href={`/portail/admin/contrats/${c.id}`} className="font-semibold text-brand-dark hover:underline">
                    {c.clientName}
                  </Link>
                  <span className="text-ink-soft"> · {c.service}</span>
                </div>
                <div className="text-ink-soft">
                  {fmtDateTime(next.date)} · {partners.find((p) => p.id === c.partnerId)?.company}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

    </PortalShell>
  );
}
