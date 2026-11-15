/* ==========================================================================
   Spiel „Wörter-Sortierer“ 🗂️ (Leseschule, Klasse 1) – Wortarten (B11)

   Didaktik (Sprache untersuchen, Klasse 1):
   - Drei Wortarten mit je einer Frage, einer Farbe und einer Probe:
       Namenwort  „Was ist es?“   Probe: ein/eine … – viele … (nicht der/die/
                  das: „das Malen“ klingt auch richtig und würde Tunwörter
                  durchlassen). Immer im Kontrast zu „Ich kann …“.
       Tunwort    „Was tut man?“  Probe: Ich kann …
       Wiewort    „Wie ist es?“   Probe: Es ist …
   - In den Stufen 1 bis 3 stehen alle Wörter in GROSSBUCHSTABEN (wie in der
     Vorschule). So muss das Kind wirklich über die Bedeutung entscheiden und
     kann nicht nur auf den großen Anfangsbuchstaben schauen. Nach der Lösung
     verwandelt sich die Karte in die richtige Schreibweise („der Hund“,
     „laufen“, „groß“) – das bereitet die Großschreibung vor.
   - Bewegungsanimation: Tunwörter hüpfen, Wiewörter leuchten, Namenwörter
     bekommen ihren Begleiter.
   - Stufen:
       1  Namenwort finden (unter Tunwörtern mit Handlungsbild; höchstens
          eine Bild-Falle wie fliegen 🕊️; beim Steigern auch Wiewörter)
       2  Tunwörter: Tunwort finden / Wort in Namenwort- oder Tunwort-Korb
       3  Drei Körbe: Namenwort, Tunwort, Wiewort (beim Steigern ohne Bild,
          auch Namenwörter, die man nicht anfassen kann: die Angst)
       4  Wiewörter: Gegenteile (mit Fast-gleich-Falle: groß/riesig) und
          Wortarten im Satz finden (Begleiter und Hilfswörter als Ablenker)
       5  Einzahl/Mehrzahl (Hund/Hunde, Haus/Häuser, mit Umlaut- und
          Endungsfallen) und Großschreibung im Satz – Niveau Ende Klasse 1
   - Stufenwahl: In den Stufen 1 bis 3 steigert ctx.flow nur innerhalb der
     Stufe (mehr Ablenker, ohne Bild, abstrakte Namenwörter); nach unten
     darf es eine Stufe leichter werden. Stufen 4 und 5 bleiben stabil.
   - Fehlvorstellungen: „Nur Dinge zum Anfassen sind Namenwörter“, „das
     Bild zeigt einen Gegenstand, also Namenwort“ (malen 🎨), Gegenteil mit
     ähnlichem Wort verwechselt, Mehrzahl ohne Veränderung oder mit falschem
     Umlaut („Hünde“), „alles groß“ / „Tunwörter groß“.
   - Hilfe-Leiter über ctx.choices: 1. Erklärung mit passender Probe
     (ohne Lösung), 2. Strategie-Tipp, ein Ablenker verschwindet,
     3. Flo macht die Probe vor.
   - Lerninhalte (ctx.item): „Hund“, „laufen“, „groß → klein“,
     „Wiewort: Der Tee ist heiß.“, „Hund → Hunde“, „Groß? Katze“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const cap = (s) => U.cap(s);
  const UP = (s) => String(s).split('').map((c) => (c === 'ß' ? 'ß' : c.toUpperCase())).join('');
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const vary = (key, list) => U.pickFresh('wor-' + key, list, Math.min(2, list.length - 1));
  const hintAfterFor = (ctx, n, nWrong) => {
    const visible = ctx.flow < 0 && n >= 4 && nWrong >= 2 ? n - 1 : n;
    return visible <= 3 ? 1 : 2;
  };

  /* ---------------- Wortarten ---------------- */
  const KIND = {
    N: { name: 'Namenwort', q: 'Was ist es?', icon: '🏷️', cls: 'wor-n' },
    T: { name: 'Tunwort', q: 'Was tut man?', icon: '🤹', cls: 'wor-t' },
    W: { name: 'Wiewort', q: 'Wie ist es?', icon: '🌈', cls: 'wor-w' },
  };

  /* ---------------- Wortlisten ----------------
     Namenwörter: [Wort, Begleiter, Bild, Mehrzahl, falsche Mehrzahlformen] */
  const NOUNS = [
    ['Hund', 'der', '🐶', 'Hunde', ['Hünde', 'Hunds']],
    ['Katze', 'die', '🐱', 'Katzen', ['Kätze', 'Katzes']],
    ['Haus', 'das', '🏠', 'Häuser', ['Hauser', 'Hause']],
    ['Baum', 'der', '🌳', 'Bäume', ['Baume', 'Baums']],
    ['Ball', 'der', '⚽', 'Bälle', ['Balle', 'Balls']],
    ['Maus', 'die', '🐭', 'Mäuse', ['Mause', 'Mausen']],
    ['Buch', 'das', '📕', 'Bücher', ['Bucher', 'Buche']],
    ['Apfel', 'der', '🍎', 'Äpfel', ['Apfels', 'Apfeln']],
    ['Auto', 'das', '🚗', 'Autos', ['Autoe', 'Auten']],
    ['Kind', 'das', '🧒', 'Kinder', ['Kinde', 'Kinds']],
    ['Blume', 'die', '🌷', 'Blumen', ['Blümen', 'Blumes']],
    ['Ei', 'das', '🥚', 'Eier', ['Eie', 'Eien']],
    ['Stuhl', 'der', '🪑', 'Stühle', ['Stuhle', 'Stuhls']],
    ['Hand', 'die', '✋', 'Hände', ['Hande', 'Hands']],
    ['Fisch', 'der', '🐟', 'Fische', ['Fischs', 'Fischen']],
    ['Vogel', 'der', '🐦', 'Vögel', ['Vogels', 'Vogeln']],
    ['Kuh', 'die', '🐄', 'Kühe', ['Kuhs', 'Kuhen']],
    ['Bett', 'das', '🛏️', 'Betten', ['Bette', 'Betts']],
    ['Stern', 'der', '⭐', 'Sterne', ['Sterns', 'Stärne']],
    ['Schuh', 'der', '👟', 'Schuhe', ['Schuhs', 'Schühe']],
    ['Hase', 'der', '🐰', 'Hasen', ['Häse', 'Hases']],
    ['Zug', 'der', '🚂', 'Züge', ['Zuge', 'Zugs']],
    ['Ente', 'die', '🦆', 'Enten', ['Ents', 'Entes']],
    ['Brot', 'das', '🍞', 'Brote', ['Bröte', 'Brots']],
    ['Sonne', 'die', '☀️', null, null],
    ['Eis', 'das', '🍦', null, null],
    ['Bus', 'der', '🚌', null, null],
    ['Mond', 'der', '🌙', null, null],
  ].map(([w, a, e, pl, bad]) => ({ w, a, e, pl, bad, kind: 'N' }));

  /** Namenwörter, die man nicht anfassen kann (Stufe 3 beim Steigern). */
  const ABSTRACT = [
    ['Angst', 'die', '😨', 'Ich habe Angst'], ['Freude', 'die', '🥳', 'eine große Freude'], ['Traum', 'der', '💭', 'ein Traum, viele Träume'],
    ['Hunger', 'der', '🍽️', 'Ich habe Hunger'], ['Idee', 'die', '💡', 'eine Idee, viele Ideen'],
  ].map(([w, a, e, probe]) => ({ w, a, e, probe, kind: 'N', abstract: true }));

  const VERBS = [
    // obj = Bild zeigt einen Gegenstand/ein Tier statt einer Handlung (Bild-Falle)
    ['laufen', '🏃'], ['schwimmen', '🏊'], ['malen', '🎨', 1], ['turnen', '🤸'], ['trinken', '🥤', 1], ['schlafen', '😴'],
    ['lesen', '📖', 1], ['singen', '🎤', 1], ['tanzen', '💃'], ['lachen', '😂'], ['weinen', '😭'], ['kochen', '🍳', 1],
    ['fliegen', '🕊️', 1], ['bauen', '🧱', 1], ['klettern', '🧗'], ['schreiben', '✍️'], ['winken', '👋'], ['fahren', '🚴'],
    ['putzen', '🧽', 1], ['springen', '🦘', 1],
  ].map(([w, e, obj]) => ({ w, e, obj: !!obj, kind: 'T' }));
  const VERBS_ACT = VERBS.filter((v) => !v.obj);
  const VERBS_OBJ = VERBS.filter((v) => v.obj);
  /** Paare mit fast gleichem Bild oder Sinn – nie zusammen in einer Aufgabe. */
  const CLASH = [['lesen', 'Buch'], ['weinen', 'traurig'], ['lachen', 'fröhlich'], ['fliegen', 'Vogel'], ['springen', 'Hase'], ['schlafen', 'Bett']];
  const clashes = (a, b) => CLASH.some(([x, y]) => (a.w === x && b.w === y) || (a.w === y && b.w === x));
  const fits = (x, list) => list.every((y) => y !== x && !clashes(x, y));
  const pickFit = (pool, list) => U.pick(pool.filter((x) => fits(x, list)));
  const ein = (x) => (x.a === 'die' ? 'eine' : 'ein');

  /* Wiewörter: [Wort, Bild, Bild gesprochen, Gegenteil, fast gleich]
     DIM: welche Eigenschaft das Wortpaar beschreibt (für Gegenteil-Erklärungen) */
  const DIM = {
    groß: 'wie groß etwas ist', klein: 'wie groß etwas ist', heiß: 'wie warm etwas ist', kalt: 'wie warm etwas ist',
    schnell: 'wie schnell etwas ist', langsam: 'wie schnell etwas ist', laut: 'wie laut etwas ist', leise: 'wie laut etwas ist',
    nass: 'wie nass etwas ist', trocken: 'wie nass etwas ist', hell: 'wie hell etwas ist', dunkel: 'wie hell etwas ist',
    alt: 'wie alt jemand ist', jung: 'wie alt jemand ist', hart: 'wie hart etwas ist', weich: 'wie hart etwas ist',
    süß: 'wie etwas schmeckt', sauer: 'wie etwas schmeckt', fröhlich: 'wie sich jemand fühlt', traurig: 'wie sich jemand fühlt',
    leicht: 'wie schwer etwas ist', schwer: 'wie schwer etwas ist',
  };
  const ADJ = [
    ['groß', '🐘', 'ein Elefant', 'klein', 'riesig'],
    ['klein', '🐜', 'eine Ameise', 'groß', 'winzig'],
    ['heiß', '🔥', 'ein Feuer', 'kalt', 'warm'],
    ['kalt', '🧊', 'ein Eiswürfel', 'heiß', 'kühl'],
    ['schnell', '🐆', 'ein Gepard', 'langsam', 'flink'],
    ['langsam', '🐌', 'eine Schnecke', 'schnell', null],
    ['laut', '🥁', 'eine Trommel', 'leise', null],
    ['leise', '🤫', 'ein Flüstern', 'laut', 'still'],
    ['nass', '💦', 'ein Regentropfen', 'trocken', null],
    ['trocken', '🏜️', 'eine Wüste', 'nass', null],
    ['hell', '🔆', 'eine Lampe', 'dunkel', null],
    ['dunkel', '🌑', 'die Nacht', 'hell', null],
    ['alt', '👵', 'eine Oma', 'jung', null],
    ['jung', '👶', 'ein Baby', 'alt', null],
    ['hart', '🪨', 'ein Stein', 'weich', 'fest'],
    ['weich', '🧸', 'ein Teddy', 'hart', null],
    ['süß', '🍭', 'ein Lutscher', 'sauer', null],
    ['sauer', '🍋', 'eine Zitrone', 'süß', null],
    ['fröhlich', '😄', 'ein lachendes Kind', 'traurig', 'lustig'],
    ['traurig', '😢', 'ein weinendes Kind', 'fröhlich', null],
    ['leicht', '🪶', 'eine Feder', 'schwer', null],
    ['schwer', '🏋️', 'eine Hantel', 'leicht', null],
  ].map(([w, e, pic, opp, near]) => ({ w, e, pic, opp, near, dim: DIM[w], kind: 'W' }));
  const ADJ_BY = {};
  ADJ.forEach((a) => { ADJ_BY[a.w] = a; });
  const ADJ_SORT = ADJ.filter((a) => ['groß', 'klein', 'heiß', 'kalt', 'schnell', 'langsam', 'laut', 'leise', 'nass', 'hell', 'alt', 'weich', 'süß', 'sauer', 'fröhlich', 'traurig', 'schwer'].includes(a.w));

  /* Sätze für Stufe 4 und 5: Wort|Art (N Namenwort, T Tunwort, W Wiewort,
     B Begleiter, - Hilfswort) */
  const SENT = [
    'Der|B Hund|N bellt|T laut|W', 'Die|B Katze|N schläft|T', 'Der|B Tee|N ist|- heiß|W',
    'Die|B Schnecke|N kriecht|T langsam|W', 'Flo|N rennt|T schnell|W', 'Das|B Eis|N ist|- kalt|W',
    'Mia|N singt|T leise|W', 'Die|B Sonne|N scheint|T hell|W', 'Der|B Elefant|N ist|- groß|W',
    'Das|B Baby|N lacht|T fröhlich|W', 'Der|B Ball|N fliegt|T hoch|W', 'Die|B Zitrone|N ist|- sauer|W',
    'Opa|N liest|T ein|B Buch|N', 'Der|B Stein|N ist|- hart|W', 'Ben|N malt|T ein|B Bild|N',
    'Das|B Kissen|N ist|- weich|W', 'Der|B Vogel|N singt|T schön|W', 'Die|B Ente|N schwimmt|T',
    'Der|B Fuchs|N ist|- schlau|W', 'Die|B Maus|N piepst|T leise|W',
  ].map((s) => {
    const words = s.split(' ').map((p) => { const [w, k] = p.split('|'); return { w, k }; });
    return { words, text: words.map((x) => x.w).join(' ') + '.' };
  });

  const INTRO = {
    1: 'Namenwörter sind Wörter für Menschen, Tiere, Pflanzen und Dinge. Frag: Was ist es? Und probier: ein Hund, viele Hunde. Das passt. Ein laufen? Das passt nicht. Laufen tut man.',
    2: 'Jetzt kommen die Tunwörter. Sie sagen, was man tut. Frag: Was tut man? Laufen, malen, singen.',
    3: 'Jetzt gibt es drei Körbe. Neu sind die Wiewörter. Sie sagen, wie etwas ist. Frag: Wie ist es?',
    4: 'Wiewörter haben oft ein Gegenteil: groß und klein. Und wir suchen Wortarten in einem Satz.',
    5: 'Profi-Stufe! Ein Hund, viele Hunde. Das ist Einzahl und Mehrzahl. Und Namenwörter schreibt man groß.',
  };
  let introduced = new Set();

  /* ---------------- Bausteine ---------------- */
  const PROBE = {
    N: (x) => `Probier mal: Passt ein oder eine davor? Oder passt: Ich kann ${x.w}?`,
    T: (x) => `Probier mal: Ich kann ${x.w}.`,
    W: (x) => `Probier mal: Es ist ${x.w}.`,
  };

  /** Wortkarte (Inhalt für Kacheln und die große Karte). */
  function wordNode(x, { pic = true, caps = true, big = false } = {}) {
    const n = el('span.wor-word' + (big ? '.wor-word-big' : ''));
    if (pic) n.appendChild(U.emoji(x.e, 'wor-pic'));
    const t = el('span.wor-txt', caps ? UP(x.w) : x.w);
    n.appendChild(t);
    n._txt = t;
    return n;
  }

  /** Karte in richtiger Schreibweise zeigen + Bewegung der Wortart. */
  function reveal(node, x) {
    if (!node || !node._txt) return;
    node._txt.textContent = x.kind === 'N' ? `${x.a} ${x.w}` : x.w;
    node.classList.add('wor-revealed', 'wor-anim-' + x.kind);
  }

  function basketNode(k) {
    const K = KIND[k];
    return el('span.wor-bin', U.emoji(K.icon, 'wor-bin-icon'), el('span.wor-bin-name', K.name), el('span.wor-bin-q', K.q));
  }

  function consolidate(x) {
    if (x.kind === 'N') return vary('cN', [`${cap(x.a)} ${x.w}. Namenwörter schreibt man groß.`, `${cap(x.a)} ${x.w}. Das ist ein Namenwort.`]);
    if (x.kind === 'T') return vary('cT', [`${cap(x.w)}. Das tut man. Tunwörter schreibt man klein.`, `Ich kann ${x.w}. Ein Tunwort!`]);
    return vary('cW', [`${cap(x.w)}. So ist etwas. Wiewörter schreibt man klein.`, `Es ist ${x.w}. Ein Wiewort!`]);
  }

  /* ---------------- Stufe 1 und 2: Wort finden ---------------- */
  async function taskFind(ctx, want) {
    const pool = want === 'N' ? NOUNS : VERBS;
    const target = ctx.item(pool, (x) => x.w, { avoid: 5 });
    let others;
    if (want === 'N') {
      // Tunwörter mit Handlungsbild; höchstens eine Bild-Falle (malen 🎨) und nur ab flow 0.
      // Beim Steigern ist das Wiewort (auch mit Gegenstandsbild) die eine Falle.
      others = [pickFit(VERBS_ACT, [target])];
      const trap = ctx.flow === 0 && U.chance(0.4);
      others.push(pickFit(trap ? VERBS_OBJ : VERBS_ACT, [target, ...others]));
      if (ctx.flow > 0) others.push(pickFit(ADJ_SORT, [target, ...others]));
    } else {
      others = [pickFit(NOUNS, [target])];
      others.push(pickFit(ADJ_SORT, [target, ...others]));
      if (ctx.flow > 0) others.push(pickFit(NOUNS, [target, ...others]));
    }
    const K = KIND[want];
    const prompt = el('div.prompt-box.wor-prompt',
      el('span.wor-badge.' + K.cls, U.emoji(K.icon), el('span', K.name)),
      el('span.wor-ask', K.q));
    ctx.stage.appendChild(prompt);
    const box = el('div.choices.wor-choices');
    ctx.stage.appendChild(box);
    await ctx.instruct(`Welches Wort ist ein ${K.name}? Frag: ${K.q}`);
    if (!ctx.active) return;
    const items = [target, ...others].map((x) => {
      const node = wordNode(x);
      return { content: node, node, correct: x === target, say: x.w, x, className: 'wor-wtile' };
    });
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    const right = await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Super!']),
        want === 'N' ? vary('pN', ['Du hast gefragt: Was ist es? Sehr schlau!', 'Du hast die Probe gemacht: ein oder eine davor. Toll!'])
          : vary('pT', ['Du hast gefragt: Was tut man? Super Trick!', 'Du hast die Probe gemacht: Ich kann. Sehr schlau!'])),
      explain: (wrong) => {
        const w = wrong.x;
        if (want === 'N') {
          if (w.kind === 'T') return `Hör mal: Ich kann ${w.w}. ${cap(w.w)} tut man. Wir suchen einen Menschen, ein Tier, eine Pflanze oder ein Ding.`;
          return `Hör mal: Es ist ${w.w}. So kann etwas sein. Wir suchen einen Menschen, ein Tier, eine Pflanze oder ein Ding.`;
        }
        if (w.kind === 'N') return `${cap(w.a)} ${w.w} ist ein Namenwort. Das ist etwas. Wir suchen etwas, das man tun kann.`;
        return `${cap(w.w)} sagt, wie etwas ist. Wir suchen etwas, das man tun kann.`;
      },
      hintSay: () => (want === 'N' ? 'Tipp: Sag: Ich kann, und dann das Wort. Was man tun kann, ist kein Namenwort. Vor das Namenwort passt ein oder eine.' : 'Tipp: Sag: Ich kann, und dann das Wort. Wo klingt es richtig?'),
      modelSay: () => {
        if (want !== 'N') return `Schau: Ich kann ${target.w}. Das klingt richtig. ${cap(target.w)} ist ein Tunwort. Tipp darauf.`;
        const v = others.find((o) => o.kind === 'T');
        const pl = target.pl ? `, viele ${target.pl}` : '';
        return `Schau: ${ein(target)} ${target.w}${pl}. Das klingt richtig. Aber: Ich kann ${v.w}. ${cap(v.w)} tut man. Tipp auf ${target.w}.`;
      },
    });
    if (!ctx.active) return;
    reveal(right.node, target);
    await ctx.sleep(300);
    await ctx.say(consolidate(target));
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 2 und 3: in Körbe sortieren ---------------- */
  async function taskSort(ctx, kinds) {
    let pool = NOUNS.concat(VERBS);
    if (kinds.includes('W')) pool = pool.concat(ADJ_SORT);
    if (kinds.includes('W') && ctx.flow > 0 && U.chance(0.4)) pool = ABSTRACT;
    const target = ctx.item(pool, (x) => x.w, { avoid: 6 });
    const showPic = !(kinds.includes('W') && ctx.flow > 0);
    const card = el('div.wor-card', wordNode(target, { pic: showPic, big: true }));
    const word = card.firstChild;
    const sayBtn = LT.ui.speakButton(() => target.w, { cls: 'wor-card-say' });
    card.appendChild(sayBtn);
    ctx.stage.appendChild(card);
    const box = el('div.choices.wor-bins' + (kinds.length === 2 ? '.wor-two' : ''));
    ctx.stage.appendChild(box);
    await ctx.instruct(`${cap(target.w)}. In welchen Korb gehört das Wort?`);
    if (!ctx.active) return;
    const items = kinds.map((k) => ({
      content: basketNode(k), correct: k === target.kind, k, say: `${KIND[k].name}. ${KIND[k].q}`,
      className: 'wor-basket ' + KIND[k].cls, aria: KIND[k].name,
    }));
    const tk = target.kind;
    await ctx.choices(items, {
      container: box, shuffle: false, sayButton: true, hintAfter: 1, praise: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Super sortiert!']),
        vary('pS', ['Du hast die Frage gestellt und die Probe gemacht. Wie ein Profi!', 'Du hast erst überlegt und dann sortiert. Sehr schlau!'])),
      explain: (wrong) => {
        const t = target;
        if (tk === 'N' && t.abstract) return `${cap(t.w)} kann man nicht anfassen. Trotzdem kann es ein Namenwort sein. Hör mal: ${t.probe}. Kann man ${t.w} tun? Oder kann etwas ${t.w} sein?`;
        if (tk === 'N') return `Kann man ${t.w} tun? Oder kann etwas ${t.w} sein? ${PROBE.N(t)}`;
        if (tk === 'T') return wrong.k === 'N' ? `Ist ${t.w} ein Mensch, ein Tier oder ein Ding? ${PROBE.T(t)}` : `Sagt ${t.w}, wie etwas ist? ${PROBE.T(t)}`;
        return wrong.k === 'N' ? `Ist ${t.w} ein Mensch, ein Tier oder ein Ding? ${PROBE.W(t)}` : `Kann man ${t.w} tun? ${PROBE.W(t)}`;
      },
      modelSay: () => {
        const t = target;
        if (tk === 'N' && t.abstract) return `Schau: ${t.probe}. ${cap(t.w)} kann man nicht tun, und es sagt nicht, wie etwas ist. ${cap(t.w)} ist ein Namenwort.`;
        if (tk === 'N') return `Schau: ${ein(t)} ${t.w}${t.pl ? `, viele ${t.pl}` : ''}. Das passt. Aber: Ich kann ${t.w}? Das passt nicht. ${cap(t.w)} ist ein Namenwort.`;
        if (tk === 'T') return `Schau: Ich kann ${t.w}. ${cap(t.w)} tut man. Das ist ein Tunwort.`;
        return `Schau: Es ist ${t.w}. So ist etwas. ${cap(t.w)} ist ein Wiewort.`;
      },
    });
    if (!ctx.active) return;
    reveal(word, target);
    card.classList.add('wor-card-' + tk);
    await ctx.sleep(300);
    await ctx.say(consolidate(target));
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 4: Gegenteile ---------------- */
  async function taskOpposite(ctx) {
    const target = ctx.item(ADJ, (x) => `${x.w} → ${x.opp}`, { avoid: 5 });
    const opp = ADJ_BY[target.opp];
    const wrongPool = ADJ.filter((a) => a !== target && a !== opp && a.w !== (opp && opp.near));
    const others = U.sample(wrongPool, ctx.flow > 0 ? 3 : 2).map((a) => ({ w: a.w, dim: a.dim, near: false }));
    if (target.near && others.length) others[0] = { w: target.near, near: true };
    const row = el('div.prompt-box.wor-opp',
      el('span.wor-opp-side', U.emoji(target.e, 'wor-opp-e'), el('span.wor-opp-w', target.w)),
      el('span.wor-opp-arrow', '↔'),
      el('span.wor-opp-side.wor-opp-q', U.emoji('❓', 'wor-opp-e'), el('span.wor-opp-w', '?')));
    ctx.stage.appendChild(row);
    const box = el('div.choices.wor-choices');
    ctx.stage.appendChild(box);
    await ctx.instruct(`Was ist das Gegenteil von ${target.w}?`);
    if (!ctx.active) return;
    const items = [{ w: opp.w, ok: true }, ...others].map((o) => ({
      content: el('span.wor-word', el('span.wor-txt', o.w)), correct: !!o.ok, say: o.w, o, className: 'wor-wtile',
    }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Super!']),
        vary('pO', ['Du hast dir beides vorgestellt. Sehr schlau!', 'Du hast an das andere Ende gedacht. Genau so findet man Gegenteile!'])),
      explain: (wrong) => (wrong.o.near
        ? `${cap(wrong.o.w)} ist so ähnlich wie ${target.w}. Das Gegenteil ist genau andersherum.`
        : `${cap(wrong.o.w)} sagt, ${wrong.o.dim}. Wir suchen ein Wort, das sagt, ${target.dim}. Und zwar genau andersherum als ${target.w}.`),
      hintSay: () => `Tipp: ${cap(target.pic)} ist ${target.w}. Und wie ist ${opp.pic}?`,
      modelSay: () => `Schau: ${cap(target.pic)} ist ${target.w}. ${cap(opp.pic)} ist ${opp.w}. Tipp auf ${opp.w}.`,
    });
    if (!ctx.active) return;
    const q = row.querySelector('.wor-opp-q');
    q.replaceChildren(U.emoji(opp.e, 'wor-opp-e'), el('span.wor-opp-w', opp.w));
    q.classList.add('wor-anim-W');
    await ctx.sleep(300);
    await ctx.say(`${cap(target.w)} und ${opp.w} sind Gegenteile.`);
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 4: Wortart im Satz finden ---------------- */
  async function taskSentence(ctx) {
    const keyOf = (s) => s.text;
    const s = ctx.item(SENT, keyOf, { avoid: 5 });
    const present = ['N', 'T', 'W'].filter((k) => s.words.some((x) => x.k === k));
    const weighted = present.flatMap((k) => (k === 'W' ? [k, k] : [k]));
    const want = U.pick(weighted);
    const K = KIND[want];
    ctx.stage.appendChild(el('div.prompt-box.wor-prompt',
      el('span.wor-badge.' + K.cls, U.emoji(K.icon), el('span', K.name)),
      el('span.wor-ask', K.q)));
    const box = el('div.choices.wor-sent');
    ctx.stage.appendChild(box);
    await ctx.instruct(`Hör zu: ${s.text} Tippe das ${K.name}.`);
    if (!ctx.active) return;
    const firstOf = s.words.find((x) => x.k === want);
    const items = s.words.map((x, i) => ({
      content: el('span.tile-text', x.w), correct: x.k === want, say: x.w, x,
      className: 'wor-stile' + (i === s.words.length - 1 ? ' wor-last' : ''),
    }));
    const p = ctx.choices(items, {
      container: box, shuffle: false, hintAfter: 2, praise: false, ease: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Gefunden!']),
        vary('pX', [`Du hast gefragt: ${K.q} Super Trick!`, 'Du hast jedes Wort genau geprüft. Toll!'])),
      explain: (wrong) => {
        const w = wrong.x;
        if (w.k === 'B') return `${cap(w.w)} ist ein Begleiter. Er steht vor einem Namenwort. Wir suchen das ${K.name}.`;
        if (w.k === '-') return `${cap(w.w)} ist ein kleines Hilfswort. Wir suchen das ${K.name}. Frag: ${K.q}`;
        return `${cap(w.w)} ist ein ${KIND[w.k].name}. Wir suchen das ${K.name}. Frag: ${K.q}`;
      },
      hintSay: () => (want === 'N' ? 'Tipp: Namen sind auch Namenwörter. Und vor vielen Namenwörtern steht der, die oder das.'
        : want === 'T' ? 'Tipp: Wer kommt im Satz vor? Und was tut er?' : 'Tipp: Welches Wort sagt, wie es ist?'),
      modelSay: () => (want === 'N' ? `Schau: ${firstOf.w} ist ein Mensch, ein Tier oder ein Ding. ${firstOf.w} ist das Namenwort.`
        : want === 'T' ? `Schau: ${firstOf.w}. Das tut man. ${cap(firstOf.w)} ist das Tunwort.`
          : `Schau: ${firstOf.w}. So ist es. ${cap(firstOf.w)} ist das Wiewort.`),
    });
    const right = await p;
    if (!ctx.active) return;
    box.querySelectorAll('.wor-stile').forEach((t) => {
      const k = t._item && t._item.x.k;
      if (k === 'N' || k === 'T' || k === 'W') t.classList.add('wor-mark', KIND[k].cls);
    });
    await ctx.sleep(300);
    await ctx.say(`${cap(right.x.w)} ist das ${K.name}.`);
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 5: Einzahl und Mehrzahl ---------------- */
  const hasUml = (s) => /[äöüÄÖÜ]/.test(s);
  async function taskPlural(ctx) {
    const pool = NOUNS.filter((n) => n.pl);
    const target = ctx.item(pool, (x) => `${x.w} → ${x.pl}`, { avoid: 6 });
    const wrongs = [{ w: target.w, same: true }, ...target.bad.map((b) => ({ w: b }))];
    const nW = ctx.flow > 0 ? 3 : 2;
    const chosen = [wrongs[0]].concat(U.sample(wrongs.slice(1), nW - 1));
    const one = el('span.wor-pl-side', el('span.wor-pl-lbl', 'ein' + (target.a === 'die' ? 'e' : '')), U.emoji(target.e, 'wor-pl-e'), el('span.wor-pl-w', target.w));
    const many = el('span.wor-pl-side.wor-pl-many', el('span.wor-pl-lbl', 'viele'),
      el('span.wor-pl-es', U.emoji(target.e, 'wor-pl-e2'), U.emoji(target.e, 'wor-pl-e2'), U.emoji(target.e, 'wor-pl-e2')),
      el('span.wor-pl-w.wor-gap', 'die ?'));
    ctx.stage.appendChild(el('div.prompt-box.wor-pl', one, el('span.wor-opp-arrow', '→'), many));
    const box = el('div.choices.wor-choices');
    ctx.stage.appendChild(box);
    const artOne = target.a === 'die' ? 'Eine' : 'Ein';
    await ctx.instruct(`${artOne} ${target.w}. Und viele?`);
    if (!ctx.active) return;
    const items = [{ w: target.pl, ok: true }, ...chosen].map((o) => ({
      content: el('span.wor-word', el('span.wor-txt', o.w)), correct: !!o.ok, say: o.w, o, className: 'wor-wtile',
    }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    const umlRight = hasUml(target.pl) && !hasUml(target.w);
    await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Super!']),
        vary('pP', ['Du hast es leise ausprobiert und genau hingehört. Sehr schlau!', 'Du hast auf das Ende und die Pünktchen geachtet. Toll!'])),
      explain: (wrong) => {
        if (wrong.o.same) return `${cap(target.w)} heißt nur eins. Bei vielen verändert sich das Wort.`;
        if (hasUml(wrong.o.w) && !umlRight) return `Schau mal auf die Pünktchen. Sag es laut. Klingt das richtig?`;
        return `Sag es laut: viele ${wrong.o.w}. Klingt das richtig?`;
      },
      hintSay: () => (umlRight ? 'Tipp: In der Mehrzahl bekommt dieses Wort zwei Pünktchen.' : 'Tipp: Hier gibt es keine Pünktchen. Hör auf das Ende.'),
      modelSay: () => `Schau: ${artOne.toLowerCase()} ${target.w}, viele ${target.pl}. Tipp auf ${target.pl}.`,
    });
    if (!ctx.active) return;
    const gap = many.querySelector('.wor-gap');
    gap.textContent = 'die ' + target.pl;
    gap.classList.add('wor-gap-done');
    await ctx.sleep(300);
    await ctx.say(vary('cP', [
      `${artOne} ${target.w}, viele ${target.pl}. In der Mehrzahl heißt es immer: die ${target.pl}.`,
      `${artOne} ${target.w}, viele ${target.pl}.`,
    ]));
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 5: groß oder klein? ---------------- */
  const CAPS = [];
  SENT.forEach((s) => s.words.forEach((x, i) => {
    if (i > 0 && ['N', 'T', 'W'].includes(x.k) && !['Flo', 'Mia', 'Ben', 'Opa'].includes(x.w) && !CAPS.some((c) => c.x.w === x.w)) CAPS.push({ s, i, x, key: `Groß? ${x.w}` });
  }));
  async function taskCaps(ctx) {
    const c = ctx.item(CAPS, (x) => x.key, { avoid: 6 });
    const isN = c.x.k === 'N';
    const rightW = c.x.w;
    const wrongW = isN ? rightW.charAt(0).toLowerCase() + rightW.slice(1) : cap(rightW);
    const line = el('div.prompt-box.wor-capline');
    c.s.words.forEach((x, i) => line.appendChild(i === c.i ? el('span.wor-cw.wor-gap', '?') : el('span.wor-cw', x.w)));
    line.appendChild(el('span.wor-cw', '.'));
    ctx.stage.appendChild(line);
    const box = el('div.choices.wor-choices');
    ctx.stage.appendChild(box);
    await ctx.instruct(`Hör zu: ${c.s.text} Welches Wort ist richtig geschrieben?`);
    if (!ctx.active) return;
    const items = [{ w: rightW, ok: true }, { w: wrongW }].map((o) => ({
      content: el('span.wor-word', el('span.wor-txt', o.w)), correct: !!o.ok, o, className: 'wor-wtile wor-captile', aria: o.w,
    }));
    await ctx.choices(items, {
      container: box, hintAfter: 1, praise: false,
      correctSay: () => proc(ctx, vary('ok', ['Richtig!', 'Genau!', 'Super!']),
        isN ? 'Du hast gefragt: Was ist es? Wie ein Schulkind!' : 'Du hast überlegt: Ist das ein Namenwort? Sehr schlau!'),
      explain: () => (isN
        ? `Schau mal: Ist ${rightW} ein Mensch, ein Tier, eine Pflanze oder ein Ding? Dann ist es ein Namenwort. Wie schreibt man Namenwörter?`
        : c.x.k === 'T' ? `Ist ${rightW} ein Mensch, ein Tier oder ein Ding? Nein, das tut man. Wie schreibt man Tunwörter?`
          : `Ist ${rightW} ein Mensch, ein Tier oder ein Ding? Nein, so ist etwas. Wie schreibt man Wiewörter?`),
      modelSay: () => (isN ? `Schau: ${rightW} ist ein Namenwort. Namenwörter schreibt man groß.`
        : `Schau: ${rightW} ist ein ${KIND[c.x.k].name}. Das schreibt man klein.`),
    });
    if (!ctx.active) return;
    const gap = line.querySelector('.wor-gap');
    gap.textContent = rightW;
    gap.classList.add('wor-gap-done', KIND[c.x.k].cls);
    await ctx.sleep(300);
    await ctx.say(isN ? `${rightW} ist ein Namenwort. Namenwörter schreibt man groß.` : `${cap(rightW)} ist ein ${KIND[c.x.k].name}. Das schreibt man klein.`);
    await ctx.sleep(400);
  }

  /* ---------------- Spiel ---------------- */
  LT.registerGame({
    id: 'wortarten',
    area: 'deutsch1',
    title: 'Wörter-Sortierer',
    icon: '🗂️',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Hallo! Heute sortieren wir Wörter. Jede Wortart hat ihre eigene Frage.',
    parent: {
      skill: 'Wortarten erkennen: Namenwort, Tunwort, Wiewort; Gegenteile, Einzahl und Mehrzahl, Großschreibung',
      goal: 'Ihr Kind unterscheidet Namenwörter (Was ist es?), Tunwörter (Was tut man?) und Wiewörter (Wie ist es?) mit einfachen Proben, findet sie im Satz, bildet Gegenteile und die Mehrzahl und weiß, dass Namenwörter großgeschrieben werden (Sprache untersuchen, Klasse 1).',
      levels: [
        'Namenwort finden: Menschen, Tiere, Pflanzen und Dinge (Probe: ein Hund – viele Hunde, im Vergleich zu „Ich kann laufen“) – Brücke aus der Vorschule; beim Steigern kommt ein Wiewort als Ablenker dazu',
        'Tunwörter dazu: Tunwort finden und Wörter in die Körbe Namenwort oder Tunwort sortieren (Probe: Ich kann …); beim Steigern ein Ablenker mehr',
        'Drei Körbe: Namenwort, Tunwort, Wiewort; beim Steigern ohne Bild und mit Namenwörtern, die man nicht anfassen kann (die Angst)',
        'Wiewörter: Gegenteile finden (Falle: fast gleiche Wörter wie groß und riesig) und Wortarten in einem Satz finden',
        'Einzahl und Mehrzahl (Hund – Hunde, Haus – Häuser) und Großschreibung im Satz – Niveau Ende Klasse 1',
      ],
      tip: 'Spielen Sie „Wörter-Korb“: Sie sagen ein Wort, Ihr Kind zeigt mit der Hand – Faust für Namenwort, Hüpfer für Tunwort, Daumen für Wiewort. Die Proben helfen: „ein/eine …, viele …?“, „Ich kann …?“, „Es ist …?“. Beim Einkaufen: „Ein Apfel – viele …?“',
    },

    async task(ctx) {
      // Jede Stufe bringt neue Inhalte (neue Wortart, neue Aufgabenart). Steigern (flow +1)
      // bleibt deshalb innerhalb der eigenen Stufe: mehr Ablenker, ohne Bild, abstrakte
      // Namenwörter. Nur in den Stufen 1 bis 3 darf es bei Schwierigkeiten eine Stufe
      // leichter werden; 4 und 5 bleiben stabil.
      const level = ctx.level >= 4 ? ctx.level : Math.min(ctx.level, ctx.taskLevel);
      if (ctx.index === 0) introduced = new Set();
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (level === 1) return taskFind(ctx, 'N');
      if (level === 2) return ctx.index % 2 === 0 ? taskSort(ctx, ['N', 'T']) : taskFind(ctx, 'T');
      if (level === 3) return taskSort(ctx, ['N', 'T', 'W']);
      if (level === 4) return ctx.index % 2 === 0 ? taskOpposite(ctx) : taskSentence(ctx);
      return ctx.index % 3 === 2 ? taskCaps(ctx) : taskPlural(ctx);
    },
  });
})();
