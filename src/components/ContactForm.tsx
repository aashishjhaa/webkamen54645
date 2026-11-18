'use client';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { SERVICES, WHATSAPP_URL, isService, type ServiceKey } from '@/lib/site';
import { Icon } from './Icons';
type Draft={name:string;email:string;service:ServiceKey;details:string};
const key='webkamen-inquiry-draft-v1';
function subscribeDraft(notify:()=>void) {
  window.addEventListener('storage',notify);window.addEventListener('webkamen-draft',notify);
  return ()=>{window.removeEventListener('storage',notify);window.removeEventListener('webkamen-draft',notify);};
}
function storedDraft():string|null { try{return sessionStorage.getItem(key);}catch{return null;} }
function persist(draft:Draft|null) {
  try{if(draft)sessionStorage.setItem(key,JSON.stringify(draft));else sessionStorage.removeItem(key);window.dispatchEvent(new Event('webkamen-draft'));}catch{/* In-memory edits work even if storage is unavailable. */}
}
export default function ContactForm({preselected}:{preselected?:ServiceKey}) {
  const empty:Draft={name:'',email:'',service:preselected??'exploring',details:''};
  const snapshot=useSyncExternalStore(subscribeDraft,storedDraft,()=>null);
  const restored=useMemo<Draft>(()=>{
    try{const d=JSON.parse(snapshot||'null');if(d&&typeof d.name==='string'&&typeof d.email==='string'&&typeof d.details==='string')return {name:d.name.slice(0,100),email:d.email.slice(0,254),details:d.details.slice(0,6000),service:preselected??(isService(d.service)?d.service:'exploring')};}catch{/* Ignore malformed storage. */}
    return {name:'',email:'',details:'',service:preselected??'exploring'};
  },[snapshot,preselected]);
  const [edits,setDraft]=useState<Draft|null>(null),[status,setStatus]=useState<'idle'|'sending'|'failed'|'sent'>('idle'),[message,setMessage]=useState('');
  const draft=edits??restored;
  const honeypot=useRef<HTMLInputElement>(null),started=useRef(0),locked=useRef(false),result=useRef<HTMLDivElement>(null);
  useEffect(()=>{started.current=Date.now();},[]);
  useEffect(()=>{if(status==='sent'||status==='failed')result.current?.focus({preventScroll:true});},[status]);
  function update(field:keyof Draft,value:string){const next={...draft,[field]:value};setDraft(next);persist(next);if(status==='failed')setStatus('idle');}
  async function send(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();if(locked.current)return;
    if(!draft.name.trim()||draft.details.trim().length<10){setMessage('Add your name and at least 10 characters of project details.');setStatus('failed');return;}
    locked.current=true;setStatus('sending');setMessage('');
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,website:honeypot.current?.value||'',startedAt:started.current}),signal:AbortSignal.timeout(20000)});
      const data=await response.json();
      if(!response.ok||data.accepted!==true)throw new Error(data.message||'We couldn’t send your inquiry right now. Your draft is saved.');
      setDraft(draft);setStatus('sent');persist(null);
    }catch(error){setMessage(error instanceof Error&&error.name!=='TimeoutError'&&error.message!=='Failed to fetch'?error.message:'We couldn’t reach the delivery service. Your draft is saved; please try again or use WhatsApp.');setStatus('failed');}
    finally{locked.current=false;}
  }
  if(status==='sent')return <div ref={result} className="form-panel form-success" role="status" tabIndex={-1}><span className="success-symbol"><Icon name="check" size={28}/></span><span className="eyebrow">INQUIRY ACCEPTED</span><h2>Thank you, {draft.name.trim().split(' ')[0]}.</h2><p>Your inquiry has been accepted for delivery. We’ll follow up using the email address you provided.</p><button type="button" className="text-link" onClick={()=>{setDraft(empty);setStatus('idle');started.current=Date.now();}}>Start another inquiry<Icon name="arrow-right" size={15}/></button></div>;
  return <form className="form-panel" onSubmit={send} aria-label="Project inquiry" aria-busy={status==='sending'}><div className="form-intro"><span className="eyebrow"><b/> PROJECT BRIEF</span><span>* Required</span></div>
    <fieldset disabled={status==='sending'}><div className="form-row"><label>Name <span>*</span><input autoComplete="name" name="name" required maxLength={100} placeholder="Your name" value={draft.name} onChange={e=>update('name',e.target.value)}/></label><label>Email <span>*</span><input autoComplete="email" inputMode="email" type="email" name="email" required maxLength={254} placeholder="you@company.com" value={draft.email} onChange={e=>update('email',e.target.value)}/></label></div>
    <label>Service<div className="select-wrap"><select name="service" value={draft.service} onChange={e=>update('service',e.target.value)}>{Object.entries(SERVICES).map(([v,label])=><option value={v} key={v}>{label}</option>)}</select><Icon name="chevron" size={15}/></div></label>
    <label>Project details <span>*</span><textarea name="details" rows={6} minLength={10} maxLength={6000} required placeholder="What are you building, and what would you like it to do?" value={draft.details} onChange={e=>update('details',e.target.value)}/></label>
    <div className="trap" aria-hidden="true"><label>Leave this field empty<input name="website" ref={honeypot} tabIndex={-1} autoComplete="off"/></label></div></fieldset>
    {status==='failed'&&<div className="form-notice" ref={result} tabIndex={-1} role="alert"><strong>Inquiry not sent.</strong><p>{message}</p><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Chat on WhatsApp<Icon name="arrow-up-right" size={13}/></a></div>}
    <div className="form-submit"><button type="submit" className="btn btn-ink" disabled={status==='sending'}>{status==='sending'?'Sending inquiry…':'Send inquiry'}<Icon name={status==='sending'?'mail':'arrow-up-right'} size={16}/></button><p>Your details are only used<br/>to respond to your inquiry.</p></div><span role="status" className="sr-only">{status==='sending'?'Submitting your inquiry. Please wait.':''}</span>
  </form>;
}
