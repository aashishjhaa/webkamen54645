'use client';
import { useEffect, useRef } from 'react';
import { WHATSAPP_URL } from '@/lib/site';
import { Icon } from './Icons';

/** Independent of WebGL. Reserve the right-hand dock, moving only when an
 * actionable control would otherwise be underneath the fixed 56 px button. */
export default function WhatsAppBubble() {
  const bubble=useRef<HTMLAnchorElement>(null);
  useEffect(()=>{
    const node=bubble.current;if(!node)return;
    let frame=0,lift=0;
    const measure=()=>{
      frame=0;const rect=node.getBoundingClientRect();const base=rect.top+lift;
      const obstacles=Array.from(document.querySelectorAll<HTMLElement>('a,button,input,select,textarea')).filter(el=>el!==node&&!el.closest('.trap')&&!el.closest('dialog:not([open])')).map(el=>el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0&&r.right>rect.left-5&&r.left<rect.right+5&&r.bottom>0&&r.top<innerHeight).sort((a,b)=>b.top-a.top);
      let top=base;
      for(const r of obstacles){if(top+rect.height>r.top-7&&top<r.bottom+7)top=r.top-rect.height-8;}
      // On very short screens the CSS mobile-menu rail leaves a safe right edge.
      const next=Math.max(0,Math.round(base-Math.max(8,top)));
      if(next!==lift){lift=next;node.style.marginBottom=`${lift}px`;}
    };
    const queue=()=>{if(!frame)frame=requestAnimationFrame(measure);};
    const ro=new ResizeObserver(queue);ro.observe(document.body);
    const mo=new MutationObserver(queue);mo.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);
    window.visualViewport?.addEventListener('resize',queue);document.addEventListener('focusin',queue);queue();
    return ()=>{cancelAnimationFrame(frame);ro.disconnect();mo.disconnect();window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);window.visualViewport?.removeEventListener('resize',queue);document.removeEventListener('focusin',queue);};
  },[]);
  return <a ref={bubble} href={WHATSAPP_URL} className="whatsapp-bubble" target="_blank" rel="noopener noreferrer" aria-label="Chat with WebKamen on WhatsApp"><Icon name="whatsapp" size={29}/><span className="wa-tooltip" aria-hidden="true">Chat on WhatsApp</span></a>;
}
