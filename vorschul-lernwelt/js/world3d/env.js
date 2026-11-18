/* ==========================================================================
   js/world3d/env.js – Umgebung der Inselwelt → W.env

   Himmel (Verlaufs-Kuppel mit Sonnenglanz, Dunst und Sternen), Meer (eigener
   Shader auf MeshStandardMaterial: Wellen, Fresnel-Himmelsreflex, Glitzern,
   türkises Flachwasser und Schaumlinien rund um jede Insel), Wolken
   (instanziert), ferne Berge im Dunst, Möwen, schwebende Pollen (nachts
   Glühwürmchen) und die Licht-Stimmung.

   API
     W.env.setMood(name, { instant=false, dur=2.6 })   'day' (Standard) | 'sunset' | 'night'
     W.env.mood                    aktuelle Stimmung (Name)
     W.env.moods                   ['day', 'sunset', 'night']
     W.env.nightness               0 (Tag) … 1 (Nacht), weich überblendet
     W.env.onMood(fn(name)) → abmelden()
     W.env.refreshShore()          Ufer-/Schaumkarte neu berechnen (nach Umbauten an Inseln)
     W.env.sunDir                  THREE.Vector3 zur Sonne (bzw. zum Mond), folgt der Überblendung
     W.env.colors() → { zenith, sky, horizon, haze, sun, sea, shallow, night }  aktuelle Farben (CSS-Hex)
     W.env.objects                 { sky, water, clouds, backdrop, gulls, pollen }

   Ablauf: 'env' baut alles (vor den Inseln). 'ready' (nach den Inseln) setzt
   die Insel-Positionen fürs Flachwasser und rendert beim ersten Bild einmal
   eine Höhenkarte der Inseln von oben (Ufer-Textur) – daraus entstehen
   Flachwasser, durchscheinender Sand und die Schaumringe, passend zu jeder
   Inselform. Die Sonnen-Schattenkamera folgt dem Blickpunkt der Kamera
   (scharfe Schatten in der Nähe, ganze Welt in der Übersicht).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  if (!LT || !LT.w3d) return;
  let ENV = null;

  LT.w3d.register('env', (W) => { ENV = build(W); });
  LT.w3d.register('ready', (W) => { if (ENV) ENV.ready(); });

  /* ------------------------------------------------------------------
     Stimmungen
     ------------------------------------------------------------------ */
  const MOODS = {
    day: {
      zenith: '#2f95e8', sky: '#62bdf8', horizon: '#bfe6ff', haze: '#dff3ff',
      sunColor: '#fff0cf', sunI: 2.9, sunDir: [-0.5, 0.76, 0.42], sunDisc: 1, sunGlow: 1,
      hemiSky: '#cfe9ff', hemiGround: '#e3c48e', hemiI: 0.85, ambI: 0.06,
      fog: '#cfeaff', fogNear: 170, fogFar: 760,
      exposure: 1.0, envI: 0.62,
      deep: '#0d6ea8', mid: '#1ea4d2', shallow: '#46ddd5', foam: '#ffffff', glint: 1,
      cloud: '#ffffff', cloudGlow: 0.32, stars: 0, night: 0,
      pollen: '#fff4d2', pollenA: 0.55, pollenSize: 5,
    },
    sunset: {
      zenith: '#4d63b8', sky: '#a58ad0', horizon: '#ffb38a', haze: '#ffd2a3',
      sunColor: '#ffb06a', sunI: 2.6, sunDir: [-0.3, 0.16, -0.94], sunDisc: 1, sunGlow: 1.7,
      hemiSky: '#ffd2b8', hemiGround: '#8a6a90', hemiI: 1.0, ambI: 0.1,
      fog: '#f5bf98', fogNear: 150, fogFar: 640,
      exposure: 1.0, envI: 0.55,
      deep: '#3a4f96', mid: '#5677b4', shallow: '#5cc0c4', foam: '#fff2e6', glint: 1.3,
      cloud: '#ffd9c2', cloudGlow: 0.3, stars: 0.12, night: 0.15,
      pollen: '#ffd8a8', pollenA: 0.7, pollenSize: 5.5,
    },
    night: {
      zenith: '#050d2e', sky: '#10265a', horizon: '#284a86', haze: '#2f5592',
      sunColor: '#c6dbff', sunI: 1.25, sunDir: [-0.35, 0.62, 0.5], sunDisc: 0.9, sunGlow: 0.6,
      hemiSky: '#5a78bd', hemiGround: '#28355e', hemiI: 1.0, ambI: 0.12,
      fog: '#1c3566', fogNear: 120, fogFar: 560,
      exposure: 1.2, envI: 0.35,
      deep: '#0c2a5c', mid: '#174a82', shallow: '#2a86a0', foam: '#d6e8ff', glint: 0.8,
      cloud: '#56627e', cloudGlow: 0.1, stars: 1, night: 1,
      pollen: '#e8ff8a', pollenA: 1.0, pollenSize: 7,
    },
  };
  const COLOR_KEYS = ['zenith', 'sky', 'horizon', 'haze', 'sunColor', 'hemiSky', 'hemiGround', 'fog', 'deep', 'mid', 'shallow', 'foam', 'cloud', 'pollen'];
  const NUM_KEYS = ['sunI', 'sunDisc', 'sunGlow', 'hemiI', 'ambI', 'fogNear', 'fogFar', 'exposure', 'envI', 'glint', 'cloudGlow', 'stars', 'night', 'pollenA', 'pollenSize'];

  /* ------------------------------------------------------------------
     Shader-Bausteine
     ------------------------------------------------------------------ */
  const GLSL_NOISE = `
    float wHash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float wNoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(wHash(i), wHash(i + vec2(1.0, 0.0)), u.x), mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), u.x), u.y);
    }`;

  const SKY_VERT = `
    varying vec3 vDir;
    void main() {
      vDir = position;
      vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      #ifdef SKY_ENV
        gl_Position = p;
      #else
        gl_Position = p.xyww;
      #endif
    }`;
  const SKY_FRAG = `
    uniform vec3 uZenith, uSky, uHorizon, uHaze, uSunColor, uSunDir, uGround;
    uniform float uSunDisc, uSunGlow, uStars, uTime;
    varying vec3 vDir;
    float sHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    void main() {
      vec3 d = normalize(vDir);
      float h = d.y;
      float hp = max(h, 0.0);
      vec3 col = mix(uHorizon, uSky, smoothstep(0.0, 0.25, hp));
      col = mix(col, uZenith, smoothstep(0.2, 0.95, hp));
      col = mix(col, uHaze, (1.0 - smoothstep(0.0, 0.1, abs(h))) * 0.8);
      #ifdef SKY_ENV
        if (h < 0.0) col = mix(uHaze, uGround, smoothstep(0.0, -0.25, h));
      #else
        if (h < 0.0) col = mix(uHaze, uHorizon, smoothstep(0.0, -0.4, h));
      #endif
      float sd = max(dot(d, normalize(uSunDir)), 0.0);
      col += uSunColor * (pow(sd, 7.0) * 0.18 + pow(sd, 48.0) * 0.32) * uSunGlow;
      float disc = smoothstep(0.99905, 0.99945, sd) * uSunDisc;
      col = mix(col, uSunColor * 1.25 + vec3(0.25), disc);
      #ifndef SKY_ENV
        if (uStars > 0.01 && h > 0.0) {
          vec3 q = d * 150.0;
          vec3 id = floor(q);
          float s = sHash(id);
          vec3 f = fract(q) - 0.5;
          float st = step(0.982, s) * smoothstep(0.34, 0.0, length(f));
          float tw = 0.55 + 0.45 * sin(uTime * (1.5 + s * 3.0) + s * 60.0);
          col += vec3(0.9, 0.95, 1.0) * st * tw * uStars * smoothstep(0.02, 0.3, h);
        }
        col += (sHash(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 160.0;
      #endif
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`;

  function build(W) {
    const T = W.THREE;
    const R = W.renderer;
    const scene = W.scene;
    const kit = W.kit;
    const col = (c) => new T.Color(c);
    const V3 = (x, y, z) => new T.Vector3(x, y, z);

    R.toneMapping = T.NeutralToneMapping != null ? T.NeutralToneMapping : T.ACESFilmicToneMapping;
    R.toneMappingExposure = 1;

    /* ---------------- Zustand der Stimmung ---------------- */
    const S = {};
    function snapshot(src) {
      const o = {};
      COLOR_KEYS.forEach((k) => { o[k] = src[k] && src[k].isColor ? src[k].clone() : col(src[k]); });
      NUM_KEYS.forEach((k) => { o[k] = src[k]; });
      o.sunDir = Array.isArray(src.sunDir) ? V3(src.sunDir[0], src.sunDir[1], src.sunDir[2]).normalize() : src.sunDir.clone();
      return o;
    }
    Object.assign(S, snapshot(MOODS.day));

    /* ---------------- Himmel ---------------- */
    const skyUniforms = {
      uZenith: { value: S.zenith.clone() }, uSky: { value: S.sky.clone() }, uHorizon: { value: S.horizon.clone() }, uHaze: { value: S.haze.clone() },
      uSunColor: { value: S.sunColor.clone() }, uSunDir: { value: S.sunDir.clone() }, uGround: { value: col('#174a63') },
      uSunDisc: { value: 1 }, uSunGlow: { value: 1 }, uStars: { value: 0 }, uTime: { value: 0 },
    };
    const skyMat = new T.ShaderMaterial({ uniforms: skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: T.BackSide, depthWrite: false, fog: false, toneMapped: false });
    const sky = new T.Mesh(new T.SphereGeometry(10, 32, 16), skyMat);
    sky.name = 'sky';
    sky.frustumCulled = false;
    sky.renderOrder = -1000;
    sky.onBeforeRender = (r, s, cam) => { sky.position.copy(cam.position); sky.updateMatrixWorld(); };
    scene.add(sky);
    scene.background = S.haze.clone();
    scene.fog = new T.Fog(S.fog.clone(), S.fogNear, S.fogFar);

    /* Umgebungs-Reflexe aus dem eigenen Himmel (statt grauem Raum) */
    const envUniforms = {};
    Object.keys(skyUniforms).forEach((k) => { envUniforms[k] = { value: skyUniforms[k].value && skyUniforms[k].value.clone ? skyUniforms[k].value.clone() : skyUniforms[k].value }; });
    const envMat = new T.ShaderMaterial({ uniforms: envUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: T.BackSide, depthWrite: false, defines: { SKY_ENV: 1 } });
    const envScene = new T.Scene();
    envScene.add(new T.Mesh(new T.SphereGeometry(50, 32, 16), envMat));
    const envMaps = {};
    let pmrem = null;
    function envFor(name) {
      if (envMaps[name]) return envMaps[name];
      try {
        const m = MOODS[name];
        envUniforms.uZenith.value.set(m.zenith); envUniforms.uSky.value.set(m.sky); envUniforms.uHorizon.value.set(m.horizon);
        envUniforms.uHaze.value.set(m.haze); envUniforms.uSunColor.value.set(m.sunColor);
        envUniforms.uSunDir.value.set(m.sunDir[0], m.sunDir[1], m.sunDir[2]).normalize();
        envUniforms.uSunGlow.value = m.sunGlow * 1.4; envUniforms.uSunDisc.value = m.sunDisc;
        envUniforms.uGround.value.set(name === 'night' ? '#0a1530' : name === 'sunset' ? '#3b3a63' : '#1d6b86');
        pmrem = pmrem || new T.PMREMGenerator(R);
        envMaps[name] = pmrem.fromScene(envScene, 0.02, 0.1, 100).texture;
      } catch (e) {
        envMaps[name] = W.envMap || null;
      }
      return envMaps[name];
    }
    const dayEnv = envFor('day');
    if (dayEnv) { scene.environment = dayEnv; W.envMap = dayEnv; }
    scene.environmentIntensity = S.envI;
    let envCurrent = 'day';

    /* ---------------- Meer ---------------- */
    const MAX_ISL = 16;
    const waterU = {
      uTime: { value: 0 }, uDeep: { value: S.deep.clone() }, uMid: { value: S.mid.clone() }, uShallow: { value: S.shallow.clone() }, uFoamCol: { value: S.foam.clone() },
      uGlint: { value: 1 }, uGlintCol: { value: col('#ffffff') }, uWaveAmp: { value: W.reducedMotion ? 0.01 : 0.06 }, uSpeed: { value: W.reducedMotion ? 0.15 : 1 },
      uIsl: { value: Array.from({ length: MAX_ISL }, () => new T.Vector4(0, 0, -100, 0)) }, uIslN: { value: 0 },
      uShore: { value: null }, uShoreBox: { value: new T.Vector4(0, 0, 1, 1) }, uShoreOn: { value: 0 },
      uArch: { value: new T.Vector4(0, 0, 0.8, 1.15) },
    };
    const waterMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.16, metalness: 0, transparent: true, depthWrite: true });
    waterMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, waterU);
      sh.vertexShader = 'uniform float uTime;\nuniform float uWaveAmp;\nuniform float uSpeed;\nvarying vec3 vWPos;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          vec4 wp0 = modelMatrix * vec4(transformed, 1.0);
          float tt = uTime * uSpeed;
          transformed.y += (sin(wp0.x * 0.09 + tt * 0.8) * 0.6 + sin(wp0.z * 0.12 - tt * 0.6 + wp0.x * 0.04) * 0.4) * uWaveAmp;
          vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        }`);
      sh.fragmentShader = `uniform float uTime, uSpeed, uGlint, uShoreOn;
        uniform vec4 uArch;
        uniform vec3 uDeep, uMid, uShallow, uFoamCol, uGlintCol;
        uniform vec4 uIsl[${MAX_ISL}];
        uniform int uIslN;
        uniform sampler2D uShore;
        uniform vec4 uShoreBox;
        varying vec3 vWPos;
        ${GLSL_NOISE}
        vec2 wRip(vec2 p, vec2 dir, float fr, float sp, float amp, float t) { float a = dot(dir, p) * fr + t * sp; return dir * (amp * fr * cos(a)); }
        ` + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          float wFoam = 0.0;
          float wShallow = 0.0;
          {
            vec2 p = vWPos.xz;
            float tt = uTime * uSpeed;
            float distEdge = 1e4;
            for (int i = 0; i < ${MAX_ISL}; i++) {
              if (i >= uIslN) break;
              vec4 I = uIsl[i];
              distEdge = min(distEdge, length(p - I.xy) - I.z);
            }
            float halo = 1.0 - smoothstep(-1.0, 13.0, distEdge);
            float arch = 1.0 - smoothstep(55.0, 175.0, length((p - uArch.xy) * uArch.zw));
            float depth = clamp(distEdge * 0.8 + 0.3, 0.0, 4.0);
            if (uShoreOn > 0.5) {
              vec2 suv = (p - uShoreBox.xy) * uShoreBox.zw;
              if (suv.x > 0.001 && suv.y > 0.001 && suv.x < 0.999 && suv.y < 0.999) {
                float hv = texture2D(uShore, suv).r;
                depth = max(0.0, 3.0 - hv * 3.5);
              }
            }
            float n1 = wNoise(p * 0.85 + vec2(tt * 0.12, -tt * 0.09));
            float n2 = wNoise(p * 2.1 - vec2(tt * 0.08, tt * 0.15));
            float sh = 1.0 - smoothstep(0.0, 2.3, depth);
            vec3 wc = mix(uDeep, uMid, clamp(arch * 0.78 + halo * 0.55, 0.0, 1.0));
            wc *= 0.93 + 0.12 * wNoise(p * 0.035 + 3.7);
            wc = mix(wc, uShallow, sh * 0.92);
            // feine Lichtadern (Kaustik-Andeutung) im Flachwasser
            float caus = smoothstep(0.55, 0.95, wNoise(p * 1.6 + vec2(tt * 0.2, tt * 0.13)) * 0.6 + wNoise(p * 3.1 - vec2(tt * 0.17, -tt * 0.1)) * 0.5);
            wc += uShallow * caus * sh * 0.22;
            float edge = 1.0 - smoothstep(0.04, 0.15 + 0.12 * n1, depth);
            float rings = 0.0;
            for (int k = 0; k < 2; k++) {
              float ph = fract(tt * 0.075 + float(k) * 0.5);
              float dk = (1.0 - ph) * 1.25 + 0.12;
              float w = 0.05 + 0.04 * (1.0 - ph);
              float band = 1.0 - smoothstep(w * 0.4, w, abs(depth - dk + (n2 - 0.5) * 0.14));
              float brk = smoothstep(0.38, 0.7, wNoise(p * 1.1 + float(k) * 7.3 + vec2(0.0, tt * 0.05)) + 0.12);
              rings += band * smoothstep(0.0, 0.2, ph) * (1.0 - smoothstep(0.65, 1.0, ph)) * brk;
            }
            wFoam = clamp(max(edge, rings * 0.8), 0.0, 1.0);
            wShallow = sh;
            diffuseColor.rgb = mix(wc, uFoamCol, wFoam);
            diffuseColor.a = mix(mix(1.0, 0.42, pow(sh, 1.4)), 0.96, wFoam);
          }`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor, 0.42, smoothstep(25.0, 190.0, length(cameraPosition - vWPos)));
          roughnessFactor = mix(roughnessFactor, 0.85, wFoam);`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          {
            vec2 p = vWPos.xz;
            float tt = uTime * uSpeed;
            float dist = length(cameraPosition - vWPos);
            float fade = 1.0 - smoothstep(14.0, 95.0, dist);
            vec2 g = vec2(0.0);
            g += wRip(p, normalize(vec2(0.8, 0.6)), 0.55, 1.1, 0.06, tt);
            g += wRip(p, normalize(vec2(-0.5, 0.86)), 0.9, 1.5, 0.05, tt);
            g += wRip(p, normalize(vec2(0.2, -1.0)), 1.7, 2.1, 0.035, tt);
            g += wRip(p, normalize(vec2(-0.95, -0.3)), 2.9, 2.7, 0.02, tt);
            g *= mix(0.12, 1.0, fade) * (1.0 - wFoam * 0.7);
            vec3 nW = normalize(vec3(-g.x, 1.0, -g.y));
            normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
          }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          {
            vec2 cp = vWPos.xz * 1.3;
            vec2 cid = floor(cp);
            vec2 cf = fract(cp) - 0.5;
            float hs = wHash(cid);
            float tw = sin(uTime * (1.7 + hs * 2.5) + hs * 40.0);
            float dist = length(cameraPosition - vWPos);
            float spark = step(0.935, hs) * smoothstep(0.2, 0.0, length(cf)) * smoothstep(0.55, 1.0, tw);
            spark *= (1.0 - smoothstep(45.0, 140.0, dist)) * (1.0 - wFoam) * (1.0 - wShallow * 0.6);
            totalEmissiveRadiance += uGlintCol * spark * uGlint * 1.4;
            totalEmissiveRadiance += uFoamCol * wFoam * 0.16;
          }`);
    };
    waterMat.customProgramCacheKey = () => 'lt-water-1';
    function waterGeometry() {
      const segs = 96, rings = 50, Rmax = 980;
      const pos = [0, 0, 0];
      const idx = [];
      for (let r = 1; r <= rings; r++) {
        const rad = Rmax * Math.pow(r / rings, 2.3);
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2 + (r % 2) * (Math.PI / segs);
          pos.push(Math.cos(a) * rad, 0, Math.sin(a) * rad);
        }
      }
      const ring = (r, s) => (r === 0 ? 0 : 1 + (r - 1) * segs + ((s % segs) + segs) % segs);
      for (let s = 0; s < segs; s++) idx.push(0, ring(1, s + 1), ring(1, s));
      for (let r = 1; r < rings; r++) {
        for (let s = 0; s < segs; s++) {
          const a = ring(r, s), b = ring(r, s + 1), c = ring(r + 1, s), d = ring(r + 1, s + 1);
          if (r % 2) { idx.push(a, b, d, a, d, c); } else { idx.push(a, b, c, b, d, c); }
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      const nrm = new Float32Array(pos.length);
      for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
      g.setAttribute('normal', new T.BufferAttribute(nrm, 3));
      g.setIndex(idx);
      return g;
    }
    const water = new T.Mesh(waterGeometry(), waterMat);
    water.name = 'water';
    water.receiveShadow = true;
    water.renderOrder = 1;
    water.frustumCulled = false;
    scene.add(water);

    /* ---------------- Wolken (instanziert) ---------------- */
    const cloudMat = new T.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 1, metalness: 0, emissive: '#ffffff', emissiveIntensity: S.cloudGlow });
    function cloudGeo(seed) {
      const r = W.rng(seed);
      const parts = [];
      const n = 5 + Math.floor(r() * 3);
      // einzelne Bausche: weich schattiert (glatte Normalen je Bausch), unten abgeflacht
      const puff = (s, sd) => {
        let g = kit ? kit.geo.blob(s, { seed: sd, noise: 0.06, detail: 1, flat: 0.3 }) : new T.IcosahedronGeometry(s, 1);
        for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
        g = T.addons.mergeVertices(g, 1e-4);
        g.computeVertexNormals();
        return g.toNonIndexed();
      };
      for (let i = 0; i < n; i++) {
        const c = i - (n - 1) / 2;
        const s = (1 - Math.abs(c) / n) * 1.0 + 0.45 + r() * 0.25;
        const g = puff(s, seed * 13 + i);
        g.translate(c * 0.95 + (r() - 0.5) * 0.3, s * 0.35 + r() * 0.15, (r() - 0.5) * 0.9);
        parts.push(g);
      }
      if (r() < 0.7) { const g = puff(0.8, seed * 7); g.translate(0.2, 1.0, 0); parts.push(g); }
      const g = T.addons.mergeGeometries(parts, false);
      g.computeBoundingBox();
      const y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y;
      const p = g.attributes.position;
      const cArr = new Float32Array(p.count * 3);
      const low = col('#c4d5ea'), high = col('#ffffff'), tmp = new T.Color();
      for (let i = 0; i < p.count; i++) {
        const t = Math.min(1, Math.max(0, (p.getY(i) - y0) / (y1 - y0)));
        tmp.copy(low).lerp(high, Math.pow(t, 0.6));
        cArr[i * 3] = tmp.r; cArr[i * 3 + 1] = tmp.g; cArr[i * 3 + 2] = tmp.b;
      }
      g.setAttribute('color', new T.BufferAttribute(cArr, 3));
      return g;
    }
    const clouds = new T.Group();
    clouds.name = 'clouds';
    const cloudItems = [];
    const meshes = [];
    (function makeClouds() {
      const rr = W.rng(9001);
      const variants = [cloudGeo(11), cloudGeo(23), cloudGeo(37)];
      const lists = [[], [], []];
      // nahe Rahmen-Wolken (seitlich und hinten, nie über dem Inselfeld)
      const near = [[-1.95, 96], [-2.4, 120], [-1.2, 110], [-0.75, 130], [-2.9, 105], [-0.25, 118], [-1.6, 150], [-2.75, 150], [3.0, 120], [0.15, 125]];
      near.forEach(([a, d], i) => {
        const p = V3(Math.cos(a) * d, 20 + rr() * 14, Math.sin(a) * d);
        lists[i % 3].push({ p, s: 5 + rr() * 3.5, ry: rr() * Math.PI, tan: V3(-Math.sin(a), 0, Math.cos(a)), amp: 8 + rr() * 8, ph: rr() * 6.28, sp: 0.012 + rr() * 0.01, drift: 0 });
      });
      // ferne Wolken am Horizont (hinten), ziehen langsam nach +x
      for (let i = 0; i < 16; i++) {
        const p = V3(-520 + i * 65 + rr() * 30, 30 + rr() * 45, -190 - rr() * 260);
        lists[i % 3].push({ p, s: 9 + rr() * 9, ry: rr() * Math.PI, drift: 0.9 + rr() * 0.8 });
      }
      variants.forEach((g, vi) => {
        const L = lists[vi];
        const im = new T.InstancedMesh(g, cloudMat, L.length);
        im.frustumCulled = false;
        im.castShadow = false;
        im.receiveShadow = false;
        clouds.add(im);
        meshes.push(im);
        L.forEach((it, i) => { it.mesh = im; it.v = vi; it.i = i; it.base = it.p.clone(); cloudItems.push(it); });
      });
    })();
    const _dummy = new T.Object3D();
    // Nur sichtbare Wolken zeichnen (Weltkarte schaut nach unten → meist keine)
    const frustum = new T.Frustum();
    const projM = new T.Matrix4();
    const sphere = new T.Sphere();
    const slot = [0, 0, 0];
    function updateClouds(t) {
      const m = W.reducedMotion ? 0.1 : 1;
      const cam = W.camera;
      cam.updateMatrixWorld();
      projM.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      frustum.setFromProjectionMatrix(projM);
      slot[0] = slot[1] = slot[2] = 0;
      for (const it of cloudItems) {
        if (it.drift) {
          let x = it.base.x + t * it.drift * m;
          x = ((x + 560) % 1120 + 1120) % 1120 - 560;
          _dummy.position.set(x, it.base.y, it.base.z);
        } else {
          const k = Math.sin(t * it.sp * m + it.ph) * it.amp;
          _dummy.position.copy(it.base).addScaledVector(it.tan, k);
        }
        sphere.center.copy(_dummy.position);
        sphere.radius = it.s * 3.4;
        if (!frustum.intersectsSphere(sphere)) continue;
        _dummy.rotation.set(0, it.ry, 0);
        _dummy.scale.set(it.s, it.s * 0.82, it.s * 0.85);
        _dummy.updateMatrix();
        it.mesh.setMatrixAt(slot[it.v]++, _dummy.matrix);
      }
      for (let v = 0; v < meshes.length; v++) {
        meshes[v].count = slot[v];
        meshes[v].visible = slot[v] > 0;
        meshes[v].instanceMatrix.needsUpdate = true;
      }
    }
    updateClouds(0);
    scene.add(clouds);

    /* ---------------- Kulisse: ferne Berge und Inseln im Dunst ---------------- */
    const hazeAdd = { value: 0.3 };
    const backdrop = (function () {
      const parts = [];
      const rr = W.rng(4711);
      const nz = T.addons.SimplexNoise ? new T.addons.SimplexNoise({ random: rr }) : { noise3d: () => 0 };
      const hill = (x, z, rad, h, seed, green) => {
        const g = new T.ConeGeometry(rad, h, 12, 5);
        const p = g.attributes.position;
        const v = new T.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          const t = Math.min(1, Math.max(0, (v.y + h / 2) / h));
          const n = nz.noise3d(v.x * 0.05 + seed, v.y * 0.05, v.z * 0.05);
          const k = 1 + n * 0.25;
          v.x *= k; v.z *= k;
          v.y = (Math.pow(t, 0.8) - 0.5) * h + n * h * 0.08;
          if (t > 0.97) v.y -= h * 0.04;
          p.setXYZ(i, v.x, v.y, v.z);
        }
        g.translate(x, h / 2 - 2, z);
        const ng = g.toNonIndexed();
        g.dispose();
        const pp = ng.attributes.position;
        const cArr = new Float32Array(pp.count * 3);
        const cSand = col('#f0d6a4'), cGreen = col(green), cRock = col('#9ea7a2'), tmp = new T.Color();
        for (let i = 0; i < pp.count; i += 3) {
          const y = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3 + 2;
          const t = y / h;
          if (y < 1.6) tmp.copy(cSand); else tmp.copy(cGreen).lerp(cRock, Math.max(0, (t - 0.6) * 1.6));
          tmp.multiplyScalar(0.8 + 0.25 * t + (rr() - 0.5) * 0.06);
          for (let k = 0; k < 3; k++) cArr.set([tmp.r, tmp.g, tmp.b], (i + k) * 3);
        }
        ng.setAttribute('color', new T.BufferAttribute(cArr, 3));
        for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'color') ng.deleteAttribute(k);
        ng.computeVertexNormals();
        parts.push(ng);
      };
      const defs = [
        [-2.55, 420, 75, 52], [-2.25, 380, 60, 38], [-1.95, 470, 95, 64], [-1.7, 400, 55, 30], [-1.45, 450, 80, 46],
        [-1.15, 390, 70, 40], [-0.85, 460, 100, 58], [-0.55, 410, 60, 34], [-2.95, 360, 50, 26], [-0.2, 380, 55, 28],
        [-1.82, 300, 34, 16], [-1.3, 290, 30, 13], [-2.3, 270, 26, 11], [-0.95, 300, 28, 12],
      ];
      defs.forEach(([a, d, rad, h], i) => hill(Math.cos(a) * (d + 40), Math.sin(a) * (d + 40), rad, h * 0.8, i * 3.1, i % 2 ? '#6fb08a' : '#62a684'));
      const g = T.addons.mergeGeometries(parts, false);
      const hm = new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
      // stärkerer Dunst als der normale Nebel (Luftperspektive)
      hm.onBeforeCompile = (sh) => {
        sh.uniforms.uHazeAdd = hazeAdd;
        sh.fragmentShader = 'uniform float uHazeAdd;\n' + sh.fragmentShader.replace('#include <fog_fragment>', `
          #ifdef USE_FOG
            float hzF = clamp(smoothstep(fogNear, fogFar, vFogDepth) + uHazeAdd, 0.0, 0.92);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, hzF);
          #endif`);
      };
      hm.customProgramCacheKey = () => 'lt-backdrop';
      const m = new T.Mesh(g, hm);
      m.name = 'backdrop';
      m.castShadow = false;
      m.receiveShadow = false;
      return m;
    })();
    scene.add(backdrop);

    /* Kleine Nachbar-Inselchen mit Palmen (Tiefe am Rand der Weltkarte) */
    const islets = [];
    if (kit) {
      const all = new T.Group();
      all.name = 'islets';
      [[-84, -50, 2.6, 5], [88, -56, 2.2, 6], [-80, 38, 1.9, 7], [84, 32, 2.3, 8]].forEach(([x, z, r, seed]) => {
        try {
          const b = kit.islandBase({ seed, radius: r * 1.9, grassRadius: r, height: 0.7, segments: 24, stones: 2, cliffs: 0.4 });
          const g = b.group;
          const n = 1 + (seed % 2);
          for (let i = 0; i < n; i++) b.place(kit.tree({ type: 'palm', seed: seed * 10 + i, scale: 1.1 }), (i - (n - 1) / 2) * 1.2, (i % 2) * 0.6 - 0.3);
          b.place(kit.bush({ seed }), 0.9, 0.6);
          g.position.set(x, 0, z);
          g.rotation.y = seed;
          all.add(g);
          islets.push({ x, z, r: r * 1.9 });
        } catch (e) { /* ohne Inselchen */ }
      });
      kit.merge(all);
      scene.add(all);
    }

    /* ---------------- Möwen ---------------- */
    const gulls = (function () {
      const N = 6;
      if (!kit) return null;
      const body = new kit.Parts()
        .add(kit.xf(new T.IcosahedronGeometry(0.13, 1), [0, 0, 0], null, [0.9, 0.85, 2.1]), '#ffffff', { grad: [0.75, 1.05] })
        .add(kit.xf(new T.IcosahedronGeometry(0.09, 1), [0, 0.07, 0.25]), '#ffffff', {})
        .add(kit.xf(new T.ConeGeometry(0.03, 0.1, 4), [0, 0.06, 0.36], [Math.PI / 2, 0, 0]), '#ffb03a', {})
        .add(kit.xf(new T.ConeGeometry(0.08, 0.2, 4), [0, 0.0, -0.32], [-Math.PI / 2, 0, 0], [1, 1, 0.3]), '#e8eef4', {})
        .build().children[0].geometry;
      const wingShape = (s) => {
        const pos = [0, 0, 0.12, 0, 0, -0.1, 0.42 * s, 0.03, 0.06, 0, 0, -0.1, 0.42 * s, 0.03, -0.08, 0.42 * s, 0.03, 0.06, 0.42 * s, 0.03, 0.06, 0.42 * s, 0.03, -0.08, 0.8 * s, -0.02, -0.12];
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();
        const c = [];
        for (let i = 0; i < 9; i++) { const cc = i >= 6 ? col('#8995a3') : col('#f4f7fa'); c.push(cc.r, cc.g, cc.b); }
        g.setAttribute('color', new T.Float32BufferAttribute(c, 3));
        g.setAttribute('uv', new T.BufferAttribute(new Float32Array(18), 2));
        return g;
      };
      const wingR = wingShape(1), wingL = wingShape(-1);
      const mB = new T.InstancedMesh(body, kit.mats.matte, N);
      const mL = new T.InstancedMesh(wingL, kit.mats.matteDouble, N);
      const mR = new T.InstancedMesh(wingR, kit.mats.matteDouble, N);
      const grp = new T.Group();
      grp.name = 'gulls';
      [mB, mL, mR].forEach((m) => { m.frustumCulled = false; m.castShadow = false; grp.add(m); });
      const rr = W.rng(77);
      const birds = [];
      for (let i = 0; i < N; i++) birds.push({ cx: (rr() - 0.5) * 80, cz: (rr() - 0.5) * 50, rad: 10 + rr() * 16, y: 9 + rr() * 7, sp: (0.18 + rr() * 0.12) * (rr() < 0.5 ? -1 : 1), ph: rr() * 6.28, fl: rr() * 6.28 });
      const root = new T.Object3D(), wl = new T.Object3D(), wr = new T.Object3D();
      root.add(wl, wr);
      grp.userData.update = (t) => {
        const m = W.reducedMotion ? 0.15 : 1;
        birds.forEach((b, i) => {
          const a = b.ph + t * b.sp * m;
          const x = b.cx + Math.cos(a) * b.rad, z = b.cz + Math.sin(a) * b.rad;
          const dx = -Math.sin(a) * Math.sign(b.sp), dz = Math.cos(a) * Math.sign(b.sp);
          root.position.set(x, b.y + Math.sin(t * 0.7 + b.fl) * 0.6, z);
          root.rotation.set(0, Math.atan2(dx, dz), -0.28 * Math.sign(b.sp), 'YXZ');
          root.scale.setScalar(1.4);
          const flapOn = Math.max(0, Math.sin(t * 0.45 + b.fl));
          const fl = Math.sin(t * 9 * m + b.fl) * 0.55 * Math.min(1, flapOn * 2) + 0.12;
          wl.rotation.set(0, 0, -fl);
          wr.rotation.set(0, 0, fl);
          root.updateMatrixWorld(true);
          mB.setMatrixAt(i, root.matrixWorld);
          mL.setMatrixAt(i, wl.matrixWorld);
          mR.setMatrixAt(i, wr.matrixWorld);
        });
        mB.instanceMatrix.needsUpdate = mL.instanceMatrix.needsUpdate = mR.instanceMatrix.needsUpdate = true;
      };
      grp.userData.update(0);
      return grp;
    })();
    if (gulls) scene.add(gulls);

    /* ---------------- Pollen / Glühwürmchen ---------------- */
    const pollen = (function () {
      const N = 320;
      const rr = W.rng(31337);
      const pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        pos[i * 3] = (rr() - 0.5) * 150;
        pos[i * 3 + 1] = 1.2 + Math.pow(rr(), 1.6) * 14;
        pos[i * 3 + 2] = -50 + rr() * 95;
        seed[i] = rr();
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3));
      g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
      const m = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: S.pollen.clone() }, uSize: { value: S.pollenSize }, uPR: { value: 1 }, uOpacity: { value: S.pollenA }, uMove: { value: W.reducedMotion ? 0.1 : 1 } },
        vertexShader: `
          attribute float aSeed;
          uniform float uTime, uSize, uPR, uMove;
          varying float vA;
          void main() {
            vec3 p = position;
            float s = aSeed * 6.2831;
            float t = uTime * uMove;
            p.x += sin(t * 0.13 + s) * 1.8;
            p.y += sin(t * 0.21 + s * 1.3) * 0.8;
            p.z += cos(t * 0.11 + s * 0.7) * 1.8;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float d = -mv.z;
            gl_PointSize = clamp(uSize * uPR * (34.0 / max(d, 1.0)), 1.0, 13.0 * uPR);
            vA = (0.45 + 0.55 * sin(uTime * (1.2 + aSeed * 1.6) + s * 3.0)) * (1.0 - smoothstep(110.0, 200.0, d)) * smoothstep(1.5, 5.0, d);
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vA;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, r);
            a *= a;
            gl_FragColor = vec4(uColor, a * vA * uOpacity);
            #include <colorspace_fragment>
          }`,
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      });
      const pts = new T.Points(g, m);
      pts.name = 'pollen';
      pts.frustumCulled = false;
      pts.renderOrder = 5;
      return pts;
    })();
    scene.add(pollen);

    /* ---------------- Stimmung anwenden ---------------- */
    const L = W.lights;
    function apply() {
      skyUniforms.uZenith.value.copy(S.zenith);
      skyUniforms.uSky.value.copy(S.sky);
      skyUniforms.uHorizon.value.copy(S.horizon);
      skyUniforms.uHaze.value.copy(S.haze);
      skyUniforms.uSunColor.value.copy(S.sunColor);
      skyUniforms.uSunDir.value.copy(S.sunDir);
      skyUniforms.uSunDisc.value = S.sunDisc;
      skyUniforms.uSunGlow.value = S.sunGlow;
      skyUniforms.uStars.value = S.stars;
      if (scene.background && scene.background.isColor) scene.background.copy(S.haze);
      scene.fog.color.copy(S.fog);
      scene.fog.near = S.fogNear;
      scene.fog.far = S.fogFar;
      if (L) {
        L.sun.color.copy(S.sunColor);
        L.sun.intensity = S.sunI;
        L.hemi.color.copy(S.hemiSky);
        L.hemi.groundColor.copy(S.hemiGround);
        L.hemi.intensity = S.hemiI;
        L.amb.intensity = S.ambI;
      }
      R.toneMappingExposure = S.exposure;
      scene.environmentIntensity = S.envI;
      waterU.uDeep.value.copy(S.deep);
      waterU.uMid.value.copy(S.mid);
      waterU.uShallow.value.copy(S.shallow);
      waterU.uFoamCol.value.copy(S.foam);
      waterU.uGlint.value = S.glint;
      waterU.uGlintCol.value.copy(S.sunColor).lerp(col('#ffffff'), 0.5);
      cloudMat.color.copy(S.cloud);
      cloudMat.emissive.copy(S.cloud);
      cloudMat.emissiveIntensity = S.cloudGlow;
      pollen.material.uniforms.uColor.value.copy(S.pollen);
      pollen.material.uniforms.uOpacity.value = S.pollenA;
      pollen.material.uniforms.uSize.value = S.pollenSize;
      api.nightness = S.night;
      if (kit && kit.setNight) kit.setNight(S.night);
    }

    const listeners = new Set();
    let trans = null;
    const api = {
      mood: 'day',
      moods: Object.keys(MOODS),
      nightness: 0,
      sunDir: S.sunDir,
      objects: { sky, water, clouds, backdrop, gulls, pollen },
      onMood(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      setMood(name, o = {}) {
        if (!MOODS[name]) name = 'day';
        const target = snapshot(MOODS[name]);
        api.mood = name;
        const dur = o.instant || W.reducedMotion ? 0 : (o.dur == null ? 2.6 : o.dur);
        // Reflexe der neuen Stimmung vorbereiten (einmalig je Stimmung)
        const envTex = envFor(name);
        if (dur <= 0) {
          Object.keys(target).forEach((k) => { if (S[k] && S[k].copy) S[k].copy(target[k]); else S[k] = target[k]; });
          if (envTex) { scene.environment = envTex; envCurrent = name; }
          trans = null;
          apply();
        } else {
          trans = { t: 0, dur, from: snapshot(S), to: target, env: envTex, name, swapped: false };
        }
        listeners.forEach((fn) => { try { fn(name); } catch (e) { /* egal */ } });
        if (W.wake) W.wake();
      },
      refreshShore() { shoreDirty = true; if (W.wake) W.wake(); },
      /** aktuelle Stimmungsfarben als CSS-Hex (z. B. um die Oberfläche nachts zu tönen) */
      colors() {
        const h = (c) => '#' + c.getHexString();
        return { zenith: h(S.zenith), sky: h(S.sky), horizon: h(S.horizon), haze: h(S.haze), sun: h(S.sunColor), sea: h(S.mid), shallow: h(S.shallow), night: S.night };
      },
    };
    function stepMood(dt) {
      if (!trans) return;
      trans.t += dt / trans.dur;
      const k = W.ease.inOutSine(Math.min(1, trans.t));
      const a = trans.from, b = trans.to;
      COLOR_KEYS.forEach((key) => { S[key].copy(a[key]).lerp(b[key], k); });
      NUM_KEYS.forEach((key) => { S[key] = a[key] + (b[key] - a[key]) * k; });
      S.sunDir.copy(a.sunDir).lerp(b.sunDir, k).normalize();
      if (!trans.swapped && k >= 0.5) { trans.swapped = true; if (trans.env) { scene.environment = trans.env; envCurrent = trans.name; } }
      apply();
      if (trans.t >= 1) trans = null;
    }
    apply();

    /* ---------------- Schatten folgen dem Blick ---------------- */
    const sh = { fwd: V3(0, 0, -1), focus: V3(), x: V3(), y: V3(), z: V3(), up: V3(0, 1, 0), ext: 0 };
    function fitShadow() {
      if (!L || !L.sun) return;
      const cam = W.camera;
      cam.getWorldDirection(sh.fwd);
      let t = sh.fwd.y < -0.03 ? (1.0 - cam.position.y) / sh.fwd.y : 80;
      t = Math.min(Math.max(t, 6), 220);
      sh.focus.copy(cam.position).addScaledVector(sh.fwd, t);
      const fovH = Math.atan(Math.tan((cam.fov * Math.PI) / 360) * Math.max(1, cam.aspect));
      let ext = t * Math.tan(fovH) * 1.18 + 4;
      ext = Math.min(Math.max(ext, 13), 82);
      ext = Math.ceil(ext / 2) * 2;
      // auf Texel einrasten (kein Flimmern bei sanftem Kameraschwanken)
      sh.z.copy(S.sunDir).normalize();
      sh.x.crossVectors(sh.up, sh.z).normalize();
      sh.y.crossVectors(sh.z, sh.x);
      const size = L.sun.shadow.mapSize.x || 2048;
      const texel = (2 * ext) / size;
      const fx = Math.round(sh.focus.dot(sh.x) / texel) * texel;
      const fy = Math.round(sh.focus.dot(sh.y) / texel) * texel;
      const fz = sh.focus.dot(sh.z);
      sh.focus.copy(sh.x).multiplyScalar(fx).addScaledVector(sh.y, fy).addScaledVector(sh.z, fz);
      L.sun.target.position.copy(sh.focus);
      L.sun.position.copy(sh.focus).addScaledVector(sh.z, 130);
      L.sun.target.updateMatrixWorld();
      const sc = L.sun.shadow.camera;
      if (ext !== sh.ext) {
        sh.ext = ext;
        sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext;
        sc.near = 20; sc.far = 260;
        sc.updateProjectionMatrix();
        L.sun.shadow.bias = -0.00025;
        L.sun.shadow.normalBias = 0.012 + texel * 0.9;
        L.sun.shadow.radius = ext > 40 ? 3 : 4.5;
      }
    }

    /* ---------------- Ufer-Höhenkarte ---------------- */
    let shoreDirty = false;
    let shoreRT = null;
    const heightMat = new T.ShaderMaterial({
      vertexShader: `
        varying float vY;
        void main() {
          vec4 p = vec4(position, 1.0);
          #ifdef USE_INSTANCING
            p = instanceMatrix * p;
          #endif
          vec4 wp = modelMatrix * p;
          vY = wp.y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        varying float vY;
        void main() { gl_FragColor = vec4(vec3(clamp((vY + 3.0) / 3.5, 0.0, 1.0)), 1.0); }`,
      side: T.DoubleSide,
    });
    // weiches Glätten der Höhenkarte (zwei Durchgänge, 9-Tap-Gauß über lineare Filterung)
    let blur = null;
    function blurShore(wpx, hpx) {
      if (!blur) {
        const m = new T.ShaderMaterial({
          uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2() } },
          vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
          fragmentShader: `uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
            void main() {
              float s = texture2D(tMap, vUv).r * 0.227;
              s += (texture2D(tMap, vUv + uDir * 1.385).r + texture2D(tMap, vUv - uDir * 1.385).r) * 0.316;
              s += (texture2D(tMap, vUv + uDir * 3.231).r + texture2D(tMap, vUv - uDir * 3.231).r) * 0.0703;
              gl_FragColor = vec4(vec3(s), 1.0);
            }`,
          depthTest: false, depthWrite: false,
        });
        const q = new T.Mesh(new T.PlaneGeometry(2, 2), m);
        q.frustumCulled = false;
        const sc = new T.Scene();
        sc.add(q);
        blur = { m, sc, cam: new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), rt: null };
      }
      if (!blur.rt || blur.rt.width !== wpx || blur.rt.height !== hpx) {
        if (blur.rt) blur.rt.dispose();
        blur.rt = new T.WebGLRenderTarget(wpx, hpx, { depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter, generateMipmaps: false });
      }
      const k = 0.8;
      blur.m.uniforms.tMap.value = shoreRT.texture;
      blur.m.uniforms.uDir.value.set(k / wpx, 0);
      R.setRenderTarget(blur.rt);
      R.render(blur.sc, blur.cam);
      blur.m.uniforms.tMap.value = blur.rt.texture;
      blur.m.uniforms.uDir.value.set(0, k / hpx);
      R.setRenderTarget(shoreRT);
      R.render(blur.sc, blur.cam);
    }
    function bakeShore() {
      shoreDirty = false;
      const ids = Object.keys(W.islands || {});
      if (!ids.length) return;
      try {
        scene.updateMatrixWorld(true);
        const box = new T.Box3();
        ids.forEach((id) => box.expandByObject(W.islands[id].group));
        box.expandByScalar(3);
        const minX = box.min.x, maxZ = box.max.z;
        const sx = box.max.x - box.min.x, sz = box.max.z - box.min.z;
        const wpx = 1024, hpx = Math.max(64, Math.min(1024, Math.round((1024 * sz) / sx)));
        if (!shoreRT || shoreRT.width !== wpx || shoreRT.height !== hpx) {
          if (shoreRT) shoreRT.dispose();
          shoreRT = new T.WebGLRenderTarget(wpx, hpx, { depthBuffer: true, minFilter: T.LinearFilter, magFilter: T.LinearFilter, generateMipmaps: false });
        }
        const cx = box.min.x + sx / 2, cz = box.min.z + sz / 2;
        const cam = new T.OrthographicCamera(-sx / 2, sx / 2, sz / 2, -sz / 2, 1, 80);
        cam.up.set(0, 0, -1);
        cam.position.set(cx, 40, cz);
        cam.lookAt(cx, 0, cz);
        cam.updateMatrixWorld();
        const set = new Set(ids.map((id) => W.islands[id].group));
        const hidden = [];
        scene.children.forEach((c) => { if (!set.has(c) && !c.isLight && c.visible) { c.visible = false; hidden.push(c); } });
        set.forEach((g) => g.traverse((o) => { if ((o.isPoints || o.isSprite || o.isLine) && o.visible) { o.visible = false; hidden.push(o); } }));
        const prev = { target: R.getRenderTarget(), clear: R.getClearColor(new T.Color()), alpha: R.getClearAlpha(), bg: scene.background, fog: scene.fog, ov: scene.overrideMaterial, sm: R.shadowMap.autoUpdate };
        scene.background = null;
        scene.fog = null;
        scene.overrideMaterial = heightMat;
        R.shadowMap.autoUpdate = false;
        R.setRenderTarget(shoreRT);
        R.setClearColor(0x000000, 1);
        R.clear(true, true, true);
        R.render(scene, cam);
        blurShore(wpx, hpx);
        R.setRenderTarget(prev.target);
        R.setClearColor(prev.clear, prev.alpha);
        scene.background = prev.bg;
        scene.fog = prev.fog;
        scene.overrideMaterial = prev.ov;
        R.shadowMap.autoUpdate = prev.sm;
        R.shadowMap.needsUpdate = true;
        hidden.forEach((o) => { o.visible = true; });
        waterU.uShore.value = shoreRT.texture;
        waterU.uShoreBox.value.set(minX, maxZ, 1 / sx, -1 / sz);
        waterU.uShoreOn.value = 1;
      } catch (e) {
        console.warn('w3d env: Uferkarte', e);
        waterU.uShoreOn.value = 0;
      }
    }
    function setIslandUniforms() {
      const arr = waterU.uIsl.value;
      let n = 0;
      const box = new T.Box3();
      const add = (x, z, r) => { if (n < MAX_ISL) arr[n++].set(x, z, r, 0); };
      Object.keys(W.islands || {}).forEach((id) => {
        const I = W.islands[id];
        box.setFromObject(I.group);
        const r = box.isEmpty() ? 6 : Math.max(3, ((box.max.x - box.min.x) + (box.max.z - box.min.z)) / 4 - 1.9);
        add(I.pos.x, I.pos.z, Math.min(r, 7.5));
      });
      islets.forEach((i) => add(i.x, i.z, i.r));
      waterU.uIslN.value = n;
      // Mitte der Inselwelt für die hellere Lagune
      let cx = 0, cz = 0, m = 0;
      Object.keys(W.islands || {}).forEach((id) => { cx += W.islands[id].pos.x; cz += W.islands[id].pos.z; m++; });
      if (m) waterU.uArch.value.set(cx / m, cz / m, 0.8, 1.15);
    }

    /* ---------------- pro Bild ---------------- */
    W.onFrame((dt, t) => {
      if (shoreDirty) bakeShore();
      stepMood(dt);
      skyUniforms.uTime.value = t;
      waterU.uTime.value = t;
      pollen.material.uniforms.uTime.value = t;
      pollen.material.uniforms.uPR.value = R.getPixelRatio();
      const lowQ = W.quality === 'low';
      pollen.visible = !lowQ;
      updateClouds(t);
      if (gulls) { gulls.visible = !lowQ; if (!lowQ) gulls.userData.update(t); }
      fitShadow();
    });

    // nach Verlust des WebGL-Kontexts: Uferkarte und Reflexe neu erzeugen
    if (W.canvas && W.canvas.addEventListener) {
      W.canvas.addEventListener('webglcontextrestored', () => {
        Object.keys(envMaps).forEach((k) => { delete envMaps[k]; });
        pmrem = null;
        const e = envFor(api.mood);
        if (e) scene.environment = e;
        shoreRT = null;
        shoreDirty = true;
      });
    }

    W.env = api;
    return {
      ready() {
        setIslandUniforms();
        shoreDirty = true; // beim ersten Bild (nach allen 'ready'-Schritten) backen
      },
    };
  }
})();
