/** Logique partagée par le formulaire (client) et /api/contact (serveur). */

export const SITUATIONS = [
  "Tirage en laisse",
  "Aboiements, réactivité",
  "Rappel",
  "Anxiété, seul à la maison",
  "Socialisation",
  "Mantrailing, nosework, pistage",
  "Autre",
] as const;

export const LIMITS = {
  lastName: 60,
  firstName: 60,
  email: 200,
  phone: 15,
  dogName: 60,
  dogInfo: 120,
  message: 2000,
} as const;

export type ContactInput = {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  dogName: string;
  dogInfo: string;
  situations: string[];
  message: string;
  consent: boolean;
};

export type ContactErrors = Partial<
  Record<"lastName" | "firstName" | "phone" | "email" | "dogName" | "message" | "consent", string>
>;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Garde uniquement les chiffres (champ téléphone). */
export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const PHONE_MIN_DIGITS = 8;

const REQUIRED = "Ce champ est obligatoire.";

/** Texte vide ou fait uniquement d'espaces : traité comme non rempli. */
const blank = (value: string) => value.trim() === "";

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (blank(input.lastName)) errors.lastName = REQUIRED;
  if (blank(input.firstName)) errors.firstName = REQUIRED;

  const digits = onlyDigits(input.phone);
  if (blank(input.phone)) errors.phone = REQUIRED;
  else if (digits.length < PHONE_MIN_DIGITS) errors.phone = `Indiquez au moins ${PHONE_MIN_DIGITS} chiffres.`;
  else if (digits.length > LIMITS.phone) errors.phone = `Indiquez ${LIMITS.phone} chiffres au maximum.`;

  const email = input.email.trim();
  if (!email) errors.email = REQUIRED;
  else if (!isEmail(email)) errors.email = "Cette adresse e-mail n'est pas valide.";

  if (blank(input.dogName)) errors.dogName = REQUIRED;

  if (blank(input.message)) errors.message = REQUIRED;
  else if (input.message.trim().length < 10)
    errors.message = "Décrivez votre situation en quelques mots (10 caractères minimum).";

  if (!input.consent) errors.consent = "Cochez la case pour envoyer votre demande.";
  return errors;
}
