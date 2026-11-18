/* ==========================================================================
   js/world3d/islands/kino.js – Flos Kino (himbeerrot)

   Wahrzeichen: ein gestreiftes Zirkuszelt als Kino mit Eingangsportal,
   darüber die Leuchtschrift „KINO“ (Buchstaben leuchten nacheinander auf)
   mit Lauflichtern rundherum, und eine große Freiluft-Leinwand mit rotem
   Vorhang, auf der ein kleiner Film läuft (Flo hüpft durch eine Hügel-
   landschaft – animierte Textur, nur gezeichnet, wenn man das Kino sieht).
   Dazu ein roter Teppich mit goldenen Pfosten, Samtkordeln und Sternen,
   eine riesige Filmrolle, die sich dreht und deren Filmstreifen sich über
   die Wiese ringelt, eine Popcorn-Tüte, aus der Körner hüpfen, eine
   Filmklappe, die klappt, Sitzsäcke vor der Leinwand, zwei Scheinwerfer
   mit schwenkenden Lichtkegeln (nachts deutlich) und eine Palme.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'kino', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#c2255c';
    const ACC_D = kit.shade(ACC, 0.7);
    const CREAM = '#fff3e6';
    const RED = '#e03140';
    const GOLD = '#ffc94a';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];
    const merge = T.addons.mergeGeometries;

    const base = kit.islandBase({ seed: 419, radius: 6.1, grassRadius: 4.75, grass: '#8bd65b', stones: 4, segments: 30 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /* ------------------------------------------------------------------
       Beschriftungs-Atlas (statisch): Filmstreifen, Sterne, Plakate, Klappe
       ------------------------------------------------------------------ */
    function atlas(items, AW, AH) {
      const rects = {};
      let x = 0, y = 0, rowH = 0;
      const PAD = 4;
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
      const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.5, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      mat.name = 'kino-atlas';
      const remap = (q, key, u0 = 0, u1 = 1) => {
        const r = rects[key];
        const uv = q.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          const u = u0 + uv.getX(i) * (u1 - u0), v = uv.getY(i);
          uv.setXY(i, (r.x + u * r.w) / AW, 1 - (r.y + (1 - v) * r.h) / AH);
        }
        return q;
      };
      return { tex, mat, remap, quad(key, w) { const r = rects[key]; return remap(new T.PlaneGeometry(w, (w * r.h) / r.w), key); } };
    }
    const rrect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
    const starPath = (c, x, y, r0, r1) => { c.beginPath(); for (let i = 0; i <= 10; i++) { const a = -PI / 2 + (i / 10) * TAU, r = i % 2 ? r1 : r0; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); };
    /** kleiner Fuchskopf (Flo) – für Plakat und Filmbild */
    function foxHead(c, x, y, s) {
      c.fillStyle = '#ff8a3d';
      c.beginPath(); c.moveTo(x - s * 0.8, y - s * 0.3); c.lineTo(x - s * 0.55, y - s * 1.15); c.lineTo(x - s * 0.15, y - s * 0.6); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + s * 0.8, y - s * 0.3); c.lineTo(x + s * 0.55, y - s * 1.15); c.lineTo(x + s * 0.15, y - s * 0.6); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(x, y, s * 0.85, s * 0.7, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff4e6';
      c.beginPath(); c.moveTo(x - s * 0.6, y + s * 0.05); c.quadraticCurveTo(x, y + s * 0.95, x + s * 0.6, y + s * 0.05); c.quadraticCurveTo(x, y + s * 0.35, x - s * 0.6, y + s * 0.05); c.fill();
      c.fillStyle = '#2b2233';
      c.beginPath(); c.arc(x - s * 0.3, y - s * 0.12, s * 0.11, 0, TAU); c.arc(x + s * 0.3, y - s * 0.12, s * 0.11, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(x, y + s * 0.3, s * 0.13, s * 0.09, 0, 0, TAU); c.fill();
    }
    const A = atlas([
      // Filmstreifen-Bild (wird entlang des Streifens wiederholt)
      { key: 'film', w: 128, h: 96, draw: (c, w, h) => {
        c.fillStyle = '#2b2233'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#f8f0e3';
        for (let i = 0; i < 4; i++) { rrect(c, 8 + i * 32, 6, 16, 11, 3); c.fill(); rrect(c, 8 + i * 32, h - 17, 16, 11, 3); c.fill(); }
        const gr = c.createLinearGradient(0, 24, 0, h - 24);
        gr.addColorStop(0, '#9fdcff'); gr.addColorStop(1, '#fff3c4');
        c.fillStyle = gr; rrect(c, 8, 24, w - 16, h - 48, 4); c.fill();
        c.fillStyle = '#69db7c'; c.beginPath(); c.ellipse(w * 0.5, h - 24, w * 0.5, 14, 0, PI, TAU); c.fill();
        starPath(c, w * 0.5, h * 0.47, 15, 7); c.fillStyle = '#ffd43b'; c.fill();
      } },
      { key: 'star', w: 96, h: 96, draw: (c, w, h) => {
        c.fillStyle = 'rgba(80,20,40,0.25)'; c.beginPath(); c.arc(w / 2, h / 2 + 2, w * 0.46, 0, TAU); c.fill();
        c.fillStyle = '#ffd43b'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.44, 0, TAU); c.fill();
        starPath(c, w / 2, h / 2 + 2, w * 0.33, w * 0.15); c.fillStyle = '#fff3bf'; c.fill();
        c.strokeStyle = '#f08c00'; c.lineWidth = 3; c.stroke();
      } },
      { key: 'posterFlo', w: 120, h: 170, draw: (c, w, h) => {
        c.fillStyle = '#ffe066'; rrect(c, 0, 0, w, h, 10); c.fill();
        c.fillStyle = '#4dabf7'; rrect(c, 8, 8, w - 16, h - 16, 6); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 5; i++) { starPath(c, 20 + i * 21, 26 + (i % 2) * 10, 6, 3); c.fill(); }
        foxHead(c, w / 2, h * 0.58, 34);
      } },
      { key: 'posterRak', w: 120, h: 170, draw: (c, w, h) => {
        c.fillStyle = '#ffe066'; rrect(c, 0, 0, w, h, 10); c.fill();
        c.fillStyle = '#3b2f6b'; rrect(c, 8, 8, w - 16, h - 16, 6); c.fill();
        c.fillStyle = '#fff3bf'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(16 + ((i * 37) % 90), 20 + ((i * 53) % 130), 2.5, 0, TAU); c.fill(); }
        c.fillStyle = '#ff922b'; c.beginPath(); c.arc(w * 0.72, h * 0.3, 16, 0, TAU); c.fill();
        c.save(); c.translate(w * 0.45, h * 0.62); c.rotate(-0.5);
        c.fillStyle = '#ffffff'; rrect(c, -12, -40, 24, 62, 10); c.fill();
        c.fillStyle = '#e03140'; c.beginPath(); c.moveTo(-12, -30); c.quadraticCurveTo(0, -62, 12, -30); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-12, 10); c.lineTo(-22, 26); c.lineTo(-12, 22); c.fill(); c.beginPath(); c.moveTo(12, 10); c.lineTo(22, 26); c.lineTo(12, 22); c.fill();
        c.fillStyle = '#74c0fc'; c.beginPath(); c.arc(0, -12, 6, 0, TAU); c.fill();
        c.fillStyle = '#ffd43b'; c.beginPath(); c.moveTo(-8, 22); c.lineTo(0, 44); c.lineTo(8, 22); c.fill();
        c.restore();
      } },
    ], 512, 256);
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

    /* ------------------------------------------------------------------
       Leuchtende, bewegte Textur: „KINO“-Schild (oben) und Film (unten).
       Gezeichnet ~10× pro Sekunde, aber nur, wenn das Kino zu sehen ist.
       ------------------------------------------------------------------ */
    const CW = 384, SH = 120, FY = 128, FH = 216, CH = FY + FH;
    const cnv = document.createElement('canvas');
    cnv.width = CW; cnv.height = CH;
    const cx = cnv.getContext('2d');
    const liveTex = new T.CanvasTexture(cnv);
    liveTex.colorSpace = T.SRGBColorSpace;
    liveTex.anisotropy = 4;
    const liveMat = new T.MeshBasicMaterial({ map: liveTex, toneMapped: false });
    liveMat.name = 'kino-leuchten';
    const liveQuad = (w, h, y0, hh) => {
      const q = new T.PlaneGeometry(w, h);
      const uv = q.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), 1 - (y0 + (1 - uv.getY(i)) * hh) / CH);
      return q;
    };
    function drawSign(lit) {
      cx.clearRect(0, 0, CW, SH);
      const gr = cx.createLinearGradient(0, 0, 0, SH);
      gr.addColorStop(0, '#7d1038'); gr.addColorStop(1, '#4a0822');
      cx.fillStyle = gr; rrect(cx, 0, 0, CW, SH, 18); cx.fill();
      cx.strokeStyle = GOLD; cx.lineWidth = 5; rrect(cx, 9, 9, CW - 18, SH - 18, 12); cx.stroke();
      cx.font = `700 92px ${kit.fonts.num}`;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      const L = ['K', 'I', 'N', 'O'], xs = [0.2, 0.4, 0.6, 0.8];
      L.forEach((ch, i) => {
        const on = lit[i];
        cx.shadowColor = on ? '#ffb000' : 'transparent';
        cx.shadowBlur = on ? 22 : 0;
        cx.fillStyle = on ? '#fff6cf' : '#9c3d62';
        cx.fillText(ch, CW * xs[i], SH / 2 + 6);
      });
      cx.shadowBlur = 0;
      cx.shadowColor = 'transparent';
    }
    /** Filmbild: Flo hüpft durch eine vorbeiziehende Hügellandschaft */
    function drawFilm(t) {
      cx.save();
      cx.translate(0, FY);
      cx.beginPath(); cx.rect(0, 0, CW, FH); cx.clip();
      const w = CW, h = FH;
      const sky = cx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#74c7ff'); sky.addColorStop(0.7, '#d9f1ff'); sky.addColorStop(1, '#fff7e0');
      cx.fillStyle = sky; cx.fillRect(0, 0, w, h);
      // Sonne mit drehenden Strahlen
      cx.save(); cx.translate(w * 0.82, h * 0.2); cx.rotate(t * 0.4);
      cx.fillStyle = 'rgba(255,214,80,0.55)';
      for (let i = 0; i < 10; i++) { cx.rotate(TAU / 10); cx.beginPath(); cx.moveTo(-5, -26); cx.lineTo(0, -40); cx.lineTo(5, -26); cx.fill(); }
      cx.restore();
      cx.fillStyle = '#ffd43b'; cx.beginPath(); cx.arc(w * 0.82, h * 0.2, 22, 0, TAU); cx.fill();
      // Wolken
      cx.fillStyle = 'rgba(255,255,255,0.95)';
      for (let i = 0; i < 3; i++) {
        const x = ((i * 150 - t * 10) % (w + 120) + w + 120) % (w + 120) - 60, y = 30 + i * 18;
        cx.beginPath(); cx.arc(x, y, 14, 0, TAU); cx.arc(x + 16, y - 6, 17, 0, TAU); cx.arc(x + 34, y, 13, 0, TAU); cx.fill();
      }
      // Hügel (zwei Ebenen, Parallaxe)
      const hills = (sp, base, amp, k, col) => {
        const off = t * sp;
        cx.fillStyle = col;
        cx.beginPath(); cx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) cx.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin((x + off) * k)) - amp * 0.3 * Math.sin((x + off) * k * 2.3));
        cx.lineTo(w, h); cx.closePath(); cx.fill();
        return off;
      };
      hills(14, h * 0.66, 26, 0.018, '#8fd97a');
      const off = hills(42, h * 0.8, 18, 0.03, '#5fbf4c');
      // Bäume auf den vorderen Hügeln
      for (let i = 0; i < 4; i++) {
        const x = ((i * 130 - off) % (w + 130) + w + 130) % (w + 130) - 40;
        const y = h * 0.8 - 18 * (0.5 + 0.5 * Math.sin((x + off) * 0.03)) - 5;
        cx.fillStyle = '#8a5530'; cx.fillRect(x - 3, y - 18, 6, 20);
        cx.fillStyle = '#3f9f3c'; cx.beginPath(); cx.arc(x, y - 26, 15, 0, TAU); cx.fill();
      }
      cx.fillStyle = '#4fae3e'; cx.fillRect(0, h * 0.9, w, h * 0.1);
      // Flo hüpft
      const hop = Math.abs(Math.sin(t * 3.2));
      const fx = w * 0.4, fy = h * 0.9 - 14 - hop * 34;
      cx.fillStyle = 'rgba(0,0,0,0.15)'; cx.beginPath(); cx.ellipse(fx, h * 0.9 + 2, 26 - hop * 8, 5, 0, 0, TAU); cx.fill();
      cx.save(); cx.translate(fx, fy); cx.rotate(-0.15 + hop * 0.2);
      // Schwanz
      cx.save(); cx.translate(-26, -2); cx.rotate(-0.6 + Math.sin(t * 7) * 0.25);
      cx.fillStyle = '#ff8a3d'; cx.beginPath(); cx.ellipse(-14, 0, 18, 9, 0, 0, TAU); cx.fill();
      cx.fillStyle = '#fff4e6'; cx.beginPath(); cx.ellipse(-27, 0, 7, 6, 0, 0, TAU); cx.fill();
      cx.restore();
      // Beine
      cx.strokeStyle = '#c4581c'; cx.lineWidth = 5; cx.lineCap = 'round';
      const lg = Math.sin(t * 6.4) * 6 * (1 - hop);
      [[-12, lg], [-4, -lg], [8, lg], [15, -lg]].forEach(([x, d]) => { cx.beginPath(); cx.moveTo(x, 6); cx.lineTo(x + d, 16); cx.stroke(); });
      cx.fillStyle = '#ff8a3d'; cx.beginPath(); cx.ellipse(0, 0, 24, 13, 0, 0, TAU); cx.fill();
      cx.fillStyle = '#fff4e6'; cx.beginPath(); cx.ellipse(4, 5, 13, 6, 0, 0, TAU); cx.fill();
      foxHead(cx, 24, -14, 14);
      cx.restore();
      // Vignette (Kino-Look)
      const vg = cx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.62);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,0,20,0.35)');
      cx.fillStyle = vg; cx.fillRect(0, 0, w, h);
      cx.restore();
    }
    const lit = [true, true, true, true];
    let lastDraw = -1;
    const seen = () => { const p = W.place; return p === 'home' || (p && p.id === 'kino'); };
    function drawLive(t, force) {
      if (!force && (t - lastDraw < 0.1 || !seen())) return;
      lastDraw = t;
      const ph = (t * Math.max(calm, 0.0001)) % 7;
      for (let i = 0; i < 4; i++) lit[i] = W.reducedMotion || ph > 1.6 || ph > 0.3 + i * 0.32;
      drawSign(lit);
      drawFilm(W.reducedMotion ? 2 + t * 0.05 : t);
      liveTex.needsUpdate = true;
    }
    drawLive(0, true);
    updates.push((dt, t) => drawLive(t, false));

    /**
     * Bewegliche starre Teile je Material in EINEM Mesh (CPU, ohne Allokationen).
     * objs: [Group, Drehpunkt im Ursprung] → { group, set(i, Matrix4), apply() }
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
          if (!buckets.has(key)) buckets.set(key, { mat: m.material, cast: m.castShadow, order: m.renderOrder, geos: [], ids: [] });
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
        mesh.receiveShadow = !b.mat.transparent;
        mesh.renderOrder = b.order;
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
    const movers = []; // { obj, update(t, m4) } – Matrix in Insel-Koordinaten
    /** geraffter Vorhang (dir = +1: reicht vom Rand nach +x, -1: nach -x), Unterkante y = 0 */
    function curtain(dir, w0, wMid, w1, h, depth) {
      const sh = new T.Shape();
      sh.moveTo(0, 0); sh.lineTo(dir * w0, 0); sh.quadraticCurveTo(dir * wMid, h * 0.5, dir * w1, h); sh.lineTo(0, h); sh.closePath();
      return new T.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 });
    }
    const _q = new T.Quaternion(), _q2 = new T.Quaternion(), _e = new T.Euler(), _p = new T.Vector3(), _one = new T.Vector3(1, 1, 1);

    /* ------------------------------------------------------------------
       Zirkuszelt-Kino mit Portal, „KINO“-Schild und Lauflichtern
       ------------------------------------------------------------------ */
    const TENT = { x: -0.85, z: -1.85, ry: 0.12 };
    const R = 1.45, WH = 1.05, NS = 16;
    let bulbLocal = null;
    function tent() {
      const grp = new T.Group();
      grp.name = 'kinozelt';
      const P = new kit.Parts();
      const dA = TAU / NS;
      P.add(xf(geo.cyl(R + 0.12, R + 0.18, 0.14, NS), [0, 0.07, 0]), C.stone, { grad: [0.75, 1.0] });
      // Wand (senkrechte Streifen)
      for (let i = 0; i < NS; i++) {
        const q = new T.CylinderGeometry(R, R, WH, 2, 1, true, i * dA, dA);
        q.translate(0, 0.14 + WH / 2, 0);
        P.add(q, i % 2 ? CREAM : ACC, { grad: [0.82, 1.04] });
      }
      // Dach (leicht eingezogen) als gestreifte Lathe-Bahnen
      const prof = [[R + 0.2, 0], [R * 0.86, 0.32], [R * 0.6, 0.78], [R * 0.33, 1.28], [0.08, 1.75]].map((p) => new T.Vector2(p[0], p[1]));
      const ry = 0.14 + WH + 0.02;
      for (let i = 0; i < NS; i++) {
        const q = new T.LatheGeometry(prof, 2, i * dA, dA);
        q.translate(0, ry, 0);
        P.add(q, i % 2 ? CREAM : ACC, { grad: [0.9, 1.1] });
      }
      // Wimpel-Bogenkante unter dem Dachrand
      for (let i = 0; i < NS; i++) {
        const a = (i + 0.5) * dA;
        const sc = new T.CircleGeometry(0.2, 6, PI, PI);
        sc.translate(0, 0, 0);
        xf(sc, [Math.sin(a) * (R + 0.21), ry + 0.01, Math.cos(a) * (R + 0.21)], [0, a, 0]);
        P.add(sc, i % 2 ? ACC : CREAM, { grad: [0.95, 1.02] });
      }
      // Portal vorn
      const pz = R - 0.08;
      P.add(xf(geo.roundBox(1.5, 1.5, 0.42, 0.06), [0, 0.14 + 0.75, pz]), ACC, { gloss: true, grad: [0.8, 1.06] });
      P.add(xf(geo.box(0.86, 1.04, 0.05), [0, 0.14 + 0.52, pz + 0.2]), '#3a0d22', { grad: [1, 1] });
      [-1, 1].forEach((s) => {
        P.add(xf(geo.cyl(0.08, 0.09, 1.5, 8), [s * 0.66, 0.14 + 0.75, pz + 0.24]), GOLD, { gloss: true, grad: [0.85, 1.1] });
        // Vorhang (gerafft)
        const cg = curtain(-s, 0.3, 0.08, 0.24, 1.0, 0.06);
        xf(cg, [s * 0.43, 0.14 + 0.03, pz + 0.21]);
        P.add(cg, RED, { gloss: true, grad: [0.7, 1.05] });
        P.add(xf(new T.TorusGeometry(0.05, 0.02, 3, 6), [s * 0.36, 0.14 + 0.5, pz + 0.27]), GOLD, { gloss: true });
      });
      // Stufen
      P.add(xf(geo.roundBox(1.2, 0.12, 0.4, 0.03, 1), [0, 0.06, pz + 0.42]), C.stone, {});
      // Schildkasten über dem Portal
      P.add(xf(geo.roundBox(2.36, 0.96, 0.2, 0.06, 1), [0, 2.08, pz + 0.12]), ACC_D, { gloss: true, grad: [0.85, 1.05] });
      [-1, 1].forEach((s) => P.add(xf(geo.box(0.08, 0.5, 0.08), [s * 0.7, 1.62, pz + 0.05]), C.metal, {}));
      // Plakate links und rechts am Zelt
      P.build(grp);
      text(grp, 'posterFlo', 0.42, [-1.08, 0.86, Math.sqrt(R * R - 1.08 * 1.08) + 0.03], [0, -Math.asin(1.08 / R) * 1.0, 0]);
      text(grp, 'posterRak', 0.42, [1.08, 0.86, Math.sqrt(R * R - 1.08 * 1.08) + 0.03], [0, Math.asin(1.08 / R) * 1.0, 0]);
      // leuchtendes Schild (bewegte Textur)
      const sign = new T.Mesh(liveQuad(2.1, 2.1 * SH / CW, 0, SH), liveMat);
      sign.position.set(0, 2.08, pz + 0.225);
      sign.name = 'kino-schild';
      grp.add(sign);
      // Positionen der Lauflichter rund um das Schild
      const bw = 2.24, bh = 0.84, n = 28, per = 2 * (bw + bh);
      bulbLocal = [];
      for (let i = 0; i < n; i++) {
        let d = (i / n) * per, x, y;
        if (d < bw) { x = -bw / 2 + d; y = bh / 2; }
        else if ((d -= bw) < bh) { x = bw / 2; y = bh / 2 - d; }
        else if ((d -= bh) < bw) { x = bw / 2 - d; y = -bh / 2; }
        else { d -= bw; x = -bw / 2; y = -bh / 2 + d; }
        bulbLocal.push(new T.Vector3(x, 2.08 + y, pz + 0.24));
      }
      return grp;
    }
    const tentGrp = tent();
    base.place(tentGrp, TENT.x, TENT.z, { rotY: TENT.ry, keep: 1.75 });
    tentGrp.position.y -= 0.03;
    bake(tentGrp);
    const flag = kit.flag(ACC, { height: 0.9 });
    {
      tentGrp.updateMatrix();
      const p = new T.Vector3(0, 0.14 + WH + 0.02 + 1.66, 0).applyMatrix4(tentGrp.matrix);
      flag.position.copy(p);
      flag.rotation.y = 0.5;
      g.add(flag);
    }
    // Lauflichter (instanziert, unbeleuchtet)
    const bulbs = new T.InstancedMesh(new T.IcosahedronGeometry(0.05, 0), new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), bulbLocal.length);
    bulbs.name = 'lauflichter';
    bulbs.castShadow = false;
    bulbs.userData.dynamic = true;
    {
      const d = new T.Object3D();
      bulbLocal.forEach((p, i) => { d.position.copy(p).applyMatrix4(tentGrp.matrix); d.updateMatrix(); bulbs.setMatrixAt(i, d.matrix); bulbs.setColorAt(i, new T.Color(1, 0.9, 0.5)); });
      bulbs.instanceMatrix.needsUpdate = true;
      bulbs.computeBoundingSphere();
      g.add(bulbs);
    }
    const BON = new T.Color(1, 0.93, 0.6), BOFF = new T.Color(0.55, 0.22, 0.14);
    let bulbStep = -1;
    updates.push((dt, t) => {
      const st = W.reducedMotion ? 0 : Math.floor(t * 7);
      if (st === bulbStep) return;
      bulbStep = st;
      for (let i = 0; i < bulbs.count; i++) bulbs.setColorAt(i, W.reducedMotion || (i + st) % 3 !== 0 ? BON : BOFF);
      bulbs.instanceColor.needsUpdate = true;
    });

    /* ------------------------------------------------------------------
       Freiluft-Leinwand mit Vorhang (hinten rechts)
       ------------------------------------------------------------------ */
    const SCR = { x: 1.95, z: -1.35, ry: -0.28 };
    (function screen() {
      const grp = new T.Group();
      grp.name = 'leinwand';
      const P = new kit.Parts();
      const sw = 2.3, sh = sw * FH / CW, cy = 1.0 + sh / 2;
      P.add(xf(geo.roundBox(sw + 0.9, 0.22, 0.9, 0.06, 1), [0, 0.11, 0.05]), ACC_D, { grad: [0.75, 1.0] });
      P.add(xf(geo.roundBox(sw + 0.94, 0.06, 0.94, 0.03, 1), [0, 0.23, 0.05]), GOLD, { gloss: true });
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.16, cy + sh / 2 + 0.35, 0.16, 0.04, 1), [s * (sw / 2 + 0.28), (cy + sh / 2 + 0.35) / 2, -0.05]), ACC, { gloss: true, grad: [0.75, 1.06] }));
      P.add(xf(geo.roundBox(sw + 0.2, sh + 0.2, 0.1, 0.04, 1), [0, cy, -0.06]), '#2b2233', { grad: [0.9, 1.0] });
      // Vorhang-Querbalken mit Bogenkante
      P.add(xf(geo.roundBox(sw + 0.8, 0.3, 0.2, 0.05, 1), [0, cy + sh / 2 + 0.28, 0.02]), RED, { gloss: true, grad: [0.8, 1.05] });
      for (let i = 0; i < 8; i++) {
        const sc = new T.CircleGeometry(0.17, 6, PI, PI);
        xf(sc, [-sw / 2 - 0.25 + (i + 0.5) * ((sw + 0.5) / 8), cy + sh / 2 + 0.14, 0.125]);
        P.add(sc, i % 2 ? GOLD : RED, { gloss: true, grad: [1, 1] });
      }
      // seitliche Vorhänge (gerafft)
      [-1, 1].forEach((s) => {
        const cg = curtain(-s, 0.42, 0.1, 0.36, sh + 0.55, 0.08);
        xf(cg, [s * (sw / 2 + 0.36), 0.28, 0.0]);
        P.add(cg, RED, { gloss: true, grad: [0.7, 1.05] });
      });
      P.build(grp);
      const scr = new T.Mesh(liveQuad(sw, sh, FY, FH), liveMat);
      scr.position.set(0, cy, 0.0);
      scr.name = 'leinwand-bild';
      grp.add(scr);
      base.place(grp, SCR.x, SCR.z, { rotY: SCR.ry, keep: 1.4 });
      base.keep(SCR.x - 1.0, SCR.z + 0.2, 0.6);
      base.keep(SCR.x + 1.0, SCR.z - 0.2, 0.6);
    })();
    // Sitzsäcke vor der Leinwand
    (function beanbags() {
      const P = new kit.Parts();
      [[1.15, 0.25, '#4dabf7'], [1.95, 0.05, '#ffd43b'], [2.75, -0.05, '#b197fc']].forEach(([x, z, col], i) => {
        const b = geo.blob(0.32, { seed: 60 + i, noise: 0.1, sy: 0.62, flat: 0.3, detail: 1 });
        P.add(xf(b, [x, ground(x, z) + 0.16, z]), col, { gloss: true, grad: [0.75, 1.08] });
        base.keep(x, z, 0.35);
      });
      const m = P.build();
      m.name = 'sitzsaecke';
      g.add(m);
    })();

    /* ------------------------------------------------------------------
       Roter Teppich mit Pfosten, Kordeln und Sternen
       ------------------------------------------------------------------ */
    (function carpet() {
      const P = new kit.Parts();
      tentGrp.updateMatrix();
      const end = new T.Vector3(0, 0, R + 0.6).applyMatrix4(tentGrp.matrix);
      const a = new T.Vector2(-0.45, 4.25), b = new T.Vector2(end.x, end.z);
      const dir = b.clone().sub(a), len = dir.length();
      dir.normalize();
      const nrm = new T.Vector2(-dir.y, dir.x);
      const w = 0.8, n = 14;
      const pos = [];
      const pt = (t, o) => { const x = a.x + dir.x * len * t + nrm.x * o, z = a.y + dir.y * len * t + nrm.y * o; return [x, ground(x, z) + 0.035, z]; };
      for (let i = 0; i < n; i++) {
        const a0 = pt(i / n, -w / 2), a1 = pt(i / n, w / 2), b0 = pt((i + 1) / n, -w / 2), b1 = pt((i + 1) / n, w / 2);
        pos.push(...a0, ...b1, ...a1, ...a0, ...b0, ...b1);
      }
      const q = new T.BufferGeometry();
      q.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      q.computeVertexNormals();
      if (q.attributes.normal.getY(0) < 0) { const p = q.attributes.position.array; for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const tt = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = tt; } q.computeVertexNormals(); }
      P.add(q, RED, { grad: [1, 1], jitter: 0.03, seed: 2 });
      // goldene Borte
      [-1, 1].forEach((s) => {
        const bp = [];
        for (let i = 0; i < n; i++) { const a0 = pt(i / n, s * w / 2), a1 = pt(i / n, s * (w / 2 + 0.06)), b0 = pt((i + 1) / n, s * w / 2), b1 = pt((i + 1) / n, s * (w / 2 + 0.06)); bp.push(...a0, ...b1, ...a1, ...a0, ...b0, ...b1); }
        const bq = new T.BufferGeometry();
        bq.setAttribute('position', new T.Float32BufferAttribute(bp, 3));
        bq.computeVertexNormals();
        if (bq.attributes.normal.getY(0) < 0) { const p = bq.attributes.position.array; for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const tt = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = tt; } bq.computeVertexNormals(); }
        P.add(bq, GOLD, { grad: [1, 1] });
      });
      // Pfosten und Samtkordeln
      const posts = [0.16, 0.45, 0.74];
      [-1, 1].forEach((s) => {
        const tops = posts.map((t) => {
          const [x, y, z] = pt(t, s * (w / 2 + 0.22));
          P.add(xf(geo.cyl(0.1, 0.12, 0.05, 8), [x, y, z]), GOLD, { gloss: true });
          P.add(xf(geo.cyl(0.03, 0.035, 0.7, 6), [x, y + 0.35, z]), GOLD, { gloss: true, grad: [0.8, 1.1] });
          P.add(xf(new T.IcosahedronGeometry(0.06, 0), [x, y + 0.72, z]), GOLD, { gloss: true });
          base.keep(x, z, 0.2);
          return new T.Vector3(x, y + 0.66, z);
        });
        for (let i = 0; i < tops.length - 1; i++) {
          const m = tops[i].clone().lerp(tops[i + 1], 0.5); m.y -= 0.16;
          const tube = new T.TubeGeometry(new T.QuadraticBezierCurve3(tops[i], m, tops[i + 1]), 8, 0.022, 4, false);
          P.add(tube, '#a61e4d', { gloss: true, grad: [0.85, 1.05] });
        }
      });
      const m = P.build();
      m.name = 'roter-teppich';
      g.add(m);
      for (let t = 0; t <= 1; t += 0.12) { const [x, , z] = pt(t, 0); base.keep(x, z, 0.45); }
      // Sterne auf dem Teppich
      [0.1, 0.32, 0.54, 0.76].forEach((t) => {
        const [x, y, z] = pt(t, 0);
        textQuads.push(xf(A.quad('star', 0.42), [x, y + 0.012, z], [-PI / 2, 0, Math.atan2(dir.x, dir.y)]));
      });
    })();

    /* ------------------------------------------------------------------
       Riesen-Filmrolle (dreht sich) mit Filmstreifen auf der Wiese
       ------------------------------------------------------------------ */
    const REEL = { x: -2.85, z: 0.75, ry: 0.55 };
    (function reel() {
      const grp = new T.Group();
      grp.name = 'filmrolle';
      const P = new kit.Parts();
      const RR = 0.78, hub = 1.02;
      // Ständer
      [-1, 1].forEach((s) => {
        P.add(xf(geo.roundBox(0.1, 1.1, 0.1, 0.03, 1), [s * 0.32, 0.5, -0.2], [0, 0, s * 0.28]), C.metal, { gloss: true });
        P.add(xf(geo.roundBox(0.1, 1.1, 0.1, 0.03, 1), [s * 0.32, 0.5, 0.2], [0, 0, s * 0.28]), C.metal, { gloss: true });
      });
      P.add(xf(geo.roundBox(1.0, 0.08, 0.6, 0.03, 1), [0, 0.04, 0]), '#495057', {});
      P.add(xf(geo.cyl(0.06, 0.06, 0.6, 8), [0, hub, 0], [PI / 2, 0, 0]), C.metal, { gloss: true });
      P.build(grp);
      base.place(grp, REEL.x, REEL.z, { rotY: REEL.ry, keep: 0.9 });
      grp.updateMatrix();
      // drehende Rolle: zwei Scheiben mit Löchern, Filmwickel dazwischen
      const wheel = new kit.Parts();
      const sh = new T.Shape();
      sh.absarc(0, 0, RR, 0, TAU, false);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.3;
        const hole = new T.Path();
        hole.absarc(Math.cos(a) * RR * 0.55, Math.sin(a) * RR * 0.55, RR * 0.22, 0, TAU, true);
        sh.holes.push(hole);
      }
      [-1, 1].forEach((s) => {
        const d = new T.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false, curveSegments: 5 });
        d.translate(0, 0, s * 0.15 - 0.025);
        wheel.add(d, '#dee2e6', { gloss: true, grad: [0.85, 1.05] });
        wheel.add(xf(geo.cyl(0.16, 0.16, 0.07, 10), [0, 0, s * 0.15], [PI / 2, 0, 0]), ACC, { gloss: true });
      });
      wheel.add(xf(geo.cyl(RR * 0.42, RR * 0.42, 0.26, 16), [0, 0, 0], [PI / 2, 0, 0]), '#2b2233', { grad: [0.9, 1.05] });
      const w = wheel.build();
      const wrap = new T.Group(); wrap.add(w);
      const hubP = new T.Vector3(0, hub, 0).applyMatrix4(grp.matrix);
      const qB = new T.Quaternion().setFromRotationMatrix(grp.matrix);
      movers.push({
        obj: wrap,
        update(t, m4) {
          _e.set(0, 0, -t * 0.5 * calm);
          _q.copy(qB).multiply(_q2.setFromEuler(_e));
          m4.compose(hubP, _q, _one);
        },
      });
      // Filmstreifen: vom Wickel herab und als Schleife über die Wiese
      const pts = [
        new T.Vector3(0.0, hub - RR * 0.42, 0.0).applyMatrix4(grp.matrix),
        new T.Vector3(0.35, 0.25, 0.25).applyMatrix4(grp.matrix),
      ];
      [[-2.15, 2.2], [-1.75, 3.0], [-2.35, 3.55], [-1.65, 4.05]].forEach(([x, z]) => pts.push(new T.Vector3(x, ground(x, z), z)));
      const curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
      const L = curve.getLength(), fw = 0.36, step = fw * 128 / 96 * 0.5;
      const nSeg = Math.max(4, Math.round(L / step));
      const v = new T.Vector3(), tg = new T.Vector3(), side = new T.Vector3();
      const quads = [];
      for (let i = 0; i < nSeg; i++) {
        const corners = [];
        [i / nSeg, (i + 1) / nSeg].forEach((tt) => {
          curve.getPointAt(tt, v);
          curve.getTangentAt(tt, tg);
          side.set(-tg.z, 0, tg.x).normalize().multiplyScalar(fw / 2);
          const gy = ground(v.x, v.z) + 0.03;
          const y = Math.max(v.y, gy);
          corners.push([v.x - side.x, y, v.z - side.z], [v.x + side.x, y, v.z + side.z]);
          base.keep(v.x, v.z, 0.25);
        });
        const q = new T.BufferGeometry();
        const [l0, r0, l1, r1] = corners;
        q.setAttribute('position', new T.Float32BufferAttribute([...l0, ...r0, ...l1, ...r0, ...r1, ...l1], 3));
        q.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0], 2));
        q.computeVertexNormals();
        if (q.attributes.normal.getY(0) < 0) { q.setAttribute('position', new T.Float32BufferAttribute([...l0, ...l1, ...r0, ...r0, ...l1, ...r1], 3)); q.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1], 2)); q.computeVertexNormals(); }
        // UV: u entlang des Streifens (2 Bilder je Abschnitt → halbes Bild), v quer
        const uv = q.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 0.5 + (i % 2) * 0.5, uv.getY(k));
        A.remap(q, 'film');
        quads.push(q);
      }
      quads.forEach((q) => textQuads.push(q));
    })();

    /* ------------------------------------------------------------------
       Popcorn-Tüte mit hüpfenden Körnern (vorne rechts)
       ------------------------------------------------------------------ */
    const POP = { x: 2.75, z: 1.85 };
    const popTop = new T.Vector3();
    (function popcorn() {
      const grp = new T.Group();
      grp.name = 'popcorn';
      const P = new kit.Parts();
      const n = 12, rb = 0.4, rt = 0.56, h = 1.05, dA = TAU / n;
      for (let i = 0; i < n; i++) {
        const q = new T.CylinderGeometry(rt, rb, h, 2, 1, true, i * dA, dA);
        q.translate(0, h / 2, 0);
        P.add(q, i % 2 ? '#ffffff' : RED, { gloss: true, grad: [0.8, 1.06] });
      }
      P.add(xf(geo.cyl(rb, rb, 0.02, n), [0, 0.01, 0]), RED, {});
      P.add(xf(new T.TorusGeometry(rt, 0.045, 3, n * 2), [0, h, 0], [PI / 2, 0, 0]), '#ffffff', { gloss: true });
      // Etikett: goldener Stern auf weißem Kreis
      P.add(xf(geo.cyl(0.2, 0.2, 0.02, 12), [0, h * 0.5, (rb + rt) / 2 * 0.97 + 0.01], [PI / 2 + 0.15, 0, 0]), '#ffffff', { gloss: true });
      const st = kit.star(GOLD, 0.34);
      st.position.set(0, h * 0.5, (rb + rt) / 2 * 0.97 + 0.045);
      st.rotation.x = 0.15;
      grp.add(st);
      // Füllung (verdeckt das offene Innere) und Popcorn-Haufen
      P.add(xf(geo.cyl(rt * 0.98, rt * 0.98, 0.04, n), [0, h - 0.03, 0]), '#ffe9b0', { grad: [1, 1] });
      const r = kit.rng(4);
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU, rr = Math.sqrt(r()) * rt * 0.8;
        const y = h + 0.04 + (1 - rr / rt) * 0.26 + r() * 0.05;
        P.add(xf(geo.blob(0.12 + r() * 0.05, { seed: 90 + i, noise: 0.28, freq: 2.2, detail: i < 6 ? 1 : 0 }), [Math.cos(a) * rr, y, Math.sin(a) * rr]), i % 4 === 0 ? '#ffd98a' : '#fff3d1', { grad: [0.92, 1.06] });
      }
      P.build(grp);
      base.place(grp, POP.x, POP.z, { rotY: -0.3, keep: 0.75 });
      popTop.set(0, h + 0.2, 0).applyMatrix4(grp.matrix);
      // ein paar Körner im Gras
      const Q = new kit.Parts();
      [[0.75, 0.3], [-0.6, 0.55], [0.4, 0.75], [0.9, -0.2]].forEach(([dx, dz], i) => {
        const x = POP.x + dx, z = POP.z + dz;
        Q.add(xf(geo.blob(0.08, { seed: 120 + i, noise: 0.3, detail: 0 }), [x, ground(x, z) + 0.05, z]), '#fff3d1', { grad: [0.92, 1.06] });
      });
      const qm = Q.build(); qm.name = 'koerner'; g.add(qm);
    })();
    // hüpfende Körner (instanziert)
    const NK = 6;
    const kernels = new T.InstancedMesh(kit.paint(geo.blob(0.08, { seed: 140, noise: 0.3, detail: 0 }), '#fff3d1', { grad: [0.92, 1.06] }), kit.mats.matte, NK);
    kernels.name = 'popcorn-koerner';
    kernels.userData.dynamic = true;
    kernels.frustumCulled = false;
    kernels.castShadow = false;
    g.add(kernels);
    const kd = new T.Object3D();
    const kr = kit.rng(12);
    const kInfo = Array.from({ length: NK }, () => ({ a: kr() * TAU, sp: 0.3 + kr() * 0.25, ph: kr(), vx: 0.2 + kr() * 0.35, vy: 1.4 + kr() * 0.6 }));
    function popKernels(t) {
      for (let i = 0; i < NK; i++) {
        const k = kInfo[i];
        const c = (t * k.sp + k.ph) % 1;
        const tt = c * 1.1; // Flugzeit
        const y = k.vy * tt - 2.6 * tt * tt;
        const on = !W.reducedMotion && y > -0.05;
        kd.position.set(popTop.x + Math.cos(k.a) * k.vx * tt, popTop.y + Math.max(0, y), popTop.z + Math.sin(k.a) * k.vx * tt);
        kd.rotation.set(t * 3 + i, t * 2, 0);
        kd.scale.setScalar(on ? 1 : 0.0001);
        kd.updateMatrix();
        kernels.setMatrixAt(i, kd.matrix);
      }
      kernels.instanceMatrix.needsUpdate = true;
    }

    /* ------------------------------------------------------------------
       Filmklappe (klappt), Scheinwerfer mit Lichtkegeln
       ------------------------------------------------------------------ */
    (function clapper() {
      const grp = new T.Group();
      grp.name = 'filmklappe';
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.62, 0.46, 0.06, 0.03, 1), [0, 0.25, 0]), '#2b2233', { gloss: true });
      P.add(xf(geo.box(0.5, 0.012, 0.065), [0, 0.2, 0]), '#ffffff', {});
      P.add(xf(geo.box(0.012, 0.18, 0.065), [0.0, 0.11, 0]), '#ffffff', {});
      P.add(xf(geo.roundBox(0.62, 0.09, 0.07, 0.02, 1), [0, 0.525, 0]), '#2b2233', { gloss: true });
      for (let i = 0; i < 3; i++) P.add(xf(geo.box(0.08, 0.092, 0.072), [-0.2 + i * 0.2, 0.525, 0], [0, 0, 0.5]), '#ffffff', {});
      P.build(grp);
      base.place(grp, -1.9, 1.65, { rotY: 0.35, keep: 0.4 });
      grp.rotation.x = -0.18;
      grp.updateMatrix();
      const arm = new kit.Parts();
      arm.add(xf(geo.roundBox(0.62, 0.09, 0.07, 0.02, 1), [0.31, 0.045, 0]), '#2b2233', { gloss: true });
      for (let i = 0; i < 3; i++) arm.add(xf(geo.box(0.08, 0.092, 0.072), [0.11 + i * 0.2, 0.045, 0], [0, 0, -0.5]), '#ffffff', { gloss: true });
      const armG = arm.build();
      const hinge = new T.Vector3(-0.31, 0.57, 0).applyMatrix4(grp.matrix);
      const qB = new T.Quaternion().setFromRotationMatrix(grp.matrix);
      movers.push({
        obj: armG,
        update(t, m4) {
          const c = (t * 0.45) % 1;
          const open = c < 0.7 ? W.ease.outCubic(Math.min(1, c / 0.3)) : Math.max(0, 1 - (c - 0.7) / 0.06);
          _e.set(0, 0, open * 0.55 * Math.max(calm, 0.3));
          _q.copy(qB).multiply(_q2.setFromEuler(_e));
          m4.compose(hinge, _q, _one);
        },
      });
    })();
    // Scheinwerfer: Gestell statisch, Kopf + Lichtkegel schwenken
    const beamMat = new T.MeshBasicMaterial({ color: '#fff1c4', vertexColors: true, transparent: true, opacity: 0.08, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false, fog: false });
    beamMat.name = 'kino-lichtkegel';
    [[-2.55, -0.45, 0.0], [0.55, 0.55, 2.2]].forEach(([x, z, ph], i) => {
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.18, 0.22, 0.12, 8), [0, 0.06, 0]), '#495057', { gloss: true });
      P.add(xf(geo.box(0.06, 0.4, 0.06), [0, 0.3, 0]), C.metal, {});
      P.add(xf(new T.TorusGeometry(0.17, 0.03, 3, 8, PI), [0, 0.42, 0], [0, PI / 2, 0]), C.metal, {});
      const st = P.build();
      st.name = 'scheinwerfer';
      base.place(st, x, z, { keep: 0.3 });
      const head = new T.Group();
      const H = new kit.Parts();
      H.add(xf(geo.cyl(0.13, 0.16, 0.34, 10), [0, 0.08, 0]), '#343a40', { gloss: true, grad: [0.8, 1.1] });
      H.add(xf(geo.cyl(0.14, 0.14, 0.02, 10), [0, 0.255, 0]), '#fff3bf', { gloss: true, grad: [1, 1] });
      H.build(head);
      const cone = new T.CylinderGeometry(0.75, 0.13, 3.6, 9, 5, true);
      cone.translate(0, 0.26 + 1.8, 0);
      // zur Spitze hin weich auslaufen (additiv: Schwarz = unsichtbar)
      const cp = cone.attributes.position, cc = new Float32Array(cp.count * 3);
      for (let k = 0; k < cp.count; k++) { const f = Math.pow(1 - Math.min(1, (cp.getY(k) - 0.26) / 3.6), 2.4); cc[k * 3] = cc[k * 3 + 1] = cc[k * 3 + 2] = f; }
      cone.setAttribute('color', new T.BufferAttribute(cc, 3));
      const beam = new T.Mesh(cone, beamMat);
      beam.castShadow = false;
      beam.renderOrder = 5;
      head.add(beam);
      const piv = new T.Vector3(x, ground(x, z) + 0.46, z);
      movers.push({
        obj: head,
        update(t, m4) {
          _e.set(-0.45 + Math.sin(t * 0.37 * calm + ph) * 0.12, Math.sin(t * 0.23 * calm + ph) * 0.9 + (i ? -0.3 : 0.3), 0, 'YXZ');
          _q.setFromEuler(_e);
          m4.compose(piv, _q, _one);
        },
      });
    });
    updates.push(() => { beamMat.opacity = 0.08 + 0.45 * ((W.env && W.env.nightness) || 0); });

    /* ------------------------------------------------------------------
       Bewegliches zusammenführen, Pflanzen, Licht
       ------------------------------------------------------------------ */
    const batch = rigidBatch(movers.map((m) => m.obj), new T.Sphere(new T.Vector3(0, 2, 0), 8));
    g.add(batch.group);
    const m4 = new T.Matrix4();
    function moveAll(t) {
      for (let i = 0; i < movers.length; i++) { movers[i].update(t, m4); batch.set(i, m4); }
      batch.apply();
      popKernels(t);
    }
    moveAll(0);
    updates.push((dt, t) => moveAll(t));

    base.place(kit.tree({ type: 'palm', seed: 4191, scale: 1.05, lean: 0.2 }), 3.6, -0.75, { keep: 0.6 });
    base.place(kit.tree({ type: 'round', seed: 4192, scale: 1.0 }), -3.05, -1.65, { keep: 0.8 });
    base.place(kit.tree({ type: 'pine', seed: 4193, scale: 0.9 }), 0.95, -3.45, { keep: 0.5 });
    kit.grassTufts(base, 30, 419);
    kit.flowers(base, 4, ['#ffd23f', '#ffffff', '#ff7aa8', kit.shade(ACC, 1.5)], 419);

    // Kontaktschatten
    [[TENT.x, TENT.z + 0.1, 1.9], [SCR.x, SCR.z, 1.5], [POP.x, POP.z, 0.7], [REEL.x, REEL.z, 0.75]].forEach(([x, z, r]) => {
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
    if (window.__w3dTris) window.__w3dTris('kino', g);
    kit.merge(g);
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.6, -1.6),
        focus: new T.Vector3(0, 1.5, -0.3),
      },
    };
  });
})();
