// Remotion-Konfiguration für die Flo-Erklärvideos.
// Wird von `npx remotion render|still|studio` automatisch gelesen.
import {Config} from '@remotion/cli/config';

// Remotion 4 braucht die chrome-headless-shell (nicht das volle Chromium).
// Überschreibbar mit REMOTION_BROWSER=/pfad/zur/chrome-headless-shell.
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ||
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(Number(process.env.VIDEO_CONCURRENCY || 2));
Config.setPublicDir('public');
// Zwischenstufe in hoher Qualität; render.mjs komprimiert danach endgültig (crf ~30).
Config.setCodec('h264');
Config.setCrf(16);
Config.setX264Preset('veryfast');
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setAudioBitrate('128k');
