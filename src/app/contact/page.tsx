import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { Icon } from '@/components/Icons';
import { isService, WHATSAPP_URL } from '@/lib/site';
export const metadata:Metadata={title:'Start a project',description:'Tell WebKamen about your website, advertising campaign, or AI agent project. Send a project inquiry or chat on WhatsApp.',alternates:{canonical:'/contact'},openGraph:{title:'Start a project — WebKamen',description:'Tell us what you have in mind.',url:'/contact',images:['/images/social-preview.jpg']}};
export default async function ContactPage({searchParams}:{searchParams:Promise<{service?:string|string[]}>}) {
  const {service}=await searchParams;
  return <main id="main-content" className="contact-page"><div className="wrap contact-layout"><div className="contact-intro"><span className="eyebrow"><b/> START A PROJECT</span><h1>Tell us what<br/>you have in mind.</h1><p>A website, a campaign, an AI agent—or a bit of each. Tell us what you’re working on and what a good outcome looks like.</p></div><div className="contact-form-area"><ContactForm key={isService(service)?service:'default'} preselected={isService(service)?service:undefined}/></div><aside className="contact-aside"><span className="eyebrow">PREFER A CONVERSATION?</span><a className="whatsapp-action" target="_blank" rel="noopener noreferrer" href={WHATSAPP_URL}><Icon name="whatsapp" size={21}/>Chat on WhatsApp<Icon name="arrow-up-right" size={15}/></a><span className="worldwide"><Icon name="globe" size={15}/>Working with businesses worldwide.</span></aside></div></main>;
}
