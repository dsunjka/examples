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
                                                  opts: { instant, frame, live }  frame = freier Bildbereich
                                                  {top, bottom, left, right} in CSS-px (oder Funktion,
                                                  die ihn liefert): Der Ort wird darin zentriert
                                                  (Projektionsmitte verschoben) und eingepasst.
                                                  live: frame laufend nachlesen (z. B. HUD wächst).
                                                  Die Pose wird erst im nächsten Bild berechnet –
                                                  das DOM des neuen Bildschirms steht dann schon.
                                                  Danach: W.flo.onPlace(place, opts), W.fx.onPlace(…)
     W.place                                      aktueller Ort ('splash' | 'home' | 'sky' |
                                                  {kind:'area'|'game'|'reise'|'inspect', id})
     W.islands[areaId]                            {group, anchors, pos, rim, top, sphere}
     W.layoutPositions(areas)                     Anordnung: drei versetzte Reihen (siehe unten)
     W.label(target, element, opts)               DOM-Element folgt einem 3D-Punkt (Vector3, Object3D
                                                  oder Funktion). opts: depth, scale, align ('bottom' |
                                                  'top'), avoid (Gruppe: Ausweichen in Bildschirm-
                                                  koordinaten), safe(), obstacles() – siehe W.label
     W.labelIsland(areaId, element, opts)         Schild am anchors.label einer Insel; opts.shore:
                                                  am Strand vor der Insel (Weltkarte)
     W.interactive(object3d, onTap)               antippbar (Raycast)
     W.pan(dx) / W.canPan() / W.panTo(x)          Weltkarte im Hochformat seitlich schieben
                                                  (dx in Bildschirmbreiten, auch per Wischen).
                                                  Beim Betreten schaut sie auf die Insel, von der
                                                  man kommt, sonst auf die erste Kita-Insel.
     W.sleep() / W.wake()                         Ruhemodus (nach der laufenden Kamerafahrt)
     W.debugPixels()                              einmal rendern + Pixel lesen (Tests, Diagnose):
                                                  {colors, std, calls, triangles, ok}
     W.mat(color, opts)                           geteilte MeshStandardMaterial
     W.textTexture(text, opts) / W.emojiTexture(emoji, px)
     W.tween(obj, props, {dur, ease, delay, onUpdate, onDone})
     W.ease.{inOutCubic,outBack,outCubic,outElastic}
     W.rng(seed)                                  deterministischer Zufall
     W.layer({ parent, dprCap, fov, antialias })  zusätzliche transparente Leinwand (für Flo in
                                                  .mascot und Effekte); Tonwerte wie W.renderer,
                                                  Reflexe bringt jede Ebene selbst mit
     W.quality  'high' | 'medium' | 'low'         passt sich der Bildrate an
     W.reducedMotion                              Bewegung reduzieren (Systemeinstellung)
     W.debug()                                    Diagnose: Ort, Qualität, Bilder, culled (Inseln
                                                  außerhalb des Bildes: Animation ruht), fov
     Inseln: userData.update läuft nur, solange die Hüllkugel der Insel im Bild ist.
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
     Drei versetzte Reihen, gesehen von der Weltkarten-Kamera (von +z, 3/4-Blick):
       vorne   die mittleren Vorschul-Inseln – groß im Vordergrund
       Mitte   Flos Heimatinsel, links und rechts je zwei Vorschul-Inseln
       hinten  Schul-Inseln und Kino – im Mittelgrund vor dem Horizont
     Jede Insel steht vor einer Lücke der Reihe dahinter, damit in der
     Perspektive kein Wahrzeichen hinter einer näheren Insel verschwindet.
     (Inselradius ≈ 6–7, mit Steinen und Steg ≈ 8)
     ------------------------------------------------------------------ */
  const ROWS = { m: 17, front: 34, back: -34, backGap: 18 };
  function layoutPositions(areas) {
    const pos = { hub: [0, 0, 0] };
    const pre = areas.filter((a) => !a.grade && a.id !== 'kino');
    const back = areas.filter((a) => a.grade || a.id === 'kino');
    const m = ROWS.m;
    // Mitte: die ersten zwei links, die letzten zwei rechts von Flos Insel
    const nMid = Math.min(4, pre.length), nL = Math.ceil(nMid / 2), nR = nMid - nL;
    const left = pre.slice(0, nL), right = pre.slice(pre.length - nR), front = pre.slice(nL, pre.length - nR);
    // k = 0 innen (dicht neben Flos Insel, leicht vorgezogen), k = 1 außen (weiter, etwas zurück)
    const mid = (k) => [m * (1 + k * 1.1), k ? -2 * k : 4];
    left.forEach((a, i) => { const [x, z] = mid(nL - 1 - i); pos[a.id] = [-x, 0, z]; });
    right.forEach((a, i) => { const [x, z] = mid(i); pos[a.id] = [x, 0, z]; });
    // vorne: in den Lücken der Mitte, außen etwas zurück (flacher Bogen)
    front.forEach((a, i) => { const c = i - (front.length - 1) / 2; pos[a.id] = [c * 1.5 * m, 0, ROWS.front - Math.abs(c) * 5]; });
    // hinten: enger (wirkt in der Ferne ohnehin kleiner), außen leicht zurück
    back.forEach((a, i) => { const c = i - (back.length - 1) / 2; pos[a.id] = [c * ROWS.backGap, 0, ROWS.back - Math.abs(c) * 2]; });
    return pos;
  }
  W.layoutPositions = layoutPositions;

  /**
   * Genaue Bounding-Box einer Insel (Welt): alle Ecken der sichtbaren Netze.
   * Skinned-/Instanz-Netze über ihre Geometrie-Box (deren Knochen stehen vor dem
   * ersten Bild noch nicht – die genaue Messung von three.js läge daneben).
   */
  function measureIsland(g, box) {
    const T = W.THREE, v = new T.Vector3(), tmp = new T.Box3();
    box.makeEmpty();
    g.traverse((o) => {
      if (!o.visible || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      if (o.isSkinnedMesh || o.isPoints || o.isLine) {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        box.union(tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
      } else if (o.isInstancedMesh) {
        o.computeBoundingBox();
        if (o.boundingBox) box.union(tmp.copy(o.boundingBox).applyMatrix4(o.matrixWorld));
      } else if (o.isMesh) {
        const pos = o.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
      }
    });
    return box;
  }

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
    homeFrom: null, // Weltkarte gerade neu betreten: Ort davor (für die erste Schiebe-Lage)
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
   * opts: margin/marginTop/marginBottom/marginX (px), center (true | 'y' | false),
   *       axis ('xy' | 'y': nur senkrecht einpassen – waagrecht wird geschoben),
   *       align ('center' | 'bottom': bei senkrechtem Spielraum unten anlegen)
   * Liefert {pos, look, dist, fill: {x, y}} (fill: Anteil des freien Bereichs).
   */
  const fit = { cam: null, v: null };
  function fitPose(look, dir, fov, pts, fr, { margin = 12, marginTop = margin, marginBottom = margin, marginX = margin, min = 3, max = 800, center = true, axis = 'xy', align = 'center' } = {}) {
    const T = W.THREE;
    const { w, h } = viewSize();
    const cam = fit.cam || (fit.cam = new T.PerspectiveCamera());
    const v = fit.v || (fit.v = new T.Vector3());
    cam.near = 0.3;
    cam.far = 4000;
    applyProjection(cam, fov, shiftOf(fr), w, h);
    const xL = -1 + (2 * (fr.left + marginX)) / w, xR = 1 - (2 * (fr.right + marginX)) / w;
    const yT = 1 - (2 * (fr.top + marginTop)) / h, yB = -1 + (2 * (fr.bottom + marginBottom)) / h;
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
    const onlyY = axis === 'y';
    const fits = (d) => { put(d); const b = bounds(); return !!b && (onlyY || (b.x0 >= xL && b.x1 <= xR)) && b.y0 >= yB && b.y1 <= yT; };
    const search = () => {
      let lo = min, hi = max;
      if (fits(lo)) return lo;
      for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
      return hi;
    };
    const right = new T.Vector3(), up = new T.Vector3();
    /** Blickpunkt verschieben, bis die Punkte mittig (bzw. unten) liegen; danach neu einpassen */
    const settle = (bottom) => {
      let d = search();
      for (let round = 0; round < 6; round++) {
        put(d);
        const b = bounds();
        if (!b) break;
        const cx = center === 'y' ? 0 : (b.x0 + b.x1) / 2 - (xL + xR) / 2;
        const cy = bottom ? b.y0 - yB : (b.y0 + b.y1) / 2 - (yB + yT) / 2;
        if (Math.abs(cx) < 0.004 && Math.abs(cy) < 0.004) break;
        const k = d * Math.tan((fov * DEG) / 2);
        right.setFromMatrixColumn(cam.matrixWorld, 0);
        up.setFromMatrixColumn(cam.matrixWorld, 1);
        L.addScaledVector(right, cx * k * cam.aspect).addScaledVector(up, cy * k);
        d = search();
      }
      return d;
    };
    let d = center ? settle(false) : search();
    // unten anlegen nur, wenn die Breite begrenzt (sonst wäre oben Platz verschenkt).
    // Abstand bleibt, der Blickpunkt wandert parallel zur Bildebene: die Breite ändert sich dabei nicht.
    if (center && align === 'bottom' && !onlyY) {
      put(d);
      let b = bounds();
      if (b && b.x1 - b.x0 > 0.985 * (xR - xL)) {
        const k = d * Math.tan((fov * DEG) / 2);
        for (let i = 0; i < 8 && b; i++) {
          let cy = b.y0 - yB;
          if (b.y1 - cy > yT) cy = b.y1 - yT; // oben nicht unter die HUD schieben
          if (Math.abs(cy) < 0.002) break;
          up.setFromMatrixColumn(cam.matrixWorld, 1);
          L.addScaledVector(up, cy * k * 0.9);
          put(d);
          b = bounds();
        }
        if (!fits(d)) d = search();
      }
    }
    put(d);
    const b = bounds() || { x0: 0, x1: 0, y0: 0, y1: 0 };
    return { pos: cam.position.clone(), look: L, dist: d, fill: { x: (b.x1 - b.x0) / Math.max(1e-6, xR - xL), y: (b.y1 - b.y0) / Math.max(1e-6, yT - yB) }, cam };
  }
  /** Neigung (Grad), bei der der Horizont auf Bildschirmhöhe y (px) liegt – bei Projektionsmitte aus fr */
  function pitchForHorizon(y, fov, fr) {
    const { h } = viewSize();
    const f = h / 2 / Math.tan((fov * DEG) / 2);
    const cy = h / 2 + (fr.top - fr.bottom) / 2;
    return Math.atan((cy - y) / f) / DEG;
  }
  /** Schildhöhe (px) für die Ränder der Weltkarte (Schilder hängen unter den Inseln) */
  W.labelHeight = 46;

  /**
   * Seitliche Blickrichtung (Bogenmaß, zusätzlich zur Inseldrehung), aus der die
   * Kamera im Abstand dist frei auf Insel I schaut: Keine andere Insel steht
   * zwischen Kamera und Insel oder dicht an der Kamera. Bevorzugt nahe pref.
   */
  function clearYaw(I, elev, dist, pref) {
    const ry = I.group ? I.group.rotation.y : 0;
    const r = dist * Math.cos(elev * DEG);
    let best = pref, bestScore = -1e9;
    for (let yaw = -0.9; yaw <= 0.901; yaw += 0.03) {
      const cx = I.pos.x + Math.sin(ry + yaw) * r, cz = I.pos.z + Math.cos(ry + yaw) * r;
      let clear = 99;
      for (const id in W.islands) {
        const O = W.islands[id];
        if (O === I) continue;
        // Abstand der Insel O zur Strecke Kamera → Insel I (am Boden)
        const dx = I.pos.x - cx, dz = I.pos.z - cz, len2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((O.pos.x - cx) * dx + (O.pos.z - cz) * dz) / len2));
        const d = Math.hypot(O.pos.x - (cx + dx * t), O.pos.z - (cz + dz * t)) - (O.rim || 6.2);
        if (d < clear) clear = d;
      }
      const score = Math.min(clear, 7) - Math.abs(yaw - pref) * 3;
      if (score > bestScore) { bestScore = score; best = yaw; }
    }
    return best;
  }

  /** Bildschirm-Rechteck (px) der Insel O aus Sicht der Kamera cam (null: hinter der Kamera) */
  function screenRectOf(O, cam) {
    const { w, h } = viewSize();
    const v = fit.v2 || (fit.v2 = new W.THREE.Vector3());
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of islandPoints(O)) {
      v.copy(p).project(cam);
      if (v.z > 1 || v.z < -1) return null;
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { left: x0, right: x1, top: y0, bottom: y1 };
  }

  /** Start: Flos Heimatinsel als Bühne zwischen Titel und Knopf, hoch enger auf Flo */
  function splashPose(fr, aspect) {
    const T = W.THREE;
    const I = W.islands.hub;
    // Blick durch eine Lücke der vorderen Reihe (sonst verdeckt eine nähere Insel die Bühne)
    const yaw = clearYaw(I, 15, 30, 0.33);
    if (aspect >= 1.05) {
      const p = fitPose(focusOf(I), frontDir(I, 15, yaw), 36, islandPoints(I), fr, { margin: 6 });
      return { pos: p.pos, look: p.look, fov: 36, sway: 0.8 };
    }
    // Hochformat: Flo (anchors.flo) groß und mittig, Baumhaus und Leuchtturm dahinter angeschnitten
    const flo = I.anchors.flo ? I.group.localToWorld(I.anchors.flo.clone()) : focusOf(I);
    const r = aspect < 0.62 ? 3.1 : 3.8;
    const pts = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(new T.Vector3(flo.x + Math.cos(a) * r, flo.y - 0.3, flo.z + Math.sin(a) * r * 0.6)); }
    pts.push(new T.Vector3(flo.x, flo.y + 3.4, flo.z));
    const look = flo.clone().add(new T.Vector3(0, 1.1, 0));
    const p = fitPose(look, frontDir(I, 11, yaw * 0.85), 34, pts, fr, { margin: 4 });
    return { pos: p.pos, look: p.look, fov: 34, sway: 0.6 };
  }

  /**
   * Weltkarte: filmischer 3/4-Blick wie der Startbildschirm. Der Horizont mit den
   * fernen Bergen liegt knapp unter der HUD-Kante (der Rest des Himmels scheint
   * durch das Glas der HUD), die vordere Reihe steht groß im Vordergrund.
   * Quer: alle Inseln im Bild, unten angelegt (darüber Meer bis zum Horizont).
   * Hoch: senkrecht eingepasst, waagrecht schiebbar (W.pan: Pfeile, Wischen) –
   * am Anschlag steht auch die äußerste Insel ganz neben dem Pfeil im Bild.
   */
  const PAN_EDGE = 62; // px: Breite der Pfeil-Knöpfe am Rand + Abstand
  function homePose(fr) {
    const T = W.THREE;
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const { w, h } = viewSize();
    const freeW = Math.max(1, w - fr.left - fr.right), freeH = Math.max(1, h - fr.top - fr.bottom);
    const aspect = freeW / freeH;
    const all = Object.values(W.islands);
    const pan = aspect < 1.12;
    const fov = pan ? Math.min(54, 44 + (1.12 - aspect) * 18) : 44;
    const dirOf = (pitch) => V(0, Math.sin(pitch * DEG), Math.cos(pitch * DEG));
    const ptsOf = (list) => { const pts = []; list.forEach((I) => pts.push(...islandPoints(I))); return pts; };
    const opts = { marginTop: 8, marginBottom: W.labelHeight * 0.8 + 8, marginX: pan ? PAN_EDGE - 30 : 10, align: 'bottom' };
    // flachste Neigung: Horizont gerade hinter der HUD-Kante (Berge schauen darunter hervor)
    const flat = Math.max(12, Math.min(40, pitchForHorizon(fr.top - 6, fov, fr)));
    // Quer: alle Inseln (die Breite begrenzt). Hoch: ein mittlerer Streifen (Flos Insel,
    // die inneren Nachbarn, vorne und hinten die Mitte) füllt den freien Bereich, der Rest wird geschoben.
    const S = !pan ? Infinity : freeW < 560 ? 10 : 18;
    const pts = ptsOf(all.filter((I) => Math.abs(I.pos.x) <= S + 0.1));
    const o2 = Object.assign({}, opts, { center: pan ? 'y' : true });
    // Neigung, bei der Breite und Höhe zugleich passen …
    let lo = flat, hi = 46;
    for (let i = 0; i < 9; i++) {
      const mid = (lo + hi) / 2;
      const q = fitPose(V(0, 0, 0), dirOf(mid), fov, pts, fr, o2);
      if (q.fill.y < q.fill.x - 0.01) lo = mid; else hi = mid;
    }
    // … und davon ein Stück zurück zur flachen: Reihen gut getrennt, oben bleibt Ferne
    const pitch = flat + (hi - flat) * (pan ? (freeW < 560 ? 0.9 : 0.85) : 0.2);
    const p = fitPose(V(0, 0, 0), dirOf(pitch), fov, pts, fr, o2);
    const dir = dirOf(pitch);
    const fpx = h / 2 / Math.tan((fov * DEG) / 2);
    let panMax = 0;
    if (pan) {
      // so weit schieben, bis die äußerste Insel (Ufer) neben dem Pfeil ganz zu sehen ist
      const cam = p.cam, v = V(0, 0, 0), fwd = dir.clone().negate();
      const xR = w - fr.right - PAN_EDGE, xL = fr.left + PAN_EDGE;
      all.forEach((I) => {
        [1, -1].forEach((side) => {
          v.set(I.pos.x + side * I.rim, 0, I.pos.z);
          const depth = v.clone().sub(cam.position).dot(fwd);
          v.project(cam);
          const sx = (v.x * 0.5 + 0.5) * w;
          const need = side > 0 ? ((sx - xR) * depth) / fpx : ((xL - sx) * depth) / fpx;
          if (need > panMax) panMax = need;
        });
      });
    }
    const unitsPerScreen = (w * p.dist) / fpx;
    return { pos: p.pos, look: p.look, fov, sway: 0.4, pan: panMax > 0.5, panMax: panMax > 0.5 ? panMax : 0, unitsPerScreen, pitch, pitchRange: [flat, hi] };
  }

  /**
   * Insel: oben im freien Bereich (darunter die Spielkarten). Möglichst flacher,
   * filmischer Blick – aber steil genug, dass keine Nachbarinsel oben am Rand
   * angeschnitten wird und keine nähere Insel die Insel verdeckt.
   */
  function areaPose(I, fr) {
    const fov = 34;
    const pts = islandPoints(I);
    const { w, h } = viewSize();
    // Hochformat: unter den Spielkarten bleibt viel Bild frei – dort soll keine angeschnittene
    // Nachbarinsel groß im Vordergrund liegen. Darum auch seitlich versetzte Blickrichtungen
    // prüfen und die sichtbare Fläche der Nachbarn unterhalb des freien Bereichs mitzählen.
    const tall = w / h < 0.9;
    const yaws = tall ? [0.12, -0.3, 0.5, -0.65, 0.85] : [0.12];
    let best = null;
    for (const yaw of yaws) {
      for (const elev of [24, 28, 32, 36, 41, 47, 54]) {
        const p = fitPose(focusOf(I), frontDir(I, elev, yaw), fov, pts, fr, { margin: 8 });
        const own = screenRectOf(I, p.cam);
        let bad = 0, seen = 0;
        for (const id in W.islands) {
          const O = W.islands[id];
          if (O === I || !own) continue;
          const r = screenRectOf(O, p.cam);
          if (!r) continue;
          // oben angeschnitten (an der Kopfleiste oder am Bildrand)?
          if ((r.top < fr.top - 2 && r.bottom > fr.top + 14) || (r.top < -2 && r.bottom > 14)) bad += 2;
          // verdeckt eine nähere Insel die eigene?
          const ix = Math.max(0, Math.min(r.right, own.right) - Math.max(r.left, own.left));
          const iy = Math.max(0, Math.min(r.bottom, own.bottom) - Math.max(r.top, own.top));
          const closer = O.pos.distanceTo(p.pos) < I.pos.distanceTo(p.pos);
          if (closer && ix * iy > 0.06 * (own.right - own.left) * (own.bottom - own.top)) bad += 3;
          if (tall) {
            // sichtbarer Teil unterhalb des freien Bereichs (Anteil am Bild)
            const vx = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0));
            const vy = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, h - fr.bottom));
            seen += (vx * vy) / (w * h);
          }
        }
        const score = bad + seen * 6 + Math.abs(yaw - 0.12) * 0.6;
        if (!best || score < best.score) best = { p, score };
        if (!bad && !tall) break;
      }
    }
    return { pos: best.p.pos, look: best.p.look, fov, sway: 0.7 };
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
      case 'splash': return splashPose(fr, aspect);
      case 'home': return homePose(fr);
      case 'area': return areaPose(isle(place.id), fr);
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
        return { pos: V(0, 10, 80), look: V(0, 14, 0), fov: 42, sway: 0.3, fps: 30 };
      }
    }
  }

  function callHook(mod, place, opts) {
    if (mod && typeof mod.onPlace === 'function') {
      try { mod.onPlace(place, opts); } catch (e) { console.error('w3d onPlace', e); }
    }
  }
  W.go = function (place, opts = {}) {
    // Weltkarte neu betreten: woher? (bestimmt, wohin die schiebbare Karte zuerst schaut)
    if (place === 'home' && W.place !== 'home') rig.homeFrom = W.place || 'start';
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
    else rig.pending = { place: W.place, opts: { instant: true, frame: rig.frame, live: rig.live } };
    W.wake();
  };

  function applyPending() {
    const { place, opts } = rig.pending;
    rig.pending = null;
    rig.frame = opts.frame || null;
    rig.live = !!(opts.live && typeof opts.frame === 'function');
    const fr = readFrame(rig.frame);
    rig.fr = fr;
    const pose = poseFor(place, fr);
    const shift = shiftOf(fr);
    rig.sway = pose.sway == null ? 1 : pose.sway;
    rig.pose = { pitch: pose.pitch, range: pose.pitchRange, fov: pose.fov }; // nur Diagnose
    rig.fpsCap = pose.fps || 0;
    rig.pan = !!pose.pan;
    rig.panMax = pose.panMax || 0;
    rig.unitsPerScreen = pose.unitsPerScreen || 40;
    if (!rig.pan) rig.panTarget = 0;
    rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, rig.panTarget));
    const fresh = place === 'home' && rig.homeFrom != null;
    if (fresh && rig.pan) rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, homePanStart(rig.homeFrom)));
    if (place === 'home') rig.homeFrom = null;
    document.body.classList.toggle('w3d-pan', rig.pan); // Weltkarte schiebbar (Pfeil-Knöpfe zeigen)
    const instant = opts.instant || W.reducedMotion || W.fastFlights || !rig.pos;
    if (instant && fresh) rig.panX = rig.panTarget;
    if (instant) {
      labels.forEach((L) => { L.fresh = true; }); // Schilder springen mit (kein Nachgleiten)
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

  /**
   * Schiebbare Weltkarte (Hochformat): Wohin schaut sie beim Betreten? Zurück von einer
   * Insel (oder einem ihrer Spiele) auf diese Insel; sonst (Start) auf die erste Kita-Insel
   * (Zahlenland) – in Leserichtung geht es dann mit dem Pfeil nach rechts weiter.
   */
  function homePanStart(from) {
    const id = from && typeof from === 'object' ? from.id : null;
    if (id && id !== 'hub' && W.islands[id]) return W.islands[id].pos.x;
    // die erste Insel links im Bild (ganz zu sehen, mit Schild), rechts daneben ihre Nachbarn
    const first = (LT.areas || []).find((a) => !a.grade && W.islands[a.id]);
    return first ? W.islands[first.id].pos.x + 0.2 * rig.unitsPerScreen : 0;
  }

  /** live-Rahmen (opts.live): hat sich der freie Bereich verschoben (z. B. HUD gewachsen)? → neu einpassen */
  function checkFrame() {
    const fr = readFrame(rig.frame), o = rig.fr;
    if (!o || Math.abs(fr.top - o.top) > 2 || Math.abs(fr.bottom - o.bottom) > 2 || Math.abs(fr.left - o.left) > 2 || Math.abs(fr.right - o.right) > 2) {
      rig.pending = { place: W.place, opts: { instant: true, frame: rig.frame, live: true } };
    }
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
  let labelsQueued = false;
  /**
   * DOM-Element folgt einem 3D-Punkt. target: Vector3 | Object3D | Funktion → Vector3.
   * opts.depth     nach Entfernung skalieren (opts.scale = [min, max], Standard 0.72–1.15)
   *                und Nähere nach vorn stapeln
   * opts.align     'bottom' (Standard: Unterkante Mitte am Punkt) | 'top' (Oberkante Mitte)
   * opts.avoid     Gruppenname: Schilder einer Gruppe weichen einander, den Wahrzeichen
   *                der Inseln und opts.obstacles() aus (in Bildschirmkoordinaten, weich
   *                nachgeführt) und bleiben im sicheren Bereich opts.safe() →
   *                {top, right, bottom, left} (px vom Rand). Liegt der Punkt seitlich
   *                außerhalb (Weltkarte geschoben), blendet das Schild aus (.w3d-off) –
   *                es bleibt fokussierbar; Fokus schiebt die Karte zur Insel. Dazu
   *                data-w3d-off = 'left' | 'right': auf welcher Seite es liegt.
   */
  W.label = function (target, element, opts = {}) {
    const L = { target, element, opts, last: '', vis: null, off: { x: 0, y: 0 }, goal: { x: 0, y: 0 }, fresh: true };
    labels.add(L);
    element.classList.add('w3d-label');
    if (opts.depth) element.style.transformOrigin = '0 0';
    if (opts.avoid) {
      element.addEventListener('focus', () => {
        if (!rig.pan || !L.wp) return;
        W.panTo(L.wp.x);
      });
    }
    if (W.started && W.camera) {
      screenRect = null;
      updateLabels(0, [L]);
      // neu angemeldete Schilder gemeinsam einmal legen (Ausweichen, Ausblenden) – nicht erst im nächsten Bild
      if (opts.avoid && !labelsQueued) { labelsQueued = true; Promise.resolve().then(() => { labelsQueued = false; if (W.started) updateLabels(0); }); }
    }
    return () => labels.delete(L);
  };
  /**
   * Schild an einer Insel. Standard: am anchors.label (folgt ihrer Bewegung).
   * opts.shore: am Strand vor der Insel (zur Kamera hin) – das Schild hängt
   * darunter (align 'top') und verdeckt so kein Wahrzeichen.
   */
  W.labelIsland = function (id, element, opts = {}) {
    const I = W.islands[id];
    if (!I) return () => {};
    if (opts.shore) {
      const v = new W.THREE.Vector3();
      const shore = () => {
        const c = W.camera.position;
        const dx = c.x - I.pos.x, dz = c.z - I.pos.z, len = Math.hypot(dx, dz) || 1;
        const r = (I.rim || 6.2) * 0.8;
        return v.set(I.pos.x + (dx / len) * r, 0.5, I.pos.z + (dz / len) * r);
      };
      return W.label(shore, element, Object.assign({ align: 'top' }, opts, { island: I }));
    }
    if (!I.labelAnchor) {
      const a = new W.THREE.Object3D();
      a.name = 'label-anchor';
      a.position.copy(I.anchors.label);
      I.group.add(a);
      I.labelAnchor = a;
    }
    return W.label(I.labelAnchor, element, opts);
  };
  /** Weltkarte so schieben, dass Welt-x in der Mitte steht (nur im Schiebe-Modus) */
  W.panTo = function (x) {
    if (!rig.pan) return false;
    rig.panTarget = Math.max(-rig.panMax, Math.min(rig.panMax, x));
    W.wake();
    return true;
  };
  let screenRect = null; // Leinwand-Rechteck, einmal pro Bild gelesen
  const tmpV = { v: null, wp: null };
  W.toScreen = function (vec3) {
    const v = (tmpV.v || (tmpV.v = new W.THREE.Vector3())).copy(vec3).project(W.camera);
    const r = screenRect || W.canvas.getBoundingClientRect();
    return { x: (v.x * 0.5 + 0.5) * r.width + r.left, y: (-v.y * 0.5 + 0.5) * r.height + r.top, visible: v.z < 1 && v.z > -1 };
  };
  /** Punkt, Maßstab und Sichtbarkeit eines Schilds (ohne DOM zu schreiben) */
  function projectLabel(L) {
    const wp = L.wp || (L.wp = new W.THREE.Vector3());
    const t = L.target;
    if (typeof t === 'function') wp.copy(t());
    else if (t.isObject3D) { t.updateWorldMatrix(true, false); wp.setFromMatrixPosition(t.matrixWorld); } else wp.copy(t);
    const s = W.toScreen(wp);
    L.sx = s.x; L.sy = s.y; L.front = s.visible;
    L.k = 1;
    if (L.opts.depth) {
      const dist = W.camera.position.distanceTo(wp);
      const ref = rig.curLook ? W.camera.position.distanceTo(rig.curLook) : dist;
      const [k0, k1] = L.opts.scale || [0.72, 1.15];
      L.k = Math.max(k0, Math.min(k1, Math.sqrt(ref / Math.max(1, dist))));
      L.dist = dist;
    }
  }
  /** Wahrzeichen-Rechtecke der Inseln (px): von der Spitze bis zur Wiesenmitte */
  const marks = { list: [], v: null };
  function landmarkRects() {
    const T = W.THREE;
    const v = marks.v || (marks.v = new T.Vector3());
    const right = new T.Vector3().setFromMatrixColumn(W.camera.matrixWorld, 0).setY(0).normalize();
    marks.list.length = 0;
    for (const id in W.islands) {
      const I = W.islands[id];
      const a = W.toScreen(v.set(I.pos.x, (I.top || 4) * 0.92, I.pos.z));
      const b = W.toScreen(v.set(I.pos.x, 1, I.pos.z));
      const c = W.toScreen(v.set(I.pos.x + right.x * (I.rim || 6) * 0.55, 1, I.pos.z + right.z * (I.rim || 6) * 0.55));
      if (!a.visible || !b.visible) continue;
      const hw = Math.abs(c.x - b.x);
      marks.list.push({ I, left: b.x - hw, right: b.x + hw, top: Math.min(a.y, b.y), bottom: Math.max(a.y, b.y) });
    }
    return marks.list;
  }
  const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const CAND_DX = [0, -22, 22, -44, 44, -70, 70];
  const CAND_DY = [0, 12, 26, 42, -10];
  const CAND_DY_NARROW = CAND_DY.concat([-24, -40]); // Handy: auch ein Stück auf die eigene Insel
  /** Gewicht der Überdeckung eines Wahrzeichens. Handy (schmal): die Schilder der Schulreihe
      hingen sonst auf der Krone von Flos Baumhaus (hub) – dort rückt ein Schild lieber auf
      seine eigene Insel. Breiter ist Platz genug, die Schilder bleiben unter ihren Inseln. */
  const markWeight = (m, L, narrow) => (m.I === L.opts.island ? 0.6 : narrow && m.I.id === 'hub' ? 4 : 1.2);
  /** Schilder einer Gruppe so legen, dass sie sich nicht überdecken (gierig, Nähere zuerst) */
  function solveLabels(list, dt) {
    const { w, h } = viewSize();
    const o = list[0].opts;
    let safe = { top: 0, right: 0, bottom: 0, left: 0 }, obs = [];
    try { if (o.safe) safe = Object.assign(safe, o.safe()); } catch (e) { /* Standard */ }
    try { if (o.obstacles) obs = (o.obstacles() || []).filter(Boolean); } catch (e) { obs = []; }
    const isl = landmarkRects();
    const narrow = w < 560;
    const placed = [];
    const xMin = safe.left, xMax = w - safe.right, yMin = safe.top, yMax = h - safe.bottom;
    list.sort((a, b) => (a.dist || 0) - (b.dist || 0));
    const smooth = W.reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, dt) * 14);
    for (const L of list) {
      if (!L.size || L.sizeAge++ > 90) { L.size = { w: L.element.offsetWidth || 120, h: L.element.offsetHeight || 40 }; L.sizeAge = 0; }
      const lw = L.size.w * L.k, lh = L.size.h * L.k;
      // seitlich außerhalb des sicheren Bereichs (geschobene Karte): ausblenden statt abschneiden
      L.isOff = L.sx < xMin + lw * 0.12 || L.sx > xMax - lw * 0.12;
      if (L.isOff) continue;
      const top = L.opts.align === 'top';
      const bx = L.sx - lw / 2, by = top ? L.sy + 3 * L.k : L.sy - lh;
      let best = null;
      const evalAt = (dx, dy) => {
        const x = Math.max(xMin + 2, Math.min(xMax - lw - 2, bx + dx));
        const y = Math.max(yMin + 2, Math.min(yMax - lh - 2, by + dy));
        const r = { left: x, right: x + lw, top: y, bottom: y + lh };
        let cost = (Math.pow(x - bx, 2) + 1.6 * Math.pow(y - by, 2)) * 0.5;
        for (const p of placed) cost += overlap(r, p) * 6;
        for (const p of obs) cost += overlap(r, p) * 6;
        for (const m of isl) cost += overlap(r, m) * markWeight(m, L, narrow);
        return { dx, dy, x: x - bx, y: y - by, r, cost };
      };
      for (const dy of narrow ? CAND_DY_NARROW : CAND_DY) for (const dx of CAND_DX) {
        const c = evalAt(dx, dy);
        if (!best || c.cost < best.cost) best = c;
      }
      // Beharrung: die bisherige Lage behalten, solange sie kaum schlechter ist (kein Flackern)
      if (L.cand) { const c = evalAt(L.cand.dx, L.cand.dy); if (c.cost <= best.cost * 1.2 + 60) best = c; }
      L.cand = best;
      L.goal.x = best.x; L.goal.y = best.y;
      if (L.fresh) { L.off.x = L.goal.x; L.off.y = L.goal.y; L.fresh = false; }
      placed.push(best.r);
      L.off.x += (L.goal.x - L.off.x) * smooth;
      L.off.y += (L.goal.y - L.off.y) * smooth;
    }
  }
  function writeLabel(L) {
    let tf = `translate3d(${(L.sx + L.off.x).toFixed(1)}px, ${(L.sy + L.off.y).toFixed(1)}px, 0)`;
    if (L.opts.depth) {
      tf += ` scale(${L.k.toFixed(3)})`;
      const z = String(Math.max(1, Math.round(4000 - (L.dist || 0) * 10)));
      if (L.z !== z) { L.element.style.zIndex = z; L.z = z; }
    }
    tf += L.opts.align === 'top' ? ' translate(-50%, 0)' : ' translate(-50%, -100%)';
    if (L.last !== tf) { L.element.style.transform = tf; L.last = tf; }
    const vis = L.front ? '' : 'hidden';
    if (L.vis !== vis) { L.element.style.visibility = vis; L.vis = vis; }
    const off = !!(L.opts.avoid && L.isOff);
    if (L.offCls !== off) { L.element.classList.toggle('w3d-off', off); L.offCls = off; }
    // Seite, auf der das Schild außer Sicht ist (data-w3d-off = left | right) – für Randhinweise
    const side = off ? (L.sx < viewSize().w / 2 ? 'left' : 'right') : '';
    if (L.offSide !== side) { if (side) L.element.dataset.w3dOff = side; else delete L.element.dataset.w3dOff; L.offSide = side; }
  }
  /** Alle Schilder: erst lesen und rechnen, dann schreiben (kein Layout-Hin-und-Her) */
  function updateLabels(dt = 0, only) {
    const list = only || labels;
    if (!list.size && !list.length) return;
    screenRect = W.canvas.getBoundingClientRect();
    const groups = new Map();
    for (const L of list) {
      if (!L.element.isConnected) { labels.delete(L); continue; }
      projectLabel(L);
      if (L.opts.avoid && L.front) {
        if (!groups.has(L.opts.avoid)) groups.set(L.opts.avoid, []);
        groups.get(L.opts.avoid).push(L);
      }
    }
    if (!only) groups.forEach((g) => solveLabels(g, dt));
    for (const L of list) if (L.element.isConnected) writeLabel(L);
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
  /**
   * opts: parent, className, dprCap, fov, antialias (Standard true).
   * Tonwertabbildung und Belichtung wie die Welt (W.renderer), damit Figuren
   * und Effekte zur Welt passen. Reflexe (scene.environment) bringt jede Ebene
   * selbst mit: Texturen der Welt-Leinwand gelten in einem anderen
   * WebGL-Kontext nicht.
   */
  W.layer = function ({ parent = document.body, className = '', dprCap = 2, fov = 30, antialias = true } = {}) {
    const T = W.THREE;
    const canvas = document.createElement('canvas');
    canvas.className = 'w3d-layer ' + className;
    parent.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: antialias !== false, powerPreference: 'low-power', premultipliedAlpha: true });
    renderer.outputColorSpace = T.SRGBColorSpace;
    const base = W.renderer;
    renderer.toneMapping = base ? base.toneMapping : T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = base ? base.toneMappingExposure : 1;
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
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
  /** Animationen der Inseln – nur für Inseln im Kamera-Frustum (Hüllkugel), einmal pro Bild */
  const vis = { frustum: null, m: null, culled: 0 };
  function updateIslands(dt, t) {
    const T = W.THREE, cam = W.camera;
    if (!vis.frustum) { vis.frustum = new T.Frustum(); vis.m = new T.Matrix4(); }
    cam.updateMatrixWorld();
    vis.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    vis.frustum.setFromProjectionMatrix(vis.m);
    let culled = 0;
    for (const id in W.islands) {
      const I = W.islands[id], u = I.group.userData.update;
      if (!u) continue;
      if (I.sphere && !vis.frustum.intersectsSphere(I.sphere)) { culled++; continue; }
      u(dt, t);
    }
    vis.culled = culled;
  }
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
    else if (rig.live && !rig.flight && W.stats.frames % 15 === 0) checkFrame();
    stepTweens(dt);
    updateCamera(dt, t);
    updateIslands(dt, t);
    frameFns.forEach((fn) => { try { fn(dt, t); } catch (e) { console.error('w3d frame', e); frameFns.delete(fn); } });
    W.renderer.render(W.scene, W.camera);
    updateLabels(dt);
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
    // Bausatz, Umgebung, Inseln
    if (REG.kit) { try { W.kit = REG.kit(W); } catch (e) { console.error('w3d kit', e); } }
    REG.env.forEach((fn) => { try { fn(W); } catch (e) { console.error('w3d env', e); } });
    // Umgebungs-Reflexe kommen aus env.js (eigener Himmel). Nur ohne env (oder wenn
    // es keine liefern konnte) neutrale Raum-Reflexe – spart sonst Startzeit.
    if (!scene.environment) {
      try {
        const pmrem = new T.PMREMGenerator(renderer);
        W.envMap = pmrem.fromScene(new T.addons.RoomEnvironment(), 0.04).texture;
        scene.environment = W.envMap;
        pmrem.dispose();
      } catch (e) { /* ohne Reflexe */ }
    }
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
      g.rotation.y = 0;
      g.traverse((o) => { if (o.isMesh) { if (o.castShadow === undefined) o.castShadow = true; } });
      scene.add(g);
      const anchors = Object.assign({ label: new T.Vector3(0, 5, 0), focus: new T.Vector3(0, 1.5, 0) }, built.anchors || {});
      const I = { id: a.id, area: a, group: g, anchors, pos: g.position.clone() };
      // Umriss für die Kamera (Einpassen): Uferradius und Höhe aus der genauen
      // Bounding-Box – vor der Drehung gemessen (gedreht wäre die Box zu groß)
      try {
        g.updateMatrixWorld(true);
        measureIsland(g, box);
        const r = Math.max(box.max.x - p[0], p[0] - box.min.x, box.max.z - p[2], p[2] - box.min.z) * 0.9;
        I.rim = Math.max(4.5, Math.min(8.5, r || 6.2));
        I.top = Math.max(2.5, Math.min(8, box.max.y || 4));
      } catch (e) { I.rim = 6.2; I.top = 4; }
      // Inseln leicht zur Weltkarten-Kamera drehen (wirkt lebendiger)
      if (a.id !== 'hub') g.rotation.y = Math.atan2(p[0], 85 - p[2]) * 0.7;
      g.updateMatrixWorld(true);
      // Hüllkugel (Welt) für den Sichtbarkeitstest der Animationen
      I.sphere = new T.Sphere(new T.Vector3(p[0], I.top / 2, p[2]), Math.hypot(I.rim / 0.9 + 1, I.top / 2 + 1.5));
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
    culled: vis.culled, fov: Math.round(rig.fov * 10) / 10,
  });
})();
