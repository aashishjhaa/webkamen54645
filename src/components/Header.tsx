'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon, Mark } from './Icons';
const links = [['Home','/'],['Services','/services'],['About','/about'],['Contact','/contact']];
export default function Header() {
  const path=usePathname();
  const [open,setOpen]=useState(false);
  const toggle=useRef<HTMLButtonElement>(null);
  const nav=useRef<HTMLElement>(null);
  useEffect(()=>{
    if (!open) return;
    nav.current?.querySelector('a')?.focus();
    const close=(e:KeyboardEvent)=>{ if(e.key==='Escape'){setOpen(false);toggle.current?.focus();} };
    const change=()=>{ if(innerWidth>760) setOpen(false); };
    const outside=(e:PointerEvent)=>{if(!nav.current?.contains(e.target as Node)&&!toggle.current?.contains(e.target as Node))setOpen(false);};
    document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);window.addEventListener('resize',change);
    return ()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',change);};
  },[open]);
  return <header className="site-header"><div className="wrap header-inner">
    <Link href="/" className="wordmark" aria-label="WebKamen home" onClick={()=>setOpen(false)}><Mark/><span>WebKamen</span></Link>
    <nav ref={nav} className={`main-nav ${open?'is-open':''}`} id="main-navigation" aria-label="Main navigation">
      {links.map(([name,href])=><Link key={href} href={href} aria-current={path===href?'page':undefined} onClick={()=>setOpen(false)}>{name}</Link>)}
      <Link href="/contact" className="mobile-project" onClick={()=>setOpen(false)}>Start a project <Icon name="arrow-up-right" size={15}/></Link>
    </nav>
    <Link href="/contact" className="header-project">Start a project <Icon name="arrow-up-right" size={15}/></Link>
    <button type="button" className="menu-toggle" ref={toggle} aria-expanded={open} aria-controls="main-navigation" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(o=>!o)}><span>{open?'Close':'Menu'}</span><Icon name={open?'close':'menu'} size={21}/></button>
  </div></header>;
}
