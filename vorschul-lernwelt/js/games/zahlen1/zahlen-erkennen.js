/* ==========================================================================
   Spiel „Zahlen-Detektiv“ 🔍 – Zahlwort ↔ Ziffer ↔ Menge verknüpfen.

   Didaktik (Triple-Code-Modell nach Dehaene / Mengen-Zahlen-Kompetenz):
   Eine Zahl hat drei Gesichter – das gehörte Zahlwort („sieben“), die
   geschriebene Ziffer (7) und die Menge (●●●●● ●●). Das Spiel übt alle
   Übersetzungen in beide Richtungen:
     a) Zahl hören      → Ziffer antippen        („Wo ist die Sieben?“)
     b) Ziffer sehen    → passende Menge wählen  (Lupe mit 7 → Bild mit 7)
     c) Menge sehen     → Ziffer wählen          (Fingerbild → 7)
     d) Zahl hören      → Menge wählen           (ab Stufe 4)
   - Stufen: 1–5 → 1–10 (mit den verwechselbaren Ziffern 6 und 9) →
     0–20 mit Zehner-und-Einer-Darstellung (zwei Zehnerfelder) → gemischt
     mit wechselnden Darstellungen in einer Aufgabe.
   - Gezielte Ablenker: 6↔9, „14 ↔ 4“ (Bedeutung der Eins als Zehner) und
     Zahlendreher „14 ↔ 41“ (im Deutschen spricht man die Einer zuerst!).
   - Gestufte Hilfe: 1. Fehler → informatives Feedback („Da sind sechs.“),
     Ziffer wird benannt bzw. 6/9-Merkhilfe; 2. Fehler → Flo zählt auf dem
     Zahlenstrahl hoch, zählt die Menge vor (ab 10 weiterzählen) oder zeigt
     die Zehner-Einer-Schreibweise – dann wird die Lösung hervorgehoben.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z1;
  const nw = Z.nw;
  const NW = Z.NW;

  /* ------------------------------------------------------------------
     Stufen
     ------------------------------------------------------------------ */
  const LEVELS = {
    1: { min: 1, max: 5, pool: U.range(1, 5), digits: 3, reps: ['dice', 'objects', 'hands'] },
    2: { min: 1, max: 10, pool: U.range(1, 10).concat([6, 9, 7, 8]), digits: 4, reps: ['frame', 'objects', 'hands'] },
    3: { min: 0, max: 20, pool: [0].concat(U.range(3, 9), U.range(10, 20), U.range(11, 19)), digits: 4, reps: ['twenty'] },
    4: { min: 0, max: 20, pool: U.range(0, 20).concat(U.range(6, 9)), digits: 4, reps: 'mixed' },
  };
  const TYPE_PLAN = {
    1: ['hear-digit', 'digit-qty', 'hear-digit', 'digit-qty', 'qty-digit'],
    2: ['hear-digit', 'digit-qty', 'hear-digit', 'digit-qty', 'qty-digit'],
    3: ['hear-digit', 'digit-qty', 'hear-digit', 'digit-qty', 'qty-digit'],
    4: ['hear-digit', 'digit-qty', 'qty-digit', 'hear-qty', 'hear-qty'],
  };

  // Ablauf einer Runde (welche Aufgabenart wann) – wird zu Rundenbeginn gemischt
  let plan = [];
  function typeFor(ctx) {
    if (ctx.index === 0 || plan.length !== ctx.total) {
      const base = (TYPE_PLAN[ctx.level] || TYPE_PLAN[1]).slice();
      // sanfter Einstieg: zuerst „hören → Ziffer“, der Rest gemischt
      const first = base.shift();
      // Rest so mischen, dass dieselbe Aufgabenart nicht direkt zweimal hintereinander kommt
      let rest = U.shuffle(base);
      for (let tries = 0; tries < 30; tries++) {
        const seq = [first].concat(rest);
        if (seq.every((t, i) => i === 0 || t !== seq[i - 1])) break;
        rest = U.shuffle(base);
      }
      plan = [first].concat(rest);
      while (plan.length < ctx.total) plan.push(U.pick(base.filter((t) => t !== plan[plan.length - 1])) || U.pick(base));
    }
    return plan[ctx.index];
  }

  /* ------------------------------------------------------------------
     Darstellungen
     ------------------------------------------------------------------ */
  function validRep(rep, v) {
    if (rep === 'dice') return v >= 1 && v <= 6;
    if (rep === 'objects' || rep === 'hands') return v >= 1 && v <= 10;
    if (rep === 'frame') return v >= 0 && v <= 10;
    return true; // twenty
  }
  function buildQty(rep, v, env) {
    let node;
    if (rep === 'dice') node = Z.dice(v);
    else if (rep === 'objects') node = Z.objects(v, env.thing.e);
    else if (rep === 'hands') node = Z.hands(v, { skin: env.skin });
    else if (rep === 'frame') node = Z.tenFrame(v);
    else node = Z.twentyFrame(v);
    const w = el('div.zd-qty.r-' + rep, node);
    w._node = node;
    w._rep = rep;
    w._units = node._units;
    return w;
  }
  /** Sprechbare Mengenangabe passend zur Darstellung */
  function qtyPhrase(rep, v, env) {
    if (v === 0) return 'gar nichts';
    if (rep === 'hands') return v === 1 ? 'ein Finger' : `${nw(v)} Finger`;
    if (rep === 'objects') return Z.count(v, env.thing);
    if (rep === 'twenty' && v === 20) return 'zwei volle Zehnerfelder';
    if (rep === 'twenty' && v > 10) return `zehn und ${nw(v - 10)}`;
    if (rep === 'twenty' && v === 10) return 'ein volles Zehnerfeld, also zehn';
    return v === 1 ? 'ein Punkt' : `${nw(v)} Punkte`;
  }
  function unitWord(rep, env) {
    if (rep === 'hands') return 'Finger';
    if (rep === 'objects') return env.thing.p;
    return 'Punkte';
  }
  const thereAre = (v) => (v === 0 ? 'Da ist gar nichts.' : v === 1 ? 'Da ist nur eins.' : `Da sind ${nw(v)}.`);

  /** Darstellungen für mehrere Werte: eine gemeinsame oder (Stufe 4) gemischte */
  function repsFor(cfg, values) {
    if (cfg.reps === 'mixed') {
      if (values.some((v) => v > 10)) return values.map(() => 'twenty');
      // jede Kachel eine andere Darstellung (soweit für die Zahl möglich)
      const all = U.shuffle(['frame', 'objects', 'hands', 'dice']);
      const used = new Set();
      return values.map((v) => {
        const ok = all.filter((r) => validRep(r, v));
        const rep = ok.find((r) => !used.has(r)) || ok[0] || 'frame';
        used.add(rep);
        return rep;
      });
    }
    const options = cfg.reps.filter((r) => values.every((v) => validRep(r, v)));
    const rep = U.pickFresh('zd-rep', options.length ? options : ['frame'], 1);
    return values.map(() => rep);
  }

  /* ------------------------------------------------------------------
     Gezielte Ablenker und Merkhilfen
     ------------------------------------------------------------------ */
  function digitPrefer(n, level) {
    const p = [];
    if (n === 6) p.push(9);
    if (n === 9) p.push(6);
    if (level >= 3) {
      if (n >= 12 && n <= 19) p.push(n - 10); // Einer allein (14 → 4)
      // Zahlendreher (14 → 41) nur bei 13–19: dort spricht man die Einer zuerst
      // („vier-zehn“); elf und zwölf sind unregelmäßig.
      if (n >= 13 && n <= 19) p.push((n % 10) * 10 + 1);
      if (n === 11) p.push(1);
      if (n === 10) p.push(1, 0);
      if (n === 20) p.push(2, 12);
      if (n === 0) p.push(10);
    }
    return p;
  }
  function qtyPrefer(n, level) {
    const p = [];
    if (n === 6) p.push(9);
    if (n === 9) p.push(6);
    if (level >= 3 && n > 10) p.push(n - 10);
    if (level >= 3 && n === 0) p.push(10);
    return p;
  }
  const BELLY = 'Bei der Sechs ist der Bauch unten, bei der Neun ist der Bauch oben.';
  function writeNote(n) {
    if (n === 0) return 'Null heißt: gar nichts.';
    if (n === 10) return 'Zehn schreibt man mit einer Eins und einer Null.';
    if (n === 11) return 'Elf schreibt man mit zwei Einsen.';
    if (n === 20) return 'Zwanzig schreibt man mit einer Zwei und einer Null.';
    if (n > 11) return `${NW(n)} schreibt man mit einer Eins vorne und einer ${NW(n - 10)} hinten.`;
    return '';
  }

  /* ------------------------------------------------------------------
     Bausteine der Oberfläche
     ------------------------------------------------------------------ */
  function earButton(ctx, word) {
    const b = el('button.zd-ear', { type: 'button', 'aria-label': 'Zahl nochmal hören' }, U.emoji('👂'), el('span.zd-ear-sp', U.emoji('🔊')));
    b.addEventListener('click', async () => {
      LT.sfx.play('pop');
      b.classList.add('speaking');
      await ctx.say(word);
      b.classList.remove('speaking');
    });
    return b;
  }
  function lens(n) {
    const s = String(n);
    return el('div.zd-lens', el('span.zd-digit' + (s.length > 1 ? '.two' : ''), s));
  }
  function digitItems(values, n) {
    return values.map((k) => ({
      content: String(k),
      text: true,
      correct: k === n,
      say: NW(k),
      value: k,
      className: 'zd-digit-tile' + (String(k).length > 1 ? ' two' : ''),
    }));
  }

  /** Menge vorzählen; bei Zwanzigerfeld > 10: „zehn“ und dann weiterzählen */
  async function countQty(ctx, qty, v) {
    if (qty._rep === 'twenty' && v > 10) {
      const [f1, f2] = qty._node._frames;
      f1.style.position = 'relative';
      Z.markUnit(f1, 10);
      LT.sfx.tone(392, 0.1, { type: 'triangle', volume: 0.3 });
      await ctx.say('Ein volles Zehnerfeld – das sind zehn. Und weiter:');
      await Z.countAlong(ctx, f2._units, { from: 10 });
    } else {
      await Z.countAlong(ctx, qty._units);
    }
  }

  /** Hilfe für „hören → Ziffer“: Zahlenstrahl hochzählen bzw. Zehner+Einer zeigen */
  async function helpDigit(ctx, n, box) {
    U.clear(box);
    if (n <= 10) {
      const nl = Z.numberLine(n === 0 ? 0 : 1, 10);
      box.appendChild(nl);
      if (n === 0) {
        nl.mark(0, 'on');
        await ctx.say('Null steht ganz am Anfang. Null heißt: gar nichts.');
        return;
      }
      await ctx.say('Wir zählen zusammen bis ' + nw(n) + '.');
      for (let i = 1; i <= n; i++) {
        if (!ctx.active) return;
        const c = nl.cell(i);
        c.classList.add(i === n ? 'on' : 'pass', 'z1-point');
        LT.sfx.tone(392 + i * 28, 0.09, { type: 'triangle', volume: 0.3 });
        await ctx.say(nw(i));
        c.classList.remove('z1-point');
      }
      await ctx.say(`So sieht die ${NW(n)} aus.`);
    } else {
      const s = String(n);
      const digits = el('div.zd-help-digits', el('span.ten', s[0]), el('span.one', s[1]));
      const tf = Z.twentyFrame(n);
      tf.style.flexDirection = 'row';
      box.appendChild(el('div.zd-help-twenty', tf, digits));
      if (n === 20) await ctx.say('Zwanzig sind zwei volle Zehnerfelder. ' + writeNote(n));
      else await ctx.say(`${NW(n)} ist zehn und ${nw(n - 10)}. ${writeNote(n)}`);
    }
  }

  LT.registerGame({
    id: 'zahlen-erkennen',
    area: 'zahlen',
    title: 'Zahlen-Detektiv',
    icon: '🔍',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Ziffern kennen: Zahlwort, Ziffer und Menge verbinden',
      goal: 'Ihr Kind verknüpft das gehörte Zahlwort, die geschriebene Ziffer und die passende Menge in allen Richtungen – die Grundlage, um Zahlen wirklich zu „verstehen“. Typische Stolpersteine werden gezielt geübt: die Verwechslung von 6 und 9 sowie die Zahlen ab 10, bei denen man im Deutschen die Einer zuerst spricht („vierzehn“), aber die Zehner zuerst schreibt (14).',
      levels: [
        'Zahlen 1 bis 5 mit Würfelbildern, Fingern und Dingen',
        'Zahlen 1 bis 10 im Zehnerfeld, mit der kniffligen 6 und 9',
        'Zahlen 0 bis 20: Zehner und Einer mit zwei Zehnerfeldern',
        'Alles gemischt – verschiedene Darstellungen in einer Aufgabe',
      ],
      tip: 'Gehen Sie auf Zahlen-Detektivjagd: Hausnummern, Preisschilder, Autokennzeichen, die Fernbedienung oder Kalender. Fragen Sie: „Wo siehst du eine Sieben?“ und lassen Sie Ihr Kind danach sieben Dinge holen.',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const type = typeFor(ctx);
      // ohne direkte Wiederholung, aber nicht vorhersagbar (bei 1–5 nur die letzten 2 sperren)
      const n = U.pickFresh('zd-n-' + ctx.level, cfg.pool, Math.min(4, Math.floor(new Set(cfg.pool).size / 2)));
      const env = { thing: Z.pickThing('zd-thing'), skin: U.pick(Z.SKINS) };
      const prompt = el('div.prompt-box.zd-prompt');
      const helpBox = el('div.zd-help');
      ctx.stage.appendChild(prompt);

      /* ---------- a) Zahl hören → Ziffer antippen ---------- */
      if (type === 'hear-digit') {
        const ear = earButton(ctx, NW(n));
        prompt.append(ear, helpBox);
        const values = Z.numberChoices(n, cfg.digits, cfg.min, cfg.max, digitPrefer(n, ctx.level));
        const q = `Wo ist die ${NW(n)}?`;
        ctx.setInstruction(q);
        ctx.instruct(ctx.index === 0 ? `Hör gut zu! ${q} Tippe sie an.` : q);
        await ctx.choices(digitItems(values, n), {
          shuffle: false,
          hintAfter: 2,
          wrongSay: (item) => `Das ist die ${NW(item.value)}.`,
          onWrong: async (item, tile, wrongs) => {
            if (wrongs === 1) {
              if ((n === 6 && item.value === 9) || (n === 9 && item.value === 6)) await ctx.say(BELLY);
              else if (n >= 13 && n <= 19 && item.value === (n % 10) * 10 + 1) await ctx.say(`Vorsicht! Bei ${nw(n)} hörst du zuerst die ${NW(n - 10)}. Aber vorne steht die Eins für die Zehn.`);
              else await ctx.say(`Wir suchen die ${NW(n)}.`);
            } else if (wrongs === 2) {
              await helpDigit(ctx, n, helpBox);
            }
          },
          onCorrect: () => {
            // Verknüpfung zur Menge sichtbar machen
            U.clear(helpBox);
            const rep = n > 10 ? 'twenty' : n === 0 ? 'frame' : n <= 6 && ctx.level === 1 ? 'dice' : 'frame';
            const link = buildQty(rep, n, env);
            prompt.appendChild(el('div.zd-link', link));
          },
          correctSay: () => {
            const note = ctx.level >= 3 && writeNote(n) ? ' ' + writeNote(n) : '';
            return `Richtig, das ist die ${NW(n)}!${note}`;
          },
        });
        await ctx.sleep(400);
        return;
      }

      /* ---------- b) Ziffer sehen → Menge wählen  /  d) Zahl hören → Menge wählen ---------- */
      if (type === 'digit-qty' || type === 'hear-qty') {
        if (type === 'digit-qty') prompt.append(lens(n));
        else prompt.append(earButton(ctx, NW(n)));
        const values = Z.numberChoices(n, 3, cfg.min, cfg.max, qtyPrefer(n, ctx.level));
        const reps = repsFor(cfg, values);
        const qtys = {};
        const items = U.shuffle(values.map((v, i) => {
          const q = buildQty(reps[i], v, env);
          qtys[v] = q;
          return { content: q, correct: v === n, value: v, rep: reps[i], className: 'zd-qty-tile', aria: thereAre(v) };
        }));
        let q;
        if (type === 'digit-qty') {
          q = 'Schau dir die Zahl in der Lupe an. Welches Bild zeigt genau so viele?';
        } else {
          q = n === 0 ? 'Wo ist null – also gar nichts?' : n === 1 ? 'Wo siehst du genau eins?' : `Wo siehst du ${nw(n)}? Tippe auf das Bild.`;
        }
        ctx.instruct(q);
        const choiceBox = el('div.choices.zd-qty-choices');
        ctx.stage.appendChild(choiceBox);
        const right = await ctx.choices(items, {
          container: choiceBox,
          shuffle: false,
          hintAfter: 2,
          wrongSay: (item) => thereAre(item.value),
          onWrong: async (item, tile, wrongs) => {
            if (wrongs === 1) {
              if (type === 'digit-qty') {
                const belly = (n === 6 && item.value === 9) || (n === 9 && item.value === 6) ? ' ' + BELLY : '';
                await ctx.say(n === 0 ? 'Das ist die Null. Null heißt: gar nichts.' : `Das ist die ${NW(n)}.${belly} Such das Bild, auf dem genau ${n === 1 ? 'eins ist' : nw(n) + ' sind'}.`);
              } else {
                await ctx.say(n === 0 ? 'Wir suchen null – gar nichts.' : `Wir suchen ${nw(n)}.`);
              }
            } else if (wrongs === 2) {
              const qn = qtys[n];
              if (n === 0) {
                await ctx.say('Schau, hier ist gar nichts. Das ist null.');
              } else {
                await ctx.say(n === 1 ? 'Schau, hier ist genau eins.' : `Schau, hier sind ${nw(n)}. Ich zähle:`);
                await countQty(ctx, qn, n);
              }
            }
          },
          correctSay: (item) => {
            const ph = qtyPhrase(item.rep, n, env);
            if (type === 'digit-qty') return `Richtig! Das ist die ${NW(n)} – ${ph}.`;
            if (n === 0) return 'Richtig! Da ist gar nichts – das ist null.';
            if (n > 10) return `Richtig! Das sind ${nw(n)}: ${ph}.`;
            const verb = n <= 1 || (item.rep === 'twenty' && n === 10) ? 'ist' : 'sind';
            return `Richtig! Das ${verb} ${ph}.`;
          },
        });
        if (right && type === 'hear-qty') prompt.appendChild(el('div.zd-link', lens(n)));
        await ctx.sleep(400);
        return;
      }

      /* ---------- c) Menge sehen → Ziffer wählen ---------- */
      const rep = repsFor(cfg, [n])[0];
      const qty = buildQty(rep, n, env);
      prompt.append(el('div.zd-show', qty));
      const values = Z.numberChoices(n, cfg.digits, cfg.min, cfg.max, digitPrefer(n, ctx.level));
      let q = `Wie viele ${unitWord(rep, env)} sind das? Tippe auf die passende Zahl.`;
      if (rep === 'twenty' && n > 10 && ctx.level === 3) q += ' Tipp: Ein volles Zehnerfeld sind zehn.';
      ctx.instruct(q);
      await ctx.choices(digitItems(values, n), {
        shuffle: false,
        hintAfter: 2,
        sayButton: ctx.level <= 2,
        onWrong: async (item, tile, wrongs) => {
          if (wrongs === 2) {
            await ctx.say(n === 0 ? 'Schau genau: Da ist gar nichts. Das ist null.' : 'Komm, wir zählen zusammen!');
            if (n > 0) await countQty(ctx, qty, n);
          }
        },
        correctSay: () => `Richtig! ${U.cap(qtyPhrase(rep, n, env))} – das ist die ${NW(n)}.`,
      });
      await ctx.sleep(400);
    },
  });
})();
