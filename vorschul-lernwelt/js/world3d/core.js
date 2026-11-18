/* ==========================================================================
   LT.w3d – Kern der 3D-Welt (three.js)

   Die Lernwelt ist eine Inselwelt im Meer. Hinter der Oberfläche (DOM) liegt
   eine Vollbild-Leinwand (#w3d-bg), auf der Himmel, Meer, die Inseln der
   Lernbereiche und Flos Heimatinsel gerendert werden. Die Kamera fliegt
   zwischen „Orten“ (W.go): Start, Weltkarte, Insel, Spiel, Reise …

   Alles Spielerische (Kacheln, Knöpfe, Texte) bleibt DOM – barrierearm,
   vorlesbar, testbar – und liegt als „Glas“-Oberfläche über der Welt.

   Ohne WebGL, im Testmodus (?test, außer mit ?3d=1), mit ?3d=0 oder wenn
   die Eltern „3D-Grafik: aus“ wählen, bleibt W.enabled = false und die App
   sieht aus wie die flache Variante (alle Aufrufe sind dann harmlos).

   ------------------------------------------------------------------------
   VERTRAG für die Module in js/world3d/ (werden VOR three.js geladen und
   dürfen THREE erst in ihren Bau-Funktionen benutzen):

     W.register('env',    (W) => void)           Himmel, Meer, Wolken, Licht-Stimmung
     W.register('kit',    (W) => kitObject)       gemeinsamer Bausatz → W.kit
     W.register('island', areaId, (W, area) => { group, anchors })
                                                   Insel eines Lernbereichs (areaId
                                                   wie in LT.areas, dazu 'hub' = Flos
                                                   Heimatinsel). group: THREE.Group,
                                                   Mittelpunkt im Ursprung, Wasserlinie
                                                   y = 0, Radius ≈ 6 (Wiese ≈ 4.5).
                                                   anchors (alle optional, lokale Koord.):
                                                     label: Vector3  Punkt über der Insel für das Namensschild
                                                     focus: Vector3  Blickpunkt der Kamera auf der Insel
                                                     flo:   Vector3  Standplatz für Flo (nur hub)
                                                   group.userData.update = (dt, t) => void   (optional, Animation)
     W.register('flo',    (W) => api)             3D-Flo (Maskottchen) → W.flo
     W.register('fx',     (W) => api)             Effekte (Konfetti, Sterne …) → W.fx
     W.register('ready',  (W) => void)            nach dem Aufbau (z. B. Flo auf die Heimatinsel stellen)

   Werkzeuge des Kerns:
     W.THREE, W.renderer, W.scene, W.camera, W.lights {hemi, sun, amb}
     W.onFrame(fn(dt, t)) → abmelden()            pro Bild
     W.go(place, opts)                            Kamera fliegen lassen (siehe poseFor unten).
                                                  opts: { instant, frame }  frame = freier Bildbereich
                                                  {top, bottom, left, right} in CSS-px (oder Funktion,
                                                  die ihn liefert): Der Ort wird darin zentriert
                                                  (Projektionsmitte verschoben) und eingepasst.
                                                  Die Pose wird erst im nächsten Bild berechnet –
                                                  das DOM des neuen Bildschirms steht dann schon.
                                                  Danach: W.flo.onPlace(place, opts), W.fx.onPlace(…)
     W.place                                      aktueller Ort ('splash' | 'home' | 'sky' |
                                                  {kind:'area'|'game'|'reise'|'inspect', id})
     W.islands[areaId]                            {group, anchors, pos}
     W.label(vec3OrObject, element, opts)         DOM-Element folgt einem 3D-Punkt (Unterkante Mitte).
                                                  opts.depth: nach Entfernung skalieren + stapeln
     W.labelIsland(areaId, element, opts)         Schild am anchors.label einer Insel
     W.interactive(object3d, onTap)               antippbar (Raycast)
     W.pan(dx) / W.canPan()                       Weltkarte im Hochformat seitlich schieben
                                                  (dx in Bildschirmbreiten, auch per Wischen)
     W.sleep() / W.wake()                         Ruhemodus (nach der laufenden Kamerafahrt)
     W.debugPixels()                              einmal rendern + Pixel lesen (Tests, Diagnose):
                                                  {colors, std, calls, triangles, ok}
     W.mat(color, opts)                           geteilte MeshStandardMaterial
     W.textTexture(text, opts) / W.emojiTexture(emoji, px)
     W.tween(obj, props, {dur, ease, delay, onUpdate, onDone})
     W.ease.{inOutCubic,outBack,outCubic,outElastic}
     W.rng(seed)                                  deterministischer Zufall
     W.layer({ parent, dprCap })                  zusätzliche transparente Leinwand
                                                  (für Flo in .mascot und Effekte)
     W.quality  'high' | 'medium' | 'low'         passt sich der Bildrate an
     W.reducedMotion                              Bewegung reduzieren (Systemeinstellung)
     W.mode / W.reason                            gewünschte Einstellung ('auto'|'on'|'off') und
                                                  warum 3D aus ist ('test', 'setting', 'webgl',
                                                  'slow', 'param', 'error') – für den Elternbereich

   Schalter: ?3d=1 erzwingt 3D (auch im Testmodus), ?3d=0 schaltet aus,
   ?3d=auto verhält sich wie ohne Testmodus (Eltern-Einstellung zählt).
   Einstellung settings.graphics: 'auto' = 3D nur mit echter Grafikkarte
   (kein Software-Rendering), 'on' = immer wenn WebGL geht, 'off' = flach.

   Body-Klassen: w3d (3D gewählt, sofort), w3d-live (erste Bilder gerendert),
   w3d-pan (Weltkarte lässt sich seitlich schieben), data-w3d-quality="high|medium|low".
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;

  const W = {
    enabled: false,
    started: false,
    THREE: null,
    ready: null,
    islands: {},
    quality: 'high',
    reducedMotion: false,
    place: null,
    kit: null,
    flo: null,
    fx: null,
    stats: { fps: 0, frames: 0, dpr: 1 },
  };
  LT.w3d = W;

  /* ------------------------------------------------------------------
     Registrierung (Module laden vor three.js)
     ------------------------------------------------------------------ */
  const REG = { env: [], kit: null, island: {}, flo: null, fx: null, ready: [] };
  W.register = function (kind, a, b) {
    if (kind === 'island') REG.island[a] = b;
    else if (kind === 'env' || kind === 'ready') REG[kind].push(a);
    else REG[kind] = a;
  };

  /* ------------------------------------------------------------------
     Soll 3D laufen?
     ------------------------------------------------------------------ */
  const params = new URLSearchParams(location.search);
  /** WebGL vorhanden? strict: nur mit echter Grafikkarte (kein Software-Rendering). */
  function webglOK(strict) {
    try {
      const c = document.createElement('canvas');
      const o = strict ? { failIfMajorPerformanceCaveat: true } : undefined;
      return !!(c.getContext('webgl2', o) || c.getContext('webgl', o));
    } catch (e) {
      return false;
    }
  }
  W.supported = null;
  W.mode = 'auto';
  W.reason = '';
  /** Testmodus: Kamera springt sofort (Tests und Vorschaubilder warten nicht auf Flüge) */
  W.fastFlights = !!(LT.config && LT.config.test);
  function setting() {
    try { return (LT.progress && LT.progress.settings && LT.progress.settings().graphics) || 'auto'; } catch (e) { return 'auto'; }
  }
  /** 'on' | 'auto' | false – ohne WebGL-Prüfung */
  W.wanted = function () {
    const p = params.get('3d');
    W.mode = setting();
    if (p === '0') { W.reason = 'param'; return false; }
    if (p === '1') return 'on';
    if (LT.config && LT.config.test && p !== 'auto') { W.reason = 'test'; return false; }
    if (W.mode === 'off') { W.reason = 'setting'; return false; }
    return W.mode === 'on' ? 'on' : 'auto';
  };
  W.decide = function () {
    const want = W.wanted();
    if (!want) return false;
    if (W.supported === null) W.supported = webglOK(false);
    if (!W.supported) { W.reason = 'webgl'; return false; }
    if (want === 'auto' && !webglOK(true)) { W.reason = 'slow'; return false; }
    W.reason = '';
    return true;
  };

  /* Pfad zu vendor/three.min.js relativ zu dieser Datei */
  const BASE = (function () {
    try {
      const src = document.currentScript && document.currentScript.getAttribute('src');
      if (src && /js\/world3d\/core\.js/.test(src)) return src.replace(/js\/world3d\/core\.js.*$/, '');
    } catch (e) { /* egal */ }
    return '';
  })();
  W.vendorUrl = window.LT_THREE_URL || BASE + 'vendor/three.min.js';

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = W.vendorUrl;
      s.async = true;
      s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('THREE fehlt')));
      s.onerror = () => reject(new Error('three.js nicht geladen'));
      document.head.appendChild(s);
    });
  }

  /* ------------------------------------------------------------------
     Hilfen: Zufall, Easing, Tweens
     ------------------------------------------------------------------ */
  W.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    const r = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.range = (a, b) => a + (b - a) * r();
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    return r;
  };
  W.hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  W.ease = {
    linear: (t) => t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  };
  const tweens = [];
  W.tween = function (obj, props, { dur = 0.6, ease = W.ease.inOutCubic, delay = 0, onUpdate, onDone } = {}) {
    const tw = { obj, props, from: null, dur: Math.max(0.001, dur), ease, delay, t: 0, onUpdate, onDone, dead: false };
    tw.cancel = () => { tw.dead = true; };
    tweens.push(tw);
    return tw;
  };
  function stepTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      if (tw.dead) { tweens.splice(i, 1); continue; }
      if (tw.delay > 0) { tw.delay -= dt; continue; }
      if (!tw.from) { tw.from = {}; for (const k in tw.props) tw.from[k] = tw.obj[k]; }
      tw.t += dt / tw.dur;
      const k = tw.ease(Math.min(1, tw.t));
      for (const p in tw.props) tw.obj[p] = tw.from[p] + (tw.props[p] - tw.from[p]) * k;
      if (tw.onUpdate) tw.onUpdate(k);
      if (tw.t >= 1) { tweens.splice(i, 1); if (tw.onDone) tw.onDone(); }
    }
  }

  /* ------------------------------------------------------------------
     Frame-Schleife
     ------------------------------------------------------------------ */
  const frameFns = new Set();
  W.onFrame = function (fn) { frameFns.add(fn); return () => frameFns.delete(fn); };
  W.time = 0;

  /* ------------------------------------------------------------------
     Materialien & Texturen
     ------------------------------------------------------------------ */
  const matCache = new Map();
  W.mat = function (color, { rough = 0.82, metal = 0, emissive = 0x000000, emissiveIntensity = 1, flat = true, transparent = false, opacity = 1, side, envMapIntensity = 0.6 } = {}) {
    const T = W.THREE;
    const key = [color, rough, metal, emissive, emissiveIntensity, flat, transparent, opacity, side, envMapIntensity].join('|');
    let m = matCache.get(key);
    if (!m) {
      m = new T.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity, flatShading: flat, transparent, opacity, side: side == null ? T.FrontSide : side, envMapIntensity });
      matCache.set(key, m);
    }
    return m;
  };
  W.font = '"Fredoka", "Andika", "Trebuchet MS", system-ui, sans-serif';
  W.emojiFont = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
  /** Text als Textur. opts: {px, color, font, weight, bg, pad, stroke, strokeColor, radius} */
  W.textTexture = function (text, { px = 96, color = '#ffffff', font = W.font, weight = 700, bg = null, pad = 0.35, stroke = 0, strokeColor = 'rgba(0,0,0,0.35)', radius = 0.5 } = {}) {
    const T = W.THREE;
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = `${weight} ${px}px ${font}`;
    const w = Math.ceil(g.measureText(text).width + px * pad * 2);
    const h = Math.ceil(px * (1 + pad * 1.6));
    c.width = Math.min(2048, w);
    c.height = h;
    g.font = `${weight} ${px}px ${font}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (bg) {
      const r = Math.min(h / 2, h * radius);
      g.fillStyle = bg;
      g.beginPath();
      if (g.roundRect) g.roundRect(0, 0, c.width, c.height, r); else g.rect(0, 0, c.width, c.height);
      g.fill();
    }
    if (stroke) { g.lineWidth = stroke; g.strokeStyle = strokeColor; g.lineJoin = 'round'; g.strokeText(text, c.width / 2, c.height / 2 + px * 0.04); }
    g.fillStyle = color;
    g.fillText(text, c.width / 2, c.height / 2 + px * 0.04);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.userData.aspect = c.width / c.height;
    return tex;
  };
  const emojiCache = new Map();
  W.emojiTexture = function (emoji, px = 128) {
    const key = emoji + '|' + px;
    if (emojiCache.has(key)) return emojiCache.get(key);
    const T = W.THREE;
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const g = c.getContext('2d');
    g.font = `${Math.round(px * 0.82)}px ${W.emojiFont}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(emoji, px / 2, px / 2 + px * 0.06);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    emojiCache.set(key, tex);
    return tex;
  };

  /* ------------------------------------------------------------------
     Weltaufbau: Positionen der Inseln
     Vorne ein Bogen mit den Vorschul-Inseln, dahinter die Schul-Inseln,
     in der Mitte Flos Heimatinsel. Kamera der Weltkarte schaut von +z.
     ------------------------------------------------------------------ */
  function layoutPositions(areas) {
    const pos = { hub: [0, 0, 0] };
    const front = areas.filter((a) => !a.grade && a.id !== 'kino');
    const back = areas.filter((a) => a.grade || a.id === 'kino');
    // vorne: flacher Bogen, Abstand 15 (Inselradius ≈ 6)
    front.forEach((a, i) => {
      const c = i - (front.length - 1) / 2;
      pos[a.id] = [c * 15, 0, 23 - c * c * 1.5];
    });
    // hinten: Schul-Inseln und Kino in einer Reihe hinter Flos Insel
    // (Abstand 20: hinten wirken Abstände kleiner, die Schilder brauchen Platz)
    back.forEach((a, i) => {
      const c = i - (back.length - 1) / 2;
      pos[a.id] = [c * 20, 0, -24 - Math.abs(c) * 2];
    });
    return pos;
  }
  W.layoutPositions = layoutPositions;

  /* Ersatz-Insel, falls ein Modul fehlt */
  function defaultIsland(T, area) {
    const g = new T.Group();
    const color = (area && area.color) || '#7bd389';
    const sand = new T.Mesh(new T.CylinderGeometry(5.6, 6.2, 1.2, 28), W.mat('#f2d9a0'));
    sand.position.y = -0.2;
    const grass = new T.Mesh(new T.CylinderGeometry(4.6, 5.2, 1.4, 28), W.mat('#79c26a'));
    grass.position.y = 0.6;
    const totem = new T.Mesh(new T.IcosahedronGeometry(1.4, 0), W.mat(color, { rough: 0.5 }));
    totem.position.y = 2.6;
    [sand, grass, totem].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
    g.userData.update = (dt, t) => { totem.rotation.y = t * 0.5; totem.position.y = 2.6 + Math.sin(t * 1.4) * 0.15; };
    return { group: g, anchors: { label: new T.Vector3(0, 4.8, 0), focus: new T.Vector3(0, 1.4, 0) } };
  }

  /* ------------------------------------------------------------------
     Kamera-Rig und Orte

     Jeder Ort ergibt eine Pose {pos, look, fov}. Der freie Bildbereich
     (frame, z. B. unter der Kopfleiste und über den Spielkarten) verschiebt
     die Projektionsmitte (camera.setViewOffset) – der Ort erscheint mittig
     im freien Bereich. Inseln werden darin eingepasst (fitPose).
     ------------------------------------------------------------------ */
  const DEG = Math.PI / 180;
  const rig = {
    pos: null, look: null, fov: 40, flight: null, sway: 1,
    shift: { x: 0, y: 0 }, // Verschiebung der Bildmitte in px (aus frame)
    pan: false, panX: 0, panTarget: 0, panMax: 0, unitsPerScreen: 40, // Schieben (Weltkarte im Hochformat)
    pending: null, // { place, opts } – wird im nächsten Bild angewendet (DOM steht dann)
    frame: null, // frame des aktuellen Orts (für Größenänderungen)
    fpsCap: 0, // ruhige Orte: weniger Bilder pro Sekunde (Akku)
    applied: { fov: 0, sx: 0, sy: 0, w: 0, h: 0 },
    curLook: null,
  };
  W.rig = rig; // nur lesen (Diagnose, Flo-Modul)

  const viewSize = () => ({ w: window.innerWidth || 1, h: window.innerHeight || 1 });
  /** frame (Objekt oder Funktion) → {top, bottom, left, right} in px, sinnvoll begrenzt */
  function readFrame(frame) {
    let f = null;
    try { f = typeof frame === 'function' ? frame() : frame; } catch (e) { f = null; }
    const { w, h } = viewSize();
    const n = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));
    const out = { top: n(f && f.top, h), bottom: n(f && f.bottom, h), left: n(f && f.left, w), right: n(f && f.right, w) };
    // mindestens 22 % der Höhe und 40 % der Breite bleiben frei
    const fixV = (minFree, size, a, b) => { const free = size - out[a] - out[b]; if (free < size * minFree) { const k = (size * (1 - minFree)) / Math.max(1, out[a] + out[b]); out[a] *= k; out[b] *= k; } };
    fixV(0.22, h, 'top', 'bottom');
    fixV(0.4, w, 'left', 'right');
    return out;
  }
  const shiftOf = (fr) => ({ x: (fr.left - fr.right) / 2, y: (fr.top - fr.bottom) / 2 });
  function applyProjection(cam, fov, s, w, h) {
    cam.fov = fov;
    cam.aspect = w / h;
    if (Math.abs(s.x) < 0.5 && Math.abs(s.y) < 0.5) {
      if (cam.view && cam.view.enabled) cam.clearViewOffset(); else cam.updateProjectionMatrix();
    } else cam.setViewOffset(w, h, -s.x, -s.y, w, h); // ruft updateProjectionMatrix
  }

  /** Mittelpunkt und Umriss einer Insel (Welt), aus ihrer Bounding-Box beim Aufbau */
  function focusOf(I) {
    const T = W.THREE;
    if (I.anchors && I.anchors.focus) return I.group.localToWorld(I.anchors.focus.clone());
    return I.pos.clone().add(new T.Vector3(0, 1.5, 0));
  }
  function islandPoints(I, { withLabel = false } = {}) {
    const T = W.THREE;
    const c = I.pos;
    const rim = I.rim || 6.2;
    const top = withLabel ? Math.max(I.top || 4, I.anchors.label ? I.anchors.label.y : 5) : I.top || 4;
    const pts = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(new T.Vector3(c.x + Math.cos(a) * rim, -0.2, c.z + Math.sin(a) * rim)); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; pts.push(new T.Vector3(c.x + Math.cos(a) * rim * 0.45, top, c.z + Math.sin(a) * rim * 0.45)); }
    return pts;
  }
  /** Blickrichtung (Einheitsvektor Insel → Kamera): Vorderseite der Insel (lokal +z), elev Grad angehoben */
  function frontDir(I, elev, yawOff = 0) {
    const T = W.THREE;
    const ry = (I.group ? I.group.rotation.y : 0) + yawOff;
    return new T.Vector3(Math.sin(ry) * Math.cos(elev * DEG), Math.sin(elev * DEG), Math.cos(ry) * Math.cos(elev * DEG)).normalize();
  }

  /**
   * Kleinster Abstand, bei dem alle Punkte in den freien Bereich passen.
   * Der Blickpunkt wird dabei so verschoben, dass die Punkte mittig liegen.
   */
  const fit = { cam: null, v: null };
  function fitPose(look, dir, fov, pts, fr, { margin = 12, marginTop = margin, marginX = margin, min = 3, max = 800, center = true } = {}) {
    const T = W.THREE;
    const { w, h } = viewSize();
    const cam = fit.cam || (fit.cam = new T.PerspectiveCamera());
    const v = fit.v || (fit.v = new T.Vector3());
    cam.near = 0.3;
    cam.far = 4000;
    applyProjection(cam, fov, shiftOf(fr), w, h);
    const xL = -1 + (2 * (fr.left + marginX)) / w, xR = 1 - (2 * (fr.right + marginX)) / w;
    const yT = 1 - (2 * (fr.top + marginTop)) / h, yB = -1 + (2 * (fr.bottom + margin)) / h;
    const L = look.clone();
    const put = (d) => { cam.position.copy(L).addScaledVector(dir, d); cam.lookAt(L); cam.updateMatrixWorld(true); };
    const bounds = () => {
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      for (const p of pts) {
        v.copy(p).project(cam);
        if (v.z > 1 || v.z < -1) return null;
        if (v.x < x0) x0 = v.x; if (v.x > x1) x1 = v.x; if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
      }
      return { x0, x1, y0, y1 };
    };
    const fits = (d) => { put(d); const b = bounds(); return !!b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = max;
    for (let round = 0; round < (center ? 4 : 1); round++) {
      let lo = min, hi = max;
      if (fits(lo)) hi = lo;
      else for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
      d = hi;
      if (!center) break;
      put(d);
      const b = bounds();
      if (!b) break;
      const cx = (b.x0 + b.x1) / 2 - (xL + xR) / 2;
      const cy = (b.y0 + b.y1) / 2 - (yB + yT) / 2;
      if (Math.abs(cx) < 0.004 && Math.abs(cy) < 0.004) break;
      const k = d * Math.tan((fov * DEG) / 2);
      const right = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
      const up = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      L.addScaledVector(right, (center === 'y' ? 0 : cx) * k * cam.aspect).addScaledVector(up, cy * k);
    }
    put(d);
    return { pos: cam.position.clone(), look: L, dist: d };
  }

  /** Pose für einen Ort im freien Bereich fr berechnen. */
  function poseFor(place, fr) {
    const T = W.THREE;
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const { w, h } = viewSize();
    const freeW = Math.max(1, w - fr.left - fr.right), freeH = Math.max(1, h - fr.top - fr.bottom);
    const aspect = freeW / freeH;
    const isle = (id) => W.islands[id] || W.islands.hub;
    switch (typeof place === 'string' ? place : place && place.kind) {
      case 'splash': {
        // Flos Heimatinsel als Bühne zwischen Titel und Knopf
        const I = isle('hub');
        // Blick durch die Lücke zwischen Denk-Insel und Entdecker-Welt (vordere Reihe verdeckt sonst)
        const p = fitPose(focusOf(I), frontDir(I, 15, 0.33), 36, islandPoints(I), fr, { margin: 6 });
        return { pos: p.pos, look: p.look, fov: 36, sway: 0.8 };
      }
      case 'home': {
        // Weltkarte: alle Inseln (mit Schild) im freien Bereich. Schmal: mittlerer Streifen, Rest per Wischen.
        const all = Object.values(W.islands);
        const maxX = Math.max(...all.map((I) => Math.abs(I.pos.x)));
        // Schilder sind ~150–180 px breit: schmale Bildschirme zeigen nur einen Teil der Inselreihe
        const strip = freeW < 600 ? 10.5 : freeW < 1000 && aspect < 1.25 ? 16 : Infinity;
        const pan = strip < maxX;
        const elev = aspect < 1 ? 56 : 50;
        const pts = [];
        all.filter((I) => Math.abs(I.pos.x) <= strip + 0.1).forEach((I) => pts.push(...islandPoints(I, { withLabel: true })));
        const dir = V(0, Math.sin(elev * DEG), Math.cos(elev * DEG));
        // Ränder: oben Platz für die Schilder, seitlich halbe Schildbreite
        const p = fitPose(V(0, 0, 0), dir, 40, pts, fr, { margin: 10, marginTop: 70, marginX: Math.min(80, w * 0.16), center: 'y' });
        const unitsPerScreen = 2 * p.dist * Math.tan(20 * DEG) * (w / h);
        return { pos: p.pos, look: p.look, fov: 40, sway: 0.5, pan, panMax: pan ? maxX - strip : 0, unitsPerScreen };
      }
      case 'area': {
        // Insel im freien Bereich oben (darunter die Spielkarten)
        const I = isle(place.id);
        const p = fitPose(focusOf(I), frontDir(I, 25, 0.12), 38, islandPoints(I), fr, { margin: 6 });
        return { pos: p.pos, look: p.look, fov: 38, sway: 0.7 };
      }
      case 'game': {
        // flacher Blick auf die Insel, als ruhiger Hintergrund hinter der Glas-Bühne
        const I = isle(place.id || 'hub');
        const f = focusOf(I);
        const dir = frontDir(I, 10, 0.35);
        const d = aspect < 0.8 ? 21 : 15;
        return { pos: f.clone().addScaledVector(dir, d), look: f.clone().add(V(0, 2.2, 0)), fov: 44, sway: 0.35, fps: 30 };
      }
      case 'reise': {
        const I = isle(place.id || 'hub');
        const m = Math.min(w, h) * 0.12;
        const p = fitPose(focusOf(I), frontDir(I, 30, -0.3), 42, islandPoints(I), fr, { margin: m });
        return { pos: p.pos, look: p.look, fov: 42, sway: 0.5, fps: 30 };
      }
      case 'inspect': {
        // Nahansicht zum Begutachten einer Insel (Werkzeug tools/three/preview.js)
        const I = isle(place.id || 'hub');
        const ang = place.angle == null ? 0.6 : place.angle;
        const d = place.dist || 15;
        const focus = I.pos.clone().add(V(0, 1.6, 0));
        return { pos: focus.clone().add(V(Math.sin(ang) * d, place.height || 7, Math.cos(ang) * d)), look: focus, fov: 38, sway: 0 };
      }
      case 'sky': // ruhiger Himmel (Album, Forscherbuch, Elternbereich, Pause)
      default: {
        return { pos: V(0, 9, 62), look: V(0, 13, 0), fov: 42, sway: 0.3, fps: 30 };
      }
    }
  }

  function callHook(mod, place, opts) {
    if (mod && typeof mod.onPlace === 'function') {
      try { mod.onPlace(place, opts); } catch (e) { console.error('w3d onPlace', e); }
    }
  }
  W.go = function (place, opts = {}) {
    W.place = place;
    callHook(W.flo, place, opts);
    callHook(W.fx, place, opts);
    rig.pending = { place, opts };
    if (W.started) W.wake();
  };
  /** Kamera neu positionieren (z. B. nach Größenänderung) – ohne Flug, ohne Haken */
  W.refreshPlace = () => {
    if (!W.place || !W.started) return;
    if (rig.pending) rig.pending.opts = Object.assign({}, rig.pending.opts, { instant: true });
    else rig.pending = { place: W.place, opts: { instant: true, frame: rig.frame } };
    W.wake();
  };

  function applyPending() {
    const { place, opts } = rig.pending;
    rig.pending = null;
    rig.frame = opts.frame || null;
    const fr = readFrame(rig.frame);
    const pose = poseFor(place, fr);
    const shift = shiftOf(fr);
    rig.sway = pose.sway == null ? 1 : pose.sway;
    rig.fpsCap = pose.fps || 0;
    rig.pan = !!pose.pan;
    rig.panMax = pose.panMax || 0;
    rig.unitsPerScreen = pose.unitsPerScreen || 40;
    if (!rig.pan) rig.panTarget = 0;
    rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, rig.panTarget));
    document.body.classList.toggle('w3d-pan', rig.pan); // Weltkarte schiebbar (Pfeil-Knöpfe zeigen)
    const instant = opts.instant || W.reducedMotion || W.fastFlights || !rig.pos;
    if (instant) {
      rig.pos = pose.pos.clone();
      rig.look = pose.look.clone();
      rig.fov = pose.fov;
      rig.shift = { x: shift.x, y: shift.y };
      rig.flight = null;
      if (!rig.pan) rig.panX = 0;
      return;
    }
    const f0 = rig.flight;
    const target = f0 ? f0.p1 : rig.pos;
    if (target.distanceTo(pose.pos) < 0.05 && (f0 ? f0.l1 : rig.look).distanceTo(pose.look) < 0.05 && Math.abs((f0 ? f0.s1.y : rig.shift.y) - shift.y) < 1) return; // schon dort
    const dist = rig.pos.distanceTo(pose.pos);
    const dur = Math.min(2.0, Math.max(0.9, dist / 45));
    rig.flight = {
      t: 0, dur,
      p0: rig.pos.clone(), l0: rig.look.clone(), f0: rig.fov, s0: { x: rig.shift.x, y: rig.shift.y },
      p1: pose.pos, l1: pose.look, f1: pose.fov, s1: shift,
      arc: Math.min(14, dist * 0.18),
    };
  }

  /** Weltkarte seitlich schieben (dx in Bildschirmbreiten, positiv = nach rechts schauen) */
  W.pan = function (dx) {
    if (!rig.pan) return false;
    rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, rig.panTarget + dx * rig.unitsPerScreen));
    W.wake();
    return true;
  };
  /** {on, x, max}: kann geschoben werden, aktuelle Position (Welt-Einheiten) */
  W.canPan = () => ({ on: rig.pan, x: rig.panTarget, max: rig.panMax });

  function updateCamera(dt, t) {
    const T = W.THREE;
    const cam = W.camera;
    if (rig.flight) {
      const f = rig.flight;
      f.t += dt / f.dur;
      const k = W.ease.inOutCubic(Math.min(1, f.t));
      rig.pos.lerpVectors(f.p0, f.p1, k);
      rig.pos.y += Math.sin(Math.PI * k) * f.arc;
      rig.look.lerpVectors(f.l0, f.l1, k);
      rig.fov = f.f0 + (f.f1 - f.f0) * k;
      rig.shift.x = f.s0.x + (f.s1.x - f.s0.x) * k;
      rig.shift.y = f.s0.y + (f.s1.y - f.s0.y) * k;
      if (f.t >= 1) rig.flight = null;
    }
    // Schieben (Weltkarte im Hochformat), ohne Schieben langsam zur Mitte
    const panGoal = rig.pan ? rig.panTarget : 0;
    rig.panX += (panGoal - rig.panX) * Math.min(1, dt * (rig.pan ? 7 : 3));
    const sway = W.reducedMotion ? 0 : rig.sway;
    const p = cam.position.copy(rig.pos);
    const l = rig.curLook || (rig.curLook = new T.Vector3());
    l.copy(rig.look);
    p.x += rig.panX + Math.sin(t * 0.21) * 0.6 * sway;
    p.y += Math.sin(t * 0.33) * 0.35 * sway;
    l.x += rig.panX;
    cam.lookAt(l);
    // Projektion nur bei Änderung neu berechnen
    const { w, h } = viewSize();
    const a = rig.applied;
    if (Math.abs(a.fov - rig.fov) > 0.01 || Math.abs(a.sx - rig.shift.x) > 0.25 || Math.abs(a.sy - rig.shift.y) > 0.25 || a.w !== w || a.h !== h) {
      applyProjection(cam, rig.fov, rig.shift, w, h);
      a.fov = rig.fov; a.sx = rig.shift.x; a.sy = rig.shift.y; a.w = w; a.h = h;
    }
  }

  /* ------------------------------------------------------------------
     Labels (DOM folgt 3D-Punkt) & Antippen (Raycast)
     ------------------------------------------------------------------ */
  const labels = new Set();
  /** opts.depth: nach Entfernung skalieren (0.72–1.15) und Nähere nach vorn stapeln */
  W.label = function (target, element, opts = {}) {
    const L = { target, element, opts, last: '', vis: null };
    labels.add(L);
    element.classList.add('w3d-label');
    if (opts.depth) element.style.transformOrigin = '0 0';
    if (W.started && W.camera) { screenRect = null; updateLabel(L); }
    return () => labels.delete(L);
  };
  /** Schild an einer Insel (anchors.label, folgt ihrer Bewegung) */
  W.labelIsland = function (id, element, opts) {
    const I = W.islands[id];
    if (!I) return () => {};
    if (!I.labelAnchor) {
      const a = new W.THREE.Object3D();
      a.name = 'label-anchor';
      a.position.copy(I.anchors.label);
      I.group.add(a);
      I.labelAnchor = a;
    }
    return W.label(I.labelAnchor, element, opts);
  };
  let screenRect = null; // Leinwand-Rechteck, einmal pro Bild gelesen
  const tmpV = { v: null, wp: null };
  W.toScreen = function (vec3) {
    const v = (tmpV.v || (tmpV.v = new W.THREE.Vector3())).copy(vec3).project(W.camera);
    const r = screenRect || W.canvas.getBoundingClientRect();
    return { x: (v.x * 0.5 + 0.5) * r.width + r.left, y: (-v.y * 0.5 + 0.5) * r.height + r.top, visible: v.z < 1 && v.z > -1 };
  };
  function updateLabel(L) {
    const wp = tmpV.wp || (tmpV.wp = new W.THREE.Vector3());
    if (L.target.isObject3D) { L.target.updateWorldMatrix(true, false); wp.setFromMatrixPosition(L.target.matrixWorld); } else wp.copy(L.target);
    const s = W.toScreen(wp);
    let tf = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
    if (L.opts.depth) {
      const dist = W.camera.position.distanceTo(wp);
      const ref = rig.curLook ? W.camera.position.distanceTo(rig.curLook) : dist;
      const k = Math.max(0.72, Math.min(1.15, Math.sqrt(ref / Math.max(1, dist))));
      tf += ` scale(${k.toFixed(3)})`;
      const z = String(Math.max(1, Math.round(4000 - dist * 10)));
      if (L.z !== z) { L.element.style.zIndex = z; L.z = z; }
    }
    tf += ' translate(-50%, -100%)';
    if (L.last !== tf) { L.element.style.transform = tf; L.last = tf; }
    const vis = s.visible ? '' : 'hidden';
    if (L.vis !== vis) { L.element.style.visibility = vis; L.vis = vis; }
  }
  function updateLabels() {
    if (!labels.size) return;
    screenRect = W.canvas.getBoundingClientRect();
    for (const L of labels) {
      if (!L.element.isConnected) { labels.delete(L); continue; }
      updateLabel(L);
    }
    screenRect = null;
  }
  const pickables = [];
  W.interactive = function (obj, onTap) {
    obj.userData.onTap = onTap;
    pickables.push(obj);
    return () => { const i = pickables.indexOf(obj); if (i >= 0) pickables.splice(i, 1); };
  };
  function pick(clientX, clientY) {
    const T = W.THREE;
    const r = W.canvas.getBoundingClientRect();
    const ndc = new T.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    const ray = new T.Raycaster();
    ray.setFromCamera(ndc, W.camera);
    const hits = ray.intersectObjects(pickables.filter((o) => o.visible), true);
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.onTap) o = o.parent;
      if (o) return o;
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Qualität: Bildrate messen und Auflösung/Schatten anpassen
     ------------------------------------------------------------------ */
  const DPR_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2];
  let dprIndex = 3;
  let perf = { acc: 0, n: 0, since: 0 };
  function applyQuality() {
    const max = Math.min(window.devicePixelRatio || 1, 2);
    let i = dprIndex;
    while (i > 0 && DPR_STEPS[i] > max) i--;
    const dpr = DPR_STEPS[i];
    W.stats.dpr = dpr;
    W.renderer.setPixelRatio(dpr);
    W.renderer.setSize(window.innerWidth, window.innerHeight, false);
    W.quality = dprIndex >= 3 ? 'high' : dprIndex >= 1 ? 'medium' : 'low';
    W.renderer.shadowMap.enabled = W.quality !== 'low';
    document.body.dataset.w3dQuality = W.quality;
  }
  function measure(dt) {
    perf.acc += dt; perf.n++; perf.since += dt;
    if (perf.since < 2.5) return;
    const avg = perf.acc / perf.n;
    W.stats.fps = Math.round(1 / avg);
    if (avg > 1 / 38 && dprIndex > 0) { dprIndex--; applyQuality(); }
    else if (avg < 1 / 57 && dprIndex < DPR_STEPS.length - 1 && perf.stableHigh++ > 2) { dprIndex++; applyQuality(); perf.stableHigh = 0; }
    perf = { acc: 0, n: 0, since: 0, stableHigh: perf.stableHigh || 0 };
  }

  /* ------------------------------------------------------------------
     Zusätzliche transparente Leinwand (Flo, Effekte)
     ------------------------------------------------------------------ */
  W.layer = function ({ parent = document.body, className = '', dprCap = 2, fov = 30 } = {}) {
    const T = W.THREE;
    const canvas = document.createElement('canvas');
    canvas.className = 'w3d-layer ' + className;
    parent.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: true });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    scene.environment = W.envMap || null;
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 200);
    const L = {
      canvas, renderer, scene, camera,
      resize() {
        const r = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
        if (w === L.w && h === L.h) return;
        L.w = w; L.h = h;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      render() { L.resize(); renderer.render(scene, camera); },
      dispose() { renderer.dispose(); canvas.remove(); },
    };
    return L;
  };

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  let raf = 0;
  let last = 0;
  let lastRender = 0;
  let sleeping = false;
  let sleepAfter = false;
  W.wake = function () {
    sleepAfter = false;
    sleeping = false;
    if (!W.started || raf || W.compiling) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  /** Ruhemodus (z. B. Elternbereich): nach der laufenden Kamerafahrt bleibt das letzte Bild stehen. */
  W.sleep = function () { sleepAfter = true; };
  W.isSleeping = () => sleeping;
  function renderNow() {
    if (!W.started || W.lost) return;
    W.renderer.render(W.scene, W.camera);
  }
  function loop(now) {
    raf = 0;
    if (document.hidden || sleeping || W.lost) return;
    // ruhige Orte (Spiel, Himmel): höchstens rig.fpsCap Bilder pro Sekunde
    if (rig.fpsCap && !rig.flight && !rig.pending && now - lastRender < 1000 / rig.fpsCap - 4) {
      raf = requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    lastRender = now;
    W.time += dt;
    const t = W.time;
    if (rig.pending) applyPending();
    stepTweens(dt);
    updateCamera(dt, t);
    for (const id in W.islands) { const u = W.islands[id].group.userData.update; if (u) u(dt, t); }
    frameFns.forEach((fn) => { try { fn(dt, t); } catch (e) { console.error('w3d frame', e); frameFns.delete(fn); } });
    W.renderer.render(W.scene, W.camera);
    updateLabels();
    W.stats.frames++;
    if (W.stats.frames === 1 && W.stats.t) W.stats.t.frame1 = Math.round(performance.now());
    if (W.stats.frames === 2) document.body.classList.add('w3d-live');
    if (!rig.fpsCap) measure(dt);
    if (sleepAfter && !rig.flight && !rig.pending && W.stats.frames > 2) { sleeping = true; sleepAfter = false; return; }
    raf = requestAnimationFrame(loop);
  }

  /** Schriften für Canvas-Texturen (W.textTexture) vorher laden – höchstens ms warten */
  function fontsReady(ms = 1500) {
    try {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      const loads = ['500 48px "Fredoka"', '600 48px "Fredoka"', '700 48px "Fredoka"', '700 48px "Andika"'].map((f) => document.fonts.load(f).catch(() => null));
      return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, ms))]);
    } catch (e) {
      return Promise.resolve();
    }
  }

  W.start = function () {
    if (W.ready) return W.ready;
    W.enabled = W.decide();
    if (!W.enabled) { W.ready = Promise.resolve(false); return W.ready; }
    document.body.classList.add('w3d');
    const ms = () => Math.round(performance.now());
    W.stats.t = { start: ms() }; // Zeiten (ms) für die Diagnose: three geladen, Aufbau, erstes Bild
    W.ready = loadThree().then((T) => { W.stats.t.three = ms(); return fontsReady(); }).then(() => { W.stats.t.fonts = ms(); return init(window.THREE); }).then(() => { W.stats.t.built = ms(); return true; }, (e) => {
      console.warn('3D-Welt nicht verfügbar:', e && e.message);
      W.enabled = false;
      W.reason = 'error';
      W.started = false;
      if (W.canvas) W.canvas.remove();
      document.body.classList.remove('w3d', 'w3d-live');
      return false;
    });
    return W.ready;
  };

  function init(T) {
    W.THREE = T;
    W.reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const canvas = document.createElement('canvas');
    canvas.id = 'w3d-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    W.canvas = canvas;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    W.renderer = renderer;
    if ((window.devicePixelRatio || 1) < 1.3) dprIndex = 2;
    if (window.innerWidth * window.innerHeight > 2.2e6) dprIndex = Math.min(dprIndex, 2);

    const scene = new T.Scene();
    scene.background = new T.Color('#9fd8ff');
    scene.fog = new T.Fog('#bfe6ff', 90, 330);
    W.scene = scene;
    const camera = new T.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 900);
    W.camera = camera;

    // Licht: Himmel/Boden, Sonne mit weichen Schatten, Umgebungsreflexe
    const hemi = new T.HemisphereLight('#dff3ff', '#f4d9a8', 1.15);
    const sun = new T.DirectionalLight('#fff3df', 2.2);
    sun.position.set(-40, 70, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
    sun.shadow.camera.near = 10; sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 4;
    const amb = new T.AmbientLight('#ffffff', 0.15);
    scene.add(hemi, sun, sun.target, amb);
    W.lights = { hemi, sun, amb };
    try {
      const pmrem = new T.PMREMGenerator(renderer);
      W.envMap = pmrem.fromScene(new T.addons.RoomEnvironment(), 0.04).texture;
      scene.environment = W.envMap;
      pmrem.dispose();
    } catch (e) { /* ohne Reflexe */ }

    // Bausatz, Umgebung, Inseln
    if (REG.kit) { try { W.kit = REG.kit(W); } catch (e) { console.error('w3d kit', e); } }
    REG.env.forEach((fn) => { try { fn(W); } catch (e) { console.error('w3d env', e); } });
    const areas = (LT.areas || []).filter((a) => (LT.gamesOfArea ? LT.gamesOfArea(a.id).length : (a.games || []).length) || a.id === 'kino');
    const pos = layoutPositions(areas);
    const all = [{ id: 'hub', color: '#ff8a3d', title: 'Flos Insel' }].concat(areas);
    const box = new T.Box3();
    all.forEach((a) => {
      let built = null;
      const b = REG.island[a.id];
      try { built = b ? b(W, a) : null; } catch (e) { console.error('w3d island ' + a.id, e); }
      if (!built || !built.group) built = defaultIsland(T, a);
      const g = built.group;
      g.name = 'island-' + a.id;
      const p = pos[a.id] || [0, 0, 0];
      g.position.set(p[0], p[1], p[2]);
      // Inseln leicht zur Kamera drehen (wirkt lebendiger)
      if (a.id !== 'hub') g.rotation.y = Math.atan2(p[0], 40) * 0.6;
      g.traverse((o) => { if (o.isMesh) { if (o.castShadow === undefined) o.castShadow = true; } });
      scene.add(g);
      const anchors = Object.assign({ label: new T.Vector3(0, 5, 0), focus: new T.Vector3(0, 1.5, 0) }, built.anchors || {});
      const I = { id: a.id, area: a, group: g, anchors, pos: g.position.clone() };
      // Umriss für die Kamera (Einpassen): Uferradius und Höhe aus der Bounding-Box
      try {
        g.updateMatrixWorld(true);
        box.setFromObject(g);
        const r = Math.max(box.max.x - p[0], p[0] - box.min.x, box.max.z - p[2], p[2] - box.min.z) * 0.9;
        I.rim = Math.max(4.5, Math.min(8.5, r || 6.2));
        I.top = Math.max(2.5, Math.min(8, box.max.y || 4));
      } catch (e) { I.rim = 6.2; I.top = 4; }
      W.islands[a.id] = I;
      // Antippen: die App entscheidet (Weltkarte → Insel öffnen)
      W.interactive(g, () => {
        if (LT.app && LT.app.onIslandTap) return LT.app.onIslandTap(a.id);
        if (a.id !== 'hub' && LT.app && LT.app.screen === 'home') { if (LT.sfx) LT.sfx.play('click'); LT.app.showArea(a.id); }
      });
    });
    if (REG.flo) { try { W.flo = REG.flo(W); } catch (e) { console.error('w3d flo', e); } }
    if (REG.fx) { try { W.fx = REG.fx(W); } catch (e) { console.error('w3d fx', e); } }
    REG.ready.forEach((fn) => { try { fn(W); } catch (e) { console.error('w3d ready', e); } });

    applyQuality();
    window.addEventListener('resize', () => {
      applyQuality();
      W.refreshPlace();
      if (sleeping) { // ruhende Welt: einmal neu zeichnen (setSize leert die Leinwand)
        if (rig.pending) applyPending();
        updateCamera(0, W.time);
        renderNow();
        updateLabels();
      }
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !sleeping) W.wake(); });
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); W.lost = true; document.body.classList.remove('w3d-live'); }, false);
    canvas.addEventListener('webglcontextrestored', () => { W.lost = false; W.stats.frames = 0; W.wake(); }, false);

    // Antippen von 3D-Objekten und Wischen (nur wenn das Ereignis die Leinwand trifft)
    let down = null;
    canvas.addEventListener('pointerdown', (e) => {
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), pan: rig.panTarget, moved: 0 };
      if (rig.pan) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* egal */ } }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      down.moved = Math.max(down.moved, Math.hypot(e.clientX - down.x, e.clientY - down.y));
      if (!rig.pan) return;
      const dx = (e.clientX - down.x) / Math.max(1, window.innerWidth);
      rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, down.pan - dx * rig.unitsPerScreen));
      W.wake();
    });
    const end = (e, tap) => {
      if (!down || e.pointerId !== down.id) return;
      const moved = Math.max(down.moved, Math.hypot(e.clientX - down.x, e.clientY - down.y));
      const quick = performance.now() - down.t < 600;
      down = null;
      if (tap && moved < 12 && quick) {
        const o = pick(e.clientX, e.clientY);
        if (o) o.userData.onTap(o);
      }
    };
    canvas.addEventListener('pointerup', (e) => end(e, true));
    canvas.addEventListener('pointercancel', (e) => end(e, false));

    W.started = true;
    const p0 = rig.pending || { place: W.place || 'splash', opts: {} };
    W.go(p0.place, Object.assign({}, p0.opts, { instant: true }));
    // Shader vorab übersetzen (mit KHR_parallel_shader_compile ohne Ruckeln), erst dann rendern
    let warm = null;
    try {
      if (renderer.compileAsync && renderer.extensions.has('KHR_parallel_shader_compile')) warm = renderer.compileAsync(scene, camera);
    } catch (e) { warm = null; }
    const run = () => { W.compiling = false; W.wake(); return true; };
    if (!warm || typeof warm.then !== 'function') return run();
    W.compiling = true;
    return Promise.race([warm.catch(() => null), new Promise((r) => setTimeout(r, 5000))]).then(run);
  }

  /**
   * Diagnose: einmal (ohne Schatten-Pass) in ein kleines Bild rendern und die
   * Pixel auswerten. ok = Bild hat Inhalt (viele Farben, Kontrast).
   */
  W.debugPixels = function ({ w = 96, h = 64 } = {}) {
    if (!W.started || W.lost) return null;
    const T = W.THREE, r = W.renderer;
    const rt = new T.WebGLRenderTarget(w, h);
    const auto = r.shadowMap.autoUpdate;
    r.shadowMap.autoUpdate = false;
    r.shadowMap.needsUpdate = false;
    let calls = 0, triangles = 0;
    const buf = new Uint8Array(w * h * 4);
    try {
      r.setRenderTarget(rt);
      r.render(W.scene, W.camera);
      calls = r.info.render.calls;
      triangles = r.info.render.triangles;
      r.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    } finally {
      r.setRenderTarget(null);
      r.shadowMap.autoUpdate = auto;
      rt.dispose();
    }
    const seen = new Set();
    let sum = 0, sum2 = 0;
    for (let i = 0; i < buf.length; i += 4) {
      seen.add(((buf[i] >> 4) << 8) | ((buf[i + 1] >> 4) << 4) | (buf[i + 2] >> 4));
      const l = 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2];
      sum += l; sum2 += l * l;
    }
    const n = buf.length / 4;
    const mean = sum / n;
    const std = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
    return { w, h, colors: seen.size, mean: Math.round(mean), std: Math.round(std * 10) / 10, calls, triangles, ok: seen.size >= 16 && std > 4 };
  };

  /** Für Tests und Diagnose */
  W.debug = () => ({
    enabled: W.enabled, started: W.started, mode: W.mode, reason: W.reason,
    place: W.place, islands: Object.keys(W.islands), quality: W.quality, fps: W.stats.fps, dpr: W.stats.dpr,
    frames: W.stats.frames, sleeping, pan: rig.pan, flo: !!W.flo, fx: !!W.fx, kit: !!W.kit,
  });
})();
