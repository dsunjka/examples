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
     W.go(place, opts)                            Kamera fliegen lassen (siehe PLACES unten)
     W.islands[areaId]                            {group, anchors, pos}
     W.label(vec3OrObject, element)               DOM-Element folgt einem 3D-Punkt
     W.interactive(object3d, onTap)               antippbar (Raycast)
     W.mat(color, opts)                           geteilte MeshStandardMaterial
     W.textTexture(text, opts) / W.emojiTexture(emoji, px)
     W.tween(obj, props, {dur, ease, delay, onUpdate, onDone})
     W.ease.{inOutCubic,outBack,outCubic,outElastic}
     W.rng(seed)                                  deterministischer Zufall
     W.layer({ parent, dprCap })                  zusätzliche transparente Leinwand
                                                  (für Flo in .mascot und Effekte)
     W.quality  'high' | 'medium' | 'low'         passt sich der Bildrate an
     W.reducedMotion                              Bewegung reduzieren (Systemeinstellung)
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
  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }
  W.supported = null;
  W.wanted = function () {
    if (params.get('3d') === '0') return false;
    if (params.get('3d') === '1') return true;
    if (LT.config && LT.config.test) return false;
    const s = LT.progress && LT.progress.settings ? LT.progress.settings().graphics : 'auto';
    if (s === 'off') return false;
    return true;
  };
  W.decide = function () {
    if (W.supported === null) W.supported = webglOK();
    return W.supported && W.wanted();
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
    back.forEach((a, i) => {
      const c = i - (back.length - 1) / 2;
      pos[a.id] = [c * 17, 0, -24 - Math.abs(c) * 2];
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
     ------------------------------------------------------------------ */
  const rig = { pos: null, look: null, fov: 40, flight: null, sway: 1, yaw: 0, yawTarget: 0, pan: false };
  /** Pose für einen Ort berechnen. */
  function poseFor(place, opts = {}) {
    const T = W.THREE;
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const aspect = W.camera.aspect;
    const portrait = aspect < 0.9;
    const isle = (id) => W.islands[id] || W.islands.hub;
    const islePose = (id, dist, height, lookY, lookShift = 0) => {
      const I = isle(id);
      const p = I.pos.clone();
      const focus = I.anchors.focus ? I.anchors.focus.clone().add(p) : p.clone().add(V(0, 1.5, 0));
      // von der Weltmitte weg auf die Insel schauen (Inseln hinten: von vorne)
      const dir = p.clone().setY(0);
      if (dir.lengthSq() < 1 || p.z < -10) dir.set(0, 0, 1); else dir.normalize();
      const d = dist * (portrait ? 1.45 : 1);
      const pos = focus.clone().add(dir.clone().multiplyScalar(d)).add(V(0, height, 0));
      const look = focus.clone().add(V(0, lookY, 0));
      if (lookShift) look.add(dir.clone().multiplyScalar(-lookShift));
      return { pos, look };
    };
    switch (typeof place === 'string' ? place : place && place.kind) {
      case 'splash': {
        const p = islePose('hub', 15, 3.2, -0.2);
        return Object.assign(p, { fov: 38, sway: 1 });
      }
      case 'home': {
        // ganze Welt sichtbar: Abstand aus Seitenverhältnis
        const width = 104; // Breite der Inselreihe vorne (7 × 15 + Rand)
        const fovH = 2 * Math.atan(Math.tan((40 * Math.PI) / 360) * aspect);
        let dist = (width / 2) / Math.tan(fovH / 2);
        dist = Math.min(Math.max(dist, 58), portrait ? 95 : 140);
        return { pos: V(0, dist * 0.62, dist * 0.78 + 18), look: V(0, -2, 4), fov: 40, sway: 0.6, pan: portrait };
      }
      case 'area': {
        // Insel oben im Bild, darunter die Spielkarten
        const p = islePose(place.id, 17, 7.5, portrait ? -6.5 : -4.2);
        return Object.assign(p, { fov: 40, sway: 1 });
      }
      case 'game': {
        // flacher Blick auf die Insel, als ruhiger Hintergrund
        const p = islePose(place.id || 'hub', 13, 1.6, 1.4);
        return Object.assign(p, { fov: 44, sway: 0.35 });
      }
      case 'reise': {
        const p = islePose(place.id || 'hub', 22, 11, -3.5);
        return Object.assign(p, { fov: 42, sway: 0.5 });
      }
      case 'inspect': {
        // Nahansicht zum Begutachten einer Insel (Werkzeug tools/three/preview.js)
        const I = isle(place.id || 'hub');
        const ang = place.angle == null ? 0.6 : place.angle;
        const d = place.dist || 15;
        const focus = I.pos.clone().add(V(0, 1.6, 0));
        return { pos: focus.clone().add(V(Math.sin(ang) * d, place.height || 7, Math.cos(ang) * d)), look: focus, fov: 38, sway: 0 };
      }
      case 'sky': // ruhiger Himmel (Album, Forscherbuch, Elternbereich)
      default: {
        return { pos: V(0, 9, 62), look: V(0, 13, 0), fov: 42, sway: 0.3 };
      }
    }
  }

  W.go = function (place, opts = {}) {
    W.place = place;
    if (!W.started || !W.camera) return;
    const pose = poseFor(place, opts);
    rig.sway = pose.sway == null ? 1 : pose.sway;
    rig.pan = !!pose.pan;
    if (!rig.pan) rig.yawTarget = 0;
    const instant = opts.instant || W.reducedMotion || !rig.pos;
    if (instant) {
      rig.pos = pose.pos.clone();
      rig.look = pose.look.clone();
      rig.fov = pose.fov;
      rig.flight = null;
      return;
    }
    const dist = rig.pos.distanceTo(pose.pos);
    const dur = Math.min(2.0, Math.max(0.9, dist / 45));
    rig.flight = {
      t: 0, dur,
      p0: rig.pos.clone(), l0: rig.look.clone(), f0: rig.fov,
      p1: pose.pos, l1: pose.look, f1: pose.fov,
      arc: Math.min(14, dist * 0.18),
    };
    W.wake();
  };
  /** Kamera neu positionieren (z. B. nach Größenänderung) */
  W.refreshPlace = () => { if (W.place) W.go(W.place, { instant: true }); };

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
      if (f.t >= 1) rig.flight = null;
    }
    rig.yaw += (rig.yawTarget - rig.yaw) * Math.min(1, dt * 6);
    const sway = W.reducedMotion ? 0 : rig.sway;
    const off = new T.Vector3(Math.sin(t * 0.21) * 0.6 * sway, Math.sin(t * 0.33) * 0.35 * sway, 0);
    // Schwenk (Weltkarte im Hochformat): um die Weltmitte drehen
    const p = rig.pos.clone();
    const l = rig.look.clone();
    // Wischen über die Weltkarte (Hochformat): Kamera und Blickpunkt seitlich verschieben
    if (Math.abs(rig.yaw) > 1e-4) {
      const shift = new T.Vector3(-rig.yaw * 40, 0, 0);
      p.add(shift);
      l.add(shift);
    }
    cam.position.copy(p).add(off);
    cam.lookAt(l);
    if (Math.abs(cam.fov - rig.fov) > 0.01) { cam.fov = rig.fov; cam.updateProjectionMatrix(); }
  }

  /* ------------------------------------------------------------------
     Labels (DOM folgt 3D-Punkt) & Antippen (Raycast)
     ------------------------------------------------------------------ */
  const labels = new Set();
  W.label = function (target, element) {
    const L = { target, element };
    labels.add(L);
    element.classList.add('w3d-label');
    return () => labels.delete(L);
  };
  const tmpV = { v: null };
  W.toScreen = function (vec3) {
    const v = (tmpV.v || (tmpV.v = new W.THREE.Vector3())).copy(vec3).project(W.camera);
    const r = W.canvas.getBoundingClientRect();
    return { x: (v.x * 0.5 + 0.5) * r.width + r.left, y: (-v.y * 0.5 + 0.5) * r.height + r.top, visible: v.z < 1 && v.z > -1 };
  }
  function updateLabels() {
    const T = W.THREE;
    const wp = new T.Vector3();
    for (const L of labels) {
      if (!L.element.isConnected) { labels.delete(L); continue; }
      if (L.target.isObject3D) L.target.getWorldPosition(wp); else wp.copy(L.target);
      const s = W.toScreen(wp);
      L.element.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      L.element.style.visibility = s.visible ? '' : 'hidden';
    }
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
  let sleeping = false;
  W.wake = function () {
    if (!W.started || raf) return;
    sleeping = false;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  /** Ruhemodus: z. B. im Elternbereich – das letzte Bild bleibt stehen. */
  W.sleep = function () { sleeping = true; };
  function loop(now) {
    raf = 0;
    if (document.hidden || sleeping) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    W.time += dt;
    const t = W.time;
    stepTweens(dt);
    updateCamera(dt, t);
    for (const id in W.islands) { const u = W.islands[id].group.userData.update; if (u) u(dt, t); }
    frameFns.forEach((fn) => { try { fn(dt, t); } catch (e) { console.error('w3d frame', e); frameFns.delete(fn); } });
    W.renderer.render(W.scene, W.camera);
    updateLabels();
    W.stats.frames++;
    if (W.stats.frames === 2) document.body.classList.add('w3d-live');
    measure(dt);
    raf = requestAnimationFrame(loop);
  }

  W.start = function () {
    if (W.ready) return W.ready;
    W.enabled = W.decide();
    if (!W.enabled) { W.ready = Promise.resolve(false); return W.ready; }
    document.body.classList.add('w3d');
    W.ready = loadThree().then(init).then(() => true, (e) => {
      console.warn('3D-Welt nicht verfügbar:', e && e.message);
      W.enabled = false;
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
      W.islands[a.id] = { id: a.id, area: a, group: g, anchors, pos: g.position.clone() };
      if (a.id !== 'hub') W.interactive(g, () => { if (LT.app && LT.app.screen === 'home') { LT.sfx && LT.sfx.play('click'); LT.app.showArea(a.id); } });
    });
    if (REG.flo) { try { W.flo = REG.flo(W); } catch (e) { console.error('w3d flo', e); } }
    if (REG.fx) { try { W.fx = REG.fx(W); } catch (e) { console.error('w3d fx', e); } }
    REG.ready.forEach((fn) => { try { fn(W); } catch (e) { console.error('w3d ready', e); } });

    applyQuality();
    window.addEventListener('resize', () => {
      W.camera.aspect = window.innerWidth / window.innerHeight;
      W.camera.updateProjectionMatrix();
      applyQuality();
      W.refreshPlace();
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) W.wake(); });

    // Antippen von 3D-Objekten (nur wenn das Ereignis die Leinwand trifft)
    let down = null;
    canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now(), yaw: rig.yawTarget }; });
    canvas.addEventListener('pointermove', (e) => {
      if (!down || !rig.pan) return;
      const dx = (e.clientX - down.x) / window.innerWidth;
      rig.yawTarget = Math.max(-0.9, Math.min(0.9, down.yaw - dx * 1.6));
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 600;
      down = null;
      if (moved < 12 && quick) {
        const o = pick(e.clientX, e.clientY);
        if (o) o.userData.onTap(o);
      }
    });
    W.started = true;
    W.go(W.place || 'splash', { instant: true });
    W.wake();
    return true;
  }

  /** Für Tests und Diagnose */
  W.debug = () => ({ enabled: W.enabled, started: W.started, place: W.place, islands: Object.keys(W.islands), quality: W.quality, fps: W.stats.fps, dpr: W.stats.dpr, frames: W.stats.frames, flo: !!W.flo, fx: !!W.fx, kit: !!W.kit });
})();
