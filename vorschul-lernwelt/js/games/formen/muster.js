/* ==========================================================================
   Spiel „Muster-Kette“ 📿 – Muster erkennen, fortsetzen und ergänzen.

   Didaktik:
   - Muster erkennen ist eine Vorstufe des algebraischen Denkens: Das Kind
     sucht die Regel („rot, blau – immer abwechselnd“) und wendet sie an.
   - Nach der Lösung spricht Flo das Muster rhythmisch vor, während die
     Perlen nacheinander hüpfen („rot, blau, rot, blau …“) – Sehen, Hören und
     Rhythmus verankern die Regel gemeinsam.
   - Hilfe nach 2 Fehlversuchen: Die sich wiederholende Einheit wird farbig
     unterlegt und gegliedert vorgesprochen („rot, blau – rot, blau – …“).
   - Tippt das Kind daneben, nennt Flo die angetippte Perle („Grün passt hier
     nicht.“) – ohne Druck, mit einer neuen Chance.
   - Progression:
       1  AB-Muster mit Farben (Perlenkette), ein Platz
       2  AAB / ABB / AABB mit Farben oder AB mit Formen, zwei Plätze
       3  ABC-Muster und Muster mit zwei Merkmalen (Form UND Farbe) –
          Ablenker teilen jeweils ein Merkmal, genaues Hinsehen ist nötig
       4  Lücke in der Mitte füllen (Regel vorwärts und rückwärts anwenden)
       5  Wachsende und schrumpfende Muster (Türme/Perlenstäbe: 1, 2, 3, …)
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const FM = LT.fm;

  const UNITS = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], AABB: [0, 0, 1, 1], ABC: [0, 1, 2] };
  /** Gut unterscheidbare Formen (keine Paare wie Quadrat/Rechteck oder Kreis/Oval). */
  const PSHAPES = ['kreis', 'dreieck', 'quadrat', 'stern', 'herz'];
  /** Deklinierbare Farbwörter für „roter Kreis“ usw. */
  const DCOLORS = ['rot', 'blau', 'gelb', 'gruen'];

  /* ------------------------------------------------------------------
     Elemente einer Kette: { mode: 'color'|'shape'|'both', color, shape }
     ------------------------------------------------------------------ */
  const keyOf = (e) => `${e.mode}:${e.shape || ''}:${e.color}`;
  const same = (a, b) => keyOf(a) === keyOf(b);
  /** Name im Muster-Sprechgesang: „rot“ / „Kreis“ / „roter Kreis“ */
  function chantName(e) {
    if (e.mode === 'color') return FM.color(e.color).adj;
    if (e.mode === 'shape') return FM.SHAPES[e.shape].name;
    return `${FM.adj(e.color, FM.SHAPES[e.shape].g)} ${FM.SHAPES[e.shape].name}`;
  }
  /** Name mit Artikel (Nominativ): „Grün“ / „der Stern“ / „das gelbe Dreieck“ */
  function defName(e) {
    if (e.mode === 'color') return FM.color(e.color).name;
    if (e.mode === 'shape') return FM.def(e.shape);
    const s = FM.SHAPES[e.shape];
    const art = s.g === 'm' ? 'der' : s.g === 'f' ? 'die' : 'das';
    return `${art} ${FM.color(e.color).adj}e ${s.name}`;
  }
  function render(e) {
    if (e.mode === 'color') return FM.bead(e.color);
    return FM.shape(e.shape, e.color, { scale: e.shape === 'stern' || e.shape === 'herz' ? 0.98 : 0.86 });
  }

  /** Elemente für ein Muster mit k verschiedenen Bausteinen erzeugen. */
  function makeElements(mode, k) {
    if (mode === 'color') return FM.distinctColors(k).map((c) => ({ mode, color: c }));
    if (mode === 'shape') {
      const c = U.pick(FM.VIVID);
      return U.sample(PSHAPES, k).map((s) => ({ mode, shape: s, color: c }));
    }
    const cs = U.sample(DCOLORS, k);
    return U.sample(PSHAPES, k).map((s, i) => ({ mode, shape: s, color: cs[i] }));
  }
  /** Ein Element, das NICHT im Muster vorkommt (Ablenker). */
  function novel(mode, used) {
    for (let i = 0; i < 40; i++) {
      let e;
      if (mode === 'color') {
        const c = U.pick(FM.VIVID);
        if (used.some((u) => u.color === c || FM.similar(u.color, c))) continue;
        e = { mode, color: c };
      } else if (mode === 'shape') {
        const s = U.pick(PSHAPES);
        if (used.some((u) => u.shape === s)) continue;
        e = { mode, shape: s, color: used[0].color };
      } else {
        e = { mode, shape: U.pick(PSHAPES), color: U.pick(DCOLORS) };
        if (used.some((u) => same(u, e))) continue;
      }
      return e;
    }
    return null;
  }

  /** Antwortmöglichkeiten: richtig + andere Bausteine + Ablenker (bei zwei Merkmalen:
      gleiche Form/andere Farbe bzw. gleiche Farbe/andere Form). */
  function optionsFor(correct, elements) {
    const opts = [correct];
    const add = (e) => { if (e && !opts.some((o) => same(o, e)) && opts.length < 4) opts.push(e); };
    if (correct.mode === 'both') {
      const otherColor = DCOLORS.filter((c) => c !== correct.color);
      add({ mode: 'both', shape: correct.shape, color: U.pick(otherColor) });
      const otherShape = elements.map((e) => e.shape).filter((s) => s !== correct.shape);
      add({ mode: 'both', shape: U.pick(otherShape), color: correct.color });
      elements.forEach(add);
    } else {
      elements.forEach(add);
      add(novel(correct.mode, elements));
    }
    return opts;
  }

  /* ------------------------------------------------------------------
     Kette zeichnen
     ------------------------------------------------------------------ */
  function chainView(seq, holes, mode) {
    const chain = el('div.muster-chain' + (mode === 'color' ? '.beads' : '.shapes'), { style: { '--n': String(seq.length) } });
    const cells = seq.map((e, i) => {
      const hole = holes.includes(i);
      const c = el('span.muster-cell' + (hole ? '.muster-slot' : ''), hole ? el('span.muster-q', '?') : render(e));
      chain.appendChild(c);
      return c;
    });
    return { chain, cells };
  }

  /** Muster rhythmisch vorsprechen, Perlen hüpfen nacheinander mit. */
  async function chant(ctx, cells, seq, prefix) {
    const text = (prefix ? prefix + ' ' : '') + seq.map(chantName).join(', ') + '!';
    const speech = ctx.say(text);
    if (prefix) await ctx.sleep(700);
    for (let i = 0; i < cells.length; i++) {
      if (!ctx.active) return;
      const c = cells[i];
      c.classList.add('muster-bounce');
      ctx.timeout(() => c.classList.remove('muster-bounce'), 420);
      await ctx.sleep(seq[i].mode === 'both' ? 620 : 440);
    }
    await speech;
  }

  /** Hilfe: Einheiten farbig unterlegen und gegliedert vorsprechen
      („rot, blau – rot, blau – rot, …“). Lücken werden nicht verraten:
      In der Mitte heißt es „Lücke“, beim Fortsetzen endet der Satz davor. */
  async function showUnits(ctx, cells, seq, unitLen, holes, gapMode, question) {
    cells.forEach((c, i) => c.classList.add(Math.floor(i / unitLen) % 2 ? 'muster-u1' : 'muster-u0'));
    let text = '';
    for (let j = 0; j < seq.length; j++) {
      if (j > 0) text += j % unitLen === 0 ? ' – ' : ', ';
      if (holes.includes(j)) {
        if (!gapMode) { text += '…'; break; }
        text += 'Lücke';
      } else text += chantName(seq[j]);
    }
    await ctx.say(`Schau, immer wieder: ${text}${text.endsWith('…') ? '' : '.'} ${question}`);
  }

  /* ------------------------------------------------------------------
     Stufen 1–4: Kette fortsetzen bzw. Lücke füllen
     ------------------------------------------------------------------ */
  async function patternTask(ctx) {
    const lv = ctx.level;
    let unitName;
    let mode;
    if (lv === 1) { unitName = 'AB'; mode = 'color'; }
    else if (lv === 2) {
      if (U.chance(0.3)) { unitName = 'AB'; mode = 'shape'; }
      else { unitName = U.pickFresh('muster-u2', ['AAB', 'ABB', 'AABB'], 1); mode = 'color'; }
    } else if (lv === 3) {
      const r = U.pickFresh('muster-u3', ['ABC-color', 'AB-both', 'ABC-both', 'ABC-shape'], 2);
      [unitName, mode] = r.split('-');
    } else {
      unitName = U.pickFresh('muster-u4', ['AB', 'AAB', 'ABB', 'ABC'], 2);
      mode = U.pick(unitName === 'AB' ? ['color', 'shape', 'both'] : ['color', 'shape']);
    }
    const unit = UNITS[unitName];
    const k = Math.max(...unit) + 1;
    const elements = makeElements(mode, k);

    // Länge: genug Wiederholungen, damit die Regel sichtbar ist – aber passend zur Bildschirmbreite
    const narrow = ctx.stage.clientWidth < 640;
    const maxTotal = narrow ? 8 : 11;
    const gapMode = lv === 4;
    const slots = gapMode ? 1 : lv === 1 ? 1 : 2;
    let total;
    if (gapMode) total = narrow ? 8 : U.pick([8, 9]);
    else {
      const reps = unit.length <= 2 ? 3 : 2;
      const partial = lv === 1 ? 0 : U.randInt(0, unit.length - 1);
      total = Math.min(unit.length * reps + partial + slots, maxTotal);
    }
    const seq = [];
    for (let i = 0; i < total; i++) seq.push(elements[unit[i % unit.length]]);
    let holes;
    if (gapMode) holes = [U.randInt(unit.length, total - 2)];
    else holes = U.range(total - slots, total - 1);

    const { chain, cells } = chainView(seq, holes, mode);
    const wrap = el('div.muster-wrap', chain);
    ctx.stage.appendChild(wrap);
    const choiceBox = el('div.choices.muster-choices');
    ctx.stage.appendChild(choiceBox);

    const q = gapMode ? 'Was fehlt in der Lücke?' : 'Was kommt als Nächstes?';
    const what = mode === 'color' ? 'Perlenkette' : 'Formen-Kette';
    ctx.instruct(gapMode
      ? `In der ${what} fehlt etwas. Was gehört in die Lücke?`
      : `Schau dir die ${what} an. Was kommt als Nächstes?`);

    let hinted = false;
    for (let s = 0; s < holes.length; s++) {
      if (!ctx.active) return;
      const idx = holes[s];
      const correct = seq[idx];
      cells[idx].classList.add('muster-active');
      U.clear(choiceBox);
      choiceBox.classList.remove('locked'); // ctx.choices sperrt den Container nach der richtigen Antwort
      const items = optionsFor(correct, elements).map((e) => ({
        content: render(e),
        correct: same(e, correct),
        e,
        aria: chantName(e),
      }));
      if (s > 0) ctx.instruct('Und was kommt danach?');
      // Fehler zählen je Platz (ctx.wrongCount zählt über die ganze Aufgabe)
      const base = ctx.wrongCount;
      await ctx.choices(items, {
        container: choiceBox,
        className: 'muster-opts',
        praise: true,
        hintAfter: base + 2,
        wrongSay: (it) => `Hmm, ${defName(it.e)} passt hier nicht. Schau noch mal!`,
        onWrong: async (it, tile, n) => {
          if (n - base >= 2 && !hinted) {
            hinted = true;
            await showUnits(ctx, cells, seq, unit.length, holes.slice(s), gapMode, q);
          }
        },
      });
      if (!ctx.active) return;
      const cell = cells[idx];
      cell.classList.remove('muster-slot', 'muster-active');
      U.clear(cell).appendChild(render(correct));
      cell.classList.add('muster-filled');
    }
    U.clear(choiceBox);
    await chant(ctx, cells, seq, 'Hör mal:');
    await ctx.sleep(300);
  }

  /* ------------------------------------------------------------------
     Stufe 5: wachsende/schrumpfende Muster (Türme oder Perlenstäbe)
     ------------------------------------------------------------------ */
  function stack(count, kind, color) {
    const s = el('span.muster-stack.' + kind);
    for (let i = 0; i < count; i++) s.appendChild(kind === 'beads' ? FM.bead(color, { cls: 'muster-sbead' }) : el('i.muster-block', { style: { '--bc': FM.color(color).hex, '--bd': FM.color(color).dark } }));
    return s;
  }

  async function growTask(ctx) {
    const grow = U.chance(0.65);
    const kind = U.pick(['tower', 'beads']);
    const color = U.pick(FM.VIVID);
    const groups = U.pick([3, 4]);
    let counts;
    if (grow) {
      const start = groups === 4 ? 1 : U.randInt(1, 2);
      counts = U.range(start, start + groups);
    } else {
      const start = groups === 4 ? 6 : U.randInt(5, 6);
      counts = U.range(start - groups, start).reverse();
    }
    const answer = counts[counts.length - 1];
    const shown = counts.slice(0, -1);
    const maxC = Math.max(...counts) + 1;

    const row = el('div.muster-grow', { style: { '--max': String(maxC), '--g': String(counts.length) } });
    const cols = shown.map((c) => {
      const col = el('div.muster-gcol', stack(c, kind, color), el('span.muster-gnum', String(c)));
      row.appendChild(col);
      return col;
    });
    const slot = el('div.muster-gcol.muster-gslot', el('span.muster-gq', '?'), el('span.muster-gnum', ''));
    row.appendChild(slot);
    ctx.stage.appendChild(el('div.muster-wrap.muster-wrap-grow', row));
    const choiceBox = el('div.choices.muster-choices.muster-gchoices');
    ctx.stage.appendChild(choiceBox);

    const thing = kind === 'tower' ? 'Türme' : 'Perlenstäbe';
    // Türme werden höher/niedriger, Perlenstäbe länger/kürzer
    const how = kind === 'tower' ? (grow ? 'höher' : 'niedriger') : (grow ? 'länger' : 'kürzer');
    ctx.instruct(`Schau dir die ${thing} an. Sie werden immer ${how}. Welcher kommt als Nächstes?`);

    const optsN = U.uniqueBy([answer - 1, answer, answer + 1].filter((n) => n >= 1), (n) => n);
    if (optsN.length < 3) optsN.push(answer + 2);
    const items = optsN.map((n) => ({ content: stack(n, kind, color), correct: n === answer, n, aria: String(n) }));
    const unitWord = kind === 'tower' ? ['Stein', 'Steine'] : ['Perle', 'Perlen'];
    const oneMore = kind === 'tower' ? 'einen Stein' : 'eine Perle';
    await ctx.choices(items, {
      container: choiceBox,
      shuffle: false,
      className: 'muster-opts muster-gopts',
      correctSay: `Richtig! ${U.cap(FM.nw(answer))} ${answer === 1 ? unitWord[0] : unitWord[1]}.`,
      wrongSay: (it) => `Das ${it.n === 1 ? (kind === 'tower' ? 'ist ein Stein' : 'ist eine Perle') : 'sind ' + FM.nw(it.n) + ' ' + unitWord[1]}. Zähl noch mal nach!`,
      onWrong: async (it, tile, n) => {
        if (n === 2) {
          row.classList.add('show-nums');
          await ctx.say(`Zähl mal mit: ${shown.map((c) => FM.nw(c)).join(', ')} – und dann?`);
        }
      },
    });
    if (!ctx.active) return;
    U.clear(slot).appendChild(stack(answer, kind, color));
    slot.appendChild(el('span.muster-gnum', String(answer)));
    slot.classList.remove('muster-gslot');
    row.classList.add('show-nums');
    U.clear(choiceBox);
    const colsAll = cols.concat([slot]);
    const speech = ctx.say(`${counts.map((c) => FM.nw(c)).join(', ')} – immer ${oneMore} ${grow ? 'mehr' : 'weniger'}!`);
    for (const c of colsAll) {
      if (!ctx.active) return;
      c.classList.add('muster-bounce');
      ctx.timeout(() => c.classList.remove('muster-bounce'), 420);
      await ctx.sleep(480);
    }
    await speech;
    await ctx.sleep(300);
  }

  LT.registerGame({
    id: 'muster',
    area: 'formen',
    title: 'Muster-Kette',
    icon: '📿',
    levels: 5,
    rounds: 5,
    intro: 'Willkommen bei der Muster-Kette! Finde heraus, wie es weitergeht.',
    parent: {
      skill: 'Muster erkennen, fortsetzen und ergänzen',
      goal: 'Ihr Kind entdeckt Regeln in Reihen (z. B. „rot, blau, rot, blau“), setzt sie fort und füllt Lücken. Muster zu erkennen ist eine wichtige Grundlage für Mathematik (Zahlenfolgen, Einmaleins, Algebra) und schult genaues Hinsehen. Das rhythmische Mitsprechen verbindet Sehen und Hören.',
      levels: [
        'Abwechselnde Farben (AB) in einer Perlenkette fortsetzen',
        'Muster wie AAB, ABB, AABB oder Formen im Wechsel – zwei Perlen weiter',
        'Drei Bausteine (ABC) und Muster mit zwei Merkmalen (Form und Farbe gleichzeitig)',
        'Eine Lücke mitten in der Kette füllen',
        'Wachsende und schrumpfende Muster: Türme und Perlenstäbe mit 1, 2, 3 … Teilen',
      ],
      tip: 'Fädeln Sie Perlen oder Nudeln nach Muster auf, legen Sie Muster mit Besteck oder Bausteinen („Löffel, Gabel, Löffel, Gabel …“) und klatschen Sie Rhythmen („klatsch, stampf, klatsch, stampf“). Lassen Sie Ihr Kind auch selbst Muster erfinden!',
    },

    async task(ctx) {
      if (ctx.level <= 4) return patternTask(ctx);
      return growTask(ctx);
    },
  });
})();
