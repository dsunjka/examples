# Lese-Labor PROFI – Inhaltsspezifikation

Diese Datei legt fest, wie Lerninhalte für „Lese-Labor PROFI“ aufgebaut sind.
Die App liest JSON-Dateien aus `src/inhalte/`. Wer eigene Aufgaben einfügen will,
hält sich an dieses Format. Die App ist für Kinder der 4. Klasse in Bayern
(LehrplanPLUS Deutsch 3/4) und läuft vor allem auf iPads.

## 1. Allgemeine Regeln für alle Inhalte

- Sprache: Deutsch, neue Rechtschreibung, fehlerfrei. Ein Rechtschreibfehler in
  einer Deutsch-Lern-App ist ein schwerer Fehler.
- Typografie: deutsche Anführungszeichen „…“ und ‚…‘, Gedankenstrich –, Auslassung …
  Uhrzeiten „9:15 Uhr“ oder „9.15 Uhr“ einheitlich je Datei, Preise „4,50 €“.
- Zielgruppe: Kinder mit 9–10 Jahren. Anspruchsvoll in der Sache (Vorbereitung auf
  BYLET-D/BYLET-V), aber verständlich formuliert: kurze Sätze in Fragen, keine
  unnötigen Fremdwörter, keine Verneinungsfallen („Welche Aussage ist nicht nicht…“).
- Alle Personen, Firmen, Vereine, Websites und Apps sind erfunden. Keine echten
  Marken, keine echten Personen. Sachinformationen (Tiere, Natur, Technik) müssen
  trotzdem fachlich stimmen.
- Vielfältige Vornamen (z. B. Lena, Emir, Sofia, Jonas, Aylin, Mateo, Hannah, Noah,
  Leyla, Paul, Mia, Ben, Elif, Luca, Amira, Felix). Bayerischer Alltag ist willkommen
  (Brotzeit, Wandertag, Schullandheim, Faschingsferien, Freibad, Christkindlmarkt).
- Keine Gewalt, keine Angstmacherei, keine Werbung für echte Produkte.
- Erlaubtes Inline-Markup in Texten (frage, tipp, erklaerung, wissen, absaetze):
  nur `<b>…</b>` und `<i>…</i>`. Sonst reiner Text.
- IDs: nur Kleinbuchstaben, Ziffern und Bindestriche; global eindeutig.

## 2. Aufgaben (Items)

Jedes Item hat diese Pflichtfelder:

| Feld | Bedeutung |
|---|---|
| `id` | eindeutige ID, z. B. `gr-zeiten-03` |
| `typ` | `single`, `multi`, `matrix`, `luecke`, `markieren`, `zuordnen`, `reihenfolge`, `eingabe` |
| `stufe` | Schwierigkeit 1 (leicht), 2 (mittel), 3 (schwer) |
| `frage` | Aufgabenstellung an das Kind (Du-Form), klar und eindeutig |
| `tipp` | Hilfe, die zum Lösungsweg führt, die Lösung aber NICHT verrät |
| `erklaerung` | Wird nach dem Antworten gezeigt: warum die Lösung stimmt (1–3 Sätze) |

Optional: `kompetenz` (Schlüssel aus dem Modul, siehe unten), `vorgabe` (Zusatzzeile
unter der Frage, z. B. ein Beispielsatz), `tippSeite` (nur digitale Fälle: Seiten-ID,
die beim Tipp geöffnet wird).

Die App mischt die Reihenfolge von Antwortoptionen, Zuordnungs-Elementen und
Reihenfolge-Elementen selbst. Schreibe sie also in beliebiger (bei `reihenfolge`:
in der richtigen) Reihenfolge.

### 2.1 `single` – genau eine Antwort richtig
```json
{ "typ": "single", "optionen": [ {"text": "…", "richtig": true}, {"text": "…", "richtig": false} ] }
```
4 Optionen, genau eine mit `"richtig": true`. Ablenker müssen plausibel sein.

### 2.2 `multi` – Mehrfachauswahl, mehrere Antworten richtig
```json
{ "typ": "multi", "optionen": [ {"text": "…", "richtig": true}, … ] }
```
5–6 Optionen, davon 2–3 richtig. Die App zeigt „Wähle alle richtigen Antworten aus.“
Gewertet wird nur die vollständig richtige Auswahl.

### 2.3 `matrix` – Aussagen beurteilen
```json
{ "typ": "matrix", "spalten": ["richtig", "falsch"],
  "aussagen": [ {"text": "…", "richtig": true}, {"text": "…", "richtig": false} ] }
```
4 Aussagen. `richtig: true` heißt: die erste Spalte ist korrekt. `spalten` ist optional
(Standard: „richtig“/„falsch“), z. B. `["steht im Text", "steht nicht im Text"]`.
Mindestens eine Aussage je Spalte.

### 2.4 `luecke` – Lückentext mit Auswahl
```json
{ "typ": "luecke",
  "teile": [ {"t": "Gestern "}, {"wahl": ["lief", "läuft", "gelaufen"], "loesung": 0}, {"t": " Tim nach Hause."} ] }
```
`teile` ist eine Folge aus Textstücken (`t`) und Lücken (`wahl` + Index `loesung`).
Leerzeichen gehören in die Textstücke. 1–4 Lücken, je 2–4 Wahlmöglichkeiten.
Für Rechtschreibung kann eine Lücke auch nur Buchstaben enthalten:
`{"t": "die Br"}, {"wahl": ["ü", "üh"], "loesung": 1}, {"t": "cke"}` (hier wäre „Brücke“ richtig – achte darauf, dass `loesung` auf die wirklich richtige Wahl zeigt).

### 2.5 `markieren` – Wörter oder Satzteile antippen
```json
{ "typ": "markieren",
  "teile": [ {"t": "Der"}, {"t": "große", "ziel": true}, {"t": "Hund"}, {"t": "bellt"}, {"t": "laut", "ziel": true}, {"t": ".", "fix": true} ] }
```
Jedes Teil ist antippbar, außer `"fix": true` (z. B. Satzzeichen). Ziele haben
`"ziel": true`. Ein Teil darf mehrere Wörter enthalten (für Satzglieder:
`{"t": "Der kleine Kater", "ziel": true}`). Die App setzt zwischen Teile ein Leerzeichen,
außer vor Satzzeichen (`. , ! ? : ;` und schließenden Anführungszeichen).
Mindestens ein Ziel, nie alle Teile Ziele.

### 2.6 `zuordnen` – in Gruppen sortieren
```json
{ "typ": "zuordnen", "gruppen": ["Nomen", "Verb", "Adjektiv"],
  "elemente": [ {"t": "Haus", "g": 0}, {"t": "rennen", "g": 1}, {"t": "bunt", "g": 2} ] }
```
2–4 Gruppen, 5–8 Elemente, `g` ist der Index der richtigen Gruppe.

### 2.7 `reihenfolge` – in die richtige Reihenfolge bringen
```json
{ "typ": "reihenfolge", "reihe": ["Zuerst …", "Dann …", "Zum Schluss …"] }
```
3–6 Elemente in der RICHTIGEN Reihenfolge. Die Reihenfolge muss eindeutig sein.

### 2.8 `eingabe` – Wort eintippen
```json
{ "typ": "eingabe", "vorgabe": "laufen → Präteritum: Er ___ schnell.", "loesungen": ["lief"] }
```
Das Kind tippt ein Wort oder eine kurze Wortgruppe. Verglichen wird exakt
(Groß-/Kleinschreibung zählt, Leerzeichen am Rand werden ignoriert). Alle
akzeptierten Schreibungen in `loesungen` aufzählen. Nur einsetzen, wenn die Lösung
eindeutig ist.

## 3. Module und ihre Dateien

### 3.1 Digital-Labor (BYLET-D) – `modul: "digital"`

Datei mit genau einem Fall:
```json
{ "modul": "digital",
  "fall": {
    "id": "fall1", "nummer": 1, "titel": "…", "quellenart": "Suchmaschine",
    "einleitung": "Situation und Auftrag in 2–4 Sätzen.",
    "rahmen": "browser",
    "app": {"name": "…", "symbol": "🌦️", "farbe": "blau"},
    "startseite": "start",
    "seiten": [ {"id": "start", "titel": "…", "adresse": "www.….de/…", "farbe": "gruen", "html": "…"} ],
    "items": [ … 4 Items … ]
  } }
```
- `rahmen`: `"browser"` (Adresszeile, Zurück-Knopf) oder `"app"` (App-Kopfzeile mit
  `app.name`, `app.symbol`). Eine Seite kann `rahmen`, `adresse`, `app` und `farbe`
  für sich überschreiben (z. B. Chat-App plus eine Schul-Website im Browser).
- `farbe` (Seiten-Farbschema): `gruen`, `blau`, `orange`, `lila`, `rot`, `grau`, `tuerkis`, `gelb`.
- Kompetenzen (`kompetenz` je Item, jede genau einmal pro Fall):
  `finden` (Informationen gezielt finden), `navigieren` (Seiten bedienen: Menüs, Links,
  Reiter, Symbole, Suchergebnisse), `verknuepfen` (Informationen von mehreren Stellen
  oder Seiten verbinden und Schlüsse ziehen), `bewerten` (Glaubwürdigkeit, Werbung,
  Absicht, Aktualität, Datenschutz, Gefahren erkennen).
- `tippSeite`: Seite, die beim Antippen von „Tipp“ geöffnet wird (optional).

#### HTML-Vokabular für `seiten[].html`

Erlaubte Tags: `h1 h2 h3 h4 p ul ol li strong em b i small span div a button br hr
table thead tbody tr th td dl dt dd details summary time`. Keine `style`-Attribute,
keine Skripte, keine Bilder (`img`), keine externen Links. Nur die folgenden Klassen.

Navigation:
- `<a data-ziel="seitenId">…</a>` oder `<button data-ziel="seitenId">…</button>` öffnet
  eine andere Seite des Falls. Jede `data-ziel`-ID muss existieren.
- `<a data-extern>…</a>`: Link nach „draußen“. Die App zeigt: „Dieser Link führt in der
  Übung nirgendwohin.“ (gut für Werbung und verdächtige Links).
- `<details><summary>Mehr anzeigen</summary>…</details>` für aufklappbare Bereiche.

Allgemeine Website:
- `w-kopf` Kopfbereich der Website; darin `w-logo` (Name/Logo der Seite, gern mit Emoji)
- `w-menue` Menüleiste mit Links; aktueller Menüpunkt zusätzlich mit Klasse `aktiv`
- `w-inhalt` Hauptinhalt; `w-fuss` Fußzeile (Impressum, Kontakt, Datenschutz)
- `w-spalten` zwei Spalten (auf schmalen Bildschirmen untereinander)
- `w-karte` Karte/Kasten mit Rahmen; `w-kasten` farbiger Hinweiskasten, ergänzt um
  `w-kasten--info`, `w-kasten--warnung` oder `w-kasten--tipp`
- `w-bild` Bildplatzhalter: `<div class="w-bild"><span>🦔</span><small>Foto: Igel im Laub</small></div>`
- `w-tabelle` Tabelle (`<table class="w-tabelle">`)
- `w-knopf` Link/Knopf im Button-Look; `w-marke` kleines Etikett (z. B. „NEU“)
- `w-klein` kleine graue Schrift; `w-datum` Datumsangabe; `w-autor` Autorangabe
- `w-werbung` Werbebanner auf einer Website; darin `w-werbung-label` mit Text „Anzeige“ oder „Werbung“

Suchmaschine:
- `s-suchfeld` Suchleiste mit dem Suchbegriff als Text
- `s-filter` Reiterleiste (Alle, Bilder, Videos …); aktiver Reiter mit `aktiv`
- `s-anzahl` „Ungefähr 12.400 Ergebnisse“
- `s-treffer` ein Suchtreffer; darin `s-url` (Adresse), `s-titel` (Link-Titel, meist
  `<a data-ziel>`), `s-text` (Ausschnitt), `s-info` (Datum, Quelle)
- `s-anzeige` zusätzlich auf `s-treffer` bei bezahlter Werbung; darin
  `<span class="s-anzeige-label">Anzeige</span>`

Soziale Netzwerke:
- `p-beitrag` Beitrag; `p-kopf` Kopf mit `p-avatar` (Emoji), `p-name`, `p-konto` (@name),
  `p-zeit`, optional `p-haken` (bestätigtes Konto, Inhalt „✓“)
- `p-text` Beitragstext; `p-bild` Bildplatzhalter (wie `w-bild`); `p-leiste`
  Gefällt-mir/Kommentare/Teilen; `p-kommentar` Kommentar (mit `p-name`, `p-text`)

Chat/Messenger:
- `c-gruppe` Kopf mit Gruppenname und Mitgliederzahl
- `c-verlauf` Nachrichtenverlauf; `c-nachricht` eine Sprechblase (eigene zusätzlich `c-ich`);
  darin `c-absender`, `c-text`, `c-zeit`; `c-hinweis` Systemzeile (z. B. „Heute“,
  „Weitergeleitet“, „Aylin wurde hinzugefügt“)

E-Mail:
- `m-liste` Posteingang; `m-eintrag` eine Zeile (gern als `<a data-ziel>`), ungelesen
  zusätzlich `m-neu`; darin `m-von`, `m-betreff`, `m-vorschau`, `m-datum`
- `m-mail` geöffnete Mail; `m-kopfzeilen` (als `<dl>` mit Von/An/Datum/Betreff),
  `m-text` Mailtext, `m-anhang` Anhang (gern `<a data-ziel>` auf eine Anhang-Seite),
  `m-warnung` Warnhinweis des Mailprogramms

Apps:
- `a-reiter` Reiterleiste mit Links (aktiv: `aktiv`)
- `a-kachel` Kachel; `a-gross` große Zahl/Angabe; `a-symbol` Symbol (Emoji)
- `a-zeile` Zeile mit Inhalt links und rechts; `a-raster` Raster für z. B. Stundenwerte,
  darin `a-zelle`; `a-fahrt` eine Fahrplanverbindung; `a-hinweis` Störungs-/Infohinweis

### 3.2 Lese-Labor (Leseverstehen, BYLET-V-nah) – `modul: "lesen"`
```json
{ "modul": "lesen",
  "texte": [ {
    "id": "l-fledermaus", "titel": "Jäger der Nacht", "textsorte": "Sachtext",
    "einleitung": "Ein Satz, worum es geht oder warum man den Text liest.",
    "text": {
      "titel": "…", "untertitel": "…", "autor": "…",
      "absaetze": ["…", "…"],
      "strophen": [["Vers 1", "Vers 2"], ["…"]],
      "tabelle": {"titel": "…", "kopf": ["…", "…"], "zeilen": [["…", "…"]]}
    },
    "items": [ … 5 Items … ] } ] }
```
- Ein Text hat entweder `absaetze` (Prosa) oder `strophen` (Gedicht); `tabelle` optional.
- Die App nummeriert Absätze (bzw. Strophen und Verse). Fragen dürfen sich darauf
  beziehen („Lies Absatz 3.“).
- Absätze dürfen Zwischenüberschriften als eigenen Absatz der Form `"## Überschrift"` enthalten (werden nicht nummeriert).
- Kompetenzen: `entnehmen` (Informationen finden), `schliessen` (Zusammenhänge,
  Gründe, Gefühle erschließen), `reflektieren` (Absicht, Textsorte, Gestaltung, Meinung).

### 3.3 Rechtschreib-Labor – `modul: "rechtschreibung"`
```json
{ "modul": "rechtschreibung",
  "themen": [ {
    "id": "rs-verlaengern", "titel": "Verlängern", "kurz": "b oder p? d oder t? g oder k?",
    "kompetenz": "nachdenken",
    "wissen": { "merksatz": "…", "punkte": ["…"], "beispiele": ["Hund → Hunde"] },
    "items": [ … ] } ],
  "diktate": [ { "id": "dk-verlaengern", "titel": "…",
    "woerter": [ {"wort": "Zwerg", "satz": "Der Zwerg wohnt im Wald."} ] } ] }
```
- `kompetenz` (Rechtschreibstrategie): `mitsprechen`, `nachdenken`, `merken`, `zeichen`.
- Diktat: Die App liest erst das Wort, dann den Satz, dann wieder das Wort vor
  (Sprachausgabe des Geräts). Der Satz muss das Wort genau so enthalten.

### 3.4 Grammatik-Labor – `modul: "grammatik"`
Wie Rechtschreibung, aber ohne `diktate`. `kompetenz`: `wortarten`, `wortbildung`,
`zeitformen`, `satzglieder`, `faelle`.

### 3.5 Schreib-Werkstatt – `modul: "schreiben"`
```json
{ "modul": "schreiben",
  "themen": [ … wie oben, kompetenz: planen | formulieren | ueberarbeiten … ],
  "auftraege": [ {
    "id": "sa-fantasie", "titel": "…", "textsorte": "Fantasieerzählung",
    "auftrag": "…", "impuls": "🐉🏰🔑",
    "planung": ["Wer?", "Wo?"], "woerter": ["plötzlich", "flüsterte"],
    "checkliste": ["Meine Erzählung hat eine Einleitung, einen Hauptteil und einen Schluss."],
    "minWoerter": 120 } ] }
```

### 3.6 Lese-Tempo (Leseflüssigkeit, BYLET-F-nah) – `modul: "tempo"`
```json
{ "modul": "tempo", "saetze": [ {"t": "Ein Fisch kann Fahrrad fahren.", "r": false} ] }
```
Sätze, die ein Kind sofort als wahr (`r: true`) oder falsch beurteilen kann.
