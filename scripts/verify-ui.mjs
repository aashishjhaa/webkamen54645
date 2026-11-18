import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const wa='https://wa.me/917021995833?text=Hey%20I%20want%20help%20for%20my%20business';
const sizes=[[360,800],[390,844],[768,1024],[1024,768],[1440,900],[844,390]];
const pages=['/','/services','/about','/contact'];
await mkdir('.artifacts/screens',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const results=[];const errors=[];
const pass=(text)=>{results.push(text);console.log('PASS',text);};
try{
  const ctx=await browser.newContext({reducedMotion:'reduce'});const page=await ctx.newPage();
  page.on('pageerror',err=>errors.push(String(err)));
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    for(const route of pages){
      const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
      await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(75);const hits=await page.evaluate(()=>{const b=document.querySelector('.whatsapp-bubble').getBoundingClientRect();return [...document.querySelectorAll('button,input,select,textarea,.main-nav a,.hero-actions a')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&r.right>b.left+1&&r.left<b.right-1&&r.top<b.bottom-1&&r.bottom>b.top+1;}).map(el=>el.tagName);});assert.deepEqual(hits,[],`WhatsApp does not cover controls at ${width} on ${route}`);assert.equal(await page.locator('h1').count(),1);
      const metric=await page.evaluate(()=>({window:innerWidth,doc:document.documentElement.scrollWidth}));assert.ok(metric.doc<=metric.window+1,`${route} overflows at ${width}: ${JSON.stringify(metric)}`);
      assert.equal(await page.locator('.whatsapp-bubble').count(),1);assert.equal(await page.locator('.whatsapp-bubble').getAttribute('href'),wa);
      assert.equal(await page.getByRole('link',{name:'Instagram',exact:true}).getAttribute('href'),'https://www.instagram.com/webkamen');
      assert.equal(await page.getByRole('link',{name:'Facebook',exact:true}).getAttribute('href'),'https://www.facebook.com/profile.php?id=61576799994690');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),`https://web.kamen.in${route==='/'?'':route}`);
      await page.screenshot({path:`.artifacts/screens/${width}x${height}-${route.slice(1)||'home'}.jpg`,type:'jpeg',quality:84,fullPage:true});
    }
    pass(`Four direct routes, social links, WhatsApp, canonicals, no horizontal overflow: ${width}×${height}`);
  }
  assert.equal(new URL(wa).searchParams.get('text'),'Hey I want help for my business');assert.equal(new URL(wa).pathname,'/917021995833');
  await page.setViewportSize({width:1440,height:900});await page.goto(base+'/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.sculpture').getAttribute('data-renderer'),'static');assert.equal(await page.locator('.sculpture canvas').count(),0);
  assert.ok(await page.locator('.sculpture-poster').evaluate(img=>img.complete&&img.naturalWidth>0));pass('Reduced-motion poster is loaded; renderer not created');
  await page.getByRole('tab',{name:/The ad/}).focus();await page.keyboard.press('ArrowDown');assert.equal(await page.getByRole('tab',{name:/The website/}).getAttribute('aria-selected'),'true');
  await page.getByRole('button',{name:'Request a trade quote'}).click();await page.getByText('Ready for review',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Review the draft'}).click();await page.getByLabel('Draft reply to Mira').fill('Hello Mira, we will prepare a trade quote for your 12 brushed-brass Arc lamps.');await page.getByRole('button',{name:'Mark as reviewed'}).click();await page.getByText('Reviewed by you',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Previous demonstration step'}).click();assert.equal(await page.getByRole('tab',{name:/The website/}).getAttribute('aria-selected'),'true');
  await page.getByRole('button',{name:'Next demonstration step'}).click();assert.equal(await page.getByRole('tab',{name:/The AI agent/}).getAttribute('aria-selected'),'true');pass('Keyboard tabs, quote handoff, editable human-review dialog, backward/forward controls');
  for(const [service,label] of [['websites','Discuss a website'],['advertising','Discuss a campaign'],['ai-agents','Discuss an AI agent']]){
    await page.goto(base+'/services');await page.getByRole('link',{name:label,exact:true}).click();await page.waitForURL(`**/contact?service=${service}`);assert.equal(await page.locator('select[name=service]').inputValue(),service);
  }pass('Every service CTA preselects the correct contact option');
  await page.getByLabel('Name *',{exact:true}).fill('Mira Example');await page.getByLabel('Email *',{exact:true}).fill('mira@example.com');await page.getByLabel('Project details *',{exact:true}).fill('A fictional inquiry to test the form without a delivery provider.');
  await page.waitForTimeout(710);const failure=page.waitForResponse(r=>r.url().endsWith('/api/contact')&&r.request().method()==='POST');await page.getByRole('button',{name:'Send inquiry',exact:true}).click();assert.equal((await failure).status(),503);await page.locator('form[aria-label="Project inquiry"]').getByRole('alert').waitFor();
  assert.equal(await page.locator('input[name=name]').inputValue(),'Mira Example');await page.reload();assert.equal(await page.locator('input[name=name]').inputValue(),'Mira Example');pass('Actual unconfigured endpoint returns 503; draft preserved after failure and reload');
  let submitted=0;await page.route('**/api/contact',async r=>{submitted++;await new Promise(resolve=>setTimeout(resolve,500));await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({accepted:true,message:'Accepted by test provider.'})});});
  await page.getByRole('button',{name:'Send inquiry',exact:true}).click();assert.ok(await page.getByRole('button',{name:'Sending inquiry…'}).isDisabled());await page.getByRole('heading',{name:'Thank you, Mira.'}).waitFor();assert.equal(submitted,1);assert.equal(await page.evaluate(()=>sessionStorage.getItem('webkamen-inquiry-draft-v1')),null);pass('Mocked acceptance: single pending submission, confirmation, draft cleared');
  await page.unroute('**/api/contact');await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.getByRole('button',{name:'Open menu'}).click();assert.ok(await page.getByRole('button',{name:'Close menu'}).isVisible());await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open menu'}).getAttribute('aria-expanded'),'false');
  await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click();await page.waitForURL('**/about');pass('Mobile menu opens, exposes close, closes on Escape, navigates');
  const live=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});const lp=await live.newPage();lp.on('pageerror',e=>errors.push(String(e)));await lp.goto(base+'/',{waitUntil:'networkidle'});await lp.waitForSelector('[data-renderer=live]',{timeout:25000});await lp.waitForTimeout(2900);const before=await lp.locator('.sculpture-art').screenshot();await lp.getByRole('button',{name:'Turn the mark'}).focus();await lp.keyboard.press('Enter');await lp.getByText('Turning…',{exact:true}).waitFor();await lp.waitForTimeout(650);const turned=await lp.locator('.sculpture-art').screenshot();const [a,b]=await Promise.all([before,turned].map(buf=>sharp(buf).resize(240).removeAlpha().raw().toBuffer()));let changed=0;for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>6)changed++;assert.ok(changed/a.length>.01,'Turning changes the actual rendered pixels');pass('Visible sculpture motion verified by frame comparison');await lp.getByText('The mark has returned to rest.',{exact:true}).waitFor({timeout:15000});await lp.screenshot({path:'.artifacts/screens/home-live-desktop.jpg',type:'jpeg',quality:94});
  await lp.goto(base+'/about');await lp.locator('.sculpture-detail').scrollIntoViewIfNeeded();await lp.waitForSelector('.sculpture-detail[data-renderer=live]');pass('Actual WebGL renderer on Home and About; keyboard turn and return to rest');
  const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const tp=await touch.newPage();await tp.goto(base+'/',{waitUntil:'networkidle'});await tp.waitForSelector('[data-renderer=live]');await tp.locator('.sculpture-art').tap();await tp.getByText('Turning…',{exact:true}).waitFor();await tp.getByRole('tab',{name:/The website/}).tap();await tp.getByRole('button',{name:'Request a trade quote'}).tap();await tp.getByText('Ready for review',{exact:true}).waitFor();pass('Touch emulation: sculpture tap, step selection, quote handoff');
  const fallback=await browser.newContext({viewport:{width:1024,height:768}});await fallback.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return orig.call(this,type,...args);};});const fp=await fallback.newPage();await fp.goto(base+'/',{waitUntil:'networkidle'});await fp.waitForSelector('[data-renderer=static]');assert.ok(await fp.locator('.sculpture-poster').isVisible());await fp.getByRole('tab',{name:/The AI agent/}).click();await fp.getByText('Ready for review',{exact:true}).waitFor();assert.equal(await fp.locator('.whatsapp-bubble').getAttribute('href'),wa);pass('Unavailable WebGL: static poster, workflow controls, and WhatsApp remain usable');
  assert.deepEqual(errors,[]);pass('No uncaught browser errors');
  await writeFile('.artifacts/ui-results.json',JSON.stringify({results,errors},null,2));
}finally{await browser.close();}
