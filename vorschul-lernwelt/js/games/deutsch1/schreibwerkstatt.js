/* ==========================================================================
   Spiel „Schreibwerkstatt“ ✏️ (Leseschule, Klasse 1) – lautgetreues Schreiben
   mit der Anlauttabelle (Plan A10).

   Didaktik:
   - Lautanalyse vor Rechtschreibung: Das Kind hört ein Wort (Bild + Sprache),
     spricht langsam mit und legt das Wort Laut für Laut aus Buchstabenkacheln.
     Jede Kachel nennt beim Antippen ihr Anlautwort („M wie Maus“) – das ist
     die Anlauttabelle direkt auf der Tastatur. Das komplette ABC (LT.s2) ist
     zusätzlich jederzeit über den ABC-Knopf erreichbar.
   - Die Kacheln bleiben liegen (wie eine Tastatur), so gehen auch Wörter mit
     doppelten Buchstaben (MAMA).
   - Stufen:
       1  Brücke aus der Vorschule: kurze Wörter aus 3–4 Lauten in
          Großbuchstaben (OMA, UFO, SOFA), Kästchen zeigen die Lautzahl,
          nur 1 Ablenker
       2  längere Wörter mit 4–5 (bei Schwung 6) Lauten (HOSE, SALAT, TOMATE),
          Kästchen vorgegeben, 2 Ablenker
       3  Konsonantenhäufung (BROT, BLUME, ZELT, STERN): KEINE Kästchen mehr,
          das Kind muss die Lautzahl selbst hören und mit ✓ abgeben;
          ähnlich klingende Ablenker (B/P, D/T, G/K …), bei St/Sp das Sch
          als Falle („Wir hören Schtern, aber wir schreiben S T.“)
       4  Lautpakete sch, ch, ei, au, eu als EINE Kachel; gemischte
          Druckschrift, Namenwörter fangen groß an (Fisch, Maus, Kuchen)
       5  Diktat ohne Bild aus dem Grundwortschatz (Schule, Stift, mit, auf,
          lesen): Wort – Satz – Wort; großer UND kleiner Anfangsbuchstabe
          liegen bereit → Groß/klein entscheiden (Niveau Ende Klasse 1)
   - Typische Fehlvorstellungen werden beim Prüfen erkannt und benannt, ohne
     die Lösung zu verraten:
       * Selbstlaute ausgelassen („HS“ für Haus, „BRT“ für Brot)
       * Konsonantenhäufung verkürzt („BOT“ für Brot)
       * Sch statt S am Wortanfang bei St/Sp
       * ähnlich klingende Laute vertauscht (P statt B)
       * Reihenfolge vertauscht, Laut zu viel
       * Groß/klein (Artikelprobe: „Passt der, die oder das davor?“)
   - Hilfe-Leiter (ctx.helpStep): 1. Fehler → Diagnose, richtige Anfangslaute
     bleiben grün liegen; 2. → Strategie: „Laut-Hüpfer“: Flo dehnt das Wort
     Laut für Laut („Bbb – rrr – ooo – t“), je Laut leuchtet ein Hüpfer auf,
     „Wie viele Hüpfer hast du gehört?“, die nächste Kachel leuchtet;
     3. → Flo schreibt das Wort vor und zeigt dabei die Strategie (Laut
     sprechen – hören – Buchstaben suchen), danach schreibt das Kind
     es geführt nach (Kachel leuchtet jeweils), ctx.modelShown.
   - Lerninhalte (ctx.item): das Wort, z. B. „Sofa“, „Brot“, „Fisch“, „mit“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S2 = LT.s2;

  const w = (n) => U.numberWord(n);
  const ORD = ['ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten'];

  /* ------------------------------------------------------------------
     Wörter je Stufe. Schreibweise genau so, wie das Kind sie legen soll;
     Bindestriche trennen nur die Silben (für langsames Vorsprechen und
     die Silbenfarben am Ende).
     ------------------------------------------------------------------ */
  const WORDS = {
    1: [
      { t: 'O-MA', e: '👵' }, { t: 'O-PA', e: '👴' }, { t: 'U-HU', e: '🦉' }, { t: 'HUT', e: '🎩' },
      { t: 'U-FO', e: '🛸' }, { t: 'MA-MA', e: '👩' }, { t: 'PA-PA', e: '👨' }, { t: 'SO-FA', e: '🛋️' },
    ],
    2: [
      { t: 'HO-SE', e: '👖' }, { t: 'LA-MA', e: '🦙' }, { t: 'NA-SE', e: '👃' }, { t: 'RO-SE', e: '🌹' },
      { t: 'HA-SE', e: '🐰' }, { t: 'I-GEL', e: '🦔' }, { t: 'DO-SE', e: '🥫' }, { t: 'DI-NO', e: '🦕' },
      { t: 'LU-PE', e: '🔍' }, { t: 'SA-LAT', e: '🥗' }, { t: 'KA-MEL', e: '🐫' }, { t: 'PI-RAT', e: '🏴‍☠️' },
      { t: 'TO-MA-TE', e: '🍅' }, { t: 'BA-NA-NE', e: '🍌' }, { t: 'ME-LO-NE', e: '🍉' }, { t: 'RA-KE-TE', e: '🚀' },
    ],
    3: [
      { t: 'BROT', e: '🍞' }, { t: 'BLU-ME', e: '🌸' }, { t: 'KRO-NE', e: '👑' }, { t: 'ZELT', e: '⛺' },
      { t: 'PAL-ME', e: '🌴' }, { t: 'WOL-KE', e: '☁️' }, { t: 'TUL-PE', e: '🌷' }, { t: 'PILZ', e: '🍄' },
      { t: 'EN-TE', e: '🦆' }, { t: 'PAN-DA', e: '🐼' }, { t: 'ZE-BRA', e: '🦓' }, { t: 'KAK-TUS', e: '🌵' },
      { t: 'STERN', e: '⭐' }, { t: 'TRAK-TOR', e: '🚜' },
    ],
    4: [
      { t: 'Fisch', a: 'der', e: '🐟' }, { t: 'Schaf', a: 'das', e: '🐑' }, { t: 'Maus', a: 'die', e: '🐭' }, { t: 'Haus', a: 'das', e: '🏠' },
      { t: 'Eis', a: 'das', e: '🍦' }, { t: 'Baum', a: 'der', e: '🌳' }, { t: 'Buch', a: 'das', e: '📖' }, { t: 'Eu-le', a: 'die', e: '🦉' },
      { t: 'Feu-er', a: 'das', e: '🔥' }, { t: 'Sei-fe', a: 'die', e: '🧼' }, { t: 'Ta-sche', a: 'die', e: '👜' }, { t: 'Mu-schel', a: 'die', e: '🐚' },
      { t: 'Frosch', a: 'der', e: '🐸' }, { t: 'Ku-chen', a: 'der', e: '🍰' }, { t: 'Au-to', a: 'das', e: '🚗' }, { t: 'Milch', a: 'die', e: '🥛' },
    ],
    5: [
      { t: 'Schu-le', a: 'die', s: 'Ich gehe in die Schule.' },
      { t: 'Na-me', a: 'der', s: 'Mein Name ist Flo.' },
      { t: 'Ta-fel', a: 'die', s: 'Die Lehrerin schreibt an die Tafel.' },
      { t: 'Fisch', a: 'der', s: 'Der Fisch schwimmt im Teich.' },
      { t: 'Stift', a: 'der', s: 'Ich male mit dem Stift.' },
      { t: 'Brot', a: 'das', s: 'Zum Frühstück esse ich ein Brot.' },
      { t: 'ma-len', s: 'Wir malen ein Bild.' },
      { t: 'le-sen', s: 'Ich kann schon lesen.' },
      { t: 'lau-fen', s: 'Wir laufen ganz schnell.' },
      { t: 'rot', s: 'Der Apfel ist rot.' },
      { t: 'gut', s: 'Das schmeckt gut.' },
      { t: 'mit', s: 'Spielst du mit mir?' },
      { t: 'ist', s: 'Das ist mein Ball.' },
      { t: 'ich', s: 'Hier bin ich.' },
      { t: 'auf', s: 'Die Katze sitzt auf dem Sofa.' },
      { t: 'nein', s: 'Ich sage laut nein.' },
    ],
  };

  /** Lautpakete (eine Kachel): Reihenfolge wichtig (sch vor ch). */
  const PACKS = ['sch', 'ch', 'ei', 'au', 'eu'];
  /** Sprechtext der Pakete: der LAUT (so geschrieben, dass die Stimme ihn als
   *  einen Laut spricht, nicht als Buchstabennamen „E I“) + Beispielwort.
   *  ch: beide Laute nennen (ich-Laut in Milch/ich, ach-Laut in Buch/Kuchen). */
  const PACK_SAY = {
    sch: 'Sch wie bei Schere', ch: 'Ch wie bei ich und wie bei Dach', ei: 'Ei wie bei Eimer',
    au: 'Au wie bei Auge', eu: 'Eu wie bei Euro',
  };
  const PACK_NAME = { sch: 'Sch', ch: 'Ch', ei: 'Ei', au: 'Au', eu: 'Eu' };
  /** Gedehnter Einzellaut für das Lautieren („Bbb – rrr – ooo – t“): Selbstlaute
   *  und Dauerlaute werden gezogen; Pakete als ein Laut; Stopplaute (b, d, g, k,
   *  p, t, z) lassen sich nicht ziehen – die Stimme kann sie nur mit Namen sprechen. */
  const STRETCHY = ['m', 'n', 'l', 'r', 's', 'f', 'w'];
  function soundSay(tok) {
    const l = lc(tok);
    if (PACK_NAME[l]) return PACK_NAME[l] + (l === 'sch' ? 'hh' : l.slice(-1).repeat(2));
    if (['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'].includes(l) || STRETCHY.includes(l)) return S2.upper(l) + l + l;
    return S2.upper(l);
  }
  const VOWELS = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü', 'ei', 'au', 'eu'];
  /** ähnlich klingende Laute (Ablenker ab Stufe 2, Diagnose) */
  const SIM = {
    b: ['p'], p: ['b'], d: ['t'], t: ['d'], g: ['k'], k: ['g'], m: ['n'], n: ['m'], f: ['w'], w: ['f'],
    e: ['i'], i: ['e'], o: ['u'], u: ['o'], l: ['r'], r: ['l'], s: ['z'], z: ['s'],
    ei: ['eu', 'au'], au: ['eu', 'ei'], eu: ['ei', 'au'], sch: ['ch', 's'], ch: ['sch'],
  };
  const COMMON = ['a', 'e', 'i', 'o', 'u', 'm', 'l', 's', 'r', 'n', 't', 'h', 'b', 'd', 'f', 'k', 'p', 'g', 'w', 'z'];

  const INTRO = {
    1: 'Willkommen in der Schreibwerkstatt! Du hörst ein Wort. Sprich es langsam mit. Dann tippe die Buchstaben der Reihe nach an.',
    2: 'Jetzt werden die Wörter länger. Sprich ganz langsam und hör auf jeden Laut.',
    3: 'Jetzt gibt es keine Kästchen mehr. Du hörst selbst, wie viele Laute es sind. Manche Laute verstecken sich, wie beim Brot. Wenn du fertig bist, tippe auf den Haken.',
    4: 'Manche Laute schreibt man mit mehreren Buchstaben. Das sind Lautpakete, zum Beispiel ei wie bei Eimer, oder au wie bei Auge. Ein Lautpaket ist eine Kachel. Und Namenwörter fangen groß an.',
    5: 'Jetzt kommt ein Diktat, wie in der Schule! Es gibt kein Bild. Hör gut zu. Namenwörter schreiben wir groß, alle anderen Wörter klein.',
  };
  const ABC_INTRO = 'Wenn du nicht weißt, wie ein Buchstabe aussieht, schau in dein ABC.';

  /* ------------------------------------------------------------------
     Hilfsfunktionen
     ------------------------------------------------------------------ */
  const plain = (t) => t.replace(/-/g, '');
  const syllables = (t) => t.split('-');
  const lc = (s) => s.toLowerCase();
  /** Gesprochene Form: 'SO-FA' → 'Sofa', 'ma-len' → 'malen'. */
  function spoken(entry, level) {
    const p = plain(entry.t);
    return level <= 3 ? U.cap(lc(p)) : p;
  }
  const keyOf = (entry, level) => spoken(entry, level);
  const isNoun = (entry) => /^[A-ZÄÖÜ]/.test(entry.t) && !/^[A-ZÄÖÜ-]+$/.test(entry.t);

  /** Wort in Laut-Kacheln zerlegen (Lautpakete als eine Kachel), Groß/klein bleibt erhalten. */
  function tokenize(word) {
    const res = [];
    let i = 0;
    while (i < word.length) {
      const rest = lc(word.slice(i));
      const pk = PACKS.find((p) => rest.startsWith(p));
      const len = pk ? pk.length : 1;
      res.push(word.slice(i, i + len));
      i += len;
    }
    return res;
  }
  /** Silbe je Laut-Kachel (für Silbenfarben). */
  function syllableIndex(entry) {
    const idx = [];
    syllables(entry.t).forEach((s, si) => tokenize(s).forEach(() => idx.push(si)));
    return idx;
  }

  /** Sprechtext einer Kachel: „M wie Maus“, Pakete mit Beispielwort. */
  function tokenSay(tok) {
    const l = lc(tok);
    if (PACK_SAY[l]) return PACK_SAY[l];
    if (l === 'ß') return 'scharfes S';
    const a = S2.abc(l);
    return a ? `${S2.upper(l)} wie ${a.w}` : S2.upper(l);
  }
  /** Kachelname für Erklärungen: „das P“, „das Paket A U“. */
  function tokenName(tok) {
    const l = lc(tok);
    if (PACK_NAME[l]) return 'das Paket ' + PACK_NAME[l];
    return 'das ' + S2.upper(l);
  }

  /** Ablenker-Kacheln je Stufe. */
  function distractors(entry, level, tokens, flow) {
    const lower = level >= 4;
    const have = new Set(tokens.map(lc));
    const take = (t) => (lower ? t : t.toUpperCase());
    let n = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 3 }[level];
    if (flow > 0) n++;
    if (flow < 0 && n > 1) n--;
    const res = [];
    const add = (t) => {
      if (!t || have.has(lc(t)) || res.some((x) => lc(x) === lc(t))) return;
      res.push(take(t));
    };
    const plainLc = lc(plain(entry.t));
    // Stufe 3/5: St/Sp-Falle
    if (level >= 3 && /^s[tp]/.test(plainLc)) add('sch');
    if (level >= 2) {
      // ein bis zwei ähnlich klingende Laute
      const sims = U.shuffle(tokens.map(lc).flatMap((t) => SIM[t] || []).filter((t) => level >= 4 || !PACKS.includes(t)));
      const nSim = level === 2 ? 1 : 2;
      sims.slice(0, 6).forEach((t) => { if (res.length < nSim) add(t); });
    }
    const avoid = new Set(tokens.map(lc).flatMap((t) => (level === 1 ? SIM[t] || [] : [])));
    const rest = U.shuffle(COMMON.filter((c) => !avoid.has(c)));
    while (res.length < n && rest.length) add(rest.shift());
    const out = res.slice(0, n);
    // Stufe 5: der „andere“ Anfangsbuchstabe (groß ↔ klein) liegt immer bereit
    if (level === 5) {
      const f = tokens[0];
      const other = f === lc(f) ? U.cap(f) : lc(f);
      if (!tokens.includes(other)) out.push(other);
    }
    return out;
  }

  let introduced = new Set();
  let abcShown = false;

  LT.registerGame({
    id: 'schreibwerkstatt',
    area: 'deutsch1',
    title: 'Schreibwerkstatt',
    icon: '✏️',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Hallo! In der Schreibwerkstatt schreiben wir Wörter. Sprich immer langsam mit!',
    parent: {
      skill: 'Lautgetreues Schreiben mit der Anlauttabelle: Wörter in Laute zerlegen und Buchstaben zuordnen',
      goal: 'Ihr Kind hört ein Wort, spricht es langsam mit („gedehnt sprechen“) und legt es Laut für Laut aus Buchstaben. Jede Buchstabenkachel nennt ihr Anlautwort („M wie Maus“), so wie die Anlauttabelle in der Schule. Später kommen Konsonantenhäufungen (Brot, Stern), Lautpakete (sch, ch, ei, au, eu) und die Groß- und Kleinschreibung dazu.',
      levels: [
        'Kurze Wörter mit 3 bis 4 Lauten in Großbuchstaben (OMA, UFO, SOFA), Kästchen zeigen die Lautzahl (Brücke aus der Vorschule)',
        'Längere Wörter mit 4 bis 6 Lauten (HOSE, SALAT, TOMATE), ähnlich klingende Buchstaben als Ablenker',
        'Konsonantenhäufungen (BROT, BLUME, ZELT, STERN) ohne vorgegebene Kästchen: Lautzahl selbst hören; St/Sp am Wortanfang',
        'Lautpakete sch, ch, ei, au, eu als eine Kachel, gemischte Druckschrift: Namenwörter groß (Fisch, Maus, Kuchen)',
        'Diktat ohne Bild aus dem Grundwortschatz (Schule, Stift, lesen, mit, auf): Groß- oder Kleinschreibung selbst entscheiden (Niveau Ende Klasse 1)',
      ],
      tip: 'Lautgetreues Schreiben ist in Klasse 1 erwünscht: „Fata“ statt „Vater“ zeigt, dass Ihr Kind gut hört. Sprechen Sie Wörter gemeinsam gedehnt („Ssooofaaa“) und hüpfen Sie für jeden Laut einmal. Fragen Sie bei Namenwörtern: „Kannst du es sehen oder anfassen? Passt der, die oder das davor?“',
    },

    async task(ctx) {
      const level = S2.lv(ctx, (lv) => (lv <= 2 ? 'slots' : 'open'));
      if (ctx.index === 0) {
        introduced = new Set();
        for (let i = 1; i < ctx.level; i++) introduced.add(i);
      }
      ctx.stage.classList.add('swk-stage');
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      let pool = WORDS[level];
      if (level === 2 && ctx.flow <= 0) pool = pool.filter((x) => plain(x.t).length <= 5);
      if (level === 3 && ctx.flow < 0) pool = pool.filter((x) => plain(x.t).length <= 5);
      if (level === 3 && ctx.flow <= 0) pool = pool.filter((x) => plain(x.t).length <= 6);
      const entry = ctx.item(pool, (x) => keyOf(x, level), { avoid: 4 });
      await writeTask(ctx, entry, level);
    },
  });

  /* ==================================================================
     Eine Schreibaufgabe
     ================================================================== */
  async function writeTask(ctx, entry, level) {
    const word = plain(entry.t);
    const target = tokenize(word);
    const sylIdx = syllableIndex(entry);
    const say = spoken(entry, level);
    const fixed = level <= 2;
    const diktat = level === 5;
    const maxLen = target.length + 2;
    let typed = [];
    let okPrefix = 0; // wie viele Kacheln nach einem Fehler grün liegen bleiben
    let busy = true;
    let finished = false;
    let guided = false; // nach dem Vormachen: nächste Kachel leuchtet

    // ---------- oben: Bild bzw. Diktat ----------
    const sayWordSlow = () => ctx.say(diktat ? `${say}. ${entry.s} ${say}.` : say, { rate: 0.8 });
    const ear = el('button.btn-round.swk-ear', {
      type: 'button', 'aria-label': 'Wort nochmal hören',
      on: { click: () => { if (!finished) sayWordSlow(); } },
    }, U.emoji('🔊'));
    const top = diktat
      ? el('div.prompt-box.swk-top.swk-diktat', el('div.swk-pic', U.emoji('👂')), el('div.swk-dik-lbl', 'Diktat'), ear)
      : el('div.prompt-box.swk-top', el('div.swk-pic', U.emoji(entry.e)), ear);

    // ---------- Schreibzeile ----------
    const line = el('div.swk-line' + (fixed ? '.swk-fixed' : '.swk-open'), { style: { '--n': String(fixed ? target.length : maxLen) } });
    const hops = el('div.swk-hops', { 'aria-hidden': 'true' });
    const lineWrap = el('div.swk-linewrap', line, hops);

    // ---------- Tastatur ----------
    const tokens = Array.from(new Set(target));
    const keysAll = tokens.concat(distractors(entry, level, target, ctx.flow));
    keysAll.sort((a, b) => lc(a).localeCompare(lc(b), 'de') || (a === lc(a) ? 1 : -1));
    const keys = {};
    const kb = el('div.swk-kb');
    keysAll.forEach((tok) => {
      const b = el('button.tile.swk-key' + (tok.length > 1 ? '.swk-pack' : ''), {
        type: 'button', 'aria-label': tokenSay(tok),
      }, el('span.swk-key-txt', tok));
      ctx.listen(b, 'click', () => press(tok, b));
      keys[tok] = b;
      kb.appendChild(b);
    });

    // ---------- Knöpfe ----------
    const back = el('button.btn.swk-back', { type: 'button', 'aria-label': 'Letzten Buchstaben löschen', on: { click: () => removeAt(typed.length - 1) } },
      el('span.swk-back-ico', '⌫'));
    const check = el('button.btn.btn-green.swk-check', { type: 'button', 'aria-label': 'Fertig, prüfen', on: { click: () => doCheck() } },
      el('span.swk-check-mark', '✓'));
    const actions = el('div.swk-actions', back);
    if (!fixed) actions.appendChild(check);

    ctx.stage.append(top, lineWrap, kb, actions);
    const abc = S2.abcButton(ctx);
    abc.classList.add('swk-abc');
    actions.appendChild(abc);

    function render() {
      U.clear(line);
      const n = fixed ? target.length : Math.max(typed.length + (typed.length < maxLen ? 1 : 0), 1);
      if (!fixed) line.style.setProperty('--n', String(Math.max(n, 4)));
      for (let i = 0; i < n; i++) {
        const tok = typed[i];
        const cell = el('button.swk-cell', {
          type: 'button', tabindex: '-1', 'aria-label': tok ? tokenSay(tok) : 'leer',
          on: { click: () => { if (tok) removeAt(i); } },
        });
        if (tok) {
          cell.appendChild(el('span.swk-cell-txt', tok));
          cell.classList.add('swk-filled');
          if (tok.length > 1) cell.classList.add('swk-pack');
          if (i < okPrefix) cell.classList.add('swk-ok');
        } else if (i === typed.length) {
          cell.classList.add('swk-cursor');
        }
        line.appendChild(cell);
      }
      back.disabled = typed.length === 0;
      if (!fixed) check.disabled = typed.length === 0;
      updateMarks();
    }

    /** Testmodus/Führung: nächste richtige Kachel markieren. */
    function updateMarks() {
      Object.values(keys).forEach((k) => { ctx.markTest(k, false); if (guided) ctx.unhint(k); });
      ctx.markTest(check, false);
      ctx.markTest(back, false);
      if (finished) return;
      const isPrefix = typed.every((t, i) => t === target[i]);
      if (!isPrefix) { ctx.markTest(back); return; }
      if (typed.length < target.length) {
        const k = keys[target[typed.length]];
        ctx.markTest(k);
        if (guided) ctx.hint(k);
      } else if (!fixed) {
        ctx.markTest(check);
        if (guided) ctx.hint(check);
      }
    }

    function press(tok, btn) {
      if (busy || finished || !ctx.active) return;
      if (typed.length >= (fixed ? target.length : maxLen)) {
        LT.ui.animate(line, 'shake');
        ctx.say(fixed ? 'Alle Kästchen sind voll.' : 'Die Zeile ist voll. Lösche etwas.');
        return;
      }
      typed.push(tok);
      LT.sfx.play('pop');
      LT.ui.animate(btn, 'joy');
      ctx.say(tokenSay(tok));
      render();
      if (fixed && typed.length === target.length) {
        busy = true;
        ctx.timeout(() => { busy = false; doCheck(); }, 450);
      }
    }
    function removeAt(i) {
      if (busy || finished || i < 0 || i >= typed.length) return;
      typed.splice(i, 1);
      okPrefix = Math.min(okPrefix, i);
      LT.sfx.play('flip');
      render();
    }

    /** Laut-Hüpfer zeigen; dim = alle Punkte grau, sie leuchten erst beim Lautieren auf. */
    function showHops(dim) {
      U.clear(hops);
      target.forEach(() => hops.appendChild(el('span.swk-hop')));
      hops.classList.add('on');
      hops.classList.toggle('swk-wait', !!dim);
    }
    const lightHop = (i) => { const h = hops.children[i]; if (h) h.classList.add('swk-lit'); };
    /** Wort gedehnt Laut für Laut sprechen, je Laut leuchtet ein Hüpfer. */
    async function sayStretched() {
      for (let i = 0; i < target.length; i++) {
        if (!ctx.active) return;
        lightHop(i);
        await ctx.say(soundSay(target[i]), { rate: 0.7 });
        if (!ctx.active) return;
        await ctx.sleep(150);
      }
    }
    /** Beim Vormachen: gedehnt bis zum aktuellen Laut („Brrr“), damit man das
     *  Verschleifen hört; Stopplaute einzeln (lassen sich nicht ziehen). */
    function prefixSay(i) {
      const l = lc(target[i]);
      const stretchy = VOWELS.includes(l) || STRETCHY.includes(l) || PACK_NAME[l];
      if (i === 0 || !stretchy) return soundSay(target[i]);
      return U.cap(lc(target.slice(0, i).join('')) + lc(soundSay(target[i])));
    }

    /* ---------- Prüfen ---------- */
    async function doCheck() {
      if (busy || finished || !ctx.active) return;
      if (!typed.length) return;
      busy = true;
      Object.values(keys).forEach((k) => ctx.unhint(k));
      ctx.unhint(check);
      const typedStr = typed.join('');
      if (typedStr === word) {
        finished = true;
        updateMarks();
        await success();
        return;
      }
      // ---- nicht richtig ----
      const diag = diagnose(typed, target, entry, level);
      const n = ctx.wrongCount + 1;
      const step = n < 2 ? 1 : n === 2 ? 2 : 3;
      // richtige Anfangslaute bleiben (grün) liegen, der Rest wird weggeräumt
      let p = 0;
      while (p < typed.length && p < target.length && typed[p] === target[p]) p++;
      if (diag.keep === false) p = 0;
      await ctx.wrong(line, { say: step < 3 ? diag.say : '', keep: true });
      if (!ctx.active) return;
      typed = typed.slice(0, p);
      okPrefix = p;
      render();
      if (step === 1) {
        if (p > 0) await ctx.say(p === 1 ? 'Der grüne Buchstabe stimmt schon.' : 'Die grünen Buchstaben stimmen schon.');
      } else if (step === 2) {
        // Strategie: gedehnt sprechen, jeder Laut ist ein Hüpfer
        showHops(true);
        await ctx.say('Wir sprechen ganz langsam, Laut für Laut. Bei jedem Laut hüpft ein Punkt.');
        if (!ctx.active) return;
        await sayStretched();
        if (!ctx.active) return;
        await ctx.say(say, { rate: 0.8 });
        if (!ctx.active) return;
        await ctx.say('Wie viele Hüpfer hast du gehört?');
        if (!ctx.active) return;
        await ctx.sleep(1800);
        if (!ctx.active) return;
        await ctx.say(`${U.cap(w(target.length))} Hüpfer. Also schreiben wir ${w(target.length)} Laute.`);
        if (!ctx.active) return;
        const next = keys[target[typed.length]];
        if (next) { ctx.hint(next); ctx.timeout(() => ctx.unhint(next), 4000); }
      } else {
        await model();
      }
      if (!ctx.active) return;
      busy = false;
      render();
    }

    /** Hilfe Stufe 3: Flo schreibt vor, dann schreibt das Kind geführt nach. */
    async function model() {
      ctx.modelShown = true;
      showHops(true);
      typed = [];
      okPrefix = 0;
      render();
      await ctx.say('Schau, so mache ich es. Ich spreche ganz langsam und höre auf jeden Laut. Dann suche ich den Buchstaben.');
      const last = target.length - 1;
      for (let i = 0; i <= last; i++) {
        if (!ctx.active) return;
        const tok = target[i];
        lightHop(i);
        const q = i === 0 ? 'Was höre ich zuerst?' : i === last ? 'Und zum Schluss?' : 'Und dann?';
        await ctx.say(q);
        if (!ctx.active) return;
        await ctx.say(prefixSay(i), { rate: 0.7 });
        if (!ctx.active) return;
        typed.push(tok);
        render();
        const k = keys[tok];
        if (k) ctx.hint(k);
        await ctx.say(tokenSay(tok));
        if (!ctx.active) return;
        if (k) ctx.unhint(k);
        await ctx.sleep(200);
      }
      line.classList.add('swk-shown');
      await ctx.say(`So schreibt man ${say}. Jetzt du! Sprich wieder langsam mit.`);
      if (!ctx.active) return;
      await ctx.sleep(600);
      line.classList.remove('swk-shown');
      typed = [];
      guided = true;
    }

    /* ---------- Geschafft ---------- */
    async function success() {
      // Silbenfarben + Silben vorlesen
      const cells = Array.from(line.querySelectorAll('.swk-cell'));
      cells.forEach((c, i) => { c.classList.remove('swk-ok', 'swk-cursor'); c.classList.add(sylIdx[i] % 2 ? 'swk-syl-r' : 'swk-syl-b'); });
      line.classList.add('swk-done');
      cells.filter((c) => !c.classList.contains('swk-filled')).forEach((c) => c.remove());
      const first = ctx.wrongCount === 0;
      const PROC = {
        1: ['Super! Du hast langsam mitgesprochen und jeden Laut gefunden.', 'Klasse! Du hast genau hingehört, Laut für Laut.'],
        2: ['Toll! Du hast auch bei dem langen Wort jeden Laut gehört.', 'Super! Langsam sprechen hilft, das hast du prima gemacht.'],
        3: ['Wow! Du hast auch den versteckten Laut gehört.', 'Super! Du hast die Laute ganz allein gezählt.'],
        4: ['Klasse! Du hast das Lautpaket erkannt.', 'Super! Du hast an den großen Anfang gedacht.'],
        5: ['Wie ein Schulkind! Du hast genau gehört und an groß und klein gedacht.', 'Toll! Du hast selbst überlegt, ob das Wort groß oder klein beginnt.'],
      };
      const sayOk = first && U.chance(0.3)
        ? U.pickFresh('swk-proc-' + level, PROC[level], 1)
        : `${U.pickFresh('swk-ok', ['Richtig', 'Super', 'Prima', 'Genau so', 'Toll geschrieben'], 2)}! ${say}.`;
      await ctx.correct(line, { say: sayOk, praise: false });
      if (!ctx.active) return;
      // Silben nacheinander hervorheben
      const syls = syllables(entry.t);
      if (syls.length > 1) {
        for (let s = 0; s < syls.length; s++) {
          if (!ctx.active) return;
          const on = cells.filter((c, i) => sylIdx[i] === s);
          on.forEach((c) => c.classList.add('swk-lit'));
          await ctx.say(level <= 3 ? U.cap(lc(syls[s])) : syls[s]);
          on.forEach((c) => c.classList.remove('swk-lit'));
          await ctx.sleep(100);
        }
        if (!ctx.active) return;
        await ctx.say(say);
        if (!ctx.active) return;
      }
      // Merksätze
      if (/^s[tp]/.test(lc(word))) {
        await ctx.say(`Am Wortanfang hören wir Sch, aber wir schreiben S ${lc(word)[1] === 't' ? 'T' : 'P'}.`);
      } else if (diktat) {
        await ctx.say(isNoun(entry)
          ? `${say} ist ein Namenwort. Darum schreiben wir es groß.`
          : U.pickFresh('swk-klein', [`${say} ist kein Namenwort. Darum schreiben wir es klein.`, 'Richtig klein geschrieben!', ''], 1));
      }
      if (!ctx.active) return;
      await ctx.sleep(450);
      resolveTask();
    }

    let resolveTask;
    const done = new Promise((r) => { resolveTask = r; });
    render();

    // ---------- Anweisung ----------
    if (!abcShown) {
      abcShown = true;
      abc.classList.add('pulse');
      ctx.timeout(() => abc.classList.remove('pulse'), 4000);
      await ctx.say(ABC_INTRO);
      if (!ctx.active) return;
    }
    let instr;
    if (diktat) instr = `Schreibe: ${say}. ${entry.s} ${say}.`;
    else if (fixed && ctx.index === 0) instr = `Schreibe das Wort ${say}. Für jeden Laut gibt es ein Kästchen.`;
    else if (!fixed && ctx.index === 0) instr = `Schreibe das Wort ${say}. Tippe auf den Haken, wenn du fertig bist.`;
    else instr = `Schreibe: ${say}.`;
    if (!fixed && ctx.flow < 0) showHops();
    busy = false;
    render();
    ctx.testSolve(() => {
      if (finished) return;
      busy = false;
      typed = target.slice();
      render();
      doCheck();
    });
    await ctx.instruct(instr);
    if (!ctx.active) return;
    await done;
  }

  /* ==================================================================
     Fehlerdiagnose (erklärt die Fehlvorstellung, verrät die Lösung nicht)
     ================================================================== */
  function diagnose(typed, target, entry, level) {
    const tl = typed.map(lc);
    const gl = target.map(lc);
    const tStr = tl.join('');
    const gStr = gl.join('');
    const noun = isNoun(entry);
    const say = spoken(entry, level);

    // Groß/klein (nur Stufe 4/5)
    if (tStr === gStr) {
      const f = typed.join('').charAt(0);
      const wantBig = noun;
      const isBig = f !== f.toLowerCase();
      if (isBig !== wantBig) {
        return {
          keep: false,
          say: wantBig
            ? `Fast! Alle Laute stimmen. Passt der, die oder das davor? ${U.cap(entry.a || 'der')} ${say}, ja! Dann ist es ein Namenwort. Wie fangen Namenwörter an?`
            : `Fast! Alle Laute stimmen. Kann man der ${say} oder die ${say} sagen? Nein. Dann ist es kein Namenwort. Wie fängt es dann an?`,
        };
      }
      return { say: 'Fast! Alle Laute stimmen. Schau auf groß und klein: In der Mitte vom Wort stehen kleine Buchstaben.' };
    }
    // St/Sp-Falle
    if (/^s[tp]/.test(gStr) && /^sch/.test(tStr)) {
      return {
        keep: false,
        say: `Fast! Wir hören am Anfang Sch. Aber am Wortanfang schreiben wir dafür nur ein S. Das ist eine Schreibregel.`,
      };
    }
    // Selbstlaute ausgelassen
    const noVowels = gl.filter((t) => !VOWELS.includes(t));
    if (tl.length < gl.length && tl.length === noVowels.length && tl.every((t, i) => t === noVowels[i])) {
      const vi = gl.findIndex((t) => VOWELS.includes(t));
      const pos = vi === 0 ? 'am Anfang' : vi === gl.length - 1 ? 'am Ende' : 'in der Mitte';
      const kind = PACK_NAME[gl[vi]] ? 'ein Lautpaket wie ei, au oder eu' : 'ein Selbstlaut wie A, E, I, O oder U';
      return { say: `Fast! Hör mal genau hin. In jedem Wort wohnt ${kind}. Sprich ${say} langsam. Was hörst du ${pos}?` };
    }
    // genau ein Laut fehlt
    if (tl.length === gl.length - 1) {
      for (let i = 0; i < gl.length; i++) {
        const cand = gl.slice(0, i).concat(gl.slice(i + 1));
        if (cand.join('|') === tl.join('|')) {
          const missing = gl[i];
          const cons = !VOWELS.includes(missing);
          const nb = (j) => j >= 0 && j < gl.length && !VOWELS.includes(gl[j]);
          if (i === 0) return { say: `Fast! Hör genau auf den Anfang von ${say}. Da fehlt noch ein Laut.` };
          if (cons && (nb(i - 1) || nb(i + 1))) {
            return { say: `Fast! Da versteckt sich noch ein Laut. Hör ganz genau hin, nach ${tokenName(gl[i - 1]).replace('das', 'dem')} kommt noch einer.` };
          }
          return { say: `Fast! Da fehlt noch ein Laut. Sprich ${say} ganz langsam mit.` };
        }
      }
    }
    // ein Laut zu viel
    if (tl.length === gl.length + 1) {
      for (let i = 0; i < tl.length; i++) {
        const cand = tl.slice(0, i).concat(tl.slice(i + 1));
        if (cand.join('|') === gl.join('|')) {
          return { say: 'Fast! Da ist ein Buchstabe zu viel. Sprich langsam und zähle die Laute.' };
        }
      }
    }
    // gleiche Laute, falsche Reihenfolge
    if (tl.length === gl.length && tl.slice().sort().join('|') === gl.slice().sort().join('|')) {
      return { say: 'Alle Laute sind da! Aber die Reihenfolge stimmt noch nicht. Was hörst du zuerst?' };
    }
    // ein Laut anders
    if (tl.length === gl.length) {
      const diff = [];
      tl.forEach((t, i) => { if (t !== gl[i]) diff.push(i); });
      if (diff.length === 1) {
        const i = diff[0];
        const chosen = tl[i];
        const similar = (SIM[gl[i]] || []).includes(chosen);
        const where = i === 0 ? 'auf den ersten Laut' : `auf den ${ORD[i] || 'nächsten'} Laut`;
        const pre = `Du hast ${tokenName(chosen)} genommen, ${tokenSay(chosen)}.`;
        return {
          say: similar
            ? `Fast! ${pre} Das klingt ganz ähnlich. Sprich ${say} ganz deutlich und hör ${where}.`
            : `Fast! ${pre} Hör noch mal genau ${where}.`,
        };
      }
    }
    if (tl.length < gl.length) return { say: `Fast! Da fehlen noch Laute. Sprich ${say} ganz langsam und hör auf jeden Laut.` };
    return { say: `Fast! Sprich ${say} ganz langsam mit und hör auf jeden Laut.` };
  }
})();
