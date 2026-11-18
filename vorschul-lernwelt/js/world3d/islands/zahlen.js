/* ==========================================================================
   js/world3d/islands/zahlen.js – Zahlenland (orange)

   Wahrzeichen: eine Zahlentreppe aus riesigen Spielwürfeln – ein Würfel
   mit der 1, zwei Würfel mit der 2, drei Würfel mit der 3 (Menge = Zahl).
   Dazu ein großer Rechenschieber, dessen Kugeln von selbst „zählen“, ein
   Zahlen-Windrad, Apfelbäume mit Äpfeln und Korb, ein Zählsteine-Weg
   (1 bis 5) vom Strand zur Treppe und zwei Luftballons an der 3.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'zahlen', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#ff8a3d';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];

    const base = kit.islandBase({ seed: 11, radius: 6.1, grassRadius: 4.7, grass: '#86d65e', stones: 4 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /** Zahlen-Atlas: weiße Ziffern (Fredoka) mit weichem Schatten, eine Zelle je Text. */
    function numberAtlas(texts) {
      const N = texts.length, S = 128;
      const tex = kit.canvasTexture(S * N, S, (c) => {
        texts.forEach((t, i) => {
          c.font = `700 ${Math.round(S * 0.72)}px ${kit.fonts.num}`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillStyle = 'rgba(0,0,0,0.25)';
          c.fillText(t, i * S + S / 2 + 4, S / 2 + 9);
          c.fillStyle = '#ffffff';
          c.fillText(t, i * S + S / 2, S / 2 + 5);
        });
      });
      const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      return {
        mat,
        /** Viereck (Normale +z) mit Zelle i */
        quad(i, w) {
          const q = new T.PlaneGeometry(w, w);
          const uv = q.attributes.uv;
          for (let k = 0; k < uv.count; k++) uv.setXY(k, (i + uv.getX(k)) / N, uv.getY(k));
          return q;
        },
      };
    }
    const nums = numberAtlas(['1', '2', '3', '4', '5']);
    const numQuads = []; // statische Ziffern (ein Draw-Call)

    /* ------------------------------------------------------------------
       Zahlentreppe: 1 · 2 2 · 3 3 3 (hinten Mitte)
       ------------------------------------------------------------------ */
    const stair = new T.Group();
    stair.name = 'zahlentreppe';
    const S = 1.18;
    const colTop = [ACC, '#ffc531', '#36b4ff'];
    const lower = ['#ffe08a', '#9ddcff', '#ffb27a', '#7fd67a'];
    const r0 = kit.rng(5);
    for (let col = 0; col < 3; col++) {
      const n = col + 1;
      for (let k = 0; k < n; k++) {
        const top = k === n - 1;
        const ch = String(n);
        const b = kit.block(ch, top ? colTop[col] : lower[(col + k) % lower.length], S, top ? {} : { top: '', side: '' });
        b.position.set((col - 1) * (S + 0.08) + (r0() - 0.5) * 0.06, k * S, (r0() - 0.5) * 0.08);
        b.rotation.y = (r0() - 0.5) * 0.14 + (top ? (col - 1) * 0.06 : 0);
        stair.add(b);
      }
    }
    base.place(stair, -0.4, -1.85, { rotY: 0.06, keep: 2.2 });
    // Luftballons an der 3 (schweben)
    [['#ff5a5f', -0.25, 0.1, 0.0], ['#ffd23f', 0.25, -0.05, 1.7]].forEach(([c, dx, dz, ph], i) => {
      const bl = kit.balloon(c);
      bl.position.set(-0.4 + (S + 0.08) + dx, ground(-0.4 + S, -1.85) + S * 3 - 0.05, -1.85 + dz);
      bl.scale.setScalar(0.78 + i * 0.08);
      bl.rotation.z = dx * 0.5;
      g.add(bl);
      kit.float(bl, { amp: 0.1, speed: 0.8, phase: ph });
      kit.sway(bl, { amp: 0.05, speed: 0.7, phase: ph });
    });

    /* ------------------------------------------------------------------
       Rechenschieber: Holzrahmen, 5 Stangen, 25 Kugeln (instanziert),
       die Kugeln „zählen“ (gleiten nacheinander nach links)
       ------------------------------------------------------------------ */
    function abacus() {
      const grp = new T.Group();
      grp.name = 'rechenschieber';
      const P = new kit.Parts();
      const wood = '#c9874f', woodD = '#9a6236';
      const Wd = 2.0, H = 1.75, y0 = 0.35;
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.14, H, 0.14, 0.04), [s * Wd / 2, y0 + H / 2 - 0.12, 0]), wood, { grad: [0.75, 1.05] });
        P.add(xf(geo.roundBox(0.22, 0.12, 0.7, 0.04), [s * Wd / 2, 0.06, 0]), woodD, { grad: [0.8, 1] });
        P.add(xf(new T.IcosahedronGeometry(0.1, 0), [s * Wd / 2, y0 + H - 0.04, 0]), ACC, { gloss: true });
      });
      P.add(xf(geo.roundBox(Wd + 0.1, 0.13, 0.16, 0.04), [0, y0 + H - 0.2, 0]), wood, { grad: [0.9, 1.05] });
      P.add(xf(geo.roundBox(Wd + 0.1, 0.13, 0.16, 0.04), [0, y0, 0]), wood, { grad: [0.85, 1] });
      const rows = 5, per = 5;
      const rowY = (r) => y0 + 0.2 + r * ((H - 0.55) / (rows - 1));
      for (let r = 0; r < rows; r++) P.add(xf(geo.cyl(0.018, 0.018, Wd, 4), [0, rowY(r), 0], [0, 0, PI / 2]), '#e8e2d6', {});
      P.build(grp);
      // Kugeln
      const prof = [[0.025, -0.08], [0.1, -0.065], [0.13, 0], [0.1, 0.065], [0.025, 0.08]].map((p) => new T.Vector2(p[0], p[1]));
      const bead = kit.paint(new T.LatheGeometry(prof, 6).rotateZ(PI / 2), '#ffffff', { grad: [0.9, 1.05] });
      bead.computeVertexNormals();
      const beads = new T.InstancedMesh(bead, kit.mats.gloss, rows * per);
      beads.name = 'kugeln';
      const rowCol = ['#ff4d4d', '#ff9a2e', '#ffd23f', '#46c95a', '#3f9bff'];
      const cc = new T.Color();
      for (let i = 0; i < rows * per; i++) beads.setColorAt(i, cc.set(rowCol[Math.floor(i / per)]));
      beads.castShadow = true;
      beads.receiveShadow = true;
      beads.userData.dynamic = true;
      grp.add(beads);
      const step = 0.255, left = -Wd / 2 + 0.17, right = Wd / 2 - 0.17;
      const cur = new Float32Array(rows * per);
      const dummy = new T.Object3D();
      // Ziel: k Kugeln links (gezählt), Rest rechts
      const target = (r, i, k) => (i < k ? left + i * step : right - (per - 1 - i) * step);
      const counts = [3, 1, 4, 2, 5];
      for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) cur[r * per + i] = target(r, i, counts[r]);
      const place = () => {
        for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
          dummy.position.set(cur[r * per + i], rowY(r), 0);
          dummy.updateMatrix();
          beads.setMatrixAt(r * per + i, dummy.matrix);
        }
        beads.instanceMatrix.needsUpdate = true;
      };
      place();
      beads.computeBoundingSphere();
      if (!W.reducedMotion) {
        updates.push((dt, t) => {
          // jede Reihe zählt in eigenem Takt 0 … 5
          let moved = false;
          for (let r = 0; r < rows; r++) {
            const k = Math.floor((t * 0.55 + r * 1.7) % (per + 2));
            const kk = Math.min(per, k);
            for (let i = 0; i < per; i++) {
              const j = r * per + i;
              const goal = target(r, i, kk);
              const d = goal - cur[j];
              if (Math.abs(d) > 0.001) { cur[j] += d * Math.min(1, dt * 7); moved = true; }
            }
          }
          if (moved) place();
        });
      }
      return grp;
    }
    base.place(abacus(), 2.55, -0.15, { rotY: -0.62, keep: 1.2 });

    /* ------------------------------------------------------------------
       Zahlen-Windrad: vier bunte Flügel mit 1 2 3 4, dreht sich
       ------------------------------------------------------------------ */
    function windrad() {
      const grp = new T.Group();
      grp.name = 'windrad';
      const P = new kit.Parts();
      const H = 3.0;
      P.add(xf(geo.cyl(0.065, 0.09, H, 6), [0, H / 2, 0]), '#f4efe6', { grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.18, 0.24, 0.14, 8), [0, 0.07, 0]), C.stone, {});
      P.add(xf(geo.cyl(0.06, 0.06, 0.24, 6), [0, H, 0.06], [PI / 2, 0, 0]), '#f4efe6', {});
      P.build(grp);
      const rotor = new T.Group();
      rotor.position.set(0, H, 0.2);
      const RP = new kit.Parts();
      const cols = [ACC, '#ffd23f', '#36b4ff', '#ff5fa2'];
      const quads = [];
      for (let i = 0; i < 4; i++) {
        const s = new T.Shape();
        s.moveTo(0.08, 0); s.quadraticCurveTo(0.7, -0.16, 1.22, 0.06); s.quadraticCurveTo(0.9, 0.55, 0.15, 0.26); s.lineTo(0.08, 0);
        const b = new T.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: false, curveSegments: 5 });
        b.translate(0, 0, -0.017);
        b.rotateX(0.35); // leicht verdreht wie ein Windrad
        b.rotateZ((i / 4) * TAU);
        RP.add(b, cols[i], { grad: [0.9, 1.05], gloss: true });
        const q = nums.quad(i, 0.42);
        q.rotateZ(-PI / 2 + 0.25);
        q.translate(0.74, 0.15, 0.1);
        q.rotateZ((i / 4) * TAU);
        quads.push(q);
      }
      RP.add(new T.IcosahedronGeometry(0.14, 1), C.gold, { gloss: true });
      RP.build(rotor);
      const nm = new T.Mesh(T.addons.mergeGeometries(quads, false), nums.mat);
      nm.renderOrder = 2;
      rotor.add(nm);
      grp.add(rotor);
      kit.spin(rotor, { speed: -0.9, axis: 'z' });
      return grp;
    }
    base.place(windrad(), 2.9, -2.55, { rotY: -0.35, keep: 0.6 });

    /* ------------------------------------------------------------------
       Apfelbäume, Korb mit Äpfeln, Äpfel im Gras
       ------------------------------------------------------------------ */
    base.place(kit.tree({ type: 'fruit', seed: 3, fruitColor: '#ff3b3b', scale: 1.08 }), -3.05, -1.0, { keep: 0.9 });
    base.place(kit.tree({ type: 'fruit', seed: 8, fruitColor: '#ff3b3b', scale: 0.92 }), -2.15, -3.0, { keep: 0.8 });
    function apple(P, x, y, z, s = 1, col = '#ff3b3b') {
      P.add(xf(new T.SphereGeometry(0.13 * s, 7, 4), [x, y + 0.12 * s, z], null, [1, 0.9, 1]), col, { gloss: true, grad: [0.75, 1.1] });
      P.add(xf(geo.cyl(0.012, 0.016, 0.08 * s, 3), [x, y + 0.25 * s, z], [0, 0, 0.3]), '#6b4226', {});
      P.add(xf(new T.ConeGeometry(0.035 * s, 0.09 * s, 3), [x + 0.04 * s, y + 0.26 * s, z], [0, 0, -1.2], [1, 1, 0.4]), '#4fb43c', {});
    }
    (function basket() {
      const P = new kit.Parts();
      const prof = [[0, 0.02], [0.3, 0.02], [0.38, 0.12], [0.42, 0.32], [0.4, 0.34], [0.34, 0.16]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(new T.LatheGeometry(prof, 10), '#c98a4b', { grad: [0.7, 1.05], jitter: 0.04 });
      P.add(new T.TorusGeometry(0.42, 0.025, 3, 14).rotateX(PI / 2).translate(0, 0.33, 0), '#a8703b', {});
      P.add(new T.TorusGeometry(0.36, 0.02, 3, 10, PI).translate(0, 0.33, 0), '#a8703b', {});
      apple(P, -0.12, 0.16, 0.05); apple(P, 0.13, 0.17, -0.06); apple(P, 0.02, 0.2, 0.15, 1, '#7ccf3a'); apple(P, -0.05, 0.26, -0.12);
      const m = P.build();
      m.name = 'korb';
      base.place(m, -2.05, 0.5, { rotY: 0.4, keep: 0.5 });
    })();
    (function groundApples() {
      const P = new kit.Parts();
      [[-2.6, -0.25], [-3.55, 0.05], [-1.7, -2.15]].forEach(([x, z], i) => apple(P, x, ground(x, z) - 0.03, z, 0.95, i === 1 ? '#7ccf3a' : '#ff3b3b'));
      g.add(P.build());
    })();

    /* ------------------------------------------------------------------
       Zählsteine-Weg 1 … 5 vom Strand zur Treppe
       ------------------------------------------------------------------ */
    const stepCols = ['#ff7a3d', '#ffbf1f', '#2ea8ff', '#3fbf55', '#ff5fa2'];
    const stepPos = [[1.3, 3.75], [0.45, 3.0], [-0.3, 2.15], [0.25, 1.25], [-0.25, 0.35]];
    (function steps() {
      const P = new kit.Parts();
      stepPos.forEach(([x, z], i) => {
        const y = ground(x, z);
        P.add(xf(geo.cyl(0.47, 0.5, 0.12, 12), [x, y + 0.03, z], [0, i, 0]), stepCols[i], { grad: [0.8, 1.05] });
        const q = nums.quad(i, 0.62);
        q.rotateX(-PI / 2);
        q.rotateY(0.15 - i * 0.08);
        q.translate(x, y + 0.095, z);
        numQuads.push(q);
        base.keep(x, z, 0.5);
      });
      const m = P.build();
      m.name = 'zaehlsteine';
      g.add(m);
    })();
    const nm = new T.Mesh(T.addons.mergeGeometries(numQuads, false), nums.mat);
    nm.renderOrder = 2;
    nm.receiveShadow = true;
    nm.name = 'ziffern';
    nm.userData.noMerge = true;
    g.add(nm);

    /* ------------------------------------------------------------------
       Großer Spielwürfel mit Augen (liegt schräg im Gras)
       ------------------------------------------------------------------ */
    (function die() {
      const P = new kit.Parts();
      const D = 0.9, h = D / 2;
      P.add(xf(geo.roundBox(D, D, D, 0.16, 2), [0, h, 0]), '#fffaf0', { gloss: true, smooth: true, grad: [0.86, 1.04] });
      const pip = (u, v, face) => {
        const q = geo.cyl(0.075, 0.075, 0.03, 7);
        const o = 0.25;
        if (face === 'front') xf(q, [u * o, h + v * o, h + 0.005], [PI / 2, 0, 0]);
        else if (face === 'right') xf(q, [h + 0.005, h + v * o, -u * o], [0, 0, PI / 2]);
        else if (face === 'left') xf(q, [-h - 0.005, h + v * o, u * o], [0, 0, PI / 2]);
        else xf(q, [u * o, D + 0.005, -v * o]);
        P.add(q, '#2f3f6b', { gloss: true, grad: [1, 1] });
      };
      const faces = {
        1: [[0, 0]],
        3: [[-1, 1], [0, 0], [1, -1]],
        4: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        5: [[-1, -1], [-1, 1], [0, 0], [1, -1], [1, 1]],
      };
      faces[5].forEach(([u, v]) => pip(u, v, 'front'));
      faces[3].forEach(([u, v]) => pip(u, v, 'right'));
      faces[4].forEach(([u, v]) => pip(u, v, 'left'));
      faces[1].forEach(([u, v]) => pip(u, v, 'top'));
      const m = P.build();
      m.name = 'wuerfel';
      base.place(m, 2.15, 2.15, { rotY: -0.35, keep: 0.8, y: -0.02 });
    })();

    /* ------------------------------------------------------------------
       Kleinkram: Büsche, Steine, Blumen, Gras, Zaun am Apfelgarten
       ------------------------------------------------------------------ */
    base.place(kit.bush({ seed: 21, size: 0.9, berries: '#ff8a3d' }), 1.35, -3.3);
    base.place(kit.bush({ seed: 22, size: 0.75 }), -3.35, 2.2);
    base.place(kit.rock({ size: 0.55, seed: 23, moss: true }), 2.6, 2.4, { keep: 0.4 });
    base.place(kit.rock({ size: 0.4, seed: 24 }), -1.2, 3.55, { keep: 0.3 });
    const fence = kit.fence([[-3.9, 1.15], [-2.9, 1.65], [-1.7, 1.75]], { base, style: 'rail', height: 0.55 });
    g.add(fence);
    kit.grassTufts(base, 55, 11);
    kit.flowers(base, 18, ['#ffd23f', '#ffffff', '#ff7aa8', '#ff9a3d'], 11);

    [[-0.4, -1.85, 2.2], [2.55, -0.15, 1.2]].forEach(([x, z, r]) => {
      const s = kit.shadowBlob(r);
      s.position.set(x, ground(x, z) + 0.03, z);
      g.add(s);
    });

    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 6.4, -1.9),
        focus: new T.Vector3(0, 1.5, 0),
      },
    };
  });
})();
