/* ==========================================================================
   js/world3d/islands/mathe1.js – Rechenschule (Klasse 1, dunkelorange)

   Wahrzeichen: ein Schulhaus mit hohem Glockenturm (orangefarbenes
   Zeltdach, schwingende Goldglocke, Turmuhr auf acht Uhr – Schulbeginn) und
   daneben die Rechenrakete auf ihrer schrägen Startrampe. Die Rampe ist
   zugleich ein Zahlenstrahl (0 · 5 · 10 · 15 · 20), die Rakete schwebt mit
   flackernder Flamme und pufft kleine Dampfwölkchen.
   Dazu eine Zehnerfeld-Tafel mit 10 Kugeln (5 rot, 5 blau – Kraft der Fünf),
   in der die Kugeln nacheinander „mitzählen“, ein Kaufladen-Stand mit
   gestreiftem Sonnendach, Obstkisten, Münzstapeln und einer großen sich
   drehenden Goldmünze, eine Zahlenmauer aus Ziegeln (2 3 4 → 5 7 → 12),
   ein Schulranzen vor der Tür, Bäume, Büsche und ein Weg zum Strand.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'mathe1', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#e8590c';
    const ACC_L = kit.shade(ACC, 1.18);
    const NAVY = '#2f3f6b';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];

    const base = kit.islandBase({ seed: 131, radius: 6.1, grassRadius: 4.75, grass: '#88d65c', stones: 4, segments: 48 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* ------------------------------------------------------------------
       Beschriftungs-Atlas: alle Ziffern, Schilder und das Zifferblatt in
       EINER Textur (ein Draw-Call für alle statischen Beschriftungen)
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
      const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      mat.name = 'mathe1-atlas';
      return {
        mat,
        /** Viereck (Normale +z, Breite w) mit dem Bild des Eintrags key */
        quad(key, w) {
          const r = rects[key];
          const q = new T.PlaneGeometry(w, (w * r.h) / r.w);
          const uv = q.attributes.uv;
          for (let i = 0; i < uv.count; i++) {
            const u = uv.getX(i), v = uv.getY(i);
            uv.setXY(i, (r.x + u * r.w) / AW, 1 - (r.y + (1 - v) * r.h) / AH);
          }
          return q;
        },
      };
    }
    /** Text mittig in eine Zelle: Fredoka, mit weichem Schatten */
    const label = (text, { color = '#ffffff', shadow = 'rgba(0,0,0,0.28)', k = 0.74, weight = 700 } = {}) => (c, w, h) => {
      let px = Math.round(h * k);
      c.font = `${weight} ${px}px ${kit.fonts.num}`;
      const tw = c.measureText(text).width;
      if (tw > w * 0.9) { px = Math.floor((px * w * 0.9) / tw); c.font = `${weight} ${px}px ${kit.fonts.num}`; }
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (shadow) { c.fillStyle = shadow; c.fillText(text, w / 2 + px * 0.04, h / 2 + px * 0.1); }
      c.fillStyle = color;
      c.fillText(text, w / 2, h / 2 + px * 0.05);
    };
    const clockFace = (c, w) => {
      const r = w / 2;
      c.fillStyle = '#fffaf0';
      c.beginPath(); c.arc(r, r, r - 2, 0, TAU); c.fill();
      c.strokeStyle = NAVY;
      c.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU, big = i % 3 === 0;
        c.lineWidth = big ? 7 : 4;
        c.beginPath();
        c.moveTo(r + Math.sin(a) * r * (big ? 0.68 : 0.76), r - Math.cos(a) * r * (big ? 0.68 : 0.76));
        c.lineTo(r + Math.sin(a) * r * 0.88, r - Math.cos(a) * r * 0.88);
        c.stroke();
      }
      // acht Uhr: Stundenzeiger auf 8, Minutenzeiger auf 12
      const hand = (a, len, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); c.moveTo(r, r); c.lineTo(r + Math.sin(a) * len, r - Math.cos(a) * len); c.stroke(); };
      hand((8 / 12) * TAU, r * 0.42, 11, NAVY);
      hand(0, r * 0.66, 7, NAVY);
      c.fillStyle = ACC;
      c.beginPath(); c.arc(r, r, 10, 0, TAU); c.fill();
    };
    const A = atlas([
      { key: 'clock', w: 160, h: 160, draw: clockFace },
      { key: 'schule', w: 300, h: 80, draw: label('SCHULE', { k: 0.72, weight: 600 }) },
      { key: 'zehn', w: 110, h: 80, draw: label('10') },
      { key: 'euro', w: 120, h: 80, draw: label('1 €', { color: '#5a3416', shadow: null, weight: 600 }) },
      { key: 'ct', w: 120, h: 80, draw: label('5 ct', { color: '#5a3416', shadow: null, weight: 600 }) },
      ...['1', '2', '3', '4', '5', '6', '7', '8', '12', '?'].map((t) => ({ key: 'w' + t, w: 96, h: 80, draw: label(t) })),
      ...['0', '5', '10', '15', '20'].map((t) => ({ key: 'n' + t, w: 96, h: 80, draw: label(t, { color: NAVY, shadow: null, weight: 600 }) })),
      { key: 'plus', w: 80, h: 80, draw: label('+', { k: 0.9 }) },
    ], 1024, 512);
    const textQuads = [];
    /** Beschriftung im lokalen Raum einer Gruppe vormerken … */
    function text(grp, key, w, pos, rot) {
      (grp.userData.texts || (grp.userData.texts = [])).push([key, w, pos, rot]);
    }
    /** … und nach dem Aufstellen in Inselkoordinaten übernehmen (ein Mesh für alle) */
    function bake(grp, extra) {
      grp.updateMatrix();
      (grp.userData.texts || []).forEach(([key, w, pos, rot]) => {
        const q = xf(A.quad(key, w), pos, rot);
        if (extra) q.applyMatrix4(extra);
        q.applyMatrix4(grp.matrix);
        textQuads.push(q);
      });
      delete grp.userData.texts;
    }

    /** Fenster mit Rahmen, Glas (leuchtet nachts), Sprossen und Blumenkasten */
    function addWindow(P, x, y, z, ry, w = 0.5, h = 0.6, flowers = true) {
      const sx = Math.sin(ry), cz = Math.cos(ry);
      const at = (d, dy = 0) => [x + sx * d, y + dy, z + cz * d];
      P.add(xf(geo.roundBox(w + 0.1, h + 0.1, 0.07, 0.03, 1), at(0), [0, ry, 0]), '#ffffff', { grad: [0.9, 1.02] });
      P.addRaw(kit.paint(xf(geo.box(w - 0.04, h - 0.04, 0.06), at(0.02), [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      P.add(xf(geo.box(0.04, h - 0.04, 0.07), at(0.035), [0, ry, 0]), '#ffffff', {});
      P.add(xf(geo.box(w - 0.04, 0.04, 0.07), at(0.035), [0, ry, 0]), '#ffffff', {});
      P.add(xf(geo.box(w + 0.14, 0.12, 0.16), at(0.07, -h / 2 - 0.08), [0, ry, 0]), ACC, { grad: [0.8, 1.05] });
      if (flowers) {
        for (let i = 0; i < 4; i++) {
          const d = (i - 1.5) * (w / 4);
          P.add(xf(new T.IcosahedronGeometry(0.06, 0), [x + cz * d + sx * 0.09, y - h / 2 - 0.0, z - sx * d + cz * 0.09]), i % 2 ? '#ffd23f' : '#ff7aa8', { grad: [0.9, 1.05] });
        }
      }
    }

    /* ------------------------------------------------------------------
       Schulhaus mit Glockenturm (hinten Mitte)
       ------------------------------------------------------------------ */
    const WALL = '#fff1dc', TRIM = '#ffffff';
    const SCH = { x: -0.15, z: -2.15 };
    let bellPivot = null;
    function school() {
      const grp = new T.Group();
      grp.name = 'schulhaus';
      const P = new kit.Parts();
      const bw = 3.0, bd = 1.7, bh = 1.45, pl = 0.2;
      P.add(xf(geo.roundBox(bw + 0.25, pl, bd + 0.25, 0.05, 1), [0, pl / 2, 0]), C.stone, { grad: [0.75, 1] });
      P.add(xf(geo.roundBox(bw, bh, bd, 0.07), [0, pl + bh / 2, 0]), WALL, { grad: [0.8, 1.04] });
      P.add(xf(geo.roundBox(bw + 0.16, 0.12, bd + 0.16, 0.04, 1), [0, pl + bh + 0.04, 0]), TRIM, {});
      // Satteldach (First entlang x)
      const rise = 0.78, half = bd / 2 + 0.08;
      const ang = Math.atan2(rise, half);
      const L = Math.hypot(half, rise) + 0.3;
      const ry0 = pl + bh + 0.1;
      [-1, 1].forEach((s) => {
        const q = geo.roundBox(bw + 0.42, 0.15, L, 0.05);
        const d = L / 2 - 0.12;
        xf(q, [0, ry0 + rise - d * Math.sin(ang) + 0.06, s * d * Math.cos(ang)], [s * ang, 0, 0]);
        P.add(q, ACC, { grad: [0.75, 1.1] });
      });
      P.add(xf(geo.cyl(0.09, 0.09, bw + 0.5, 6), [0, ry0 + rise + 0.12, 0], [0, 0, PI / 2]), kit.shade(ACC, 0.82), {});
      // Giebeldreiecke
      const tri = new T.Shape();
      tri.moveTo(-half + 0.06, 0); tri.lineTo(half - 0.06, 0); tri.lineTo(0, rise - 0.04); tri.closePath();
      const gab = new T.ExtrudeGeometry(tri, { depth: bw - 0.06, bevelEnabled: false });
      gab.translate(0, 0, -(bw - 0.06) / 2).rotateY(PI / 2).translate(0, ry0 - 0.02, 0);
      P.add(gab, WALL, { grad: [0.95, 1.02] });
      // Rundfenster im Giebel
      [-1, 1].forEach((s) => {
        P.add(xf(new T.TorusGeometry(0.17, 0.04, 3, 10), [s * (bw / 2 - 0.01), ry0 + 0.3, 0], [0, PI / 2, 0]), TRIM, {});
        P.addRaw(kit.paint(xf(new T.CircleGeometry(0.15, 10), [s * (bw / 2 + 0.005), ry0 + 0.3, 0], [0, s * PI / 2, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      });
      // Fenster vorn und an den Seiten
      [-1, 1].forEach((s) => {
        addWindow(P, s * 1.0, pl + 0.78, bd / 2 + 0.02, 0, 0.56, 0.66);
        addWindow(P, s * (bw / 2 + 0.02), pl + 0.78, 0.15, s * PI / 2, 0.5, 0.6, false);
      });
      // Turm (Risalit vorn Mitte)
      const tz = 0.6, tw = 1.0, tTop = 3.25;
      P.add(xf(geo.roundBox(tw + 0.16, pl + 0.02, tw + 0.16, 0.04, 1), [0, (pl + 0.02) / 2, tz]), C.stone, { grad: [0.75, 1] });
      P.add(xf(geo.roundBox(tw, tTop - pl, tw, 0.06), [0, pl + (tTop - pl) / 2, tz]), WALL, { grad: [0.8, 1.04] });
      [-1, 1].forEach((s) => [-1, 1].forEach((t) => P.add(xf(geo.box(0.14, tTop - pl, 0.14), [s * (tw / 2 - 0.01), pl + (tTop - pl) / 2, tz + t * (tw / 2 - 0.01)]), ACC_L, { grad: [0.75, 1.05] })));
      P.add(xf(geo.roundBox(tw + 0.12, 0.1, tw + 0.12, 0.03, 1), [0, 2.1, tz]), TRIM, {});
      P.add(xf(geo.roundBox(tw + 0.2, 0.14, tw + 0.2, 0.04, 1), [0, tTop, tz]), TRIM, {});
      // Glockenstuhl: vier Pfeiler, Decke, Querbalken
      const bTop = tTop + 0.78;
      [-1, 1].forEach((s) => [-1, 1].forEach((t) => P.add(xf(geo.box(0.15, 0.78, 0.15), [s * 0.4, tTop + 0.39, tz + t * 0.4]), WALL, { grad: [0.85, 1.04] })));
      P.add(xf(geo.roundBox(tw + 0.2, 0.12, tw + 0.2, 0.04, 1), [0, bTop, tz]), TRIM, {});
      P.add(xf(geo.box(0.86, 0.07, 0.07), [0, bTop - 0.1, tz]), C.woodDark, {});
      // Zeltdach mit Goldkugel und Wetterfähnchen-Stab
      P.add(xf(new T.ConeGeometry(0.9, 1.05, 4), [0, bTop + 0.06 + 0.525, tz], [0, PI / 4, 0]), ACC, { grad: [0.75, 1.12] });
      P.add(xf(geo.cyl(0.025, 0.025, 0.4, 5), [0, bTop + 1.2, tz]), C.metal, {});
      P.add(xf(new T.IcosahedronGeometry(0.11, 1), [0, bTop + 1.18, tz]), C.gold, { gloss: true });
      P.add(xf(new T.ConeGeometry(0.05, 0.16, 5), [0, bTop + 1.46, tz]), C.gold, { gloss: true });
      // Turmuhr
      const fz = tz + tw / 2;
      P.add(xf(new T.TorusGeometry(0.31, 0.055, 4, 16), [0, 2.65, fz + 0.03]), C.gold, { gloss: true });
      P.add(xf(geo.cyl(0.31, 0.31, 0.04, 18), [0, 2.65, fz + 0.01], [PI / 2, 0, 0]), '#fffaf0', {});
      // Tür mit Rundbogen, Treppe, Schild
      P.add(xf(geo.roundBox(0.66, 0.98, 0.06, 0.03, 1), [0, pl + 0.49, fz + 0.01]), TRIM, {});
      P.add(xf(geo.cyl(0.33, 0.33, 0.06, 12, 1).rotateX(PI / 2), [0, pl + 0.98, fz + 0.01]), TRIM, {});
      P.add(xf(geo.roundBox(0.52, 0.86, 0.08, 0.03, 1), [0, pl + 0.43, fz + 0.03]), '#8a4f2c', { grad: [0.8, 1.05] });
      P.add(xf(geo.cyl(0.26, 0.26, 0.08, 12, 1).rotateX(PI / 2), [0, pl + 0.86, fz + 0.03]), '#8a4f2c', {});
      P.add(xf(geo.box(0.03, 0.8, 0.09), [0, pl + 0.46, fz + 0.04]), '#6d3b1f', {});
      [-1, 1].forEach((s) => P.add(xf(new T.IcosahedronGeometry(0.035, 0), [s * 0.08, pl + 0.45, fz + 0.09]), C.gold, { gloss: true }));
      P.add(xf(geo.roundBox(0.95, 0.1, 0.42, 0.03, 1), [0, 0.05, fz + 0.24]), C.stone, {});
      P.add(xf(geo.roundBox(0.95, 0.27, 0.07, 0.03, 1), [0, 1.62, fz + 0.03]), ACC, { gloss: true, grad: [0.85, 1.08] });
      // Fenster im Turm über dem Schild
      P.addRaw(kit.paint(xf(geo.box(0.26, 0.2, 0.04), [0, 1.92, fz + 0.01]), '#ffffff', { grad: [1, 1] }), 'window');
      P.build(grp);
      text(grp, 'schule', 0.84, [0, 1.62, fz + 0.075]);
      text(grp, 'clock', 0.58, [0, 2.65, fz + 0.04]);
      // Glocke (schwingt)
      const bell = new kit.Parts();
      const prof = [[0.0, -0.42], [0.23, -0.47], [0.26, -0.44], [0.2, -0.34], [0.16, -0.2], [0.14, -0.08], [0.09, -0.02], [0.0, 0.0]].map((p) => new T.Vector2(Math.max(0.001, p[0]), p[1]));
      bell.add(new T.LatheGeometry(prof, 10), C.gold, { gloss: true, grad: [0.75, 1.1] });
      bell.add(xf(new T.IcosahedronGeometry(0.06, 0), [0, -0.44, 0]), '#b8860b', { gloss: true });
      bell.add(xf(new T.TorusGeometry(0.05, 0.018, 3, 6), [0, 0.03, 0]), C.metal, { gloss: true });
      bellPivot = bell.build();
      bellPivot.name = 'glocke';
      bellPivot.position.set(0, bTop - 0.13, tz);
      grp.add(bellPivot);
      grp.userData.towerTop = bTop + 1.5;
      return grp;
    }
    const schoolGrp = school();
    base.place(schoolGrp, SCH.x, SCH.z, { keep: 1.9 });
    schoolGrp.position.y -= 0.04;
    bake(schoolGrp);
    bellPivot.userData.dynamic = true;
    updates.push((dt, t) => { bellPivot.rotation.z = Math.sin(t * 1.9) * 0.32 * calm; });

    /* ------------------------------------------------------------------
       Rechenrakete auf ihrer schrägen Startrampe (rechts) – die Rampe ist
       ein Zahlenstrahl 0 … 20
       ------------------------------------------------------------------ */
    const RAMP = { x: 1.85, z: -0.55, tilt: 0.5 };
    function ramp() {
      const grp = new T.Group();
      grp.name = 'raketenrampe';
      const P = new kit.Parts();
      const tilt = RAMP.tilt, Lr = 3.3, y0 = 0.3;
      const along = (d, off = 0, dz = 0) => [Math.sin(tilt) * d + Math.cos(tilt) * off, y0 + Math.cos(tilt) * d - Math.sin(tilt) * off, dz];
      // Startplatte
      P.add(xf(geo.cyl(0.62, 0.7, 0.2, 12), [0.15, 0.1, 0]), '#e9edf2', { gloss: true, grad: [0.72, 1.05] });
      P.add(xf(geo.cyl(0.64, 0.64, 0.06, 12), [0.15, 0.19, 0]), ACC, { gloss: true });
      // Schiene: Zahlenstrahl-Brett mit orangen Kanten
      const rot = [0, 0, -tilt];
      P.add(xf(geo.roundBox(0.56, Lr, 0.1, 0.03, 1), along(Lr / 2), rot), '#fff6e6', { grad: [0.9, 1.04] });
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.09, Lr + 0.06, 0.17, 0.03, 1), along(Lr / 2, s * 0.3), rot), ACC, { gloss: true, grad: [0.8, 1.08] }));
      // Striche (alle 0.13) und Zahlen (jeder 5. Strich)
      const step = 0.13;
      for (let i = 0; i <= 20; i++) {
        const d = 0.22 + i * step;
        const big = i % 5 === 0;
        P.add(xf(geo.box(big ? 0.22 : 0.12, big ? 0.035 : 0.025, 0.02), along(d, 0.15 - (big ? 0.0 : 0.05), 0.06), rot), NAVY, { grad: [1, 1] });
        if (big) text(grp, 'n' + i, i >= 10 ? 0.27 : 0.23, along(d, -0.11, 0.062), [0, 0, -tilt * 0.3]);
      }
      // Stützen (senkrecht) mit Querstrebe hinter der Schiene
      const top = along(2.55);
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.13, top[1], 0.13, 0.03, 1), [top[0] + 0.05, top[1] / 2, s * 0.24 - 0.1]), '#e9edf2', { grad: [0.7, 1.05] }));
      P.add(xf(geo.box(0.1, 0.1, 0.6), [top[0] + 0.05, top[1] * 0.55, -0.1]), ACC, {});
      P.add(xf(geo.box(0.1, 0.1, 0.6), [top[0] + 0.05, top[1] * 0.25, -0.1]), ACC, {});
      P.add(xf(geo.roundBox(0.5, 0.12, 0.6, 0.03, 1), [top[0] + 0.05, 0.06, -0.1]), C.stone, {});
      P.build(grp);
      return grp;
    }
    const rampGrp = ramp();
    base.place(rampGrp, RAMP.x, RAMP.z, { rotY: -0.18, keep: 1.0 });
    bake(rampGrp);
    base.keep(RAMP.x + 1.2, RAMP.z - 0.2, 0.9);
    // Rakete (eigene Gruppe, schwebt entlang der Rampe)
    function rocket() {
      const grp = new T.Group();
      grp.name = 'rakete';
      const P = new kit.Parts();
      const body = [[0.18, 0.0], [0.26, 0.12], [0.3, 0.38], [0.31, 0.72], [0.29, 1.0]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(body, 14), '#fbfbff', { gloss: true, smooth: true, grad: [0.8, 1.04] });
      const nose = [[0.29, 1.0], [0.25, 1.22], [0.17, 1.42], [0.08, 1.56], [0.001, 1.62]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(nose, 14), ACC, { gloss: true, smooth: true, grad: [0.85, 1.1] });
      P.add(xf(geo.cyl(0.305, 0.305, 0.12, 14), [0, 0.2, 0]), ACC, { gloss: true, smooth: true });
      P.add(xf(geo.cyl(0.315, 0.315, 0.05, 14), [0, 0.98, 0]), C.gold, { gloss: true, smooth: true });
      // Bullauge (vorn)
      P.add(xf(new T.TorusGeometry(0.13, 0.035, 4, 12), [0, 0.68, 0.29]), C.gold, { gloss: true, smooth: true });
      P.add(xf(new T.CircleGeometry(0.12, 12), [0, 0.68, 0.3]), '#8fd3ff', { gloss: true, smooth: true, grad: [0.8, 1.15] });
      P.add(xf(new T.CircleGeometry(0.04, 6), [-0.04, 0.72, 0.305]), '#ffffff', { gloss: true });
      // drei Flossen (links, rechts, hinten)
      const fin = new T.Shape();
      fin.moveTo(0, 0); fin.lineTo(0.0, 0.5); fin.quadraticCurveTo(0.16, 0.28, 0.3, -0.14); fin.quadraticCurveTo(0.12, -0.06, 0, 0);
      [PI / 2, -PI / 2, PI].forEach((a) => {
        const q = new T.ExtrudeGeometry(fin, { depth: 0.07, bevelEnabled: false, curveSegments: 4 });
        q.translate(0.24, 0.02, -0.03);
        q.rotateY(a);
        P.add(q, ACC, { gloss: true, grad: [0.8, 1.08] });
      });
      // Düse
      P.add(xf(geo.cyl(0.13, 0.2, 0.16, 10), [0, -0.06, 0]), C.metal, { gloss: true, grad: [0.7, 1.1] });
      P.build(grp);
      // Flamme (unbeleuchtet, Verlauf gelb → orange)
      const fl = new T.ConeGeometry(0.15, 0.55, 8, 2, true);
      fl.rotateX(PI).translate(0, -0.27, 0);
      const flame = new T.Mesh(kit.paint(fl, '#ffffff', { grad: [1, 1] }), new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false }));
      const fc = flame.geometry.attributes.color, fp = flame.geometry.attributes.position;
      const cTop = new T.Color('#fff4a8'), cBot = new T.Color('#ff7a1a'), tmp = new T.Color();
      for (let i = 0; i < fp.count; i++) { const k = Math.min(1, Math.max(0, -fp.getY(i) / 0.55)); tmp.copy(cTop).lerp(cBot, k); fc.setXYZ(i, tmp.r, tmp.g, tmp.b); }
      flame.position.y = -0.13;
      flame.castShadow = false;
      flame.name = 'flamme';
      grp.add(flame);
      grp.userData.flame = flame;
      return grp;
    }
    const rk = rocket();
    {
      // Rakete auf dem oberen Teil der Rampe, vor dem Brett (lokal +z)
      rampGrp.updateMatrix();
      const tilt = RAMP.tilt, d = 1.55;
      const local = new T.Vector3(Math.sin(tilt) * d, 0.3 + Math.cos(tilt) * d, 0.36);
      const wp = local.applyMatrix4(rampGrp.matrix);
      rk.position.copy(wp);
      rk.rotation.set(0, rampGrp.rotation.y, -tilt);
      g.add(rk);
      rk.userData.dynamic = true;
      const p0 = rk.position.clone();
      const ax = new T.Vector3(Math.sin(tilt), Math.cos(tilt), 0).applyAxisAngle(new T.Vector3(0, 1, 0), rampGrp.rotation.y);
      const flame = rk.userData.flame;
      updates.push((dt, t) => {
        const h = Math.sin(t * 1.3) * 0.1 * calm;
        rk.position.copy(p0).addScaledVector(ax, h + 0.05);
        flame.scale.set(1 + Math.sin(t * 23) * 0.08 * calm, 0.85 + (Math.sin(t * 17) * 0.5 + 0.5) * 0.35 * calm, 1);
      });
      // Dampfwölkchen an der Startplatte (instanziert)
      const n = 6;
      const puffs = new T.InstancedMesh(kit.paint(new T.IcosahedronGeometry(0.2, 0), '#ffffff', { grad: [0.85, 1.05] }), kit.mats.matte, n);
      puffs.name = 'dampf';
      puffs.castShadow = false;
      puffs.userData.dynamic = true;
      puffs.frustumCulled = false;
      const base0 = new T.Vector3(0.15, 0.25, 0).applyMatrix4(rampGrp.matrix);
      const dm = new T.Object3D();
      const setP = (t) => {
        for (let i = 0; i < n; i++) {
          const ph = ((t * 0.35 * Math.max(calm, 0.2) + i / n) % 1);
          const a = (i / n) * TAU + 0.6;
          const r = 0.45 + ph * 0.6;
          dm.position.set(base0.x + Math.cos(a) * r, base0.y + ph * 0.35, base0.z + Math.sin(a) * r * 0.8);
          const s = Math.sin(ph * PI) * (0.7 + (i % 3) * 0.15);
          dm.scale.setScalar(Math.max(0.001, s));
          dm.updateMatrix();
          puffs.setMatrixAt(i, dm.matrix);
        }
        puffs.instanceMatrix.needsUpdate = true;
      };
      setP(0);
      g.add(puffs);
      updates.push((dt, t) => setP(t));
    }

    /* ------------------------------------------------------------------
       Zehnerfeld-Tafel mit 10 Kugeln (vorne links)
       ------------------------------------------------------------------ */
    function tenFrame() {
      const grp = new T.Group();
      grp.name = 'zehnerfeld';
      const P = new kit.Parts();
      const fw = 2.0, fh = 0.86, y0 = 0.82, lean = -0.14;
      const cy = y0 + fh / 2;
      [-1, 1].forEach((s) => {
        P.add(xf(geo.box(0.12, cy + 0.2, 0.12), [s * (fw / 2 - 0.12), (cy + 0.2) / 2, -0.12]), C.wood, { grad: [0.7, 1.05] });
        P.add(xf(geo.box(0.18, 0.08, 0.6), [s * (fw / 2 - 0.12), 0.04, -0.08]), C.woodDark, {});
      });
      const B = new kit.Parts();
      B.add(xf(geo.roundBox(fw + 0.2, fh + 0.2, 0.12, 0.05), [0, 0, -0.02]), ACC, { gloss: true, grad: [0.8, 1.06] });
      B.add(xf(geo.roundBox(fw, fh, 0.08, 0.02, 1), [0, 0, 0.03]), '#fffaf0', { grad: [0.95, 1.02] });
      for (let i = 1; i < 5; i++) B.add(xf(geo.box(0.025, fh, 0.02), [-fw / 2 + (i * fw) / 5, 0, 0.075]), '#c9b9a6', { grad: [1, 1] });
      B.add(xf(geo.box(fw, 0.025, 0.02), [0, 0, 0.075]), '#c9b9a6', { grad: [1, 1] });
      B.add(xf(geo.roundBox(0.5, 0.3, 0.1, 0.05, 1), [0, fh / 2 + 0.22, -0.02]), ACC, { gloss: true });
      const bg = B.build();
      bg.position.set(0, cy, 0);
      bg.rotation.x = lean;
      grp.add(bg);
      P.build(grp);
      // „10“ auf dem Reiter (im Raum der schrägen Tafel)
      grp.userData.boardMatrix = new T.Matrix4().compose(new T.Vector3(0, cy, 0), new T.Quaternion().setFromEuler(new T.Euler(lean, 0, 0)), new T.Vector3(1, 1, 1));
      text(grp, 'zehn', 0.34, [0, fh / 2 + 0.22, 0.036], null);
      // Kugeln (instanziert): oben 5 rot, unten 5 blau
      const ballGeo = kit.paint(new T.SphereGeometry(0.15, 8, 5), '#ffffff', { grad: [0.78, 1.08] });
      const balls = new T.InstancedMesh(ballGeo, kit.mats.glossSmooth, 10);
      balls.name = 'kugeln';
      balls.castShadow = true;
      balls.receiveShadow = true;
      balls.userData.dynamic = true;
      const cc = new T.Color();
      for (let i = 0; i < 10; i++) balls.setColorAt(i, cc.set(i < 5 ? '#ff4d4d' : '#3f9bff'));
      bg.add(balls);
      const d = new T.Object3D();
      const cell = (i) => [-fw / 2 + ((i % 5) + 0.5) * (fw / 5), i < 5 ? fh / 4 : -fh / 4];
      const setB = (t) => {
        // Zählwelle: Kugel für Kugel hüpft (1 … 10), dann Pause
        const cyc = (t * 1.6) % 13;
        for (let i = 0; i < 10; i++) {
          const [x, y] = cell(i);
          const k = cyc - i;
          const hop = k > 0 && k < 1 ? Math.sin(k * PI) : 0;
          d.position.set(x, y + hop * 0.12 * calm, 0.17 + hop * 0.12 * calm);
          d.scale.setScalar(1 + hop * 0.15 * calm);
          d.updateMatrix();
          balls.setMatrixAt(i, d.matrix);
        }
        balls.instanceMatrix.needsUpdate = true;
      };
      setB(0);
      balls.computeBoundingSphere();
      updates.push((dt, t) => setB(t));
      return grp;
    }
    const tf = tenFrame();
    base.place(tf, -2.4, 1.75, { rotY: 0.5, keep: 1.1 });
    bake(tf, tf.userData.boardMatrix);

    /* ------------------------------------------------------------------
       Kaufladen-Stand mit Sonnendach, Obstkisten und Münzen (hinten links)
       ------------------------------------------------------------------ */
    function shop() {
      const grp = new T.Group();
      grp.name = 'kaufladen';
      const P = new kit.Parts();
      const sw = 1.7, sd = 0.72;
      P.add(xf(geo.roundBox(sw, 0.78, sd, 0.06), [0, 0.39, 0]), '#fff1dc', { grad: [0.78, 1.04] });
      // senkrechte orange Latten an der Front
      for (let i = 0; i < 4; i++) P.add(xf(geo.box(0.24, 0.62, 0.04), [-0.6 + i * 0.4, 0.4, sd / 2 + 0.01]), i % 2 ? '#ffd8a8' : ACC_L, { grad: [0.85, 1.05] });
      P.add(xf(geo.roundBox(sw + 0.12, 0.08, sd + 0.12, 0.03, 1), [0, 0.81, 0]), C.wood, { grad: [0.85, 1.05] });
      // Pfosten
      // gestreiftes Sonnendach (nach vorn geneigt) mit Bogenkante
      const nS = 7, aw = sw + 0.3, ad = sd + 0.55, slope = 0.32;
      const roofY = (z) => 2.0 - Math.tan(slope) * (z - 0.12) - 0.03;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([s, t]) => { const z = t * (sd / 2 - 0.04), h = roofY(z); P.add(xf(geo.cyl(0.045, 0.05, h, 6), [s * (sw / 2 - 0.05), h / 2, z]), '#ffffff', { grad: [0.8, 1.05] }); });
      for (let i = 0; i < nS; i++) {
        const x = -aw / 2 + (i + 0.5) * (aw / nS);
        const col = i % 2 ? '#ffffff' : ACC;
        P.add(xf(geo.roundBox(aw / nS + 0.005, 0.05, ad, 0.02, 1), [x, 2.0, 0.12], [slope, 0, 0]), col, { grad: [0.88, 1.05] });
        const sc = new T.CylinderGeometry(aw / nS / 2, aw / nS / 2, 0.05, 6, 1, false, -PI / 2, PI);
        P.add(xf(sc, [x, 2.0 - Math.sin(slope) * (ad / 2) - 0.02, 0.12 + Math.cos(slope) * (ad / 2) + 0.0], [PI / 2 + slope, 0, 0]), col, { grad: [0.88, 1.05] });
      }
      // Obstkisten mit Äpfeln und Orangen
      const crate = (x, z, fruit) => {
        P.add(xf(geo.roundBox(0.44, 0.18, 0.32, 0.02, 1), [x, 0.94, z]), C.woodLight, { grad: [0.8, 1.04] });
        const r = kit.rng(Math.round(x * 100 + 7));
        for (let k = 0; k < 6; k++) P.add(xf(new T.IcosahedronGeometry(0.08, 0), [x - 0.13 + (k % 3) * 0.13 + (r() - 0.5) * 0.02, 1.06 + (k > 2 ? 0.02 : 0), z - 0.06 + Math.floor(k / 3) * 0.12], [r(), r(), 0]), fruit, { gloss: true, grad: [0.8, 1.1] });
      };
      crate(-0.5, -0.05, '#ff3b3b');
      crate(-0.02, 0.06, '#ff9a2e');
      // Kasse
      P.add(xf(geo.roundBox(0.34, 0.2, 0.28, 0.04, 1), [0.5, 0.95, -0.02]), '#4aa8ff', { gloss: true, grad: [0.8, 1.06] });
      P.add(xf(geo.roundBox(0.3, 0.14, 0.04, 0.02, 1), [0.5, 1.11, -0.1], [-0.3, 0, 0]), '#2f3f6b', { gloss: true });
      // Münzstapel
      [[0.4, 0.22, 3], [0.6, 0.18, 5]].forEach(([x, z, n]) => {
        for (let k = 0; k < n; k++) P.add(xf(geo.cyl(0.075, 0.075, 0.03, 8), [x + (k % 2) * 0.006, 0.865 + k * 0.032, z]), k % 3 === 2 ? '#d9dee5' : C.gold, { gloss: true, grad: [0.85, 1.1] });
      });
      // Preisschild-Stäbchen
      [[-0.5, 0.15], [-0.02, 0.26]].forEach(([x, z]) => {
        P.add(xf(geo.box(0.02, 0.3, 0.02), [x + 0.16, 1.07, z]), '#ffffff', {});
        P.add(xf(geo.box(0.3, 0.17, 0.02), [x + 0.16, 1.27, z]), '#fffaf0', {});
      });
      P.build(grp);
      text(grp, 'euro', 0.27, [-0.34, 1.27, 0.162]);
      text(grp, 'ct', 0.27, [0.14, 1.27, 0.272]);
      return grp;
    }
    const sh = shop();
    base.place(sh, -2.85, -0.7, { rotY: 0.78, keep: 1.15 });
    bake(sh);
    // große Goldmünze über dem Stand (dreht sich)
    (function bigCoin() {
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.42, 0.42, 0.1, 18), [0, 0, 0], [PI / 2, 0, 0]), C.gold, { gloss: true, grad: [0.85, 1.1] });
      [-1, 1].forEach((s) => {
        P.add(xf(new T.TorusGeometry(0.34, 0.025, 3, 16), [0, 0, s * 0.052]), '#f0b81f', { gloss: true });
        // erhabene „1“ (hinten gespiegelt, damit sie von beiden Seiten richtig herum steht)
        P.add(xf(geo.box(0.09, 0.4, 0.04), [s * 0.02, -0.01, s * 0.06]), '#f0b81f', { gloss: true });
        P.add(xf(geo.box(0.06, 0.16, 0.04), [s * -0.06, 0.13, s * 0.06], [0, 0, s * -0.9]), '#f0b81f', { gloss: true });
        P.add(xf(geo.box(0.22, 0.06, 0.04), [s * 0.02, -0.19, s * 0.06]), '#f0b81f', { gloss: true });
      });
      const coin = P.build();
      coin.name = 'muenze';
      sh.updateMatrix();
      const p = new T.Vector3(0, 2.62, 0.05).applyMatrix4(sh.matrix);
      coin.position.copy(p);
      g.add(coin);
      kit.spin(coin, { speed: 1.1 });
      kit.float(coin, { amp: 0.08, speed: 0.9, phase: 1.2 });
    })();

    /* ------------------------------------------------------------------
       Zahlenmauer aus Ziegeln: 2 3 4 → 5 7 → 12 (vorne rechts)
       ------------------------------------------------------------------ */
    function numberWall() {
      const grp = new T.Group();
      grp.name = 'zahlenmauer';
      const P = new kit.Parts();
      const bw = 0.72, bh = 0.44, bd = 0.42, gap = 0.05;
      const rows = [['2', '3', '4'], ['5', '7'], ['12']];
      const cols = ['#e8590c', '#f76707', '#d9480f', '#fd7e14', '#e8590c', '#f08c00'];
      const r = kit.rng(77);
      P.add(xf(geo.roundBox(3 * bw + 0.3, 0.1, bd + 0.24, 0.04, 1), [0, 0.05, 0]), C.stone, { grad: [0.75, 1] });
      let n = 0;
      rows.forEach((row, ri) => {
        row.forEach((tx, i) => {
          const x = (i - (row.length - 1) / 2) * (bw + gap);
          const y = 0.1 + ri * (bh + gap) + bh / 2;
          const ry = (r() - 0.5) * 0.06;
          P.add(xf(geo.roundBox(bw, bh, bd, 0.06), [x, y, 0], [0, ry, 0]), cols[n++ % cols.length], { gloss: true, grad: [0.82, 1.06], jitter: 0.03, seed: n });
          text(grp, 'w' + tx, 0.36, [x + Math.sin(ry) * (bd / 2 + 0.01), y, Math.cos(ry) * (bd / 2 + 0.01)], [0, ry, 0]);
        });
      });
      // ein loser Ziegel mit „?“ daneben
      P.add(xf(geo.roundBox(bw * 0.8, bh * 0.8, bd * 0.8, 0.05), [1.45, 0.18, 0.32], [0, -0.5, 0]), '#ffa94d', { gloss: true, grad: [0.82, 1.06] });
      text(grp, 'w?', 0.3, [1.45 + Math.sin(-0.5) * (bd * 0.4 + 0.01), 0.18, 0.32 + Math.cos(-0.5) * (bd * 0.4 + 0.01)], [0, -0.5, 0]);
      P.build(grp);
      return grp;
    }
    const nw = numberWall();
    base.place(nw, 2.35, 2.0, { rotY: -0.42, keep: 1.2 });
    bake(nw);

    /* ------------------------------------------------------------------
       Schulranzen vor der Tür, Weg, Pflanzen
       ------------------------------------------------------------------ */
    (function satchel() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.46, 0.5, 0.26, 0.08), [0, 0.25, 0]), '#3f9bff', { gloss: true, grad: [0.8, 1.06] });
      P.add(xf(geo.roundBox(0.48, 0.3, 0.08, 0.06), [0, 0.38, 0.13], [-0.12, 0, 0]), ACC, { gloss: true, grad: [0.85, 1.06] });
      P.add(xf(geo.roundBox(0.12, 0.06, 0.04, 0.02, 1), [0, 0.26, 0.18]), C.gold, { gloss: true });
      P.add(xf(new T.TorusGeometry(0.1, 0.022, 4, 8, PI), [0, 0.5, -0.02]), '#2f3f6b', {});
      P.add(xf(new T.IcosahedronGeometry(0.05, 0), [0.14, 0.1, 0.14]), '#ffd23f', { gloss: true });
      const m = P.build();
      m.name = 'schulranzen';
      base.place(m, 0.95, -0.55, { rotY: -0.5, keep: 0.4 });
    })();

    /* Himmel und Hölle (1 … 8) auf der Wiese vorn links – folgt dem Boden */
    (function hopscotch(cx, cz, ry) {
      const P = new kit.Parts();
      const sq = 0.42, gap = 0.05, st = sq + gap;
      const layout = [[0, '1'], [0, '2'], [0, '3'], [-1, '4'], [1, '5'], [0, '6'], [-1, '7'], [1, '8']];
      const cols = [ACC, '#3f9bff', '#2fb36b', '#ff5f9e'];
      const cs = Math.cos(ry), sn = Math.sin(ry);
      const at = (lx, lz) => [cx + lx * cs + lz * sn, cz - lx * sn + lz * cs];
      let row = 0;
      layout.forEach(([side, n], i) => {
        if (i > 0 && side !== 1) row++;
        const [x, z] = at(side * st * 0.5, -row * st);
        const y = ground(x, z);
        P.add(xf(geo.box(sq, 0.05, sq), [x, y + 0.012, z], [0, ry, 0]), cols[i % cols.length], { grad: [1, 1] });
        textQuads.push(xf(xf(A.quad('w' + n, sq * 0.8), null, [-PI / 2, 0, 0]), [x, y + 0.04, z], [0, ry, 0]));
        base.keep(x, z, 0.3);
      });
      const m = P.build();
      m.name = 'hupfspiel';
      g.add(m);
    })(-0.85, 3.85, 0.22);
    kit.path(base, [[0.55, 4.75], [0.3, 3.2], [-0.25, 1.6], [-0.2, 0.2], [-0.15, -0.6]], { seed: 131, width: 0.66 });

    base.place(kit.tree({ type: 'pine', seed: 1311, scale: 1.05 }), -3.05, -2.45, { keep: 0.7 });
    base.place(kit.tree({ type: 'fruit', seed: 1312, fruitColor: '#ff9a2e', scale: 0.95 }), 3.25, -2.45, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 1313, scale: 0.9 }), -1.85, -3.65, { keep: 0.6 });
    base.place(kit.tree({ type: 'pine', seed: 1314, scale: 0.75 }), 1.65, -3.55, { keep: 0.5 });
        base.place(kit.bush({ seed: 1316, size: 0.7 }), 1.45, 0.75, { keep: 0.45 });
    base.place(kit.bush({ seed: 1317, size: 0.65, berries: '#ff7aa8' }), -3.75, 0.95, { keep: 0.4 });
    base.place(kit.rock({ size: 0.45, seed: 1318, moss: true }), 3.65, 0.6, { keep: 0.35 });
    base.place(kit.lamp({}), 1.2, 3.75, { keep: 0.3 });
    kit.grassTufts(base, 42, 131);
    kit.flowers(base, 12, ['#ffd23f', '#ffffff', '#ff7aa8', ACC_L], 131);

    // Kontaktschatten
    [[SCH.x, SCH.z + 0.2, 2.0], [RAMP.x + 0.6, RAMP.z, 1.1], [-2.85, -0.7, 1.1], [-2.4, 1.75, 1.0], [2.35, 2.0, 1.2]].forEach(([x, z, r]) => {
      const s = kit.shadowBlob(r);
      s.position.set(x, ground(x, z) + 0.03, z);
      g.add(s);
    });

    // statische Beschriftungen (ein Mesh)
    const tm = new T.Mesh(T.addons.mergeGeometries(textQuads, false), A.mat);
    tm.name = 'beschriftung';
    tm.renderOrder = 2;
    tm.receiveShadow = true;
    tm.castShadow = false;
    tm.userData.noMerge = true;
    g.add(tm);

    if (window.__w3dTris) window.__w3dTris('mathe1', g);
    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 6.6, -1.6),
        focus: new T.Vector3(0, 1.6, -0.4),
      },
    };
  });
})();
