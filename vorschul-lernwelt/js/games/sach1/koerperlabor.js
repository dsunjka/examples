/* ==========================================================================
   Spiel „Körper-Labor“ 🔬 (Sachkunde-Schule, Klasse 1) – A15 „Mein Körper-Labor“

   Didaktik (Sachunterricht Klasse 1: Körper, Gesundheit, Ernährung):
   - Fünf Sinne und ihre Sinnesorgane: sehen (Augen), hören (Ohren),
     riechen (Nase), schmecken (Zunge), fühlen/tasten (Haut – am ganzen
     Körper, nicht nur an der Hand). Sinnesorgane schützen.
   - Zähne: Milchzähne (zwanzig), Wackelzahn und bleibende Zähne, Putzen nach
     dem Zauberwort KAI (Kauflächen hin und her, Außenflächen kleine Kreise,
     Innenflächen von Rot nach Weiß auswischen), zweimal täglich, Zahnarzt.
   - Gesunde Ernährung mit einer Ampel-Pyramide: unten grün (viel: Wasser,
     Obst, Gemüse, Brot, Kartoffeln), Mitte gelb (jeden Tag ein bisschen:
     Milch, Käse, Ei, Fisch, Fleisch), oben rot (wenig: Süßes, Fettiges).
     Dazu: Welcher Teller ist ausgewogen?
   - Ein guter Tag: Schlaf (rund zehn Stunden), Bewegung (mindestens eine
     Stunde), Wasser trinken, Abläufe (Hände waschen, Morgen, Abend).
   - Stufen:
       1  Sinne zuordnen: Bild + kurzer Satz → Sinnesorgan (Brücke aus der
          Vorschule, Fachwort „Sinnesorgan“, Haut als Tastorgan)
       2  Sinnes-Rätsel ohne Bild (nur Satz zum Lesen/Hören, mit Fallen wie
          „Schnupfen: Das Essen schmeckt nach nichts“) und Sinnesorgane schützen
       3  Zähne: KAI-Putzen in der richtigen Reihenfolge (eigene Bedienung mit
          Putz-Animation; beim Steigern der ganze Ablauf ohne Buchstaben-Hilfe)
          und Zahnwissen (Milchzähne, Wackelzahn, Zahnpasta, Zahnarzt)
       4  Essens-Pyramide füllen (die Pyramide füllt sich über die Runde) und
          den ausgewogenen Teller finden (Ampel-Rückmeldung)
       5  „Was ist ein guter Tag?“: Wissen zu Schlaf, Bewegung, Wasser; in
          Flos Tag die ungesunde Sache finden; Abläufe ordnen – Niveau Ende Kl. 1
   - Fehlvorstellungen: „Fühlen nur mit der Hand“, „Schmecken nur mit der
     Zunge“ (Nase hilft mit), „Milchzähne muss man nicht putzen“, „Pommes
     sind Kartoffeln, also gesund“, „Limo ist ein Getränk wie Wasser“,
     „Nur Süßes ist ungesund“ (Teller ohne Obst und Gemüse), „Schlaf ist
     Zeitverschwendung“.
   - Hilfe-Leiter: 1. Erklärung, was am Gewählten nicht passt (ohne Lösung),
     2. Strategie-Tipp (bei Auswahl verschwindet ein Ablenker), 3. Flo macht
     es vor, der Inhalt kommt in der Runde noch einmal.
   - Lerninhalte (ctx.item / ctx.track): „Glocke“, „Rätsel: Schnupfen“,
     „Schutz: Sonnenbrille“, „KAI-Putzen“, „Zahn: Milchzähne“, „Pommes“,
     „Bunter Teller“, „Tag: Schlaf“, „Fehler: Tablet“, „Ablauf: Hände waschen“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const nw = (n) => U.numberWord(n);
  const cap = (s) => U.cap(s);
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const vary = (key, list) => U.pickFresh('koe-' + key, list, Math.min(2, list.length - 1));
  /** hintAfter wie LT.z2.hintAfterFor: bei höchstens drei sichtbaren Kacheln schon nach dem ersten Fehler. */
  const hintAfterFor = (ctx, n, nWrong) => {
    const visible = ctx.flow < 0 && n >= 4 && nWrong >= 2 ? n - 1 : n;
    return visible <= 3 ? 1 : 2;
  };
  const OK = ['Richtig!', 'Genau!', 'Super!', 'Stimmt!', 'Prima!'];

  /* ======================================================================
     Sinnesorgane
     ====================================================================== */
  const ORG = {
    auge: { e: '👁️', label: 'Augen', def: 'die Augen', dat: 'den Augen', verb: 'siehst', sinn: 'Sehen',
      hint: 'Tipp: Das kann man anschauen. Womit schaust du?', what: 'Bilder, Farben und Licht' },
    ohr: { e: '👂', label: 'Ohren', def: 'die Ohren', dat: 'den Ohren', verb: 'hörst', sinn: 'Hören',
      hint: 'Tipp: Das ist ein Geräusch. Was fängt Geräusche auf?', what: 'Geräusche und Stimmen' },
    nase: { e: '👃', label: 'Nase', def: 'die Nase', dat: 'der Nase', verb: 'riechst', sinn: 'Riechen',
      hint: 'Tipp: Das ist ein Duft oder ein Gestank. Wo strömt die Luft hinein?', what: 'Düfte und Gestank' },
    zunge: { e: '👅', label: 'Zunge', def: 'die Zunge', dat: 'der Zunge', verb: 'schmeckst', sinn: 'Schmecken',
      hint: 'Tipp: Das hat einen Geschmack. Was liegt in deinem Mund?', what: 'süß, sauer, salzig und bitter' },
    haut: { e: '🖐️', label: 'Haut', def: 'die Haut', dat: 'der Haut', verb: 'fühlst', sinn: 'Fühlen',
      hint: 'Tipp: Das spürst du, wenn es dich berührt. Was bedeckt deinen ganzen Körper?', what: 'warm, kalt, weich und rau' },
  };
  const ORG_IDS = Object.keys(ORG);

  /* Stufe 1: Bild + kurzer Satz. c = Merksatz danach. */
  const SENSE1 = [
    { k: 'Glocke', e: '🔔', o: 'ohr', s: 'Die Glocke klingelt.', c: 'Das Klingeln hörst du mit den Ohren.' },
    { k: 'Trommel', e: '🥁', o: 'ohr', s: 'Jemand trommelt laut.', c: 'Das Trommeln hörst du mit den Ohren.' },
    { k: 'Vogel', e: '🐦', o: 'ohr', s: 'Ein Vogel singt im Baum.', c: 'Das Singen hörst du mit den Ohren.' },
    { k: 'Wecker', e: '⏰', o: 'ohr', s: 'Der Wecker rasselt.', c: 'Den Wecker hörst du mit den Ohren.' },
    { k: 'Regenbogen', e: '🌈', o: 'auge', s: 'Am Himmel ist ein bunter Regenbogen.', c: 'Die Farben siehst du mit den Augen.' },
    { k: 'Ampel', e: '🚦', o: 'auge', s: 'Die Ampel ist rot.', c: 'Die rote Ampel siehst du mit den Augen.' },
    { k: 'Buch', e: '📖', o: 'auge', s: 'Du schaust dir Bilder im Buch an.', c: 'Die Bilder siehst du mit den Augen.' },
    { k: 'Sterne', e: '⭐', o: 'auge', s: 'Nachts funkeln die Sterne.', c: 'Die Sterne siehst du mit den Augen.' },
    { k: 'Blume', e: '🌸', o: 'nase', s: 'Die Blume duftet.', c: 'Den Duft riechst du mit der Nase.' },
    { k: 'Pizza', e: '🍕', o: 'nase', s: 'Aus dem Ofen duftet es nach Pizza.', c: 'Den Pizzaduft riechst du mit der Nase.' },
    { k: 'Mülleimer', e: '🗑️', o: 'nase', s: 'Der Mülleimer stinkt.', c: 'Den Gestank riechst du mit der Nase.' },
    { k: 'Seife', e: '🧼', o: 'nase', s: 'Die Seife duftet frisch.', c: 'Den Duft riechst du mit der Nase.' },
    { k: 'Zitrone', e: '🍋', o: 'zunge', s: 'Du beißt in eine Zitrone. Sie ist sauer.', c: 'Sauer schmeckst du mit der Zunge.' },
    { k: 'Eis', e: '🍦', o: 'zunge', s: 'Du leckst am Eis. Es ist süß.', c: 'Süß schmeckst du mit der Zunge.' },
    { k: 'Brezel', e: '🥨', o: 'zunge', s: 'Die Brezel ist salzig.', c: 'Salzig schmeckst du mit der Zunge.' },
    { k: 'Teddy', e: '🧸', o: 'haut', s: 'Der Teddy ist weich und kuschelig.', c: 'Weich fühlst du mit der Haut.' },
    { k: 'Eiswürfel', e: '🧊', o: 'haut', s: 'Der Eiswürfel ist eiskalt.', c: 'Kalt fühlst du mit der Haut.' },
    { k: 'Igel', e: '🦔', o: 'haut', s: 'Du fasst den Igel an. Er pikst!', c: 'Das Piksen fühlst du mit der Haut.' },
    { k: 'Badewasser', e: '🛁', o: 'haut', s: 'Das Badewasser ist schön warm.', c: 'Warm fühlst du mit der Haut, am ganzen Körper.' },
  ];

  /* Stufe 2: Rätsel nur mit Text. ex = besondere Erklärung für eine typische Verwechslung. */
  const SENSE2 = [
    { k: 'Schnupfen', o: 'nase', s: 'Ich habe Schnupfen. Mein Essen schmeckt nach gar nichts. Was ist verstopft?', ask: '',
      hint: 'Tipp: Bei Schnupfen ist etwas zu. Was hilft sonst beim Schmecken mit?',
      ex: { zunge: 'Die Zunge schmeckt nur süß, sauer, salzig und bitter. Beim Schmecken hilft noch ein Sinnesorgan mit. Was ist bei Schnupfen zu?' },
      c: 'Die Nase hilft beim Schmecken mit. Bei Schnupfen schmeckt alles fad.' },
    { k: 'Rauch', o: 'nase', s: 'Irgendwo weit weg brennt ein Feuer. Ich sehe und höre nichts. Trotzdem merke ich es.', c: 'Rauch riechst du mit der Nase, auch wenn du ihn nicht siehst.' },
    { k: 'Milch', o: 'nase', s: 'Ich schaue nicht hin. Trotzdem merke ich, dass die alte Milch schlecht ist, schon bevor ich trinke.', c: 'Die Nase warnt dich, bevor du etwas Schlechtes isst.' },
    { k: 'Lichtschalter', o: 'haut', s: 'Es ist stockdunkel. Trotzdem finde ich den Lichtschalter an der Wand.', ask: 'Welches Sinnesorgan hilft mir dabei?',
      ex: { auge: 'Im Dunkeln sehen die Augen fast nichts. Wie findest du den Schalter dann?' },
      c: 'Im Dunkeln tastest du mit der Haut an deinen Fingern.' },
    { k: 'Krabbeln', o: 'haut', s: 'Etwas krabbelt auf meinem Arm.', c: 'Das Krabbeln fühlst du mit der Haut.' },
    { k: 'Sonnenbrand', o: 'haut', s: 'Meine Schultern brennen. Ich war zu lange in der Sonne.', c: 'Die Haut spürt Wärme und auch Schmerz.' },
    { k: 'Stein', o: 'haut', s: 'Ich halte einen Stein. Er ist rau und kalt.', c: 'Rau und kalt fühlst du mit der Haut.' },
    { k: 'Rufen', o: 'ohr', s: 'Mama ruft aus der Küche: Das Essen ist fertig!', c: 'Die Stimme hörst du mit den Ohren.' },
    { k: 'Hupe', o: 'ohr', s: 'Hinter mir hupt ein Auto. Ich drehe mich um.', c: 'Die Ohren hören auch, was hinter dir passiert.' },
    { k: 'Donner', o: 'ohr', s: 'Beim Gewitter kracht der Donner.', c: 'Den Donner hörst du mit den Ohren.' },
    { k: 'Blitz', o: 'auge', s: 'Beim Gewitter zuckt ein heller Blitz.',
      ex: { ohr: 'Den Donner kann man hören. Aber ein Blitz macht kein Geräusch. Was merkt das helle Licht?' },
      c: 'Den Blitz siehst du mit den Augen. Den Donner hörst du.' },
    { k: 'Ball', o: 'auge', s: 'Ein Ball fliegt auf mich zu. Ich weiß schon vorher, wo er landet.', c: 'Die Augen sehen den Ball kommen. So weißt du, wo er landet.' },
    { k: 'Pullifarbe', o: 'auge', s: 'Ich weiß, welche Farbe mein Pulli hat.', c: 'Farben siehst du mit den Augen.' },
    { k: 'Medizin', o: 'zunge', s: 'Igitt, die Medizin ist bitter!', c: 'Bitter schmeckst du mit der Zunge.' },
    { k: 'Suppe', o: 'zunge', s: 'Ich probiere die Suppe. Sie ist versalzen.', c: 'Salzig schmeckst du mit der Zunge.' },
  ];

  /* Stufe 2: Sinnesorgane schützen. */
  const PROTECT = [
    { k: 'Sonnenbrille', e: '🕶️', label: 'Sonnenbrille', o: 'auge', s: 'Die Sonne ist sehr hell. Was schützt deine Augen?',
      does: 'Eine Sonnenbrille schützt die Augen vor hellem Licht.' },
    { k: 'Ohrenschützer', e: '🎧', label: 'Ohrenschützer', o: 'ohr', s: 'Auf der Baustelle ist es sehr laut. Was schützt deine Ohren?',
      does: 'Ohrenschützer schützen die Ohren vor Lärm.' },
    { k: 'Leiser machen', e: '🔉', label: 'leiser machen', o: 'ohr', s: 'Die Musik im Kopfhörer ist viel zu laut. Was hilft deinen Ohren?',
      does: 'Leiser machen schont die Ohren.' },
    { k: 'Sonnencreme', e: '🧴', label: 'Sonnencreme', o: 'haut', s: 'Im Sommer brennt die Sonne. Was schützt deine Haut?',
      does: 'Sonnencreme schützt die Haut vor Sonnenbrand.' },
    { k: 'Handschuhe', e: '🧤', label: 'Handschuhe', o: 'haut', s: 'Im Winter ist es eiskalt. Was schützt die Haut an deinen Händen?',
      does: 'Handschuhe halten die Hände warm.' },
    { k: 'Pusten', e: '🌬️', label: 'erst pusten', o: 'zunge', s: 'Die Suppe ist sehr heiß. Was schützt deine Zunge?',
      does: 'Pusten kühlt heißes Essen ab. Dann verbrennst du dir nicht die Zunge.' },
    { k: 'Taschentuch', e: '🤧', label: 'Taschentuch', o: 'nase', s: 'Deine Nase läuft. Was hilft ihr?',
      does: 'Mit dem Taschentuch putzt du die Nase. Dann kannst du wieder gut riechen.' },
  ];

  const orgTile = (id, extra) => ({
    content: el('span.koe-org', U.emoji(ORG[id].e, 'koe-org-e'), el('span.koe-org-name', ORG[id].label)),
    say: ORG[id].label, id, className: 'koe-orgtile' + (extra || ''),
  });

  async function taskSense(ctx, level) {
    const riddle = level === 2;
    const pool = riddle ? SENSE2 : SENSE1;
    const target = ctx.item(pool, (x) => (riddle ? 'Rätsel: ' : '') + x.k, { avoid: 5 });
    const O = ORG[target.o];
    // Stufe 1: zwei Ablenker (beim Steigern drei); Stufe 2: alle fünf Sinnesorgane (beim Steigern ebenso)
    let nWrong = riddle ? 4 : (ctx.flow > 0 ? 3 : 2);
    if (riddle && ctx.flow < 0) nWrong = 3;
    const wrongIds = [];
    if (target.ex) Object.keys(target.ex).forEach((id) => wrongIds.push(id)); // die typische Verwechslung immer anbieten
    U.shuffle(ORG_IDS.filter((id) => id !== target.o && !wrongIds.includes(id))).forEach((id) => wrongIds.push(id));
    const ids = [target.o, ...wrongIds.slice(0, nWrong)];

    const card = riddle
      ? el('div.prompt-box.koe-riddle', U.emoji('🕵️', 'koe-riddle-e'), el('p.koe-riddle-txt', target.s))
      : el('div.prompt-box.koe-thing', U.emoji(target.e, 'koe-thing-e'), el('p.koe-thing-txt', target.s));
    ctx.stage.appendChild(card);
    const box = el('div.choices.koe-orgs');
    ctx.stage.appendChild(box);
    // eigene Frage je Rätsel möglich (Schnupfen fragt schon selbst: „Was ist verstopft?“)
    const ask = target.ask !== undefined ? target.ask : (riddle ? 'Welches Sinnesorgan merkt das?' : 'Mit welchem Sinnesorgan merkst du das?');
    const instr = ask ? `${target.s} ${ask}` : target.s;
    ctx.setInstruction(instr);
    await ctx.instruct(instr);
    if (!ctx.active) return;

    const items = ids.map((id) => Object.assign(orgTile(id), { correct: id === target.o }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, sayButton: false, hintAfter: ha, praise: false, shuffle: true,
      correctSay: () => proc(ctx, vary('ok', OK),
        vary('p1', ['Du hast überlegt: Ist das ein Geräusch, ein Duft oder ein Gefühl? Sehr schlau!',
          'Du hast dir das genau vorgestellt. So denken Forscher!', 'Du hast genau gelesen und nachgedacht. Toll!'])),
      explain: (wrong) => {
        if (target.ex && target.ex[wrong.id]) return target.ex[wrong.id];
        const W = ORG[wrong.id];
        return `Mit ${W.dat} ${W.verb} du ${W.what}. Passt das hier?`;
      },
      hintSay: () => target.hint || O.hint,
      modelSay: () => `Schau: ${target.c} Tipp auf ${O.def}.`,
    });
    if (!ctx.active) return;
    card.classList.add('koe-solved');
    card.appendChild(el('span.koe-badge', U.emoji(O.e), el('span', O.sinn)));
    await ctx.sleep(250);
    await ctx.say(target.c);
    await ctx.sleep(400);
  }

  async function taskProtect(ctx) {
    const target = ctx.item(PROTECT, (x) => 'Schutz: ' + x.k, { avoid: 4 });
    const nWrong = ctx.flow > 0 ? 3 : 2;
    const others = U.sample(PROTECT.filter((p) => p.o !== target.o), nWrong);
    const O = ORG[target.o];
    ctx.stage.appendChild(el('div.prompt-box.koe-thing',
      U.emoji(O.e, 'koe-thing-e'), U.emoji('🛡️', 'koe-shield'), el('p.koe-thing-txt', target.s)));
    const box = el('div.choices.koe-qbox');
    ctx.stage.appendChild(box);
    ctx.setInstruction(target.s);
    await ctx.instruct(target.s);
    if (!ctx.active) return;
    const items = [target, ...others].map((p) => ({
      content: el('span.koe-q', U.emoji(p.e, 'koe-q-e'), el('span.koe-q-t', p.label)),
      say: p.label, correct: p === target, p, className: 'koe-qtile' + longCls(p.label),
    }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', OK), 'Du hast an das richtige Sinnesorgan gedacht. Klasse!'),
      explain: (wrong) => `${wrong.p.does} Hier geht es um ${O.def}.`,
      hintSay: () => `Tipp: Was macht es ${O.dat} leichter?`,
      modelSay: () => `Schau: ${target.does} Tipp darauf.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(250);
    await ctx.say(`${target.does} Pass gut auf deine Sinnesorgane auf!`);
    await ctx.sleep(400);
  }

  /* ======================================================================
     Zähne (Stufe 3)
     ====================================================================== */
  /** Backenzahn im Zahnfleisch, links die Wange, rechts die Zunge; hl = 'K' | 'A' | 'I' hebt eine Fläche hervor. */
  function toothSvg(hl) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 120 110');
    svg.setAttribute('class', 'koe-tooth');
    svg.setAttribute('aria-hidden', 'true');
    const top = 'M30 34 Q36 16 46 27 Q54 14 60 27 Q66 14 74 27 Q84 16 90 34';
    const hlPath = { K: top, A: 'M30 34 L32 72', I: 'M90 34 L88 72' }[hl];
    svg.innerHTML = `
      <path d="M0 8 Q26 56 0 106 Z" fill="#f6cfb3"/>
      <ellipse cx="112" cy="58" rx="10" ry="20" fill="#f08a9c"/>
      <path d="${top} L88 74 L32 74 Z" fill="#fff" stroke="#c9cfe0" stroke-width="3" stroke-linejoin="round"/>
      <path d="M14 70 Q60 58 106 70 L106 108 L14 108 Z" fill="#f7a8b8" stroke="#e8899d" stroke-width="2"/>
      ${hlPath ? `<path class="koe-tooth-hl" d="${hlPath}" stroke="#1c7ed6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      <circle cx="49" cy="46" r="3" fill="#eef1f8"/>`;
    return svg;
  }

  const KAI = [
    { id: 'K', label: 'Kauflächen', say: 'Kauflächen', line: 'Kauflächen: hin und her schrubben.' },
    { id: 'A', label: 'Außenflächen', say: 'Außenflächen', line: 'Außenflächen: Zähne aufeinander und kleine Kreise malen.' },
    { id: 'I', label: 'Innenflächen', say: 'Innenflächen', line: 'Innenflächen: von Rot nach Weiß auswischen. Vom Zahnfleisch zum Zahn.' },
  ];
  const KAI_DESC = {
    K: 'Das sind die Kauflächen, oben, wo du kaust.',
    A: 'Das sind die Außenflächen, da wo die Wange ist.',
    I: 'Das sind die Innenflächen, da wo die Zunge ist.',
    P: 'Das ist die Zahnpasta.',
    S: 'Das ist das Ausspülen.',
  };
  const PASTE = { id: 'P', e: '🪥', label: 'Zahnpasta drauf', say: 'Zahnpasta auf die Bürste', line: 'Zahnpasta drauf, so groß wie eine Erbse.' };
  const RINSE = { id: 'S', e: '🚰', label: 'Ausspülen', say: 'Mund ausspülen', line: 'Zum Schluss den Mund ausspülen.' };

  /**
   * Allgemeine Reihenfolge-Bedienung: Karten in der richtigen Reihenfolge antippen.
   * steps: [{id, e | svg, label, say}], o: {cls, onStep(step, card), explain(card, expected), hint(expected), model(expected), done(), proc}
   */
  function sequenceTask(ctx, steps, o) {
    return new Promise((resolve) => {
      let next = 0;
      let busy = true;
      let modeled = false;
      const slots = steps.map((s, i) => el('div.koe-slot', el('span.koe-slot-n', String(i + 1))));
      const slotRow = el('div.koe-slots' + (o.cls ? '.' + o.cls + '-slots' : ''), ...slots);
      const cards = U.shuffle(steps.slice()).map((s) => {
        const pic = s.svg ? s.svg() : U.emoji(s.e, 'koe-card-e');
        const c = el('button.tile.koe-card' + (o.cls ? '.' + o.cls : ''), { type: 'button', 'aria-label': s.say || s.label },
          s.letter ? el('span.koe-card-letter', s.letter) : null, pic, el('span.koe-card-t', s.label));
        c._step = s;
        c.addEventListener('click', () => onTap(c));
        return c;
      });
      const cardRow = el('div.koe-cards' + (o.cls ? '.' + o.cls + '-cards' : ''), ...cards);
      if (o.title) ctx.stage.appendChild(el('div.prompt-box.koe-ask.koe-seqtitle', U.emoji(o.titleIcon || '🔬', 'koe-ask-e'), el('p.koe-ask-txt', o.title)));
      ctx.stage.append(slotRow, cardRow);
      const cardOf = (s) => cards.find((c) => c._step === s);
      const markNext = () => { if (next < steps.length) ctx.markTest(cardOf(steps[next])); };

      async function onTap(c) {
        if (busy || !ctx.active || c.classList.contains('koe-done')) return;
        const expected = steps[next];
        if (c._step === expected) {
          busy = true;
          ctx.markTest(c, false);
          cards.forEach((x) => ctx.unhint(x));
          c.classList.add('koe-done');
          c.setAttribute('aria-disabled', 'true');
          LT.sfx.play('pop');
          const slot = slots[next];
          slot.classList.add('koe-slot-full');
          slot.appendChild(s2mini(c._step));
          next++;
          if (o.onStep) await o.onStep(c._step, c);
          if (!ctx.active) return;
          if (next >= steps.length) {
            const first = ctx.wrongCount === 0 && !modeled;
            const say = first && U.chance(0.3) && o.proc ? o.proc : (o.done ? o.done() : vary('ok', OK));
            await ctx.correct(slotRow, { say, praise: false });
            if (!ctx.active) return;
            resolve();
            return;
          }
          markNext();
          busy = false;
          return;
        }
        busy = true;
        await ctx.wrong(c, { say: o.explain(c._step, expected), keep: true });
        if (!ctx.active) return;
        const step = ctx.helpStep;
        if (step === 2) {
          const sl = slots[next];
          ctx.hint(sl);
          ctx.timeout(() => ctx.unhint(sl), 3000);
          await ctx.say(o.hint(expected));
          if (!ctx.active) return;
        } else if (step >= 3) {
          modeled = true;
          ctx.modelShown = true;
          ctx.hint(cardOf(expected));
          await ctx.say(o.model(expected));
          if (!ctx.active) return;
        }
        busy = false;
      }
      function s2mini(s) {
        return s.svg ? el('span.koe-slot-pic', s.svg(), el('span.koe-slot-l', s.letter || '')) : U.emoji(s.e, 'koe-slot-e');
      }

      (async () => {
        ctx.setInstruction(o.instruction);
        await ctx.instruct(o.instruction);
        if (!ctx.active) return;
        busy = false;
        markNext();
        ctx.testSolve(() => { if (!busy && next < steps.length) onTap(cardOf(steps[next])); });
      })();
    });
  }

  async function brushAnim(ctx, card, line) {
    card.classList.add('koe-brushing');
    const brush = el('span.koe-brush', U.emoji('🪥'));
    const foam = el('span.koe-foam', ...U.range(0, 5).map(() => el('i')));
    card.append(brush, foam);
    LT.sfx.play('whoosh');
    await Promise.all([ctx.say(line), ctx.sleep(1100)]);
    if (!ctx.active) return;
    card.classList.remove('koe-brushing');
    brush.remove();
    card.classList.add('koe-clean');
  }

  async function taskBrush(ctx) {
    const full = ctx.flow > 0; // beim Steigern: ganzer Ablauf, ohne Buchstaben
    const kai = KAI.map((s) => Object.assign({}, s, { svg: () => toothSvg(s.id), letter: full ? '' : s.id }));
    const steps = full ? [PASTE, ...kai, RINSE] : kai;
    ctx.track(full ? 'Zahnputz-Ablauf' : 'KAI-Putzen');
    const instruction = full
      ? 'Putze die Zähne wie ein Profi. Tippe alle Schritte in der richtigen Reihenfolge an.'
      : 'Putze nach dem Zauberwort KAI. Was putzt du zuerst? Tippe der Reihe nach.';
    await sequenceTask(ctx, steps, {
      cls: 'koe-kai',
      title: full ? 'Zähne putzen wie ein Profi' : 'Zauberwort KAI',
      titleIcon: '🦷',
      instruction,
      onStep: (s, card) => brushAnim(ctx, card, s.line),
      explain: (picked, expected) => {
        const what = KAI_DESC[picked.id];
        if (picked.id === 'S') return `${what} Das kommt ganz am Schluss.`;
        if (expected.id === 'P') return `${what} Aber womit putzt du denn? Was muss zuerst auf die Bürste?`;
        if (expected.id === 'S') return `${what} Die hast du schon geputzt. Was fehlt noch?`;
        return `Fast! ${what} Die kommen später dran.`;
      },
      hint: (expected) => (expected.id === 'P' ? 'Tipp: Ohne Zahnpasta schäumt nichts.'
        : expected.id === 'S' ? 'Tipp: Alles ist geputzt. Jetzt muss der Schaum raus.'
          : `Tipp: Denk an das Zauberwort KAI. Der Buchstabe ${expected.id} ist dran.`),
      model: (expected) => (expected.id === 'P' || expected.id === 'S'
        ? `Schau: ${expected.line} Tipp hier.`
        : `Schau: ${expected.id} wie ${expected.label}. Tipp hier.`),
      done: () => (full ? 'Blitzblank! Erst Zahnpasta, dann KAI, dann ausspülen.' : `${vary('ok', OK)} Kauflächen, Außenflächen, Innenflächen. KAI!`),
      proc: full ? 'Super! Du hast an jeden Schritt gedacht. Wie beim Zahnarzt!' : 'Du hast das Zauberwort KAI benutzt. Sehr schlau!',
    });
    if (!ctx.active) return;
    await ctx.sleep(300);
    await ctx.say(vary('kaiC', ['Putze so zweimal am Tag, morgens und abends.', 'Zwei bis drei Minuten putzen, dann sind alle Zähne sauber.']));
    await ctx.sleep(400);
  }

  /* Zahnwissen: o = Antwortkacheln [Bild/Text, Anzeige, Sprechtext, ok, Erklärung] */
  const TOOTH_Q = [
    { k: 'Zahn: Wie oft', q: 'Wie oft am Tag putzt du deine Zähne?', o: [
      { e: '2️⃣', t: 'zweimal', s: 'zweimal', ok: true },
      { e: '1️⃣', t: 'einmal', s: 'einmal', ex: 'Nach dem Frühstück und vor dem Schlafen ist Putzzeit. Wie oft ist das?' },
      { e: '🔟', t: 'zehnmal', s: 'zehnmal', ex: 'So oft ist gar nicht nötig. Denk an morgens und abends.' },
    ], hint: 'Tipp: Einmal morgens. Und einmal …?', c: 'Zweimal am Tag: morgens und abends.' },
    { k: 'Zahn: Wie lange', q: 'Wie lange putzt du deine Zähne?', o: [
      { e: '⏳', t: '2 bis 3 Minuten', s: 'zwei bis drei Minuten', ok: true },
      { e: '⚡', t: '5 Sekunden', s: 'fünf Sekunden', ex: 'Fünf Sekunden sind ganz schnell vorbei. Schaffst du da alle Zähne und alle Flächen?' },
      { e: '🕐', t: '1 Stunde', s: 'eine Stunde', ex: 'Eine Stunde ist so lang wie ein Kinofilm. Das ist viel zu lang.' },
    ], hint: 'Tipp: So lange wie zwei Lieder ungefähr.', c: 'Zwei bis drei Minuten. Eine Sanduhr oder ein Lied hilft dabei.' },
    { k: 'Zahn: Milchzähne', q: 'Wie viele Milchzähne hat ein Kind?', o: [
      { e: '🦷', t: '20', s: nw(20), ok: true },
      { e: '🦷', t: '5', s: nw(5), ex: 'Fünf ist zu wenig. Zähl mal mit der Zunge oben und unten.' },
      { e: '🦷', t: '100', s: nw(100), ex: 'Hundert Zähne passen gar nicht in einen Mund.' },
    ], hint: 'Tipp: Oben zehn und unten zehn.', c: `Ein Kind hat ${nw(20)} Milchzähne. Oben ${nw(10)} und unten ${nw(10)}.` },
    { k: 'Zahn: Wackelzahn', q: 'Ein Milchzahn wackelt und fällt raus. Was passiert dann?', o: [
      { e: '🌱', t: 'Ein neuer Zahn wächst.', s: 'Ein neuer Zahn wächst.', ok: true },
      { e: '🕳️', t: 'Die Lücke bleibt.', s: 'Die Lücke bleibt für immer.', ex: 'Schau mal bei großen Kindern. Haben die lauter Lücken?' },
      { e: '🔁', t: 'Er wächst wieder fest.', s: 'Der alte Zahn wächst wieder fest.', ex: 'Ein ausgefallener Zahn wächst nicht wieder an. Darunter wartet schon etwas.' },
    ], hint: 'Tipp: Unter jedem Milchzahn wartet schon ein großer Zahn.', c: 'Dann wächst ein bleibender Zahn. Der muss ein Leben lang halten.' },
    { k: 'Zahn: Milchzähne putzen', q: 'Milchzähne fallen sowieso aus. Muss man sie trotzdem putzen?', o: [
      { e: '✅', t: 'Ja, immer!', s: 'Ja, immer!', ok: true },
      { e: '❌', t: 'Nein, nie.', s: 'Nein, nie.', ex: 'Auch Milchzähne können Löcher bekommen. Und Löcher tun weh.' },
      { e: '📅', t: 'Nur am Sonntag.', s: 'Nur am Sonntag.', ex: 'Essen klebt jeden Tag an den Zähnen. Reicht dann einmal in der Woche?' },
    ], hint: 'Tipp: Milchzähne halten den Platz für die neuen Zähne frei.', c: 'Ja! Gesunde Milchzähne halten den Platz für die neuen Zähne frei.' },
    { k: 'Zahn: Zahnfreund', q: 'Was ist gut für deine Zähne?', o: [
      { e: '🥕', t: 'Karotte', s: 'Karotte', ok: true },
      { e: '🍬', t: 'Bonbon', s: 'Bonbon', ex: 'Bonbons sind voller Zucker. Zucker mögen die Kariesmonster.' },
      { e: '🥤', t: 'Limo', s: 'Limo', ex: 'In Limo steckt ganz viel Zucker. Das ist nicht gut für die Zähne.' },
      { e: '🍭', t: 'Lolli', s: 'Lolli', ex: 'Ein Lolli badet die Zähne lange in Zucker.' },
    ], hint: 'Tipp: Was ist knackig und hat keinen Zucker?', c: 'Knackiges Gemüse ist gut für die Zähne. Zucker nicht.' },
    { k: 'Zahn: Zahnarzt', q: 'Wer schaut zweimal im Jahr nach deinen Zähnen?', o: [
      { e: '🦷', t: 'Zahnärztin', s: 'die Zahnärztin', ok: true },
      { e: '🥐', t: 'Bäcker', s: 'der Bäcker', ex: 'Der Bäcker backt Brot und Brötchen. Wer kennt sich mit Zähnen aus?' },
      { e: '💇', t: 'Friseurin', s: 'die Friseurin', ex: 'Die Friseurin schneidet Haare. Wer kennt sich mit Zähnen aus?' },
    ], hint: 'Tipp: Der Beruf hat das Wort Zahn im Namen.', c: 'Die Zahnärztin oder der Zahnarzt schaut nach Löchern. Das tut nicht weh.' },
    { k: 'Zahn: Zahnpasta', q: 'Wie viel Zahnpasta kommt auf die Bürste?', o: [
      { e: '🟢', t: 'wie eine Erbse', s: 'so groß wie eine Erbse', ok: true },
      { e: '🐍', t: 'die ganze Bürste', s: 'die ganze Bürste voll', ex: 'So viel Schaum brauchst du gar nicht. Ein kleines bisschen reicht.' },
      { e: '🚫', t: 'gar keine', s: 'gar keine', ex: 'Zahnpasta macht die Zähne stark. Ganz ohne geht es nicht so gut.' },
    ], hint: 'Tipp: Ein ganz kleiner Klecks reicht.', c: 'Ein Klecks so groß wie eine Erbse reicht.' },
    { k: 'Zahn: Kaufläche', q: 'Mit welcher Fläche kaust du dein Essen klein?', tooth: 'K' },
    { k: 'Zahn: Innenfläche', q: 'Welche Fläche zeigt zur Zunge?', tooth: 'I' },
    { k: 'Zahn: Außenfläche', q: 'Welche Fläche zeigt zur Wange?', tooth: 'A' },
  ];

  /** Breitere Kachel bei langem Text oder einem langen Einzelwort (Wörter werden nie getrennt). */
  const longCls = (t) => (t.length > 14 || t.split(/\s+/).some((w) => w.length > 9) ? ' koe-qlong' : '');

  async function quizTask(ctx, q, opts) {
    opts = opts || {};
    let list = q.o;
    if (q.tooth) {
      list = KAI.map((s) => ({ svg: s.id, t: s.label, s: s.label, ok: s.id === q.tooth, ex: KAI_DESC[s.id] + ' Schau auf die blaue Linie.' }));
    } else if (list.length > 3 && ctx.flow <= 0) {
      const right = list.find((x) => x.ok);
      list = [right, ...U.sample(list.filter((x) => !x.ok), 2)];
    }
    ctx.stage.appendChild(el('div.prompt-box.koe-ask', U.emoji(opts.icon || '🔬', 'koe-ask-e'), el('p.koe-ask-txt', q.q)));
    const box = el('div.choices.koe-qbox');
    ctx.stage.appendChild(box);
    ctx.setInstruction(q.q);
    await ctx.instruct(q.q);
    if (!ctx.active) return;
    const items = list.map((x) => ({
      content: el('span.koe-q', x.svg ? toothSvg(x.svg) : U.emoji(x.e, 'koe-q-e'), el('span.koe-q-t', x.t)),
      say: x.s, correct: !!x.ok, x, className: 'koe-qtile' + longCls(x.t) + (/^\d+$/.test(x.t) ? ' koe-qnum' : ''),
    }));
    const right = list.find((x) => x.ok);
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', OK), q.proc || vary('pQ', ['Du hast erst überlegt und dann getippt. Super!', 'Du hast an dein Forscherwissen gedacht. Toll!'])),
      explain: (wrong) => wrong.x.ex || 'Hmm. Überleg nochmal genau.',
      hintSay: () => q.hint || (q.tooth === 'K' ? 'Tipp: Die Kaufläche ist oben, mit kleinen Hügeln.' : q.tooth === 'I' ? 'Tipp: Die Zunge ist rechts im Bild.' : q.tooth === 'A' ? 'Tipp: Die Wange ist links im Bild.' : ''),
      modelSay: () => `Schau: ${right.s.replace(/[.!?]$/, '')}. Tipp darauf.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(250);
    const c = q.c || (q.tooth ? `${KAI_DESC[q.tooth]}` : '');
    if (c) await ctx.say(c);
    await ctx.sleep(400);
  }

  async function taskTooth(ctx) {
    const q = ctx.item(TOOTH_Q, (x) => x.k, { avoid: 5 });
    await quizTask(ctx, q, { icon: '🦷' });
  }

  /* ======================================================================
     Essens-Pyramide (Stufe 4)
     ====================================================================== */
  const FLOOR = {
    r: { name: 'wenig', sub: 'ab und zu', icon: '🔴', where: 'ganz oben', tap: 'oben',
      ex: (x) => `Ganz oben steht nur Naschzeug: Süßes und fettige Knabbersachen wie Pommes. ${x.pl ? 'Sind' : 'Ist'} ${x.nd} Naschzeug?`,
      tip: 'Tipp: Ist das süß oder eine fettige Knabbersache wie Pommes?' },
    y: { name: 'ein bisschen', sub: 'jeden Tag', icon: '🟡', where: 'in die Mitte', tap: 'in der Mitte',
      ex: (x) => `In der Mitte stehen Milch, Käse, Eier, Fisch und Fleisch. ${x.pl ? 'Gehören' : 'Gehört'} ${x.nd} dazu?`,
      tip: 'Tipp: Kommt es von einem Tier, wie Milch, Ei oder Fisch?' },
    g: { name: 'viel', sub: 'jeden Tag', icon: '🟢', where: 'ganz nach unten', tap: 'unten',
      ex: (x) => `Ganz unten steht, wovon du richtig viel essen und trinken darfst. Darfst du von ${x.d} so viel nehmen?`,
      tip: 'Tipp: Wächst es auf dem Feld oder am Baum? Oder ist es Wasser?' },
  };
  /* n = Name mit Artikel (Satzanfang), nd = Name im Satz (Nominativ, bestimmter Artikel; Stoffnamen ohne),
     d = Name im Satz (Dativ für „von …“), drink = Getränk,
     t (nur unten) = 'og' Obst/Gemüse oder 'satt' Brot, Nudeln, Reis, Kartoffeln – für den bunten Teller.
     Butter fehlt absichtlich: Eine Drei-Stufen-Ampel kann Fette nicht sauber zeigen („fettig = oben“ wäre eine Falle). */
  const FOOD = [
    { k: 'Wasser', e: '💧', f: 'g', n: 'Wasser', nd: 'Wasser', d: 'Wasser', drink: true },
    { k: 'Apfel', e: '🍎', f: 'g', t: 'og', n: 'Ein Apfel', nd: 'der Apfel', d: 'Äpfeln' },
    { k: 'Banane', e: '🍌', f: 'g', t: 'og', n: 'Eine Banane', nd: 'die Banane', d: 'Bananen' },
    { k: 'Karotte', e: '🥕', f: 'g', t: 'og', n: 'Eine Karotte', nd: 'die Karotte', d: 'Karotten' },
    { k: 'Brokkoli', e: '🥦', f: 'g', t: 'og', n: 'Brokkoli', nd: 'Brokkoli', d: 'Brokkoli' },
    { k: 'Brot', e: '🍞', f: 'g', t: 'satt', n: 'Brot', nd: 'Brot', d: 'Brot' },
    { k: 'Kartoffel', e: '🥔', f: 'g', t: 'satt', n: 'Eine Kartoffel', nd: 'die Kartoffel', d: 'Kartoffeln', tip: 'Tipp: Kartoffeln wachsen auf dem Feld und machen lange satt.' },
    { k: 'Nudeln', e: '🍝', f: 'g', t: 'satt', n: 'Nudeln', nd: 'Nudeln', d: 'Nudeln', pl: true },
    { k: 'Gurke', e: '🥒', f: 'g', t: 'og', n: 'Eine Gurke', nd: 'die Gurke', d: 'Gurken' },
    { k: 'Tomate', e: '🍅', f: 'g', t: 'og', n: 'Eine Tomate', nd: 'die Tomate', d: 'Tomaten' },
    { k: 'Trauben', e: '🍇', f: 'g', t: 'og', n: 'Trauben', nd: 'Trauben', d: 'Trauben', pl: true },
    { k: 'Reis', e: '🍚', f: 'g', t: 'satt', n: 'Reis', nd: 'Reis', d: 'Reis' },
    { k: 'Milch', e: '🥛', f: 'y', n: 'Milch', nd: 'Milch', d: 'Milch', drink: true, tip: 'Tipp: Milch ist ein Getränk, aber sie kommt von der Kuh. Sie ist eher ein Essen.' },
    { k: 'Käse', e: '🧀', f: 'y', n: 'Käse', nd: 'Käse', d: 'Käse', tip: 'Tipp: Käse wird aus Milch gemacht.' },
    { k: 'Ei', e: '🥚', f: 'y', n: 'Ein Ei', nd: 'das Ei', d: 'Eiern' },
    { k: 'Fisch', e: '🐟', f: 'y', n: 'Fisch', nd: 'Fisch', d: 'Fisch' },
    { k: 'Hähnchen', e: '🍗', f: 'y', n: 'Hähnchen', nd: 'Hähnchen', d: 'Hähnchen' },
    { k: 'Bonbon', e: '🍬', f: 'r', n: 'Ein Bonbon', nd: 'das Bonbon', d: 'Bonbons' },
    { k: 'Schokolade', e: '🍫', f: 'r', n: 'Schokolade', nd: 'Schokolade', d: 'Schokolade' },
    { k: 'Lolli', e: '🍭', f: 'r', n: 'Ein Lolli', nd: 'der Lolli', d: 'Lollis' },
    { k: 'Kuchen', e: '🍰', f: 'r', n: 'Kuchen', nd: 'Kuchen', d: 'Kuchen' },
    { k: 'Limo', e: '🥤', f: 'r', n: 'Limo', nd: 'Limo', d: 'Limo', drink: true, tip: 'Tipp: Limo ist ein Getränk, aber voller Zucker.' },
    { k: 'Pommes', e: '🍟', f: 'r', n: 'Pommes', nd: 'Pommes', d: 'Pommes', pl: true, tip: 'Tipp: Pommes sind aus Kartoffeln, aber in viel Fett gebraten.' },
    { k: 'Donut', e: '🍩', f: 'r', n: 'Ein Donut', nd: 'der Donut', d: 'Donuts' },
    { k: 'Keks', e: '🍪', f: 'r', n: 'Ein Keks', nd: 'der Keks', d: 'Keksen' },
  ];
  const RULE = {
    g: (x) => (x.drink ? 'Davon darfst du viel trinken.' : 'Davon darfst du viel essen.'),
    y: () => 'Davon gibt es jeden Tag ein bisschen.',
    r: () => 'Das gibt es nur ab und zu und wenig.',
  };
  let placed = { r: [], y: [], g: [] };

  function floorContent(f) {
    const F = FLOOR[f];
    const foods = placed[f].slice(-6).map((e) => U.emoji(e, 'koe-fl-food'));
    return el('span.koe-fl',
      el('span.koe-fl-head', U.emoji(F.icon, 'koe-fl-dot'), el('span.koe-fl-name', F.name)),
      foods.length ? el('span.koe-fl-foods', ...foods) : null);
  }

  async function taskPyramid(ctx) {
    const target = ctx.item(FOOD, (x) => x.k, { avoid: 6 });
    const F = FLOOR[target.f];
    const card = el('div.prompt-box.koe-food', U.emoji(target.e, 'koe-food-e'), el('span.koe-food-t', target.k));
    ctx.stage.appendChild(card);
    const box = el('div.choices.koe-pyr');
    ctx.stage.appendChild(box);
    const q = `Wohin ${target.pl ? 'gehören' : 'gehört'} ${target.nd} in der Pyramide?`;
    ctx.setInstruction(q);
    await ctx.instruct(q);
    if (!ctx.active) return;
    const items = ['r', 'y', 'g'].map((f) => ({
      content: floorContent(f), correct: f === target.f, f, className: 'koe-floor koe-floor-' + f, aria: FLOOR[f].name,
    }));
    await ctx.choices(items, {
      container: box, shuffle: false, ease: false, hintAfter: 1, praise: false,
      correctSay: () => proc(ctx, vary('ok', OK), vary('pF', ['Du hast überlegt, woher das Essen kommt. Wie eine Forscherin!',
        'Du hast an Zucker und Fett gedacht. Sehr schlau!'])),
      explain: (wrong) => FLOOR[wrong.f].ex(target),
      hintSay: () => target.tip || F.tip,
      modelSay: () => `Schau: ${cap(target.nd)} ${target.pl ? 'gehören' : 'gehört'} ${F.where}. Tipp ${F.tap}.`,
    });
    if (!ctx.active) return;
    placed[target.f].push(target.e);
    const fl = box.querySelector('.koe-floor-' + target.f);
    if (fl) {
      fl.replaceChildren(floorContent(target.f));
      fl.classList.add('koe-floor-pop');
    }
    await ctx.sleep(250);
    await ctx.say(`${target.n} ${target.pl ? 'gehören' : 'gehört'} ${F.where}. ${RULE[target.f](target)}`);
    await ctx.sleep(400);
  }

  /* Teller-Ampel: welcher Teller ist ausgewogen? */
  async function taskPlate(ctx) {
    ctx.track('Bunter Teller');
    const eat = FOOD.filter((x) => !x.drink);
    const G = eat.filter((x) => x.f === 'g');
    const Y = eat.filter((x) => x.f === 'y');
    const R = eat.filter((x) => x.f === 'r');
    // bunter Teller: immer Obst oder Gemüse + etwas Sattmachendes von unten + ein bisschen aus der Mitte
    const good = U.shuffle([U.pick(G.filter((x) => x.t === 'og')), U.pick(G.filter((x) => x.t === 'satt')), U.pick(Y)]);
    const sweet = U.shuffle([...U.sample(R, 2), ...U.sample(G, 1)]);
    const plates = [{ foods: good, ok: true }, { foods: sweet, kind: 'sweet' }];
    // ohne Ablenkung auf Stufe -1, sonst auch die Falle „gar nichts Süßes, aber nichts von unten“
    if (ctx.flow >= 0) plates.push({ foods: U.sample(Y, 3), kind: 'yellow' });
    ctx.stage.appendChild(el('div.prompt-box.koe-ask', U.emoji('🍽️', 'koe-ask-e'), el('p.koe-ask-txt', 'Welcher Teller ist am gesündesten?')));
    const box = el('div.choices.koe-plates');
    ctx.stage.appendChild(box);
    const q = 'Flo hat Hunger. Welcher Teller ist am gesündesten?';
    ctx.setInstruction(q);
    await ctx.instruct(q);
    if (!ctx.active) return;
    const items = plates.map((p) => ({
      content: el('span.koe-plate', ...p.foods.map((x) => el('span.koe-pf', U.emoji(x.e, 'koe-pf-e'), el('span.koe-pf-dot.koe-dot-' + x.f)))),
      correct: !!p.ok, p, className: 'koe-platetile', aria: p.foods.map((x) => x.k).join(', '),
    }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', OK), 'Du hast an die Pyramide gedacht. Viel von unten, ein bisschen aus der Mitte. Klasse!'),
      explain: (wrong) => (wrong.p.kind === 'sweet'
        ? 'Auf diesem Teller ist viel Naschzeug von ganz oben aus der Pyramide.'
        : 'Hier ist nichts Süßes. Aber auch nichts von ganz unten. Kein Obst, kein Gemüse, kein Brot.'),
      hintSay: () => 'Tipp: Ein guter Teller hat viel von ganz unten aus der Pyramide.',
      modelSay: () => 'Schau: Dieser Teller hat Obst oder Gemüse, etwas zum Sattwerden von unten und ein bisschen aus der Mitte. Tipp darauf.',
    });
    if (!ctx.active) return;
    box.classList.add('koe-ampel-on');
    await ctx.sleep(300);
    await ctx.say('Schau auf die Ampelpunkte. Viel Grün, ein bisschen Gelb, wenig Rot. So ist ein Teller bunt und gesund.');
    await ctx.sleep(400);
  }

  /* ======================================================================
     Guter Tag (Stufe 5)
     ====================================================================== */
  const DAY_Q = [
    { k: 'Tag: Schlaf', q: 'Wie lange schläft ein Schulkind in der Nacht ungefähr?', o: [
      { e: '😴', t: '10 Stunden', s: `${nw(10)} Stunden`, ok: true },
      { e: '🥱', t: '4 Stunden', s: `${nw(4)} Stunden`, ex: 'Nach so wenig Schlaf bist du am Morgen noch ganz müde.' },
      { e: '🛌', t: '20 Stunden', s: `${nw(20)} Stunden`, ex: 'Dann wäre ja fast der ganze Tag zum Schlafen. Wann spielst du dann?' },
    ], hint: 'Tipp: Wenn du um acht Uhr abends ins Bett gehst und um sechs Uhr aufstehst …', c: `Ungefähr ${nw(10)} Stunden. Im Schlaf wächst du und dein Kopf ordnet alles, was du gelernt hast.` },
    { k: 'Tag: Warum Schlaf', q: 'Warum brauchst du Schlaf?', o: [
      { e: '🔋', t: 'Mein Körper tankt Kraft.', s: 'Mein Körper tankt Kraft.', ok: true },
      { e: '🌙', t: 'Damit es Nacht wird.', s: 'Damit es Nacht wird.', ex: 'Die Nacht kommt auch, wenn du wach bist. Was passiert in deinem Körper?' },
      { e: '🍬', t: 'Damit ich Süßes kriege.', s: 'Damit ich Süßes kriege.', ex: 'Süßes gibt es fürs Schlafen nicht. Was macht der Schlaf mit dir?' },
    ], hint: 'Tipp: Wie fühlst du dich nach einer langen Nacht?', c: 'Im Schlaf tanken Körper und Kopf neue Kraft.' },
    { k: 'Tag: Durst', q: 'Du hast Durst. Was trinkst du am besten?', o: [
      { e: '💧', t: 'Wasser', s: 'Wasser', ok: true },
      { e: '🥤', t: 'Limo', s: 'Limo', ex: 'Limo löscht den Durst nur kurz und hat ganz viel Zucker.' },
      { e: '🧃', t: 'Eistee', s: 'Eistee', ex: 'Im Eistee steckt viel Zucker. Was ist ohne Zucker?' },
    ], hint: 'Tipp: Es kommt aus dem Wasserhahn.', c: 'Wasser ist der beste Durstlöscher.' },
    { k: 'Tag: Wie viel trinken', q: 'Wie viele Gläser trinkt ein Kind am Tag ungefähr?', o: [
      { e: '🥛', t: '6 Gläser', s: `${nw(6)} Gläser`, ok: true },
      { e: '🥛', t: '1 Glas', s: 'ein Glas', ex: 'Ein Glas ist zu wenig. Dein Körper braucht mehr Wasser.' },
      { e: '🥛', t: '30 Gläser', s: `${nw(30)} Gläser`, ex: 'So viel passt gar nicht in deinen Bauch.' },
    ], hint: 'Tipp: Zu jedem Essen ein Glas und dazwischen auch.', c: `Ungefähr ${nw(6)} Gläser am Tag. Wenn du tobst, noch mehr.` },
    { k: 'Tag: Bewegung', q: 'Wie lange solltest du dich jeden Tag richtig bewegen?', o: [
      { e: '🤸', t: 'mindestens 1 Stunde', s: 'mindestens eine Stunde', ok: true },
      { e: '⏱️', t: '1 Minute', s: 'eine Minute', ex: 'Eine Minute ist ganz schnell vorbei. Dein Körper möchte viel länger toben.' },
      { e: '🛋️', t: 'gar nicht', s: 'gar nicht', ex: 'Muskeln und Herz werden nur stark, wenn du dich bewegst.' },
    ], hint: 'Tipp: So lange wie eine ganze Sportstunde und noch etwas mehr.', c: 'Mindestens eine Stunde am Tag. Rennen, klettern, Rad fahren, alles zählt!' },
    { k: 'Tag: Pause', q: 'Du lernst schon lange und wirst zappelig. Was hilft?', o: [
      { e: '🤸', t: 'kurz bewegen', s: 'kurz bewegen', ok: true },
      { e: '📺', t: 'fernsehen', s: 'fernsehen', ex: 'Beim Fernsehen sitzt du wieder still. Was braucht dein zappeliger Körper?' },
      { e: '🍫', t: 'Schokolade', s: 'Schokolade essen', ex: 'Schokolade macht nicht wach. Was macht den Kopf wieder frisch?' },
    ], hint: 'Tipp: Hampelmann!', c: 'Ein bisschen Bewegung macht den Kopf wieder frisch.' },
    { k: 'Tag: Vor dem Schlafen', q: 'Was machst du kurz vor dem Schlafen?', o: [
      { e: '🪥', t: 'Zähne putzen', s: 'Zähne putzen', ok: true },
      { e: '📱', t: 'Tablet spielen', s: 'am Tablet spielen', ex: 'Helle Bildschirme machen wach. Dann schläfst du schlecht ein.' },
      { e: '🍭', t: 'Lolli lutschen', s: 'einen Lolli lutschen', ex: 'Dann bleibt die ganze Nacht Zucker an den Zähnen.' },
    ], hint: 'Tipp: Denk an KAI.', c: 'Abends Zähne putzen, dann ins Bett.' },
    { k: 'Tag: Herz', q: 'Du rennst ganz schnell. Was macht dein Herz?', o: [
      { e: '💓', t: 'Es schlägt schneller.', s: 'Es schlägt schneller.', ok: true },
      { e: '🛑', t: 'Es bleibt stehen.', s: 'Es bleibt stehen.', ex: 'Das Herz hört nie auf zu schlagen. Leg mal die Hand auf die Brust, nachdem du gehüpft bist.' },
      { e: '😴', t: 'Es schläft ein.', s: 'Es schläft ein.', ex: 'Das Herz schläft nie. Fühl mal nach dem Hüpfen.' },
    ], hint: 'Tipp: Hüpf zehnmal und leg die Hand auf dein Herz.', c: 'Dein Herz schlägt schneller und pumpt mehr Blut zu den Muskeln.' },
    { k: 'Tag: Schwitzen', q: 'Nach dem Toben schwitzt du. Was braucht dein Körper jetzt?', o: [
      { e: '💧', t: 'Wasser', s: 'Wasser', ok: true },
      { e: '🍟', t: 'Pommes', s: 'Pommes', ex: 'Pommes sind salzig. Danach hast du noch mehr Durst.' },
      { e: '🧥', t: 'dicke Jacke', s: 'eine dicke Jacke', ex: 'Dir ist doch schon warm. Was hat dein Körper beim Schwitzen verloren?' },
    ], hint: 'Tipp: Beim Schwitzen verliert dein Körper Wasser.', c: 'Beim Schwitzen verliert dein Körper Wasser. Also trinken!' },
  ];

  /* Flos Tag: eine Sache ist nicht gesund. */
  const DAY_FIX = [
    { k: 'Tablet', bad: { e: '📱', t: 'bis spät am Tablet', s: 'Flo spielt bis spät abends am Tablet.' },
      good: [['🥣', 'Müsli zum Frühstück', 'Flo isst Müsli zum Frühstück.'], ['🚲', 'mit dem Rad zur Schule', 'Flo fährt mit dem Rad zur Schule.'], ['🪥', 'abends Zähne putzen', 'Flo putzt abends die Zähne.']],
      fix: 'Abends lieber kein Tablet. Dann schläft Flo gut ein.', hint: 'Tipp: Denk an den Schlaf.' },
    { k: 'Süßes Frühstück', bad: { e: '🍬', t: 'Bonbons zum Frühstück', s: 'Flo isst Bonbons zum Frühstück.' },
      good: [['💧', 'Wasser trinken', 'Flo trinkt Wasser.'], ['⚽', 'draußen spielen', 'Flo spielt draußen.'], ['😴', 'früh ins Bett', 'Flo geht früh ins Bett.']],
      fix: 'Zum Frühstück lieber Brot oder Müsli. Das gibt lange Kraft.', hint: 'Tipp: Denk an die Essens-Pyramide.' },
    { k: 'Nur sitzen', bad: { e: '🛋️', t: 'den ganzen Tag sitzen', s: 'Flo sitzt den ganzen Tag auf dem Sofa.' },
      good: [['🍎', 'Apfel in der Pause', 'Flo isst einen Apfel in der Pause.'], ['🥗', 'Salat zum Mittag', 'Flo isst Salat zum Mittag.'], ['🪥', 'Zähne putzen', 'Flo putzt die Zähne.']],
      fix: 'Flos Körper will sich jeden Tag bewegen. Mindestens eine Stunde!', hint: 'Tipp: Denk an Bewegung.' },
    { k: 'Nur Limo', bad: { e: '🥤', t: 'nur Limo trinken', s: 'Flo trinkt nur Limo.' },
      good: [['🥪', 'Brot in der Pause', 'Flo isst ein Brot in der Pause.'], ['🏊', 'schwimmen gehen', 'Flo geht schwimmen.'], ['📖', 'Geschichte', 'Flo hört eine Gutenachtgeschichte.']],
      fix: 'Bei Durst ist Wasser am besten. Limo hat viel Zucker.', hint: 'Tipp: Denk ans Trinken.' },
    { k: 'Ohne Putzen', bad: { e: '🌙', t: 'ohne Zähneputzen ins Bett', s: 'Flo geht ohne Zähneputzen ins Bett.' },
      good: [['🚶', 'zu Fuß gehen', 'Flo geht zu Fuß.'], ['🥕', 'Karotten knabbern', 'Flo knabbert Karotten.'], ['💧', 'Wasser trinken', 'Flo trinkt Wasser.']],
      fix: 'Vor dem Schlafen immer Zähne putzen. Sonst bleibt der Zucker die ganze Nacht an den Zähnen.', hint: 'Tipp: Denk an deine Zähne.' },
    { k: 'Jeden Tag Pommes', bad: { e: '🍟', t: 'jeden Tag Pommes', s: 'Flo isst jeden Tag Pommes.' },
      good: [['🥣', 'Frühstück', 'Flo frühstückt.'], ['🤸', 'turnen', 'Flo turnt.'], ['😴', 'lange schlafen', 'Flo schläft lange genug.']],
      fix: 'Pommes gibt es nur ab und zu. Sie stehen ganz oben in der Pyramide.', hint: 'Tipp: Denk an die Essens-Pyramide.' },
  ];

  async function taskDayFix(ctx) {
    const set = ctx.item(DAY_FIX, (x) => 'Fehler: ' + x.k, { avoid: 4 });
    ctx.stage.appendChild(el('div.prompt-box.koe-ask', U.emoji('🦊', 'koe-ask-e'), el('p.koe-ask-txt', 'Was sollte Flo ändern?')));
    const box = el('div.choices.koe-qbox.koe-daybox');
    ctx.stage.appendChild(box);
    const q = 'Das ist Flos Tag. Eine Sache ist nicht gesund. Was sollte Flo ändern?';
    ctx.setInstruction(q);
    await ctx.instruct(q);
    if (!ctx.active) return;
    const cards = [{ e: set.bad.e, t: set.bad.t, s: set.bad.s, ok: true }, ...set.good.map(([e, t, s]) => ({ e, t, s }))];
    const items = cards.map((x) => ({
      content: el('span.koe-q', U.emoji(x.e, 'koe-q-e'), el('span.koe-q-t', x.t)),
      say: x.s, correct: !!x.ok, x, className: 'koe-qtile koe-daytile' + longCls(x.t),
    }));
    const ha = hintAfterFor(ctx, items.length, items.length - 1);
    await ctx.choices(items, {
      container: box, sayButton: true, hintAfter: ha, praise: false,
      correctSay: () => proc(ctx, vary('ok', OK), 'Du hast jede Karte geprüft: Schlaf, Bewegung, Essen und Trinken. Wie ein Gesundheitsforscher!'),
      explain: (wrong) => `${wrong.x.s} Das ist gut für Flo. Welche Sache tut dem Körper nicht gut?`,
      hintSay: () => set.hint,
      modelSay: () => `Schau: ${set.bad.s} Das ist nicht gesund. Tipp darauf.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(250);
    await ctx.say(set.fix);
    await ctx.sleep(400);
  }

  /* Abläufe ordnen */
  const ROUTINES = [
    { k: 'Hände waschen', title: 'Hände waschen', icon: '🧼', ask: 'Wie wäschst du deine Hände richtig?', steps: [
      { id: 'h1', e: '💦', label: 'nass machen', say: 'Hände nass machen' },
      { id: 'h2', e: '🧼', label: 'einseifen', say: 'Hände einseifen' },
      { id: 'h3', e: '🚿', label: 'abspülen', say: 'Seife abspülen' },
      { id: 'h4', e: '🧻', label: 'abtrocknen', say: 'Hände abtrocknen' },
    ], extra: { id: 'h0', e: '🚽', label: 'nach dem Klo', say: 'Nach dem Klo zum Waschbecken gehen' }, extraFirst: true,
      c: 'Einseifen und dabei bis dreißig zählen. Dann sind die Hände wirklich sauber.' },
    { k: 'Morgen', title: 'Flos Morgen', icon: '🌅', ask: 'Was macht Flo am Morgen? Bring es in die richtige Reihenfolge.', steps: [
      // nur Schritte, die logisch aufeinander folgen (Frühstück und Zähneputzen sind je nach Familie verschieden)
      { id: 'm1', e: '⏰', label: 'aufwachen', say: 'aufwachen' },
      { id: 'm2', e: '👕', label: 'anziehen', say: 'anziehen' },
      { id: 'm3', e: '🎒', label: 'Ranzen auf', say: 'den Schulranzen aufsetzen' },
      { id: 'm4', e: '🚸', label: 'zur Schule', say: 'zur Schule gehen' },
    ], extra: { id: 'm5', e: '🏫', label: 'lernen', say: 'in der Schule lernen' },
      c: 'Wach werden, anziehen, Ranzen auf und los. Mit einem guten Frühstück startet der Tag noch besser.' },
    { k: 'Abend', title: 'Flos Abend', icon: '🌙', ask: 'Was macht Flo am Abend? Bring es in die richtige Reihenfolge.', steps: [
      { id: 'a1', e: '🍝', label: 'Abendessen', say: 'Abendessen' },
      { id: 'a2', e: '🪥', label: 'Zähne putzen', say: 'Zähne putzen' },
      { id: 'a3', e: '🛏️', label: 'ins Bett', say: 'ins Bett gehen' },
      { id: 'a4', e: '😴', label: 'schlafen', say: 'schlafen' },
    ], extra: { id: 'a0', e: '⚽', label: 'draußen toben', say: 'draußen toben' }, extraFirst: true,
      c: 'Nach dem Zähneputzen wird nichts mehr gegessen. Dann gute Nacht!' },
    { k: 'Sport', title: 'Flo macht Sport', icon: '🏃', ask: 'Flo macht Sport. Was kommt zuerst?', steps: [
      { id: 's1', e: '👟', label: 'Turnschuhe an', say: 'Turnschuhe anziehen' },
      { id: 's2', e: '🤸', label: 'aufwärmen', say: 'aufwärmen' },
      { id: 's3', e: '⚽', label: 'Fußball spielen', say: 'Fußball spielen' },
      { id: 's4', e: '💧', label: 'Wasser trinken', say: 'Wasser trinken' },
    ], extra: { id: 's5', e: '🚿', label: 'duschen', say: 'duschen' },
      c: 'Erst aufwärmen, dann toben, danach trinken. So bleibt dein Körper fit.' },
  ];

  async function taskRoutine(ctx) {
    const r = ctx.item(ROUTINES, (x) => 'Ablauf: ' + x.k, { avoid: 3 });
    let steps = r.steps.slice();
    if (ctx.flow > 0 && r.extra) steps = r.extraFirst ? [r.extra, ...steps] : [...steps, r.extra];
    await sequenceTask(ctx, steps, {
      cls: 'koe-seq',
      title: r.title,
      titleIcon: r.icon,
      instruction: `${r.ask} Tippe der Reihe nach.`,
      onStep: async (s) => { await ctx.say(s.say); },
      explain: (picked, expected) => (steps.indexOf(picked) < steps.indexOf(expected)
        ? `${cap(picked.say)}: Das hast du schon gemacht. Was kommt jetzt?`
        : `${cap(picked.say)} kommt später. Was muss vorher passieren?`),
      hint: () => 'Tipp: Stell dir vor, du machst es gerade selbst. Was tust du als Nächstes?',
      model: (expected) => `Schau: Jetzt kommt ${expected.say}. Tipp hier.`,
      done: () => `${vary('ok', OK)} ${steps.map((s) => s.say).join(', dann ')}.`,
      proc: 'Du hast es dir im Kopf vorgespielt. So klappt es!',
    });
    if (!ctx.active) return;
    await ctx.sleep(250);
    await ctx.say(r.c);
    await ctx.sleep(400);
  }

  async function taskDayQuiz(ctx) {
    const q = ctx.item(DAY_Q, (x) => x.k, { avoid: 5 });
    await quizTask(ctx, q, { icon: '☀️' });
  }

  /* ======================================================================
     Spiel
     ====================================================================== */
  const INTRO = {
    1: 'Du hast fünf Sinne: sehen, hören, riechen, schmecken und fühlen. Für jeden Sinn gibt es ein Sinnesorgan. Welches passt?',
    2: 'Jetzt kommen Sinnes Rätsel ohne Bild. Lies oder hör genau zu und überlege, welches Sinnesorgan das merkt.',
    3: 'Jetzt geht es um deine Zähne. Profis putzen nach dem Zauberwort KAI: Kauflächen, Außenflächen, Innenflächen.',
    4: 'Hier ist die Essens Pyramide. Unten steht, wovon du viel essen darfst. Ganz oben steht, was es nur ab und zu gibt.',
    5: 'Was macht einen guten Tag? Genug Schlaf, viel Bewegung, Wasser und gesundes Essen. Wir prüfen Flos Tag!',
  };
  let introduced = new Set();

  LT.registerGame({
    id: 'koerperlabor',
    area: 'sach1',
    title: 'Körper-Labor',
    icon: '🔬',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Willkommen im Körper Labor! Heute erforschen wir deinen Körper.',
    parent: {
      skill: 'Körper und Gesundheit: Sinne und Sinnesorgane, Zahnpflege (KAI), gesunde Ernährung, Schlaf und Bewegung',
      goal: 'Ihr Kind ordnet Wahrnehmungen den fünf Sinnen und Sinnesorganen zu (auch ohne Bild), weiß, wie man Sinnesorgane schützt, putzt die Zähne nach KAI, kennt Milchzähne und Wackelzahn, sortiert Lebensmittel in eine Ampel-Pyramide, erkennt einen ausgewogenen Teller und weiß, was zu einem gesunden Tag gehört (Sachunterricht Klasse 1: Körper und Gesundheit).',
      levels: [
        'Sinne zuordnen: Bild und kurzer Satz → Sinnesorgan (Augen, Ohren, Nase, Zunge, Haut) – Brücke aus der Vorschule',
        'Sinnes-Rätsel nur mit Text (z. B. Schnupfen: Essen schmeckt nach nichts → Nase) und Sinnesorgane schützen',
        'Zähne: KAI-Putzen in der richtigen Reihenfolge (beim Steigern ganzer Ablauf ohne Buchstaben) und Zahnwissen (Milchzähne, Wackelzahn, Zahnarzt)',
        'Essens-Pyramide füllen (viel – ein bisschen – wenig, mit Fallen wie Pommes und Limo) und den ausgewogenen Teller finden',
        'Ein guter Tag: Schlaf, Bewegung, Wasser; in Flos Tag die ungesunde Sache finden; Abläufe ordnen (Hände waschen) – Niveau Ende Klasse 1',
      ],
      tip: 'Machen Sie ein Sinnes-Experiment: Augen zu und nur riechen oder fühlen – was ist das? Beim Zähneputzen gemeinsam „K-A-I“ sagen. Beim Einkaufen fragen: „Gehört das nach unten, in die Mitte oder nach oben in die Pyramide?“',
    },

    async task(ctx) {
      // Stufen 1 und 2 haben dieselbe Bedienung (flow darf wechseln); ab Stufe 3 bleibt das Thema stabil.
      const level = ctx.level <= 2 ? Math.min(2, ctx.taskLevel) : ctx.level;
      if (ctx.index === 0) { introduced = new Set(); placed = { r: [], y: [], g: [] }; }
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (level === 1) return taskSense(ctx, 1);
      if (level === 2) return ctx.index % 3 === 2 ? taskProtect(ctx) : taskSense(ctx, 2);
      if (level === 3) return ctx.index % 2 === 0 ? taskBrush(ctx) : taskTooth(ctx);
      if (level === 4) return ctx.index % 3 === 2 ? taskPlate(ctx) : taskPyramid(ctx);
      const m = ctx.index % 3;
      if (m === 0) return taskDayQuiz(ctx);
      if (m === 1) return taskDayFix(ctx);
      return taskRoutine(ctx);
    },
  });
})();
