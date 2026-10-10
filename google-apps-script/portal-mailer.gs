/**
 * Envoi des exemplaires de contrats du portail (/portail) — gratuit, depuis votre Gmail.
 *
 * MISE EN PLACE
 * 1. script.google.com → Nouveau projet → collez ce fichier.
 * 2. Paramètres du projet (engrenage) → Propriétés du script → ajoutez
 *      SECRET = une longue valeur aléatoire (ex. `openssl rand -base64 32`)
 * 3. Déployer → Nouveau déploiement → type « Application Web »
 *      Exécuter en tant que : Moi    ·    Accès : Tout le monde
 *    Autorisez l'accès à Gmail quand Google le demande. Copiez l'URL « /exec ».
 * 4. Dans Vercel : PORTAL_MAIL_WEBHOOK_URL = cette URL, PORTAL_MAIL_WEBHOOK_SECRET = la même valeur que SECRET.
 *
 * Après toute modification du script : Déployer → Gérer les déploiements → modifier → nouvelle version.
 * Quota Gmail gratuit : environ 100 e-mails par jour.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    // Sans secret configuré, ou secret incorrect : on refuse (l'URL est publique).
    if (!secret || data.secret !== secret) return out_({ ok: false, error: "Accès refusé." });

    var to = String(data.to || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return out_({ ok: false, error: "Destinataire invalide." });

    var pdf = Utilities.newBlob(String(data.html), "text/html", "contrat.html")
      .getAs("application/pdf")
      .setName(String(data.pdfName || "contrat.pdf"));

    GmailApp.sendEmail(to, String(data.subject), String(data.text), {
      htmlBody: String(data.html),
      name: "Apolo Dog Training",
      bcc: data.bcc ? String(data.bcc) : "",
      replyTo: data.replyTo ? String(data.replyTo) : "",
      attachments: [pdf],
    });
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
