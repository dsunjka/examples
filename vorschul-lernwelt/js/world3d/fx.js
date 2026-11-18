/* ==========================================================================
   js/world3d/fx.js – 3D-Effekte: Belohnungen und Rückmeldungen → W.fx

   Eigene durchsichtige Vollbild-Leinwand (W.layer, Klasse .fx3d-canvas) über
   der ganzen Oberfläche inklusive Overlays (pointer-events: none). Sie
   rendert NUR, solange ein Effekt läuft (eigene requestAnimationFrame-
   Schleife, unabhängig von der Welt). Danach wird sie geleert, versteckt
   und nach einer Weile auf 1×1 Pixel verkleinert (Speicher).

   Bildraum: Die Kamera schaut so auf die Ebene z = 0, dass eine Welt-Einheit
   genau einem CSS-Pixel entspricht (Mitte des Fensters = Ursprung, y nach
   oben). Bildschirm-Punkte (getBoundingClientRect) lassen sich so direkt
   umrechnen; mit z davor/dahinter entsteht echte Tiefe.

   Effekte (alle mit Pools/Instanzen, keine Allokation pro Bild):
     Konfetti      taumelnde Papierstücke (mit Knick), Glanzfolie, Ringel-
                   Bänder und kleine Sterne – InstancedMesh, Physik mit
                   Luftwiderstand, Flattern; aus zwei „Konfetti-Kanonen“
                   unten links/rechts oder als Explosion an einem Punkt
     Stern-Flug    goldener 3D-Stern (facettiert, metallisch) fliegt im
                   Bogen von einem Element zur Sternanzeige bzw. zum
                   Fortschrittspunkt, mit Funkenspur und Schein; bei Ankunft
                   Funkenregen, dann LT.ui.bumpStars (+ Punkt hüpft)
     Funkeln       Glitzer-Burst am Element (Punkte + Funkelsterne)
     Feier         Feuerwerk (Raketen mit Spur, Kugel/Ring/Trauerweide) neben
                   dem Rundenende-Fenster und Glitzerregen
     Sticker       3D-Karte dreht sich herein, Glanzstreifen, Holo-Schimmer,
                   und gibt dann den Sticker (DOM) frei
   Funken/Glitzer sind EIN Points-System mit eigenem Shader (vormultipliertes
   Alpha, teils additiv: leuchtet auf dem Himmel, bleibt auf weißem Glas
   sichtbar).

   Auslöser:
     LT.ui.confetti / LT.ui.flyStar werden umhüllt: läuft die 3D-Welt → 3D,
     sonst das Original (flache Variante unverändert).
     MutationObserver: .tile.is-correct und .joy → Funkeln; Sterne im
     Rundenende (.round-stars .emoji.on) → goldenes Funkeln;
     [data-test="round-end"] erscheint → Feier; .sticker-reveal → Karte.

   API (W.fx):
     confetti(opts)              opts: Zahl n oder {n, x, y, colors}; true = übernommen
     starFly(fromEl, toEl, onDone)   toEl optional (wie bisher: aktueller Punkt
                                 oder .star-counter); onDone statt bumpStars
     sparkle(el | {x, y}, opts)  opts: {gold, n}
     celebrate(opts)             opts: {el} (Fenster, neben dem es knallt)
     sticker(el)                 Sticker-Karte für ein .sticker-reveal
     onPlace(place)              vom Kern bei jedem W.go: laufende Feiern enden
     stop()                      alles sofort beenden
     live()                      3D-Effekte möglich?
     debug()                     Zähler, Draw-Calls, Größe (Diagnose)

   W.reducedMotion: sehr reduzierte, ruhige Effekte (kein Flug, kein
   Feuerwerk, wenige still verglimmende Funken). W.quality 'low': halbe Mengen,
   Auflösung 1×.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;
  const W0 = LT.w3d;

  /* ------------------------------------------------------------------
     LT.ui umhüllen: mit laufender 3D-Welt → 3D-Effekt, sonst Original
     ------------------------------------------------------------------ */
  const live = () => !!(W0.fx && typeof W0.fx.live === 'function' && W0.fx.live());
  if (LT.ui) {
    const origConfetti = LT.ui.confetti;
    const origFly = LT.ui.flyStar;
    if (typeof origConfetti === 'function') {
      LT.ui.confetti = function (n) {
        try { if (live() && W0.fx.confetti({ n })) return; } catch (e) { console.error('fx3d confetti', e); }
        return origConfetti.apply(this, arguments);
      };
    }
    if (typeof origFly === 'function') {
      LT.ui.flyStar = function (fromEl, symbol) {
        try { if ((symbol === undefined || symbol === '⭐') && live() && W0.fx.starFly(fromEl)) return; } catch (e) { console.error('fx3d flyStar', e); }
        return origFly.apply(this, arguments);
      };
    }
  }

  W0.register('fx', function (W) {
    const T = W.THREE;
    const TAU = Math.PI * 2;
    const FOV = 30;
    const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
    const R = Math.random;
    const rnd = (a, b) => a + (b - a) * R();
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

    /* ---------------- Farben ---------------- */
    // linear (für beleuchtete Materialien, Instanzfarben)
    const lin = (hex) => { const c = new T.Color(hex); return [c.r, c.g, c.b]; };
    // sRGB-Werte direkt (für den Funken-Shader, der ohne Umrechnung schreibt)
    const srgb = (hex) => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16) || 0; return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
    const CONFETTI_HEX = ['#ff8a3d', '#8e6cef', '#ff5fa2', '#1fb5c9', '#3dbe6b', '#ffc533', '#4a90e2', '#ff6b6b'];
    const CONFETTI = CONFETTI_HEX.map(lin);
    const FOIL = ['#ffd24a', '#e9eef7', '#ff9ccf', '#9fe3ff', '#ffc06b'].map(lin);
    const GOLD = ['#ffc81f', '#ffdd55', '#ffa514', '#fff0a0'].map(srgb);
    const SPARK_WARM = ['#ffc81f', '#fff6d0', '#ff9f1c', '#ffe066'].map(srgb);
    const SPARK_TILE = ['#ffc81f', '#ff9ad5', '#5fd3ff', '#9ee86a', '#b48cff', '#ffa514'].map(srgb);
    const GLITTER = ['#ffd23f', '#ffffff', '#ff9ad5', '#9fe7ff', '#b9f27a', '#c9a8ff'].map(srgb);
    const FIREWORK = [
      ['#ff5fa2', '#ffd23f'], ['#4a90e2', '#9fe7ff'], ['#3dbe6b', '#e6ff7a'],
      ['#8e6cef', '#ff9ad5'], ['#ff8a3d', '#fff1a8'], ['#1fb5c9', '#ffffff'],
    ].map((p) => p.map(srgb));
    const WHITE = srgb('#ffffff');
    const pick = (arr) => arr[(R() * arr.length) | 0];

    /** Farbe der aktuellen Insel (--area) oder null */
    function areaHex(el) {
      try {
        const n = (el && el.closest && el.closest('[style*="--area"]')) || document.querySelector('.overlay') || document.querySelector('#app > .screen');
        const v = n ? getComputedStyle(n).getPropertyValue('--area').trim() : '';
        return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
      } catch (e) { return null; }
    }

    /* ---------------- Zustand ---------------- */
    const S = {
      L: null, failed: false, lost: false,
      raf: 0, last: 0, t: 0, frames: 0,
      w: 0, h: 0, dpr: 1, D: 1000, U: 1, small: false, visible: false, shrinkT: 0,
    };
    const BODIES = [];
    let PAPER = null, FOILS = null, RIBBON = null, STARS = null;
    let SP = null; // Funken
    let FLY = null; // Stern-Flüge
    const ROCKETS = [];
    const RAIN = { on: false, t: 0, dur: 0, rate: 0, acc: 0 };
    let CARD = null;

    /* ---------------- Geometrien ---------------- */
    /** facettierter, gewölbter Stern (Spitze oben), Radius 1 */
    function starGeometry(inner = 0.5, edge = 0.15, apex = 0.42) {
      const rf = [], rb = [];
      for (let k = 0; k < 10; k++) {
        const a = Math.PI / 2 + (k * Math.PI) / 5;
        const r = k % 2 ? inner : 1;
        rf.push([Math.cos(a) * r, Math.sin(a) * r, edge]);
        rb.push([Math.cos(a) * r, Math.sin(a) * r, -edge]);
      }
      const pos = [];
      const tri = (a, b, c) => pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      const F = [0, 0, apex], B = [0, 0, -apex];
      for (let k = 0; k < 10; k++) {
        const k1 = (k + 1) % 10;
        tri(F, rf[k], rf[k1]);
        tri(B, rb[k1], rb[k]);
        tri(rf[k], rb[k], rb[k1]);
        tri(rf[k], rb[k1], rf[k1]);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }
    /** Papierstück mit Knick in der Mitte (fängt Licht beim Taumeln) */
    function paperGeometry() {
      const g = new T.PlaneGeometry(1, 1.4, 2, 1);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) < 1e-6) p.setZ(i, 0.17);
      g.computeVertexNormals();
      return g;
    }
    /** geringeltes Band (Luftschlange), Länge 1 entlang y */
    function ribbonGeometry() {
      const N = 40, turns = 1.8, Rr = 0.15, wid = 0.12;
      const pos = [], idx = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, a = u * turns * TAU;
        const taper = Math.min(1, u * 8, (1 - u) * 8);
        const x = Math.cos(a) * Rr, z = Math.sin(a) * Rr, y = u - 0.5;
        const hw = (wid / 2) * (0.35 + 0.65 * taper);
        pos.push(x, y - hw, z, x, y + hw, z);
        if (i < N) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    }

    /** Material leuchtet mit k × eigener Farbe (inkl. Instanzfarbe) selbst */
    function selfLit(mat, k) {
      mat.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += diffuseColor.rgb * ' + k.toFixed(3) + ';');
      };
      mat.customProgramCacheKey = () => 'fx-selflit-' + k;
      return mat;
    }

    /* ---------------- Körper-Pools (InstancedMesh) ---------------- */
    function makePool(name, geo, mat, cap) {
      const mesh = new T.InstancedMesh(geo, mat, cap);
      mesh.name = 'fx-' + name;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      const C = new Float32Array(cap * 3).fill(1);
      mesh.instanceColor = new T.InstancedBufferAttribute(C, 3);
      mesh.instanceColor.setUsage(T.DynamicDrawUsage);
      mesh.count = 0;
      S.L.scene.add(mesh);
      const B = {
        name, mesh, cap, n: 0, M: mesh.instanceMatrix.array, C, dirtyC: false,
        P: new Float32Array(cap * 3), V: new Float32Array(cap * 3), Q: new Float32Array(cap * 4), A: new Float32Array(cap * 3), SC: new Float32Array(cap * 3),
        life: new Float32Array(cap), max: new Float32Array(cap), delay: new Float32Array(cap), drag: new Float32Array(cap),
        flut: new Float32Array(cap), freq: new Float32Array(cap), ph: new Float32Array(cap), grav: new Float32Array(cap),
      };
      BODIES.push(B);
      return B;
    }
    /** neues Teil anlegen; liefert Index oder -1 (Pool voll). Zufällige Lage, Drehachse. */
    function addBody(B, x, y, z, vx, vy, vz, s, rgb, spin) {
      if (B.n >= B.cap) return -1;
      const i = B.n++, i3 = i * 3, i4 = i * 4;
      B.P[i3] = x; B.P[i3 + 1] = y; B.P[i3 + 2] = z;
      B.V[i3] = vx; B.V[i3 + 1] = vy; B.V[i3 + 2] = vz;
      // gleichverteilte Zufallsdrehung
      const u1 = R(), u2 = R() * TAU, u3 = R() * TAU, s1 = Math.sqrt(1 - u1), s2 = Math.sqrt(u1);
      B.Q[i4] = s1 * Math.sin(u2); B.Q[i4 + 1] = s1 * Math.cos(u2); B.Q[i4 + 2] = s2 * Math.sin(u3); B.Q[i4 + 3] = s2 * Math.cos(u3);
      let ax = R() - 0.5, ay = R() - 0.5, az = R() - 0.5;
      const al = Math.hypot(ax, ay, az) || 1;
      B.A[i3] = (ax / al) * spin; B.A[i3 + 1] = (ay / al) * spin; B.A[i3 + 2] = (az / al) * spin;
      B.SC[i3] = B.SC[i3 + 1] = B.SC[i3 + 2] = s;
      B.C[i3] = rgb[0]; B.C[i3 + 1] = rgb[1]; B.C[i3 + 2] = rgb[2];
      B.dirtyC = true;
      B.life[i] = 0; B.max[i] = 6; B.delay[i] = 0; B.drag[i] = 3; B.flut[i] = 0; B.freq[i] = 3; B.ph[i] = R() * TAU; B.grav[i] = 600;
      return i;
    }
    function cp(arr, n, i, j) { const a = i * n, b = j * n; for (let k = 0; k < n; k++) arr[a + k] = arr[b + k]; }
    function killBody(B, i) {
      const j = --B.n;
      if (i === j) return;
      cp(B.P, 3, i, j); cp(B.V, 3, i, j); cp(B.Q, 4, i, j); cp(B.A, 3, i, j); cp(B.SC, 3, i, j); cp(B.C, 3, i, j); cp(B.M, 16, i, j);
      B.life[i] = B.life[j]; B.max[i] = B.max[j]; B.delay[i] = B.delay[j]; B.drag[i] = B.drag[j];
      B.flut[i] = B.flut[j]; B.freq[i] = B.freq[j]; B.ph[i] = B.ph[j]; B.grav[i] = B.grav[j];
      B.dirtyC = true;
    }
    /** Matrix aus Lage, Quaternion und Größe direkt ins Instanz-Feld (wie Matrix4.compose) */
    function compose(M, o, x, y, z, qx, qy, qz, qw, sx, sy, sz) {
      const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
      const xx = qx * x2, xy = qx * y2, xz = qx * z2, yy = qy * y2, yz = qy * z2, zz = qz * z2;
      const wx = qw * x2, wy = qw * y2, wz = qw * z2;
      M[o] = (1 - (yy + zz)) * sx; M[o + 1] = (xy + wz) * sx; M[o + 2] = (xz - wy) * sx; M[o + 3] = 0;
      M[o + 4] = (xy - wz) * sy; M[o + 5] = (1 - (xx + zz)) * sy; M[o + 6] = (yz + wx) * sy; M[o + 7] = 0;
      M[o + 8] = (xz + wy) * sz; M[o + 9] = (yz - wx) * sz; M[o + 10] = (1 - (xx + yy)) * sz; M[o + 11] = 0;
      M[o + 12] = x; M[o + 13] = y; M[o + 14] = z; M[o + 15] = 1;
    }
    function stepBodies(B, dt, t) {
      const P = B.P, V = B.V, Q = B.Q, A = B.A, M = B.M, SC = B.SC;
      const yDead = -S.h / 2 - 90, xDead = S.w / 2 + 300;
      for (let i = B.n - 1; i >= 0; i--) {
        const i3 = i * 3, i4 = i * 4;
        if (B.delay[i] > 0) {
          B.delay[i] -= dt;
          compose(M, i * 16, P[i3], P[i3 + 1], P[i3 + 2], 0, 0, 0, 1, 0, 0, 0);
          continue;
        }
        const life = (B.life[i] += dt);
        const k = B.drag[i];
        const fl = B.flut[i] ? Math.sin(t * B.freq[i] + B.ph[i]) * B.flut[i] : 0;
        V[i3] += (fl - k * V[i3]) * dt;
        V[i3 + 1] += (-B.grav[i] - k * V[i3 + 1]) * dt;
        V[i3 + 2] += (fl * 0.5 - k * V[i3 + 2]) * dt;
        P[i3] += V[i3] * dt; P[i3 + 1] += V[i3 + 1] * dt; P[i3 + 2] += V[i3 + 2] * dt;
        if (life >= B.max[i] || (P[i3 + 1] < yDead && V[i3 + 1] < 0) || Math.abs(P[i3]) > xDead) { killBody(B, i); continue; }
        // Drehung: q += ½·(ω,0)·q·dt
        let qx = Q[i4], qy = Q[i4 + 1], qz = Q[i4 + 2], qw = Q[i4 + 3];
        const hx = 0.5 * A[i3] * dt, hy = 0.5 * A[i3 + 1] * dt, hz = 0.5 * A[i3 + 2] * dt;
        const nx = qx + (hx * qw + hy * qz - hz * qy);
        const ny = qy + (hy * qw + hz * qx - hx * qz);
        const nz = qz + (hz * qw + hx * qy - hy * qx);
        const nw = qw + (-hx * qx - hy * qy - hz * qz);
        const ql = 1 / (Math.hypot(nx, ny, nz, nw) || 1);
        qx = Q[i4] = nx * ql; qy = Q[i4 + 1] = ny * ql; qz = Q[i4 + 2] = nz * ql; qw = Q[i4 + 3] = nw * ql;
        // Auftauchen (kurz) und Verschwinden (letzte halbe Sekunde)
        const sc = Math.min(1, life * 10, (B.max[i] - life) * 2.2);
        compose(M, i * 16, P[i3], P[i3 + 1], P[i3 + 2], qx, qy, qz, qw, SC[i3] * sc, SC[i3 + 1] * sc, SC[i3 + 2] * sc);
      }
      const mesh = B.mesh;
      mesh.count = B.n;
      if (B.n) {
        const im = mesh.instanceMatrix;
        im.clearUpdateRanges(); im.addUpdateRange(0, B.n * 16); im.needsUpdate = true;
        if (B.dirtyC) { const ic = mesh.instanceColor; ic.clearUpdateRanges(); ic.addUpdateRange(0, B.n * 3); ic.needsUpdate = true; B.dirtyC = false; }
      }
    }

    /* ---------------- Funken (ein Points-System) ---------------- */
    const SPARK_VS = [
      'attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aRot; attribute float aShape;',
      'uniform float uScale;',
      'varying vec3 vColor; varying float vAlpha; varying float vShape; varying float vRot;',
      'void main() {',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = max(0.0, aSize * uScale / -mv.z);',
      '  vColor = aColor; vAlpha = aAlpha; vShape = aShape; vRot = aRot;',
      '}',
    ].join('\n');
    const SPARK_FS = [
      'varying vec3 vColor; varying float vAlpha; varying float vShape; varying float vRot;',
      'void main() {',
      '  vec2 p = gl_PointCoord * 2.0 - 1.0;',
      '  float cr = cos(vRot), sr = sin(vRot);',
      '  p = vec2(cr * p.x - sr * p.y, sr * p.x + cr * p.y);',
      '  float r = length(p);',
      '  if (r > 1.0) discard;',
      '  float glow = exp(-r * r * 6.0);',
      '  float a; float hot;',
      '  if (vShape < 0.5) {', // Glitzerperle mit Schein und weißem Kern
      '    float body = 1.0 - smoothstep(0.30, 0.44, r);',
      '    a = max(body, glow * 0.5);',
      '    hot = exp(-r * r * 46.0) * 0.85;',
      '  } else if (vShape < 1.5) {', // Funkelstern: vier lange, zwei kurze Diagonal-Strahlen
      '    vec2 q = abs(p);',
      '    float rays = exp(-q.y * 13.0) * (1.0 - q.x) + exp(-q.x * 13.0) * (1.0 - q.y);',
      '    float diag = exp(-abs(q.x - q.y) * 12.0) * max(0.0, 0.5 - r) * 1.3;',
      '    float core = exp(-r * r * 22.0);',
      '    a = clamp(rays * 1.15 + diag + core + glow * 0.3, 0.0, 1.0);',
      '    hot = core * 0.9 + rays * 0.12;',
      '  } else {', // weicher Schein (Blitz, Halo)
      '    a = glow * glow;',
      '    hot = glow * 0.55;',
      '  }',
      '  a *= vAlpha;',
      '  if (a < 0.004) discard;',
      '  vec3 col = mix(vColor, vec3(1.0), clamp(hot, 0.0, 1.0));',
      // vormultipliert, Alpha etwas kleiner → teils additiv (leuchtet auf Himmel, sichtbar auf Weiß)
      '  gl_FragColor = vec4(col * a, a * 0.9);',
      '}',
    ].join('\n');
    const PREMUL = { transparent: true, blending: T.CustomBlending, blendEquation: T.AddEquation, blendSrc: T.OneFactor, blendDst: T.OneMinusSrcAlphaFactor, blendSrcAlpha: T.OneFactor, blendDstAlpha: T.OneMinusSrcAlphaFactor };

    function makeSparks(cap) {
      const geo = new T.BufferGeometry();
      const mk = (n, name) => { const a = new T.BufferAttribute(new Float32Array(cap * n), n); a.setUsage(T.DynamicDrawUsage); geo.setAttribute(name, a); return a; };
      const aP = mk(3, 'position'), aC = mk(3, 'aColor'), aS = mk(1, 'aSize'), aA = mk(1, 'aAlpha'), aR = mk(1, 'aRot'), aSh = mk(1, 'aShape');
      geo.setDrawRange(0, 0);
      const mat = new T.ShaderMaterial(Object.assign({ uniforms: { uScale: { value: 1 } }, vertexShader: SPARK_VS, fragmentShader: SPARK_FS, depthWrite: false, depthTest: true }, PREMUL));
      const pts = new T.Points(geo, mat);
      pts.name = 'fx-sparks';
      pts.frustumCulled = false;
      pts.renderOrder = 30;
      S.L.scene.add(pts);
      return {
        cap, n: 0, geo, mat, pts, attrs: [aP, aC, aS, aA, aR, aSh],
        P: aP.array, C: aC.array, SZ: aS.array, AL: aA.array, RO: aR.array, SH: aSh.array,
        V: new Float32Array(cap * 3), life: new Float32Array(cap), max: new Float32Array(cap), s0: new Float32Array(cap), a0: new Float32Array(cap),
        drag: new Float32Array(cap), grav: new Float32Array(cap), spin: new Float32Array(cap), mode: new Uint8Array(cap), ph: new Float32Array(cap),
      };
    }
    /**
     * Funke anlegen (Welt-Koordinaten, px). mode: 0 Burst, 1 Spur, 2 Schein/Blitz,
     * 3 Funkeln (wächst und schrumpft), 4 Knistern (Burst, flackert am Ende), 5 Regen.
     * shape: 0 Perle, 1 Funkelstern, 2 weicher Schein. delay: Sekunden bis sichtbar.
     */
    function spark(x, y, z, vx, vy, vz, size, life, rgb, shape, mode, drag, grav, alpha, delay) {
      const s = SP;
      if (!s || s.n >= s.cap) return;
      const i = s.n++, i3 = i * 3;
      s.P[i3] = x; s.P[i3 + 1] = y; s.P[i3 + 2] = z;
      s.V[i3] = vx; s.V[i3 + 1] = vy; s.V[i3 + 2] = vz;
      s.C[i3] = rgb[0]; s.C[i3 + 1] = rgb[1]; s.C[i3 + 2] = rgb[2];
      s.SZ[i] = 0; s.AL[i] = 0; s.RO[i] = R() * TAU; s.SH[i] = shape;
      s.life[i] = -(delay || 0); s.max[i] = life; s.s0[i] = size; s.a0[i] = alpha == null ? 1 : alpha;
      s.drag[i] = drag || 0; s.grav[i] = grav || 0; s.mode[i] = mode;
      s.spin[i] = shape === 1 ? rnd(-2.5, 2.5) : 0;
      s.ph[i] = R() * TAU;
    }
    function killSpark(i) {
      const s = SP, j = --s.n;
      if (i === j) return;
      cp(s.P, 3, i, j); cp(s.V, 3, i, j); cp(s.C, 3, i, j);
      s.SZ[i] = s.SZ[j]; s.AL[i] = s.AL[j]; s.RO[i] = s.RO[j]; s.SH[i] = s.SH[j];
      s.life[i] = s.life[j]; s.max[i] = s.max[j]; s.s0[i] = s.s0[j]; s.a0[i] = s.a0[j];
      s.drag[i] = s.drag[j]; s.grav[i] = s.grav[j]; s.mode[i] = s.mode[j]; s.spin[i] = s.spin[j]; s.ph[i] = s.ph[j];
    }
    function stepSparks(dt, t) {
      const s = SP;
      if (!s) return;
      const P = s.P, V = s.V;
      for (let i = s.n - 1; i >= 0; i--) {
        const i3 = i * 3;
        const life = (s.life[i] += dt);
        if (life < 0) { s.SZ[i] = 0; s.AL[i] = 0; continue; }
        const max = s.max[i];
        if (life >= max) { killSpark(i); continue; }
        const k = s.drag[i];
        if (k) { const f = Math.max(0, 1 - k * dt); V[i3] *= f; V[i3 + 1] *= f; V[i3 + 2] *= f; }
        V[i3 + 1] -= s.grav[i] * dt;
        P[i3] += V[i3] * dt; P[i3 + 1] += V[i3 + 1] * dt; P[i3 + 2] += V[i3 + 2] * dt;
        s.RO[i] += s.spin[i] * dt;
        const u = life / max;
        let sz, al;
        switch (s.mode[i]) {
          case 1: sz = 1 - u; al = 1 - u; break; // Spur
          case 2: sz = 0.75 + 0.45 * u; al = (1 - u) * (1 - u); break; // Schein
          case 3: { const b = Math.sin(Math.PI * u); sz = Math.pow(b, 0.7); al = Math.min(1, b * 1.6); break; } // Funkeln
          case 4: { // Knistern
            sz = Math.min(1, life * 14) * Math.pow(1 - u, 0.35);
            al = Math.min(1, (1 - u) * 3);
            if (u > 0.45) al *= 0.35 + 0.65 * Math.abs(Math.sin(t * 23 + s.ph[i]));
            break;
          }
          case 5: { // Regen: ein- und ausblenden, funkeln
            sz = 1;
            al = Math.min(1, life * 3, (max - life) * 2) * (0.45 + 0.55 * Math.abs(Math.sin(t * 5 + s.ph[i])));
            break;
          }
          default: sz = Math.min(1, life * 14) * Math.pow(1 - u, 0.6); al = Math.min(1, (1 - u) * 3.3); // Burst
        }
        s.SZ[i] = s.s0[i] * sz;
        s.AL[i] = s.a0[i] * al;
      }
      s.geo.setDrawRange(0, s.n);
      if (s.n) {
        const sizes = [3, 3, 1, 1, 1, 1];
        for (let a = 0; a < s.attrs.length; a++) { const at = s.attrs[a]; at.clearUpdateRanges(); at.addUpdateRange(0, s.n * sizes[a]); at.needsUpdate = true; }
      }
    }

    /* ---------------- Aufbau ---------------- */
    function build() {
      const L = W.layer({ parent: document.body, className: 'fx3d-canvas', dprCap: 2, fov: FOV });
      S.L = L;
      L.canvas.setAttribute('aria-hidden', 'true');
      L.renderer.toneMapping = T.NeutralToneMapping != null ? T.NeutralToneMapping : T.ACESFilmicToneMapping;
      L.renderer.toneMappingExposure = 1.0;
      const scene = L.scene;
      // Licht wie in der Welt: weiche Sonne von links oben, warmer Boden
      const hemi = new T.HemisphereLight('#ffffff', '#ffd9a8', 1.35);
      const sun = new T.DirectionalLight('#fff3df', 2.2);
      sun.position.set(-0.55, 0.9, 0.8);
      scene.add(hemi, sun);

      // Konfetti (selbstleuchtender Anteil: kein Stück wird im Schatten dunkel – Spielzeug-Look)
      const paperGeo = paperGeometry();
      const starGeo = starGeometry();
      PAPER = makePool('paper', paperGeo, selfLit(new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0, side: T.DoubleSide, flatShading: true, envMapIntensity: 0.6 }), 0.3), 420);
      FOILS = makePool('foil', paperGeo, selfLit(new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.26, metalness: 0.55, side: T.DoubleSide, flatShading: true, envMapIntensity: 1.3 }), 0.22), 80);
      RIBBON = makePool('ribbon', ribbonGeometry(), selfLit(new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, metalness: 0.1, side: T.DoubleSide, envMapIntensity: 0.8 }), 0.28), 60);
      STARS = makePool('star', starGeo, selfLit(new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.4, flatShading: true, envMapIntensity: 1.2 }), 0.22), 60);

      // Stern-Flug: goldene Sterne (Instanzen)
      const goldMat = selfLit(new T.MeshStandardMaterial({ color: '#ffc928', roughness: 0.24, metalness: 0.38, emissive: '#ff9f00', emissiveIntensity: 0.35, flatShading: true, envMapIntensity: 1.25 }), 0.12);
      const flyMesh = new T.InstancedMesh(starGeo, goldMat, 8);
      flyMesh.name = 'fx-flystar';
      flyMesh.frustumCulled = false;
      flyMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      flyMesh.count = 0;
      flyMesh.renderOrder = 5;
      scene.add(flyMesh);
      FLY = { mesh: flyMesh, list: [] };
      for (let i = 0; i < 8; i++) FLY.list.push({ on: false, t: 0, dur: 1, ax: 0, ay: 0, cx: 0, cy: 0, bx: 0, by: 0, x: 0, y: 0, z: 0, s0: 40, s1: 20, side: 1, acc: 0, n: 0, t0: 0, el: null, done: null });
      for (let i = 0; i < 10; i++) ROCKETS.push({ on: false, delay: 0, t: 0, dur: 1, x0: 0, y0: 0, x1: 0, y1: 0, z: 0, x: 0, y: 0, pal: 0, style: 0, el: null, i: 0 });

      SP = makeSparks(2600);
      CARD = buildCard(scene);

      L.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); S.lost = true; hardStop(); }, false);
      L.canvas.addEventListener('webglcontextrestored', () => { S.lost = false; S.w = 0; }, false);

      // Shader vorab übersetzen (sonst ruckelt der erste Effekt)
      size();
      try {
        if (L.renderer.compileAsync && L.renderer.extensions.has('KHR_parallel_shader_compile')) L.renderer.compileAsync(scene, L.camera).catch(() => null);
        else L.renderer.compile(scene, L.camera);
      } catch (e) { /* egal */ }
      shrinkLater(4000);
    }
    function ensure() {
      if (S.L) return !S.lost;
      if (S.failed || !W.enabled || !W.started) return false;
      try { build(); return true; } catch (e) {
        console.warn('3D-Effekte nicht verfügbar:', e && e.message);
        S.failed = true;
        try { if (S.L) S.L.dispose(); } catch (err) { /* egal */ }
        S.L = null;
        return false;
      }
    }

    /* Größe: 1 Welt-Einheit = 1 CSS-Pixel auf der Ebene z = 0 */
    function size() {
      const w = Math.max(1, window.innerWidth || 1), h = Math.max(1, window.innerHeight || 1);
      const cap = W.quality === 'low' ? 1 : W.quality === 'medium' ? 1.25 : 1.5;
      // große Fenster: höchstens ~2,4 Mio. Pixel (Leinwand mit Kantenglättung kostet Speicher)
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, cap, Math.sqrt(2.4e6 / (w * h))));
      if (w === S.w && h === S.h && dpr === S.dpr && !S.small) return;
      S.w = w; S.h = h; S.dpr = dpr; S.small = false;
      const r = S.L.renderer, cam = S.L.camera;
      r.setPixelRatio(dpr);
      r.setSize(w, h, false);
      S.D = h / 2 / TAN;
      // Maßstab der Effekte (1 bei ~820 px kurzer Seite; Telefone nicht zu winzig)
      S.U = clamp(Math.pow(Math.min(w, h) / 820, 0.7), 0.6, 1.4);
      cam.fov = FOV;
      cam.aspect = w / h;
      cam.near = Math.max(5, S.D * 0.2);
      cam.far = S.D * 3;
      cam.position.set(0, 0, S.D);
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld(true);
      SP.mat.uniforms.uScale.value = S.D * dpr;
    }
    function shrinkLater(ms) {
      clearTimeout(S.shrinkT);
      S.shrinkT = setTimeout(() => {
        if (S.raf || !S.L || S.lost) return;
        try { S.L.renderer.setSize(1, 1, false); S.small = true; } catch (e) { /* egal */ }
      }, ms);
    }

    /* ---------------- Schleife ---------------- */
    function busy() {
      if (PAPER.n || FOILS.n || RIBBON.n || STARS.n || SP.n || RAIN.on || CARD.on) return true;
      for (const f of FLY.list) if (f.on) return true;
      for (const r of ROCKETS) if (r.on) return true;
      return false;
    }
    /** Effekt anfordern: Leinwand bauen/aufwecken. false → kein 3D (Original benutzen) */
    function wake() {
      if (!api.live() || !ensure()) return false;
      size();
      clearTimeout(S.shrinkT);
      S.lastReq = performance.now();
      if (!S.raf && !S.frozen) { S.last = performance.now(); S.raf = requestAnimationFrame(frame); }
      return true;
    }
    function step(dt) {
      S.t += dt;
      const t = S.t;
      size();
      stepFlights(dt);
      stepRockets(dt);
      stepRain(dt);
      stepCard(dt);
      for (let b = 0; b < BODIES.length; b++) stepBodies(BODIES[b], dt, t);
      stepSparks(dt, t);
    }
    /** Effekte enden spätestens so lange nach der letzten Anforderung (auch bei sehr wenigen Bildern/s) */
    const MAX_RUN = 12000;
    function frame(now) {
      S.raf = 0;
      if (S.lost || S.failed || !S.L || S.frozen) return;
      // bis 0,1 s pro Schritt: auch bei wenigen Bildern/s laufen die Effekte etwa in Echtzeit ab
      const dt = Math.min(0.1, Math.max(0.001, (now - S.last) / 1000));
      S.last = now;
      if (performance.now() - S.lastReq > MAX_RUN) { hardStop(); rest(); return; }
      try {
        step(dt);
        S.L.renderer.render(S.L.scene, S.L.camera);
        S.frames++;
        if (!S.visible) { S.L.canvas.classList.add('is-on'); S.visible = true; }
      } catch (e) {
        console.error('fx3d', e);
        S.failed = true;
        hardStop();
        return;
      }
      if (busy()) S.raf = requestAnimationFrame(frame);
      else rest();
    }
    /** nichts mehr zu tun: leeren, verstecken, später Speicher freigeben */
    function rest() {
      try { S.L.renderer.clear(); } catch (e) { /* egal */ }
      S.L.canvas.classList.remove('is-on');
      S.visible = false;
      shrinkLater(8000);
    }
    function hardStop() {
      cancelAnimationFrame(S.raf);
      S.raf = 0;
      if (!S.L) return;
      BODIES.forEach((B) => { B.n = 0; B.mesh.count = 0; });
      if (SP) { SP.n = 0; SP.geo.setDrawRange(0, 0); }
      if (FLY) FLY.list.forEach((f) => { if (f.on) finishFlight(f, false); });
      ROCKETS.forEach((r) => { r.on = false; });
      RAIN.on = false;
      if (CARD && CARD.on) endCard();
      S.L.canvas.classList.remove('is-on');
      S.visible = false;
    }

    /* ---------------- Umrechnung Bildschirm ↔ Welt ---------------- */
    const wx = (x) => x - S.w / 2;
    const wy = (y) => S.h / 2 - y;
    function rectOf(el) {
      if (!el || !el.getBoundingClientRect || !el.isConnected) return null;
      const r = el.getBoundingClientRect();
      if (!(r.width || r.height)) return null;
      return r;
    }

    /* ==================================================================
       Konfetti
       ================================================================== */
    function confetti(opts) {
      opts = typeof opts === 'number' ? { n: opts } : opts || {};
      if (!wake()) return false;
      const U = S.U, w = S.w, h = S.h, D = S.D;
      let n = clamp(Math.round(Number(opts.n) || 70), 8, 220);
      if (W.quality === 'low') n = Math.round(n * 0.55);
      const extra = areaHex();
      const pal = opts.colors ? opts.colors.map(lin) : extra ? CONFETTI.concat([lin(extra), lin(extra)]) : CONFETTI;

      if (W.reducedMotion) {
        // ruhig: wenige Papierstücke erscheinen oben, sinken kaum und verglimmen
        const m = Math.max(6, Math.round(n / 6));
        for (let k = 0; k < m; k++) {
          const i = addBody(PAPER, rnd(-0.45, 0.45) * w, rnd(0.05, 0.42) * h, rnd(-60, 60), 0, 0, 0, rnd(10, 14) * U, pick(pal), rnd(0.3, 0.8));
          if (i < 0) break;
          PAPER.drag[i] = 6; PAPER.grav[i] = 90 * U; PAPER.max[i] = rnd(1.4, 2.0); PAPER.delay[i] = rnd(0, 0.3);
        }
        return true;
      }

      const at = opts.x != null && opts.y != null;
      const bx = at ? wx(opts.x) : 0, by = at ? wy(opts.y) : 0;
      // Teilchen-Arten: Pool, Anzahl, Luftwiderstand, Schwere, Größe, Drehung, Flattern
      const kinds = [
        [PAPER, n * 1.1, 3.0, 610, [11, 17], [5, 12], 260],
        [FOILS, n * 0.22, 2.8, 640, [9, 13], [6, 14], 220],
        [RIBBON, n * 0.11, 2.3, 520, [42, 66], [1.5, 4], 120],
        [STARS, n * 0.14, 1.9, 700, [11, 17], [3, 8], 60],
      ];
      for (const [B, cnt, k, g, sz, sp, fl] of kinds) {
        const m = Math.round(cnt);
        for (let c = 0; c < m; c++) {
          let x, y, vx, vy;
          const reachY = rnd(0.42, 1.0) * h;
          if (at) {
            // Explosion an einem Punkt: nach allen Seiten, eher nach oben
            const a = rnd(0.12, 0.88) * Math.PI, sp2 = rnd(0.35, 1.0) * h * 0.55;
            x = bx; y = by;
            vx = Math.cos(a) * sp2 * k * 1.15;
            vy = Math.sin(a) * sp2 * k * 1.25;
          } else {
            // zwei Konfetti-Kanonen unten links und rechts, schräg zur Mitte
            const side = c % 2 ? 1 : -1;
            x = side * (w / 2 + 6 * U);
            y = -h / 2 - 8 * U;
            const reachX = rnd(0.06, 0.62) * w;
            vx = -side * k * reachX;
            const gu = g * U;
            vy = k * reachY + (gu / k) * Math.log(1 + (k * k * reachY) / gu);
          }
          const vz = k * rnd(-1, 1) * 0.1 * D;
          const i = addBody(B, x, y, rnd(-0.03, 0.03) * D, vx, vy, vz, rnd(sz[0], sz[1]) * U, B === FOILS ? pick(FOIL) : B === STARS ? (R() < 0.5 ? FOIL[0] : pick(pal)) : pick(pal), rnd(sp[0], sp[1]));
          if (i < 0) break;
          B.drag[i] = k * rnd(0.9, 1.15);
          B.grav[i] = g * U;
          B.flut[i] = fl * U * rnd(0.6, 1.3);
          B.freq[i] = rnd(2.4, 5.2);
          B.max[i] = rnd(5.2, 7.2);
          B.delay[i] = rnd(0, 0.2);
          if (B === RIBBON) { const i3 = i * 3; B.A[i3 + 1] = rnd(2, 5) * (R() < 0.5 ? -1 : 1); }
        }
      }
      // Knall: Lichtblitz und Glitzer, der mitfliegt
      const mouths = at ? [[bx, by, 0]] : [[-w / 2, -h / 2, -1], [w / 2, -h / 2, 1]];
      for (const [mx, my, side] of mouths) {
        spark(mx, my, 0, 0, 0, 0, 260 * U, 0.35, WHITE, 2, 2, 0, 0, 0.75, 0);
        spark(mx, my, 0, 0, 0, 0, 140 * U, 0.5, GOLD[0], 2, 2, 0, 0, 0.6, 0);
        const g = Math.round((W.quality === 'low' ? 14 : 26) * Math.min(1.4, n / 80));
        for (let k = 0; k < g; k++) {
          let vx, vy;
          if (side) { vx = -side * rnd(0.05, 0.5) * w * 1.6; vy = rnd(0.35, 0.95) * h * 1.7; } else { const a = rnd(0.1, 0.9) * Math.PI, s = rnd(0.3, 0.9) * h * 0.9; vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
          spark(mx, my, rnd(-0.03, 0.03) * D, vx, vy, rnd(-0.05, 0.05) * D, rnd(9, 16) * U, rnd(1.1, 2.0), pick(GLITTER), R() < 0.45 ? 1 : 0, 4, 1.6, 260 * U, 1, rnd(0, 0.15));
        }
      }
      return true;
    }

    /* ==================================================================
       Funkeln am Element
       ================================================================== */
    function sparkle(target, opts) {
      opts = opts || {};
      if (!wake()) return false;
      let cx, cy, hw, hh;
      if (target && typeof target.x === 'number' && !target.getBoundingClientRect) { cx = target.x; cy = target.y; hw = hh = 24 * S.U; }
      else {
        const r = rectOf(target);
        if (!r) return false;
        cx = r.left + r.width / 2; cy = r.top + r.height / 2; hw = Math.max(18, r.width / 2); hh = Math.max(18, r.height / 2);
      }
      const U = S.U, x = wx(cx), y = wy(cy);
      const pal = opts.gold ? GOLD : SPARK_TILE;
      const big = clamp(Math.sqrt(hw * hh) / 60, 0.6, 1.8);
      if (W.reducedMotion) {
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * TAU + 0.6;
          spark(x + Math.cos(a) * hw * 0.85, y + Math.sin(a) * hh * 0.85, 10, 0, 0, 0, rnd(20, 28) * U, 1.0, pick(GOLD), 1, 3, 0, 0, 0.9, k * 0.08);
        }
        return true;
      }
      const n = Math.round((opts.n || 18) * (W.quality === 'low' ? 0.6 : 1));
      spark(x, y, 20, 0, 0, 0, Math.max(hw, hh) * 2.6, 0.32, pal === GOLD ? GOLD[3] : WHITE, 2, 2, 0, 0, 0.55, 0);
      for (let k = 0; k < n; k++) {
        const a = R() * TAU, s = rnd(140, 330) * U * Math.sqrt(big);
        spark(x + Math.cos(a) * hw * 0.3, y + Math.sin(a) * hh * 0.3, rnd(0, 40), Math.cos(a) * s, Math.sin(a) * s + 60 * U, rnd(-60, 60), rnd(10, 17) * U, rnd(0.55, 0.9), pick(pal), R() < 0.3 ? 1 : 0, 0, 3.6, 380 * U, 1, 0);
      }
      // Funkelsterne am Rand des Elements
      const tw = W.quality === 'low' ? 4 : 6;
      for (let k = 0; k < tw; k++) {
        const a = (k / tw) * TAU + R() * 0.8;
        spark(x + Math.cos(a) * hw * rnd(0.8, 1.1), y + Math.sin(a) * hh * rnd(0.8, 1.1), 30, 0, 18 * U, 0, rnd(32, 48) * U * Math.min(1.3, big), rnd(0.6, 0.85), k % 2 ? GOLD[3] : GOLD[0], 1, 3, 0, 0, 1, k * 0.045);
      }
      return true;
    }

    /* ==================================================================
       Stern-Flug
       ================================================================== */
    function defaultStarTarget() {
      return document.querySelector('.topbar .dots .dot.current') || document.querySelector('.star-counter');
    }
    function starFly(fromEl, toEl, onDone) {
      const ra = rectOf(fromEl);
      if (!ra || !wake()) return false;
      const target = toEl || defaultStarTarget();
      const done = typeof onDone === 'function' ? onDone : () => {
        if (target && target.classList && target.classList.contains('dot') && LT.ui && LT.ui.animate) LT.ui.animate(target, 'fx3d-hit');
        if (LT.ui && LT.ui.bumpStars) LT.ui.bumpStars();
      };
      const U = S.U;
      const ax = wx(ra.left + ra.width / 2), ay = wy(ra.top + ra.height / 2);
      if (W.reducedMotion) {
        // kein Flug: kurzes Funkeln am Ziel
        const rb = rectOf(target);
        if (rb) sparkle({ x: rb.left + rb.width / 2, y: rb.top + rb.height / 2 }, { gold: true });
        try { done(); } catch (e) { console.error(e); }
        return true;
      }
      let f = FLY.list.find((q) => !q.on);
      if (!f) { f = FLY.list[0]; finishFlight(f, false); }
      const rb = rectOf(target);
      const bx = rb ? wx(rb.left + rb.width / 2) : ax, by = rb ? wy(rb.top + rb.height / 2) : S.h / 2 + 60;
      const dist = Math.hypot(bx - ax, by - ay);
      f.on = true; f.t = 0; f.el = target || null; f.done = done;
      f.ax = ax; f.ay = ay; f.bx = bx; f.by = by;
      f.side = bx >= ax ? 1 : -1;
      f.dur = clamp(0.5 + dist / 1900, 0.62, 0.95);
      f.s0 = clamp(Math.min(ra.width, ra.height) * 0.3, 30 * U, 50 * U);
      f.s1 = rb ? clamp(Math.max(rb.width, rb.height) * 0.75, 12, 26 * U) : f.s0 * 0.6;
      // Bogen: Kontrollpunkt seitlich der Strecke (nach oben gewölbt), im Bild
      const dx = bx - ax, dy = by - ay, len = Math.max(1, Math.hypot(dx, dy));
      let nx = -dy / len, ny = dx / len;
      if (ny < 0 || (Math.abs(ny) < 0.2 && nx * f.side > 0)) { nx = -nx; ny = -ny; }
      const bend = Math.min(0.32 * len, 230 * U);
      f.cx = clamp((ax + bx) / 2 + nx * bend, -S.w / 2 + 40 * U, S.w / 2 - 40 * U);
      f.cy = clamp((ay + by) / 2 + 26 * U + ny * bend, -S.h / 2 + 40 * U, S.h / 2 - 50 * U);
      f.acc = 0; f.n = 0; f.t0 = performance.now();
      f.x = ax; f.y = ay; f.z = 0;
      // Startblitz
      spark(ax, ay, 40, 0, 0, 0, f.s0 * 5, 0.3, GOLD[3], 2, 2, 0, 0, 0.7, 0);
      return true;
    }
    function finishFlight(f, burst) {
      if (!f.on) return;
      f.on = false;
      if (burst && SP) arrival(f.x, f.y, f.s1);
      const d = f.done;
      f.done = null; f.el = null;
      if (d) { try { d(); } catch (e) { console.error('fx3d starFly', e); } }
    }
    function arrival(x, y, s) {
      const U = S.U;
      spark(x, y, 30, 0, 0, 0, Math.max(130 * U, s * 9), 0.36, GOLD[1], 2, 2, 0, 0, 0.85, 0);
      spark(x, y, 34, 0, 0, 0, Math.max(60 * U, s * 4), 0.2, WHITE, 2, 2, 0, 0, 1, 0);
      const n = W.quality === 'low' ? 16 : 30;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + rnd(-0.1, 0.1), sp = rnd(170, 360) * U;
        spark(x, y, rnd(0, 30), Math.cos(a) * sp, Math.sin(a) * sp, rnd(-40, 40), rnd(10, 16) * U, rnd(0.55, 0.9), pick(SPARK_WARM), R() < 0.3 ? 1 : 0, 0, 4, 380 * U, 1, 0);
      }
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * TAU + R() * 0.5;
        const d = rnd(24, 46) * U;
        spark(x + Math.cos(a) * d, y + Math.sin(a) * d, 40, 0, 0, 0, rnd(30, 44) * U, rnd(0.5, 0.75), k % 2 ? GOLD[3] : GOLD[0], 1, 3, 0, 0, 1, 0.03 + k * 0.05);
      }
    }
    const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    function stepFlights(dt) {
      if (!FLY) return;
      const U = S.U, M = FLY.mesh.instanceMatrix.array;
      const POP = 0.2;
      let n = 0;
      const now = performance.now();
      for (const f of FLY.list) {
        if (!f.on) continue;
        if (now - f.t0 > 2500 && !S.frozen) { finishFlight(f, true); continue; } // Sicherung: spätestens nach 2,5 s angekommen
        f.t += dt;
        // Ziel folgt dem Element (z. B. Kopfleiste verschiebt sich)
        const rb = f.el && f.el.isConnected ? rectOf(f.el) : null;
        if (rb) { f.bx = wx(rb.left + rb.width / 2); f.by = wy(rb.top + rb.height / 2); }
        let x, y, z, s, ry, rz = 0;
        const px = f.x, py = f.y;
        if (f.t < POP) {
          // aus dem Element herausspringen
          const u = f.t / POP;
          const k = W.ease.outBack(u);
          x = f.ax; y = f.ay + Math.sin(u * Math.PI * 0.5) * 26 * U; z = 120 * u;
          s = f.s0 * Math.max(0, k);
          ry = 0;
        } else {
          const u = Math.min(1, (f.t - POP) / f.dur);
          const k = easeIO(u);
          // quadratischer Bogen über den Kontrollpunkt (siehe starFly)
          const sx = f.ax, sy = f.ay + 26 * U;
          const mx = f.cx, my = f.cy;
          const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
          x = a * sx + b * mx + c * f.bx;
          y = a * sy + b * my + c * f.by;
          z = 120 * (1 - k) + Math.sin(Math.PI * k) * 120 * U;
          s = f.s0 + (f.s1 - f.s0) * Math.pow(k, 1.4);
          // dreht sich in der Bildebene (eine Runde, endet aufrecht) und kippt dabei hin und her
          ry = 0.6 * Math.sin(k * TAU);
          rz = -f.side * k * TAU;
          // Funkenspur nach zurückgelegter Strecke
          f.acc += Math.hypot(x - px, y - py);
          const step = 6 * U;
          const ss = 0.55 + (s / f.s0) * 0.45;
          while (f.acc > step) {
            f.acc -= step;
            f.n++;
            const q = f.acc / Math.max(1, Math.hypot(x - px, y - py));
            const tx = x + (px - x) * q, ty = y + (py - y) * q;
            spark(tx + rnd(-5, 5) * U, ty + rnd(-5, 5) * U, z - 10, rnd(-35, 35) * U, rnd(-60, 10) * U, 0, rnd(9, 16) * U * ss, rnd(0.45, 0.8), pick(SPARK_WARM), 0, 1, 2, 140 * U, 1, 0);
            if (f.n % 3 === 0) spark(tx, ty, z - 14, 0, 0, 0, 46 * U * ss, 0.32, GOLD[1], 2, 1, 0, 0, 0.42, 0);
            if (f.n % 5 === 0) spark(tx + rnd(-10, 10) * U, ty + rnd(-10, 10) * U, z - 4, 0, -20 * U, 0, rnd(20, 30) * U * ss, rnd(0.45, 0.6), R() < 0.5 ? GOLD[3] : WHITE, 1, 3, 0, 0, 1, 0);
          }
          if (u >= 1) { f.x = x; f.y = y; finishFlight(f, true); continue; }
        }
        f.x = x; f.y = y; f.z = z;
        // Schein hinter dem Stern
        spark(x, y, z - 6, 0, 0, 0, s * 4.2, 0.07, GOLD[3], 2, 2, 0, 0, 0.55, 0);
        // Lage: erst um y kippen (zeigt die Facetten), dann in der Bildebene drehen
        const cy = Math.cos(ry / 2), sy = Math.sin(ry / 2), cz = Math.cos(rz / 2), sz = Math.sin(rz / 2);
        // q = qz · qy
        const qx = -sz * sy, qy = cz * sy, qz = sz * cy, qw = cz * cy;
        compose(M, n * 16, x, y, z, qx, qy, qz, qw, s, s, s);
        n++;
      }
      FLY.mesh.count = n;
      if (n) { const im = FLY.mesh.instanceMatrix; im.clearUpdateRanges(); im.addUpdateRange(0, n * 16); im.needsUpdate = true; }
    }

    /* ==================================================================
       Feier: Feuerwerk und Glitzerregen
       ================================================================== */
    /** Platz für einen Knall: neben/über dem Fenster, sonst an seinen Ecken */
    function burstPoint(i, el) {
      const w = S.w, h = S.h, U = S.U;
      const r = rectOf(el);
      const zones = [];
      if (r) {
        if (r.left > 150 * U) zones.push([30 * U, r.left - 30 * U, h * 0.14, h * 0.62]);
        if (w - r.right > 150 * U) zones.push([r.right + 30 * U, w - 30 * U, h * 0.14, h * 0.62]);
        if (r.top > 170 * U) zones.push([w * 0.12, w * 0.88, 70 * U, r.top - 40 * U]);
      }
      let x, y;
      if (zones.length) {
        const z = zones[i % zones.length];
        x = rnd(z[0], z[1]); y = rnd(z[2], z[3]);
      } else if (r) {
        // hochkant: an den oberen Ecken des Fensters
        x = i % 2 ? r.right - rnd(0, 0.25) * r.width : r.left + rnd(0, 0.25) * r.width;
        y = Math.max(60 * U, r.top + rnd(-0.05, 0.12) * r.height);
      } else { x = rnd(0.15, 0.85) * w; y = rnd(0.12, 0.45) * h; }
      return [wx(x), wy(y)];
    }
    function celebrate(opts) {
      opts = opts || {};
      if (!wake()) return false;
      const U = S.U, h = S.h, w = S.w;
      const el = opts.el || null;
      if (W.reducedMotion) {
        const r = rectOf(el);
        for (let k = 0; k < 8; k++) {
          const x = r ? r.left + rnd(-0.05, 1.05) * r.width : rnd(0.1, 0.9) * w;
          const y = r ? r.top + rnd(-0.05, 0.25) * r.height : rnd(0.1, 0.4) * h;
          spark(wx(x), wy(y), 20, 0, 0, 0, rnd(20, 30) * U, 1.2, pick(GOLD), 1, 3, 0, 0, 0.9, k * 0.12);
        }
        return true;
      }
      const count = W.quality === 'low' ? 4 : 7;
      let pal = (R() * FIREWORK.length) | 0;
      for (let i = 0; i < count; i++) {
        const r = ROCKETS.find((q) => !q.on);
        if (!r) break;
        r.on = true; r.t = 0; r.delay = 0.15 + i * rnd(0.3, 0.42); r.el = el; r.i = i;
        r.pal = pal = (pal + 1 + ((R() * 2) | 0)) % FIREWORK.length;
        r.style = i === count - 1 ? 3 : (R() * 3) | 0; // 0 Kugel, 1 Ring, 2 Trauerweide, 3 großer Abschluss
        r.dur = rnd(0.62, 0.8);
        r.x1 = null;
      }
      RAIN.on = true; RAIN.t = 0; RAIN.dur = 2.8; RAIN.rate = (W.quality === 'low' ? 22 : 40) * clamp(w / 1000, 0.6, 1.4); RAIN.acc = 0;
      return true;
    }
    function stepRockets(dt) {
      const U = S.U;
      for (const r of ROCKETS) {
        if (!r.on) continue;
        if (r.delay > 0) { r.delay -= dt; continue; }
        if (r.x1 == null) {
          // Ziel erst beim Start bestimmen (Fenster ist dann fertig aufgeploppt)
          const p = burstPoint(r.i, r.el);
          r.x1 = p[0]; r.y1 = p[1];
          r.x0 = r.x1 + rnd(-60, 60) * U; r.y0 = -S.h / 2 - 20;
          r.z = rnd(-0.04, 0.04) * S.D;
          r.x = r.x0; r.y = r.y0;
        }
        r.t += dt;
        const u = Math.min(1, r.t / r.dur);
        const k = 1 - (1 - u) * (1 - u);
        const px = r.x, py = r.y;
        r.x = r.x0 + (r.x1 - r.x0) * u + Math.sin(u * 9 + r.i) * 4 * U;
        r.y = r.y0 + (r.y1 - r.y0) * k;
        // Kopf und Spur
        spark(r.x, r.y, r.z, 0, 0, 0, 22 * U, 0.05, SPARK_WARM[3], 0, 2, 0, 0, 1, 0);
        const seg = Math.hypot(r.x - px, r.y - py);
        const m = Math.min(4, 1 + Math.floor(seg / (9 * U)));
        for (let q = 0; q < m; q++) {
          const f = q / m;
          spark(r.x + (px - r.x) * f + rnd(-2, 2), r.y + (py - r.y) * f, r.z, rnd(-25, 25) * U, rnd(-90, -20) * U, 0, rnd(5, 9) * U, rnd(0.3, 0.55), pick(SPARK_WARM), 0, 1, 2.5, 160 * U, 0.9, 0);
        }
        if (u >= 1) { r.on = false; explode(r); }
      }
    }
    function explode(r) {
      const U = S.U, x = r.x1, y = r.y1, z = r.z;
      const pal = FIREWORK[r.pal];
      const big = r.style === 3 ? 1.35 : 1;
      const n = Math.round((W.quality === 'low' ? 60 : 120) * big);
      spark(x, y, z, 0, 0, 0, 380 * U * big, 0.4, pal[1], 2, 2, 0, 0, 0.8, 0);
      spark(x, y, z, 0, 0, 0, 150 * U * big, 0.25, WHITE, 2, 2, 0, 0, 1, 0);
      const tilt = rnd(-0.6, 0.6);
      for (let k = 0; k < n; k++) {
        let dx, dy, dz;
        if (r.style === 1) {
          // zwei Ringe (leicht gekippt), der innere in der zweiten Farbe
          const a = (k / n) * TAU * 2;
          const q = k % 2 ? 0.72 : 1;
          dx = Math.cos(a) * q; dy = Math.sin(a) * Math.cos(tilt) * q; dz = Math.sin(a) * Math.sin(tilt) * q;
        } else {
          // Kugel: gleichverteilt
          const zz = rnd(-1, 1), a = R() * TAU, q = Math.sqrt(1 - zz * zz);
          dx = Math.cos(a) * q; dy = Math.sin(a) * q; dz = zz;
        }
        const willow = r.style === 2;
        const sp = (r.style === 1 ? 400 : rnd(0.55, 1) * 440) * U * big;
        const col = r.style === 1 ? pal[k % 2] : k % 3 === 0 ? pal[1] : pal[0];
        spark(x, y, z, dx * sp, dy * sp, dz * sp, rnd(10, 16) * U * (willow ? 0.9 : 1), willow ? rnd(1.6, 2.2) : rnd(1.0, 1.5), willow ? GOLD[k % 2 ? 0 : 2] : col, k % 4 === 0 ? 1 : 0, 4, willow ? 2.6 : 2.0, (willow ? 220 : 110) * U, 1, 0);
      }
      // Nachglitzern im Rund
      const g = W.quality === 'low' ? 6 : 12;
      for (let k = 0; k < g; k++) {
        const a = R() * TAU, d = rnd(0.25, 0.85) * 190 * U * big;
        spark(x + Math.cos(a) * d, y + Math.sin(a) * d - 30 * U, z + 10, 0, -25 * U, 0, rnd(20, 32) * U, rnd(0.4, 0.6), k % 2 ? WHITE : pal[1], 1, 3, 0, 0, 1, rnd(0.45, 0.9));
      }
    }
    function stepRain(dt) {
      if (!RAIN.on) return;
      const U = S.U;
      RAIN.t += dt;
      if (RAIN.t >= RAIN.dur) { RAIN.on = false; return; }
      RAIN.acc += dt * RAIN.rate;
      while (RAIN.acc >= 1) {
        RAIN.acc -= 1;
        const vy = -rnd(70, 150) * U;
        const life = Math.min(5.5, (S.h + 60) / -vy);
        spark(rnd(-0.5, 0.5) * S.w, S.h / 2 + 10, rnd(-0.06, 0.06) * S.D, rnd(-20, 20) * U, vy, 0, rnd(9, 18) * U, life, pick(GLITTER), R() < 0.6 ? 1 : 0, 5, 0, 0, 1, 0);
      }
    }

    /* ==================================================================
       Sticker-Karte
       ================================================================== */
    const CARD_VS = [
      'varying vec2 vUv; varying float vFacing;',
      'void main() {',
      '  vUv = uv;',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  vec3 n = normalize(normalMatrix * normal);',
      '  vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '}',
    ].join('\n');
    const CARD_FS = [
      'uniform sampler2D map; uniform float uSheen; uniform float uOpacity; uniform float uHolo;',
      'varying vec2 vUv; varying float vFacing;',
      'void main() {',
      '  vec4 c = texture2D(map, vUv);',
      '  float d = (vUv.x * 0.8 + vUv.y * 0.55) - uSheen;',
      '  float band = exp(-d * d * 260.0) * 0.6 + exp(-d * d * 30.0) * 0.1;',
      '  vec3 holo = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + vUv.x * 0.7 - vUv.y * 0.45 + uHolo));',
      '  float shade = 0.8 + 0.2 * vFacing;',
      '  vec3 col = c.rgb * shade + holo * 0.1 * (1.0 - 0.5 * vFacing) + vec3(band);',
      '  float a = c.a * uOpacity;',
      '  gl_FragColor = vec4(min(col, vec3(1.0)) * a, a);',
      '}',
    ].join('\n');
    const CARD_W = 0.9, CARD_H = 1.02, BODY_H = 1.12; // Bildfläche auf der Karte (Karte 1 × BODY_H)
    function buildCard(scene) {
      const g = new T.Group();
      g.name = 'fx-sticker-card';
      g.visible = false;
      // Körper: abgerundetes Rechteck mit weicher Fase (1 × BODY_H, Dicke DEP)
      const DEP = 0.06, BEV = 0.016;
      const hw = 0.5 - BEV, hh = BODY_H / 2 - BEV, cr = 0.1;
      const sh = new T.Shape();
      sh.moveTo(-hw + cr, -hh);
      sh.lineTo(hw - cr, -hh); sh.quadraticCurveTo(hw, -hh, hw, -hh + cr);
      sh.lineTo(hw, hh - cr); sh.quadraticCurveTo(hw, hh, hw - cr, hh);
      sh.lineTo(-hw + cr, hh); sh.quadraticCurveTo(-hw, hh, -hw, hh - cr);
      sh.lineTo(-hw, -hh + cr); sh.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
      const bodyGeo = new T.ExtrudeGeometry(sh, { depth: DEP - 2 * BEV, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 3, curveSegments: 6 });
      bodyGeo.translate(0, 0, -(DEP - 2 * BEV) / 2);
      const bodyMat = selfLit(new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, metalness: 0, transparent: true, envMapIntensity: 1.0 }), 0.45);
      const body = new T.Mesh(bodyGeo, bodyMat);
      body.renderOrder = 20;
      const mk = () => new T.ShaderMaterial(Object.assign({
        uniforms: { map: { value: null }, uSheen: { value: -1 }, uOpacity: { value: 1 }, uHolo: { value: 0 } },
        vertexShader: CARD_VS, fragmentShader: CARD_FS, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      }, PREMUL));
      const plane = new T.PlaneGeometry(CARD_W, CARD_H);
      const front = new T.Mesh(plane, mk());
      front.position.z = DEP / 2 + 0.002;
      front.renderOrder = 21;
      const back = new T.Mesh(plane, mk());
      back.position.z = -DEP / 2 - 0.002;
      back.rotation.y = Math.PI;
      back.renderOrder = 21;
      g.add(body, front, back);
      scene.add(g);
      return { on: false, g, body, front, back, el: null, t: 0, size: 100, revealed: false, timer: 0, texF: null, texB: null };
    }
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function mixHex(a, b, k) { const A = srgb(a), B = srgb(b); const c = (i) => Math.round((A[i] + (B[i] - A[i]) * k) * 255); return `rgb(${c(0)},${c(1)},${c(2)})`; }
    /** Vorder- und Rückseite; info.px = Emoji-Größe auf der Vorderseite (Textur-Pixel) */
    function cardTextures(emoji, color, info) {
      const W2 = 320, H2 = Math.round((320 * CARD_H) / CARD_W), rad = 36;
      const tex = (draw) => {
        const c = document.createElement('canvas');
        c.width = W2; c.height = H2;
        const g = c.getContext('2d');
        g.save(); rr(g, 0, 0, W2, H2, rad); g.clip();
        draw(g);
        g.restore();
        const t = new T.CanvasTexture(c);
        t.colorSpace = T.NoColorSpace; // Shader schreibt die sRGB-Werte direkt
        t.anisotropy = 4;
        return t;
      };
      const front = tex((g) => {
        const gr = g.createLinearGradient(0, 0, 0, H2);
        gr.addColorStop(0, mixHex(color, '#ffffff', 0.62));
        gr.addColorStop(1, mixHex(color, '#ffffff', 0.25));
        g.fillStyle = gr; g.fillRect(0, 0, W2, H2);
        // Strahlenkranz
        g.save(); g.translate(W2 / 2, H2 / 2); g.fillStyle = 'rgba(255,255,255,0.28)';
        for (let k = 0; k < 14; k++) { g.rotate(TAU / 14); g.beginPath(); g.moveTo(0, 0); g.lineTo(-26, -320); g.lineTo(26, -320); g.closePath(); g.fill(); }
        g.restore();
        const rg = g.createRadialGradient(W2 / 2, H2 / 2, 10, W2 / 2, H2 / 2, 170);
        rg.addColorStop(0, 'rgba(255,255,255,0.85)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W2, H2);
        // kleine Funkelsterne in den Ecken
        g.fillStyle = 'rgba(255,255,255,0.9)';
        [[46, 52, 16], [W2 - 52, 70, 11], [56, H2 - 62, 10], [W2 - 46, H2 - 50, 15]].forEach(([x, y, s]) => {
          g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s); g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s); g.fill();
        });
        // Rahmen
        g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,0.95)'; rr(g, 9, 9, W2 - 18, H2 - 18, rad - 8); g.stroke();
        g.lineWidth = 3; g.strokeStyle = mixHex(color, '#ffffff', 0.15); rr(g, 17, 17, W2 - 34, H2 - 34, rad - 14); g.stroke();
        // Sticker-Bild: möglichst groß, aber mit Rand (Emoji sind oft breiter als hoch)
        g.font = `100px ${W.emojiFont}`;
        const wk = Math.max(0.9, (g.measureText(emoji).width || 100) / 100);
        const px = Math.round(Math.min(0.68 * H2, (0.8 * W2) / wk));
        info.px = px;
        g.font = `${px}px ${W.emojiFont}`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = 'rgba(29,37,80,0.28)'; g.shadowBlur = 14; g.shadowOffsetY = 8;
        g.fillText(emoji, W2 / 2, H2 / 2 + px * 0.06);
      });
      const back = tex((g) => {
        const gr = g.createLinearGradient(0, 0, W2, H2);
        gr.addColorStop(0, mixHex(color, '#ffffff', 0.1));
        gr.addColorStop(1, mixHex(color, '#1d2550', 0.25));
        g.fillStyle = gr; g.fillRect(0, 0, W2, H2);
        g.fillStyle = 'rgba(255,255,255,0.16)';
        for (let yy = 0; yy < H2 + 40; yy += 46) for (let xx = (yy / 46) % 2 ? 23 : 0; xx < W2 + 40; xx += 46) { g.beginPath(); g.arc(xx, yy, 7, 0, TAU); g.fill(); }
        g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,0.95)'; rr(g, 9, 9, W2 - 18, H2 - 18, rad - 8); g.stroke();
        g.font = `150px ${W.emojiFont}`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('⭐', W2 / 2, H2 / 2 + 8);
      });
      return [front, back];
    }
    function sticker(el) {
      if (!el || !el.isConnected || !wake()) return false;
      if (W.reducedMotion) { setTimeout(() => sparkle(el, { gold: true }), 200); return true; }
      if (CARD.on) endCard();
      const emoji = (el.textContent || '⭐').trim() || '⭐';
      const color = areaHex(el) || '#ffb020';
      let fs = 120;
      try { fs = parseFloat(getComputedStyle(el).fontSize) || 120; } catch (e) { /* egal */ }
      const info = { px: 200 };
      const [tf, tb] = cardTextures(emoji, color, info);
      if (CARD.texF) CARD.texF.dispose();
      if (CARD.texB) CARD.texB.dispose();
      CARD.texF = tf; CARD.texB = tb;
      CARD.front.material.uniforms.map.value = tf;
      CARD.back.material.uniforms.map.value = tb;
      CARD.on = true; CARD.el = el; CARD.t = 0; CARD.revealed = false;
      // Kartenbreite in px: Emoji auf der Karte = 0,74 × Emoji im DOM (das DOM-Emoji
      // federt beim Übergang von 0,74 auf 1 – siehe .fx3d-pop in css/fx3d.css)
      CARD.size = (0.74 * fs * tf.image.height) / (info.px * CARD_H);
      el.classList.add('fx3d-hold');
      clearTimeout(CARD.timer);
      CARD.timer = setTimeout(() => revealSticker(el), 3200); // falls die Schleife ruht (Tab im Hintergrund)
      CARD.g.visible = true;
      return true;
    }
    function revealSticker(el) {
      if (!el) return;
      if (el.classList.contains('fx3d-hold')) {
        el.classList.remove('fx3d-hold');
        el.classList.add('fx3d-shown'); // die eingebaute Dreh-Animation nicht noch einmal abspielen
        if (LT.ui && LT.ui.animate) LT.ui.animate(el, 'fx3d-pop');
      }
    }
    function endCard() {
      CARD.on = false;
      CARD.g.visible = false;
      clearTimeout(CARD.timer);
      revealSticker(CARD.el);
      CARD.el = null;
    }
    function stepCard(dt) {
      if (!CARD || !CARD.on) return;
      const c = CARD;
      c.t += dt;
      const r = rectOf(c.el);
      if (!r) { endCard(); return; }
      const U = S.U, t = c.t;
      const x = wx(r.left + r.width / 2), y = wy(r.top + r.height / 2);
      const IN = 1.0, HOLD = 2.0, OUT = 0.3;
      let s = 1, ry = 0, rx = 0, z = 0, op = 1, by = 0;
      if (t < IN) {
        const u = t / IN;
        s = Math.max(0, W.ease.outBack(Math.min(1, u * 1.15)));
        ry = -TAU * 1.25 * (1 - W.ease.outCubic(u));
        rx = 0.35 * Math.sin(u * Math.PI);
        z = 260 * U * (1 - W.ease.outCubic(u));
      } else if (t < HOLD) {
        const u = t - IN;
        ry = 0.14 * Math.sin(u * 3.2);
        rx = -0.06 * Math.sin(u * 2.3);
        by = Math.sin(u * 3.0) * 4 * U;
      } else {
        const u = Math.min(1, (t - HOLD) / OUT);
        if (!c.revealed) {
          c.revealed = true;
          revealSticker(c.el);
          sparkle(c.el, { gold: true, n: 22 });
        }
        s = 1 + 0.1 * u;
        op = 1 - u;
        if (u >= 1) { endCard(); return; }
      }
      // Glanzstreifen zweimal über die Karte, Holo-Schimmer wandert
      const sh = (t - 0.55) / 0.85;
      c.front.material.uniforms.uSheen.value = sh < 0 ? -1 : -0.6 + (sh % 1.6) * 1.9;
      c.front.material.uniforms.uHolo.value = t * 0.35 + ry * 0.2;
      c.back.material.uniforms.uSheen.value = c.front.material.uniforms.uSheen.value;
      c.front.material.uniforms.uOpacity.value = op;
      c.back.material.uniforms.uOpacity.value = op;
      c.body.material.opacity = op;
      const wd = c.size * s;
      c.g.position.set(x, y + by, z);
      c.g.rotation.set(rx, ry, 0);
      c.g.scale.set(wd, wd, wd);
      // Schein hinter der Karte, solange sie hereindreht
      if (t < IN + 0.2) spark(x, y, z - 30, 0, 0, 0, c.size * 2.8 * s, 0.07, GOLD[3], 2, 2, 0, 0, 0.45, 0);
    }

    /* ==================================================================
       Auslöser im DOM (nur bei laufender 3D-Welt)
       ================================================================== */
    const lastHit = new WeakMap();
    const hasTok = (s, tok) => (' ' + (s || '') + ' ').indexOf(' ' + tok + ' ') >= 0;
    function once(el, ms) {
      const now = performance.now();
      const t = lastHit.get(el);
      if (t && now - t < ms) return false;
      lastHit.set(el, now);
      return true;
    }
    function onMutations(list) {
      if (!api.live()) return;
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        if (m.type === 'attributes') {
          const el = m.target, cl = el.classList;
          if (!cl) continue;
          const old = m.oldValue;
          if (cl.contains('is-correct') && !hasTok(old, 'is-correct') && cl.contains('tile')) { if (once(el, 400)) sparkle(el); }
          else if (cl.contains('joy') && !hasTok(old, 'joy')) { if (once(el, 400)) sparkle(el); }
          else if (cl.contains('on') && !hasTok(old, 'on') && el.parentNode && el.parentNode.classList && el.parentNode.classList.contains('round-stars')) { if (once(el, 400)) sparkle(el, { gold: true, n: 26 }); }
        } else if (m.addedNodes && m.addedNodes.length) {
          for (let k = 0; k < m.addedNodes.length; k++) {
            const n = m.addedNodes[k];
            if (n.nodeType !== 1) continue;
            if (n.matches('[data-test="round-end"]')) celebrate({ el: n.querySelector('.panel') || n });
            if (n.classList.contains('sticker-reveal')) sticker(n);
            else if (n.firstElementChild) { const s = n.querySelector('.sticker-reveal'); if (s) sticker(s); }
          }
        }
      }
    }
    if (window.MutationObserver) {
      const mo = new MutationObserver((list) => { try { onMutations(list); } catch (e) { console.error('fx3d', e); } });
      mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    }

    /* ==================================================================
       API
       ================================================================== */
    const api = {
      live() { return !S.failed && !S.lost && !!W.enabled && !!W.started; },
      confetti,
      starFly,
      sparkle,
      celebrate,
      sticker,
      /** neuer Ort (neuer Bildschirm): Feier und Flüge enden, fallendes Konfetti darf ausfallen */
      onPlace() {
        if (!S.L) return;
        ROCKETS.forEach((r) => { r.on = false; });
        RAIN.on = false;
        FLY.list.forEach((f) => { if (f.on) finishFlight(f, false); });
        if (CARD.on) endCard();
      },
      stop() { hardStop(); if (S.L) rest(); },
      /** Nur Diagnose/Vorschau: Schleife anhalten und sec Sekunden in 1/60-Schritten
          vorspulen, dann ein Bild zeigen. debugStep(null) läuft normal weiter. */
      debugStep(sec) {
        if (!S.L) return false;
        if (sec == null) { S.frozen = false; if (busy()) wake(); else rest(); return true; }
        S.frozen = true;
        cancelAnimationFrame(S.raf);
        S.raf = 0;
        for (let k = 0, n = Math.round(sec * 60); k < n; k++) step(1 / 60);
        size();
        S.L.renderer.render(S.L.scene, S.L.camera);
        S.L.canvas.classList.add('is-on');
        S.visible = true;
        return api.debug();
      },
      debug() {
        const info = S.L ? S.L.renderer.info.render : { calls: 0, triangles: 0 };
        return {
          built: !!S.L, live: api.live(), running: !!S.raf, visible: S.visible, failed: S.failed, lost: S.lost,
          size: [S.w, S.h, S.dpr], frames: S.frames,
          n: S.L ? { paper: PAPER.n, foil: FOILS.n, ribbon: RIBBON.n, star: STARS.n, sparks: SP.n, flights: FLY.list.filter((f) => f.on).length, rockets: ROCKETS.filter((r) => r.on).length, rain: RAIN.on, card: CARD.on } : null,
          calls: info.calls, triangles: info.triangles,
        };
      },
    };

    // Leinwand und Shader vorbereiten, sobald der Browser Zeit hat (der erste Effekt ruckelt dann nicht)
    const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn, { timeout: 3000 }) : (fn) => setTimeout(fn, 400);
    setTimeout(() => idle(() => { if (api.live()) ensure(); }), 1500);
    return api;
  });
})();
