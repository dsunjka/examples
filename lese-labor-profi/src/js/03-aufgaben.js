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
/** Gespeicherte Anzeige-Reihenfolge prüfen (z. B. nach Import oder geänderten Inhalten). */
function sicherePerm(it, p) {
  const ok = (arr, n) => Array.isArray(arr) && arr.length === n && new Set(arr).size === n && arr.every((v) => Number.isInteger(v) && v >= 0 && v < n);
  const neu = neuePerm(it);
  if (!p || typeof p !== 'object') return neu;
  if (neu.opt && !ok(p.opt, neu.opt.length)) return neu;
  if (neu.gaps && !(Array.isArray(p.gaps) && p.gaps.length === neu.gaps.length && p.gaps.every((g, i) => ok(g, neu.gaps[i].length)))) return neu;
  if (neu.el && !ok(p.el, neu.el.length)) return neu;
  if (neu.reihe && !ok(p.reihe, neu.reihe.length)) return neu;
  return p;
}
/** Gespeicherte Antwort auf die passende Form prüfen; sonst leere Antwort. */
function sichereAntwort(it, a, perm) {
  const leer = leereAntwort(it, perm);
  const idx = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
  try {
    switch (it.typ) {
      case 'single': return a === null || idx(a, it.optionen.length) ? a : leer;
      case 'multi': return Array.isArray(a) && a.every((v) => idx(v, it.optionen.length)) ? Array.from(new Set(a)) : leer;
      case 'matrix': return Array.isArray(a) && a.length === it.aussagen.length && a.every((v) => v === null || v === 0 || v === 1) ? a : leer;
      case 'luecke': { const g = it.teile.filter((t) => t.wahl); return Array.isArray(a) && a.length === g.length && a.every((v, i) => v === null || idx(v, g[i].wahl.length)) ? a : leer; }
      case 'markieren': return Array.isArray(a) && a.every((v) => idx(v, it.teile.length)) ? Array.from(new Set(a)) : leer;
      case 'zuordnen': return Array.isArray(a) && a.length === it.elemente.length && a.every((v) => v === -1 || idx(v, it.gruppen.length)) ? a : leer;
      case 'reihenfolge': { const n = it.reihe.length; return a && Array.isArray(a.ordnung) && a.ordnung.length === n && new Set(a.ordnung).size === n && a.ordnung.every((v) => idx(v, n)) ? { ordnung: a.ordnung, beruehrt: !!a.beruehrt } : leer; }
      case 'eingabe': return typeof a === 'string' ? a.slice(0, 200) : leer;
      default: return leer;
    }
  } catch (e) { return leer; }
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
      return { status: tp > 0 && tp - fp >= Math.ceil(soll.length / 2) ? 'teilweise' : 'falsch', tp, fp, n: soll.length, richtigAnz: tp, gesamt: soll.length };
    }
    case 'matrix': {
      const n = it.aussagen.length, ok = it.aussagen.filter((s, z) => a[z] === (s.richtig ? 0 : 1)).length;
      if (ok === n) return { status: 'richtig', richtigAnz: ok, gesamt: n };
      const ueberall = new Set(a).size === 1; // überall dieselbe Spalte ist Raten
      return { status: !ueberall && n >= 3 && ok >= n - 1 ? 'teilweise' : 'falsch', richtigAnz: ok, gesamt: n };
    }
    case 'luecke': { const g = it.teile.filter((t) => t.wahl); return aus(g.filter((t, i) => a[i] === t.loesung).length, g.length); }
    case 'markieren': {
      const ziele = it.teile.map((t, k) => (t.ziel ? k : -1)).filter((k) => k >= 0);
      const tp = a.filter((k) => ziele.includes(k)).length, fp = a.length - tp;
      if (tp === ziele.length && fp === 0) return { status: 'richtig', tp, fp, n: ziele.length, richtigAnz: tp, gesamt: ziele.length };
      return { status: tp > 0 && tp - fp >= Math.ceil(ziele.length / 2) ? 'teilweise' : 'falsch', tp, fp, n: ziele.length, richtigAnz: tp, gesamt: ziele.length };
    }
    case 'zuordnen': {
      const n = it.elemente.length, ok = it.elemente.filter((e, i) => a[i] === e.g).length;
      if (ok === n) return { status: 'richtig', richtigAnz: ok, gesamt: n };
      const ueberall = new Set(a.filter((g) => g >= 0)).size <= 1; // alles in eine Kiste ist Raten
      return { status: !ueberall && ok >= Math.ceil(n * 0.75) ? 'teilweise' : 'falsch', richtigAnz: ok, gesamt: n };
    }
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
function renderAntwortflaeche(it, a, perm, modus, ui = {}, gesperrt = false) {
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
      // Text in Wörter und Leerräume zerlegen; Lücken und angrenzende Wortteile bilden eine nicht trennbare Gruppe.
      let g = -1;
      const stuecke = [];
      for (const t of it.teile) {
        if (!t.wahl) { for (const s of String(t.t || '').split(/(\s+)/)) if (s) stuecke.push({ leer: /^\s+$/.test(s), html: rich(s) }); continue; }
        g++;
        const gi = g, wert = a ? a[gi] : null, order = (perm && perm.gaps && perm.gaps[gi]) || t.wahl.map((_, i) => i);
        const cls = L ? (wert === t.loesung ? 'ok' : 'nein') : wert == null ? 'leer' : '';
        const sel = `<select class="luecke ${cls}" data-act="lk" data-g="${gi}" aria-label="Lücke ${gi + 1}" ${L ? 'disabled' : ''}><option value="">…</option>${order.map((wi) => `<option value="${wi}" ${wert === wi ? 'selected' : ''}>${esc(t.wahl[wi])}</option>`).join('')}</select>`;
        stuecke.push({ leer: false, luecke: true, html: sel + (L && wert !== t.loesung ? `<span class="luecke-loesung">→ ${esc(t.wahl[t.loesung])}</span>` : '') });
      }
      let html = '', gruppe = [];
      const raus = () => { if (gruppe.length) html += gruppe.some((x) => x.luecke) ? `<span class="wort-gruppe">${gruppe.map((x) => x.html).join('')}</span>` : gruppe.map((x) => x.html).join(''); gruppe = []; };
      for (const s of stuecke) { if (s.leer) { raus(); html += s.html; } else gruppe.push(s); }
      raus();
      return `<p class="luecken-text">${html}</p>`;
    }
    case 'markieren': {
      const sel = new Set(a || []);
      let prev = '';
      const gruppen = [];
      it.teile.forEach((t, k) => {
        const txt = t.t || '';
        const leer = k > 0 && !PUNKT_DAVOR.test(txt) && !KEIN_LEER_DANACH.test(prev);
        prev = txt;
        let html;
        if (t.fix) html = `<span class="fix-teil">${esc(txt)}</span>`;
        else {
          const an = sel.has(k);
          let cls = txt.trim().length <= 1 ? 'tok-zeichen' : '';
          if (L) cls += ' ' + (t.ziel && an ? 'ok' : !t.ziel && an ? 'nein' : t.ziel ? 'fehlt' : '');
          html = `<button type="button" class="tok ${cls}" data-act="tok" data-i="${k}" aria-pressed="${an}">${esc(txt)}</button>`;
        }
        if (k === 0 || leer) gruppen.push([html]); else gruppen[gruppen.length - 1].push(html);
      });
      return `<p class="mark-text">${gruppen.map((g) => (g.length > 1 ? `<span class="mark-gruppe">${g.join('')}</span>` : g[0])).join(' ')}</p>`;
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
        return `<li class="reihe-el ${cls}"><span class="reihe-nr">${k + 1}</span><span class="reihe-text">${rich(it.reihe[ri])}${L && ri !== k ? `<br><span class="reihe-soll">gehört an Platz ${Number(ri) + 1}</span>` : ''}</span>
          <span class="reihe-knoepfe"><button type="button" data-act="hoch" data-k="${k}" aria-label="nach oben" ${k === 0 ? 'disabled' : ''}>▲</button><button type="button" data-act="runter" data-k="${k}" aria-label="nach unten" ${k === o.length - 1 ? 'disabled' : ''}>▼</button></span></li>`;
      }).join('')}</ol>`;
    }
    case 'eingabe': {
      const erg = L ? bewerte(it, a) : null;
      const cls = L ? (erg.status === 'richtig' ? 'ok' : 'nein') : '';
      return `<input class="eingabe ${cls}" type="text" id="eingabe-${esc(it.id)}" data-act="eingabe" value="${esc(a || '')}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Deine Antwort" ${L || gesperrt ? 'readonly' : ''}>
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
