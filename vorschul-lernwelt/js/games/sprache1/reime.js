/* ==========================================================================
   Spiel „Reime-Spaß“ (reime) – Reime erkennen.

   Didaktik:
   - Reimerkennung ist die erste, leichteste Stufe der phonologischen
     Bewusstheit: Das Kind lernt, vom Inhalt eines Wortes (Maus = Tier)
     wegzuhören und auf seinen KLANG zu achten.
   - Das Kind kann nicht lesen: Flo nennt zuerst jedes Bild (sonst wüsste das
     Kind nicht, ob 🐰 „Hase“ oder „Kaninchen“ heißen soll). Jede Kachel hat
     zusätzlich einen 🔊-Knopf.
   - Nach jeder Antwort wird die Erkenntnis ausgesprochen: „Maus reimt sich
     auf Haus.“ Bei Fehlern hört das Kind den direkten Klangvergleich
     („Maus – Kuh. Das reimt sich nicht.“), nach 2 Fehlversuchen wird die
     Lösung hervorgehoben und vorgesprochen.
   - Kuratierte Reimgruppen (Standardaussprache geprüft: gleicher betonter
     Vokal inkl. Länge und gleicher Auslaut). Ablenker stammen immer aus einer
     Gruppe mit ANDEREM Vokal – so entstehen keine „Fast-Reime“ (Mais/Hai),
     die ein Kind verunsichern könnten.
   - Stufen:
       1  Was reimt sich? 2 Bilder, einsilbige Wörter (Maus – Haus)
       2  Was reimt sich? 3 Bilder, einsilbige Wörter
       3  Welches Wort reimt sich NICHT? 3–4 Bilder (Odd one out)
       4  Längere Wörter: Rakete – Trompete, Krone – Zitrone, Socke – Glocke
       5  Reimpaare finden: 6 Bilder, je zwei reimen sich
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S = LT.s1;

  /* ------------------------------------------------------------------
     Reimgruppen: v = betonter Vokal (Klangklasse), w = [Emoji, Wort, Silben]
     Jede Gruppe reimt sich vollständig. Zwischen den Gruppen gibt es KEINE
     Reime (auch keine unreinen).
     ------------------------------------------------------------------ */
  const GROUPS = [
    // einsilbig bzw. Reim auf betonter Schlusssilbe
    { v: 'au', w: [['🐭', 'Maus', 1], ['🏠', 'Haus', 1]] },
    { v: 'au', w: [['🦚', 'Pfau', 1], ['👩', 'Frau', 1]] },
    { v: 'u', w: [['🐄', 'Kuh', 1], ['👟', 'Schuh', 1]] },
    { v: 'ei', w: [['🌽', 'Mais', 1], ['🍦', 'Eis', 1], ['🍚', 'Reis', 1]] },
    { v: 'a', w: [['🐳', 'Wal', 1], ['🧣', 'Schal', 1]] },
    { v: 'u', w: [['🐶', 'Hund', 1], ['👄', 'Mund', 1]] },
    { v: 'o', w: [['🍞', 'Brot', 1], ['⛵', 'Boot', 1]] },
    { v: 'a', w: [['🐓', 'Hahn', 1], ['🦷', 'Zahn', 1], ['🦢', 'Schwan', 1]] },
    { v: 'u', w: [['🚌', 'Bus', 1], ['🥜', 'Nuss', 1]] },
    { v: 'ei', w: [['🥚', 'Ei', 1], ['🦈', 'Hai', 1], ['🦜', 'Papagei', 3]] },
    { v: 'ei', w: [['🐷', 'Schwein', 1], ['🦵', 'Bein', 1]] },
    { v: 'o', w: [['👂', 'Ohr', 1], ['🥅', 'Tor', 1]] },
    { v: 'e', w: [['⛺', 'Zelt', 1], ['🌍', 'Welt', 1], ['💰', 'Geld', 1]] },
    { v: 'e', w: [['🧚', 'Fee', 1], ['❄️', 'Schnee', 1], ['🍵', 'Tee', 1], ['🍀', 'Klee', 1]] },
    { v: 'a', w: [['✋', 'Hand', 1], ['🏖️', 'Strand', 1], ['🐘', 'Elefant', 3]] },
    // zwei- und mehrsilbig
    { v: 'o', w: [['👖', 'Hose', 2], ['🌹', 'Rose', 2], ['🥫', 'Dose', 2]] },
    { v: 'a', w: [['🐰', 'Hase', 2], ['👃', 'Nase', 2]] },
    { v: 'a', w: [['🐒', 'Affe', 2], ['🦒', 'Giraffe', 3]] },
    { v: 'au', w: [['🍇', 'Traube', 2], ['🕊️', 'Taube', 2], ['🔩', 'Schraube', 2]] },
    { v: 'ei', w: [['🧼', 'Seife', 2], ['🎀', 'Schleife', 2]] },
    { v: 'o', w: [['🧦', 'Socke', 2], ['🔔', 'Glocke', 2]] },
    { v: 'e', w: [['🚀', 'Rakete', 3], ['🎺', 'Trompete', 3]] },
    { v: 'o', w: [['👑', 'Krone', 2], ['🍋', 'Zitrone', 3], ['🍉', 'Melone', 3]] },
    { v: 'a', w: [['🍌', 'Banane', 3], ['🚩', 'Fahne', 2]] },
    { v: 'i', w: [['👓', 'Brille', 2], ['🦗', 'Grille', 2]] },
    { v: 'a', w: [['👜', 'Tasche', 2], ['🍼', 'Flasche', 2]] },
    { v: 'i', w: [['🏝️', 'Insel', 2], ['🖌️', 'Pinsel', 2]] },
    { v: 'ü', w: [['🌉', 'Brücke', 2], ['🦟', 'Mücke', 2]] },
    { v: 'o', w: [['☎️', 'Telefon', 3], ['🎤', 'Mikrofon', 3]] },
  ];

  const ALL = [];
  GROUPS.forEach((g, gi) => {
    g.items = g.w.map(([e, w, n]) => {
      const x = { e: S.fe0f(e), w, n, g: gi, v: g.v };
      ALL.push(x);
      return x;
    });
  });
  const groupIdx = GROUPS.map((g, i) => i);

  const INTRO = {
    1: 'Wir suchen Reime! Wörter reimen sich, wenn sie am Ende gleich klingen – wie Maus und Haus.',
    2: 'Wir suchen Reime! Hör gut zu, welches Wort am Ende gleich klingt.',
    3: 'Jetzt wird es knifflig: Fast alle Wörter reimen sich – nur eines nicht. Findest du es?',
    4: 'Jetzt kommen längere Wörter. Hör ganz genau auf das Ende!',
    5: 'Hier reimen sich immer zwei Bilder. Tippe zwei Bilder an, die sich reimen!',
  };

  /* ------------------------------------------------------------------
     Auswahl-Helfer
     ------------------------------------------------------------------ */
  /** n Ablenker: anderer Vokal als `v`, jede aus einer anderen Gruppe. */
  function distractors(v, n, filter, excludeGroups = []) {
    const usedG = new Set(excludeGroups);
    const out = [];
    for (const x of U.shuffle(ALL.filter((y) => y.v !== v && filter(y)))) {
      if (out.length >= n) break;
      if (usedG.has(x.g)) continue;
      usedG.add(x.g);
      out.push(x);
    }
    return out;
  }
  const join = (list) => (list.length <= 1 ? list.join('') : list.slice(0, -1).join(', ') + ' und ' + list[list.length - 1]);

  /** Bilder zeigen, Frage vorlesen, Bilder benennen, dann antworten lassen. */
  async function askChoices(ctx, items, question, opts) {
    const box = el('div.choices.s1-choices');
    ctx.stage.appendChild(box);
    const lock = S.lock(ctx, box);
    const p = ctx.choices(items, Object.assign({ container: box, sayButton: true, size: items.length <= 3 ? 'large' : undefined, className: items.length === 4 ? 's1-grid4' : '' }, opts));
    if (ctx.index === 0) await ctx.say(INTRO[ctx.level]);
    await ctx.instruct(question);
    await S.nameTiles(ctx, box);
    // Für „Nochmal hören“: Frage UND Bildnamen
    ctx.setInstruction(question + ' ' + items.map((i) => i.say).join(', ') + '.');
    lock.release();
    return p;
  }

  /* ------------------------------------------------------------------
     Stufen 1, 2, 4: Was reimt sich auf …?
     ------------------------------------------------------------------ */
  async function whatRhymes(ctx, multi) {
    let target, rhyme, dis;
    if (!multi) {
      const monoGroups = groupIdx.filter((i) => GROUPS[i].items.filter((x) => x.n === 1).length >= 2);
      const gi = U.pickFresh('reime-mono', monoGroups, 6);
      [target, rhyme] = U.sample(GROUPS[gi].items.filter((x) => x.n === 1), 2);
      dis = distractors(target.v, ctx.level === 1 ? 1 : 2, (y) => y.n === 1);
    } else {
      const targets = ALL.filter((x) => x.n >= 2);
      target = U.pickFresh('reime-multi', targets, 8, (x) => x.w);
      const partners = GROUPS[target.g].items.filter((x) => x !== target);
      rhyme = U.pick(partners.filter((x) => x.n >= 2).length && U.chance(0.75) ? partners.filter((x) => x.n >= 2) : partners);
      // Ein Ablenker hat die gleiche Länge wie das Reimwort (keine Längen-Abkürzung)
      const d1 = distractors(target.v, 1, (y) => y.n === rhyme.n, [target.g]);
      const d2 = distractors(target.v, 1, (y) => y.n >= 2, [target.g].concat(d1.map((d) => d.g)));
      dis = d1.concat(d2);
    }
    const card = S.card(target);
    ctx.stage.appendChild(card);
    const items = [rhyme].concat(dis).map((x) => ({ content: x.e, say: x.w, correct: x === rhyme, x }));
    await askChoices(ctx, items, `Was reimt sich auf ${target.w}?`, {
      correctSay: (it) => S.vary('reime-ok', [
        `Richtig! ${target.w} reimt sich auf ${it.x.w}.`,
        `Genau! ${target.w} – ${it.x.w}. Das reimt sich!`,
        `Super! ${target.w} und ${it.x.w} klingen am Ende gleich.`,
      ]),
      wrongSay: (it) => `${target.w} – ${it.x.w}. Das reimt sich nicht. Hör noch mal genau hin!`,
      hintSay: () => `Hör mal: ${target.w} – ${rhyme.w}. Das klingt am Ende gleich!`,
      onCorrect: () => LT.ui.animate(card, 'joy'),
    });
  }

  /* ------------------------------------------------------------------
     Stufe 3: Welches Wort reimt sich nicht?
     ------------------------------------------------------------------ */
  async function oddOneOut(ctx) {
    const gi = U.pickFresh('reime-odd', groupIdx, 8);
    const g = GROUPS[gi];
    const k = g.items.length >= 3 && U.chance(0.6) ? 3 : 2;
    const rhymers = U.sample(g.items, k);
    const len = rhymers[0].n;
    let odd = distractors(g.v, 1, (y) => y.n === len, [gi])[0] || distractors(g.v, 1, () => true, [gi])[0];
    const items = rhymers.concat([odd]).map((x) => ({ content: x.e, say: x.w, correct: x === odd, x }));
    ctx.stage.appendChild(el('div.s1-head', U.emoji('👂'), el('span', 'Was reimt sich nicht?')));
    const names = rhymers.map((x) => x.w);
    await askChoices(ctx, items, 'Hör gut zu! Welches Wort reimt sich nicht?', {
      correctSay: () => `Richtig! ${odd.w} reimt sich nicht. ${join(names)} reimen sich.`,
      wrongSay: (it) => {
        const other = rhymers.find((x) => x !== it.x);
        return `${it.x.w} – ${other.w}. Die reimen sich doch! Welches Wort klingt am Ende anders?`;
      },
      hintSay: () => `Hör mal: ${join(names)}. Und ${odd.w}?`,
    });
  }

  /* ------------------------------------------------------------------
     Stufe 5: Reimpaare finden (eigene Bedienung)
     ------------------------------------------------------------------ */
  async function pairs(ctx) {
    // drei Gruppen mit verschiedenen Vokalen → keine Verwechslungsgefahr
    const chosen = [];
    for (const gi of U.shuffle(groupIdx)) {
      if (chosen.length >= 3) break;
      if (chosen.some((c) => GROUPS[c].v === GROUPS[gi].v)) continue;
      chosen.push(gi);
    }
    const cards = U.shuffle(chosen.flatMap((gi) => U.sample(GROUPS[gi].items, 2)));
    const head = el('div.s1-head', U.emoji('🎵'), el('span', 'Finde die Reimpaare!'));
    const grid = el('div.s1-pairs');
    const tiles = cards.map((c) => {
      const t = LT.ui.tile(c.e, { say: c.w });
      t._c = c;
      grid.appendChild(t);
      return t;
    });
    ctx.stage.append(head, grid);
    const lock = S.lock(ctx, grid);

    let sel = null;
    let busy = false;
    let found = 0;
    let colorIdx = 0;
    let finish;
    const done = new Promise((r) => (finish = r));
    const open = () => tiles.filter((t) => !t.classList.contains('s1-matched'));
    const partnerOf = (t) => open().find((o) => o !== t && o._c.g === t._c.g);

    // Testmodus: immer genau das nächste richtige Bild markieren
    function updateMark() {
      if (!LT.config.test) return;
      tiles.forEach((t) => ctx.markTest(t, false));
      if (busy || lock.locked) return;
      const next = sel ? partnerOf(sel) : open()[0];
      if (next) ctx.markTest(next, true);
    }

    async function help() {
      const a = sel || open()[0];
      const b = partnerOf(a);
      if (!a || !b) return;
      tiles.forEach((t) => t.classList.remove('s1-sel'));
      sel = a;
      a.classList.add('s1-sel');
      ctx.hint(b);
      await ctx.say(`Ich helfe dir: Was reimt sich auf ${a._c.w}?`);
    }

    tiles.forEach((t) => {
      t.addEventListener('click', async () => {
        if (busy || lock.locked || t.classList.contains('s1-matched') || !ctx.active) return;
        if (sel === t) {
          // nochmal antippen = abwählen
          t.classList.remove('s1-sel');
          sel = null;
          ctx.say(t._c.w);
          updateMark();
          return;
        }
        if (!sel) {
          sel = t;
          t.classList.add('s1-sel');
          LT.sfx.play('pop');
          ctx.say(t._c.w);
          updateMark();
          return;
        }
        const a = sel;
        const b = t;
        busy = true;
        updateMark();
        b.classList.add('s1-sel');
        if (a._c.g === b._c.g) {
          const pc = 's1-pc' + colorIdx++;
          [a, b].forEach((x) => {
            ctx.unhint(x);
            x.classList.remove('s1-sel');
            x.classList.add('s1-matched', pc);
          });
          sel = null;
          found++;
          await ctx.correct(b, { say: `${a._c.w} – ${b._c.w}. Das reimt sich!` });
          a.classList.add('is-correct');
          if (found >= 3) {
            await ctx.say(S.vary('reime-alle', ['Super! Du hast alle Reimpaare gefunden!', 'Klasse! Alle Reime gefunden!']));
            finish();
            return;
          }
        } else {
          await ctx.wrong(null, { say: `${a._c.w} – ${b._c.w}. Das reimt sich nicht.` });
          LT.ui.animate(a, 'shake');
          LT.ui.animate(b, 'shake');
          a.classList.remove('s1-sel');
          b.classList.remove('s1-sel');
          sel = null;
          if (ctx.wrongCount >= 2) await help();
        }
        busy = false;
        updateMark();
      });
    });

    if (ctx.index === 0) await ctx.say(INTRO[5]);
    await ctx.instruct('Finde die Reimpaare! Tippe zwei Bilder an, die sich reimen.');
    // Bilder benennen
    for (const t of tiles) {
      if (!ctx.active) return;
      t.classList.add('speaking');
      await ctx.say(t._c.w);
      t.classList.remove('speaking');
      await ctx.sleep(120);
    }
    ctx.setInstruction('Finde die Reimpaare! ' + cards.map((c) => c.w).join(', ') + '.');
    lock.release();
    updateMark();
    await done;
  }

  LT.registerGame({
    id: 'reime',
    area: 'sprache',
    title: 'Reime-Spaß',
    icon: '🎵',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Reime erkennen (phonologische Bewusstheit)',
      goal: 'Ihr Kind lernt, auf den Klang von Wörtern zu hören statt nur auf ihre Bedeutung: Wörter reimen sich, wenn sie ab dem betonten Vokal gleich klingen (Maus – Haus). Reime zu erkennen ist der Einstieg in die phonologische Bewusstheit – eine der wichtigsten Grundlagen für das Lesen- und Schreibenlernen.',
      levels: [
        'Stufe 1: Was reimt sich? 2 Bilder, kurze Wörter (Maus – Haus, Kuh – Schuh)',
        'Stufe 2: Was reimt sich? 3 Bilder zur Auswahl',
        'Stufe 3: Welches Wort reimt sich nicht? (3–4 Bilder)',
        'Stufe 4: Längere Wörter (Rakete – Trompete, Krone – Zitrone, Socke – Glocke)',
        'Stufe 5: Reimpaare finden – 6 Bilder, je zwei reimen sich',
      ],
      tip: 'Reimen Sie im Alltag: „Ich kenne ein Wort, das reimt sich auf Maus …“ Lesen Sie Reimgeschichten und Kinderverse vor und lassen Sie Ihr Kind das letzte Reimwort ergänzen. Auch Quatschreime („Tisch – Wisch – Pisch“) sind ausdrücklich erlaubt: Sie zeigen, dass Ihr Kind auf den Klang achtet!',
    },

    async task(ctx) {
      if (ctx.level === 5) return pairs(ctx);
      if (ctx.level === 3) return oddOneOut(ctx);
      return whatRhymes(ctx, ctx.level === 4);
    },
  });
})();
