/* ==========================================================================
   Spiel „Rechen-Theater“ 🎭 (Rechenschule, Klasse 1) – Spec B6
   Sachaufgaben verstehen: Szene → passende Rechnung → Antwort (Zahlenraum 20).

   Didaktik:
   - Flo erzählt eine kleine Theaterszene. Das Bild spielt die Handlung mit
     (Dinge kommen dazu, gehen weg, zwei Reihen werden verglichen …), der Text
     steht mit Ziffern zum Mitlesen darunter. 🔁 spielt die Szene nochmal.
   - Schritt 1: Das Kind wählt aus 3 Rechnungen die passende. Die Ablenker
     sind gezielt gewählt: falsches Rechenzeichen (Schlüsselwort-Falle) und
     eine falsche Zahl (genau hinhören).
   - Schritt 2: Die Rechnung wird ausgerechnet; danach spricht Flo den
     Antwortsatz („Jetzt sind es dreizehn Vögel.“).
   - Stufen:
       1  Hinzukommen bis 10 (Brücke aus der Vorschule)
       2  Wegnehmen bis 10 (gemischt mit Hinzukommen bis 20 ohne Zehnerübergang)
       3  Vergleichen bis 20 ohne Zehnerübergang: „Wie viele mehr / weniger?“ → Minus!
       4  Ergänzen mit Platzhalter: 8 + ☐ = 14 – ab hier mit Zehnerübergang
       5  Knifflig: Sprach-Fallen („Das sind 4 mehr, als Ben hat“), alle Arten
          gemischt und umgekehrt: die passende Geschichte zur Rechnung finden.
     Die Aufgabenart hängt an der Rundenstufe; ctx.flow macht den Zahlenraum innerhalb
     der Stufe leichter oder schwerer (siehe range()).
   - Fehlvorstellung: „mehr heißt immer plus“. Hilfe: Szene nachspielen statt
     auf Signalwörter achten (Hinweise beschreiben die Handlung).
   - Hilfe-Leiter: 1. Fehler → Erklärung des Missverständnisses (ohne Lösung)
     + Denkanstoß (Bild zeigt Paare / Lücken), 2. Fehler → Flo macht es vor.
   - Lerninhalte (ctx.item): 'Dazu 8 + 5', 'Weg 12 - 4', 'Vergleich 13 - 9',
     'Ergänzen 8 + ? = 14', 'Falle 15 - 4', 'Mehr 7 + 4', 'Geschichte 12 - 5'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(U.numberWord(n));
  const D = (n) => String(n);

  /* ---------------- Personen ---------------- */
  const KIDS = [
    { n: 'Lena', g: 'f', e: '👧' }, { n: 'Ben', g: 'm', e: '👦' }, { n: 'Aylin', g: 'f', e: '👧' },
    { n: 'Emil', g: 'm', e: '👦' }, { n: 'Mia', g: 'f', e: '👧' }, { n: 'Yusuf', g: 'm', e: '👦' },
    { n: 'Sofia', g: 'f', e: '👧' }, { n: 'Noah', g: 'm', e: '👦' }, { n: 'Elif', g: 'f', e: '👧' },
    { n: 'Jonas', g: 'm', e: '👦' }, { n: 'Hanna', g: 'f', e: '👧' }, { n: 'Karim', g: 'm', e: '👦' },
  ];
  const er = (p) => (p.g === 'f' ? 'sie' : 'er');
  const Er = (p) => (p.g === 'f' ? 'Sie' : 'Er');
  function twoKids() {
    const a = U.pickFresh('sac-kid', KIDS, 5, (p) => p.n);
    let b = U.pick(KIDS.filter((p) => p !== a));
    return [a, b];
  }

  /* ---------------- Geschichten ----------------
     f(N, d) liefert { lines: [...], q, ans } – N formatiert Zahlen
     (Ziffern für den Text zum Mitlesen, Zahlwörter für die Sprachausgabe). */
  const ADD = [
    { id: 'ast', e: '🐦', f: (N, d) => ({ lines: [`Auf dem Ast sitzen ${N(d.x)} Vögel.`, `Dann fliegen ${N(d.y)} Vögel dazu.`], q: 'Wie viele Vögel sind es jetzt?', ans: `Jetzt sind es ${N(d.r)} Vögel.` }) },
    { id: 'muscheln', e: '🐚', f: (N, d) => ({ lines: [`${d.p.n} hat ${N(d.x)} Muscheln.`, `Am Strand findet ${er(d.p)} noch ${N(d.y)} Muscheln.`], q: `Wie viele Muscheln hat ${d.p.n} jetzt?`, ans: `${d.p.n} hat jetzt ${N(d.r)} Muscheln.` }) },
    { id: 'busein', e: '🧒', f: (N, d) => ({ lines: [`Im Bus sitzen ${N(d.x)} Kinder.`, `An der Haltestelle steigen ${N(d.y)} Kinder ein.`], q: 'Wie viele Kinder sitzen jetzt im Bus?', ans: `Jetzt sitzen ${N(d.r)} Kinder im Bus.` }) },
    { id: 'aquarium', e: '🐟', f: (N, d) => ({ lines: [`Im Aquarium schwimmen ${N(d.x)} Fische.`, `${d.p.n} setzt ${N(d.y)} neue Fische hinein.`], q: 'Wie viele Fische schwimmen jetzt im Aquarium?', ans: `Jetzt schwimmen ${N(d.r)} Fische im Aquarium.` }) },
    { id: 'blech', e: '🍪', f: (N, d) => ({ lines: [`Auf dem Blech liegen ${N(d.x)} Kekse.`, `${d.p.n} backt noch ${N(d.y)} Kekse dazu.`], q: 'Wie viele Kekse sind es jetzt?', ans: `Jetzt sind es ${N(d.r)} Kekse.` }) },
    { id: 'sticker', e: '⭐', f: (N, d) => ({ lines: [`${d.p.n} hat ${N(d.x)} Sticker.`, `Zum Geburtstag bekommt ${er(d.p)} ${N(d.y)} Sticker dazu.`], q: `Wie viele Sticker hat ${d.p.n} jetzt?`, ans: `${d.p.n} hat jetzt ${N(d.r)} Sticker.` }) },
  ];
  const SUB = [
    { id: 'teller', e: '🍪', f: (N, d) => ({ lines: [`Auf dem Teller liegen ${N(d.x)} Kekse.`, `${d.p.n} isst ${N(d.y)} Kekse auf.`], q: 'Wie viele Kekse liegen noch auf dem Teller?', ans: `Es liegen noch ${N(d.r)} Kekse auf dem Teller.` }) },
    { id: 'busaus', e: '🧒', f: (N, d) => ({ lines: [`Im Bus sitzen ${N(d.x)} Kinder.`, `An der Haltestelle steigen ${N(d.y)} Kinder aus.`], q: 'Wie viele Kinder sitzen noch im Bus?', ans: `Es sitzen noch ${N(d.r)} Kinder im Bus.` }) },
    { id: 'ballons', e: '🎈', f: (N, d) => ({ lines: [`${d.p.n} hat ${N(d.x)} Luftballons.`, `Der Wind pustet ${N(d.y)} Luftballons weg.`], q: `Wie viele Luftballons hat ${d.p.n} noch?`, ans: `${d.p.n} hat noch ${N(d.r)} Luftballons.` }) },
    { id: 'murmeln', e: '🔵', f: (N, d) => ({ lines: [`${d.p.n} hat ${N(d.x)} Murmeln.`, `Beim Spielen verliert ${er(d.p)} ${N(d.y)} Murmeln.`], q: `Wie viele Murmeln hat ${d.p.n} noch?`, ans: `${d.p.n} hat noch ${N(d.r)} Murmeln.` }) },
    { id: 'enten', e: '🦆', f: (N, d) => ({ lines: [`Im Teich schwimmen ${N(d.x)} Enten.`, `Dann watscheln ${N(d.y)} Enten an Land.`], q: 'Wie viele Enten schwimmen noch im Teich?', ans: `Es schwimmen noch ${N(d.r)} Enten im Teich.` }) },
    { id: 'baum', e: '🍎', f: (N, d) => ({ lines: [`Am Baum hängen ${N(d.x)} Äpfel.`, `${d.p.n} pflückt ${N(d.y)} Äpfel ab.`], q: 'Wie viele Äpfel hängen noch am Baum?', ans: `Es hängen noch ${N(d.r)} Äpfel am Baum.` }) },
  ];
  const ERG = [
    { id: 'bus', e: '🧒', f: (N, d) => ({ lines: [`Im Bus sitzen ${N(d.x)} Kinder.`, 'An der Haltestelle steigen noch Kinder ein.', `Jetzt sitzen ${N(d.y)} Kinder im Bus.`], q: 'Wie viele Kinder sind eingestiegen?', ans: `Es sind ${N(d.r)} Kinder eingestiegen.` }) },
    { id: 'sticker', e: '⭐', f: (N, d) => ({ lines: [`${d.p.n} hat ${N(d.x)} Sticker.`, `${Er(d.p)} möchte ${N(d.y)} Sticker haben.`], q: 'Wie viele Sticker fehlen noch?', ans: `Es fehlen noch ${N(d.r)} Sticker.` }) },
    { id: 'regal', e: '📕', f: (N, d) => ({ lines: [`Ins Regal passen ${N(d.y)} Bücher.`, `Es stehen schon ${N(d.x)} Bücher darin.`], q: 'Wie viele Bücher passen noch hinein?', ans: `Es passen noch ${N(d.r)} Bücher hinein.`, totalFirst: true }) },
    { id: 'kette', e: '🔴', f: (N, d) => ({ lines: [`${d.p.n} will eine Kette mit ${N(d.y)} Perlen machen.`, `Auf der Kette sind schon ${N(d.x)} Perlen.`], q: 'Wie viele Perlen fehlen noch?', ans: `Es fehlen noch ${N(d.r)} Perlen.`, totalFirst: true }) },
  ];
  // Dinge zum Vergleichen: Verb + Mehrzahl
  const REL = [
    { id: 'sticker', e: '⭐', v: 'hat', pl: 'Sticker' },
    { id: 'aepfel', e: '🍎', v: 'pflückt', pl: 'Äpfel' },
    { id: 'muscheln', e: '🐚', v: 'sammelt', pl: 'Muscheln' },
    { id: 'murmeln', e: '🔵', v: 'hat', pl: 'Murmeln' },
    { id: 'blumen', e: '🌷', v: 'pflückt', pl: 'Blumen' },
  ];
  /** Vergleich: d.p1 hat d.n1, d.p2 hat d.n2; gefragt wird mit „mehr“ oder „weniger“. */
  function cmpStory(th, N, d) {
    const big = d.n1 > d.n2 ? d.p1 : d.p2;
    const small = d.n1 > d.n2 ? d.p2 : d.p1;
    return {
      lines: [`${d.p1.n} ${th.v} ${N(d.n1)} ${th.pl}.`, `${d.p2.n} ${th.v} ${N(d.n2)} ${th.pl}.`],
      q: d.less ? `Wie viele ${th.pl} ${th.v} ${small.n} weniger als ${big.n}?` : `Wie viele ${th.pl} ${th.v} ${big.n} mehr als ${small.n}?`,
      ans: d.less ? `${small.n} ${th.v} ${N(d.r)} ${th.pl} weniger.` : `${big.n} ${th.v} ${N(d.r)} ${th.pl} mehr.`,
    };
  }
  /** Beziehungsaufgaben (P2 ist gesucht). */
  function relStory(kind, th, N, d) {
    const p1 = d.p1.n;
    const p2 = d.p2.n;
    const lines = {
      cmpadd: [`${p1} ${th.v} ${N(d.x)} ${th.pl}.`, `${p2} ${th.v} ${N(d.y)} ${th.pl} mehr.`],
      cmpsub: [`${p1} ${th.v} ${N(d.x)} ${th.pl}.`, `${p2} ${th.v} ${N(d.y)} ${th.pl} weniger.`],
      mehrals: [`${p1} ${th.v} ${N(d.x)} ${th.pl}.`, `Das sind ${N(d.y)} ${th.pl} mehr, als ${p2} ${th.v}.`],
      wenigerals: [`${p1} ${th.v} ${N(d.x)} ${th.pl}.`, `Das sind ${N(d.y)} ${th.pl} weniger, als ${p2} ${th.v}.`],
    }[kind];
    return { lines, q: `Wie viele ${th.pl} ${th.v} ${p2}?`, ans: `${p2} ${th.v} ${N(d.r)} ${th.pl}.` };
  }

  /* ---------------- Aufgaben ---------------- */
  const OP = { add: '+', sub: '-', cmp: '-', erg: 'gap', cmpadd: '+', cmpsub: '-', mehrals: '-', wenigerals: '+' };
  const LABEL = { add: 'Dazu', sub: 'Weg', cmp: 'Vergleich', erg: 'Ergänzen', cmpadd: 'Mehr', cmpsub: 'Weniger', mehrals: 'Falle', wenigerals: 'Falle', rev: 'Geschichte' };
  const TRAPS = ['mehrals', 'wenigerals', 'cmpadd', 'cmpsub'];

  function eqKey(t) {
    if (t.op === 'gap') return `${t.x} + ? = ${t.y}`;
    return `${t.x} ${t.op} ${t.y}`;
  }
  const keyOf = (t) => `${LABEL[t.kind]} ${eqKey(t)}`;
  const mk = (kind, x, y) => {
    const op = OP[kind] || (kind === 'rev' ? null : '+');
    const t = { kind, x, y, op };
    t.r = op === '+' ? x + y : op === '-' ? x - y : y - x;
    return t;
  };

  /** Zehnerübergang? (+: Einer laufen über die Zehn, −: Einer reichen nicht, ☐: Lücke über die Zehn) */
  const crossesTen = (t) => (t.op === '+' && t.x < 10 && t.x + t.y > 10)
    || (t.op === '-' && t.x > 10 && t.y < 10 && t.x - t.y < 10)
    || (t.op === 'gap' && t.x < 10 && t.y > 10);

  /**
   * Zahlenraum je Stufe und Aufgabenart – steigt Schritt für Schritt:
   *   1  Plus bis 10 ohne Übergang
   *   2  Minus bis 10, Plus bis 20 ohne Übergang
   *   3  Vergleichen (und Plus/Minus) bis 20 ohne Übergang
   *   4/5  mit Zehnerübergang
   * ctx.flow macht es innerhalb der Stufe leichter (−1) oder schwerer (+1).
   * Liefert { max: größte Zahl, cross: Zehnerübergang erlaubt }.
   */
  function range(kind, level, flow) {
    if (level <= 1) return { max: flow > 0 ? 20 : flow < 0 ? 8 : 10, cross: false };
    if (level === 2) {
      if (OP[kind] === '-') return { max: flow > 0 ? 20 : 10, cross: false };
      return { max: flow < 0 ? 10 : 20, cross: flow > 0 };
    }
    if (level === 3) return { max: flow < 0 ? 10 : 20, cross: flow > 0 };
    return { max: 20, cross: flow >= 0 };
  }

  function pool(kind, level, flow) {
    const out = [];
    const { max, cross } = range(kind, level, flow);
    const ok = (t) => cross || !crossesTen(t);
    if (kind === 'add' || kind === 'cmpadd' || kind === 'wenigerals') {
      for (let x = 2; x <= Math.min(kind === 'add' ? 18 : 12, max - 2); x++) {
        for (let y = 2; y <= 9; y++) {
          const t = mk(kind, x, y);
          if (t.r > max || t.r < 4 || !ok(t)) continue;
          out.push(t);
        }
      }
    } else if (kind === 'sub' || kind === 'cmpsub' || kind === 'mehrals') {
      for (let x = 5; x <= max; x++) {
        for (let y = 2; y <= 9; y++) {
          const t = mk(kind, x, y);
          if (t.r >= 2 && ok(t)) out.push(t);
        }
      }
    } else if (kind === 'cmp') {
      for (let x = 5; x <= max; x++) {
        for (let y = 2; y <= x - 2; y++) {
          const t = mk('cmp', x, y);
          if (t.r <= 9 && ok(t)) out.push(t);
        }
      }
    } else if (kind === 'erg') {
      for (let x = 2; x <= 14; x++) {
        for (let y = x + 2; y <= Math.min(max, x + 9); y++) {
          const t = mk('erg', x, y);
          if (ok(t)) out.push(t);
        }
      }
    } else if (kind === 'rev') {
      for (const k of ['add', 'sub']) {
        for (const t of pool(k, level, flow)) if (t.x > t.y + 1 && (k === 'add' || t.x <= 18)) out.push(Object.assign({}, t, { kind: 'rev', base: k }));
      }
    }
    return out;
  }

  // Aufgabenarten je Stufe (Gewichtung über Wiederholung)
  const KINDS = {
    1: ['add'],
    2: ['sub', 'sub', 'add'],
    3: ['cmp', 'cmp', 'add', 'sub'],
    4: ['erg', 'erg', 'cmp', 'sub'],
    5: ['trap', 'trap', 'rev', 'erg', 'cmp', 'mix'],
  };
  const MAIN = { 1: 'add', 2: 'sub', 3: 'cmp', 4: 'erg', 5: 'trap' };

  const INTRO = {
    1: 'Willkommen im Rechentheater! Hör dir die Geschichte gut an. Dann suchst du die passende Rechnung.',
    2: 'Jetzt gehen auch mal welche weg. Spiel die Geschichte im Kopf nach!',
    3: 'Jetzt vergleichen wir. Wer hat mehr, und wie viele mehr? Achtung: Mehr heißt nicht immer plus!',
    4: 'Jetzt fehlt eine Zahl in der Mitte der Rechnung. Wie viele kommen noch dazu?',
    5: 'Jetzt wird es knifflig! Hör ganz genau zu. Manchmal versteckt sich eine Falle. Und manchmal suchst du die Geschichte zur Rechnung.',
  };

  let introduced = new Set();
  let pending = null; // Aufgabenart für die Zwillingsaufgabe nach einem Fehler
  let lastKinds = [];

  function chooseKind(ctx, level) {
    const list = KINDS[level];
    if (pending && pending.until >= ctx.index && list.includes(pending.slot)) return pending.slot;
    if (!introduced.has(level)) return MAIN[level];
    let k = U.pick(list);
    if (lastKinds.length >= 2 && lastKinds.slice(-2).every((x) => x === k)) k = U.pick(list.filter((x) => x !== k)) || k;
    return k;
  }

  /* ---------------- Gleichungen ---------------- */
  const signOf = (op) => (op === '-' ? '−' : '+');
  const opWord = (op) => (op === '-' ? 'minus' : 'plus');
  function eqNode(e, q) {
    // e: { x, y, op } – op 'gap' → x + ☐ = y ; q: Inhalt des Fragefelds
    const n = (v) => el('span.sac-n', String(v));
    const o = (v) => el('span.sac-o', v);
    const box = () => el('span.sac-box', q == null ? '' : String(q));
    if (e.op === 'gap') return el('span.sac-eq', n(e.x), o('+'), box(), o('='), n(e.y));
    if (e.op === 'plain+') return el('span.sac-eq', n(e.x), o('+'), n(e.y));
    return el('span.sac-eq', n(e.x), o(signOf(e.op)), n(e.y));
  }
  function eqSay(e) {
    if (e.op === 'gap') return `${w(e.x)} plus wie viel ist gleich ${w(e.y)}`;
    return `${w(e.x)} ${opWord(e.op === 'plain+' ? '+' : e.op)} ${w(e.y)}`;
  }

  /** Drei Rechnungen: richtig, Rechenzeichen-Falle, falsche Zahl. */
  function eqOptions(t) {
    const right = { x: t.x, y: t.y, op: t.op, trap: 'ok' };
    let swap;
    if (t.op === 'gap') swap = { x: t.x, y: t.y, op: 'plain+', trap: 'gapsum' };
    else if (t.op === '+') swap = t.x > t.y ? { x: t.x, y: t.y, op: '-', trap: 'op' } : { x: t.y, y: t.x, op: '-', trap: 'op' };
    else swap = { x: t.x, y: t.y, op: '+', trap: 'op' };
    const cand = U.shuffle([1, -1, 2, -2]).map((dv) => {
      if (t.op === 'gap') {
        const y2 = t.y + dv;
        return y2 >= t.x + 2 && y2 <= 20 ? { x: t.x, y: y2, op: 'gap', trap: 'num', bad: y2 } : null;
      }
      const y2 = t.y + dv;
      // Die falsche Zahl darf in der Geschichte nicht vorkommen (sonst stimmt die Erklärung
      // „Kommt die … in der Geschichte vor?“ nicht).
      if (y2 < 1 || y2 === t.x) return null;
      if (t.op === '-' && t.x - y2 < 1) return null;
      if (t.op === '+' && t.x + y2 > 20) return null;
      return { x: t.x, y: y2, op: t.op, trap: 'num', bad: y2 };
    }).filter(Boolean);
    let num = cand[0];
    if (!num) {
      // Notfall: die erste Zahl verändern
      const x2 = [t.x + 1, t.x - 1, t.x + 2, t.x - 2].find((v) => v >= 1 && v !== t.y
        && (t.op === 'gap' ? t.y - v >= 2 : t.op === '-' ? v - t.y >= 1 : v + t.y <= 20));
      num = { x: x2, y: t.y, op: t.op, trap: 'num', bad: x2 };
    }
    return [right, swap, num];
  }

  /** Zahl-Antworten: richtig + typische Fehler + Nachbarn, aufsteigend. */
  function numOptions(r, count, prefer) {
    const set = new Set([r]);
    for (const p of prefer) { if (set.size >= count) break; if (p >= 0 && p <= 20) set.add(p); }
    for (const v of U.shuffle([r + 1, r - 1, r + 2, r - 2, r + 10, r - 10])) { if (set.size >= count) break; if (v >= 0 && v <= 20) set.add(v); }
    let g = 0;
    while (set.size < count && g++ < 100) set.add(U.randInt(0, 20));
    return Array.from(set).sort((a, b) => a - b);
  }

  /* ---------------- Rechenwege (Tipp / Vormachen) ---------------- */
  function hintCalc(t) {
    const { x, y, op } = t;
    if (op === 'gap') {
      if (x < 10 && t.y > 10) return `Tipp: Rechne erst bis zur Zehn. Dann weiter bis ${w(y)}.`;
      return `Tipp: Zähle von ${w(x)} weiter bis ${w(y)}. Wie viele Schritte sind das?`;
    }
    if (op === '+') {
      if (x < 10 && x + y > 10) return `Tipp: Rechne erst bis zur Zehn. ${W(x)} plus ${w(10 - x)} ist zehn.`;
      if (x > 10) return `Tipp: Schau nur auf die Einer. ${W(x - 10)} plus ${w(y)}.`;
      return `Tipp: Starte bei ${w(x)} und zähle ${w(y)} weiter.`;
    }
    if (y >= 10) return y === 10 ? 'Tipp: Nimm die Zehn weg. Was bleibt übrig?' : `Tipp: Nimm erst die Zehn weg. Dann noch ${w(y - 10)}.`;
    if (x > 10 && x - y < 10) return `Tipp: Rechne erst bis zur Zehn zurück. ${W(x)} minus ${w(x - 10)} ist zehn.`;
    if (x > 10) return `Tipp: Schau nur auf die Einer. ${W(x - 10)} minus ${w(y)}.`;
    return `Tipp: Starte bei ${w(x)} und geh ${w(y)} Schritte zurück.`;
  }
  function modelCalc(t) {
    const { x, y, op, r } = t;
    if (op === 'gap') {
      if (x < 10 && y > 10) return `Von ${w(x)} bis zehn sind es ${w(10 - x)}. Von zehn bis ${w(y)} sind es ${w(y - 10)}. Zusammen sind es ${w(r)}.`;
      return `Von ${w(x)} bis ${w(y)} sind es ${w(r)} Schritte. ${W(x)} plus ${w(r)} ist ${w(y)}.`;
    }
    if (op === '+') {
      if (x < 10 && x + y > 10) return `${W(x)} plus ${w(10 - x)} ist zehn. Und noch ${w(y - (10 - x))} dazu ist ${w(r)}.`;
      if (x > 10) return `${W(x - 10)} plus ${w(y)} ist ${w(x - 10 + y)}. Mit der Zehn sind es ${w(r)}.`;
      return `${W(x)} plus ${w(y)} ist ${w(r)}.`;
    }
    if (y >= 10) return y === 10 ? `${W(x)} minus zehn ist ${w(r)}.` : `${W(x)} minus zehn ist ${w(x - 10)}. ${W(x - 10)} minus ${w(y - 10)} ist ${w(r)}.`;
    if (x > 10 && x - y < 10) return `${W(x)} minus ${w(x - 10)} ist zehn. Und noch ${w(y - (x - 10))} weg ist ${w(r)}.`;
    if (x > 10) return `${W(x - 10)} minus ${w(y)} ist ${w(x - 10 - y)}. Mit der Zehn sind es ${w(r)}.`;
    return `${W(x)} minus ${w(y)} ist ${w(r)}.`;
  }

  /* ---------------- Szene (Bild) ---------------- */
  function cell(e, cls) {
    return el('span', { class: 'sac-c' + (cls ? ' ' + cls : '') }, el('span.sac-ce', e));
  }
  /** Feld in Zehnerreihen (je zwei Fünfer). spec: Array von Klassen ('' = normal). */
  function field(e, spec) {
    const node = el('div.sac-field');
    node.style.setProperty('--sac-k', String(Math.max(5, Math.min(10, spec.length))));
    const cells = [];
    for (let r = 0; r < Math.ceil(spec.length / 10); r++) {
      const row = el('div.sac-frow');
      for (let i = r * 10; i < Math.min(spec.length, r * 10 + 10); i++) {
        if (i % 10 === 5) row.appendChild(el('span.sac-gap5'));
        const c = cell(spec[i] === 'p' ? '' : e, spec[i] === 'p' ? 'sac-ph' : spec[i]);
        cells.push(c);
        row.appendChild(c);
      }
      node.appendChild(row);
    }
    return { node, cells };
  }
  /** Eine Vergleichsreihe: Person + Dinge in einer Zeile (Fünfer-Lücken, damit Paare untereinander stehen). */
  function relRow(p, e, n, cls) {
    const cellsBox = el('div.sac-rcells');
    const cells = [];
    let line = el('div.sac-rline');
    cellsBox.appendChild(line);
    cellsBox.add = (c, i) => {
      if (i > 0 && i % 10 === 0) { line = el('div.sac-rline'); cellsBox.appendChild(line); }
      else if (i % 10 === 5) line.appendChild(el('span.sac-gap5'));
      line.appendChild(c);
    };
    cellsBox.addRaw = (node) => line.appendChild(node);
    for (let i = 0; i < n; i++) {
      const c = cell(e, typeof cls === 'function' ? cls(i) : cls || '');
      cells.push(c);
      cellsBox.add(c, i);
    }
    const row = el('div.sac-row', el('span.sac-who', el('span.sac-ava', p.e), el('span.sac-name', p.n)), cellsBox);
    return { row, cellsBox, cells };
  }

  /**
   * Baut die Szene für eine Aufgabe.
   * Liefert { node, line(i) – Bild zur i-ten Erzählzeile, reset(), hint(), solved() }.
   */
  function makeScene(ctx, t, story) {
    const node = el('div.sac-scene');
    const kind = t.kind === 'rev' ? t.base : t.kind;
    const e = story.e;
    const api = { node, line() {}, reset() {}, hint() {}, solved() {} };

    if (kind === 'add' || kind === 'sub') {
      let f;
      api.reset = () => {
        U.clear(node);
        const spec = [];
        for (let i = 0; i < t.x; i++) spec.push(kind === 'sub' && i >= t.x - t.y ? 'sac-leaver' : '');
        if (kind === 'add') for (let i = 0; i < t.y; i++) spec.push('sac-new sac-hide');
        f = field(e, spec);
        node.appendChild(f.node);
      };
      api.line = (i) => {
        if (i !== 1) return;
        LT.sfx.play('whoosh');
        const moving = f.cells.filter((c) => c.classList.contains(kind === 'add' ? 'sac-new' : 'sac-leaver'));
        moving.forEach((c, j) => ctx.timeout(() => {
          c.classList.remove('sac-hide');
          c.classList.add(kind === 'add' ? 'sac-in' : 'sac-out');
        }, j * 140));
      };
      api.settle = () => {
        f.cells.forEach((c) => { c.classList.remove('sac-hide'); if (kind === 'add' && c.classList.contains('sac-new')) c.classList.add('sac-in'); if (kind === 'sub' && c.classList.contains('sac-leaver')) c.classList.add('sac-out'); });
      };
      api.hint = () => {
        // Endzustand zeigen und die Zehnerreihen betonen (Denkanstoß zum Rechenweg)
        api.settle();
        f.node.classList.add('sac-tens');
      };
    } else if (kind === 'erg') {
      let f;
      let bag;
      let total;
      const wrap = el('div.sac-ergwrap');
      // gleiche Kästchengröße wie das (größte) Feld, damit ❓ und Gesamtzahl mitwachsen
      wrap.style.setProperty('--sac-k', String(Math.max(5, Math.min(10, t.y))));
      node.appendChild(wrap);
      api.reset = () => {
        U.clear(wrap);
        f = field(e, U.range(1, t.x).map(() => ''));
        bag = el('span.sac-bag.sac-hide', '❓');
        total = el('span.sac-total.sac-hide', el('span.sac-total-n', String(t.y)), el('span.sac-total-e', e));
        if (story.totalFirst) total.classList.remove('sac-hide');
        f.node.classList.toggle('sac-hide', !!story.totalFirst);
        wrap.append(f.node, bag, total);
      };
      api.line = (i) => {
        if (story.totalFirst) {
          if (i === 1) { f.node.classList.remove('sac-hide'); f.node.classList.add('sac-pop'); bag.classList.remove('sac-hide'); }
          return;
        }
        if (i === 1) { bag.classList.remove('sac-hide'); bag.classList.add('sac-pop'); LT.sfx.play('whoosh'); }
        if (i === 2 || (i === 1 && story.lines.length === 2)) { total.classList.remove('sac-hide'); total.classList.add('sac-pop'); }
      };
      const showGap = (filled) => {
        const spec = U.range(1, t.y).map((n) => (n <= t.x ? '' : filled ? 'sac-new sac-in' : 'p'));
        const nf = field(e, spec);
        f.node.replaceWith(nf.node);
        f = nf;
        bag.classList.add('sac-hide');
        total.classList.remove('sac-hide');
      };
      api.settle = () => { f.node.classList.remove('sac-hide'); bag.classList.remove('sac-hide'); total.classList.remove('sac-hide'); };
      api.hint = () => showGap(false);
      api.solved = () => showGap(true);
    } else {
      // Vergleichen und Beziehungsaufgaben: zwei Reihen
      const rows = el('div.sac-rows');
      const maxN = Math.max(t.x, t.y, t.r, t.n1 || 0, t.n2 || 0);
      rows.style.setProperty('--sac-k', String(Math.max(5, Math.min(10, maxN))));
      node.appendChild(rows);
      let r1;
      let r2;
      let q2;
      const known2 = kind === 'cmp';
      api.reset = () => {
        U.clear(rows);
        r1 = relRow(story.p1, e, kind === 'cmp' ? t.n1 : t.x, '');
        if (known2) r2 = relRow(story.p2, e, t.n2, '');
        else {
          r2 = relRow(story.p2, e, 0, '');
          q2 = el('span.sac-q2', '❓');
          r2.cellsBox.addRaw(q2);
        }
        r2.row.classList.add('sac-hide');
        rows.append(r1.row, r2.row);
      };
      api.line = (i) => {
        if (i === 1) { r2.row.classList.remove('sac-hide'); r2.row.classList.add('sac-pop'); LT.sfx.play('pop'); }
      };
      api.settle = () => r2.row.classList.remove('sac-hide');
      const fillRow2 = (cls) => {
        const n2 = t.r;
        const nr = relRow(story.p2, e, n2, cls);
        r2.row.replaceWith(nr.row);
        r2 = nr;
      };
      api.hint = () => {
        api.settle();
        if (kind === 'cmp') {
          // Paare bilden: was keinen Partner hat, ist der Unterschied
          const m = Math.min(t.n1, t.n2);
          r1.cells.forEach((c, i) => c.classList.add(i < m ? 'sac-pair' : 'sac-extra'));
          r2.cells.forEach((c, i) => c.classList.add(i < m ? 'sac-pair' : 'sac-extra'));
        } else if (kind === 'cmpadd' || kind === 'wenigerals') {
          // P2 hat so viele wie P1 – und noch y mehr
          const nr = relRow(story.p2, e, t.x, 'sac-ghost');
          for (let i = 0; i < t.y; i++) nr.cellsBox.add(cell('', 'sac-ph'), t.x + i);
          r2.row.replaceWith(nr.row);
          r2 = nr;
        } else {
          // P1 hat y mehr: diese y wegdenken
          r1.cells.forEach((c, i) => { if (i >= t.x - t.y) c.classList.add('sac-extra'); });
        }
      };
      api.solved = () => { if (kind !== 'cmp') fillRow2((i) => (kind === 'cmpadd' || kind === 'wenigerals') && i >= t.x ? 'sac-new' : ''); };
    }
    return api;
  }

  /* ---------------- Rückmeldungen ---------------- */
  function explainEq(t, wrong, st) {
    const kind = t.kind;
    const a = st.p1.n;
    const b = st.p2.n;
    if (wrong.trap === 'num') return `Schau mal auf die Zahlen. Kommt die ${W(wrong.bad)} in der Geschichte vor?`;
    if (wrong.trap === 'gapsum') return `Fast! Die ${W(t.y)} sind schon alle zusammen. Wir suchen nur die, die noch fehlen.`;
    switch (kind) {
      case 'add': return 'Schau mal: In der Geschichte kommen welche dazu. Werden es dann mehr oder weniger?';
      case 'sub': return 'Schau mal: In der Geschichte gehen welche weg. Werden es dann mehr oder weniger?';
      case 'cmp': return 'Fast! Hier kommt nichts dazu. Wir vergleichen nur zwei Reihen. Gesucht ist der Unterschied.';
      case 'cmpadd': return `Schau genau: ${b} hat mehr als ${a}. Dann muss die Zahl größer werden.`;
      case 'cmpsub': return `Schau genau: ${b} hat weniger als ${a}. Dann muss die Zahl kleiner werden.`;
      case 'mehrals': return `Vorsicht, Falle! ${a} hat mehr. Also hat ${b} weniger.`;
      case 'wenigerals': return `Vorsicht, Falle! ${a} hat weniger. Also hat ${b} mehr.`;
      default: return 'Schau nochmal genau hin. Spiel die Geschichte im Kopf nach.';
    }
  }
  function hintEq(t, st) {
    const a = st.p1.n;
    const b = st.p2.n;
    switch (t.kind) {
      case 'cmp': return 'Schau auf die Reihen. Immer zwei bilden ein Paar. Was keinen Partner hat, ist der Unterschied.';
      case 'erg': return 'Schau auf das Bild. Die Lücke zeigt, was noch fehlt.';
      case 'cmpadd': case 'wenigerals': return `Schau auf das Bild. ${b} hat so viele wie ${a} und noch ein paar mehr.`;
      case 'cmpsub': case 'mehrals': return `Schau auf das Bild bei ${a}. Denk dir die leuchtenden weg. Dann sind es so viele wie bei ${b}.`;
      default: return 'Mach die Augen zu und spiel die Geschichte im Kopf nach. Werden es mehr oder weniger?';
    }
  }
  function modelEq(t, st) {
    const s = eqSay(t);
    const b = st.p2.n;
    switch (t.kind) {
      case 'add': return `Es kommen ${w(t.y)} dazu. Darum rechnen wir ${s}.`;
      case 'sub': return `Es gehen ${w(t.y)} weg. Darum rechnen wir ${s}.`;
      case 'cmp': return `Der Unterschied zwischen ${w(t.x)} und ${w(t.y)}: Wir rechnen ${s}.`;
      case 'erg': return `Wir haben schon ${w(t.x)}. Bis ${w(t.y)} fehlen noch welche. Darum rechnen wir ${s}.`;
      case 'cmpadd': case 'wenigerals': return `${b} hat ${w(t.y)} mehr. Darum rechnen wir ${s}.`;
      default: return `${b} hat ${w(t.y)} weniger. Darum rechnen wir ${s}.`;
    }
  }
  function explainNum(t, v, st) {
    const { x, y, op, r } = t;
    const kind = t.kind === 'rev' ? t.base : t.kind;
    if (TRAPS.includes(kind)) {
      // Vergleichs-Geschichten: Hier kommt nichts dazu und geht nichts weg – zwei Kinder werden verglichen.
      const a = st.p1.n;
      const b = st.p2.n;
      const bMore = kind === 'cmpadd' || kind === 'wenigerals';
      if (v === x) return `So viele hat ${a}. Wir suchen, wie viele ${b} hat.`;
      if (v === y) return `Das ist der Unterschied. ${b} hat ${w(y)} ${bMore ? 'mehr' : 'weniger'} als ${a}. Wie viele hat ${b} also?`;
      if (bMore && v === x - y) return `Fast! ${b} hat mehr als ${a}, nicht weniger.`;
      if (!bMore && v === x + y) return `Fast! ${b} hat weniger als ${a}, nicht mehr.`;
    } else if (op === 'gap') {
      if (v === y) return `Fast! ${W(y)} sind alle zusammen. Wir suchen nur die, die noch dazukommen.`;
      if (v === x) return `So viele sind schon da. Wie viele fehlen bis ${w(y)}?`;
    } else if (kind === 'cmp') {
      if (v === x + y) return 'Fast! Du hast beide Reihen zusammengezählt. Wir suchen aber den Unterschied.';
      if (v === x || v === y) return 'So viele sind in einer Reihe. Wir suchen den Unterschied.';
    } else if (op === '+') {
      if (v === x) return `Das ist die Zahl vom Anfang. Es kommen noch ${w(y)} dazu.`;
    } else if (op === '-') {
      if (v === x) return 'Das ist die Zahl vom Anfang. Es gehen aber welche weg.';
      if (v === y) return 'So viele gehen weg. Wie viele bleiben übrig?';
      if (v === x + y) return 'Fast! Du hast plus gerechnet. In der Rechnung steht minus.';
    }
    return `Fast! Das Ergebnis ist ${v > r ? 'kleiner' : 'größer'} als ${w(v)}.`;
  }

  /* ---------------- Spiel ---------------- */
  LT.registerGame({
    id: 'sachrechnen',
    area: 'mathe1',
    title: 'Rechen-Theater',
    icon: '🎭',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Sachaufgaben lösen (Zahlenraum 20)',
      goal: 'Ihr Kind übersetzt kleine Alltagsgeschichten in Rechnungen: Es hört die Szene, sieht sie im Bild, wählt aus drei Rechnungen die passende und rechnet sie aus. Geübt werden Hinzukommen, Wegnehmen, Vergleichen und Ergänzen. Die Ablenker zielen auf die typische Schlüsselwort-Falle („mehr heißt immer plus“).',
      levels: [
        'Hinzukommen bis 10: Rechnung wählen und ausrechnen',
        'Wegnehmen bis 10, gemischt mit Hinzukommen bis 20 (ohne Zehnerübergang)',
        'Vergleichen bis 20: „Wie viele mehr / weniger?“ (Unterschied mit Minus, ohne Zehnerübergang)',
        'Ergänzen mit Platzhalter (8 + ☐ = 14), jetzt auch mit Zehnerübergang',
        'Sprach-Fallen („Das sind 4 mehr, als Ben hat“), alles gemischt, Geschichte zur Rechnung finden',
      ],
      tip: 'Spielen Sie Rechengeschichten mit Spielzeug nach, statt auf Signalwörter zu achten: „Lena hat 9 Autos, Ben hat 13. Wie viele mehr hat Ben?“ Legen Sie die Autos paarweise nebeneinander. Fragen Sie ruhig: „Kommt etwas dazu oder vergleichen wir nur?“',
    },

    async task(ctx) {
      // Jede Stufe hat eine eigene Aufgabenart (wie LT.s2.lv): Steigt/fällt ctx.taskLevel mitten
      // in der Runde, bliebe sonst die Art nicht gleich (fremdes INTRO mitten in der Runde).
      // Die Art kommt darum aus der Rundenstufe; ctx.flow steuert nur den Zahlenraum (range).
      const level = MAIN[ctx.taskLevel] === MAIN[ctx.level] ? ctx.taskLevel : ctx.level;
      if (ctx.index === 0) { introduced = new Set(); pending = null; lastKinds = []; }
      let slot = chooseKind(ctx, level);
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      lastKinds.push(slot);
      let kind = slot;
      if (slot === 'trap') kind = U.pick(TRAPS);
      if (slot === 'mix') kind = U.pick(['add', 'sub']);
      const t = Object.assign({}, ctx.item(pool(kind, level, ctx.flow), keyOf, { avoid: 6 }));
      kind = t.kind;

      // --- Geschichte zusammenstellen ---
      const [p1, p2] = twoKids();
      const baseKind = kind === 'rev' ? t.base : kind;
      let story;
      let tpl;
      if (baseKind === 'cmp') {
        tpl = U.pickFresh('sac-rel', REL, 3, (x) => x.id);
        const bigFirst = U.chance(0.5);
        Object.assign(t, { n1: bigFirst ? t.x : t.y, n2: bigFirst ? t.y : t.x });
        const less = U.chance(0.4);
        const d = { p1, p2, n1: t.n1, n2: t.n2, r: t.r, less };
        story = { show: cmpStory(tpl, D, d), say: cmpStory(tpl, w, d), e: tpl.e, p1, p2 };
        t.qWord = less ? 'weniger' : 'mehr';
      } else if (TRAPS.includes(baseKind)) {
        tpl = U.pickFresh('sac-rel', REL, 3, (x) => x.id);
        const d = { p1, p2, x: t.x, y: t.y, r: t.r };
        story = { show: relStory(baseKind, tpl, D, d), say: relStory(baseKind, tpl, w, d), e: tpl.e, p1, p2 };
      } else {
        const list = baseKind === 'add' ? ADD : baseKind === 'sub' ? SUB : ERG;
        tpl = U.pickFresh('sac-' + baseKind, list, 3, (x) => x.id);
        const d = { p: p1, x: t.x, y: t.y, r: t.r };
        story = { show: tpl.f(D, d), say: tpl.f(w, d), e: tpl.e, p1, p2 };
      }
      story.lines = story.say.lines;
      story.totalFirst = !!story.show.totalFirst;

      // --- Bühne ---
      const theater = el('div.sac-theater');
      const curtain = el('div.sac-curtain', { 'aria-hidden': 'true' });
      const scene = makeScene(ctx, t, story);
      const replay = el('button.sac-replay', { type: 'button', 'aria-label': 'Geschichte nochmal hören', title: 'Nochmal' }, U.emoji('🔁'));
      theater.append(curtain, scene.node, replay);
      const textBox = el('div.sac-text');
      const stepBox = el('div.sac-step');
      let choicesBox = el('div.choices.sac-choices');
      // frische Auswahl-Box (ctx.choices sperrt die alte mit .locked)
      const freshBox = () => { const nb = el('div.choices.sac-choices'); choicesBox.replaceWith(nb); choicesBox = nb; };
      ctx.stage.classList.add('sac-stage');
      ctx.stage.append(theater, textBox, stepBox, choicesBox);

      const lineEls = story.show.lines.map((s) => el('p.sac-line', s));
      const qEl = el('p.sac-line.sac-q', story.show.q);
      const ansEl = el('p.sac-line.sac-ans.sac-hide', story.show.ans);
      textBox.append(...lineEls, qEl, ansEl);

      const fullSay = `${story.say.lines.join(' ')} ${story.say.q}`;

      // token: jede neue Erzählung (oder jede Antwort / jeder Tipp) beendet die laufende Erzählung.
      let token = 0;
      let narrating = 0; // token der gerade laufenden Erzählung (0 = keine)
      let narration = null; // Promise der zuletzt gestarteten Erzählung
      let solved = false; // Schritt 2 gelöst → 🔁 macht nichts mehr
      const stopNarration = () => { token++; narrating = 0; };
      async function narrate(withScene) {
        const my = ++token;
        narrating = my;
        try { return await narrateRun(my, withScene); } finally { if (narrating === my) narrating = 0; }
      }
      async function narrateRun(my, withScene) {
        if (withScene) scene.reset();
        lineEls.forEach((n) => n.classList.remove('sac-now'));
        for (let i = 0; i < story.say.lines.length; i++) {
          if (my !== token || !ctx.active) return false;
          lineEls[i].classList.add('sac-show', 'sac-now');
          if (withScene) scene.line(i);
          await ctx.say(story.say.lines[i]);
          lineEls[i].classList.remove('sac-now');
          if (my !== token || !ctx.active) return false;
          await ctx.sleep(200);
        }
        if (my !== token || !ctx.active) return false;
        qEl.classList.add('sac-show', 'sac-now');
        await ctx.say(story.say.q);
        qEl.classList.remove('sac-now');
        return my === token;
      }

      let hinted = false;
      const showHint = () => { if (!hinted) { hinted = true; stopNarration(); scene.settle && scene.settle(); scene.hint(); } };

      ctx.listen(replay, 'click', () => {
        // Nicht dazwischenreden: Während Flo eine Rückmeldung, einen Tipp oder die Frage spricht
        // (oder nach der Lösung) bleibt 🔁 ohne Wirkung. Eine laufende Erzählung beginnt neu.
        if (solved || (LT.speech.speaking && !narrating)) return;
        LT.sfx.play('click');
        narration = narrate(!hinted && kind !== 'rev');
      });
      /** Erzählen und warten, bis die (evtl. per 🔁 neu gestartete) Erzählung fertig ist. */
      async function narrateFully(withScene) {
        narration = narrate(withScene);
        for (;;) {
          const p = narration;
          const done = await p;
          if (done || !ctx.active || p === narration) return done;
        }
      }

      // Prozess-Lob höchstens einmal pro Aufgabe, nur auf Anhieb
      const praiseStep = U.chance(0.3) ? (U.chance(0.5) ? 1 : 2) : 0;

      if (kind === 'rev') {
        // ----- Stufe 5: Geschichte zur Rechnung finden -----
        theater.classList.add('sac-hide');
        textBox.classList.add('sac-hide');
        const e = { x: t.x, y: t.y, op: t.op };
        stepBox.appendChild(el('div.sac-eqcard', el('span.sac-eqlabel', 'Rechnung'), eqNode(e)));
        // Ablenker: andere Handlung mit gleichen Zahlen, gleiche Handlung mit anderer Zahl
        const otherList = t.base === 'add' ? SUB : ADD;
        const sameList = t.base === 'add' ? ADD : SUB;
        const tOther = U.pick(otherList.filter((x) => x.id !== tpl.id));
        const tSame = U.pick(sameList.filter((x) => x.id !== tpl.id));
        let y2 = t.y + U.pick([1, -1, 2]);
        if (y2 < 2 || y2 >= t.x - 1 || (t.base === 'add' && t.x + y2 > 20)) y2 = t.y === 2 ? 3 : t.y - 1;
        const mkStory = (tp, x, y, k) => {
          const r = k === 'add' ? x + y : x - y;
          const dd = { p: U.pick(KIDS), x, y, r };
          return { show: tp.f(D, dd).lines.join(' '), say: tp.f(w, dd).lines.join(' ') };
        };
        const sRight = { show: story.show.lines.join(' '), say: story.say.lines.join(' ') };
        const sOther = mkStory(tOther, t.x, t.y, t.base === 'add' ? 'sub' : 'add');
        const sSame = mkStory(tSame, t.x, y2, t.base);
        const cards = [
          { s: sRight, trap: 'ok', correct: true },
          { s: sOther, trap: 'op' },
          { s: sSame, trap: 'num', bad: y2 },
        ].map((c) => ({ content: el('span.sac-storytxt', c.s.show), correct: !!c.correct, say: c.s.say, className: 'sac-card', trap: c.trap, bad: c.bad }));
        // Wer noch nicht flüssig liest, soll wissen, dass Flo vorlesen kann. Beim ersten Mal in
        // der Runde liest Flo alle drei Geschichten vor (nameFirst: Kachel leuchtet, Eingabe wartet).
        const readAll = !introduced.has('rev');
        introduced.add('rev');
        await ctx.instruct(readAll
          ? `Welche Geschichte passt zur Rechnung ${eqSay(e)}? Ich lese dir die Geschichten vor. Hör genau zu!`
          : `Welche Geschichte passt zur Rechnung ${eqSay(e)}? Lies genau, oder tipp auf den Lautsprecher. Dann lese ich dir die Geschichte vor.`);
        if (!ctx.active) return;
        await ctx.choices(cards, {
          container: choicesBox,
          sayButton: true,
          nameFirst: readAll,
          hintAfter: 1,
          praise: false,
          correctSay: () => (praiseStep === 1 && ctx.wrongCount === 0
            ? 'Genau! Du hast genau gelesen und die Geschichte im Kopf nachgespielt. Super!'
            : U.pickFresh('sac-ok', ['Genau, die passt!', 'Richtig, das ist die Geschichte!', 'Super, die passt zur Rechnung!'], 1)),
          explain: (wr) => (wr.trap === 'op'
            ? (t.base === 'add' ? 'In dieser Geschichte gehen welche weg. Bei plus kommen welche dazu.' : 'In dieser Geschichte kommen welche dazu. Bei minus gehen welche weg.')
            : `Schau genau auf die Zahlen. In dieser Geschichte kommt die ${W(wr.bad)} vor.`),
          hintSay: 'Spiel jede Geschichte im Kopf nach. Kommen welche dazu oder gehen welche weg? Und passen die Zahlen?',
          modelSay: () => (t.base === 'add' ? `Hier kommen ${w(t.y)} dazu. Das passt zu ${eqSay(e)}.` : `Hier gehen ${w(t.y)} weg. Das passt zu ${eqSay(e)}.`),
        });
        if (!ctx.active) return;
        await ctx.sleep(300);
        // Szene zur gewählten Geschichte zeigen, dann ausrechnen
        freshBox();
        U.clear(stepBox);
        theater.classList.remove('sac-hide');
        textBox.classList.remove('sac-hide');
        lineEls.forEach((n) => n.classList.add('sac-show'));
        qEl.classList.add('sac-show');
        scene.reset();
        scene.line(1);
        await ctx.say(story.say.q);
        if (!ctx.active) return;
      } else {
        // ----- Schritt 1: Szene erzählen, Rechnung wählen -----
        ctx.setInstruction(`${fullSay} Welche Rechnung passt?`);
        await ctx.sleep(150);
        await narrateFully(true);
        if (!ctx.active) return;
        await ctx.say('Welche Rechnung passt?');
        if (!ctx.active) return;

        const opts = eqOptions(t).map((e) => ({
          content: eqNode(e), correct: e.trap === 'ok', say: eqSay(e), className: 'sac-eqtile' + (e.op === 'gap' || t.op === 'gap' ? ' sac-eqgap' : ''), e, trap: e.trap, bad: e.bad,
        }));
        const trapWord = t.qWord || (t.kind === 'mehrals' || t.kind === 'cmpadd' ? 'mehr' : t.kind === 'wenigerals' || t.kind === 'cmpsub' ? 'weniger' : '');
        await ctx.choices(opts, {
          container: choicesBox,
          hintAfter: 1,
          praise: false,
          correctSay: () => {
            if (praiseStep === 1 && ctx.wrongCount === 0) {
              if (trapWord && t.op === (trapWord === 'mehr' ? '-' : '+')) return `Genau! Du hast dich vom Wort ${trapWord} nicht reinlegen lassen. Stark!`;
              if (t.kind === 'erg') return 'Genau! Du hast gemerkt, dass eine Zahl in der Mitte fehlt. Klasse!';
              return 'Genau! Du hast die Geschichte im Kopf nachgespielt. Super!';
            }
            return `${U.pickFresh('sac-eqok', ['Genau!', 'Richtig!', 'Super!'], 1)} ${U.cap(eqSay(t))}.`;
          },
          explain: (wr) => { stopNarration(); return explainEq(t, wr, story); },
          hintSay: () => hintEq(t, story),
          modelSay: () => modelEq(t, story),
          onWrong: async () => { showHint(); },
          onCorrect: () => stopNarration(),
        });
        if (!ctx.active) return;
        stopNarration();
        if (scene.settle) scene.settle();
        await ctx.sleep(250);
      }

      // ----- Schritt 2: ausrechnen -----
      freshBox();
      U.clear(stepBox);
      const eqLine = el('div.sac-eqline', eqNode({ x: t.x, y: t.y, op: t.op }, '?'));
      if (t.op !== 'gap') eqLine.firstChild.append(el('span.sac-o', '='), el('span.sac-box', '?'));
      const qBox = eqLine.querySelector('.sac-box');
      if (t.op === 'gap') qBox.textContent = '?';
      stepBox.appendChild(eqLine);
      const count = level === 1 || ctx.flow < 0 ? 3 : 4;
      let prefer;
      if (t.op === 'gap') prefer = [t.y, t.x];
      else if (baseKind === 'cmp') prefer = [t.x + t.y, t.x];
      else if (t.op === '+' && TRAPS.includes(baseKind)) prefer = [t.x - t.y, t.x, t.y];
      else if (t.op === '+') prefer = [t.x, t.r + 1];
      else prefer = [t.x + t.y, t.y, t.x];
      const nums = numOptions(t.r, count, U.shuffle(prefer)).map((v) => ({ content: String(v), text: true, correct: v === t.r, say: w(v), value: v }));
      const askSay = t.op === 'gap' ? `${U.cap(eqSay(t))}?` : `Wie viel ist ${eqSay(t)}?`;
      await ctx.instruct(askSay);
      if (!ctx.active) return;
      const ha = LT.z2 ? LT.z2.hintAfterFor(ctx, nums.length) : (nums.length <= 3 ? 1 : 2);
      await ctx.choices(nums, {
        container: choicesBox,
        size: 'small',
        shuffle: false,
        hintAfter: ha,
        praise: false,
        correctSay: () => {
          const ans = story.say.ans;
          if (praiseStep === 2 && ctx.wrongCount === 0) {
            if (crossesTen(t)) return `Richtig! Du hast erst bis zur Zehn gerechnet. Sehr schlau! ${ans}`;
            if (t.op === 'gap') return `Richtig! Du hast geschickt weitergezählt. ${ans}`;
            return `Richtig! Du hast ganz genau gerechnet. ${ans}`;
          }
          return `${U.pickFresh('sac-nok', ['Richtig!', 'Genau!', 'Super!'], 1)} ${ans}`;
        },
        explain: (wr) => { stopNarration(); return explainNum(t, wr.value, story); },
        hintSay: () => { showHint(); return hintCalc(t); },
        modelSay: () => modelCalc(t),
        onCorrect: () => {
          qBox.textContent = String(t.r);
          qBox.classList.add('sac-done');
          ansEl.classList.remove('sac-hide');
          ansEl.classList.add('sac-show', 'sac-pop');
          qEl.classList.add('sac-dim');
          solved = true;
          stopNarration();
          replay.disabled = true;
          scene.solved();
        },
      });
      if (!ctx.active) return;
      if (ctx.wrongCount > 0) pending = { slot, until: ctx.index + 2 };
      else if (pending && pending.until <= ctx.index) pending = null;
      await ctx.sleep(600);
    },
  });
})();
