/* ==========================================================================
   js/world3d/islands/wissen.js – Forscherwelt (blau)

   Wahrzeichen: eine Sternwarte mit blauer Sternenkuppel, deren Teleskop aus
   dem Spalt ragt (die Kuppel dreht sich langsam hin und her), und eine
   Rakete auf ihrer Startrampe mit Startturm, aus deren Düse Dampfwölkchen
   quellen; oben auf dem Turm dreht sich ein Windmesser.
   Dazu ein großes Mikroskop, ein Dino-Skelett auf einem Museumssockel, ein
   Planeten-Karussell (Sonne mit kreisenden Planeten), ein Insektenhotel,
   Pilze, Bäume und ein Weg zum Strand.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'wissen', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#4f7cff';
    const calm = W.reducedMotion ? 0.12 : 1;
    const NAVY = '#1f2d5c', BONE = '#f6eedb', RED = '#ff5a5f', WHITE = '#f7f9fc';
    const updates = [];

    const base = kit.islandBase({ seed: 97, radius: 6.1, grassRadius: 4.75, grass: '#82d460', stones: 5 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /** flacher fünfzackiger Stern (Mitte im Ursprung, Normale +z) */
    function flatStar(r) {
      const s = new T.Shape();
      for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = PI / 2 + (i / 10) * TAU; if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      s.closePath();
      return new T.ShapeGeometry(s);
    }

    /* ------------------------------------------------------------------
       Sternwarte (hinten links)
       ------------------------------------------------------------------ */
    function observatory() {
      const grp = new T.Group();
      grp.name = 'sternwarte';
      const P = new kit.Parts();
      const BR = 1.0, BH = 1.45;
      P.add(xf(geo.cyl(BR + 0.16, BR + 0.22, 0.22, 16), [0, 0.11, 0]), C.stone, { grad: [0.72, 1.02] });
      P.add(xf(geo.cyl(BR, BR + 0.02, BH, 16), [0, 0.22 + BH / 2, 0]), '#f6f2ea', { grad: [0.8, 1.04] });
      P.add(xf(geo.cyl(BR + 0.05, BR + 0.05, 0.16, 16), [0, 0.22 + BH - 0.05, 0]), ACC, { gloss: true, grad: [0.8, 1.05] });
      P.add(xf(geo.cyl(BR + 0.04, BR + 0.04, 0.08, 16), [0, 0.42, 0]), kit.shade(ACC, 1.15), { gloss: true });
      // Tür und Fenster
      P.add(xf(geo.roundBox(0.5, 0.82, 0.14, 0.07), [0, 0.22 + 0.41, BR - 0.02]), NAVY, { grad: [0.8, 1.06] });
      P.add(xf(geo.roundBox(0.6, 0.08, 0.16, 0.03, 1), [0, 0.22 + 0.86, BR - 0.01]), '#ffffff', {});
      P.add(xf(flatStar(0.11), [0, 0.22 + 0.5, BR + 0.06]), C.gold, { gloss: true, grad: [1, 1] });
      [-0.85, 0.85].forEach((ry) => {
        const x = Math.sin(ry) * (BR + 0.01), z = Math.cos(ry) * (BR + 0.01);
        P.add(xf(geo.cyl(0.18, 0.18, 0.08, 12).rotateX(PI / 2), [x, 1.05, z], [0, ry, 0]), '#ffffff', {});
        P.addRaw(kit.paint(xf(new T.CircleGeometry(0.13, 12), [x + Math.sin(ry) * 0.065, 1.05, z + Math.cos(ry) * 0.065], [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window'); // Glas: nur die sichtbare Vorderseite
      });
      // Kuppel-Kranz (Schiene)
      P.add(xf(new T.TorusGeometry(BR + 0.02, 0.06, 3, 20), [0, 0.22 + BH + 0.03, 0], [PI / 2, 0, 0]), '#dfe6ee', { gloss: true });
      P.build(grp);

      // Drehbare Kuppel mit Spalt und Teleskop
      const dome = new T.Group();
      dome.position.y = 0.22 + BH + 0.05;
      const D = new kit.Parts();
      D.add(new T.SphereGeometry(BR + 0.02, 16, 6, 0, TAU, 0, PI / 2), ACC, { gloss: true, smooth: true, grad: [0.8, 1.12] });
      // Spalt (dunkles Band nach vorn)
      D.add(new T.SphereGeometry(BR + 0.035, 3, 7, PI / 2 - 0.2, 0.4, 0.06, PI / 2 - 0.06), NAVY, { gloss: true, smooth: true });
      // goldene Sterne auf der Kuppel
      [[0.9, 0.5, 0.13], [-0.9, 0.55, 0.12], [1.9, 0.35, 0.11], [-1.85, 0.4, 0.11], [2.6, 0.9, 0.1], [-2.7, 0.95, 0.1], [0.55, 1.15, 0.09], [-0.5, 1.2, 0.08]].forEach(([az, el, r]) => {
        const n = new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
        const q = flatStar(r);
        q.lookAt(n);
        q.translate(n.x * (BR + 0.04), n.y * (BR + 0.04), n.z * (BR + 0.04));
        D.add(q, C.gold, { gloss: true, smooth: true, grad: [1, 1] });
      });
      // Teleskop aus dem Spalt
      const el = 0.62;
      const tube = (len, r0, r1, at, col) => {
        const q = geo.cyl(r1, r0, len, 10).translate(0, at + len / 2, 0);
        q.rotateX(PI / 2 - el);
        D.add(q, col, { gloss: true, smooth: true, grad: [0.9, 1.06] });
      };
      tube(1.55, 0.2, 0.17, 0.2, WHITE);
      tube(0.1, 0.22, 0.22, 1.35, C.gold);
      tube(0.08, 0.21, 0.21, 0.55, C.gold);
      tube(0.12, 0.2, 0.24, 1.72, NAVY);
      D.build(dome);
      dome.userData.dynamic = true;
      grp.add(dome);
      updates.push((dt, t) => { dome.rotation.y = 0.25 + Math.sin(t * 0.25) * 0.55 * calm; });
      const halo = kit.glowHalo(1.6, '#bcd4ff');
      halo.position.set(0, 3.2, 0.8);
      grp.add(halo);
      return grp;
    }
    base.place(observatory(), -2.05, -2.05, { rotY: 0.3, keep: 1.3 });

    /* ------------------------------------------------------------------
       Rakete mit Startturm (hinten rechts)
       ------------------------------------------------------------------ */
    function rocketSite() {
      const grp = new T.Group();
      grp.name = 'rakete';
      const P = new kit.Parts();
      // Rampe
      P.add(xf(geo.roundBox(2.3, 0.3, 1.7, 0.08), [0.3, 0.15, 0]), '#a6b1bd', { grad: [0.72, 1.02] });
      P.add(xf(geo.roundBox(2.36, 0.06, 1.76, 0.03, 1), [0.3, 0.32, 0]), ACC, { gloss: true });
      for (let i = 0; i < 6; i++) P.add(xf(geo.box(0.16, 0.02, 0.06), [-0.55 + i * 0.34, 0.36, 0.82], [0, 0, 0]), '#ffd23f', { gloss: true });
      // Rakete (Mitte bei x = 0)
      const y0 = 0.62;
      const body = [[0, 0], [0.3, 0], [0.4, 0.22], [0.45, 0.6], [0.46, 1.35], [0.42, 1.95], [0.36, 2.2], [0, 2.2]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(body, 12).translate(0, y0, 0), WHITE, { gloss: true, smooth: true, grad: [0.86, 1.06] });
      const nose = [[0, 0], [0.37, 0], [0.33, 0.32], [0.22, 0.6], [0.09, 0.8], [0, 0.86]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(nose, 12).translate(0, y0 + 2.18, 0), RED, { gloss: true, smooth: true, grad: [0.85, 1.08] });
      P.add(xf(geo.cyl(0.465, 0.465, 0.16, 16), [0, y0 + 0.62, 0]), ACC, { gloss: true, smooth: true });
      P.add(xf(geo.cyl(0.445, 0.445, 0.08, 16), [0, y0 + 1.95, 0]), ACC, { gloss: true, smooth: true });
      // Bullauge
      P.add(xf(new T.TorusGeometry(0.17, 0.045, 4, 14), [0, y0 + 1.4, 0.44], [-0.04, 0, 0]), C.gold, { gloss: true, smooth: true });
      P.addRaw(kit.paint(xf(new T.CircleGeometry(0.15, 14), [0, y0 + 1.4, 0.448], [-0.04, 0, 0]), '#ffffff', { grad: [1, 1] }), 'window');
      // Düse
      P.add(xf(geo.cyl(0.2, 0.3, 0.3, 12), [0, y0 - 0.1, 0]), '#5d6b7b', { gloss: true, smooth: true, grad: [0.75, 1.05] });
      // Flossen
      const fin = new T.Shape();
      fin.moveTo(0, 0); fin.lineTo(0.42, -0.2); fin.quadraticCurveTo(0.5, 0.25, 0.3, 0.45); fin.lineTo(0, 0.85); fin.closePath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + PI / 4;
        const fg = new T.ExtrudeGeometry(fin, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1, curveSegments: 4 });
        fg.translate(0.36, 0, -0.035);
        P.add(xf(fg, [0, y0 + 0.02, 0], [0, a, 0]), RED, { gloss: true, grad: [0.8, 1.06] });
      }
      // Startturm (Gitter)
      const TX = 1.15, tw = 0.24, TH = 3.4, tc = '#ff7a3d';
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => P.add(xf(geo.box(0.07, TH, 0.07), [TX + sx * tw, 0.32 + TH / 2, sz * tw]), tc, { grad: [0.75, 1.05] }));
      for (let k = 0; k <= 5; k++) {
        const y = 0.32 + 0.12 + k * ((TH - 0.2) / 5);
        P.add(xf(geo.box(tw * 2 + 0.07, 0.05, 0.05), [TX, y, tw]), tc, {});
        P.add(xf(geo.box(tw * 2 + 0.07, 0.05, 0.05), [TX, y, -tw]), tc, {});
        P.add(xf(geo.box(0.05, 0.05, tw * 2 + 0.07), [TX + tw, y, 0]), tc, {});
        P.add(xf(geo.box(0.05, 0.05, tw * 2 + 0.07), [TX - tw, y, 0]), tc, {});
        if (k < 5) {
          const h = (TH - 0.2) / 5, len = Math.hypot(tw * 2, h);
          const ang = Math.atan2(h, tw * 2) * (k % 2 ? 1 : -1);
          P.add(xf(geo.box(len, 0.04, 0.04), [TX, y + h / 2, tw + 0.01], [0, 0, ang]), kit.shade(tc, 0.9), {});
          P.add(xf(geo.box(0.04, 0.04, len), [TX + tw + 0.01, y + h / 2, 0], [-ang, 0, 0]), kit.shade(tc, 0.9), {});
        }
      }
      // Versorgungsarme zur Rakete
      [1.6, 2.6].forEach((y) => P.add(xf(geo.roundBox(0.62, 0.09, 0.14, 0.03, 1), [TX - 0.5, y, 0]), '#dfe6ee', { gloss: true }));
      P.add(xf(geo.roundBox(0.7, 0.08, 0.7, 0.03, 1), [TX, 0.32 + TH + 0.04, 0]), tc, {});
      // Windmesser-Mast
      P.add(xf(geo.cyl(0.025, 0.025, 0.5, 5), [TX, 0.32 + TH + 0.3, 0]), '#dfe6ee', {});
      P.build(grp);

      // Windmesser (dreht sich)
      const cups = new T.Group();
      cups.position.set(TX, 0.32 + TH + 0.55, 0);
      const CP = new kit.Parts();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU;
        CP.add(xf(geo.cyl(0.015, 0.015, 0.36, 4).rotateZ(PI / 2), [Math.cos(a) * 0.18, 0, -Math.sin(a) * 0.18], [0, a, 0]), '#dfe6ee', { gloss: true });
        const cup = new T.SphereGeometry(0.075, 8, 4, 0, TAU, 0, PI / 2).rotateZ(PI / 2);
        CP.add(xf(cup, [Math.cos(a) * 0.36, 0, -Math.sin(a) * 0.36], [0, a + PI / 2, 0]), ACC, { gloss: true });
      }
      CP.add(new T.SphereGeometry(0.05, 6, 4), ACC, { gloss: true });
      CP.build(cups);
      cups.userData.dynamic = true;
      grp.add(cups);
      updates.push((dt) => { cups.rotation.y += dt * 2.4 * calm; });

      // Dampfwölkchen an der Düse (instanziert)
      const puffGeo = kit.paint(geo.blob(0.22, { seed: 5, noise: 0.12, detail: 1 }), '#ffffff', { grad: [0.85, 1.04] });
      const N = 5;
      const puffs = new T.InstancedMesh(puffGeo, kit.mats.matte, N);
      puffs.name = 'dampf';
      puffs.castShadow = false;
      puffs.frustumCulled = false;
      puffs.userData.dynamic = true;
      grp.add(puffs);
      const d = new T.Object3D();
      const dirs = [];
      for (let i = 0; i < N; i++) { const a = (i / N) * TAU + 0.4; dirs.push([Math.cos(a), Math.sin(a)]); }
      const set = (t) => {
        for (let i = 0; i < N; i++) {
          const k = ((t * 0.35 * Math.max(calm, 0.3) + i / N) % 1);
          const r = 0.25 + k * 0.75;
          d.position.set(dirs[i][0] * r, 0.42 + k * 0.22, dirs[i][1] * r);
          const s = Math.sin(k * PI) * (0.7 + 0.5 * k);
          d.scale.setScalar(Math.max(0.001, s));
          d.rotation.set(0, i, 0);
          d.updateMatrix();
          puffs.setMatrixAt(i, d.matrix);
        }
        puffs.instanceMatrix.needsUpdate = true;
      };
      set(0);
      updates.push((dt, t) => set(t));
      return grp;
    }
    base.place(rocketSite(), 1.85, -2.25, { rotY: -0.35, keep: 1.45 });

    /* ------------------------------------------------------------------
       Mikroskop (vorne links)
       ------------------------------------------------------------------ */
    function microscope() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.95, 0.18, 0.75, 0.08), [0, 0.09, 0]), ACC, { gloss: true, grad: [0.78, 1.06] });
      // Arm (Bogen nach hinten)
      const arm = new T.TorusGeometry(0.44, 0.11, 6, 10, PI * 0.55);
      arm.rotateY(PI / 2);
      P.add(xf(arm, [0, 0.55, 0.02]), kit.shade(ACC, 1.12), { gloss: true, grad: [0.85, 1.08] });
      P.add(xf(geo.roundBox(0.22, 0.42, 0.22, 0.06, 1), [0, 0.36, -0.42]), kit.shade(ACC, 1.12), { gloss: true });
      // Tisch mit Objektträger
      P.add(xf(geo.roundBox(0.66, 0.07, 0.56, 0.03, 1), [0, 0.6, 0.06]), '#3b4656', { gloss: true });
      P.add(xf(geo.box(0.42, 0.02, 0.16), [0, 0.645, 0.08]), '#e6f6ff', { gloss: true });
      P.add(xf(new T.CircleGeometry(0.05, 8).rotateX(-PI / 2), [0, 0.657, 0.08]), '#ff6fb1', { gloss: true });
      P.add(xf(geo.cyl(0.08, 0.1, 0.06, 10), [0, 0.54, 0.06]), '#ffe9a8', { gloss: true });
      // Tubus (schräg), Revolver mit Objektiven, Okular
      const tubeTilt = 0.42;
      const tub = (len, r0, r1, y, col, smooth) => {
        const q = geo.cyl(r1, r0, len, 10).translate(0, y + len / 2, 0);
        q.rotateX(tubeTilt);
        q.translate(0, 0.92, 0.12);
        P.add(q, col, { gloss: true, smooth, grad: [0.88, 1.06] });
      };
      tub(0.72, 0.15, 0.14, 0.05, WHITE, true);
      tub(0.14, 0.16, 0.16, 0.35, ACC, true);
      tub(0.22, 0.1, 0.1, 0.77, '#2f3845', true);
      tub(0.06, 0.12, 0.12, 0.97, '#2f3845', true);
      P.add(xf(geo.cyl(0.2, 0.16, 0.09, 12), [0, 0.93, 0.12]), C.gold, { gloss: true, smooth: true });
      [[-0.09, 0.03], [0.09, 0.03], [0, -0.1]].forEach(([dx, dz], i) => P.add(xf(geo.cyl(0.045, 0.05, 0.16 - i * 0.03, 8), [dx, 0.82, 0.12 + dz]), '#cfd7e0', { gloss: true }));
      // Triebknöpfe
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.11, 0.11, 0.07, 10).rotateZ(PI / 2), [s * 0.17, 0.62, -0.38]), WHITE, { gloss: true }));
      // Spiegel/Lampe unten
      P.add(xf(geo.cyl(0.09, 0.09, 0.05, 10), [0, 0.21, 0.08]), '#ffe9a8', { gloss: true });
      const m = P.build();
      m.name = 'mikroskop';
      m.scale.setScalar(1.25);
      return m;
    }
    base.place(microscope(), -2.15, 1.85, { rotY: 1.2, keep: 0.75 });

    /* ------------------------------------------------------------------
       Dino-Skelett auf dem Museumssockel (vorne rechts)
       ------------------------------------------------------------------ */
    function dino() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(2.5, 0.22, 0.95, 0.07), [0, 0.11, 0]), '#e9e2d6', { grad: [0.75, 1.02] });
      P.add(xf(geo.roundBox(2.56, 0.05, 1.0, 0.02, 1), [0, 0.24, 0]), ACC, { gloss: true });
      P.add(xf(geo.roundBox(0.5, 0.16, 0.04, 0.02, 1), [-0.6, 0.13, 0.48]), C.gold, { gloss: true });
      // Wirbelsäule: Schwanz → Becken → Rücken → kurzer, gebogener Hals. Der Schädel bleibt
      // über der Sockelplatte (Platte ±1,25), die Wirbel überlappen auf einem durchgehenden Strang.
      const spine = new T.CatmullRomCurve3([[-1.22, 0.42], [-0.9, 0.62], [-0.52, 0.94], [-0.3, 1.04], [0.2, 1.08], [0.5, 1.15], [0.72, 1.36], [0.87, 1.6], [0.97, 1.8]].map((p) => new T.Vector3(p[0], p[1], 0)));
      P.add(new T.TubeGeometry(spine, 40, 0.038, 5, false), BONE, { grad: [0.85, 1.05] });
      const n = 30;
      const v = new T.Vector3();
      // Wirbelgröße: Schwanzspitze klein, Rücken kräftig, Hals mittel
      const vert = (t) => (t < 0.32 ? 0.045 + 0.07 * (t / 0.32) : t < 0.66 ? 0.115 : 0.115 - 0.04 * ((t - 0.66) / 0.34));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        spine.getPointAt(t, v);
        P.add(xf(new T.IcosahedronGeometry(vert(t), 0), [v.x, v.y, 0], [i, i * 0.7, 0]), BONE, { grad: [0.85, 1.05] });
      }
      // Kopf: sitzt auf dem Halsende, leicht nach unten geneigt
      P.add(xf(geo.blob(0.15, { seed: 3, noise: 0.06, sx: 1.6, sy: 0.85, detail: 1 }), [1.1, 1.86, 0], [0, 0, -0.3]), BONE, { grad: [0.85, 1.05] });
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.035, 5, 4), [1.15, 1.9, s * 0.1]), '#4a4136', {}));
      // Rippen zwischen Becken und Schultern (Lage über x gesucht, Kurve steigt in x)
      const atX = (x) => { let lo = 0, hi = 1; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; spine.getPointAt(m, v); if (v.x < x) lo = m; else hi = m; } spine.getPointAt(lo, v); return v; };
      for (let k = 0; k < 6; k++) {
        atX(-0.16 + k * 0.12);
        const rr = 0.3 - Math.abs(k - 2.5) * 0.035;
        const rib = new T.TorusGeometry(rr, 0.03, 3, 9, PI * 1.25);
        rib.rotateZ(-PI * 0.125); // Öffnung nach unten
        rib.rotateY(PI / 2);
        P.add(xf(rib, [v.x, v.y - rr * 0.92, 0]), BONE, { grad: [0.85, 1.05] });
      }
      // Becken und Beine
      P.add(xf(geo.blob(0.17, { seed: 9, noise: 0.1, sx: 1.3, detail: 0 }), [-0.35, 1.0, 0]), BONE, { grad: [0.85, 1.05] });
      const leg = (x, z, h) => {
        P.add(xf(geo.cyl(0.05, 0.065, h * 0.5, 6), [x, 0.24 + h * 0.75, z], [0, 0, 0.12]), BONE, { grad: [0.85, 1.05] });
        P.add(xf(new T.IcosahedronGeometry(0.07, 0), [x - 0.03, 0.24 + h * 0.5, z]), BONE, {});
        P.add(xf(geo.cyl(0.045, 0.055, h * 0.5, 6), [x - 0.01, 0.24 + h * 0.25, z], [0, 0, -0.08]), BONE, { grad: [0.85, 1.05] });
        P.add(xf(geo.roundBox(0.2, 0.06, 0.13, 0.025, 1), [x + 0.04, 0.27, z]), BONE, {});
      };
      leg(-0.38, 0.17, 0.82); leg(-0.38, -0.17, 0.82); leg(0.28, 0.17, 0.86); leg(0.28, -0.17, 0.86);
      const m = P.build();
      m.name = 'dino';
      m.scale.setScalar(1.12);
      return m;
    }
    base.place(dino(), 1.95, 1.95, { rotY: -0.3, keep: 1.2 });

    /* ------------------------------------------------------------------
       Planeten-Karussell (Mitte): Sonne mit kreisenden Planeten
       ------------------------------------------------------------------ */
    function orrery() {
      const grp = new T.Group();
      grp.name = 'planeten';
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.36, 0.42, 0.18, 12), [0, 0.09, 0]), NAVY, { gloss: true, grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.035, 0.05, 1.5, 6), [0, 0.9, 0]), C.gold, { gloss: true });
      P.build(grp);
      // Sonne (leuchtet)
      const sun = new T.Mesh(new T.IcosahedronGeometry(0.3, 1), new T.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb21a', emissiveIntensity: 0.65, roughness: 0.4, flatShading: true }));
      sun.position.y = 1.78;
      sun.castShadow = true;
      grp.add(sun);
      // Planeten an Armen (ein Mesh, dreht sich)
      const rot = new T.Group();
      rot.position.y = 1.62;
      const R = new kit.Parts();
      const planets = [[0.55, 0.12, '#4aa8ff', 0], [0.85, 0.16, '#ff7a5a', 2.2], [1.15, 0.2, '#ffc46b', 4.1]];
      planets.forEach(([r, s, col, a], i) => {
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        const arm = geo.cyl(0.018, 0.018, r, 4).rotateZ(PI / 2).translate(r / 2, 0, 0);
        R.add(xf(arm, [0, -0.06 * i, 0], [0, -a, 0]), C.gold, { gloss: true, smooth: true });
        R.add(xf(geo.cyl(0.018, 0.018, 0.22, 4), [x, -0.06 * i + 0.11, z]), C.gold, { gloss: true, smooth: true });
        R.add(xf(new T.SphereGeometry(s, 9, 5), [x, -0.06 * i + 0.22 + s, z]), col, { gloss: true, smooth: true, grad: [0.8, 1.1] });
        if (i === 2) R.add(xf(new T.TorusGeometry(s * 1.75, s * 0.32, 3, 18).scale(1, 1, 0.18), [x, -0.06 * i + 0.22 + s, z], [PI / 2 - 0.35, 0, 0.2]), '#f7dfa8', { gloss: true, smooth: true });
        if (i === 0) R.add(xf(new T.SphereGeometry(0.045, 6, 4), [x + 0.2, -0.06 * i + 0.3, z]), '#e8ecf2', { gloss: true, smooth: true });
      });
      R.build(rot);
      rot.userData.dynamic = true;
      grp.add(rot);
      updates.push((dt) => { rot.rotation.y += dt * 0.35 * calm; });
      const halo = kit.glowHalo(1.4, '#ffe08a');
      halo.position.y = 1.78;
      grp.add(halo);
      return grp;
    }
    base.place(orrery(), 0.2, 0.05, { keep: 0.9 });

    /* ------------------------------------------------------------------
       Insektenhotel (links)
       ------------------------------------------------------------------ */
    function bugHotel() {
      const P = new kit.Parts();
      const wood = '#b97a4a';
      P.add(xf(geo.roundBox(0.9, 1.0, 0.36, 0.04, 1), [0, 0.6, 0]), wood, { grad: [0.75, 1.05] });
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.62, 0.08, 0.5, 0.03, 1), [s * 0.27, 1.27, 0], [0, 0, s * -0.62]), '#d9534a', { grad: [0.8, 1.05] }));
      [-0.38, 0.38].forEach((x) => P.add(xf(geo.box(0.07, 0.12, 0.07), [x, 0.06, 0]), kit.shade(wood, 0.8), {}));
      // Fächer: Holzscheiben mit Löchern, Zapfen, Stroh
      P.add(xf(geo.box(0.8, 0.04, 0.3), [0, 0.65, 0.03]), kit.shade(wood, 1.1), {});
      P.add(xf(geo.box(0.04, 0.88, 0.3), [0, 0.6, 0.03]), kit.shade(wood, 1.1), {});
      for (let i = 0; i < 6; i++) {
        const x = -0.3 + (i % 3) * 0.12, y = 0.82 + Math.floor(i / 3) * 0.15;
        P.add(xf(geo.cyl(0.055, 0.055, 0.32, 6).rotateX(PI / 2), [x, y, 0.03]), '#e8c08a', {});
        P.add(xf(new T.CircleGeometry(0.03, 6), [x, y, 0.195]), '#4a3226', {});
      }
      for (let i = 0; i < 3; i++) P.add(xf(new T.ConeGeometry(0.08, 0.2, 6).rotateX(PI / 2), [0.13 + i * 0.12, 0.88, 0.07]), '#8a5a3c', { grad: [0.8, 1.1] });
      for (let i = 0; i < 6; i++) P.add(xf(geo.cyl(0.02, 0.02, 0.3, 4).rotateX(PI / 2), [-0.32 + (i % 3) * 0.09, 0.25 + Math.floor(i / 3) * 0.2, 0.03]), '#f0cd6a', {});
      for (let i = 0; i < 4; i++) P.add(xf(geo.box(0.14, 0.14, 0.3), [0.13 + (i % 2) * 0.17, 0.27 + Math.floor(i / 2) * 0.17, 0.03]), '#c9d0d8', {});
      // kleiner Marienkäfer
      P.add(xf(new T.SphereGeometry(0.06, 8, 4, 0, TAU, 0, PI / 2).scale(1, 0.8, 1.2), [0.3, 1.13, 0.17]), RED, { gloss: true });
      P.add(xf(new T.SphereGeometry(0.03, 5, 4), [0.3, 1.14, 0.25]), '#2b2f38', { gloss: true });
      const m = P.build();
      m.name = 'insektenhotel';
      return m;
    }
    base.place(bugHotel(), -3.75, -0.25, { rotY: 0.95, keep: 0.6 });

    /* ------------------------------------------------------------------
       Weg, Bäume, Büsche, Pilze, Steine, Gras und Blumen
       ------------------------------------------------------------------ */
    kit.path(base, [[0.2, 4.6], [-0.15, 3.3], [-0.45, 2.0], [-0.65, 0.95]], { seed: 97 });
    base.place(kit.tree({ type: 'pine', seed: 971, scale: 1.05 }), -3.55, -1.85, { keep: 0.7 });
    base.place(kit.tree({ type: 'round', seed: 972, color: '#4dbb55' }), 3.85, -0.85, { keep: 0.9 });
    base.place(kit.tree({ type: 'pine', seed: 973, scale: 0.8 }), -0.25, -3.75, { keep: 0.5 });
    base.place(kit.bush({ seed: 974, size: 0.75, berries: ACC }), -1.35, 3.1, { keep: 0.5 });
    base.place(kit.mushroom({ color: ACC, seed: 976 }), -3.3, 0.95, { keep: 0.2 });
    base.place(kit.rock({ size: 0.5, seed: 978, moss: true }), 1.35, 3.35, { keep: 0.35 });
    kit.grassTufts(base, 42, 97);
    kit.flowers(base, 9, [ACC, '#ffffff', '#ffd23f', '#9b7bff'], 97);

    kit.merge(g);
    kit.batchDynamic(g); // Bewegtes (Ballons, Boote, Räder …) in wenige Draw-Calls bündeln
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.9, -1.8),
        focus: new T.Vector3(0, 1.5, -0.3),
      },
    };
  });
})();
