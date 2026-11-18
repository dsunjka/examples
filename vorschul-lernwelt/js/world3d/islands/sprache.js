/* ==========================================================================
   js/world3d/islands/sprache.js – Buchstabenland (lila)

   Wahrzeichen: ein riesiges aufgeschlagenes Buch auf einem Lesepult
   („A a“ und ein Apfel mit dem Wort „Apfel“), aus dem die Buchstaben
   a b c herausschweben. Dazu ein kleines Buchstaben-Schloss mit lila
   Turmdächern, ein Federkiel im Tintenfass, ein Glockenspiel mit drei
   schaukelnden Glöckchen (Reime) und ein Würfelturm A B C.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'sprache', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#8e6cef';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];

    const base = kit.islandBase({ seed: 23, radius: 6.1, grassRadius: 4.7, grass: '#83d460', stones: 4 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    // Schwebende Teile: kit.floatMerge (wippen/drehen im Vertex-Shader, wenige Draw-Calls)

    /* ------------------------------------------------------------------
       Riesiges Buch auf dem Lesepult (hinten Mitte)
       ------------------------------------------------------------------ */
    const pageTex = kit.canvasTexture(1024, 720, (c, w, h) => {
      // Papier mit Schatten zur Mitte
      const gr = c.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, '#f6ecd9'); gr.addColorStop(0.08, '#fffaf0'); gr.addColorStop(0.44, '#fff8ea'); gr.addColorStop(0.5, '#e9dcc4');
      gr.addColorStop(0.56, '#fff8ea'); gr.addColorStop(0.92, '#fffaf0'); gr.addColorStop(1, '#f6ecd9');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      // linke Seite: großes A a
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `700 ${Math.round(h * 0.42)}px ${kit.fonts.read}`;
      c.fillStyle = 'rgba(80,50,140,0.18)'; c.fillText('A a', w * 0.25 + 5, h * 0.44 + 7);
      c.fillStyle = ACC; c.fillText('A a', w * 0.25, h * 0.44);
      c.fillStyle = 'rgba(120,100,160,0.25)';
      for (let i = 0; i < 3; i++) { c.beginPath(); if (c.roundRect) c.roundRect(w * 0.07, h * (0.74 + i * 0.07), w * (0.36 - i * 0.07), h * 0.025, h * 0.0125); else c.rect(w * 0.07, h * (0.74 + i * 0.07), w * (0.36 - i * 0.07), h * 0.025); c.fill(); }
      // rechte Seite: Apfel und Wort
      const ax = w * 0.75, ay = h * 0.38, ar = h * 0.17;
      c.fillStyle = '#ff4b4b';
      c.beginPath(); c.arc(ax - ar * 0.45, ay, ar, 0, TAU); c.arc(ax + ar * 0.45, ay, ar, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.ellipse(ax - ar * 0.75, ay - ar * 0.35, ar * 0.22, ar * 0.32, -0.5, 0, TAU); c.fill();
      c.strokeStyle = '#7a4a2a'; c.lineWidth = h * 0.02; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ax, ay - ar * 0.8); c.quadraticCurveTo(ax + 4, ay - ar * 1.3, ax + ar * 0.2, ay - ar * 1.45); c.stroke();
      c.fillStyle = '#4fb43c';
      c.beginPath(); c.ellipse(ax + ar * 0.55, ay - ar * 1.15, ar * 0.42, ar * 0.2, -0.5, 0, TAU); c.fill();
      c.font = `700 ${Math.round(h * 0.15)}px ${kit.fonts.read}`;
      c.fillStyle = '#4a3a6a'; c.fillText('Apfel', ax, h * 0.76);
    });
    const pageMat = new T.MeshStandardMaterial({ map: pageTex, roughness: 0.85 });
    function book() {
      const grp = new T.Group();
      grp.name = 'buch';
      const P = new kit.Parts();
      const PW = 1.32, PD = 1.8;
      const yTop = (u) => 0.07 + 0.2 * Math.pow(Math.sin(PI * Math.min(u * 1.15, 1) * 0.5), 0.6) * (1 - 0.25 * u);
      // Buchdeckel (lila, etwas größer als die Seiten) und Rücken
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(PW + 0.14, 0.08, PD + 0.16, 0.035), [s * (PW + 0.14) / 2, 0.0, 0], [0, 0, s * 0.05]), ACC, { grad: [0.75, 1.05] }));
      P.add(xf(geo.cyl(0.1, 0.1, PD + 0.16, 8), [0, -0.03, 0], [PI / 2, 0, 0]), kit.shade(ACC, 0.8), {});
      // Seitenblöcke (Profil mit gewölbter Oberseite, entlang z extrudiert)
      [-1, 1].forEach((s) => {
        const sh = new T.Shape();
        sh.moveTo(0, 0.03);
        for (let i = 0; i <= 10; i++) { const u = i / 10; sh.lineTo(u * PW, yTop(u) - 0.01); }
        sh.lineTo(PW, 0.03); sh.lineTo(0, 0.03);
        const blk = new T.ExtrudeGeometry(sh, { depth: PD, bevelEnabled: false });
        blk.translate(0, 0, -PD / 2);
        if (s < 0) { blk.scale(-1, 1, 1); flip(blk); }
        P.add(blk, '#f3e6cc', { grad: [0.85, 1.02] });
      });
      // Seiten-Oberflächen mit Bild (ein Material für beide Seiten)
      const top = new T.PlaneGeometry(PW * 2, PD, 20, 1).rotateX(-PI / 2);
      const p = top.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setY(i, yTop(Math.abs(x) / PW)); }
      top.computeVertexNormals();
      const pages = new T.Mesh(top, pageMat);
      pages.receiveShadow = true;
      pages.castShadow = true;
      P.build(grp);
      grp.add(pages);
      // Lesezeichen-Band
      const band = new kit.Parts();
      band.add(xf(geo.box(0.08, 0.01, 0.55), [0.05, 0.03, PD / 2 + 0.25], [0.5, 0, 0]), '#ff5fa2', {});
      band.build(grp);
      return grp;
    }
    /** Dreiecke umdrehen (nach Spiegelung). */
    function flip(q) {
      if (q.index) return;
      const p = q.attributes.position;
      for (let k = 0; k < p.count; k += 3) { const x = p.getX(k + 1), y = p.getY(k + 1), z = p.getZ(k + 1); p.setXYZ(k + 1, p.getX(k + 2), p.getY(k + 2), p.getZ(k + 2)); p.setXYZ(k + 2, x, y, z); }
      q.computeVertexNormals();
    }
    const BK = { x: 0.1, z: -1.45 };
    (function lectern() {
      const grp = new T.Group();
      grp.name = 'lesepult';
      const P = new kit.Parts();
      const wood = '#b97a4a';
      const tilt = 0.62;
      // Stützen und Ablage
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.14, 1.25, 0.14, 0.04), [s * 1.05, 0.55, -0.55], [-0.35, 0, 0]), wood, { grad: [0.7, 1.05] });
        P.add(xf(geo.roundBox(0.14, 0.5, 0.14, 0.04), [s * 1.05, 0.22, 0.45], [0.2, 0, 0]), wood, { grad: [0.7, 1.05] });
      });
      P.add(xf(geo.roundBox(2.6, 0.12, 0.3, 0.04), [0, 0.42, 0.62], [tilt, 0, 0]), kit.shade(wood, 1.05), { grad: [0.85, 1.05] });
      P.add(xf(geo.roundBox(2.4, 0.1, 1.7, 0.04), [0, 0.86, -0.08], [tilt, 0, 0]), kit.shade(wood, 0.92), { grad: [0.85, 1.05] });
      P.build(grp);
      const b = book();
      b.position.set(0, 0.97, -0.05);
      b.rotation.x = tilt;
      grp.add(b);
      grp.scale.setScalar(1.22);
      base.place(grp, BK.x, BK.z, { keep: 2.0, y: -0.04 });
    })();
    // Buchstaben a b c schweben aus dem Buch
    const fly = [];
    [['a', '#ffd23f', -0.95, 2.75, 0.1], ['b', '#5fe0b4', 0.12, 3.3, -0.25], ['c', '#ff7aa8', 1.15, 2.7, 0.0]].forEach(([ch, col, dx, y, dz], i) => {
      const b = kit.block(ch, col, 0.62, { top: '' });
      const x = BK.x + dx, z = BK.z + dz - 0.3;
      b.position.set(x, ground(BK.x, BK.z) + y, z);
      b.rotation.set(0.12 * (i - 1), 0.25 * (1 - i), 0.1 * (i - 1));
      fly.push({ obj: b, phase: i * 2.1, amp: 0.16, rot: 0.35 });
    });
    // Glitzer-Sterne über dem Buch (zusammen mit den Buchstaben: ein Draw-Call je Material)
    [[-1.55, 2.2, 0.3, 0.42], [1.7, 3.3, -0.1, 0.34], [-0.45, 3.85, -0.35, 0.3]].forEach(([dx, y, dz, s], i) => {
      const st = new T.Group();
      st.add(kit.star('#ffe066', s));
      st.position.set(BK.x + dx, ground(BK.x, BK.z) + y, BK.z + dz);
      fly.push({ obj: st, phase: 1 + i * 1.7, amp: 0.1, rot: 0.7 });
    });
    g.add(kit.floatMerge(fly));

    /* ------------------------------------------------------------------
       Buchstaben-Schloss (hinten links)
       ------------------------------------------------------------------ */
    function castle() {
      const grp = new T.Group();
      grp.name = 'schloss';
      const P = new kit.Parts();
      const stone = '#efe6ff', stoneD = '#d9ccf5';
      const roof = ACC;
      // Mauer mit Zinnen
      P.add(xf(geo.roundBox(1.9, 1.05, 0.95, 0.05), [0, 0.52, 0]), stone, { grad: [0.78, 1.04] });
      for (let i = 0; i < 5; i++) P.add(xf(geo.roundBox(0.22, 0.2, 0.22, 0.03, 1), [-0.62 + i * 0.31, 1.13, 0.37]), stoneD, {});
      // Tor (Bogen) mit Tür
      const arch = new T.Shape();
      arch.moveTo(-0.27, 0); arch.lineTo(0.27, 0); arch.lineTo(0.27, 0.36); arch.absarc(0, 0.36, 0.27, 0, PI, false); arch.lineTo(-0.27, 0);
      P.add(xf(new T.ExtrudeGeometry(arch, { depth: 0.06, bevelEnabled: false, curveSegments: 6 }), [0, 0.02, 0.45]), '#6a4c9c', { grad: [0.8, 1.05] });
      P.add(xf(geo.box(0.04, 0.52, 0.02), [0, 0.3, 0.52]), '#4f377a', {});
      // Bergfried hinten
      P.add(xf(geo.roundBox(0.95, 1.0, 0.8, 0.05), [0, 1.5, -0.12]), stone, { grad: [0.85, 1.04] });
      P.add(xf(new T.ConeGeometry(0.78, 0.85, 4), [0, 2.42, -0.12], [0, PI / 4, 0]), roof, { grad: [0.72, 1.1] });
      P.add(xf(new T.IcosahedronGeometry(0.07, 0), [0, 2.88, -0.12]), C.gold, { gloss: true });
      // Türme vorn
      [-1, 1].forEach((s) => {
        const x = s * 0.95;
        P.add(xf(geo.cyl(0.36, 0.4, 1.75, 10), [x, 0.875, 0.32]), stone, { grad: [0.78, 1.04] });
        P.add(xf(geo.cyl(0.44, 0.42, 0.14, 10), [x, 1.78, 0.32]), stoneD, {});
        P.add(xf(new T.ConeGeometry(0.5, 0.95, 10), [x, 2.32, 0.32]), roof, { grad: [0.72, 1.1] });
        P.add(xf(new T.IcosahedronGeometry(0.06, 0), [x, 2.82, 0.32]), C.gold, { gloss: true });
        // Fenster (leuchten nachts)
        const win = new T.Shape();
        win.moveTo(-0.08, 0); win.lineTo(0.08, 0); win.lineTo(0.08, 0.12); win.absarc(0, 0.12, 0.08, 0, PI, false); win.lineTo(-0.08, 0);
        P.addRaw(kit.paint(xf(new T.ExtrudeGeometry(win, { depth: 0.04, bevelEnabled: false, curveSegments: 4 }), [x, 1.2, 0.69]), '#ffffff', { grad: [1, 1] }), 'window');
      });
      P.addRaw(kit.paint(xf(geo.box(0.22, 0.26, 0.04), [0, 1.6, 0.29]), '#ffffff', { grad: [1, 1] }), 'window');
      P.build(grp);
      // Buchstaben-Schild über dem Tor
      const sb = kit.block('B', '#ff7aa8', 0.34, { top: '', side: '', back: '' });
      sb.position.set(0, 0.68, 0.36);
      grp.add(sb);
      const fl = kit.flag(ACC, { height: 0.9 });
      fl.scale.setScalar(0.62);
      fl.position.set(0, 2.9, -0.12);
      grp.add(fl);
      return grp;
    }
    base.place(castle(), -2.3, -2.3, { rotY: 0.45, keep: 1.4 });

    /* ------------------------------------------------------------------
       Federkiel im Tintenfass (rechts hinten)
       ------------------------------------------------------------------ */
    function quill() {
      const grp = new T.Group();
      grp.name = 'federkiel';
      const P = new kit.Parts();
      const prof = [[0, 0], [0.36, 0], [0.42, 0.06], [0.44, 0.36], [0.36, 0.5], [0.18, 0.56], [0.17, 0.66], [0.22, 0.7], [0, 0.7]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(prof, 12), '#3e3a9a', { gloss: true, grad: [0.6, 1.1] });
      P.add(new T.TorusGeometry(0.2, 0.035, 4, 12).rotateX(PI / 2).translate(0, 0.66, 0), C.gold, { gloss: true });
      P.add(xf(geo.cyl(0.16, 0.16, 0.02, 10), [0, 0.67, 0]), '#1d1650', {});
      // Feder: Kiel und Fahne
      const fe = new T.Group();
      const FP = new kit.Parts();
      FP.add(xf(geo.cyl(0.025, 0.035, 2.3, 5), [0, 1.15, 0]), '#f3ecff', { grad: [0.9, 1.05] });
      const vane = new T.Shape();
      vane.moveTo(0, 0.45);
      vane.quadraticCurveTo(0.42, 0.9, 0.36, 1.55);
      vane.quadraticCurveTo(0.3, 2.05, 0.02, 2.42);
      vane.quadraticCurveTo(-0.26, 2.0, -0.28, 1.4);
      vane.lineTo(-0.2, 1.3); vane.lineTo(-0.27, 1.12);
      vane.quadraticCurveTo(-0.24, 0.75, 0, 0.45);
      const vg = new T.ExtrudeGeometry(vane, { depth: 0.04, bevelEnabled: false, curveSegments: 6 });
      vg.translate(0, 0, -0.02);
      FP.add(vg, '#ffffff', { grad: [0.85, 1.05], top: '#c9b3ff', topFrom: 0.35 });
      FP.build(fe);
      fe.position.set(0.02, 0.55, 0);
      fe.rotation.set(-0.12, 0.3, -0.38);
      grp.add(fe);
      P.build(grp);
      // Tintenklecks
      const ink = kit.mesh(new T.CylinderGeometry(0.5, 0.5, 0.02, 9).scale(1.3, 1, 0.8), '#3e3a9a', { gloss: true, shadow: false });
      ink.position.set(0.55, 0.01, 0.35);
      grp.add(ink);
      return grp;
    }
    base.place(quill(), 3.3, -1.25, { rotY: -0.7, keep: 1.0 });

    /* ------------------------------------------------------------------
       Glockenspiel mit drei Glöckchen (Reime) – vorne rechts
       ------------------------------------------------------------------ */
    function bells() {
      const grp = new T.Group();
      grp.name = 'gloeckchen';
      const P = new kit.Parts();
      const wood = '#c98d58';
      const BW = 1.7, BH = 1.85;
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.13, BH, 0.13, 0.04), [s * BW / 2, BH / 2, 0]), wood, { grad: [0.7, 1.05] });
        P.add(xf(geo.roundBox(0.32, 0.1, 0.32, 0.03, 1), [s * BW / 2, 0.05, 0]), kit.shade(wood, 0.8), {});
      });
      P.add(xf(geo.roundBox(BW + 0.3, 0.14, 0.18, 0.04), [0, BH, 0]), kit.shade(wood, 1.05), { grad: [0.85, 1.05] });
      // kleines Dach
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(BW + 0.5, 0.06, 0.42, 0.025, 1), [0, BH + 0.2, s * 0.17], [s * 0.6, 0, 0]), ACC, { grad: [0.8, 1.08] }));
      P.build(grp);
      // Glocken (instanziert, schaukeln einzeln)
      const prof = [[0, 0], [0.04, 0], [0.06, -0.05], [0.14, -0.1], [0.17, -0.22], [0.21, -0.36], [0.27, -0.42], [0.25, -0.44], [0, -0.42]].map((p) => new T.Vector2(p[0], p[1]));
      const parts = [
        kit.paint(new T.LatheGeometry(prof, 9), '#ffd23f', { grad: [0.7, 1.1] }),
        kit.paint(new T.IcosahedronGeometry(0.07, 0).translate(0, -0.44, 0), '#e0a92a', {}),
        kit.paint(geo.cyl(0.012, 0.012, 0.22, 3).translate(0, 0.1, 0), '#7a5a3a', {}),
      ];
      const bellGeo = T.addons.mergeGeometries(parts, false);
      const inst = new T.InstancedMesh(bellGeo, kit.mats.gloss, 3);
      inst.name = 'glocken';
      inst.castShadow = true;
      inst.userData.dynamic = true;
      const cols = ['#ffd23f', '#ffb84a', '#ffe680'];
      const cc = new T.Color();
      cols.forEach((c, i) => inst.setColorAt(i, cc.set(c)));
      grp.add(inst);
      const dummy = new T.Object3D();
      const xs = [-0.5, 0, 0.5], hs = [BH - 0.32, BH - 0.42, BH - 0.32];
      const set = (t) => {
        for (let i = 0; i < 3; i++) {
          dummy.position.set(xs[i], hs[i], 0);
          dummy.rotation.set(Math.sin(t * 2.2 + i * 1.3) * 0.22 * calm, 0, Math.sin(t * 1.7 + i) * 0.12 * calm);
          const s = i === 1 ? 1.15 : 0.95;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
      };
      set(0);
      inst.computeBoundingSphere();
      updates.push((dt, t) => set(t));
      return grp;
    }
    base.place(bells(), 2.8, 1.95, { rotY: -0.6, keep: 1.1 });

    /* ------------------------------------------------------------------
       Würfelturm A B C (vorne links)
       ------------------------------------------------------------------ */
    (function abc() {
      const grp = new T.Group();
      grp.name = 'abc';
      const S = 0.86;
      const a = kit.block('A', ACC, S); a.position.set(-0.47, 0, 0); a.rotation.y = 0.08;
      const b = kit.block('B', '#ff7aa8', S); b.position.set(0.47, 0, 0.05); b.rotation.y = -0.1;
      const c = kit.block('C', '#2fc4b2', S); c.position.set(0.02, S, 0.02); c.rotation.y = 0.14;
      grp.add(a, b, c);
      base.place(grp, -2.25, 1.3, { rotY: 0.35, keep: 1.1 });
    })();

    /* ------------------------------------------------------------------
       Weg, Pflanzen, Kleinkram
       ------------------------------------------------------------------ */
    kit.path(base, [[0.55, 4.45], [0.75, 3.1], [0.2, 1.9], [0.12, 0.6]], { seed: 23, width: 0.56 });
    base.place(kit.tree({ type: 'blossom', seed: 31, color: '#cdb4ff', scale: 1.05 }), -0.95, -3.55, { keep: 0.8 });
    base.place(kit.tree({ type: 'round', seed: 32, scale: 0.95 }), 1.45, -3.35, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 33, scale: 0.95 }), 2.75, -2.75, { keep: 0.6 });
    base.place(kit.bush({ seed: 34, size: 0.85, berries: '#b28dff' }), -1.05, 3.05);
    base.place(kit.bush({ seed: 35, size: 0.7 }), -3.75, 0.55);
    base.place(kit.rock({ size: 0.5, seed: 36, moss: true }), 1.75, 3.35, { keep: 0.3 });
    kit.grassTufts(base, 55, 23);
    kit.flowers(base, 20, ['#b28dff', '#ffffff', '#ff7aa8', '#ffd23f', '#cdb4ff'], 23);

    [[BK.x, BK.z, 2.0], [-2.3, -2.3, 1.4], [-2.25, 1.3, 1.0], [BK.x, BK.z + 0.3, 1.2]].forEach(([x, z, r]) => {
      const s = kit.shadowBlob(r);
      s.position.set(x, ground(x, z) + 0.03, z);
      g.add(s);
    });

    kit.merge(g);
    kit.batchDynamic(g); // Bewegtes (Ballons, Boote, Räder …) in wenige Draw-Calls bündeln
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.6, -1.6),
        focus: new T.Vector3(0, 1.5, -0.2),
      },
    };
  });
})();
