import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import WhatsAppBubble from '@/components/WhatsAppBubble';
import { SITE_URL } from '@/lib/site';
import { poppins } from './fonts';
import './globals.css';

const description='WebKamen is an independent digital studio building websites, advertising campaigns, and custom AI agents for businesses worldwide.';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'WebKamen — Independent digital studio', template: '%s — WebKamen' },
  description, applicationName: 'WebKamen',
  icons: { icon: [{url:'/favicon.svg',type:'image/svg+xml'}] },
  openGraph: { type:'website',siteName:'WebKamen',title:'WebKamen — From first click to follow-through.',description,url:SITE_URL,images:[{url:'/images/social-preview.jpg',width:1200,height:630,alt:'WebKamen’s sculptural ivory WK mark on a dark studio set.'}] },
  twitter:{card:'summary_large_image',title:'WebKamen — Independent digital studio',description,images:['/images/social-preview.jpg']},
};
export const viewport: Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0C151C'};
export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en" className={poppins.variable}><body><a className="skip-link" href="#main-content">Skip to content</a><Header/>{children}<SiteFooter/><WhatsAppBubble/></body></html>;
}
