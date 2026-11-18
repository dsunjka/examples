/* ==========================================================================
   js/world3d/islands/denken.js – Denk-Insel (türkis)

   Wahrzeichen: ein Ideen-Turm mit einer riesigen, sanft leuchtenden
   Glühbirne (mit pulsierenden Strahlen und Zahnrädern, die sich drehen) und
   ein Puzzle-Denkmal aus zwei ineinander greifenden Riesen-Puzzleteilen,
   über denen das dritte Teil schwebt, bereit zum Einrasten.
   Dazu ein Hecken-Labyrinth mit goldenem Stern in der Mitte, ein schräger
   Memory-Tisch (ein Kärtchen dreht sich immer wieder um), eine Detektiv-Lupe,
   die über einer Pfotenspur schwebt, und eine Fragezeichen-Hecke.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'denken', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#1fb5c9';
    const calm = W.reducedMotion ? 0.12 : 1;
    const PAL = { yellow: '#ffd23f', coral: '#ff7a6b', violet: '#9b7bff', red: '#ff5a5f', white: '#fffaf2' };
    const updates = [];

    const base = kit.islandBase({ seed: 53, radius: 6.1, grassRadius: 4.75, grass: '#7fd65f', stones: 5 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* ------------------------------------------------------------------
       Ideen-Turm mit Glühbirne (hinten links)
       ------------------------------------------------------------------ */
    const bulbMat = new T.MeshStandardMaterial({ color: '#fff4c2', emissive: '#ffcf4a', emissiveIntensity: 0.75, roughness: 0.22, metalness: 0, flatShading: false });
    bulbMat.name = 'denken-birne';
    function ideaTower() {
      const grp = new T.Group();
      grp.name = 'ideenturm';
      const P = new kit.Parts();
      const wall = '#fbf6ee';
      // Sockel und Turm
      P.add(xf(geo.cyl(0.92, 1.02, 0.26, 14), [0, 0.13, 0]), C.stone, { grad: [0.72, 1.02] });
      P.add(xf(geo.cyl(0.52, 0.66, 2.3, 14), [0, 0.26 + 1.15, 0]), wall, { grad: [0.84, 1.05] });
      // Türkise Bänder
      P.add(xf(geo.cyl(0.66, 0.69, 0.16, 14), [0, 0.36, 0]), ACC, { gloss: true, grad: [0.8, 1.05] });
      P.add(xf(geo.cyl(0.6, 0.62, 0.12, 14), [0, 1.42, 0]), ACC, { gloss: true, grad: [0.8, 1.05] });
      // Balkon mit Geländer
      P.add(xf(geo.cyl(0.84, 0.72, 0.18, 16), [0, 2.62, 0]), ACC, { gloss: true, grad: [0.78, 1.06] });
      P.add(xf(new T.TorusGeometry(0.8, 0.035, 4, 20), [0, 2.98, 0], [PI / 2, 0, 0]), '#ffffff', {});
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + 0.2;
        P.add(xf(geo.cyl(0.025, 0.025, 0.28, 4), [Math.cos(a) * 0.8, 2.84, Math.sin(a) * 0.8]), '#ffffff', {});
      }
      // Fassung (gerippt)
      P.add(xf(geo.cyl(0.36, 0.42, 0.14, 12), [0, 2.78, 0]), '#5d6b7b', { gloss: true, grad: [0.8, 1.05] });
      for (let i = 0; i < 3; i++) P.add(xf(new T.TorusGeometry(0.3, 0.055, 4, 12), [0, 2.92 + i * 0.12, 0], [PI / 2, 0, 0]), '#b7c3cf', { gloss: true, smooth: true, grad: [0.85, 1.1] });
      P.add(xf(geo.cyl(0.31, 0.31, 0.36, 12), [0, 3.04, 0]), '#a3b0bd', { gloss: true, grad: [0.85, 1.05] });
      // Tür, Fenster
      P.add(xf(geo.roundBox(0.42, 0.66, 0.12, 0.06), [0, 0.6, 0.62]), '#5a8fa0', { grad: [0.8, 1.05] });
      P.add(xf(geo.roundBox(0.5, 0.07, 0.14, 0.02, 1), [0, 0.95, 0.63]), '#ffffff', {});
      P.add(xf(new T.IcosahedronGeometry(0.035, 0), [0.12, 0.6, 0.69]), C.gold, { gloss: true });
      [[1.05, -0.78], [1.05, 1.05], [2.0, -1.3]].forEach(([y, ry]) => {
        const r = 0.68 - (y - 0.26) * 0.061;
        const x = Math.sin(ry) * r, z = Math.cos(ry) * r;
        P.add(xf(geo.cyl(0.17, 0.17, 0.08, 10).rotateX(PI / 2), [x, y, z], [0, ry, 0]), '#ffffff', {});
        P.addRaw(kit.paint(xf(geo.cyl(0.12, 0.12, 0.08, 10).rotateX(PI / 2), [x + Math.sin(ry) * 0.02, y, z + Math.cos(ry) * 0.02], [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      });
      P.build(grp);

      // Glühbirne (leuchtet, pulsiert)
      const prof = [[0, 0], [0.28, 0], [0.3, 0.12], [0.27, 0.3], [0.36, 0.48], [0.55, 0.68], [0.64, 0.9], [0.62, 1.12], [0.52, 1.32], [0.33, 1.47], [0, 1.53]].map((p) => new T.Vector2(p[0], p[1]));
      const bulbGeo = new T.LatheGeometry(prof, 16);
      const bulb = new T.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 3.2;
      bulb.castShadow = true;
      grp.add(bulb);
      // Strahlen (pulsieren)
      const rays = new T.Group();
      rays.name = 'strahlen';
      const RP = new kit.Parts();
      for (let i = 0; i < 7; i++) {
        const a = PI * (-0.12 + (i / 6) * 1.24);
        const r0 = 1.02;
        RP.add(xf(geo.cyl(0.07, 0.07, 0.36, 6), [Math.cos(a) * (r0 + 0.18), Math.sin(a) * (r0 + 0.18), 0], [0, 0, a - PI / 2]), '#ffffff', { grad: [1, 1] });
      }
      RP.build(rays);
      rays.children.forEach((m) => { m.material = bulbMat; m.castShadow = false; });
      rays.position.set(0, 4.1, 0.05);
      rays.userData.dynamic = true;
      grp.add(rays);

      // Zahnräder vor der Turmwand (Turmradius ≈ 0.56 in dieser Höhe), drehen sich gegenläufig
      const gearA = gear(0.4, 10, ACC);
      gearA.position.set(-0.28, 1.95, 0.63);
      const gearB = gear(0.27, 7, PAL.yellow);
      gearB.position.set(0.32, 2.2, 0.63);
      gearB.rotation.z = 0.25;
      gearA.userData.dynamic = gearB.userData.dynamic = true;
      const gears = new T.Group();
      gears.add(gearA, gearB);
      gears.rotation.y = 0.45;
      grp.add(gears);

      updates.push((dt, t) => {
        const k = 0.5 + 0.5 * Math.sin(t * 1.7 * Math.max(calm, 0.3));
        bulbMat.emissiveIntensity = 0.62 + k * 0.38 * calm + (W.env ? W.env.nightness * 0.9 : 0);
        const s = 1 + (k - 0.5) * 0.16 * calm;
        rays.scale.set(s, s, 1);
        gearA.rotation.z += dt * 0.45 * calm;
        gearB.rotation.z -= dt * 0.45 * (10 / 7) * calm;
      });
      const halo = kit.glowHalo(2.6, '#ffe08a');
      halo.position.set(0, 4.1, 0);
      grp.add(halo);
      return grp;
    }
    /** Zahnrad (Mitte im Ursprung, zeigt nach +z) */
    function gear(r, teeth, color) {
      const s = new T.Shape();
      const r0 = r * 0.78, st = TAU / teeth;
      for (let i = 0; i < teeth; i++) {
        const a = i * st;
        const pts = [[r0, a], [r, a + st * 0.22], [r, a + st * 0.5], [r0, a + st * 0.72]];
        pts.forEach(([rr, aa], k) => { const x = Math.cos(aa) * rr, y = Math.sin(aa) * rr; if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y); });
      }
      s.closePath();
      const hole = new T.Path();
      hole.absarc(0, 0, r * 0.22, 0, TAU, true);
      s.holes.push(hole);
      const eg = new T.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false, curveSegments: 8 });
      eg.translate(0, 0, -0.06);
      const P = new kit.Parts();
      P.add(eg, color, { gloss: true, grad: [0.8, 1.08] });
      P.add(xf(geo.cyl(r * 0.24, r * 0.24, 0.16, 8).rotateX(PI / 2), [0, 0, 0]), '#5d6b7b', { gloss: true });
      const m = P.build();
      m.name = 'zahnrad';
      return m;
    }
    base.place(ideaTower(), -2.0, -2.0, { rotY: 0.32, keep: 1.15 });

    /* ------------------------------------------------------------------
       Puzzle-Denkmal (hinten rechts)
       ------------------------------------------------------------------ */
    /** Puzzleteil (Quadrat s, in der xy-Ebene, Mitte im Ursprung). sides = [unten, rechts, oben, links]: 1 Nase, -1 Loch, 0 glatt */
    function puzzleGeo(s, sides, depth) {
      const h = s / 2;
      const cs = [[-h, -h], [h, -h], [h, h], [-h, h]];
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const [x0, y0] = cs[e], [x1, y1] = cs[(e + 1) % 4];
        const dx = (x1 - x0) / s, dy = (y1 - y0) / s;
        const nx = dy, ny = -dx;
        const k = sides[e];
        pts.push([x0, y0]);
        if (!k) continue;
        const at = (u, v) => [x0 + dx * u * s + nx * v * s * k, y0 + dy * u * s + ny * v * s * k];
        pts.push(at(0.38, 0));
        const N = 7, a0 = 4.142, a1 = -1.0;
        for (let i = 0; i <= N; i++) { const a = a0 + ((a1 - a0) * i) / N; pts.push(at(0.5 + 0.13 * Math.cos(a), 0.17 + 0.13 * Math.sin(a))); }
        pts.push(at(0.62, 0));
      }
      const sh = new T.Shape(pts.map((p) => new T.Vector2(p[0], p[1])));
      const eg = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 1 });
      eg.translate(0, 0, -depth / 2);
      return eg;
    }
    const PZ = 1.3, PD = 0.3;
    function puzzleMonument() {
      const grp = new T.Group();
      grp.name = 'puzzle';
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(3.15, 0.24, 0.95, 0.07), [0, 0.12, 0]), C.stone, { grad: [0.72, 1.02] });
      P.add(xf(geo.roundBox(2.9, 0.08, 0.75, 0.03, 1), [0, 0.27, 0]), kit.shade(C.stone, 1.05), { grad: [0.9, 1.02] });
      const y0 = 0.31 + PZ / 2;
      P.add(xf(puzzleGeo(PZ, [0, 1, 1, 0], PD), [-PZ / 2 - 0.015, y0, 0]), ACC, { gloss: true, grad: [0.78, 1.08] });
      P.add(xf(puzzleGeo(PZ, [0, 0, 1, -1], PD), [PZ / 2 + 0.015, y0, 0]), PAL.yellow, { gloss: true, grad: [0.8, 1.06] });
      P.build(grp);
      // schwebendes drittes Teil über dem gelben (Loch unten passt auf die Nase)
      const fl = new T.Group();
      const FP = new kit.Parts();
      FP.add(puzzleGeo(PZ, [-1, 1, 0, -1], PD), PAL.coral, { gloss: true, grad: [0.8, 1.08] });
      FP.build(fl);
      fl.position.set(PZ / 2 + 0.015, y0 + PZ + 0.42, 0);
      fl.userData.dynamic = true;
      grp.add(fl);
      const fy = fl.position.y;
      updates.push((dt, t) => {
        fl.position.y = fy + Math.sin(t * 1.2) * 0.13 * calm;
        fl.rotation.z = Math.sin(t * 0.8 + 1) * 0.07 * calm;
        fl.rotation.y = Math.sin(t * 0.6) * 0.12 * calm;
      });
      return grp;
    }
    base.place(puzzleMonument(), 1.55, -2.05, { rotY: -0.28, keep: 1.4 });
    // ein lila Teil liegt vorn im Gras (fast fertig!)
    (function fallenPiece() {
      const m = kit.mesh(puzzleGeo(0.62, [1, 0, -1, 1], 0.16), PAL.violet, { gloss: true, grad: [0.85, 1.05] });
      m.rotation.set(-PI / 2 + 0.12, 0, 0.6);
      const o = new T.Group();
      o.add(m);
      base.place(o, 0.55, -0.55, { y: 0.1, keep: 0.45 });
    })();

    /* ------------------------------------------------------------------
       Hecken-Labyrinth mit Stern (rechts)
       ------------------------------------------------------------------ */
    function maze() {
      const grp = new T.Group();
      grp.name = 'labyrinth';
      const P = new kit.Parts();
      const cell = 0.5, N = 5, off = (N * cell) / 2;
      const H = 0.42, TH = 0.17;
      // Segmente in Zellen-Koordinaten [x0, z0, x1, z1]
      const segs = [
        [0, 0, 5, 0], [0, 0, 0, 5], [5, 0, 5, 5], [0, 5, 2, 5], [3, 5, 5, 5],
        [1, 1, 4, 1], [1, 1, 1, 4], [4, 1, 4, 3], [1, 4, 2, 4], [3, 4, 4, 4],
        [2, 2, 3, 2], [2, 2, 2, 3], [3, 3, 3, 4], [4, 3, 4, 4],
      ];
      const hedge = '#3fae48';
      segs.forEach(([a, b, c, d], i) => {
        const x0 = a * cell - off, z0 = b * cell - off, x1 = c * cell - off, z1 = d * cell - off;
        const len = Math.hypot(x1 - x0, z1 - z0) + TH;
        const horiz = Math.abs(z1 - z0) < 1e-6;
        const box = geo.roundBox(horiz ? len : TH, H, horiz ? TH : len, 0.07);
        P.add(xf(box, [(x0 + x1) / 2, H / 2 - 0.08, (z0 + z1) / 2]), kit.shade(hedge, 0.94 + (i % 3) * 0.05), { grad: [0.6, 1.14], jitter: 0.05, seed: i });
      });
      // Eckkugeln am Eingang
      [[2, 5], [3, 5]].forEach(([a, b], i) => P.add(xf(new T.IcosahedronGeometry(0.17, 1), [a * cell - off, H + 0.02, b * cell - off]), kit.shade(hedge, 1.1), { grad: [0.7, 1.12], jitter: 0.04, seed: 40 + i }));
      // heller Kiesboden
      P.add(xf(geo.cyl(off * 1.02, off * 1.06, 0.06, 4), [0, -0.02, 0], [0, PI / 4, 0], [1.41, 1, 1.41]), '#efe2c4', { grad: [1, 1], jitter: 0.03 });
      P.build(grp);
      const star = kit.star(C.gold, 0.62);
      const st = new T.Group();
      st.add(star);
      st.position.set(0.25, 0.62, 0.25);
      st.userData.dynamic = true;
      grp.add(st);
      updates.push((dt, t) => { st.rotation.y += dt * 1.1 * calm; st.position.y = 0.66 + Math.sin(t * 1.6) * 0.08 * calm; });
      return grp;
    }
    base.place(maze(), 2.45, 0.75, { rotY: -0.42, keep: 1.55 });

    /* ------------------------------------------------------------------
       Memory-Tisch (links): schräges Brett mit Kärtchen
       ------------------------------------------------------------------ */
    const cards = kit.canvasTexture(1024, 256, (c, w, h) => {
      const S = h;
      const rrect = (x, y, ww, hh, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, ww, hh, r); else c.rect(x, y, ww, hh); };
      // 0: Rückseite
      const gr = c.createLinearGradient(0, 0, 0, S);
      gr.addColorStop(0, kit.shade(ACC, 1.15)); gr.addColorStop(1, kit.shade(ACC, 0.88));
      c.fillStyle = gr; rrect(6, 6, S - 12, S - 12, 26); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 8; rrect(22, 22, S - 44, S - 44, 18); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.18)';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(48 + i * 53, 48 + j * 53, 7, 0, TAU); c.fill(); }
      c.font = `700 ${Math.round(S * 0.62)}px ${kit.fonts.num}`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba(0,60,70,0.28)'; c.fillText('?', S / 2 + 5, S / 2 + 14);
      c.fillStyle = '#ffffff'; c.fillText('?', S / 2, S / 2 + 8);
      // Vorderseiten: weiß mit Bild
      for (let k = 1; k < 4; k++) {
        const x = k * S;
        c.fillStyle = '#fffdf8'; rrect(x + 6, 6, S - 12, S - 12, 26); c.fill();
        c.strokeStyle = kit.shade(ACC, 1.0); c.lineWidth = 8; rrect(x + 18, 18, S - 36, S - 36, 18); c.stroke();
        const cx = x + S / 2, cy = S / 2;
        if (k === 1) { // Herz
          c.fillStyle = '#ff4f6d';
          c.beginPath(); c.moveTo(cx, cy + 62);
          c.bezierCurveTo(cx - 96, cy + 2, cx - 66, cy - 78, cx, cy - 34);
          c.bezierCurveTo(cx + 66, cy - 78, cx + 96, cy + 2, cx, cy + 62); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(cx - 34, cy - 26, 14, 9, -0.6, 0, TAU); c.fill();
        } else if (k === 2) { // Stern
          c.fillStyle = '#ffc61a';
          c.beginPath();
          for (let i = 0; i < 10; i++) { const r = i % 2 ? 34 : 80, a = -PI / 2 + (i / 10) * TAU; const px = cx + Math.cos(a) * r, py = cy + 6 + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
          c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(cx - 18, cy - 20, 10, 6, -0.6, 0, TAU); c.fill();
        } else { // Apfel
          c.fillStyle = '#ff5a4f';
          c.beginPath(); c.arc(cx - 28, cy + 14, 52, 0, TAU); c.arc(cx + 28, cy + 14, 52, 0, TAU); c.fill();
          c.strokeStyle = '#7a4b2a'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy - 30); c.lineTo(cx + 6, cy - 62); c.stroke();
          c.fillStyle = '#4fbf4a'; c.beginPath(); c.ellipse(cx + 30, cy - 56, 24, 11, -0.4, 0, TAU); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(cx - 46, cy - 6, 12, 18, 0.3, 0, TAU); c.fill();
        }
      }
    });
    const cardMat = new T.MeshStandardMaterial({ map: cards, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    cardMat.name = 'denken-karten';
    /** Viereck (liegend, Normale +y) mit Atlas-Zelle i */
    function cardQuad(i, w, d) {
      const q = new T.PlaneGeometry(w, d).rotateX(-PI / 2);
      const uv = q.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (i + uv.getX(k)) / 4, uv.getY(k));
      return q;
    }
    function memoryTable() {
      const grp = new T.Group();
      grp.name = 'memory';
      const P = new kit.Parts();
      const wood = '#c98d58';
      // Beine (hinten länger → Brett schräg zur Kamera)
      [[-0.85, 0.5, 0.5], [0.85, 0.5, 0.5], [-0.85, -0.5, 0.95], [0.85, -0.5, 0.95]].forEach(([x, z, h]) => P.add(xf(geo.roundBox(0.1, h, 0.1, 0.03, 1), [x, h / 2, z]), kit.shade(wood, 0.85), { grad: [0.7, 1.02] }));
      P.build(grp);
      const board = new T.Group();
      const BP = new kit.Parts();
      BP.add(xf(geo.roundBox(2.15, 0.12, 1.55, 0.05), [0, 0, 0]), wood, { grad: [0.8, 1.04] });
      BP.add(xf(geo.roundBox(2.0, 0.04, 1.4, 0.03, 1), [0, 0.07, 0]), kit.shade(ACC, 1.25), { grad: [1, 1] });
      const CW = 0.5, CD = 0.56;
      const layout = [[1, 0, 1], [2, 0, 0]]; // Zellen je Platz (0 = Rückseite)
      const quads = [];
      let flipSpot = null;
      layout.forEach((row, rI) => row.forEach((cell, cI) => {
        const x = (cI - 1) * 0.62, z = (rI - 0.5) * 0.66;
        if (rI === 1 && cI === 2) { flipSpot = [x, z]; return; }
        BP.add(xf(geo.roundBox(CW, 0.05, CD, 0.02, 1), [x, 0.115, z]), '#ffffff', { grad: [0.9, 1] });
        quads.push(xf(cardQuad(cell, CW - 0.04, CD - 0.04), [x, 0.142, z]));
      }));
      BP.build(board);
      const qm = new T.Mesh(T.addons.mergeGeometries(quads, false), cardMat);
      qm.receiveShadow = true;
      qm.castShadow = false;
      board.add(qm);
      // Kärtchen, das sich umdreht (Rückseite ↔ Stern: das Paar ist gefunden!)
      // ein Mesh: Kärtchen-Körper nimmt ein weißes Texel aus dem Atlas, dazu beide Seiten
      const flip = new T.Group();
      const body = geo.roundBox(CW, 0.05, CD, 0.02, 1);
      const buv = new Float32Array(body.attributes.position.count * 2);
      for (let i = 0; i < buv.length; i += 2) { buv[i] = 0.26; buv[i + 1] = 0.5; }
      body.setAttribute('uv', new T.BufferAttribute(buv, 2));
      const fq = new T.Mesh(T.addons.mergeGeometries([body, xf(cardQuad(0, CW - 0.04, CD - 0.04), [0, 0.027, 0]).toNonIndexed(), xf(cardQuad(2, CW - 0.04, CD - 0.04), [0, -0.027, 0], [0, 0, PI]).toNonIndexed()], false), cardMat);
      fq.castShadow = true;
      fq.receiveShadow = true;
      flip.add(fq);
      flip.position.set(flipSpot[0], 0.115, flipSpot[1]);
      flip.userData.dynamic = true;
      board.add(flip);
      board.position.set(0, 0.78, 0);
      board.rotation.x = 0.42;
      grp.add(board);
      // Ablauf: liegen – hochheben und umdrehen – Stern zeigen – zurück
      updates.push((dt, t) => {
        const cyc = (t * Math.max(calm, 0.25)) % 6;
        let a = 0;
        if (cyc < 0.7) a = W.ease.inOutCubic(cyc / 0.7) * PI;
        else if (cyc < 3.4) a = PI;
        else if (cyc < 4.1) a = PI - W.ease.inOutCubic((cyc - 3.4) / 0.7) * PI;
        flip.rotation.z = a;
        flip.position.y = 0.115 + Math.sin(a) * 0.26;
      });
      return grp;
    }
    base.place(memoryTable(), -2.45, 0.85, { rotY: 0.38, keep: 1.3 });

    /* ------------------------------------------------------------------
       Pfotenspur mit schwebender Lupe (vorne)
       ------------------------------------------------------------------ */
    const trail = [];
    (function paws() {
      const P = new kit.Parts();
      const curve = new T.CatmullRomCurve3([[1.65, 3.55], [1.05, 2.85], [0.85, 2.05], [0.25, 1.45]].map((p) => new T.Vector3(p[0], 0, p[1])));
      const n = 7;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
        const side = i % 2 ? 1 : -1;
        const x = p.x - tg.z * side * 0.13, z = p.z + tg.x * side * 0.13;
        const ang = Math.atan2(tg.x, tg.z);
        trail.push(new T.Vector3(x, 0, z));
        const y = ground(x, z) + 0.035;
        const col = '#5e8f3c';
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const rot = (dx, dz) => [x + dx * ca + dz * sa, y, z - dx * sa + dz * ca];
        P.add(xf(new T.CircleGeometry(0.1, 8).rotateX(-PI / 2), rot(0, 0), [0, ang, 0], [1, 1, 1.15]), col, { grad: [1, 1] });
        [[-0.1, 0.12], [0, 0.16], [0.1, 0.12]].forEach(([dx, dz]) => P.add(xf(new T.CircleGeometry(0.042, 6).rotateX(-PI / 2), rot(dx, dz)), col, { grad: [1, 1] }));
      }
      const m = P.build(null, { castShadow: false });
      m.name = 'pfoten';
      g.add(m);
    })();
    function magnifier() {
      const grp = new T.Group();
      grp.name = 'lupe';
      const P = new kit.Parts();
      P.add(new T.TorusGeometry(0.46, 0.075, 6, 24), ACC, { gloss: true, smooth: true, grad: [0.8, 1.1] });
      P.add(xf(geo.cyl(0.085, 0.085, 0.18, 10), [0, -0.6, 0]), C.gold, { gloss: true, smooth: true, grad: [0.85, 1.1] });
      P.add(xf(geo.cyl(0.07, 0.095, 0.82, 10), [0, -1.08, 0]), '#2e6f86', { gloss: true, smooth: true, grad: [0.8, 1.06] });
      P.add(xf(new T.SphereGeometry(0.1, 10, 6), [0, -1.5, 0]), '#2e6f86', { gloss: true, smooth: true });
      P.build(grp);
      // Linse und Glanzlicht in einem Mesh (Farbe mit Deckkraft je Vertex)
      const rgba = (q, c, al) => { q = q.index ? q.toNonIndexed() : q; const n = q.attributes.position.count, a = new Float32Array(n * 4); for (let i = 0; i < n; i++) a.set([c[0], c[1], c[2], al], i * 4); q.setAttribute('color', new T.BufferAttribute(a, 4)); return q; };
      const shine = new T.Shape();
      shine.absarc(0, 0, 0.34, PI * 0.58, PI * 0.95, false);
      shine.absarc(0, 0, 0.27, PI * 0.95, PI * 0.58, true);
      const lensGeo = T.addons.mergeGeometries([rgba(new T.CircleGeometry(0.44, 24), [0.85, 0.97, 1], 0.3), rgba(new T.ShapeGeometry(shine, 6).translate(0, 0, 0.01), [1, 1, 1], 0.9)], false);
      const lens = new T.Mesh(lensGeo, new T.MeshStandardMaterial({ vertexColors: true, transparent: true, roughness: 0.05, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: T.DoubleSide }));
      lens.renderOrder = 3;
      lens.castShadow = false;
      grp.add(lens);
      return grp;
    }
    (function detective() {
      const lupe = magnifier();
      const holder = new T.Group();
      holder.name = 'lupe-flug';
      holder.add(lupe);
      lupe.rotation.set(-0.55, 0, 0.5);
      lupe.scale.setScalar(0.9);
      holder.userData.dynamic = true;
      g.add(holder);
      const curve = new T.CatmullRomCurve3(trail.map((p) => new T.Vector3(p.x, 0, p.z)));
      const tmp = new T.Vector3();
      const set = (t) => {
        const u = 0.5 + 0.42 * Math.sin(t * 0.32 * Math.max(calm, 0.2));
        curve.getPointAt(u, tmp);
        const y = ground(tmp.x, tmp.z);
        holder.position.set(tmp.x + 0.28, y + 1.5 + Math.sin(t * 1.5) * 0.06 * calm, tmp.z + 0.1);
        holder.rotation.y = 0.35 + Math.sin(t * 0.7) * 0.15 * calm;
      };
      set(0);
      updates.push((dt, t) => set(t));
    })();

    /* ------------------------------------------------------------------
       Fragezeichen-Hecke (vorne links)
       ------------------------------------------------------------------ */
    (function questionHedge() {
      const P = new kit.Parts();
      const pts = [];
      for (let i = 0; i <= 10; i++) { const a = PI * 1.05 - (i / 10) * PI * 1.55; pts.push(new T.Vector3(Math.cos(a) * 0.42, 1.62 + Math.sin(a) * 0.42, 0)); }
      pts.push(new T.Vector3(0.04, 1.1, 0), new T.Vector3(0.0, 0.98, 0));
      const tube = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 22, 0.15, 6, false);
      P.add(tube, '#46b84c', { grad: [0.6, 1.12], jitter: 0.06, seed: 3 });
      P.add(xf(new T.IcosahedronGeometry(0.155, 1), [0, 0.98, 0]), '#46b84c', { grad: [0.7, 1.1], jitter: 0.05 });
      P.add(xf(new T.IcosahedronGeometry(0.17, 1), [0, 0.52, 0]), '#46b84c', { grad: [0.6, 1.1], jitter: 0.05 });
      P.add(xf(geo.cyl(0.36, 0.28, 0.32, 10), [0, 0.16, 0]), ACC, { gloss: true, grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.39, 0.39, 0.07, 10), [0, 0.32, 0]), kit.shade(ACC, 1.15), { gloss: true });
      P.add(xf(geo.cyl(0.32, 0.32, 0.03, 10), [0, 0.35, 0]), '#7a5233', {});
      const m = P.build();
      m.name = 'fragezeichen';
      m.scale.setScalar(0.85);
      base.place(m, -3.35, 2.45, { rotY: 0.45, keep: 0.5 });
    })();

    /* ------------------------------------------------------------------
       Weg, Bank, Bäume, Büsche, Steine, Gras und Blumen
       ------------------------------------------------------------------ */
    kit.path(base, [[-0.75, 4.55], [-0.55, 3.0], [-0.35, 1.6], [-0.2, 0.2], [0.05, -0.9]], { seed: 53 });
    base.place(kit.tree({ type: 'round', seed: 531, color: '#4dbb55' }), -3.75, -0.75, { keep: 0.9 });
    base.place(kit.tree({ type: 'pine', seed: 532, scale: 1.05 }), 3.55, -2.3, { keep: 0.7 });
    base.place(kit.tree({ type: 'round', seed: 533, scale: 0.8, color: '#5cc04a' }), -0.15, -3.75, { keep: 0.7 });
    base.place(kit.tree({ type: 'pine', seed: 534, scale: 0.75 }), -3.2, -2.75, { keep: 0.5 });
    base.place(kit.bush({ seed: 535, size: 0.8, berries: ACC }), -1.35, 2.75, { keep: 0.5 });
    base.place(kit.bush({ seed: 536, size: 0.7 }), 3.85, 2.2, { keep: 0.5 });
    base.place(kit.rock({ size: 0.55, seed: 538, moss: true }), 2.6, 3.3, { keep: 0.4 });
    base.place(kit.rock({ size: 0.4, seed: 539 }), -2.0, 3.65, { keep: 0.3 });
    base.place(kit.mushroom({ color: ACC, seed: 540 }), -1.7, 3.15, { keep: 0.2 });
    kit.grassTufts(base, 52, 53);
    kit.flowers(base, 16, [ACC, '#ffffff', PAL.yellow, PAL.violet, '#ff8a5c'], 53);

    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 6.3, -1.8),
        focus: new T.Vector3(0, 1.5, -0.2),
      },
    };
  });
})();
