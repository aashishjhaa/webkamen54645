'use client';

import { useEffect, useRef, useState } from 'react';
import type { SceneView, createStudio } from '@/lib/studio-scene';
import { Icon } from './Icons';

type Studio = ReturnType<typeof createStudio>;
export default function Sculpture({ view = 'hero' }: { view?: SceneView }) {
  const host = useRef<HTMLDivElement>(null);
  const action = useRef<() => void>(() => {});
  const [mode,setMode] = useState<'poster'|'live'|'static'>('poster');
  const [turning,setTurning] = useState(false);
  const [caption,setCaption] = useState('');
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let disposed = false, visible = false, loading = false, frame = 0, last = 0, turnStart = -10000, introStart = -10000;
    let x = 0, y = 0, tx = 0, ty = 0, interacting = false, frameCount = 0, dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.6);
    let scene: Studio | undefined, canvas: HTMLCanvasElement | undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const resize = () => { if (scene) { scene.resize(node.clientWidth,node.clientHeight,dpr); scene.render(0,x,y); } };
    const stop = () => { cancelAnimationFrame(frame); frame=0; };
    const draw = (time: number) => {
      frame=0;
      if (!scene || !visible || document.hidden || motion.matches || disposed) return;
      // The stage only draws on entry or interaction, at a maximum of 30 fps.
      if (time-last < 32) { frame=requestAnimationFrame(draw); return; }
      const delta=time-last; last=time;
      if (++frameCount < 20 && frameCount > 3 && delta > 95 && dpr > .9) { dpr=Math.max(.9,dpr-.13); resize(); }
      const t=Math.min(1,Math.max(0,(time-turnStart)/2200));
      const intro=Math.min(1,Math.max(0,(time-introStart)/2700));
      x += (tx-x)*.14; y += (ty-y)*.14;
      const a = Math.sin(t*Math.PI)**2 * .195 + Math.sin(intro*Math.PI)**2 * .033;
      scene.render(a,x,y);
      if (t===1 && interacting) { interacting=false; setTurning(false); setCaption('The mark has returned to rest.'); }
      if (t<1 || intro<1 || Math.abs(tx-x)+Math.abs(ty-y)>.001) frame=requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && visible && !document.hidden && !motion.matches && scene) frame=requestAnimationFrame(draw); };
    const turn = () => {
      if (!scene || motion.matches) { setCaption('Static view of the two beveled WK shapes in satin ivory.'); return; }
      turnStart=performance.now(); interacting=true;setTurning(true);setCaption('Turning the WebKamen mark.');wake();
    };
    action.current=turn;
    const lost = (e: Event) => { e.preventDefault(); stop(); if (!disposed) { setMode('static'); setTurning(false); } };
    const boot = async () => {
      if (motion.matches) { setMode('static'); return; }
      if (scene || loading || disposed) return;
      loading=true;
      try {
        const { createStudio } = await import('@/lib/studio-scene');
        if (disposed || motion.matches) return;
        canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
        scene=createStudio(canvas,view); node.appendChild(canvas); canvas.addEventListener('webglcontextlost',lost);
        resize(); setMode('live'); introStart=performance.now(); wake();
      } catch { if (!disposed) setMode('static'); canvas?.remove(); }
      finally { loading=false; }
    };
    const onVisibility = () => { if (document.hidden) stop(); else wake(); };
    const onMotion = () => {
      if (motion.matches) { stop();setMode('static');setTurning(false); }
      else if (scene) { setMode('live');scene.render(); } else if (visible) void boot();
    };
    const pointer = (e: PointerEvent) => { if(!fine.matches) return; const r=node.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=(e.clientY-r.top)/r.height*2-1;wake(); };
    const leave = () => { tx=ty=0;wake(); };
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting; if(visible){void boot();wake();}else stop();},{rootMargin:'30px'});
    io.observe(node);const ro=new ResizeObserver(resize);ro.observe(node);
    node.addEventListener('pointermove',pointer); node.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',onVisibility);motion.addEventListener('change',onMotion);
    return () => { disposed=true;stop();io.disconnect();ro.disconnect();node.removeEventListener('pointermove',pointer);node.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);canvas?.removeEventListener('webglcontextlost',lost);scene?.dispose();canvas?.remove(); };
  },[view]);
  return <figure className={`sculpture sculpture-${view}`} data-renderer={mode}>
    <div className="sculpture-art" ref={host} onClick={()=>action.current()}>
      {/* The poster is a render of the exact same camera, geometry, and lighting. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sculpture-poster" src={`/images/wk-${view}.webp`} alt={view==='hero'?'The WebKamen WK mark, sculpted in satin ivory with a softly lit bevel.':'A close-up of the warm ivory face and beveled edge of the WK sculpture.'} fetchPriority="high" width={view==='hero'?1500:1600} height={view==='hero'?900:620}/>
    </div>
    <figcaption className="sculpture-caption"><span className="object-caption"><i/> FIG. {view==='hero'?'01':'02'} <span>/</span> {view==='hero'?'THE WK MARK':'BEVEL STUDY'}</span>
      {mode==='static'?<span className="static-view">Static view</span>:<button className="turn-control" type="button" aria-label="Turn the mark" onClick={()=>action.current()}><Icon name="rotate" size={15}/><span>{turning?'Turning…':'Turn the mark'}</span></button>}
    </figcaption>
    <span className="sr-only" role="status">{caption}</span>
  </figure>;
}
