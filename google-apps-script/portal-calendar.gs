/**
 * Synchronisation des rendez-vous du portail avec votre agenda Google « Apolo ».
 * Le portail envoie des lots d'opérations : créer / mettre à jour / supprimer des événements.
 *
 * MISE EN PLACE (5 minutes)
 * 1. script.google.com → Nouveau projet → collez ce fichier.
 * 2. Paramètres du projet (engrenage) → Fuseau horaire : Europe/Paris
 *    (Propriétés du script) → ajoutez SECRET = une longue valeur aléatoire (32 caractères ou plus).
 *    Facultatif : CALENDAR_ID = identifiant d'un agenda précis (Paramètres de l'agenda > Intégrer l'agenda).
 *    Sans CALENDAR_ID : agenda secondaire nommé « Apolo » s'il existe, sinon agenda principal du compte.
 * 3. Déployer → Nouveau déploiement → « Application Web » :
 *      Exécuter en tant que : Moi    ·    Qui a accès : Tout le monde
 *    Autorisez l'accès à Google Agenda quand Google le demande.
 * 4. Dans Vercel : PORTAL_CALENDAR_WEBHOOK_URL = l'URL en /exec,
 *    PORTAL_CALENDAR_WEBHOOK_SECRET = la même valeur que SECRET. Redéployez le site.
 *
 * Après toute modification : Déployer → Gérer les déploiements → crayon → nouvelle version.
 *
 * Couleurs : gris = demande d'inscription à confirmer · bleu = rendez-vous que vous assurez
 * vous-même · vert = rendez-vous confié à un partenaire.
 */

var COLORS = { request: "8", self: "9", partner: "10" }; // CalendarApp.EventColor : gris, bleu, vert

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty("SECRET");
    // Sans secret configuré, ou secret incorrect : on refuse (l'URL est publique).
    if (!secret || data.secret !== secret) return out_({ ok: false, error: "forbidden" });

    var cal = findCalendar_(props.getProperty("CALENDAR_ID"));
    if (!cal) return out_({ ok: false, error: "Agenda introuvable : vérifiez CALENDAR_ID." });

    var results = {};
    var errors = {};
    (data.ops || []).slice(0, 200).forEach(function (op) {
      try {
        if (op.type === "delete") {
          var gone = op.eventId && cal.getEventById(op.eventId);
          if (gone) gone.deleteEvent();
          results[op.key] = { eventId: null };
        } else if (op.type === "upsert") {
          results[op.key] = { eventId: upsert_(cal, op) };
        }
      } catch (err) {
        errors[op.key] = String(err);
      }
    });
    return out_({ ok: true, results: results, errors: errors });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

// Ordre : CALENDAR_ID, sinon un agenda secondaire nommé « Apolo », sinon l'agenda principal du compte.
function findCalendar_(id) {
  if (id) return CalendarApp.getCalendarById(id);
  var found = CalendarApp.getCalendarsByName("Apolo");
  return found.length ? found[0] : CalendarApp.getDefaultCalendar();
}

// « 2026-10-15T10:00 » en heure locale du script (réglée sur Europe/Paris).
function parseLocal_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(s));
  if (!m) throw new Error("Date invalide : " + s);
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

function upsert_(cal, op) {
  var start = parseLocal_(op.start);
  var end = new Date(start.getTime() + (op.durationMin || 60) * 60000);
  var event = op.eventId ? cal.getEventById(op.eventId) : null;
  if (event) {
    event.setTitle(op.title);
    event.setTime(start, end);
  } else {
    event = cal.createEvent(op.title, start, end);
  }
  event.setLocation(op.location || "");
  event.setDescription(op.description || "");
  if (COLORS[op.kind]) event.setColor(COLORS[op.kind]);
  return event.getId();
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
