/* ==========================================================================
   Spiel „Flos Klangspiel“ 🎹 – auditiv-visuelles Arbeitsgedächtnis
   (Simon-Prinzip).

   Didaktik:
   - Vier große, farbige Felder mit je einem Tier und einem eigenen Ton
     (Wal = tiefer Ton … Küken = hoher Ton: Tongröße passt zur Tiergröße,
     das hilft beim Merken). Die Töne bilden einen Dur-Dreiklang – es klingt
     immer schön, auch beim Ausprobieren.
   - Flo spielt eine Folge vor (Feld leuchtet + Ton), das Kind spielt nach.
     Doppelte Kodierung (Farbe/Tier + Ton) unterstützt Kinder, die eher
     visuell oder eher auditiv lernen; die Tiernamen geben eine sprachliche
     Merkhilfe („Wal, Frosch, Küken“).
   - Hilfe-Leiter: 1. Fehler → Flo benennt das angetippte Tier und sagt, an
     welcher Stelle es nicht passt, dann spielt er die Folge nochmal vor;
     2. Fehler → Merkstrategie: „Sag die Tiernamen leise mit“ – Flo spielt
     vor und spricht die Namen dazu (sprachliches Kodieren);
     3. Fehler → geführtes Nachspielen: Das nächste Feld leuchtet sanft auf,
     bevor das Kind tippt – so endet jede Aufgabe mit Erfolg.
   - Lerninhalt = die Merkspanne (Schlüssel '4 Töne', ctx.track); die Länge
     folgt ctx.taskLevel, passt sich also innerhalb der Runde an.
   - Jederzeit „Nochmal anhören“ (👂) ohne Fehlerwertung – kein Zeitdruck.
   - Stufen: 2 → 3 → 4 → 5 → 6 Töne (Merkspanne von Vorschulkindern liegt
     typischerweise bei 3–5 Elementen).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* Felder: Farbe, Tier, Ton (von tief nach hoch) */
  const PADS = [
    { id: 'wal', e: '🐳', name: 'der Wal', short: 'Wal', note: 'C4', color: '#3b8beb', light: '#a9d1ff' },
    { id: 'frosch', e: '🐸', name: 'der Frosch', short: 'Frosch', note: 'E4', color: '#35b85a', light: '#a8f0bb' },
    { id: 'kaefer', e: '🐞', name: 'der Marienkäfer', short: 'Marienkäfer', note: 'G4', color: '#ec4b4b', light: '#ffb4b4' },
    { id: 'kueken', e: '🐥', name: 'das Küken', short: 'Küken', note: 'C5', color: '#8e5bd6', light: '#dcc8ff' }, // lila: gelbes Küken auf Gelb war kaum zu sehen
  ];

  const LEVELS = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };

  /** Zufallsfolge ohne direkte Wiederholung (ein Feld zweimal hintereinander
      ist für Vorschulkinder schwer zu erkennen) */
  function makeSequence(len) {
    const seq = [];
    while (seq.length < len) {
      const k = U.rand(PADS.length);
      if (seq.length && seq[seq.length - 1] === k) continue;
      seq.push(k);
    }
    return seq;
  }

  let introduced = false; // Tiere einmal pro Sitzung vorstellen

  LT.registerGame({
    id: 'toene-merken',
    area: 'denken',
    title: 'Flos Klangspiel',
    icon: '🎹',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Hör- und Merkfähigkeit (Arbeitsgedächtnis)',
      goal: 'Ihr Kind merkt sich eine Folge aus Tönen und Farben und spielt sie in der richtigen Reihenfolge nach. Das trainiert das Arbeitsgedächtnis, genaues Zuhören und Konzentration – wichtige Grundlagen für Lesen, Rechnen und das Befolgen von Anweisungen.',
      levels: ['2 Töne nachspielen', '3 Töne nachspielen', '4 Töne nachspielen', '5 Töne nachspielen', '6 Töne nachspielen – für echte Gedächtnis-Profis'],
      tip: 'Klatsch- und Klopfspiele: Klopfen Sie einen kurzen Rhythmus vor und lassen Sie Ihr Kind nachklopfen. Oder: „Ich packe meinen Koffer und nehme mit …“',
    },

    async task(ctx) {
      const len = LEVELS[ctx.taskLevel] || 2;
      const seq = makeSequence(len);
      // Lerninhalt: die Merkspanne (keine festen Folgen – die sind zufällig)
      ctx.track(`${len} Töne`);

      // --- Spielfeld ---
      const board = el('div.tm-board');
      const pads = PADS.map((p, k) => {
        const b = el('button.tm-pad', {
          type: 'button',
          'aria-label': p.short,
          style: { '--pad': p.color, '--pad-light': p.light },
        }, U.emoji(p.e, 'tm-animal'));
        b._k = k;
        board.appendChild(b);
        return b;
      });
      const progress = el('div.tm-progress', { 'aria-hidden': 'true' });
      const pips = seq.map(() => progress.appendChild(el('span.tm-pip')));
      const replay = LT.ui.button('Nochmal anhören', () => { if (!busy) playSequence(); }, { icon: '👂', cls: 'tm-replay' });
      ctx.stage.appendChild(progress);
      // Querformat: „Nochmal anhören“ rechts neben dem Spielfeld (per CSS)
      ctx.stage.appendChild(el('div.tm-main', board, replay));

      let busy = true;
      let pos = 0;          // nächste erwartete Stelle
      let errors = 0;
      let guided = false;   // nach 3 Fehlern: nächstes Feld wird angezeigt
      let named = false;    // ab dem 2. Fehler: Flo sagt die Tiernamen beim Vorspielen
      let done = null;
      const finished = new Promise((r) => { done = r; });

      /** Feld aufleuchten lassen + Ton */
      async function flash(k, ms = 520) {
        const b = pads[k];
        b.classList.add('lit');
        LT.sfx.tone(PADS[k].note, ms / 1000 + 0.1, { type: 'triangle', volume: 0.55 });
        await ctx.sleep(ms);
        b.classList.remove('lit');
      }

      function setPips() {
        pips.forEach((p, i) => p.classList.toggle('on', i < pos));
      }

      function clearMarks() {
        pads.forEach((b) => { ctx.markTest(b, false); b.classList.remove('tm-guide'); });
      }
      function showNext() {
        clearMarks();
        const b = pads[seq[pos]];
        ctx.markTest(b);
        if (guided) b.classList.add('tm-guide');
      }

      async function playSequence() {
        busy = true;
        clearMarks();
        pos = 0;
        setPips();
        replay.disabled = true;
        board.classList.add('tm-listening');
        await ctx.sleep(450);
        for (const k of seq) {
          if (!ctx.active) return;
          if (named) {
            // Merkstrategie: Ton + Tiername gleichzeitig
            await Promise.all([flash(k, 560), ctx.say(PADS[k].short + '.')]);
            await ctx.sleep(150);
          } else {
            await flash(k, len > 4 ? 480 : 560);
            await ctx.sleep(len > 4 ? 200 : 260);
          }
        }
        if (!ctx.active) return;
        board.classList.remove('tm-listening');
        replay.disabled = false;
        busy = false;
        showNext();
      }

      // --- Tiere vorstellen (einmal) ---
      if (!introduced) {
        await ctx.say('Das sind meine Musik-Tiere. Jedes Tier hat seinen eigenen Ton.');
        for (let k = 0; k < PADS.length; k++) {
          if (!ctx.active) return;
          pads[k].classList.add('lit');
          LT.sfx.tone(PADS[k].note, 0.5, { type: 'triangle', volume: 0.55 });
          await ctx.say(U.cap(PADS[k].name) + '.');
          pads[k].classList.remove('lit');
          await ctx.sleep(120);
        }
        // erst nach vollständiger Vorstellung merken (Abbruch mittendrin → beim nächsten Mal nochmal)
        if (ctx.active) introduced = true;
      }
      if (!ctx.active) return;
      await ctx.instruct(len === 2
        ? 'Hör gut zu und schau genau hin! Dann tippst du die zwei Tiere in derselben Reihenfolge an.'
        : `Hör gut zu und schau genau hin! Merk dir ${U.numberWord(len)} Töne und spiel sie mir nach.`);
      await playSequence();

      // --- Nachspielen ---
      pads.forEach((b) => {
        b.addEventListener('click', async () => {
          if (busy || !ctx.active) return;
          const k = b._k;
          if (k === seq[pos]) {
            busy = true;
            clearMarks();
            await flash(k, 300);
            pos++;
            setPips();
            if (pos >= seq.length) {
              const names = seq.map((i) => PADS[i].short).join(', ');
              await ctx.correct(board, {
                say: errors === 0 && U.chance(0.3)
                  ? 'Super, du hast genau zugehört und dir die Reihenfolge gemerkt!'
                  : len <= 3 ? `Super! ${names}. Genau richtig!` : `Super! Du hast dir alle ${U.numberWord(len)} Töne gemerkt!`,
              });
              done();
              return;
            }
            busy = false;
            showNext();
          } else {
            busy = true;
            clearMarks();
            errors++;
            LT.ui.animate(b, 'shake');
            // Hilfe-Leiter: 1 erklären · 2 Merkstrategie · 3 geführt nachspielen
            let say;
            if (errors === 1) say = `Das war ${PADS[k].name}. ${pos === 0 ? 'Zuerst kommt ein anderes Tier.' : 'An dieser Stelle kommt ein anderes Tier.'} Hör nochmal genau zu.`;
            else if (errors === 2) say = 'Tipp: Sag die Tiernamen leise mit, dann merkst du sie dir besser. Hör zu.';
            else if (errors === 3) say = 'Ich helfe dir. Hör nochmal zu. Danach zeige ich dir, wohin du tippst.';
            else say = 'Hör nochmal zu.';
            await ctx.wrong(null, { say });
            if (!ctx.active) return;
            if (errors >= 2) named = true;
            if (errors >= 3) { guided = true; ctx.modelShown = true; }
            await playSequence();
          }
        });
      });

      // Freies Ausprobieren erlaubt Flo nicht während des Vorspielens:
      // Klicks werden dann ignoriert (busy).
      await finished;
    },
  });
})();
