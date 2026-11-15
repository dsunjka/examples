# Erklärfilme mit Flo – Video-Pipeline

Kurze Erklärfilme (60–120 s) mit Fuchs Flo, gesprochen von der App-Stimme **juergen**.
Ein Film ist **eine JSON-Datei** in `tools/video/films/<id>.json`. Daraus entstehen

- `videos/<id>.mp4` (960×540, 24 fps, H.264 yuv420p, AAC mono 64 kbit/s 44,1 kHz, +faststart, Ziel ≤ 3 MB pro 90 s)
- `videos/<id>.jpg` (Poster 640×360 aus dem Titel-Beat)
- `js/data/films.js` (Filmliste + Quiz für die App) und `tools/video/speech-texts.json` (App-Sprechtexte)

Technik: [Remotion](https://www.remotion.dev) 4.0.543 (exakt gepinnt), React 19.2.0, eine einzige Komposition
`FloExplainer`. Die Länge jedes Beats ergibt sich aus der Sprechdauer.

---

## 1. Befehle

Alle Befehle im Ordner `tools/video` (Node 22: `export PATH=/opt/node22/bin:$PATH`).

```bash
npm install                                  # einmalig (node_modules ist git-ignoriert)
node render.mjs <id | films/<id>.json>       # Film komplett rendern → videos/<id>.mp4 + .jpg
node render.mjs <id> --preview               # schnelle Vorschau (halbe Größe) → out/<id>.preview.mp4
node stills.mjs                              # je Visual-Typ ein Standbild aus examples.json → out/stills/
node stills.mjs --film films/<id>.json       # ein Standbild pro Beat (ohne Ton, geschätzte Dauer)
node build-films-data.mjs                    # js/data/films.js + speech-texts.json neu bauen (ohne echte Filme: keine Änderung)
npx remotion studio src/index.ts             # interaktive Vorschau im Browser (optional)
```

`render.mjs`-Optionen: `--fps 24` · `--crf 30` (Startwert; wird bei Überschreitung des Größenbudgets
automatisch in 3er-Schritten erhöht) · `--preview` · `--no-lint` (Sprechtext-Prüfung aus) · `--keep` (Zwischen-MP4 behalten).

Umgebungsvariablen: `VIDEO_CONCURRENCY` (Remotion-Tabs, Standard 2) · `TTS_THREADS` (Standard 2) ·
`TTS_PYTHON` (Standard `/tmp/claude-0/tts-venv/bin/python`) · `VIDEO_NICE` (Standard 19) · `REMOTION_BROWSER`
(Pfad zur chrome-headless-shell).

Ablauf von `render.mjs`:

1. Prüft das Skript (bekannte `visual.type`, TTS-freundliche Sprechtexte).
2. Zerlegt jedes `say` in Sätze (gleiche Regel wie `js/core/voice.js`) und erzeugt fehlende Aufnahmen mit
   `tools/tts_generate.py --voice juergen` → `public/narr/<id>/<beat>-<hash>.wav` (Cache: vorhandene Dateien werden übersprungen;
   Text ändern = neue Aufnahme).
3. Lautheit wie beim Pack-Schritt der App angleichen (`volumedetect`, Ziel −19 dB mittel / −1 dB Spitze), Stille vorn/hinten
   abschneiden → `*.norm.wav`; Sätze eines Beats mit 0,32 s Pause verbinden → `beat-<i>-<hash>.wav`.
4. Dauer + Lautstärke-Hüllkurve (für Flos Mund) → Props; Beat-Zeiten → `public/narr/<id>/timing.json`.
5. Remotion-Render (hohe Qualität) → Endkodierung mit ffmpeg (`-crf 30 -tune animation`) → `videos/<id>.mp4`, Poster.
6. Gibt Dauer, Größe und Renderzeit aus.

Alles läuft mit `nice -n 19`. Richtwert (4 Kerne, nebenbei TTS-Last): ca. 2,5 s Renderzeit pro Filmsekunde;
TTS ca. 0,7–2× Echtzeit.

---

## 2. Filmskript-Format

```json
{
  "id": "ueber-die-zehn",
  "title": "Flo hüpft über die Zehn",
  "icon": "🐸",
  "subject": "mathe1",
  "related": ["zehnerbruecke", "rechenrakete"],
  "parent": "Zehnerübergang: erst bis zur Zehn ergänzen, dann den Rest dazu.",
  "intro": "Schau mal, wie Flo über die Zehn hüpft!",
  "accent": "#ff8a3d",
  "beats": [
    {"say": "Hallo! Ich bin Flo. Heute hüpfen wir über die Zehn.", "visual": {"type": "title"}},
    {"say": "Acht plus fünf. Erst hüpfe ich zwei bis zur Zehn.", "caption": "8 + 5 = ?",
     "visual": {"type": "zahlenstrahl", "from": 0, "to": 20, "bridge": 10, "start": 8, "jumps": [{"to": 10, "label": "+2", "hops": true}]}}
  ],
  "quiz": [
    {"q": "Wie viele Hüpfer sind es von acht bis zehn?",
     "options": [{"text": "1", "say": "eins", "correct": false}, {"text": "2", "say": "zwei", "correct": true}, {"text": "3", "say": "drei", "correct": false}],
     "explain": "Von acht bis zehn sind es zwei Hüpfer.", "model": "Acht, neun, zehn. Zwei Hüpfer.", "beat": 1}
  ]
}
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `id` | ja | = Dateiname ohne `.json`. Kleinbuchstaben, Bindestriche. IDs mit `_` am Anfang sind Tests und werden von `build-films-data` übersprungen. |
| `title` | ja | Filmtitel (Titelkarte, App). Darf `*Hervorhebung*` enthalten. |
| `icon` | ja | Ein Emoji (Titelkarte, App-Kachel). |
| `subject` | ja | Lernbereich der App: `"mathe1"`, `"deutsch1"` oder `"sach1"`. |
| `related` | nein | Spiel-IDs aus `js/core/areas.js`, die zum Film passen. |
| `parent` | nein | Ein Satz für den Elternbereich (was lernt das Kind?). |
| `intro` | nein | Gesprochener Satz in der App vor dem Film (TTS-Regeln!). |
| `accent` | nein | Akzentfarbe `#rrggbb` (Rahmen, Hervorhebungen). Standard `#ff8a3d`. Vorschlag: Mathe `#ff8a3d`, Deutsch `#8e6cef`, Sachkunde `#3dbe6b`. |
| `beats` | ja | Liste der Szenen, siehe unten. |
| `quiz` | nein | 3 Fragen für die App (wird **nicht** im Film gezeigt). |

### Beat

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `say` | ja | Sprechtext, 1–3 kurze Sätze (≈ 5–15 s). **TTS-Regeln beachten** (unten). |
| `caption` | nein | Kurze Bildschirmzeile unten (≤ 30 Zeichen, sonst wird sie kleiner/abgeschnitten). Ziffern und Zeichen erlaubt (`8 + 5 = 13`). `*13*` färbt in der Akzentfarbe. |
| `visual` | ja | Was man sieht: `{ "type": "...", ...Eigenschaften }` (Abschnitt 4). |
| `pause` | nein | Sekunden Stille nach dem Sprechen (Standard 0.7, Titel 0.9). Für „Denk mal nach“-Momente z. B. `2`. |

Beat-Länge = 0,3 s Vorlauf + Sprechdauer + `pause` (+ 1 s am Filmende). Beats werden 8 Frames weich überblendet.
Ein guter Film hat 7–10 Beats: `title` → Inhalt … → `merke` (Zusammenfassung).

### Quiz-Eintrag

| Feld | Bedeutung |
|---|---|
| `q` | Frage, wird vorgelesen (TTS-Regeln). |
| `options` | 3 (höchstens 4) Antworten `{text, say, correct}`: `text` = Anzeige (Ziffern/Symbole erlaubt), `say` = Vorlesetext (Zahlen als Wörter), genau **eine** mit `correct: true`. |
| `explain` | Satz nach einer nicht passenden Antwort: warm, nie „falsch“, verrät die Lösung nicht (z. B. „Schau mal auf den Namen: Zehner-Schachtel.“). |
| `model` | Gesprochene Musterlösung (kurzer Lösungsweg). |
| `hint` | (optional) Denkanstoß. |
| `key` | (optional) kurzer Schlüssel für den Lernstand, z. B. `"Einer der 15"`. |
| `beat` | (optional) Index des Beats, der die Antwort erklärt. Die App kann dorthin springen (`at` in Sekunden). |

### TTS-Regeln für alles Gesprochene (`say`, `intro`, Quiz-Texte)

- Zahlen als Wörter („dreizehn“, nicht „13“). `render.mjs` bricht bei Ziffern ab.
- Keine Symbole: `+ − = € < > % /` → „plus“, „minus“, „ist gleich“, „Euro“, „kleiner als“.
- Keine Gedankenstriche zwischen Wörtern (` – `); Bindestrich in Wörtern ist ok (`Rechen-Trick`).
- Kurze Sätze, warme Sprache, nie „falsch“ (stattdessen „Fast!“, „Schau mal …“).
- Silben/Laute zum Mitsprechen mit Kommas trennen: „To, ma, te.“, „Mmm, au, sss.“
- Satzzeichen steuern die Satzmelodie (Fragezeichen hebt die Stimme).

---

## 3. Bildaufbau & Zeitangaben

- Bild: 960×540. **Flo** sitzt bei Inhalts-Beats unten links (≈ 180×180 px) und bewegt den Mund zur Stimme.
  Die **Untertitelzeile** liegt unten (x 196–942, y 440–524, Schrift 44–54 px).
- Inhalts-Visuals füllen die **Bühne** x 176–946, y 14–438 und sind automatisch zentriert.
- Vollbild-Visuals: `title`, `flo`, `scene`, `strasse` (eigene Landschaft).

**Zeitangaben** (`at`, `until`, `…At`) sind **Anteile der Sprechdauer des Beats**: `0` = Sprechbeginn, `0.5` = Mitte,
`1` = Ende der Sprache, Werte > 1 = in der Pause danach, leicht negative Werte (≥ −0.1) = schon im Vorlauf.
So bleiben Animationen synchron, egal wie schnell die Stimme spricht. Fehlt `at`, werden Elemente gleichmäßig
über die Sprechzeit verteilt. Tipp: Wenn ein Wort bei etwa 40 % des Satzes fällt, `at: 0.4` setzen.

**Farben** (überall, wo `color` steht): `red, blue, green, orange, yellow, purple, pink, teal, grey, brown, ink, white` oder `#hex`.

**Emojis**: Gerendert mit Noto Color Emoji. Nicht jedes Ding hat ein Emoji (z. B. kein Storch → 🪿/🦢, kein Korken → 🍾).
Die meisten Tier- und Fahrzeug-Emojis schauen nach **links**; mit `flip: true` nach rechts drehen.

### Gemeinsame Eigenschaften (jeder `visual.type`)

| Eigenschaft | Typ | Bedeutung |
|---|---|---|
| `bg` | string | Hintergrund: `plain` (Himmel, Standard), `meadow`, `street`, `classroom`, `forest` (Herbst), `forest-winter` (Schnee fällt), `bathroom`, `water-tank`, `shop`, `night`, `kitchen`, `south` (Strand/Palmen). Nicht bei `strasse`. |
| `flo` | bool | `false` blendet Flo in der Ecke aus. |
| `floEmotion` | string | Gesicht von Flo in der Ecke (Werte wie bei `flo.emotion`). |
| `floGesture` | string | Geste von Flo in der Ecke (Werte wie bei `flo.gesture`). |
| `continue` | bool | Keine Einblende-Animation/Überblendung – für den direkten Anschluss an einen Beat mit gleichem Bild (z. B. Zehnerfeld weiterfüllen; dann Startzustand mit `at: -0.1` vorwegnehmen). |

---

## 4. Visual-Typen

### `title` – Titelkarte

Flo groß links (winkt, spricht), rechts Karte mit Icon und Titel. Wird für das Poster verwendet. Kein Ecken-Flo.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `title` | Filmtitel | Text auf der Karte (`*x*` = Akzentfarbe). |
| `icon` | Film-Icon | Emoji im Kreis. |
| `subtitle` | – | Kleine Zeile unter dem Titel. |

```json
{"say": "Hallo! Ich bin Flo. Heute zeige ich dir einen Rechen-Trick.", "visual": {"type": "title", "subtitle": "Rechnen mit Flo"}}
```

### `flo` – Flo groß im Bild

Flo groß (links oder rechts) mit Sprech- oder Denkblase und optionalen Gegenständen. Kein Ecken-Flo.
Hat der Beat eine `caption`, steht Flo automatisch etwas kleiner und höher, damit die Untertitelzeile ihn nicht verdeckt.
Bei 3–4 Gegenständen werden Bilder und Schilder kleiner (Schilder ≤ 12 Zeichen halten).

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `emotion` | `neutral` | `neutral`, `happy` (lachende Augen in Sprechpausen), `surprised`, `think` (Augenbraue hoch, Blick nach oben), `wink`, `cold` (Mütze, zittert leicht). |
| `gesture` | `none` | `none`, `wave` (winkt), `point` (zeigt zur Seite), `cheer` (beide Arme hoch). |
| `side` | `left` | `left` / `right` – wo Flo steht. |
| `bubble` | – | Text (≤ 25 Zeichen) oder ein Emoji (wird groß dargestellt). |
| `bubbleAt` | 0.1 | Einblendzeit der Blase. |
| `think` | false | Denkblase statt Sprechblase. |
| `items` | – | Gegenstände neben Flo: `["🍎", {"e": "🍐", "label": "Birne", "at": 0.5}]` (max. 4). |

```json
{"say": "Schau mal, ich habe einen Zauberspiegel!", "visual": {"type": "flo", "emotion": "surprised", "gesture": "point", "bubble": "🪞", "items": [{"e": "🍎", "label": "3 Äpfel"}]}}
```

### `scene` – Landschaft mit Figuren

Vollbild-Landschaft (`bg`, Standard `meadow`) mit beliebigen Figuren (Emojis oder Flo). Ecken-Flo erscheint nur, wenn keine
Figur `"e": "flo"` ist.

Figur (`actors[]`):

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `e` | – | Emoji (auch mehrere, z. B. `"🍂🍂🍂"`) oder `"flo"` (Flo selbst, spricht mit). |
| `x` | 50 | Mitte der Figur in % der Bildbreite (0–100). |
| `y` | Bodenhöhe | Fußpunkt in % der Bildhöhe. Bodenhöhe ≈ 76 (`street`: 71 = hinterer Gehweg, `kitchen`: 74 = Arbeitsplatte). Kleinere Werte = höher (Vögel z. B. 30). |
| `size` | 96 | Größe in px (Flo gut: 150–200). |
| `at` | 0 | Auftrittszeit. |
| `enter` | `pop` | `pop`, `fade`, `left` (läuft von links herein), `right`, `drop` (fällt von oben), `up` (taucht von unten auf), `none`. |
| `anim` | `none` | Daueranimation: `bounce`, `wiggle`, `float`, `fly`, `sleep` (atmet + 💤), `shiver`, `walk` (automatisch beim Bewegen), `pulse`, `spin`. |
| `moves` | – | Wegpunkte: `[{"x": 70, "y": 76, "at": 0.3, "until": 0.6}]` (ohne `until`: 1,2 s). Nacheinander abgearbeitet. |
| `exit` | – | Abgang `{"at": 0.8, "to": "left" | "right" | "fade" | "shrink" | "up" | "down"}`. |
| `flip` | false | Spiegeln (Blickrichtung rechts). |
| `label` | – | Schild über der Figur (bzw. darunter, wenn `bubble` gesetzt oder `labelBelow: true`). Am Bildrand wird es nach innen geschoben. |
| `labelAt` | at+0.15 | Einblendzeit des Schilds. |
| `bubble` | – | Sprechblase über der Figur (Text oder Emoji). `bubbleAt`, `think` wie bei `flo`. |
| `emotion`, `gesture` | – | Nur für `"e": "flo"`. |
| `z` | nach `y` | Stapelreihenfolge (größer = vorne). |

```json
{"say": "Der Igel frisst sich im Herbst dick. Dann schläft er im Laubhaufen.", "caption": "Winterschlaf",
 "visual": {"type": "scene", "bg": "forest", "actors": [
   {"e": "🦔", "x": 40, "size": 110, "enter": "left", "moves": [{"x": 62, "at": 0.3, "until": 0.6}], "anim": "sleep", "label": "Igel", "labelAt": 0.7},
   {"e": "🍂🍂🍂", "x": 66, "size": 80, "at": 0.55, "enter": "drop", "z": 1},
   {"e": "🐞", "x": 30, "y": 60, "size": 54, "anim": "fly", "exit": {"at": 0.5, "to": "up"}},
   {"e": "🐿️", "x": 86, "size": 90, "at": 0.2, "bubble": "🌰", "bubbleAt": 0.4}]}}
```

### `zehnerfeld` – Zehner-/Zwanzigerfeld

Punkte (oder Emojis) füllen Felder nacheinander; Gruppen in verschiedenen Farben, Fünfer-/Zehner-Markierungen, Zähler.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `size` | 10 | `10` (2 Reihen × 5) oder `20` (2 Reihen × 10, Lücke nach 5). |
| `boxes` | 1 | Nur bei `size: 10`: 1–3 Zehnerfelder nebeneinander (z. B. 13 = 2 Felder). |
| `style` | – | `"schachtel"` = Pappschachtel-Look (Kraft der Zehn). |
| `emoji` | – | Emoji statt Punkt für alle Gruppen (z. B. `"🌰"`). |
| `from` | `none` | Standard-Herkunft für alle Gruppen (siehe `groups.from`). |
| `groups` | – | `[{n, color, e, at, until, from, label}]` – füllt der Reihe nach. `n` Anzahl; `color` (1. Gruppe rot, sonst blau); `e` Emoji nur für diese Gruppe; `at`/`until` Zeitraum, in dem die Punkte nacheinander kommen; `from`: `none` (ploppt auf), `right`, `left`, `top` (fliegen herein), `scatter` (liegen anfangs verstreut unter dem Feld und hüpfen hinein); `label` Schild unter dem Feld in Gruppenfarbe. |
| `marks` | – | Rahmen um Felder: `[{"from": 1, "to": 10, "at": 0.8, "label": "10", "color": "yellow"}]` (Feldnummern 1-basiert). |
| `highlightFive` | false | Rahmt automatisch jede Fünfergruppe ein (`fiveAt`, Standard 0.75; `fiveColor`, Standard yellow). |
| `count` | false | Große Zahl unter dem Feld zählt mit. |

```json
{"say": "Ich lege immer zehn in eine Schachtel. Drei bleiben übrig.", "caption": "1 Zehner und 3 Einer",
 "visual": {"type": "zehnerfeld", "size": 10, "boxes": 2, "style": "schachtel", "emoji": "🌰",
   "groups": [{"n": 13, "from": "scatter", "at": 0.15, "until": 0.7}], "marks": [{"from": 1, "to": 10, "at": 0.8, "label": "10"}]}}
```

```json
{"visual": {"type": "zehnerfeld", "size": 20, "count": true,
  "groups": [{"n": 8, "color": "red", "at": 0, "until": 0.25}, {"n": 5, "color": "blue", "from": "right", "at": 0.35, "until": 0.7, "label": "5 dazu"}]}}
```

### `zahlenstrahl` – Zahlenstrahl mit Sprüngen

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `from`, `to` | 0, 20 | Bereich. Für große Ziffern ≤ 20 Schritte; bis 100 möglich (dann Beschriftung in 5er/10er-Schritten). |
| `labelEvery` | auto | Beschriftung jede n-te Zahl (≤ 20: 1, ≤ 50: 5, sonst 10). Schriftgröße und Markierungskreise passen sich dem Abstand an (0–10: groß, 0–20: zweistellige Zahlen kleiner, damit sie sich nicht berühren). |
| `marks` | – | Hervorgehobene Zahlen (Kreis): `[13]`. |
| `bridge` | – | Zehner-Brücke über einer Zahl (goldene Säule + Brücke), z. B. `10`. |
| `start` | 1. Sprung | Wo der Hüpfer anfangs steht. |
| `jumps` | – | `[{from, to, at, until, label, color, hops, below}]`: `from` (Standard: Ende des vorigen Sprungs), `to`, `label` (z. B. `"+2"`, über dem Bogen), `color` (abwechselnd Akzent/blau), `hops: true` = in Einzelhüpfer zerlegen, `below: true` = Bogen unter der Linie (z. B. rückwärts). |
| `hopper` | `flo` | Wer hüpft: `"flo"`, ein Emoji (z. B. `"🐸"`) oder `"none"`. |
| `wide` | true | `false` = Strahl nur in der Bühne (sonst reicht er links bis unter Flo). |

```json
{"say": "Acht plus fünf. Erst hüpfe ich zwei bis zur Zehn. Dann noch drei.", "caption": "8 + 5 = 13",
 "visual": {"type": "zahlenstrahl", "from": 0, "to": 20, "bridge": 10, "start": 8,
   "jumps": [{"to": 10, "label": "+2", "at": 0.3, "hops": true}, {"to": 13, "label": "+3", "at": 0.7, "hops": true, "color": "blue"}]}}
```

### `rechnung` – Rechnung, die sich Schritt für Schritt aufbaut

Eine Zeile über `parts` oder mehrere Zeilen über `lines` (max. 3). Zahlen bekommen weiße Kärtchen, Zeichen nicht.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `parts` | – | Teile der Zeile: `["8", "+", "5", "=", "13"]`. |
| `at` | verteilt | Einblendzeit je Teil (gleich lang wie `parts`). |
| `box` | – | `true` = letztes Teil ist ein gestricheltes Lösungskästchen mit „?“, das zur `at`-Zeit die Lösung zeigt; oder Index des Teils. |
| `split` | – | Zerlegung unter einem Teil: `{"part": 2, "into": ["2", "3"], "at": 0.35}` (zwei Kreise mit Ästen). |
| `highlight` | – | Teile gelb hinterlegen: `[{"part": 0, "at": 0.5}]`. |
| `lines` | – | Mehrere Zeilen: `[{parts, at, box, split, highlight}, …]` (je Zeile dieselben Felder). Ohne `at` erscheinen die Zeilen nacheinander. |

```json
{"say": "Acht plus fünf. Die Fünf zerlege ich in zwei und drei. Das ergibt dreizehn.",
 "visual": {"type": "rechnung", "parts": ["8", "+", "5", "=", "13"], "at": [0, 0.05, 0.1, 0.75, 0.85], "box": true,
   "split": {"part": 2, "into": ["2", "3"], "at": 0.35}, "highlight": [{"part": 0, "at": 0.5}]}}
```

```json
{"visual": {"type": "rechnung", "lines": [{"parts": ["7", "+", "3", "=", "10"]}, {"parts": ["10", "+", "3", "=", "13"], "box": true}]}}
```

### `stellenwert` – Zehner und Einer (Z | E)

Stellenwerttafel mit Ziffern, Zehnerstangen und Einerpunkten.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `number` | 13 | Zahl 0–99. |
| `at` | `[0.1, 0.4]` | Einblendzeit `[Zehner, Einer]` – so lässt sich „wir sagen zuerst die Einer“ zeigen. |
| `bundles` | true | Stangen/Punkte unter den Ziffern. |
| `labels` | – | Schilder unter den Spalten: `{"tens": "zuerst schreiben", "ones": "zuerst sagen", "at": 0.6}`. |
| `tensTitle`, `onesTitle` | `Z  Zehner`, `E  Einer` | Spaltenköpfe. |

```json
{"say": "Wir sagen zuerst die Drei, aber wir schreiben zuerst die Eins für den Zehner.",
 "visual": {"type": "stellenwert", "number": 13, "at": [0.55, 0.1], "labels": {"tens": "zuerst schreiben", "ones": "zuerst sagen", "at": 0.6}}}
```

### `uhr` – Analoguhr

Die Zeiger laufen von `from` nach `time` (immer vorwärts); der kurze Zeiger wandert mit.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `time` (oder `to`) | `7:00` | Zielzeit `"H:MM"` (12-Stunden-Zifferblatt). |
| `from` | = `time` | Startzeit, z. B. `"7:00"` → `"7:30"` lässt den langen Zeiger nach unten laufen. |
| `at` | `[0.15, 0.6]` | Start und Ende der Zeigerbewegung. |
| `digital` | false | Digitalanzeige daneben. `hours24: true` zeigt 19:30 statt 7:30. |
| `highlight` | – | `"hour"` (kurzer Zeiger leuchtet) oder `"minute"` (langer). Zeigt ein Schild („kurz: Stunde“ / „lang: Minuten“, änderbar mit `handLabel`). |
| `marks` | – | Ziffern auf dem Zifferblatt hervorheben, z. B. `[12, 6]`. |
| `daytime` | – | `"day"` (☀️) oder `"night"` (🌙) neben der Uhr. |
| `icon` | – | Tätigkeits-Emoji neben der Uhr (z. B. `"🥣"`), `iconAt` (Standard: Ende der Bewegung). |
| `text` | – | Großes Schild, z. B. `"halb acht"`, `textAt`. |

```json
{"say": "Der lange Zeiger wandert nach unten zur Sechs. Es ist halb acht.",
 "visual": {"type": "uhr", "from": "7:00", "to": "7:30", "at": [0.1, 0.6], "digital": true, "highlight": "minute", "icon": "🥣", "text": "halb acht", "textAt": 0.7}}
```

### `geld` – Münzen und Scheine

Euro-Münzen (1, 2, 5, 10, 20, 50 ct; 1, 2 €) und Scheine (5, 10, 20, 50, 100 €) mit Wertaufdruck, in echten Größenverhältnissen.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `items` | – | Geldstücke: Zahl in Euro (`2`, `0.5` = 50 ct) oder `{"v": 5, "at": 0.3}`. |
| `price` | – | Ware mit Preisschild links: `{"e": "⚽", "v": 7, "label": "7 €", "at": 0}`. |
| `sum` | – | `true` = „= 7 €“ (Summe der `items`) erscheint; oder eigener Text, z. B. `"10 € − 7 € = 3 €"`. |
| `sumAt` | 0.8 | Einblendzeit der Summe. |
| `running` | false | Laufende Summe während die Münzen erscheinen. |
| `back` | – | Rückgeld-Reihe (gleiches Format wie `items`), mit Schild `backLabel` (Standard „zurück:“). |

```json
{"say": "Der Ball kostet sieben Euro. Ich lege fünf Euro und zwei Euro. Zusammen sieben Euro.",
 "visual": {"type": "geld", "price": {"e": "⚽", "v": 7}, "items": [{"v": 5, "at": 0.3}, {"v": 2, "at": 0.5}], "sum": true, "sumAt": 0.8}}
```

```json
{"visual": {"type": "geld", "price": {"e": "🍦", "v": 2}, "items": [5], "back": [{"v": 2, "at": 0.7}, {"v": 1, "at": 0.75}], "backLabel": "Rückgeld:"}}
```

### `silben` – Silbenbögen

Silben in Blau/Rot (Silbenmethode) erscheinen nacheinander, darunter schwingt je ein Bogen.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `syllables` | `[word]` | Silben, z. B. `["To", "ma", "te"]`. |
| `word` | zusammengesetzt | Ganzes Wort (für `merge`). |
| `at` | verteilt | Einblendzeit je Silbe (passend zu „To, ma, te“ im Sprechtext). |
| `colors` | blau, rot | Zwei Farben im Wechsel. |
| `clap` | false | 👏 über jeder Silbe beim Erscheinen. |
| `vowels` | false | Selbstlaute (a e i o u ä ö ü y) leuchten gelb ab `vowelsAt` (Standard 0.6) – „Silbenkönige“. |
| `picture` | – | Emoji links neben dem Wort, `pictureAt`. |
| `merge` | – | Zeit, zu der die Silben zum ganzen Wort zusammenrücken (Bögen verschwinden, Wort wird dunkel; `keepColors: true` behält die Farben). `mergeText` zeigt zusätzlich ein Schild. |
| `count` | – | Schild unter dem Wort, z. B. `"3 Silben"`, `countAt` (Standard 0.75). |

Das Wort steht immer an derselben Stelle (unabhängig von `clap`, `count`, `mergeText`) – so springt nichts beim
Anschluss mit `continue`.

```json
{"say": "Klatsch mit mir: To, ma, te. Drei Silben!",
 "visual": {"type": "silben", "word": "Tomate", "syllables": ["To", "ma", "te"], "at": [0.15, 0.3, 0.45], "clap": true,
   "vowels": true, "vowelsAt": 0.6, "picture": "🍅", "count": "3 Silben", "countAt": 0.8}}
```

### `buchstaben` – Laute / Buchstaben mit Anlautbildern

Je Laut eine Karte mit Buchstabe(n) und darunter das Anlautbild; am Ende verschmelzen sie zum Wort.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `letters` | – | `[{"l": "M", "pic": "🌙", "word": "Mond", "at": 0.1}]` – `l` Buchstabe(n) des Lauts (auch `au`, `sch`), `pic` Anlautbild, `word` Bildwort (Anlaut wird eingefärbt). Max. 5. |
| `boxes` | false | Leere gestrichelte Kästchen von Anfang an zeigen („drei Laute = drei Kästchen“). |
| `color` | lila | Rahmen-/Anlautfarbe. |
| `word` | – | Zielwort, erscheint zu `blendAt` groß unter den Karten (Bilder verschwinden). |
| `blendAt` | – | Zeitpunkt des Zusammenziehens. |
| `picture` | – | Bild zum Zielwort (erscheint kurz nach `blendAt`). |

```json
{"say": "M wie Mond, au wie Auto, s wie Sonne. Fertig: Maus!",
 "visual": {"type": "buchstaben", "boxes": true, "word": "Maus", "blendAt": 0.8, "picture": "🐭",
   "letters": [{"l": "M", "pic": "🌙", "word": "Mond"}, {"l": "au", "pic": "🚗", "word": "Auto"}, {"l": "s", "pic": "☀️", "word": "Sonne"}]}}
```

### `satz` – Satz-Zug

Der Satz fährt als Zug ein: erstes Wort in der Lok (großer Anfangsbuchstabe leuchtet), Wörter in Wagen,
Satzzeichen im gelben Schlusswagen.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `words` | – | Wörter ohne Satzzeichen (max. ≈ 5, ≤ 22 Buchstaben gesamt). |
| `end` | `.` | Schlusswagen: `.`, `?` oder `!`. |
| `at` | verteilt | Einblendzeit der Wörter. |
| `capital` | true | `false` = Anfangsbuchstabe der Lok nicht hervorheben. `capitalAt` (Standard 0.3). |
| `highlight` | – | Weitere Wörter, deren Anfangsbuchstabe leuchtet (Nomen): Indizes, z. B. `[2]`. `highlightAt` (Standard 0.55). |
| `endAt` | 0.75 | Zeit, zu der der Schlusswagen anhängt. |
| `labels` | – | Schilder unter Lok/Schlusswagen: `{"start": "groß", "end": "Punkt"}`. |

```json
{"say": "Vorne fährt die Lok mit dem großen Buchstaben. Am Ende kommt der Punkt.",
 "visual": {"type": "satz", "words": ["Flo", "spielt", "Ball"], "end": ".", "capitalAt": 0.2, "endAt": 0.75,
   "highlight": [2], "highlightAt": 0.5, "labels": {"start": "groß", "end": "Punkt"}}}
```

### `strasse` – Straße mit Zebrastreifen und Fußgängerampel

Eigene Vollbild-Kulisse (Häuser, Gehwege, Fahrbahn). Ein Kind steht am vorderen Bordstein. Rechtsverkehr:
Autos auf der **nahen** Spur kommen von **links**, auf der **fernen** Spur von **rechts**.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `light` | – | Fußgängerampel: `"red"`, `"green"` oder Wechsel `[{"state": "red", "at": 0}, {"state": "green", "at": 0.7}]`. Ohne `light` keine Ampel. |
| `zebra` | true | Zebrastreifen zeichnen. |
| `look` | – | Blickfolge des Kindes, z. B. `["left", "right", "left"]` – Kind dreht sich, Pfeil + „links“/„rechts“ (weicht der Ampel aus). |
| `lookAt` | verteilt | Zeiten je Blick. |
| `walk` | – | Zeit, zu der das Kind über den Zebrastreifen geht (dauert 2,2 s). |
| `child` | `🧒` | Emoji des Kindes; `childX` (Standard 470 px) Position. |
| `cars` | – | `[{"lane": "near" | "far", "at": 0.1, "until": 0.5, "stop": true, "e": "🚗"}]` – fährt durch oder hält (`stop`) vor dem Zebrastreifen. |
| `parked` | false | Zwei parkende Autos am vorderen Rand („zwischen parkenden Autos sieht dich niemand“). |
| `night` | false | Dunkel; Kind mit Lichtschein und Warnweste 🦺. |

```json
{"say": "Am Zebrastreifen bleibe ich stehen und schaue: links, rechts, und nochmal links.",
 "visual": {"type": "strasse", "light": [{"state": "red", "at": 0}, {"state": "green", "at": 0.85}],
   "look": ["left", "right", "left"], "lookAt": [0.45, 0.62, 0.8],
   "cars": [{"lane": "near", "at": 0.05, "stop": true}, {"lane": "far", "at": 0.2, "e": "🚌"}]}}
```

### `wasser` – Schwimmt oder sinkt?

Wasserbecken; Gegenstände warten oben und fallen nacheinander hinein, schwimmen (schaukeln an der Oberfläche) oder
sinken (mit Luftblasen) und bekommen ein Ergebnis-Schild.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `items` | – | `[{"e": "🪵", "result": "float" | "sink", "at": 0.3, "label": "Holz schwimmt", "size": 92}]` (max. 4). Ohne `label` steht „schwimmt“/„sinkt“ da. |
| `guess` | false | ❓ über den wartenden Gegenständen (Vermutung!). |
| `results` | true | `false` = keine Ergebnis-Schilder. |

```json
{"say": "Der Korken schwimmt. Der Stein sinkt. Und der Holzklotz schwimmt auch!",
 "visual": {"type": "wasser", "guess": true, "items": [{"e": "🍾", "result": "float", "label": "Korken: schwimmt", "at": 0.05},
   {"e": "🪨", "result": "sink", "at": 0.3}, {"e": "🪵", "result": "float", "at": 0.6}]}}
```

### `zahn` – Zähne putzen (KAI)

Großer Backenzahn (Querschnitt mit Zahnfleisch und Gesicht), Zahnbürste putzt die aktive Fläche, rechts die KAI-Liste
(Kauflächen, Außenflächen, Innenflächen; aktive hervorgehoben). Standard-Hintergrund `bathroom`.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `area` | `kau` | `kau` (hin und her oben), `aussen` (kleine Kreise außen), `innen` (vom Roten zum Weißen auswischen), `alle` (reihum). |
| `brushAt` | 0.1 | Ab wann die Bürste erscheint. |
| `dirt` | false | Gelbe Beläge, die während des Putzens verschwinden. |
| `clean` | – | Zeit für Glitzer ✨ (sauber!). |
| `timer` | – | Schild mit ⏱️, z. B. `"2 Minuten"`, `timerAt`. |

```json
{"say": "A wie Außenflächen: kleine Kreise, wie eine Schnecke.", "visual": {"type": "zahn", "area": "aussen", "dirt": true, "clean": 0.9, "timer": "2 Minuten"}}
```

### `liste` – Liste mit ✓ / ✗

Karten mit Emoji und Text gleiten nacheinander herein; optional grüner Haken oder oranges Kreuz.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `title` | – | Überschrift. |
| `items` | – | `[{"e": "🦺", "text": "Leuchtstreifen", "mark": "yes" | "no", "at": 0.3, "markAt": 0.4}]`. Bis 4 einspaltig, 5–8 zweispaltig. Text ≤ 18 Zeichen. |

```json
{"say": "Was hilft im Dunkeln? Helle Kleidung und Leuchtstreifen. Eine schwarze Jacke nicht.",
 "visual": {"type": "liste", "title": "Im Dunkeln", "items": [{"e": "👕", "text": "helle Kleidung", "mark": "yes"},
   {"e": "🦺", "text": "Leuchtstreifen", "mark": "yes"}, {"e": "🧥", "text": "schwarze Jacke", "mark": "no"}]}}
```

### `vergleich` – Zwei Seiten

Zwei Karten nebeneinander mit Zeichen oder Spiegel dazwischen (Verdoppeln, Halbieren, mehr/weniger, richtig/falsch-frei).

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `left`, `right` | – | `{e, n, items, text, label, mark, at, color}`: `e` + `n` = n gleiche Emojis (≤ 8), oder `items` = Liste verschiedener Emojis, oder `text` = großer Text (z. B. `"8"`, ≤ 9 Zeichen; ab 6 Zeichen kleiner); `label` Schild darunter (≤ 14 Zeichen); `mark` `"yes"`/`"no"` (✓/✗-Plakette); `at` Einblendzeit (rechts Standard 0.35); `color` Rahmenfarbe. |
| `mid` | – | Zeichen in der Mitte: `"="`, `"≠"`, `"<"`, `">"`, `"oder"`, `"→"` … (Wörter ab 3 Zeichen kleiner) oder `"mirror"` (Zauberspiegel; rechte Seite erscheint gespiegelt). |
| `midAt` | Mitte | Einblendzeit des Mittelzeichens. |

```json
{"say": "Drei Äpfel und im Spiegel noch drei. Das sind sechs.", "caption": "3 + 3 = 6",
 "visual": {"type": "vergleich", "mid": "mirror", "left": {"e": "🍎", "n": 3, "label": "3"}, "right": {"e": "🍎", "n": 3, "label": "noch 3", "at": 0.4}}}
```

```json
{"visual": {"type": "vergleich", "mid": "=", "left": {"e": "🍪", "n": 4, "label": "Flo"}, "right": {"e": "🍪", "n": 4, "label": "Eule"}}}
```

### `bild` – Große Bilder mit Schildern

Einfaches Zeigen von 1–5 Dingen, groß und zentriert (schaukeln leicht).

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `items` | – | `["🦔", {"e": "🐿️", "label": "Eichhörnchen", "at": 0.4, "size": 140, "n": 2}]` – `n` wiederholt das Emoji. |
| `size` | auto | Grundgröße in px (1 Bild: 200, 2: 160, 3: 130, mehr: 100). |

```json
{"say": "Der Storch fliegt in den warmen Süden.", "visual": {"type": "bild", "bg": "south", "items": [{"e": "🪿", "label": "Storch"}, {"e": "☀️", "label": "Süden", "at": 0.5}]}}
```

### `merke` – Merksatz-Karte

Goldene Karte „Merke!“ mit 1–4 Zeilen, die nacheinander erscheinen. Ideal als letzter Beat.

| Eigenschaft | Standard | Bedeutung |
|---|---|---|
| `lines` | – | Zeilen (≤ 26 Zeichen), `*x*` = Akzentfarbe. |
| `at` | verteilt | Einblendzeit je Zeile. |
| `icon` | `💡` | Emoji vor dem Titel. |
| `title` | `Merke!` | Kartentitel (z. B. „Mein Tipp:“). |

```json
{"say": "Mein Trick: Erst bis zur Zehn, dann den Rest!", "visual": {"type": "merke", "lines": ["Erst bis zur *10*,", "dann den Rest."]}}
```

---

## 5. Arbeitsweise für neue Filme

1. Skript schreiben (`films/<id>.json`), Beats aus dem Lehrplan (curriculum V1–V12).
2. `node stills.mjs --film films/<id>.json` → Standbilder in `out/stills/` ansehen (schnell, ohne TTS). Layout korrigieren.
3. `node render.mjs <id>` → Film + Poster. Stichproben ansehen: `ffmpeg -ss 12 -i ../../videos/<id>.mp4 -frames:v 1 out/f.png`.
4. `node build-films-data.mjs` → `js/data/films.js` aktualisiert (mit echter Dauer und Quiz-Sprungzeiten).
5. Neue App-Sprechtexte (Intro/Quiz) stehen in `tools/video/speech-texts.json` (Format wie `tools/speech-texts.json`).
   Für die Aufnahme diese Datei zusätzlich an `tools/build-voice.js jobs --in=…` und `pack --in=…` übergeben
   (bei `pack` immer **alle** bisherigen Eingabedateien mitgeben, sonst gehen Aufnahmen verloren).

Dateien: `src/visuals/*.tsx` (Visual-Komponenten), `src/visuals/index.ts` (Typ-Register),
`src/components/` (Flo, Hintergründe, Untertitel), `src/FloExplainer.tsx` (Beat-Ablauf), `examples.json`
(alle Beispiele oben, Testgrundlage für `stills.mjs`). Git-ignoriert: `node_modules/`, `out/`, `.cache/`, `public/narr/`, `public/fonts/`.

## 6. Bekannte Grenzen

- Emojis sehen auf allen Geräten gleich aus (im Video eingebrannt), aber es gibt nicht für jedes Ding eins.
- Text wird nicht automatisch umbrochen/verkleinert, wo das Layout feste Größen hat (Zug-Wagen, Listen, Merke-Zeilen):
  kurze Texte verwenden und mit `stills.mjs` prüfen.
- Die Uhr kennt nur das 12-Stunden-Zifferblatt; Zeiger laufen immer vorwärts.
- Die TTS-Aussprache einzelner Laute („Mmm“, „sss“) ist nicht immer perfekt – ggf. umformulieren und neu rendern
  (alte WAVs in `public/narr/<id>/` mit dem passenden Beat-Index löschen oder Text ändern).
