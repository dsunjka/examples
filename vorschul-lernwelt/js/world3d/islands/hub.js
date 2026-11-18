/* ==========================================================================
   js/world3d/islands/hub.js – Flos Heimatinsel (Weltmitte)

   Gemütliche Heimat des Fuchses Flo: Baumhaus mit runder Fuchstür im
   Stamm, Schaukel und Fähnchen, orange geringelter Leuchtturm, Steg mit
   schaukelndem Boot, Wegweiser mit bunten Pfeilen (1 2 3 · A B C · Formen),
   Lagerfeuer mit Baumstamm-Bänken, Briefkasten, Bäume, Büsche und Blumen.
   Vorne-mittig ein kleiner Wiesenhügel als Bühne für den 3D-Flo
   (anchors.flo) – die Insel ist auch die Bühne des Startbildschirms.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'hub', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#ff8a3d'; // Fuchs-Orange
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = []; // eigene Animationen (group.userData.update)

    const base = kit.islandBase({ seed: 5, radius: 6.3, grassRadius: 4.85, stones: 4, hills: 0.8, segments: 48 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* Plätze freihalten: Flos Hügel vorne, Baumhaus, Leuchtturm */
    const FLO = { x: 0.15, z: 2.55 };
    base.keep(FLO.x, FLO.z, 1.25);

    /* ------------------------------------------------------------------
       Baumhaus: Stamm mit Wurzeln und runder Fuchstür, Plattform mit
       Geländer, runde Hütte mit orangem Kegeldach, Krone dahinter, Leiter
       ------------------------------------------------------------------ */
    function treehouse() {
      const grp = new T.Group();
      grp.name = 'baumhaus';
      const P = new kit.Parts();
      const bark = '#9b6a45', plank = '#c98d58', plankLight = '#e2b47c', wall = '#f4d8a8';
      // Stamm (Drehkörper, unten ausgestellt) und Wurzeln
      const prof = [[0.8, 0], [0.62, 0.18], [0.5, 0.6], [0.45, 1.3], [0.44, 2.0], [0.5, 2.3], [0, 2.32]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(prof, 10), bark, { grad: [0.6, 1.02], jitter: 0.05, seed: 3 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.5;
        const r = new T.ConeGeometry(0.2, 0.95, 5);
        xf(r, [Math.cos(a) * 0.7, 0.13, Math.sin(a) * 0.7], [0, -a, -PI / 2 - 0.32]);
        P.add(r, kit.shade(bark, 0.92), { grad: [0.75, 1.05] });
      }
      // runde Fuchstür (Bogen) mit Rahmen, Knauf und Trittstein
      const arch = (w, h) => {
        const s = new T.Shape();
        s.moveTo(-w, 0); s.lineTo(w, 0); s.lineTo(w, h); s.absarc(0, h, w, 0, PI, false); s.lineTo(-w, 0);
        return s;
      };
      P.add(xf(new T.ExtrudeGeometry(arch(0.33, 0.42), { depth: 0.1, bevelEnabled: false, curveSegments: 6 }), [0, 0.06, 0.5]), plankLight, { grad: [0.85, 1.05] });
      P.add(xf(new T.ExtrudeGeometry(arch(0.25, 0.4), { depth: 0.1, bevelEnabled: false, curveSegments: 6 }), [0, 0.08, 0.54]), ACC, { grad: [0.78, 1.05] });
      P.add(xf(geo.box(0.03, 0.55, 0.02), [-0.08, 0.36, 0.645]), kit.shade(ACC, 0.8), {});
      P.add(xf(geo.box(0.03, 0.55, 0.02), [0.08, 0.36, 0.645]), kit.shade(ACC, 0.8), {});
      P.add(xf(new T.IcosahedronGeometry(0.045, 0), [0.15, 0.36, 0.67]), C.gold, { gloss: true });
      P.add(xf(geo.cyl(0.3, 0.34, 0.07, 9), [0, 0.03, 0.82], null, [1.3, 1, 0.8]), C.stone, { grad: [0.85, 1.02] });
      // Plattform mit Stützbalken
      const PY = 2.32;
      P.add(xf(geo.cyl(1.42, 1.42, 0.16, 16), [0, PY, 0]), plank, { grad: [0.78, 1.04], jitter: 0.04, seed: 5 });
      P.add(xf(geo.cyl(1.44, 1.3, 0.1, 16), [0, PY - 0.12, 0]), kit.shade(plank, 0.8), {});
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + 0.6;
        const b = geo.cyl(0.06, 0.07, 1.15, 5);
        b.translate(0, 0.575, 0);
        b.rotateZ(-0.95);
        b.rotateY(-a);
        b.translate(Math.cos(a) * 0.42, 1.35, Math.sin(a) * 0.42);
        P.add(b, kit.shade(bark, 0.95), { grad: [0.8, 1] });
      }
      // Geländer (vorne offen für die Leiter)
      const gap = 0.38;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + PI / 12;
        const d = Math.abs(((a - PI / 2 + PI) % TAU) - PI);
        if (d < gap) continue;
        P.add(xf(geo.cyl(0.035, 0.04, 0.48, 4), [Math.cos(a) * 1.3, PY + 0.32, Math.sin(a) * 1.3]), plankLight, { grad: [0.8, 1.05] });
      }
      P.add(new T.TorusGeometry(1.3, 0.04, 3, 22, TAU - gap * 2 - 0.08).rotateX(PI / 2).rotateY(-(PI / 2 + gap + 0.04)).translate(0, PY + 0.56, 0), plankLight, { grad: [0.95, 1.05] });
      // runde Hütte
      const HY = PY + 0.08, hz = -0.2;
      P.add(xf(geo.cyl(0.7, 0.74, 0.98, 12), [0, HY + 0.49, hz]), wall, { grad: [0.86, 1.04], jitter: 0.03, seed: 8 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + PI / 8;
        P.add(xf(geo.box(0.05, 0.98, 0.04), [Math.cos(a) * 0.73, HY + 0.49, hz + Math.sin(a) * 0.73], [0, -a + PI / 2, 0]), kit.shade(wall, 0.84), {});
      }
      P.add(xf(geo.roundBox(0.38, 0.66, 0.08, 0.05), [0, HY + 0.33, hz + 0.72]), '#8a5636', { grad: [0.85, 1.05] });
      P.add(xf(new T.IcosahedronGeometry(0.035, 0), [0.11, HY + 0.33, hz + 0.78]), C.gold, { gloss: true });
      [-0.95, 0.95].forEach((ang) => {
        const a = PI / 2 + ang;
        const wx = Math.cos(a) * 0.74, wz = hz + Math.sin(a) * 0.74;
        P.addRaw(kit.paint(geo.cyl(0.16, 0.16, 0.06, 10).rotateX(PI / 2).rotateY(PI / 2 - a).translate(wx, HY + 0.58, wz), '#ffffff', { grad: [1, 1] }), 'window');
        P.add(new T.TorusGeometry(0.17, 0.04, 3, 10).rotateY(PI / 2 - a).translate(wx, HY + 0.58, wz), '#ffffff', { grad: [0.9, 1.02] });
      });
      // Kegeldach mit Krempe, Knauf
      const RY = HY + 0.98;
      P.add(xf(new T.ConeGeometry(1.02, 1.0, 12), [0, RY + 0.48, hz]), ACC, { grad: [0.72, 1.1] });
      P.add(xf(geo.cyl(1.04, 1.0, 0.1, 12), [0, RY, hz]), kit.shade(ACC, 0.78), {});
      P.add(xf(new T.IcosahedronGeometry(0.09, 0), [0, RY + 1.0, hz]), C.gold, { gloss: true });
      // oberer Stamm und Krone (hinter der Hütte)
      P.add(xf(geo.cyl(0.26, 0.4, 1.9, 8), [0.15, PY + 0.95, -0.95], [0.12, 0, -0.05]), bark, { grad: [0.7, 1.0] });
      P.add(xf(geo.cyl(0.07, 0.12, 0.9, 5), [0.75, PY + 1.55, -0.85], [0, 0, -0.95]), bark, { grad: [0.8, 1] });
      const leaf = '#5fc24c';
      const crown = [[0.1, PY + 2.45, -1.05, 1.18], [1.05, PY + 2.0, -0.75, 0.82], [-0.95, PY + 1.95, -0.8, 0.86], [0.3, PY + 3.0, -0.6, 0.74]];
      crown.forEach(([x, y, z, s], i) => {
        P.add(xf(geo.blob(s, { seed: 40 + i, noise: 0.16, sy: 0.9 }), [x, y, z], [0, i, 0]), kit.shade(leaf, 0.92 + (i % 3) * 0.06), { grad: [0.58, 1.16], jitter: 0.05, seed: 30 + i, range: [PY + 1.1, PY + 3.7] });
      });
      // Leiter (vorne)
      const lb = [0, 0, 1.95], lt = [0, PY + 0.02, 1.32];
      const len = Math.hypot(lt[1] - lb[1], lt[2] - lb[2]);
      const tilt = -Math.atan2(lb[2] - lt[2], lt[1] - lb[1]);
      [-0.24, 0.24].forEach((x) => P.add(xf(geo.cyl(0.04, 0.045, len + 0.2, 5), [x, (lb[1] + lt[1]) / 2, (lb[2] + lt[2]) / 2], [tilt, 0, 0]), kit.shade(plank, 0.9), { grad: [0.85, 1.05] }));
      for (let i = 1; i < 7; i++) {
        const t = i / 7;
        P.add(xf(geo.cyl(0.03, 0.03, 0.5, 5), [0, lb[1] + (lt[1] - lb[1]) * t, lb[2] + (lt[2] - lb[2]) * t], [0, 0, PI / 2]), plankLight, {});
      }
      P.build(grp);
      // Schaukel (hängt unter der Plattform, schwingt)
      const swing = new T.Group();
      swing.position.set(1.02, PY - 0.17, 0.35);
      swing.rotation.y = -0.5;
      const SP = new kit.Parts();
      [-0.2, 0.2].forEach((x) => SP.add(xf(geo.cyl(0.012, 0.012, 1.52, 3), [x, -0.76, 0]), '#efe2c8', {}));
      SP.add(xf(geo.roundBox(0.52, 0.06, 0.2, 0.025, 1), [0, -1.52, 0]), ACC, { grad: [0.85, 1.05] });
      SP.build(swing);
      grp.add(swing);
      kit.sway(swing, { amp: 0.22, speed: 1.1, axis: 'x', phase: 0.5 });
      // Fähnchen auf dem Dach
      const fl = kit.flag(ACC, { height: 1.1 });
      fl.scale.setScalar(0.62);
      fl.position.set(0, RY + 1.02, hz);
      grp.add(fl);
      return grp;
    }
    const th = treehouse();
    base.place(th, -1.15, -1.25, { rotY: 0.18, keep: 1.6 });

    /* Lampe neben der Fuchstür, Briefkasten */
    const lampe = kit.lamp({ height: 1.25 });
    base.place(lampe, -1.95, -0.25, { keep: 0.3 });
    function mailbox() {
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.04, 0.05, 0.78, 6), [0, 0.39, 0]), C.wood, { grad: [0.7, 1.05] });
      P.add(xf(geo.roundBox(0.3, 0.2, 0.42, 0.04), [0, 0.86, 0]), ACC, { grad: [0.8, 1.05], gloss: true });
      P.add(xf(geo.cyl(0.15, 0.15, 0.42, 8, 1).rotateX(PI / 2), [0, 0.96, 0], null, [1, 0.7, 1]), ACC, { grad: [0.85, 1.1], gloss: true });
      P.add(xf(geo.box(0.2, 0.025, 0.02), [0, 0.92, 0.215]), '#5a3416', {});
      P.add(xf(geo.box(0.025, 0.24, 0.025), [0.17, 1.03, -0.05]), C.metal, {});
      P.add(xf(geo.box(0.12, 0.08, 0.02), [0.22, 1.11, -0.05]), C.red, {});
      const m = P.build();
      m.name = 'briefkasten';
      return m;
    }
    base.place(mailbox(), 0.45, -0.25, { rotY: -0.35, keep: 0.3 });

    /* ------------------------------------------------------------------
       Leuchtturm (orange geringelt) auf Felsen hinten rechts
       ------------------------------------------------------------------ */
    const LH = { x: 2.95, z: -2.55 };
    base.place(kit.lighthouse({ color: ACC, scale: 1.0 }), LH.x, LH.z, { keep: 1.1, rotY: -0.5 });
    [[0.95, 0.45, 0.62], [-0.7, 0.8, 0.5], [0.6, -0.9, 0.5]].forEach(([dx, dz, s], i) => {
      base.place(kit.rock({ size: s, seed: 70 + i, moss: i % 2 === 0 }), LH.x + dx, LH.z + dz, { keep: 0, y: -0.06, rotY: i * 1.7 });
    });

    /* ------------------------------------------------------------------
       Steg mit Boot (rechts, leicht nach vorn)
       ------------------------------------------------------------------ */
    const PA = 0.2;
    const pierR = base.shoreRadius(PA) - 1.55;
    const pier = new T.Group();
    pier.name = 'steg';
    pier.position.set(Math.cos(PA) * pierR, 0.02, Math.sin(PA) * pierR);
    pier.rotation.y = -PA;
    pier.add(kit.pier(3.3, { width: 1.0 }));
    g.add(pier);
    const boat = kit.boat('#3d9bff', { sailColor: '#fff6e6' });
    const boatHold = new T.Group();
    boatHold.position.set(2.35, 0, 1.12);
    boatHold.rotation.y = 0.1;
    boatHold.add(boat);
    pier.add(boatHold);
    boatHold.userData.dynamic = true;
    updates.push((dt, t) => {
      boat.position.y = Math.sin(t * 1.3) * 0.05 * calm;
      boat.rotation.x = Math.sin(t * 1.1 + 0.6) * 0.05 * calm;
      boat.rotation.z = Math.sin(t * 0.9) * 0.035 * calm;
    });
    // freier Platz am Stegende
    base.keep(Math.cos(PA) * (pierR + 0.6), Math.sin(PA) * (pierR + 0.6), 0.9);

    /* ------------------------------------------------------------------
       Wegweiser mit bunten Pfeilen (Text als ein gemeinsamer Atlas)
       ------------------------------------------------------------------ */
    function signpost() {
      const grp = new T.Group();
      grp.name = 'wegweiser';
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.07, 0.085, 2.25, 7), [0, 1.12, 0]), C.wood, { grad: [0.65, 1.05] });
      P.add(xf(new T.ConeGeometry(0.11, 0.16, 7), [0, 2.3, 0]), ACC, { gloss: true });
      P.add(xf(geo.cyl(0.18, 0.22, 0.12, 8), [0, 0.06, 0]), C.stone, {});
      const rows = [
        { text: '1 2 3', color: '#ff8a3d', dir: -1, y: 1.92, ry: 0.22, font: 'num' },
        { text: 'A B C', color: '#8e6cef', dir: 1, y: 1.5, ry: -0.18, font: 'read' },
        { text: 'shapes', color: '#ff5fa2', dir: -1, y: 1.08, ry: -0.12, font: 'num' },
      ];
      const N = rows.length, CW = 512, CH = 128;
      const tex = kit.canvasTexture(CW, CH * N, (c, w) => {
        rows.forEach((r, i) => {
          const y0 = i * CH, cy = y0 + CH / 2;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          if (r.text === 'shapes') {
            // Kreis, Dreieck, Quadrat (gezeichnet, nicht als Schriftzeichen)
            const s = CH * 0.27;
            const draw = (dx, dy) => {
              c.beginPath(); c.arc(w * 0.27 + dx, cy + dy, s, 0, TAU); c.fill();
              c.beginPath(); c.moveTo(w * 0.5 + dx, cy - s * 1.05 + dy); c.lineTo(w * 0.5 + s * 1.15 + dx, cy + s * 0.95 + dy); c.lineTo(w * 0.5 - s * 1.15 + dx, cy + s * 0.95 + dy); c.closePath(); c.fill();
              c.fillRect(w * 0.73 - s + dx, cy - s + dy, s * 2, s * 2);
            };
            c.fillStyle = 'rgba(0,0,0,0.22)'; draw(4, 5);
            c.fillStyle = '#ffffff'; draw(0, 0);
            return;
          }
          c.font = `700 ${Math.round(CH * 0.66)}px ${r.font === 'read' ? kit.fonts.read : kit.fonts.num}`;
          c.fillStyle = 'rgba(0,0,0,0.22)';
          c.fillText(r.text, w / 2 + 4, cy + 7);
          c.fillStyle = '#ffffff';
          c.fillText(r.text, w / 2, cy + 3);
        });
      });
      const tmat = new T.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const quads = [];
      const L = 1.35, Hh = 0.36;
      rows.forEach((r, i) => {
        // Pfeil-Brett (Spitze in Richtung dir)
        const s = new T.Shape();
        const tip = 0.26;
        s.moveTo(0, -Hh / 2); s.lineTo(L - tip, -Hh / 2); s.lineTo(L, 0); s.lineTo(L - tip, Hh / 2); s.lineTo(0, Hh / 2); s.lineTo(0, -Hh / 2);
        const b = new T.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 1 });
        b.translate(-0.12, 0, -0.035);
        if (r.dir < 0) b.scale(-1, 1, 1);
        b.rotateY(r.ry);
        b.translate(0, r.y, 0.0);
        const bb = kit.paint(b, r.color, { grad: [0.86, 1.06] });
        // gespiegelte Geometrie: Dreiecke umdrehen
        if (r.dir < 0) {
          const p = bb.attributes.position, n = bb.attributes.normal, c = bb.attributes.color;
          for (let k = 0; k < p.count; k += 3) {
            [p, n, c].forEach((a) => { const t1 = [a.getX(k + 1), a.getY(k + 1), a.getZ(k + 1)]; a.setXYZ(k + 1, a.getX(k + 2), a.getY(k + 2), a.getZ(k + 2)); a.setXYZ(k + 2, t1[0], t1[1], t1[2]); });
          }
          bb.computeVertexNormals();
        }
        P.addRaw(bb, 'gloss');
        // Text-Fläche vorn
        const q = new T.PlaneGeometry(L - 0.36, Hh * 0.92);
        const uv = q.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k), (N - 1 - i + uv.getY(k)) / N);
        q.translate(r.dir * ((L - tip) / 2 - 0.12), 0, 0.066);
        q.rotateY(r.ry);
        q.translate(0, r.y, 0);
        quads.push(q);
      });
      P.build(grp);
      const tm = new T.Mesh(T.addons.mergeGeometries(quads, false), tmat);
      tm.renderOrder = 2;
      tm.receiveShadow = true;
      grp.add(tm);
      return grp;
    }
    base.place(signpost(), 2.05, 1.55, { rotY: -0.25, keep: 0.7 });

    /* ------------------------------------------------------------------
       Lagerfeuer mit Steinring, Holzscheiten, Bänken und Flammen
       ------------------------------------------------------------------ */
    function campfire() {
      const grp = new T.Group();
      grp.name = 'lagerfeuer';
      const P = new kit.Parts();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        P.add(xf(geo.blob(0.13, { seed: 90 + i, noise: 0.2, sy: 0.75, detail: 0 }), [Math.cos(a) * 0.44, 0.06, Math.sin(a) * 0.44], [0, a, 0]), kit.mix(C.rock, '#8e8178', (i % 3) / 3), { grad: [0.7, 1.08] });
      }
      P.add(xf(geo.cyl(0.36, 0.38, 0.03, 10), [0, 0.015, 0]), '#5b4636', {});
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + 0.4;
        P.add(xf(geo.cyl(0.045, 0.06, 0.62, 6), [Math.cos(a) * 0.17, 0.24, Math.sin(a) * 0.17], [-Math.sin(a) * 0.75, 0, Math.cos(a) * 0.75]), C.woodDark, { grad: [0.6, 1.1] });
      }
      // Baumstamm-Bänke
      [[-0.15, -1.05, 0.15], [1.0, 0.25, PI / 2 + 0.3]].forEach(([x, z, ry]) => {
        P.add(xf(geo.cyl(0.19, 0.19, 1.05, 9).rotateZ(PI / 2), [x, 0.19, z], [0, ry, 0]), C.wood, { grad: [0.72, 1.05], jitter: 0.03 });
        P.add(xf(geo.cyl(0.15, 0.15, 1.07, 9).rotateZ(PI / 2), [x, 0.19, z], [0, ry, 0]), C.woodLight, { grad: [0.95, 1.05] });
      });
      P.build(grp);
      // Flammen: ungeleuchtet, eigene Farbe (immer hell), flackern
      const fm = new T.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
      const fl = [];
      [[0, 0, 0.17, 0.62], [0.08, 0.06, 0.11, 0.42], [-0.08, -0.03, 0.11, 0.38]].forEach(([x, z, r, h], i) => {
        const c = new T.ConeGeometry(r, h, 6);
        c.translate(x, h / 2 + 0.1, z);
        fl.push(kit.paint(c, '#ff6a1a', { top: '#ffe36a', topFrom: 0.15, grad: [1, 1.05] }));
      });
      const flame = new T.Mesh(T.addons.mergeGeometries(fl, false), fm);
      flame.castShadow = false;
      flame.userData.dynamic = true;
      grp.add(flame);
      const halo = kit.glowHalo(2.4, '#ffb35a');
      halo.position.y = 0.5;
      grp.add(halo);
      // Rauchwölkchen steigen auf (instanziert, ein Draw-Call)
      const puffMat = new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 1, flatShading: true, transparent: true, opacity: 0.5, depthWrite: false });
      const NP = 5;
      const puffs = new T.InstancedMesh(new T.IcosahedronGeometry(0.13, 0), puffMat, NP);
      puffs.castShadow = false;
      puffs.userData.dynamic = true;
      puffs.frustumCulled = false;
      grp.add(puffs);
      const dummy = new T.Object3D();
      updates.push((dt, t) => {
        for (let i = 0; i < NP; i++) {
          const k = (t * 0.22 * (W.reducedMotion ? 0.3 : 1) + i / NP) % 1;
          dummy.position.set(Math.sin(k * 4 + i) * 0.1 + k * 0.25, 0.75 + k * 1.5, Math.cos(k * 3 + i * 2) * 0.08);
          const sc = (0.45 + k * 1.1) * Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.35);
          dummy.scale.setScalar(Math.max(0.001, sc));
          dummy.rotation.set(k * 2 + i, k * 3, 0);
          dummy.updateMatrix();
          puffs.setMatrixAt(i, dummy.matrix);
        }
        puffs.instanceMatrix.needsUpdate = true;
      });
      updates.push((dt, t) => {
        const k = calm;
        flame.scale.y = 1 + (Math.sin(t * 9.1) * 0.08 + Math.sin(t * 13.7 + 1) * 0.06) * k;
        flame.scale.x = flame.scale.z = 1 + Math.sin(t * 7.3 + 2) * 0.05 * k;
        flame.rotation.y = Math.sin(t * 2.1) * 0.4 * k;
      });
      return grp;
    }
    base.place(campfire(), -2.45, 1.6, { keep: 1.25, rotY: 0.2 });

    /* ------------------------------------------------------------------
       Flos Hügel (Bühne vorne-mittig)
       ------------------------------------------------------------------ */
    const hillY = ground(FLO.x, FLO.z);
    const hill = kit.mesh(new T.SphereGeometry(1.15, 14, 5, 0, TAU, 0, PI / 2).scale(1, 0.24, 1), '#86d660', { grad: [0.82, 1.08], jitter: 0.03, seed: 4 });
    hill.position.set(FLO.x, hillY - 0.06, FLO.z);
    g.add(hill);
    const floY = hillY - 0.06 + 1.15 * 0.24;

    /* ------------------------------------------------------------------
       Weg: vom Steg am Hügel vorbei zur Leiter
       ------------------------------------------------------------------ */
    const ps = { x: Math.cos(PA) * (pierR + 0.15), z: Math.sin(PA) * (pierR + 0.15) };
    kit.path(base, [[ps.x, ps.z], [3.0, 0.55], [1.6, 0.85], [0.2, 0.95], [-1.05, 0.65]], { seed: 3, width: 0.56 });

    /* ------------------------------------------------------------------
       Bäume, Büsche, Pilze, Steine, Blumen, Gras
       ------------------------------------------------------------------ */
    base.place(kit.tree({ type: 'pine', seed: 4, scale: 1.15 }), -3.55, -1.15, { keep: 0.7 });
    base.place(kit.tree({ type: 'pine', seed: 9, scale: 0.85 }), -2.85, -2.6, { keep: 0.6 });
    base.place(kit.tree({ type: 'round', seed: 12, scale: 0.95 }), 1.05, -3.35, { keep: 0.8 });
    base.place(kit.tree({ type: 'blossom', seed: 6, scale: 0.85 }), -3.8, 0.55, { keep: 0.7 });
    base.place(kit.bush({ seed: 3, size: 1.0, berries: '#ff5a5f' }), 1.65, -1.6);
    base.place(kit.bush({ seed: 8, size: 0.8 }), -1.45, 2.95);
    base.place(kit.mushroom({ seed: 2, size: 1.1 }), -0.35, -0.55, { keep: 0.2 });
    base.place(kit.rock({ size: 0.6, seed: 11, moss: true }), 2.75, 2.7, { keep: 0.4 });
    base.place(kit.rock({ size: 0.45, seed: 13 }), -2.25, 3.05, { keep: 0.3 });
    // kleiner Gemüsegarten mit Möhren
    (function carrots() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(1.1, 0.12, 0.7, 0.05, 1), [0, 0.04, 0]), '#8a6040', { grad: [0.8, 1] });
      for (let i = 0; i < 6; i++) {
        const x = -0.36 + (i % 3) * 0.36, z = -0.15 + Math.floor(i / 3) * 0.3;
        P.add(xf(new T.ConeGeometry(0.06, 0.12, 5).rotateX(PI), [x, 0.14, z]), '#ff8a2a', {});
        for (let k = 0; k < 2; k++) P.add(xf(new T.ConeGeometry(0.035, 0.24, 3), [x + (k - 0.5) * 0.05, 0.28, z], [0, 0, (k - 0.5) * 0.6]), '#4fb43c', {});
      }
      const m = P.build();
      base.place(m, 2.55, -1.15, { rotY: -0.4, keep: 0.6 });
    })();

    kit.grassTufts(base, 54, 5);
    kit.flowers(base, 20, ['#ff7aa8', '#ffd23f', '#ffffff', '#ff9a3d', '#b28dff'], 5);
    // ein paar Blumen rund um Flos Hügel
    (function hillFlowers() {
      const cols = ['#ffd23f', '#ffffff', '#ff7aa8'];
      for (let i = 0; i < 3; i++) {
        const a = PI * 0.2 + (i / 2) * PI * 0.6;
        const x = FLO.x + Math.cos(a) * 1.25, z = FLO.z + Math.sin(a) * 1.05;
        const f = kit.flower(cols[i], { scale: 1.1 });
        f.position.set(x, ground(x, z) - 0.02, z);
        f.rotation.y = i;
        g.add(f);
      }
    })();


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
      { color: '#ffb02e', x: -1.25, z: 2.1, r: 0.7, h: 0.9, speed: 0.7, phase: 0 },
      { color: '#7cc8ff', x: 1.55, z: 2.55, r: 0.55, h: 1.1, speed: 0.85, phase: 2.2 },
    ]);

    /* weiche Kontaktschatten unter großen Dingen */
    [[-1.15, -1.25, 1.5], [LH.x, LH.z, 1.15], [-2.45, 1.6, 1.0]].forEach(([x, z, r]) => {
      const s = kit.shadowBlob(r);
      s.position.set(x, ground(x, z) + 0.03, z);
      g.add(s);
    });

    kit.merge(g);

    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 7.6, -2.0),
        focus: new T.Vector3(0, 1.7, 0.4),
        flo: new T.Vector3(FLO.x, floY, FLO.z),
      },
    };
  });
})();
