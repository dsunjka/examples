/* ==========================================================================
   js/world3d/flo.js – Flo, der Fuchs, als 3D-Figur → W.flo

   Prozedural gebaute Chibi-Figur (Kugeln, Kapseln, Kegel, ein gebogener
   Schwanz mit drei Knochen) mit weichen Normalen, Fell-Randlicht (Fresnel
   über onBeforeCompile) und Kontaktschatten. Gesicht und Bauch sind auf
   Canvas-Texturen gemalt (weiße Wangen-Maske, Bäckchen), Augen und Nase
   glänzen, Augen haben Glanzpunkte und blinzeln.

   Zwei Auftritte:
     1) Maskottchen unten links: eigene kleine, durchsichtige Leinwand im
        .mascot-Element (W.layer). Das Element bleibt Klickziel, Größe und
        Lage (.big/.hidden) – das SVG wird erst ausgeblendet, wenn die
        3D-Figur wirklich gerendert hat (.mascot.is-3d). Gerendert wird nur,
        solange das Maskottchen sichtbar ist (höchstens 30 Bilder/s).
     2) In der Welt: Flo steht auf seiner Heimatinsel (W.islands.hub,
        anchors.flo), dreht sich zur Kamera, winkt beim Start.

   Animationen (Skelett aus Gruppen): Atmen, Blinzeln, Ohrzucken,
   Schwanzwedeln, Sprechen (Maul, solange LT.speech spricht), Jubeln (Sprung
   mit Drehung, Arme hoch, Freude-Augen), Nachdenken (Kopf neigen, Pfote ans
   Kinn), Winken, Kopf folgt leicht Finger/Zeiger. W.reducedMotion: fast still.

   API (W.flo):
     mascot            Figur im Maskottchen (oder null, falls keine Leinwand)
     world             Figur auf Flos Insel
     cheer() / think() / wave()    Aktion auf beiden Figuren
     talk(on)          Maul bewegen (zusätzlich zu LT.speech)
     onPlace(place)    vom Kern bei jedem W.go
     pose(name, t)     nur Diagnose/Vorschau: Aktion zum Zeitpunkt t einfrieren
                       (name = null hebt das auf)

   LT.ui.cheer / LT.ui.think / LT.ui.initMascot werden hier umhüllt (ohne
   3D-Welt bleibt ihr Verhalten unverändert).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;
  const W0 = LT.w3d;

  /* ------------------------------------------------------------------
     LT.ui umhüllen: erst das Original (SVG-Flo, Klassen), dann 3D
     ------------------------------------------------------------------ */
  if (LT.ui) {
    const wrap = (name, after) => {
      const orig = LT.ui[name];
      if (typeof orig !== 'function') return;
      LT.ui[name] = function () {
        const r = orig.apply(this, arguments);
        try { if (W0.flo) after(); } catch (e) { console.error('flo3d ' + name, e); }
        return r;
      };
    };
    wrap('cheer', () => W0.flo.cheer());
    wrap('think', () => W0.flo.think());
    wrap('initMascot', () => W0.flo._attach && W0.flo._attach());
  }

  /* ------------------------------------------------------------------
     Farben wie beim SVG-Flo (LT.ui.floSVG)
     ------------------------------------------------------------------ */
  const COL = {
    fur: '#ff8233',
    furLight: '#ffa865',
    cream: '#fff6ec',
    dark: '#4e3128',
    eye: '#1f2036',
    eyeGlow: '#5a4a86',
    nose: '#2b2d42',
    mouth: '#b8323f',
    tongue: '#ff7b88',
    earIn: '#ffd6c2',
    brow: '#6b4232',
  };
  const TAU = Math.PI * 2;

  /* ------------------------------------------------------------------
     kleine Helfer
     ------------------------------------------------------------------ */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const damp = (cur, target, k, dt) => target + (cur - target) * Math.exp(-k * dt);
  const bump = (x, c, w) => Math.exp(-((x - c) / w) * ((x - c) / w));
  /** Hüllkurve: weich ein (a s) und aus (b s) über die Dauer dur */
  const envl = (t, dur, a, b) => sstep(0, a, t) * (1 - sstep(dur - b, dur, t));

  /* ==================================================================
     Bau (erst im Kern, wenn THREE da ist)
     ================================================================== */
  W0.register('flo', (W) => {
    const T = W.THREE;
    const V3 = (x, y, z) => new T.Vector3(x, y, z);
    const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);

    /* ---------------- Geometrie-Helfer ---------------- */
    /** Normalen glätten – auch über Nähte und Pole (gleiche Position = gleiche Normale) */
    function smoothNormals(geo) {
      geo.computeVertexNormals();
      const p = geo.attributes.position, n = geo.attributes.normal;
      const map = new Map();
      const key = (i) => Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
      for (let i = 0; i < p.count; i++) {
        const k = key(i);
        let s = map.get(k);
        if (!s) map.set(k, (s = [0, 0, 0]));
        s[0] += n.getX(i); s[1] += n.getY(i); s[2] += n.getZ(i);
      }
      for (let i = 0; i < p.count; i++) {
        const s = map.get(key(i));
        const l = Math.hypot(s[0], s[1], s[2]) || 1;
        n.setXYZ(i, s[0] / l, s[1] / l, s[2] / l);
      }
      n.needsUpdate = true;
      return geo;
    }
    /** Vertex-Farben: fn(x, y, z) → Farbe (CSS) */
    const tmpC = new T.Color();
    function paint(geo, fn) {
      const p = geo.attributes.position;
      const arr = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) {
        const c = fn(p.getX(i), p.getY(i), p.getZ(i), i);
        if (c && c.isColor) tmpC.copy(c); else tmpC.set(c);
        arr[i * 3] = tmpC.r; arr[i * 3 + 1] = tmpC.g; arr[i * 3 + 2] = tmpC.b;
      }
      geo.setAttribute('color', new T.BufferAttribute(arr, 3));
      return geo;
    }
    const solid = (geo, color) => paint(geo, () => color);
    /** Kugel, verformt: fn(v: Einheitsvektor) → v (wird verändert) */
    function blob(wSeg, hSeg, fn) {
      const g = new T.SphereGeometry(1, wSeg, hSeg).rotateY(-Math.PI / 2); // Naht nach hinten, Textur-Mitte vorn
      const p = g.attributes.position, v = new T.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        fn(v);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      return smoothNormals(g);
    }
    const ellipsoid = (rx, ry, rz, seg = 20) => smoothNormals(new T.SphereGeometry(1, seg, Math.max(8, Math.round(seg * 0.7))).scale(rx, ry, rz));

    /* Oberfläche eines Meshes in Richtung dir (von außen nach innen) treffen */
    const ray = new T.Raycaster();
    function surface(geo, dir, center = V3(0, 0, 0)) {
      const m = new T.Mesh(geo, new T.MeshBasicMaterial());
      m.updateMatrixWorld(true);
      const d = dir.clone().normalize();
      ray.set(center.clone().addScaledVector(d, 3), d.clone().negate());
      const hit = ray.intersectObject(m, false)[0];
      if (!hit) return { p: center.clone().addScaledVector(d, 0.4), n: d };
      return { p: hit.point, n: hit.face.normal.clone().normalize() };
    }
    /** Ausrichtung: +z entlang n, +y möglichst nach oben */
    function orient(obj, n, up = UP) {
      const z = n.clone().normalize();
      const x = new T.Vector3().crossVectors(up, z);
      if (x.lengthSq() < 1e-6) x.set(1, 0, 0);
      x.normalize();
      const y = new T.Vector3().crossVectors(z, x);
      obj.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x, y, z));
    }
    const dirYE = (yawDeg, elevDeg) => {
      const a = (yawDeg * Math.PI) / 180, e = (elevDeg * Math.PI) / 180;
      return V3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
    };

    /* ---------------- Texturen (einmal, von beiden Figuren geteilt) ---------------- */
    function canvasTex(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      draw(g, w, h);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    }
    /** Äquirektangulär: Gierwinkel (0 = vorn, + = Flos linke Seite) und Höhe in Grad → Pixel */
    const eqr = (w, h) => (yaw, el) => [(0.5 + yaw / 360) * w, ((90 - el) / 180) * h];
    /** Obere Kante der weißen Gesichtsmaske (Grad): Mitte unter der Nasenwurzel, unter den Augen tiefer, Wangen-Büschel seitlich */
    function maskTop(yaw) {
      const a = Math.abs(yaw);
      let e = -5 - 10 * bump(a, 24, 15) + 6 * bump(a, 64, 16);
      e += 5 * bump(a, 76, 4.5) + 4 * bump(a, 87, 4.5); // kleine Fell-Zacken an der Wange
      if (a > 80) e -= (a - 80) * 3.4;
      return e;
    }
    function makeTextures() {
      const head = canvasTex(1024, 512, (g, w, h) => {
        const P = eqr(w, h);
        g.fillStyle = COL.fur;
        g.fillRect(0, 0, w, h);
        // Stirn und Kopfmitte etwas heller (weiches Fell)
        const [fx, fy] = P(0, 28);
        let rg = g.createRadialGradient(fx, fy, 0, fx, fy, 200);
        rg.addColorStop(0, 'rgba(255, 186, 120, 0.55)');
        rg.addColorStop(1, 'rgba(255, 186, 120, 0)');
        g.fillStyle = rg;
        g.fillRect(0, 0, w, h);
        // Unterseite (Hals) etwas dunkler: Schatten unter dem Kopf
        let lg = g.createLinearGradient(0, P(0, -55)[1], 0, h);
        lg.addColorStop(0, 'rgba(150, 50, 10, 0)');
        lg.addColorStop(1, 'rgba(150, 50, 10, 0.35)');
        g.fillStyle = lg;
        g.fillRect(0, 0, w, h);
        // weiße Maske (Schnauze, Wangen, Kinn)
        g.save();
        if ('filter' in g) g.filter = 'blur(1.2px)';
        g.fillStyle = COL.cream;
        g.beginPath();
        for (let yaw = -140; yaw <= 140; yaw += 1) {
          const [x, y] = P(yaw, maskTop(yaw));
          if (yaw === -140) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.lineTo(...P(140, -92));
        g.lineTo(...P(-140, -92));
        g.closePath();
        g.fill();
        g.restore();
        // Kinn-Unterseite in der Maske leicht abgedunkelt (weich)
        lg = g.createLinearGradient(0, P(0, -50)[1], 0, P(0, -90)[1]);
        lg.addColorStop(0, 'rgba(225, 180, 150, 0)');
        lg.addColorStop(1, 'rgba(225, 180, 150, 0.5)');
        g.fillStyle = lg;
        g.fillRect(P(-140, 0)[0], P(0, -50)[1], P(140, 0)[0] - P(-140, 0)[0], h);
        // Bäckchen
        [-1, 1].forEach((s) => {
          const [x, y] = P(s * 42, -16);
          g.save();
          g.translate(x, y);
          g.scale(1.3, 0.78);
          rg = g.createRadialGradient(0, 0, 0, 0, 0, 34);
          rg.addColorStop(0, 'rgba(255, 128, 122, 0.8)');
          rg.addColorStop(0.55, 'rgba(255, 140, 130, 0.45)');
          rg.addColorStop(1, 'rgba(255, 150, 140, 0)');
          g.fillStyle = rg;
          g.beginPath();
          g.arc(0, 0, 34, 0, TAU);
          g.fill();
          g.restore();
        });
      });
      const body = canvasTex(512, 256, (g, w, h) => {
        const P = eqr(w, h);
        g.fillStyle = COL.fur;
        g.fillRect(0, 0, w, h);
        // oben (unter dem Kopf) dunkler: Kontaktschatten des Kopfes
        let lg = g.createLinearGradient(0, 0, 0, P(0, 30)[1]);
        lg.addColorStop(0, 'rgba(140, 45, 10, 0.45)');
        lg.addColorStop(1, 'rgba(140, 45, 10, 0)');
        g.fillStyle = lg;
        g.fillRect(0, 0, w, h);
        // Bauch (Ei-Form, unten breiter)
        g.save();
        if ('filter' in g) g.filter = 'blur(0.8px)';
        g.fillStyle = COL.cream;
        g.beginPath();
        for (let i = 0; i <= 72; i++) {
          const t = (i / 72) * TAU;
          const [x, y] = P(Math.sin(t) * (31 - 7 * Math.cos(t)), -14 + 50 * Math.cos(t));
          if (!i) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
        g.restore();
        lg = g.createLinearGradient(0, 0, 0, P(0, 20)[1]);
        lg.addColorStop(0, 'rgba(160, 80, 40, 0.3)');
        lg.addColorStop(1, 'rgba(160, 80, 40, 0)');
        g.fillStyle = lg;
        g.fillRect(0, 0, w, h);
      });
      const shadow = canvasTex(128, 128, (g, w) => {
        const rg = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        rg.addColorStop(0, 'rgba(0,0,0,0.9)');
        rg.addColorStop(0.45, 'rgba(0,0,0,0.5)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg;
        g.fillRect(0, 0, w, w);
      });
      shadow.colorSpace = T.NoColorSpace;
      return { head, body, shadow };
    }
    const TEX = makeTextures();

    /* ---------------- Materialien ---------------- */
    /** Fell-Randlicht (Fresnel, oben stärker) – weicher „Rim-Light“-Eindruck */
    const RIM = { rimColor: { value: new T.Color('#fff1da') }, rimPower: { value: 2.4 }, rimStrength: { value: 0.42 } };
    function addRim(mat, strength) {
      const u = strength == null ? RIM : Object.assign({}, RIM, { rimStrength: { value: strength } });
      mat.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, u);
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec3 rimColor;\nuniform float rimPower;\nuniform float rimStrength;')
          .replace('#include <emissivemap_fragment>', [
            '#include <emissivemap_fragment>',
            '{',
            '  vec3 rimV = normalize( vViewPosition );',
            '  float rimF = pow( 1.0 - saturate( dot( normal, rimV ) ), rimPower );',
            '  float rimUp = 0.45 + 0.55 * saturate( normal.y * 0.7 + 0.5 );',
            '  totalEmissiveRadiance += rimColor * mix( vec3( 1.0 ), diffuseColor.rgb, 0.45 ) * rimF * rimUp * rimStrength;',
            '}',
          ].join('\n'));
      };
      mat.customProgramCacheKey = () => 'flo-rim-' + (strength == null ? 'a' : strength);
      return mat;
    }
    function makeMats() {
      const S = T.MeshStandardMaterial;
      return {
        fur: addRim(new S({ vertexColors: true, roughness: 0.78, metalness: 0, envMapIntensity: 0.65 })),
        head: addRim(new S({ map: TEX.head, roughness: 0.8, metalness: 0, envMapIntensity: 0.65 })),
        body: addRim(new S({ map: TEX.body, roughness: 0.8, metalness: 0, envMapIntensity: 0.65 })),
        gloss: addRim(new S({ vertexColors: true, roughness: 0.14, metalness: 0, envMapIntensity: 1.3 }), 0.15),
        hi: new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
        shadow: new T.MeshBasicMaterial({ map: TEX.shadow, color: '#1b2b48', transparent: true, opacity: 0.38, depthWrite: false, toneMapped: false }),
      };
    }

    /* ==================================================================
       Figur bauen → Instanz mit update(dt, t)
       ================================================================== */
    function createFox({ shadows = false, detail = 1 } = {}) {
      const MT = makeMats();
      /** Unterteilung je nach Detailstufe (Welt-Flo ist klein: weniger Dreiecke) */
      const D = (n, min = 6) => Math.max(min, Math.round(n * detail));
      /** Mesh; nur große Teile werfen Schatten (Welt) */
      const mesh = (geo, mat, name, cast = false) => {
        const m = new T.Mesh(geo, mat);
        if (name) m.name = name;
        m.castShadow = shadows && cast;
        m.receiveShadow = false;
        return m;
      };

      /* Hierarchie: root (Platz, Maßstab) → facing (Drehung, Pirouette) → hop (Sprunghöhe)
         → squash (Stauchen am Boden) → torso (Wiegen, Drehpunkt Hüfte) → Körperteile */
      const root = new T.Group();
      root.name = 'flo';
      const facing = new T.Group();
      const hop = new T.Group();
      const squash = new T.Group();
      const torso = new T.Group();
      torso.position.y = 0.12;
      const bs = new T.Group(); // „Körperraum“: Teile in absoluten Höhen
      bs.position.y = -0.12;
      root.add(facing); facing.add(hop); hop.add(squash); squash.add(torso); torso.add(bs);

      /* ---------- Kontaktschatten ---------- */
      const shadow = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), MT.shadow);
      shadow.scale.set(0.95, 1, 0.75);
      shadow.position.y = 0.012;
      shadow.renderOrder = -1;
      shadow.castShadow = false;
      facing.add(shadow);

      /* ---------- Körper (Birne) mit Bauch-Textur ---------- */
      const bodyGeo = blob(D(36), D(24), (v) => {
        const h = (v.y + 1) / 2; // 0 unten … 1 oben
        const taper = 1.1 - 0.34 * h;
        v.x *= 0.315 * taper;
        v.z *= 0.285 * taper;
        v.y = 0.39 + 0.31 * v.y * (v.y < 0 ? 0.92 : 1);
        if (v.z > 0) v.z *= 1 + 0.08 * Math.sin(h * Math.PI); // Bauch leicht vorgewölbt
      });
      const body = mesh(bodyGeo, MT.body, 'flo-koerper', true);
      bs.add(body);

      /* ---------- Beine und Füße (dunkle „Socken“) ---------- */
      const legs = [-1, 1].map((s) => {
        const pivot = new T.Group();
        pivot.position.set(0.135 * s, 0.17, 0.03);
        const footGeo = blob(D(16), D(10), (v) => { v.x *= 0.1; v.y *= 0.075; v.z *= 0.135; if (v.y < -0.02) v.y = -0.02 + (v.y + 0.02) * 0.45; });
        solid(footGeo, COL.dark).translate(0.01 * s, -0.1, 0.07);
        const legGeo = new T.CapsuleGeometry(0.075, 0.08, D(4, 2), D(10));
        paint(legGeo, (x, y) => (y < -0.03 ? COL.dark : COL.fur)).translate(0, -0.03, 0.02);
        pivot.add(mesh(T.addons.mergeGeometries([legGeo, footGeo]), MT.fur, 'flo-bein', true));
        squash.add(pivot);
        return pivot;
      });

      /* ---------- Arme (Kapseln, dunkle Pfoten) ---------- */
      const armLen = 0.32;
      const arms = [-1, 1].map((s) => {
        const pivot = new T.Group();
        pivot.position.set(0.24 * s, 0.5, 0.05);
        const r = 0.068;
        const geo = new T.CapsuleGeometry(r, armLen - 2 * r, D(5, 2), D(12)).translate(0, -(armLen / 2) + r * 0.55, 0);
        paint(geo, (x, y) => (y < -armLen + 0.13 ? COL.dark : COL.fur));
        smoothNormals(geo);
        const arm = mesh(geo, MT.fur, 'flo-arm', true);
        pivot.add(arm);
        bs.add(pivot);
        return pivot;
      });

      /* ---------- Schwanz: gebogener, buschiger Schlauch mit weißer Spitze, 4 Knochen ---------- */
      const tail = (function buildTail() {
        const pts = [V3(0, 0, 0), V3(0.05, 0.02, -0.17), V3(0.2, 0.1, -0.33), V3(0.42, 0.32, -0.38), V3(0.55, 0.58, -0.28), V3(0.52, 0.8, -0.12)];
        const curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
        const rings = D(40), seg = D(16), NB = 4;
        const frames = curve.computeFrenetFrames(rings, false);
        const rMax = 0.2, c = 0.56;
        const radius = (s) => (s < c ? lerp(0.05, rMax, Math.pow(sstep(0, c, s), 0.85)) : rMax * Math.sqrt(Math.max(0, 1 - Math.pow((s - c) / (1 - c), 2))));
        const pos = [], col = [], idx = [], si = [], sw = [];
        const P = new T.Vector3(), d = new T.Vector3();
        const cFur = new T.Color(COL.fur), cCream = new T.Color(COL.cream), cTip = new T.Color();
        const boneS = []; for (let b = 0; b < NB; b++) boneS.push((b / (NB - 1)) * 0.92);
        for (let i = 0; i <= rings; i++) {
          const s = i / rings;
          curve.getPointAt(s, P);
          const r = radius(s);
          for (let j = 0; j <= seg; j++) {
            const a = (j / seg) * TAU;
            const fluff = 1 + 0.045 * Math.sin(a * 5 + s * 14) * sstep(0.08, 0.3, s);
            d.copy(frames.normals[i]).multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i], Math.sin(a));
            pos.push(P.x + d.x * r * fluff, P.y + d.y * r * fluff, P.z + d.z * r * fluff);
            const edge = 0.735 + 0.035 * Math.sin(a * 3 + 0.6);
            cTip.copy(s > edge ? cCream : cFur);
            col.push(cTip.r, cTip.g, cTip.b);
            // Knochen-Gewichte entlang des Schwanzes
            const f = clamp(s / 0.92, 0, 1) * (NB - 1);
            const i0 = Math.min(NB - 2, Math.floor(f));
            const w1 = clamp(f - i0, 0, 1);
            si.push(i0, i0 + 1, 0, 0);
            sw.push(1 - w1, w1, 0, 0);
          }
        }
        for (let i = 0; i < rings; i++) {
          for (let j = 0; j < seg; j++) {
            const a = i * (seg + 1) + j, b = a + seg + 1;
            idx.push(a, a + 1, b, b, a + 1, b + 1);
          }
        }
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
        geo.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4));
        geo.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
        geo.setIndex(idx);
        smoothNormals(geo);
        const sk = new T.SkinnedMesh(geo, MT.fur);
        sk.name = 'flo-schwanz';
        sk.castShadow = shadows;
        sk.frustumCulled = false;
        const bones = [];
        let prev = null;
        const bp = new T.Vector3();
        boneS.forEach((s, b) => {
          const bone = new T.Bone();
          curve.getPointAt(s, bp);
          if (prev) bone.position.copy(bp).sub(prev.userData.abs); else bone.position.copy(bp);
          bone.userData.abs = bp.clone();
          (prev || sk).add(bone);
          bones.push(bone);
          prev = bone;
        });
        sk.updateMatrixWorld(true);
        sk.bind(new T.Skeleton(bones));
        const pivot = new T.Group();
        pivot.position.set(0, 0.18, -0.2);
        pivot.add(sk);
        bs.add(pivot);
        return { pivot, bones, mesh: sk };
      })();

      /* ---------- Kopf ---------- */
      const headPivot = new T.Group();
      headPivot.position.set(0, 0.62, 0.0);
      bs.add(headPivot);
      const head = new T.Group();
      head.position.set(0, 0.37, 0.02);
      headPivot.add(head);
      const HR = 0.47, HS = HR / 0.44; // Kopfradius (Gesichtsteile skalieren mit)
      const headGeo = blob(D(48), D(36), (v) => {
        const x = v.x, y = v.y, z = v.z;
        const side = Math.abs(x);
        let X = x * 1.13, Y = y * (y > 0 ? 0.93 : 0.97), Z = z * 0.98;
        // Wangen unten seitlich voller (Pausbacken)
        const low = sstep(0.2, -0.55, y) * (1 - sstep(-0.7, -0.98, y));
        X *= 1 + 0.12 * low * sstep(0.15, 0.85, side);
        // zwei weiche Fell-Büschel seitlich an den Wangen
        const el = Math.asin(clamp(y, -1, 1)) * 57.3;
        const tuft = (bump(el, -14, 7) * 0.8 + bump(el, -33, 7)) * sstep(0.62, 0.93, side) * sstep(-0.45, 0.15, z);
        X += Math.sign(x) * 0.1 * tuft;
        Y -= 0.035 * tuft;
        v.set(X * HR, Y * HR, Z * HR);
      });
      const headMesh = mesh(headGeo, MT.head, 'flo-kopf', true);
      head.add(headMesh);

      // Schnauze (kleiner weißer Hügel) und Nase
      const snoutC = V3(0, -0.13 * HS, 0.352 * HS);
      const snoutGeo = solid(ellipsoid(0.15 * HS, 0.105 * HS, 0.13 * HS, D(22)), COL.cream).translate(snoutC.x, snoutC.y, snoutC.z);
      const noseGeo = blob(D(16), D(12), (v) => {
        const k = 1 - 0.28 * clamp(-v.y, 0, 1); // unten schmaler (Dreieck-Nase)
        v.set(v.x * 0.066 * k * HS, v.y * 0.044 * HS, v.z * 0.047 * HS);
      });
      paint(noseGeo, (x, y) => (y > 0.025 ? '#4a4c66' : COL.nose));
      const nose = mesh(noseGeo, MT.gloss, 'flo-nase');
      const nPos = snoutC.clone().add(V3(0, 0.05 * HS, 0.113 * HS));
      nose.position.copy(nPos);
      nose.rotation.x = -0.25;
      head.add(nose);
      const noseHi = new T.Mesh(new T.CircleGeometry(0.012, 10), MT.hi);
      noseHi.position.copy(nPos).add(V3(-0.018, 0.022, 0.03));
      noseHi.rotation.x = -0.6;
      head.add(noseHi);

      // Gesichtsteile auf die Oberfläche setzen (Kopf + Schnauze als Ziel)
      const posOnly = (g) => { const c = new T.BufferGeometry(); c.setAttribute('position', g.attributes.position); c.setIndex(g.index); return c; };
      const faceGeo = T.addons.mergeGeometries([posOnly(headGeo), posOnly(snoutGeo)]);
      const socket = (yaw, el, sink = 0) => {
        const s = surface(faceGeo, dirYE(yaw, el), V3(0, 0, 0));
        const g = new T.Group();
        g.position.copy(s.p).addScaledVector(s.n, -sink);
        orient(g, s.n);
        head.add(g);
        return g;
      };

      // Augen: dunkle, glänzende Kuppeln mit Glanzpunkten; „Freude-Augen“ (∩) beim Jubeln
      const eyeGeo = ellipsoid(0.08, 0.102, 0.04, D(20));
      paint(eyeGeo, (x, y) => tmpC.set(COL.eye).lerp(new T.Color(COL.eyeGlow), sstep(-0.02, -0.085, y) * 0.85));
      const hiGeo = T.addons.mergeGeometries([new T.CircleGeometry(0.029, 16).translate(0.024, 0.039, 0), new T.CircleGeometry(0.013, 12).translate(-0.026, -0.04, 0)]);
      const happyGeo = solid(new T.TorusGeometry(0.062, 0.016, D(6, 4), D(14), Math.PI), COL.eye);
      const eyes = [-1, 1].map((s) => {
        const sk = socket(26 * s, -1, 0.01);
        const blink = new T.Group();
        sk.add(blink);
        const e = mesh(eyeGeo, MT.gloss, 'flo-auge');
        const hi = new T.Mesh(hiGeo, MT.hi);
        hi.position.z = 0.038;
        if (s < 0) hi.scale.x = 1; // beide Glanzpunkte oben rechts (wie im SVG)
        blink.add(e, hi);
        const happy = new T.Mesh(happyGeo, MT.gloss);
        happy.position.set(0, -0.032, 0.022);
        happy.visible = false;
        sk.add(happy);
        return { socket: sk, blink, eye: e, hi, happy };
      });

      // Augenbrauen (Bögen)
      const browGeo = solid(new T.TorusGeometry(0.07, 0.013, D(5, 3), D(12), 1.7).rotateZ(Math.PI / 2 - 0.85), COL.brow);
      const brows = [-1, 1].map((s) => {
        const sk = socket(25 * s, 21, 0.004);
        const b = mesh(browGeo, MT.fur, 'flo-braue');
        b.rotation.z = -0.12 * s;
        sk.add(b);
        return { socket: sk, mesh: b, base: sk.position.clone(), up: new T.Vector3(0, 1, 0).applyQuaternion(sk.quaternion) };
      });

      // Mund: Lächeln „ω“ und Maul (öffnet beim Sprechen nach unten)
      const smileGeo = T.addons.mergeGeometries([-1, 1].map((s) => new T.TorusGeometry(0.033, 0.0095, D(5, 3), D(12), Math.PI).rotateZ(Math.PI).translate(0.032 * s, 0.008, 0)));
      solid(smileGeo, COL.nose);
      const mouthSock = new T.Group();
      {
        const s = surface(faceGeo, V3(0, -0.62, 0.78), V3(0, -0.13 * HS, 0.3 * HS));
        mouthSock.position.copy(s.p);
        orient(mouthSock, s.n.clone().lerp(V3(0, -0.2, 1), 0.4));
        head.add(mouthSock);
      }
      // Lächeln in die Schnauze einbacken (ein Mesh, ein Draw-Call)
      mouthSock.updateMatrix();
      smileGeo.applyMatrix4(new T.Matrix4().makeTranslation(0, 0.012, 0.004).premultiply(mouthSock.matrix));
      // kleine Stirn-Locke (drei weiche Fell-Spitzen oben auf dem Kopf)
      const tuftParts = [[-0.07, 0.34, -0.5], [0.02, 0.4, -0.12], [0.1, 0.33, 0.35]].map(([x, h, rz], i) => {
        const g = new T.ConeGeometry(0.06 - i * 0.004, h * 0.42, D(8, 5), 1).translate(0, h * 0.21, 0);
        const top = surface(headGeo, V3(x * 2.4, 1, 0.42), V3(0, 0, 0));
        const o = new T.Object3D();
        o.position.copy(top.p).addScaledVector(top.n, -0.035);
        o.quaternion.setFromUnitVectors(UP, top.n.clone().add(V3(0, 0, 0.55)).normalize()).multiply(new T.Quaternion().setFromAxisAngle(V3(0, 0, 1), rz));
        o.updateMatrix();
        return paint(smoothNormals(g.applyMatrix4(o.matrix)), (px, py) => COL.fur);
      });
      head.add(mesh(T.addons.mergeGeometries([snoutGeo, smileGeo, ...tuftParts]), MT.fur, 'flo-schnauze'));
      const mouthPivot = new T.Group();
      mouthPivot.position.set(0, 0.0, -0.004);
      mouthSock.add(mouthPivot);
      const mouthGeo = ellipsoid(0.046, 0.05, 0.022, D(14)).translate(0, -0.05, 0);
      paint(mouthGeo, (x, y) => (y < -0.068 ? COL.tongue : COL.mouth));
      const mouth = mesh(mouthGeo, MT.gloss, 'flo-maul');
      mouthPivot.add(mouth);
      mouthPivot.scale.set(1, 0.05, 1);

      // Ohren: weiche Dreiecke, dunkle Spitzen, helles Inneres
      const earGeo = (function () {
        const g = new T.ConeGeometry(1, 1, D(18), D(11)).translate(0, 0.5, 0);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const y = p.getY(i);
          const k = y < 0.999 ? Math.pow(1 - y, -0.22) : 1; // bauchiger, runde Spitze
          let x = p.getX(i) * k, z = p.getZ(i) * k;
          z *= z > 0 ? 0.55 : 0.75; // vorn flacher (Mulde für das Innere)
          p.setXYZ(i, x * 0.19, y * 0.47, z * 0.135 - y * y * 0.05);
        }
        return smoothNormals(g);
      })();
      paint(earGeo, (x, y) => (y > 0.47 * 0.64 ? COL.dark : COL.fur));
      const earInGeo = earGeo.clone().scale(0.62, 0.72, 0.5).translate(0, 0.035, 0.03);
      solid(earInGeo, COL.earIn);
      const earBoth = T.addons.mergeGeometries([earGeo, earInGeo]);
      const ears = [-1, 1].map((s) => {
        const s0 = surface(headGeo, dirYE(37 * s, 50), V3(0, 0, 0));
        const mount = new T.Group();
        mount.position.copy(s0.p).addScaledVector(s0.n, -0.07);
        const dir = V3(0.42 * s, 1, -0.05).normalize();
        mount.quaternion.setFromUnitVectors(UP, dir).multiply(new T.Quaternion().setFromAxisAngle(UP, -0.32 * s));
        const pivot = new T.Group();
        mount.add(pivot);
        pivot.add(mesh(earBoth, MT.fur, 'flo-ohr', true));
        head.add(mount);
        return pivot;
      });

      /* ---------- Zustand und Animation ---------- */
      const DUR = { cheer: 1.3, think: 2.4, wave: 2.1 };
      const st = {
        acts: [],
        talking: false, talkExtra: false, open: 0,
        blinkT: 1.2 + Math.random() * 2, blinkK: 0, blinkDouble: false,
        earT: [2.5 + Math.random() * 3, 4 + Math.random() * 4], earK: [0, 0],
        look: { yaw: 0, pitch: 0, ty: 0, tp: 0 },
        wander: { t: 0, yaw: 0, pitch: 0 },
        facingYaw: 0, facingTarget: 0,
        freeze: null,
      };
      const qRestL = new T.Quaternion(), qRestR = new T.Quaternion(), qUpL = new T.Quaternion(), qUpR = new T.Quaternion();
      qRestL.setFromUnitVectors(DOWN, V3(-0.36, -0.93, 0.08).normalize());
      qRestR.setFromUnitVectors(DOWN, V3(0.36, -0.93, 0.08).normalize());
      qUpL.setFromUnitVectors(DOWN, V3(-0.62, 0.78, 0.1).normalize());
      qUpR.setFromUnitVectors(DOWN, V3(0.62, 0.78, 0.1).normalize());
      const qChin = new T.Quaternion().setFromUnitVectors(DOWN, V3(0.5, 0.4, 0.78).normalize()); // Flos rechte Pfote (links im Bild) ans Kinn
      const qWave0 = new T.Quaternion().setFromUnitVectors(DOWN, V3(0.8, 0.42, 0.58).normalize()); // seitlich und nach vorn (nicht hinter der Wange)
      const qTmp = new T.Quaternion(), qOsc = new T.Quaternion();
      const Z = V3(0, 0, 1);

      function act(name) { for (let i = 0; i < st.acts.length; i++) if (st.acts[i].name === name) return st.acts[i]; return null; }
      function play(name) {
        if (!DUR[name]) return;
        st.acts = st.acts.filter((a) => a.name !== name && !(name === 'cheer' && a.name === 'think') && !(name === 'think' && a.name === 'cheer'));
        st.acts.push({ name, t: 0, dur: DUR[name] });
      }

      function update(dt, t) {
        const calm = W.reducedMotion ? 0.15 : 1;
        if (st.freeze) {
          st.acts = [{ name: st.freeze.name, t: st.freeze.t, dur: DUR[st.freeze.name] }];
        } else {
          for (let i = st.acts.length - 1; i >= 0; i--) { st.acts[i].t += dt; if (st.acts[i].t >= st.acts[i].dur) st.acts.splice(i, 1); }
        }
        const cheer = act('cheer'), think = act('think'), wave = act('wave');

        /* Grundbewegung: Atmen, Wiegen */
        const br = Math.sin(t * 2.1);
        body.scale.set(1 + 0.014 * br * calm, 1 + 0.022 * br * calm, 1 + 0.014 * br * calm);
        let tz = Math.sin(t * 0.85) * 0.03 * calm, tx = 0;
        let hx = 0, hy = 0, hz = Math.sin(t * 0.85 + 0.6) * -0.03 * calm, hyPos = 0.004 * br * calm;

        /* Jubeln: ausholen, Sprung mit Pirouette, landen; Arme hoch, Freude-Augen */
        let jumpY = 0, spin = 0, sq = 0, armsUp = 0, happy = 0, legTuck = 0, wagBoost = 0;
        if (cheer) {
          const x = cheer.t;
          armsUp = envl(x, cheer.dur, 0.18, 0.38);
          happy = envl(x, cheer.dur, 0.1, 0.3);
          wagBoost = envl(x, cheer.dur, 0.1, 0.5);
          if (!W.reducedMotion) {
            if (x < 0.16) sq = 0.13 * sstep(0, 0.16, x);
            else if (x < 0.64) {
              const u = (x - 0.16) / 0.48;
              jumpY = 0.5 * Math.sin(Math.PI * u);
              spin = TAU * W.ease.inOutCubic(u);
              sq = -0.09 * Math.sin(Math.PI * Math.min(1, u * 1.6));
              legTuck = Math.sin(Math.PI * u);
            } else if (x < 0.86) sq = 0.12 * Math.sin((Math.PI * (x - 0.64)) / 0.22);
          } else jumpY = 0.04 * Math.sin(Math.PI * clamp(x / 0.6, 0, 1));
          hx -= 0.12 * armsUp;
        }
        /* Nachdenken: Kopf neigen, nach oben schauen, Pfote ans Kinn */
        let thinkW = 0;
        if (think) {
          thinkW = envl(think.t, think.dur, 0.4, 0.55);
          hz += 0.3 * thinkW;
          hx -= 0.14 * thinkW;
          hy += 0.12 * thinkW;
          tz -= 0.04 * thinkW;
        }
        /* Winken: linke Pfote (rechts im Bild) hoch und hin und her */
        let waveW = 0;
        if (wave) {
          waveW = envl(wave.t, wave.dur, 0.32, 0.45);
          hz -= 0.14 * waveW;
          tz += 0.11 * waveW;
        }

        /* Blick: Ziel (Zeiger oder Umherschauen), weich nachgeführt */
        const L = st.look;
        L.yaw = damp(L.yaw, clamp(L.ty, -0.65, 0.65), 5, dt);
        L.pitch = damp(L.pitch, clamp(L.tp, -0.35, 0.3), 5, dt);
        hy += L.yaw * (1 - thinkW * 0.6);
        hx += L.pitch * (1 - thinkW * 0.6);
        tz -= L.yaw * 0.04;

        /* Sprechen: Maul öffnet/schließt, Kopf nickt leicht */
        const talking = st.talking || st.talkExtra;
        let target = 0;
        if (talking) target = W.reducedMotion ? 0.45 : clamp(0.32 + 0.68 * (0.55 * Math.sin(t * 15.5) + 0.35 * Math.sin(t * 23.3 + 1.3) + 0.25), 0, 1);
        if (cheer) target = Math.max(target, 0.75 * happy);
        st.open = damp(st.open, target, 28, dt);
        mouthPivot.scale.y = 0.05 + 0.95 * st.open;
        mouth.visible = st.open > 0.06;
        hx += 0.05 * st.open * calm;

        /* Blinzeln (gelegentlich doppelt) */
        st.blinkT -= dt;
        if (st.blinkT <= 0 && st.blinkK <= 0) { st.blinkK = 0.16; }
        let lid = 1;
        if (st.blinkK > 0) {
          st.blinkK -= dt;
          const u = 1 - st.blinkK / 0.16;
          lid = 1 - Math.sin(Math.PI * clamp(u, 0, 1)) * 0.92;
          if (st.blinkK <= 0) {
            if (!st.blinkDouble && Math.random() < 0.22) { st.blinkDouble = true; st.blinkT = 0.12; }
            else { st.blinkDouble = false; st.blinkT = 2.2 + Math.random() * 3.6; }
          }
        }
        const useHappy = happy > 0.5;
        for (let i = 0; i < 2; i++) {
          const e = eyes[i];
          e.blink.scale.y = lid;
          e.eye.visible = e.hi.visible = !useHappy;
          e.happy.visible = useHappy;
        }

        /* Augenbrauen: Freude hoch, Nachdenken schief; Ohren: Zucken, beim Jubeln
           nach hinten, beim Nachdenken eins hängen (i = 0: Flos rechte Seite, links im Bild) */
        for (let i = 0; i < 2; i++) {
          const s = i ? 1 : -1;
          const b = brows[i];
          const up = 0.012 * happy + 0.006 * st.open + 0.008 * waveW + thinkW * (s < 0 ? 0.022 : -0.006);
          b.socket.position.copy(b.base).addScaledVector(b.up, up);
          b.mesh.rotation.z = -0.12 * s + thinkW * (s < 0 ? 0.15 : -0.1);
          const ear = ears[i];
          st.earT[i] -= dt;
          if (st.earT[i] <= 0 && st.earK[i] <= 0) { st.earK[i] = 0.3; st.earT[i] = 3 + Math.random() * 6; }
          let tw = 0;
          if (st.earK[i] > 0) { st.earK[i] -= dt; tw = Math.sin(Math.PI * (1 - st.earK[i] / 0.3)) * calm; }
          ear.rotation.z = s * (0.32 * tw + 0.05 * Math.sin(t * 1.3 + i) * calm) - s * 0.12 * armsUp;
          ear.rotation.x = -0.25 * tw - 0.22 * happy + (s < 0 ? 0.3 : 0) * thinkW;
        }

        /* Schwanz wedelt (Welle über die Knochen) */
        const wagA = (0.2 + 0.32 * wagBoost) * calm;
        const wagF = 2.4 + 7 * wagBoost;
        for (let i = 0; i < tail.bones.length; i++) {
          const b = tail.bones[i];
          const ph = t * wagF - i * 0.75;
          b.rotation.y = i === 0 ? Math.sin(ph) * wagA * 0.8 : 0;
          b.rotation.z = i > 0 ? Math.sin(ph) * wagA * (0.5 + 0.25 * i) : 0;
          b.rotation.x = i > 0 ? -0.06 * thinkW + Math.sin(ph * 0.5) * 0.03 * calm : 0;
        }

        /* Arme */
        qTmp.copy(qRestL).slerp(qUpL, armsUp);
        if (thinkW > 0) qTmp.slerp(qChin, thinkW);
        arms[0].quaternion.copy(qTmp);
        arms[0].rotation.z += Math.sin(t * 2.1) * 0.03 * calm;
        qTmp.copy(qRestR).slerp(qUpR, armsUp);
        if (waveW > 0) {
          qOsc.setFromAxisAngle(Z, (0.06 + Math.sin(wave.t * 11) * 0.32) * (W.reducedMotion ? 0.3 : 1));
          qTmp.slerp(qOsc.multiply(qWave0), waveW); // um die Vorwärtsachse des Körpers hin und her
        }
        arms[1].quaternion.copy(qTmp);
        if (armsUp > 0 && !W.reducedMotion) { arms[0].rotation.z -= Math.sin(t * 18) * 0.12 * armsUp; arms[1].rotation.z += Math.sin(t * 18) * 0.12 * armsUp; }

        /* Beine: im Sprung anziehen */
        legs[0].rotation.x = legs[1].rotation.x = -0.6 * legTuck;

        /* zusammensetzen */
        torso.rotation.set(tx, 0, tz);
        headPivot.rotation.set(hx, hy, hz);
        head.position.y = 0.37 + hyPos;
        hop.position.y = jumpY;
        squash.scale.set(1 + sq * 0.55, 1 - sq, 1 + sq * 0.55);
        st.facingYaw = damp(st.facingYaw, st.facingTarget, 3, dt);
        facing.rotation.y = st.facingYaw + spin;
        shadow.scale.set(0.95 * (1 - jumpY * 0.6), 1, 0.75 * (1 - jumpY * 0.6));
        shadow.material.opacity = 0.38 * (1 - jumpY * 0.9);
      }

      // Höhe bis zu den Ohrspitzen (Ruhepose) – für Maßstab und Bildausschnitt
      root.updateMatrixWorld(true);
      const height = new T.Box3().setFromObject(root).max.y || 1.8;

      return {
        root, facing, head, headPivot, mats: MT, state: st,
        height,
        play,
        update,
        /** Blickziel relativ zum Körper (Bogenmaß): yaw + = nach rechts im Bild, pitch + = nach unten */
        lookAt(yaw, pitch) { st.look.ty = yaw; st.look.tp = pitch; },
        setTalking(on) { st.talking = !!on; },
        headWorld(out) { return head.getWorldPosition(out); },
      };
    }

    /* ==================================================================
       Zeiger verfolgen (Kopf folgt leicht Finger/Maus)
       ================================================================== */
    const pointer = { x: 0, y: 0, t: -1e9 };
    const onPtr = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); };
    window.addEventListener('pointermove', onPtr, { passive: true });
    window.addEventListener('pointerdown', onPtr, { passive: true, capture: true });
    /** Blickziel aus Zeiger (Bildschirm-Punkt des Kopfes hx/hy) oder Umherschauen */
    function aimAt(fox, hx, hy, facingYaw, dt) {
      const st = fox.state;
      const fresh = performance.now() - pointer.t < 3500;
      if (fresh) {
        const D = 520;
        const yaw = Math.atan2(pointer.x - hx, D) - facingYaw;
        const pitch = Math.atan2(pointer.y - hy, D * 1.4);
        fox.lookAt(yaw, pitch);
      } else {
        const w = st.wander;
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 1.8 + Math.random() * 3.2;
          const r = Math.random();
          w.yaw = r < 0.4 ? 0 : (Math.random() - 0.5) * 0.7;
          w.pitch = (Math.random() - 0.6) * 0.18;
        }
        fox.lookAt(w.yaw * (W.reducedMotion ? 0.2 : 1) - facingYaw * 0.6, w.pitch);
      }
    }

    /* ==================================================================
       Welt-Flo auf der Heimatinsel
       ================================================================== */
    const WORLD_H = 2.2; // Höhe in der Welt bis zu den Ohrspitzen (Held der Insel: etwas größer als die Requisiten)
    const world = createFox({ shadows: true, detail: 0.72 });
    const hub = W.islands.hub;
    const wroot = world.root;
    wroot.scale.setScalar(WORLD_H / world.height);
    if (hub && hub.group) {
      const a = hub.anchors && hub.anchors.flo;
      if (a) wroot.position.copy(a);
      else {
        // oben auf der Insel: Punkt vorn auf der Wiese suchen
        wroot.position.set(0, (hub.top || 2) * 0.5, 2.4);
      }
      hub.group.add(wroot);
    } else W.scene.add(wroot);
    wroot.traverse((o) => { o.userData.noMerge = true; });
    const wTmp = { cam: new T.Vector3(), head: new T.Vector3(), frustum: new T.Frustum(), m: new T.Matrix4(), sphere: new T.Sphere(new T.Vector3(), WORLD_H * 0.75) };
    let worldWaveAt = -1;
    W.onFrame((dt, t) => {
      const cam = W.camera;
      // nur bewegen, wenn sichtbar
      cam.updateMatrixWorld();
      wTmp.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      wTmp.frustum.setFromProjectionMatrix(wTmp.m);
      wroot.getWorldPosition(wTmp.sphere.center);
      wTmp.sphere.center.y += WORLD_H * 0.5;
      if (!wTmp.frustum.intersectsSphere(wTmp.sphere)) return;
      // zur Kamera drehen (in Insel-Koordinaten)
      wTmp.cam.copy(cam.position);
      if (wroot.parent) wroot.parent.worldToLocal(wTmp.cam);
      const yaw = Math.atan2(wTmp.cam.x - wroot.position.x, wTmp.cam.z - wroot.position.z);
      world.state.facingTarget = world.state.lockYaw != null ? world.state.lockYaw : world.state.facingYaw + Math.atan2(Math.sin(yaw - world.state.facingYaw), Math.cos(yaw - world.state.facingYaw));
      if (worldWaveAt > 0 && W.time >= worldWaveAt) { worldWaveAt = -1; world.play('wave'); }
      world.setTalking(talkingNow());
      if (performance.now() - pointer.t < 3500) { const s = W.toScreen(world.headWorld(wTmp.head)); aimAt(world, s.x, s.y, 0, dt); }
      else aimAt(world, 0, 0, 0, dt);
      world.update(dt, t);
    });

    /* ==================================================================
       Maskottchen-Leinwand (unten links)
       ================================================================== */
    const MS = { el: null, layer: null, fox: null, raf: 0, last: 0, rendered: false, lost: false, dirty: true, mo: null, ro: null, failed: false };
    const talkingNow = () => !!((LT.speech && LT.speech.speaking) || (MS.el && MS.el.classList.contains('talking')));
    const mascotVisible = () => !!(MS.el && MS.el.isConnected && !MS.el.classList.contains('hidden') && !document.hidden && W.enabled && !MS.lost);

    function setupMascotScene(L) {
      const scene = L.scene;
      L.renderer.toneMappingExposure = 0.94; // wie die Welt-Figur (Fell nicht ausgewaschen)
      try {
        const pm = new T.PMREMGenerator(L.renderer);
        scene.environment = pm.fromScene(new T.addons.RoomEnvironment(), 0.04).texture;
        pm.dispose();
      } catch (e) { scene.environment = null; }
      scene.environmentIntensity = 0.3;
      const hemi = new T.HemisphereLight('#d6ebff', '#e0b27a', 0.7);
      const key = new T.DirectionalLight('#ffeccc', 2.1);
      key.position.set(-3.2, 3.4, 2.2);
      const fill = new T.DirectionalLight('#cfe4ff', 0.25);
      fill.position.set(2.6, 0.8, 2.2);
      const rim = new T.DirectionalLight('#fff8ee', 1.3);
      rim.position.set(1.8, 2.6, -3.4);
      scene.add(hemi, key, fill, rim);
    }

    /** Kamera so setzen, dass Flo das .mascot-Feld füllt wie das SVG (Leinwand ist größer: Platz für Sprünge/Arme) */
    function frameMascot() {
      const L = MS.layer, el = MS.el, cv = L.canvas;
      const ew = el.clientWidth, eh = el.clientHeight, cw = cv.clientWidth, ch = cv.clientHeight;
      if (!ew || !eh || !cw || !ch) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      L.renderer.setPixelRatio(dpr);
      L.renderer.setSize(cw, ch, false);
      const cam = L.camera;
      const k = MS.fox.height / (1.12 * eh); // Welt-Einheiten je Pixel (Kopf und Körper füllen das Feld wie beim SVG, Ohren ragen etwas hinaus)
      const feetY = eh * 0.975; // Fußlinie im Feld (von oben)
      const cx = (cv.offsetLeft + cw / 2 - ew / 2) * k;
      const cy = (feetY - (cv.offsetTop + ch / 2)) * k;
      const fov = 18;
      const d = (ch * k) / 2 / Math.tan((fov * Math.PI) / 360);
      cam.fov = fov;
      cam.aspect = cw / ch;
      cam.near = d * 0.3;
      cam.far = d * 3;
      cam.position.set(cx, cy, d);
      cam.lookAt(cx, cy, 0);
      cam.updateProjectionMatrix();
      MS.k = k;
      return true;
    }

    function attachMascot() {
      const el = LT.ui && LT.ui.mascot && LT.ui.mascot();
      if (!el || el === MS.el || MS.failed) return;
      detachMascot();
      let L = null;
      try {
        L = W.layer({ parent: el, className: 'flo3d-canvas', dprCap: 2, fov: 18 });
      } catch (e) {
        console.warn('Flo 3D: keine Leinwand', e && e.message);
        MS.failed = true;
        return;
      }
      MS.el = el;
      MS.layer = L;
      L.canvas.setAttribute('aria-hidden', 'true');
      setupMascotScene(L);
      const fox = createFox({ shadows: false });
      fox.root.rotation.x = 0.1; // leicht von oben gesehen
      fox.state.facingTarget = fox.state.facingYaw = 0.32; // zum Bildinhalt gedreht
      L.scene.add(fox.root);
      MS.fox = fox;
      api.mascot = fox;
      MS.rendered = false;
      MS.dirty = true;
      // Größe, Sichtbarkeit, Sprechen beobachten
      if (window.ResizeObserver) { MS.ro = new ResizeObserver(() => { MS.dirty = true; }); MS.ro.observe(el); MS.ro.observe(L.canvas); }
      MS.mo = new MutationObserver(() => { if (MS.el && !MS.el.classList.contains('hidden') && MS.prevHidden) { MS.prevHidden = false; if (MS.fox) MS.fox.play('wave'); } kick(); });
      MS.mo.observe(el, { attributes: true, attributeFilter: ['class'] });
      MS.prevHidden = el.classList.contains('hidden');
      L.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); MS.lost = true; el.classList.remove('is-3d'); }, false);
      L.canvas.addEventListener('webglcontextrestored', () => { MS.lost = false; MS.rendered = false; MS.dirty = true; kick(); }, false);
      // Shader vorab übersetzen (ohne Ruckeln), dann starten
      let warm = null;
      try { frameMascot(); if (L.renderer.compileAsync && L.renderer.extensions.has('KHR_parallel_shader_compile')) warm = L.renderer.compileAsync(L.scene, L.camera); } catch (e) { warm = null; }
      if (warm && warm.then) Promise.race([warm.catch(() => null), new Promise((r) => setTimeout(r, 4000))]).then(kick);
      else kick();
    }
    function detachMascot() {
      if (!MS.layer) return;
      cancelAnimationFrame(MS.raf);
      MS.raf = 0;
      if (MS.ro) MS.ro.disconnect();
      if (MS.mo) MS.mo.disconnect();
      if (MS.el) MS.el.classList.remove('is-3d');
      try { MS.layer.dispose(); } catch (e) { /* egal */ }
      MS.layer = MS.fox = MS.el = null;
      api.mascot = null;
    }
    function kick() {
      if (MS.layer && !W.enabled) { detachMascot(); return; } // Welt doch ausgefallen → SVG-Flo
      if (!MS.layer || MS.raf || !mascotVisible()) {
        if (MS.el && MS.el.classList.contains('hidden')) MS.prevHidden = true;
        return;
      }
      MS.last = performance.now();
      MS.raf = requestAnimationFrame(tick);
    }
    let mTime = 0;
    function tick(now) {
      MS.raf = 0;
      if (!W.enabled) { detachMascot(); return; }
      if (!mascotVisible()) { if (MS.el && MS.el.classList.contains('hidden')) MS.prevHidden = true; return; }
      if (now - MS.last < 1000 / 30 - 3) { MS.raf = requestAnimationFrame(tick); return; } // höchstens 30 Bilder/s
      const dt = Math.min(0.05, Math.max(0.001, (now - MS.last) / 1000));
      MS.last = now;
      mTime += dt;
      try {
        if (MS.dirty) { if (frameMascot()) MS.dirty = false; }
        const fox = MS.fox;
        fox.setTalking(talkingNow());
        if (performance.now() - pointer.t < 3500) {
          const r = MS.el.getBoundingClientRect();
          aimAt(fox, r.left + r.width / 2, r.top + r.height * 0.3, fox.state.facingYaw, dt);
        } else aimAt(fox, 0, 0, fox.state.facingYaw, dt);
        fox.update(dt, mTime);
        MS.layer.renderer.render(MS.layer.scene, MS.layer.camera);
        if (!MS.rendered) { MS.rendered = true; MS.el.classList.add('is-3d'); }
      } catch (e) {
        console.error('Flo 3D', e);
        MS.failed = true;
        detachMascot();
        return;
      }
      MS.raf = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
    if (LT.speech && LT.speech.on) {
      LT.speech.on('start', () => { kick(); });
      LT.speech.on('end', () => { kick(); });
    }

    /* ==================================================================
       API
       ================================================================== */
    const inWorldPlace = () => W.place === 'splash' || W.place === 'home';
    const api = {
      mascot: null,
      world,
      cheer() { if (MS.fox) MS.fox.play('cheer'); if (inWorldPlace()) world.play('cheer'); kick(); },
      think() { if (MS.fox) MS.fox.play('think'); if (inWorldPlace()) world.play('think'); kick(); },
      wave() { if (MS.fox) MS.fox.play('wave'); world.play('wave'); kick(); },
      talk(on) { if (MS.fox) MS.fox.state.talkExtra = !!on; world.state.talkExtra = !!on; kick(); },
      onPlace(place) {
        // Start: Flo winkt, sobald die Kamera da ist; Weltkarte: noch einmal kurz
        if (place === 'splash') worldWaveAt = W.time + 0.9;
        else if (place === 'home' && api._lastPlace === 'splash') worldWaveAt = W.time + 1.2;
        api._lastPlace = typeof place === 'string' ? place : place && place.kind;
      },
      /** Nur Diagnose/Vorschau: Aktion name zum Zeitpunkt t einfrieren (null = normal weiter) */
      pose(name, t = 0) {
        const f = name ? { name, t } : null;
        world.state.freeze = f;
        if (MS.fox) MS.fox.state.freeze = f;
        if (!f) { world.state.acts = []; if (MS.fox) MS.fox.state.acts = []; }
        kick();
      },
      _attach: attachMascot,
      _m: MS,
    };
    attachMascot();
    return api;
  });
})();
