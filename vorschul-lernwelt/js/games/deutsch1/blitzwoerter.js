/* ==========================================================================
   Spiel „Blitzwörter“ ⚡ (Leseschule, Klasse 1) – Grundwortschatz-Schatzkiste

   Didaktik:
   - Häufige Wörter (der, die, das, und, ist, ich, nicht, mit …) machen in
     Erstlesetexten den Großteil aller Wörter aus. Wer sie „auf einen Blick“
     erkennt, statt sie jedes Mal zu erlesen, liest flüssiger und hat mehr
     Kopf frei für den Sinn. Orientierung: Grundwortschatz Jahrgangsstufe 1/2.
   - Stufe 1–3 „Blitz“: Ein Wort blitzt kurz auf und wird verdeckt. Das Kind
     sucht es unter ähnlich aussehenden Wörtern. Das Wort wird VORHER NICHT
     vorgelesen – es geht um das Wortbild. Erst danach liest Flo es vor.
       1  10 Wörter, langer Blitz, 3 Wörter zur Wahl (Brücke aus der Vorschule)
       2  20 Wörter, kürzerer Blitz, 4 Wörter, ein Ablenker sehr ähnlich
       3  40 Wörter, kurzer Blitz, 4 Wörter, die sich oft nur in EINEM
          Buchstaben unterscheiden (der/den/dem, ist/isst) – bei Namenwörtern
          auch die kleingeschriebene Falle (Schule/schule)
   - Stufe 4 „Merk-Schreiben“ (Abschreiben in Häppchen): Wort ansehen – merken
     – verdecken – aus Buchstaben legen – vergleichen. Ablenker-Buchstaben
     sind typische Verwechsler (b/d, n/m/u, i/l) und der Anfangsbuchstabe in
     der anderen Größe.
   - Stufe 5 „Lücke im Satz“: Blitzwörter im Zusammenhang – welches Wort passt
     in die Lücke? (Grammatik: ein/eine, der/die/das; Sinn: groß/klein).
     Der Satz wird vor der Antwort nicht vorgelesen (Lesen!).
   - Fehlvorstellungen: nur auf den Anfangsbuchstaben schauen (der/den),
     Buchstaben verdrehen (nicht/nihct), Groß-/Kleinschreibung übersehen,
     Wort passt „irgendwie“ in den Satz (ein/eine).
   - Hilfe-Leiter Stufe 1–3: 1. gewähltes Wort benennen, zeigen WO es sich
     unterscheidet, Wort blitzt nochmal (länger), 2. Strategie (Buchstaben
     zählen, Anfang und Ende anschauen) + ein Ablenker verschwindet,
     3. Flo deckt das Wort auf und zeigt es.
     Stufe 4: 1. kurz nochmal hinschauen, 2. nächster Buchstabe leuchtet im
     Wort, 3. Flo zeigt den Buchstaben im Wort und die passende Kachel
     (die Stufe zählt je Buchstabe, nicht fürs ganze Wort). Stufe 5: 1. Satz mit dem gewählten
     Wort vorlesen („Passt das?“), 2. Denkanstoß, 3. vormachen.
   - Lerninhalte (ctx.item): Wort ('nicht'), Schreibwort ('✍ Haus'),
     Lückensatz ('Das ist _ Hund.').
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ---------------- Grundwortschatz (kumulativ 10 / 20 / 40) ---------------- */
  const W1 = ['ich', 'du', 'und', 'ist', 'der', 'die', 'das', 'ein', 'Mama', 'Papa'];
  const W2 = ['wir', 'er', 'sie', 'es', 'eine', 'mit', 'auf', 'im', 'nicht', 'nein'];
  const W3 = ['Schule', 'Kind', 'Haus', 'Hund', 'Ball', 'Baum', 'Auto', 'Oma', 'Opa', 'Tag',
    'gut', 'groß', 'klein', 'hier', 'auch', 'was', 'wo', 'spielen', 'lesen', 'gehen'];
  const POOL = { 1: W1, 2: W1.concat(W2), 3: W1.concat(W2, W3) };
  // echte Wörter, die nur als Ablenker vorkommen (ähnliche Wortbilder)
  const EXTRA = ['den', 'dem', 'des', 'dir', 'mir', 'wie', 'mich', 'dich', 'sich', 'isst', 'in', 'an', 'am', 'um',
    'eins', 'einer', 'neun', 'nie', 'mein', 'kein', 'Mami', 'Opas', 'Omas', 'Hand', 'Bein', 'Hase', 'Hose', 'Maus',
    'Baum', 'Bauch', 'Bus', 'Tor', 'Tal', 'Kino', 'Rind', 'Wind', 'Mund', 'Hut', 'Haut', 'Ast', 'Kuh',
    'Pause', 'Schuh', 'Schale', 'Bild', 'Wald', 'Licht', 'ach', 'auch', 'aus', 'Ei', 'du', 'zu', 'so', 'wer', 'war',
    'was', 'hier', 'ihr', 'Tier', 'vier', 'gehen', 'sehen', 'geben', 'leben', 'legen', 'lesen', 'Besen',
    'spielen', 'spülen', 'fallen', 'kalt', 'klar', 'kleben', 'groß', 'Gras', 'Glas', 'gut', 'Mut', 'rot', 'Rose',
    'Oma', 'Opa', 'Ofen', 'Papi', 'Pappe', 'Papier', 'Mama', 'Ball', 'Bello', 'alle', 'Tage', 'Tag', 'Tat', 'Mitte',
    'mit', 'Kind', 'Kinn', 'Auto', 'alt', 'auf', 'Affe', 'Lauf', 'nein', 'neu', 'nicht', 'nichts', 'Nacht', 'Schuhe',
    'er', 'es', 'sie', 'die', 'ein', 'wir', 'wie', 'im', 'ihn', 'ihm', 'Uhr', 'und', 'Hund', 'Hunde', 'das', 'dass',
    'der', 'ich', 'ist', 'eine', 'klein', 'Klee', 'wo', 'wohl', 'Woche', 'Haus', 'Laus', 'Schule', 'Schaufel'];
  const BANK = Array.from(new Set(W1.concat(W2, W3, EXTRA)));
  const isNoun = (w) => w[0] !== w[0].toLowerCase();

  /* ---------------- Stufe 4: Schreibwörter ---------------- */
  const WRITE = ['und', 'ist', 'ich', 'mit', 'auf', 'wir', 'eine', 'nicht', 'nein', 'Mama', 'Papa', 'Oma', 'Opa',
    'Haus', 'Hund', 'Ball', 'Baum', 'Auto', 'Kind', 'Tag', 'gut', 'hier', 'auch', 'was', 'klein', 'Schule', 'lesen', 'gehen'];
  const SIMLET = { b: 'dp', d: 'bp', p: 'bq', n: 'mu', m: 'nw', u: 'no', i: 'lj', l: 'it', e: 'ai', a: 'eo', o: 'au',
    h: 'kn', k: 'hx', t: 'fl', f: 't', s: 'zß', z: 's', g: 'pq', r: 'n', c: 'e', w: 'vm', v: 'w', ß: 's', j: 'i' };

  /* ---------------- Stufe 5: Lückensätze ---------------- */
  // [Satz mit _, richtiges Wort, Ablenker (passen grammatisch oder vom Sinn nicht), Tipp]
  const GAPS = [
    ['Das ist _ Hund.', 'ein', ['eine', 'und', 'ich'], 'Sag zuerst: der Hund oder die Hund? Bei der heißt es ein, bei die heißt es eine.'],
    ['Das ist _ Katze.', 'eine', ['ein', 'und', 'ist'], 'Sag zuerst: der Katze oder die Katze? Bei der heißt es ein, bei die heißt es eine.'],
    ['Mama _ Papa lachen.', 'und', ['auf', 'ist', 'mit'], 'Zwei lachen zusammen: Mama, hmm, Papa. Welches Wort verbindet sie?'],
    ['_ Hund bellt.', 'Der', ['Die', 'Das', 'Und'], 'Sag laut: der Hund, die Hund, das Hund. Was klingt richtig?'],
    ['_ Sonne scheint.', 'Die', ['Der', 'Das', 'Ist'], 'Sag laut: der Sonne, die Sonne, das Sonne. Was klingt richtig?'],
    ['_ Auto ist rot.', 'Das', ['Der', 'Die', 'Wo'], 'Sag laut: der Auto, die Auto, das Auto. Was klingt richtig?'],
    ['Der Elefant ist sehr _.', 'groß', ['klein', 'Haus', 'auf'], 'Denk an einen Elefanten. Wie ist er?'],
    ['Die Maus ist sehr _.', 'klein', ['groß', 'Hund', 'mit'], 'Denk an eine Maus. Wie ist sie?'],
    ['Das Kind ist _ müde.', 'nicht', ['wir', 'und', 'das'], 'Das Kind will noch lange spielen. Ist es dann müde?'],
    ['Die Katze sitzt _ dem Baum.', 'auf', ['und', 'ist', 'ich'], 'Die Katze ist hochgeklettert. Ist sie jetzt unten am Baum oder oben drauf?'],
    ['Ich spiele _ Flo.', 'mit', ['ist', 'die', 'wo'], 'Flo und ich spielen zusammen.'],
    ['Wir _ in die Schule.', 'gehen', ['Haus', 'gut', 'und'], 'Welches Wort sagt, was wir tun?'],
    ['Wir _ ein Buch.', 'lesen', ['gehen', 'Schule', 'auf'], 'Was macht man mit einem Buch?'],
    ['_ bist mein Freund.', 'Du', ['Ich', 'Wir', 'Der'], 'Bist passt nur zu einem Wort. Ich bin, und wie heißt es bei bist?'],
    ['_ bin Flo.', 'Ich', ['Du', 'Wir', 'Ist'], 'Wer spricht hier? Flo sagt etwas über sich selbst. Welches Wort sagst du, wenn du von dir sprichst?'],
    ['_ spielen Ball.', 'Wir', ['Ich', 'Du', 'Ist'], 'Spielen passt zu mehreren Kindern.'],
    ['Das Eis schmeckt _.', 'gut', ['Haus', 'wir', 'groß'], 'Wie schmeckt ein leckeres Eis?'],
    ['Ich wohne in einem _.', 'Haus', ['Ball', 'gehen', 'Schule'], 'Wo wohnen Menschen?'],
    ['Flo trägt den Ranzen in die _.', 'Schule', ['Haus', 'Hund', 'gut'], 'Wohin nimmt man den Ranzen mit?'],
    ['Der Ball ist _, nicht dort.', 'hier', ['wo', 'auch', 'und'], 'Nicht dort, sondern ganz nah bei mir.'],
    ['Ich mag Eis. Flo mag _ Eis.', 'auch', ['und', 'ist', 'wo'], 'Flo mag Eis genauso wie ich.'],
    ['_ ist mein Ball?', 'Wo', ['Wir', 'Und', 'Ich'], 'Das ist eine Frage. Ich suche meinen Ball.'],
    ['Der Fisch schwimmt _ Wasser.', 'im', ['ist', 'und', 'wo'], 'Ist der Fisch draußen oder mitten drin? Welches kleine Wort sagt: drin?'],
    ['Tom ist ein Junge. _ lacht.', 'Er', ['Sie', 'Wir', 'Ich'], 'Statt Tom kann man ein kleines Wort sagen. Welches Wort passt zu einem Jungen?'],
    ['Lea ist ein Mädchen. _ malt.', 'Sie', ['Er', 'Du', 'Wir'], 'Statt Lea kann man ein kleines Wort sagen. Welches Wort passt zu einem Mädchen?'],
  ].map(([t, a, d, tip]) => ({ t, a, d, tip, k: t }));

  /* ---------------- Texte ---------------- */
  const KIND = (l) => (l <= 3 ? 'flash' : l === 4 ? 'write' : 'gap');
  const lvOf = (ctx) => (KIND(ctx.taskLevel) === KIND(ctx.level) ? ctx.taskLevel : ctx.level);
  const INTRO = {
    1: 'Blitzwörter! Gleich blitzt ein Wort kurz auf. Merk es dir gut. Dann suchst du es unter den Wörtern.',
    2: 'Jetzt kommen mehr Wörter in die Schatzkiste. Der Blitz ist schneller. Schau auf jeden Buchstaben!',
    3: 'Jetzt wird es knifflig. Die Wörter sehen sich sehr ähnlich. Achte auch auf große und kleine Buchstaben.',
    4: 'Jetzt schreibst du Blitzwörter selbst. Schau das Wort genau an und merk es dir. Dann wird es verdeckt, und du legst es aus Buchstaben.',
    5: 'Jetzt stehen die Blitzwörter in Sätzen. Lies den Satz. Welches Wort passt in die Lücke?',
  };
  const FLASH_MS = { 1: 2300, 2: 1600, 3: 1100 };
  let introduced = new Set();
  let chest = [];

  const vary = (key, list) => U.pickFresh('bli-' + key, list, Math.min(2, list.length - 1));
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const upper = (ch) => (ch === 'ß' ? 'ß' : ch.toUpperCase());
  const letterName = (ch) => {
    if (ch === 'ß') return 'das scharfe S';
    return ch === ch.toLowerCase() ? `das kleine ${upper(ch)}` : `das große ${ch}`;
  };
  /** Buchstaben einzeln zum Vorsprechen: „D – e – r“ → Sprachausgabe nennt die Buchstaben. */
  const spell = (w) => Array.from(w).map((c) => (c === 'ß' ? 'scharfes S' : upper(c))).join(' – ');
  // Wörter, die die Sprachausgabe allein leicht falsch liest, im Satzrahmen sprechen
  const sayWord = (w) => `${w}.`;

  /** Bearbeitungsabstand (Levenshtein) – für „ähnliche“ Wortbilder. */
  function dist(a, b) {
    const m = a.length;
    const n = b.length;
    const d = Array.from({ length: m + 1 }, (_, i) => [i].concat(new Array(n).fill(0)));
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[m][n];
  }
  /** Ähnlichkeit: kleiner Abstand, gleicher Anfang, gleiche Länge. */
  function closeness(t, w) {
    const a = t.toLowerCase();
    const b = w.toLowerCase();
    let s = -dist(a, b) * 2;
    if (a[0] === b[0]) s += 1.5;
    if (a[a.length - 1] === b[b.length - 1]) s += 0.5;
    if (a.length === b.length) s += 1;
    return s;
  }

  /** Ablenker-Wörter je Stufe. */
  function distractors(target, level, flow) {
    const lt = target.toLowerCase();
    const others = BANK.filter((w) => w.toLowerCase() !== lt);
    if (level === 1) {
      // Brücke: Wörter aus den ersten zehn, nicht zu ähnlich (anderer Anfangsbuchstabe,
      // mind. zwei Buchstaben anders), aber ähnlich lang. der/die/das-Kontraste erst ab Stufe 2/3.
      const okL1 = (w) => w !== target && w[0].toLowerCase() !== lt[0] && dist(w.toLowerCase(), lt) >= 2;
      const cand = U.shuffle(W1.filter((w) => okL1(w) && Math.abs(w.length - target.length) <= 1));
      const res = cand.slice(0, 2);
      const rest = U.shuffle(W1.filter((w) => okL1(w) && !res.includes(w)))
        .concat(U.shuffle(W1.filter((w) => w !== target && !okL1(w))));
      while (res.length < 2) res.push(rest.shift());
      return res;
    }
    const ranked = U.shuffle(others).sort((x, y) => closeness(target, y) - closeness(target, x));
    const res = [];
    if (level === 2) {
      res.push(U.pick(ranked.slice(0, 3)));
      const mid = U.shuffle(ranked.slice(3, 14).filter((w) => !res.includes(w)));
      while (res.length < 3 && mid.length) res.push(mid.shift());
    } else {
      // Stufe 3: Groß-/klein-Falle bei Namenwörtern, sonst die ähnlichsten Wortbilder
      if (isNoun(target) && (flow > 0 || U.chance(0.5))) res.push(target.toLowerCase());
      const top = U.shuffle(ranked.slice(0, flow > 0 ? 4 : 6).filter((w) => !res.includes(w)));
      while (res.length < 3 && top.length) res.push(top.shift());
    }
    return res.slice(0, 3);
  }

  /** Wo unterscheidet sich das gewählte Wort? → kurzer Hinweis ohne Lösung. */
  function diffHint(chosen, target) {
    if (chosen.toLowerCase() === target.toLowerCase()) {
      return 'Fast! Die Buchstaben stimmen. Aber schau auf den ersten Buchstaben: groß oder klein?';
    }
    let i = 0;
    while (i < chosen.length && i < target.length && chosen[i] === target[i]) i++;
    const name = `Das Wort heißt ${chosen}.`;
    if (i === 0) return `${name} Schau genau auf den Anfang.`;
    if (i >= Math.min(chosen.length, target.length)) {
      return `${name} Der Anfang stimmt. Aber das Blitzwort war ${chosen.length > target.length ? 'kürzer' : 'länger'}.`;
    }
    return `${name} Der Anfang stimmt. Schau genau auf ${i >= target.length - 1 ? 'das Ende' : 'die Mitte'}.`;
  }

  /* ---------------- Gemeinsame Bausteine ---------------- */

  /** Blitzkarte: Wort + Abdeckung. */
  function flashCard(word, label) {
    const txt = el('span.bli-word', { 'aria-hidden': 'true' }, word);
    const cover = el('div.bli-cover', { 'aria-hidden': 'true' }, U.emoji('⚡', 'bli-bolt'), el('span.bli-cover-lbl', label || 'Blitzwort'));
    const card = el('div.prompt-box.bli-card', { 'aria-label': 'Blitzwort' }, txt, cover);
    return { card, txt };
  }
  async function flash(ctx, card, ms) {
    if (!ctx.active) return;
    if (LT.sfx && LT.sfx.play) LT.sfx.play('whoosh');
    card.classList.add('bli-show');
    await ctx.sleep(ms);
    if (!ctx.active) return;
    card.classList.remove('bli-show');
    await ctx.sleep(200);
  }

  /** Schatzkiste der Runde: gesammelte Wörter. */
  function chestStrip() {
    const box = el('div.bli-chest', { 'aria-label': 'Schatzkiste' }, el('span.bli-chest-ico', U.emoji('💎')));
    chest.slice(-6).forEach((w) => box.appendChild(el('span.bli-gem', w)));
    if (!chest.length) box.appendChild(el('span.bli-chest-empty', 'Schatzkiste'));
    return box;
  }
  function addToChest(ctx, strip, w) {
    chest.push(w);
    const gem = el('span.bli-gem.bli-new', w);
    strip.appendChild(gem);
    const empty = strip.querySelector('.bli-chest-empty');
    if (empty) empty.remove();
    const gems = strip.querySelectorAll('.bli-gem');
    if (gems.length > 6) gems[0].remove();
  }

  /* ==================================================================
     Stufe 1–3: Blitz → Wort wählen
     ================================================================== */
  async function flashTask(ctx, level) {
    const target = ctx.item(POOL[level], (w) => w, { avoid: level === 1 ? 3 : 5 });
    let ms = FLASH_MS[level];
    if (ctx.flow > 0) ms *= 0.8;
    if (ctx.flow < 0) ms *= 1.35;
    if (ctx.isReview) ms *= 1.15;
    const { card } = flashCard(target);
    let flashes = 0;
    let busy = false;
    const again = el('button.btn-round.bli-again', {
      type: 'button', 'aria-label': 'Nochmal blitzen',
      on: { click: async () => { if (busy) return; busy = true; flashes++; await flash(ctx, card, ms * 1.2); busy = false; } },
    }, U.emoji('⚡'));
    const top = el('div.bli-top', card, again);
    const strip = chestStrip();
    ctx.stage.append(top);

    const first = ctx.index === 0 || (level === 1 && ctx.index === 1);
    await ctx.say(first ? 'Achtung, schau genau hin!' : vary('ready', ['Achtung, Blitz!', 'Schau genau!', 'Achtung!', 'Augen auf!']));
    if (!ctx.active) return;
    await ctx.sleep(250);
    await flash(ctx, card, ms);
    if (!ctx.active) return;

    const nDis = level === 1 ? 2 : 3;
    const opts = [target].concat(distractors(target, level, ctx.flow)).slice(0, nDis + 1);
    const items = opts.map((w) => ({
      content: el('span.bli-tword', w), correct: w === target, w, className: 'bli-wtile', aria: 'Wort',
    }));
    const choicesBox = el('div.choices.bli-choices');
    ctx.stage.append(choicesBox, strip);
    ctx.instruct(first ? 'Welches Wort war das? Tippe es an. Mit dem Blitz kannst du es nochmal sehen.' : vary('ask', ['Welches Wort war das?', 'Welches Wort hat geblitzt?', 'Wo ist das Blitzwort?']));
    const ha = LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : (items.length <= 3 ? 1 : 2);
    const nLetters = U.numberWord(target.length);
    await ctx.choices(items, {
      container: choicesBox,
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx,
        vary('ok', ['Richtig!', 'Genau, das war es!', 'Blitzschnell erkannt!', 'Super!']),
        flashes === 0
          ? vary('okp', ['Du hast dir das ganze Wort gemerkt, bis zum letzten Buchstaben!', 'Ein Blick hat gereicht. Du hast ganz genau hingeschaut!'])
          : 'Gut gemacht! Du hast nochmal nachgeschaut. So machen es Profis!'),
      explain: (wrong) => `${diffHint(wrong.w, target)} Ich lasse es nochmal blitzen.`,
      hintSay: () => (isNoun(target)
        ? `Tipp: Das Blitzwort hat ${nLetters} Buchstaben und fängt groß an. Zähl die Buchstaben!`
        : `Tipp: Das Blitzwort hat ${nLetters} Buchstaben. Schau auf den Anfang und auf das Ende!`),
      modelSay: () => `Ich vergleiche Buchstabe für Buchstabe: ${spell(target)}. Bei diesem Wort stimmt jeder Buchstabe, vom ersten bis zum letzten. Das ist das Blitzwort: ${target}. Tipp es an!`,
      onWrong: async (item, tile, n) => {
        if (n === 1 || n === ha) {
          await ctx.sleep(200);
          await flash(ctx, card, ms * 1.5);
        } else if (n > ha) {
          card.classList.add('bli-show');
        }
      },
    });
    if (!ctx.active) return;
    card.classList.add('bli-show', 'bli-done');
    addToChest(ctx, strip, target);
    await ctx.say(`${sayWord(target)} ${chest.length === 1 ? 'Das erste Wort für die Schatzkiste!' : vary('chest', ['Ab in die Schatzkiste!', 'Noch ein Schatz!', ''])}`.trim());
    await ctx.sleep(350);
  }

  /* ==================================================================
     Stufe 4: Merk-Schreiben – ansehen, merken, verdecken, legen, vergleichen
     ================================================================== */
  function letterExtras(word, flow) {
    const n = flow < 0 ? 1 : flow > 0 ? 3 : 2;
    const have = new Set(Array.from(word));
    const res = [];
    const add = (c) => { if (c && !have.has(c) && !res.includes(c)) res.push(c); };
    // Anfangsbuchstabe in der anderen Größe (Groß-/Kleinschreibung)
    const f = word[0];
    if (f !== 'ß') add(f === f.toLowerCase() ? f.toUpperCase() : f.toLowerCase());
    U.shuffle(Array.from(word.toLowerCase())).forEach((c) => { (SIMLET[c] || '').split('').forEach((s) => { if (res.length < n + 2) add(s); }); });
    const common = U.shuffle('aeinrstdhlumo'.split(''));
    while (res.length < n) add(common.shift());
    // Die Groß-/klein-Falle bleibt immer dabei, der Rest wird gekürzt
    return [res[0]].concat(U.shuffle(res.slice(1)).slice(0, n - 1)).slice(0, n);
  }

  async function writeTask(ctx) {
    let pool = WRITE;
    if (ctx.flow < 0) pool = WRITE.filter((w) => w.length <= 4);
    else if (ctx.flow > 0) pool = WRITE.filter((w) => w.length >= 4);
    const word = ctx.item(pool, (w) => '✍ ' + w, { avoid: 5 });
    const chars = Array.from(word);
    let viewMs = 1800 + chars.length * 350;
    if (ctx.flow > 0) viewMs *= 0.8;
    if (ctx.flow < 0) viewMs *= 1.3;

    const { card, txt } = flashCard(word, 'Merkwort');
    txt.textContent = '';
    const letterSpans = chars.map((c) => { const s = el('span.bli-wl', c); txt.appendChild(s); return s; });
    let peeks = 0;
    let busy = true;
    let done = false;
    const peek = el('button.btn-round.bli-again', {
      type: 'button', 'aria-label': 'Nochmal ansehen',
      on: { click: async () => { if (busy || done) return; busy = true; peeks++; await flash(ctx, card, 1200); busy = false; } },
    }, U.emoji('👀'));
    const top = el('div.bli-top', card, peek);
    const slots = chars.map(() => el('div.bli-slot'));
    const line = el('div.bli-line', { style: { '--n': String(chars.length) } }, slots);
    const extras = letterExtras(word, ctx.flow);
    const tiles = U.shuffle(chars.concat(extras)).map((c) => {
      const b = el('button.tile.bli-key', { type: 'button', 'aria-label': c === 'ß' ? 'scharfes S' : upper(c) }, el('span.bli-key-txt', c));
      b._ch = c;
      return b;
    });
    const kb = el('div.bli-kb', tiles);
    ctx.stage.classList.add('bli-stage-write');
    ctx.stage.append(top, line, kb);

    let pos = 0;
    const wrongAt = chars.map(() => 0); // Hilfe-Leiter je Buchstabe
    let finish;
    const finished = new Promise((r) => { finish = r; });

    function nextTile() {
      return tiles.find((t) => !t.classList.contains('bli-used') && t._ch === chars[pos]);
    }
    function mark() {
      tiles.forEach((t) => ctx.markTest(t, false));
      if (!done) ctx.markTest(nextTile());
    }
    async function press(t) {
      if (busy || done || t.classList.contains('bli-used')) return;
      if (t._ch === chars[pos]) {
        tiles.forEach((x) => ctx.unhint(x));
        letterSpans.forEach((s) => s.classList.remove('bli-lit'));
        card.classList.remove('bli-show'); // nach dem Vormachen wieder verdecken
        t.classList.add('bli-used');
        slots[pos].textContent = t._ch;
        slots[pos].classList.add('bli-filled');
        if (LT.sfx && LT.sfx.play) LT.sfx.play('pop');
        pos++;
        if (pos >= chars.length) { done = true; mark(); finish(); return; }
        mark();
        return;
      }
      busy = true;
      const step = ++wrongAt[pos];
      const need = chars[pos];
      let say;
      if (step === 1) say = `Das ist ${letterName(t._ch)}. ${vary('w4', ['Schau nochmal kurz hin.', 'Guck nochmal genau.'])}`;
      else if (step === 2) say = `Schau, dieser Buchstabe kommt jetzt.`;
      else {
        say = pos === 0
          ? `Ich schaue ins Wort: ${word} fängt mit ${letterName(need)} an. Hier ist es. Tipp es an!`
          : `Ich schaue ins Wort: Nach ${spell(chars.slice(0, pos).join(''))} kommt ${letterName(need)}. Hier ist es. Tipp es an!`;
      }
      await ctx.wrong(t, { keep: true, say });
      if (!ctx.active) return;
      if (step === 1) {
        await flash(ctx, card, 1100);
      } else if (step === 2) {
        card.classList.add('bli-show');
        letterSpans[pos].classList.add('bli-lit');
        await ctx.sleep(1600);
        if (!ctx.active) return;
        card.classList.remove('bli-show');
      } else {
        ctx.modelShown = true;
        card.classList.add('bli-show');
        letterSpans[pos].classList.add('bli-lit');
        ctx.hint(nextTile());
      }
      busy = false;
    }
    tiles.forEach((t) => ctx.listen(t, 'click', () => press(t)));
    ctx.testSolve(() => { const t = nextTile(); if (t) { busy = false; press(t); } });

    // 1 ansehen
    card.classList.add('bli-show');
    await ctx.say(ctx.index === 0 ? `Schau dir das Wort genau an. Es heißt ${word}. Merk es dir!` : vary('look', [`Schau genau. Das Wort heißt ${word}.`, `Merk dir dieses Wort: ${word}.`, `Hier steht ${word}. Schau genau hin!`]));
    if (!ctx.active) return;
    await ctx.sleep(viewMs);
    if (!ctx.active) return;
    // 2 verdecken
    card.classList.remove('bli-show');
    await ctx.sleep(200);
    ctx.instruct(ctx.index === 0 ? `Jetzt ist es verdeckt. Lege ${word} aus den Buchstaben. Mit den Augen kannst du nochmal schauen.` : `Lege ${word}.`);
    busy = false;
    mark();
    await finished;
    if (!ctx.active) return;
    // 3 vergleichen
    card.classList.add('bli-show', 'bli-done');
    line.classList.add('bli-line-ok');
    await ctx.correct(line, {
      praise: false,
      say: ctx.wrongCount === 0
        ? (peeks === 0 && U.chance(0.4) ? 'Toll! Du hast dir das ganze Wort im Kopf gemerkt!' : proc(ctx, vary('w4ok', ['Super geschrieben!', 'Richtig geschrieben!', 'Prima!']), 'Du hast Buchstabe für Buchstabe aus dem Kopf gelegt. Stark!'))
        : vary('w4ok2', ['Geschafft! Vergleiche: Jetzt stimmt jeder Buchstabe.', 'Gut, dass du nicht aufgegeben hast!']),
    });
    if (!ctx.active) return;
    await ctx.say(`Vergleiche: Oben und unten steht ${word}.`);
    await ctx.sleep(350);
  }

  /* ==================================================================
     Stufe 5: Lücke im Satz
     ================================================================== */
  async function gapTask(ctx) {
    const g = ctx.item(GAPS, (x) => x.k, { avoid: 6 });
    const [before, after] = g.t.split('_');
    const gap = el('span.bli-gap', ' ');
    const sent = el('div.prompt-box.bli-sent', el('span', before), gap, el('span', after));
    ctx.stage.append(sent);
    const fill = (w) => {
      // Satzanfang: Das Wort steht schon groß da – sonst unverändert
      return (before + w + after).replace(/\s+/g, ' ').trim();
    };
    ctx.instruct(ctx.index === 0 ? 'Lies den Satz. Welches Wort passt in die Lücke?' : vary('gap', ['Welches Wort passt in die Lücke?', 'Lies genau. Was fehlt?', 'Welches Wort fehlt hier?']));
    if (!ctx.active) return;
    const items = [g.a].concat(g.d).map((w) => ({ content: el('span.bli-tword', w), correct: w === g.a, w, className: 'bli-wtile', aria: 'Wort' }));
    const ha = LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : 2;
    await ctx.choices(items, {
      hintAfter: ha,
      praise: false,
      className: 'bli-choices',
      correctSay: () => proc(ctx, vary('gok', ['Richtig! Das passt.', 'Genau!', 'Super gelesen!']), 'Du hast den ganzen Satz bis zum Punkt gelesen. So findet man das richtige Wort!'),
      explain: (wrong) => `Hör mal: ${fill(wrong.w)} Passt das?`,
      hintSay: () => g.tip,
      modelSay: () => {
        // Strategie zeigen: jedes Wort im Satz ausprobieren
        const tries = g.d.slice(0, 2).map((w) => `${fill(w)} Nein, das passt nicht.`).join(' ');
        return `Ich lese den Satz mit jedem Wort. ${tries} ${fill(g.a)} Ja, nur mit ${g.a} passt es!`;
      },
      onCorrect: () => { gap.textContent = g.a; gap.classList.add('bli-gap-ok'); },
    });
    if (!ctx.active) return;
    await ctx.say(fill(g.a));
    await ctx.sleep(350);
  }

  LT.registerGame({
    id: 'blitzwoerter',
    area: 'deutsch1',
    title: 'Blitzwörter',
    icon: '⚡',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Willkommen bei den Blitzwörtern! Diese Wörter stehen in fast jedem Buch.',
    parent: {
      skill: 'Grundwortschatz: häufige Wörter auf einen Blick erkennen und richtig schreiben',
      goal: 'Ihr Kind lernt die häufigsten Wörter der deutschen Sprache (der, die, das, und, ist, ich, nicht, mit, Schule …) als „Blitzwörter“: Ein Wort blitzt kurz auf, Ihr Kind sucht es unter ähnlich aussehenden Wörtern. Wer diese Wörter sofort erkennt, liest flüssiger und versteht mehr. Danach wird das Wortbild beim Merk-Schreiben gefestigt und im Satz angewendet. Orientierung: Grundwortschatz der Jahrgangsstufen 1 und 2.',
      levels: [
        'Die ersten 10 Wörter (ich, du, und, ist, der, die, das, ein, Mama, Papa): langer Blitz, 3 Wörter zur Wahl (Brücke aus der Vorschule)',
        '20 Wörter (dazu wir, er, sie, es, eine, mit, auf, im, nicht, nein): kürzerer Blitz, 4 Wörter, eines sieht sehr ähnlich aus',
        '40 Wörter (dazu Schule, Kind, Haus, Hund, spielen, lesen, groß, klein …): kurzer Blitz, Wörter unterscheiden sich oft nur in einem Buchstaben oder in der Groß-/Kleinschreibung',
        'Merk-Schreiben: Wort ansehen, merken, verdecken, aus Buchstaben legen, vergleichen (Ablenker b/d, n/m, Groß/klein)',
        'Blitzwörter im Satz: das passende Wort in die Lücke setzen (ein/eine, der/die/das, groß/klein) – Niveau Ende Klasse 1',
      ],
      tip: 'Schreiben Sie jede Woche drei Blitzwörter auf Karten und hängen Sie sie an den Kühlschrank. Beim Vorlesen darf Ihr Kind „seine“ Blitzwörter im Buch suchen und laut mitlesen. Beim Abschreiben hilft der Dreischritt: anschauen, umdrehen, aufschreiben, vergleichen.',
    },

    async task(ctx) {
      const level = lvOf(ctx);
      if (ctx.index === 0) {
        introduced = new Set();
        chest = [];
        for (let i = 1; i < ctx.level; i++) if (KIND(i) === KIND(ctx.level)) introduced.add(i);
      }
      ctx.stage.classList.add('bli-stage');
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (level <= 3) return flashTask(ctx, level);
      if (level === 4) return writeTask(ctx);
      return gapTask(ctx);
    },
  });
})();
