# Sternentasten

Ein Klavier-Kachel-Rhythmusspiel für Kinder, komplett in einer HTML-Datei (kein Build, keine Abhängigkeiten).
Einfach `index.html` im Browser öffnen – funktioniert auf Handy, Tablet und Computer.

- Bunte Tasten fallen in vier Spuren herunter; jede getippte Taste spielt den nächsten Ton des Lieds.
- Lange Tasten gedrückt halten, goldene Sterntasten bringen Extrapunkte.
- 3 Sterne pro Lied, danach schnellere Runden für bis zu 3 Kronen.
- Jedes Lied hat echte Notenlängen, Pausen und sein Originaltempo: Abstände der Tasten entsprechen dem Rhythmus,
  kurze Töne sind kürzere Tasten, ab einer halben Note wird eine schwarze Halte-Taste daraus.
- Tempo-Schieberegler in Prozent vom Originaltempo (50 % „Schnecke" bis 150 % „Rakete"); die Schwierigkeit legt die
  Herzen fest (Leicht 5, Mittel 3, Profi 1) und setzt ein passendes Starttempo.
- Tasten-Form wählbar: Vierecke, Pfoten oder Herzen.
- Alle Tasten sind schlichte schwarze Streifen ohne Beschriftung; Bonus-Tasten tragen einen goldenen Stern.
- Regenbogen-Power ab 20er-Kombo (doppelte Punkte); Notennamen (C D E … H) lassen sich optional einschalten.
- 15 Farbwelten (Hintergrund und Glitzer-Effekte), die mit gesammelten Sternen freigeschaltet werden; Fortschritt wird lokal gespeichert.
- 32 Lieder in sechs Genres: Kinderlieder, Weihnachten und Klassik (gemeinfrei) sowie Pop, Party & EDM und
  Chillen & Träumen (eigene Kompositionen mit Beat und Basslinie).
- Töne, Beat und Bass werden live mit der Web Audio API erzeugt.
- Lange Tasten sind fertig, sobald ihr oberes Ende beim Finger ankommt, und dürfen noch getroffen werden,
  solange ihre obere Hälfte zu sehen ist.

Steuerung am Computer: `D` `F` `J` `K`, Pause mit der Leertaste.
