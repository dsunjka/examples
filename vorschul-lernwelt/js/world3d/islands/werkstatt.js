/* ==========================================================================
   js/world3d/islands/werkstatt.js – Malwerkstatt (gelb)

   Wahrzeichen: ein riesiger gelber Stiftebecher voller Buntstifte (wie ein
   bunter Turm, auch auf der Weltkarte gut zu erkennen) und eine große
   Staffelei mit Flos Porträt. Dazu das Atelier-Häuschen mit gelbem Dach und
   Wimpelkette, Farbtöpfe (einer ist umgekippt), ein Riesenpinsel am Ende
   einer Regenbogen-Farbspur, eine Schere, die immer wieder „schnipp“ macht,
   Papierschnipsel, eine Wäscheleine mit Kinderbildern, kreisende
   Papierflieger und Papierboote am Ufer.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'werkstatt', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#f2a900';
    const calm = W.reducedMotion ? 0.12 : 1;
    const PAL = { red: '#ff4d4d', orange: '#ff8a2e', yellow: '#ffd23f', green: '#46c95a', blue: '#3f9bff', violet: '#9b6bff', pink: '#ff6fb1' };
    const updates = [];

    const base = kit.islandBase({ seed: 89, radius: 6.1, grassRadius: 4.75, grass: '#8ad85c', stones: 4 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /** Fläche, die dem Boden folgt (Dreiecke mit Normalen nach oben). */
    function groundMesh() {
      const pos = [];
      return {
        tri(p, q, r) {
          const ux = q[0] - p[0], uz = q[2] - p[2], vx = r[0] - p[0], vz = r[2] - p[2];
          if (uz * vx - ux * vz < 0) pos.push(...p, ...r, ...q); else pos.push(...p, ...q, ...r);
        },
        quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); },
        geo() {
          const q = new T.BufferGeometry();
          q.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
          q.computeVertexNormals();
          return q;
        },
      };
    }

    /* ------------------------------------------------------------------
       Stiftebecher mit Riesen-Buntstiften (hinten links)
       ------------------------------------------------------------------ */
    function pencil(P, color, len, x, z, y0, tx, tz) {
      const r = 0.17;
      const tip = 0.44;
      const body = len - tip;
      const parts = [];
      parts.push([geo.cyl(r, r, body, 6).translate(0, body / 2, 0), color, { gloss: true, grad: [0.7, 1.06] }]);
      parts.push([geo.cyl(r * 1.02, r * 1.02, 0.09, 6).translate(0, body * 0.18, 0), kit.shade(color, 0.7), { gloss: true }]);
      // angespitzt: Holz und farbige Mine
      parts.push([new T.ConeGeometry(r, tip, 6).translate(0, body + tip / 2, 0), '#f6d7a7', { grad: [0.85, 1.05] }]);
      parts.push([new T.ConeGeometry(r * 0.36, tip * 0.36, 6).translate(0, body + tip - tip * 0.18 + 0.004, 0), color, { gloss: true }]);
      parts.forEach(([q, c, o]) => P.add(xf(q, [x, y0, z], [tx, 0, tz]), c, o));
    }
    function pencilCup() {
      const P = new kit.Parts();
      const cupH = 1.45, cupR = 0.82;
      const prof = [[0, 0.02], [cupR - 0.05, 0], [cupR, 0.06], [cupR, cupH - 0.06], [cupR + 0.06, cupH], [cupR - 0.1, cupH + 0.04], [cupR - 0.12, cupH - 0.2], [0, cupH - 0.2]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(prof, 18), kit.shade(ACC, 1.1), { gloss: true, grad: [0.82, 1.08] });
      // weiße Streifen und Punkte
      P.add(xf(geo.cyl(cupR + 0.012, cupR + 0.012, 0.12, 18, 1), [0, 0.34, 0]), '#ffffff', { gloss: true });
      P.add(xf(geo.cyl(cupR + 0.012, cupR + 0.012, 0.05, 18, 1), [0, 0.5, 0]), '#ff6fb1', { gloss: true });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + 0.3, y = 0.9 + (i % 2) * 0.24;
        const dot = new T.CircleGeometry(0.075, 8);
        P.add(xf(dot, [Math.sin(a) * (cupR + 0.015), y, Math.cos(a) * (cupR + 0.015)], [0, a, 0]), '#ffffff', { grad: [1, 1] });
      }
      // Stifte (Spitzen nach oben, leicht gefächert)
      const pens = [
        [PAL.red, 3.7, -0.22, 0.12, -0.05, 0.12],
        [PAL.blue, 4.25, 0.05, -0.18, -0.1, -0.03],
        [PAL.green, 3.3, 0.32, 0.14, 0.04, -0.17],
        [PAL.violet, 3.9, -0.35, -0.22, -0.16, 0.14],
        [PAL.pink, 2.95, 0.12, 0.38, 0.17, -0.02],
        [PAL.orange, 3.5, 0.42, -0.22, -0.12, -0.2],
        ['#2fc4d4', 3.05, -0.42, 0.32, 0.15, 0.2],
      ];
      pens.forEach(([c, L, x, z, tx, tz]) => pencil(P, c, L, x, z, cupH - 1.15, tx, tz));
      const m = P.build();
      m.name = 'stiftebecher';
      return m;
    }
    base.place(pencilCup(), -1.95, -2.15, { rotY: 0.25, keep: 1.0 });

    /* ------------------------------------------------------------------
       Staffelei mit Flos Porträt (Mitte)
       ------------------------------------------------------------------ */
    const portrait = kit.canvasTexture(512, 400, (c, w, h) => {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#aee3ff'); bg.addColorStop(0.62, '#e8f7ff'); bg.addColorStop(0.63, '#9fe07a'); bg.addColorStop(1, '#79cf55');
      c.fillStyle = bg; c.fillRect(0, 0, w, h);
      // Sonne mit Strahlen (Kinderzeichnung)
      c.strokeStyle = '#ffc61a'; c.lineWidth = 9; c.lineCap = 'round';
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; c.beginPath(); c.moveTo(440 + Math.cos(a) * 46, 70 + Math.sin(a) * 46); c.lineTo(440 + Math.cos(a) * 64, 70 + Math.sin(a) * 64); c.stroke(); }
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(440, 70, 36, 0, TAU); c.fill();
      // Blumen
      [[60, 340, '#ff6fb1'], [110, 362, '#ffffff'], [420, 352, '#9b6bff'], [470, 330, '#ff4d4d']].forEach(([x, y, col]) => {
        c.strokeStyle = '#3f9f3c'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30); c.stroke();
        c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 11, y + Math.sin(a) * 11, 9, 0, TAU); c.fill(); }
        c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill();
      });
      // Flo (Fuchs-Kopf wie das Maskottchen)
      c.save();
      c.translate(w / 2 - 125, 42);
      c.scale(1.78, 1.78);
      const P2 = (d, fill) => { c.fillStyle = fill; c.fill(new Path2D(d)); };
      if (window.Path2D) {
        P2('M26 46 L34 6 L58 32 Z', '#ff8a3d');
        P2('M33 38 L37 16 L50 31 Z', '#5a3a2e');
        P2('M114 46 L106 6 L82 32 Z', '#ff8a3d');
        P2('M107 38 L103 16 L90 31 Z', '#5a3a2e');
        P2('M70 22 C104 22 122 44 120 66 C118 88 98 104 70 104 C42 104 22 88 20 66 C18 44 36 22 70 22 Z', '#ff8a3d');
        P2('M70 58 C84 58 104 66 116 72 C112 92 94 104 70 104 C46 104 28 92 24 72 C36 66 56 58 70 58 Z', '#fff4e8');
        c.fillStyle = 'rgba(255,179,161,0.8)';
        c.beginPath(); c.ellipse(34, 80, 8, 5, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(106, 80, 8, 5, 0, 0, TAU); c.fill();
        c.fillStyle = '#2b2d42';
        c.beginPath(); c.ellipse(50, 60, 8, 10, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(90, 60, 8, 10, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(70, 76, 8, 5.5, 0, 0, TAU); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(53, 56, 3, 0, TAU); c.fill();
        c.beginPath(); c.arc(93, 56, 3, 0, TAU); c.fill();
        c.strokeStyle = '#2b2d42'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(60, 85); c.quadraticCurveTo(70, 92, 80, 85); c.stroke();
      }
      c.restore();
    });
    function easel() {
      const grp = new T.Group();
      grp.name = 'staffelei';
      const P = new kit.Parts();
      const wood = '#c98d58';
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.12, 2.9, 0.12, 0.04, 1), [s * 0.62, 1.38, 0.12], [-0.08, 0, s * 0.16]), wood, { grad: [0.72, 1.05] }));
      P.add(xf(geo.roundBox(0.12, 2.7, 0.12, 0.04, 1), [0, 1.25, -0.48], [0.38, 0, 0]), kit.shade(wood, 0.88), { grad: [0.72, 1.02] });
      P.add(xf(geo.roundBox(1.6, 0.12, 0.3, 0.04, 1), [0, 0.92, 0.2]), wood, { grad: [0.85, 1.04] });
      P.add(xf(geo.roundBox(0.5, 0.1, 0.16, 0.03, 1), [0, 2.62, 0.08], [-0.08, 0, 0]), wood, {});
      // Leinwand-Rahmen
      P.add(xf(geo.roundBox(1.78, 1.42, 0.1, 0.04, 1), [0, 1.74, 0.17], [-0.08, 0, 0]), '#fffaf0', { grad: [0.9, 1.02] });
      // Farbtuben auf der Ablage
      [[PAL.red, -0.5], [PAL.blue, -0.25], [ACC, 0.45]].forEach(([c2, x], i) => {
        P.add(xf(geo.cyl(0.06, 0.07, 0.3, 8).rotateZ(PI / 2), [x, 1.04, 0.22], [0, 0.3 * (i - 1), 0]), '#eef2f6', { gloss: true });
        P.add(xf(geo.cyl(0.072, 0.072, 0.08, 8).rotateZ(PI / 2), [x - 0.14, 1.04, 0.22], [0, 0.3 * (i - 1), 0]), c2, { gloss: true });
      });
      P.build(grp);
      const pic = new T.Mesh(new T.PlaneGeometry(1.62, 1.26), new T.MeshStandardMaterial({ map: portrait, roughness: 0.82 }));
      pic.position.set(0, 1.74, 0.228);
      pic.rotation.x = -0.08;
      pic.receiveShadow = true;
      grp.add(pic);
      return grp;
    }
    base.place(easel(), 0.35, -0.85, { rotY: -0.08, keep: 1.0 });

    /* ------------------------------------------------------------------
       Atelier-Häuschen mit Wimpelkette (hinten rechts)
       ------------------------------------------------------------------ */
    const house = kit.house({ wall: '#fff3dc', roof: ACC, door: '#3f9bff', scale: 0.95 });
    base.place(house, 2.35, -2.2, { rotY: -0.42, keep: 1.2 });
    (function bunting() {
      // vom Atelier-Giebel zum höchsten Stift
      house.updateMatrixWorld(true);
      const a = new T.Vector3(-0.95, 1.36, 0.92).applyMatrix4(house.matrix);
      const b = new T.Vector3(-1.95 + 0.25, ground(-1.95, -2.15) + 2.55, -2.15 + 0.1);
      const P = new kit.Parts();
      const N = 9;
      const cols = [PAL.red, PAL.yellow, PAL.blue, PAL.green, PAL.pink, PAL.violet, PAL.orange];
      const pt = (t) => new T.Vector3().lerpVectors(a, b, t).add(new T.Vector3(0, -Math.sin(t * PI) * 0.42, 0));
      // Schnur
      const curve = new T.CatmullRomCurve3([0, 0.25, 0.5, 0.75, 1].map(pt));
      P.add(new T.TubeGeometry(curve, 16, 0.012, 3, false), '#fff6e8', {});
      const dir = new T.Vector3().subVectors(b, a).setY(0).normalize();
      const ang = Math.atan2(-dir.z, dir.x);
      for (let i = 1; i < N; i++) {
        const t = i / N;
        const p = pt(t);
        const tri = new T.BufferGeometry();
        tri.setAttribute('position', new T.Float32BufferAttribute([-0.15, 0, 0.004, 0, -0.34, 0.004, 0.15, 0, 0.004, -0.15, 0, -0.004, 0.15, 0, -0.004, 0, -0.34, -0.004], 3));
        tri.computeVertexNormals();
        P.add(xf(tri, [p.x, p.y, p.z], [0, ang, 0]), cols[i % cols.length], { grad: [0.85, 1.05] });
      }
      const m = P.build(null, { castShadow: true });
      m.name = 'wimpel';
      g.add(m);
    })();

    /* ------------------------------------------------------------------
       Farbtöpfe (links), einer umgekippt mit Pfütze
       ------------------------------------------------------------------ */
    function paintCan(P, color, x, z, s, tipped) {
      const parts = [];
      const prof = [[0, 0], [0.34, 0], [0.36, 0.04], [0.36, 0.56], [0.38, 0.6], [0.34, 0.62], [0.32, 0.55], [0, 0.55]].map((p) => new T.Vector2(p[0], p[1]));
      parts.push([new T.LatheGeometry(prof, 14), '#e9eef3', { gloss: true, grad: [0.75, 1.06] }]);
      parts.push([geo.cyl(0.365, 0.365, 0.2, 14).translate(0, 0.3, 0), color, { gloss: true, grad: [0.85, 1.05] }]);
      parts.push([geo.cyl(0.33, 0.33, 0.02, 14).translate(0, 0.56, 0), color, { gloss: true }]);
      parts.push([new T.TorusGeometry(0.33, 0.016, 3, 12, PI).rotateY(PI / 2).translate(0, 0.62, 0), '#7d8a98', { gloss: true }]);
      // Farbnasen außen
      [[0.4, 0.2], [1.9, 0.32], [3.6, 0.14]].forEach(([a, l]) => {
        parts.push([geo.cyl(0.045, 0.05, l, 5).translate(Math.cos(a) * 0.37, 0.6 - l / 2, Math.sin(a) * 0.37), color, { gloss: true }]);
        parts.push([new T.IcosahedronGeometry(0.055, 0).translate(Math.cos(a) * 0.37, 0.6 - l, Math.sin(a) * 0.37), color, { gloss: true }]);
      });
      const rot = tipped ? [0, -0.88, -PI / 2] : [0, 0, 0];
      const lift = tipped ? 0.37 * s : 0;
      parts.forEach(([q, c, o]) => { q.scale(s, s, s); if (tipped) q.translate(0, -0.3 * s, 0); P.add(xf(q, [x, ground(x, z) + lift, z], rot), c, o); });
    }
    (function paints() {
      const P = new kit.Parts();
      paintCan(P, PAL.red, -3.35, -0.35, 1.0, false);
      paintCan(P, PAL.blue, -2.75, 0.2, 0.85, false);
      paintCan(P, PAL.green, -3.55, 0.55, 0.8, true);
      // Pfütze vor dem umgekippten Topf
      const s = new T.Shape();
      const rr = kit.rng(3);
      for (let k = 0; k <= 16; k++) { const a = (k / 16) * TAU; const r = 0.42 * (1 + 0.2 * Math.sin(a * 4 + 1) + 0.1 * (rr() - 0.5)); if (k) s.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r * 1.3, Math.sin(a) * r); }
      const px = -3.05, pz = 1.15;
      P.add(xf(new T.ShapeGeometry(s).rotateX(-PI / 2), [px, ground(px, pz) + 0.035, pz], [0, -0.5, 0]), PAL.green, { gloss: true, grad: [1, 1] });
      const m = P.build();
      m.name = 'farbtoepfe';
      g.add(m);
      base.keep(-3.2, 0.2, 1.0);
    })();

    /* ------------------------------------------------------------------
       Regenbogen-Farbspur mit Riesenpinsel (vorne)
       ------------------------------------------------------------------ */
    const stroke = new T.CatmullRomCurve3([[-2.55, 2.05], [-1.55, 2.95], [-0.35, 2.55], [0.75, 2.05], [1.55, 2.55]].map((p) => new T.Vector3(p[0], 0, p[1])), false, 'centripetal');
    (function paintStroke() {
      const P = new kit.Parts();
      const bands = [PAL.red, PAL.yellow, PAL.blue];
      const n = 28, Wd = 0.62;
      const tmp = new T.Vector3(), tg = new T.Vector3();
      bands.forEach((col, b) => {
        const gm = groundMesh();
        let prev = null;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          stroke.getPointAt(t, tmp); stroke.getTangentAt(t, tg);
          const nx = -tg.z, nz = tg.x;
          const taper = Math.min(1, t * 6) * (0.9 + 0.1 * Math.sin(t * 17));
          const w = Wd * taper;
          const o0 = -w / 2 + (w / 3) * b, o1 = o0 + w / 3;
          const pA = [tmp.x + nx * o0, 0, tmp.z + nz * o0], pB = [tmp.x + nx * o1, 0, tmp.z + nz * o1];
          pA[1] = ground(pA[0], pA[2]) + 0.04; pB[1] = ground(pB[0], pB[2]) + 0.04;
          if (prev) gm.quad(prev[0], prev[1], pB, pA);
          prev = [pA, pB];
        }
        P.add(gm.geo(), col, { gloss: true, grad: [1, 1] });
      });
      // Farbkleckse
      [[-2.2, 2.6, PAL.red], [-0.9, 3.25, PAL.blue], [0.3, 1.95, PAL.yellow]].forEach(([x, z, col]) => P.add(xf(new T.CircleGeometry(0.09, 7).rotateX(-PI / 2), [x, ground(x, z) + 0.04, z]), col, { gloss: true }));
      const m = P.build(null, { castShadow: false });
      m.name = 'farbspur';
      g.add(m);
      for (let i = 0; i <= 8; i++) { stroke.getPointAt(i / 8, tmp); base.keep(tmp.x, tmp.z, 0.45); }
    })();
    function bigBrush() {
      const P = new kit.Parts();
      // liegt entlang +x, Borsten bei x = 0
      P.add(xf(geo.cyl(0.07, 0.11, 1.7, 8).rotateZ(PI / 2), [1.25, 0, 0]), ACC, { gloss: true, smooth: true, grad: [0.8, 1.06] });
      P.add(xf(new T.SphereGeometry(0.075, 8, 5), [2.1, 0, 0]), ACC, { gloss: true, smooth: true });
      P.add(xf(geo.cyl(0.14, 0.12, 0.34, 10).rotateZ(PI / 2), [0.28, 0, 0]), '#c9d2dc', { gloss: true, smooth: true, grad: [0.85, 1.1] });
      // Borsten: Spitze voller blauer Farbe (vor dem Drehen bemalt)
      const bristle = kit.paint(new T.SphereGeometry(0.16, 10, 6, 0, TAU, 0, PI / 2).scale(1, 2.6, 1), '#f3dcb0', { top: PAL.blue, topFrom: 0.35, grad: [0.9, 1.05] });
      P.addRaw(xf(bristle, [0.1, 0, 0], [0, 0, PI / 2]), 'matte');
      const m = P.build();
      m.name = 'pinsel';
      return m;
    }
    {
      const end = stroke.getPointAt(1), tg = stroke.getTangentAt(1);
      const brush = bigBrush();
      const ang = Math.atan2(-tg.z, tg.x);
      const bx = end.x + tg.x * 0.38, bz = end.z + tg.z * 0.38;
      base.place(brush, bx, bz, { rotY: ang, y: 0.13, keep: 0.6 });
      brush.rotation.z = 0.08;
    }

    /* ------------------------------------------------------------------
       Schere, die schnippt (rechts), mit Papierschnipseln
       ------------------------------------------------------------------ */
    function scissorHalf(sign) {
      const P = new kit.Parts();
      // Klinge (spitz zulaufend) nach oben, Griff-Öse nach unten
      const bl = new T.Shape();
      bl.moveTo(-0.09, 0); bl.lineTo(0.1, 0); bl.quadraticCurveTo(0.09, 0.8, 0.0, 1.55); bl.quadraticCurveTo(-0.07, 0.8, -0.09, 0);
      const blade = new T.ExtrudeGeometry(bl, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 6 });
      blade.translate(0, 0.0, sign > 0 ? 0.0 : -0.07);
      P.add(blade, '#dfe6ee', { gloss: true, grad: [0.85, 1.12] });
      const ring = new T.TorusGeometry(0.24, 0.07, 6, 16).scale(1, 1.25, 1);
      P.add(xf(ring, [0.0, -0.42, sign > 0 ? 0.02 : -0.05]), sign > 0 ? ACC : PAL.red, { gloss: true, grad: [0.85, 1.08] });
      P.add(xf(geo.roundBox(0.14, 0.18, 0.08, 0.03, 1), [0, -0.12, sign > 0 ? 0.02 : -0.05]), sign > 0 ? ACC : PAL.red, { gloss: true });
      const grp = P.build();
      return grp;
    }
    (function scissors() {
      const holder = new T.Group();
      holder.name = 'schere';
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.9, 0.2, 0.6, 0.06), [0, 0.1, 0]), '#ffffff', { grad: [0.8, 1.02] });
      P.add(xf(geo.roundBox(0.92, 0.04, 0.62, 0.02, 1), [0, 0.2, 0]), PAL.green, { gloss: true });
      P.build(holder);
      const pivot = new T.Group();
      pivot.position.set(0, 1.08, 0.03);
      const hA = scissorHalf(1), hB = scissorHalf(-1);
      pivot.add(hA, hB);
      pivot.userData.dynamic = true;
      holder.add(pivot);
      // Schraube
      const screw = kit.mesh(geo.cyl(0.07, 0.07, 0.16, 10).rotateX(PI / 2), C.gold, { gloss: true });
      screw.position.set(0, 1.08, 0.0);
      holder.add(screw);
      base.place(holder, 3.2, 0.55, { rotY: -0.55, keep: 0.75 });
      updates.push((dt, t) => {
        const ph = (t * 0.9 * Math.max(calm, 0.2)) % 2.2;
        const open = ph < 1.6 ? 0.42 : 0.42 - Math.sin(((ph - 1.6) / 0.6) * PI) * 0.36;
        hA.rotation.z = -open * Math.max(calm, 0.3);
        hB.rotation.z = open * Math.max(calm, 0.3);
      });
      // Papierschnipsel
      const S = new kit.Parts();
      const rr = kit.rng(11);
      for (let i = 0; i < 9; i++) {
        const a = rr() * TAU, d = 0.55 + rr() * 0.6;
        const x = 3.2 + Math.cos(a) * d, z = 0.55 + Math.sin(a) * d;
        if (!base.isOnGrass(x, z, 0.1)) continue;
        const q = rr() < 0.5 ? new T.CircleGeometry(0.08, 3) : new T.PlaneGeometry(0.15, 0.09);
        S.add(xf(q.rotateX(-PI / 2), [x, ground(x, z) + 0.03, z], [0, rr() * TAU, 0]), rr.pick([PAL.pink, PAL.blue, PAL.yellow, '#ffffff', PAL.green]), { grad: [1, 1], double: false });
      }
      const sm = S.build(null, { castShadow: false });
      sm.name = 'schnipsel';
      g.add(sm);
    })();

    /* ------------------------------------------------------------------
       Wäscheleine mit Kinderbildern (vorne links)
       ------------------------------------------------------------------ */
    const drawings = kit.canvasTexture(768, 320, (c, w, h) => {
      const cw = w / 3;
      for (let k = 0; k < 3; k++) {
        const x0 = k * cw;
        c.fillStyle = '#fffdf6'; c.fillRect(x0 + 4, 4, cw - 8, h - 8);
        c.lineCap = 'round'; c.lineJoin = 'round';
        const cx = x0 + cw / 2;
        if (k === 0) { // Regenbogen
          ['#ff4d4d', '#ff9a2e', '#ffd23f', '#46c95a', '#3f9bff', '#9b6bff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 13; c.beginPath(); c.arc(cx, 210, 95 - i * 13, PI, TAU); c.stroke(); });
          c.fillStyle = '#ffffff'; c.strokeStyle = '#bcd7ea'; c.lineWidth = 4;
          [[cx - 88, 214], [cx + 88, 214]].forEach(([x, y]) => { c.beginPath(); c.arc(x - 16, y, 18, 0, TAU); c.arc(x + 10, y - 8, 22, 0, TAU); c.arc(x + 28, y + 4, 15, 0, TAU); c.fill(); });
        } else if (k === 1) { // Haus mit Sonne
          c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x0 + 196, 66, 30, 0, TAU); c.fill();
          c.fillStyle = '#3f9bff'; c.fillRect(cx - 70, 150, 120, 110);
          c.fillStyle = '#ff4d4d'; c.beginPath(); c.moveTo(cx - 88, 152); c.lineTo(cx - 10, 84); c.lineTo(cx + 68, 152); c.closePath(); c.fill();
          c.fillStyle = '#ffd23f'; c.fillRect(cx - 25, 200, 30, 60);
          c.strokeStyle = '#46c95a'; c.lineWidth = 10; c.beginPath(); c.moveTo(x0 + 14, 268); c.lineTo(x0 + cw - 14, 268); c.stroke();
        } else { // Blume
          c.strokeStyle = '#3fae48'; c.lineWidth = 10; c.beginPath(); c.moveTo(cx, 150); c.quadraticCurveTo(cx + 18, 210, cx, 280); c.stroke();
          c.fillStyle = '#5cc04a'; c.beginPath(); c.ellipse(cx + 28, 225, 26, 11, -0.5, 0, TAU); c.fill();
          c.fillStyle = '#ff6fb1'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; c.beginPath(); c.arc(cx + Math.cos(a) * 40, 120 + Math.sin(a) * 40, 27, 0, TAU); c.fill(); }
          c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx, 120, 26, 0, TAU); c.fill();
          c.fillStyle = '#2b2d42'; c.beginPath(); c.arc(cx - 8, 115, 4, 0, TAU); c.arc(cx + 8, 115, 4, 0, TAU); c.fill();
        }
      }
    });
    (function clothesline() {
      const A = [-3.55, 2.35], B = [-2.05, 3.45];
      const P = new kit.Parts();
      const ya = ground(A[0], A[1]), yb = ground(B[0], B[1]);
      const H = 1.45;
      [[A, ya], [B, yb]].forEach(([p, y]) => {
        P.add(xf(geo.cyl(0.05, 0.06, H, 6), [p[0], y + H / 2, p[1]]), '#c98d58', { grad: [0.7, 1.05] });
        P.add(xf(new T.SphereGeometry(0.07, 6, 4), [p[0], y + H + 0.02, p[1]]), ACC, { gloss: true });
      });
      const pa = new T.Vector3(A[0], ya + H - 0.06, A[1]), pb = new T.Vector3(B[0], yb + H - 0.06, B[1]);
      const sag = (t) => new T.Vector3().lerpVectors(pa, pb, t).add(new T.Vector3(0, -Math.sin(t * PI) * 0.16, 0));
      P.add(new T.TubeGeometry(new T.CatmullRomCurve3([0, 0.25, 0.5, 0.75, 1].map(sag)), 12, 0.012, 3, false), '#fff6e8', {});
      const ang = Math.atan2(-(B[1] - A[1]), B[0] - A[0]);
      const quads = [];
      [0.22, 0.5, 0.78].forEach((t, k) => {
        const p = sag(t);
        const q = new T.PlaneGeometry(0.46, 0.58);
        const uv = q.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setX(i, (k + uv.getX(i)) / 3);
        const tilt = (k - 1) * 0.06;
        quads.push(xf(q, [p.x, p.y - 0.31, p.z], [0, ang, tilt]));
        // Rückseite (weiß) und Klammern
        P.add(xf(new T.PlaneGeometry(0.46, 0.58).rotateY(PI), [p.x, p.y - 0.31, p.z], [0, ang, tilt]), '#f4efe6', { grad: [1, 1] });
        [-0.15, 0.15].forEach((dx) => P.add(xf(geo.box(0.04, 0.11, 0.05), [p.x + Math.cos(ang) * dx, p.y - 0.02, p.z - Math.sin(ang) * dx], [0, ang, 0]), [PAL.red, PAL.blue, PAL.green][k], { gloss: true }));
      });
      const grp = P.build();
      grp.name = 'waescheleine';
      const pics = new T.Mesh(T.addons.mergeGeometries(quads, false), new T.MeshStandardMaterial({ map: drawings, roughness: 0.85 }));
      pics.castShadow = true;
      pics.receiveShadow = true;
      grp.add(pics);
      g.add(grp);
      base.keep(A[0], A[1], 0.3); base.keep(B[0], B[1], 0.3); base.keep((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0.5);
    })();

    /* ------------------------------------------------------------------
       Papierflieger (kreisen) und Papierboote (schaukeln am Ufer)
       ------------------------------------------------------------------ */
    (function planes() {
      const pos = [
        // Rumpf-Falz und zwei Flügel (Spitze nach +x)
        0.42, 0, 0, -0.26, 0.0, 0.28, -0.22, 0.03, 0,
        0.42, 0, 0, -0.22, 0.03, 0, -0.26, 0.0, -0.28,
        0.42, 0, 0, -0.22, 0.03, 0, -0.24, -0.1, 0,
      ];
      const q = new T.BufferGeometry();
      q.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      q.computeVertexNormals();
      const pg = kit.paint(q, '#ffffff', { grad: [0.92, 1.02] });
      const list = [
        { r: 3.4, h: 4.3, sp: 0.32, ph: 0.4, col: '#ffffff', bank: 0.35 },
        { r: 2.6, h: 3.7, sp: -0.4, ph: 2.6, col: '#bfe3ff', bank: -0.35 },
        { r: 4.2, h: 3.3, sp: 0.26, ph: 4.4, col: '#ffd9ea', bank: 0.3 },
      ];
      const mesh = new T.InstancedMesh(pg, kit.mats.matteDouble, list.length);
      mesh.name = 'papierflieger';
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      mesh.userData.dynamic = true;
      const cc = new T.Color();
      list.forEach((p, i) => mesh.setColorAt(i, cc.set(p.col)));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      g.add(mesh);
      const d = new T.Object3D();
      d.rotation.order = 'YXZ';
      const set = (t) => {
        list.forEach((p, i) => {
          const a = p.ph + t * p.sp * Math.max(calm, 0.15);
          d.position.set(Math.cos(a) * p.r, p.h + Math.sin(t * 1.3 + p.ph) * 0.2 * calm, Math.sin(a) * p.r);
          // Flugrichtung = Tangente
          const dir = p.sp > 0 ? 1 : -1;
          d.rotation.set(p.bank, -a - dir * PI / 2, Math.sin(t * 1.3 + p.ph) * 0.1 * calm);
          d.updateMatrix();
          mesh.setMatrixAt(i, d.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      };
      set(0);
      updates.push((dt, t) => set(t));
    })();
    (function boats() {
      const P = new kit.Parts();
      // Rumpf (Trapez-Prisma) und dreieckiges Segel aus gefaltetem Papier
      const hull = new T.Shape();
      hull.moveTo(-0.42, 0.16); hull.lineTo(0.42, 0.16); hull.lineTo(0.26, -0.04); hull.lineTo(-0.26, -0.04); hull.closePath();
      P.add(new T.ExtrudeGeometry(hull, { depth: 0.26, bevelEnabled: false }).translate(0, 0, -0.13), '#ffffff', { grad: [0.85, 1.02] });
      const sail = new T.Shape();
      sail.moveTo(-0.26, 0.16); sail.lineTo(0.26, 0.16); sail.lineTo(0, 0.56); sail.closePath();
      P.add(new T.ExtrudeGeometry(sail, { depth: 0.04, bevelEnabled: false }).translate(0, 0, -0.02), '#ffffff', { grad: [0.9, 1.04] });
      const bg = P.build();
      const src = bg.children[0].geometry;
      const spots = [[1.95, 0.75, '#ffffff'], [1.15, 0.9, '#fff1a8'], [0.62, 0.65, '#cfe9ff']];
      const mesh = new T.InstancedMesh(src, kit.mats.matte, spots.length);
      mesh.name = 'papierboote';
      mesh.castShadow = true;
      mesh.userData.dynamic = true;
      const cc = new T.Color();
      const d = new T.Object3D();
      const pose = spots.map(([a, out]) => base.shore(a, out));
      spots.forEach((s, i) => mesh.setColorAt(i, cc.set(s[2])));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      g.add(mesh);
      const set = (t) => {
        pose.forEach((p, i) => {
          d.position.set(p.x, 0.02 + Math.sin(t * 1.6 + i * 2) * 0.04 * calm, p.z);
          d.rotation.set(Math.sin(t * 1.2 + i) * 0.1 * calm, p.rotY + PI / 2 + i * 0.5, Math.sin(t * 1.5 + i * 1.7) * 0.08 * calm);
          d.scale.setScalar(0.85);
          d.updateMatrix();
          mesh.setMatrixAt(i, d.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      };
      set(0);
      mesh.computeBoundingSphere();
      updates.push((dt, t) => set(t));
    })();

    /* ------------------------------------------------------------------
       Bäume, Büsche, Steine, Gras und Blumen
       ------------------------------------------------------------------ */
    base.place(kit.tree({ type: 'round', seed: 891, color: '#57c24c' }), -3.75, -1.65, { keep: 0.9 });
    base.place(kit.tree({ type: 'round', seed: 892, scale: 0.85, color: '#ffc94a' }), 3.85, -0.95, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 893, scale: 0.85 }), 0.35, -3.75, { keep: 0.6 });
    base.place(kit.bush({ seed: 894, size: 0.75, berries: PAL.pink }), -0.95, 1.35, { keep: 0.5 });
    base.place(kit.bush({ seed: 895, size: 0.7, berries: ACC }), 2.35, 1.75, { keep: 0.45 });
    base.place(kit.rock({ size: 0.45, seed: 896, moss: true }), 3.05, 2.95, { keep: 0.3 });
    kit.grassTufts(base, 48, 89);
    kit.flowers(base, 14, [ACC, '#ffffff', PAL.pink, PAL.orange], 89);

    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 6.0, -1.8),
        focus: new T.Vector3(0, 1.5, -0.3),
      },
    };
  });
})();
