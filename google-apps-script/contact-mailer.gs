/**
 * Relais d'envoi du formulaire de contact (gratuit, compte Google/Gmail).
 * Ce fichier n'est PAS exécuté par le site : il se colle dans Google Apps Script.
 *
 * MISE EN PLACE (5 minutes)
 * 1. Connectez-vous à Google avec le compte qui doit ENVOYER les mails
 *    (apolo.dogtraining@gmail.com), puis ouvrez https://script.google.com
 * 2. « Nouveau projet », supprimez le code par défaut et collez ce fichier.
 * 3. Remplacez SECRET par une longue phrase aléatoire (30 caractères ou plus).
 *    Gardez-la : c'est la valeur de CONTACT_WEBHOOK_SECRET côté site.
 * 4. Cliquez sur « Déployer » > « Nouveau déploiement » > type « Application web » :
 *      - Exécuter en tant que : Moi
 *      - Qui a accès : Tout le monde
 *    Autorisez l'accès à Gmail quand Google le demande (« Paramètres avancés »
 *    > « Accéder à … » : le message d'avertissement est normal pour un script perso).
 * 5. Copiez l'URL de l'application web (elle se termine par /exec) : c'est la
 *    valeur de CONTACT_WEBHOOK_URL côté site.
 * 6. Sur Vercel : Settings > Environment Variables, ajoutez CONTACT_WEBHOOK_URL
 *    et CONTACT_WEBHOOK_SECRET, puis redéployez.
 *
 * Si vous modifiez ce code plus tard : « Déployer » > « Gérer les déploiements »
 * > crayon > « Nouvelle version », sinon l'ancienne version reste en ligne.
 *
 * LIMITES : environ 100 mails par jour avec un compte Gmail gratuit.
 */

const SECRET = "REMPLACEZ-MOI-PAR-UNE-LONGUE-PHRASE-ALEATOIRE";
const TO = "apolo.dogtraining@gmail.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return reply({ ok: false, error: "forbidden" });

    const options = { name: "Site Apolo Dog Training" };
    if (data.replyTo) options.replyTo = String(data.replyTo);

    MailApp.sendEmail(TO, String(data.subject).slice(0, 200), String(data.text).slice(0, 5000), options);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: "error" });
  }
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
