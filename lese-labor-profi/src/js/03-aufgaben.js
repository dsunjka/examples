/* ===== Aufgaben: Darstellung, Eingabe und Auswertung aller Aufgabentypen ===== */
const PUNKT_DAVOR = /^[.,!?;:)\]»“"'…]/;
const KEIN_LEER_DANACH = /[„(«‚\[]$/;

/** Zufällige Anzeigereihenfolge für eine Aufgabe (wird pro Sitzung gemerkt). */
function neuePerm(it) {
  const p = {};
  if (it.typ === 'single' || it.typ === 'multi') p.opt = permutation((it.optionen || []).length);
  if (it.typ === 'luecke') p.gaps = (it.teile || []).filter((t) => t.wahl).map((t) => permutation(t.wahl.length));
  if (it.typ === 'zuordnen') p.el = permutation((it.elemente || []).length);
  if (it.typ === 'reihenfolge') p.reihe = permutation((it.reihe || []).length, true);
  return p;
}
function leereAntwort(it, perm) {
  switch (it.typ) {
    case 'single': return null;
    case 'multi': return [];
    case 'matrix': return (it.aussagen || []).map(() => null);
    case 'luecke': return (it.teile || []).filter((t) => t.wahl).map(() => null);
    case 'markieren': return [];
    case 'zuordnen': return (it.elemente || []).map(() => -1);
    case 'reihenfolge': return { ordnung: (perm && perm.reihe) ? perm.reihe.slice() : (it.reihe || []).map((_, i) => i), beruehrt: false };
    case 'eingabe': return '';
    default: return null;
  }
}
function antwortStand(it, a) {
  if (a == null) return 'leer';
  switch (it.typ) {
    case 'single': return a == null ? 'leer' : 'voll';
    case 'multi': case 'markieren': return a.length ? 'voll' : 'leer';
    case 'matrix': case 'luecke': { const n = a.filter((x) => x != null).length; return n === 0 ? 'leer' : n === a.length ? 'voll' : 'teil'; }
    case 'zuordnen': { const n = a.filter((x) => x >= 0).length; return n === 0 ? 'leer' : n === a.length ? 'voll' : 'teil'; }
    case 'reihenfolge': return a.beruehrt ? 'voll' : 'leer';
    case 'eingabe': return String(a).trim() ? 'voll' : 'leer';
    default: return 'leer';
  }
}
function normEingabe(s) { return String(s || '').replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"').replace(/\s+/g, ' ').trim(); }

/** Auswertung: status richtig | teilweise | falsch | leer */
function bewerte(it, a) {
  const stand = antwortStand(it, a);
  if (stand === 'leer') return { status: 'leer', richtigAnz: 0, gesamt: 1 };
  const aus = (ok, n, extra = {}) => ({ status: ok === n ? 'richtig' : ok >= Math.ceil(n / 2) && ok > 0 ? 'teilweise' : 'falsch', richtigAnz: ok, gesamt: n, ...extra });
  switch (it.typ) {
    case 'single': return { status: it.optionen[a] && it.optionen[a].richtig ? 'richtig' : 'falsch', richtigAnz: 0, gesamt: 1 };
    case 'multi': {
      const soll = it.optionen.map((o, i) => (o.richtig ? i : -1)).filter((i) => i >= 0);
      const tp = a.filter((i) => soll.includes(i)).length, fp = a.length - tp;
      if (tp === soll.length && fp === 0) return { status: 'richtig', tp, fp, n: soll.length, richtigAnz: tp, gesamt: soll.length };
      return { status: tp > 0 && tp - fp >= 1 ? 'teilweise' : 'falsch', tp, fp, n: soll.length, richtigAnz: tp, gesamt: soll.length };
    }
    case 'matrix': return aus(it.aussagen.filter((s, z) => a[z] === (s.richtig ? 0 : 1)).length, it.aussagen.length);
    case 'luecke': { const g = it.teile.filter((t) => t.wahl); return aus(g.filter((t, i) => a[i] === t.loesung).length, g.length); }
    case 'markieren': {
      const ziele = it.teile.map((t, k) => (t.ziel ? k : -1)).filter((k) => k >= 0);
      const tp = a.filter((k) => ziele.includes(k)).length, fp = a.length - tp;
      if (tp === ziele.length && fp === 0) return { status: 'richtig', tp, fp, n: ziele.length, richtigAnz: tp, gesamt: ziele.length };
      return { status: tp > 0 && tp - fp >= Math.ceil(ziele.length / 2) ? 'teilweise' : 'falsch', tp, fp, n: ziele.length, richtigAnz: tp, gesamt: ziele.length };
    }
    case 'zuordnen': return aus(it.elemente.filter((e, i) => a[i] === e.g).length, it.elemente.length);
    case 'reihenfolge': return aus(a.ordnung.filter((v, i) => v === i).length, a.ordnung.length);
    case 'eingabe': {
      const g = normEingabe(a), loes = (it.loesungen || []).map(normEingabe);
      if (loes.includes(g)) return { status: 'richtig', richtigAnz: 1, gesamt: 1 };
      if (loes.some((l) => l.toLowerCase() === g.toLowerCase())) return { status: 'teilweise', richtigAnz: 0, gesamt: 1, gross: true };
      return { status: 'falsch', richtigAnz: 0, gesamt: 1 };
    }
    default: return { status: 'falsch', richtigAnz: 0, gesamt: 1 };
  }
}

/** Neue Antwort aus einer Aktion berechnen (reine Funktion). */
function aendereAntwort(it, a, act, ds, ui) {
  switch (act) {
    case 'opt': {
      const i = Number(ds.i);
      if (it.typ === 'single') return a === i ? null : i;
      return a.includes(i) ? a.filter((x) => x !== i) : a.concat(i);
    }
    case 'mx': { const n = a.slice(); const z = Number(ds.z), s = Number(ds.s); n[z] = n[z] === s ? null : s; return n; }
    case 'lk': { const n = a.slice(); n[Number(ds.g)] = ds.wert === '' ? null : Number(ds.wert); return n; }
    case 'tok': { const k = Number(ds.i); return a.includes(k) ? a.filter((x) => x !== k) : a.concat(k); }
    case 'chip': {
      const i = Number(ds.i);
      // Ein anderes Kärtchen ist ausgewählt und das angetippte liegt schon in einer Kiste: dorthin einsortieren.
      if (ui.chip != null && ui.chip !== i && a[i] >= 0) { const n = a.slice(); n[ui.chip] = a[i]; ui.chip = null; return n; }
      ui.chip = ui.chip === i ? null : i; return a;
    }
    case 'gruppe': {
      if (ui.chip == null) return a;
      const n = a.slice(); n[ui.chip] = Number(ds.g); ui.chip = null; return n;
    }
    case 'pool': {
      if (ui.chip == null) return a;
      const n = a.slice(); n[ui.chip] = -1; ui.chip = null; return n;
    }
    case 'hoch': case 'runter': {
      const k = Number(ds.k), o = a.ordnung.slice(), z = act === 'hoch' ? k - 1 : k + 1;
      if (z < 0 || z >= o.length) return a;
      [o[k], o[z]] = [o[z], o[k]];
      return { ordnung: o, beruehrt: true };
    }
    case 'eingabe': return ds.wert;
    default: return a;
  }
}

/** HTML der Antwortfläche. modus: 'edit' | 'loesung' */
function renderAntwortflaeche(it, a, perm, modus, ui = {}) {
  const L = modus === 'loesung';
  switch (it.typ) {
    case 'single': case 'multi': {
      const multi = it.typ === 'multi';
      const sel = new Set(multi ? a || [] : a == null ? [] : [a]);
      const order = (perm && perm.opt) || it.optionen.map((_, i) => i);
      return `<div class="optionen ${multi ? 'mehrfach' : ''}">${order.map((oi, k) => {
        const o = it.optionen[oi], an = sel.has(oi);
        let cls = '', st = '', sr = '';
        if (L) {
          if (o.richtig && an) { cls = 'ok'; st = '✓'; sr = 'richtig gewählt'; }
          else if (!o.richtig && an) { cls = 'nein'; st = '✗'; sr = 'falsch gewählt'; }
          else if (o.richtig) { cls = 'fehlt'; st = '✓'; sr = 'wäre richtig gewesen'; }
        }
        return `<button type="button" class="opt ${cls}" data-act="opt" data-i="${oi}" aria-pressed="${an}"><span class="opt-marke">${String.fromCharCode(65 + k)}</span><span class="opt-text">${rich(o.text)}${sr ? `<span class="unsichtbar"> (${sr})</span>` : ''}</span><span class="opt-status" aria-hidden="true">${st}</span></button>`;
      }).join('')}</div>`;
    }
    case 'matrix': {
      const sp = it.spalten && it.spalten.length === 2 ? it.spalten : ['richtig', 'falsch'];
      return `<div class="matrix">${it.aussagen.map((s, z) => {
        const v = a ? a[z] : null, soll = s.richtig ? 0 : 1;
        const cls = L ? (v === soll ? 'ok' : 'nein') : '';
        return `<div class="matrix-zeile ${cls}"><div><p>${rich(s.text)}</p>${L && v !== soll ? `<div class="mx-loesung">Richtig ist: ${esc(sp[soll])}</div>` : ''}</div>
          <div class="matrix-wahl" role="group" aria-label="Aussage ${z + 1}">${[0, 1].map((x) => `<button type="button" class="mx-knopf" data-act="mx" data-z="${z}" data-s="${x}" aria-pressed="${v === x}">${esc(sp[x])}</button>`).join('')}</div></div>`;
      }).join('')}</div>`;
    }
    case 'luecke': {
      let g = -1;
      return `<p class="luecken-text">${it.teile.map((t) => {
        if (!t.wahl) return rich(t.t || '');
        g++;
        const gi = g, wert = a ? a[gi] : null, order = (perm && perm.gaps && perm.gaps[gi]) || t.wahl.map((_, i) => i);
        const cls = L ? (wert === t.loesung ? 'ok' : 'nein') : wert == null ? 'leer' : '';
        const sel = `<select class="luecke ${cls}" data-act="lk" data-g="${gi}" aria-label="Lücke ${gi + 1}" ${L ? 'disabled' : ''}><option value="">…</option>${order.map((wi) => `<option value="${wi}" ${wert === wi ? 'selected' : ''}>${esc(t.wahl[wi])}</option>`).join('')}</select>`;
        return sel + (L && wert !== t.loesung ? `<span class="luecke-loesung">→ ${esc(t.wahl[t.loesung])}</span>` : '');
      }).join('')}</p>`;
    }
    case 'markieren': {
      const sel = new Set(a || []);
      let prev = '';
      return `<p class="mark-text">${it.teile.map((t, k) => {
        const txt = t.t || '';
        const leer = k > 0 && !PUNKT_DAVOR.test(txt) && !KEIN_LEER_DANACH.test(prev) ? ' ' : '';
        prev = txt;
        if (t.fix) return `${leer}<span class="fix-teil">${esc(txt)}</span>`;
        const an = sel.has(k);
        let cls = '';
        if (L) cls = t.ziel && an ? 'ok' : !t.ziel && an ? 'nein' : t.ziel ? 'fehlt' : '';
        return `${leer}<button type="button" class="tok ${cls}" data-act="tok" data-i="${k}" aria-pressed="${an}">${esc(txt)}</button>`;
      }).join('')}</p>`;
    }
    case 'zuordnen': {
      const order = (perm && perm.el) || it.elemente.map((_, i) => i);
      const chip = (ei) => {
        const e = it.elemente[ei], g = a ? a[ei] : -1;
        let cls = ui.chip === ei ? 'aktiv' : '', soll = '';
        if (L) { cls = g === e.g ? 'ok' : 'nein'; if (g !== e.g) soll = `<span class="soll">→ ${esc(it.gruppen[e.g])}</span>`; }
        return `<button type="button" class="chip ${cls}" data-act="chip" data-i="${ei}" aria-pressed="${ui.chip === ei}">${esc(e.t)}${soll}</button>`;
      };
      const pool = order.filter((ei) => !(a && a[ei] >= 0));
      return `<div class="zu-pool" data-act="pool" aria-label="Noch nicht einsortiert">${pool.map(chip).join('')}</div>
        <div class="zu-gruppen">${it.gruppen.map((gname, gi) => `<div class="zu-gruppe ${ui.chip != null && !L ? 'ziel-bereit' : ''}" data-act="gruppe" data-g="${gi}" role="button" tabindex="0" aria-label="Kiste ${esc(gname)}"><h4>${esc(gname)}</h4><div class="zu-inhalt">${order.filter((ei) => a && a[ei] === gi).map(chip).join('')}</div></div>`).join('')}</div>`;
    }
    case 'reihenfolge': {
      const o = a ? a.ordnung : it.reihe.map((_, i) => i);
      return `<ol class="reihe">${o.map((ri, k) => {
        const cls = L ? (ri === k ? 'ok' : 'nein') : '';
        return `<li class="reihe-el ${cls}"><span class="reihe-nr">${k + 1}</span><span class="reihe-text">${rich(it.reihe[ri])}${L && ri !== k ? `<br><span class="reihe-soll">gehört an Platz ${ri + 1}</span>` : ''}</span>
          <span class="reihe-knoepfe"><button type="button" data-act="hoch" data-k="${k}" aria-label="nach oben" ${k === 0 ? 'disabled' : ''}>▲</button><button type="button" data-act="runter" data-k="${k}" aria-label="nach unten" ${k === o.length - 1 ? 'disabled' : ''}>▼</button></span></li>`;
      }).join('')}</ol>`;
    }
    case 'eingabe': {
      const erg = L ? bewerte(it, a) : null;
      const cls = L ? (erg.status === 'richtig' ? 'ok' : 'nein') : '';
      return `<input class="eingabe ${cls}" type="text" id="eingabe-${esc(it.id)}" data-act="eingabe" value="${esc(a || '')}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Deine Antwort" ${L ? 'readonly' : ''}>
        ${L && erg.status !== 'richtig' ? `<p class="mx-loesung">Richtig ist: ${esc((it.loesungen || [])[0] || '')}</p>` : ''}`;
    }
    default: return '<p>Unbekannter Aufgabentyp.</p>';
  }
}

const LOB = ['Richtig – stark gelesen!', 'Super, das stimmt!', 'Genau so! Prima.', 'Volltreffer!', 'Richtig! Du bist ein echter Profi.', 'Stimmt – sehr genau gearbeitet!'];
function rueckmeldung(it, erg, { versuch = 1, zeigeLoesung = false } = {}) {
  if (erg.status === 'richtig') return { cls: 'r', titel: LOB[Math.floor(Math.random() * LOB.length)], text: '' };
  let text = '';
  if (erg.gross) text = 'Fast! Achte auf die Groß- und Kleinschreibung.';
  else if (erg.status === 'teilweise') {
    if (it.typ === 'multi' || it.typ === 'markieren') text = `Du hast ${erg.tp} von ${erg.n} richtigen gefunden${erg.fp ? `, aber auch ${plural(erg.fp, 'falsche', 'falsche')} gewählt` : ''}.`;
    else text = `${erg.richtigAnz} von ${erg.gesamt} sind richtig.`;
  } else if (it.typ === 'multi') text = 'Lies noch einmal genau. Denk daran: Mehrere Antworten sind richtig.';
  else text = 'Lies noch einmal genau nach.';
  if (!zeigeLoesung && versuch < 2) text += ' Du hast noch einen Versuch.';
  return { cls: erg.status === 'teilweise' ? 't' : 'f', titel: erg.status === 'teilweise' ? 'Fast!' : 'Das stimmt noch nicht.', text };
}
function stufeHTML(n) { return `<span class="stufe" title="Schwierigkeit ${n} von 3" aria-label="Schwierigkeit ${n} von 3">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'voll' : ''}"></i>`).join('')}</span>`; }
