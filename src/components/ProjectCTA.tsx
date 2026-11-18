import Link from 'next/link';
import { Icon } from './Icons';
export default function ProjectCTA({about=false}:{about?:boolean}) {
  return <section className="project-cta"><div className="wrap cta-inner"><div><span className="eyebrow"><b/> NEXT, YOUR PROJECT</span><h2>{about?'Let’s make it happen.':'What are you building?'}</h2></div><Link href="/contact" className="btn btn-ink">{about?'Tell us about your project':'Start a project'}<Icon name="arrow-up-right" size={17}/></Link></div></section>;
}
