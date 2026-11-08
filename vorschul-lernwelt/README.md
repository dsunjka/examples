# 🦊 Lernwelt mit Flo – interaktives Lerntool für Vorschulkinder

Eine umfangreiche, kindgerechte Lern-App für Kinder im letzten Kindergartenjahr (5–6 Jahre),
die **ohne Lesefähigkeit** bedienbar ist: Alle Aufgaben liest Flo, der Fuchs, vor.
In sieben Lernwelten gibt es **36 Lernspiele und 12 Wissensreisen** mit jeweils mehreren
Schwierigkeitsstufen, die sich automatisch an das Kind anpassen. **Flos Reise** führt
Schritt für Schritt über einen Lernpfad mit acht Kapitel-Orten, im **Forscherbuch** sammelt
das Kind Wissenskarten.

- 🔌 **Ohne Installation, ohne Internet:** `index.html` im Browser öffnen – fertig.
- 🔒 **Ohne Werbung, Tracker, Konten oder Käufe.** Alle Daten bleiben auf dem Gerät.
- 📱 **Für Tablet, Smartphone und Computer** (Touch, Maus, Stift).
- 🗺️ **Flos Reise:** ein aufeinander aufbauender Lernpfad (Spiralcurriculum) mit Geschichten und Schatzkisten.
- 🔭 **Forscherwelt:** Sachwissen über Natur, Körper und Welt als Bildergeschichten zum Mitmachen.
- 👪 **Elternbereich** mit Lernstand, Empfehlungen, Bildschirmzeit-Einstellungen und Pädagogik-Tipps.

---

## Schnellstart

| Weg | So geht's |
| --- | --- |
| **Direkt öffnen** | Ordner `vorschul-lernwelt` herunterladen und `index.html` doppelklicken (Chrome, Edge, Safari oder Firefox). |
| **Lokaler Server** (für Offline-App/Installation) | Im Ordner `python3 -m http.server 8000` ausführen und `http://localhost:8000` öffnen. |
| **Im Netz (z. B. GitHub Pages)** | Ordner veröffentlichen. Über HTTPS lässt sich die Lernwelt auf dem Tablet als App installieren und läuft danach offline (Service Worker). |

**Vorlesestimme:** Flo spricht mit einer natürlichen, neuronalen Stimme. Alle Sätze der App
wurden vorab mit [Kyutai Pocket TTS](https://github.com/kyutai-labs/pocket-tts) aufgenommen und
liegen als kleine MP3-Pakete in `js/voice/`. Es braucht also weder Internet noch ein Konto oder
einen API-Schlüssel. Pro Spiel wird nur das passende Paket geladen. Fehlt für einen Satz eine
Aufnahme (z. B. bei seltenen Zufallskombinationen), springt die Stimme des Geräts ein. Im
Elternbereich kann man stattdessen dauerhaft eine Gerätestimme wählen. Am natürlichsten klingen
Microsoft Edge („Katja Online“, „Seraphina“), Google Chrome („Google Deutsch“) und auf iPad/iPhone
eine erweiterte Stimme unter *Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen*.

**Elternbereich:** Schloss-Symbol 🔒 oben rechts auf der Weltkarte → kleine Rechenaufgabe lösen.
Dort zuerst den **Namen des Kindes** eintragen – Flo spricht es dann persönlich an.

---

## Flos Reise – Schritt für Schritt lernen 🗺️

Der große orange Knopf auf der Weltkarte öffnet einen geschwungenen Pfad durch **acht Orte**:
🌳 Zauberwald → 🚜 Bauernhof → 🏖️ Meeresküste → ⛰️ Berge → 🏜️ Wüste → ❄️ Eiswelt →
🚀 Weltraum → 🏰 Schloss des Wissens. Jeder Ort hat 7–8 Stationen (insgesamt 63).

- **Eine Station = ein Spiel auf einer festen Stufe.** Die leuchtende Station ist die nächste,
  gesperrte Stationen sind sichtbar, aber mit Schloss verschlossen. Flo steht auf dem Pfad und
  hüpft nach jeder beendeten Runde zur nächsten Station (Dranbleiben zählt, nicht Fehlerfreiheit).
- **Kapitel-Einleitung:** Beim ersten Betreten eines Ortes erzählt Flo eine kleine Geschichte
  („Wir sind im Zauberwald. Hier wohnen kluge Eulen …“).
- **Schatzkiste:** Am Ende jedes Kapitels öffnet das Kind eine Schatzkiste mit kurzer Geschichte
  und einem **Bonus-Sticker**; danach wird der nächste Ort enthüllt (vorher hinter Wolken).
- **Spiralcurriculum:** Jede Fähigkeit wird zuerst leicht eingeführt und kommt später auf
  höherer Stufe wieder, z. B. Zählen 1 → Zählen 2 → Mengen vergleichen → Zahlenhaus → Rechnen,
  oder Reime → Silben → Anlaute → Silben verbinden → Buchstaben → erstes Lesen. Jedes Kapitel
  mischt Zahlen, Sprache, Formen, Denken, Sachwissen und Malen.
- Die freie Wahl der Inseln und das Tagesabenteuer bleiben erhalten. Spielt das Kind eine
  Station unter seiner schon erreichten Stufe, bleibt die höhere Stufe gespeichert.
- Im Elternbereich (Überblick) stehen Fortschritt („Station x von y“), die Lernschwerpunkte je
  Kapitel und ein Knopf zum Zurücksetzen der Reise.

## Die sieben Lernwelten

### 🔢 Zahlenland – mathematische Vorläuferfähigkeiten
| Spiel | Was geübt wird |
| --- | --- |
| 🍎 Wie viele? | Zählen mit Eins-zu-eins-Zuordnung (Dinge antippen), Kardinalprinzip, bis 20 |
| ⚡ Blitzblick | Mengen auf einen Blick erfassen (Würfel-, Finger-, Zehnerfeld-Bilder) |
| 🔍 Zahlen-Detektiv | Zahlwort ↔ Ziffer ↔ Menge, 0–20 |
| ⚖️ Mehr oder weniger? | Mengen vergleichen, „gleich viele“, Mengeninvarianz |
| 🚂 Zahlen-Zug | Zahlenreihe, Vorgänger/Nachfolger, rückwärts zählen |
| 🏠 Zahlenhaus | Zahlzerlegung, Teil-Ganzes, Zehnerfreunde |
| ➕ Rechengeschichten | Plus und Minus bis 10 mit Bildgeschichten |

### 🔤 Buchstabenland – phonologische Bewusstheit & Schriftsprache
| Spiel | Was geübt wird |
| --- | --- |
| 🎵 Reime-Spaß | Reime erkennen und bilden |
| 👏 Silben klatschen | Wörter in Silben gliedern, Silbenbögen |
| 🤖 Roboter-Sprache | Silben zu Wörtern verbinden (Synthese) |
| 👂 Anlaute hören | Anfangslaute erkennen, Laut-Buchstaben-Zuordnung |
| 🔠 ABC-Entdecker | Buchstaben kennen, Anlauttabelle, Groß/klein, eigener Name |
| 📖 Erstes Lesen | Lauttreue Wörter lesen (Silbenmethode blau/rot) |
| ↔️ Gegenteile | Wortschatz: Adjektive und Gegensätze |
| 🧺 Sortier-Profi | Oberbegriffe, Klassifizieren |

### 🎨 Formen & Farben
| Spiel | Was geübt wird |
| --- | --- |
| 🔷 Formen-Welt | Grundformen, Forminvarianz, Formen im Alltag |
| 🌈 Farben-Zauber | Farben benennen, Farbmischung |
| 📿 Muster-Kette | Muster erkennen und fortsetzen |
| 📏 Groß und klein | Ordnen nach Größe (Seriation) |

### 🧩 Denk-Insel – Gedächtnis & Logik
| Spiel | Was geübt wird |
| --- | --- |
| 🃏 Memory | Visuelles Gedächtnis, Wortschatz, Zahl–Menge |
| 🤔 Was passt nicht? | Klassifizieren mit Begründung |
| 🌑 Schatten-Rätsel | Visuelle Wahrnehmung, Figur-Grund, Spiegelungen |
| 🙈 Was fehlt? | Kim-Spiel, Arbeitsgedächtnis |
| 🎞️ Was passiert zuerst? | Zeitlich-logische Reihenfolgen, Erzählen |
| 🎹 Flos Klangspiel | Auditives Arbeitsgedächtnis (Tonfolgen nachspielen) |
| 🧩 Bilder-Sudoku | Logisches Schließen |

### 🌍 Entdecker-Welt – Sachwissen & Orientierung
| Spiel | Was geübt wird |
| --- | --- |
| 📦 Wo ist die Katze? | Raum-Lage-Begriffe (auf, unter, vor, hinter, zwischen, links, rechts …) |
| 🧍 Mein Körper | Körperteile und die fünf Sinne |
| 😊 Gefühle | Gefühle erkennen, Empathie, Strategien |
| 🚦 Sicher unterwegs | Verkehrserziehung für den Schulweg |
| 🦁 Tier-Wissen | Tierlaute, Tierkinder, Lebensräume, Eigenschaften |
| 🍂 Jahreszeiten & Tage | Jahreszeiten, Tagesablauf, Wochentage |
| 🕐 Die Uhr | Volle und halbe Stunden ablesen und einstellen |

### ✏️ Malwerkstatt – Fein- und Graphomotorik
| Spiel | Was geübt wird |
| --- | --- |
| ✍️ Nachspuren | Schwungübungen, Ziffern, Buchstaben in Schreibrichtung |
| ⭐ Punkte verbinden | Zahlenfolge + Stiftführung |
| 🖍️ Ausmalbilder | Kreatives Gestalten (ohne richtig/falsch) |

### 🔭 Forscherwelt – Sachwissen mit Geschichten
Zwölf **Wissensreisen** mit je drei Stufen (Grundwissen → vertieft → Experte). Jede Reise läuft
in vier Schritten ab: 📖 **Entdecken** (Bildergeschichte, bei der das Kind mittippt) →
❓ **Verstehen** (Bildfragen; nach der richtigen Antwort erklärt Flo das *Warum*) →
🎲 **Spielen** (Reihenfolge legen, Sortieren oder „Stimmt das?“) → 🃏 **Wissenskarte** fürs
Forscherbuch.

| Thema | Wissensreisen |
| --- | --- |
| 🌿 Natur & Tiere | Vom Ei zum Schmetterling · Wie eine Pflanze wächst · Wer wohnt wo? (Lebensräume) · Tiere und ihre Kinder |
| 🧒 Mensch & Zusammenleben | Die fünf Sinne · Herz, Lunge, Knochen, Muskeln und Magen · Gesund leben · Berufe und Helfer (mit Notruf 112) |
| 🌍 Welt & Technik | Wetter und Wasserkreislauf · Sonne, Erde, Mond und Sterne · Umwelt schützen und Müll trennen · Dinosaurier |

**Forscherbuch 📚:** Alle gesammelten Wissenskarten (drei je Reise) in Kapiteln nach Thema.
Gesammelte Karten sind bunt und werden beim Antippen vorgelesen, fehlende zeigen ein „?“ und
verraten, in welcher Reise es sie gibt. Erreichbar über die Weltkarte und die Forscherwelt-Insel.

---

## Das pädagogische Konzept

Die Lernwelt orientiert sich an den Bildungsplänen der Länder für den Elementarbereich und
an gut belegten Erkenntnissen der Lernforschung:

1. **Vorlesen statt Lesen.** Jede Aufgabe wird gesprochen; mit 🔊 oder einem Tipp auf Flo
   wiederholt. Bilder werden auf Wunsch benannt („Das ist ein Igel“), damit Wortschatzlücken
   nicht zur Hürde werden. Text erscheint zusätzlich in einer Sprechblase (abschaltbar).
2. **Adaptive Schwierigkeit (Zone der nächsten Entwicklung, Wygotski).** Eine Runde hat meist
   5 Aufgaben. Gewertet wird der *erste* Versuch: ≥ 80 % → nächste Stufe, < 50 % → leichter.
3. **Konstruktive Fehlerkultur.** Kein Buzzer, keine roten Kreuze, keine Punktabzüge. Nach zwei
   Fehlversuchen hilft Flo mit einem echten Hinweis (z. B. gemeinsam zählen, Lösung zeigen).
   Jede Aufgabe endet mit einem Erfolgserlebnis.
4. **Wachstumsorientiertes Lob (Dweck).** Gelobt werden Anstrengung und Strategie („Du hast
   genau hingeschaut!“), nicht Eigenschaften. Für jede beendete Runde gibt es mindestens einen
   Stern – Dranbleiben zählt.
5. **Konkret → bildlich → symbolisch (EIS-Prinzip, Bruner).** Zahlen erscheinen mit Mengen,
   Punktmustern und Fingerbildern, Buchstaben mit Anlautbildern, Rechnungen mit Geschichten.
6. **Mathematik nach dem Entwicklungsmodell der Zahl-Größen-Verknüpfung (Krajewski):** vom
   Zählen über Mengenvergleich und Zahlzerlegung hin zu ersten Rechenoperationen.
7. **Phonologische Bewusstheit** (vgl. Würzburger Trainingsprogramm „Hören, lauschen, lernen“):
   Reime → Silben → Anlaute → Laut-Buchstaben-Zuordnung → erstes Lesen.
8. **Exekutive Funktionen** (Arbeitsgedächtnis, kognitive Flexibilität, Inhibition) werden auf
   der Denk-Insel spielerisch trainiert – sie sagen den Schulerfolg nachweislich vorher.
9. **Verteiltes, ausgewogenes Üben.** Das *Tagesabenteuer* schlägt täglich drei Spiele aus
   verschiedenen Welten vor und bevorzugt Neues sowie Spiele mit Übungsbedarf.
10. **Mastery-Lernpfad und Spiralcurriculum (Bruner).** *Flos Reise* ordnet die Spiele so,
    dass Fähigkeiten aufeinander aufbauen: Erst wenn eine Station geschafft ist, öffnet sich die
    nächste. Inhalte kehren in späteren Kapiteln auf höherer Stufe wieder (Wiederholen mit
    wachsendem Anspruch), und die Kapitel mischen die Lernbereiche (verschachteltes Üben, das
    nachhaltiger wirkt als Block-Üben). Kleine Geschichten je Ort geben einen roten Faden.
11. **Sachwissen mit Geschichten.** Die Wissensreisen knüpfen an die Lebenswelt an („Hast du
    schon mal …?“), wecken Staunen („Wusstest du …?“), erklären Ursache und Wirkung („…, weil …“)
    und führen Fachbegriffe ein, die mehrfach wiederkehren (Wortschatz). Der Ablauf Entdecken →
    Verstehen → Anwenden → Sichern folgt dem Lernzyklus; Stufe 3 enthält Transferfragen
    („Was passiert, wenn …?“). Die Wissenskarten im Forscherbuch laden zum Wiederholen und
    Nacherzählen mit den Eltern ein.
12. **Gesunde Bildschirmzeit.** Kurze Runden (2–4 Minuten), Bewegungspausen mit kleinen
    Übungen und ein optionales Tageslimit. Empfehlung: 10–20 Minuten am Stück, möglichst
    gemeinsam mit einem Erwachsenen.
13. **Intrinsische Motivation stärken.** Sterne und ein Sticker-Album (56 Sticker) belohnen das
    Dranbleiben – ohne Zeitdruck, Ranglisten oder Glücksspielmechaniken.

### Der Elternbereich
- **Überblick:** Sterne, Sticker, Lernzeit heute/7 Tage, Flos Reise (Station x von y,
  Lernschwerpunkte je Kapitel, zurücksetzen), Wochen-Diagramm, Empfehlungen
  („gemeinsam üben“, „Stärken“, „noch nicht ausprobiert“), Fortschritt je Lernwelt.
- **Lernstand:** Stufe, Runden, Quote „auf Anhieb richtig“ und Verlauf je Spiel; Stufe kann
  manuell gesetzt werden.
- **Einstellungen:** Name, Stimme, Sprechtempo, Ton, Sprechblase, Bewegungspause, Tageslimit,
  Fortschritt sichern/laden/zurücksetzen.
- **Pädagogik:** Lernziele, Stufenbeschreibung und Alltagsideen zu jedem einzelnen Spiel.

---

## Technik

Reines HTML/CSS/JavaScript ohne Build-Schritt und ohne externe Abhängigkeiten.
Klassische Skripte (keine ES-Module), damit die App auch per `file://` läuft.

```
vorschul-lernwelt/
├── index.html              Einstieg, bindet alle Skripte ein
├── manifest.webmanifest    PWA-Manifest (Installation als App)
├── sw.js                   Service Worker (Offline-Cache)
├── assets/                 App-Symbol, Schrift „Andika“ (SIL OFL 1.1)
├── css/base.css            Design-System (Farben, Kacheln, Buttons, Animationen)
├── css/games/*.css         Styles der Spielgruppen (wissen.css: Forscherwelt & Forscherbuch)
├── css/reise.css           Styles für Flos Reise
├── js/core/
│   ├── util.js             Zufall, DOM-Helfer, Zeit
│   ├── storage.js          localStorage mit Fallback
│   ├── speech.js           Vorlesen: natürliche Aufnahmen, sonst Web Speech API
│   ├── voice.js            Aufnahmen finden, nachladen, abspielen (Web Audio)
│   ├── sound.js            Synthetische Geräusche (Web Audio API)
│   ├── progress.js         Lernstand, adaptive Stufen, Sterne, Sticker, Zeit
│   ├── ui.js               Maskottchen Flo, Sprechblase, Lob, Effekte, Kacheln
│   ├── areas.js            Lernwelten, Spielreihenfolge, Sticker
│   ├── engine.js           Spiel-Schnittstelle & Rundenablauf  ← hier dokumentiert
│   └── reise.js            Flos Reise: Kapitel, Stationen, Schatzkisten (Lernpfad)
├── js/data/lexikon.js      Bild-Wort-Lexikon (≈ 200 Wörter mit Artikel, Plural, Silben)
├── js/games/<gruppe>/      Die Spiele (je Spiel eine Datei)
├── js/games/wissen/        Forscherwelt: Wissens-Engine (_shared.js), Inhalte (natur/mensch/welt.js), Forscherbuch (buch.js)
├── js/voice/             Vorab erzeugte Sprachaufnahmen (index.js + ein Paket je Spiel)
├── js/app.js               Bildschirme: Start, Weltkarte, Insel, Album, Pause, Eltern (+ Einbindung Reise/Forscherbuch)
├── tests/smoke.js          Automatischer Test aller Spiele und Stufen
└── tools/                  Erzeugen der Sprachaufnahmen (siehe unten)
```

### Ein neues Spiel hinzufügen
1. Datei `js/games/<gruppe>/<id>.js` anlegen und `LT.registerGame({...})` aufrufen
   (Schnittstelle siehe Kopfkommentar in `js/core/engine.js`, Vorlage: `js/games/zahlen1/zaehlen.js`).
2. In `index.html` einbinden und die `id` in `js/core/areas.js` beim passenden Bereich eintragen.
   Soll das Spiel auf Flos Reise vorkommen, `[id, stufe]` in `js/core/reise.js` beim passenden
   Kapitel ergänzen (fehlende Spiele werden dort automatisch übersprungen).
3. Testen: `node tests/smoke.js --game=<id> --repeat=3`.

### Tests
```bash
cd vorschul-lernwelt
node tests/smoke.js              # spielt jedes Spiel auf jeder Stufe automatisch durch
node tests/smoke.js --app        # prüft zusätzlich Weltkarte, Inseln, Flos Reise (Einleitung, Station
                                 # spielen, Nochmal mit fester Stufe, Wiederholen, Schatzkiste),
                                 # Forscherbuch (Zähler, Karten, Spielen aus dem Buch, Insel-Knopf),
                                 # Album und Elternbereich
node tests/smoke.js --shots=out  # speichert Screenshots
```
Voraussetzung: Node.js und Playwright mit Chromium.

### Sprachaufnahmen neu erzeugen
Nötig, wenn Texte geändert oder Spiele hinzugefügt wurden, oder für eine andere Stimme.
Voraussetzung sind Python 3.10+ mit `pip install pocket-tts` und ffmpeg.
```bash
node tools/collect-speech.js --repeat=15 --out=said.json      # alle gesprochenen Sätze einsammeln
node tools/build-voice.js jobs --in=said.json --wav=wav --out=jobs.json
python tools/tts_generate.py --jobs jobs.json --voice juergen   # mehrere Prozesse: --shard 0/2, 1/2
node tools/build-voice.js pack --in=said.json --wav=wav --voice=juergen
```
Die festen Sätze von Flos Reise liefert `LT.reise.speechTexts()` (Kapitel-Einleitungen,
Schatzkisten-Geschichten, Hinweise).
Deutsche Stimmen von Pocket TTS sind z. B. `juergen`, `anna` und `eve`. Bereits vorhandene
Aufnahmen werden übersprungen.

## Lizenz
Code: Apache License 2.0 (wie dieses Repository).
Schrift „Andika“: © SIL International, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
Emojis werden von der Systemschrift des Geräts dargestellt.
Sprachaufnahmen: erzeugt mit Kyutai Pocket TTS (Modell und Stimmen unter CC BY 4.0, © Kyutai).
