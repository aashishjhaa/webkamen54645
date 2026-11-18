import Link from 'next/link';
import { Mark, Icon } from './Icons';
import { SOCIAL } from '@/lib/site';
export default function SiteFooter() {
  return <footer className="site-footer"><div className="wrap">
    <div className="footer-main"><div><Link href="/" className="wordmark" aria-label="WebKamen home"><Mark/><span>WebKamen</span></Link><p>An independent digital studio.<br/>Built for businesses worldwide.</p></div>
      <nav className="footer-nav" aria-label="Footer navigation"><span className="eyebrow">Explore</span><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav>
      <div className="footer-social"><span className="eyebrow">Elsewhere</span><a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={16}/>Instagram <Icon name="arrow-up-right" size={12}/></a><a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={16}/>Facebook <Icon name="arrow-up-right" size={12}/></a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} WebKamen</span><span>Design. Development. Follow-through.</span></div>
  </div></footer>;
}
