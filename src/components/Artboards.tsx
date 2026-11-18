import Link from 'next/link';
import { Icon, Asterisk } from './Icons';

export function FormaBrand() {
  return <span className="forma-brand"><span className="forma-symbol" aria-hidden="true"><Asterisk/></span>FORMA<span className="brand-divider"/><small>LIGHTING</small></span>;
}
export function CampaignArtwork({ alternate=false, compact=false }: { alternate?:boolean; compact?:boolean }) {
  return <div className={`campaign-art ${alternate?'campaign-alternate':''} ${compact?'campaign-compact':''}`} role="group" aria-label={alternate?'Example Arc lamp campaign, creative B':'Example Arc lamp campaign, creative A'}>
    <div className="campaign-image" role="img" aria-label="A sculptural, brushed-brass Arc lamp on a warm travertine plinth."/>
    <div className="ad-top"><FormaBrand/>{!compact&&<span className="example-label">Example campaign</span>}</div>
    <div className="ad-copy"><span className="ad-kicker">{alternate?'A STUDY IN BRASS':'OBJECT SERIES — 001'}</span><h3>{alternate?<>A quieter<br/>kind of light.</>:<>Meet the<br/>Arc lamp.</>}</h3>{!compact&&<p>Sculptural form. Warm light.</p>}</div>
    <div className="ad-bottom"><span>{alternate?'FORM AND FINISH':'THE ARC COLLECTION'}</span><span>01</span></div>
  </div>;
}
export function ProductPage({ onQuote, devices=false }: { onQuote?:()=>void; devices?:boolean }) {
  const quoteContent=<>Request a trade quote <Icon name="arrow-up-right" size={13}/></>;
  return <div className={`product-stage ${devices?'device-stage':''}`}>
    <div className="product-browser"><div className="browser-bar"><span className="browser-dots"><i/><i/><i/></span><span>forma.example / collection / arc</span><span className="browser-end" aria-hidden="true"/></div>
      <div className="product-nav"><FormaBrand/><span>Object collection <b>/</b> 01</span></div>
      <div className="product-view"><div className="product-photo" role="img" aria-label="Brushed brass Arc table lamp"/><div className="product-info"><span className="ad-kicker">SCULPTURAL LIGHTING</span><h3>Meet the<br/>Arc lamp.</h3><p>Quiet geometry, shaped in brushed brass. A warm light for considered spaces.</p><span className="finish"><i/>Brushed brass</span>{onQuote?<button type="button" className="product-quote" onClick={onQuote}>{quoteContent}</button>:<Link className="product-quote" href="/?demo=agent#inquiry-demo">{quoteContent}</Link>}</div></div>
      <div className="product-foot"><span>FORMA / TRADE COLLECTION</span><span>01 — 03</span></div>
    </div>
    {devices&&<div className="phone-device" aria-label="Mobile version of the example product page"><div className="phone-speaker"/><FormaBrand/><div className="phone-photo"/><div className="phone-details"><span className="ad-kicker">OBJECT 001</span><strong>The Arc lamp.</strong><span>Brushed brass</span><div className="phone-line"/></div></div>}
  </div>;
}
export function AdvertisingPair() {
  return <div className="ads-composition"><div className="ad-pair"><div><span className="creative-label">CREATIVE A <i/> PRODUCT</span><CampaignArtwork compact/></div><div><span className="creative-label">CREATIVE B <i/> MATERIAL</span><CampaignArtwork compact alternate/></div></div><div className="landing-line"><Icon name="corner" size={17}/><span>LANDING PAGE</span><strong>Meet the Arc lamp.</strong></div></div>;
}
