/**
 * Formules d'accompagnement et tarifs de référence. Source unique : le contrat client (article 5), le
 * formulaire de pack du portail et le prix proposé par défaut s'appuient tous sur ces valeurs.
 * Ce sont des tarifs « à partir de » : le prix réellement convenu est saisi par pack et peut différer.
 */
export type PackKind = "initial" | "complice" | "expert";

export const PACKS: { kind: PackKind; label: string; from: number }[] = [
  { kind: "initial", label: "Pack Initial", from: 599 },
  { kind: "complice", label: "Pack Complice", from: 899 },
  { kind: "expert", label: "Pack Expert", from: 1299 },
];

/** Étude de comportement : obligatoire et préalable à tout pack. */
export const STUDY = { label: "Étude de comportement", from: 100 };

export const PACK_KINDS = PACKS.map((p) => p.kind) as PackKind[];

export const packLabel = (kind: PackKind) => PACKS.find((p) => p.kind === kind)?.label ?? "Pack";
export const packFrom = (kind: PackKind) => PACKS.find((p) => p.kind === kind)?.from ?? 0;

/** « 1299 » → « 1 299 €* » (espaces insécables : le prix ne se coupe pas en fin de ligne). */
export const fromPriceLabel = (n: number) => `${n >= 1000 ? `${Math.floor(n / 1000)} ${String(n % 1000).padStart(3, "0")}` : n} €*`;
