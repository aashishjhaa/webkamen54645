import { createHash, createHmac } from 'node:crypto';
import { isService, SERVICES } from '@/lib/site';
import { reserveInquiry, finishInquiry } from './contact-guard';

// Fail closed if a deployment points to anything except the owner's designated inbox.
// The private address itself is supplied only through CONTACT_TO_EMAIL.
const recipientFingerprint = '489d6065b20a6ff11ab58e0f91ddccc6e764becf313a7d6c78ac20b49de588be';
const maxBytes = 32768;
const unavailable='Email delivery is temporarily unavailable. Your draft is saved. Please try again later or chat on WhatsApp.';
const respond=(status:number,message:string,accepted=false,extra:Record<string,string>={})=>Response.json({accepted,message},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
async function readSmallJson(req:Request) {
  if(Number(req.headers.get('content-length')||0)>maxBytes)throw new RangeError();
  const reader=req.body?.getReader();if(!reader)throw new Error();
  const chunks:Uint8Array[]=[];let total=0;
  try {for(;;){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>maxBytes){await reader.cancel();throw new RangeError();}chunks.push(part.value);}}finally{reader.releaseLock();}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function handleContact(req:Request,providerFetch:typeof fetch=fetch) {
  const origin=req.headers.get('origin');
  if(origin){try{const host=new URL(origin).host;if(host!==new URL(req.url).host&&host!==req.headers.get('host'))return respond(403,'Please send your inquiry from the contact page.');}catch{return respond(403,'Please use the contact page.');}}
  if(req.headers.get('sec-fetch-site')==='cross-site')return respond(403,'Please use the contact page.');
  if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return respond(415,'Please submit the project form as JSON.');
  let raw:Record<string,unknown>;
  try{raw=await readSmallJson(req);if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error();}catch(e){return respond(e instanceof RangeError?413:400,e instanceof RangeError?'The inquiry is too large. Please shorten your message.':'The inquiry could not be read. Please check your details.');}
  if(raw.website||typeof raw.startedAt!=='number'||!Number.isFinite(raw.startedAt)||Date.now()-raw.startedAt<650)return respond(422,'Please check your details and submit the form again.');
  const name=typeof raw.name==='string'?raw.name.trim():'',email=typeof raw.email==='string'?raw.email.trim().toLowerCase():'',details=typeof raw.details==='string'?raw.details.trim():'';
  if(!name||name.length>100||/[\u0000-\u001f\u007f]/.test(name))return respond(422,'Enter a name of up to 100 characters.');
  if(email.length>254||!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,63}$/i.test(email)||email.includes('..'))return respond(422,'Enter a valid email address.');
  const service=raw.service;
  if(!isService(service))return respond(422,'Choose one of the available services.');
  if(details.length<10||details.length>6000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(details))return respond(422,'Add between 10 and 6,000 characters of project details.');
  const to=process.env.CONTACT_TO_EMAIL?.trim().toLowerCase(),from=process.env.CONTACT_FROM_EMAIL?.trim(),key=process.env.RESEND_API_KEY?.trim();
  if(!to||!from||!key||/[\r\n]/.test(from)||createHash('sha256').update(to).digest('hex')!==recipientFingerprint)return respond(503,unavailable);
  const hmac=(v:string)=>createHmac('sha256',key).update(v).digest('hex');
  const fingerprint=hmac(JSON.stringify([name,email,service,details,to]));
  const ip=(req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'local').split(',')[0].trim();
  const clientKey=hmac(`client:${ip}`);
  try {
    const decision=await reserveInquiry(fingerprint,clientKey);
    if(decision==='already-sent')return respond(200,'This inquiry has already been accepted for delivery.',true);
    if(decision==='busy')return respond(409,'This inquiry is already being processed. Please wait a moment before trying again.',false,{'Retry-After':'30'});
    if(decision==='limited')return respond(429,'Please wait before sending another inquiry, or chat with us on WhatsApp.',false,{'Retry-After':'900'});
  }catch{return respond(503,unavailable);}
  try {
    // Plain text preserves the full message and does not interpret user-supplied HTML.
    const response=await providerFetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`webkamen-${fingerprint}`},body:JSON.stringify({from,to:[to],reply_to:email,subject:`WebKamen inquiry: ${SERVICES[service]}`,text:`New project inquiry\n\nName: ${name}\nEmail: ${email}\nService: ${SERVICES[service]}\n\nProject details\n${details}`}),signal:AbortSignal.timeout(10500),cache:'no-store'});
    if(!response.ok)throw new Error('Provider unavailable');
    const receipt:unknown=await response.json();
    if(!receipt||typeof receipt!=='object'||!('id' in receipt)||typeof receipt.id!=='string'||!receipt.id)throw new Error('No provider acceptance');
    // An accepted message stays accepted even if the bookkeeping write is interrupted.
    await finishInquiry(fingerprint,'sent').catch(()=>{});
    return respond(200,'Your inquiry has been accepted for delivery.',true);
  }catch{await finishInquiry(fingerprint,'failed').catch(()=>{});return respond(503,unavailable);}
}
