import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
const mark = JSON.parse(await readFile('src/lib/mark-points.json','utf8'));
const polygons = mark.outlines.map(p=>`<polygon points="${p.map(a=>a.join(',')).join(' ')}"/>`).join('');
await writeFile('public/wk-mark.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 273" fill="#F2EADD">${polygons}</svg>`);
await writeFile('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="#0C151C"/><g transform="translate(6 18) scale(.104)" fill="#F2EADD">${polygons}</g></svg>`);
let lines = '';
for (let i=0;i<72;i++) {
  const points=[];
  for (let x=-60;x<=1670;x+=10) {
    const u=x/1600, v=i/71;
    const y=440 + 46*Math.sin(u*10-1.3+v*.8) + 29*Math.sin(u*18+v*2.8) + 103*v - 68*Math.exp(-Math.pow((u-.73)/.16,2)) - 283*Math.pow(Math.max(0,u-.76)*3.5,2)*(1-v*.2);
    points.push(`${x},${y.toFixed(2)}`);
  }
  lines+=`<polyline points="${points.join(' ')}" stroke-opacity="${(.1+.18*Math.sin(i/71*Math.PI)).toFixed(3)}"/>`;
}
await writeFile('public/images/studio-contours.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 580" preserveAspectRatio="none"><g fill="none" stroke="#99a8aa" stroke-width="0.7">${lines}</g></svg>`);
const noise=Buffer.alloc(128*128); let seed=5;
for(let i=0;i<noise.length;i++){ seed=seed*16807%2147483647;noise[i]=Math.floor(seed/2147483647*255); }
await sharp(noise,{raw:{width:128,height:128,channels:1}}).png().toFile('public/images/paper-grain.png');
await sharp('public/images/arc-lamp-studio.jpg').resize(1440).webp({quality:88}).toFile('public/images/arc-lamp-studio.webp');

const [font400, font500, font600] = await Promise.all([
  readFile('src/fonts/poppins-latin-400-normal.woff2'),
  readFile('src/fonts/poppins-latin-500-normal.woff2'),
  readFile('src/fonts/poppins-latin-600-normal.woff2'),
]);

const bundled=await build({ stdin:{ contents:`import { createStudio } from './src/lib/studio-scene.ts'; window.makeStudio=createStudio;`, resolveDir:process.cwd(), loader:'ts' },bundle:true,write:false,format:'iife',minify:true });
const browser = await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="stage"></canvas></body></html>');
  await page.addScriptTag({content:bundled.outputFiles[0].text});
  let heroDataUrl = '';
  for(const [view,w,h] of [['hero',1500,900],['detail',1600,620]]) {
    const data=await page.evaluate(({view,w,h})=>{ const canvas=document.getElementById('stage'); const scene=window.makeStudio(canvas,view,true); scene.resize(w,h,1); scene.render(0,0,0); const image=canvas.toDataURL('image/png'); scene.dispose(); canvas.replaceWith(Object.assign(document.createElement('canvas'),{id:'stage'})); return image;},{view,w,h});
    if (view === 'hero') heroDataUrl = data;
    await sharp(Buffer.from(data.split(',')[1],'base64')).webp({quality:94,alphaQuality:100}).toFile(`public/images/wk-${view}.webp`);
  }

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:'Poppins';font-weight:400;src:url(data:font/woff2;base64,${font400.toString('base64')}) format('woff2')}
    @font-face{font-family:'Poppins';font-weight:500;src:url(data:font/woff2;base64,${font500.toString('base64')}) format('woff2')}
    @font-face{font-family:'Poppins';font-weight:600;src:url(data:font/woff2;base64,${font600.toString('base64')}) format('woff2')}
    body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:'Poppins',sans-serif;background:radial-gradient(circle at 72% 48%,#34404a 0%,#0c151c 74%);color:#f2eadd;position:relative;-webkit-font-smoothing:antialiased}
    .brand{position:absolute;left:64px;top:64px;display:flex;align-items:center;gap:14px;font-size:26px;font-weight:600;letter-spacing:-0.03em}
    .brand svg{width:44px;height:25px;fill:#f2eadd}
    .headline{position:absolute;left:64px;top:214px;font-size:60px;font-weight:500;line-height:1.08;letter-spacing:-0.045em}
    .eyebrow{position:absolute;left:68px;bottom:92px;font-size:14px;font-weight:500;letter-spacing:0.18em;color:#aab0ae}
    .hero-img{position:absolute;left:510px;top:95px;width:690px;height:414px;object-fit:contain}
  </style></head><body>
    <div class="brand"><svg viewBox="0 0 502 273">${polygons}</svg><span>WebKamen</span></div>
    <div class="headline">From first click<br/>to follow-through.</div>
    <div class="eyebrow">INDEPENDENT DIGITAL STUDIO</div>
    <img class="hero-img" src="${heroDataUrl}" alt=""/>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const ogPng = await page.screenshot({ type: 'png' });
  await sharp(ogPng).jpeg({ quality: 91 }).toFile('public/images/social-preview.jpg');
  console.log('Generated matching WebGL posters, Poppins social artwork, favicon, outline, contours, grain, and social artwork using the bundled Poppins files.');
} finally { await browser.close(); }
