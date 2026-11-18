/* ==========================================================================
   js/world3d/islands/deutsch1.js – Leseschule (Klasse 1, dunkelviolett)

   Wahrzeichen: die Bücherei – ein Haus aus drei riesigen, gestapelten
   Büchern (Tür und Fenster im Buchrücken), als Dach ein aufgeschlagenes
   Buch, das kopfüber auf dem Stapel liegt („Bücherei“ auf dem Einband,
   rotes Lesezeichen). Auf dem Dachfirst sitzt die Lese-Eule mit Brille und
   schaut sich um.
   Davor das Silbenbogen-Tor: drei Bögen in den Silbenfarben Blau/Rot mit
   den Silben „Bü · che · rei“ – der Weg vom Strand führt hindurch.
   Dazu der Buchstaben-Zug (Lok + Wagen mit Z · u · g), der auf seinem
   Schienenoval fährt und dampft, eine Schultafel mit dem Kreide-Wort
   „Lesen“ samt Silbenbögen, eine Lesebank mit aufgeschlagenem Buch, eine
   Litfaßsäule mit Leseplakaten (A a · Ei), Bücherstapel, Bäume und Blumen.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'deutsch1', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#5f3dc4';
    const ACC_L = kit.shade(ACC, 1.45);
    const ACC_D = kit.shade(ACC, 0.72);
    const PAGE = '#fff8ea';
    const SYL_BLUE = '#2f7fe8', SYL_RED = '#ef3f4a';
    const NAVY = '#2b2f55';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];
    const merge = T.addons.mergeGeometries;

    const base = kit.islandBase({ seed: 211, radius: 6.1, grassRadius: 4.75, grass: '#86d65e', stones: 4, segments: 30 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* ------------------------------------------------------------------
       Beschriftungs-Atlas: Tafel, Silben, Zug-Buchstaben, Plakate und
       Buchseiten in EINER Textur (ein Draw-Call für alles Statische).
       Lese-Inhalte in Andika, Schilder in Fredoka.
       ------------------------------------------------------------------ */
    function atlas(items, AW, AH) {
      const rects = {};
      let x = 0, y = 0, rowH = 0;
      const PAD = 6;
      items.forEach((it) => {
        if (x + it.w + PAD * 2 > AW) { x = 0; y += rowH; rowH = 0; }
        rects[it.key] = { x: x + PAD, y: y + PAD, w: it.w, h: it.h, draw: it.draw };
        x += it.w + PAD * 2;
        rowH = Math.max(rowH, it.h + PAD * 2);
      });
      const tex = kit.canvasTexture(AW, AH, (c) => {
        for (const k in rects) {
          const r = rects[k];
          c.save();
          c.translate(r.x, r.y);
          r.draw(c, r.w, r.h);
          c.restore();
        }
      });
      const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      mat.name = 'deutsch1-atlas';
      const remap = (q, key) => {
        const r = rects[key];
        const uv = q.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          const u = uv.getX(i), v = uv.getY(i);
          uv.setXY(i, (r.x + u * r.w) / AW, 1 - (r.y + (1 - v) * r.h) / AH);
        }
        return q;
      };
      return {
        mat,
        remap,
        /** Viereck (Normale +z, Breite w) mit dem Bild des Eintrags key */
        quad(key, w) { const r = rects[key]; return remap(new T.PlaneGeometry(w, (w * r.h) / r.w), key); },
      };
    }
    const label = (text, { font = kit.fonts.read, color = '#ffffff', shadow = 'rgba(0,0,0,0.3)', k = 0.74, weight = 700 } = {}) => (c, w, h) => {
      let px = Math.round(h * k);
      c.font = `${weight} ${px}px ${font}`;
      const tw = c.measureText(text).width;
      if (tw > w * 0.9) { px = Math.floor((px * w * 0.9) / tw); c.font = `${weight} ${px}px ${font}`; }
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (shadow) { c.fillStyle = shadow; c.fillText(text, w / 2 + px * 0.035, h / 2 + px * 0.09); }
      c.fillStyle = color;
      c.fillText(text, w / 2, h / 2 + px * 0.04);
    };
    const rrect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
    /** Schultafel: Kreide-Wort „Lesen“ mit Silbenbögen (blau/rot) und kleiner Kreide-Sonne */
    const chalkBoard = (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#3a7262'); gr.addColorStop(1, '#2b5a4c');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      // Wischspuren
      c.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(w * (0.1 + i * 0.16), h * (0.25 + (i % 2) * 0.5), w * 0.13, h * 0.09, 0.25, 0, TAU); c.fill(); }
      const px = Math.round(h * 0.4);
      c.font = `700 ${px}px ${kit.fonts.read}`;
      c.textAlign = 'left';
      c.textBaseline = 'alphabetic';
      const s1 = 'Le', s2 = 'sen';
      const w1 = c.measureText(s1).width, w2 = c.measureText(s2).width, gap = px * 0.12;
      const x0 = (w - (w1 + gap + w2)) / 2 + w * 0.04, yB = h * 0.58;
      c.fillStyle = 'rgba(255,255,255,0.94)';
      c.fillText(s1, x0, yB);
      c.fillText(s2, x0 + w1 + gap, yB);
      // Kreide-Körnung (in Tafelfarbe über die Schrift getupft)
      const r = kit.rng(5);
      c.fillStyle = 'rgba(48,100,86,0.55)';
      for (let i = 0; i < 260; i++) c.fillRect(x0 + r() * (w1 + gap + w2), yB - px * 0.75 + r() * px * 0.8, 2, 2);
      // Silbenbögen
      c.lineWidth = px * 0.075;
      c.lineCap = 'round';
      const arc = (x, ww, col) => { c.strokeStyle = col; c.beginPath(); c.moveTo(x + ww * 0.04, yB + px * 0.16); c.quadraticCurveTo(x + ww / 2, yB + px * 0.62, x + ww * 0.96, yB + px * 0.16); c.stroke(); };
      arc(x0, w1, '#9cc8ff');
      arc(x0 + w1 + gap, w2, '#ff9f9f');
      // Kreide-Sonne oben links, Sternchen oben rechts
      c.strokeStyle = 'rgba(255,236,150,0.95)';
      c.lineWidth = 5;
      c.beginPath(); c.arc(w * 0.1, h * 0.2, h * 0.07, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        c.beginPath(); c.moveTo(w * 0.1 + Math.cos(a) * h * 0.1, h * 0.2 + Math.sin(a) * h * 0.1); c.lineTo(w * 0.1 + Math.cos(a) * h * 0.14, h * 0.2 + Math.sin(a) * h * 0.14); c.stroke();
      }
      c.strokeStyle = 'rgba(255,190,220,0.9)';
      c.beginPath();
      for (let i = 0; i <= 10; i++) { const a = -PI / 2 + (i / 10) * TAU, rr = i % 2 ? h * 0.035 : h * 0.08; c.lineTo(w * 0.9 + Math.cos(a) * rr, h * 0.2 + Math.sin(a) * rr); }
      c.stroke();
    };
    /** Plakat für die Litfaßsäule: Wort/Buchstaben + Bild */
    const poster = (text, bg, pic) => (c, w, h) => {
      c.fillStyle = bg; rrect(c, 0, 0, w, h, 10); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.22)'; rrect(c, 8, 8, w - 16, h * 0.12, 6); c.fill();
      c.fillStyle = '#fffaf0'; rrect(c, 12, h * 0.52, w - 24, h * 0.4, 12); c.fill();
      pic(c, w / 2, h * 0.72, h * 0.15);
      label(text, { k: 0.62 })(c, w, h * 0.52);
    };
    /** Einband des Dach-Buchs: goldener Doppelrahmen, Eck-Rauten, Titel */
    const coverArt = (c, w, h) => {
      c.strokeStyle = '#ffd43b';
      c.lineWidth = 8; rrect(c, 12, 12, w - 24, h - 24, 26); c.stroke();
      c.lineWidth = 3; rrect(c, 30, 30, w - 60, h - 60, 14); c.stroke();
      c.fillStyle = '#ffd43b';
      [[30, 30], [w - 30, 30], [30, h - 30], [w - 30, h - 30]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 13); c.lineTo(x + 13, y); c.lineTo(x, y + 13); c.lineTo(x - 13, y); c.closePath(); c.fill(); });
      c.fillRect(w * 0.3, h * 0.72, w * 0.4, 4);
      [0.24, 0.76].forEach((f) => { c.beginPath(); c.arc(w * f, h * 0.72 + 2, 7, 0, TAU); c.fill(); });
      label('Bücherei', { font: kit.fonts.num, weight: 600, k: 0.62, shadow: 'rgba(30,10,70,0.45)' })(c, w, h * 0.62);
    };
    const pages = (c, w, h) => {
      c.fillStyle = '#fffdf6'; rrect(c, 0, 0, w, h, 8); c.fill();
      c.fillStyle = 'rgba(120,90,60,0.25)'; c.fillRect(w / 2 - 2, 4, 4, h - 8);
      c.fillStyle = 'rgba(70,60,110,0.55)';
      for (let s = 0; s < 2; s++) for (let i = 0; i < 6; i++) c.fillRect(s * w / 2 + 14, 16 + i * ((h - 30) / 6), (w / 2 - 28) * (i === 5 ? 0.55 : 1), 6);
    };
    const A = atlas([
      { key: 'board', w: 512, h: 300, draw: chalkBoard },
      { key: 'title', w: 460, h: 250, draw: coverArt },
      { key: 'Bü', w: 160, h: 112, draw: label('Bü') },
      { key: 'che', w: 160, h: 112, draw: label('che') },
      { key: 'rei', w: 160, h: 112, draw: label('rei') },
      { key: 'Z', w: 100, h: 100, draw: label('Z', { k: 0.8 }) },
      { key: 'u', w: 100, h: 100, draw: label('u', { k: 0.8 }) },
      { key: 'g', w: 100, h: 100, draw: label('g', { k: 0.8 }) },
      { key: 'abc', w: 180, h: 80, draw: label('ABC', { color: '#ffe066', shadow: 'rgba(0,0,0,0.25)', k: 0.7 }) },
      { key: 'pA', w: 140, h: 190, draw: poster('A a', ACC, (c, x, y, r) => { c.fillStyle = '#ff5a5f'; c.beginPath(); c.arc(x, y + r * 0.15, r * 0.85, 0, TAU); c.fill(); c.fillStyle = '#5cb85c'; c.beginPath(); c.ellipse(x + r * 0.25, y - r * 0.8, r * 0.32, r * 0.16, -0.5, 0, TAU); c.fill(); c.fillStyle = '#7a4a2a'; c.fillRect(x - 3, y - r * 0.95, 6, r * 0.4); }) },
      { key: 'pE', w: 140, h: 190, draw: poster('Ei', '#f08c00', (c, x, y, r) => { c.fillStyle = '#fff3c4'; c.beginPath(); c.ellipse(x, y + r * 0.05, r * 0.72, r * 0.95, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(160,110,40,0.35)'; c.lineWidth = 3; c.stroke(); }) },
      { key: 'pages', w: 200, h: 130, draw: pages },
    ], 1024, 768);
    const textQuads = [];
    /** Beschriftung im lokalen Raum einer Gruppe vormerken … */
    function text(grp, key, w, pos, rot) {
      (grp.userData.texts || (grp.userData.texts = [])).push([key, w, pos, rot]);
    }
    /** … und nach dem Aufstellen in Inselkoordinaten übernehmen (ein Mesh für alle) */
    function bake(grp) {
      grp.updateMatrix();
      (grp.userData.texts || []).forEach(([key, w, pos, rot]) => {
        const q = xf(A.quad(key, w), pos, rot);
        q.applyMatrix4(grp.matrix);
        textQuads.push(q);
      });
      delete grp.userData.texts;
    }

    /* ------------------------------------------------------------------
       Bausteine: liegendes Buch, Fenster
       ------------------------------------------------------------------ */
    /**
     * Liegendes Buch (Rücken nach +z, Unterkante y = 0) in P, verschoben nach pos
     * und um ry gedreht. Gibt put(geo, farbe, opts) für Anbauten im Buch-Raum zurück.
     */
    function book(P, w, h, d, cover, pos, ry, o = {}) {
      const put = (q, color, opts) => P.add(xf(q, pos, [0, ry, 0]), color, opts || {});
      const ct = Math.min(0.08, h * 0.15);
      put(xf(geo.roundBox(w, ct, d, ct * 0.45, 1), [0, ct / 2, 0]), cover, { grad: [0.78, 1.0] });
      put(xf(geo.roundBox(w, ct, d, ct * 0.45, 1), [0, h - ct / 2, 0]), cover, { grad: [0.98, 1.1] });
      put(xf(geo.box(w - 0.12, h - ct * 2 + 0.01, d - 0.1), [0, h / 2, -0.04]), o.page || PAGE, { grad: [0.9, 1.02] });
      const sr = Math.min(0.12, h * 0.4);
      put(xf(geo.roundBox(w + 0.004, h, sr * 2.2, sr * 0.9, 1), [0, h / 2, d / 2 - sr]), cover, { grad: [0.82, 1.06] });
      if (o.lines !== false && h > 0.3) {
        // Papierkanten an den Seiten
        [0.36, 0.64].forEach((f) => put(xf(geo.box(0.006, 0.014, d - 0.2), [(w - 0.12) / 2 + 0.003, h * f, -0.06]), '#e8d6b4', { grad: [1, 1] }));
      }
      if (o.bands !== false) [-1, 1].forEach((s) => put(xf(geo.box(0.07, h + 0.012, 0.03), [s * (w / 2 - 0.2), h / 2, d / 2 + 0.012 * sr / 0.12]), C.gold, { gloss: true, grad: [0.85, 1.1] }));
      return put;
    }
    /** Fenster (Rahmen, Glas leuchtet nachts, Sprossen) im Raum von put, Normale +z */
    function windowRect(put, P, pos, ry, x, y, z, w, h, frame = '#ffffff') {
      put(xf(geo.roundBox(w + 0.1, h + 0.1, 0.06, 0.03, 1), [x, y, z]), frame, { grad: [0.9, 1.02] });
      P.addRaw(kit.paint(xf(xf(geo.box(w - 0.02, h - 0.02, 0.05), [x, y, z + 0.015]), pos, [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      put(xf(geo.box(0.035, h - 0.02, 0.06), [x, y, z + 0.03]), frame, {});
      put(xf(geo.box(w - 0.02, 0.035, 0.06), [x, y, z + 0.03]), frame, {});
    }
    function windowRound(put, P, pos, ry, x, y, z, r, frame = '#ffffff') {
      put(xf(new T.TorusGeometry(r, 0.04, 3, 10), [x, y, z]), frame, { grad: [0.9, 1.02] });
      P.addRaw(kit.paint(xf(xf(new T.CircleGeometry(r * 0.98, 10), [x, y, z - 0.005]), pos, [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      put(xf(geo.box(0.03, r * 2, 0.04), [x, y, z + 0.01]), frame, {});
      put(xf(geo.box(r * 2, 0.03, 0.04), [x, y, z + 0.01]), frame, {});
    }

    /* ------------------------------------------------------------------
       Bücherei: drei gestapelte Riesenbücher, Dach = aufgeschlagenes Buch
       ------------------------------------------------------------------ */
    const LIB = { x: 0.15, z: -2.05 };
    let owlTop = null;
    function library() {
      const grp = new T.Group();
      grp.name = 'buecherei';
      const P = new kit.Parts();
      const pl = 0.16;
      P.add(xf(geo.roundBox(2.95, pl, 2.2, 0.05, 1), [0, pl / 2, 0]), C.stone, { grad: [0.75, 1] });
      // unten: großes violettes Buch mit Tür und Rundfenstern
      const b1 = { w: 2.7, h: 0.86, d: 2.0 };
      const p1 = [0, pl, 0];
      const put1 = book(P, b1.w, b1.h, b1.d, ACC, p1, 0);
      const fz1 = b1.d / 2 + 0.02;
      // Tür (Rundbogen) mit Rahmen
      put1(xf(geo.roundBox(0.58, 0.5, 0.05, 0.03, 1), [0, 0.27, fz1]), '#fff1dc', {});
      put1(xf(geo.cyl(0.29, 0.29, 0.05, 12).rotateX(PI / 2), [0, 0.52, fz1]), '#fff1dc', {});
      put1(xf(geo.roundBox(0.46, 0.46, 0.06, 0.03, 1), [0, 0.25, fz1 + 0.02]), '#9a5a32', { grad: [0.8, 1.05] });
      put1(xf(geo.cyl(0.23, 0.23, 0.06, 12).rotateX(PI / 2), [0, 0.48, fz1 + 0.02]), '#9a5a32', {});
      put1(xf(geo.box(0.025, 0.66, 0.07), [0, 0.33, fz1 + 0.03]), '#6d3b1f', {});
      [-1, 1].forEach((s) => put1(xf(new T.IcosahedronGeometry(0.03, 0), [s * 0.07, 0.3, fz1 + 0.07]), C.gold, { gloss: true }));
      windowRound(put1, P, p1, 0, -0.82, 0.44, fz1 + 0.01, 0.17);
      windowRound(put1, P, p1, 0, 0.82, 0.44, fz1 + 0.01, 0.17);
      // Stufe vor der Tür
      P.add(xf(geo.roundBox(0.9, 0.1, 0.4, 0.03, 1), [0, 0.05, b1.d / 2 + 0.28]), C.stone, {});
      // Mitte: gelbes Buch, drei Fenster
      const b2 = { w: 2.45, h: 0.74, d: 1.86 };
      const p2 = [0.06, pl + b1.h, -0.03], r2 = 0.07;
      const put2 = book(P, b2.w, b2.h, b2.d, '#ffb21e', p2, r2);
      [-0.72, 0, 0.72].forEach((x) => windowRect(put2, P, p2, r2, x, 0.38, b2.d / 2 + 0.02, 0.36, 0.38));
      [-0.72, 0.72].forEach((x) => {
        put2(xf(geo.roundBox(0.48, 0.1, 0.14, 0.03, 1), [x, 0.13, b2.d / 2 + 0.08]), '#2fa36b', { grad: [0.8, 1.05] });
        put2(xf(geo.box(0.4, 0.06, 0.08), [x, 0.2, b2.d / 2 + 0.1]), '#ff8fb8', { grad: [0.9, 1.05], jitter: 0.08 });
      });
      // oben: türkises Buch mit „ABC“ auf dem Rücken
      const b3 = { w: 2.25, h: 0.62, d: 1.76 };
      const p3 = [-0.04, pl + b1.h + b2.h, 0.02], r3 = -0.05;
      const put3 = book(P, b3.w, b3.h, b3.d, '#12b886', p3, r3);
      windowRound(put3, P, p3, r3, -0.72, 0.31, b3.d / 2 + 0.02, 0.15);
      windowRound(put3, P, p3, r3, 0.72, 0.31, b3.d / 2 + 0.02, 0.15);
      const abcPos = new T.Vector3(0, 0.31, b3.d / 2 + 0.035).applyAxisAngle(new T.Vector3(0, 1, 0), r3).add(new T.Vector3(p3[0], p3[1], p3[2]));
      text(grp, 'abc', 0.62, abcPos.toArray(), [0, r3, 0]);
      // Dach: aufgeschlagenes Buch, kopfüber (First entlang x)
      const y0 = pl + b1.h + b2.h + b3.h + 0.01;
      const Wr = 2.62, hd = 1.14, rise = 0.8, ct = 0.09;
      const ang = Math.atan2(rise, hd);
      const Lc = Math.hypot(hd, rise) + 0.14;
      const sn = Math.sin(ang), cs = Math.cos(ang);
      const coverC = (s) => [0, y0 + rise / 2 - sn * 0.07 + cs * ct / 2, s * (hd / 2 + cs * 0.07 + sn * ct / 2)];
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(Wr, ct, Lc, 0.04, 1), coverC(s), [s * ang, 0, 0]), ACC, { grad: [0.86, 1.12] }));
      // Seiten unter dem Einband (Keil) + Papier-Fächer an den Giebeln
      const tri = new T.Shape();
      tri.moveTo(-hd + 0.05, 0); tri.lineTo(hd - 0.05, 0); tri.lineTo(0, rise - 0.03); tri.closePath();
      const wedge = new T.ExtrudeGeometry(tri, { depth: Wr - 0.16, bevelEnabled: false });
      wedge.translate(0, 0, -(Wr - 0.16) / 2).rotateY(PI / 2).translate(0, y0, 0);
      P.add(wedge, PAGE, { grad: [0.9, 1.03] });
      [0.72, 0.44].forEach((k, i) => [-1, 1].forEach((s) => {
        const t2 = new T.Shape();
        t2.moveTo(-(hd - 0.05) * k, 0); t2.lineTo((hd - 0.05) * k, 0); t2.lineTo(0, (rise - 0.03) * k); t2.closePath();
        const fan = new T.ShapeGeometry(t2);
        fan.rotateY(s * PI / 2).translate(s * ((Wr - 0.16) / 2 + 0.004 + i * 0.002), y0, 0);
        P.add(fan, i ? '#efdcb8' : '#f6e8cc', { grad: [0.95, 1.0] });
      }));
      // Buchrücken als First, mit Goldbändern
      P.add(xf(geo.cyl(0.13, 0.13, Wr + 0.02, 10), [0, y0 + rise + 0.03, 0], [0, 0, PI / 2]), ACC_D, { gloss: true, grad: [0.85, 1.1] });
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.137, 0.137, 0.07, 10), [s * (Wr / 2 - 0.28), y0 + rise + 0.03, 0], [0, 0, PI / 2]), C.gold, { gloss: true }));
      // Lesezeichen (rot), liegt auf dem vorderen Einband und hängt über die Traufe
      const fc = coverC(1);
      const nrm = [0, cs, sn];
      P.add(xf(geo.box(0.15, 0.012, Lc * 0.96), [1.15, fc[1] + nrm[1] * 0.052, fc[2] + nrm[2] * 0.052], [ang, 0, 0]), '#e03131', { grad: [0.9, 1.05] });
      const eave = [1.15, y0 - sn * 0.14 + 0.02, hd + cs * 0.14 + 0.05];
      P.add(xf(geo.box(0.15, 0.42, 0.012), [eave[0], eave[1] - 0.2, eave[2]]), '#e03131', { grad: [0.85, 1.0] });
      const notch = new T.Shape();
      notch.moveTo(-0.075, 0); notch.lineTo(0.075, 0); notch.lineTo(0.075, -0.1); notch.lineTo(0, -0.04); notch.lineTo(-0.075, -0.1); notch.closePath();
      P.add(xf(new T.ShapeGeometry(notch), [eave[0], eave[1] - 0.41, eave[2] + 0.007]), '#e03131', {});
      // Titel auf dem Einband
      text(grp, 'title', 2.16, [-0.08, fc[1] + nrm[1] * 0.05, fc[2] + nrm[2] * 0.05], [ang - PI / 2, 0, 0]);
      P.build(grp);
      grp.userData.ridge = y0 + rise + 0.16;
      return grp;
    }
    const lib = library();
    base.place(lib, LIB.x, LIB.z, { rotY: -0.28, keep: 1.9 });
    lib.position.y -= 0.04;
    bake(lib);
    owlTop = lib.userData.ridge;

    /* Lese-Eule mit Brille auf dem First (schaut sich um) */
    (function owl() {
      const P = new kit.Parts();
      const BR = '#8a6a55', BRD = '#6b4f40';
      P.add(geo.blob(0.2, { seed: 3, noise: 0.05, sy: 1.18, detail: 1 }).translate(0, 0.25, 0), BR, { gloss: true, grad: [0.8, 1.06] });
      P.add(geo.blob(0.15, { seed: 4, noise: 0.04, sy: 1.1, sz: 0.6, detail: 0 }).translate(0, 0.2, 0.1), '#f6e6cc', { gloss: true, grad: [0.9, 1.05] });
      [-1, 1].forEach((s) => {
        P.add(geo.blob(0.12, { seed: 5 + s, noise: 0.05, sx: 0.5, sy: 1.25, detail: 0 }).translate(s * 0.18, 0.22, -0.02), BRD, { gloss: true, grad: [0.8, 1.05] });
        P.add(xf(new T.SphereGeometry(0.078, 8, 5), [s * 0.08, 0.36, 0.14], null, [1, 1, 0.55]), '#ffffff', { gloss: true, grad: [0.9, 1.05] });
        P.add(xf(new T.SphereGeometry(0.038, 6, 4), [s * 0.08, 0.36, 0.182]), '#23233a', { gloss: true, grad: [1, 1] });
        P.add(xf(new T.TorusGeometry(0.088, 0.014, 3, 10), [s * 0.08, 0.36, 0.18]), NAVY, { gloss: true });
        P.add(xf(new T.ConeGeometry(0.045, 0.12, 4), [s * 0.12, 0.5, 0.0], [0, 0, -s * 0.35]), BRD, { gloss: true });
        P.add(xf(geo.blob(0.04, { seed: 9 + s, noise: 0, detail: 0, sy: 0.6 }), [s * 0.07, 0.02, 0.1]), '#ff9a3d', { gloss: true });
      });
      P.add(xf(geo.box(0.05, 0.014, 0.014), [0, 0.37, 0.19]), NAVY, { gloss: true });
      P.add(xf(new T.ConeGeometry(0.03, 0.08, 4), [0, 0.29, 0.19], [PI, 0, 0]), '#ff9a3d', { gloss: true });
      const o = P.build();
      o.name = 'eule';
      lib.updateMatrix();
      o.position.copy(new T.Vector3(-0.72, owlTop - 0.04, 0.02).applyMatrix4(lib.matrix));
      o.scale.setScalar(1.25);
      g.add(o);
      kit.sway(o, { axis: 'y', amp: 0.55, speed: 0.45, phase: 0.3 });
    })();

    /* ------------------------------------------------------------------
       Silbenbogen-Tor „Bü · che · rei“ über dem Weg
       ------------------------------------------------------------------ */
    const ARC = { x: 0.42, z: 0.85, ry: 0.12 };
    function syllableGate() {
      const grp = new T.Group();
      grp.name = 'silbenboegen';
      const P = new kit.Parts();
      const R = 0.46, tube = 0.085, ph = 0.56, sp = R * 2;
      const syl = [['Bü', SYL_BLUE], ['che', SYL_RED], ['rei', SYL_BLUE]];
      // Pfeiler (geteilt zwischen den Bögen)
      for (let i = 0; i < 4; i++) {
        const x = (i - 1.5) * sp;
        P.add(xf(geo.box(0.22, 0.1, 0.28), [x, 0.05, 0]), C.stone, { grad: [0.75, 1.0] });
        P.add(xf(geo.roundBox(0.17, ph, 0.21, 0.05, 1), [x, ph / 2 + 0.06, 0]), '#fff4e2', { grad: [0.85, 1.04] });
      }
      syl.forEach(([s, col], i) => {
        const x = (i - 1) * sp;
        P.add(xf(new T.TorusGeometry(R, tube, 4, 11, PI), [x, ph + 0.06, 0]), col, { gloss: true, grad: [0.85, 1.1] });
        const by = ph + 0.06 + R + tube + 0.2;
        P.add(xf(geo.roundBox(0.7, 0.42, 0.26, 0.08, 1), [x, by, 0]), kit.shade(col, 1.08), { gloss: true, grad: [0.86, 1.08] });
        text(grp, s, 0.62, [x, by, 0.132]);
      });
      P.build(grp);
      return grp;
    }
    const gate = syllableGate();
    base.place(gate, ARC.x, ARC.z, { rotY: ARC.ry, keep: 0.5 });
    bake(gate);
    [-1.5, -0.5, 0.5, 1.5].forEach((k) => base.keep(ARC.x + Math.cos(ARC.ry) * k * 0.92, ARC.z - Math.sin(ARC.ry) * k * 0.92, 0.35));

    /* ------------------------------------------------------------------
       Buchstaben-Zug auf einem Schienenoval (vorne links)
       ------------------------------------------------------------------ */
    const TR = { cx: -1.85, cz: 2.4, a: 1.2, b: 0.76 };
    const TS = 1.2; // Maßstab der Fahrzeuge
    const NS = 240;
    const track = (function sampleOval() {
      const M = 1024, px = [], pz = [], cum = [0];
      for (let i = 0; i <= M; i++) {
        const th = (i / M) * TAU;
        px.push(TR.cx + TR.a * Math.cos(th));
        pz.push(TR.cz + TR.b * Math.sin(th));
        if (i) cum.push(cum[i - 1] + Math.hypot(px[i] - px[i - 1], pz[i] - pz[i - 1]));
      }
      const L = cum[M];
      const X = new Float32Array(NS), Z = new Float32Array(NS), Y = new Float32Array(NS), CO = new Float32Array(NS), SI = new Float32Array(NS);
      let j = 0;
      for (let k = 0; k < NS; k++) {
        const s = (k / NS) * L;
        while (j < M - 1 && cum[j + 1] < s) j++;
        const f = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
        X[k] = px[j] + (px[j + 1] - px[j]) * f;
        Z[k] = pz[j] + (pz[j + 1] - pz[j]) * f;
        Y[k] = ground(X[k], Z[k]);
      }
      for (let k = 0; k < NS; k++) {
        const n = (k + 1) % NS, p = (k + NS - 1) % NS;
        const tx = X[n] - X[p], tz = Z[n] - Z[p], l = Math.hypot(tx, tz) || 1;
        CO[k] = tx / l; SI[k] = -tz / l; // Drehung um y: lokales +x zeigt in Fahrtrichtung
      }
      // Höhen glätten (die Wiese ist leicht hügelig)
      const Ys = Float32Array.from(Y);
      for (let k = 0; k < NS; k++) { let s = 0; for (let d = -6; d <= 6; d++) s += Y[(k + d + NS) % NS]; Ys[k] = s / 13; }
      return { L, X, Z, Y: Ys, CO, SI };
    })();
    const RAIL_Y = 0.07; // Schienenoberkante über dem Boden
    /** Lage auf der Bahn bei Bogenlänge s → out = [x, y, z, cos, sin] */
    function along(s, out) {
      const L = track.L;
      s = ((s % L) + L) % L;
      const f = (s / L) * NS, k = Math.floor(f) % NS, k2 = (k + 1) % NS, t = f - Math.floor(f);
      out[0] = track.X[k] + (track.X[k2] - track.X[k]) * t;
      out[1] = track.Y[k] + (track.Y[k2] - track.Y[k]) * t;
      out[2] = track.Z[k] + (track.Z[k2] - track.Z[k]) * t;
      let c = track.CO[k] + (track.CO[k2] - track.CO[k]) * t, sn = track.SI[k] + (track.SI[k2] - track.SI[k]) * t;
      const l = Math.hypot(c, sn) || 1;
      out[3] = c / l; out[4] = sn / l;
      return out;
    }
    // Gleisbett, Schwellen und Schienen (statisch)
    (function rails() {
      const P = new kit.Parts();
      const n = 48, bw = 0.24, tmp = [0, 0, 0, 0, 0];
      const posA = [];
      const L = [], R = [];
      for (let i = 0; i <= n; i++) {
        along((i / n) * track.L, tmp);
        const nx = -tmp[4], nz = -tmp[3]; // senkrecht zur Fahrtrichtung
        L.push([tmp[0] + nx * bw, tmp[1] + 0.02, tmp[2] + nz * bw]);
        R.push([tmp[0] - nx * bw, tmp[1] + 0.02, tmp[2] - nz * bw]);
      }
      for (let i = 0; i < n; i++) posA.push(...L[i], ...R[i], ...L[i + 1], ...R[i], ...R[i + 1], ...L[i + 1]);
      const bed = new T.BufferGeometry();
      bed.setAttribute('position', new T.Float32BufferAttribute(posA, 3));
      bed.computeVertexNormals();
      // Normalen nach oben ausrichten (Dreiecksumlauf je nach Richtung)
      const nr = bed.attributes.normal;
      if (nr.getY(0) < 0) { for (let i = 0; i < posA.length; i += 9) { for (let k = 0; k < 3; k++) { const t = posA[i + 3 + k]; posA[i + 3 + k] = posA[i + 6 + k]; posA[i + 6 + k] = t; } } bed.setAttribute('position', new T.Float32BufferAttribute(posA, 3)); bed.computeVertexNormals(); }
      P.add(bed, '#d8c4a2', { grad: [1, 1], jitter: 0.05, seed: 2 });
      const ns = 18;
      for (let i = 0; i < ns; i++) {
        along((i / ns) * track.L, tmp);
        P.add(xf(geo.box(0.07, 0.035, 0.38), [tmp[0], tmp[1] + 0.04, tmp[2]], [0, Math.atan2(tmp[4], tmp[3]), 0]), C.woodDark, { grad: [0.85, 1.05] });
      }
      [-1, 1].forEach((sd) => {
        const pts = [];
        for (let i = 0; i < 32; i++) {
          along((i / 32) * track.L, tmp);
          pts.push(new T.Vector3(tmp[0] + sd * -tmp[4] * 0.15, tmp[1] + RAIL_Y - 0.015, tmp[2] + sd * -tmp[3] * 0.15));
        }
        const tube = new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 32, 0.018, 3, true);
        P.add(tube, '#9aa6b8', { gloss: true, grad: [0.85, 1.1] });
      });
      const m = P.build();
      m.name = 'gleise';
      g.add(m);
      for (let i = 0; i < 12; i++) { along((i / 12) * track.L, tmp); base.keep(tmp[0], tmp[2], 0.3); }
      base.keep(TR.cx, TR.cz, 0.5);
    })();

    /**
     * Fahrzeuge auf der Bahn: alle Wagen je Material in EINEM Mesh; pro Bild
     * werden die Eckpunkte jedes Wagens auf der CPU gedreht und verschoben
     * (keine Allokationen). cars: [Group (lokales +x = vorn)]
     */
    function convoy(cars) {
      const buckets = new Map();
      cars.forEach((car, ci) => {
        car.scale.setScalar(TS);
        car.updateMatrixWorld(true);
        car.traverse((m) => {
          if (!m.isMesh) return;
          let q = m.geometry.clone();
          if (q.index) q = q.toNonIndexed();
          for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) q.deleteAttribute(k);
          const n = q.attributes.position.count;
          if (!q.attributes.uv) q.setAttribute('uv', new T.BufferAttribute(new Float32Array(n * 2), 2));
          if (m.material.vertexColors && !q.attributes.color) q.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
          if (!m.material.vertexColors && q.attributes.color) q.deleteAttribute('color');
          q.applyMatrix4(m.matrixWorld);
          const key = m.material.uuid + '|' + m.renderOrder;
          if (!buckets.has(key)) buckets.set(key, { mat: m.material, order: m.renderOrder, cast: m.castShadow, geos: [], cars: [] });
          const b = buckets.get(key);
          b.geos.push(q);
          b.cars.push([ci, n]);
        });
      });
      const parts = [];
      const grp = new T.Group();
      grp.name = 'zug';
      grp.userData.dynamic = true;
      buckets.forEach((b) => {
        const gm = b.geos.length > 1 ? merge(b.geos, false) : b.geos[0];
        const pos = gm.attributes.position, nrm = gm.attributes.normal;
        pos.setUsage(T.DynamicDrawUsage);
        nrm.setUsage(T.DynamicDrawUsage);
        const car = new Uint8Array(pos.count);
        let o = 0;
        b.cars.forEach(([ci, n]) => { car.fill(ci, o, o + n); o += n; });
        gm.boundingSphere = new T.Sphere(new T.Vector3(TR.cx, ground(TR.cx, TR.cz) + 0.3, TR.cz), TR.a + 0.6);
        const mesh = new T.Mesh(gm, b.mat);
        mesh.castShadow = b.cast;
        mesh.receiveShadow = true;
        mesh.renderOrder = b.order;
        grp.add(mesh);
        parts.push({ pos, nrm, p0: Float32Array.from(pos.array), n0: Float32Array.from(nrm.array), car });
      });
      const tf = new Float32Array(cars.length * 5);
      return {
        group: grp,
        set(i, v) { tf.set(v, i * 5); },
        apply() {
          for (let p = 0; p < parts.length; p++) {
            const { pos, nrm, p0, n0, car } = parts[p];
            const pa = pos.array, na = nrm.array;
            for (let v = 0, n = car.length; v < n; v++) {
              const o = car[v] * 5, i3 = v * 3;
              const x = p0[i3], z = p0[i3 + 2], c = tf[o + 3], s = tf[o + 4];
              pa[i3] = tf[o] + x * c + z * s;
              pa[i3 + 1] = tf[o + 1] + p0[i3 + 1];
              pa[i3 + 2] = tf[o + 2] - x * s + z * c;
              const nx = n0[i3], nz = n0[i3 + 2];
              na[i3] = nx * c + nz * s;
              na[i3 + 1] = n0[i3 + 1];
              na[i3 + 2] = -nx * s + nz * c;
            }
            pos.needsUpdate = true;
            nrm.needsUpdate = true;
          }
        },
      };
    }
    // Lok (lokales +x = vorn, Räder auf y = 0)
    function loco() {
      const grp = new T.Group();
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.66, 0.08, 0.27, 0.03, 1), [0, 0.14, 0]), NAVY, { grad: [0.8, 1.05] });
      [-0.2, 0.0, 0.2].forEach((x, i) => [-1, 1].forEach((s) => {
        const r = i === 0 ? 0.085 : 0.075;
        P.add(xf(geo.cyl(r, r, 0.045, 7), [x, r, s * 0.135], [PI / 2, 0, 0]), '#e03131', { gloss: true, grad: [0.8, 1.1] });
      }));
      P.add(xf(geo.cyl(0.13, 0.13, 0.44, 10), [0.1, 0.3, 0], [0, 0, PI / 2]), ACC, { gloss: true, grad: [0.85, 1.12] });
      [0.0, 0.22].forEach((x) => P.add(xf(geo.cyl(0.136, 0.136, 0.03, 10), [x, 0.3, 0], [0, 0, PI / 2]), C.gold, { gloss: true }));
      P.add(xf(geo.cyl(0.135, 0.135, 0.05, 10), [0.33, 0.3, 0], [0, 0, PI / 2]), NAVY, { gloss: true });
      P.add(xf(new T.IcosahedronGeometry(0.035, 0), [0.36, 0.3, 0]), '#ffe066', { gloss: true });
      P.add(xf(geo.cyl(0.06, 0.045, 0.16, 8), [0.24, 0.5, 0]), NAVY, { gloss: true, grad: [0.8, 1.05] });
      P.add(xf(geo.cyl(0.08, 0.06, 0.05, 8), [0.24, 0.6, 0]), C.gold, { gloss: true });
      P.add(xf(new T.IcosahedronGeometry(0.06, 1), [0.05, 0.43, 0]), C.gold, { gloss: true });
      P.add(xf(geo.roundBox(0.26, 0.3, 0.29, 0.04, 1), [-0.19, 0.33, 0]), ACC, { gloss: true, grad: [0.85, 1.08] });
      P.add(xf(geo.roundBox(0.34, 0.05, 0.35, 0.02, 1), [-0.2, 0.5, 0]), '#e03131', { gloss: true });
      [-1, 1].forEach((s) => P.addRaw(kit.paint(xf(geo.box(0.14, 0.11, 0.02), [-0.19, 0.38, s * 0.147]), '#ffffff', { grad: [1, 1] }), 'window'));
      P.add(xf(new T.ConeGeometry(0.12, 0.12, 4), [0.37, 0.09, 0], [PI / 4, 0, -PI / 2]), '#e03131', { gloss: true });
      P.build(grp);
      return grp;
    }
    // Wagen mit Buchstaben-Würfel
    function wagon(ch, col) {
      const grp = new T.Group();
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.46, 0.08, 0.27, 0.03, 1), [0, 0.14, 0]), NAVY, { grad: [0.8, 1.05] });
      [-0.14, 0.14].forEach((x) => [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.07, 0.07, 0.045, 7), [x, 0.07, s * 0.135], [PI / 2, 0, 0]), '#e03131', { gloss: true, grad: [0.8, 1.1] })));
      P.add(xf(geo.box(0.06, 0.04, 0.05), [0.255, 0.14, 0]), NAVY, {});
      P.add(xf(geo.roundBox(0.34, 0.34, 0.31, 0.06, 1), [0, 0.355, 0]), col, { gloss: true, grad: [0.86, 1.1] });
      P.build(grp);
      [-1, 1].forEach((s) => {
        const q = A.quad(ch, 0.27);
        xf(q, [0, 0.36, s * 0.158], [0, s < 0 ? PI : 0, 0]);
        const m = new T.Mesh(q, A.mat);
        m.renderOrder = 2;
        m.castShadow = false;
        grp.add(m);
      });
      return grp;
    }
    const cars = [loco(), wagon('Z', '#ff8c2e'), wagon('u', '#22b8cf'), wagon('g', '#f06595')];
    const gaps = [0, 0.66 * TS, 0.54 * TS, 0.54 * TS];
    const train = convoy(cars);
    g.add(train.group);
    // Dampfwölkchen aus dem Schornstein (instanziert)
    const NP = 5;
    const puffs = new T.InstancedMesh(kit.paint(new T.IcosahedronGeometry(0.075, 0), '#ffffff', { grad: [0.85, 1.05] }), kit.mats.matte, NP);
    puffs.name = 'dampf';
    puffs.castShadow = false;
    puffs.userData.dynamic = true;
    puffs.frustumCulled = false;
    g.add(puffs);
    const dmy = new T.Object3D();
    const tv = [0, 0, 0, 0, 0];
    function moveTrain(t) {
      const s0 = 0.9 + t * 0.3 * calm;
      let s = s0;
      for (let i = 0; i < cars.length; i++) {
        s -= gaps[i];
        along(s, tv);
        tv[1] += RAIL_Y;
        train.set(i, tv);
        if (i === 0) {
          // Schornstein der Lok (lokal x = 0.24, y = 0.62)
          const cx = tv[0] + 0.24 * TS * tv[3], cy = tv[1] + 0.64 * TS, cz = tv[2] - 0.24 * TS * tv[4];
          for (let k = 0; k < NP; k++) {
            const ph = (t * 0.7 * Math.max(calm, 0.25) + k / NP) % 1;
            dmy.position.set(cx - tv[3] * ph * 0.35, cy + ph * 0.55, cz + tv[4] * ph * 0.35);
            dmy.scale.setScalar(Math.max(0.001, Math.sin(ph * PI) * (0.8 + ph * 0.9)));
            dmy.updateMatrix();
            puffs.setMatrixAt(k, dmy.matrix);
          }
          puffs.instanceMatrix.needsUpdate = true;
        }
      }
      train.apply();
    }
    moveTrain(0);
    updates.push((dt, t) => moveTrain(t));

    /* ------------------------------------------------------------------
       Schultafel mit Kreide-Wort „Lesen“ (links)
       ------------------------------------------------------------------ */
    function chalkboard() {
      const grp = new T.Group();
      grp.name = 'schultafel';
      const P = new kit.Parts();
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.1, 2.0, 0.1, 0.03, 1), [s * 0.95, 1.0, -0.04]), C.wood, { grad: [0.7, 1.05] });
        P.add(xf(geo.roundBox(0.16, 0.08, 0.62, 0.03, 1), [s * 0.95, 0.04, -0.04]), C.woodDark, {});
      });
      P.add(xf(geo.roundBox(2.1, 0.09, 0.13, 0.03, 1), [0, 2.0, -0.04]), C.woodDark, { grad: [0.85, 1.05] });
      P.add(xf(geo.roundBox(1.86, 1.16, 0.1, 0.04, 1), [0, 1.34, 0]), C.woodLight, { grad: [0.85, 1.05] });
      P.add(xf(geo.box(1.68, 0.98, 0.02), [0, 1.34, 0.045]), '#2b5a4c', { grad: [1, 1] });
      P.add(xf(geo.roundBox(1.72, 0.05, 0.16, 0.02, 1), [0, 0.74, 0.08]), C.woodLight, {});
      [['#ffffff', -0.5], ['#ffe066', -0.36], ['#ffa8c5', 0.42]].forEach(([col, x]) => P.add(xf(geo.cyl(0.018, 0.018, 0.12, 5), [x, 0.785, 0.1], [0, 0.2, PI / 2]), col, { grad: [0.95, 1.05] }));
      P.add(xf(geo.roundBox(0.18, 0.07, 0.09, 0.02, 1), [0.65, 0.8, 0.1]), '#ffd43b', { grad: [0.85, 1.05] });
      P.add(xf(geo.box(0.18, 0.02, 0.09), [0.65, 0.775, 0.1]), '#5c4033', {});
      P.build(grp);
      text(grp, 'board', 1.64, [0, 1.34, 0.058]);
      return grp;
    }
    const cb = chalkboard();
    base.place(cb, -3.2, 0.15, { rotY: 0.62, keep: 1.0 });
    bake(cb);

    /* ------------------------------------------------------------------
       Lesebank mit aufgeschlagenem Buch, Bücherstapel
       ------------------------------------------------------------------ */
    function readingBench() {
      const grp = new T.Group();
      grp.name = 'lesebank';
      grp.add(kit.bench({ color: '#d9a46c' }));
      const P = new kit.Parts();
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.25, 0.03, 0.32, 0.01, 1), [0.18 + s * 0.12, 0.49, 0.0], [0, 0, s * 0.1]), ACC, { grad: [0.9, 1.05] });
        P.add(xf(geo.box(0.22, 0.03, 0.29), [0.18 + s * 0.115, 0.51, 0.0], [0, 0, s * 0.1]), PAGE, { grad: [0.95, 1.02] });
      });
      P.build(grp);
      text(grp, 'pages', 0.46, [0.18, 0.53, 0.0], [-PI / 2, 0, 0]);
      return grp;
    }
    const bench = readingBench();
    base.place(bench, 2.95, 2.35, { rotY: -0.78, keep: 0.8 });
    bake(bench);

    /** Bücherstapel (zufällige Größen und Farben) */
    function bookStack(n, seed) {
      const P = new kit.Parts();
      const r = kit.rng(seed);
      const cols = ['#e03131', '#1c7ed6', '#f59f00', '#12b886', ACC, '#f06595', '#7950f2'];
      let y = 0;
      for (let i = 0; i < n; i++) {
        const w = 0.5 + r() * 0.22, h = 0.1 + r() * 0.06, d = 0.36 + r() * 0.1;
        const pos = [(r() - 0.5) * 0.08, y, (r() - 0.5) * 0.06], rot = [0, (r() - 0.5) * 0.7, 0];
        // schlichtes Buch: Einband + Papierkante (zeigt nach vorn)
        P.add(xf(xf(geo.roundBox(w, h, d, 0.025, 1), [0, h / 2, 0]), pos, rot), cols[Math.floor(r() * cols.length)], { grad: [0.85, 1.08] });
        P.add(xf(xf(geo.box(w - 0.07, h - 0.045, 0.04), [0, h / 2, d / 2 - 0.012]), pos, rot), '#fff3dc', { grad: [0.95, 1.02] });
        y += h;
      }
      const m = P.build();
      m.name = 'buecherstapel';
      return m;
    }
    base.place(bookStack(5, 21), -1.75, -0.65, { rotY: 0.4, keep: 0.45 });
    base.place(bookStack(3, 22), 2.15, 3.05, { rotY: -0.3, keep: 0.4 });

    /* ------------------------------------------------------------------
       Litfaßsäule mit Leseplakaten (rechts)
       ------------------------------------------------------------------ */
    function adColumn() {
      const grp = new T.Group();
      grp.name = 'litfasssaeule';
      const P = new kit.Parts();
      const GR = '#2f7a55';
      P.add(xf(geo.cyl(0.44, 0.48, 0.16, 14), [0, 0.08, 0]), GR, { grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.36, 0.36, 1.62, 14), [0, 0.97, 0]), '#efe5cf', { grad: [0.85, 1.04] });
      P.add(xf(geo.cyl(0.43, 0.41, 0.1, 14), [0, 1.82, 0]), GR, { grad: [0.85, 1.05] });
      const dome = new T.SphereGeometry(0.4, 14, 5, 0, TAU, 0, PI / 2);
      P.add(xf(dome, [0, 1.86, 0], null, [1, 0.62, 1]), GR, { gloss: true, grad: [0.85, 1.12] });
      P.add(xf(new T.IcosahedronGeometry(0.07, 1), [0, 2.16, 0]), C.gold, { gloss: true });
      P.build(grp);
      // gebogene Plakate (Zylinderausschnitte mit Atlas-Koordinaten)
      grp.userData.posters = [['pA', -0.68], ['pE', 0.66]].map(([key, a]) => {
        const q = new T.CylinderGeometry(0.366, 0.366, 0.62, 8, 1, true, a - 0.62, 1.24);
        A.remap(q, key);
        q.translate(0, 1.05, 0);
        return q;
      });
      return grp;
    }
    const col = adColumn();
    base.place(col, 2.95, -0.35, { rotY: -0.05, keep: 0.6 });
    col.updateMatrix();
    col.userData.posters.forEach((q) => textQuads.push(q.applyMatrix4(col.matrix)));
    delete col.userData.posters;

    /* ------------------------------------------------------------------
       Weg, Pflanzen, Laterne
       ------------------------------------------------------------------ */
    kit.path(base, [[1.05, 4.85], [0.8, 3.1], [0.5, 1.7], [0.42, 0.85], [0.25, -0.45]], { seed: 211, width: 0.6 });
    base.place(kit.tree({ type: 'pine', seed: 2111, scale: 1.15 }), -3.15, -1.85, { keep: 0.7 });
    base.place(kit.tree({ type: 'pine', seed: 2112, scale: 1.0 }), -1.75, -3.55, { keep: 0.6 });
    base.place(kit.tree({ type: 'blossom', seed: 2113, scale: 0.95, color: '#c9a7ff' }), 3.05, -2.3, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 2114, scale: 0.78 }), 1.95, -3.6, { keep: 0.5 });
    kit.grassTufts(base, 32, 211);
    kit.flowers(base, 4, ['#ffd23f', '#ffffff', '#ff7aa8', ACC_L], 211);

    // Kontaktschatten
    [[LIB.x, LIB.z + 0.2, 2.0], [-3.2, 0.15, 1.0], [2.95, 2.35, 0.8], [2.95, -0.35, 0.6]].forEach(([x, z, r]) => {
      const s = kit.shadowBlob(r);
      s.position.set(x, ground(x, z) + 0.03, z);
      g.add(s);
    });

    // statische Beschriftungen (ein Mesh)
    const tm = new T.Mesh(merge(textQuads.map((q) => (q.index ? q.toNonIndexed() : q)), false), A.mat);
    tm.name = 'beschriftung';
    tm.renderOrder = 2;
    tm.receiveShadow = true;
    tm.castShadow = false;
    tm.userData.noMerge = true;
    g.add(tm);

    // Messhaken für Entwicklungs-Werkzeuge: Dreiecke je Teil vor dem Zusammenführen
    if (window.__w3dTris) window.__w3dTris('deutsch1', g);
    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 6.1, -1.6),
        focus: new T.Vector3(0, 1.6, -0.3),
      },
    };
  });
})();
