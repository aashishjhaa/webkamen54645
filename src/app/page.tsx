import type { Metadata } from 'next';
import Link from 'next/link';
import Sculpture from '@/components/Sculpture';
import { Icon, Asterisk } from '@/components/Icons';
import InquiryDemo from '@/components/InquiryDemo';
import ProjectCTA from '@/components/ProjectCTA';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default function Home() {
  return <main id="main-content"><section className="hero" aria-labelledby="hero-title"><div className="studio-grain"/><div className="wrap hero-grid"><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="studio-star" aria-hidden="true"><Asterisk size={16}/></span> INDEPENDENT DIGITAL STUDIO</div><h1 id="hero-title">From first click<br/>to follow-through.</h1><p>WebKamen builds websites, runs ad campaigns,<br className="wide-break"/> and develops AI agents for businesses worldwide.</p><div className="hero-actions"><Link className="btn btn-ivory" href="/contact">Start a project<Icon name="arrow-up-right" size={16}/></Link><Link className="btn btn-outline" href="/services">Explore services<Icon name="arrow-right" size={16}/></Link></div></div>
    <div className="hero-art"><span className="registration reg-one" aria-hidden="true"/><span className="registration reg-two" aria-hidden="true"/><Sculpture/></div>
    <a className="scroll-cue" href="#inquiry-demo"><span className="scroll-icon"><Icon name="arrow-down" size={12}/></span> SCROLL TO EXPLORE</a>
  </div></section><InquiryDemo/><ProjectCTA/></main>;
}
