'use client';
import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import { CampaignArtwork, ProductPage } from './Artboards';
import AgentBoard from './AgentBoard';
import { Icon } from './Icons';
const steps=[
  {name:'The ad',sub:'Make the first impression.',service:'advertising',link:'Explore digital advertising',caption:'Campaign creative'},
  {name:'The website',sub:'Turn interest into an inquiry.',service:'websites',link:'Explore website development',caption:'Product experience'},
  {name:'The AI agent',sub:'Prepare the next conversation.',service:'ai-agents',link:'Explore AI agent development',caption:'Inquiry workspace'},
];
function subscribeLocation(notify:()=>void){window.addEventListener('popstate',notify);return ()=>window.removeEventListener('popstate',notify);}
function linkedStep(){return new URLSearchParams(window.location.search).get('demo')==='agent'?2:0;}
function subscribeWidth(notify:()=>void){const q=matchMedia('(max-width:760px)');q.addEventListener('change',notify);return ()=>q.removeEventListener('change',notify);}
export default function InquiryDemo() {
  const initial=useSyncExternalStore(subscribeLocation,linkedStep,()=>0);
  const narrow=useSyncExternalStore(subscribeWidth,()=>matchMedia('(max-width:760px)').matches,()=>false);
  const [selected,setStep]=useState<number|null>(null);const step=selected??initial;
  const tabs=useRef<(HTMLButtonElement|null)[]>([]);
  const select=(index:number,focus=false)=>{setStep(index);if(focus)tabs.current[index]?.focus({preventScroll:true});};
  const move=(d:number)=>select((step+d+3)%3);
  return <section className="inquiry-section" id="inquiry-demo" aria-labelledby="inquiry-heading"><div className="wrap inquiry-layout"><div className="inquiry-copy"><div className="eyebrow"><b/> INTERACTIVE WALKTHROUGH</div><h2 id="inquiry-heading">Follow one inquiry.</h2><p className="section-intro">One example. Three connected services.<br/>{' '}See how the pieces work together.</p>
    <div className="step-tabs" role="tablist" aria-label="Inquiry demonstration steps" aria-orientation={narrow?'horizontal':'vertical'}>{steps.map((s,i)=><button type="button" key={s.name} ref={el=>{tabs.current[i]=el;}} role="tab" id={`step-${i}`} aria-controls="inquiry-artboard" aria-selected={step===i} tabIndex={step===i?0:-1} onClick={()=>select(i)} onKeyDown={e=>{let next:number|undefined;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%3;if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();select(next,true);}}} className="step-tab"><span className="step-number">0{i+1}</span><span className="step-text"><strong>{s.name}</strong><small>{s.sub}</small></span><Icon name="arrow-right" size={17}/></button>)}</div>
    </div><div className="showcase"><div className="artboard-shell" role="tabpanel" id="inquiry-artboard" aria-labelledby={`step-${step}`} tabIndex={0} key={step}>{step===0?<CampaignArtwork/>:step===1?<ProductPage onQuote={()=>select(2,true)}/>:<AgentBoard/>}</div>
      <div className="showcase-bottom"><div className="showcase-caption"><span className="counter">0{step+1} <i>/</i> 03</span><span>{steps[step].caption}</span></div><div className="showcase-arrows"><button type="button" aria-label="Previous demonstration step" onClick={()=>move(-1)}><Icon name="left" size={16}/></button><button type="button" aria-label="Next demonstration step" onClick={()=>move(1)}><Icon name="right" size={16}/></button></div></div>
      <Link href={`/services#${steps[step].service}`} className="service-jump">{steps[step].link}<Icon name="arrow-up-right" size={13}/></Link>
    </div></div></section>;
}
