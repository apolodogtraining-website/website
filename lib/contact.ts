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
  firstName: 80,
  contact: 120,
  dogName: 60,
  dogInfo: 120,
  message: 2000,
} as const;

export type ContactInput = {
  firstName: string;
  contact: string;
  dogName: string;
  dogInfo: string;
  situations: string[];
  message: string;
  consent: boolean;
};

export type ContactErrors = Partial<
  Record<"firstName" | "contact" | "message" | "consent", string>
>;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isPhone(value: string): boolean {
  const digits = value.replace(/[\s.\-()]/g, "").replace(/^\+/, "");
  return /^\d{9,15}$/.test(digits);
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.firstName.trim()) errors.firstName = "Indiquez votre prénom.";

  const contact = input.contact.trim();
  if (!contact) errors.contact = "Indiquez un email ou un numéro de téléphone.";
  else if (!isEmail(contact) && !isPhone(contact))
    errors.contact = "Ce n'est ni un email ni un numéro de téléphone valide.";

  if (input.message.trim().length < 10)
    errors.message = "Décrivez votre situation en quelques mots (10 caractères minimum).";

  if (!input.consent) errors.consent = "Cochez la case pour envoyer votre demande.";
  return errors;
}
