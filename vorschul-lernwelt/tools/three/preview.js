#!/usr/bin/env node
/* Vorschau der 3D-Welt als Bild (für die Entwicklung und Sichtprüfung).
   node tools/three/preview.js --place=home --out=/pfad/bild.png [--w=1180 --h=820] [--ui] [--wait=2500]
   Orte: splash | home | sky | area:<id> | game:<id> | reise:<id> | inspect:<id>[:winkel[:abstand[:höhe]]]
   --ui        Oberfläche (DOM) mit abbilden, sonst nur die 3D-Welt
   --screen=   vor der Aufnahme einen App-Bildschirm öffnen: home | area:<id> | game:<id>:<stufe> | splash | reise | album
   --eval=     zusätzlicher JS-Code im Browser (z. B. "LT.w3d.flo && LT.w3d.flo.cheer()")
   --scale=2   Gerätepixelverhältnis */
const path = require('path');
const { chromium } = require('playwright');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const ROOT = path.resolve(__dirname, '..', '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: Number(args.w || 1180), height: Number(args.h || 820) }, deviceScaleFactor: Number(args.scale || 1) });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(ROOT, 'index.html') + '?test&3d=1');
  await p.waitForFunction(() => window.LT && LT.app && LT.w3d);
  const ok = await p.evaluate(() => LT.w3d.start());
  if (!ok) { console.error('3D startet nicht'); process.exit(1); }
  if (args.screen) {
    const [s, id, lv] = String(args.screen).split(':');
    await p.evaluate(([s, id, lv]) => {
      if (s === 'home') LT.app.showHome();
      else if (s === 'area') LT.app.showArea(id);
      else if (s === 'game') LT.app.startGame ? LT.app.startGame(id, { level: Number(lv || 1) }) : LT.test.start(id, Number(lv || 1));
      else if (s === 'splash') LT.app.showSplash();
      else if (s === 'reise') LT.reise.show();
      else if (s === 'album') LT.app.showAlbum();
    }, [s, id, lv]);
  }
  if (args.place) {
    const [kind, id, a, d, h] = String(args.place).split(':');
    await p.evaluate(([kind, id, a, d, h]) => {
      const place = ['home', 'splash', 'sky'].includes(kind) ? kind : { kind, id, angle: a == null ? undefined : Number(a), dist: d == null ? undefined : Number(d), height: h == null ? undefined : Number(h) };
      LT.w3d.go(place, { instant: true });
    }, [kind, id, a, d, h]);
  }
  if (args.eval) await p.evaluate(args.eval);
  await p.waitForTimeout(Number(args.wait || 2500));
  if (!args.ui) await p.evaluate(() => { document.getElementById('app').style.visibility = 'hidden'; document.querySelectorAll('.mascot,.bubble').forEach((n) => (n.style.visibility = 'hidden')); });
  await p.screenshot({ path: args.out || 'preview.png' });
  const dbg = await p.evaluate(() => LT.w3d.debug());
  const info = await p.evaluate(() => { const r = LT.w3d.renderer.info; return { calls: r.render.calls, triangles: r.render.triangles, geometries: r.memory.geometries, textures: r.memory.textures }; });
  console.log(JSON.stringify({ out: args.out, dbg, info, errors: errs.slice(0, 10) }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
