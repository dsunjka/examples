/* ==========================================================================
   js/world3d/islands/formen.js – Formen & Farben (pink)

   Wahrzeichen: ein großer Regenbogen, der auf zwei Wolken steht, und
   darunter ein Skulpturengarten mit schwebenden, sich drehenden Formen
   (Kugel, Würfel, Pyramide, Ring) auf pinken Sockeln. Dazu eine Staffelei
   mit einem Bild aus Formen, ein Farbeimer mit riesigem Pinsel, eine
   Malpalette mit Farbklecksen, Farbspritzer im Gras, ein Weg aus
   Form-Steinen (Kreis, Quadrat, Dreieck, Stern) und Formschnitt-Hecken.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'formen', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#ff5fa2';
    const calm = W.reducedMotion ? 0.12 : 1;
    const PAL = { red: '#ff4d4d', orange: '#ff9a2e', yellow: '#ffd23f', green: '#46c95a', blue: '#3f9bff', violet: '#9b6bff', pink: ACC };

    const updates = [];

    const base = kit.islandBase({ seed: 37, radius: 6.1, grassRadius: 4.75, grass: '#84d65c', stones: 4 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    // Schwebende Teile: kit.floatMerge (wippen/drehen im Vertex-Shader, wenige Draw-Calls)

    /** Dreiecke aus Vierecken bauen, nach außen (n) ausgerichtet. */
    function quadBuilder() {
      const pos = [], col = [];
      return {
        pos, col,
        quad(a, b, c, d, n, color) {
          const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
          const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
          if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0) { const t = b; b = d; d = t; }
          pos.push(...a, ...b, ...c, ...a, ...c, ...d);
          for (let k = 0; k < 6; k++) col.push(color.r, color.g, color.b);
        },
        build() {
          const q = new T.BufferGeometry();
          q.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
          q.setAttribute('color', new T.Float32BufferAttribute(col, 3));
          q.setAttribute('uv', new T.BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
          q.computeVertexNormals();
          return q;
        },
      };
    }

    /* ------------------------------------------------------------------
       Regenbogen auf Wolken (hinten)
       ------------------------------------------------------------------ */
    function rainbow() {
      const grp = new T.Group();
      grp.name = 'regenbogen';
      const cols = [PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.blue, PAL.violet].map((c) => new T.Color(c));
      const R = 3.15, BW = 0.21, D = 0.34, SEG = 20;
      const qb = quadBuilder();
      const P = (r, a, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
      cols.forEach((cl, i) => {
        const r1 = R - i * BW, r0 = r1 - BW;
        const lit = cl.clone().multiplyScalar(1.04), dark = cl.clone().multiplyScalar(0.82);
        for (let j = 0; j < SEG; j++) {
          const a0 = (PI * j) / SEG, a1 = (PI * (j + 1)) / SEG;
          qb.quad(P(r0, a0, D / 2), P(r1, a0, D / 2), P(r1, a1, D / 2), P(r0, a1, D / 2), [0, 0, 1], lit);
          qb.quad(P(r0, a0, -D / 2), P(r1, a0, -D / 2), P(r1, a1, -D / 2), P(r0, a1, -D / 2), [0, 0, -1], dark);
          const am = (a0 + a1) / 2;
          if (i === 0) qb.quad(P(r1, a0, -D / 2), P(r1, a0, D / 2), P(r1, a1, D / 2), P(r1, a1, -D / 2), [Math.cos(am), Math.sin(am), 0], cl);
          if (i === cols.length - 1) qb.quad(P(r0, a0, -D / 2), P(r0, a0, D / 2), P(r0, a1, D / 2), P(r0, a1, -D / 2), [-Math.cos(am), -Math.sin(am), 0], dark);
        }
      });
      const Pt = new kit.Parts();
      Pt.addRaw(qb.build(), 'gloss');
      // Wolken an den Füßen
      [-1, 1].forEach((s) => {
        const cx = s * (R - BW * 3);
        [[0, 0.1, 0, 0.62], [s * 0.55, -0.05, 0.12, 0.45], [-s * 0.5, -0.02, 0.18, 0.42], [s * 0.1, 0.32, -0.05, 0.4]].forEach(([dx, dy, dz, r], k) => {
          Pt.add(xf(geo.blob(r, { seed: 60 + k + (s > 0 ? 9 : 0), noise: 0.1, sy: 0.82 }), [cx + dx, dy + 0.2, dz]), '#ffffff', { grad: [0.84, 1.04] });
        });
      });
      Pt.build(grp);
      return grp;
    }
    const RB = { x: 0, z: -2.35 };
    base.place(rainbow(), RB.x, RB.z, { keep: 0, y: -0.15 });
    base.keep(-2.75, RB.z, 1.0);
    base.keep(2.75, RB.z, 1.0);

    /* ------------------------------------------------------------------
       Skulpturengarten: Sockel und schwebende Formen
       ------------------------------------------------------------------ */
    const spots = [[-2.05, -0.35], [-0.7, 0.25], [0.7, 0.25], [2.05, -0.35]];
    const shapes = [
      { geo: () => new T.IcosahedronGeometry(0.44, 2), color: ACC, smooth: true, y: 0.44 },
      { geo: () => geo.roundBox(0.72, 0.72, 0.72, 0.1, 1), color: PAL.blue, y: 0.36, tilt: [0.5, 0.3, 0.62] },
      { geo: () => new T.ConeGeometry(0.52, 0.86, 4), color: PAL.yellow, y: 0.43 },
      { geo: () => new T.TorusGeometry(0.32, 0.13, 8, 22), color: PAL.green, smooth: true, y: 0.45 },
    ];
    const floaters = [];
    const ped = new kit.Parts();
    spots.forEach(([x, z], i) => {
      const y = ground(x, z);
      // Sockel (weiß mit pinkem Band)
      ped.add(xf(geo.cyl(0.42, 0.48, 0.16, 10), [x, y + 0.04, z]), '#f6eef4', { grad: [0.8, 1.02] });
      ped.add(xf(geo.cyl(0.33, 0.37, 0.42, 10), [x, y + 0.33, z]), '#fff8fb', { grad: [0.82, 1.04] });
      ped.add(xf(geo.cyl(0.4, 0.4, 0.1, 10), [x, y + 0.57, z]), ACC, { grad: [0.85, 1.05], gloss: true });
      base.keep(x, z, 0.55);
      const sp = shapes[i];
      const q = sp.geo();
      if (sp.tilt) xf(q, null, sp.tilt);
      const m = kit.mesh(q, sp.color, { gloss: true, smooth: !!sp.smooth, grad: [0.78, 1.1] });
      const o = new T.Group();
      o.add(m);
      o.position.set(x, y + 0.62 + 0.28 + sp.y, z);
      floaters.push({ obj: o, phase: i * 1.6, amp: 0.13, spin: (i % 2 ? -0.45 : 0.5) });
      const sb = kit.shadowBlob(0.42);
      sb.position.set(x, y + 0.63, z);
      g.add(sb);
    });
    const pm = ped.build();
    pm.name = 'sockel';
    g.add(pm);
    g.add(kit.floatMerge(floaters));

    /* ------------------------------------------------------------------
       Staffelei mit Bild aus Formen (vorne rechts)
       ------------------------------------------------------------------ */
    const picTex = kit.canvasTexture(384, 300, (c, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#bfe8ff'); sky.addColorStop(0.7, '#e9f8ff'); sky.addColorStop(0.71, '#9be27a'); sky.addColorStop(1, '#7fd35a');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.fillStyle = PAL.yellow; c.beginPath(); c.arc(w * 0.8, h * 0.22, h * 0.12, 0, TAU); c.fill(); // Kreis-Sonne
      c.fillStyle = PAL.blue; c.fillRect(w * 0.18, h * 0.42, w * 0.3, h * 0.3); // Quadrat-Haus
      c.fillStyle = PAL.red; c.beginPath(); c.moveTo(w * 0.14, h * 0.43); c.lineTo(w * 0.33, h * 0.2); c.lineTo(w * 0.52, h * 0.43); c.closePath(); c.fill(); // Dreieck-Dach
      c.fillStyle = PAL.yellow; c.fillRect(w * 0.29, h * 0.56, w * 0.08, h * 0.16); // Tür
      c.fillStyle = ACC; c.beginPath(); c.arc(w * 0.66, h * 0.66, h * 0.06, 0, TAU); c.fill();
      c.fillStyle = PAL.violet; c.beginPath(); c.arc(w * 0.78, h * 0.7, h * 0.05, 0, TAU); c.fill();
      c.strokeStyle = '#3aa64a'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(w * 0.66, h * 0.72); c.lineTo(w * 0.66, h * 0.86); c.moveTo(w * 0.78, h * 0.75); c.lineTo(w * 0.78, h * 0.86); c.stroke();
    });
    function easel() {
      const grp = new T.Group();
      grp.name = 'staffelei';
      const P = new kit.Parts();
      const wood = '#c98d58';
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.09, 2.1, 0.09, 0.03, 1), [s * 0.45, 1.0, 0.1], [-0.1, 0, s * 0.12]), wood, { grad: [0.75, 1.05] }));
      P.add(xf(geo.roundBox(0.09, 2.0, 0.09, 0.03, 1), [0, 0.95, -0.35], [0.38, 0, 0]), kit.shade(wood, 0.9), {});
      P.add(xf(geo.roundBox(1.1, 0.08, 0.2, 0.03, 1), [0, 0.7, 0.2]), wood, {});
      P.add(xf(geo.roundBox(1.22, 0.96, 0.06, 0.03, 1), [0, 1.22, 0.15], [-0.1, 0, 0]), '#fffaf3', { grad: [0.9, 1.02] });
      P.build(grp);
      const pic = new T.Mesh(new T.PlaneGeometry(1.1, 0.86), new T.MeshStandardMaterial({ map: picTex, roughness: 0.8 }));
      pic.position.set(0, 1.22, 0.185);
      pic.rotation.x = -0.1;
      pic.receiveShadow = true;
      grp.add(pic);
      return grp;
    }
    base.place(easel(), 2.4, 1.4, { rotY: -0.5, keep: 0.9 });

    /* ------------------------------------------------------------------
       Farbeimer mit riesigem Pinsel, kleine Farbtöpfe
       ------------------------------------------------------------------ */
    function bucket() {
      const P = new kit.Parts();
      const brushes = [];
      const prof = [[0, 0], [0.36, 0], [0.43, 0.62], [0.47, 0.64], [0.45, 0.68], [0.4, 0.66]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(prof, 12), PAL.blue, { gloss: true, grad: [0.7, 1.08] });
      P.add(xf(geo.cyl(0.41, 0.41, 0.03, 12), [0, 0.6, 0]), ACC, { gloss: true });
      // Farbnasen außen
      [[0.2, 0.18], [1.4, 0.3], [2.6, 0.12]].forEach(([a, l]) => {
        const r = 0.44;
        P.add(xf(geo.cyl(0.05, 0.06, l, 5), [Math.cos(a) * r, 0.64 - l / 2, Math.sin(a) * r]), ACC, { gloss: true });
        P.add(xf(new T.IcosahedronGeometry(0.06, 0), [Math.cos(a) * r, 0.64 - l, Math.sin(a) * r]), ACC, { gloss: true });
      });
      P.add(new T.TorusGeometry(0.3, 0.02, 3, 10, PI).translate(0, 0.66, 0), C.metal, {});
      // Pinsel stehen mit den Borsten nach oben im Eimer: Stiel, Zwinge, Borsten mit Farbspitze
      const bp = [[0.1, 0], [0.14, 0.16], [0.12, 0.38], [0.03, 0.52], [0, 0.53]].map((p) => new T.Vector2(p[0], p[1]));
      [[PAL.yellow, ACC, 0.08, 0.02, -0.34, 0.12, 1], [ACC, PAL.blue, -0.12, -0.08, 0.3, -0.18, 0.82]].forEach(([handle, paint, x, z, rz, rx, k]) => {
        const B = new kit.Parts();
        B.add(xf(geo.cyl(0.06, 0.045, 1.7, 7), [0, 0.85, 0]), handle, { gloss: true, grad: [0.8, 1.05] });
        B.add(xf(geo.cyl(0.1, 0.09, 0.28, 8), [0, 1.82, 0]), '#c9d2dc', { gloss: true, grad: [0.85, 1.1] });
        B.add(new T.LatheGeometry(bp, 8).translate(0, 1.95, 0), '#f3dcb0', { top: paint, topFrom: 0.35, grad: [0.85, 1.05] });
        const br = B.build();
        br.scale.setScalar(k);
        br.position.set(x, 0.1, z);
        br.rotation.set(rx, 0, rz);
        brushes.push(br);
      });
      const grp = new T.Group();
      P.build(grp);
      brushes.forEach((b) => grp.add(b));
      grp.name = 'farbeimer';
      return grp;
    }
    base.place(bucket(), 3.25, -0.4, { rotY: -0.3, keep: 0.8 });
    (function pots() {
      const P = new kit.Parts();
      [[PAL.red, 0, 0], [PAL.yellow, 0.36, 0.12], [PAL.blue, 0.12, 0.4]].forEach(([c, x, z]) => {
        P.add(xf(geo.cyl(0.15, 0.14, 0.24, 9), [x, 0.12, z]), '#f2f2f2', { grad: [0.8, 1.04] });
        P.add(xf(geo.cyl(0.13, 0.13, 0.02, 9), [x, 0.235, z]), c, { gloss: true });
        P.add(xf(geo.cyl(0.035, 0.04, 0.1, 5), [x + 0.12, 0.17, z + 0.06]), c, { gloss: true });
      });
      const m = P.build();
      m.name = 'farbtoepfe';
      base.place(m, 1.45, 2.35, { rotY: 0.4, keep: 0.5 });
    })();

    /* Riesige Wachsmalstifte im Gras */
    (function crayons() {
      const P = new kit.Parts();
      [[ACC, 0, 0, 0.15], [PAL.blue, 0.1, 0.42, -0.35], [PAL.yellow, -0.2, -0.38, 0.5]].forEach(([c, x, z, ry], i) => {
        const L = 1.1 - i * 0.12;
        const body = geo.cyl(0.11, 0.11, L, 6).rotateZ(PI / 2);
        P.add(xf(body, [x, 0.11, z], [0, ry, 0]), c, { gloss: true, grad: [0.8, 1.06] });
        P.add(xf(geo.cyl(0.118, 0.118, L * 0.55, 6).rotateZ(PI / 2), [x - Math.cos(ry) * 0.05, 0.11, z + Math.sin(ry) * 0.05], [0, ry, 0]), kit.shade(c, 0.78), { grad: [0.85, 1.05] });
        const tip = new T.ConeGeometry(0.11, 0.26, 6).rotateZ(-PI / 2).translate(L / 2 + 0.13, 0, 0);
        P.add(xf(tip, [x, 0.11, z], [0, ry, 0]), kit.shade(c, 1.08), { gloss: true });
      });
      const m = P.build();
      m.name = 'stifte';
      base.place(m, 2.55, 2.85, { rotY: 0.5, keep: 0.8, y: -0.02 });
    })();

    /* ------------------------------------------------------------------
       Malpalette mit Farbklecksen (vorne links, schräg im Gras)
       ------------------------------------------------------------------ */
    function palette() {
      const P = new kit.Parts();
      const s = new T.Shape();
      s.absellipse(0, 0, 0.95, 0.68, 0, TAU, false, 0);
      const notch = new T.Path();
      notch.absellipse(-0.6, -0.34, 0.12, 0.14, 0, TAU, true, 0);
      s.holes.push(notch);
      const pg = new T.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 14 });
      pg.rotateX(-PI / 2);
      P.add(pg, '#e9b77d', { grad: [0.8, 1.05] });
      const blobs = [[PAL.red, -0.28, -0.32], [PAL.yellow, 0.18, -0.4], [PAL.green, 0.56, -0.12], [PAL.blue, 0.5, 0.3], [ACC, 0.05, 0.36], [PAL.violet, -0.35, 0.25], ['#ffffff', -0.05, 0.0]];
      blobs.forEach(([c, x, z], i) => {
        const q = new T.SphereGeometry(0.15, 8, 3, 0, TAU, 0, PI / 2).scale(1.1, 0.55, 1);
        P.add(xf(q, [x, 0.09, z], [0, i, 0]), c, { gloss: true, grad: [0.85, 1.08] });
      });
      const m = P.build();
      m.name = 'palette';
      return m;
    }
    const pal = palette();
    base.place(pal, -2.45, 1.45, { y: 0.3, keep: 1.0 });
    pal.rotation.set(0.42, 0.45, 0.0, 'YXZ');
    // kleiner Stein stützt die Palette
    base.place(kit.rock({ size: 0.4, seed: 41 }), -2.2, 0.85, { keep: 0 });

    /* ------------------------------------------------------------------
       Farbspritzer im Gras und Weg aus Form-Steinen
       ------------------------------------------------------------------ */
    (function splats() {
      const P = new kit.Parts();
      const rr = kit.rng(9);
      [[PAL.red, -0.9, 2.65, 0.32], [PAL.blue, 1.8, 0.35, 0.26], [PAL.yellow, -1.55, -1.3, 0.3], [ACC, 0.25, 3.45, 0.22], [PAL.green, -3.3, -0.3, 0.26], [PAL.violet, 3.1, 1.95, 0.22]].forEach(([c, x, z, R], i) => {
        const s = new T.Shape();
        const N = 18, ph = rr() * TAU;
        for (let k = 0; k <= N; k++) {
          const a = (k / N) * TAU;
          const r = R * (1 + 0.22 * Math.sin(5 * a + ph) + 0.08 * Math.sin(9 * a + ph * 2));
          if (k === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        const q = new T.ShapeGeometry(s).rotateX(-PI / 2);
        P.add(xf(q, [x, ground(x, z) + 0.035, z]), c, { gloss: true, grad: [1, 1] });
        for (let k = 0; k < 3; k++) {
          const a = rr() * TAU, d = R * (1.5 + rr() * 0.5);
          const qx = x + Math.cos(a) * d, qz = z + Math.sin(a) * d;
          P.add(xf(new T.CircleGeometry(R * 0.18, 7).rotateX(-PI / 2), [qx, ground(qx, qz) + 0.035, qz]), c, { gloss: true, grad: [1, 1] });
        }
      });
      const m = P.build(null, { castShadow: false });
      m.name = 'kleckse';
      g.add(m);
    })();
    (function shapeSteps() {
      const P = new kit.Parts();
      const steps = [['kreis', PAL.red, 1.05, 3.95], ['quadrat', PAL.blue, 0.35, 3.2], ['dreieck', PAL.yellow, -0.15, 2.35], ['stern', PAL.green, 0.2, 1.5]];
      steps.forEach(([kind, c, x, z], i) => {
        let q;
        if (kind === 'kreis') q = geo.cyl(0.4, 0.42, 0.12, 14);
        else if (kind === 'quadrat') q = geo.roundBox(0.7, 0.12, 0.7, 0.04, 1);
        else if (kind === 'dreieck') q = geo.cyl(0.5, 0.52, 0.12, 3);
        else {
          const s = new T.Shape();
          for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.22 : 0.5, a = PI / 2 + (k / 10) * TAU; if (k) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
          q = new T.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }).rotateX(-PI / 2).translate(0, -0.06, 0);
        }
        P.add(xf(q, [x, ground(x, z) + 0.04, z], [0, kind === 'dreieck' ? PI / 2 + 0.2 : 0.3 * i, 0]), c, { gloss: true, grad: [0.8, 1.06] });
        base.keep(x, z, 0.55);
      });
      const m = P.build();
      m.name = 'formweg';
      g.add(m);
    })();

    /* ------------------------------------------------------------------
       Formschnitt-Hecken (Kugel, Kegel, Würfel), Büsche, Blumen, Gras
       ------------------------------------------------------------------ */
    (function topiary() {
      const leaf = '#4fbf4a';
      const mk = (kind) => {
        const P = new kit.Parts();
        P.add(xf(geo.cyl(0.07, 0.09, 0.5, 6), [0, 0.25, 0]), C.wood, { grad: [0.7, 1] });
        P.add(xf(geo.cyl(0.26, 0.2, 0.28, 8), [0, 0.14, 0]), '#e8735a', { grad: [0.8, 1.05] });
        if (kind === 'kugel') P.add(xf(new T.IcosahedronGeometry(0.5, 1), [0, 0.88, 0]), leaf, { grad: [0.62, 1.12], jitter: 0.05 });
        else if (kind === 'kegel') P.add(xf(new T.ConeGeometry(0.48, 1.25, 8), [0, 1.05, 0]), kit.shade(leaf, 0.92), { grad: [0.62, 1.12], jitter: 0.05 });
        else P.add(xf(geo.roundBox(0.78, 0.78, 0.78, 0.1, 1), [0, 0.8, 0]), kit.shade(leaf, 1.05), { grad: [0.62, 1.12], jitter: 0.04 });
        return P.build();
      };
      base.place(mk('kugel'), -3.65, -0.95, { keep: 0.6 });
      base.place(mk('kegel'), 3.75, -1.55, { keep: 0.6 });
      base.place(mk('wuerfel'), -3.35, 2.35, { rotY: 0.4, keep: 0.6 });
    })();
    base.place(kit.tree({ type: 'blossom', seed: 44, color: '#ffb0d6', scale: 0.9 }), -1.55, -3.35, { keep: 0.8 });
    base.place(kit.bush({ seed: 45, size: 0.8, berries: ACC }), 1.5, -3.35);
    base.place(kit.rock({ size: 0.5, seed: 46, moss: true }), -1.4, 3.6, { keep: 0.3 });
    kit.grassTufts(base, 50, 37);
    kit.flowers(base, 18, [ACC, '#ffffff', '#ffd23f', '#b28dff', '#ff8a5c'], 37);


    /* Schmetterlinge flattern über die Wiese (instanziert: ein Draw-Call für alle Flügel) */
    (function butterflies(list) {
      const wing = new T.Shape();
      wing.moveTo(0, 0); wing.quadraticCurveTo(0.1, 0.16, 0.19, 0.1); wing.quadraticCurveTo(0.2, -0.02, 0.1, -0.05);
      wing.quadraticCurveTo(0.15, -0.14, 0.06, -0.13); wing.lineTo(0, 0);
      const wg = kit.paint(new T.ShapeGeometry(wing, 3).rotateX(-PI / 2).scale(1.45, 1.45, 1.45), '#ffffff', { grad: [1, 1] });
      const mesh = new T.InstancedMesh(wg, kit.mats.matteDouble, list.length * 2);
      mesh.name = 'schmetterlinge';
      mesh.castShadow = false;
      mesh.frustumCulled = false;
      mesh.userData.dynamic = true;
      const cc = new T.Color();
      list.forEach((b, i) => { mesh.setColorAt(i * 2, cc.set(b.color)); mesh.setColorAt(i * 2 + 1, cc.set(b.color)); });
      g.add(mesh);
      const d = new T.Object3D();
      d.rotation.order = 'YZX';
      const sp = W.reducedMotion ? 0.15 : 1;
      const set = (t) => {
        list.forEach((b, i) => {
          const th = t * b.speed * sp + b.phase;
          const x = b.x + Math.cos(th) * b.r, z = b.z + Math.sin(th * 1.3) * b.r * 0.8;
          const y = ground(b.x, b.z) + b.h + Math.sin(th * 2.3) * 0.18;
          const flap = 0.15 + Math.abs(Math.sin(t * 13 * sp + b.phase)) * 1.0;
          for (let s = 0; s < 2; s++) {
            d.position.set(x, y, z);
            d.rotation.set(0, -th, s ? -flap : flap);
            d.scale.set(s ? -1 : 1, 1, 1);
            d.updateMatrix();
            mesh.setMatrixAt(i * 2 + s, d.matrix);
          }
        });
        mesh.instanceMatrix.needsUpdate = true;
      };
      set(0);
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      updates.push((dt, t) => set(t));
    })([
      { color: '#ff5fa2', x: -1.0, z: 1.9, r: 0.8, h: 1.0, speed: 0.7, phase: 0.5 },
      { color: '#ffd23f', x: 1.2, z: 1.0, r: 0.6, h: 1.3, speed: 0.8, phase: 2.6 },
      { color: '#9b6bff', x: -0.2, z: -1.2, r: 0.9, h: 2.2, speed: 0.6, phase: 4.1 },
    ]);

    kit.merge(g);
    kit.batchDynamic(g); // Bewegtes (Ballons, Boote, Räder …) in wenige Draw-Calls bündeln
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.2, -1.7),
        focus: new T.Vector3(0, 1.6, -0.3),
      },
    };
  });
})();
