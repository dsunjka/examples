# Lese-Labor PROFI

Interaktives Deutsch-Lernlabor für die **4. Klasse in Bayern** mit dem Schwerpunkt auf der
anspruchsvollen Vorbereitung auf **BYLET-D** („Leseverständnis im digitalen Kontext“) des
Bayerischen Lesetests. Kindgerecht gestaltet, für **iPads optimiert**, ohne Werbung, ohne
Anmeldung und ohne externe Server.

> Kein offizielles Angebot. Alle Fälle, Texte und Aufgaben sind eigene Übungsaufgaben im Stil der
> Testbereiche. Alle Websites, Apps, Personen und Vereine sind erfunden.

## Was drin ist

| Labor | Inhalt | Bezug |
|---|---|---|
| **Digital-Labor** | 5 Fälle mit simulierten, anklickbaren Internetseiten (Suchmaschine, Website mit Menü, Klassenchat und soziales Netzwerk, E-Mail-Postfach, Wetter- und Fahrplan-App), 20 Fragen zu den Kompetenzen *finden, navigieren, verknüpfen, bewerten* | BYLET-D, LehrplanPLUS Lernbereich 2 |
| **Lese-Labor** | 6 Texte (Sachtext, Erzählung, Gedicht, Sachtext mit Tabelle, Anleitung, Meinungsartikel) mit je 5 Fragen | BYLET-V-nah, Lernbereich 2 |
| **Lese-Tempo** | 90 Sätze „stimmt / stimmt nicht“ auf Zeit | BYLET-F-nah |
| **Rechtschreib-Labor** | 8 Themen zu den Strategien *mitsprechen, nachdenken, merken* und zur Zeichensetzung, plus Hör- und Blitz-Diktat | Lernbereich 3 |
| **Grammatik-Labor** | 8 Themen: Wortarten, Wortbildung, Zeitformen, Satzglieder, die vier Fälle | Lernbereich 4 |
| **Schreib-Werkstatt** | 6 Themen zu Planen, Formulieren und Überarbeiten, 4 Schreibaufträge mit automatischem Schreib-Check | Lernbereich 3 |

Aufgabentypen: Einfachauswahl, **Mehrfachauswahl**, Aussagen beurteilen (Matrix), Lückentext,
Wörter antippen, Zuordnen, Reihenfolge, Eintippen.

### Modi

- **Trainingsmodus**: sofortige Rückmeldung, Tipp, zweiter Versuch, Lösung mit Erklärung, Merkkasten
  zu jedem Thema, Textmarker in Quellen und Texten.
- **Prüfungsmodus**: BYLET-D-Prüfung (20 Fragen, 40 Minuten), Lese-Check A/B, Tests je Labor und der
  „Große Deutsch-Check“. Ohne Tipps, mit Uhr, Aufgaben-Navigation, „Später ansehen“-Markierung,
  Unterbrechen und Fortsetzen (auch nach dem Neuladen), automatische Abgabe bei Zeitablauf.
- **Ergebnisauswertung**: Punkte, Auswertung nach Kompetenzen und nach Fällen/Texten/Themen,
  nächster Lernschritt, alle Aufgaben mit Lösung und Erklärung, „Fehler üben“.
- **Lernfortschritt**: Profile ohne Anmeldung (nur Spitzname), Fehler-Kiste, Tagesmission mit
  Wiederholung, Laborpunkte und Level, 15 Abzeichen, Übungstage, Labor-Buch mit Verlauf.
- **Für Erwachsene** (Rechenaufgabe als Sperre): Prüfungszeiten, Schriftgröße, Zeilenabstand,
  Farben, Vorlesestimme, Profile, Übersicht aller Profile, Sichern und Wiederherstellen per Code
  oder Datei, Löschen.

## Benutzen

Die fertige App ist **eine einzige Datei**: `dist/lese-labor-profi.html`.

- Auf einem eigenen Schulserver oder einer Lernplattform ablegen und im Safari öffnen.
- Auf dem iPad: Teilen → „Zum Home-Bildschirm“. Die App startet dann wie eine eigene App.
- Die Datei lädt nichts aus dem Internet nach (Content-Security-Policy `default-src 'none'`).

## Datenschutz

Keine Registrierung, keine Werbung, keine Tracker, keine Cookies, keine externen Schriften oder
Bibliotheken. Spitznamen und Lernfortschritt liegen ausschließlich im `localStorage` des Browsers
auf dem Gerät. Im Diktat wird die Sprachausgabe des Geräts genutzt.

## Eigene Aufgaben einsetzen

Alle Inhalte liegen als JSON in `src/inhalte/` (eine Datei je Fall bzw. Paket). Das Format ist in
[`CONTENT-SPEC.md`](CONTENT-SPEC.md) beschrieben, inklusive des HTML-Vokabulars für die simulierten
Internetseiten. Eigene Fälle oder Fragen ersetzen einfach die passende Datei, danach neu bauen.

## Bauen und testen

```bash
node tools/build.mjs                    # baut dist/lese-labor-profi.html und dist/artifact.html, prüft alle Inhalte
node tests/funktionstest.mjs            # klickt alle Funktionen in iPad-Emulation durch (Playwright)
node tools/build.mjs --mit-test         # Testbuild mit Mini-Testdaten nach tests/build/
```

Aufbau des Quellcodes:

```
src/kopf.html, src/koerper.html   Seitengerüst und SVG-Symbole
src/styles.css                    Gestaltung (helles und dunkles Farbschema)
src/js/01…08-*.js                 App-Logik (ohne Bibliotheken)
src/inhalte/*.json                Lerninhalte
tools/                            Build und Inhaltsprüfung
tests/                            Funktionstest und Testdaten
```
