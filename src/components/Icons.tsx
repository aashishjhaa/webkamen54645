import type { CSSProperties } from 'react';
import mark from '@/lib/mark-points.json';

export function Mark({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <svg viewBox="0 0 502 273" className={className} style={style} aria-hidden="true" fill="currentColor">{mark.outlines.map((p, i) => <polygon key={i} points={p.map(([x,y]) => `${x},${y}`).join(' ')} />)}</svg>;
}
/** An eight-spoke asterisk drawn as SVG, so it never depends on a system font. */
export function Asterisk({ size = '1em', className = '' }: { size?: number | string; className?: string }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7"/></svg>;
}
export type IconName = 'arrow-up-right' | 'arrow-right' | 'arrow-down' | 'left' | 'right' | 'rotate' | 'menu' | 'close' | 'check' | 'instagram' | 'facebook' | 'whatsapp' | 'layers' | 'globe' | 'spark' | 'mail' | 'chevron' | 'sun' | 'corner' | 'send';
export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  const common = { width: size, height: size, className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<Exclude<IconName, 'whatsapp'>, React.ReactNode> = {
    'arrow-up-right': <path d="M5 19 19 5M5 5h14v14" />,
    'arrow-right': <path d="M4 12h16m-6.5-6.5L20 12l-6.5 6.5" />,
    'arrow-down': <path d="M12 3v17m-6-6 6 6 6-6" />,
    left: <path d="m14.5 6-6 6 6 6" />, right: <path d="m9.5 6 6 6-6 6" />,
    rotate: <><path d="M19.4 8.8A8 8 0 1 0 20 14M20 4v5h-5"/><path d="m9 10 3-1.6 3 1.6v4l-3 1.6L9 14zM9 10l3 1.8 3-1.8m-3 1.8v3.8" strokeWidth="1.1"/></>,
    menu: <path d="M3 8h18M3 16h18"/>, close: <path d="m6 6 12 12M18 6 6 18"/>, check: <path d="m5 12 4.5 4.5L19 7"/>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.6" cy="6.6" r=".9" fill="currentColor" stroke="none"/></>,
    facebook: <path fill="currentColor" stroke="none" d="M14 22v-9h3.1l.5-3.5H14V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.4c-.3 0-1.5-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.8v2.5H7V13h3.2v9z"/>,
    layers: <><path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6 8 6 8-6"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>, sun: <><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4M4.2 4.2 7 7m10 10 2.8 2.8M4.2 19.8 7 17M17 7l2.8-2.8"/></>,
    corner: <path d="M5 5v10h14m-5-5 5 5-5 5"/>, send: <><path d="m3 10 18-7-7 18-3-8-8-3zM11 13 21 3"/></>,
  };
  if (name === 'whatsapp') return <svg {...common} viewBox="0 0 32 32" stroke="none" fill="currentColor"><path d="M27.3 4.7A15.8 15.8 0 0 0 2.45 23.72L.2 32l8.5-2.23A15.78 15.78 0 0 0 32 15.89a15.7 15.7 0 0 0-4.7-11.2ZM16.2 29.1a13.1 13.1 0 0 1-6.7-1.83l-.48-.28-5.05 1.32 1.35-4.92-.32-.5a13.08 13.08 0 1 1 11.2 6.21Zm7.17-9.8c-.39-.2-2.34-1.16-2.7-1.29-.36-.13-.62-.2-.88.2-.27.4-1.02 1.29-1.25 1.55-.23.26-.46.3-.86.1-.4-.2-1.67-.62-3.18-1.97a11.9 11.9 0 0 1-2.2-2.74c-.23-.4-.02-.61.17-.81.18-.18.4-.46.6-.69.19-.23.26-.4.39-.66.13-.27.06-.5-.03-.7-.1-.2-.9-2.15-1.22-2.94-.32-.77-.65-.66-.89-.67h-.76c-.27 0-.7.1-1.06.49-.36.4-1.38 1.36-1.38 3.3s1.42 3.83 1.61 4.1c.2.26 2.8 4.27 6.8 5.99.95.4 1.69.65 2.27.83.95.3 1.81.26 2.5.16.76-.11 2.34-.96 2.67-1.88.33-.93.33-1.72.23-1.88-.1-.17-.36-.27-.76-.47Z"/></svg>;
  return <svg {...common}>{paths[name]}</svg>;
}
