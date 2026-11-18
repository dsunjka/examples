/* ==========================================================================
   js/world3d/islands/sach1.js – Sachkunde-Schule (Klasse 1, dunkelgrün)

   Wahrzeichen: das Forscherlabor – ein weißes Laborhaus mit grünem
   Flachdach, auf dem ein riesiger Erlenmeyerkolben aus Glas steht; die
   grüne Flüssigkeit blubbert, Dampfwölkchen steigen aus dem Hals. Daneben
   ein kleiner Rundkolben mit blauer Flüssigkeit.
   Quer über die Wiese führt eine Straße mit Zebrastreifen: Der Schulweg
   vom Strand zum Labor geht darüber, an der Fußgängerampel wechseln rotes
   und grünes Männchen, daneben die Schilder „Fußgängerüberweg“ und
   „Schulweg“ sowie „Achtung Kinder“.
   Dazu ein Wassertank auf einem Tisch (Boot und Ente schwimmen, ein Stein
   sinkt immer wieder blubbernd zu Boden), vier bunte Mülltonnen (gelb, blau,
   braun, grau – die gelbe klappt ihren Deckel auf und zu) mit Abfall davor,
   ein großer lachender Zahn mit Zahnbürste, die putzt, und ein Hochbeet mit
   Möhren und Salat.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'sach1', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#2b8a3e';
    const ACC_L = kit.shade(ACC, 1.5);
    const WALL = '#f6fbf5';
    const ASPH = '#727c90';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];
    const merge = T.addons.mergeGeometries;

    const base = kit.islandBase({ seed: 307, radius: 6.1, grassRadius: 4.75, grass: '#93d95e', stones: 4, segments: 30 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* ------------------------------------------------------------------
       Beschriftungs-Atlas (ein Draw-Call für Schilder, Aufkleber, Ampel)
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
      mat.name = 'sach1-atlas';
      const remap = (q, key) => {
        const r = rects[key];
        const uv = q.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          const u = uv.getX(i), v = uv.getY(i);
          uv.setXY(i, (r.x + u * r.w) / AW, 1 - (r.y + (1 - v) * r.h) / AH);
        }
        return q;
      };
      return { tex, mat, remap, quad(key, w) { const r = rects[key]; return remap(new T.PlaneGeometry(w, (w * r.h) / r.w), key); } };
    }
    const rrect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
    const label = (text, { font = kit.fonts.num, color = '#ffffff', shadow = 'rgba(0,0,0,0.28)', k = 0.7, weight = 600 } = {}) => (c, w, h) => {
      let px = Math.round(h * k);
      c.font = `${weight} ${px}px ${font}`;
      const tw = c.measureText(text).width;
      if (tw > w * 0.88) { px = Math.floor((px * w * 0.88) / tw); c.font = `${weight} ${px}px ${font}`; }
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (shadow) { c.fillStyle = shadow; c.fillText(text, w / 2 + px * 0.03, h / 2 + px * 0.08); }
      c.fillStyle = color;
      c.fillText(text, w / 2, h / 2 + px * 0.04);
    };
    /** Fußgänger-Männchen (Ampel, Schilder): stehend oder gehend */
    function person(c, x, y, s, walk, col) {
      c.fillStyle = col; c.strokeStyle = col;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.arc(x, y - s * 0.78, s * 0.14, 0, TAU); c.fill();
      c.lineWidth = s * 0.17;
      const sx = walk ? s * 0.08 : 0;
      c.beginPath(); c.moveTo(x + sx, y - s * 0.58); c.lineTo(x, y - s * 0.12); c.stroke();
      c.lineWidth = s * 0.13;
      if (walk) {
        c.beginPath(); c.moveTo(x, y - s * 0.12); c.lineTo(x - s * 0.22, y + s * 0.3); c.stroke();
        c.beginPath(); c.moveTo(x, y - s * 0.12); c.lineTo(x + s * 0.22, y + s * 0.3); c.stroke();
        c.beginPath(); c.moveTo(x + sx, y - s * 0.5); c.lineTo(x - s * 0.2, y - s * 0.22); c.stroke();
        c.beginPath(); c.moveTo(x + sx, y - s * 0.5); c.lineTo(x + s * 0.24, y - s * 0.26); c.stroke();
      } else {
        c.beginPath(); c.moveTo(x - s * 0.06, y - s * 0.12); c.lineTo(x - s * 0.07, y + s * 0.3); c.stroke();
        c.beginPath(); c.moveTo(x + s * 0.06, y - s * 0.12); c.lineTo(x + s * 0.07, y + s * 0.3); c.stroke();
        c.beginPath(); c.moveTo(x - s * 0.12, y - s * 0.52); c.lineTo(x - s * 0.15, y - s * 0.1); c.stroke();
        c.beginPath(); c.moveTo(x + s * 0.12, y - s * 0.52); c.lineTo(x + s * 0.15, y - s * 0.1); c.stroke();
      }
    }
    const icon = (draw, ring) => (c, w, h) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.46, 0, TAU); c.fill();
      c.strokeStyle = ring; c.lineWidth = w * 0.06; c.stroke();
      draw(c, w / 2, h / 2, w * 0.3);
    };
    const A = atlas([
      { key: 'manR', w: 96, h: 96, draw: (c, w, h) => person(c, w / 2, h * 0.6, h * 0.62, false, '#ffffff') },
      { key: 'manG', w: 96, h: 96, draw: (c, w, h) => person(c, w / 2, h * 0.6, h * 0.62, true, '#ffffff') },
      { key: 'labor', w: 300, h: 96, draw: label('Labor', { k: 0.68 }) },
      { key: 'schulweg', w: 260, h: 84, draw: (c, w, h) => { c.fillStyle = '#ffffff'; rrect(c, 2, 2, w - 4, h - 4, 10); c.fill(); c.strokeStyle = '#1f2a44'; c.lineWidth = 5; rrect(c, 9, 9, w - 18, h - 18, 7); c.stroke(); label('Schulweg', { color: '#1f2a44', shadow: null, k: 0.56 })(c, w, h); } },
      { key: 'zebra', w: 128, h: 128, draw: (c, w, h) => {
        c.fillStyle = '#ffffff'; rrect(c, 0, 0, w, h, 14); c.fill();
        c.fillStyle = '#1c6fd1'; rrect(c, 6, 6, w - 12, h - 12, 10); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(w / 2, h * 0.14); c.lineTo(w * 0.88, h * 0.84); c.lineTo(w * 0.12, h * 0.84); c.closePath(); c.fill();
        c.fillStyle = '#1f2a44'; for (let i = 0; i < 4; i++) c.fillRect(w * (0.26 + i * 0.13), h * 0.74, w * 0.07, h * 0.06);
        person(c, w / 2, h * 0.64, h * 0.36, true, '#1f2a44');
      } },
      { key: 'kinder', w: 128, h: 116, draw: (c, w, h) => {
        c.lineJoin = 'round';
        c.fillStyle = '#ffffff'; c.strokeStyle = '#e03131'; c.lineWidth = 11;
        c.beginPath(); c.moveTo(w / 2, 9); c.lineTo(w - 8, h - 7); c.lineTo(8, h - 7); c.closePath(); c.fill(); c.stroke();
        person(c, w * 0.42, h * 0.76, h * 0.36, true, '#1f2a44');
        person(c, w * 0.6, h * 0.8, h * 0.27, true, '#1f2a44');
      } },
      { key: 'iY', w: 96, h: 96, draw: icon((c, x, y, s) => { c.fillStyle = '#adb5bd'; rrect(c, x - s * 0.45, y - s * 0.7, s * 0.9, s * 1.4, s * 0.18); c.fill(); c.fillStyle = '#f59f00'; c.fillRect(x - s * 0.45, y - s * 0.25, s * 0.9, s * 0.5); }, '#f2c200') },
      { key: 'iB', w: 96, h: 96, draw: icon((c, x, y, s) => { c.fillStyle = '#e9ecef'; c.fillRect(x - s * 0.6, y - s * 0.75, s * 1.2, s * 1.5); c.fillStyle = '#495057'; for (let i = 0; i < 4; i++) c.fillRect(x - s * 0.45, y - s * 0.5 + i * s * 0.3, s * 0.9, s * 0.1); }, '#1c7ed6') },
      { key: 'iBr', w: 96, h: 96, draw: icon((c, x, y, s) => { c.fillStyle = '#e03131'; c.beginPath(); c.arc(x, y + s * 0.12, s * 0.62, 0, TAU); c.fill(); c.fillStyle = '#2f9e44'; c.beginPath(); c.ellipse(x + s * 0.28, y - s * 0.62, s * 0.3, s * 0.14, -0.6, 0, TAU); c.fill(); c.fillStyle = '#6d4c2f'; c.fillRect(x - s * 0.05, y - s * 0.75, s * 0.1, s * 0.3); }, '#8d5a2b') },
      { key: 'iG', w: 96, h: 96, draw: icon((c, x, y, s) => { c.fillStyle = '#495057'; c.beginPath(); c.moveTo(x - s * 0.6, y + s * 0.7); c.quadraticCurveTo(x - s * 0.75, y - s * 0.3, x - s * 0.12, y - s * 0.45); c.lineTo(x - s * 0.25, y - s * 0.8); c.lineTo(x + s * 0.25, y - s * 0.8); c.lineTo(x + s * 0.12, y - s * 0.45); c.quadraticCurveTo(x + s * 0.75, y - s * 0.3, x + s * 0.6, y + s * 0.7); c.closePath(); c.fill(); }, '#6c757d') },
    ], 1024, 256);
    const textQuads = [];
    function text(grp, key, w, pos, rot) {
      (grp.userData.texts || (grp.userData.texts = [])).push([key, w, pos, rot]);
    }
    function bake(grp) {
      grp.updateMatrix();
      (grp.userData.texts || []).forEach(([key, w, pos, rot]) => {
        const q = xf(A.quad(key, w), pos, rot);
        q.applyMatrix4(grp.matrix);
        textQuads.push(q);
      });
      delete grp.userData.texts;
    }

    /* Glas (Kolben, Tank) und Wasser: durchsichtig, Vertex-Farben */
    const glassMat = new T.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.3, roughness: 0.06, metalness: 0.05, envMapIntensity: 1.4, depthWrite: false });
    glassMat.name = 'sach1-glas';
    const waterMat = new T.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.66, roughness: 0.12, metalness: 0.0, envMapIntensity: 1.0, depthWrite: false });
    waterMat.name = 'sach1-wasser';
    const glassMesh = (q, color) => { const m = new T.Mesh(kit.paint(q, color, { grad: [0.95, 1.05] }), glassMat); m.castShadow = false; m.receiveShadow = false; m.renderOrder = 3; return m; };
    const waterMesh = (q, color) => { const m = new T.Mesh(kit.paint(q, color, { grad: [0.8, 1.05] }), waterMat); m.castShadow = false; m.receiveShadow = false; m.renderOrder = 2; return m; };

    /**
     * Bewegliche starre Teile je Material in EINEM Mesh: pro Bild werden die
     * Eckpunkte jedes Teils mit seiner Matrix (Insel-Koordinaten) neu gesetzt
     * (keine Allokationen). objs: [Group, Drehpunkt im Ursprung]
     */
    function rigidBatch(objs, sphere) {
      const buckets = new Map();
      objs.forEach((obj, oi) => {
        obj.updateMatrixWorld(true);
        obj.traverse((m) => {
          if (!m.isMesh) return;
          let q = m.geometry.clone();
          if (q.index) q = q.toNonIndexed();
          for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) q.deleteAttribute(k);
          const n = q.attributes.position.count;
          if (!q.attributes.uv) q.setAttribute('uv', new T.BufferAttribute(new Float32Array(n * 2), 2));
          if (m.material.vertexColors && !q.attributes.color) q.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
          if (!m.material.vertexColors && q.attributes.color) q.deleteAttribute('color');
          q.applyMatrix4(m.matrixWorld);
          const key = m.material.uuid;
          if (!buckets.has(key)) buckets.set(key, { mat: m.material, cast: m.castShadow, geos: [], ids: [] });
          const b = buckets.get(key);
          b.geos.push(q);
          b.ids.push([oi, n]);
        });
      });
      const grp = new T.Group();
      grp.name = 'beweglich';
      grp.userData.dynamic = true;
      const parts = [];
      buckets.forEach((b) => {
        const gm = b.geos.length > 1 ? merge(b.geos, false) : b.geos[0];
        gm.attributes.position.setUsage(T.DynamicDrawUsage);
        gm.attributes.normal.setUsage(T.DynamicDrawUsage);
        const id = new Uint8Array(gm.attributes.position.count);
        let o = 0;
        b.ids.forEach(([oi, n]) => { id.fill(oi, o, o + n); o += n; });
        gm.boundingSphere = sphere.clone();
        const mesh = new T.Mesh(gm, b.mat);
        mesh.castShadow = b.cast;
        mesh.receiveShadow = true;
        grp.add(mesh);
        parts.push({ pos: gm.attributes.position, nrm: gm.attributes.normal, p0: Float32Array.from(gm.attributes.position.array), n0: Float32Array.from(gm.attributes.normal.array), id });
      });
      const M = new Float32Array(objs.length * 16);
      const I = new T.Matrix4();
      objs.forEach((o, i) => M.set(I.elements, i * 16));
      return {
        group: grp,
        set(i, m4) { M.set(m4.elements, i * 16); },
        apply() {
          for (let p = 0; p < parts.length; p++) {
            const { pos, nrm, p0, n0, id } = parts[p];
            const pa = pos.array, na = nrm.array;
            for (let v = 0, n = id.length; v < n; v++) {
              const o = id[v] * 16, i3 = v * 3;
              const x = p0[i3], y = p0[i3 + 1], z = p0[i3 + 2];
              pa[i3] = M[o] * x + M[o + 4] * y + M[o + 8] * z + M[o + 12];
              pa[i3 + 1] = M[o + 1] * x + M[o + 5] * y + M[o + 9] * z + M[o + 13];
              pa[i3 + 2] = M[o + 2] * x + M[o + 6] * y + M[o + 10] * z + M[o + 14];
              const a = n0[i3], b2 = n0[i3 + 1], c = n0[i3 + 2];
              na[i3] = M[o] * a + M[o + 4] * b2 + M[o + 8] * c;
              na[i3 + 1] = M[o + 1] * a + M[o + 5] * b2 + M[o + 9] * c;
              na[i3 + 2] = M[o + 2] * a + M[o + 6] * b2 + M[o + 10] * c;
            }
            pos.needsUpdate = true;
            nrm.needsUpdate = true;
          }
        },
      };
    }
    const movers = []; // { obj, update(t, m4) } – setzt die Matrix in Insel-Koordinaten
    const _qe = new T.Quaternion();

    /* Blasen und Dampf: EINE instanzierte Kugel-Wolke für die ganze Insel */
    const NB = 16;
    const bubbles = new T.InstancedMesh(kit.paint(new T.IcosahedronGeometry(1, 0), '#ffffff', { grad: [0.85, 1.05] }), kit.mats.glossSmooth, NB);
    bubbles.name = 'blasen';
    bubbles.castShadow = false;
    bubbles.userData.dynamic = true;
    bubbles.frustumCulled = false;
    const bubbleFns = []; // (t, dummy) → setzt dummy.position/scale, gibt die Farbe zurück
    // Dampfwölkchen (weicher, eigene feinere Kugeln)
    const NPF = 4;
    const puffs = new T.InstancedMesh(kit.paint(new T.IcosahedronGeometry(1, 1), '#ffffff', { grad: [0.88, 1.05] }), kit.mats.matte, NPF);
    puffs.name = 'dampf';
    puffs.castShadow = false;
    puffs.userData.dynamic = true;
    puffs.frustumCulled = false;
    const puffFns = [];
    const bub = new T.Object3D();

    /* ------------------------------------------------------------------
       Forscherlabor mit Riesenkolben (hinten Mitte)
       ------------------------------------------------------------------ */
    const LAB = { x: -0.15, z: -2.15, ry: 0.08 };
    let flaskLocal = null;
    function lab() {
      const grp = new T.Group();
      grp.name = 'labor';
      const P = new kit.Parts();
      const bw = 2.6, bd = 1.7, bh = 1.4, pl = 0.16;
      P.add(xf(geo.roundBox(bw + 0.25, pl, bd + 0.25, 0.05, 1), [0, pl / 2, 0]), C.stone, { grad: [0.75, 1] });
      P.add(xf(geo.roundBox(bw, bh, bd, 0.08), [0, pl + bh / 2, 0]), WALL, { grad: [0.84, 1.04] });
      P.add(xf(geo.roundBox(bw + 0.04, 0.16, bd + 0.04, 0.04, 1), [0, pl + 0.08, 0]), ACC, { grad: [0.85, 1.05] });
      // Flachdach mit Attika
      const rt = pl + bh;
      P.add(xf(geo.roundBox(bw + 0.3, 0.18, bd + 0.3, 0.06, 1), [0, rt + 0.06, 0]), ACC, { gloss: true, grad: [0.85, 1.1] });
      P.add(xf(geo.roundBox(bw + 0.22, 0.06, bd + 0.22, 0.03, 1), [0, rt + 0.17, 0]), '#eef4f0', { grad: [0.95, 1.02] });
      // Fenster vorn (grüne Rahmen) und an den Seiten
      const fz = bd / 2 + 0.02;
      const win = (x, y, z, ry, w, h) => {
        const sx = Math.sin(ry), cz = Math.cos(ry);
        const at = (d) => [x + sx * d, y, z + cz * d];
        P.add(xf(geo.roundBox(w + 0.12, h + 0.12, 0.07, 0.035, 1), at(0), [0, ry, 0]), ACC, { grad: [0.85, 1.05] });
        P.addRaw(kit.paint(xf(geo.box(w, h, 0.06), at(0.02), [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
        P.add(xf(geo.box(0.035, h, 0.07), at(0.035), [0, ry, 0]), '#ffffff', {});
        P.add(xf(geo.roundBox(w + 0.2, 0.07, 0.16, 0.02, 1), at(0.06).map((v, k) => (k === 1 ? y - h / 2 - 0.08 : v)), [0, ry, 0]), '#ffffff', {});
      };
      [-1, 1].forEach((s) => {
        win(s * 0.85, pl + 0.78, fz, 0, 0.62, 0.56);
      });
      // Tür mit Bullauge und grünem Vordach
      P.add(xf(geo.roundBox(0.66, 1.0, 0.06, 0.03, 1), [0, pl + 0.5, fz]), '#ffffff', {});
      P.add(xf(geo.roundBox(0.54, 0.92, 0.07, 0.03, 1), [0, pl + 0.47, fz + 0.02]), ACC_L, { gloss: true, grad: [0.85, 1.05] });
      P.add(xf(new T.TorusGeometry(0.11, 0.03, 3, 10), [0, pl + 0.7, fz + 0.06]), '#ffffff', {});
      P.addRaw(kit.paint(xf(new T.CircleGeometry(0.1, 10), [0, pl + 0.7, fz + 0.06]), '#ffffff', { grad: [1, 1] }), 'window');
      P.add(xf(new T.IcosahedronGeometry(0.035, 0), [0.18, pl + 0.45, fz + 0.08]), C.gold, { gloss: true });
      P.add(xf(geo.roundBox(0.9, 0.06, 0.42, 0.02, 1), [0, pl + 1.08, fz + 0.2], [0.18, 0, 0]), ACC, { gloss: true });
      P.add(xf(geo.roundBox(0.95, 0.1, 0.45, 0.03, 1), [0, 0.05, fz + 0.26]), C.stone, {});
      // Schild „Labor“ über der Tür
      P.add(xf(geo.roundBox(1.0, 0.3, 0.07, 0.05, 1), [0, pl + 1.28, fz + 0.03]), ACC, { gloss: true, grad: [0.85, 1.08] });
      text(grp, 'labor', 0.86, [0, pl + 1.28, fz + 0.075]);
      // Rundkolben (klein) mit blauer Flüssigkeit, Reagenzglas-Ständer
      const rkx = 0.9, rkz = -0.25, rky = rt + 0.15;
      P.add(xf(geo.cyl(0.3, 0.32, 0.08, 10), [rkx, rky + 0.04, rkz]), '#e9ecef', { gloss: true });
      P.add(xf(new T.SphereGeometry(0.25, 12, 8, 0, TAU, PI * 0.45, PI * 0.55), [rkx, rky + 0.32, rkz]), '#4dabf7', { gloss: true, smooth: true, grad: [0.8, 1.1] });
      P.add(xf(new T.CircleGeometry(0.247, 12), [rkx, rky + 0.32 + 0.039, rkz], [-PI / 2, 0, 0]), '#74c0fc', { gloss: true, grad: [1, 1] });
      grp.userData.glass = [
        [new T.SphereGeometry(0.3, 10, 7), [rkx, rky + 0.36, rkz], '#e7f7ff'],
        [geo.cyl(0.09, 0.09, 0.42, 10, 1).translate(0, 0.21, 0), [rkx, rky + 0.6, rkz], '#e7f7ff'],
      ];
      // Riesen-Erlenmeyerkolben
      const fx = -0.3, fzK = 0.0, fy = rt + 0.15;
      P.add(xf(geo.cyl(0.78, 0.82, 0.1, 16), [fx, fy + 0.05, fzK]), '#e9ecef', { gloss: true, grad: [0.85, 1.05] });
      const prof = [[0.001, 0], [0.6, 0], [0.67, 0.05], [0.69, 0.13], [0.63, 0.32], [0.22, 1.18], [0.19, 1.28], [0.19, 1.66], [0.25, 1.71], [0.25, 1.79], [0.17, 1.8]].map((p) => new T.Vector2(p[0], p[1]));
      const liq = [[0.001, 0.03], [0.6, 0.03], [0.65, 0.1], [0.6, 0.32], [0.36, 0.84], [0.001, 0.84]].map((p) => new T.Vector2(p[0], p[1]));
      P.add(xf(new T.LatheGeometry(liq, 14), [fx, fy + 0.1, fzK]), '#3ee070', { gloss: true, smooth: true, grad: [0.78, 1.25] });
      grp.userData.glass.push([new T.LatheGeometry(prof, 14), [fx, fy + 0.1, fzK], '#eefaff']);
      // Skala-Striche am Kolben (weiß)
      [0.46, 0.66, 0.86].forEach((y, i) => {
        const r = 0.63 - (y - 0.32) * (0.41 / 0.86) + 0.012;
        P.add(xf(geo.box(i === 1 ? 0.22 : 0.14, 0.025, 0.02), [fx + 0.0, fy + 0.1 + y, fzK + r]), '#ffffff', { grad: [1, 1] });
      });
      // Glas-Lippe und Glanzstreifen (lassen das Glas als Glas erkennen)
      P.add(xf(new T.TorusGeometry(0.235, 0.035, 5, 14), [fx, fy + 0.1 + 1.76, fzK], [PI / 2, 0, 0]), '#ffffff', { gloss: true });
      const hl = (a, y0, y1, r0, r1, w) => {
        const p0 = [fx + Math.sin(a) * r0, fy + 0.1 + y0, fzK + Math.cos(a) * r0], p1 = [fx + Math.sin(a) * r1, fy + 0.1 + y1, fzK + Math.cos(a) * r1];
        const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
        const q = geo.box(w, len, 0.012);
        q.lookAt(new T.Vector3(Math.sin(a), 0, Math.cos(a)));
        const tilt = Math.atan2(r0 - r1, y1 - y0);
        q.applyMatrix4(new T.Matrix4().makeRotationAxis(new T.Vector3(Math.cos(a), 0, -Math.sin(a)), -tilt));
        q.translate((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2);
        P.add(q, '#ffffff', { gloss: true, grad: [1, 1] });
      };
      hl(-0.55, 0.42, 1.05, 0.555, 0.265, 0.05);
      hl(-0.55, 1.32, 1.6, 0.2, 0.2, 0.035);
      flaskLocal = { x: fx, y: fy + 0.1, z: fzK };
      P.build(grp);
      grp.userData.top = fy + 1.9;
      return grp;
    }
    const LS = 1.15; // Labor etwas größer: Wahrzeichen
    const labGrp = lab();
    labGrp.scale.setScalar(LS);
    base.place(labGrp, LAB.x, LAB.z, { rotY: LAB.ry, keep: 1.9 });
    labGrp.position.y -= 0.04;
    bake(labGrp);
    labGrp.updateMatrix();
    labGrp.userData.glass.forEach(([q, p, col]) => { const m = glassMesh(xf(q, p), col); m.applyMatrix4(labGrp.matrix); g.add(m); });
    delete labGrp.userData.glass;
    {
      // blubbernde Blasen im Kolben + Dampf aus dem Hals
      const c0 = new T.Vector3(flaskLocal.x, flaskLocal.y, flaskLocal.z).applyMatrix4(labGrp.matrix);
      const r = kit.rng(9);
      for (let i = 0; i < 10; i++) {
        const a = r() * TAU, rr = r() * 0.8, sp = 0.35 + r() * 0.3, ph = r(), sz = 0.035 + r() * 0.03;
        bubbleFns.push((t, d) => {
          const k = (t * sp * Math.max(calm, 0.2) + ph) % 1;
          const y = 0.08 + k * 0.72;
          const rad = (0.6 - Math.max(0, y - 0.32) * 0.45) * rr * LS;
          d.position.set(c0.x + Math.cos(a) * rad, c0.y + y * LS, c0.z + Math.sin(a) * rad);
          d.scale.setScalar(sz * LS * (k < 0.92 ? 1 : (1 - k) / 0.08));
          return '#c3fae8';
        });
      }
      for (let i = 0; i < NPF; i++) {
        const ph = i / NPF;
        puffFns.push((t, d) => {
          const k = (t * 0.32 * Math.max(calm, 0.25) + ph) % 1;
          d.position.set(c0.x + Math.sin(k * 5 + i) * 0.12 * k, c0.y + 1.8 * LS + k * 1.0, c0.z + k * 0.15);
          d.scale.setScalar(Math.max(0.001, Math.sin(k * PI) * (0.09 + k * 0.13)));
        });
      }
    }

    /* ------------------------------------------------------------------
       Straße mit Zebrastreifen quer über die Wiese
       ------------------------------------------------------------------ */
    const ROAD = { z: 2.2, w: 0.92, zx: 0.36 };
    const roadZ = (x) => ROAD.z + Math.sin(x * 0.55 + 0.4) * 0.16;
    const roadAng = (x) => Math.atan(Math.cos(x * 0.55 + 0.4) * 0.16 * 0.55);
    (function road() {
      const P = new kit.Parts();
      // Ende: wo eine Straßenkante die Wiese verlässt (mit etwas Abstand)
      const ok = (x) => base.isOnGrass(x, roadZ(x) - ROAD.w / 2, 0.12) && base.isOnGrass(x, roadZ(x) + ROAD.w / 2, 0.12);
      let x0 = 0, x1 = 0;
      while (x0 > -5 && ok(x0 - 0.1)) x0 -= 0.1;
      while (x1 < 5 && ok(x1 + 0.1)) x1 += 0.1;
      const n = Math.max(8, Math.round((x1 - x0) / 0.18));
      const strip = (o0, o1, lift, color, opts) => {
        const pos = [];
        const pt = (x, o) => { const z = roadZ(x) + o; return [x, ground(x, z) + lift, z]; };
        for (let i = 0; i < n; i++) {
          const xa = x0 + ((x1 - x0) * i) / n, xb = x0 + ((x1 - x0) * (i + 1)) / n;
          const a0 = pt(xa, o0), a1 = pt(xa, o1), b0 = pt(xb, o0), b1 = pt(xb, o1);
          pos.push(...a0, ...b1, ...a1, ...a0, ...b0, ...b1);
        }
        const q = new T.BufferGeometry();
        q.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        q.computeVertexNormals();
        if (q.attributes.normal.getY(0) < 0) { const p = q.attributes.position.array; for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; } q.computeVertexNormals(); }
        P.add(q, color, opts);
      };
      strip(-ROAD.w / 2, ROAD.w / 2, 0.05, ASPH, { grad: [1, 1], jitter: 0.03, seed: 4 });
      // Bordsteine (leicht erhöht, mit Seitenkante)
      [-1, 1].forEach((s) => {
        const o = s * (ROAD.w / 2 + 0.06);
        strip(o - 0.06, o + 0.06, 0.09, '#dfe3ea', { grad: [1, 1] });
      });
      // Mittellinie (gestrichelt), ausgespart am Zebrastreifen
      for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.5) {
        if (Math.abs(x - ROAD.zx) < 0.55) continue;
        P.add(xf(geo.box(0.26, 0.012, 0.05), [x, ground(x, roadZ(x)) + 0.058, roadZ(x)], [0, -roadAng(x), 0]), '#ffffff', { grad: [1, 1] });
      }
      // Zebrastreifen (quer zur Fahrbahn)
      for (let i = 0; i < 5; i++) {
        const x = ROAD.zx - 0.4 + i * 0.2;
        P.add(xf(geo.box(0.11, 0.014, ROAD.w * 0.84), [x, ground(x, roadZ(x)) + 0.058, roadZ(x)], [0, -roadAng(x), 0]), '#ffffff', { grad: [1, 1] });
      }
      // Endkappen
      [x0, x1].forEach((x) => { const z = roadZ(x); P.add(xf(geo.roundBox(0.12, 0.12, ROAD.w + 0.24, 0.04, 1), [x, ground(x, z) + 0.06, z], [0, -roadAng(x), 0]), '#dfe3ea', { grad: [0.85, 1.05] }); });
      const m = P.build();
      m.name = 'strasse';
      g.add(m);
      for (let x = x0; x <= x1; x += 0.45) base.keep(x, roadZ(x), ROAD.w * 0.62);
    })();

    /* Fußgängerampel mit wechselnden Männchen und „Bitte drücken“-Kasten */
    const AMP = { x: ROAD.zx + 0.72, z: roadZ(ROAD.zx + 0.72) + ROAD.w / 2 + 0.32 };
    let lightQuads = null;
    (function ampel() {
      const grp = new T.Group();
      grp.name = 'ampel';
      const P = new kit.Parts();
      const D = '#3b4256';
      P.add(xf(geo.cyl(0.11, 0.13, 0.08, 8), [0, 0.04, 0]), '#adb5bd', {});
      P.add(xf(geo.cyl(0.04, 0.05, 1.85, 8), [0, 0.95, 0]), '#e9ecef', { grad: [0.75, 1.05] });
      P.add(xf(geo.roundBox(0.32, 0.64, 0.2, 0.05, 1), [0, 1.62, 0.04]), D, { gloss: true, grad: [0.85, 1.05] });
      [1.78, 1.46].forEach((y) => {
        P.add(xf(geo.cyl(0.125, 0.125, 0.03, 12), [0, y, 0.15], [PI / 2, 0, 0]), '#1d2230', { gloss: true });
        P.add(xf(new T.CylinderGeometry(0.14, 0.14, 0.12, 8, 1, true, -PI / 2, PI), [0, y + 0.02, 0.2], [-PI / 2, 0, 0], [1, 1, 0.5]), D, { double: true });
      });
      // „Signal kommt“-Kasten (gelb)
      P.add(xf(geo.roundBox(0.2, 0.26, 0.12, 0.04, 1), [0, 1.0, 0.08]), '#ffd43b', { gloss: true, grad: [0.85, 1.05] });
      P.add(xf(geo.cyl(0.04, 0.04, 0.03, 8), [0, 0.95, 0.15], [PI / 2, 0, 0]), '#1d2230', { gloss: true });
      P.build(grp);
      base.place(grp, AMP.x, AMP.z, { rotY: 0.2, keep: 0.35 });
      grp.updateMatrix();
      // leuchtende Männchen: ein Mesh, Farben werden umgeschaltet
      const qs = [xf(A.quad('manR', 0.2), [0, 1.78, 0.168]), xf(A.quad('manG', 0.2), [0, 1.46, 0.168])].map((q) => q.toNonIndexed().applyMatrix4(grp.matrix));
      const gm = merge(qs, false);
      gm.setAttribute('color', new T.BufferAttribute(new Float32Array(gm.attributes.position.count * 3), 3));
      const mat = new T.MeshBasicMaterial({ map: A.tex, vertexColors: true, transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
      lightQuads = new T.Mesh(gm, mat);
      lightQuads.name = 'ampel-licht';
      lightQuads.renderOrder = 3;
      lightQuads.userData.dynamic = true;
      g.add(lightQuads);
    })();
    const ampCol = lightQuads.geometry.attributes.color;
    let ampState = -1;
    function setAmpel(green) {
      if (green === ampState) return;
      ampState = green;
      const red = green ? [0.32, 0.08, 0.08] : [1.6, 0.32, 0.25];
      const grn = green ? [0.35, 1.6, 0.55] : [0.06, 0.25, 0.1];
      const half = ampCol.count / 2;
      for (let i = 0; i < ampCol.count; i++) { const c = i < half ? red : grn; ampCol.setXYZ(i, c[0], c[1], c[2]); }
      ampCol.needsUpdate = true;
    }
    setAmpel(0);
    updates.push((dt, t) => setAmpel((t % 9) > 5 ? 1 : 0));

    /* Schilder: Fußgängerüberweg + „Schulweg“ (hinter der Straße), „Achtung Kinder“ */
    function signPost(items, h) {
      const grp = new T.Group();
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.035, 0.04, h, 6), [0, h / 2, -0.03]), '#adb5bd', { grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.08, 0.1, 0.06, 6), [0, 0.03, -0.03]), '#868e96', {});
      items.forEach(([key, w, y, plate]) => {
        if (plate) P.add(xf(geo.box(plate[0], plate[1], 0.03), [0, y, -0.005]), '#dee2e6', { grad: [0.9, 1.0] });
        text(grp, key, w, [0, y, 0.014]);
      });
      P.build(grp);
      return grp;
    }
    const sp1 = signPost([['zebra', 0.46, 1.5, [0.46, 0.46]], ['schulweg', 0.56, 1.13, [0.56, 0.18]]], 1.72);
    base.place(sp1, ROAD.zx - 0.78, roadZ(ROAD.zx - 0.78) - ROAD.w / 2 - 0.3, { rotY: 0.15, keep: 0.3 });
    bake(sp1);
    const sp2 = signPost([['kinder', 0.5, 1.42, null]], 1.6);
    base.place(sp2, -3.05, roadZ(-3.05) + ROAD.w / 2 + 0.3, { rotY: 0.35, keep: 0.3 });
    bake(sp2);

    /* ------------------------------------------------------------------
       Wassertank: Schwimmen und Sinken (vorne rechts)
       ------------------------------------------------------------------ */
    const TANK = { x: 2.0, z: 3.25, ry: -0.42 };
    let tankM = null;
    const TW = 1.2, TD = 0.62, TH = 0.72, TY = 0.62, WATER = 0.56;
    (function tank() {
      const grp = new T.Group();
      grp.name = 'wassertank';
      const P = new kit.Parts();
      // Tisch
      P.add(xf(geo.roundBox(TW + 0.24, 0.08, TD + 0.22, 0.03, 1), [0, TY - 0.04, 0]), C.woodLight, { grad: [0.85, 1.05] });
      [-1, 1].forEach((s) => [-1, 1].forEach((t) => P.add(xf(geo.box(0.08, TY - 0.08, 0.08), [s * (TW / 2 + 0.02), (TY - 0.08) / 2, t * (TD / 2 + 0.02)]), C.wood, { grad: [0.75, 1.0] })));
      // Rahmen des Tanks (grün) und Bodenkies
      [-1, 1].forEach((s) => [-1, 1].forEach((t) => P.add(xf(geo.box(0.05, TH, 0.05), [s * TW / 2, TY + TH / 2, t * TD / 2]), ACC, { gloss: true })));
      [-1, 1].forEach((s) => { P.add(xf(geo.box(TW + 0.05, 0.05, 0.05), [0, TY + TH, s * TD / 2]), ACC, { gloss: true }); P.add(xf(geo.box(0.05, 0.05, TD), [s * TW / 2, TY + TH, 0]), ACC, { gloss: true }); });
      P.add(xf(geo.box(TW, 0.05, TD), [0, TY + 0.025, 0]), ACC, { gloss: true });
      P.add(xf(geo.box(TW - 0.06, 0.04, TD - 0.06), [0, TY + 0.07, 0]), '#e9d8b4', { grad: [0.9, 1.05], jitter: 0.1, seed: 3 });
      // ruhender Stein am Boden, Wasserpflanze
      P.add(xf(geo.blob(0.09, { seed: 31, noise: 0.25, sy: 0.7, detail: 0 }), [-0.32, TY + 0.13, 0.05]), '#868e96', { grad: [0.8, 1.05] });
      [-0.05, 0.05].forEach((x, i) => P.add(xf(new T.ConeGeometry(0.035, 0.3 + i * 0.08, 4), [0.42 + x, TY + 0.24 + i * 0.04, -0.12], [0, 0, x * 2]), '#40c057', {}));
      P.build(grp);
      base.place(grp, TANK.x, TANK.z, { rotY: TANK.ry, keep: 0.85 });
      grp.updateMatrix();
      tankM = grp.matrix.clone();
      // Glas (5 Seiten) und Wasser
      const walls = [
        [geo.box(TW, TH, 0.02), [0, TY + TH / 2, TD / 2]], [geo.box(TW, TH, 0.02), [0, TY + TH / 2, -TD / 2]],
        [geo.box(0.02, TH, TD), [TW / 2, TY + TH / 2, 0]], [geo.box(0.02, TH, TD), [-TW / 2, TY + TH / 2, 0]],
      ].map(([q, p]) => xf(q, p).toNonIndexed());
      const gm = glassMesh(merge(walls, false), '#f1fbff');
      gm.applyMatrix4(tankM);
      g.add(gm);
      const wm = waterMesh(xf(geo.box(TW - 0.04, WATER - 0.05, TD - 0.04), [0, TY + 0.05 + (WATER - 0.05) / 2, 0]), '#1d9be2');
      wm.applyMatrix4(tankM);
      g.add(wm);
    })();
    // schwimmendes Boot, Ente, sinkender Stein (bewegliche Teile)
    {
      // kleines Spielzeugboot (Bug nach +x, Wasserlinie y = 0)
      const bWrap = (function () {
        const P = new kit.Parts();
        const hs = new T.Shape();
        hs.moveTo(-0.19, 0.05); hs.lineTo(0.19, 0.05); hs.lineTo(0.26, 0.08); hs.lineTo(0.15, -0.045); hs.lineTo(-0.15, -0.045); hs.lineTo(-0.2, 0.0); hs.closePath();
        const hull = new T.ExtrudeGeometry(hs, { depth: 0.15, bevelEnabled: false });
        hull.translate(0, 0, -0.075);
        P.add(hull, '#ff6b6b', { gloss: true, grad: [0.75, 1.08] });
        P.add(xf(geo.box(0.36, 0.012, 0.13), [0.0, 0.055, 0]), C.woodLight, {});
        P.add(xf(geo.cyl(0.008, 0.01, 0.36, 5), [0.02, 0.23, 0]), C.woodDark, {});
        const ss = new T.Shape();
        ss.moveTo(0, 0); ss.lineTo(0, 0.3); ss.lineTo(-0.17, 0.0); ss.closePath();
        P.add(xf(new T.ExtrudeGeometry(ss, { depth: 0.012, bevelEnabled: false }), [0.0, 0.09, -0.006]), '#ffffff', { grad: [0.9, 1.04] });
        const fl = new T.Shape();
        fl.moveTo(0, 0); fl.lineTo(0.07, -0.02); fl.lineTo(0, -0.04); fl.closePath();
        P.add(xf(new T.ExtrudeGeometry(fl, { depth: 0.008, bevelEnabled: false }), [0.03, 0.41, -0.004]), '#ffd43b', {});
        return P.build();
      })();
      const duck = (function () {
        const P = new kit.Parts();
        P.add(geo.blob(0.09, { seed: 2, noise: 0.05, sx: 1.25, sy: 0.75, detail: 1 }).translate(0, 0.02, 0), '#ffd43b', { gloss: true, grad: [0.85, 1.08] });
        P.add(xf(new T.SphereGeometry(0.06, 8, 6), [0.07, 0.11, 0]), '#ffd43b', { gloss: true });
        P.add(xf(new T.ConeGeometry(0.025, 0.06, 4), [0.135, 0.1, 0], [0, 0, -PI / 2]), '#ff922b', { gloss: true });
        [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.012, 4, 3), [0.1, 0.13, s * 0.035]), '#212529', {}));
        return P.build();
      })();
      const stone = (function () { const P = new kit.Parts(); P.add(geo.blob(0.085, { seed: 77, noise: 0.25, sy: 0.75, detail: 0 }), '#7d8590', { grad: [0.8, 1.05] }); return P.build(); })();
      const lp = (x, y, z) => new T.Vector3(x, y, z).applyMatrix4(tankM);
      const qT = new T.Quaternion().setFromRotationMatrix(tankM);
      const surf = TY + WATER;
      const rest = [
        { obj: bWrap, p: lp(-0.12, surf, -0.05), ry: 0.4 },
        { obj: duck, p: lp(0.3, surf - 0.015, 0.1), ry: -2.4 },
        { obj: stone, p: lp(0.12, surf + 0.25, 0.05), ry: 0 },
      ];
      const q = new T.Quaternion(), e = new T.Euler(), s = new T.Vector3(1, 1, 1), pp = new T.Vector3();
      rest.forEach((r, i) => {
        movers.push({
          obj: r.obj,
          update(t, m4) {
            pp.copy(r.p);
            let k = 1, roll = 0, yaw = r.ry;
            if (i < 2) { // schwimmt: wippt auf der Wasseroberfläche
              pp.y += Math.sin(t * 1.6 + i * 2) * 0.012 * calm;
              roll = Math.sin(t * 1.3 + i) * 0.12 * calm;
              yaw += Math.sin(t * 0.3 + i) * 0.4 * calm;
            } else { // Stein: fällt ins Wasser, sinkt, liegt kurz, verschwindet
              const c = (t * 0.16 + 0.35) % 1;
              const y0 = surf + 0.25, yB = TY + 0.13;
              let y;
              if (c < 0.08) y = y0 - (c / 0.08) * (y0 - surf) * 0.9;
              else if (c < 0.55) y = surf - 0.02 - W.ease.outCubic((c - 0.08) / 0.47) * (surf - 0.02 - yB);
              else y = yB;
              pp.y = (r.p.y - y0) + y;
              k = c < 0.04 ? c / 0.04 : c > 0.9 ? Math.max(0.001, (1 - c) / 0.1) : 1;
              yaw = c * 2;
            }
            e.set(roll, yaw, roll * 0.5);
            q.copy(qT).multiply(_qe.setFromEuler(e));
            s.setScalar(k);
            m4.compose(pp, q, s);
          },
        });
      });
      // Blasen am sinkenden Stein
      const sm = rest[2];
      for (let i = 0; i < 5; i++) {
        const ph = i / 5;
        bubbleFns.push((t, d) => {
          const c = (t * 0.16 + 0.35) % 1;
          const k = (t * 0.9 + ph) % 1;
          const on = c > 0.08 && c < 0.6;
          const y0 = surf - 0.02 - W.ease.outCubic(Math.min(1, Math.max(0, (c - 0.08) / 0.47))) * (surf - 0.02 - (TY + 0.13));
          const yy = y0 + k * (surf - y0);
          d.position.set(sm.p.x + Math.sin(i * 2.3) * 0.04, (sm.p.y - (surf + 0.25)) + yy, sm.p.z + Math.cos(i * 1.7) * 0.04);
          d.scale.setScalar(on ? 0.02 + 0.012 * Math.sin(k * PI) : 0.0001);
          return '#ffffff';
        });
      }
    }

    /* ------------------------------------------------------------------
       Mülltonnen: gelb, blau, braun, grau (links)
       ------------------------------------------------------------------ */
    const BINS = { x: -2.95, z: -0.15, ry: 0.62 };
    let yellowLid = null;
    (function bins() {
      const grp = new T.Group();
      grp.name = 'muelltonnen';
      const P = new kit.Parts();
      const cols = [['#ffd43b', 'iY'], ['#1c7ed6', 'iB'], ['#8d5a2b', 'iBr'], ['#6c757d', 'iG']];
      const bh = 0.78, rt = 0.33, rb = 0.28, tilt = Math.atan(((rt - rb) * 0.707) / bh);
      cols.forEach(([col, ic], i) => {
        const x = (i - 1.5) * 0.56;
        const body = geo.cyl(rt, rb, bh, 4).rotateY(PI / 4);
        P.add(xf(body, [x, bh / 2 + 0.04, 0]), col, { gloss: true, grad: [0.78, 1.06] });
        P.add(xf(geo.box(rt * 1.45, 0.06, rt * 1.45), [x, bh - 0.02, 0]), kit.shade(col, 0.85), { gloss: true });
        [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.07, 0.07, 0.05, 6), [x + s * 0.17, 0.07, -0.2], [0, 0, PI / 2]), '#343a40', {}));
        text(grp, ic, 0.26, [x, bh * 0.5, 0.707 * (rb + (rt - rb) * ((bh * 0.5 - 0.04) / bh)) + 0.008], [tilt, 0, 0]);
        if (i === 0) return; // gelber Deckel bewegt sich
        P.add(xf(geo.roundBox(rt * 1.5, 0.07, rt * 1.55, 0.03, 1), [x, bh + 0.05, 0.01]), kit.shade(col, 0.92), { gloss: true, grad: [0.85, 1.08] });
        P.add(xf(geo.roundBox(0.18, 0.04, 0.06, 0.02, 1), [x, bh + 0.08, rt * 0.78]), kit.shade(col, 0.75), { gloss: true });
      });
      P.build(grp);
      base.place(grp, BINS.x, BINS.z, { rotY: BINS.ry, keep: 1.25 });
      bake(grp);
      // Deckel der gelben Tonne (Scharnier hinten)
      const lid = (function () {
        const L = new kit.Parts();
        L.add(xf(geo.roundBox(rt * 1.5, 0.07, rt * 1.55, 0.03, 1), [0, 0.0, rt * 0.77]), '#f0c419', { gloss: true, grad: [0.85, 1.08] });
        L.add(xf(geo.roundBox(0.18, 0.04, 0.06, 0.02, 1), [0, 0.03, rt * 1.55]), '#b8930f', { gloss: true });
        return L.build();
      })();
      const hinge = new T.Vector3(-1.5 * 0.56, bh + 0.05, -rt * 0.76).applyMatrix4(grp.matrix);
      const qB = new T.Quaternion().setFromRotationMatrix(grp.matrix);
      const q = new T.Quaternion(), e = new T.Euler(), one = new T.Vector3(1, 1, 1);
      yellowLid = lid;
      movers.push({
        obj: lid,
        update(t, m4) {
          const c = (t * 0.22) % 1;
          const open = c < 0.5 ? 0 : Math.sin(((c - 0.5) / 0.5) * PI);
          e.set(-open * 1.0 * Math.max(calm, 0.35), 0, 0);
          q.copy(qB).multiply(_qe.setFromEuler(e));
          m4.compose(hinge, q, one);
        },
      });
    })();
    // Abfall vor den Tonnen: Papierknäuel, Flasche, Bananenschale
    (function litter() {
      const P = new kit.Parts();
      P.add(xf(geo.blob(0.1, { seed: 5, noise: 0.35, detail: 0 }), [-2.35, 0, 0.75]), '#f8f9fa', { grad: [0.85, 1.05] });
      P.add(xf(geo.cyl(0.06, 0.06, 0.24, 8), [-2.0, 0.06, 0.32], [0, 0.6, PI / 2]), '#40c057', { gloss: true, grad: [0.8, 1.1] });
      P.add(xf(geo.cyl(0.025, 0.05, 0.08, 8), [-1.84, 0.06, 0.23], [0, 0.6, PI / 2]), '#40c057', { gloss: true });
      [0, 2.1, 4.2].forEach((a) => P.add(xf(geo.roundBox(0.06, 0.03, 0.2, 0.015, 1), [-2.75 + Math.sin(a) * 0.07, 0.025, 1.0 + Math.cos(a) * 0.07], [0, a, 0]), '#ffd43b', { grad: [0.85, 1.05] }));
      const m = P.build();
      m.name = 'abfall';
      m.children.forEach((c) => { const p = c.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + ground(p.getX(i), p.getZ(i))); c.geometry.computeBoundingSphere(); });
      g.add(m);
    })();

    /* ------------------------------------------------------------------
       Großer Zahn mit Gesicht und putzender Zahnbürste (rechts)
       ------------------------------------------------------------------ */
    const TOOTH = { x: 2.95, z: -0.35, ry: -0.12 };
    (function tooth() {
      const grp = new T.Group();
      grp.name = 'zahn';
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.62, 0.68, 0.14, 12), [0, 0.07, 0]), ACC_L, { gloss: true, grad: [0.8, 1.05] });
      const crown = new T.SphereGeometry(0.52, 12, 8);
      P.add(xf(crown, [0, 1.02, 0], null, [1, 0.82, 0.86]), '#ffffff', { gloss: true, smooth: true, grad: [0.86, 1.04] });
      [-1, 1].forEach((s) => {
        P.add(xf(new T.SphereGeometry(0.26, 10, 6, 0, TAU, 0, PI * 0.6), [s * 0.22, 1.33, 0], null, [1, 0.85, 1]), '#ffffff', { gloss: true, smooth: true, grad: [0.92, 1.04] });
        P.add(xf(geo.cyl(0.21, 0.09, 0.62, 10), [s * 0.2, 0.5, 0], [0, 0, s * 0.16]), '#fbfbf4', { gloss: true, smooth: true, grad: [0.8, 1.0] });
        P.add(xf(new T.SphereGeometry(0.09, 6, 4), [s * 0.25, 0.2, 0], null, [1, 0.6, 1]), '#fbfbf4', { gloss: true, smooth: true });
        // Gesicht
        P.add(xf(new T.SphereGeometry(0.06, 7, 5), [s * 0.16, 1.07, 0.43], null, [0.8, 1.15, 0.5]), '#2b2b3a', { gloss: true, grad: [1, 1] });
        P.add(xf(new T.SphereGeometry(0.02, 5, 4), [s * 0.16 - 0.02, 1.11, 0.46]), '#ffffff', { gloss: true, grad: [1, 1] });
        P.add(xf(new T.SphereGeometry(0.075, 8, 5), [s * 0.31, 0.95, 0.36], null, [1, 0.6, 0.4]), '#ff9fb4', { gloss: true, grad: [1, 1] });
      });
      P.add(xf(new T.TorusGeometry(0.11, 0.024, 4, 10, PI), [0, 0.96, 0.44], [0, 0, PI]), '#c92a4a', { gloss: true, grad: [1, 1] });
      P.build(grp);
      base.place(grp, TOOTH.x, TOOTH.z, { rotY: TOOTH.ry, keep: 0.8 });
      grp.updateMatrix();
      // Zahnbürste (putzt: wippt hin und her)
      const brush = (function () {
        const B = new kit.Parts();
        B.add(xf(geo.roundBox(0.12, 1.4, 0.08, 0.04, 1), [0, 0.7, 0]), '#22b8cf', { gloss: true, grad: [0.85, 1.1] });
        B.add(xf(geo.roundBox(0.13, 0.5, 0.085, 0.04, 1), [0, 0.45, 0.005]), '#ffffff', { gloss: true });
        B.add(xf(geo.roundBox(0.15, 0.36, 0.1, 0.04, 1), [0, 1.52, 0]), '#22b8cf', { gloss: true, grad: [0.9, 1.1] });
        B.add(xf(geo.box(0.13, 0.32, 0.16), [0, 1.52, 0.12]), '#f1f3f5', { grad: [0.9, 1.05] });
        B.add(xf(geo.box(0.135, 0.1, 0.165), [0, 1.62, 0.12]), '#63e6be', { grad: [0.9, 1.05] });
        B.add(xf(geo.blob(0.09, { seed: 8, noise: 0.15, sx: 0.9, sy: 0.8, sz: 1.5, detail: 1 }), [0, 1.52, 0.24]), '#ffffff', { gloss: true });
        B.add(xf(geo.blob(0.055, { seed: 9, noise: 0.15, sx: 0.9, sy: 0.8, sz: 1.5, detail: 0 }), [0, 1.58, 0.28]), '#63e6be', { gloss: true });
        const bg = B.build();
        bg.scale.setScalar(1.18);
        const wrap = new T.Group();
        wrap.add(bg);
        return wrap;
      })();
      const piv = new T.Vector3(1.02, 0.0, 0.12).applyMatrix4(grp.matrix);
      const qB = new T.Quaternion().setFromRotationMatrix(grp.matrix);
      const q = new T.Quaternion(), e = new T.Euler(), one = new T.Vector3(1, 1, 1), pp = new T.Vector3(), up = new T.Vector3();
      movers.push({
        obj: brush,
        update(t, m4) {
          const w = Math.sin(t * 4.2) * calm;
          e.set(0.2 + w * 0.05, -PI / 2 + 0.25, 0, 'YXZ');
          q.copy(qB).multiply(_qe.setFromEuler(e));
          up.set(0, 1, 0).applyQuaternion(q);
          pp.copy(piv).addScaledVector(up, w * 0.05);
          m4.compose(pp, q, one);
        },
      });
      // Glitzer-Stern am Zahn
      const star = new T.Group();
      star.add(kit.star('#ffe066', 0.32));
      const sp = new T.Vector3(-0.5, 1.62, 0.25).applyMatrix4(grp.matrix);
      movers.push({
        obj: star,
        update(t, m4) {
          const k = 0.75 + Math.sin(t * 2.4) * 0.25 * calm;
          e.set(0, t * 1.6 * calm, Math.sin(t) * 0.2, 'XYZ');
          q.setFromEuler(e);
          one.setScalar(k);
          m4.compose(sp, q, one);
          one.setScalar(1);
        },
      });
    })();

    /* ------------------------------------------------------------------
       Hochbeet mit Möhren und Salat (vorne links)
       ------------------------------------------------------------------ */
    (function bed() {
      const grp = new T.Group();
      grp.name = 'hochbeet';
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(1.25, 0.3, 0.62, 0.04, 1), [0, 0.15, 0]), C.wood, { grad: [0.75, 1.05] });
      [-1, 1].forEach((s) => P.add(xf(geo.box(1.27, 0.03, 0.02), [0, 0.2, s * 0.31]), C.woodDark, {}));
      P.add(xf(geo.box(1.13, 0.04, 0.5), [0, 0.29, 0]), '#7a5233', { grad: [0.9, 1.05], jitter: 0.08, seed: 6 });
      for (let i = 0; i < 4; i++) {
        const x = -0.45 + i * 0.22;
        P.add(xf(new T.ConeGeometry(0.06, 0.12, 6), [x, 0.33, 0.08], [PI, 0, 0]), '#ff8c2e', { gloss: true });
        [-0.35, 0, 0.35].forEach((a) => P.add(xf(new T.ConeGeometry(0.028, 0.24, 3), [x + a * 0.08, 0.47, 0.08], [0, 0, a]), '#51cf66', {}));
      }
      [0.35, 0.47].forEach((x, i) => P.add(xf(geo.blob(0.13, { seed: 40 + i, noise: 0.2, sy: 0.75, detail: 0 }), [x, 0.38, -0.08 + i * 0.12]), '#8ce99a', { grad: [0.8, 1.1] }));
      // Gießkanne
      P.add(xf(geo.cyl(0.11, 0.12, 0.22, 10), [0.82, 0.11, 0.28]), '#4dabf7', { gloss: true, grad: [0.8, 1.08] });
      P.add(xf(geo.cyl(0.02, 0.03, 0.26, 6), [0.97, 0.2, 0.28], [0, 0, -0.9]), '#4dabf7', { gloss: true });
      P.add(xf(new T.TorusGeometry(0.07, 0.016, 3, 8, PI), [0.82, 0.22, 0.28]), '#339af0', { gloss: true });
      P.build(grp);
      base.place(grp, -1.9, 3.3, { rotY: 0.3, keep: 0.9 });
    })();

    /* ------------------------------------------------------------------
       Bewegliche Teile zusammenführen, Weg, Pflanzen
       ------------------------------------------------------------------ */
    const batch = rigidBatch(movers.map((m) => m.obj), new T.Sphere(new T.Vector3(0, 1, 0), 6.5));
    g.add(batch.group);
    const m4 = new T.Matrix4();
    function moveAll(t) {
      for (let i = 0; i < movers.length; i++) { movers[i].update(t, m4); batch.set(i, m4); }
      batch.apply();
      for (let i = 0; i < NB; i++) {
        bub.position.set(0, -50, 0); bub.scale.setScalar(0.0001);
        let col = '#ffffff';
        if (i < bubbleFns.length) col = bubbleFns[i](t, bub);
        bub.updateMatrix();
        bubbles.setMatrixAt(i, bub.matrix);
        if (!bubbles.userData.colored) bubbles.setColorAt(i, new T.Color(col));
      }
      bubbles.userData.colored = true;
      bubbles.instanceMatrix.needsUpdate = true;
      if (bubbles.instanceColor) bubbles.instanceColor.needsUpdate = true;
      for (let i = 0; i < NPF; i++) {
        puffFns[i](t, bub);
        bub.updateMatrix();
        puffs.setMatrixAt(i, bub.matrix);
      }
      puffs.instanceMatrix.needsUpdate = true;
    }
    g.add(bubbles, puffs);
    moveAll(0);
    updates.push((dt, t) => moveAll(t));

    kit.path(base, [[0.55, 4.35], [0.45, 3.3], [ROAD.zx, roadZ(ROAD.zx) + 0.6]], { seed: 307, width: 0.6 });
    kit.path(base, [[ROAD.zx, roadZ(ROAD.zx) - 0.62], [0.2, 0.6], [-0.05, -0.85]], { seed: 308, width: 0.6 });
    base.place(kit.tree({ type: 'pine', seed: 3071, scale: 1.15 }), -2.95, -2.15, { keep: 0.7 });
    base.place(kit.tree({ type: 'pine', seed: 3072, scale: 1.05 }), -1.65, -3.6, { keep: 0.6 });
    base.place(kit.tree({ type: 'round', seed: 3073, scale: 0.95 }), 2.75, -2.45, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 3074, scale: 0.8 }), 1.75, -3.65, { keep: 0.5 });
    base.place(kit.bush({ seed: 3076, size: 0.6 }), -3.95, 1.0, { keep: 0.4 });
    kit.grassTufts(base, 30, 307);
    kit.flowers(base, 4, ['#ffd23f', '#ffffff', '#ff7aa8', '#74c0fc'], 307);

    // Kontaktschatten
    [[LAB.x, LAB.z + 0.2, 2.0], [TANK.x, TANK.z, 0.95], [BINS.x, BINS.z, 1.2], [TOOTH.x, TOOTH.z, 0.8]].forEach(([x, z, r]) => {
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
    if (window.__w3dTris) window.__w3dTris('sach1', g);
    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.9, -1.6),
        focus: new T.Vector3(0, 1.5, -0.2),
      },
    };
  });
})();
