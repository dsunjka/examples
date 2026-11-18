/* ==========================================================================
   js/world3d/islands/welt.js – Entdecker-Welt (grün)

   Wahrzeichen: ein großer Globus auf grünem Ständer, der sich langsam
   dreht, und ein kleiner Bauernhof mit roter Scheune (Uhr im Giebel) und
   Silo. Dazu ein Jahreszeiten-Weg aus vier Bäumen (Frühling, Sommer, Herbst,
   Winter mit Schneemann), eine Straße mit Zebrastreifen und Ampel, an der ein
   grünes Spielzeugauto brav bei Rot hält, eine Schafweide, ein Karottenbeet
   mit hoppelndem Hasen, ein Igel im Herbstlaub und ein Küken.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('island', 'welt', (W, area) => {
    const T = W.THREE, kit = W.kit, C = kit.colors, geo = kit.geo, xf = kit.xf;
    const PI = Math.PI, TAU = PI * 2;
    const ACC = (area && area.color) || '#3dbe6b';
    const calm = W.reducedMotion ? 0.12 : 1;
    const updates = [];

    const base = kit.islandBase({ seed: 71, radius: 6.1, grassRadius: 4.8, grass: '#86d65c', stones: 4, segments: 40 });
    const g = base.group;
    const ground = (x, z) => base.surfaceAt(x, z);

    /** Fläche, die dem Boden folgt: Dreiecke mit Normalen nach oben. */
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
       Globus (hinten links)
       ------------------------------------------------------------------ */
    const globeTex = kit.canvasTexture(1024, 512, (c, w, h) => {
      const sea = c.createLinearGradient(0, 0, 0, h);
      sea.addColorStop(0, '#5cc4ff'); sea.addColorStop(0.5, '#3aa2f0'); sea.addColorStop(1, '#5cc4ff');
      c.fillStyle = sea; c.fillRect(0, 0, w, h);
      // feine Wellenringe im Meer
      c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 3;
      for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((i * 173) % w, (i * 97) % h, 30 + (i % 3) * 12, 0, TAU); c.stroke(); }
      const X = (lon) => ((lon + 180) / 360) * w, Y = (lat) => ((90 - lat) / 180) * h;
      const blob = (pts, fill) => {
        const p = pts.map(([lo, la]) => [X(lo), Y(la)]);
        c.beginPath();
        const m0 = [(p[0][0] + p[p.length - 1][0]) / 2, (p[0][1] + p[p.length - 1][1]) / 2];
        c.moveTo(m0[0], m0[1]);
        for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
        c.closePath();
        c.fillStyle = fill; c.fill();
        c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
      };
      const land = '#5cc04a';
      blob([[-165, 66], [-140, 72], [-95, 74], [-72, 64], [-56, 50], [-78, 32], [-82, 26], [-97, 18], [-106, 22], [-118, 33], [-126, 48], [-150, 58]], land); // Nordamerika
      blob([[-80, 10], [-60, 9], [-34, -6], [-40, -23], [-56, -36], [-70, -54], [-76, -40], [-81, -6]], land); // Südamerika
      blob([[-17, 15], [-8, 34], [10, 37], [32, 31], [43, 12], [52, 11], [40, -15], [30, -34], [18, -34], [10, -6], [-6, 5]], '#8fd14f'); // Afrika
      blob([[-10, 37], [-9, 44], [-2, 50], [8, 56], [22, 70], [40, 68], [60, 72], [92, 77], [132, 73], [172, 67], [146, 55], [140, 40], [122, 30], [108, 14], [100, 4], [90, 22], [78, 9], [66, 24], [52, 26], [44, 40], [28, 41], [14, 38]], land); // Eurasien
      blob([[113, -22], [130, -12], [142, -11], [153, -28], [146, -38], [131, -32], [115, -34]], '#f2c46b'); // Australien
      blob([[-55, 60], [-44, 60], [-22, 70], [-24, 82], [-58, 80]], '#ffffff'); // Grönland
      // Wüsten
      c.fillStyle = 'rgba(242,196,107,0.85)';
      c.beginPath(); c.ellipse(X(12), Y(22), 70, 26, 0, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(X(-105), Y(37), 28, 16, 0.3, 0, TAU); c.fill();
      // Polkappen
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, w, Y(80));
      c.beginPath(); c.moveTo(0, h);
      for (let i = 0; i <= 24; i++) c.lineTo((i / 24) * w, Y(-68 - (i % 2) * 4));
      c.lineTo(w, h); c.closePath(); c.fill();
      // Äquator (gestrichelt)
      c.setLineDash([16, 12]); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
      c.setLineDash([]);
    });
    function globe() {
      const grp = new T.Group();
      grp.name = 'globus';
      const P = new kit.Parts();
      const R = 1.18, CY = 2.32;
      // Ständer
      P.add(xf(geo.cyl(0.78, 0.86, 0.22, 12), [0, 0.11, 0]), kit.shade(ACC, 0.82), { gloss: true, grad: [0.75, 1.05] });
      P.add(xf(geo.cyl(0.6, 0.72, 0.14, 12), [0, 0.29, 0]), ACC, { gloss: true, grad: [0.8, 1.08] });
      P.add(xf(geo.cyl(0.1, 0.16, 0.7, 10), [0, 0.68, 0]), C.gold, { gloss: true, smooth: true, grad: [0.8, 1.1] });
      P.add(xf(new T.SphereGeometry(0.17, 8, 5), [0, 1.02, 0]), C.gold, { gloss: true, smooth: true });
      // Meridian-Halbring (geneigt wie die Erdachse)
      const tilt = 0.41;
      const ring = new T.TorusGeometry(R + 0.13, 0.055, 4, 20, PI * 1.12);
      ring.rotateZ(-PI * 0.06 - PI / 2 + PI); // offen zur Kamera-abgewandten Seite unten
      P.add(xf(ring, [0, CY, 0], [0, 0, tilt]), C.gold, { gloss: true, smooth: true, grad: [0.85, 1.1] });
      // Achsenkappen
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.08, 7, 5), [Math.sin(-tilt) * (R + 0.13) * s, CY + Math.cos(tilt) * (R + 0.13) * s, 0]), C.gold, { gloss: true, smooth: true }));
      // Verbindung Ständer → Ring unten
      P.add(xf(geo.cyl(0.05, 0.05, 0.25, 6), [-Math.sin(-tilt) * (R + 0.13) * 0.92, CY - Math.cos(tilt) * (R + 0.13) * 0.92 - 0.02, 0], [0, 0, tilt]), C.gold, { gloss: true, smooth: true });
      P.build(grp);
      const axis = new T.Group();
      axis.position.set(0, CY, 0);
      axis.rotation.z = tilt;
      axis.userData.dynamic = true;
      const ball = new T.Mesh(new T.SphereGeometry(R, 20, 12), new T.MeshStandardMaterial({ map: globeTex, roughness: 0.42, metalness: 0, envMapIntensity: 0.8 }));
      ball.castShadow = true;
      ball.receiveShadow = true;
      ball.rotation.y = -1.2;
      axis.add(ball);
      grp.add(axis);
      updates.push((dt) => { ball.rotation.y += dt * 0.22 * calm; });
      return grp;
    }
    base.place(globe(), -0.7, -2.25, { rotY: 0.15, keep: 1.25 });

    /* ------------------------------------------------------------------
       Bauernhof: Scheune mit Uhr, Silo, Karottenbeet (hinten rechts)
       ------------------------------------------------------------------ */
    const clockTex = kit.canvasTexture(256, 256, (c, w) => {
      const r = w / 2;
      c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(r, r, r - 4, 0, TAU); c.fill();
      c.lineWidth = 14; c.strokeStyle = '#3b4a5a'; c.beginPath(); c.arc(r, r, r - 12, 0, TAU); c.stroke();
      c.fillStyle = '#3b4a5a';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; const d = i % 3 ? 7 : 12; c.beginPath(); c.arc(r + Math.sin(a) * (r - 38), r - Math.cos(a) * (r - 38), d, 0, TAU); c.fill(); }
      c.lineCap = 'round';
      c.lineWidth = 16; c.beginPath(); c.moveTo(r, r); c.lineTo(r + Math.sin(TAU * 10 / 12) * 58, r - Math.cos(TAU * 10 / 12) * 58); c.stroke();
      c.lineWidth = 11; c.strokeStyle = '#e2554a'; c.beginPath(); c.moveTo(r, r); c.lineTo(r, r - 90); c.stroke();
      c.fillStyle = '#e2554a'; c.beginPath(); c.arc(r, r, 13, 0, TAU); c.fill();
    });
    function barn() {
      const grp = new T.Group();
      grp.name = 'scheune';
      const P = new kit.Parts();
      const red = '#e2554a', trim = '#fff6ea', roof = '#6b5a52';
      const Wd = 1.7, D = 1.5, WH = 1.2, Y0 = 0.14;
      P.add(xf(geo.roundBox(Wd + 0.2, Y0 + 0.02, D + 0.2, 0.04, 1), [0, Y0 / 2, 0]), C.stone, { grad: [0.75, 1] });
      P.add(xf(geo.roundBox(Wd, WH, D, 0.05), [0, Y0 + WH / 2, 0]), red, { grad: [0.78, 1.04] });
      // Mansarddach: Giebel (Fünfeck) + vier Dachflächen
      const eave = [Wd / 2, Y0 + WH], knee = [Wd * 0.34, Y0 + WH + 0.62], ridge = [0, Y0 + WH + 0.95];
      const gable = new T.Shape();
      gable.moveTo(-eave[0], eave[1]); gable.lineTo(eave[0], eave[1]); gable.lineTo(knee[0], knee[1]); gable.lineTo(0, ridge[1]); gable.lineTo(-knee[0], knee[1]); gable.closePath();
      P.add(new T.ExtrudeGeometry(gable, { depth: D - 0.04, bevelEnabled: false }).translate(0, -0.01, -D / 2 + 0.02), red, { grad: [0.92, 1.04] });
      const slab = (a, b) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const L = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const nx = -Math.sin(ang), ny = Math.cos(ang);
        const q = geo.roundBox(L + 0.16, 0.12, D + 0.3, 0.04, 1);
        return xf(q, [(a[0] + b[0]) / 2 + nx * 0.06, (a[1] + b[1]) / 2 + ny * 0.06, 0], [0, 0, ang]);
      };
      P.add(slab([-eave[0] - 0.08, eave[1] - 0.06], [-knee[0], knee[1]]), roof, { grad: [0.8, 1.06] });
      P.add(slab([-knee[0], knee[1]], [0.02, ridge[1]]), roof, { grad: [0.85, 1.08] });
      P.add(slab([knee[0], knee[1]], [eave[0] + 0.08, eave[1] - 0.06]), roof, { grad: [0.8, 1.06] });
      P.add(slab([-0.02, ridge[1]], [knee[0], knee[1]]), roof, { grad: [0.85, 1.08] });
      // Tor mit weißem Kreuz
      const fz = D / 2 + 0.01;
      P.add(xf(geo.roundBox(0.86, 0.88, 0.06, 0.03, 1), [0, Y0 + 0.44, fz]), '#c8433b', { grad: [0.85, 1.04] });
      P.add(xf(geo.roundBox(0.98, 0.08, 0.1, 0.02, 1), [0, Y0 + 0.9, fz + 0.02]), trim, {});
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(0.08, 0.92, 0.1, 0.02, 1), [s * 0.47, Y0 + 0.46, fz + 0.02]), trim, {}));
      P.add(xf(geo.box(0.06, 0.04, 0.03), [0, Y0 + 0.44, fz + 0.04]), trim, {});
      [-1, 1].forEach((s) => P.add(xf(geo.roundBox(1.12, 0.07, 0.04, 0.015, 1), [0, Y0 + 0.44, fz + 0.04], [0, 0, s * 0.82]), trim, {}));
      // Eckleisten
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => P.add(xf(geo.box(0.08, WH, 0.08), [sx * (Wd / 2 - 0.01), Y0 + WH / 2, sz * (D / 2 - 0.01)]), trim, {})));
      P.add(xf(geo.roundBox(Wd + 0.04, 0.07, 0.08, 0.02, 1), [0, Y0 + WH + 0.02, fz]), trim, {});
      // Uhr-Rahmen im Giebel
      P.add(xf(geo.cyl(0.29, 0.29, 0.06, 16).rotateX(PI / 2), [0, Y0 + WH + 0.44, fz]), trim, {});
      P.build(grp);
      const face = new T.Mesh(new T.CircleGeometry(0.24, 20), new T.MeshStandardMaterial({ map: clockTex, roughness: 0.6 }));
      face.position.set(0, Y0 + WH + 0.44, fz + 0.035);
      face.receiveShadow = true;
      grp.add(face);
      return grp;
    }
    base.place(barn(), 2.05, -2.15, { rotY: -0.42, keep: 1.3 });
    function silo() {
      const P = new kit.Parts();
      P.add(xf(geo.cyl(0.5, 0.52, 2.1, 12), [0, 1.05, 0]), '#e9eef2', { grad: [0.78, 1.04] });
      [0.45, 1.05, 1.65].forEach((y) => P.add(xf(geo.cyl(0.525, 0.525, 0.07, 12), [0, y, 0]), '#aab6c2', { gloss: true }));
      const dome = new T.SphereGeometry(0.52, 12, 4, 0, TAU, 0, PI / 2);
      P.add(xf(dome, [0, 2.1, 0]), ACC, { gloss: true, grad: [0.85, 1.1] });
      P.add(xf(new T.ConeGeometry(0.07, 0.18, 6), [0, 2.68, 0]), C.gold, { gloss: true });
      const m = P.build();
      m.name = 'silo';
      return m;
    }
    base.place(silo(), 3.55, -1.05, { keep: 0.6 });
    // Heuballen
    (function hay() {
      const P = new kit.Parts();
      [[0, 0, 0], [0.62, 0.05, 0.4]].forEach(([x, z, ry], i) => {
        P.add(xf(geo.cyl(0.3, 0.3, 0.5, 8).rotateZ(PI / 2), [x, 0.3, z], [0, ry, 0]), '#f0cd6a', { grad: [0.75, 1.08], jitter: 0.05, seed: i });
        P.add(xf(geo.cyl(0.305, 0.305, 0.05, 8).rotateZ(PI / 2), [x + Math.cos(ry) * 0.12, 0.3, z - Math.sin(ry) * 0.12], [0, ry, 0]), '#d9a640', {});
      });
      const m = P.build();
      m.name = 'heu';
      base.place(m, 0.95, -2.55, { rotY: 0.3, keep: 0.6 });
    })();
    // Karottenbeet
    (function carrots() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(1.25, 0.12, 0.8, 0.05, 1), [0, 0.03, 0]), '#8a5a3c', { grad: [0.75, 1] });
      for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
        const x = -0.43 + i * 0.29, z = -0.18 + r * 0.36;
        P.add(xf(new T.ConeGeometry(0.06, 0.12, 6), [x, 0.12, z], [PI, 0, 0]), '#ff8a2e', { gloss: true });
        for (let k = 0; k < 2; k++) P.add(xf(new T.ConeGeometry(0.035, 0.24, 3), [x + (k - 0.5) * 0.04, 0.28, z], [0, k * 1.3, (k - 0.5) * 0.5]), k ? '#3fae48' : '#5cc04a', { grad: [0.7, 1.1] });
      }
      const m = P.build();
      m.name = 'karotten';
      base.place(m, 0.95, -0.75, { rotY: -0.25, keep: 0.75 });
    })();

    /* ------------------------------------------------------------------
       Tiere (Low-Poly)
       ------------------------------------------------------------------ */
    function bunny() {
      const P = new kit.Parts();
      const fur = '#f6f2ec';
      P.add(geo.blob(0.24, { seed: 3, noise: 0.06, sy: 0.85, sz: 1.15, detail: 1 }).translate(0, 0.22, 0), fur, { gloss: true, grad: [0.72, 1.06] });
      P.add(xf(geo.blob(0.17, { seed: 4, noise: 0.05, detail: 1 }), [0, 0.43, 0.2]), fur, { gloss: true, grad: [0.8, 1.06] });
      [-1, 1].forEach((s) => {
        P.add(xf(new T.SphereGeometry(0.055, 5, 4), [s * 0.06, 0.72, 0.17], [s * -0.1, 0, s * -0.22], [1, 3.4, 0.6]), fur, { gloss: true, grad: [0.85, 1.05] });
        P.add(xf(new T.SphereGeometry(0.032, 4, 3), [s * 0.06, 0.72, 0.193], [s * -0.1, 0, s * -0.22], [1, 3.2, 0.4]), '#ffb3c4', { grad: [1, 1] });
        P.add(xf(new T.SphereGeometry(0.028, 5, 3), [s * 0.075, 0.47, 0.35]), '#2b2f38', { gloss: true });
      });
      P.add(xf(new T.SphereGeometry(0.03, 4, 3), [0, 0.42, 0.37]), '#ff8fa8', { gloss: true });
      P.add(xf(new T.IcosahedronGeometry(0.08, 0), [0, 0.26, -0.27]), '#ffffff', {});
      const grp = P.build();
      grp.name = 'hase';
      return grp;
    }
    (function hoppingBunny() {
      const b = bunny();
      const hold = new T.Group();
      hold.add(b);
      hold.userData.dynamic = true;
      g.add(hold);
      const cx = 0.1, cz = -0.05, R = 0.42;
      let ang = 0.6, prevHop = 0;
      const set = (t) => {
        const ph = t * 1.25 * Math.max(calm, 0.2);
        const hop = ph - Math.floor(ph);
        if (Math.floor(ph) !== prevHop) prevHop = Math.floor(ph);
        const air = hop < 0.42 ? Math.sin((hop / 0.42) * PI) : 0;
        const a = ang + (Math.floor(ph) + Math.min(1, hop / 0.42)) * 0.42;
        const x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R;
        hold.position.set(x, ground(x, z) + air * 0.24 * Math.max(calm, 0.3), z);
        hold.rotation.y = -a; // Blick in Laufrichtung
        b.rotation.x = -air * 0.25;
      };
      set(0);
      updates.push((dt, t) => set(t));
    })();
    function sheep(seed) {
      const P = new kit.Parts();
      P.add(geo.blob(0.33, { seed, noise: 0.18, freq: 2.6, sx: 1.25, sy: 0.85, detail: 1 }).translate(0, 0.42, 0), '#fbf8f2', { grad: [0.72, 1.06], jitter: 0.04 });
      for (let i = 0; i < 4; i++) P.add(xf(new T.CylinderGeometry(0.04, 0.035, 0.26, 5, 1, true), [(i < 2 ? -1 : 1) * 0.2, 0.13, (i % 2 ? -1 : 1) * 0.12]), '#3d3f4a', { grad: [0.8, 1] }); // Enden in Wolle und Boden
      P.add(xf(geo.blob(0.13, { seed: seed + 1, noise: 0.05, sx: 1.35, detail: 0 }), [0.42, 0.5, 0], [0, 0, -0.3]), '#3d3f4a', { grad: [0.85, 1.1] });
      P.add(xf(geo.blob(0.12, { seed: seed + 2, noise: 0.2, detail: 0 }), [0.36, 0.64, 0]), '#fbf8f2', {});
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.04, 5, 4), [0.38, 0.55, s * 0.14], [0, 0, 0], [1.6, 0.6, 1]), '#3d3f4a', {}));
      const m = P.build();
      m.name = 'schaf';
      return m;
    }
    function hedgehog() {
      const P = new kit.Parts();
      const body = new T.SphereGeometry(0.28, 10, 6, 0, TAU, 0, PI * 0.55).scale(1.25, 0.95, 1);
      P.add(body, '#8a6142', { grad: [0.7, 1.05] });
      const rr = kit.rng(5);
      for (let i = 0; i < 16; i++) {
        const a = rr() * TAU, el = 0.25 + rr() * 1.05;
        const d = new T.Vector3(Math.cos(a) * Math.cos(el) * 1.25, Math.sin(el) * 0.95, Math.sin(a) * Math.cos(el));
        if (d.x > 0.85) continue; // Gesicht frei
        d.normalize();
        const cone = new T.ConeGeometry(0.06, 0.2, 4, 1, true).translate(0, 0.1, 0); // Fuß steckt im Körper
        cone.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d));
        cone.translate(d.x * 0.3, d.y * 0.24, d.z * 0.26);
        P.add(cone, '#6e4a32', { grad: [0.8, 1.1] });
      }
      P.add(xf(new T.ConeGeometry(0.11, 0.24, 7).rotateZ(-PI / 2), [0.38, 0.1, 0]), '#e6c39a', { grad: [0.85, 1.05] });
      P.add(xf(new T.SphereGeometry(0.035, 5, 4), [0.5, 0.1, 0]), '#2b2f38', { gloss: true });
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.022, 5, 4), [0.36, 0.17, s * 0.07]), '#2b2f38', { gloss: true }));
      const m = P.build();
      m.name = 'igel';
      return m;
    }
    function chick() {
      const P = new kit.Parts();
      P.add(xf(new T.IcosahedronGeometry(0.15, 1), [0, 0.16, 0], null, [1.1, 0.95, 1]), '#ffd84a', { gloss: true, grad: [0.8, 1.08] });
      P.add(xf(new T.IcosahedronGeometry(0.1, 1), [0.1, 0.33, 0]), '#ffde5c', { gloss: true, grad: [0.85, 1.08] });
      P.add(xf(new T.ConeGeometry(0.035, 0.08, 4).rotateZ(-PI / 2), [0.21, 0.32, 0]), '#ff9a2e', { gloss: true });
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.018, 5, 4), [0.17, 0.36, s * 0.05]), '#2b2f38', {}));
      const m = P.build();
      m.name = 'kueken';
      return m;
    }

    /* Schafweide (rechts) */
    (function pasture() {
      const cx = 3.25, cz = 0.75, R = 0.95;
      const pts = [];
      for (let i = 0; i <= 5; i++) { const a = PI * 0.62 + (i / 5) * PI * 1.25; pts.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R * 0.85]); }
      g.add(kit.fence(pts, { base, style: 'rail', color: '#f4efe6', height: 0.55 }));
      base.keep(cx, cz, R);
      base.place(sheep(7), cx + 0.05, cz - 0.25, { rotY: 2.4, keep: 0 });
      base.place(sheep(9), cx + 0.35, cz + 0.35, { rotY: -0.6, keep: 0 });
    })();
    base.place(chick(), 1.25, -1.45, { rotY: -1.0, keep: 0.25 });
    base.place(chick(), 1.55, -1.3, { rotY: -2.0, keep: 0.25 }).scale.setScalar(0.8);

    /* ------------------------------------------------------------------
       Jahreszeiten-Weg (links): Frühling, Sommer, Herbst, Winter
       ------------------------------------------------------------------ */
    base.place(kit.tree({ type: 'blossom', seed: 711, scale: 0.92 }), -3.05, -2.75, { keep: 0.8 });
    base.place(kit.tree({ type: 'fruit', seed: 712, scale: 0.9, color: '#4fbf4a' }), -3.85, -1.05, { keep: 0.8 });
    base.place(kit.tree({ type: 'round', seed: 713, scale: 0.9, color: '#ff9a3d' }), -3.7, 0.65, { keep: 0.8 });
    base.place(kit.tree({ type: 'round', seed: 714, scale: 0.85, color: '#eef6ff', trunk: '#8f6a52' }), -2.9, 2.3, { keep: 0.8 });
    // Herbstlaub und Schnee am Boden
    (function groundDeco() {
      const P = new kit.Parts();
      const r = kit.rng(77);
      for (let i = 0; i < 12; i++) {
        const a = r() * TAU, d = 0.35 + r() * 0.75;
        const x = -3.6 + Math.cos(a) * d, z = 0.75 + Math.sin(a) * d;
        P.add(xf(new T.CircleGeometry(0.075, 4).rotateX(-PI / 2), [x, ground(x, z) + 0.03, z], [0, r() * TAU, 0], [1, 1, 1.6]), r.pick(['#ff9a3d', '#ff6b3d', '#ffc23d', '#e8743a']), { grad: [1, 1] });
      }
      const sm = groundMesh();
      const sx = -2.65, sz = 2.55, N = 14;
      const rad = (a) => 1.0 + 0.15 * Math.sin(a * 3 + 1) + 0.08 * Math.sin(a * 5);
      const sp = (a, k) => { const x = sx + Math.cos(a) * rad(a) * k, z = sz + Math.sin(a) * rad(a) * k * 0.8; return [x, ground(x, z) + 0.035, z]; };
      const c0 = [sx, ground(sx, sz) + 0.035, sz];
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * TAU, a1 = ((i + 1) / N) * TAU;
        sm.tri(c0, sp(a0, 0.5), sp(a1, 0.5));
        sm.quad(sp(a0, 0.5), sp(a0, 1), sp(a1, 1), sp(a1, 0.5));
      }
      P.add(sm.geo(), '#f6fbff', { grad: [1, 1], jitter: 0.02 });
      const m = P.build(null, { castShadow: false });
      m.name = 'laub-schnee';
      g.add(m);
    })();
    function snowman() {
      const P = new kit.Parts();
      const snow = '#fbfdff';
      P.add(xf(new T.IcosahedronGeometry(0.34, 1), [0, 0.3, 0]), snow, { grad: [0.78, 1.04] });
      P.add(xf(new T.IcosahedronGeometry(0.25, 1), [0, 0.76, 0]), snow, { grad: [0.82, 1.04] });
      P.add(xf(new T.IcosahedronGeometry(0.18, 1), [0, 1.12, 0]), snow, { grad: [0.85, 1.04] });
      P.add(xf(new T.ConeGeometry(0.04, 0.2, 6).rotateX(PI / 2), [0, 1.11, 0.25]), '#ff8a2e', { gloss: true });
      [-1, 1].forEach((s) => P.add(xf(new T.SphereGeometry(0.025, 5, 4), [s * 0.065, 1.17, 0.16]), '#2b2f38', {}));
      [0.62, 0.78, 0.93].forEach((y, i) => P.add(xf(new T.SphereGeometry(0.03, 5, 4), [0, y + 0.02, 0.24 - i * 0.015]), '#2b2f38', {}));
      P.add(xf(geo.cyl(0.21, 0.21, 0.06, 10), [0, 1.27, 0]), '#2f3a4a', { gloss: true });
      P.add(xf(geo.cyl(0.13, 0.14, 0.22, 10), [0, 1.39, 0]), '#2f3a4a', { gloss: true });
      P.add(xf(geo.cyl(0.142, 0.142, 0.05, 10), [0, 1.31, 0]), '#e2554a', {});
      P.add(xf(new T.TorusGeometry(0.17, 0.05, 4, 12), [0, 0.96, 0], [PI / 2, 0, 0]), '#e2554a', { gloss: true });
      P.add(xf(geo.roundBox(0.09, 0.3, 0.04, 0.02, 1), [0.12, 0.8, 0.16], [0.2, 0, -0.2]), '#e2554a', {});
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.018, 0.022, 0.42, 4), [s * 0.36, 0.86, 0], [0, 0, s * -1.0]), '#7a5233', {}));
      P.cullInside([[0, 0.3, 0, 0.3], [0, 0.76, 0, 0.22], [0, 1.12, 0, 0.16]]); // Schneekugeln stecken ineinander
      const m = P.build();
      m.name = 'schneemann';
      return m;
    }
    base.place(snowman(), -1.85, 2.95, { rotY: 0.35, keep: 0.45 });
    base.place(hedgehog(), -2.85, 1.05, { rotY: -0.4, keep: 0.35 });

    /* ------------------------------------------------------------------
       Straße mit Zebrastreifen, Ampel und Auto (vorne rechts)
       ------------------------------------------------------------------ */
    const RA = [0.05, 3.75], RB = [3.85, 1.45], RW = 0.86;
    const rdx = RB[0] - RA[0], rdz = RB[1] - RA[1], RL = Math.hypot(rdx, rdz);
    const ru = [rdx / RL, rdz / RL], rn = [-ru[1], ru[0]];
    const roadPt = (s, o, lift) => { const x = RA[0] + ru[0] * s + rn[0] * o, z = RA[1] + ru[1] * s + rn[1] * o; return [x, ground(x, z) + lift, z]; };
    const ZS = RL * 0.47; // Mitte des Zebrastreifens
    (function road() {
      const P = new kit.Parts();
      const asph = groundMesh();
      const n = 12;
      for (let i = 0; i < n; i++) {
        const s0 = (i / n) * RL, s1 = ((i + 1) / n) * RL;
        asph.quad(roadPt(s0, -RW / 2, 0.05), roadPt(s1, -RW / 2, 0.05), roadPt(s1, RW / 2, 0.05), roadPt(s0, RW / 2, 0.05));
      }
      // runde Enden
      [[0, 1], [RL, -1]].forEach(([s, dir]) => {
        const c = roadPt(s, 0, 0.05);
        for (let k = 0; k < 8; k++) {
          const a0 = PI / 2 + (k / 8) * PI, a1 = PI / 2 + ((k + 1) / 8) * PI;
          const p = (a) => roadPt(s + Math.cos(a) * dir * (RW / 2), Math.sin(a) * (RW / 2), 0.05);
          asph.tri(c, p(a0), p(a1));
        }
      });
      P.add(asph.geo(), '#626b78', { grad: [1, 1], jitter: 0.03, seed: 5 });
      // Bordstein-Linien, Mittelstreifen, Zebrastreifen
      const lines = groundMesh();
      const band = (s0, s1, o0, o1, lift) => lines.quad(roadPt(s0, o0, lift), roadPt(s1, o0, lift), roadPt(s1, o1, lift), roadPt(s0, o1, lift));
      [-1, 1].forEach((sd) => band(0, RL, sd * (RW / 2 - 0.06), sd * (RW / 2 - 0.1), 0.062));
      for (let s = 0.25; s < RL - 0.3; s += 0.5) { if (Math.abs(s + 0.12 - ZS) < 0.55) continue; band(s, s + 0.24, -0.025, 0.025, 0.062); }
      for (let k = 0; k < 5; k++) { const o = -RW / 2 + 0.13 + k * ((RW - 0.26) / 4); band(ZS - 0.27, ZS + 0.27, o - 0.055, o + 0.055, 0.064); }
      P.add(lines.geo(), '#ffffff', { grad: [1, 1] });
      const m = P.build(null, { castShadow: false });
      m.name = 'strasse';
      g.add(m);
      for (let s = 0; s <= RL; s += 0.6) { const p = roadPt(s, 0, 0); base.keep(p[0], p[2], 0.55); }
    })();
    // Ampel (hinter der Straße, schaut zur Kamera)
    const lampGlow = new T.MeshBasicMaterial({ color: '#46e05a', toneMapped: false });
    const lightParts = (function trafficLight() {
      const P = new kit.Parts();
      const metal = '#4a5664';
      P.add(xf(geo.cyl(0.13, 0.16, 0.12, 8), [0, 0.06, 0]), metal, { gloss: true });
      P.add(xf(geo.cyl(0.045, 0.05, 1.6, 8), [0, 0.86, 0]), '#dfe6ee', { gloss: true, grad: [0.85, 1.05] });
      P.add(xf(geo.roundBox(0.36, 0.9, 0.26, 0.08), [0, 1.98, 0]), '#2f3845', { gloss: true, grad: [0.85, 1.08] });
      P.add(xf(geo.roundBox(0.44, 0.98, 0.04, 0.04, 1), [0, 1.98, -0.14]), ACC, { gloss: true });
      [0.28, 0, -0.28].forEach((dy, i) => {
        P.add(xf(geo.cyl(0.1, 0.1, 0.03, 10).rotateX(PI / 2), [0, 1.98 + dy, 0.13]), ['#5a2a2a', '#5a4a1e', '#1f4a2a'][i], { gloss: true });
        P.add(xf(new T.CylinderGeometry(0.13, 0.13, 0.12, 6, 1, true, PI / 2, PI).rotateX(PI / 2), [0, 1.98 + dy + 0.02, 0.18], [0, 0, 0]), '#2f3845', { gloss: true });
      });
      P.add(xf(new T.ConeGeometry(0.06, 0.1, 6), [0, 2.48, 0]), C.gold, { gloss: true });
      const grp = P.build();
      grp.name = 'ampel';
      const glow = new T.Mesh(new T.CircleGeometry(0.095, 14), lampGlow);
      glow.userData.dynamic = true;
      grp.add(glow);
      const halo = kit.glowHalo(0.9, '#ffffff');
      halo.userData.dynamic = true;
      grp.add(halo);
      const p = roadPt(RL * 0.6, -RW / 2 - 0.38, 0);
      base.place(grp, p[0], p[2], { rotY: -0.3, keep: 0.35 });
      return { glow, halo };
    })();
    const light = { phase: 'gruen' };
    // Auto (fährt im Kreis über die Straße, hält bei Rot vor dem Zebrastreifen)
    function car() {
      const P = new kit.Parts();
      P.add(xf(geo.roundBox(0.92, 0.26, 0.5, 0.1), [0, 0.22, 0]), ACC, { gloss: true, grad: [0.75, 1.08] });
      P.add(xf(geo.roundBox(0.5, 0.26, 0.44, 0.1), [-0.06, 0.45, 0]), '#ffffff', { gloss: true, grad: [0.9, 1.05] });
      P.add(xf(geo.roundBox(0.52, 0.17, 0.46, 0.06, 1), [-0.06, 0.46, 0]), '#8fd3ff', { gloss: true, grad: [0.9, 1.1] });
      P.add(xf(geo.roundBox(0.56, 0.05, 0.47, 0.03, 1), [-0.06, 0.58, 0]), '#ffffff', { gloss: true });
      [[0.28, 1], [0.28, -1], [-0.28, 1], [-0.28, -1]].forEach(([x, s]) => P.add(xf(geo.cyl(0.11, 0.11, 0.1, 8).rotateX(PI / 2), [x, 0.11, s * 0.24]), '#2b2f38', { gloss: true }));
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.045, 0.045, 0.03, 8).rotateZ(PI / 2), [0.465, 0.25, s * 0.15]), '#fff4c2', { gloss: true }));
      const grp = P.build();
      grp.name = 'auto';
      return grp;
    }
    (function drive() {
      const c = car();
      const hold = new T.Group();
      hold.add(c);
      hold.userData.dynamic = true;
      g.add(hold);
      const lane = 0.2, R = lane, L = RL;
      const loop = 2 * L + 2 * PI * R;
      const stopA = ZS - 0.27 - 0.55, stopB = L + PI * R + (L - (ZS + 0.27 + 0.55));
      let s = 0.2;
      const at = (sv) => {
        let o, along, hx, hz;
        // Rechtsverkehr: hin auf der +rn-Seite, zurück auf der −rn-Seite, Wenden um die runden Enden
        if (sv < L) { along = sv; o = lane; hx = ru[0]; hz = ru[1]; } else if (sv < L + PI * R) {
          const a = (sv - L) / R;
          along = L + Math.sin(a) * R; o = Math.cos(a) * R;
          hx = ru[0] * Math.cos(a) - rn[0] * Math.sin(a); hz = ru[1] * Math.cos(a) - rn[1] * Math.sin(a);
        } else if (sv < 2 * L + PI * R) { along = L - (sv - L - PI * R); o = -lane; hx = -ru[0]; hz = -ru[1]; } else {
          const a = (sv - 2 * L - PI * R) / R;
          along = -Math.sin(a) * R; o = -Math.cos(a) * R;
          hx = -ru[0] * Math.cos(a) + rn[0] * Math.sin(a); hz = -ru[1] * Math.cos(a) + rn[1] * Math.sin(a);
        }
        const x = RA[0] + ru[0] * along + rn[0] * o, z = RA[1] + ru[1] * along + rn[1] * o;
        hold.position.set(x, ground(x, z) + 0.06, z);
        hold.rotation.y = Math.atan2(-hz, hx);
      };
      at(s);
      const cycle = 9;
      updates.push((dt, t) => {
        // Ampel: 0–4 grün, 4–5 gelb, 5–9 rot
        const ph = (t * Math.max(calm, 0.25)) % cycle;
        const ph2 = ph < 4 ? 'gruen' : ph < 5 ? 'gelb' : 'rot';
        if (ph2 !== light.phase) {
          light.phase = ph2;
          const k = ph2 === 'rot' ? 0 : ph2 === 'gelb' ? 1 : 2;
          lightParts.glow.position.set(0, 1.98 + 0.28 - k * 0.28, 0.147);
          lightParts.halo.position.copy(lightParts.glow.position);
          lampGlow.color.set(ph2 === 'rot' ? '#ff4040' : ph2 === 'gelb' ? '#ffc21a' : '#46e05a');
        }
        let next = s + dt * 0.7 * calm;
        if (light.phase !== 'gruen') {
          if (s <= stopA + 1e-4 && next > stopA && s > stopA - 1.2) next = stopA;
          if (s <= stopB + 1e-4 && next > stopB && s > stopB - 1.2) next = stopB;
        }
        s = next % loop;
        at(s);
      });
      lightParts.glow.position.set(0, 1.98 - 0.28, 0.147);
      lightParts.halo.position.copy(lightParts.glow.position);
    })();

    /* ------------------------------------------------------------------
       Weg (vom Globus zum Zebrastreifen), Büsche, Steine, Gras, Blumen
       ------------------------------------------------------------------ */
    {
      const z0 = roadPt(ZS, -RW / 2 - 0.35, 0);
      kit.path(base, [[-0.75, -0.95], [-0.45, 0.6], [0.35, 1.45], [z0[0] - 0.1, z0[2] - 0.15]], { seed: 71 });
    }
    base.place(kit.bush({ seed: 715, size: 0.8, berries: '#ff5a5f' }), -1.9, -0.95, { keep: 0.5 });
    base.place(kit.rock({ size: 0.5, seed: 717, moss: true }), -1.35, 1.25, { keep: 0.35 });
    kit.grassTufts(base, 44, 71);
    kit.flowers(base, 12, ['#ffffff', '#ffd23f', '#ff7aa8', '#b28dff'], 71);

    kit.merge(g);
    kit.batchDynamic(g); // Bewegtes (Ballons, Boote, Räder …) in wenige Draw-Calls bündeln
    g.userData.update = (dt, t) => { for (let i = 0; i < updates.length; i++) updates[i](dt, t); };

    return {
      group: g,
      anchors: {
        label: new T.Vector3(0, 5.9, -1.8),
        focus: new T.Vector3(0, 1.4, -0.2),
      },
    };
  });
})();
