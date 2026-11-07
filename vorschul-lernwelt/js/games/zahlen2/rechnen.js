/* ==========================================================================
   Spiel „Rechengeschichten“ (rechnen) – erstes Plus und Minus.

   Didaktik:
   - Rechnen beginnt mit Handlungen: Dinge kommen DAZU (Addition) oder gehen
     WEG (Subtraktion). Jede Aufgabe ist eine kleine Bildgeschichte mit
     Animation, die Flo erzählt („Auf dem Ast sitzen 3 Vögel. Dann fliegen
     2 Vögel dazu. Wie viele sind es jetzt?“).
   - Das Bild bleibt immer sichtbar – das Kind kann jedes Ding antippen und
     mitzählen (Eins-zu-eins-Zuordnung). Die Geschichte lässt sich mit dem
     🔁-Knopf beliebig oft nochmal ansehen.
   - Die Dinge stehen in Fünfergruppen; beim Plus bleiben die beiden Teile
     sichtbar getrennt (Teil + Teil = Ganzes).
   - Stufen (konkret → bildlich → symbolisch):
       1  Plus bis 5         („3 und 2 sind zusammen 5“)
       2  Plus bis 10        (nach der Lösung erscheint die Rechnung 3 + 2 = 5)
       3  Minus bis 5        („Jetzt sind noch 3 Enten da“)
       4  Minus bis 10       (nach der Lösung erscheint die Rechnung 7 − 3 = 4)
       5  gemischt; die Rechnung „3 + 2 = ?“ steht UNTER dem Bild
   - Hilfe nach 2 Fehlversuchen: Flo zählt gemeinsam mit dem Kind ab und
     zeigt dabei auf jedes Ding. Nach dem 3. Fehlversuch leuchtet die Lösung.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z2;

  const v = Z.verb;

  /* ---------------- Geschichten (sorgfältig auf Grammatik geprüft) ----------------
     Jede Szene: Emoji, Singular/Plural, Genus (für ein/eine/einen), Hintergrund,
     Animation beim Dazukommen (in) und Weggehen (out) und Satzbausteine.
     s.nom(n) → „ein Vogel“ / „3 Vögel“, s.acc(n) → „einen Apfel“ / „3 Äpfel“,
     p = Person { n: Name, g } – nur für Szenen mit handelnder Person.             */
  const SCENES = [
    {
      id: 'voegel', e: '🐦', sg: 'Vogel', pl: 'Vögel', g: 'm', bg: 'ast', in: 'fly', out: 'fly',
      start: (a, s) => `Auf dem Ast ${v(a, 'sitzt', 'sitzen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} weg.`,
    },
    {
      id: 'enten', e: '🦆', sg: 'Ente', pl: 'Enten', g: 'f', bg: 'teich', in: 'side', out: 'side',
      start: (a, s) => `Im Teich ${v(a, 'schwimmt', 'schwimmen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'schwimmt', 'schwimmen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'schwimmt', 'schwimmen')} ${s.nom(b)} weg.`,
    },
    {
      id: 'aepfel', e: '🍎', sg: 'Apfel', pl: 'Äpfel', g: 'm', bg: 'korb', in: 'drop', out: 'up', person: true,
      start: (a, s) => `Im Korb ${v(a, 'liegt', 'liegen')} ${s.nom(a)}.`,
      plus: (b, s, p) => `Dann legt ${p.n} ${s.acc(b)} dazu.`,
      minus: (b, s, p) => `Dann nimmt ${p.n} ${s.acc(b)} heraus.`,
    },
    {
      id: 'kekse', e: '🍪', sg: 'Keks', pl: 'Kekse', g: 'm', bg: 'teller', in: 'drop', out: 'eat', person: true,
      start: (a, s) => `Auf dem Teller ${v(a, 'liegt', 'liegen')} ${s.nom(a)}.`,
      plus: (b, s, p) => `Dann legt ${p.n} ${s.acc(b)} dazu.`,
      minus: (b, s, p) => `Dann isst ${p.n} ${s.acc(b)}.`,
    },
    {
      id: 'erdbeeren', e: '🍓', sg: 'Erdbeere', pl: 'Erdbeeren', g: 'f', bg: 'schuessel', in: 'drop', out: 'eat', person: true,
      start: (a, s) => `In der Schüssel ${v(a, 'liegt', 'liegen')} ${s.nom(a)}.`,
      plus: (b, s, p) => `Dann legt ${p.n} ${s.acc(b)} dazu.`,
      minus: (b, s, p) => `Dann isst ${p.n} ${s.acc(b)}.`,
    },
    {
      id: 'ballons', e: '🎈', sg: 'Luftballon', pl: 'Luftballons', g: 'm', bg: 'himmel', in: 'rise', out: 'float', person: true,
      start: (a, s, p) => `${p.n} hat ${s.acc(a)}.`,
      plus: (b, s, p) => `Dann bekommt ${Z.pron(p)} ${s.acc(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} weg.`,
      question: (s, p) => `Wie viele Luftballons hat ${p.n} jetzt?`,
    },
    {
      id: 'autos', e: '🚗', sg: 'Auto', pl: 'Autos', g: 'n', bg: 'parkplatz', in: 'side', out: 'side',
      start: (a, s) => `Auf dem Parkplatz ${v(a, 'steht', 'stehen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'kommt', 'kommen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'fährt', 'fahren')} ${s.nom(b)} weg.`,
    },
    {
      id: 'kaefer', e: '🐞', sg: 'Marienkäfer', pl: 'Marienkäfer', g: 'm', bg: 'blatt', in: 'side', out: 'fly',
      start: (a, s) => `Auf dem Blatt ${v(a, 'sitzt', 'sitzen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'krabbelt', 'krabbeln')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} weg.`,
    },
    {
      id: 'hasen', e: '🐰', sg: 'Hase', pl: 'Hasen', g: 'm', bg: 'wiese', in: 'hop', out: 'hop',
      start: (a, s) => `Auf der Wiese ${v(a, 'sitzt', 'sitzen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'hoppelt', 'hoppeln')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'hoppelt', 'hoppeln')} ${s.nom(b)} weg.`,
    },
    {
      id: 'schmetterlinge', e: '🦋', sg: 'Schmetterling', pl: 'Schmetterlinge', g: 'm', bg: 'blumen', in: 'fly', out: 'fly',
      start: (a, s) => `Auf der Blumenwiese ${v(a, 'sitzt', 'sitzen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'flattert', 'flattern')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'flattert', 'flattern')} ${s.nom(b)} weg.`,
    },
    {
      id: 'pinguine', e: '🐧', sg: 'Pinguin', pl: 'Pinguine', g: 'm', bg: 'eis', in: 'side', out: 'dive',
      start: (a, s) => `Auf der Eisscholle ${v(a, 'steht', 'stehen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'watschelt', 'watscheln')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'springt', 'springen')} ${s.nom(b)} ins Wasser.`,
    },
    {
      id: 'froesche', e: '🐸', sg: 'Frosch', pl: 'Frösche', g: 'm', bg: 'ufer', in: 'hop', out: 'dive',
      start: (a, s) => `Am Teich ${v(a, 'sitzt', 'sitzen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'hüpft', 'hüpfen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'hüpft', 'hüpfen')} ${s.nom(b)} ins Wasser.`,
    },
    {
      id: 'fische', e: '🐟', sg: 'Fisch', pl: 'Fische', g: 'm', bg: 'meer', in: 'side', out: 'side',
      start: (a, s) => `Im Meer ${v(a, 'schwimmt', 'schwimmen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'schwimmt', 'schwimmen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'schwimmt', 'schwimmen')} ${s.nom(b)} weg.`,
    },
    {
      id: 'bienen', e: '🐝', sg: 'Biene', pl: 'Bienen', g: 'f', bg: 'blumen', in: 'fly', out: 'fly',
      start: (a, s) => `An den Blumen ${v(a, 'summt', 'summen')} ${s.nom(a)}.`,
      plus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} dazu.`,
      minus: (b, s) => `Dann ${v(b, 'fliegt', 'fliegen')} ${s.nom(b)} weg.`,
    },
    {
      id: 'muscheln', e: '🐚', sg: 'Muschel', pl: 'Muscheln', g: 'f', bg: 'strand', in: 'drop', out: 'up', person: true,
      start: (a, s, p) => `${p.n} hat ${s.acc(a)} gesammelt.`,
      plus: (b, s, p) => `Dann findet ${Z.pron(p)} noch ${s.acc(b)}.`,
      minus: (b, s, p) => `Dann verschenkt ${Z.pron(p)} ${s.acc(b)}.`,
      question: (s, p) => `Wie viele Muscheln hat ${p.n} jetzt?`,
    },
  ];

  /** Deko je Hintergrund (nie dasselbe Bild wie die gezählten Dinge!). */
  const DECO = {
    ast: [['🍃', 'l'], ['🍃', 'r']],
    blumen: [['🌷', 'l'], ['🌼', 'r']],
    himmel: [['☁️', 'tl'], ['☁️', 'tr']],
    wiese: [['🌼', 'r']],
    strand: [['🌊', 'tr']],
  };

  /* ---------------- Stufen ---------------- */
  function pairsPlus(sumLo, sumHi) {
    const out = [];
    for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= sumHi; b++) if (a + b >= sumLo) out.push({ op: '+', a, b, c: a + b });
    return out;
  }
  function pairsMinus(aLo, aHi, bMax) {
    const out = [];
    for (let a = aLo; a <= aHi; a++) for (let b = 1; b < a && b <= bMax; b++) out.push({ op: '-', a, b, c: a - b });
    return out;
  }
  const POOLS = {
    1: pairsPlus(2, 5),
    2: pairsPlus(6, 10),
    3: pairsMinus(2, 5, 4),
    4: pairsMinus(6, 10, 5),
    '5+': pairsPlus(3, 10),
    '5-': pairsMinus(3, 10, 6),
  };

  const INTRO = {
    1: 'Hier kommen Rechengeschichten! Hör gut zu und schau genau hin.',
    2: 'Jetzt kommen noch mehr dazu – bis zehn!',
    3: 'Jetzt gehen welche weg. Wie viele bleiben übrig?',
    4: 'Jetzt gehen welche weg – bis zehn!',
    5: 'Jetzt schreiben wir die Rechnung dazu! Plus heißt: Es kommen welche dazu. Minus heißt: Es gehen welche weg.',
  };

  function makeTask(level) {
    let key = String(level);
    if (level === 5) key = U.chance(0.5) ? '5+' : '5-';
    return U.pickFresh('rc-' + key, POOLS[key], 6, (t) => t.op + t.a + '-' + t.b);
  }

  /* ---------------- Animation: Start-/Zielversatz relativ zur Szene ---------------- */
  function offset(kind, r, sr, i, dir) {
    const stagger = i * 12;
    switch (kind) {
      case 'fly':
        return { x: sr.right - r.left + 20 + stagger, y: sr.top - r.bottom - 20 - stagger, s: 0.7 };
      case 'side':
      case 'hop':
        return { x: sr.right - r.left + 20 + stagger * 3, y: 0, s: 1, flip: dir === 'out' };
      case 'drop':
        return { x: 0, y: sr.top - r.bottom - 10 - stagger, s: 1 };
      case 'rise':
        return { x: 0, y: sr.bottom - r.top + 10 + stagger, s: 1 };
      case 'up':
        return { x: 0, y: -r.height * 1.6, s: 0.8 };
      case 'float':
        return { x: (i % 2 ? 1 : -1) * 20, y: sr.top - r.bottom - 30, s: 0.9 };
      case 'dive':
        return { x: 0, y: r.height * 0.9, s: 0.3 };
      default:
        return { x: 0, y: 0, s: 0 };
    }
  }
  const tf = (o) => `translate(${Math.round(o.x)}px, ${Math.round(o.y)}px) scale(${o.s})${o.flip ? ' scaleX(-1)' : ''}`;

  /* ---------------- Spiel ---------------- */
  LT.registerGame({
    id: 'rechnen',
    area: 'zahlen',
    title: 'Rechengeschichten',
    icon: '➕',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Erstes Rechnen (Plus & Minus)',
      goal: 'Ihr Kind erlebt Rechnen als Geschichte: Dinge kommen dazu (Addition) oder gehen weg (Subtraktion). Es übersetzt Handlungen in Zahlen und lernt in der höchsten Stufe die Rechenzeichen +, − und = kennen. Das Bild bleibt immer zum Abzählen sichtbar; die Geschichte kann beliebig oft wiederholt werden.',
      levels: [
        'Plus bis 5',
        'Plus bis 10 (danach wird die Rechnung gezeigt)',
        'Minus bis 5',
        'Minus bis 10 (danach wird die Rechnung gezeigt)',
        'Gemischt mit Rechnung unter dem Bild (3 + 2 = ?)',
      ],
      tip: 'Erfinden Sie Rechengeschichten im Alltag: „Auf dem Teller liegen 4 Erdbeeren. Du isst eine. Wie viele sind noch da?“ Lassen Sie Ihr Kind mit Fingern, Bausteinen oder Nudeln nachspielen – erst handeln, dann rechnen.',
    },

    async task(ctx) {
      const level = ctx.level;
      const t = makeTask(level);
      const scene = U.pickFresh('rc-scene', SCENES, 6, (x) => x.id);
      const person = Z.name();
      const s = { nom: (n) => Z.nom(n, scene), acc: (n) => Z.acc(n, scene) };
      const plus = t.op === '+';
      const showEqFirst = level === 5;
      const showEqAfter = level === 2 || level === 4;
      const opWord = plus ? 'plus' : 'minus';
      const opSign = plus ? '+' : '−';

      // --- Texte ---
      const startText = scene.start(t.a, s, person);
      const changeText = plus ? scene.plus(t.b, s, person) : scene.minus(t.b, s, person);
      const question = scene.question
        ? scene.question(s, person)
        : plus ? `Wie viele ${scene.pl} sind es jetzt?` : `Wie viele ${scene.pl} sind jetzt noch da?`;
      const eqText = `${t.a} ${opWord} ${t.b} gleich wie viel?`;
      let okText;
      if (level === 1) okText = `Richtig! ${t.a} und ${t.b} sind zusammen ${t.c}.`;
      else if (level === 3) okText = t.c === 1 ? `Genau! Jetzt ist nur noch ${s.nom(1)} da.` : `Genau! Jetzt sind noch ${t.c} ${scene.pl} da.`;
      else if (level === 4) okText = `Genau, noch ${t.c}! ${t.a} minus ${t.b} gleich ${t.c}.`;
      else okText = `Richtig! ${t.a} ${opWord} ${t.b} gleich ${t.c}.`;
      ctx.setInstruction(`${startText} ${changeText} ${showEqFirst ? eqText + ' ' : ''}${question}`);

      // --- Szene aufbauen ---
      const sceneEl = el('div.rc-scene.rc-bg-' + scene.bg);
      (DECO[scene.bg] || []).forEach(([e, pos]) => sceneEl.appendChild(el('span.rc-deco.rc-deco-' + pos, { 'aria-hidden': 'true' }, U.emoji(e))));
      const itemsBox = el('div.rc-items');
      const makeGroup = (n) => el('div.rc-group', { style: { gridTemplateColumns: `repeat(${Math.min(n, 5)}, var(--rc-s))` } });
      const makeItem = () => el('button.rc-item', { type: 'button', 'aria-label': scene.sg }, U.emoji(scene.e));
      const groupA = makeGroup(t.a);
      const itemsA = [];
      for (let i = 0; i < t.a; i++) { const it = makeItem(); itemsA.push(it); groupA.appendChild(it); }
      itemsBox.appendChild(groupA);
      const itemsB = [];
      if (plus) {
        const groupB = makeGroup(t.b);
        groupB.classList.add('rc-groupb');
        for (let i = 0; i < t.b; i++) { const it = makeItem(); itemsB.push(it); groupB.appendChild(it); }
        itemsBox.appendChild(groupB);
      }
      sceneEl.appendChild(itemsBox);
      sceneEl.appendChild(el('div.rc-ground'));
      const replay = el('button.rc-replay', { type: 'button', 'aria-label': 'Geschichte nochmal ansehen', title: 'Nochmal ansehen' }, U.emoji('🔁'));
      sceneEl.appendChild(replay);
      ctx.stage.appendChild(sceneEl);

      const eqBox = el('div.rc-eqwrap');
      ctx.stage.appendChild(eqBox);
      const choicesBox = el('div.choices.rc-choices');
      ctx.stage.appendChild(choicesBox);

      const allItems = itemsA.concat(itemsB);
      const leaving = plus ? [] : itemsA.slice(t.c); // die letzten b gehen weg
      const remaining = plus ? allItems : itemsA.slice(0, t.c);
      const resetCount = Z.tapToCount(ctx, allItems, (b) => !b.classList.contains('rc-gone') && !b.classList.contains('rc-away'));

      /* --- Geschichte abspielen (auch per 🔁 wiederholbar) --- */
      let storyToken = 0;
      function setState(nodes, transform, opacity, transition) {
        nodes.forEach((n) => {
          n.style.transition = transition || 'none';
          n.style.transform = transform ? transform(n) : '';
          n.style.opacity = opacity;
        });
      }
      function resetScene() {
        resetCount();
        Z.clearBadges(sceneEl);
        allItems.forEach((n) => {
          n.classList.remove('rc-gone', 'rc-away', 'rc-eating', 'rc-hopping');
          n.style.transition = 'none';
          n.style.transform = '';
          n.style.opacity = '';
        });
        if (plus) {
          // Startversatz der Neuankömmlinge berechnen (natürliche Position messen)
          const sr = sceneEl.getBoundingClientRect();
          itemsB.forEach((n, i) => {
            const r = n.getBoundingClientRect();
            n._from = offset(scene.in, r, sr, i, 'in');
          });
          setState(itemsB, (n) => tf(n._from), '0');
          itemsB.forEach((n) => n.classList.add('rc-away'));
        }
      }
      async function animateChange(token) {
        await Z.frame();
        if (token !== storyToken || !ctx.active) return;
        if (plus) {
          LT.sfx.play('whoosh');
          itemsB.forEach((n, i) => {
            const d = i * 0.18;
            n.classList.remove('rc-away');
            if (scene.in === 'hop') n.classList.add('rc-hopping');
            n.style.transition = `transform 1s cubic-bezier(.25,.8,.35,1) ${d}s, opacity .35s ${d}s`;
            n.style.transform = '';
            n.style.opacity = '1';
            ctx.timeout(() => { n.classList.remove('rc-hopping'); LT.sfx.play('pop'); }, 1000 + d * 1000);
          });
        } else {
          const sr = sceneEl.getBoundingClientRect();
          leaving.forEach((n, i) => {
            const d = i * 0.2;
            n.classList.add('rc-away');
            if (scene.out === 'eat') {
              n.style.animationDelay = d + 's';
              n.classList.add('rc-eating');
              ctx.timeout(() => LT.sfx.tone(260, 0.06, { type: 'square', volume: 0.12 }), 300 + d * 1000);
            } else {
              const r = n.getBoundingClientRect();
              if (scene.out === 'hop') n.classList.add('rc-hopping');
              n.style.transition = `transform 1s cubic-bezier(.5,0,.75,.6) ${d}s, opacity .6s ${d + 0.45}s`;
              n.style.transform = tf(offset(scene.out, r, sr, i, 'out'));
              n.style.opacity = '0';
            }
          });
          LT.sfx.play('whoosh');
          ctx.timeout(() => {
            if (token !== storyToken) return;
            leaving.forEach((n) => { n.classList.remove('rc-hopping'); n.classList.add('rc-gone'); });
          }, 1300 + leaving.length * 200);
        }
        await ctx.sleep(1100 + (plus ? itemsB.length : leaving.length) * 190);
      }
      async function playStory() {
        const token = ++storyToken;
        resetScene();
        await ctx.say(startText);
        if (token !== storyToken || !ctx.active) return false;
        await ctx.sleep(250);
        await Promise.all([ctx.say(changeText), animateChange(token)]);
        return token === storyToken;
      }
      ctx.listen(replay, 'click', async () => {
        LT.sfx.play('click');
        if (await playStory()) ctx.say(question);
      });

      /* --- Rechnung (Stufe 5 vorher, Stufe 2/4 nach der Lösung) --- */
      let eqQ = null;
      function showEquation(withAnswer) {
        U.clear(eqBox);
        eqQ = el('span.rc-eq-n.rc-eq-q', withAnswer ? String(t.c) : '?');
        const eq = el('button.rc-eq', { type: 'button', 'aria-label': `${t.a} ${opWord} ${t.b} gleich ${withAnswer ? t.c : 'wie viel'}` },
          el('span.rc-eq-n', String(t.a)), el('span.rc-eq-op', opSign), el('span.rc-eq-n', String(t.b)),
          el('span.rc-eq-op', '='), eqQ);
        ctx.listen(eq, 'click', () => ctx.say(eqQ.textContent === '?' ? eqText : `${t.a} ${opWord} ${t.b} gleich ${t.c}.`));
        eqBox.appendChild(eq);
        if (withAnswer) eqQ.classList.add('rc-eq-done');
      }

      // --- Ablauf ---
      if (ctx.index === 0) await ctx.say(INTRO[level]);
      if (!ctx.active) return;
      await ctx.sleep(150);
      await playStory();
      if (!ctx.active) return;
      if (showEqFirst) {
        showEquation(false);
        await ctx.say(`Die Rechnung heißt: ${t.a} ${opWord} ${t.b}.`);
        if (!ctx.active) return;
      }
      ctx.say(question);

      const options = Z.options(t.c, level === 1 || level === 3 ? 3 : 4, 0, 10, plus ? [t.a, t.c + 1] : [t.a, t.b]).map((k) => ({
        content: String(k), text: true, correct: k === t.c, say: Z.word(k),
      }));
      await ctx.choices(options, {
        container: choicesBox,
        shuffle: false,
        size: 'small',
        hintAfter: 3,
        correctSay: okText,
        onCorrect: () => {
          resetCount();
          if (showEqFirst && eqQ) {
            eqQ.textContent = String(t.c);
            eqQ.classList.add('rc-eq-done');
          } else if (showEqAfter) {
            showEquation(true);
          }
        },
        // nach dem 2. Fehlversuch zählt Flo gemeinsam mit dem Kind ab
        onWrong: async (item, tile, wrongs) => {
          if (wrongs !== 2) return;
          storyToken++; // laufende Wiederholung abbrechen
          if (plus) {
            itemsB.forEach((n) => { n.classList.remove('rc-away'); n.style.transition = 'none'; n.style.transform = ''; n.style.opacity = '1'; });
          } else {
            leaving.forEach((n) => n.classList.add('rc-gone'));
          }
          resetCount();
          await ctx.say(plus ? 'Komm, wir zählen alle zusammen!' : 'Komm, wir zählen zusammen, wie viele noch da sind!');
          await Z.countAlong(ctx, remaining);
        },
      });
      if (!ctx.active) return;
      await ctx.sleep(500);
    },
  });
})();
