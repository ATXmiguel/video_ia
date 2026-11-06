// Render chosen frames of a data-built film as small JPEGs with one browser, without rendering the film.
// Fast enough to read every shot's middle frame after each change to the data.
// usage: node scripts/film_stills.mjs <build.json> <outdir> <scale> <frame> [frame...]   or  @file.txt with one frame per line
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [buildPath, outDir, scaleStr, ...rest] = process.argv.slice(2);
const scale = Number(scaleStr);
const frames = rest.flatMap((a) => (a.startsWith('@') ? fs.readFileSync(a.slice(1), 'utf8').split(/\s+/).filter(Boolean) : [a])).map(Number);
fs.mkdirSync(outDir, {recursive: true});
const inputProps = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl, id: inputProps.format === 'short' ? 'ShortFilm' : 'SpecialFilm', inputProps, puppeteerInstance: browser});
let next = 0;
const worker = async () => {
  while (next < frames.length) {
    const frame = frames[next++];
    await renderStill({composition, serveUrl, frame, output: path.join(outDir, `f${String(frame).padStart(6, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 80, scale, inputProps, puppeteerInstance: browser, logLevel: 'error'});
  }
};
await Promise.all(Array.from({length: 6}, worker));
await browser.close({silent: true});
console.log(`rendered ${frames.length} stills to ${outDir}`);
