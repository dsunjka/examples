/* ==========================================================================
   Spiel „Silben-Lesen“ 🌈 (Leseschule, Klasse 1) – Silbenschwinger-Lesen

   Didaktik (Silbenmethode, Druckschrift in Groß- und Kleinbuchstaben):
   - Wörter stehen groß in Druckschrift, die Silben abwechselnd BLAU und ROT
     mit Silbenbögen. In Sätzen beginnt jedes Wort wieder mit Blau.
   - Lese-Ablauf (Stufe 1–3):
       1. Silbe für Silbe antippen oder mit dem Finger darüberwischen
          (still – das Kind liest selbst laut),
       2. den großen Bogen unter dem ganzen Wort „schwingen“ (Synthese),
       3. das passende Bild aus drei wählen.
     Das Wort wird VOR der Antwort NICHT vorgelesen – sonst wäre es kein Lesen.
     Erst nach einem Fehlversuch gibt es Audiohilfe (Silben werden hörbar).
   - Gegen Raten nach dem Anfangsbuchstaben: Immer ist ein Bild mit gleichem
     Anlaut dabei (Stufe 3: möglichst gleicher Wortanfang, Hammer/Hamster).
   - Gegen Buchstabe-für-Buchstabe ohne Verschleifen: Flo spricht die Silben
     einzeln vor („Ro … se“) und das Kind schwingt sie selbst zusammen.
   - Stufen:
       1  zweisilbig, offene Silben, lautgetreu (Ma-ma, Ro-se, So-fa)
       2  dreisilbig (To-ma-te, Ba-na-ne, Ra-ke-te)
       3  geschlossene Silben (Kat-ze, Tul-pe, Hams-ter)
       4  Silben-Baustelle: zum Bild (Wort wird NICHT vorgesagt) das Wort aus
          Silbenkarten zusammensetzen, zweisilbig mit Laut-Paketen sch, ei, au,
          eu, ie, ch (Schu-le, Ei-mer, Rau-pe); Ablenker-Silben unterscheiden
          sich nur im Vokal (Schu/Scho), nie gleich klingend (kein Bie/Bi)
       5  kurze Sätze (3–5 Wörter) lesen, passendes Bild aus Minimalpaaren
   - Hilfe-Leiter (Stufe 1–3, 5): 1. Fehler → gewähltes Bild benennen und mit
     dem Wortanfang vergleichen + stiller Lesefinger, 2. → Silben einzeln
     vorsprechen / entscheidende Wörter leuchten, 3. → vormachen.
     Stufe 4: 1. gewählte Silbe und das Bild benennen, 2. gesuchte Silbe
     vorsprechen und eine Ablenker-Karte verschwindet, 3. richtige Karte leuchtet.
     Wiederholtes Tippen derselben falschen Karte zählt nicht doppelt.
   - Lerninhalte (ctx.item): Wort ('Rose') bzw. Satz ('Die Katze schläft.').
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ---------------- Wortlisten: [Silben mit Bindestrich, Emoji, Artikel] ---------------- */
  const RAW = {
    1: [
      ['Ma-ma', '👩', 'die'], ['Pa-pa', '👨', 'der'], ['O-ma', '👵', 'die'], ['O-pa', '👴', 'der'],
      ['Ro-se', '🌹', 'die'], ['Na-se', '👃', 'die'], ['Ho-se', '👖', 'die'], ['Do-se', '🥫', 'die'],
      ['Ha-se', '🐰', 'der'], ['Ze-bra', '🦓', 'das'], ['So-fa', '🛋️', 'das'], ['La-ma', '🦙', 'das'],
      ['Ki-wi', '🥝', 'die'], ['Lu-pe', '🔍', 'die'], ['Di-no', '🦕', 'der'], ['Ka-nu', '🛶', 'das'],
      ['Ju-do', '🥋', 'das'], ['Li-mo', '🥤', 'die'], ['Ku-li', '🖊️', 'der'], ['Mo-fa', '🛵', 'das'],
    ],
    2: [
      ['To-ma-te', '🍅', 'die'], ['Ba-na-ne', '🍌', 'die'], ['Ra-ke-te', '🚀', 'die'], ['Me-lo-ne', '🍉', 'die'],
      ['Zi-tro-ne', '🍋', 'die'], ['Ro-bo-ter', '🤖', 'der'], ['Ra-di-o', '📻', 'das'], ['Ka-me-ra', '📷', 'die'],
      ['Ko-a-la', '🐨', 'der'], ['Ki-mo-no', '👘', 'der'],
    ],
    3: [
      ['Kat-ze', '🐱', 'die'], ['Ker-ze', '🕯️', 'die'], ['Kak-tus', '🌵', 'der'], ['Kür-bis', '🎃', 'der'],
      ['Ham-mer', '🔨', 'der'], ['Hams-ter', '🐹', 'der'], ['Tul-pe', '🌷', 'die'], ['Tor-te', '🎂', 'die'],
      ['Tas-se', '☕', 'die'], ['Pal-me', '🌴', 'die'], ['Pan-da', '🐼', 'der'], ['Pin-sel', '🖌️', 'der'],
      ['Bir-ne', '🍐', 'die'], ['Bril-le', '👓', 'die'], ['Wol-ke', '☁️', 'die'], ['Wür-fel', '🎲', 'der'],
      ['Gur-ke', '🥒', 'die'], ['Mas-ke', '🎭', 'die'], ['Ap-fel', '🍎', 'der'], ['Kof-fer', '🧳', 'der'],
    ],
    4: [
      ['Schu-le', '🏫', 'die'], ['Sche-re', '✂️', 'die'], ['Ta-sche', '👜', 'die'], ['Fla-sche', '🍾', 'die'],
      ['Mu-schel', '🐚', 'die'], ['Schne-cke', '🐌', 'die'], ['Schlan-ge', '🐍', 'die'], ['Sei-fe', '🧼', 'die'],
      ['Ein-horn', '🦄', 'das'], ['Ei-mer', '🪣', 'der'], ['Rau-pe', '🐛', 'die'], ['Ku-chen', '🍰', 'der'],
      ['Dra-chen', '🐉', 'der'], ['Bie-ne', '🐝', 'die'], ['Zie-ge', '🐐', 'die'], ['Stie-fel', '👢', 'der'],
      ['Eu-le', '🦉', 'die'], ['Kir-sche', '🍒', 'die'], ['Feu-er', '🔥', 'das'],
    ],
  };
  const plain = (t) => String(t).replace(/-/g, '');
  const WORDS = {};
  const LEX = [];
  Object.keys(RAW).forEach((lv) => {
    WORDS[lv] = RAW[lv].map(([t, e, a]) => {
      const w = { t, e, a, k: plain(t), syls: t.split('-'), lv: Number(lv) };
      LEX.push(w);
      return w;
    });
  });

  /* ---------------- Stufe 5: Satz-Gruppen (Minimalpaare mit Bild) ---------------- */
  const SETS = [
    [['Die Kat-ze schläft.', '🐱💤'], ['Der Hund schläft.', '🐶💤'], ['Die Kat-ze spielt.', '🐱🧶']],
    [['Der Hund rennt schnell.', '🐶💨'], ['Das Pferd rennt schnell.', '🐴💨'], ['Der Hund frisst ei-nen Kno-chen.', '🐶🦴']],
    [['Der Vo-gel sitzt im Baum.', '🐦🌳'], ['Der Vo-gel sitzt am Haus.', '🐦🏠'], ['Die Kat-ze sitzt im Baum.', '🐱🌳']],
    [['Die Maus isst Kä-se.', '🐭🧀'], ['Die Maus isst ei-nen Ap-fel.', '🐭🍎'], ['Der Bär isst Kä-se.', '🐻🧀']],
    [['Flo liest ein Buch.', '🦊📖'], ['Flo malt ein Bild.', '🦊🎨'], ['O-ma liest ein Buch.', '👵📖']],
    [['Das Kind lacht.', '🧒😄'], ['Das Kind weint.', '🧒😢'], ['O-pa lacht.', '👴😄']],
    [['Die En-te schwimmt im Teich.', '🦆🌊'], ['Die En-te fliegt hoch.', '🦆☁️'], ['Der Fisch schwimmt im Teich.', '🐟🌊']],
    [['Zwei Äp-fel lie-gen da.', '🍎🍎'], ['Drei Äp-fel lie-gen da.', '🍎🍎🍎'], ['Zwei Bir-nen lie-gen da.', '🍐🍐']],
    [['Heu-te reg-net es.', '🌧️'], ['Heu-te scheint die Son-ne.', '☀️'], ['Heu-te schneit es.', '🌨️']],
    [['Ich trin-ke Milch.', '😋🥛'], ['Ich trin-ke Saft.', '😋🧃'], ['Ich es-se Brot.', '😋🍞']],
    [['Der Ro-bo-ter tanzt.', '🤖💃'], ['Der Ro-bo-ter schläft.', '🤖💤'], ['Die Prin-zes-sin tanzt.', '👸💃']],
  ];
  const SENTENCES = [];
  SETS.forEach((set, si) => set.forEach(([t, scene]) => {
    const words = t.replace(/[.!?]$/, '').split(' ');
    SENTENCES.push({ t, scene, si, k: plain(t), words, punct: t.slice(-1) });
  }));

  const KIND = (l) => (l <= 3 ? 'read' : l === 4 ? 'build' : 'sent');
  const lvOf = (ctx) => (KIND(ctx.taskLevel) === KIND(ctx.level) ? ctx.taskLevel : ctx.level);

  const INTRO = {
    1: 'Silben lesen! Tippe die Silben nacheinander an und lies sie laut. Dann schwingst du den großen Bogen und liest das ganze Wort.',
    2: 'Jetzt kommen lange Wörter mit drei Silben: blau, rot, blau. Lies jede Silbe und schwing mit!',
    3: 'Jetzt haben die Silben am Ende noch einen Buchstaben, wie bei Katze. Lies jede Silbe ganz bis zum Ende.',
    4: 'Silben-Baustelle! Schau dir das Bild an. Lies die Silbenkarten und bau das Wort. Achtung: sch, ei, au und ie gehören immer zusammen.',
    5: 'Jetzt liest du ganze Sätze! Lies Wort für Wort, ganz bis zum Punkt. Dann tippe auf das passende Bild.',
  };
  let introduced = new Set();

  /* ---------------- Helfer ---------------- */
  const sylSay = (s) => U.cap(s.toLowerCase());
  const vary = (key, list) => U.pickFresh('sil-' + key, list, Math.min(2, list.length - 1));
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const ORD = ['erste', 'zweite', 'dritte', 'vierte'];
  /** ≤ 3 sichtbare Kacheln (nach ease) → hintAfter 1, sonst 2 (wie LT.z2.hintAfterFor). */
  const hintAfterFor = (ctx, count) => (LT.z2 && LT.z2.hintAfterFor
    ? LT.z2.hintAfterFor(ctx, count)
    : ((ctx.flow < 0 && count >= 4 ? count - 1 : count) <= 3 ? 1 : 2));

  /** Silbenwort-Knoten: Silben blau/rot mit Bögen. */
  function wordNode(text, cls) {
    const syls = text.split('-');
    const node = el('div', { class: 'sil-word' + (cls ? ' ' + cls : ''), style: { '--n': String(plain(text).length) }, 'aria-label': plain(text) });
    node._spans = syls.map((s, i) => {
      const sp = el('span', { class: 'sil-syl ' + (i % 2 ? 'sil-red' : 'sil-blue') }, el('span.sil-txt', s), el('i.sil-arc'));
      sp._syl = s;
      node.appendChild(sp);
      return sp;
    });
    node._syls = syls;
    return node;
  }

  /** Silben nacheinander hervorheben und vorlesen; optional danach das ganze Wort. */
  async function speakSyls(ctx, node, { whole = true, rate } = {}) {
    const spans = node._spans || [];
    for (const sp of spans) {
      if (!ctx.active) return;
      sp.classList.add('sil-on');
      await ctx.say(sylSay(sp._syl), rate ? { rate } : undefined);
      sp.classList.remove('sil-on');
      await ctx.sleep(150);
    }
    if (whole && ctx.active) {
      node.classList.add('sil-all');
      await ctx.say(plain(node._syls.join('-')));
    }
  }

  /** Stiller Lesefinger: Silben leuchten nacheinander auf. */
  async function silentFinger(ctx, spans, ms = 520) {
    for (const sp of spans) {
      if (!ctx.active) return;
      sp.classList.add('sil-on');
      await ctx.sleep(ms);
      sp.classList.remove('sil-on');
    }
  }

  /** Ablenker-Bilder: einer mit gleichem Anlaut (gegen Raten), Rest aus dem Pool. */
  function pickDistractors(target, pool, n, level) {
    const pics = LEX.filter((w) => w.k !== target.k && w.e !== target.e);
    const res = [];
    const sameStart = pics.filter((w) => w.k.slice(0, 2).toLowerCase() === target.k.slice(0, 2).toLowerCase());
    const sameFirst = pics.filter((w) => w.k[0].toLowerCase() === target.k[0].toLowerCase());
    const prefer = level >= 3 && sameStart.length ? sameStart : sameFirst.length ? sameFirst : sameStart;
    if (prefer.length) res.push(U.pick(prefer.filter((w) => w.lv === target.lv).length ? prefer.filter((w) => w.lv === target.lv) : prefer));
    const rest = U.shuffle(pool.filter((w) => w.k !== target.k && w.e !== target.e && !res.includes(w)));
    // zweiten Ablenker bevorzugt mit anderem Anlaut (Vielfalt)
    rest.sort((x, y) => (x.k[0] === target.k[0]) - (y.k[0] === target.k[0]));
    while (res.length < n && rest.length) res.push(rest.shift());
    return res;
  }

  /* ======================================================================
     Stufe 1–3: Silben antippen → Bogen schwingen → Bild wählen
     ====================================================================== */
  async function readWord(ctx, level) {
    const pool = WORDS[level];
    const target = ctx.item(pool, (w) => w.k, { avoid: 6 });
    let nDis = 2;
    if (level === 1 && ctx.flow < 0) nDis = 1;
    if (level >= 2 && ctx.flow > 0) nDis = 3;
    const others = pickDistractors(target, pool, nDis, level);

    const word = wordNode(target.t, 'sil-big');
    const bow = el('button.sil-bow', { type: 'button', 'aria-label': 'Bogen schwingen' },
      el('span.sil-bow-arc'), el('span.sil-bow-ball', '●'), el('span.sil-bow-label', U.emoji('👉'), ' Schwing den Bogen!'));
    const card = el('div.prompt-box.sil-card', word, bow);
    ctx.stage.classList.add('sil-stage');
    ctx.stage.appendChild(card);

    let audible = false; // Audiohilfe erst nach einem Fehlversuch
    let next = 0;
    let doneSyls;
    const sylsDone = new Promise((r) => { doneSyls = r; });
    let outOfOrderSaid = false;
    const spans = word._spans;
    ctx.markTest(spans[0]);

    function activate(i) {
      const sp = spans[i];
      if (i === next) {
        sp.classList.add('sil-read');
        ctx.markTest(sp, false);
        LT.sfx.play('tap');
        next++;
        if (next < spans.length) ctx.markTest(spans[next]);
        else doneSyls();
        if (audible) ctx.say(sylSay(sp._syl));
      } else if (i < next) {
        // schon gelesen: nochmal aufleuchten (nach Fehlversuch mit Ton)
        sp.classList.add('sil-on');
        ctx.timeout(() => sp.classList.remove('sil-on'), 500);
        if (audible) ctx.say(sylSay(sp._syl));
      } else {
        LT.ui.animate(sp, 'shake');
        spans[next].classList.add('sil-pulse');
        if (!outOfOrderSaid) { outOfOrderSaid = true; ctx.say(next === 0 ? 'Fang vorne an, bei der blauen Silbe.' : 'Immer der Reihe nach, von links nach rechts.'); }
      }
    }
    spans.forEach((sp, i) => {
      sp.addEventListener('pointerdown', (e) => { e.preventDefault(); activate(i); });
      sp.addEventListener('click', (e) => { if (e.detail === 0) activate(i); }); // Tastatur/Test ohne Zeiger
    });
    // Wischen: Finger gleitet über die Silben
    ctx.listen(word, 'pointermove', (e) => {
      if (!e.buttons && e.pointerType === 'mouse') return;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const sp = hit && hit.closest && hit.closest('.sil-syl');
      const i = spans.indexOf(sp);
      if (i === next) activate(i);
    });
    word.addEventListener('pointerdown', (e) => { try { word.releasePointerCapture(e.pointerId); } catch (err) { /* egal */ } });

    const firstTime = ctx.index === 0 || !introduced.has('read-instr-' + level);
    introduced.add('read-instr-' + level);
    ctx.instruct(firstTime ? 'Tippe die Silben nacheinander an und lies sie laut.' : vary('syl-instr', ['Lies Silbe für Silbe. Tippe mit!', 'Tipp die Silben an und lies mit.', 'Erst blau, dann rot. Lies Silbe für Silbe!']));
    await sylsDone;
    if (!ctx.active) return;

    // Phase 2: großen Bogen schwingen (Synthese)
    card.classList.add('sil-ready');
    ctx.markTest(bow);
    let swung;
    const bowDone = new Promise((r) => { swung = r; });
    let swinging = false;
    const doSwing = async () => {
      if (swinging) return;
      swinging = true;
      ctx.markTest(bow, false);
      bow.classList.add('sil-swing');
      LT.sfx.play('whoosh');
      await ctx.sleep(750);
      word.classList.add('sil-all');
      swung();
    };
    bow.addEventListener('pointerdown', (e) => { e.preventDefault(); doSwing(); });
    bow.addEventListener('click', doSwing);
    ctx.say(firstTime ? 'Jetzt schwing den großen Bogen und lies das ganze Wort!' : vary('bow', ['Und jetzt zusammen: Schwing den Bogen!', 'Schwing den Bogen und lies das Wort!', 'Jetzt das ganze Wort!']));
    ctx.setInstruction('Schwing den großen Bogen und lies das ganze Wort.');
    await bowDone;
    if (!ctx.active) return;
    await ctx.sleep(250);
    if (!ctx.active) return;

    // Phase 3: Bild wählen
    ctx.instruct(vary('pic', ['Welches Bild passt?', 'Was hast du gelesen? Tippe auf das Bild.', 'Welches Bild gehört zu dem Wort?']));
    const items = [target, ...others].map((w) => ({ content: w.e, correct: w === target, say: w.k, w }));
    // ≤ 3 sichtbare Bilder → Hilfe-Leiter schon nach dem 1. Fehler (engine.md, LT.z2.hintAfterFor)
    const ha = hintAfterFor(ctx, items.length);
    await ctx.choices(items, {
      size: 'large',
      sayButton: true,
      className: 'sil-pics',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx,
        vary('ok', ['Richtig gelesen!', 'Super gelesen!', 'Genau!', 'Toll, du hast es gelesen!']),
        vary('proc', ['Super! Du hast Silbe für Silbe gelesen und dann zusammengeschwungen.', 'Toll, du hast bis zum Ende gelesen, nicht nur den Anfang!', 'Prima! Erst die Silben, dann das ganze Wort. So lesen echte Leser.'])),
      explain: (item) => {
        const w = item.w;
        if (w.k[0].toLowerCase() === target.k[0].toLowerCase()) return `Das Bild heißt ${w.k}. Der Anfang passt, aber lies bis zum Ende.`;
        return `Das Bild heißt ${w.k}. ${w.k} fängt mit ${sylSay(w.syls[0])} an. Schau dir die blaue Silbe genau an.`;
      },
      hintSay: 'Schwing die Silben in deinem Kopf zusammen. Welches Bild passt?',
      modelSay: 'Hier ist das passende Bild.',
      // Reihenfolge der Engine: explain → onWrong → (bei n === hintAfter) hintSay
      onWrong: async (item, tile, n) => {
        // Audiohilfe ab dem 1. Fehler: Silben EINZELN vorsprechen, das Kind schwingt selbst
        // zusammen. Ab jetzt sind die Silben auch beim Antippen hörbar (wird angesagt).
        audible = true;
        if (n > ha) {
          await ctx.say('Ich lese es dir vor.');
          await speakSyls(ctx, word, { rate: 0.8 });
        } else if (n === 1) {
          await ctx.say('Hör gut zu. Ich sage dir die Silben einzeln.');
          await speakSyls(ctx, word, { whole: false, rate: 0.8 });
          if (ctx.active) await ctx.say('Du kannst die Silben jetzt auch antippen, dann lese ich mit.');
        } else {
          await silentFinger(ctx, spans);
        }
      },
    });
    if (!ctx.active) return;
    word.classList.remove('sil-all');
    await speakSyls(ctx, word);
    await ctx.sleep(350);
  }

  /* ======================================================================
     Stufe 4: Silben-Baustelle – Wort aus Silbenkarten bauen
     ====================================================================== */
  const VOWELS = ['ie', 'ei', 'au', 'eu', 'äu', 'a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
  // Ersatz-Vokale so gewählt, dass keine gleich klingende Silbe entsteht
  // (NICHT ie↔i: Bie/Bi; NICHT ä↔e; NICHT äu↔eu) – sonst entscheidet Rechtschreibwissen statt Lesen.
  const SWAP = { ie: ['ei', 'e', 'a'], ei: ['au', 'ie', 'eu'], au: ['ei', 'eu', 'a'], eu: ['ei', 'au'], äu: ['ei', 'au'], a: ['o', 'e', 'u'], e: ['a', 'i', 'o'], i: ['e', 'a', 'ie'], o: ['a', 'u', 'e'], u: ['o', 'a', 'i'], ä: ['a', 'o'], ö: ['o', 'ü'], ü: ['u', 'ö'] };
  /** Ähnliche Silbe: nur der Vokal ist anders (Schu → Scho). */
  function nearSyl(s) {
    const low = s.toLowerCase();
    let pos = -1; let v = '';
    for (let i = 0; i < low.length && pos < 0; i++) {
      for (const cand of VOWELS) { if (low.startsWith(cand, i)) { pos = i; v = cand; break; } }
    }
    if (pos < 0) return null;
    const rep = U.pick(SWAP[v]);
    let out = low.slice(0, pos) + rep + low.slice(pos + v.length);
    if (s[0] !== s[0].toLowerCase()) out = U.cap(out);
    return out;
  }

  async function buildWord(ctx) {
    const target = ctx.item(WORDS[4], (w) => w.k, { avoid: 6 });
    const syls = target.syls;
    let nDis = ctx.flow < 0 ? 1 : ctx.flow > 0 ? 3 : 2;
    const dis = [];
    let guard = 0;
    while (dis.length < nDis && guard++ < 40) {
      const src = U.pick(syls);
      const d = nearSyl(src);
      if (d && !syls.includes(d) && !dis.includes(d)) dis.push(d);
    }

    ctx.stage.classList.add('sil-stage');
    const pic = el('div.prompt-box.sil-picbox', U.emoji(target.e, 'big-emoji'));
    const slots = syls.map((s, i) => el('div', { class: 'sil-slot ' + (i % 2 ? 'sil-red' : 'sil-blue') }, el('span.sil-txt', ''), el('i.sil-arc')));
    const slotRow = el('div.sil-word.sil-slots', { 'aria-label': 'Silben-Plätze' }, ...slots);
    const cardsBox = el('div.sil-cards');
    ctx.stage.appendChild(pic);
    ctx.stage.appendChild(slotRow);
    ctx.stage.appendChild(cardsBox);

    const cards = U.shuffle([...syls.map((s, i) => ({ s, pos: i })), ...dis.map((s) => ({ s, pos: -1 }))]).map((c) => {
      const b = el('button.sil-chip', { type: 'button', 'aria-label': 'Silbe ' + c.s }, c.s);
      b._c = c;
      cardsBox.appendChild(b);
      return b;
    });

    let pos = 0;
    let busy = false;
    let finish;
    const done = new Promise((r) => { finish = r; });
    const nextCard = () => cards.find((b) => !b._used && b._c.s === syls[pos]);
    const markNext = () => {
      cards.forEach((b) => ctx.markTest(b, false));
      if (pos >= syls.length) return;
      const nc = nextCard();
      // Sicherheitsnetz: eine benötigte Karte darf nie ausgegraut bleiben
      if (nc.classList.contains('sil-out')) { nc.classList.remove('sil-out'); nc.removeAttribute('aria-disabled'); }
      ctx.markTest(nc);
    };
    markNext();
    const name = target.k;
    const art = target.a;

    cards.forEach((b) => b.addEventListener('click', async () => {
      if (busy || b._used || b.classList.contains('sil-out') || pos >= syls.length || !ctx.active) return;
      busy = true;
      if (b._c.s === syls[pos]) {
        b._used = true;
        b.classList.add('sil-used');
        ctx.markTest(b, false);
        cards.forEach((x) => ctx.unhint(x));
        const slot = slots[pos];
        slot.querySelector('.sil-txt').textContent = syls[pos];
        slot.classList.add('sil-filled');
        LT.sfx.play('pop');
        pos++;
        if (pos >= syls.length) { busy = false; finish(); return; }
        markNext();
        busy = false;
        return;
      }
      // Dieselbe falsche Karte für denselben Platz nochmal: zählt nicht doppelt (wie ctx.choices)
      if (b._wrongAt === pos) {
        LT.ui.animate(b, 'shake');
        busy = false;
        return;
      }
      b._wrongAt = pos;
      // Fehlversuch – 1. Fehler: Audiohilfe, Flo nennt das Bild (vorher wird es nicht gesagt)
      const n = await ctx.wrong(b, {
        keep: true,
        say: `Da steht ${sylSay(b._c.s)}. ` + (pos === 0 ? `Das Bild ist ${art} ${name}. Wir brauchen den Anfang.` : `Wir brauchen die ${ORD[pos] || 'nächste'} Silbe von ${name}.`),
      });
      if (!ctx.active) return;
      const right = nextCard();
      if (n === 2) {
        // Nur echte Ablenker ausgrauen – nie eine Silbe, die das Wort später noch braucht
        const open = cards.filter((x) => x._c.pos === -1 && !x._used && !x.classList.contains('sil-out'));
        if (open.length) {
          const out = open.includes(b) ? b : U.pick(open);
          out.classList.add('sil-out');
          out.setAttribute('aria-disabled', 'true');
        }
        await ctx.say(`Hör genau: Wir suchen ${sylSay(syls[pos])}. Lies jede Karte bis zum Ende.`);
      } else if (n >= 3) {
        ctx.modelShown = true;
        ctx.hint(right);
        await ctx.say(`Schau, hier steht ${sylSay(syls[pos])}. Tipp es an.`);
      }
      busy = false;
    }));

    const first = !introduced.has('build-instr');
    introduced.add('build-instr');
    // Das Wort wird NICHT vorgesagt: Das Kind benennt das Bild selbst und muss die
    // Silbenkarten lesen (Ablenker unterscheiden sich nur im Vokal: Schu/Scho).
    ctx.instruct(first
      ? 'Was ist auf dem Bild? Lies die Silbenkarten und bau das Wort! Tippe die Silben der Reihe nach an.'
      : vary('build-instr', ['Was ist auf dem Bild? Bau das Wort!', 'Lies die Karten genau und bau das Wort zum Bild!', 'Welche Silben passen zum Bild?']));
    await done;
    if (!ctx.active) return;
    await ctx.correct(slotRow, {
      praise: false,
      say: proc(ctx, vary('build-ok', ['Super gebaut!', 'Richtig! Das Wort ist fertig.', 'Toll gebaut!']),
        vary('build-proc', ['Du hast jede Silbe genau angeschaut, sehr gut!', 'Prima! Du hast die Silben genau gelesen, nicht nur den Anfang.'])),
    });
    if (!ctx.active) return;
    slotRow._spans = slots.map((s, i) => { s._syl = syls[i]; return s; });
    slotRow._syls = syls;
    await speakSyls(ctx, slotRow);
    await ctx.sleep(350);
  }

  /* ======================================================================
     Stufe 5: Kurze Sätze lesen → Bild wählen
     ====================================================================== */
  function sentenceNode(s) {
    const box = el('div.sil-sent', { 'aria-label': s.k });
    const wordEls = s.words.map((w, wi) => {
      const syls = w.split('-');
      const we = el('span.sil-w');
      syls.forEach((sy, i) => we.appendChild(el('span', { class: 'sil-syl ' + (i % 2 ? 'sil-red' : 'sil-blue') }, el('span.sil-txt', sy), el('i.sil-arc'))));
      if (wi === s.words.length - 1) we.appendChild(el('span.sil-punct', s.punct));
      we._word = plain(w);
      box.appendChild(we);
      return we;
    });
    box._words = wordEls;
    return box;
  }

  async function readSentence(ctx) {
    const target = ctx.item(SENTENCES, (s) => s.k, { avoid: 8 });
    const set = SENTENCES.filter((s) => s.si === target.si && s !== target);
    const opts = [target, ...set];
    if (ctx.flow > 0) {
      const extra = U.pick(SENTENCES.filter((s) => s.si !== target.si));
      if (extra) opts.push(extra);
    }
    // entscheidende Wörter: kommen nicht in allen Nachbarsätzen vor
    const keyWords = target.words.filter((w) => set.some((o) => !o.words.includes(w))).map(plain);

    ctx.stage.classList.add('sil-stage');
    const sent = sentenceNode(target);
    const card = el('div.prompt-box.sil-card.sil-sentcard', sent);
    ctx.stage.appendChild(card);
    let audible = false;
    sent._words.forEach((we) => we.addEventListener('click', () => {
      we.classList.add('sil-on');
      ctx.timeout(() => we.classList.remove('sil-on'), 600);
      if (audible) ctx.say(we._word);
    }));

    const first = !introduced.has('sent-instr');
    introduced.add('sent-instr');
    ctx.instruct(first ? 'Lies den Satz Wort für Wort. Welches Bild passt?' : vary('sent', ['Lies den Satz. Welches Bild passt?', 'Lies genau bis zum Punkt. Welches Bild passt?', 'Was steht da? Tippe auf das passende Bild.']));
    const items = opts.map((s) => ({ content: el('span.sil-scene', s.scene), correct: s === target, aria: 'Bild', className: 'sil-scene-tile', s }));
    const ha = hintAfterFor(ctx, items.length);
    await ctx.choices(items, {
      size: 'large',
      className: 'sil-pics',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx,
        vary('sent-ok', ['Richtig gelesen!', 'Genau, das passt!', 'Super gelesen!']),
        vary('sent-proc', ['Du hast Wort für Wort gelesen, wie ein echter Leser!', 'Toll, du hast den ganzen Satz bis zum Punkt gelesen!'])),
      explain: (item) => `Zu diesem Bild passt: ${item.s.k} Lies noch einmal Wort für Wort.`,
      hintSay: 'Lies die leuchtenden Wörter ganz genau. Welches Bild passt?',
      modelSay: 'Hier ist das passende Bild.',
      onWrong: async (item, tile, n) => {
        // Audiohilfe ab dem 1. Fehler: die entscheidenden Wörter leuchten und werden vorgelesen.
        audible = true;
        if (n > ha) {
          sent.classList.add('sil-all');
          await ctx.say(target.k);
        } else if (n === 1) {
          const keys = sent._words.filter((we) => keyWords.includes(we._word));
          keys.forEach((we) => we.classList.add('sil-key'));
          await ctx.say('Hör gut zu.');
          for (const we of keys) {
            if (!ctx.active) return;
            we.classList.add('sil-on');
            await ctx.say(we._word);
            we.classList.remove('sil-on');
            await ctx.sleep(200);
          }
          if (ctx.active) await ctx.say('Du kannst jetzt auch ein Wort antippen, dann lese ich es dir vor.');
        } else {
          for (const we of sent._words) {
            if (!ctx.active) return;
            we.classList.add('sil-on');
            await ctx.sleep(650);
            we.classList.remove('sil-on');
          }
        }
      },
    });
    if (!ctx.active) return;
    sent.classList.add('sil-all');
    await ctx.say(target.k);
    await ctx.sleep(400);
  }

  /* ---------------- Registrierung ---------------- */
  LT.registerGame({
    id: 'silbenlesen',
    area: 'deutsch1',
    title: 'Silben-Lesen',
    icon: '🌈',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Wir lesen mit Silben! Die Silben sind bunt: blau und rot.',
    parent: {
      skill: 'Silbenlesen und Synthese (Silbenmethode, Klasse 1)',
      goal: 'Ihr Kind erliest Wörter Silbe für Silbe und verschleift sie zum ganzen Wort – der Schritt vom Lautieren zum flüssigen Lesen. Die Wörter stehen in Druckschrift, die Silben sind abwechselnd blau und rot mit Silbenbögen markiert. Das Kind tippt die Silben an, schwingt den großen Wortbogen und wählt das passende Bild. Das Wort wird vorher bewusst nicht vorgelesen; erst nach einem Fehlversuch spricht Flo die Silben einzeln vor. Ein Bild mit gleichem Anfangsbuchstaben verhindert Raten.',
      levels: [
        'Zweisilbige Wörter mit offenen Silben (Ma-ma, Ro-se, So-fa)',
        'Dreisilbige Wörter (To-ma-te, Ba-na-ne, Ra-ke-te)',
        'Geschlossene Silben (Kat-ze, Tul-pe, Hams-ter) mit ähnlichen Ablenkern',
        'Silben-Baustelle: zum Bild das Wort mit sch, ei, au, ie aus Silbenkarten bauen – die Karten müssen genau gelesen werden (Schu-le, Rau-pe)',
        'Kurze Sätze mit 3–5 Wörtern lesen und das passende Bild finden',
      ],
      tip: 'Lesen Sie gemeinsam in Silben und schwingen Sie dabei mit dem Arm einen Bogen pro Silbe. Bei Fehlern nicht das Wort vorsagen, sondern fragen: „Wie heißt die erste Silbe? Und die nächste? Jetzt zusammen!“',
    },

    async task(ctx) {
      if (ctx.index === 0) introduced = new Set();
      const lv = lvOf(ctx);
      if (!introduced.has(lv)) {
        introduced.add(lv);
        await ctx.say(INTRO[lv]);
        if (!ctx.active) return;
      }
      if (lv <= 3) return readWord(ctx, lv);
      if (lv === 4) return buildWord(ctx);
      return readSentence(ctx);
    },
  });
})();
