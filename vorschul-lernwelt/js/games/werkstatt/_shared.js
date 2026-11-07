/* ==========================================================================
   Malwerkstatt – gemeinsame Helfer der Spielgruppe 'werkstatt'
   (nachspuren, punkte-verbinden, ausmalen)

   Didaktischer Hintergrund der Gruppe: Feinmotorik und Graphomotorik.
   Alle Zeichenflächen sind Vektor-SVGs (scharf bei jedem devicePixelRatio,
   frei skalierbar) und werden mit Pointer Events bedient – Finger, Stift
   und Maus funktionieren gleich. touch-action: none verhindert, dass der
   Browser beim Malen scrollt oder zoomt.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const NS = 'http://www.w3.org/2000/svg';

  const W = (LT.werk = {});

  /** SVG-Element erzeugen: W.svg('circle', { cx: 5, cy: 5, r: 2 }, kinder…) */
  W.svg = function (tag, attrs, ...children) {
    const n = document.createElementNS(NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') n.setAttribute('class', v);
        else if (k === 'text') n.textContent = v;
        else n.setAttribute(k, v);
      }
    }
    for (const c of children.flat()) if (c) n.appendChild(c);
    return n;
  };

  /** Bildschirm-Koordinaten eines Pointer-Events in das Koordinatensystem des SVG umrechnen. */
  W.toLocal = function (svg, ev) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  };

  W.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /** Punktliste [{x,y}] → SVG-Pfad „M … L …“ */
  W.pathD = function (pts) {
    if (!pts.length) return '';
    return pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  };

  /** Polylinie gleichmäßig neu abtasten (Abstand step) – für Kontrollpunkte und Animationen. */
  W.resample = function (pts, step) {
    if (pts.length < 2) return pts.map((p) => ({ x: p.x, y: p.y }));
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const len = W.dist(a, b);
      if (len === 0) continue;
      let t = step - carry;
      while (t <= len) {
        out.push({ x: a.x + ((b.x - a.x) * t) / len, y: a.y + ((b.y - a.y) * t) / len });
        t += step;
      }
      carry = len - (t - step);
    }
    const last = pts[pts.length - 1];
    if (W.dist(out[out.length - 1], last) > step * 0.35) out.push({ x: last.x, y: last.y });
    else out[out.length - 1] = { x: last.x, y: last.y };
    return out;
  };

  /** Länge einer Polylinie. */
  W.length = function (pts) {
    let s = 0;
    for (let i = 1; i < pts.length; i++) s += W.dist(pts[i - 1], pts[i]);
    return s;
  };

  /**
   * Quadratische Zeichenfläche responsiv einpassen: Das SVG bekommt die größte
   * quadratische (bzw. im Seitenverhältnis ratio = Breite/Höhe passende) Größe,
   * die in den Wrapper passt. Wird bei Größenänderung neu berechnet.
   */
  W.fit = function (ctx, wrap, node, ratio = 1, maxPx = 900) {
    const apply = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      let bw = Math.min(w, h * ratio, maxPx * ratio);
      let bh = bw / ratio;
      node.style.width = Math.floor(bw) + 'px';
      node.style.height = Math.floor(bh) + 'px';
    };
    apply();
    requestAnimationFrame(apply);
    ctx.listen(window, 'resize', apply);
    return apply;
  };

  /** Kleiner Ton-Akkord für Zwischenerfolge (ohne Sprachausgabe). */
  W.blip = function (step = 0) {
    LT.sfx.tone(520 + step * 40, 0.09, { type: 'triangle', volume: 0.3 });
  };

  /** Pausierbares „Vormachen“: ein Element entlang Punkten bewegen. */
  W.animateAlong = async function (ctx, node, pts, msPerStep = 28) {
    for (let i = 0; i < pts.length; i++) {
      if (!ctx.active || !node.isConnected) return;
      node.setAttribute('transform', `translate(${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)})`);
      await ctx.sleep(msPerStep);
    }
  };

  W.U = U;
})();
