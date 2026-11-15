/* ==========================================================================
   Spiel „Satzbaumeister“ 🚂 (Leseschule, Klasse 1) – Satz-Züge bauen

   Didaktik (Sprache untersuchen, Klasse 1):
   - Ein Satz ist ein Zug: vorne die Lok, dann die Wort-Wagen, hinten der
     Schlusswagen mit Punkt oder Fragezeichen. Der Zug fährt nur, wenn alles
     stimmt: richtige Reihenfolge, großer Satzanfang, passendes Satzzeichen.
   - Bedienung: Wortkarte antippen → sie wird vorgelesen und fährt in den
     nächsten freien Wagen. Wagen antippen → Wort geht zurück. Ist der Zug
     voll, prüft Flo automatisch.
   - Stufen:
       1  3 Wörter mit Bild, Satzanfang groß vorgegeben, Punkt schon da
          (Brücke aus der Vorschule: Wer? tut was? was?)
       2  4–5 Wörter mit Bild (auch mit „im Garten“, „einen Apfel“);
          mehrere richtige Reihenfolgen werden angenommen
       3  Satzzeichen wählen: Punkt oder Fragezeichen? (Erzählsatz,
          Ja/Nein-Frage, W-Frage). Melodie hören über 🔊 (adaptiv)
       4  im Wechsel (Namenwörter zuerst):
          a) Namenwörter finden und groß machen: Satz steht klein im Zug,
             Kind tippt die Namenwörter an; Artikelprobe „der Hund? Passt!“
          b) Frage oder Erzählsatz selbst bauen – aus DENSELBEN Wörtern. Karten
             sind klein (außer Namenwörtern); an der Lok wird das erste Wort
             groß. Satzzeichen-Karte selbst anhängen. Umstandswort vorne
             („Heute scheint die Sonne.“) wird über alt mit angenommen.
       5  Fehler finden: In jedem Zug steckt ein Fehler (kleiner Satzanfang,
          Namenwort klein, Tunwort groß, falsches Satzzeichen) → antippen.
   - Fehlvorstellungen: „Alles groß“ oder „nur vorne groß“ (auch Namenwörter
     sind groß), Satzzeichen vergessen, Frage = nur Stimme hoch (Tunwort
     nach vorne!), Wortsalat ohne Sinn-Probe.
   - Hilfe-Leiter (Bauen): 1. Flo liest den gebauten Satz vor („Klingt das
     richtig?“) + gezielter Denkanstoß, falsche Wagen fahren zurück,
     2. nächste passende Karte leuchtet + Strategie, 3. Flo spricht den Satz
     vor und zeigt Karte für Karte.
   - Lerninhalte (ctx.item): der richtige Satz, z. B. „Flo isst Eis.“ oder
     „Isst Flo Eis?“; Stufe 4a Satz + „/ Namenwörter“; Stufe 5 Satz + Fehlerart
     („Der Hund bellt. / Namenwort“).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const cap = (s) => U.cap(s);
  const low = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const isNounBase = (w) => w.charAt(0) !== w.charAt(0).toLowerCase(); // groß in der Grundform = Namenwort/Name
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const vary = (key, list) => U.pickFresh('sat-' + key, list, Math.min(2, list.length - 1));
  const PNAME = { '.': 'Punkt', '?': 'Fragezeichen' };

  /* ---------------- Satz-Daten ----------------
     w: Wörter in Grundform (wie mitten im Satz; Namenwörter groß)
     alt: weitere richtige Reihenfolgen, e: Bild */
  const L1 = [
    { w: ['Flo', 'isst', 'Eis'], e: '🤖🍦' },
    { w: ['Mia', 'malt', 'Blumen'], e: '👧🎨🌷' },
    { w: ['Ben', 'liest', 'Bücher'], e: '👦📚' },
    { w: ['Oma', 'backt', 'Kuchen'], e: '👵🎂' },
    { w: ['Papa', 'kocht', 'Suppe'], e: '👨🍲' },
    { w: ['die', 'Katze', 'schläft'], e: '🐱💤' },
    { w: ['der', 'Hund', 'bellt'], e: '🐶💬' },
    { w: ['Mama', 'trinkt', 'Tee'], e: '👩☕' },
    { w: ['Opa', 'liest', 'Zeitung'], e: '👴📰' },
    { w: ['die', 'Sonne', 'scheint'], e: '☀️' },
    { w: ['der', 'Vogel', 'singt'], e: '🐦🎶' },
    { w: ['Lea', 'spielt', 'Ball'], e: '👧⚽' },
    { w: ['das', 'Baby', 'lacht'], e: '👶😄' },
    { w: ['Tim', 'fährt', 'Rad'], e: '👦🚲' },
    { w: ['Flo', 'mag', 'Äpfel'], e: '🤖🍎' },
  ];
  const L2 = [
    { w: ['die', 'Kuh', 'frisst', 'Gras'], e: '🐄🌱' },
    { w: ['Ben', 'spielt', 'im', 'Garten'], e: '👦🌳', alt: [['im', 'Garten', 'spielt', 'Ben']] },
    { w: ['der', 'Fisch', 'schwimmt', 'im', 'Teich'], e: '🐟💧', alt: [['im', 'Teich', 'schwimmt', 'der', 'Fisch']] },
    { w: ['Mia', 'isst', 'einen', 'Apfel'], e: '👧🍎' },
    { w: ['Oma', 'strickt', 'eine', 'Mütze'], e: '👵🧶' },
    { w: ['das', 'Pferd', 'läuft', 'schnell'], e: '🐎💨', alt: [['schnell', 'läuft', 'das', 'Pferd']] },
    { w: ['Flo', 'baut', 'einen', 'Turm'], e: '🤖🧱' },
    { w: ['die', 'Kinder', 'gehen', 'zur', 'Schule'], e: '🧒🏫', alt: [['zur', 'Schule', 'gehen', 'die', 'Kinder']] },
    { w: ['Papa', 'wäscht', 'das', 'Auto'], e: '👨🚗' },
    { w: ['Lea', 'trinkt', 'warme', 'Milch'], e: '👧🥛' },
    { w: ['der', 'Igel', 'schläft', 'im', 'Laub'], e: '🦔🍂', alt: [['im', 'Laub', 'schläft', 'der', 'Igel']] },
    { w: ['Tim', 'malt', 'ein', 'rotes', 'Haus'], e: '👦🖍️🏠' },
    { w: ['die', 'Ente', 'schwimmt', 'im', 'See'], e: '🦆🌊', alt: [['im', 'See', 'schwimmt', 'die', 'Ente']] },
    { w: ['Mama', 'liest', 'ein', 'Buch'], e: '👩📖' },
    { w: ['der', 'Bär', 'mag', 'Honig'], e: '🐻🍯' },
    { w: ['die', 'Maus', 'frisst', 'den', 'Käse'], e: '🐭🧀' },
  ];
  // Stufe 3 und 5: Erzählsätze und Fragen (t = Satzzeichen)
  const L3 = [
    { w: ['Flo', 'spielt', 'Fußball'], t: '.' },
    { w: ['die', 'Katze', 'liegt', 'auf', 'dem', 'Sofa'], t: '.' },
    { w: ['heute', 'regnet', 'es'], t: '.' },
    { w: ['Mia', 'hat', 'einen', 'Hund'], t: '.' },
    { w: ['der', 'Hase', 'frisst', 'eine', 'Möhre'], t: '.' },
    { w: ['wir', 'gehen', 'in', 'den', 'Zoo'], t: '.' },
    { w: ['ich', 'kann', 'schon', 'lesen'], t: '.' },
    { w: ['Oma', 'kommt', 'morgen'], t: '.' },
    { w: ['wo', 'ist', 'mein', 'Ball'], t: '?' },
    { w: ['spielst', 'du', 'mit', 'mir'], t: '?' },
    { w: ['was', 'frisst', 'der', 'Hase'], t: '?' },
    { w: ['kommt', 'Oma', 'heute'], t: '?' },
    { w: ['wie', 'heißt', 'du'], t: '?' },
    { w: ['hast', 'du', 'Hunger'], t: '?' },
    { w: ['wer', 'klopft', 'an', 'die', 'Tür'], t: '?' },
    { w: ['magst', 'du', 'Erdbeeren'], t: '?' },
  ];
  const W_WORDS = ['wo', 'was', 'wie', 'wer', 'wann', 'warum'];
  // Stufe 4: Erzählsatz w, Tunwort an Stelle v → Frage = Tunwort nach vorne
  const L4 = [
    { w: ['Flo', 'isst', 'Eis'], v: 1, e: '🤖🍦' },
    { w: ['Mia', 'malt', 'ein', 'Bild'], v: 1, e: '👧🎨' },
    { w: ['der', 'Hund', 'bellt'], v: 2, e: '🐶' },
    { w: ['die', 'Katze', 'schläft'], v: 2, e: '🐱💤' },
    { w: ['Ben', 'hat', 'Hunger'], v: 1, e: '👦🍽️' },
    { w: ['Oma', 'backt', 'Kuchen'], v: 1, e: '👵🎂' },
    { w: ['du', 'kommst', 'mit'], v: 1, e: '🧒👋' },
    { w: ['das', 'Baby', 'lacht'], v: 2, e: '👶😄' },
    { w: ['Lea', 'mag', 'Pizza'], v: 1, e: '👧🍕' },
    // alt: weitere richtige Reihenfolgen (Umstandswort vorne) je Modus
    { w: ['der', 'Bus', 'kommt', 'gleich'], v: 2, e: '🚌',
      alt: { s: [['gleich', 'kommt', 'der', 'Bus']], q: [['kommt', 'gleich', 'der', 'Bus']] } },
    { w: ['Papa', 'liest', 'ein', 'Buch'], v: 1, e: '👨📖' },
    { w: ['die', 'Sonne', 'scheint', 'heute'], v: 2, e: '☀️',
      alt: { s: [['heute', 'scheint', 'die', 'Sonne']], q: [['scheint', 'heute', 'die', 'Sonne']] } },
    { w: ['Tim', 'spielt', 'Fußball'], v: 1, e: '👦⚽' },
    { w: ['der', 'Igel', 'schläft', 'schon'], v: 2, e: '🦔💤',
      alt: { s: [['schon', 'schläft', 'der', 'Igel']], q: [['schläft', 'schon', 'der', 'Igel']] } },
  ];
  // Stufe 4 (Namenwörter): kein Name, kein Namenwort am Satzanfang, keine Wörter, die es
  // auch als Namenwort gibt (lesen/das Lesen) – sonst führt die Artikelprobe in die Irre.
  const L4N = [
    { w: ['der', 'Hund', 'holt', 'den', 'Ball'], e: '🐶⚽' },
    { w: ['die', 'Katze', 'trinkt', 'Milch'], e: '🐱🥛' },
    { w: ['das', 'Kind', 'malt', 'eine', 'Blume'], e: '🧒🖍️🌼' },
    { w: ['der', 'Vogel', 'sitzt', 'auf', 'dem', 'Baum'], e: '🐦🌳' },
    { w: ['die', 'Maus', 'frisst', 'Käse'], e: '🐭🧀' },
    { w: ['der', 'Junge', 'isst', 'einen', 'Apfel'], e: '👦🍎' },
    { w: ['das', 'Pferd', 'steht', 'im', 'Stall'], e: '🐎🏠' },
    { w: ['die', 'Kuh', 'frisst', 'Gras'], e: '🐄🌱' },
    { w: ['der', 'Hase', 'hüpft', 'über', 'die', 'Wiese'], e: '🐰🌼' },
    { w: ['ich', 'sehe', 'einen', 'Igel'], e: '👀🦔' },
    { w: ['die', 'Ente', 'schwimmt', 'im', 'Teich'], e: '🦆💧' },
    { w: ['der', 'Bär', 'sucht', 'Honig'], e: '🐻🍯' },
    { w: ['die', 'Sonne', 'scheint', 'auf', 'das', 'Haus'], e: '☀️🏠' },
    { w: ['das', 'Baby', 'hat', 'einen', 'Teddy'], e: '👶🧸' },
    { w: ['der', 'Mond', 'leuchtet'], e: '🌙' },
    { w: ['wir', 'bauen', 'einen', 'Schneemann'], e: '🧒⛄' },
  ];
  const BEGLEITER = ['der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen'];
  const DISTRACT = ['Hund', 'Ball', 'Baum', 'Mond', 'schnell', 'rot', 'Hose', 'liest', 'Schuh', 'klein'];

  const sentenceOf = (words, t) => words.map((w, i) => (i === 0 ? cap(w) : w)).join(' ') + (t || '.');
  const spoken = (words, t) => sentenceOf(words, t);

  // Stufe 4: beide Varianten als eigene Lerninhalte
  const L4POOL = [];
  L4.forEach((x) => {
    const q = [x.w[x.v]].concat(x.w.filter((_, i) => i !== x.v));
    const alt = x.alt || {};
    L4POOL.push({ mode: 's', w: x.w, alt: alt.s, t: '.', e: x.e, key: sentenceOf(x.w, '.'), cards: x.w, verb: x.w[x.v] });
    L4POOL.push({ mode: 'q', w: q, alt: alt.q, t: '?', e: x.e, key: sentenceOf(q, '?'), cards: x.w, verb: x.w[x.v] });
  });
  // Stufe 5: Sätze aus Stufe 2 und 3
  const L5 = L2.map((x) => ({ w: x.w, t: '.' })).concat(L3);

  /* ---------------- Stufen ---------------- */
  const KIND = (l) => (l <= 2 ? 'build' : l === 3 ? 'punct' : l === 4 ? 'qa' : 'fix');
  const lvOf = (ctx) => (KIND(ctx.taskLevel) === KIND(ctx.level) ? ctx.taskLevel : ctx.level);

  const INTRO = {
    1: 'Wir bauen Satzzüge! Tipp die Wörter in der richtigen Reihenfolge an. Das Bild hilft dir. Dann fährt der Zug los.',
    2: 'Jetzt werden die Züge länger. Vier oder fünf Wörter! Lies jedes Wort genau. Frag dich: Wer tut etwas?',
    3: 'Jeder Satz braucht hinten einen Schlusswagen. Erzählt der Satz etwas, kommt ein Punkt. Fragt der Satz etwas, kommt ein Fragezeichen.',
    '4n': 'Namenwörter schreiben wir groß. Das sind Menschen, Tiere, Pflanzen und Dinge. Mach die Probe: Passt der, die oder das davor? Hör mal: der Hund. Das passt! Also schreiben wir Hund groß.',
    4: 'Jetzt baust du selbst Fragen und Erzählsätze. Bei einer Frage steht das Tunwort ganz vorne. Vergiss den Schlusswagen nicht!',
    5: 'Oh je! In jedem Zug hat sich ein Fehler versteckt. Lies genau und tipp auf den Wagen mit dem Fehler.',
  };
  let introduced = new Set();
  let capExplained = false;

  /* ---------------- Zug-Bausteine ---------------- */
  function lok() {
    return el('div.sat-lok', { 'aria-hidden': 'true' }, U.emoji('🚂', 'sat-lok-emoji'));
  }
  function wagonEl(cls) {
    return el('button.sat-wagon' + (cls ? '.' + cls : ''), { type: 'button' }, el('span.sat-wtxt'));
  }
  function setWagon(w, text) {
    w.querySelector('.sat-wtxt').textContent = text || '';
    w.classList.toggle('sat-filled', !!text);
  }

  /* ==========================================================================
     Bauen (Stufe 1, 2, 4)
     ========================================================================== */
  async function buildTask(ctx, level) {
    let target;
    let valid;
    let cardWords;
    let mode = null;
    let picture;
    if (level <= 2) {
      target = ctx.item(level === 1 ? L1 : L2, (x) => sentenceOf(x.w, '.'), { avoid: 5 });
      valid = [target.w].concat(target.alt || []);
      cardWords = target.w.slice();
      picture = target.e;
    } else {
      let pool = L4POOL;
      if (ctx.flow < 0) pool = L4POOL.filter((x) => x.w.length === 3);
      target = ctx.item(pool, (x) => x.key, { avoid: 5 });
      mode = target.mode;
      valid = [target.w].concat(target.alt || []);
      cardWords = target.cards.slice();
      picture = target.e;
    }
    const tgt = target.t || '.';
    const n = target.w.length;
    // Karten-Beschriftung: Stufe 1–2 mit großem Satzanfang (Brücke), Stufe 4 in Grundform
    const firstWords = new Set(valid.map((v) => v[0]));
    const label = (w) => (level <= 2 && firstWords.has(w) && w === target.w[0] ? cap(w) : w);
    const extra = (level === 2 && ctx.flow > 0)
      ? U.pick(DISTRACT.filter((d) => !cardWords.includes(d))) : null;

    /* --- Aufbau --- */
    const top = el('div.sat-top');
    const pic = el('div.sat-pic', { 'aria-hidden': 'true' }, picture);
    top.appendChild(pic);
    if (mode) {
      top.appendChild(el('div.sat-mode.sat-mode-' + mode, el('span.sat-mode-ic', mode === 'q' ? '❓' : '💬'),
        el('span.sat-mode-t', mode === 'q' ? 'Frage' : 'Erzählsatz')));
    }
    const wagons = [];
    for (let i = 0; i < n; i++) wagons.push(wagonEl());
    const tail = wagonEl('sat-tail');
    const train = el('div.sat-train', lok(), wagons, tail);
    const track = el('div.sat-track', train);
    if (level <= 2) { setWagon(tail, '.'); tail.classList.add('sat-fixed'); tail.disabled = true; }

    const cards = U.shuffle(cardWords.concat(extra ? [extra] : [])).map((w) => {
      const b = el('button.sat-card', { type: 'button', 'aria-label': w }, label(w));
      b._w = w;
      return b;
    });
    let pcards = [];
    if (level === 4) {
      pcards = ['.', '?'].map((p) => {
        const b = el('button.sat-card.sat-pcard', { type: 'button', 'aria-label': PNAME[p] }, p);
        b._p = p;
        return b;
      });
    }
    const pool = el('div.sat-pool', cards, pcards);
    ctx.stage.classList.add('sat-stage');
    ctx.stage.append(top, track, pool);

    /* --- Zustand --- */
    const filled = new Array(n).fill(null); // Karte je Wagen
    let punct = null; // Satzzeichen-Karte (Stufe 4)
    let busy = false;
    let done = false;
    let guide = false; // nach dem Vormachen: nächste Karte leuchtet immer
    let finish;
    const finished = new Promise((r) => { finish = r; });

    const words = () => filled.map((c) => (c ? c._w : null));
    function prefixLen() {
      const cur = words();
      let best = 0;
      valid.forEach((v) => {
        let k = 0;
        while (k < n && cur[k] === v[k]) k++;
        best = Math.max(best, k);
      });
      return best;
    }
    // die Reihenfolge, die zum bisher Gelegten passt
    function bestOrder() {
      const cur = words();
      let best = valid[0];
      let bk = -1;
      valid.forEach((v) => {
        let k = 0;
        while (k < n && cur[k] === v[k]) k++;
        if (k > bk) { bk = k; best = v; }
      });
      return best;
    }
    function nextCard() {
      const k = prefixLen();
      if (k < n && filled.slice(0, k).every(Boolean) && !filled[k]) {
        const need = bestOrder()[k];
        return cards.find((c) => !c._placed && c._w === need) || null;
      }
      if (filled.every(Boolean) && level === 4 && !punct) return pcards.find((c) => c._p === tgt);
      return null;
    }
    // An der Lok: Stufe 4 macht jedes Wort groß (Regel üben), Stufe 1–2 zeigt die Karte wie sie ist
    // (ein kleines Wort an der Lok fällt so auf) – außer es ist ein richtiger Satzanfang.
    const display = (i, w) => (i === 0 && (level === 4 || firstWords.has(w)) ? cap(w) : w);
    function render() {
      wagons.forEach((wg, i) => setWagon(wg, filled[i] ? display(i, filled[i]._w) : ''));
      if (level === 4) setWagon(tail, punct ? punct._p : '');
      wagons[0].classList.toggle('sat-capped', level === 4 && !!filled[0] && filled[0]._w !== cap(filled[0]._w));
      [...cards, ...pcards].forEach((c) => { c.classList.toggle('sat-used', !!c._placed); ctx.unhint(c); });
      mark();
      if (guide && !done) { const nc = nextCard(); if (nc) ctx.hint(nc); }
    }
    function mark() {
      [...cards, ...pcards].forEach((c) => ctx.markTest(c, false));
      if (!done && !busy) ctx.markTest(nextCard());
    }

    async function place(c) {
      if (busy || done || c._placed) return;
      if (c._p) {
        if (punct) { punct._placed = false; }
        punct = c; c._placed = true;
        LT.sfx.play('pop');
        render();
        LT.speech.say(PNAME[c._p], { interrupt: true });
      } else {
        const i = filled.indexOf(null);
        if (i < 0) return;
        filled[i] = c; c._placed = true;
        LT.sfx.play('pop');
        render();
        LT.ui.animate(wagons[i], 'bump');
        // Stufe 4: an der Lok wird das Wort groß – einmal pro Runde erklären
        if (level === 4 && i === 0 && c._w !== cap(c._w) && !capExplained) {
          capExplained = true;
          busy = true; mark();
          await ctx.say(`${cap(c._w)}. Am Satzanfang schreiben wir groß!`);
          if (!ctx.active) return;
          busy = false; mark();
        } else {
          LT.speech.say(display(i, c._w), { interrupt: true });
        }
      }
      if (filled.every(Boolean) && (level !== 4 || punct)) await check();
    }
    function unplace(i) {
      if (busy || done) return;
      if (i === 'p') { if (punct) { punct._placed = false; punct = null; } }
      else if (filled[i]) {
        filled[i]._placed = false;
        filled[i] = null;
        // Lücken schließen, damit der Zug zusammenbleibt
        const rest = filled.filter(Boolean);
        for (let k = 0; k < n; k++) filled[k] = rest[k] || null;
      }
      LT.sfx.play('tap');
      render();
    }

    async function check() {
      busy = true; mark();
      const cur = words();
      const orderOk = valid.some((v) => v.every((w, i) => w === cur[i]));
      const punctOk = level !== 4 || (punct && punct._p === tgt);
      const built = sentenceOf(cur, level === 4 ? punct._p : '.');
      if (orderOk && punctOk) {
        done = true; mark();
        train.classList.add('sat-go');
        const say = proc(ctx,
          vary('ok', ['Super, der Zug fährt!', 'Toll gebaut!', 'Genau so!', 'Prima, alles richtig!']),
          level === 4
            ? (mode === 'q' ? 'Du hast das Tunwort nach vorne geholt. So baut man eine Frage!' : 'Du hast zuerst gesagt, wer etwas tut. So geht ein Erzählsatz!')
            : vary('okp', ['Du hast zuerst gefragt: Wer tut etwas? Sehr schlau!', 'Du hast jedes Wort genau gelesen. Toll!', 'Du hast den Satz leise ausprobiert. So machen es Profis!']));
        await ctx.correct(train, { say, praise: false });
        if (!ctx.active) return;
        await ctx.say(spoken(cur, tgt));
        if (!ctx.active) return;
        finish();
        return;
      }
      const k = prefixLen();
      const nw = await ctx.wrong(train, { keep: true, say: '' });
      if (!ctx.active) return;
      // Hilfe 1: Satz vorlesen + gezielter Denkanstoß
      let tip;
      const first = cur[0];
      const extraUsed = extra && cur.includes(extra);
      if (orderOk && !punctOk) {
        tip = 'Die Wörter stimmen schon! Schau auf den Schlusswagen. Eine Frage bekommt ein Fragezeichen, ein Erzählsatz einen Punkt.';
      } else if (extraUsed) {
        tip = `Das Wort ${extra} passt nicht in diesen Satz. Schau nochmal aufs Bild.`;
      } else if (level === 4 && mode === 'q' && k === 0) {
        tip = 'Das ist noch keine Frage. Bei einer Frage kommt das Tunwort ganz nach vorne. Welches Wort sagt, was jemand tut?';
      } else if (level === 4 && mode === 's' && k === 0 && first === target.verb) {
        tip = 'Das klingt wie eine Frage. Bei einem Erzählsatz steht zuerst, wer etwas tut.';
      } else if (k === 0 && level <= 2 && !isNounBase(first) && !firstWords.has(first)) {
        tip = 'Schau mal: Das Wort an der Lok muss groß anfangen. Frag dich: Wer tut etwas?';
      } else if (k === 0) {
        tip = 'Klingt das richtig? Frag dich: Wer tut etwas? Das kommt nach vorne an die Lok.';
      } else {
        tip = vary('mid', ['Der Anfang stimmt schon! Was passt danach?', 'Fast! Der Anfang ist richtig. Lies weiter: Was kommt dann?']);
      }
      if (nw === 1) {
        await ctx.say(`Flo liest: ${built}`);
        if (!ctx.active) return;
        await ctx.say(tip);
      } else if (nw === 2) {
        await ctx.say(k > 0
          ? 'Tipp: Lies den Anfang nochmal. Welches Wort passt jetzt? Ich zeige es dir.'
          : 'Tipp: Fang mit dem Wort an, das leuchtet.');
      } else {
        ctx.modelShown = true;
        guide = true;
        await ctx.say(`Hör mal: ${spoken(bestOrder(), tgt)} Ich zeige dir die Wörter.`);
      }
      if (!ctx.active) return;
      // falsche Wagen fahren zurück
      if (!orderOk) {
        for (let i = k; i < n; i++) if (filled[i]) { filled[i]._placed = false; filled[i] = null; }
      }
      if (punct && !punctOk) { punct._placed = false; punct = null; }
      busy = false;
      render();
      if (nw === 2) { const nc = nextCard(); if (nc) ctx.hint(nc); }
    }

    cards.forEach((c) => ctx.listen(c, 'click', () => place(c)));
    pcards.forEach((c) => ctx.listen(c, 'click', () => place(c)));
    wagons.forEach((w, i) => ctx.listen(w, 'click', () => unplace(i)));
    if (level === 4) ctx.listen(tail, 'click', () => unplace('p'));
    ctx.testSolve(() => { busy = false; const c = nextCard(); if (c) place(c); });

    // Hilfe bei Schwierigkeiten: erstes Wort steht schon an der Lok
    if (level <= 2 && ctx.flow < 0 && valid.length === 1) {
      const c0 = cards.find((c) => c._w === target.w[0]);
      filled[0] = c0; c0._placed = true;
    }
    busy = true;
    render();
    let instr;
    if (level === 4) instr = mode === 'q' ? 'Bau eine Frage!' : 'Bau einen Erzählsatz!';
    else instr = ctx.index === 0 || U.chance(0.5) ? 'Bau den Satz zum Bild! Tipp die Wörter der Reihe nach an.' : vary('ins', ['Bau den Satz zum Bild!', 'Bau den Satz zum Bild! Wer tut was?']);
    if (extra) instr += ' Ein Wort gehört nicht dazu.';
    await ctx.instruct(instr);
    if (!ctx.active) return;
    busy = false;
    render();
    await finished;
    if (!ctx.active) return;
    await ctx.sleep(500);
  }


  /* ==========================================================================
     Stufe 4 (a): Namenwörter finden und groß machen – Artikelprobe
     Der Satz steht im Zug, alles klein außer dem Satzanfang. Das Kind tippt die
     Wörter an, die groß werden müssen; jedes gefundene Namenwort wird groß.
     ========================================================================== */
  const NUMW = ['', 'Ein', 'Zwei', 'Drei'];
  async function nounTask(ctx) {
    let pool = L4N;
    if (ctx.flow < 0) pool = L4N.filter((x) => x.w.length <= 4);
    else if (ctx.flow > 0) pool = L4N.filter((x) => x.w.length >= 5);
    const target = ctx.item(pool, (x) => sentenceOf(x.w, '.') + ' / Namenwörter', { avoid: 5 });
    const nounIdx = target.w.map((w, i) => (i > 0 && isNounBase(w) ? i : -1)).filter((i) => i >= 0);
    const found = new Set();
    let busy = true;
    let done = false;
    let guide = false;
    let finish;
    const finished = new Promise((r) => { finish = r; });

    const tiles = target.w.map((w, i) => {
      const b = el('button.sat-wagon.sat-filled.sat-ntile', { type: 'button', 'aria-label': i === 0 ? cap(w) : low(w) },
        el('span.sat-wtxt', i === 0 ? cap(w) : low(w)));
      b._i = i;
      return b;
    });
    const tail = el('div.sat-wagon.sat-tail.sat-filled.sat-static', el('span.sat-wtxt', '.'));
    const train = el('div.sat-train', lok(), tiles, tail);
    const top = el('div.sat-top',
      el('div.sat-pic', { 'aria-hidden': 'true' }, target.e),
      el('div.sat-mode.sat-mode-n', el('span.sat-mode-ic', '🔠'), el('span.sat-mode-t', 'der, die, das?')));
    ctx.stage.classList.add('sat-stage');
    ctx.stage.append(top, el('div.sat-track', train));

    const nextNoun = () => tiles[nounIdx.find((i) => !found.has(i))] || null;
    function mark() {
      tiles.forEach((t) => { ctx.markTest(t, false); ctx.unhint(t); });
      if (done) return;
      const nn = nextNoun();
      if (!busy) ctx.markTest(nn);
      if (guide && nn) ctx.hint(nn);
    }

    async function tap(t) {
      if (busy || done) return;
      const i = t._i;
      const w = target.w[i];
      if (found.has(i)) return;
      if (i === 0) {
        LT.speech.say(`${cap(w)} steht am Satzanfang. Das ist schon groß.`, { interrupt: true });
        return;
      }
      busy = true; mark();
      if (nounIdx.includes(i)) {
        found.add(i);
        t.querySelector('.sat-wtxt').textContent = w;
        t.setAttribute('aria-label', w);
        t.classList.add('sat-capped', 'sat-repaired');
        LT.sfx.play('pop');
        LT.ui.animate(t, 'bump');
        if (found.size < nounIdx.length) {
          await ctx.say(`${artOf(w)} ${w}. Das passt! ${w} ist ein Namenwort.`);
          if (!ctx.active) return;
          busy = false; mark();
          return;
        }
        done = true; mark();
        train.classList.add('sat-go');
        const names = nounIdx.map((k) => target.w[k]);
        const why = `${artOf(w)} ${w}. Das passt! Du hast alle Namenwörter gefunden.`;
        await ctx.correct(train, { say: proc(ctx, why, why + ' Du hast bei jedem Wort die Probe gemacht. Wie ein Profi!'), praise: false });
        if (!ctx.active) return;
        await ctx.say(sentenceOf(target.w, '.'));
        if (!ctx.active) return;
        if (names.length > 1 && ctx.wrongCount > 0) { await ctx.say(names.map((x) => `${artOf(x)} ${x}`).join(', ') + '.'); if (!ctx.active) return; }
        finish();
        return;
      }
      // kein Namenwort: Hilfe-Leiter
      const nw = await ctx.wrong(t, { keep: true, say: '' });
      if (!ctx.active) return;
      const nn = nextNoun();
      const nWord = nn ? target.w[nn._i] : '';
      if (nw === 1) {
        await ctx.say(BEGLEITER.includes(w)
          ? `${w} ist ein Begleiter. Er bleibt klein. Aber schau mal: Er zeigt dir, dass gleich ein Namenwort kommt!`
          : `Mach die Probe: der ${w}? die ${w}? das ${w}? Das passt nicht. Also bleibt ${w} klein.`);
      } else if (nw === 2) {
        await ctx.say('Tipp: Was kannst du auf dem Bild sehen oder anfassen? Passt der, die oder das davor? Dann ist es ein Namenwort.');
      } else {
        ctx.modelShown = true;
        guide = true;
        await ctx.say(`Hör mal: ${artOf(nWord)} ${nWord}. Das passt! Tipp das Wort an, das leuchtet.`);
      }
      if (!ctx.active) return;
      busy = false; mark();
    }

    tiles.forEach((t) => ctx.listen(t, 'click', () => tap(t)));
    ctx.testSolve(() => { busy = false; const nn = nextNoun(); if (nn) tap(nn); });

    const n = nounIdx.length;
    mark();
    await ctx.instruct(n === 1
      ? 'Ein Namenwort ist noch klein. Tipp es an!'
      : `${NUMW[n]} Namenwörter sind noch klein. Tipp sie an!`);
    if (!ctx.active) return;
    busy = false; mark();
    await finished;
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  /* ==========================================================================
     Stufe 3: Satzzeichen wählen
     ========================================================================== */
  async function punctTask(ctx) {
    const target = ctx.item(L3, (x) => sentenceOf(x.w, x.t), { avoid: 5 });
    const isQ = target.t === '?';
    const wagons = target.w.map((w, i) => {
      const wg = el('div.sat-wagon.sat-filled.sat-static');
      wg.appendChild(el('span.sat-wtxt', i === 0 ? cap(w) : w));
      return wg;
    });
    const tail = el('div.sat-wagon.sat-tail.sat-empty', el('span.sat-wtxt', ''));
    const train = el('div.sat-train', lok(), wagons, tail);
    const sayText = sentenceOf(target.w, target.t);
    const top = el('div.sat-top');
    if (ctx.flow <= 0) {
      top.appendChild(el('button.sat-listen', { type: 'button', 'aria-label': 'Satz anhören', on: { click: () => LT.speech.say(sayText, { interrupt: true }) } },
        U.emoji('🔊'), el('span', 'Satzmelodie')));
    } else {
      top.appendChild(el('div.sat-pro', '⭐ Profi: ohne Vorlesen'));
    }
    ctx.stage.classList.add('sat-stage');
    ctx.stage.append(top, el('div.sat-track', train));
    const firstW = target.w[0];
    const wq = W_WORDS.includes(firstW);
    await ctx.instruct(vary('p3', ['Lies den Satz. Was kommt in den Schlusswagen?', 'Punkt oder Fragezeichen?']));
    if (!ctx.active) return;
    if (ctx.flow < 0) { await ctx.say(sayText); if (!ctx.active) return; }
    const items = ['.', '?'].map((p) => ({
      content: el('span.sat-ptile', p), correct: p === target.t, say: PNAME[p], p, aria: PNAME[p],
    }));
    await ctx.choices(items, {
      size: 'large', className: 'sat-pchoices', hintAfter: 1, praise: false,
      onCorrect: () => { tail.querySelector('.sat-wtxt').textContent = target.t; tail.classList.remove('sat-empty'); tail.classList.add('sat-filled'); },
      correctSay: () => proc(ctx,
        isQ ? vary('q', ['Genau, das ist eine Frage!', 'Richtig, ein Fragezeichen!']) : vary('s', ['Genau, der Satz erzählt etwas!', 'Richtig, ein Punkt!']),
        isQ ? (wq ? `Du hast das Fragewort ${cap(firstW)} entdeckt. Super!` : 'Du hast gesehen: Das Tunwort steht vorne. So erkennt man Fragen!')
          : 'Du hast den ganzen Satz gelesen und genau überlegt. Toll!'),
      explain: (wrong) => (wrong.p === '.'
        ? (wq ? `Schau mal auf das erste Wort: ${cap(firstW)}. Mit so einem Wort will man etwas wissen.`
          : `Schau mal auf das erste Wort: ${cap(firstW)}. Sagt es, was jemand tut? Will der Satz etwas wissen?`)
        : `Schau mal: Der Satz erzählt uns etwas. Will er wirklich etwas wissen?`),
      // W-Fragen fallen am Ende meist ab – dort hilft das Fragewort, nicht die Melodie
      hintSay: () => (!isQ ? 'Hör mal, die Stimme geht am Ende runter. Der Satz erzählt etwas.'
        : wq ? 'Schau aufs erste Wort. Wo, was, wer, wie: Das sind Fragewörter. Damit will man etwas wissen.'
          : 'Das Tunwort steht ganz vorne. Und hör mal, die Stimme geht am Ende hoch.'),
      modelSay: () => (isQ ? 'Schau, das Fragezeichen. Der Satz fragt etwas. Tipp es an!' : 'Schau, der Punkt. Der Satz erzählt etwas. Tipp ihn an!'),
      onWrong: async () => { await ctx.say(sayText); },
    });
    if (!ctx.active) return;
    train.classList.add('sat-go');
    await ctx.say(sayText);
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ==========================================================================
     Stufe 5: Fehler finden
     ========================================================================== */
  const ERR_KEY = { start: 'Satzanfang', noun: 'Namenwort', verb: 'zu groß', punct: 'Satzzeichen' };
  const NAMES = ['Flo', 'Mia', 'Ben', 'Oma', 'Opa', 'Lea', 'Tim', 'Mama', 'Papa'];
  // Wörter, die es auch als Namenwort gibt (der Morgen, das Lesen): groß geschrieben wären sie
  // nach der Artikelprobe nicht eindeutig falsch → nie als „zu groß“-Fehler verwenden
  const NOUN_HOMOGRAPH = ['morgen', 'lesen', 'gehen', 'essen', 'spielen', 'schwimmen', 'hast', 'heute'];
  // mögliche Fehlerstellen je Fehlerart (Namen bleiben immer groß, kurze Wörter wie „du“ nicht)
  function errOptions(s) {
    const o = { start: [], noun: [], verb: [], punct: [s.w.length] };
    if (!isNounBase(s.w[0])) o.start.push(0);
    s.w.forEach((w, i) => {
      if (i === 0) return;
      if (isNounBase(w)) { if (!NAMES.includes(w)) o.noun.push(i); } else if (w.length > 2 && !NOUN_HOMOGRAPH.includes(w)) o.verb.push(i);
    });
    return o;
  }
  const FIX_POOL = [];
  L5.forEach((s) => {
    const o = errOptions(s);
    Object.keys(o).forEach((type) => {
      if (o[type].length) FIX_POOL.push({ s, type, pos: o[type], key: sentenceOf(s.w, s.t) + ' / ' + ERR_KEY[type] });
    });
  });

  async function fixTask(ctx) {
    let pool = FIX_POOL;
    if (ctx.flow < 0) pool = pool.filter((x) => x.s.w.length <= 4 && x.type !== 'verb');
    else if (ctx.flow > 0) pool = pool.filter((x) => x.s.w.length >= 4);
    const it = ctx.item(pool, (x) => x.key, { avoid: 6 });
    const s = it.s;
    const er = { type: it.type, i: U.pick(it.pos) };
    const wrongP = s.t === '.' ? '?' : '.';
    const shown = s.w.map((w, i) => {
      if (er.type === 'start' && i === 0) return low(w);
      if (i === 0) return cap(w);
      if (er.type === 'noun' && i === er.i) return low(w);
      if (er.type === 'verb' && i === er.i) return cap(w);
      return w;
    });
    const shownP = er.type === 'punct' ? wrongP : s.t;
    const fixed = s.w.map((w, i) => (i === 0 ? cap(w) : w));

    const train = el('div.sat-train.sat-fix', lok());
    ctx.stage.classList.add('sat-stage');
    ctx.stage.append(el('div.sat-top', el('div.sat-pic.sat-pic-s', { 'aria-hidden': 'true' }, '🔎')), el('div.sat-track', train));

    const items = shown.map((w, i) => ({
      content: el('span.sat-wtxt', w), correct: i === er.i && er.type !== 'punct', i, w, base: s.w[i],
      className: 'sat-wagon sat-filled sat-ftile', aria: w,
    }));
    items.push({ content: el('span.sat-wtxt', shownP), correct: er.type === 'punct', i: s.w.length, p: shownP,
      className: 'sat-wagon sat-filled sat-tail sat-ftile', aria: PNAME[shownP] });

    await ctx.instruct(vary('p5', ['Wo ist der Fehler? Tipp den Wagen an.', 'Finde den Fehler im Zug!']));
    if (!ctx.active) return;
    const fixedWord = er.type === 'punct' ? '' : fixed[er.i];

    await ctx.choices(items, {
      container: train, shuffle: false, hintAfter: 2, praise: false, ease: false,
      onCorrect: (item, tile) => {
        tile.querySelector('.sat-wtxt').textContent = er.type === 'punct' ? s.t : fixed[er.i];
        tile.classList.add('sat-repaired');
      },
      correctSay: () => {
        let why;
        if (er.type === 'start') why = `Genau! Am Satzanfang schreiben wir groß: ${fixedWord}.`;
        else if (er.type === 'noun') why = `Genau! ${fixedWord} ist ein Namenwort. Man kann sagen: ${artOf(fixedWord)} ${fixedWord}. Darum schreiben wir es groß.`;
        else if (er.type === 'verb') why = `Genau! ${fixedWord} ist kein Namenwort. Mitten im Satz schreiben wir es klein.`;
        else why = s.t === '?' ? 'Genau! Der Satz fragt etwas. Er braucht ein Fragezeichen.' : 'Genau! Der Satz erzählt etwas. Er braucht einen Punkt.';
        return proc(ctx, why, why + ' Du hast Wort für Wort geprüft, wie ein echter Satzprüfer!');
      },
      explain: (wrong) => {
        if (wrong.p) return wrong.p === '?' ? 'Das Fragezeichen passt, der Satz fragt ja etwas. Such weiter!' : 'Der Punkt passt, der Satz erzählt etwas. Such weiter!';
        if (wrong.i === 0) return `${wrong.w} steht am Satzanfang und ist groß. Das stimmt so. Such weiter!`;
        if (isNounBase(wrong.base)) return `${wrong.w} ist ein Namenwort und groß geschrieben. Das stimmt so. Such weiter!`;
        return `${wrong.w} ist klein geschrieben. Das ist richtig so. Such weiter!`;
      },
      hintSay: () => ({
        start: 'Tipp: Schau dir den Anfang vom Satz genau an.',
        noun: 'Tipp: Such ein Namenwort. Kannst du es anfassen oder sehen? Passt der, die oder das davor?',
        verb: 'Tipp: Ein Wort ist zu groß geraten. Nur Namenwörter und der Satzanfang sind groß.',
        punct: 'Tipp: Schau ans Ende. Erzählt der Satz etwas, oder fragt er?',
      })[er.type],
      modelSay: () => ({
        start: 'Schau, hier vorne. Der Satz muss groß anfangen. Tipp den Wagen an!',
        noun: `Schau, hier. ${fixedWord} ist ein Namenwort. Tipp den Wagen an!`,
        verb: 'Schau, dieses Wort ist kein Namenwort. Es muss klein sein. Tipp den Wagen an!',
        punct: 'Schau, der Schlusswagen passt nicht. Tipp ihn an!',
      })[er.type],
    });
    if (!ctx.active) return;
    train.classList.add('sat-go');
    await ctx.say(sentenceOf(s.w, s.t));
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  // Artikel für die Namenwort-Probe (nur für Wörter aus den Satzlisten)
  const ART = {
    Gras: 'das', Garten: 'der', Teich: 'der', Apfel: 'der', Mütze: 'die', Pferd: 'das', Turm: 'der', Kinder: 'die',
    Schule: 'die', Auto: 'das', Milch: 'die', Igel: 'der', Laub: 'das', Haus: 'das', Ente: 'die', See: 'der', Buch: 'das',
    Bär: 'der', Honig: 'der', Maus: 'die', Käse: 'der', Kuh: 'die', Fisch: 'der', Katze: 'die', Sofa: 'das', Hund: 'der',
    Hase: 'der', Möhre: 'die', Zoo: 'der', Ball: 'der', Tür: 'die', Hunger: 'der', Erdbeeren: 'die', Fußball: 'der',
    Kind: 'das', Blume: 'die', Vogel: 'der', Baum: 'der', Junge: 'der', Stall: 'der', Wiese: 'die', Sonne: 'die',
    Baby: 'das', Teddy: 'der', Mond: 'der', Schneemann: 'der',
  };
  const artOf = (w) => ART[w] || 'der';

  /* ---------------- Registrierung ---------------- */
  LT.registerGame({
    id: 'satzbaumeister',
    area: 'deutsch1',
    title: 'Satzbaumeister',
    icon: '🚂',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Hallo Satzbaumeister! Ein Satz ist wie ein Zug. Vorne die Lok, hinten der Schlusswagen.',
    parent: {
      skill: 'Sätze bilden und untersuchen: Wortreihenfolge, Satzanfang groß, Punkt und Fragezeichen',
      goal: 'Ihr Kind ordnet Wörter zu sinnvollen Sätzen, schreibt den Satzanfang und Namenwörter groß, unterscheidet Erzählsatz und Frage und findet solche Fehler selbst (Sprache untersuchen, Klasse 1).',
      levels: [
        'Sätze aus drei Wortkarten zum Bild bauen (Wer? tut was? was?) – Satzanfang und Punkt sind vorgegeben',
        'Längere Sätze aus vier bis fünf Wörtern bauen, auch mit Ortsangaben; beim Steigern ein Wort, das nicht dazugehört',
        'Punkt oder Fragezeichen wählen: Erzählsatz, Ja-Nein-Frage, W-Frage (Satzmelodie anhören, später ohne)',
        'Namenwörter finden und groß schreiben (Probe: der Hund, die Katze); im Wechsel aus denselben Wörtern eine Frage oder einen Erzählsatz bauen und das Satzzeichen setzen',
        'Fehler finden: kleiner Satzanfang, kleines Namenwort, großes Tunwort oder falsches Satzzeichen – Niveau Ende Klasse 1',
      ],
      tip: 'Spielen Sie „Satz-Zug“ mit Zetteln: Jedes Wort auf eine Karte, Ihr Kind legt den Satz und liest ihn vor. Fragen Sie: „Wer tut etwas? Was tut er?“ Für die Großschreibung hilft die Probe: „Passt der, die oder das davor? Dann ist es ein Namenwort.“',
    },

    async task(ctx) {
      const level = lvOf(ctx);
      if (ctx.index === 0) {
        introduced = new Set();
        capExplained = false;
        for (let i = 1; i < ctx.level; i++) if (KIND(i) === KIND(ctx.level)) introduced.add(i);
      }
      // Stufe 4 wechselt ab: Namenwörter (Artikelprobe, zuerst) und Frage/Erzählsatz bauen
      const noun = level === 4 && ctx.index % 2 === 0;
      const ik = noun ? '4n' : level;
      if (!introduced.has(ik)) {
        introduced.add(ik);
        await ctx.say(INTRO[ik]);
        if (!ctx.active) return;
      }
      if (level <= 2) return buildTask(ctx, level);
      if (level === 3) return punctTask(ctx);
      if (level === 4) return noun ? nounTask(ctx) : buildTask(ctx, 4);
      return fixTask(ctx);
    },
  });
})();
