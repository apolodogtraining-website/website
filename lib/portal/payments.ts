/** Modes de règlement proposés lors de l'enregistrement d'un paiement. */
export type PaymentMethod = "cheque" | "virement" | "especes" | "carte" | "autre";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cheque", label: "Chèque" },
  { value: "virement", label: "Virement" },
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "autre", label: "Autre" },
];

export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value) as PaymentMethod[];

/** Libellé d'un mode de règlement ; vide pour les règlements antérieurs à ce champ. */
export const methodLabel = (value: string) => PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "";
