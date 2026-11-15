/* ==========================================================================
   Spiel „Müll-Profi“ ♻️ (Sachkunde-Schule, Klasse 1) – Spec B16 „Müll-Sortier-Profi“

   Didaktik (Sachunterricht Klasse 1: Umwelt, Müll trennen und vermeiden):
   - Die fünf Tonnen in Deutschland: Gelbe Tonne / Gelber Sack (Verpackungen
     aus Plastik und Metall, auch Getränkekartons), blaue Papiertonne
     (sauberes Papier und Pappe), braune Biotonne (Reste von Obst, Gemüse,
     Pflanzen), Glascontainer (Flaschen und Gläser, nach Farben: Weiß-,
     Grün-, Braunglas) und graue Restmülltonne.
   - Die Leitfrage „Woraus ist das? Ist es eine Verpackung?“ statt Raten.
   - Pfand: Flaschen und Dosen mit Pfandzeichen bringt man in den Laden
     zurück (Pfand-Automat), Mehrwegflaschen werden gespült und neu befüllt.
   - Stufe 5: Vermeiden vor Trennen – Brotdose statt Alufolie,
     Trinkflasche statt Saftpäckchen, reparieren statt wegwerfen.
   - Stufen:
       1  Drei Tonnen (gelb, blau, braun), eindeutige Dinge – Brücke aus der
          Vorschule (Farbe + Material). Beim Steigern kommt der Restmüll dazu.
       2  Alle fünf Tonnen, ein Ding nach dem anderen (mit ersten Fallen
          wie dem benutzten Taschentuch).
       3  Sortier-Band: mehrere Dinge nacheinander antippen und in die
          Tonne tippen oder ziehen (eigene Bedienung, mit Fallen).
       4  Glas nach Farben (bunte Flaschen zum Grünglas, Deckel ab) und
          Pfand erkennen (Pfandzeichen genau anschauen).
       5  Vermeiden vor Trennen („Was ist am besten?“) im Wechsel mit dem
          Profi-Sortierband voller Fallen – Niveau Ende Klasse 1.
   - Fehlvorstellungen: „Alles aus Plastik kommt in die Gelbe Tonne“
     (Zahnbürste, Spielzeug sind keine Verpackungen), „Papier ist immer
     blau“ (benutztes Taschentuch, Bonbonpapier aus Plastik), „Saftkarton
     ist Pappe“ (beschichtet → gelb), „Alles Glas in den Container“
     (Trinkglas → Restmüll), „Blaue Flaschen ins Weißglas“ (→ Grünglas),
     „Pfandflaschen in die Gelbe Tonne“, „Trennen ist das Beste“
     (Vermeiden ist noch besser).
   - Hilfe-Leiter: 1. Erklärung, was an der gewählten Tonne nicht passt
     (ohne Lösung), 2. Strategie-Tipp (Woraus ist es?), 3. Flo zeigt die
     richtige Tonne und erklärt warum; das Ding kommt in der Runde wieder.
   - Lerninhalte (ctx.item / ctx.track): „Zeitung“, „Taschentuch“,
     „Saftkarton“, „Glas: blaue Flasche“, „Pfand: Dose“, „Vermeiden: Brotdose“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const cap = (s) => U.cap(s);
  const vary = (key, list) => U.pickFresh('mue-' + key, list, Math.min(2, list.length - 1));
  const hintAfterFor = (ctx, n, nWrong) => {
    const visible = ctx.flow < 0 && n >= 4 && nWrong >= 2 ? n - 1 : n;
    return visible <= 3 ? 1 : 2;
  };
  const OK = ['Richtig!', 'Genau!', 'Super!', 'Stimmt!', 'Prima!'];
  const PROC = [
    'Du hast erst überlegt, woraus es ist. So machen es Müll Profis!',
    'Du hast genau hingeschaut und nicht geraten. Super!',
    'Du hast an die Regel für die Tonne gedacht. Sehr schlau!',
  ];
  const PROC_TRAP = [
    'Da hast du dich nicht reinlegen lassen. Stark!',
    'Das war eine Falle, und du hast sie erkannt. Echt Profi!',
  ];

  /* ======================================================================
     Tonnen
     ====================================================================== */
  const BINS = {
    gelb: { label: 'Gelbe Tonne', say: 'Gelbe Tonne', dat: 'in die Gelbe Tonne', sym: '🥫',
      rule: (it) => `In die Gelbe Tonne kommen nur Verpackungen aus Plastik oder Metall. Ist ${it.n} so eine Verpackung?` },
    papier: { label: 'Papier', say: 'blaue Papiertonne', dat: 'in die blaue Papiertonne', sym: '📰',
      rule: (it) => `In die blaue Tonne kommt nur sauberes Papier und Pappe. Ist ${it.n} aus Papier?` },
    bio: { label: 'Bio', say: 'braune Biotonne', dat: 'in die braune Biotonne', sym: '🍂',
      rule: (it) => `In die braune Biotonne kommen Reste von Obst, Gemüse und Pflanzen. Ist ${it.n} so ein Rest?` },
    glas: { label: 'Glas', say: 'Glascontainer', dat: 'in den Glascontainer', sym: '🍾', dome: true,
      rule: (it) => `In den Glascontainer kommen nur Flaschen und Gläser. Ist ${it.n} aus Glas?` },
    rest: { label: 'Restmüll', say: 'graue Restmülltonne', dat: 'in die graue Restmülltonne', sym: '🗑️',
      rule: (it) => `In den Restmüll kommt nur, was man nicht wieder verwerten kann. ${cap(it.n)} kann man aber noch verwerten.` },
    pfand: { label: 'Pfand-Automat', say: 'Pfand Automat', dat: 'zurück in den Laden zum Pfand Automaten', automat: true,
      rule: () => 'Der Pfand Automat nimmt nur Flaschen und Dosen mit dem Pfandzeichen. Schau mal genau hin.' },
  };
  const GLASS = {
    weiss: { label: 'Weißglas', say: 'Weißglas', fill: '#e9f7fb' },
    gruen: { label: 'Grünglas', say: 'Grünglas', fill: '#2b9348' },
    braun: { label: 'Braunglas', say: 'Braunglas', fill: '#8a4b14' },
  };

  /* ======================================================================
     Bilder (SVG) für Glas, Flaschen und Dosen
     ====================================================================== */
  const GC = { weiss: '#e3f6fb', gruen: '#2b9348', braun: '#8a4b14', blau: '#1971c2', rot: '#c2255c' };
  const PFAND_BADGE = `<g transform="translate(46 92)"><circle r="12" fill="#fff" stroke="#2f9e44" stroke-width="3"/>
    <path d="M-6 2 A6.5 6.5 0 1 1 3 6" fill="none" stroke="#2f9e44" stroke-width="3" stroke-linecap="round"/>
    <polygon points="-9.5,0 -2.5,0 -6,5.5" fill="#2f9e44"/></g>`;
  function svgThing(kind, color, badge) {
    const c = GC[color] || color || GC.weiss;
    const clear = color === 'weiss';
    const stroke = clear ? '#7fb2c2' : 'rgba(0,0,0,.35)';
    let body = '';
    if (kind === 'bottle') {
      body = `<path d="M25 6 L35 6 L35 30 Q35 40 45 47 L45 111 Q45 116 40 116 L20 116 Q15 116 15 111 L15 47 Q25 40 25 30 Z" fill="${c}" stroke="${stroke}" stroke-width="2.5" opacity="${clear ? 0.95 : 0.92}"/>
        <rect x="23.5" y="3" width="13" height="7" rx="2" fill="${clear ? '#c7dbe2' : c}" stroke="${stroke}" stroke-width="2"/>
        <rect x="19" y="54" width="5" height="50" rx="2.5" fill="#fff" opacity=".45"/>`;
    } else if (kind === 'small') {
      body = `<path d="M26 26 L34 26 L34 44 Q34 50 42 56 L42 110 Q42 116 36 116 L24 116 Q18 116 18 110 L18 56 Q26 50 26 44 Z" fill="${c}" stroke="${stroke}" stroke-width="2.5"/>
        <rect x="24" y="18" width="12" height="10" rx="2.5" fill="#495057"/>
        <rect x="21" y="62" width="4" height="40" rx="2" fill="#fff" opacity=".4"/>`;
    } else if (kind === 'jar') {
      body = `<rect x="9" y="36" width="42" height="78" rx="11" fill="${c}" stroke="${stroke}" stroke-width="2.5"/>
        <rect x="12" y="22" width="36" height="16" rx="4" fill="#e8590c" stroke="rgba(0,0,0,.3)" stroke-width="2"/>
        <rect x="15" y="46" width="5" height="58" rx="2.5" fill="#fff" opacity=".6"/>`;
    } else if (kind === 'plastic') {
      body = `<path d="M25 14 L35 14 L35 24 Q46 30 46 42 L46 108 Q46 116 38 116 L22 116 Q14 116 14 108 L14 42 Q14 30 25 24 Z" fill="#cfeafd" stroke="#74a9cf" stroke-width="2.5"/>
        <rect x="23" y="5" width="14" height="11" rx="3" fill="#1c7ed6"/>
        <rect x="14" y="58" width="32" height="22" fill="#4dabf7" opacity=".8"/>
        <path d="M14 92 H46 M14 100 H46" stroke="#74a9cf" stroke-width="2"/>`;
    } else if (kind === 'can') {
      body = `<rect x="13" y="18" width="34" height="96" rx="7" fill="#ced4da" stroke="#868e96" stroke-width="2.5"/>
        <ellipse cx="30" cy="20" rx="17" ry="5" fill="#e9ecef" stroke="#868e96" stroke-width="2"/>
        <rect x="13" y="42" width="34" height="40" fill="${color === 'rot' ? '#e03131' : '#f08c00'}"/>
        <circle cx="30" cy="62" r="9" fill="#fff" opacity=".85"/>`;
    } else if (kind === 'flask') {
      body = `<rect x="14" y="26" width="32" height="88" rx="12" fill="#4dabf7" stroke="#1c7ed6" stroke-width="2.5"/>
        <rect x="18" y="12" width="24" height="16" rx="5" fill="#1c7ed6"/>
        <path d="M42 16 Q54 18 50 34" fill="none" stroke="#1c7ed6" stroke-width="4" stroke-linecap="round"/>
        <circle cx="30" cy="70" r="9" fill="#fff" opacity=".85"/><path d="M26 70 L29 73 L35 66" fill="none" stroke="#2f9e44" stroke-width="2.5"/>`;
    }
    return el('span.mue-svg', { html: `<svg viewBox="0 0 60 120" aria-hidden="true">${body}${badge ? PFAND_BADGE : ''}</svg>` });
  }

  /** Bild eines Dings: Emoji oder gezeichnetes SVG. */
  function pic(it, cls) {
    if (it.svg) {
      const n = svgThing(it.svg[0], it.svg[1], it.pfand);
      if (cls) n.classList.add(cls);
      return n;
    }
    return U.emoji(it.e, 'mue-e ' + (cls || ''));
  }

  /** Tonne als CSS-Form. */
  function binNode(id, o = {}) {
    if (GLASS[id]) {
      return el('span.mue-bin.mue-dome.mue-g-' + id,
        el('span.mue-body', el('span.mue-hole'), el('span.mue-glasdot')),
        o.noName ? null : el('span.mue-name', GLASS[id].label));
    }
    const b = BINS[id];
    if (b.automat) {
      return el('span.mue-bin.mue-automat',
        el('span.mue-body', el('span.mue-screen', '♻'), el('span.mue-slot'), el('span.mue-coin', '🪙')),
        o.noName ? null : el('span.mue-name', b.label));
    }
    if (b.dome) {
      return el('span.mue-bin.mue-dome.mue-b-glas',
        el('span.mue-body', el('span.mue-hole'), el('span.mue-sym', U.emoji(b.sym))),
        o.noName ? null : el('span.mue-name', b.label));
    }
    return el('span.mue-bin.mue-b-' + id,
      el('span.mue-lid'),
      el('span.mue-body', el('span.mue-sym', U.emoji(b.sym))),
      el('span.mue-wheels', el('i'), el('i')),
      o.noName ? null : el('span.mue-name', b.label));
  }

  /* ======================================================================
     Müll-Dinge
     k = Schlüssel, n = mit Artikel (Nominativ), b = Tonne, d = Schwierigkeit
     why = Grund, h = Strategie-Tipp, tr = Erklärung bei typischer Verwechslung
     ====================================================================== */
  const ITEMS = [
    // Papier
    { k: 'Zeitung', e: '🗞️', l: 'Zeitung', n: 'die Zeitung', b: 'papier', d: 1,
      why: 'Die Zeitung ist aus Papier.', h: 'Tipp: Woraus ist die Zeitung? Man kann sie knicken und reißen.' },
    { k: 'Karton', e: '📦', l: 'Karton', n: 'der Karton', b: 'papier', d: 1,
      why: 'Der Karton ist aus Pappe. Pappe ist dickes Papier.', h: 'Tipp: Der Karton ist aus Pappe. Pappe ist eine Art Papier.',
      tr: { gelb: 'Der Karton ist zwar eine Verpackung. Aber er ist nicht aus Plastik oder Metall. Woraus ist er?' } },
    { k: 'Briefumschlag', e: '✉️', l: 'Briefumschlag', n: 'der Briefumschlag', b: 'papier', d: 2,
      why: 'Der Briefumschlag ist aus Papier.', h: 'Tipp: Woraus ist der Briefumschlag? Fühl mal, er raschelt wie ein Blatt.' },
    { k: 'Malblatt', e: '📄', l: 'altes Malblatt', n: 'das alte Malblatt', b: 'papier', d: 1,
      why: 'Das Malblatt ist aus Papier.', h: 'Tipp: Worauf malst du? Woraus ist das Blatt?' },
    { k: 'Heft', e: '📒', l: 'altes Heft', n: 'das alte Heft', b: 'papier', d: 2,
      why: 'Das Heft ist aus Papier. Daraus wird neues Papier.', h: 'Tipp: Woraus sind die Seiten im Heft?' },
    // Bio
    { k: 'Bananenschale', e: '🍌', l: 'Bananenschale', n: 'die Bananenschale', b: 'bio', d: 1,
      why: 'Die Bananenschale ist ein Rest von Obst.', h: 'Tipp: Die Schale ist von einer Frucht. Was passiert mit ihr im Garten?' },
    { k: 'Apfelrest', e: '🍎', l: 'Apfelrest', n: 'der Apfelrest', b: 'bio', d: 1,
      why: 'Der Apfelrest ist ein Rest von Obst. Daraus wird wieder Erde.', h: 'Tipp: Ein Apfel ist Obst. Wohin kommen Obstreste?' },
    { k: 'Eierschale', e: '🥚', l: 'Eierschale', n: 'die Eierschale', b: 'bio', d: 2,
      why: 'Eierschalen sind Küchenabfall. Sie werden zu Erde.', h: 'Tipp: Eierschalen sind Reste aus der Küche, wie Gemüseschalen.' },
    { k: 'Kartoffelschale', e: '🥔', l: 'Kartoffelschale', n: 'die Kartoffelschale', b: 'bio', d: 2,
      why: 'Die Kartoffelschale ist ein Rest von Gemüse.', h: 'Tipp: Die Kartoffel ist Gemüse. Wohin kommen Gemüsereste?' },
    { k: 'Laub', e: '🍂', l: 'Laub', n: 'das Laub', b: 'bio', d: 2,
      why: 'Laub sind Blätter von Pflanzen. Daraus wird Erde.', h: 'Tipp: Laub sind Blätter von Bäumen. Das ist ein Pflanzenrest.' },
    { k: 'Teebeutel', e: '🍵', l: 'Teebeutel', n: 'der Teebeutel', b: 'bio', d: 3,
      why: 'Im Teebeutel sind Teeblätter. Das sind Pflanzenreste.', h: 'Tipp: Was ist im Teebeutel drin? Getrocknete Blätter von Pflanzen.',
      tr: { papier: 'Der Beutel ist ein bisschen aus Papier. Aber er ist nass und voller Teeblätter. Was sind Teeblätter?',
        rest: 'Der Teebeutel verrottet wie Blätter im Garten. Welche Tonne macht daraus wieder Erde?' } },
    // Gelb
    { k: 'Dose', e: '🥫', l: 'leere Dose', n: 'die leere Dose', b: 'gelb', d: 1,
      why: 'Die Dose ist eine Verpackung aus Metall.', h: 'Tipp: Die Dose ist aus Metall. Sie war eine Verpackung für Essen.' },
    { k: 'Plastikbecher', e: '🥤', l: 'Plastikbecher', n: 'der Plastikbecher', b: 'gelb', d: 1,
      why: 'Der Becher ist eine Verpackung aus Plastik.', h: 'Tipp: Der Becher ist aus Plastik. Er war eine Verpackung für ein Getränk.' },
    { k: 'Shampooflasche', e: '🧴', l: 'Shampooflasche', n: 'die Shampooflasche', b: 'gelb', d: 2,
      why: 'Die Shampooflasche ist eine Verpackung aus Plastik.', h: 'Tipp: Die Flasche ist aus Plastik, nicht aus Glas. Sie ist eine Verpackung.',
      tr: { glas: 'Es ist eine Flasche, aber nicht aus Glas. Drück mal drauf: Sie ist weich. Woraus ist sie?' } },
    { k: 'Saftkarton', e: '🧃', l: 'Saftkarton', n: 'der Saftkarton', b: 'gelb', d: 3,
      why: 'Der Saftkarton ist innen mit Plastik und Metall beschichtet. Darum ist er eine Verpackung für die Gelbe Tonne.',
      h: 'Tipp: Ein Saftkarton muss dicht sein. Innen ist eine dünne Schicht aus Plastik und Metall.',
      tr: { papier: 'Der Saftkarton sieht aus wie Pappe. Aber innen ist er beschichtet, sonst würde er nass und weich. Womit ist er beschichtet?' } },
    { k: 'Bonbonpapier', e: '🍬', l: 'Bonbonpapier', n: 'das Bonbonpapier', b: 'gelb', d: 3,
      why: 'Bonbonpapier ist meistens aus Plastik. Es ist eine Verpackung.',
      h: 'Tipp: Fühl mal: Bonbonpapier knistert und reißt nicht wie Papier. Woraus ist es wirklich?',
      tr: { papier: 'Es heißt Bonbonpapier, aber es ist gar kein Papier. Es knistert und glänzt. Woraus ist es?' } },
    // Glas
    { k: 'Marmeladenglas', svg: ['jar', 'weiss'], l: 'leeres Marmeladenglas', n: 'das leere Marmeladenglas', b: 'glas', d: 1,
      why: 'Das Marmeladenglas ist aus Glas. Den Deckel schraubst du vorher ab.', h: 'Tipp: Woraus ist das Marmeladenglas? Es ist hart und durchsichtig.',
      tr: { gelb: 'Das Glas ist zwar eine Verpackung, aber nicht aus Plastik oder Metall. Woraus ist es?' } },
    { k: 'Glasflasche', svg: ['bottle', 'gruen'], l: 'Glasflasche', n: 'die Glasflasche', b: 'glas', d: 1,
      why: 'Die Flasche ist aus Glas. Aus altem Glas wird neues Glas.', h: 'Tipp: Die Flasche ist hart und kann zerbrechen. Woraus ist sie?' },
    // Restmüll
    { k: 'Taschentuch', e: '🤧', l: 'benutztes Taschentuch', n: 'das benutzte Taschentuch', b: 'rest', d: 2,
      why: 'Das Taschentuch ist schmutzig. Daraus kann man nichts Neues machen. Darum kommt es in den Restmüll.',
      h: 'Tipp: Das Taschentuch ist benutzt und schmutzig. Kann man daraus noch etwas Neues machen?',
      tr: { papier: 'Das Taschentuch ist aus Papier, ja. Aber es ist benutzt und schmutzig. Schmutziges Papier kann man nicht wieder verwerten.' } },
    { k: 'Pflaster', e: '🩹', l: 'altes Pflaster', n: 'das alte Pflaster', b: 'rest', d: 2,
      why: 'Das alte Pflaster ist schmutzig. Das kommt in den Restmüll.', h: 'Tipp: Ein benutztes Pflaster ist schmutzig. Kann man daraus noch etwas machen?' },
    { k: 'Staub', e: '🧹', l: 'Staub vom Fegen', n: 'der Staub vom Fegen', b: 'rest', d: 2,
      why: 'Staub und Dreck kann man nicht wieder verwerten. Das ist Restmüll.', h: 'Tipp: Staub ist einfach nur Dreck. Ist das Papier, Plastik, Glas oder Essen?' },
    { k: 'Zahnbürste', e: '🪥', l: 'alte Zahnbürste', n: 'die alte Zahnbürste', b: 'rest', d: 3,
      why: 'Die Zahnbürste ist aus Plastik, aber sie ist keine Verpackung. Darum kommt sie in den Restmüll.',
      h: 'Tipp: In die Gelbe Tonne kommen nur Verpackungen. War die Zahnbürste eine Verpackung?',
      tr: { gelb: 'Die Zahnbürste ist aus Plastik, das stimmt. Aber in die Gelbe Tonne kommen nur Verpackungen. Ist eine Zahnbürste eine Verpackung?' } },
    { k: 'Trinkglas', e: '🥛', l: 'kaputtes Trinkglas', n: 'das kaputte Trinkglas', b: 'rest', d: 3,
      why: 'Trinkgläser sind aus anderem Glas als Flaschen. Sie schmelzen anders. Darum kommen sie in den Restmüll.',
      h: 'Tipp: In den Glascontainer kommen nur Flaschen und Gläser für Essen. Ein Trinkglas ist anderes Glas.',
      tr: { glas: 'Das Trinkglas ist aus Glas, ja. Aber es ist anderes Glas als Flaschen. Es schmilzt anders und stört im Container.' } },
  ];

  /* Glas nach Farben (Stufe 4) */
  const GLASSES = [
    { k: 'klare Flasche', svg: ['bottle', 'weiss'], c: 'weiss', d: 1, n: 'die klare Flasche',
      merk: 'Durchsichtiges Glas ohne Farbe kommt ins Weißglas.' },
    { k: 'Marmeladenglas', svg: ['jar', 'weiss'], c: 'weiss', d: 1, n: 'das Marmeladenglas',
      merk: 'Das Glas ist ohne Farbe, also Weißglas. Den Deckel schraubst du ab. Der kommt in die Gelbe Tonne.' },
    { k: 'grüne Flasche', svg: ['bottle', 'gruen'], c: 'gruen', d: 1, n: 'die grüne Flasche',
      merk: 'Grünes Glas kommt ins Grünglas.' },
    { k: 'braune Flasche', svg: ['bottle', 'braun'], c: 'braun', d: 1, n: 'die braune Flasche',
      merk: 'Braunes Glas kommt ins Braunglas.' },
    { k: 'Medizinfläschchen', svg: ['small', 'braun'], c: 'braun', d: 2, n: 'das braune Medizinfläschchen',
      merk: 'Auch kleine braune Fläschchen kommen ins Braunglas. Der Deckel kommt ab.' },
    { k: 'blaue Flasche', svg: ['bottle', 'blau'], c: 'gruen', d: 3, n: 'die blaue Flasche',
      merk: 'Für blaues Glas gibt es keinen eigenen Container. Es kommt zum Grünglas. Dort stört die Farbe am wenigsten.' },
    { k: 'rote Flasche', svg: ['bottle', 'rot'], c: 'gruen', d: 3, n: 'die rote Flasche',
      merk: 'Rotes Glas kommt auch zum Grünglas. Alle bunten Farben kommen dorthin.' },
  ];

  /* Pfand oder Tonne? (Stufe 4) */
  const PFAND = [
    { k: 'Pfand: Plastikflasche', svg: ['plastic'], pfand: true, b: 'pfand', d: 1, n: 'die Plastikflasche mit Pfandzeichen',
      l: 'Plastikflasche', merk: 'Flaschen mit Pfandzeichen bringst du zurück in den Laden. Dafür bekommst du Geld zurück.',
      tr: { gelb: 'Die Flasche ist aus Plastik, ja. Aber schau mal auf das Zeichen! Was bedeutet es?' } },
    { k: 'Pfand: Dose', svg: ['can', 'rot'], pfand: true, b: 'pfand', d: 2, n: 'die Getränkedose mit Pfandzeichen',
      l: 'Getränkedose', merk: 'Getränkedosen haben Pfand. Im Laden wird aus dem Metall neues Metall gemacht.',
      tr: { gelb: 'Viele Dosen kommen in die Gelbe Tonne. Aber schau mal genau auf diese Dose! Was ist darauf?' } },
    { k: 'Pfand: Mehrweg', svg: ['bottle', 'braun'], pfand: true, b: 'pfand', d: 2, n: 'die Glasflasche mit Pfandzeichen',
      l: 'Sprudelflasche', merk: 'Diese Flasche wird gespült und wieder neu befüllt. Das heißt Mehrweg.',
      tr: { glas: 'Die Flasche ist aus Glas, das stimmt. Aber schau mal auf das Zeichen! Man kann sie noch einmal benutzen.' } },
    { k: 'Shampooflasche', e: '🧴', b: 'gelb', d: 1, n: 'die Shampooflasche', l: 'Shampooflasche',
      merk: 'Die Shampooflasche hat kein Pfandzeichen. Sie ist eine Verpackung für die Gelbe Tonne.' },
    { k: 'Dose', e: '🥫', b: 'gelb', d: 2, n: 'die Konservendose', l: 'Konservendose',
      merk: 'Die Konservendose hat kein Pfand. Sie kommt in die Gelbe Tonne.' },
    { k: 'Marmeladenglas', svg: ['jar', 'weiss'], b: 'glas', d: 1, n: 'das Marmeladenglas', l: 'Marmeladenglas',
      merk: 'Das Marmeladenglas hat kein Pfand. Es kommt in den Glascontainer.' },
    { k: 'Trinkglas', e: '🥛', b: 'rest', d: 3, n: 'das kaputte Trinkglas', l: 'kaputtes Trinkglas',
      merk: 'Trinkgläser sind anderes Glas als Flaschen. Sie kommen in den Restmüll.',
      tr: { glas: 'Das Trinkglas ist aus Glas, ja. Aber es ist anderes Glas als Flaschen. Es stört im Container.' } },
  ];

  /* Vermeiden vor Trennen (Stufe 5): best = vermeiden, ok = richtig getrennt, bad = falsche Tonne */
  const AVOID = [
    { k: 'Vermeiden: Brotdose', q: 'Dein Pausenbrot soll eingepackt werden. Was ist am besten?',
      best: { e: '🍱', l: 'Brotdose', say: 'Brotdose, jeden Tag wieder benutzen' },
      thing: { e: '🌯', name: 'Alufolie', n: 'die Alufolie' }, ok: 'gelb', bad: 'rest',
      merk: 'Die Brotdose benutzt du jeden Tag wieder. So entsteht gar kein Müll.' },
    { k: 'Vermeiden: Trinkflasche', q: 'Du hast Durst in der Schule. Was ist am besten?',
      best: { svg: ['flask'], l: 'Trinkflasche', say: 'Trinkflasche, immer wieder auffüllen' },
      thing: { e: '🧃', name: 'Saftpäckchen', n: 'das Saftpäckchen' }, ok: 'gelb', bad: 'papier',
      merk: 'Die Trinkflasche füllst du immer wieder auf. Das ist noch besser als trennen.' },
    { k: 'Vermeiden: Stoffbeutel', q: 'Ihr kauft ein. Worin tragt ihr alles nach Hause?',
      best: { e: '👜', l: 'Stoffbeutel', say: 'Stoffbeutel, immer wieder mitnehmen' },
      thing: { e: '🛍️', name: 'Plastiktüte', n: 'die Plastiktüte' }, ok: 'gelb', bad: 'rest',
      merk: 'Den Stoffbeutel nimmst du immer wieder mit. Dann brauchst du keine Tüte.' },
    { k: 'Vermeiden: reparieren', q: 'Dein Spielzeugauto ist kaputt. Was ist am besten?',
      best: { e: '🔧', e2: '🚗', l: 'reparieren', say: 'reparieren' },
      thing: { e: '🚗', name: 'Spielzeugauto', n: 'das Spielzeugauto' }, ok: 'rest', bad: 'gelb',
      badWhy: 'Das Auto ist aus Plastik, aber es ist keine Verpackung.',
      merk: 'Was man repariert, muss man nicht wegwerfen. Reparieren ist super!' },
    { k: 'Vermeiden: Malpapier', q: 'Du malst ein Bild. Was ist am besten?',
      best: { e: '📄', e2: '🖍️', l: 'beide Seiten bemalen', say: 'beide Seiten bemalen' },
      thing: { e: '📄', name: 'Blatt', n: 'das Blatt' }, ok: 'papier', bad: 'rest',
      merk: 'Wenn du beide Seiten benutzt, brauchst du nur halb so viel Papier.' },
    { k: 'Vermeiden: lose Äpfel', q: 'Ihr kauft Äpfel. Was ist am besten?',
      best: { e: '🍎', e2: '🍏', l: 'lose Äpfel ohne Verpackung', say: 'lose Äpfel ohne Verpackung' },
      thing: { e: '🍎', name: 'Plastikschale', n: 'die Plastikschale' }, ok: 'gelb', bad: 'papier',
      merk: 'Lose Äpfel brauchen gar keine Verpackung. So entsteht kein Müll.' },
  ];

  /* ======================================================================
     Gemeinsame Bausteine
     ====================================================================== */
  function promptThing(it, text) {
    return el('div.prompt-box.mue-ask',
      el('span.mue-ask-pic', pic(it, 'mue-ask-e')),
      el('div.mue-ask-col',
        el('p.mue-ask-l', it.l || it.k),
        text ? el('p.mue-ask-q', text) : null));
  }
  const explainSort = (it, binId) => (it.tr && it.tr[binId]) || BINS[binId].rule(it);
  const praiseFor = (ctx, it) => {
    if (ctx.wrongCount === 0 && U.chance(0.3)) return vary(it.d >= 3 ? 'proct' : 'proc', it.d >= 3 ? PROC_TRAP : PROC);
    return vary('ok', OK);
  };

  /** Ding fliegt in die Tonne (rein visuell). */
  async function dropInto(ctx, thingNode, binTile) {
    if (!thingNode || !binTile) return;
    binTile.classList.add('mue-open');
    const a = thingNode.getBoundingClientRect();
    const b = binTile.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height * 0.25 - (a.top + a.height / 2);
    thingNode.style.transition = 'transform .45s ease-in, opacity .45s ease-in';
    thingNode.style.transform = `translate(${dx}px, ${dy}px) scale(.3)`;
    thingNode.style.opacity = '0';
    await ctx.sleep(480);
    binTile.classList.remove('mue-open');
  }

  /* ======================================================================
     Stufe 1/2: ein Ding → Tonne wählen
     ====================================================================== */
  async function taskSort(ctx, lv) {
    let bins = lv === 1 ? ['gelb', 'papier', 'bio'] : ['gelb', 'papier', 'bio', 'glas', 'rest'];
    let maxD = lv === 1 ? 1 : 2;
    if (lv === 1 && ctx.flow > 0) { bins = bins.concat('rest'); maxD = 2; }
    if (lv === 2 && ctx.taskLevel > 2) maxD = 3;
    if (lv === 2 && ctx.flow < 0) maxD = 1;
    const pool = ITEMS.filter((x) => bins.includes(x.b) && x.d <= maxD);
    const it = ctx.item(pool, (x) => x.k, { avoid: 4 });
    const box = promptThing(it, 'Wohin kommt das?');
    ctx.stage.appendChild(box);
    await ctx.instruct(`Wohin kommt ${it.n}?`);
    if (!ctx.active) return;
    const items = bins.map((id) => ({
      content: binNode(id), correct: id === it.b, say: BINS[id].say, aria: BINS[id].say, bin: id, className: 'mue-bintile',
    }));
    let picked = null;
    await ctx.choices(items, {
      className: 'mue-bins mue-bins-' + bins.length,
      hintAfter: hintAfterFor(ctx, items.length, items.length - 1),
      praise: false,
      correctSay: () => praiseFor(ctx, it),
      explain: (w) => explainSort(it, w.bin),
      hintSay: () => it.h,
      modelSay: () => `Schau, hier: ${cap(it.n)} kommt ${BINS[it.b].dat}. ${it.why}`,
      onCorrect: (item, tile) => { picked = tile; },
    });
    if (!ctx.active) return;
    await dropInto(ctx, box.querySelector('.mue-ask-pic'), picked);
    if (!ctx.active) return;
    await ctx.say(`${it.why} Also ab ${BINS[it.b].dat}!`);
    if (!ctx.active) return;
    if (it.b === 'gelb' && lv === 1 && U.chance(0.4)) {
      await ctx.say('Manche Familien haben statt der Gelben Tonne einen Gelben Sack. Da kommt dasselbe hinein.');
      if (!ctx.active) return;
    }
    await ctx.sleep(350);
  }

  /* ======================================================================
     Stufe 3/5: Sortier-Band (eigene Bedienung: antippen + Tonne, oder ziehen)
     ====================================================================== */
  function pickBand(ctx, pool, n) {
    const first = ctx.item(pool, (x) => x.k, { avoid: 4 });
    const chosen = [first];
    const rest = U.shuffle(pool.filter((x) => x !== first));
    // möglichst verschiedene Tonnen
    for (const x of rest) {
      if (chosen.length >= n) break;
      if (!chosen.some((c) => c.b === x.b)) chosen.push(x);
    }
    for (const x of rest) {
      if (chosen.length >= n) break;
      if (!chosen.includes(x)) chosen.push(x);
    }
    return U.shuffle(chosen);
  }

  function taskBand(ctx, lv) {
    return new Promise((resolve) => {
      const pro = lv >= 5;
      let n = 4;
      if (ctx.flow > 0) n++;
      if (ctx.flow < 0) n--;
      const minD = pro && ctx.flow >= 0 ? 2 : 1;
      const maxD = pro || ctx.taskLevel >= 3 ? 3 : 2;
      const pool = ITEMS.filter((x) => x.d >= minD && x.d <= maxD);
      const things = pickBand(ctx, pool, n);
      const binIds = ['gelb', 'papier', 'bio', 'glas', 'rest'];

      let selected = null;
      let busy = true;
      let left = things.length;
      let modeled = false;
      let suppressClick = false;

      const thingBtns = things.map((it) => {
        const b = el('button.mue-thing', { type: 'button', 'aria-label': it.l || it.k },
          pic(it, 'mue-thing-e'), el('span.mue-thing-l', it.l || it.k));
        b._it = it;
        b._w = 0;
        b.addEventListener('click', () => {
          if (suppressClick) { suppressClick = false; return; }
          select(b, true);
        });
        b.addEventListener('pointerdown', (ev) => startDrag(ev, b));
        return b;
      });
      const band = el('div.mue-band', ...thingBtns);
      const binTiles = binIds.map((id) => {
        const t = el('button.tile.mue-bintile', { type: 'button', 'aria-label': BINS[id].say }, binNode(id));
        t._bin = id;
        t.addEventListener('click', () => onBin(t));
        return t;
      });
      const binsRow = el('div.mue-bins.mue-bins-5', ...binTiles);
      const title = el('div.mue-bandtitle', U.emoji(pro ? '🏅' : '♻️', 'mue-bandtitle-e'),
        el('span', pro ? 'Profi-Band: Achtung, Fallen!' : 'Sortiere alles!'));
      ctx.stage.append(title, band, binsRow);
      const binOf = (id) => binTiles.find((t) => t._bin === id);

      function select(b, speak) {
        if (busy || !ctx.active || b.classList.contains('mue-gone')) return;
        thingBtns.forEach((x) => x.classList.toggle('mue-sel', x === b));
        selected = b;
        LT.sfx.play('pop');
        if (speak) ctx.say(cap(b._it.n), { interrupt: true });
      }

      async function onBin(t) {
        if (busy || !ctx.active) return;
        if (!selected) {
          band.classList.remove('mue-nudge');
          void band.offsetWidth;
          band.classList.add('mue-nudge');
          ctx.say('Tipp zuerst auf ein Ding auf dem Band.', { interrupt: true });
          return;
        }
        await place(selected, t);
      }

      async function place(b, t) {
        const it = b._it;
        busy = true;
        binTiles.forEach((x) => ctx.unhint(x));
        if (t._bin === it.b) {
          ctx.track(it.k, b._w === 0);
          b.classList.remove('mue-sel');
          selected = null;
          LT.sfx.play('pop');
          await dropInto(ctx, b, t);
          if (!ctx.active) return;
          b.classList.add('mue-gone');
          b.setAttribute('aria-disabled', 'true');
          left--;
          if (left <= 0) {
            const first = ctx.wrongCount === 0 && !modeled;
            const say = first && U.chance(0.3)
              ? vary('bandp', ['Alles sortiert, und kein einziger Fehler! Du hast bei jedem Ding überlegt, woraus es ist.', 'Alles richtig sortiert! Du hast dir jedes Ding genau angeschaut.'])
              : vary('band', ['Alles sortiert! Super!', 'Das Band ist leer. Prima sortiert!', 'Geschafft! Alles ist in der richtigen Tonne.']);
            await ctx.correct(binsRow, { say, praise: false });
            if (!ctx.active) return;
            await ctx.sleep(300);
            resolve();
            return;
          }
          // Fallen kurz begründen, sonst nur ein kurzes Lob
          if (it.d >= 3 || b._w > 0) await ctx.say(it.why);
          else await ctx.say(vary('okb', OK));
          if (!ctx.active) return;
          busy = false;
          return;
        }
        b._w++;
        await ctx.wrong(t, { say: explainSort(it, t._bin), keep: true });
        if (!ctx.active) return;
        if (b._w === 2) {
          await ctx.say(it.h);
        } else if (b._w >= 3) {
          modeled = true;
          ctx.modelShown = true;
          const right = binOf(it.b);
          ctx.hint(right);
          await ctx.say(`Schau: ${cap(it.n)} kommt ${BINS[it.b].dat}. Tipp auf die leuchtende Tonne.`);
        }
        if (!ctx.active) return;
        busy = false;
      }

      /* Ziehen mit Finger oder Maus */
      function startDrag(ev, b) {
        if (busy || !ctx.active || b.classList.contains('mue-gone')) return;
        if (ev.button != null && ev.button !== 0) return;
        const sx = ev.clientX;
        const sy = ev.clientY;
        let dragging = false;
        let over = null;
        const move = (e) => {
          const dx = e.clientX - sx;
          const dy = e.clientY - sy;
          if (!dragging && Math.hypot(dx, dy) > 12) {
            dragging = true;
            select(b, false);
            b.classList.add('mue-drag');
          }
          if (!dragging) return;
          e.preventDefault();
          b.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          const tile = hit && hit.closest ? hit.closest('.mue-bintile') : null;
          if (over && over !== tile) over.classList.remove('mue-over');
          over = tile && binTiles.includes(tile) ? tile : null;
          if (over) over.classList.add('mue-over');
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          if (!dragging) return;
          suppressClick = true;
          ctx.timeout(() => { suppressClick = false; }, 400);
          b.classList.remove('mue-drag');
          if (over) over.classList.remove('mue-over');
          const target = over;
          if (target && !busy && ctx.active) {
            // zurück an die Startposition, dann wie beim Antippen einwerfen
            b.style.transform = '';
            place(b, target);
          } else {
            b.style.transform = '';
          }
        };
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        ctx.onCleanup(() => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
        });
      }

      (async () => {
        const ins = pro
          ? 'Profi Band! Hier sind Fallen versteckt. Tipp auf ein Ding und dann auf die richtige Tonne.'
          : 'Tipp auf ein Ding und dann auf die richtige Tonne. Du kannst es auch hineinziehen.';
        await ctx.instruct(ins);
        if (!ctx.active) return;
        busy = false;
        ctx.testSolve(() => {
          if (busy || !ctx.active) return;
          const b = thingBtns.find((x) => !x.classList.contains('mue-gone'));
          if (!b) return;
          select(b, false);
          place(b, binOf(b._it.b));
        });
      })();
    });
  }

  /* ======================================================================
     Stufe 4a: Glas nach Farben
     ====================================================================== */
  const GLASS_RULE = {
    weiss: 'Ins Weißglas kommt nur Glas ohne Farbe, ganz durchsichtig. Schau dir die Farbe vom Glas genau an.',
    braun: 'Ins Braunglas kommt nur braunes Glas. Ist dieses Glas braun?',
    gruen: 'Ins Grünglas kommen grüne und andere bunte Flaschen. Hat dieses Glas so eine Farbe?',
  };
  async function taskGlass(ctx) {
    const maxD = ctx.flow > 0 || (ctx.index >= 3 && ctx.flow === 0) ? 3 : ctx.flow < 0 ? 1 : 2;
    const pool = GLASSES.filter((x) => x.d <= maxD);
    const it = ctx.item(pool, (x) => 'Glas: ' + x.k, { avoid: 3 });
    const box = el('div.prompt-box.mue-ask',
      el('span.mue-ask-pic', pic(it, 'mue-ask-e')),
      el('div.mue-ask-col', el('p.mue-ask-l', 'Glas nach Farben'), el('p.mue-ask-q', 'Welcher Container?')));
    ctx.stage.appendChild(box);
    await ctx.instruct('Glas wird nach Farben sortiert. In welchen Container kommt dieses Glas?');
    if (!ctx.active) return;
    const items = ['weiss', 'gruen', 'braun'].map((id) => ({
      content: binNode(id), correct: id === it.c, say: GLASS[id].say, aria: GLASS[id].say, g: id, className: 'mue-bintile',
    }));
    let picked = null;
    await ctx.choices(items, {
      className: 'mue-bins mue-bins-3',
      hintAfter: 1,
      shuffle: false,
      praise: false,
      correctSay: () => praiseFor(ctx, it),
      explain: (w) => GLASS_RULE[w.g],
      hintSay: () => (it.c === 'weiss' ? 'Tipp: Kannst du durch das Glas schauen wie durch ein Fenster, ganz ohne Farbe?'
        : it.d >= 3 ? 'Tipp: Für Blau und Rot gibt es keinen eigenen Container. Bunte Flaschen kommen zu den grünen.'
          : 'Tipp: Welche Farbe hat das Glas? Such den Container mit derselben Farbe.'),
      modelSay: () => `Schau: ${cap(it.n)} kommt ins ${GLASS[it.c].say}.`,
      onCorrect: (item, tile) => { picked = tile; },
    });
    if (!ctx.active) return;
    await dropInto(ctx, box.querySelector('.mue-ask-pic'), picked);
    if (!ctx.active) return;
    await ctx.say(it.merk);
    if (!ctx.active) return;
    await ctx.sleep(350);
  }

  /* ======================================================================
     Stufe 4b: Pfand oder Tonne?
     ====================================================================== */
  async function taskPfand(ctx) {
    let pool = PFAND.filter((x) => x.d <= (ctx.flow > 0 ? 3 : 2));
    if (ctx.flow < 0) pool = PFAND.filter((x) => x.d === 1);
    const it = ctx.item(pool, (x) => x.k, { avoid: 3 });
    const bins = ['pfand', 'gelb', 'glas', 'rest'];
    const box = el('div.prompt-box.mue-ask',
      el('span.mue-ask-pic', pic(it, 'mue-ask-e')),
      el('div.mue-ask-col', el('p.mue-ask-l', it.l), el('p.mue-ask-q', it.pfand ? 'Siehst du das Zeichen?' : 'Pfand oder Tonne?')));
    ctx.stage.appendChild(box);
    await ctx.instruct(`Wohin kommt ${it.n.replace(/ mit Pfandzeichen$/, '')}? Schau genau, ob ein Pfandzeichen darauf ist.`);
    if (!ctx.active) return;
    const items = bins.map((id) => ({
      content: binNode(id), correct: id === it.b, say: BINS[id].say, aria: BINS[id].say, bin: id, className: 'mue-bintile',
    }));
    let picked = null;
    await ctx.choices(items, {
      className: 'mue-bins mue-bins-4',
      hintAfter: hintAfterFor(ctx, items.length, items.length - 1),
      praise: false,
      correctSay: () => praiseFor(ctx, it),
      explain: (w) => (it.tr && it.tr[w.bin]) || (w.bin === 'pfand'
        ? 'Schau mal genau: Hier ist gar kein Pfandzeichen. Ohne das Zeichen nimmt der Automat nichts.'
        : explainSort(it, w.bin)),
      hintSay: () => (it.pfand ? 'Tipp: Siehst du den grünen Kreis mit dem Pfeil? Das ist das Pfandzeichen.'
        : 'Tipp: Hier ist kein Pfandzeichen. Woraus ist es, und ist es eine Verpackung?'),
      modelSay: () => `Schau: ${cap(it.n)} kommt ${BINS[it.b].dat}.`,
      onCorrect: (item, tile) => { picked = tile; },
    });
    if (!ctx.active) return;
    await dropInto(ctx, box.querySelector('.mue-ask-pic'), picked);
    if (!ctx.active) return;
    await ctx.say(it.merk);
    if (!ctx.active) return;
    await ctx.sleep(350);
  }

  /* ======================================================================
     Stufe 5a: Vermeiden vor Trennen
     ====================================================================== */
  function avoidContent(kind, a) {
    if (kind === 'best') {
      const p = a.best.svg ? svgThing(a.best.svg[0]) : U.emoji(a.best.e, 'mue-av-e');
      return el('span.mue-av',
        el('span.mue-av-pics', p, a.best.e2 ? U.emoji(a.best.e2, 'mue-av-e2') : null, el('span.mue-av-again', '🔁')),
        el('span.mue-av-l', a.best.l));
    }
    const bin = kind === 'ok' ? a.ok : a.bad;
    return el('span.mue-av',
      el('span.mue-av-pics', U.emoji(a.thing.e, 'mue-av-e'), el('span.mue-av-arrow', '➜'), el('span.mue-av-bin', binNode(bin, { noName: true }))),
      el('span.mue-av-l', `${a.thing.name} in ${bin === 'rest' ? 'den Restmüll' : bin === 'papier' ? 'die Papiertonne' : bin === 'bio' ? 'die Biotonne' : 'die Gelbe Tonne'}`));
  }
  async function taskAvoid(ctx) {
    const a = ctx.item(AVOID, (x) => x.k, { avoid: 3 });
    ctx.stage.appendChild(el('div.prompt-box.mue-ask.mue-avq',
      el('span.mue-ask-pic', U.emoji('🌍', 'mue-ask-e')),
      el('div.mue-ask-col', el('p.mue-ask-l', a.q))));
    await ctx.instruct(a.q);
    if (!ctx.active) return;
    const binSay = (id) => BINS[id].dat;
    const items = [
      { content: avoidContent('best', a), correct: true, kind: 'best', say: a.best.say, aria: a.best.say, className: 'mue-avtile' },
      { content: avoidContent('ok', a), correct: false, kind: 'ok', say: `${a.thing.name} ${binSay(a.ok)}`, aria: a.thing.name, className: 'mue-avtile' },
      { content: avoidContent('bad', a), correct: false, kind: 'bad', say: `${a.thing.name} ${binSay(a.bad)}`, aria: a.thing.name, className: 'mue-avtile' },
    ];
    await ctx.choices(items, {
      className: 'mue-avs',
      sayButton: true,
      hintAfter: 1,
      praise: false,
      correctSay: () => (ctx.wrongCount === 0 && U.chance(0.3)
        ? 'Genau! Du weißt schon: Vermeiden ist noch besser als trennen. Das ist echtes Profi Wissen!'
        : vary('avok', ['Genau, das ist am besten!', 'Richtig! So entsteht gar kein Müll.', 'Super, das ist die beste Idee!'])),
      explain: (w) => (w.kind === 'ok'
        ? `Richtig trennen ist gut! ${cap(a.thing.n)} kommt wirklich ${binSay(a.ok)}. Aber es gibt etwas noch Besseres.`
        : `${a.badWhy || `${cap(a.thing.n)} gehört nicht ${binSay(a.bad)}.`} Und es gibt sogar etwas noch Besseres.`),
      hintSay: () => 'Tipp: Welcher Weg macht gar keinen Müll?',
      modelSay: () => `Schau, hier: ${cap(a.best.l)}. Das macht gar keinen Müll. Das ist noch besser als trennen.`,
    });
    if (!ctx.active) return;
    await ctx.say(a.merk);
    if (!ctx.active) return;
    await ctx.sleep(350);
  }

  /* ======================================================================
     Registrierung
     ====================================================================== */
  const INTRO = {
    1: 'Wir fangen mit drei Tonnen an: die Gelbe Tonne für Verpackungen, die blaue für Papier und die braune für Obst und Gemüse.',
    2: 'Jetzt kommen alle Tonnen dazu: der Glascontainer und die graue Restmülltonne. Frag dich immer: Woraus ist das?',
    3: 'Jetzt kommt das Sortier Band! Tipp auf ein Ding und dann auf die richtige Tonne. Du kannst es auch hineinziehen.',
    4: 'Jetzt wird es kniffelig. Glas wird nach Farben sortiert. Und manche Flaschen bringst du zurück in den Laden. Das heißt Pfand.',
    5: 'Profi Wissen: Noch besser als trennen ist, Müll gar nicht erst zu machen. Das heißt Müll vermeiden.',
  };
  let introduced = new Set();

  LT.registerGame({
    id: 'muell',
    area: 'sach1',
    title: 'Müll-Profi',
    icon: '♻️',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Willkommen, Müll Profi! Wir sortieren Müll in die richtigen Tonnen. Dann kann man daraus wieder Neues machen.',
    parent: {
      skill: 'Umwelt: Müll trennen (Gelbe Tonne, Papier, Bio, Glas, Restmüll), Glas nach Farben, Pfand, Müll vermeiden',
      goal: 'Ihr Kind ordnet Abfälle sicher den fünf Tonnen zu, indem es nach dem Material fragt („Woraus ist das? Ist es eine Verpackung?“), erkennt typische Fallen (benutztes Taschentuch, Saftkarton, Zahnbürste, Trinkglas), sortiert Glas nach Farben, erkennt das Pfandzeichen und weiß, dass Vermeiden noch besser ist als Trennen (Sachunterricht Klasse 1: Umwelt und Nachhaltigkeit).',
      levels: [
        'Drei Tonnen: Gelbe Tonne, Papier, Bio mit eindeutigen Dingen – Brücke aus der Vorschule (beim Steigern kommt der Restmüll dazu)',
        'Alle fünf Tonnen inklusive Glas und Restmüll, ein Ding nach dem anderen, erste Fallen (z. B. benutztes Taschentuch)',
        'Sortier-Band: mehrere Dinge nacheinander antippen oder in die Tonne ziehen, mit Fallen wie Saftkarton und Zahnbürste',
        'Glas nach Farben (blaue und rote Flaschen zum Grünglas, Deckel ab) und Pfand erkennen (Pfandzeichen statt Gelber Tonne)',
        'Vermeiden vor Trennen („Was ist am besten?“: Brotdose, Trinkflasche, reparieren) und Profi-Sortierband voller Fallen – Niveau Ende Klasse 1',
      ],
      tip: 'Lassen Sie Ihr Kind zu Hause beim Müll helfen: „Woraus ist das? Ist es eine Verpackung?“ Suchen Sie gemeinsam das Pfandzeichen beim Einkaufen und bringen Sie Flaschen zum Automaten. Fragen Sie auch: „Wie hätten wir diesen Müll vermeiden können?“',
    },

    async task(ctx) {
      // Stufen 1 und 2 haben dieselbe Bedienung (Anpassung darf wechseln); ab Stufe 3 bleibt die Art stabil.
      const level = ctx.level <= 2 ? Math.min(2, ctx.taskLevel) : ctx.level;
      if (ctx.index === 0) introduced = new Set();
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (level <= 2) return taskSort(ctx, level);
      if (level === 3) return taskBand(ctx, 3);
      if (level === 4) return ctx.index % 2 === 0 ? taskGlass(ctx) : taskPfand(ctx);
      return ctx.index % 2 === 0 ? taskAvoid(ctx) : taskBand(ctx, 5);
    },
  });
})();
