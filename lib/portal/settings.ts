/** Réglages du portail, modifiables par l'administrateur (page Paramètres). */
export type PortalSettings = {
  /** E-mail de rappel au client la veille de chaque séance planifiée. */
  reminderEmail: boolean;
  /** Tableau de bord : mini-calendrier de la semaine ou liste des 5 prochains rendez-vous. */
  agendaView: "week" | "list";
  /** Tableau de bord : graphiques (chiffre d'affaires, répartition). */
  showCharts: boolean;
  /** Tableau de bord : alertes (demandes sans réponse, séances passées non validées…). */
  showAlerts: boolean;
};

export const DEFAULT_SETTINGS: PortalSettings = {
  reminderEmail: false,
  agendaView: "week",
  showCharts: true,
  showAlerts: true,
};
