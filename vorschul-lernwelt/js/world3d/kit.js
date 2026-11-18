/* ==========================================================================
   js/world3d/kit.js – Bausatz der 3D-Inselwelt („Flos Inselwelt“) → W.kit

   Gemeinsame Bauteile für alle Inseln im selben weichen, spielzeughaften
   Low-Poly-Stil: Gelände, Pflanzen, Häuser, Requisiten, Lern-Requisiten und
   Werkzeuge. Wird vom Kern (core.js) VOR env und den Inseln gebaut; THREE ist
   erst in der Bau-Funktion verfügbar.

   ------------------------------------------------------------------------
   MASSSTAB (Welt-Einheiten)
     Inselradius ≈ 6 (Sandkante an der Wasserlinie), Wiese ≈ 4.5,
     Wasserlinie y = 0, Wiesenoberfläche y ≈ 1 (Mitte etwas höher),
     Requisiten 0.4–4 hoch, Flo ≈ 1.6, Baum ≈ 2.6–3.2, Haus ≈ 2.4.
     Alle Bauteile stehen mit dem Fuß im Ursprung (y = 0) und zeigen ihre
     Schauseite nach +z (zur Kamera), sofern unten nicht anders angegeben.

   FARBE & MATERIAL
     Fast alles wird mit Vertex-Farben auf EIN geteiltes Material gemalt
     (kit.mats.matte, kit.mats.gloss …). Darum lässt sich eine ganze Insel mit
     kit.merge(group) zu sehr wenigen Draw-Calls zusammenführen. Farben werden
     automatisch nach unten abgedunkelt (weicher „Bodenschatten“) und bei
     organischen Formen je Fläche leicht variiert (lebendiger Low-Poly-Look).
     Farbangaben: CSS-Farbe ('#ff8a3d') oder THREE.Color.

   LEISTUNG (Budget je Insel): ≤ 10k Dreiecke, ≤ 12 Draw-Calls nach
     kit.merge(group) + kit.batchDynamic(group). Animierte Teile (kit.float/kit.sway)
     und antippbare Teile (W.interactive) werden beim Zusammenführen ausgelassen –
     kit.batchDynamic bündelt die Bewegten danach (GPU, je Material ein Draw-Call).
     Schatten werfen nur große Teile (halbe Diagonale ≥ 0.42, ≥ 0.16 hoch): Im
     zusammengeführten Mesh stehen sie vorn, der Schatten-Pass zeichnet nur sie
     (kit.shadowPrefix). Gras, Blumen, Wege, Kleinkram werfen nie Schatten.
     Unsichtbares fällt beim Zusammenführen weg: Dreiecke im Boden, Unterseiten
     auf dem Boden, Dreiecke ohne Fläche.
     Ungefähre Kosten (Dreiecke): islandBase 1.5k · house 950 · lighthouse 750 ·
     pier(4) 700 · tree round 370 / fruit 530 / blossom 510 / palm 450 / pine 80 ·
     bench 400 · boat 360 · bush 320 · block 310 · balloon 280 · mushroom 260 ·
     lamp 220 · flag 200 · star 120 · sign 100 · rock 80 · grassTufts 6 je Büschel ·
     flowers 24 je Blume. Draw-Calls nach kit.merge: alle Bausatz-Materialien (matt,
     Glanz, glatt, Fenster, Leuchten) zusammen 1, Doppelseitiges (Palmblätter) 1,
     Würfel-Zeichen 1, je Schild 1, je Fahne 1, Wiese (Gras + Blumen) 1, je Emoji-Sorte 1,
     Bewegtes nach kit.batchDynamic 1 je Material.

   ------------------------------------------------------------------------
   API (alle Optionen optional; seed = Zahl für deterministischen Zufall)

   Grundlagen
     kit.colors                     Palette (sky, sea, sand, grass, rock, wood …)
     kit.rng(seed) → r()            Zufall 0..1, dazu r.range(a,b), r.pick(arr)
     kit.shade(color, k) → '#hex'   heller (k > 1) / dunkler (k < 1)
     kit.mix(a, b, t) → '#hex'      Farben mischen
     kit.mats                       { matte, gloss, glossSmooth, matteDouble, glow, window, wind, windDouble, windPetal,
                                      surface, surfaceDouble }
                                    (alle mit vertexColors außer glow/window; für eigene Meshes: kit.mesh).
                                    surface: Oberflächen-Material der zusammengeführten Meshes (Rauheit/Metall/
                                    Fenster/Leuchte je Eckpunkt im Attribut aSurf) – nicht selbst verwenden.
     kit.uniforms.time              gemeinsame Zeit-Uniform (Wind, Fahnen)
     kit.fonts                      { num: Fredoka-Stapel, read: Andika-Stapel } für eigene Canvas-Texte
     kit.canvasTexture(w, h, draw(g, w, h)) → CanvasTexture   wird nach dem Laden der Schriften neu gezeichnet

   Gelände
     kit.islandBase({ seed, radius=6, grassRadius=radius*0.75, height=1,
                      grass, grassDark, grassLight, sand, cliff, cliffs=1 (0 = keine Klippen),
                      hills=1, stones=5, segments=40, rings=6 (Innenringe 3–8), shadow=true })
       Organisches Wiesen-Plateau mit gerundeter Kante, Felsband (Klippen je nach Winkel),
       Sandstrand bis zur Wasserlinie, Unterwasser-Sockel (bis y ≈ -1.9) und Steine am Ufer.
       Jeder seed ergibt eine andere Form. Ein Mesh, Vertex-Farben (1 Draw-Call).
       Schatten wirft nur der Rand (Wiesenkante bis Klippenfuß) mit den Klippen-Brocken.
       → base = {
           group,                 THREE.Group – hier alles hineinhängen
           mesh,                  Gelände-Mesh (Vertex-Farben, kit.mats.matte)
           top,                   Höhe der Wiese am Rand (≈ height)
           radius, grassRadius,
           surfaceAt(x, z) → y    Bodenhöhe (lokal), auch Strand/Unterwasser
           randomPointOnGrass(rngOrSeed, margin=0.5) → Vector3 (meidet belegte Plätze;
                                  gleiche Zahl → setzt dieselbe Zufallsfolge fort)
           place(obj, x, z, { rotY, y, keep }) → obj   auf den Boden stellen + einhängen
                                  (merkt sich den Platz, keep = Freiradius, sonst automatisch)
           keep(x, z, r)          Platz als belegt markieren (z. B. für Wege)
           isOnGrass(x, z, margin=0) → bool
           edgeRadius(angle)      Radius der Wiesenkante in Richtung angle (Bogenmaß, atan2(z, x))
           shoreRadius(angle)     Radius der Wasserlinie
           shore(angle, out=0) → { x, y:0, z, rotY }  Punkt an der Wasserlinie; rotY dreht +x nach außen
           beach(angle, t=0.5) → Vector3              Punkt auf dem Sandstrand (t: 0 Fels … 1 Wasser)
         }
     kit.grassTufts(base, count=60, seed, { scale=1, margin=0.25 }) → Mesh „Wiese“ (wiegt im Wind, hängt sich ein)
     kit.flowers(base, count=24, colors=[…], seed, { scale=1 })   → Mesh „Wiese“
                                  Gras und Blumen einer Insel teilen sich EIN Mesh (1 Draw-Call); es wird je nach
                                  Qualitätsstufe (high 100 %, medium 80 %, low 45 %) und Entfernung ausgedünnt.
     kit.path(base, points, { width=0.62, spacing=0.62, style='stones'|'sand', color, seed }) → Group (hängt sich ein)
                                  points = [[x, z], …] lokal; glatte Kurve hindurch

   Pflanzen (alle: Fuß im Ursprung)
     kit.tree({ type='round'|'pine'|'palm'|'fruit'|'blossom', scale=1, seed, color, fruitColor, trunk, lean, lod })
                                  lod: true = gröbere Palme für weit entfernte Inselchen
     kit.bush({ size=1, seed, color, berries: '#hex' | null })
     kit.flower(color, { scale=1 })            einzelne Blume (für viele: kit.flowers)
     kit.mushroom({ color='#ff5a5f', size=1, seed })
     kit.rock({ size=1, seed, color, moss: false })

   Bauten & Dinge
     kit.fence(points, { base, height=0.7, color, style='picket'|'rail', closed=false }) points = [[x, z], …]
     kit.house({ wall, roof, door, scale=1, chimney=true, seed })          ≈ 2.4 hoch, Tür nach +z
     kit.sign(text, { color, textColor, width, back=false })              Holzschild, Text in Fredoka, ≈ 1.4 hoch
     kit.flag(color, { height=2.2 })            Fahne weht (Shader)
     kit.lamp({ height=1.9 })                   Laterne, leuchtet nachts (kit.setNight)
     kit.bench({ color })
     kit.boat(color, { sail=true, sailColor })  Mitte im Ursprung, Wasserlinie y = 0, Bug nach +x
     kit.lighthouse({ color='#ff5a5f', scale=1 }) ≈ 4.3 hoch, Laterne leuchtet nachts
     kit.pier(length=4, { width=1.05 })         Steg von x = 0 nach +x, Deck auf y ≈ 0.45, Pfähle bis y = -1.6

   Lern-Requisiten
     kit.block(char, color, size=1, { front, top, side, back }) → Group   Spielwürfel, Fuß im Ursprung;
                                  Buchstaben in Andika (einstöckiges a), Ziffern/Zeichen in Fredoka; Zeichen vorn,
                                  hinten, seitlich und oben (einzeln änderbar, '' = leer). Alle Würfel teilen
                                  einen Zeichen-Atlas (64 Zeichen) → nach kit.merge nur 2 Draw-Calls für alle Würfel.
     kit.balloon(color)           Fuß (Schnurende) im Ursprung, Ballon bei y ≈ 1.55
     kit.star(color='#ffd23f', size=1)  Mitte im Ursprung, zeigt nach +z
     kit.emojiProp(emoji, size=1) Billboard (Sprite) mit weichem Bodenschatten – sparsam einsetzen!

   Werkzeuge
     kit.merge(group, { minShadow=0.42, ground }) → group
                                  statische Meshes je Material zusammenführen (Bausatz-Materialien gemeinsam).
                                  Lässt aus: userData.dynamic / noMerge / onTap (ganze Teilbäume),
                                  InstancedMesh, Sprites, Points, SkinnedMesh. userData.noShadow: wirft keinen Schatten.
                                  Mit kit.islandBase (group.userData.groundAt) fallen verdeckte Dreiecke unter dem
                                  Boden weg (ground: false schaltet das ab).
     kit.batchDynamic(group) → api|null   NACH kit.merge: alle bewegten Meshes (userData.dynamic, nicht
                                  antippbar, keine Instanzen/Sprites/Points, nicht noMerge/noBatch) per kit.batch
                                  { live: true } bündeln. Teile, deren Geometrie/Farbe sich zur Laufzeit ändert:
                                  mesh.userData.noBatch = true.
     kit.batch(objs, { live, sphere, margin, shadow, name }) → { group, bones, set(i, m4), apply(), fit() }
                                  Bewegte starre Teile je Material in EINEM SkinnedMesh (jedes Teil = „Knochen“, die
                                  Grafikkarte bewegt die Eckpunkte). Ohne live: objs sind lose Gruppen (Drehpunkt im
                                  Ursprung), set(i, m4) setzt die Lage in Insel-Koordinaten; group einhängen.
                                  live: objs hängen in der Szene und werden wie gewohnt bewegt.
     kit.floatMerge(items) → Group  schwebende Teile [{ obj, phase, amp=0.12, rot, spin }] (obj in Insel-
                                  Koordinaten, nicht eingehängt): wippen/drehen im Vertex-Shader, keine CPU-Arbeit.
     kit.shadowPrefix(mesh, n)    Schatten-Pass zeichnet nur die ersten n Eckpunkte/Indizes
     WICHTIG: kit.float / kit.sway / kit.spin VOR kit.merge aufrufen (markiert das Objekt als
     beweglich, damit es nicht in die Insel „eingebacken“ wird) – oder obj.userData.dynamic = true.
     kit.float(obj, { amp=0.12, speed=1, phase=0, rot=0 }) → stop()   schweben (y), rot = Drehung je s
     kit.sway(obj, { amp=0.06, speed=1, phase=0, axis='z' }) → stop() schaukeln um die Ausgangslage
     kit.spin(obj, { speed=0.5, axis='y' }) → stop()
     kit.onUpdate(fn(dt, t)) → stop()  eigene Animation (läuft über W.onFrame)
     kit.shadowBlob(radius=0.5) → Mesh weicher Kontaktschatten (y = 0.02)
     kit.setNight(k)               0 Tag … 1 Nacht: Laternen/Fenster leuchten (ruft env auf)
     kit.glowHalo(size=1.2, color)  weicher Lichthof (Sprite), erscheint nur nachts – z. B. über eigenen Leuchten

   Eigene Formen (zusammenführbar wie die Bausatz-Teile)
     kit.geo.roundBox(w, h, d, r=0.08, seg=1)   seg ≤ 1: abgeschrägte Kiste (44 Dreiecke, Standard),
                                               seg ≥ 2: RoundedBoxGeometry (glatt, 300+ Dreiecke)
     kit.geo.box(w, h, d), kit.geo.cyl(rTop, rBot, h, seg=8, hSeg=1), kit.geo.flowerHead(r)
     kit.geo.blob(r, { seed, detail=1, noise=0.14, freq=1.4, sx, sy, sz, flat })  weicher Klecks
     kit.paint(geo, color, { grad:[unten, oben], jitter, seed, top: farbe2, range:[y0, y1] }) → geo (Vertex-Farben)
     kit.mesh(geo, color, { gloss, smooth, double, grad, jitter, shadow=true }) → Mesh
     kit.xf(geo, [x,y,z], [rx,ry,rz], s) → geo   Geometrie verschieben/drehen/skalieren
     new kit.Parts().add(geo, color, opts).add(…).build() → Group  (ein Mesh je Material)
       .cullInside([[x, y, z, r], …])  Dreiecke ganz innerhalb der Kugeln weglassen (z. B. verdeckte
                                  Innenflächen überlappender Laub-Kleckse; r = sicherer Innenradius)

   BEISPIEL (js/world3d/islands/<id>.js)
     LT.w3d.register('island', 'zahlen', (W, area) => {
       const kit = W.kit, T = W.THREE;
       const base = kit.islandBase({ seed: 11, grass: '#86d65e' });
       const g = base.group;
       base.place(kit.house({ roof: area.color }), -1.4, -1.2, { rotY: 0.3 });
       base.place(kit.tree({ type: 'fruit', seed: 3 }), 2.1, -1.6);
       base.place(kit.block('3', area.color, 0.8), 0.9, 1.2, { rotY: -0.4 });
       kit.path(base, [[0, 4.6], [0.4, 2.6], [-0.6, 0.6]]);
       kit.grassTufts(base, 50, 11);
       kit.flowers(base, 20, ['#ff7aa8', '#ffd23f', '#ffffff'], 11);
       const balloon = kit.balloon(area.color); base.place(balloon, 2.6, 1.4);
       kit.float(balloon, { amp: 0.15 });  // animierte Teile ZUERST anmelden …
       kit.merge(g);                       // … dann alles Statische zusammenführen
       kit.batchDynamic(g);                // … und das Bewegte bündeln
       return { group: g, anchors: { label: new T.Vector3(0, 4.6, 0), focus: new T.Vector3(0, 1.4, 0) } };
     });
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;

  LT.w3d.register('kit', function (W) {
    const T = W.THREE;
    const A = T.addons || {};
    const mergeGeos = A.mergeGeometries;
    const kit = {};

    /* ------------------------------------------------------------------
       Palette
       ------------------------------------------------------------------ */
    const C = (kit.colors = {
      sky: '#5fbfff', horizon: '#cdeeff', sun: '#fff1d0',
      sea: '#27c2d6', seaDeep: '#1477a8', foam: '#ffffff',
      sand: '#f6d9a3', sandWet: '#dcb27a', sandDark: '#d9b47e',
      grass: '#7fd35a', grassDark: '#5bb944', grassLight: '#a3e36f',
      leaf: '#5cc04a', leafDark: '#3f9f3c', pine: '#3d9c55', palm: '#49b84b', blossom: '#ffb0cf',
      rock: '#b9a796', rockDark: '#8f7f72', rockLight: '#d3c4b4', stone: '#d8cec2',
      wood: '#b97a4a', woodDark: '#8a5530', woodLight: '#d9a46c',
      cream: '#fff4e2', white: '#ffffff', metal: '#46566a', gold: '#ffd23f',
      roof: '#ff6b5a', glass: '#a6dcff', red: '#ff5a5f', pink: '#ff7aa8', purple: '#9b7bff',
      blue: '#4aa8ff', yellow: '#ffd23f', orange: '#ff9a3d', mint: '#5fe0b4',
    });
    kit.rng = (seed) => W.rng(seed == null ? 1 : seed);

    /* ------------------------------------------------------------------
       Kleine Helfer
       ------------------------------------------------------------------ */
    const PI = Math.PI;
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const toColor = (c) => (c && c.isColor ? c.clone() : new T.Color(c == null ? '#ffffff' : c));
    kit.shade = (c, k) => { const col = toColor(c); col.multiplyScalar(k); col.r = Math.min(1, col.r); col.g = Math.min(1, col.g); col.b = Math.min(1, col.b); return '#' + col.getHexString(); };
    kit.mix = (a, b, t) => '#' + toColor(a).lerp(toColor(b), t).getHexString();
    const seedOf = (s, salt) => ((typeof s === 'number' ? s : W.hash(String(s || 'x'))) * 2654435761 + (salt || 0) * 40503) >>> 0 || 1;

    const _m = new T.Matrix4(), _q = new T.Quaternion(), _e = new T.Euler(), _p = new T.Vector3(), _s = new T.Vector3();
    /** Geometrie verschieben (p), drehen (r, Euler XYZ) und skalieren (s: Zahl oder [x,y,z]). */
    function xf(geo, p, r, s) {
      _e.set(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0);
      _q.setFromEuler(_e);
      _p.set(p ? p[0] : 0, p ? p[1] : 0, p ? p[2] : 0);
      if (s == null) _s.set(1, 1, 1); else if (typeof s === 'number') _s.setScalar(s); else _s.set(s[0], s[1], s[2]);
      _m.compose(_p, _q, _s);
      geo.applyMatrix4(_m);
      return geo;
    }
    kit.xf = xf;

    /* ------------------------------------------------------------------
       Materialien (geteilt, Vertex-Farben)
       ------------------------------------------------------------------ */
    const U = (kit.uniforms = { time: { value: 0 }, wind: { value: W.reducedMotion ? 0.08 : 1 } });
    const mats = (kit.mats = {
      matte: new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.86, metalness: 0 }),
      matteDouble: new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.84, metalness: 0, side: T.DoubleSide }),
      gloss: new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.34, metalness: 0.05 }),
      glossSmooth: new T.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 0.26, metalness: 0.02 }),
      glow: new T.MeshStandardMaterial({ color: '#fff3c9', emissive: '#ffc35a', emissiveIntensity: 0.45, roughness: 0.4, flatShading: true }),
      window: new T.MeshStandardMaterial({ color: '#a6dcff', emissive: '#ffc766', emissiveIntensity: 0, roughness: 0.18, metalness: 0.1, flatShading: true }),
    });
    mats.matte.name = 'kit-matte';
    mats.gloss.name = 'kit-gloss';
    /** Wind-Material: Spitzen (lokal y > 0) wiegen sanft; funktioniert auch instanziert. */
    function windMaterial(base, strength, petalTint) {
      const m = base.clone();
      m.onBeforeCompile = (sh) => {
        if (petalTint) {
          // Instanzfarbe nur auf rein weiße Vertices (Blütenblätter) anwenden
          sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', `
            vColor = vec4(1.0);
            #ifdef USE_COLOR
              vColor.rgb *= color.rgb;
            #endif
            #ifdef USE_INSTANCING_COLOR
              #ifdef USE_COLOR
                float petal = step(0.985, min(color.r, min(color.g, color.b)));
              #else
                float petal = 1.0;
              #endif
              vColor.rgb *= mix(vec3(1.0), instanceColor.rgb, petal);
            #endif`);
        }
        sh.uniforms.uKitTime = U.time;
        sh.uniforms.uKitWind = U.wind;
        sh.vertexShader = 'uniform float uKitTime;\nuniform float uKitWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          {
            float hh = max(position.y, 0.0);
            vec4 root = vec4(0.0, 0.0, 0.0, 1.0);
            #ifdef USE_INSTANCING
              root = instanceMatrix * root;
            #endif
            root = modelMatrix * root;
            float ph = root.x * 0.37 + root.z * 0.29;
            float sw = sin(uKitTime * 1.7 + ph) * 0.7 + sin(uKitTime * 2.9 + ph * 1.9) * 0.3;
            float k = hh * hh * ${strength.toFixed(3)} * uKitWind;
            transformed.x += sw * k;
            transformed.z += cos(uKitTime * 1.3 + ph * 1.3) * 0.5 * k;
          }`);
      };
      m.customProgramCacheKey = () => 'kit-wind-' + strength + (petalTint ? '-petal' : '');
      return m;
    }
    mats.wind = windMaterial(mats.matte, 1.4);
    mats.windDouble = windMaterial(mats.matteDouble, 1.4);
    mats.windPetal = windMaterial(mats.matte, 1.4, true);

    /* Oberflächen-Material für Zusammengeführtes (kit.merge, kit.batch, kit.floatMerge):
       Rauheit, Metall und Art (0 Fläche, 1 Fenster, 2 Leuchte) stehen je Eckpunkt im
       Attribut aSurf, flache Schattierung steckt in den Normalen. So kosten matte,
       glänzende und glatte Teile, Fenster und Leuchten einer Insel EINEN Draw-Call. */
    const SU = {
      uWinColor: { value: new T.Color('#a6dcff') },
      uWinEmissive: { value: new T.Color(0, 0, 0) },
      uGlowEmissive: { value: new T.Color('#ffc35a').multiplyScalar(0.45) },
    };
    function surfaceInject(sh) {
      Object.assign(sh.uniforms, SU);
      sh.vertexShader = 'attribute vec3 aSurf;\nvarying vec3 vKitSurf;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vKitSurf = aSurf;');
      sh.fragmentShader = 'uniform vec3 uWinColor;\nuniform vec3 uWinEmissive;\nuniform vec3 uGlowEmissive;\nvarying vec3 vKitSurf;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          float kitWin = step(0.5, vKitSurf.z) * (1.0 - step(1.5, vKitSurf.z));
          float kitGlow = step(1.5, vKitSurf.z);
          diffuseColor.rgb = mix(diffuseColor.rgb, uWinColor, kitWin);`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = vKitSurf.x;')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n  metalnessFactor = vKitSurf.y;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uWinEmissive * kitWin + uGlowEmissive * kitGlow;');
    }
    function surfaceMaterial(side, name) {
      const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side });
      m.onBeforeCompile = surfaceInject;
      m.customProgramCacheKey = () => 'kit-surface';
      m.name = name;
      return m;
    }
    mats.surface = surfaceMaterial(T.FrontSide, 'kit-surface');
    mats.surfaceDouble = surfaceMaterial(T.DoubleSide, 'kit-surface-double');
    /** [Rauheit, Metall, Art] der geteilten Bausatz-Materialien (werden beim Zusammenführen zu mats.surface). */
    const SURF_OF = new Map([
      [mats.matte, [0.86, 0, 0]], [mats.matteDouble, [0.84, 0, 0]], [mats.gloss, [0.34, 0.05, 0]],
      [mats.glossSmooth, [0.26, 0.02, 0]], [mats.window, [0.18, 0.1, 1]], [mats.glow, [0.4, 0, 2]],
    ]);
    const surfaceTarget = (m) => (SURF_OF.has(m) ? (m.side === T.DoubleSide ? mats.surfaceDouble : mats.surface) : m);
    /** Geometrie (nicht indiziert, fertig transformiert) für mats.surface vorbereiten: flache Normalen, Farbe, aSurf. */
    function toSurface(g, m) {
      const s = SURF_OF.get(m);
      const n = g.attributes.position.count;
      if (m.flatShading) g.computeVertexNormals(); // nicht indiziert → Normale je Dreieck (wie flatShading)
      if (!m.vertexColors) {
        const c = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { c[i * 3] = m.color.r; c[i * 3 + 1] = m.color.g; c[i * 3 + 2] = m.color.b; }
        g.setAttribute('color', new T.BufferAttribute(c, 3));
      } else if (!g.attributes.color) g.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
      const a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { a[i * 3] = s[0]; a[i * 3 + 1] = s[1]; a[i * 3 + 2] = s[2]; }
      g.setAttribute('aSurf', new T.BufferAttribute(a, 3));
      return g;
    }

    /* ------------------------------------------------------------------
       Schriften für Canvas-Texturen (Fredoka für Zahlen/Schilder,
       Andika für Lese-Inhalte). Texturen werden neu gezeichnet, sobald
       die Schriften geladen sind.
       ------------------------------------------------------------------ */
    const FONT_NUM = '"Fredoka", "Andika", "Trebuchet MS", system-ui, sans-serif';
    const FONT_READ = '"Andika", "Fredoka", "Trebuchet MS", system-ui, sans-serif';
    kit.fonts = { num: FONT_NUM, read: FONT_READ };
    const redraws = [];
    function redrawAll() { redraws.forEach((f) => { try { f(); } catch (e) { /* egal */ } }); }
    (function ensureFonts() {
      if (!document.fonts) return;
      try {
        let has = false;
        document.fonts.forEach((f) => { if (String(f.family).replace(/["']/g, '') === 'Fredoka') has = true; });
        if (!has && window.FontFace) {
          const base = String(W.vendorUrl || '').replace(/vendor\/three\.min\.js.*$/, '');
          [600, 700].forEach((wt) => {
            const ff = new FontFace('Fredoka', `url("${base}assets/fonts/fredoka-${wt}.woff2") format("woff2")`, { weight: String(wt), display: 'swap' });
            document.fonts.add(ff);
          });
        }
        Promise.all([document.fonts.load('700 64px "Fredoka"'), document.fonts.load('600 64px "Fredoka"'), document.fonts.load('700 64px "Andika"')])
          .then(redrawAll, () => {});
        document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', redrawAll);
      } catch (e) { /* ohne Schriften */ }
    })();
    function canvasTexture(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = Math.max(2, Math.round(w));
      c.height = Math.max(2, Math.round(h));
      const g = c.getContext('2d');
      draw(g, c.width, c.height);
      const tex = new T.CanvasTexture(c);
      tex.colorSpace = T.SRGBColorSpace;
      tex.anisotropy = 4;
      redraws.push(() => { g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tex.needsUpdate = true; });
      return tex;
    }
    kit.canvasTexture = canvasTexture;
    function rr(g, x, y, w, h, r) {
      g.beginPath();
      if (g.roundRect) g.roundRect(x, y, w, h, r);
      else { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    }
    /** Text so groß wie möglich in eine Breite einpassen. */
    function fitFont(g, text, weight, family, px, maxW) {
      g.font = `${weight} ${px}px ${family}`;
      const w = g.measureText(text).width;
      if (w > maxW) { px = Math.floor(px * maxW / w); g.font = `${weight} ${px}px ${family}`; }
      return px;
    }

    /* ------------------------------------------------------------------
       Geometrie vorbereiten & bemalen
       ------------------------------------------------------------------ */
    const KEEP = { position: 1, normal: 1, uv: 1, color: 1 };
    /** Einheitliche Attribute (nicht indiziert, position/normal/uv[/color]) für mergeGeometries. */
    function prep(geo, keepColor) {
      let g = geo;
      if (g.index) { g = g.toNonIndexed(); geo.dispose(); }
      for (const k of Object.keys(g.attributes)) if (!KEEP[k] || (k === 'color' && !keepColor)) g.deleteAttribute(k);
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      for (const k of Object.keys(g.morphAttributes)) delete g.morphAttributes[k];
      g.clearGroups();
      return g;
    }
    /**
     * Vertex-Farben setzen. o.grad = [unten, oben] Helligkeit über die Höhe (Standard [0.8, 1.05]),
     * o.jitter = Helligkeitsstreuung je Dreieck, o.top = zweite Farbe nach oben (Verlauf ab o.topFrom),
     * o.range = [y0, y1] feste Höhen für den Verlauf (z. B. über mehrere Teile).
     */
    function paint(geo, color, o = {}) {
      const g = prep(geo, false);
      const pos = g.attributes.position;
      const n = pos.count;
      const c0 = toColor(color);
      const c1 = o.top ? toColor(o.top) : null;
      let y0, y1;
      if (o.range) { y0 = o.range[0]; y1 = o.range[1]; } else { g.computeBoundingBox(); y0 = g.boundingBox.min.y; y1 = g.boundingBox.max.y; }
      const hgt = Math.max(1e-4, y1 - y0);
      const grad = o.grad || [0.8, 1.05];
      const jit = o.jitter || 0;
      const r = W.rng(o.seed || 7);
      const tf = o.topFrom == null ? 0.5 : o.topFrom;
      const arr = new Float32Array(n * 3);
      for (let f = 0; f < n; f += 3) {
        const j = 1 + (r() * 2 - 1) * jit;
        for (let v = f; v < f + 3 && v < n; v++) {
          const t = clamp((pos.getY(v) - y0) / hgt, 0, 1);
          const k = (grad[0] + (grad[1] - grad[0]) * t) * j;
          let cr = c0.r, cg = c0.g, cb = c0.b;
          if (c1) { const m = smooth(tf, Math.min(1, tf + 0.35), t); cr += (c1.r - cr) * m; cg += (c1.g - cg) * m; cb += (c1.b - cb) * m; }
          arr[v * 3] = cr * k; arr[v * 3 + 1] = cg * k; arr[v * 3 + 2] = cb * k;
        }
      }
      g.setAttribute('color', new T.BufferAttribute(arr, 3));
      return g;
    }
    kit.paint = paint;
    function matFor(o) {
      if (o.material) return o.material;
      if (o.mat) return mats[o.mat];
      if (o.double) return mats.matteDouble;
      if (o.gloss) return o.smooth ? mats.glossSmooth : mats.gloss;
      return mats.matte;
    }
    kit.mesh = function (geo, color, o = {}) {
      const m = new T.Mesh(paint(geo, color, o), matFor(o));
      m.castShadow = o.shadow !== false;
      m.receiveShadow = true;
      return m;
    };

    /** Sammelt bemalte Teile und baut daraus EIN Mesh je Material. */
    function Parts() { this.m = {}; }
    Parts.prototype.add = function (geo, color, o = {}) {
      const key = o.mat || (o.double ? 'matteDouble' : o.gloss ? (o.smooth ? 'glossSmooth' : 'gloss') : 'matte');
      (this.m[key] || (this.m[key] = [])).push(paint(geo, color, o));
      return this;
    };
    /** Bereits bemalte/fertige Geometrie (mit color-Attribut) hinzufügen. */
    Parts.prototype.addRaw = function (geo, key = 'matte') {
      (this.m[key] || (this.m[key] = [])).push(geo);
      return this;
    };
    /**
     * Dreiecke entfernen, die ganz in einer der Kugeln liegen (balls = [[x, y, z, r], …]) –
     * z. B. Innenflächen sich überlappender Laub-Kleckse. r = sicherer Innenradius.
     */
    Parts.prototype.cullInside = function (balls) {
      if (!balls.length) return this;
      const inside = (pa, i) => {
        for (let j = 0; j < balls.length; j++) {
          const b = balls[j], r2 = b[3] * b[3];
          let ok = true;
          for (let v = 0; v < 3 && ok; v++) {
            const dx = pa[i + v * 3] - b[0], dy = pa[i + v * 3 + 1] - b[1], dz = pa[i + v * 3 + 2] - b[2];
            ok = dx * dx + dy * dy + dz * dz < r2;
          }
          if (ok) return true;
        }
        return false;
      };
      for (const key in this.m) {
        this.m[key] = this.m[key].map((g) => {
          const pa = g.attributes.position.array, nt = g.attributes.position.count / 3;
          const keep = [];
          for (let t = 0; t < nt; t++) if (!inside(pa, t * 9)) keep.push(t);
          if (keep.length === nt) return g;
          const out = new T.BufferGeometry();
          for (const k of Object.keys(g.attributes)) {
            const at = g.attributes[k], sz = at.itemSize * 3;
            const arr = new at.array.constructor(keep.length * sz);
            keep.forEach((t, o) => arr.set(at.array.subarray(t * sz, t * sz + sz), o * sz));
            out.setAttribute(k, new T.BufferAttribute(arr, at.itemSize, at.normalized));
          }
          g.dispose();
          return out;
        }).filter((g) => g.attributes.position.count > 0);
      }
      return this;
    };
    Parts.prototype.build = function (group, o = {}) {
      group = group || new T.Group();
      for (const key in this.m) {
        const list = this.m[key];
        if (!list.length) continue;
        const geo = list.length === 1 ? list[0] : mergeGeos(list, false);
        if (list.length > 1) list.forEach((g) => g.dispose());
        const mesh = new T.Mesh(geo, mats[key]);
        mesh.castShadow = o.castShadow !== false;
        mesh.receiveShadow = o.receiveShadow !== false;
        group.add(mesh);
      }
      this.m = {};
      return group;
    };
    kit.Parts = Parts;

    /* ------------------------------------------------------------------
       Grundformen
       ------------------------------------------------------------------ */
    let simplexDefault = null;
    function noise3(seed) {
      if (!A.SimplexNoise) return { noise3d: () => 0, noise: () => 0 };
      if (seed == null) return simplexDefault || (simplexDefault = new A.SimplexNoise({ random: W.rng(4242) }));
      return new A.SimplexNoise({ random: W.rng(seedOf(seed, 17)) });
    }
    const geo = (kit.geo = {});
    /** Kiste mit abgeschrägten Kanten (44 Dreiecke) – wirkt mit flatShading wie eine weiche Spielzeug-Kiste. */
    function chamferBox(w, h, d, r) {
      const a = w / 2, b = h / 2, c = d / 2;
      r = Math.max(0.001, Math.min(r, a * 0.9, b * 0.9, c * 0.9));
      const V = (sx, sy, sz, f) => (f === 0 ? [sx * a, sy * (b - r), sz * (c - r)] : f === 1 ? [sx * (a - r), sy * b, sz * (c - r)] : [sx * (a - r), sy * (b - r), sz * c]);
      const tris = [];
      const quad = (p, q, u, v) => { tris.push(p, q, u, p, u, v); };
      const S = [-1, 1];
      S.forEach((s1) => {
        quad(V(s1, -1, -1, 0), V(s1, 1, -1, 0), V(s1, 1, 1, 0), V(s1, -1, 1, 0));
        quad(V(-1, s1, -1, 1), V(1, s1, -1, 1), V(1, s1, 1, 1), V(-1, s1, 1, 1));
        quad(V(-1, -1, s1, 2), V(1, -1, s1, 2), V(1, 1, s1, 2), V(-1, 1, s1, 2));
      });
      S.forEach((s1) => S.forEach((s2) => {
        quad(V(s1, s2, -1, 0), V(s1, s2, 1, 0), V(s1, s2, 1, 1), V(s1, s2, -1, 1)); // Kante entlang z
        quad(V(-1, s1, s2, 1), V(1, s1, s2, 1), V(1, s1, s2, 2), V(-1, s1, s2, 2)); // Kante entlang x
        quad(V(s1, -1, s2, 0), V(s1, 1, s2, 0), V(s1, 1, s2, 2), V(s1, -1, s2, 2)); // Kante entlang y
      }));
      S.forEach((sx) => S.forEach((sy) => S.forEach((sz) => tris.push(V(sx, sy, sz, 0), V(sx, sy, sz, 1), V(sx, sy, sz, 2)))));
      // nach außen ausrichten (konvex, Mitte im Ursprung)
      const pos = [];
      for (let i = 0; i < tris.length; i += 3) {
        let [p, q, u] = [tris[i], tris[i + 1], tris[i + 2]];
        const e1 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], e2 = [u[0] - p[0], u[1] - p[1], u[2] - p[2]];
        const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        const cx = p[0] + q[0] + u[0], cy = p[1] + q[1] + u[1], cz = p[2] + q[2] + u[2];
        if (n[0] * cx + n[1] * cy + n[2] * cz < 0) { const t = q; q = u; u = t; }
        pos.push(...p, ...q, ...u);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }
    geo.chamferBox = chamferBox;
    /** Weiche Kiste: seg ≤ 1 → abgeschrägt (44 Dreiecke), seg ≥ 2 → RoundedBoxGeometry (teurer, glatter). */
    geo.roundBox = (w, h, d, r = 0.08, seg = 1) => (seg <= 1 || !A.RoundedBoxGeometry ? chamferBox(w, h, d, r) : new A.RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)));
    geo.box = (w, h, d) => new T.BoxGeometry(w, h, d);
    geo.cyl = (rt, rb, h, seg = 8, hs = 1) => new T.CylinderGeometry(rt, rb, h, seg, hs);
    /** Weicher, unregelmäßiger Klecks (Ikosaeder + Rauschen). o.flat: Unterseite abflachen (Anteil des Radius). */
    geo.blob = (r, o = {}) => {
      const g = new T.IcosahedronGeometry(r, o.detail == null ? 1 : o.detail);
      const nz = noise3(o.seed == null ? null : o.seed);
      const amt = o.noise == null ? 0.14 : o.noise;
      const fr = (o.freq || 1.4) / Math.max(0.2, r);
      const p = g.attributes.position;
      const v = new T.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const k = 1 + nz.noise3d(v.x * fr, v.y * fr, v.z * fr) * amt;
        v.multiplyScalar(k);
        if (o.flat != null && v.y < -r * o.flat) v.y = -r * o.flat + (v.y + r * o.flat) * 0.15;
        p.setXYZ(i, v.x, v.y, v.z);
      }
      if (o.sx || o.sy || o.sz) g.scale(o.sx || 1, o.sy || 1, o.sz || 1);
      g.computeVertexNormals();
      return g;
    };
    /** Kegel/Zylinder mit leicht verschobenen Ecken (organischer). */
    function wobble(g, amt, seed, keepTop) {
      const r = W.rng(seedOf(seed, 3));
      const p = g.attributes.position;
      const map = new Map();
      g.computeBoundingBox();
      const top = g.boundingBox.max.y;
      for (let i = 0; i < p.count; i++) {
        const key = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3);
        let d = map.get(key);
        if (!d) { d = [(r() * 2 - 1) * amt, (r() * 2 - 1) * amt * 0.5, (r() * 2 - 1) * amt]; map.set(key, d); }
        if (keepTop && Math.abs(p.getY(i) - top) < 1e-4 && Math.abs(p.getX(i)) < 1e-4 && Math.abs(p.getZ(i)) < 1e-4) continue;
        p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]);
      }
      g.computeVertexNormals();
      return g;
    }

    /* ------------------------------------------------------------------
       Animation
       ------------------------------------------------------------------ */
    const updates = new Set();
    W.onFrame((dt, t) => {
      U.time.value = t;
      updates.forEach((fn) => fn(dt, t));
    });
    kit.onUpdate = (fn) => { updates.add(fn); return () => updates.delete(fn); };
    const motion = () => (W.reducedMotion ? 0.12 : 1);
    function markDynamic(obj, what) {
      obj.userData.dynamic = true;
      if (!obj.isMesh && !obj.isSprite && !obj.isPoints && !obj.children.length) console.warn('kit.' + what + ': Objekt ist leer – wurde es schon mit kit.merge zusammengeführt? Animationen VOR kit.merge registrieren.');
    }
    kit.float = function (obj, o = {}) {
      markDynamic(obj, 'float');
      const amp = (o.amp == null ? 0.12 : o.amp) * motion();
      const sp = o.speed || 1;
      const ph = o.phase == null ? Math.random() * TAU : o.phase;
      const rot = (o.rot || 0) * motion();
      const y0 = obj.position.y;
      return kit.onUpdate((dt, t) => {
        obj.position.y = y0 + Math.sin(t * 1.3 * sp + ph) * amp;
        if (rot) obj.rotation.y += rot * dt;
      });
    };
    kit.sway = function (obj, o = {}) {
      markDynamic(obj, 'sway');
      const amp = (o.amp == null ? 0.06 : o.amp) * motion();
      const sp = o.speed || 1;
      const ph = o.phase == null ? Math.random() * TAU : o.phase;
      const ax = o.axis || 'z';
      const r0 = obj.rotation[ax];
      return kit.onUpdate((dt, t) => { obj.rotation[ax] = r0 + Math.sin(t * 1.1 * sp + ph) * amp; });
    };
    kit.spin = function (obj, o = {}) {
      markDynamic(obj, 'spin');
      const sp = (o.speed == null ? 0.5 : o.speed) * (W.reducedMotion ? 0.15 : 1);
      const ax = o.axis || 'y';
      return kit.onUpdate((dt) => { obj.rotation[ax] += sp * dt; });
    };

    /* ------------------------------------------------------------------
       Zusammenführen
       ------------------------------------------------------------------ */
    /** Kopie als nicht indizierte Geometrie mit einheitlichen Attributen (position/normal/uv[/color]). */
    function cleanGeo(src, vc) {
      let g = src.clone();
      if (g.index) { const ni = g.toNonIndexed(); g.dispose(); g = ni; }
      for (const k of Object.keys(g.attributes)) if (!KEEP[k] || (k === 'color' && !vc)) g.deleteAttribute(k);
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (vc && !g.attributes.color) g.setAttribute('color', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
      g.morphAttributes = {};
      g.clearGroups();
      return g;
    }
    /** Eckpunkte [a, b) als eigene Geometrie (nicht indiziert). */
    function sliceGeo(g, a, b) {
      const out = new T.BufferGeometry();
      for (const k of Object.keys(g.attributes)) {
        const at = g.attributes[k];
        out.setAttribute(k, new T.BufferAttribute(at.array.slice(a * at.itemSize, b * at.itemSize), at.itemSize, at.normalized));
      }
      return out;
    }
    /**
     * Schatten nur aus den ersten count Eckpunkten: Im Schatten-Pass wird die Zeichen-
     * Spanne gekürzt (onBeforeShadow), im normalen Bild bleibt es EIN Draw-Call.
     */
    function shadowPrefix(mesh, count) {
      const g = mesh.geometry;
      mesh.userData.shadowCount = count;
      mesh.onBeforeShadow = function () { g.drawRange.start = 0; g.drawRange.count = count; };
      mesh.onAfterShadow = function () { g.drawRange.count = Infinity; };
    }
    kit.shadowPrefix = shadowPrefix;
    const _bb = new T.Box3(), _sz = new T.Vector3();
    /**
     * Wie viele Eckpunkte (von vorn) werfen Schatten? 0 bei castShadow = false,
     * userData.noShadow, kleinen (halbe Diagonale < minShadow) oder flachen (< 0.16 hoch)
     * Teilen; geometry.userData.castCount begrenzt (z. B. Gelände: nur Klippenband).
     * box: Bounding-Box in Ziel-Koordinaten.
     */
    function castCount(o, n, box, minShadow) {
      if (!o.castShadow || o.userData.noShadow) return 0;
      if (minShadow > 0) {
        box.getSize(_sz);
        if (_sz.length() / 2 < minShadow || _sz.y < 0.16) return 0;
      }
      const cc = o.geometry.userData.castCount;
      return cc == null ? n : Math.max(0, Math.min(n, cc));
    }
    /**
     * Unsichtbare Dreiecke entfernen (statische Teile einer Insel): ganz im Boden
     * versunkene und nach unten zeigende direkt auf dem Boden (Unterseiten, Sockel,
     * vergrabene Stein-Hälften). groundAt(x, z) = Bodenhöhe in denselben Koordinaten.
     * Die Kamera ist immer über dem Boden – im Bild ändert sich nichts.
     */
    function dropHidden(g, groundAt) {
      const pa = g.attributes.position.array;
      const nt = g.attributes.position.count / 3;
      g.computeBoundingBox();
      const bb = g.boundingBox;
      // Obergrenze des Bodens unter dem Teil (grob): Dreiecke darüber prüft niemand auf den Boden
      let gMax = -Infinity;
      if (groundAt) for (let i = 0; i <= 2; i++) for (let k = 0; k <= 2; k++) gMax = Math.max(gMax, groundAt(lerp(bb.min.x, bb.max.x, i / 2), lerp(bb.min.z, bb.max.z, k / 2)));
      const keep = new Uint8Array(nt);
      let kept = 0;
      for (let t = 0; t < nt; t++) {
        const i = t * 9;
        const ay = pa[i + 1], by = pa[i + 4], cy = pa[i + 7];
        const ux = pa[i + 3] - pa[i], uy = by - ay, uz = pa[i + 5] - pa[i + 2];
        const vx = pa[i + 6] - pa[i], vy = cy - ay, vz = pa[i + 8] - pa[i + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        let hide = !(len > 1e-9); // entartet (Fläche 0, z. B. Drehkörper-Spitzen) – zeichnet nie ein Pixel
        if (!hide && groundAt && Math.min(ay, by, cy) < gMax + 0.2) {
          const ga = groundAt(pa[i], pa[i + 2]), gb = groundAt(pa[i + 3], pa[i + 5]), gc = groundAt(pa[i + 6], pa[i + 8]);
          if (ay < ga - 0.03 && by < gb - 0.03 && cy < gc - 0.03) hide = true;
          else if (ay < ga + 0.06 && by < gb + 0.06 && cy < gc + 0.06 && ny < -0.3 * len) hide = true;
        }
        if (!hide) { keep[t] = 1; kept++; }
      }
      if (kept === nt) return g;
      const out = new T.BufferGeometry();
      for (const k of Object.keys(g.attributes)) {
        const at = g.attributes[k], sz = at.itemSize * 3;
        const arr = new at.array.constructor(kept * sz);
        for (let t = 0, o = 0; t < nt; t++) if (keep[t]) { arr.set(at.array.subarray(t * sz, t * sz + sz), o); o += sz; }
        out.setAttribute(k, new T.BufferAttribute(arr, at.itemSize, at.normalized));
      }
      g.dispose();
      return out;
    }
    const mergeable = (o) => o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !o.isBatchedMesh && o.visible && o.layers.mask !== 0 && o.geometry && !Array.isArray(o.material) && !o.morphTargetInfluences && o.geometry.attributes.position;

    /**
     * Statische Meshes je Material zusammenführen. Die geteilten Bausatz-Materialien
     * (matte, gloss, glossSmooth, matteDouble, window, glow) landen gemeinsam im
     * Oberflächen-Material (ein Draw-Call). Schatten werfen nur große Teile
     * (opt.minShadow = halbe Diagonale, Standard 0.42); im zusammengeführten Mesh stehen
     * die Schattenwerfer vorn, der Schatten-Pass zeichnet nur sie.
     */
    kit.merge = function (root, opt = {}) {
      if (!mergeGeos) return root;
      const minShadow = opt.minShadow == null ? 0.42 : opt.minShadow;
      const groundAt = opt.ground === false ? null : root.userData.groundAt || null; // von kit.islandBase
      root.updateMatrixWorld(true);
      const inv = new T.Matrix4().copy(root.matrixWorld).invert();
      const buckets = new Map();
      (function walk(o) {
        if (o !== root && (o.userData.dynamic || o.userData.noMerge || o.userData.onTap)) return;
        if (mergeable(o)) {
          const mat = surfaceTarget(o.material);
          const vc = !!mat.vertexColors;
          const key = mat.uuid + '|' + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder + '|' + vc;
          let b = buckets.get(key);
          if (!b) buckets.set(key, (b = { mat, recv: o.receiveShadow, order: o.renderOrder, vc, items: [] }));
          b.items.push(o);
        }
        for (let i = 0; i < o.children.length; i++) walk(o.children[i]);
      })(root);
      const mtx = new T.Matrix4();
      buckets.forEach((b) => {
        const surf = b.mat === mats.surface || b.mat === mats.surfaceDouble;
        if (b.items.length < 2 && !surf) {
          // einzeln lassen – nur die Schatten-Regel anwenden
          const o = b.items[0];
          const g = o.geometry;
          if (!g.boundingBox) g.computeBoundingBox();
          mtx.multiplyMatrices(inv, o.matrixWorld);
          const n = g.index ? g.index.count : g.attributes.position.count;
          const cc = castCount(o, n, _bb.copy(g.boundingBox).applyMatrix4(mtx), minShadow);
          o.castShadow = cc > 0;
          if (cc > 0 && cc < n) shadowPrefix(o, cc);
          return;
        }
        const cast = [], rest = [];
        let castVerts = 0;
        b.items.forEach((o) => {
          let g = cleanGeo(o.geometry, b.vc);
          mtx.multiplyMatrices(inv, o.matrixWorld);
          g.applyMatrix4(mtx);
          if (!o.geometry.userData.terrain) g = dropHidden(g, groundAt);
          if (!g.attributes.position.count) return;
          if (surf) toSurface(g, o.material);
          const n = g.attributes.position.count;
          g.computeBoundingBox();
          const cc = castCount(o, n, g.boundingBox, minShadow);
          if (cc >= n) cast.push(g);
          else if (cc <= 0) rest.push(g);
          else { cast.push(sliceGeo(g, 0, cc)); rest.push(sliceGeo(g, cc, n)); g.dispose(); }
          castVerts += cc;
        });
        const geos = cast.concat(rest);
        const merged = geos.length > 1 ? mergeGeos(geos, false) : geos[0];
        if (geos.length > 1) geos.forEach((g) => g.dispose());
        if (!merged) return;
        const mesh = new T.Mesh(merged, b.mat);
        mesh.castShadow = castVerts > 0;
        mesh.receiveShadow = b.recv;
        mesh.renderOrder = b.order;
        mesh.name = 'merged';
        if (castVerts > 0 && castVerts < merged.attributes.position.count) shadowPrefix(mesh, castVerts);
        b.items.forEach((o) => {
          if (o.parent) o.parent.remove(o);
          if (!o.geometry.userData.shared) o.geometry.dispose();
        });
        root.add(mesh);
      });
      // leere Gruppen entfernen
      (function prune(o) {
        for (let i = o.children.length - 1; i >= 0; i--) {
          const c = o.children[i];
          prune(c);
          if (!c.children.length && (c.type === 'Group' || c.type === 'Object3D') && !Object.keys(c.userData).length) o.remove(c);
        }
      })(root);
      return root;
    };

    /* ------------------------------------------------------------------
       Bewegte starre Teile in wenigen Draw-Calls (GPU, ohne Eckpunkt-Arbeit pro Bild)
       ------------------------------------------------------------------ */
    const batchable = (m) => mergeable(m) && !m.userData.noBatch;
    /**
     * kit.batch(objs, opt) → { group, bones, set(i, matrix4), apply() }
     * Alle Meshes unter den Objekten werden je Material (Bausatz-Materialien gemeinsam)
     * zu EINEM SkinnedMesh; jedes Teil hängt starr an einem „Knochen“ – die Grafikkarte
     * bewegt die Eckpunkte, pro Bild werden nur die Matrizen hochgeladen.
     *   Standard: objs sind lose Gruppen (Drehpunkt im Ursprung, nicht eingehängt);
     *     set(i, m4) setzt die Lage von objs[i] in Insel-Koordinaten. group einhängen!
     *   opt.live = true: objs hängen schon in der Szene und werden weiter wie gewohnt
     *     bewegt (kit.float/sway/spin, eigene Animation); ihre Meshes werden unsichtbar
     *     (layers) und dienen selbst als Knochen. group einhängen!
     *   opt.sphere: Hüll-Kugel (Insel-Koordinaten) für Sichtbarkeit/Antippen,
     *     sonst aus der Startlage + opt.margin (0.6).
     *   opt.shadow = false: wirft keinen Schatten.
     */
    kit.batch = function (objs, opt = {}) {
      const grp = new T.Group();
      grp.name = opt.name || 'beweglich';
      grp.userData.dynamic = true;
      const bones = [];
      const buckets = new Map();
      const add = (m, bone, bake) => {
        const mat = surfaceTarget(m.material);
        const vc = !!mat.vertexColors;
        const key = mat.uuid + '|' + m.renderOrder + '|' + (m.receiveShadow ? 1 : 0) + '|' + vc;
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = { mat, vc, order: m.renderOrder, recv: m.receiveShadow, cast: false, geos: [] }));
        const g = cleanGeo(m.geometry, vc);
        if (bake) g.applyMatrix4(bake);
        if (mat !== m.material) toSurface(g, m.material);
        const n = g.attributes.position.count;
        const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
        for (let i = 0; i < n; i++) { si[i * 4] = bone; sw[i * 4] = 1; }
        g.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4));
        g.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
        b.cast = b.cast || (m.castShadow && !m.userData.noShadow);
        b.geos.push(g);
      };
      if (opt.live) {
        objs.forEach((obj) => obj.traverse((m) => {
          if (!batchable(m)) return;
          let p = m;
          while (p && p !== obj) { if (p.userData.onTap) return; p = p.parent; }
          add(m, bones.length, null);
          bones.push(m);
          m.layers.disableAll(); // bleibt im Szenengraph (Matrizen laufen weiter), wird aber nicht mehr gezeichnet
        }));
      } else {
        const inv = new T.Matrix4(), bk = new T.Matrix4();
        objs.forEach((obj, i) => {
          const bone = new T.Object3D();
          bone.matrixAutoUpdate = false;
          bone.userData.bone = true; // leer, aber nötig: kit.merge räumt sie nicht weg
          grp.add(bone);
          bones.push(bone);
          obj.updateMatrixWorld(true);
          inv.copy(obj.matrixWorld).invert();
          obj.traverse((m) => { if (batchable(m)) add(m, i, bk.multiplyMatrices(inv, m.matrixWorld)); });
        });
      }
      const skeleton = new T.Skeleton(bones, bones.map(() => new T.Matrix4()));
      const meshes = [];
      buckets.forEach((b) => {
        const geo = b.geos.length > 1 ? mergeGeos(b.geos, false) : b.geos[0];
        if (b.geos.length > 1) b.geos.forEach((g) => g.dispose());
        const mesh = new T.SkinnedMesh(geo, b.mat);
        mesh.bind(skeleton, new T.Matrix4());
        mesh.castShadow = b.cast && opt.shadow !== false;
        mesh.receiveShadow = b.recv;
        mesh.renderOrder = b.order;
        mesh.name = grp.name;
        grp.add(mesh);
        meshes.push(mesh);
      });
      const api = {
        group: grp, bones, meshes, skeleton,
        set(i, m4) { const b = bones[i]; b.matrix.copy(m4); b.matrixWorldNeedsUpdate = true; },
        apply() { /* nichts zu tun: die Grafikkarte bewegt die Eckpunkte */ },
        /** Hüll-Kugel neu bestimmen (aus der aktuellen Lage, Insel-Koordinaten) */
        fit(sphere, margin = 0.6) {
          meshes.forEach((mesh) => {
            if (sphere) { mesh.boundingSphere = sphere.clone(); return; }
            const root = mesh.parent ? (function top(o) { return o.parent ? top(o.parent) : o; })(mesh) : grp;
            root.updateMatrixWorld(true);
            bones.forEach((bn) => bn.updateMatrixWorld(true));
            mesh.boundingSphere = null;
            mesh.computeBoundingSphere();
            mesh.boundingSphere.radius += margin;
          });
        },
      };
      if (opt.sphere) api.fit(opt.sphere);
      else api.needsFit = true; // nach dem Einhängen: api.fit() (kit.merge erledigt das für Gruppen in der Insel)
      grp.userData.batch = api;
      return api;
    };

    /**
     * Alle beweglichen Meshes einer Insel (unter userData.dynamic, nicht antippbar, keine
     * Instanzen/Partikel/Sprites, nicht noMerge/noBatch) in kit.batch({ live: true })
     * bündeln. Aufruf NACH kit.merge(root). → api oder null
     */
    kit.batchDynamic = function (root, opt = {}) {
      const objs = [];
      (function walk(o) {
        if (o.userData.onTap && o !== root) return;
        if (o !== root && o.userData.noMerge) return;
        if (o !== root && o.userData.dynamic && !o.userData.batch) { objs.push(o); return; }
        for (let i = 0; i < o.children.length; i++) walk(o.children[i]);
      })(root);
      let n = 0;
      objs.forEach((o) => o.traverse((m) => { if (batchable(m)) n++; }));
      if (n < 2) return null;
      const api = kit.batch(objs, Object.assign({ live: true, name: 'beweglich' }, opt));
      root.add(api.group);
      api.fit(opt.sphere, opt.margin);
      return api;
    };

    /**
     * Schwebende Teile in wenige Draw-Calls zusammenführen: Jedes Teil wippt und dreht
     * sich im Vertex-Shader mit eigener Phase (keine Arbeit pro Bild auf der CPU).
     * items: [{ obj, phase, amp=0.12, rot, spin }] – obj in Insel-Koordinaten (nicht eingehängt).
     *   rot: Pendel-Drehung (Bogenmaß-Amplitude), spin: Drehung je s; um die senkrechte Achse durch obj.
     * → Group (wirft keinen Schatten)
     */
    const floatMats = new Map();
    function floatMat(m) {
      if (floatMats.has(m.uuid)) return floatMats.get(m.uuid);
      const fm = m.clone();
      const surf = m === mats.surface || m === mats.surfaceDouble;
      fm.onBeforeCompile = (sh) => {
        if (surf) surfaceInject(sh);
        sh.uniforms.uKitTime = U.time;
        const pre = `float bobK = uKitTime * 1.2 + aBob.x;
          float bobA = sin(bobK * 0.5) * aSpin.x + uKitTime * aSpin.y;
          float bobC = cos(bobA), bobS = sin(bobA);`;
        sh.vertexShader = 'uniform float uKitTime;\nattribute vec4 aBob;\nattribute vec2 aSpin;\n' + sh.vertexShader
          .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
            ${pre}
            objectNormal.xz = vec2(objectNormal.x * bobC - objectNormal.z * bobS, objectNormal.x * bobS + objectNormal.z * bobC);`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            {
              vec2 bobD = transformed.xz - aBob.zw;
              transformed.xz = aBob.zw + vec2(bobD.x * bobC - bobD.y * bobS, bobD.x * bobS + bobD.y * bobC);
              transformed.y += sin(bobK) * aBob.y;
            }`);
      };
      fm.customProgramCacheKey = () => 'kit-schweben-' + (surf ? 'surface' : m.uuid);
      floatMats.set(m.uuid, fm);
      return fm;
    }
    kit.floatMerge = function (items) {
      const calm = W.reducedMotion ? 0.12 : 1;
      const buckets = new Map();
      items.forEach((it) => {
        it.obj.updateMatrixWorld(true);
        const cx = it.obj.position.x, cz = it.obj.position.z;
        it.obj.traverse((m) => {
          if (!m.isMesh) return;
          const mat = surfaceTarget(m.material);
          const q = cleanGeo(m.geometry, !!mat.vertexColors);
          q.applyMatrix4(m.matrixWorld);
          if (mat !== m.material) toSurface(q, m.material);
          const n = q.attributes.position.count;
          const a = new Float32Array(n * 4), s = new Float32Array(n * 2);
          for (let i = 0; i < n; i++) {
            a[i * 4] = it.phase || 0; a[i * 4 + 1] = (it.amp == null ? 0.12 : it.amp) * calm; a[i * 4 + 2] = cx; a[i * 4 + 3] = cz;
            s[i * 2] = (it.rot || 0) * calm; s[i * 2 + 1] = (it.spin || 0) * calm;
          }
          q.setAttribute('aBob', new T.BufferAttribute(a, 4));
          q.setAttribute('aSpin', new T.BufferAttribute(s, 2));
          const key = mat.uuid + '|' + m.renderOrder;
          if (!buckets.has(key)) buckets.set(key, { mat, geos: [], order: m.renderOrder });
          buckets.get(key).geos.push(q);
        });
      });
      const grp = new T.Group();
      grp.name = 'schwebend';
      grp.userData.dynamic = true;
      buckets.forEach((b) => {
        const mesh = new T.Mesh(b.geos.length > 1 ? mergeGeos(b.geos, false) : b.geos[0], floatMat(b.mat));
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.renderOrder = b.order;
        mesh.geometry.computeBoundingSphere();
        mesh.geometry.boundingSphere.radius += 0.5;
        mesh.userData.noBatch = true; // eigener Vertex-Shader – nicht in kit.batch bündeln
        grp.add(mesh);
      });
      return grp;
    };

    /* ------------------------------------------------------------------
       Kontaktschatten
       ------------------------------------------------------------------ */
    let blobMat = null;
    kit.shadowBlob = function (radius = 0.5, opacity = 1) {
      if (!blobMat) {
        const tex = canvasTexture(128, 128, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(20,40,30,0.42)');
          gr.addColorStop(0.45, 'rgba(20,40,30,0.25)');
          gr.addColorStop(1, 'rgba(20,40,30,0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, w, w);
        });
        blobMat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false });
        blobMat.name = 'kit-blob';
      }
      const g = new T.PlaneGeometry(radius * 2, radius * 2).rotateX(-PI / 2);
      const m = new T.Mesh(g, opacity === 1 ? blobMat : Object.assign(blobMat.clone(), { opacity }));
      m.position.y = 0.025;
      m.castShadow = false;
      m.receiveShadow = false;
      m.renderOrder = 1;
      return m;
    };

    /* ==================================================================
       GELÄNDE: Insel-Sockel
       ================================================================== */
    kit.islandBase = function (o = {}) {
      const seed = o.seed == null ? 1 : o.seed;
      const R = o.radius || 6;
      const G0 = o.grassRadius || R * 0.75;
      const H = o.height == null ? 1 : o.height;
      const S = o.segments || 40;
      const rng = W.rng(seedOf(seed, 1));
      const sx = A.SimplexNoise ? new A.SimplexNoise({ random: rng }) : { noise: () => 0, noise3d: () => 0 };
      const col = {
        grass: toColor(o.grass || C.grass),
        grassDark: toColor(o.grassDark || (o.grass ? kit.shade(o.grass, 0.8) : C.grassDark)),
        grassLight: toColor(o.grassLight || (o.grass ? kit.shade(o.grass, 1.13) : C.grassLight)),
        sand: toColor(o.sand || C.sand),
        cliff: toColor(o.cliff || C.rock),
      };
      col.sandShade = col.sand.clone().multiplyScalar(0.84);
      col.sandWet = col.sand.clone().lerp(toColor('#c99a5e'), 0.5);
      col.cliffLight = col.cliff.clone().lerp(toColor('#efe2cf'), 0.25);
      col.cliffDark = col.cliff.clone().multiplyScalar(0.78);
      col.u1 = col.sand.clone().lerp(toColor('#b8955f'), 0.45);
      col.u2 = toColor('#a9a27a').lerp(col.sand, 0.2);
      col.u3 = toColor('#5aa79f');
      col.u4 = toColor('#2f7f93');

      const harm = (amps, kmin) => {
        const ph = amps.map(() => rng() * TAU);
        return (a) => { let s = 0; for (let i = 0; i < amps.length; i++) s += amps[i] * Math.sin((i + kmin) * a + ph[i]); return s; };
      };
      const gN0 = harm([0.07, 0.05, 0.035, 0.02], 2);
      const gN1 = harm([0.045], 1); // leicht aus der Mitte: Strand auf einer Seite breiter
      const gN = (a) => gN0(a) + gN1(a);
      const sN = harm([0.045, 0.035, 0.02], 2);
      const cN = harm([0.7, 0.5, 0.35], 1);
      const cliffAmt = o.cliffs == null ? 1 : o.cliffs;
      const hillAmt = o.hills == null ? 1 : o.hills;
      const edgeR = (a) => G0 * (1 + gN(a));
      const shoreR = (a) => Math.max(edgeR(a) + 1.05, R * (1 + sN(a)));
      const cliffK = (a) => smooth(-0.1, 0.55, cN(a)) * cliffAmt;
      const hills = (x, z) => {
        const r2 = (x * x + z * z) / (G0 * G0);
        return H + hillAmt * (0.09 * sx.noise(x * 0.21 + 3.1, z * 0.21 - 1.7) + 0.035 * sx.noise(x * 0.6, z * 0.6) + 0.08 * Math.max(0, 1 - r2));
      };
      // Innenringe der Wiese (zur Kante hin dichter); o.rings = Anzahl (3–8, Standard 6)
      const RINGS = { 3: [0.45, 0.8, 1], 4: [0.35, 0.65, 0.87, 1], 5: [0.28, 0.52, 0.73, 0.9, 1], 6: [0.24, 0.45, 0.63, 0.79, 0.92, 1],
        7: [0.2, 0.38, 0.54, 0.68, 0.81, 0.92, 1], 8: [0.18, 0.35, 0.5, 0.63, 0.75, 0.85, 0.93, 1] };
      const IN = RINGS[clamp(Math.round(o.rings || 6), 3, 8)];
      const INNER = 0.34; // Abstand der letzten Innen-Ringe zur Kante
      /** Stationen [r, y] außerhalb der Wiese für einen Winkel. */
      function stations(a) {
        const G = edgeR(a), Sr = shoreR(a), c = cliffK(a);
        const yE = hills(Math.cos(a) * G, Math.sin(a) * G);
        const cliffH = 0.1 + 0.56 * c;
        const yTop = yE - 0.3;
        const yBase = Math.max(0.15, yTop - cliffH);
        const rBase = G + 0.14 + 0.12 * (1 - c);
        return [
          [G - 0.13, yE - 0.025],
          [G + 0.02, yE - 0.12],
          [G + 0.09, yE - 0.27],
          [G + 0.07 + 0.03 * c, yTop - cliffH * 0.5],
          [rBase, yBase],
          [rBase + 0.16, yBase - 0.035],
          [lerp(rBase + 0.16, Sr, 0.45), lerp(yBase, 0, 0.55)],
          [lerp(rBase + 0.16, Sr, 0.8), 0.09],
          [Sr, -0.04],
          [Sr + 0.6, -0.36],
          [Sr + 1.2, -0.95],
          [Sr + 1.7, -1.9],
          [Sr + 1.95, -2.9],
        ];
      }
      function surfaceAt(x, z) {
        const r = Math.hypot(x, z);
        const a = Math.atan2(z, x);
        const G = edgeR(a);
        const r0 = G - INNER;
        if (r <= r0) return hills(x, z);
        const st = stations(a);
        let pr = r0, py = hills(Math.cos(a) * r0, Math.sin(a) * r0);
        for (let i = 0; i < st.length; i++) {
          const [sr, sy] = st[i];
          if (r <= sr) return sr - pr < 1e-5 ? sy : lerp(py, sy, (r - pr) / (sr - pr));
          pr = sr; py = sy;
        }
        return -3;
      }

      /* Gitter: Mittelpunkt + Innenringe + Stationen */
      const rings = [];
      const nIn = IN.length;
      for (let k = 0; k < nIn; k++) {
        const ring = [];
        for (let j = 0; j < S; j++) {
          const last = k === nIn - 1;
          const ja = last ? 0 : (rng() - 0.5) * 0.55;
          const a = ((j + ja + (k % 2) * 0.5) / S) * TAU;
          const G = edgeR(a);
          const rr0 = (G - INNER) * IN[k] * (last ? 1 : 1 + (rng() - 0.5) * 0.06);
          const x = Math.cos(a) * rr0, z = Math.sin(a) * rr0;
          ring.push([x, hills(x, z), z]);
        }
        rings.push(ring);
      }
      // Zufallsfolge wie beim früheren, feineren Gitter fortsetzen (7 Innenringe à 56 Segmente):
      // Klippen-Brocken und Ufersteine bleiben an ihren gewohnten Plätzen.
      for (let k = (nIn - 1) * S * 2, n = 7 * (o.segments || 56) * 2; k < n; k++) rng();
      // Stationen bis 1.9 unter Wasser (tiefer ist das Meer undurchsichtig; surfaceAt kennt alle 13)
      const nSt = 12;
      for (let s = 0; s < nSt; s++) rings.push([]);
      for (let j = 0; j < S; j++) {
        const a = (j / S) * TAU;
        const st = stations(a);
        const ca = Math.cos(a), sa = Math.sin(a);
        for (let s = 0; s < nSt; s++) {
          let [r, y] = st[s];
          if (s === 3 || s === 4) r += (sx.noise(j * 0.7, s * 3.1) * 0.06); // Fels unregelmäßig
          rings[nIn + s].push([ca * r, y, sa * r]);
        }
      }
      const center = [0, hills(0, 0), 0];

      /* Farben je Band (Ring i → i+1) */
      const tmpC = new T.Color();
      function grassAt(x, z, out) {
        const n1 = sx.noise(x * 0.32 + 11, z * 0.32 - 4);
        const n2 = sx.noise(x * 0.8 - 7, z * 0.8 + 5);
        out.copy(col.grass).lerp(col.grassLight, smooth(0.0, 0.7, n1) * 0.85);
        out.lerp(col.grassDark, smooth(0.25, 0.9, n2) * 0.5);
        return out;
      }
      function bandColor(i, x, z, a, out) {
        const c = cliffK(a);
        const rockK = smooth(0.22, 0.5, c);
        const st = i - (nIn - 1); // 0 = letzter Innenring → L1
        if (st < 0) return grassAt(x, z, out);
        switch (st) {
          case 0: return grassAt(x, z, out).lerp(col.grassLight, 0.15);
          case 1: return grassAt(x, z, out).lerp(col.grassLight, 0.45);
          case 2: return out.copy(col.grassDark).multiplyScalar(0.95);
          case 3: { // Fels oben (Schichten)
            const strata = 0.5 + 0.5 * Math.sin(a * 9 + sx.noise(a * 2, 1.3) * 2);
            tmpC.copy(col.cliffLight).lerp(col.cliff, strata);
            return out.copy(col.grassDark).lerp(col.sandShade, 0.35).lerp(tmpC, rockK);
          }
          case 4: return out.copy(col.sandShade).lerp(col.cliffDark, rockK);
          case 5: return out.copy(col.sandShade).lerp(col.sand, 0.35);
          case 6: return out.copy(col.sand);
          case 7: return out.copy(col.sand).lerp(col.sandWet, 0.25);
          case 8: return out.copy(col.sandWet);
          case 9: return out.copy(col.u1);
          case 10: return out.copy(col.u2);
          case 11: return out.copy(col.u3);
          default: return out.copy(col.u4);
        }
      }

      const pos = [];
      const cols = [];
      const cA = new T.Color();
      const jr = W.rng(seedOf(seed, 9));
      function tri(p1, p2, p3, color) {
        pos.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
        const j = 1 + (jr() * 2 - 1) * 0.035;
        for (let k = 0; k < 3; k++) cols.push(color.r * j, color.g * j, color.b * j);
      }
      function band(i) {
        const A0 = rings[i], B0 = rings[i + 1];
        for (let j = 0; j < S; j++) {
          const j1 = (j + 1) % S;
          const a = A0[j], b = A0[j1], c = B0[j], d = B0[j1];
          const mx = (a[0] + b[0] + c[0] + d[0]) / 4, mz = (a[2] + b[2] + c[2] + d[2]) / 4;
          bandColor(i, mx, mz, Math.atan2(mz, mx), cA);
          // Diagonale abwechselnd (gleichmäßigere Facetten)
          if ((i + j) % 2) { tri(a, b, d, cA); tri(a, d, c, cA); } else { tri(a, b, c, cA); tri(b, d, c, cA); }
        }
      }
      const toGeo = (from) => {
        const t = new T.BufferGeometry();
        t.setAttribute('position', new T.Float32BufferAttribute(pos.slice(from), 3));
        t.setAttribute('color', new T.Float32BufferAttribute(cols.slice(from), 3));
        t.setAttribute('uv', new T.BufferAttribute(new Float32Array(((pos.length - from) / 3) * 2), 2));
        t.computeVertexNormals();
        return t;
      };
      // Zuerst der Rand (Wiesenkante bis Klippenfuß): nur er wirft Schatten – die flache Wiese
      // und der Strand zeigen zur Sonne und fallen im Schatten-Pass ohnehin weg.
      const EDGE0 = nIn - 1, EDGE1 = nIn + 5;
      for (let i = EDGE0; i < EDGE1; i++) band(i);
      const edgeGeo = toGeo(0);
      const mark = pos.length;
      // Fächer in der Mitte, Wiese, Strand und Unterwasser-Sockel
      for (let j = 0; j < S; j++) {
        const p1 = rings[0][j], p2 = rings[0][(j + 1) % S];
        grassAt((p1[0] + p2[0]) / 3, (p1[2] + p2[2]) / 3, cA);
        tri(center, p2, p1, cA);
      }
      for (let i = 0; i < rings.length - 1; i++) if (i < EDGE0 || i >= EDGE1) band(i);
      const restGeo = toGeo(mark);

      /* Felsbrocken in Klippen und Steine am Ufer */
      const P = new Parts();
      P.addRaw(edgeGeo);
      let castVerts = edgeGeo.attributes.position.count;
      for (let i = 0, placed = 0; i < 10 && placed < 4; i++) {
        const a = rng() * TAU;
        const c = cliffK(a);
        if (c < 0.6) continue;
        placed++;
        const st = stations(a);
        const r = st[3][0] + 0.05, y = st[3][1];
        const s = 0.28 + rng() * 0.2;
        const bg = xf(geo.blob(s, { seed: seed * 31 + i, noise: 0.22, sy: 0.8 }), [Math.cos(a) * r, y, Math.sin(a) * r], [0, rng() * TAU, 0]);
        P.add(bg, col.cliff, { grad: [0.72, 1.08], jitter: 0.06, seed: i });
        castVerts += bg.index ? bg.index.count : bg.attributes.position.count;
      }
      P.addRaw(restGeo);
      const nStones = o.stones == null ? 5 : o.stones;
      for (let i = 0; i < nStones; i++) {
        const a = rng() * TAU;
        const r = shoreR(a) - 0.25 + rng() * 0.6;
        const s = 0.22 + rng() * 0.3;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        P.add(xf(geo.blob(s, { seed: seed * 17 + i, noise: 0.22, sy: 0.7, detail: s > 0.4 ? 1 : 0 }), [x, surfaceAt(x, z) + s * 0.2, z], [0, rng() * TAU, 0]), kit.mix(col.cliff, '#9a8c80', rng() * 0.6), { grad: [0.7, 1.08], jitter: 0.06, seed: i + 5 });
      }
      const group = new T.Group();
      group.name = 'islandBase';
      P.build(group);
      const mesh = group.children[0];
      mesh.name = 'terrain';
      mesh.geometry.userData.castCount = castVerts; // Schatten nur vom Rand und den Klippen-Brocken (kit.merge)
      mesh.geometry.userData.terrain = true;
      group.userData.groundAt = surfaceAt; // kit.merge entfernt damit verdeckte Dreiecke unter dem Boden
      if (o.shadow === false) mesh.castShadow = false;

      /* belegte Plätze */
      const occupied = [];
      const rngCache = new Map();
      const base = {
        group, mesh, top: H, radius: R, grassRadius: G0, seed,
        surfaceAt,
        edgeRadius: edgeR,
        shoreRadius: shoreR,
        keep(x, z, r) { occupied.push({ x, z, r }); },
        isOnGrass(x, z, margin = 0) { return Math.hypot(x, z) <= edgeR(Math.atan2(z, x)) - 0.15 - margin; },
        randomPointOnGrass(r, margin = 0.5) {
          let rr = r;
          if (typeof rr !== 'function') {
            const key = r == null ? '_' : r;
            rr = rngCache.get(key);
            if (!rr) rngCache.set(key, (rr = r == null ? rng : W.rng(seedOf(r, 5))));
          }
          let x = 0, z = 0;
          for (let tries = 0; tries < 40; tries++) {
            const a = rr() * TAU;
            const rmax = Math.max(0.2, edgeR(a) - 0.2 - margin);
            const rad = Math.sqrt(rr()) * rmax;
            x = Math.cos(a) * rad; z = Math.sin(a) * rad;
            let ok = true;
            for (const q of occupied) if (Math.hypot(x - q.x, z - q.z) < q.r + margin * 0.5) { ok = false; break; }
            if (ok) break;
          }
          return new T.Vector3(x, surfaceAt(x, z), z);
        },
        place(obj, x, z, po = {}) {
          obj.position.set(x, surfaceAt(x, z) + (po.y || 0), z);
          if (po.rotY != null) obj.rotation.y = po.rotY;
          group.add(obj);
          let k = po.keep;
          if (k == null) {
            const box = new T.Box3().setFromObject(obj);
            k = box.isEmpty() ? 0.4 : Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * 0.42;
          }
          if (k > 0) occupied.push({ x, z, r: k });
          return obj;
        },
        shore(a, out = 0) {
          const r = shoreR(a) + out;
          return { x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r, rotY: -a };
        },
        beach(a, t = 0.5) {
          const st = stations(a);
          const r = lerp(st[5][0], st[8][0], t);
          const x = Math.cos(a) * r, z = Math.sin(a) * r;
          return new T.Vector3(x, surfaceAt(x, z), z);
        },
      };
      return base;
    };

    /* ==================================================================
       PFLANZEN
       ================================================================== */
    kit.tree = function (o = {}) {
      const type = o.type || 'round';
      const rng = W.rng(seedOf(o.seed == null ? 1 : o.seed, 2));
      const P = new Parts();
      const trunk = o.trunk || (type === 'blossom' ? '#9a6a4a' : C.wood);
      const sd = (i) => seedOf(o.seed || 1, 50 + i);
      const lean = o.lean == null ? (rng() - 0.5) * 0.16 : o.lean;
      if (type === 'pine') {
        P.add(xf(new T.CylinderGeometry(0.09, 0.15, 0.75, 7, 1, true), [0, 0.37, 0]), kit.shade(trunk, 0.9), { grad: [0.65, 1] });
        const green = o.color || C.pine;
        const tiers = 3 + (rng() < 0.45 ? 1 : 0);
        let y = 0.45, r = 1.0, h = 1.15;
        for (let i = 0; i < tiers; i++) {
          const g = wobble(new T.ConeGeometry(r, h, 8, 1), 0.06, sd(i), true);
          xf(g, [lean * y * 0.3, y + h / 2, 0], [0, rng() * TAU, 0]);
          P.add(g, kit.shade(green, 1 + i * 0.06), { grad: [0.62, 1.12], jitter: 0.05, seed: sd(i) });
          y += h * 0.5; r *= 0.74; h *= 0.84;
        }
      } else if (type === 'palm') {
        const lod = !!o.lod; // fern (Inselchen): gröberer Stamm und Wedel
        const N = lod ? 5 : 7, hgt = 2.7 * (0.9 + rng() * 0.2);
        const bend = (o.lean == null ? 0.35 + rng() * 0.3 : o.lean * 3) * (rng() < 0.5 ? -1 : 1);
        const pt = (t) => new T.Vector3(bend * t * t, t * hgt, bend * 0.3 * t * t);
        for (let i = 0; i < N; i++) {
          const a = pt(i / N), b = pt((i + 1) / N);
          const len = a.distanceTo(b);
          const r0 = 0.17 - i * 0.012 * (7 / N), r1 = r0 - 0.03 * (7 / N);
          const g = new T.CylinderGeometry(r1 + 0.012, r0, len * 1.04, lod ? 5 : 7, 1, true); // Deckel liegen verdeckt im Stamm
          g.translate(0, len / 2, 0);
          const dir = b.clone().sub(a).normalize();
          const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
          g.applyQuaternion(q).translate(a.x, a.y, a.z);
          P.add(g, i % 2 ? kit.shade(trunk, 1.08) : kit.shade(trunk, 0.92), { grad: [0.85, 1.05] });
        }
        const top = pt(1);
        const leaf = o.color || C.palm;
        const nL = 7;
        for (let i = 0; i < nL; i++) {
          const ang = (i / nL) * TAU + rng() * 0.4;
          const L = 1.35 + rng() * 0.35;
          const droop = 0.75 + rng() * 0.35;
          const seg = lod ? 4 : 7, posA = [], colA = [];
          const lc = toColor(kit.shade(leaf, 0.92 + rng() * 0.16)), mid = lc.clone().multiplyScalar(0.72);
          const ptL = (t, side) => {
            const w = 0.3 * Math.sin(PI * Math.pow(t, 0.75)) * side;
            const x = t * L, y = Math.sin(t * PI * 0.55) * 0.32 - t * t * droop;
            return [x, y - Math.abs(w) * 0.22, w];
          };
          for (let s = 0; s < seg; s++) {
            const t0 = s / seg, t1 = (s + 1) / seg;
            const c0 = ptL(t0, 0), c1 = ptL(t1, 0);
            c0[1] += 0.04; c1[1] += 0.04;
            const l0 = ptL(t0, -1), l1 = ptL(t1, -1), r0 = ptL(t0, 1), r1 = ptL(t1, 1);
            posA.push(...c0, ...l0, ...l1, ...c0, ...l1, ...c1, ...c0, ...r1, ...r0, ...c0, ...c1, ...r1);
            for (let k = 0; k < 12; k++) { const isMid = k === 0 || k === 3 || k === 5 || k === 6 || k === 9 || k === 10; const cc = isMid ? mid : lc; colA.push(cc.r, cc.g, cc.b); }
          }
          const g = new T.BufferGeometry();
          g.setAttribute('position', new T.Float32BufferAttribute(posA, 3));
          g.setAttribute('color', new T.Float32BufferAttribute(colA, 3));
          g.setAttribute('uv', new T.BufferAttribute(new Float32Array(posA.length / 3 * 2), 2));
          xf(g, [top.x, top.y - 0.02, top.z], [0, ang, (rng() - 0.5) * 0.25]);
          g.computeVertexNormals();
          P.addRaw(g, 'matteDouble');
        }
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * TAU + 0.4;
          P.add(xf(new T.IcosahedronGeometry(0.12, 0), [top.x + Math.cos(a) * 0.14, top.y - 0.14, top.z + Math.sin(a) * 0.14]), '#7a5233', { grad: [0.7, 1.1] });
        }
      } else {
        // round / fruit / blossom
        const th = 1.15 + rng() * 0.25;
        // Stamm und Ast ohne Deckel (unten im Boden, oben in der Krone verborgen)
        P.add(xf(new T.CylinderGeometry(0.11, 0.18, th, 7, 1, true), [lean * 0.5, th / 2, 0], [0, 0, -lean]), trunk, { grad: [0.6, 1.0] });
        P.add(xf(new T.CylinderGeometry(0.04, 0.07, 0.55, 5, 1, true), [0.18, th * 0.72, 0.05], [0.2, 0, -0.9]), trunk, { grad: [0.8, 1] });
        const isBlossom = type === 'blossom';
        const base = o.color || (isBlossom ? C.blossom : C.leaf);
        const cy = th + 0.62;
        const cx = lean * th;
        const blobs = [[cx, cy, 0, 0.92], [cx + 0.62, cy - 0.25, 0.18, 0.6], [cx - 0.58, cy - 0.18, -0.12, 0.64], [cx + 0.1, cy + 0.55, -0.1, 0.6], [cx - 0.15, cy - 0.3, 0.55, 0.55]];
        const nb = 3 + Math.floor(rng() * 3);
        const range = [cy - 0.95, cy + 1.15];
        const inner = []; // sichere Innenkugeln der Kleckse (Rauschen 0.16, sy 0.92) → verdeckte Dreiecke weg
        for (let i = 0; i < nb; i++) {
          const b = blobs[i];
          const s = b[3] * (0.9 + rng() * 0.2);
          inner.push([b[0], b[1], b[2], s * 0.74]);
          const g = geo.blob(s, { seed: sd(i), noise: 0.16, sy: 0.92 });
          xf(g, [b[0], b[1], b[2]], [rng(), rng() * TAU, 0]);
          const shadeK = isBlossom ? (i % 2 ? 1.04 : 0.97) : 0.92 + rng() * 0.16;
          P.add(g, kit.shade(base, shadeK), { grad: isBlossom ? [0.78, 1.1] : [0.6, 1.16], jitter: 0.05, seed: sd(i + 9), range });
        }
        if (type === 'fruit' || (isBlossom && o.fruitColor)) {
          const fc = o.fruitColor || C.red;
          const nf = 6 + Math.floor(rng() * 4);
          for (let i = 0; i < nf; i++) {
            const a = rng() * TAU, el = (rng() * 0.9 - 0.25);
            const r = 0.9;
            const x = cx + Math.cos(a) * Math.cos(el) * r, y = cy + Math.sin(el) * r * 0.85, z = Math.sin(a) * Math.cos(el) * r;
            P.add(xf(new T.IcosahedronGeometry(0.12, 0), [x, y, z], [rng(), rng(), 0]), fc, { gloss: true, grad: [0.75, 1.12] });
          }
        }
        if (isBlossom) {
          for (let i = 0; i < 7; i++) {
            const a = rng() * TAU, el = rng() * 1.1 - 0.2;
            const x = cx + Math.cos(a) * Math.cos(el) * 0.95, y = cy + Math.sin(el) * 0.85, z = Math.sin(a) * Math.cos(el) * 0.95;
            P.add(xf(new T.IcosahedronGeometry(0.07, 0), [x, y, z], [rng(), rng(), 0]), '#ffe6f1', { grad: [0.95, 1.05] });
          }
        }
        P.cullInside(inner);
      }
      const g = P.build();
      g.name = 'tree-' + type;
      if (o.scale) g.scale.setScalar(o.scale);
      return g;
    };

    kit.bush = function (o = {}) {
      const rng = W.rng(seedOf(o.seed == null ? 1 : o.seed, 3));
      const s = o.size || 1;
      const P = new Parts();
      const base = o.color || C.leaf;
      const n = 3 + Math.floor(rng() * 2);
      const inner = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + rng();
        const d = i === 0 ? 0 : 0.32;
        const r = (i === 0 ? 0.48 : 0.34 + rng() * 0.08) * s;
        const g = geo.blob(r, { seed: seedOf(o.seed || 1, 60 + i), noise: 0.16, sy: 0.85 });
        xf(g, [Math.cos(a) * d * s, r * 0.72, Math.sin(a) * d * s], [0, rng() * TAU, 0]);
        inner.push([Math.cos(a) * d * s, r * 0.72, Math.sin(a) * d * s, r * 0.69]); // sichere Innenkugel (Rauschen, sy 0.85)
        P.add(g, kit.shade(base, 0.92 + rng() * 0.16), { grad: [0.6, 1.14], jitter: 0.05, seed: i + 3, range: [0, 0.95 * s] });
      }
      if (o.berries) {
        for (let i = 0; i < 8; i++) {
          const a = rng() * TAU, el = rng() * 0.9;
          const r = 0.5 * s;
          P.add(xf(new T.IcosahedronGeometry(0.06 * s, 0), [Math.cos(a) * Math.cos(el) * r, 0.42 * s + Math.sin(el) * r * 0.75, Math.sin(a) * Math.cos(el) * r]), o.berries, { gloss: true, grad: [0.85, 1.1] });
        }
      }
      P.cullInside(inner);
      const g = P.build();
      g.name = 'bush';
      return g;
    };

    /** Flacher Blütenstern mit 5 Blättern (20 Dreiecke), Mitte im Ursprung. */
    function flowerHead(r) {
      const pos = [];
      const rim = [];
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; const rr2 = i % 2 ? r * 0.42 : r; rim.push([Math.cos(a) * rr2, (i % 2 ? 0.006 : -0.012), Math.sin(a) * rr2]); }
      const top = [0, 0.022, 0], bot = [0, -0.02, 0];
      for (let i = 0; i < 10; i++) {
        const p = rim[i], q = rim[(i + 1) % 10];
        pos.push(...top, ...q, ...p, ...bot, ...p, ...q);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }
    geo.flowerHead = flowerHead;
    kit.flower = function (color = C.pink, o = {}) {
      const s = o.scale || 1;
      const P = new Parts();
      P.add(xf(new T.CylinderGeometry(0.014, 0.018, 0.34, 3, 1, true), [0, 0.17, 0]), C.leafDark, { grad: [0.8, 1.1] });
      P.add(xf(new T.ConeGeometry(0.045, 0.13, 3), [0.05, 0.1, 0], [0, 0, -1.0], [1, 1, 0.4]), C.leaf, {});
      P.add(xf(flowerHead(0.11), [0, 0.35, 0], [0.15, 0, 0]), color, { grad: [0.85, 1.08] });
      P.add(xf(new T.ConeGeometry(0.035, 0.04, 5), [0, 0.375, 0]), '#ffd23f', { gloss: true });
      const g = P.build(null, { castShadow: false });
      g.name = 'flower';
      if (s !== 1) g.scale.setScalar(s);
      return g;
    };

    kit.mushroom = function (o = {}) {
      const s = o.size || 1;
      const rng = W.rng(seedOf(o.seed == null ? 1 : o.seed, 4));
      const P = new Parts();
      const pts = [[0.0, 0], [0.11, 0], [0.12, 0.05], [0.095, 0.2], [0.085, 0.34], [0, 0.34]].map((p) => new T.Vector2(p[0] * s, p[1] * s));
      P.add(new T.LatheGeometry(pts, 7), '#fff1dc', { grad: [0.8, 1.04] });
      const cap = new T.SphereGeometry(0.26 * s, 10, 4, 0, TAU, 0, PI / 2);
      cap.scale(1, 0.72, 1).translate(0, 0.3 * s, 0);
      P.add(cap, o.color || C.red, { grad: [0.78, 1.1], gloss: true });
      P.add(xf(new T.CylinderGeometry(0.25 * s, 0.12 * s, 0.04 * s, 10, 1, true), [0, 0.3 * s, 0]), '#f3dcc0', { grad: [0.85, 1] });
      for (let i = 0; i < 5; i++) {
        const a = rng() * TAU, el = 0.35 + rng() * 0.75;
        const x = Math.cos(a) * Math.cos(el) * 0.25 * s, y = 0.3 * s + Math.sin(el) * 0.185 * s, z = Math.sin(a) * Math.cos(el) * 0.25 * s;
        const g = new T.OctahedronGeometry(0.035 * s, 0); // flacher Tupfen (8 Dreiecke genügen)
        const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(x, (y - 0.3 * s) / 0.72, z).normalize());
        g.scale(1, 0.35, 1).applyQuaternion(q).translate(x, y, z);
        P.add(g, '#ffffff', { grad: [0.95, 1.05] });
      }
      const g = P.build();
      g.name = 'mushroom';
      return g;
    };

    kit.rock = function (o = {}) {
      const s = o.size || 1;
      const sd = seedOf(o.seed == null ? 1 : o.seed, 6);
      const rng = W.rng(sd);
      const g = geo.blob(0.5 * s, { seed: sd, noise: 0.26, freq: 1.2, sy: 0.62 + rng() * 0.15, sx: 1 + rng() * 0.2 });
      g.translate(0, 0.2 * s, 0);
      const m = kit.mesh(g, o.color || kit.mix(C.rock, C.rockLight, rng() * 0.5), { grad: [0.68, 1.1], jitter: 0.06, seed: sd, top: o.moss ? '#6fc24f' : null, topFrom: 0.42 });
      m.name = 'rock';
      return m;
    };

    /* ---------------- Gräser & Blumen ---------------- */
    let tuftGeo = null;
    function getTuftGeo() {
      if (tuftGeo) return tuftGeo;
      const P = [];
      const r = W.rng(99);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + r() * 0.5;
        const h = 0.22 + r() * 0.16;
        const w = 0.045 + r() * 0.02;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute([-w, 0, 0, w, 0, 0, (r() - 0.5) * 0.06, h, 0], 3));
        g.computeVertexNormals();
        xf(g, [Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05], [0, -a + PI / 2 + (r() - 0.5) * 0.8, 0]);
        // nach außen neigen
        const p = g.attributes.position;
        p.setX(2, p.getX(2) + Math.cos(a) * 0.09); p.setZ(2, p.getZ(2) + Math.sin(a) * 0.09);
        g.computeVertexNormals();
        P.push(paint(g, '#ffffff', { grad: [0.5, 1.18], range: [0, 0.38] }));
      }
      tuftGeo = mergeGeos(P, false);
      tuftGeo.userData.shared = true;
      return tuftGeo;
    }
    /* Wiese: Grasbüschel und Blumen einer Insel stecken zusammen in EINEM Mesh (ein
       Draw-Call), Wind im Vertex-Shader (Wurzelpunkt je Eckpunkt in aRoot). Die Teile stehen
       in zufälliger Reihenfolge → für niedrigere Qualitätsstufen wird nur ein Anfangsstück
       gezeichnet (gleichmäßig ausgedünnt). */
    let meadowMat = null;
    function getMeadowMat() {
      if (meadowMat) return meadowMat;
      const m = mats.matteDouble.clone();
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uKitTime = U.time;
        sh.uniforms.uKitWind = U.wind;
        sh.vertexShader = 'uniform float uKitTime;\nuniform float uKitWind;\nattribute vec4 aRoot;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          {
            float hh = max(position.y - aRoot.y, 0.0) * aRoot.w;
            vec4 root = modelMatrix * vec4(aRoot.xyz, 1.0);
            float ph = root.x * 0.37 + root.z * 0.29;
            float sw = sin(uKitTime * 1.7 + ph) * 0.7 + sin(uKitTime * 2.9 + ph * 1.9) * 0.3;
            float k = hh * hh * 1.4 * uKitWind / max(aRoot.w, 0.05);
            transformed.x += sw * k;
            transformed.z += cos(uKitTime * 1.3 + ph * 1.3) * 0.5 * k;
          }`);
      };
      m.customProgramCacheKey = () => 'kit-wiese';
      m.name = 'kit-wiese';
      meadowMat = m;
      return m;
    }
    /** Dichte der Wiese je Qualitätsstufe (Anteil der Büschel/Blumen) … */
    const MEADOW_DENSITY = { high: 1, medium: 0.8, low: 0.45 };
    /** … und nach Entfernung: ab 60 Einheiten dünner, ab 110 nur noch gut die Hälfte (Halme sind dort 2–3 px groß) */
    const meadowFar = (d) => (d <= 60 ? 1 : d >= 110 ? 0.55 : 1 - 0.45 * (d - 60) / 50);
    const meadows = [];
    function meadowDensity(md, far = 1) {
      const d = (MEADOW_DENSITY[W.quality] == null ? 1 : MEADOW_DENSITY[W.quality]) * far;
      const k = Math.max(0, Math.min(md.cum.length - 1, Math.round(d * (md.cum.length - 1))));
      if (md.k === k) return;
      md.k = k;
      md.mesh.geometry.setDrawRange(0, md.cum[k]);
    }
    W.onFrame(() => {
      const cam = W.camera;
      if (!cam || !meadows.length) return;
      const cp = cam.position;
      for (let i = 0; i < meadows.length; i++) {
        const md = meadows[i], e = md.mesh.matrixWorld.elements;
        const d = Math.hypot(e[12] - cp.x, e[13] - cp.y, e[14] - cp.z);
        meadowDensity(md, Math.round(meadowFar(d) * 20) / 20);
      }
    });
    function meadowOf(base) {
      if (!base._meadow) base._meadow = { items: [], mesh: null, cum: [0] };
      return base._meadow;
    }
    function rebuildMeadow(base) {
      const md = meadowOf(base);
      const items = md.items.slice().sort((p, q) => p.key - q.key);
      const geos = [];
      const cum = [0];
      const cc = new T.Color();
      items.forEach((it) => {
        const g = it.tpl.clone();
        g.applyMatrix4(it.m);
        const n = g.attributes.position.count;
        const col = g.attributes.color;
        for (let i = 0; i < n; i++) {
          cc.fromBufferAttribute(col, i);
          if (!it.petal) cc.multiply(it.c);
          else if (Math.min(cc.r, cc.g, cc.b) >= 0.985) cc.copy(it.c); // Blütenblätter (weiß) einfärben
          col.setXYZ(i, cc.r, cc.g, cc.b);
        }
        const root = new Float32Array(n * 4);
        for (let i = 0; i < n; i++) { root[i * 4] = it.x; root[i * 4 + 1] = it.y; root[i * 4 + 2] = it.z; root[i * 4 + 3] = 1 / it.s; }
        g.setAttribute('aRoot', new T.BufferAttribute(root, 4));
        geos.push(g);
        cum.push(cum[cum.length - 1] + n);
      });
      if (md.mesh) { md.mesh.geometry.dispose(); md.mesh.removeFromParent(); }
      if (!geos.length) return null;
      const geo = geos.length > 1 ? mergeGeos(geos, false) : geos[0];
      if (geos.length > 1) geos.forEach((g) => g.dispose());
      const mesh = new T.Mesh(geo, getMeadowMat());
      mesh.name = 'wiese';
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.userData.noMerge = true;
      geo.computeBoundingSphere();
      geo.boundingSphere.radius += 0.3;
      base.group.add(mesh);
      if (!md.mesh) meadows.push(md);
      md.mesh = mesh;
      md.cum = cum;
      md.k = -1;
      meadowDensity(md);
      return mesh;
    }
    let meadowSeq = 0;
    const _mm = new T.Object3D();
    function meadowItem(md, tpl, petal, color) {
      _mm.updateMatrix();
      md.items.push({ tpl, m: _mm.matrix.clone(), c: color.clone(), petal, x: _mm.position.x, y: _mm.position.y, z: _mm.position.z, s: _mm.scale.x, key: W.rng(9173 + (meadowSeq++) * 31)() });
    }
    kit.grassTufts = function (base, count = 60, seed = 1, o = {}) {
      const rng = W.rng(seedOf(seed, 7));
      const md = meadowOf(base);
      const tpl = getTuftGeo();
      const cBase = toColor(o.color || '#8fdc62');
      const cc = new T.Color();
      for (let i = 0; i < count; i++) {
        const p = base.randomPointOnGrass(rng, o.margin == null ? 0.25 : o.margin);
        _mm.position.set(p.x, p.y - 0.02, p.z);
        _mm.rotation.set(0, rng() * TAU, 0);
        _mm.scale.setScalar((0.75 + rng() * 0.6) * (o.scale || 1));
        cc.copy(cBase).multiplyScalar(0.85 + rng() * 0.3);
        meadowItem(md, tpl, false, cc);
      }
      return rebuildMeadow(base);
    };
    let flowerGeo = null;
    kit.flowers = function (base, count = 24, colors, seed = 1, o = {}) {
      colors = colors && colors.length ? colors : ['#ff7aa8', '#ffd23f', '#ffffff', '#b28dff', '#ff8a5c'];
      if (!flowerGeo) {
        // Blütenblätter exakt weiß → werden beim Aufbau mit der Blumenfarbe getönt.
        // Nur die Oberseite der Blüte, offene Kegel (die Wiese ist doppelseitig): 24 Dreiecke.
        const top = flowerHead(0.1);
        const tp = top.attributes.position;
        const headTop = new T.BufferGeometry(); // je Blatt-Segment nur das obere Dreieck
        const arr = [];
        for (let f = 0; f < tp.count; f += 6) for (let v = 0; v < 3; v++) arr.push(tp.getX(f + v), tp.getY(f + v), tp.getZ(f + v));
        headTop.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
        headTop.computeVertexNormals();
        flowerGeo = mergeGeos([
          paint(xf(headTop, [0, 0.3, 0], [0.18, 0, 0]), '#ffffff', { grad: [1, 1] }),
          paint(xf(new T.CylinderGeometry(0.012, 0.016, 0.3, 3, 1, true), [0, 0.15, 0]), C.leafDark, { grad: [0.8, 1.1] }),
          paint(xf(new T.ConeGeometry(0.04, 0.12, 3, 1, true), [0.045, 0.09, 0], [0, 0, -1.0], [1, 1, 0.4]), C.leaf, {}),
          paint(xf(new T.ConeGeometry(0.032, 0.035, 5, 1, true), [0, 0.33, 0]), '#ffcf3a', { grad: [0.95, 1.1] }),
        ], false);
        flowerGeo.userData.shared = true;
        top.dispose();
      }
      const rng = W.rng(seedOf(seed, 8));
      const md = meadowOf(base);
      const cc = new T.Color();
      // in kleinen Gruppen streuen (wirkt natürlicher)
      let cx = 0, cz = 0;
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) { const p = base.randomPointOnGrass(rng, 0.45); cx = p.x; cz = p.z; }
        let x = cx + (rng() - 0.5) * 0.7, z = cz + (rng() - 0.5) * 0.7;
        if (!base.isOnGrass(x, z, 0.1)) { x = cx; z = cz; }
        _mm.position.set(x, base.surfaceAt(x, z) - 0.01, z);
        _mm.rotation.set((rng() - 0.5) * 0.2, rng() * TAU, (rng() - 0.5) * 0.2);
        _mm.scale.setScalar((0.8 + rng() * 0.5) * (o.scale || 1));
        cc.set(colors[Math.floor(rng() * colors.length)]);
        meadowItem(md, flowerGeo, true, cc);
      }
      return rebuildMeadow(base);
    };

    /* ---------------- Weg ---------------- */
    kit.path = function (base, points, o = {}) {
      const rng = W.rng(seedOf(o.seed == null ? 1 : o.seed, 9));
      const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(p[0], 0, p[1])), false, 'centripetal');
      const len = curve.getLength();
      const P = new Parts();
      const width = o.width || 0.62;
      if ((o.style || 'stones') === 'sand') {
        const n = Math.max(2, Math.ceil(len / 0.25));
        const posA = [];
        const L = [], Rr = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
          const nx = -tg.z, nz = tg.x;
          const w = width * 0.5 * (1 + (rng() - 0.5) * 0.25);
          const lx = p.x + nx * w, lz = p.z + nz * w, rx = p.x - nx * w, rz = p.z - nz * w;
          L.push([lx, base.surfaceAt(lx, lz) + 0.03, lz]);
          Rr.push([rx, base.surfaceAt(rx, rz) + 0.03, rz]);
        }
        for (let i = 0; i < n; i++) posA.push(...L[i], ...Rr[i], ...L[i + 1], ...Rr[i], ...Rr[i + 1], ...L[i + 1]);
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(posA, 3));
        g.computeVertexNormals();
        P.add(g, o.color || '#f1d39c', { grad: [1, 1], jitter: 0.04, seed: 3 });
      } else {
        const sp = o.spacing || 0.62;
        const n = Math.max(1, Math.floor(len / sp));
        for (let i = 0; i <= n; i++) {
          const t = n ? i / n : 0;
          const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
          const off = (rng() - 0.5) * 0.16;
          const x = p.x - tg.z * off, z = p.z + tg.x * off;
          const r = width * 0.5 * (0.8 + rng() * 0.3);
          const g = geo.cyl(r, r * 1.06, 0.09, 7);
          xf(g, [x, base.surfaceAt(x, z) + 0.02, z], [0, rng() * TAU, 0], [1, 1, 0.72 + rng() * 0.2]);
          P.add(g, kit.mix(o.color || C.stone, '#c2b4a4', rng() * 0.6), { grad: [0.85, 1.05] });
          base.keep(x, z, r * 0.9);
        }
      }
      const grp = P.build(null, { castShadow: false }); // flach: kein Schatten
      grp.name = 'path';
      base.group.add(grp);
      return grp;
    };

    /* ==================================================================
       BAUTEN & DINGE
       ================================================================== */
    kit.fence = function (points, o = {}) {
      const P = new Parts();
      const h = o.height || 0.7;
      const style = o.style || 'picket';
      const colr = o.color || (style === 'picket' ? C.cream : C.wood);
      const yAt = (x, z) => (o.base ? o.base.surfaceAt(x, z) : 0);
      const pts = points.map((p) => new T.Vector2(p[0], p[1]));
      if (o.closed && pts.length > 2) pts.push(pts[0].clone());
      const step = style === 'picket' ? 0.24 : 1.0;
      for (let s = 0; s < pts.length - 1; s++) {
        const a = pts[s], b = pts[s + 1];
        const d = a.distanceTo(b);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const n = Math.max(1, Math.round(d / step));
        for (let i = (s === 0 ? 0 : 1); i <= n; i++) {
          const t = i / n;
          const x = lerp(a.x, b.x, t), z = lerp(a.y, b.y, t);
          const y = yAt(x, z);
          if (style === 'picket') {
            P.add(xf(geo.box(0.11, h * 0.86, 0.05), [x, y + h * 0.43 - 0.05, z], [0, -ang, 0]), colr, { grad: [0.78, 1.04] });
            P.add(xf(new T.ConeGeometry(0.078, 0.12, 4, 1, true), [x, y + h * 0.86 + 0.01, z], [0, -ang + PI / 4, 0], [1, 1, 0.45]), colr, { grad: [0.95, 1.05] });
          } else {
            P.add(xf(new T.CylinderGeometry(0.06, 0.07, h + 0.1, 6, 1, true), [x, y + (h + 0.1) / 2 - 0.08, z]), colr, { grad: [0.7, 1.05] }); // oben die Kappe, unten der Boden
            P.add(xf(geo.cyl(0.075, 0.075, 0.04, 6), [x, y + h, z]), kit.shade(colr, 1.1), {});
          }
        }
        // Querlatten
        const ya = yAt(a.x, a.y), yb = yAt(b.x, b.y);
        const rails = style === 'picket' ? [0.28, 0.6] : [0.32, 0.72];
        rails.forEach((f) => {
          const g = geo.box(d, 0.06, 0.04);
          const mx = (a.x + b.x) / 2, mz = (a.y + b.y) / 2;
          const slope = Math.atan2(yb - ya, d);
          xf(g, [mx, (ya + yb) / 2 + h * f, mz], [0, -ang, slope], null);
          P.add(g, style === 'picket' ? kit.shade(colr, 0.94) : kit.shade(colr, 0.9), { grad: [0.9, 1] });
        });
      }
      const g = P.build();
      g.name = 'fence';
      return g;
    };

    kit.house = function (o = {}) {
      const wall = o.wall || C.cream;
      const roof = o.roof || C.roof;
      const door = o.door || '#8a5a3c';
      const P = new Parts();
      const W2 = 0.9, D2 = 0.8, wallH = 1.25, plinth = 0.18;
      P.add(xf(geo.roundBox(2.0, plinth, 1.8, 0.05, 1), [0, plinth / 2, 0]), C.stone, { grad: [0.75, 1] });
      P.add(xf(geo.roundBox(W2 * 2, wallH, D2 * 2, 0.07), [0, plinth + wallH / 2, 0]), wall, { grad: [0.82, 1.04] });
      // Giebel (Dreiecksprisma)
      const gh = 0.78;
      const tri = new T.Shape();
      tri.moveTo(-W2, 0); tri.lineTo(W2, 0); tri.lineTo(0, gh); tri.lineTo(-W2, 0);
      const gable = new T.ExtrudeGeometry(tri, { depth: D2 * 2 - 0.04, bevelEnabled: false });
      gable.translate(0, plinth + wallH - 0.02, -D2 + 0.02);
      P.add(gable, wall, { grad: [0.95, 1.02] });
      // Dachflächen
      const ang = Math.atan2(gh, W2);
      const slopeLen = Math.hypot(W2, gh);
      const L = slopeLen + 0.3;
      const ridge = new T.Vector2(0, plinth + wallH - 0.02 + gh);
      [-1, 1].forEach((sgn) => {
        const g = geo.roundBox(L, 0.15, D2 * 2 + 0.42, 0.05, 1);
        const dir = new T.Vector2(sgn * Math.cos(ang), -Math.sin(ang));
        const nrm = new T.Vector2(sgn * Math.sin(ang), Math.cos(ang));
        const c = ridge.clone().add(dir.clone().multiplyScalar(L / 2 - 0.05)).add(nrm.multiplyScalar(0.075));
        xf(g, [c.x, c.y, 0], [0, 0, -sgn * ang]);
        P.add(g, roof, { grad: [0.8, 1.08] });
      });
      P.add(xf(geo.cyl(0.09, 0.09, D2 * 2 + 0.46, 6), [0, ridge.y + 0.1, 0], [PI / 2, 0, 0]), kit.shade(roof, 0.85), {});
      if (o.chimney !== false) {
        P.add(xf(geo.roundBox(0.28, 0.62, 0.28, 0.04, 1), [0.48, ridge.y - 0.05, -0.32]), '#d9907a', { grad: [0.8, 1.05] });
        P.add(xf(geo.roundBox(0.34, 0.08, 0.34, 0.03, 1), [0.48, ridge.y + 0.28, -0.32]), '#c47c66', {});
      }
      // Tür
      const fz = D2 + 0.005;
      P.add(xf(geo.roundBox(0.5, 0.82, 0.08, 0.05), [0, plinth + 0.41, fz]), kit.shade(door, 1.0), { grad: [0.85, 1.05] });
      P.add(xf(geo.roundBox(0.6, 0.06, 0.1, 0.02, 1), [0, plinth + 0.86, fz + 0.01]), C.cream, {});
      P.add(xf(new T.IcosahedronGeometry(0.035, 0), [0.15, plinth + 0.4, fz + 0.05]), C.gold, { gloss: true });
      P.add(xf(geo.roundBox(0.7, 0.08, 0.32, 0.03, 1), [0, 0.04, D2 + 0.22]), C.stone, {});
      // Fenster
      const win = (x, y, z, ry) => {
        const fr = geo.roundBox(0.46, 0.46, 0.07, 0.04, 1);
        P.add(xf(fr, [x, y, z], [0, ry, 0]), C.white, { grad: [0.9, 1.02] });
        const gl = geo.box(0.34, 0.34, 0.06);
        P.addRaw(paint(xf(gl, [x + Math.sin(ry) * 0.02, y, z + Math.cos(ry) * 0.02], [0, ry, 0]), '#ffffff', { grad: [1, 1] }), 'window');
        P.add(xf(geo.box(0.04, 0.34, 0.07), [x + Math.sin(ry) * 0.035, y, z + Math.cos(ry) * 0.035], [0, ry, 0]), C.white, {});
        P.add(xf(geo.box(0.34, 0.04, 0.07), [x + Math.sin(ry) * 0.035, y, z + Math.cos(ry) * 0.035], [0, ry, 0]), C.white, {});
        P.add(xf(geo.roundBox(0.52, 0.06, 0.14, 0.02, 1), [x + Math.sin(ry) * 0.04, y - 0.26, z + Math.cos(ry) * 0.04], [0, ry, 0]), kit.shade(roof, 0.95), {});
      };
      win(-0.58, plinth + 0.66, fz + 0.01, 0);
      win(0.58, plinth + 0.66, fz + 0.01, 0);
      win(W2 + 0.01, plinth + 0.66, 0, PI / 2);
      win(-W2 - 0.01, plinth + 0.66, 0, -PI / 2);
      const g = P.build();
      g.name = 'house';
      if (o.scale) g.scale.setScalar(o.scale);
      return g;
    };

    kit.sign = function (text, o = {}) {
      text = String(text == null ? '' : text);
      const meas = document.createElement('canvas').getContext('2d');
      meas.font = `600 100px ${FONT_NUM}`;
      const tw = meas.measureText(text).width / 100;
      const h = 0.62;
      const w = o.width || clamp(tw * h * 0.62 + 0.55, 1.1, 3.8);
      const P = new Parts();
      const wood = C.wood;
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.055, 0.07, 1.25, 6), [s * (w / 2 - 0.2), 0.62, -0.02]), kit.shade(wood, 0.9), { grad: [0.65, 1.05] }));
      P.add(xf(geo.roundBox(w, h, 0.12, 0.05), [0, 1.05, 0]), wood, { grad: [0.82, 1.06] });
      const grp = P.build();
      const pw = w - 0.12, ph = h - 0.12;
      const cw = Math.min(1024, Math.round(256 * pw)), ch = Math.round(cw * ph / pw);
      const accent = o.color;
      const tex = canvasTexture(cw, ch, (g, cw2, ch2) => {
        const r = ch2 * 0.18;
        if (accent) {
          const gr = g.createLinearGradient(0, 0, 0, ch2);
          gr.addColorStop(0, kit.shade(accent, 1.12)); gr.addColorStop(1, kit.shade(accent, 0.9));
          g.fillStyle = gr; rr(g, 0, 0, cw2, ch2, r); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.25)'; rr(g, ch2 * 0.06, ch2 * 0.06, cw2 - ch2 * 0.12, ch2 * 0.18, ch2 * 0.09); g.fill();
        } else {
          g.fillStyle = '#e2b07a'; rr(g, 0, 0, cw2, ch2, r); g.fill();
          g.strokeStyle = 'rgba(120,70,30,0.18)'; g.lineWidth = Math.max(2, ch2 * 0.02);
          for (let i = 1; i < 4; i++) { g.beginPath(); const y = (ch2 * i) / 4 + Math.sin(i * 7) * 3; g.moveTo(ch2 * 0.1, y); g.bezierCurveTo(cw2 * 0.3, y - 6, cw2 * 0.6, y + 6, cw2 - ch2 * 0.1, y); g.stroke(); }
        }
        const px = fitFont(g, text, 600, FONT_NUM, Math.round(ch2 * 0.6), cw2 * 0.86);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const ty = ch2 / 2 + px * 0.05;
        if (accent) {
          g.lineJoin = 'round'; g.lineWidth = px * 0.16; g.strokeStyle = 'rgba(0,0,0,0.18)';
          g.strokeText(text, cw2 / 2, ty + px * 0.05);
          g.fillStyle = o.textColor || '#ffffff';
        } else {
          g.fillStyle = 'rgba(255,240,215,0.6)'; g.fillText(text, cw2 / 2, ty + px * 0.04);
          g.fillStyle = o.textColor || '#5a3416';
        }
        g.fillText(text, cw2 / 2, ty);
      });
      const pm = new T.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0 });
      const panel = new T.Mesh(new T.PlaneGeometry(pw, ph), pm);
      panel.position.set(0, 1.05, 0.062);
      panel.receiveShadow = true;
      grp.add(panel);
      if (o.back) {
        const back = panel.clone();
        back.rotation.y = PI;
        back.position.z = -0.062;
        grp.add(back);
      }
      grp.name = 'sign';
      return grp;
    };

    const flagMats = new Map();
    function flagMaterial(color) {
      const key = String(color);
      if (flagMats.has(key)) return flagMats.get(key);
      const m = new T.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, side: T.DoubleSide });
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uKitTime = U.time;
        sh.uniforms.uKitWind = U.wind;
        sh.vertexShader = 'uniform float uKitTime;\nuniform float uKitWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          {
            float k = uv.x;
            vec4 root = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float ph = root.x * 0.5 + root.z * 0.3;
            transformed.z += sin(uv.x * 6.5 - uKitTime * 5.0 + ph) * 0.09 * k * uKitWind;
            transformed.y += sin(uv.x * 4.0 - uKitTime * 3.2 + ph) * 0.025 * k * uKitWind;
          }`);
      };
      m.customProgramCacheKey = () => 'kit-flag';
      flagMats.set(key, m);
      return m;
    }
    kit.flag = function (color = C.red, o = {}) {
      const h = o.height || 2.2;
      const P = new Parts();
      P.add(xf(geo.cyl(0.035, 0.045, h, 6), [0, h / 2, 0]), '#eef2f6', { grad: [0.75, 1.05] });
      P.add(xf(new T.OctahedronGeometry(0.075, 1), [0, h + 0.04, 0]), C.gold, { gloss: true });
      P.add(xf(geo.cyl(0.1, 0.13, 0.12, 8), [0, 0.06, 0]), C.stone, {});
      const grp = P.build();
      const cg = new T.PlaneGeometry(0.85, 0.52, 10, 3);
      cg.translate(0.425 + 0.04, h - 0.32, 0);
      const cloth = new T.Mesh(cg, flagMaterial(color));
      cloth.castShadow = true;
      cloth.userData.noMerge = true;
      grp.add(cloth);
      grp.name = 'flag';
      return grp;
    };

    kit.lamp = function (o = {}) {
      const h = o.height || 1.9;
      const P = new Parts();
      const metal = C.metal;
      P.add(xf(geo.cyl(0.13, 0.17, 0.16, 8), [0, 0.08, 0]), metal, { grad: [0.8, 1.05] });
      P.add(xf(geo.cyl(0.04, 0.055, h - 0.4, 8), [0, (h - 0.4) / 2 + 0.1, 0]), metal, { grad: [0.85, 1.1] });
      P.add(xf(geo.cyl(0.09, 0.07, 0.06, 8), [0, h - 0.33, 0]), metal, {});
      P.add(xf(new T.ConeGeometry(0.2, 0.18, 4), [0, h + 0.02, 0], [0, PI / 4, 0]), metal, { grad: [0.9, 1.1] });
      P.add(xf(new T.IcosahedronGeometry(0.04, 0), [0, h + 0.13, 0]), C.gold, { gloss: true });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + PI / 4;
        P.add(xf(new T.CylinderGeometry(0.012, 0.012, 0.28, 4, 1, true), [Math.cos(a) * 0.105, h - 0.16, Math.sin(a) * 0.105]), metal, {});
      }
      P.addRaw(paint(xf(geo.cyl(0.09, 0.075, 0.26, 8), [0, h - 0.16, 0]), '#ffffff', { grad: [1, 1] }), 'glow');
      const g = P.build();
      const halo = kit.glowHalo(1.3);
      halo.position.set(0, h - 0.16, 0);
      g.add(halo);
      g.name = 'lamp';
      return g;
    };

    kit.bench = function (o = {}) {
      const wood = o.color || C.woodLight;
      const P = new Parts();
      for (let i = 0; i < 3; i++) P.add(xf(geo.roundBox(1.25, 0.05, 0.12, 0.02, 1), [0, 0.44, -0.12 + i * 0.14]), kit.shade(wood, 0.95 + i * 0.04), { grad: [0.9, 1.03] });
      for (let i = 0; i < 2; i++) P.add(xf(geo.roundBox(1.25, 0.11, 0.04, 0.02, 1), [0, 0.64 + i * 0.16, -0.25 - i * 0.03], [-0.18, 0, 0]), kit.shade(wood, 0.98), {});
      [-0.5, 0.5].forEach((x) => {
        P.add(xf(geo.roundBox(0.06, 0.44, 0.36, 0.02, 1), [x, 0.21, 0]), C.metal, { grad: [0.8, 1.05] });
        P.add(xf(geo.roundBox(0.06, 0.42, 0.05, 0.02, 1), [x, 0.66, -0.24], [-0.18, 0, 0]), C.metal, {});
      });
      const g = P.build();
      g.name = 'bench';
      return g;
    };

    kit.boat = function (color = C.red, o = {}) {
      const P = new Parts();
      const sh = new T.Shape();
      sh.moveTo(-0.95, -0.36);
      sh.lineTo(0.25, -0.42);
      sh.quadraticCurveTo(0.9, -0.38, 1.15, 0);
      sh.quadraticCurveTo(0.9, 0.38, 0.25, 0.42);
      sh.lineTo(-0.95, 0.36);
      sh.quadraticCurveTo(-1.06, 0, -0.95, -0.36);
      const hull = new T.ExtrudeGeometry(sh, { depth: 0.46, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 6 });
      hull.rotateX(-PI / 2);
      const p = hull.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        const k = 0.62 + 0.38 * smooth(-0.05, 0.3, y);
        p.setXYZ(i, p.getX(i) * (0.85 + 0.15 * k), y, p.getZ(i) * k);
      }
      hull.computeVertexNormals();
      hull.translate(0, -0.2, 0);
      // Rumpf: Farbe, oben weißer Streifen, Deck holzfarben
      const hg = paint(hull, color, { grad: [0.7, 1.05] });
      const hc = hg.attributes.color, hp = hg.attributes.position, hn = hg.attributes.normal;
      const white = toColor('#ffffff'), deck = toColor(C.woodLight);
      for (let i = 0; i < hp.count; i += 3) {
        let ny = 0, y = 0;
        for (let k = 0; k < 3; k++) { ny += hn.getY(i + k); y += hp.getY(i + k); }
        ny /= 3; y /= 3;
        let c = null;
        if (ny > 0.8 && y > 0.25) c = deck;
        else if (y > 0.2) c = white;
        if (c) for (let k = 0; k < 3; k++) hc.setXYZ(i + k, c.r * 0.97, c.g * 0.97, c.b * 0.97);
      }
      P.addRaw(hg);
      P.add(xf(geo.roundBox(0.12, 0.06, 0.66, 0.02, 1), [-0.25, 0.33, 0]), C.wood, {});
      if (o.sail !== false) {
        P.add(xf(geo.cyl(0.03, 0.04, 1.75, 6), [0.05, 1.18, 0]), C.woodDark, { grad: [0.8, 1.05] });
        P.add(xf(geo.cyl(0.022, 0.022, 0.95, 5), [-0.42, 0.56, 0], [0, 0, PI / 2]), C.woodDark, {});
        const ss = new T.Shape();
        ss.moveTo(0, 0); ss.lineTo(0, 1.45); ss.quadraticCurveTo(-0.45, 0.6, -0.86, 0.02); ss.lineTo(0, 0);
        const sail = new T.ExtrudeGeometry(ss, { depth: 0.03, bevelEnabled: false, curveSegments: 6 });
        sail.translate(0.02, 0.6, -0.015);
        P.add(sail, o.sailColor || '#fffaf0', { grad: [0.88, 1.04] });
        const fl = new T.Shape();
        fl.moveTo(0, 0); fl.lineTo(0.28, -0.08); fl.lineTo(0, -0.16); fl.lineTo(0, 0);
        P.add(xf(new T.ExtrudeGeometry(fl, { depth: 0.02, bevelEnabled: false }), [0.06, 2.05, -0.01]), color, {});
      }
      const g = P.build();
      g.name = 'boat';
      return g;
    };

    kit.lighthouse = function (o = {}) {
      const P = new Parts();
      const stripe = o.color || C.red;
      const H = 2.7, r0 = 0.66, r1 = 0.44, bands = 5;
      for (let i = 0; i < bands; i++) {
        const t0 = i / bands, t1 = (i + 1) / bands;
        const g = new T.CylinderGeometry(lerp(r0, r1, t1), lerp(r0, r1, t0), (H / bands) + 0.002, 12, 1, true); // Deckel innen verdeckt
        g.translate(0, 0.25 + (t0 + t1) / 2 * H, 0);
        P.add(g, i % 2 ? '#ffffff' : stripe, { grad: [0.9, 1.04] });
      }
      P.add(xf(geo.cyl(0.85, 0.95, 0.3, 12), [0, 0.15, 0]), C.stone, { grad: [0.75, 1.02] });
      P.add(xf(geo.cyl(0.66, 0.6, 0.12, 12), [0, H + 0.3, 0]), C.metal, { grad: [0.85, 1.05] });
      P.add(xf(new T.TorusGeometry(0.6, 0.022, 3, 16), [0, H + 0.62, 0], [PI / 2, 0, 0]), C.metal, {});
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; P.add(xf(geo.box(0.03, 0.3, 0.03), [Math.cos(a) * 0.6, H + 0.48, Math.sin(a) * 0.6], [0, -a, 0]), C.metal, {}); }
      P.addRaw(paint(xf(geo.cyl(0.32, 0.32, 0.5, 8), [0, H + 0.62, 0]), '#ffffff', { grad: [1, 1] }), 'glow');
      for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + PI / 8; P.add(xf(geo.cyl(0.025, 0.025, 0.5, 3), [Math.cos(a) * 0.33, H + 0.62, Math.sin(a) * 0.33]), C.metal, {}); }
      P.add(xf(new T.ConeGeometry(0.46, 0.5, 8), [0, H + 1.12, 0]), stripe, { grad: [0.8, 1.1] });
      P.add(xf(new T.IcosahedronGeometry(0.08, 1), [0, H + 1.42, 0]), C.gold, { gloss: true });
      P.add(xf(geo.roundBox(0.34, 0.55, 0.1, 0.06), [0, 0.55, r0 - 0.02]), '#6b4a35', {});
      P.add(xf(geo.roundBox(0.22, 0.26, 0.06, 0.03, 1), [0, 1.75, (lerp(r0, r1, 0.55)) - 0.01]), '#3b4a5a', {});
      const g = P.build();
      const halo = kit.glowHalo(2.6, '#ffe2a0');
      halo.position.set(0, H + 0.62, 0);
      g.add(halo);
      g.name = 'lighthouse';
      if (o.scale) g.scale.setScalar(o.scale);
      return g;
    };

    kit.pier = function (length = 4, o = {}) {
      const P = new Parts();
      const w = o.width || 1.05;
      const rng = W.rng(seedOf(o.seed || 1, 11));
      const n = Math.max(2, Math.round(length / 0.34));
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * (length / n);
        P.add(xf(geo.roundBox(length / n - 0.04, 0.07, w, 0.02, 1), [x, 0.45, (rng() - 0.5) * 0.04], [0, (rng() - 0.5) * 0.04, 0]), kit.shade(C.woodLight, 0.88 + rng() * 0.18), { grad: [0.9, 1.02] });
      }
      [-1, 1].forEach((s) => P.add(xf(geo.box(length, 0.1, 0.1), [length / 2, 0.36, s * (w / 2 - 0.1)]), C.woodDark, {}));
      const np = Math.max(2, Math.round(length / 1.3) + 1);
      for (let i = 0; i < np; i++) {
        const x = 0.15 + (i / (np - 1)) * (length - 0.3);
        [-1, 1].forEach((s) => P.add(xf(new T.CylinderGeometry(0.075, 0.085, 2.3, 6, 1, true), [x, -0.55, s * (w / 2 + 0.02)]), C.woodDark, { grad: [0.6, 1.05] }));
      }
      [-1, 1].forEach((s) => P.add(xf(geo.cyl(0.09, 0.09, 0.4, 7), [length - 0.12, 0.62, s * (w / 2 + 0.02)]), C.wood, { grad: [0.8, 1.05] }));
      const g = P.build();
      g.name = 'pier';
      return g;
    };

    /* ==================================================================
       LERN-REQUISITEN
       ================================================================== */
    /* Gemeinsamer Zeichen-Atlas (weiße Zeichen mit weichem Schatten) für alle Spielwürfel:
       Würfel-Körper (Vertex-Farbe) + Zeichen-Aufkleber (ein Material) → beim Zusammenführen
       kosten beliebig viele Würfel einer Insel nur zwei Draw-Calls. */
    const glyphs = { N: 8, px: 128, cells: new Map(), next: 0, tex: null, mat: null };
    const isNumGlyph = (ch) => /^[0-9+\-=×÷·:.,%<>?!]+$/.test(ch);
    function drawGlyph(g, ch, idx) {
      const cs = glyphs.px;
      const cx = (idx % glyphs.N) * cs, cy = Math.floor(idx / glyphs.N) * cs;
      g.clearRect(cx, cy, cs, cs);
      const num = isNumGlyph(ch);
      const px = fitFont(g, ch, 700, num ? FONT_NUM : FONT_READ, Math.round(cs * (ch.length > 1 ? 0.56 : 0.72)), cs * 0.82);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const tx = cx + cs / 2, ty = cy + cs / 2 + px * (num ? 0.05 : 0.03);
      g.fillStyle = 'rgba(0,0,0,0.26)';
      g.fillText(ch, tx + px * 0.035, ty + px * 0.055);
      g.fillStyle = '#ffffff';
      g.fillText(ch, tx, ty);
    }
    function glyphCell(ch) {
      if (!glyphs.tex) {
        const size = glyphs.N * glyphs.px;
        glyphs.tex = canvasTexture(size, size, (g) => { glyphs.cells.forEach((idx, c) => drawGlyph(g, c, idx)); });
        glyphs.g = glyphs.tex.image.getContext('2d');
        glyphs.mat = new T.MeshStandardMaterial({ map: glyphs.tex, transparent: true, depthWrite: false, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
        glyphs.mat.name = 'kit-glyphs';
      }
      if (glyphs.cells.has(ch)) return glyphs.cells.get(ch);
      if (glyphs.next >= glyphs.N * glyphs.N) return -1;
      const idx = glyphs.next++;
      glyphs.cells.set(ch, idx);
      drawGlyph(glyphs.g, ch, idx);
      glyphs.tex.needsUpdate = true;
      return idx;
    }
    /** Aufkleber-Viereck (Normale +z) mit den UVs einer Atlas-Zelle. */
    function glyphQuad(ch, w) {
      const idx = glyphCell(ch);
      if (idx < 0) return null;
      const N = glyphs.N, pad = 0.004;
      const u0 = (idx % N) / N + pad, u1 = (idx % N + 1) / N - pad;
      const v1 = 1 - Math.floor(idx / N) / N - pad, v0 = 1 - (Math.floor(idx / N) + 1) / N + pad;
      const g = new T.PlaneGeometry(w, w);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) ? u1 : u0, uv.getY(i) ? v1 : v0);
      return g;
    }
    kit.block = function (char, color = C.orange, size = 1, o = {}) {
      const ch = String(char == null ? '' : char);
      const grp = new T.Group();
      grp.name = 'block';
      const body = paint(geo.roundBox(size, size, size, size * 0.16, 2).translate(0, size / 2, 0), color, { grad: [0.82, 1.06] });
      const bm = new T.Mesh(body, mats.glossSmooth);
      bm.castShadow = true;
      bm.receiveShadow = true;
      grp.add(bm);
      // Zeichen vorn, hinten, links, rechts, oben (oben: lesbar von vorn)
      const faces = [
        [o.front == null ? ch : o.front, [0, size / 2, size / 2], [0, 0, 0]],
        [o.back == null ? ch : o.back, [0, size / 2, -size / 2], [0, PI, 0]],
        [o.side == null ? ch : o.side, [size / 2, size / 2, 0], [0, PI / 2, 0]],
        [o.side == null ? ch : o.side, [-size / 2, size / 2, 0], [0, -PI / 2, 0]],
        [o.top == null ? ch : o.top, [0, size, 0], [-PI / 2, 0, 0]],
      ];
      const quads = [];
      const eps = size * 0.004;
      faces.forEach(([c, p, r]) => {
        if (!c) return;
        const q = glyphQuad(String(c), size * 0.74);
        if (!q) return;
        q.translate(0, 0, eps);
        quads.push(xf(q, p, r));
      });
      if (quads.length) {
        const dm = new T.Mesh(quads.length > 1 ? mergeGeos(quads, false) : quads[0], glyphs.mat);
        dm.renderOrder = 2;
        dm.castShadow = false;
        dm.receiveShadow = true;
        grp.add(dm);
      }
      return grp;
    };

    kit.balloon = function (color = C.red) {
      const P = new Parts();
      const b = new T.SphereGeometry(0.38, 14, 10);
      b.scale(1, 1.17, 1).translate(0, 1.55, 0);
      P.add(b, color, { gloss: true, smooth: true, grad: [0.8, 1.08] });
      P.add(xf(new T.ConeGeometry(0.07, 0.1, 6), [0, 1.08, 0], [PI, 0, 0]), kit.shade(color, 0.85), { gloss: true, smooth: true });
      P.add(xf(geo.cyl(0.008, 0.008, 1.06, 3), [0, 0.53, 0]), '#f4f4f4', {});
      const g = P.build();
      g.name = 'balloon';
      return g;
    };

    kit.star = function (color = C.gold, size = 1) {
      const sh = new T.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.21 : 0.48;
        const a = PI / 2 + (i / 10) * TAU;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
      }
      sh.closePath();
      const g = new T.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 2 });
      g.translate(0, 0, -0.05);
      if (size !== 1) g.scale(size, size, size);
      const m = kit.mesh(g, color, { gloss: true, grad: [0.85, 1.1] });
      m.name = 'star';
      return m;
    };

    const spriteMats = new Map();
    kit.emojiProp = function (emoji, size = 1) {
      let mat = spriteMats.get(emoji);
      if (!mat) {
        mat = new T.SpriteMaterial({ map: W.emojiTexture(emoji, 256), transparent: true, alphaTest: 0.08, depthWrite: true });
        spriteMats.set(emoji, mat);
      }
      const grp = new T.Group();
      const sp = new T.Sprite(mat);
      sp.center.set(0.5, 0.06);
      sp.scale.set(size, size, 1);
      sp.position.y = 0.02;
      grp.add(sp);
      grp.add(kit.shadowBlob(size * 0.38));
      grp.name = 'emoji';
      grp.userData.sprite = sp;
      return grp;
    };

    /* ------------------------------------------------------------------
       Nacht: Laternen und Fenster leuchten
       ------------------------------------------------------------------ */
    let haloMat = null;
    /** Weicher Lichthof (Sprite), nur nachts sichtbar. */
    kit.glowHalo = function (size = 1.2, color = '#ffd27a') {
      if (!haloMat) {
        const tex = canvasTexture(128, 128, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)');
          gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, w, w);
        });
        haloMat = new T.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: true });
        haloMat.visible = false;
      }
      const sp = new T.Sprite(haloMat);
      sp.scale.set(size, size, 1);
      sp.renderOrder = 6;
      sp.name = 'halo';
      return sp;
    };
    const nightWin = new T.Color('#ffe2a0');
    kit.setNight = function (k) {
      k = clamp(k, 0, 1);
      if (haloMat) { haloMat.opacity = smooth(0.35, 1, k) * 0.9; haloMat.visible = k > 0.3; }
      mats.glow.emissiveIntensity = 0.45 + k * 2.6;
      mats.window.emissiveIntensity = k * 1.25;
      mats.window.color.set('#a6dcff').lerp(nightWin, k);
      // dasselbe für zusammengeführte Meshes (mats.surface)
      SU.uWinColor.value.copy(mats.window.color);
      SU.uWinEmissive.value.copy(mats.window.emissive).multiplyScalar(mats.window.emissiveIntensity);
      SU.uGlowEmissive.value.copy(mats.glow.emissive).multiplyScalar(mats.glow.emissiveIntensity);
    };

    return kit;
  });
})();
