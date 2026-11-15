/* ==========================================================================
   LT.films – Erklärfilme für „Flos Kino“ (Klasse 1).

   HINWEIS: Diese Datei wird später von der Video-Pipeline neu erzeugt.
   Hier steht nur das Schema mit EINEM Beispiel-Eintrag.

   Schema je Film:
   {
     id:       'kraft-der-zehn',              // Spiel-ID wird 'film-' + id
     title:    'Die Kraft der Zehn',
     icon:     '🔟',
     subject:  'mathe1' | 'deutsch1' | 'sach1',
     src:      'videos/kraft-der-zehn.mp4',   // relativer Pfad (geht auch per file://)
     poster:   'videos/kraft-der-zehn.jpg',
     duration: 92,                            // Sekunden
     related:  ['zehnerfeld'],                // Spiele zum Üben danach
     parent:   'Ein Satz für die Eltern.',
     intro:    'Gesprochene Einleitung vor dem Film.',
     quiz: [{
       q:       'Frage (wird vorgelesen und gezeigt)',
       options: [{ text: 'gezeigter Text oder Emoji', say: 'gesprochenes Label', correct: true|false }],
       explain: 'Erklärung nach einer falschen Antwort (verrät die Lösung nicht)',
       model:   'gesprochene Musterlösung',
       hint:    'optional: Denkanstoß (ab vier Antworten)',
       at:      40,                           // optional: Sekunde für „Nochmal ansehen“
       key:     'optional: kurzer Schlüssel für den Lernstand'
     }]
   }
   Gesprochene Texte: Zahlen als Wörter, keine Ziffern oder Rechenzeichen.
   ========================================================================== */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});
  LT.films = [
    {
      id: 'kraft-der-zehn',
      title: 'Die Kraft der Zehn',
      icon: '🔟',
      subject: 'mathe1',
      src: 'videos/kraft-der-zehn.mp4',
      poster: 'videos/kraft-der-zehn.jpg',
      duration: 92,
      related: ['zehnerfeld', 'zahlen-nachbarn'],
      parent: 'Zahlen von elf bis zwanzig als einen Zehner und Einer verstehen: Bündeln statt einzeln abzählen ist die Grundlage für das Rechnen im Zwanzigerraum.',
      intro: 'Im Film zeige ich dir einen Rechen-Trick mit Zehnern. Schau gut zu! Danach habe ich drei Fragen für dich.',
      quiz: [
        {
          key: 'Einer der 15',
          q: 'Wie viele Einer hat die Fünfzehn?',
          options: [
            { text: '1', say: 'eins', correct: false },
            { text: '5', say: 'fünf', correct: true },
            { text: '15', say: 'fünfzehn', correct: false },
          ],
          explain: 'Schau mal: Bei fünfzehn ist eine Schachtel voll. Wie viele Eicheln liegen noch daneben?',
          model: 'Fünfzehn sind ein Zehner und fünf Einer. Die Fünf sind die Einer.',
          at: 45,
        },
        {
          key: 'Zehner und 4',
          q: 'Eine volle Schachtel und vier Eicheln. Wie viele sind das?',
          options: [
            { text: '14', say: 'vierzehn', correct: true },
            { text: '41', say: 'einundvierzig', correct: false },
            { text: '5', say: 'fünf', correct: false },
          ],
          explain: 'Fast! In einer vollen Schachtel sind zehn Eicheln. Zehn und noch vier dazu.',
          model: 'Zehn und vier sind vierzehn. Wir schreiben zuerst die Eins für den Zehner.',
          at: 30,
        },
        {
          key: 'Zehner-Schachtel',
          q: 'Wie viele Eicheln passen in eine volle Zehner-Schachtel?',
          options: [
            { text: '5', say: 'fünf', correct: false },
            { text: '10', say: 'zehn', correct: true },
            { text: '20', say: 'zwanzig', correct: false },
          ],
          explain: 'Schau mal auf den Namen: Zehner-Schachtel.',
          model: 'In eine volle Zehner-Schachtel passen genau zehn Eicheln.',
          at: 20,
        },
      ],
    },
  ];
})();
