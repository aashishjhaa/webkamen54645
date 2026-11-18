'use client';
import { useRef, useState } from 'react';
import { Icon } from './Icons';
const initialDraft='Hi Mira, thanks for your interest in 12 brushed-brass Arc lamps for your reading room in Bristol. Could you share your delivery postcode and preferred date? Our team will confirm availability and prepare your trade quote.';
export default function AgentBoard() {
  const dialog=useRef<HTMLDialogElement>(null);
  const [draft,setDraft]=useState(initialDraft),[editing,setEditing]=useState(initialDraft),[reviewed,setReviewed]=useState(false);
  const open=()=>{setEditing(draft);dialog.current?.showModal();};
  return <div className="agent-board"><div className="agent-top"><span><Icon name="layers" size={16}/> Inquiry desk</span><span className="review-state"><Icon name={reviewed?'check':'spark'} size={12}/>{reviewed?'Reviewed by you':'Ready for review'}</span></div>
    <div className="agent-content"><span className="ad-kicker">01 / SAMPLE INQUIRY</span><blockquote>“Could you quote 12 Arc lamps in brushed brass for our reading room in Bristol?”</blockquote><span className="inquiry-from">Mira · Northline Studio</span>
      <div className="brief-block"><span className="ad-kicker">02 / STRUCTURED BRIEF</span><dl><div><dt>Product</dt><dd>Arc lamp</dd></div><div><dt>Quantity</dt><dd>12 units</dd></div><div><dt>Finish</dt><dd>Brushed brass</dd></div><div><dt>Delivery</dt><dd>Bristol, UK</dd></div></dl></div>
      <div className="draft-block"><span className="ad-kicker">03 / DRAFT REPLY</span><p>{draft}</p><button type="button" className="text-link" onClick={open}>{reviewed?'Edit reviewed draft':'Review the draft'}<Icon name="arrow-right" size={14}/></button></div>
    </div><div className="agent-foot"><span className="small-dot"/> Human review before sending <span>Example workflow</span></div>
    <dialog ref={dialog} className="review-dialog" aria-label="Review the sample draft reply" onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}><form onSubmit={e=>{e.preventDefault();if(!editing.trim())return;setDraft(editing.trim());setReviewed(true);dialog.current?.close();}}><div className="dialog-top"><span className="eyebrow">SAMPLE WORKSPACE</span><button type="button" className="icon-button" aria-label="Close draft review" onClick={()=>dialog.current?.close()}><Icon name="close"/></button></div><h3>Review the reply.</h3><p>Make the draft your own. This example never sends an email.</p><label htmlFor="review-reply">Draft reply to Mira</label><textarea id="review-reply" value={editing} onChange={e=>setEditing(e.target.value)} maxLength={1800} required rows={7}/><button type="submit" className="btn btn-ink" disabled={!editing.trim()}>Mark as reviewed<Icon name="check" size={16}/></button></form></dialog>
  </div>;
}
