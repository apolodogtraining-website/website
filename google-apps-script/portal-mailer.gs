/**
 * Envoi des e-mails du portail (/portail) — contrats signés et études de comportement —
 * gratuit, depuis votre Gmail.
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
 *
 * VERSION 2
 *  - pdfHtml : PDF joint généré depuis un document distinct du corps du mail (études de comportement).
 *  - ping : sonde de version, sans aucun envoi. Le portail la vérifie avant d'envoyer.
 *  - requestId : Google renvoie parfois une page d'erreur à la place de la réponse alors que le message
 *    est déjà parti. Le portail réessaie alors avec le même requestId ; un identifiant déjà traité
 *    n'envoie rien de plus (jamais de doublon chez le client).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    // Sans secret configuré, ou secret incorrect : on refuse (l'URL est publique).
    if (!secret || data.secret !== secret) return out_({ ok: false, error: "Accès refusé." });

    if (data.ping) return out_({ ok: true, v: 2 });

    var to = String(data.to || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return out_({ ok: false, error: "Destinataire invalide." });

    // Un seul envoi à la fois, et jamais deux fois le même requestId (mémoire de 6 h).
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var cache = CacheService.getScriptCache();
      var key = data.requestId ? "req:" + String(data.requestId).slice(0, 80) : "";
      if (key && cache.get(key)) return out_({ ok: true, dup: true });
      send_(data, to);
      if (key) cache.put(key, "1", 21600);
    } finally {
      lock.releaseLock();
    }
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function send_(data, to) {
  // PDF généré depuis pdfHtml s'il est fourni (ex. étude de comportement), sinon depuis le corps du mail (contrats).
  var pdf = Utilities.newBlob(String(data.pdfHtml || data.html), "text/html", "document.html")
    .getAs("application/pdf")
    .setName(String(data.pdfName || "document.pdf"));

  GmailApp.sendEmail(to, String(data.subject), String(data.text), {
    htmlBody: String(data.html),
    name: "Apolo Dog Training",
    bcc: data.bcc ? String(data.bcc) : "",
    replyTo: data.replyTo ? String(data.replyTo) : "",
    attachments: [pdf],
  });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
