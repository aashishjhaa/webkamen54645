import localFont from 'next/font/local';

/**
 * Poppins is bundled in the repository (src/fonts) and served by Next.js from
 * /_next/static/media with immutable caching. Nothing is fetched from Google at
 * build or run time, so a Vercel deployment renders identically to local builds.
 * `adjustFontFallback` generates a size-matched fallback face, so text does not
 * jump or look "wrong" in the instant before the webfont is ready.
 */
export const poppins = localFont({
  src: [
    { path: '../fonts/poppins-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/poppins-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/poppins-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});
