// No network delivery is permitted by this test. A provider function is injected
// only into the internal handler, never through the public HTTP endpoint.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
await mkdir('.artifacts',{recursive:true});
await build({entryPoints:['src/server/contact.ts'],bundle:true,format:'cjs',platform:'node',packages:'external',outfile:'.artifacts/contact-handler.cjs'});
const {handleContact}=require('../.artifacts/contact-handler.cjs');
const recipient=process.env.WEBKAMEN_TEST_RECIPIENT||process.env.CONTACT_TO_EMAIL;
assert.ok(recipient,'Supply the owner-designated destination as WEBKAMEN_TEST_RECIPIENT (never printed).');
process.env.CONTACT_TO_EMAIL=recipient;process.env.RESEND_API_KEY=`test-only-${randomUUID()}`;process.env.CONTACT_FROM_EMAIL='WebKamen <test@example.com>';
const suite=randomUUID();
const body={name:'Mira Example',email:'mira@example.com',service:'websites',details:`A fictional test: 12 lamps. <b>This is plain text.</b>\nSecond line ${suite}`,website:'',startedAt:Date.now()-5000};
let calls=0;const send=async(url,opts)=>{calls++;assert.equal(url,'https://api.resend.com/emails');const outgoing=JSON.parse(opts.body);assert.deepEqual(outgoing.to,[recipient]);assert.equal(outgoing.reply_to,body.email);assert.equal(outgoing.bcc,undefined);assert.equal(outgoing.cc,undefined);assert.equal(outgoing.html,undefined);assert.ok(outgoing.text.includes(body.name));assert.ok(outgoing.text.includes('Website'));assert.ok(outgoing.text.includes(body.details));assert.ok(opts.headers['Idempotency-Key']);return Response.json({id:'mock-accepted-id'});};
const request=(data=body,ip='primary',headers={})=>new Request('https://web.kamen.in/api/contact',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':`${suite}-${ip}`,...headers},body:JSON.stringify(data)});
const run=(data=body,provider=send,ip='primary',headers={})=>handleContact(request(data,ip,headers),provider);
try{
  let r=await run({...body,to:'different@example.com',cc:'ignored@example.com'});assert.equal(r.status,200);assert.equal((await r.json()).accepted,true);assert.equal(calls,1);console.log('PASS provider acceptance, fixed destination, Reply-To, full plain-text body, no cc/bcc');
  r=await run();assert.equal(r.status,200);assert.equal(calls,1);console.log('PASS duplicate does not call the provider twice');
  for(const bad of [{name:''},{email:'not-an-email'},{service:'invalid'},{details:'short'},{name:'Name\nBcc: bad'},{website:'spam'},{startedAt:Date.now()+10000}])assert.equal((await run({...body,...bad})).status,422);
  assert.equal((await run({...body,details:'a'.repeat(35000)})).status,413);assert.equal((await run(body,send,'primary',{origin:'https://other.example'})).status,403);assert.equal((await run(body,send,'primary',{'content-type':'text/plain'})).status,415);console.log('PASS required fields, email, service, header injection, honeypot, timing, size, origin, media type');
  const failed=await run({...body,details:body.details+' provider error'},async()=>Response.json({message:'private provider details'},{status:400}));assert.equal(failed.status,503);const err=await failed.json();assert.equal(err.accepted,false);assert.ok(!err.message.includes('private provider details'));console.log('PASS provider rejection never confirms delivery and never leaks provider details');
  const noid=await run({...body,details:body.details+' no acceptance ID'},async()=>Response.json({}));assert.equal(noid.status,503);console.log('PASS successful HTTP response without an acceptance ID is not confirmation');
  let deliveries=0;const slow=async()=>{deliveries++;await new Promise(resolve=>setTimeout(resolve,160));return Response.json({id:'mock-concurrent'});};const same={...body,details:body.details+' simultaneous'};const pair=await Promise.all([run(same,slow,'parallel'),run(same,slow,'parallel')]);assert.equal(deliveries,1);assert.deepEqual(pair.map(r=>r.status).sort(),[200,409]);console.log('PASS concurrent duplicate guarded atomically');
  for(let i=0;i<5;i++)assert.equal((await run({...body,details:body.details+' rate'+i},async()=>Response.json({id:'mock'}),'rate')).status,200);assert.equal((await run({...body,details:body.details+' rate6'},send,'rate')).status,429);console.log('PASS shared five-per-15-minute rate limit');
  process.env.CONTACT_TO_EMAIL='wrong@example.com';assert.equal((await run()).status,503);delete process.env.RESEND_API_KEY;assert.equal((await run()).status,503);console.log('PASS missing settings and wrong destination fail closed');
  console.log(`All delivery checks passed (${process.env.DATABASE_URL?'PostgreSQL':'per-instance'} guard); zero actual emails sent.`);
}catch(error){console.error(error);process.exitCode=1;}
