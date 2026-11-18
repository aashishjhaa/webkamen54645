import type { NextConfig } from 'next';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Binary artwork and font files are stored in the repository as base64 text in
 * `assets/encoded/`. Some Git import/sync flows only carry text files, which
 * previously left Vercel without any WebP/JPEG posters or Poppins .woff2 files.
 * Restoring them here runs before compilation, so `next build`, `next dev`, and
 * `next start` all see real files regardless of how the repo was transferred.
 */
function restoreEncodedAssets() {
  const encodedDir = join(process.cwd(), 'assets', 'encoded');
  if (!existsSync(encodedDir)) return;
  const targets: Record<string, string> = {
    'wk-hero.webp.b64': 'public/images/wk-hero.webp',
    'wk-detail.webp.b64': 'public/images/wk-detail.webp',
    'arc-lamp-studio.webp.b64': 'public/images/arc-lamp-studio.webp',
    'social-preview.jpg.b64': 'public/images/social-preview.jpg',
    'paper-grain.png.b64': 'public/images/paper-grain.png',
  };
  for (const weight of [300, 400, 500, 600, 700]) {
    targets[`poppins-latin-${weight}-normal.woff2.b64`] = `src/fonts/poppins-latin-${weight}-normal.woff2`;
  }
  for (const [name, relative] of Object.entries(targets)) {
    const source = join(encodedDir, name);
    const destination = join(process.cwd(), relative);
    if (!existsSync(source)) continue;
    try {
      if (existsSync(destination) && statSync(destination).size > 0) continue;
      const bytes = Buffer.from(readFileSync(source, 'utf8').replace(/\s+/g, ''), 'base64');
      if (!bytes.length) throw new Error('decoded to zero bytes');
      mkdirSync(join(destination, '..'), { recursive: true });
      writeFileSync(destination, bytes);
      console.log(`[assets] restored ${relative} (${bytes.length} bytes)`);
    } catch (error) {
      // Fail loudly: a silently missing poster or font is exactly the regression this prevents.
      throw new Error(`Could not restore ${relative} from ${name}: ${(error as Error).message}`);
    }
  }
}

restoreEncodedAssets();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
